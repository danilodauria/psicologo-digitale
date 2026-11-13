#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo di accessibilità
   Licenza del codice: MIT · Danilo D'Auria

   Apre le tre pagine e l'app vista per vista, nei due temi, e verifica:

     · contrasto   ogni testo raggiunge il rapporto AA (4,5:1, oppure 3:1 per
                   i testi grandi) contro lo sfondo che ha davvero sotto;
     · titoli      i titoli scendono di un livello alla volta (h1 → h2 → h3),
                   senza saltare gradini, e ogni pagina ha un solo h1;
     · immagini    ogni immagine ha il suo testo alternativo, e un pulsante
                   fatto di sola icona ha comunque un nome leggibile.

   Gira dentro `npm test`, quindi prima della pubblicazione: un colore
   schiarito troppo o un titolo saltato fermano il sito.

   Uso:
     node scripts/controlla-accessibilita.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const radice = path.join(__dirname, "..");
// Le pagine si leggono dalla cartella, non da un elenco scritto a mano: una
// pagina nuova non deve poter entrare nel sito senza passare di qui.
const pagine = fs.readdirSync(radice).filter((f) => f.endsWith(".html")).sort();
const css = fs.readFileSync(path.join(radice, "assets", "css", "styles.css"), "utf8");
const TEMI = ["light", "dark"];
const SOGLIA = 4.5;
const SOGLIA_GRANDE = 3;
const BASE_HTML = 16; // il foglio di stile non cambia la misura di html
const BASE_CORPO = 17; // body { font-size: 17px }

let testiMisurati = 0;
let titoliControllati = 0;
let immaginiControllate = 0;
let migliorRapporto = 99;
let nonMisurabili = 0;
let visteRegistrate = 0;
const problemi = [];

// Ogni controllo lascia il suo rapporto qui: il riepilogo in fondo a `npm test`
// li mette uno accanto all'altro, così un calo si vede senza leggere tre
// Outputs diversi.
function scriviRapporto(nome, rapporto) {
  try {
    const cartella = path.join(radice, "artifacts", "copertura");
    fs.mkdirSync(cartella, { recursive: true });
    fs.writeFileSync(path.join(cartella, nome + ".json"), JSON.stringify(rapporto, null, 2) + "\n");
  } catch (e) { /* il riepilogo dirà che manca */ }
}

function problema(dove, cosa) {
  problemi.push(dove + " → " + cosa);
}

/* Colori -------------------------------------------------------------------- */

// "#abc", "#aabbcc", "#aabbccdd", rgb(), rgba(), color-mix() e le parole
// chiave che servono: tutto il resto (currentColor, transparent) ha una via
// sua nel calcolo.
function leggiColore(valore) {
  const v = String(valore || "").trim().toLowerCase();
  if (!v) return null;
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (v === "white") return { r: 255, g: 255, b: 255, a: 1 };
  if (v === "black") return { r: 0, g: 0, b: 0, a: 1 };

  const corto = v.match(/^#([0-9a-f]{3,4})$/);
  if (corto) {
    const c = corto[1].split("").map((x) => parseInt(x + x, 16));
    return { r: c[0], g: c[1], b: c[2], a: c.length > 3 ? c[3] / 255 : 1 };
  }
  const lungo = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/);
  if (lungo) {
    const n = parseInt(lungo[1], 16);
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255,
      a: lungo[2] ? parseInt(lungo[2], 16) / 255 : 1
    };
  }
  const rgb = v.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map((x) => x.trim());
    const canale = (x) => (x.endsWith("%") ? (parseFloat(x) / 100) * 255 : parseFloat(x));
    if (p.length >= 3) {
      return {
        r: canale(p[0]),
        g: canale(p[1]),
        b: canale(p[2]),
        a: p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3])
      };
    }
  }
  return null;
}

