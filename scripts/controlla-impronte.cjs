#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · impronte del pacchetto desktop
   Licenza del codice: MIT · Danilo D'Auria

   Confronta ogni file di desktop/app con il suo originale nel repository,
   byte per byte (SHA-256). Non basta che il file ci sia: deve essere quello
   giusto. Un PDF ricostruito e non ricopiato, un foglio di stile modificato
   e rimasto indietro, un file di dati alterato: qui si vedono.

   Gira dentro `npm test`, quindi prima della pubblicazione.

   Uso:
     node scripts/controlla-impronte.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const radice = path.join(__dirname, "..");
const pacchetto = path.join(radice, "desktop", "app");
const problemi = [];

let confrontati = 0;
let byteTotali = 0;

function impronta(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function fileRicorsivi(cartella, prefisso) {
  const risultati = [];
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    const relativo = prefisso ? prefisso + "/" + voce.name : voce.name;
    const pieno = path.join(cartella, voce.name);
    if (voce.isDirectory()) risultati.push(...fileRicorsivi(pieno, relativo));
    else if (voce.isFile()) risultati.push({ relativo, pieno });
  }
  return risultati;
}

if (!fs.existsSync(pacchetto)) {
  console.error("\nImpronte del pacchetto\n  ✗ desktop/app non esiste: esegui prima scripts/prepare-desktop.cjs");
  process.exit(1);
}

const elenco = fileRicorsivi(pacchetto, "");
if (!elenco.length) {
  console.error("\nImpronte del pacchetto\n  ✗ desktop/app è vuota.");
  process.exit(1);
}

for (const { relativo, pieno } of elenco) {
  const originale = path.join(radice, relativo);
  if (!fs.existsSync(originale)) {
    problemi.push(relativo + " → nel pacchetto ma non nel repository");
    continue;
  }
  confrontati++;
  byteTotali += fs.statSync(pieno).size;
  if (impronta(pieno) !== impronta(originale)) {
    problemi.push(relativo + " → contenuto diverso dal repository");
  }
}

console.log("\nImpronte del pacchetto desktop");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " file da riallineare.");
  process.exit(1);
}
console.log(
  "  ✓ " + confrontati + " file identici al repository (SHA-256), " +
    (byteTotali / 1048576).toFixed(1) + " MB in tutto."
);
