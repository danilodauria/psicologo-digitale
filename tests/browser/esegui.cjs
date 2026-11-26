#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · avvio della suite nel browser vero
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

// Due chiamate, due comportamenti:
//
//   npm run test:browser   senza flag, il browser è un requisito: se manca,
//                          errore e uscita 1. Un controllo che non può girare
//                          non è un controllo superato.
//   npm test               passa --consenti-salto: il salto è ammesso, perché
//                          il resto della verifica non deve cadere per un
//                          pezzo di ambiente che non c'entra col programma.
//                          Il salto però si vede, con il comando da eseguire.
//
// In entrambi i casi l'uscita passa per manca(): un solo posto decide.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const radice = path.join(__dirname, "..", "..");
const saltoAmmesso = process.argv.includes("--consenti-salto");
const INSTALLA = "npx playwright install --with-deps chromium";

function manca(che, come) {
  if (saltoAmmesso) {
    console.log("· Suite nel browser saltata: " + che + ". Per eseguirla: " + come);
    process.exit(0);
  }
  console.error("✗ La suite nel browser non può partire: " + che + ".");
  console.error("  Per risolverla: " + come);
  console.error("  Poi riprova: npm run test:browser");
  process.exit(1);
}

let chromium = null;
try {
  chromium = require("@playwright/test").chromium;
} catch (e) {
  // manca il pacchetto: lo dice manca()
}
if (!chromium) manca("@playwright/test non è installato", "npm install");

if (!fs.existsSync(chromium.executablePath())) manca("manca il browser di Playwright", INSTALLA);

// Il comando si chiama col proprio Node: niente percorsi .bin diversi fra
// Windows e il resto.
let cli = null;
try {
  cli = path.join(path.dirname(require.resolve("playwright")), "cli.js");
} catch (e) {
  // manca il comando: lo dice manca()
}
if (!cli) manca("manca il comando playwright", "npm install");

const esito = spawnSync(process.execPath, [cli, "test"], { cwd: radice, stdio: "inherit" });
process.exit(esito.status === null ? 1 : esito.status);