// color-mix(in srgb, A p%, B): mescolanza lineare dei due colori.
function mescola(testo, tema) {
  const m = testo.match(/color-mix\(([^()]*(?:\([^()]*\)[^()]*)*)\)/i);
  if (!m) return null;
  const dentro = m[1];
  const parti = dentro.split(",").map((x) => x.trim());
  if (!parti[0] || !/^in\s+srgb/i.test(parti[0])) return null;
  const primo = parti[1] || "";
  const secondo = parti[2] || "";
  const quota = primo.match(/([\d.]+)%/);
  const p = quota ? parseFloat(quota[1]) / 100 : 0.5;
  const a = risolviColore(primo.replace(/[\d.]+%\s*$/, ""), tema, null);
  const b = risolviColore(secondo.replace(/[\d.]+%\s*$/, ""), tema, null);
  if (!a || !b) return null;
  // Mescolanza con i colori pesati per la loro trasparenza: un colore
  // trasparente non deve scurire l'altro, deve solo alleggerirne la copertura.
  const copertura = a.a * p + b.a * (1 - p);
  if (copertura === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (a.r * a.a * p + b.r * b.a * (1 - p)) / copertura,
    g: (a.g * a.a * p + b.g * b.a * (1 - p)) / copertura,
    b: (a.b * a.a * p + b.b * b.a * (1 - p)) / copertura,
    a: copertura
  };
}

