#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo dei collegamenti interni
   Licenza del codice: MIT · Danilo D'Auria

   Apre le tre pagine del sito, poi l'app intera: percorre ogni vista e ogni
   capitolo, e per ogni collegamento verifica che la destinazione esista
   davvero — file sul disco, rotta registrata, ancora nella pagina. Controlla
   anche che ciò che l'app apre viaggi dentro il pacchetto desktop.

   Gira dentro `npm test`, quindi prima della pubblicazione: se un file viene
   rinominato e un pulsante resta indietro, il sito non viene aggiornato.

   Uso:
     node scripts/controlla-collegamenti.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const radice = path.join(__dirname, "..");
const pagine = ["index.html", "come-installare.html", "scheda-rapida.html"];
const ESTERNO = /^https?:\/\//i;

let controlli = 0;
let rotteVisitate = 0;
const problemi = [];
const esterni = new Set();

function problema(dove, cosa) {
  problemi.push(dove + " → " + cosa);
}

/* Il pacchetto desktop ------------------------------------------------------ */

// Il programma installato riceve solo i file elencati da prepare-desktop.cjs:
// un collegamento verso una pagina che resta fuori apre una finestra vuota.
function pacchettoDesktop() {
  const testo = fs.readFileSync(path.join(radice, "scripts", "prepare-desktop.cjs"), "utf8");
  const leggi = (nome) => {
    const m = testo.match(new RegExp("const " + nome + " = \\[([\\s\\S]*?)\\];"));
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  };
  const files = leggi("files");
  const dirs = leggi("dirs");
  return {
    files,
    dirs,
    ha(percorso) {
      const p = percorso.replace(/^\.\//, "");
      if (files.indexOf(p) >= 0) return true;
      const inCartella = dirs.some((d) => p === d || p.startsWith(d + "/"));
      return inCartella && !p.startsWith("assets/data/");
    }
  };
}

/* Le viste registrate ------------------------------------------------------- */

function visteRegistrate() {
  const viste = new Set(["home"]);
  const cartella = path.join(radice, "assets", "js");
  for (const f of fs.readdirSync(cartella)) {
    if (!f.endsWith(".js")) continue;
    const testo = fs.readFileSync(path.join(cartella, f), "utf8");
    for (const m of testo.matchAll(/views\.([a-zA-Z-]+)\s*=/g)) viste.add(m[1]);
  }
  return viste;
}

/* Le pagine statiche -------------------------------------------------------- */

function controllaPagine(pacchetto, viste) {
  for (const pagina of pagine) {
    const dom = new JSDOM(fs.readFileSync(path.join(radice, pagina), "utf8"), {
      url: "https://esempio.test/" + pagina
    });
    const doc = dom.window.document;
    const ancore = new Set([...doc.querySelectorAll("[id]")].map((e) => e.id));
    doc.querySelectorAll("a[href], link[href], script[src], img[src], source[src], form[action]").forEach((el) => {
      const attributo = el.hasAttribute("href") ? "href" : el.hasAttribute("src") ? "src" : "action";
      controlli++;
      controllaDestinazione(pagina, el.getAttribute(attributo), ancore, pacchetto, viste);
    });
  }
}

function controllaDestinazione(da, destinazione, ancore, pacchetto, viste) {
  const u = String(destinazione || "").trim();
  if (!u || u === "#") return;

  if (ESTERNO.test(u)) {
    esterni.add(u);
    return;
  }
  if (/^(mailto:|tel:|data:|javascript:)/i.test(u)) return;

  // Àncora nella pagina: deve esistere un elemento con quell'id.
  if (u.startsWith("#/") || u === "#") {
    const rotta = u.replace(/^#\/?/, "").split("/")[0].split("?")[0];
    if (rotta && !viste.has(rotta)) problema(da, "rotta senza vista: " + u);
    return;
  }
  if (u.startsWith("#")) {
    if (ancore && !ancore.has(u.slice(1))) problema(da, "àncora inesistente: " + u);
    return;
  }
  if (/^[a-z]+:/i.test(u)) return;

  const percorso = decodeURIComponent(u.split("#")[0].split("?")[0]).replace(/^\.\//, "");
  if (!percorso) return;
  if (!fs.existsSync(path.join(radice, percorso))) {
    problema(da, "file mancante: " + u);
    return;
  }
  if (!pacchetto.ha(percorso)) problema(da, "file non incluso nel pacchetto desktop: " + u);
}

/* L'app, vista per vista ---------------------------------------------------- */

function rendiApp(pacchetto, viste) {
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

  const moduli = [
    "data-scales", "data-intake", "data-course", "data-manual", "data-manual2", "data-extra",
    "data-quiz", "data-nutrizione", "data-ai", "neura", "app", "app-intake", "app-scales",
    "app-course", "app-neura", "app-views", "app-versioni", "app-nutrizione", "app-installa",
    "app-status", "app-report", "app-init", "app-welcome"
  ];
  for (const nome of moduli) {
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
    rotteVisitate++;

    const contenitore = documento.getElementById("app");
    if (contenitore && /Qualcosa non ha funzionato/.test(contenitore.textContent)) {
      problema(rotta, "la vista finisce nell'errore generico");
    }
    const ancore = new Set([...documento.querySelectorAll("[id]")].map((e) => e.id));
    contenitore.querySelectorAll("a[href]").forEach((a) => {
      const destinazione = a.getAttribute("href");
      controlli++;
      controllaDestinazione("vista " + rotta, destinazione, ancore, pacchetto, viste);
      if (destinazione && destinazione.startsWith("#/") && !visitate.has(destinazione.split("?")[0]) && inCoda.length < 400) {
        inCoda.push(destinazione.split("?")[0]);
      }
    });
  }
}

/* Esito -------------------------------------------------------------------- */

const pacchetto = pacchettoDesktop();
const viste = visteRegistrate();

// Anche i file elencati per il pacchetto devono esistere, o la build desktop
// si fermerebbe con un errore poco chiaro.
for (const f of pacchetto.files) {
  if (!fs.existsSync(path.join(radice, f))) problema("scripts/prepare-desktop.cjs", "file elencato ma assente: " + f);
}

controllaPagine(pacchetto, viste);
rendiApp(pacchetto, viste);

console.log("\nControllo dei collegamenti");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " collegamenti da sistemare.");
  process.exit(1);
}
console.log(
  "  ✓ " + controlli + " collegamenti in " + pagine.length + " pagine e " + rotteVisitate +
    " viste, tutti con una destinazione che esiste (" + esterni.size + " indirizzi esterni annotati)."
);
