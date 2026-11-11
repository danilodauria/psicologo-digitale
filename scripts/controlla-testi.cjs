#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo dei testi
   Licenza del codice: MIT · Danilo D'Auria

   Legge le tre pagine e ogni vista dell'app e cerca:

     · refusi    doppi spazi, spazio prima della punteggiatura, punteggiatura
                 ripetuta, parole raddoppiate («la la»), virgolette o
                 parentesi spaiate, maiuscole dimenticate dopo il punto;
     · errori    le forme sbagliate che ricorrono più spesso in italiano
                 («qual'è», «un'altro», «pò», «sopratutto» …);
     · ripetizioni  la stessa frase due volte nella stessa pagina o vista, e
                 due frasi quasi identiche di cui una nega l'altra;
     · conteggi  la stessa cosa detta con numeri diversi («sei questionari»
                 in una pagina e «cinque questionari» in un'altra).

   Le frasi che ritornano in viste diverse sono volute (le avvertenze si
   ripetono) e non vengono segnalate: conta solo ciò che si ripete due volte
   nello stesso posto.

   Gira dentro `npm test`, quindi prima della pubblicazione.

   Uso:
     node scripts/controlla-testi.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const radice = path.join(__dirname, "..");
const pagine = ["index.html", "come-installare.html", "scheda-rapida.html"];

let blocchi = 0;
let frasi = 0;
let parole = 0;
const problemi = [];

function problema(dove, cosa) {
  problemi.push(dove + " → " + cosa);
}

/* Le forme sbagliate che capitano davvero ---------------------------------- */

// Ogni voce: come si scrive (sbagliato) e come si corregge. Restano fuori le
// forme che possono essere giuste a seconda del verbo («dà», «fa», «va»),
// perché segnalarle riempirebbe il controllo di falsi allarmi.
const ERRORI = [
  [/\bqual['’]è\b/giu, "qual è"],  [/\bun['’]altro\b/giu, "un altro"],
  [/\bperchè\b/giu, "perché"],
  [/\bpoichè\b/giu, "poiché"],
  [/\baffinchè\b/giu, "affinché"],
  [/\bgiacchè\b/giu, "giacché"],
  [/\bnonchè\b/giu, "nonché"],
  [/\bsopratutto\b/giu, "soprattutto"],
  [/\bdaccordo\b/giu, "d'accordo"],
  [/\bsè\s+stess[oaie]\b/giu, "se stesso"],
  [/\btutt['’]altro\b/giu, "tutt'altro"],
  [/\bpò\b/giu, "po'"],
  [/\bsò\b(?=\s+(?:che|se|come|cosa|quale|quanto|di|per|dire|fare)\b)/giu, "so"],
  [/\bstò\b/giu, "sto"],
  [/\bfà\b(?=\s+(?:male|bene|caldo|freddo|paura|bene|presto|tardi)\b)/giu, "fa"],
  [/\bvà\b/giu, "va"],
  [/\bpiu\b(?=\s|$)/giu, "più"],
  [/\bperche\b(?=\s|$)/giu, "perché"],
  [/\bcosi\b(?=\s|$)/giu, "così"],
  [/\bgia\b(?=\s|$)/giu, "già"],
  [/\bpuo\b(?=\s|$)/giu, "può"]
];

// Dopo un punto la maiuscola può mancare legittimamente dopo un'abbreviazione
// o dopo un numero di versione.
const ABBREVIAZIONI = /(?:^|\s)(?:es|ecc|cfr|art|n|pag|min|dott|prof|sig|avv|tel|vs|fig|tab|al|ed|cit|op|vol|pp|p|sez|cap)\.$/i;

/* Lettura del testo --------------------------------------------------------- */

const BLOCCHI = "p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, figcaption, dt, dd, button, label, summary";

function testoPulito(testo) {
  return String(testo || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// I blocchi annidati (una lista dentro un paragrafo, un pulsante dentro una
// voce) darebbero lo stesso testo due volte: si tiene solo il più esterno.
function blocchiDiTesto(contenitore) {
  const raccolti = [...contenitore.querySelectorAll(BLOCCHI)].filter(
    (el) => !el.closest('[aria-hidden="true"], .sr-only, [hidden], script, style')
  );
  const insieme = new Set(raccolti);
  return raccolti
    .filter((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        if (insieme.has(p)) return false;
      }
      return true;
    })
    .map((el) => ({ el, testo: testoPulito(el.textContent), grezzo: String(el.textContent || "") }))
    .filter((b) => b.testo.length > 2);
}

function dividi(frase) {
  return frase
    .split(/(?<=[.!?…])\s+/)
    .map((f) => f.trim())
    .filter((f) => f.split(/\s+/).length >= 4);
}

/* Refusi meccanici --------------------------------------------------------- */

function controllaRefusi(b, dove) {
  const testo = b.testo;

  // L'indentazione del sorgente non è un doppio spazio: si guarda riga per riga.
  const righe = b.grezzo.replace(/\u00a0/g, " ").split(/\r?\n/).map((r) => r.trim()).filter(Boolean);
  if (righe.some((r) => / {2,}/.test(r))) problema(dove, "doppio spazio in «" + scorcia(testo) + "»");
  // Il punto di un nome di file («il .dmg») non è punteggiatura: conta solo
  // quando chiude davvero un pezzo di frase.
  if (/\s+[,;:!?]/.test(testo) || /\s+\.(?=\s|$)/.test(testo)) {
    problema(dove, "spazio prima della punteggiatura in «" + scorcia(testo) + "»");
  }
  if (/[«“]\s|\s[»”]/.test(testo)) problema(dove, "spazio dentro le virgolette in «" + scorcia(testo) + "»");

  // Tre puntini di sospensione sono voluti; quattro no. Così «!!» e «??».
  const ripetuta = testo.match(/([!?,;:])\1+|\.[^.\s]{0,0}\.{4,}/);
  if (ripetuta) problema(dove, "punteggiatura ripetuta «" + ripetuta[0] + "» in «" + scorcia(testo) + "»");

  const raddoppiata = testo.match(/\b([\p{L}]{2,})\s+\1\b/iu);
  if (raddoppiata) problema(dove, "parola ripetuta due volte: «" + raddoppiata[0] + "»");

  if (/['’]\s/.test(testo)) problema(dove, "apostrofo seguito da spazio in «" + scorcia(testo) + "»");

  // Gli elenchi numerati usano «1)» senza parentesi aperta: è una scelta di
  // stile, non un errore.
  let tondi = 0;
  let tondeRotte = false;
  for (let i = 0; i < testo.length; i++) {
    if (testo[i] === "(") tondi++;
    else if (testo[i] === ")") {
      if (tondi > 0) tondi--;
      else if (!/\d\s?$/.test(testo.slice(0, i))) tondeRotte = true;
    }
  }
  const quadre = (testo.match(/\[/g) || []).length - (testo.match(/\]/g) || []).length;
  const caporali = (testo.match(/«/g) || []).length - (testo.match(/»/g) || []).length;
  if (tondi !== 0 || tondeRotte) problema(dove, "parentesi tonde spaiate in «" + scorcia(testo) + "»");
  if (quadre !== 0) problema(dove, "parentesi quadre spaiate in «" + scorcia(testo) + "»");
  if (caporali !== 0) problema(dove, "virgolette caporali spaiate in «" + scorcia(testo) + "»");

  // Maiuscola dopo il punto, tolti abbreviazioni e numeri.
  for (const m of testo.matchAll(/[.!?]\s+(\p{Ll})/gu)) {
    const prima = testo.slice(0, m.index + 1);
    // Puntini di sospensione, abbreviazioni, numeri di versione e iniziali
    // («R.L.») lasciano legittimamente la minuscola dopo il punto.
    if (
      prima.endsWith("…") || /\.\.\.$/.test(prima) || ABBREVIAZIONI.test(prima) ||
      /\d\.$/.test(prima) || /\p{Lu}\.$/u.test(prima)
    ) continue;
    const contesto = testo.slice(Math.max(0, m.index - 30), m.index + 20);
    problema(dove, "maiuscola mancante dopo il punto in «" + scorcia(contesto) + "»");
    break;
  }
}

function scorcia(testo) {
  const t = testo.replace(/\s+/g, " ").trim();
  return t.length > 70 ? t.slice(0, 67) + "…" : t;
}

/* Errori frequenti --------------------------------------------------------- */

function controllaErrori(b, dove) {
  for (const [modello, giusto] of ERRORI) {
    const trovato = b.testo.match(modello);
    if (!trovato) continue;
    problema(dove, "«" + trovato[0] + "» si scrive «" + giusto + "»");
  }
}

/* Ripetizioni e contraddizioni --------------------------------------------- */

const NEGAZIONI = /\b(non|mai|nessun[oa]?|niente|senza|né|ne)\b/iu;

function normalizza(frase) {
  return frase
    .toLocaleLowerCase("it")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function controllaRipetizioni(elenco, dove) {
  const viste = new Map();
  const frasiVista = [];

  for (const testo of elenco) {
    for (const frase of dividi(testo)) {
      frasi++;
      const n = normalizza(frase);
      const conta = n.split(" ").filter(Boolean).length;
      parole += conta;
      if (conta < 8) continue;

      if (viste.has(n)) {
        problema(dove, "frase ripetuta: «" + scorcia(frase) + "»");
        continue;
      }
      viste.set(n, frase);
      frasiVista.push({ parole: [...new Set(n.split(" "))], conta, frase, nega: NEGAZIONI.test(frase) });
    }
  }

  // Frasi quasi uguali: se una nega e l'altra afferma, il testo si contraddice.
  for (let i = 0; i < frasiVista.length; i++) {
    const a = frasiVista[i];
    if (a.conta < 10) continue;
    for (let j = i + 1; j < frasiVista.length; j++) {
      const b = frasiVista[j];
      if (b.conta < 10) continue;
      const comuni = a.parole.filter((p) => b.parole.includes(p)).length;
      const somiglianza = comuni / (a.parole.length + b.parole.length - comuni);
      if (somiglianza < 0.85) continue;
      if (a.nega === b.nega) {
        problema(dove, "due frasi quasi identiche: «" + scorcia(a.frase) + "» e «" + scorcia(b.frase) + "»");
      } else {
        problema(dove, "due frasi che si contraddicono: «" + scorcia(a.frase) + "» / «" + scorcia(b.frase) + "»");
      }
    }
  }
}

/* I conteggi che non tornano ------------------------------------------------- */

// Solo le cose che l'app dichiara come numero fisso: se una pagina dice «sei
// questionari» e un'altra «cinque», una delle due è rimasta indietro.
const CONTEGGI = /(\b(?:uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici|\d+)\b)\s+(questionari|tappe|capitoli|fasi)\b/giu;
const NUMERI = {
  uno: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12
};

function controllaConteggi(testi) {
  const perCosa = new Map();
  for (const testo of testi) {
    for (const m of testo.matchAll(CONTEGGI)) {
      const numero = NUMERI[m[1].toLocaleLowerCase("it")] || parseInt(m[1], 10);
      // «uno o due questionari» è un'istruzione, non un totale: i numeri
      // piccoli non sono dichiarazioni sull'intero percorso.
      if (numero < 4) continue;
      const cosa = m[2].toLocaleLowerCase("it");
      if (!perCosa.has(cosa)) perCosa.set(cosa, new Map());
      const valori = perCosa.get(cosa);
      if (!valori.has(numero)) valori.set(numero, 0);
      valori.set(numero, valori.get(numero) + 1);
    }
  }
  for (const [cosa, valori] of perCosa) {
    if (valori.size > 1) {
      const elenco = [...valori.entries()].map(([n, q]) => n + " (" + q + " volte)").join(", ");
      problema("tutto il sito", "«" + cosa + "» compare con numeri diversi: " + elenco);
    }
  }
}

/* Le pagine ---------------------------------------------------------------- */

function testoDellaPagina(pagina) {
  const dom = new JSDOM(fs.readFileSync(path.join(radice, pagina), "utf8"));
  const blocchiPagina = blocchiDiTesto(dom.window.document.body);
  const testi = [];
  for (const b of blocchiPagina) {
    blocchi++;
    testi.push(b.testo);
    controllaRefusi(b, pagina);
    controllaErrori(b, pagina);
  }
  controllaRipetizioni(testi, pagina);
  return testi;
}

/* L'app, vista per vista ---------------------------------------------------- */

const MODULI = [
  "data-scales", "data-intake", "data-course", "data-manual", "data-manual2", "data-extra",
  "data-quiz", "data-nutrizione", "data-ai", "neura", "app", "app-intake", "app-scales",
  "app-course", "app-neura", "app-views", "app-versioni", "app-nutrizione", "app-installa",
  "app-status", "app-report", "app-init", "app-welcome"
];

function testiDellApp() {
  const html = fs.readFileSync(path.join(radice, "index.html"), "utf8").replace(/<script src="[^"]+"><\/script>/g, "");
  const dom = new JSDOM(html, { url: "https://esempio.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const finestra = dom.window;
  const documento = finestra.document;

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
      return [];
    }
  }
  const NP = finestra.NP;
  if (!NP || !NP.app) {
    problema("index.html", "l'app non si avvia: NP.app è assente");
    return [];
  }

  const testi = [];
  const inCoda = ["#/"];
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
    const contenitore = documento.getElementById("app");
    if (!contenitore) continue;

    const testiVista = [];
    for (const b of blocchiDiTesto(contenitore)) {
      blocchi++;
      testiVista.push(b.testo);
      controllaRefusi(b, "vista " + rotta);
      controllaErrori(b, "vista " + rotta);
    }
    controllaRipetizioni(testiVista, "vista " + rotta);
    testi.push(...testiVista);

    for (const a of contenitore.querySelectorAll('a[href^="#/"]')) {
      const destinazione = a.getAttribute("href").split("?")[0];
      if (!visitate.has(destinazione) && inCoda.length < 400) inCoda.push(destinazione);
    }
  }
  return testi;
}

/* Esito -------------------------------------------------------------------- */

const testiPagine = [];
for (const pagina of pagine) testiPagine.push(...testoDellaPagina(pagina));
const testiViste = testiDellApp();
controllaConteggi(testiPagine.concat(testiViste));

console.log("\nControllo dei testi");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " punti da sistemare.");
  process.exit(1);
}
console.log(
  "  ✓ " + blocchi + " blocchi di testo in " + pagine.length + " pagine e tutte le viste: " +
    frasi + " frasi, nessun refuso, nessuna ripetizione, nessun conteggio in contraddizione."
);
