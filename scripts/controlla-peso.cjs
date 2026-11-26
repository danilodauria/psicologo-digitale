#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo del peso di quello che si scarica
   Licenza: MIT · Danilo D'Auria

   Il programma non ha un build step e non ha dipendenze a runtime: il primo
   avvio è la somma dei file che il service worker mette in cache. Senza una
   misura, quel numero cresce una release alla volta e nessuno se ne accorge
   finché qualcuno non apre l'app su un telefono modesto o con una rete lenta.

   Il budget è una decisione, non una previsione: si alza solo scrivendolo qui,
   con il motivo, mai per far passare una modifica.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const BUDGET_KB = 1100; // oggi circa 950 kB: il margine è per una release normale
const MASSIMO_FILE_KB = 150; // un singolo file oltre questo va spezzato o caricato dopo
const PAGINA_KB = 140; // index.html, con la sua testata, non deve pesare come mezza app

function leggiOggetto(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

// L'elenco si legge dal service worker, non da una copia a mano: quello che si
// misura è esattamente quello che il browser salva per l'uso offline.
function fileInCache() {
  const sw = leggiOggetto("sw.js");
  const blocco = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
  if (!blocco) {
    console.error("✗ non trovo l'elenco ASSETS in sw.js: il controllo del peso non sa cosa misurare");
    process.exit(1);
  }
  const voci = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(blocco[1]))) voci.push(m[1]);
  return voci
    .filter((v) => v !== "./")
    .map((v) => v.replace(/^\.\//, ""))
    .filter((v) => fs.existsSync(path.join(root, v)));
}

const file = fileInCache();
if (!file.length) {
  console.error("✗ l'elenco del service worker è vuoto: niente da misurare");
  process.exit(1);
}

let totale = 0;
let problemi = 0;
let piuGrande = { file: "", byte: 0 };

file.forEach(function (f) {
  const byte = fs.statSync(path.join(root, f)).size;
  totale += byte;
  if (byte > piuGrande.byte) piuGrande = { file: f, byte: byte };
  if (byte > MASSIMO_FILE_KB * 1024) {
    problemi++;
    console.error("  ✗ " + f + ": " + Math.round(byte / 1024) + " kB, oltre il massimo di " + MASSIMO_FILE_KB + " kB per file");
  }
});

const kb = totale / 1024;
const indexKb = fs.statSync(path.join(root, "index.html")).size / 1024;
if (indexKb > PAGINA_KB) {
  problemi++;
  console.error("  ✗ index.html: " + Math.round(indexKb) + " kB, oltre il massimo di " + PAGINA_KB + " kB per la pagina");
}

if (kb > BUDGET_KB) {
  problemi++;
  console.error("  ✗ quello che si scarica al primo avvio pesa " + Math.round(kb) + " kB, oltre il budget di " + BUDGET_KB +
    " kB: togli qualcosa, o alza il budget in scripts/controlla-peso.cjs scrivendo perché");
}

if (problemi) {
  console.error("✗ peso: " + problemi + " problem" + (problemi === 1 ? "a" : "i"));
  process.exit(1);
}

console.log("✓ peso: " + Math.round(kb) + " kB su " + BUDGET_KB + " kB in " + file.length +
  " file (il più grande: " + piuGrande.file + ", " + Math.round(piuGrande.byte / 1024) + " kB)");