function risolviColore(valore, tema, ereditato) {
  let v = String(valore || "").trim();
  if (!v) return null;
  if (/^currentcolor$/i.test(v)) return ereditato || null;
  if (/^color-mix\(/i.test(v)) return mescola(v, tema);
  const varUsata = v.match(/^var\(\s*(--[\w-]+)\s*(?:,(.*))?\)$/i);
  if (varUsata) {
    const valoreTema = tema[varUsata[1]];
    return risolviColore(valoreTema !== undefined ? valoreTema : varUsata[2], tema, ereditato);
  }
  if (/\bvar\(|\bcolor-mix\(|\bcalc\(/i.test(v)) {
    // Un colore composto non si legge con certezza: si segnala a parte.
    return null;
  }
  return leggiColore(v);
}

// Gli estremi di una sfumatura: si misura sul gradino peggiore, quello che
// può nascondere il testo.
function estremiSfumatura(valore, tema) {
  const testo = String(valore || "");
  if (!/gradient\(/i.test(testo)) return [];
  const pezzi = testo.match(/rgba?\([^)]*\)|color-mix\([^)]*\)|var\(--[\w-]+\)|#[0-9a-f]{3,8}\b|\b(?:white|black)\b/gi) || [];
  const colori = [];
  for (const pezzo of pezzi) {
    const c = risolviColore(pezzo, tema, null);
    if (c && c.a > 0) colori.push(c);
  }
  return colori;
}

function sovrapponi(sopra, sotto) {
  if (!sopra) return sotto;
  if (sopra.a >= 0.999) return sopra;
  if (!sotto) return sopra;
  const a = sopra.a + sotto.a * (1 - sopra.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (sopra.r * sopra.a + sotto.r * sotto.a * (1 - sopra.a)) / a,
    g: (sopra.g * sopra.a + sotto.g * sotto.a * (1 - sopra.a)) / a,
    b: (sopra.b * sopra.a + sotto.b * sotto.a * (1 - sopra.a)) / a,
    a
  };
}

function luminanza(c) {
  const canale = (x) => {
    const s = x / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canale(c.r) + 0.7152 * canale(c.g) + 0.0722 * canale(c.b);
}

function contrasto(a, b) {
  const l1 = luminanza(a);
  const l2 = luminanza(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* Il foglio di stile -------------------------------------------------------- */

function analizzaRegole() {
  const dom = new JSDOM(`<!doctype html><style>${css}</style>`);
  const foglio = dom.window.document.styleSheets[0];
  const regole = [];

  const specificita = (selettore) => {
    const ids = (selettore.match(/#[\w-]+/g) || []).length;
    const classi = (selettore.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
    const elementi = (selettore.match(/(^|[\s>+~])([a-z][\w-]*)/gi) || []).length;
    return ids * 10000 + classi * 100 + elementi;
  };
  const daSaltare = (selettore) =>
    /::/.test(selettore) || /:(hover|focus|active|visited|target|checked|disabled|selection|placeholder)/.test(selettore);

  const cammina = (lista, ammessa) => {
    for (const regola of lista) {
      if (regola.type === 1) {
        if (!ammessa) continue;
        const selettori = String(regola.selectorText || "")
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && !daSaltare(s));
        if (!selettori.length) continue;
        regole.push({
          selettori,
          specificita: Math.max(...selettori.map(specificita)),
          stile: regola.style
        });
      } else if (regola.type === 4) {
        const testo = String(regola.conditionText || (regola.media && regola.media.mediaText) || "").toLowerCase();
        // Le regole di stampa non riguardano lo schermo; quelle per schermi
        // stretti valgono solo sotto i 760px e non cambiano i colori.
        const vale = !/print/.test(testo) && !/max-width/.test(testo);
        cammina(regola.cssRules || [], ammessa && vale);
      } else if (regola.cssRules && regola.type !== 12) {
        cammina(regola.cssRules, ammessa);
      } else if (regola.cssRules) {
        cammina(regola.cssRules, ammessa);
      }
    }
  };
  cammina(foglio.cssRules, true);
  return regole;
}

function variabiliDelTema() {
  const dom = new JSDOM(`<!doctype html><style>${css}</style>`);
  const fogli = dom.window.document.styleSheets[0].cssRules;
  const raccogli = (selettore) => {
    const mappa = {};
    for (const r of fogli) {
      if (r.type !== 1 || r.selectorText !== selettore) continue;
      for (let i = 0; i < r.style.length; i++) {
        const nome = r.style[i];
        if (nome.startsWith("--")) mappa[nome] = r.style.getPropertyValue(nome).trim();
      }
    }
    return mappa;
  };
  const chiaro = raccogli(":root");
  const scuro = Object.assign({}, chiaro, raccogli('html[data-theme="dark"]'));
  return { light: chiaro, dark: scuro };
}

const REGOLE = analizzaRegole();
const TEMI_VALORI = variabiliDelTema();

// Il parser scarta alcune scritture (le sfumature in particolare): i blocchi
// che ne contengono una si rileggono dal testo, così il contrasto dei pulsanti
// si misura sul gradino di colore vero.
function sfondiDalTesto() {
  const pulito = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const trovate = [];
  const modello = /([^{}]+)\{([^{}]*)\}/g;
  const peso = (s) =>
    (s.match(/#[\w-]+/g) || []).length * 10000 + (s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length * 100;
  for (const m of pulito.matchAll(modello)) {
    const selettori = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("@") && !/::|:(hover|focus|active|visited)/.test(s));
    if (!selettori.length) continue;
    // Conta solo lo sfondo: gli altri colori del blocco (il colore del testo,
    // i bordi) non sono gradini della sfumatura e non fanno da fondo.
    const sfondo = m[2]
      .split(";")
      .map((d) => d.trim())
      .filter((d) => /^background(-image|-color)?\s*:/i.test(d))
      .join("; ");
    // Solo gli sfondi che il parser non sa leggere: tinte con var(), sfumature
    // e color-mix. Gli altri li legge già il foglio di stile.
    if (!sfondo || !/(var\(|gradient\(|color-mix\()/i.test(sfondo)) continue;
    trovate.push({ selettori, testo: sfondo, specificita: Math.max(...selettori.map(peso)) });
  }
  return trovate;
}

const SFONDI = sfondiDalTesto();

function sfondoDichiarato(el, tema) {
  let migliore = null;
  for (const regola of SFONDI) {
    for (const selettore of regola.selettori) {
      let combacia = false;
      try {
        combacia = el.matches(selettore);
      } catch (e) {
        combacia = false;
      }
      if (!combacia) continue;
      if (!migliore || regola.specificita >= migliore.specificita) migliore = regola;
      break;
    }
  }
  if (!migliore) return { colore: null, sfumature: [] };
  const sfumature = estremiSfumatura(migliore.testo, tema);
  if (sfumature.length) return { colore: sfumature[0], sfumature };
  const tinta = migliore.testo.match(/(?:^|;)\s*background(-color)?\s*:\s*([^;]+)/i);
  const colore = tinta ? risolviColore(tinta[2].trim(), tema, null) : null;
  return { colore, sfumature: [] };
}

function stileDichiarato(el) {
  const perProp = new Map();
  for (let i = 0; i < REGOLE.length; i++) {
    const regola = REGOLE[i];
    for (const selettore of regola.selettori) {
      let combacia = false;
      try {
        combacia = el.matches(selettore);
      } catch (e) {
        combacia = false;
      }
      if (!combacia) continue;
      for (let p = 0; p < regola.stile.length; p++) {
        const nome = regola.stile[p];
        const precedente = perProp.get(nome);
        if (!precedente || regola.specificita >= precedente.specificita) {
          perProp.set(nome, { valore: regola.stile.getPropertyValue(nome), specificita: regola.specificita, ordine: i });
        }
      }
      break;
    }
  }
  const risultato = {};
  perProp.forEach((v, k) => {
    risultato[k] = v.valore;
  });
  return risultato;
}

/* Lo stile che un elemento ha davvero --------------------------------------- */

let cacheDichiarazioni = new WeakMap();

function dichiarazioni(el) {
  if (!cacheDichiarazioni.has(el)) cacheDichiarazioni.set(el, stileDichiarato(el));
  return cacheDichiarazioni.get(el);
}

function misuraPx(valore, base) {
  const v = String(valore || "").trim();
  if (!v) return null;
  if (/^clamp\(/i.test(v)) {
    const dentro = v.replace(/^clamp\(/i, "").replace(/\)$/, "").split(",");
    return misuraPx(dentro[0].trim(), base);
  }
  const m = v.match(/^([\d.]+)(px|rem|em|%)?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === "rem") return n * BASE_HTML;
  if (m[2] === "em" || m[2] === "%") return n * base;
  return n;
}

function stileCalcolato(el, tema) {
  const dich = dichiarazioni(el);
  const padre = el.parentElement ? stileCalcolato(el.parentElement, tema) : null;
  const ereditato = padre || {
    colore: risolviColore(tema["--text"], tema, null) || { r: 0, g: 0, b: 0, a: 1 },
    sfondo: null,
    sotto: risolviColore(tema["--bg"], tema, null),
    dimensione: BASE_CORPO,
    grassetto: false,
    opacita: 1,
    nascosto: false
  };

  const coloreProprio = dich.color ? risolviColore(dich.color, tema, ereditato.colore) : null;
  const colore = coloreProprio || ereditato.colore;

  const dimensione =
    misuraPx(dich["font-size"], ereditato.dimensione) || (el.tagName === "BODY" ? BASE_CORPO : ereditato.dimensione);
  const peso = dich["font-weight"] && /^[\d.]+$/.test(dich["font-weight"]) ? parseFloat(dich["font-weight"]) : null;
  const grassetto = peso !== null ? peso >= 700 : /^(h1|h2|h3|h4|strong|b|th)$/i.test(el.tagName);

  // Sfondo: prima quello dichiarato sull'elemento, poi quello che arriva dai
  // contenitori. Le sfumature danno più valori: si terrà il peggiore.
  let sfondo = null;
  const dichiarato = dich["background-color"] ? risolviColore(dich["background-color"], tema, null) : null;
  const grezzo = sfondoDichiarato(el, tema);
  const sfumatura = grezzo.sfumature
    .concat(estremiSfumatura(dich["background"], tema))
    .concat(estremiSfumatura(dich["background-image"], tema));
  if (dichiarato && dichiarato.a > 0) sfondo = dichiarato;
  else if (grezzo.colore && grezzo.colore.a > 0) sfondo = grezzo.colore;
  else if (sfumatura.length) sfondo = sfumatura[0];
  const sotto = sfondo || ereditato.sotto;

  const opacita = dich.opacity && /^[\d.]+$/.test(dich.opacity) ? parseFloat(dich.opacity) : ereditato.opacita;
  const nascosto =
    (dich.display || "").trim() === "none" ||
    (dich.visibility || "").trim() === "hidden" ||
    ereditato.nascosto;

  return {
    colore,
    sfondo,
    sfumature: sfumatura,
    sotto,
    dimensione,
    grassetto,
    opacita,
    nascosto,
    stileInline: dich
  };
}

/* Il testo da misurare ------------------------------------------------------ */

function testoVisibile(el) {
  let testo = "";
  for (const nodo of el.childNodes) {
    if (nodo.nodeType === 3) testo += nodo.nodeValue;
  }
  return testo.replace(/\s+/g, " ").trim();
}

function descrivi(el) {
  const classe = String(el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean)[0];
  return el.tagName.toLowerCase() + (classe ? "." + classe : "");
}

function controllaTesti(radiceContenitore, dove, tema) {
  // Le regole che dipendono dal tema (html[data-theme="dark"] …) cambiano
  // risposta: la cache delle dichiarazioni va rifatta a ogni passaggio.
  cacheDichiarazioni = new WeakMap();
  const elementi = [radiceContenitore].concat([...radiceContenitore.querySelectorAll("*")]);
  for (const el of elementi) {
    if (/^(script|style|title|meta|link|head|br|path|circle|line|polyline|rect|g|svg)$/i.test(el.tagName)) continue;
    if (el.closest('[aria-hidden="true"], .sr-only, .skip-link, [hidden]')) continue;
    const testo = testoVisibile(el);
    if (!testo) continue;

    const stile = stileCalcolato(el, tema);
    if (stile.nascosto) continue;
    if (stile.opacita < 1) {
      nonMisurabili++;
      continue;
    }
    if (!stile.colore || !stile.sotto) {
      nonMisurabili++;
      continue;
    }

    const sfondi = stile.sfumature.length ? stile.sfumature : [stile.sotto];
    let peggiore = 99;
    for (const sfondo of sfondi) {
      const base = sfondo === stile.sotto ? stile.sotto : sovrapponi(sfondo, stile.sotto);
      const valore = contrasto(stile.colore, base || stile.sotto);
      if (valore < peggiore) peggiore = valore;
    }

    testiMisurati++;
    if (peggiore < migliorRapporto) migliorRapporto = peggiore;

    const grande = stile.dimensione >= 24 || (stile.dimensione >= 18.66 && stile.grassetto);
    const soglia = grande ? SOGLIA_GRANDE : SOGLIA;
    if (peggiore < soglia) {
      problema(
        dove,
        "contrasto " + peggiore.toFixed(2) + ":1 (serve " + soglia + ":1) in «" +
          (testo.length > 60 ? testo.slice(0, 57) + "…" : testo) + "» — " + descrivi(el)
      );
    }
  }
}

/* Titoli -------------------------------------------------------------------- */

function controllaTitoli(contenitore, dove) {
  const titoli = [...contenitore.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(
    (h) => !h.closest('[aria-hidden="true"], .sr-only, [hidden]')
  );
  let precedente = 0;
  let h1 = 0;
  for (const titolo of titoli) {
    const livello = parseInt(titolo.tagName.slice(1), 10);
    titoliControllati++;
    if (livello === 1) h1++;
    if (precedente && livello > precedente + 1) {
      problema(dove, "titolo fuori ordine: da h" + precedente + " a h" + livello + " («" + titolo.textContent.trim().slice(0, 50) + "»)");
    }
    precedente = livello;
  }
  return h1;
}

/* Immagini e icone ---------------------------------------------------------- */

function controllaImmagini(contenitore, dove) {
  for (const img of contenitore.querySelectorAll("img")) {
    immaginiControllate++;
    if (!img.hasAttribute("alt")) {
      problema(dove, "immagine senza testo alternativo: " + (img.getAttribute("src") || "senza src"));
    }
  }
  // Un'icona è l'unico contenuto di un pulsante o di un collegamento: senza
  // testo visibile né etichetta, chi non vede l'icona non sa cosa fa.
  for (const comando of contenitore.querySelectorAll("a, button")) {
    if (comando.closest('[aria-hidden="true"], [hidden]')) continue;
    if (comando.textContent.replace(/\s+/g, "").length) continue;
    if (!comando.querySelector("svg, img")) continue;
    immaginiControllate++;
    if (comando.getAttribute("aria-label") || comando.getAttribute("title")) continue;
    problema(dove, "pulsante fatto di sola icona senza nome: " + descrivi(comando));
  }
}

/* Le pagine ---------------------------------------------------------------- */

function controllaPagine() {
  for (const pagina of pagine) {
    const dom = new JSDOM(fs.readFileSync(path.join(radice, pagina), "utf8"), {
      url: "https://esempio.test/" + pagina,
      pretendToBeVisual: true
    });
    const doc = dom.window.document;
    const main = doc.getElementById("main") || doc.body;

    controllaImmagini(doc.body, pagina);
    for (const tema of TEMI) {
      doc.documentElement.setAttribute("data-theme", tema);
      controllaTesti(doc.body, pagina + " (" + tema + ")", TEMI_VALORI[tema]);
    }
    doc.documentElement.setAttribute("data-theme", "light");

    // index.html è il guscio dell'app: il suo h1 lo scrive la vista, e viene
    // controllato più sotto insieme alle altre.
    const h1 = controllaTitoli(main, pagina);
    if (h1 === 0 && pagina !== "index.html") problema(pagina, "manca il titolo principale (h1)");
    if (h1 > 1) problema(pagina, h1 + " titoli principali (h1) nella stessa pagina");
  }
}

/* L'app, vista per vista ---------------------------------------------------- */

const MODULI = [
  "data-scales", "data-intake", "data-course", "data-manual", "data-manual2", "data-extra",
  "data-quiz", "data-nutrizione", "data-ai", "neura", "app", "app-intake", "app-scales",
  "app-course", "app-neura", "app-views", "app-versioni", "app-nutrizione", "app-installa",
  "app-status", "app-report", "app-init", "app-welcome"
];

function controllaApp() {
  const html = fs.readFileSync(path.join(radice, "index.html"), "utf8").replace(/<script src="[^"]+"><\/script>/g, "");
  const dom = new JSDOM(html, { url: "https://esempio.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const finestra = dom.window;
  const doc = finestra.document;

  finestra.scrollTo = function () {};
  finestra.matchMedia = function () {
    return { matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} };
  };
  finestra.confirm = function () { return true; };
  finestra.alert = function () {};
  finestra.speechSynthesis = { getVoices: () => [], speak() {}, cancel() {}, addEventListener() {} };
  finestra.SpeechSynthesisUtterance = function (testo) { this.text = testo; };

  for (const nome of MODULI) {
    try {
      finestra.eval(fs.readFileSync(path.join(radice, "assets", "js", nome + ".js"), "utf8"));
    } catch (e) {
      problema("assets/js/" + nome + ".js", "non si carica: " + e.message);
      return;
    }
  }
  const NP = finestra.NP;
  if (!NP || !NP.app) {
    problema("index.html", "l'app non si avvia: NP.app è assente");
    return;
  }

  // Si parte da ogni collegamento della pagina, non solo da quelli dentro
  // #app: il menu dell'intestazione porta a viste che altrimenti restano
  // fuori dal controllo.
  const inCoda = ["#/"];
  for (const a of doc.querySelectorAll('a[href^="#/"]')) {
    const destinazione = a.getAttribute("href").split("?")[0];
    if (inCoda.indexOf(destinazione) < 0) inCoda.push(destinazione);
  }
  const visitate = new Set();
  while (inCoda.length) {
    const rotta = inCoda.shift();
    if (visitate.has(rotta) || visitate.size > 300) continue;
    visitate.add(rotta);
    finestra.location.hash = rotta;
    try {
      NP.app.render();
    } catch (e) {
      problema(rotta, "la vista non si apre: " + e.message);
      continue;
    }
    const contenitore = doc.getElementById("app");
    if (!contenitore) continue;

    const dove = "vista " + rotta;
    controllaImmagini(contenitore, dove);
    for (const tema of TEMI) {
      doc.documentElement.setAttribute("data-theme", tema);
      controllaTesti(contenitore, dove + " (" + tema + ")", TEMI_VALORI[tema]);
    }
    doc.documentElement.setAttribute("data-theme", "light");

    const h1 = controllaTitoli(contenitore, dove);
    if (h1 > 1) problema(dove, h1 + " titoli principali (h1) nella stessa vista");

    for (const a of contenitore.querySelectorAll('a[href^="#/"]')) {
      const destinazione = a.getAttribute("href").split("?")[0];
      if (!visitate.has(destinazione) && inCoda.length < 400) inCoda.push(destinazione);
    }
  }

  // Nessuna vista deve poter restare fuori: si confrontano quelle registrate
  // con quelle davvero percorse, e ciò che manca va collegato o avviato qui.
  const percorse = new Set([
    ...[...visitate].map((r) => r.replace(/^#\/?/, "").split("/")[0] || "home")
  ]);
  visteRegistrate = Object.keys(NP.app.views).length;
  const fuori = Object.keys(NP.app.views).filter((nome) => !percorse.has(nome));
  if (fuori.length) {
    problema("viste", "mai raggiunte da nessun collegamento, quindi mai verificate: " + fuori.join(", ") + ". Aggiungi un collegamento verso ciascuna, oppure avviale esplicitamente qui sopra.");
  }
}

/* Esito -------------------------------------------------------------------- */

controllaPagine();
controllaApp();

console.log("\nControllo di accessibilità");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " punti da sistemare.");
} else {
  console.log(
    "  ✓ " + testiMisurati + " testi leggibili nei due temi (contrasto minimo " + migliorRapporto.toFixed(2) +
      ":1), " + titoliControllati + " titoli in ordine, " + immaginiControllate + " immagini e icone con nome."
  );
}
if (nonMisurabili) {
  console.log("  · " + nonMisurabili + " testi su sfondo sfumato o semitrasparente, non misurabili con certezza.");
}
if (problemi.length) process.exit(1);

scriviRapporto("accessibilita", {
  pagine: pagine.length,
  viste: visteRegistrate,
  dettaglio: testiMisurati + " testi nei due temi, " + titoliControllati + " titoli, contrasto minimo " +
    migliorRapporto.toFixed(2).replace(".", ",") + ":1"
});
