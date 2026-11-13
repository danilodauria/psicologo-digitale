#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · riepilogo di copertura dei controlli
   Licenza del codice: MIT · Danilo D'Auria

   I tre controlli — testi, accessibilità, collegamenti — scrivono ciascuno il
   proprio rapporto in `artifacts/copertura/`: quante pagine hanno letto,
   quante viste hanno percorso e cosa hanno misurato. Questo riepilogo li
   mette uno accanto all'altro, in fondo a `npm test`, perché un numero che
   cala si veda subito invece di doverlo cercare in tre output diversi.

   Non si fida dei rapporti: verifica che i tre abbiano letto lo stesso numero
   di pagine e visitato lo stesso numero di viste, e che le pagine siano
   davvero quelle presenti nella cartella. Un controllo che salta una parte
   del sito si vede qui, prima che si veda cercando una pagina che nessuno ha
   mai scritto.

   Gira dentro `npm test`, dopo gli altri tre.

   Uso:
     node scripts/riepilogo-copertura.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const radice = path.join(__dirname, "..");
const cartella = path.join(radice, "artifacts", "copertura");

const CONTROLLI = [
  ["testi", "Testi"],
  ["accessibilita", "Accessibilità"],
  ["collegamenti", "Collegamenti"]
];

const pagineNellaCartella = fs.readdirSync(radice).filter((f) => f.endsWith(".html")).length;

const rapporti = [];
const mancanti = [];

for (const [file, nome] of CONTROLLI) {
  try {
    const letto = JSON.parse(fs.readFileSync(path.join(cartella, file + ".json"), "utf8"));
    rapporti.push({ nome: nome, pagine: letto.pagine, viste: letto.viste, dettaglio: letto.dettaglio });
  } catch (e) {
    mancanti.push(nome);
  }
}

console.log("\nCopertura dei controlli");

if (mancanti.length) {
  console.error(
    "  ✗ manca il rapporto di: " + mancanti.join(", ") +
      ". I controlli girano in ordine dentro `npm test`: se un rapporto manca, quel controllo non è arrivato in fondo."
  );
  process.exit(1);
}

const problemi = [];
const pagine = [...new Set(rapporti.map((r) => r.pagine))];
const viste = [...new Set(rapporti.map((r) => r.viste))];

if (pagine.length > 1) {
  problemi.push(
    "i controlli hanno letto un numero diverso di pagine: " +
      rapporti.map((r) => r.nome + " " + r.pagine).join(", ") + ". Uno sta saltando qualcosa."
  );
}
if (viste.length > 1) {
  problemi.push(
    "i controlli hanno visitato un numero diverso di viste: " +
      rapporti.map((r) => r.nome + " " + r.viste).join(", ") + ". Uno sta saltando qualcosa."
  );
}
if (pagine.indexOf(pagineNellaCartella) < 0) {
  problemi.push(
    "nella cartella ci sono " + pagineNellaCartella + " pagine, i controlli ne hanno lette " + pagine.join(" o ") + "."
  );
}

const larghezza = Math.max(...rapporti.map((r) => r.nome.length));
for (const r of rapporti) {
  console.log(
    "  " + r.nome.padEnd(larghezza) + "  " + String(r.pagine).padStart(2) + " pagine · " +
      String(r.viste).padStart(2) + " viste · " + r.dettaglio
  );
}

if (problemi.length) {
  problemi.forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + problemi.length + " punti da sistemare nel riepilogo.");
  process.exit(1);
}

console.log(
  "  ✓ Tutti e tre hanno letto le stesse " + pagineNellaCartella + " pagine e le stesse " + viste[0] +
    " viste: nessuna è rimasta fuori."
);
