#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · metadati dei PDF
   Licenza: MIT · Danilo D'Auria

   Un PDF senza titolo si apre nella scheda con il nome del file; senza lingua
   dichiarata un lettore di schermo legge con la pronuncia sbagliata. Sono due
   cose che nessuno vede finché non mancano, e che un generatore può perdere a
   ogni riscrittura. Questo controllo apre i sette fogli e verifica che titolo,
   autore, lingua e «mostra il titolo del documento» ci siano davvero.

   La struttura taggata (PDF/UA) resta fuori per scelta: il testo è già in
   ordine di lettura lineare, e il tagging vero cambierebbe i generatori. Qui si
   controlla solo quello che gli script dichiarano di fare.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const cartella = path.join(root, "assets", "pdf");

if (!fs.existsSync(cartella)) {
  console.error("✗ non trovo assets/pdf: i PDF non ci sono");
  process.exit(1);
}

const fogli = fs.readdirSync(cartella).filter(function (n) { return /\.pdf$/i.test(n); }).sort();
if (!fogli.length) {
  console.error("✗ nessun PDF in assets/pdf");
  process.exit(1);
}

let problemi = 0;
fogli.forEach(function (nome) {
  const byte = fs.readFileSync(path.join(cartella, nome));
  const manca = [];
  if (byte.indexOf("/Title(") < 0) manca.push("titolo");
  if (byte.indexOf("/Author(Danilo D'Auria)") < 0) manca.push("autore");
  if (byte.indexOf("/Lang(it)") < 0) manca.push("lingua italiana");
  if (byte.indexOf("/DisplayDocTitle true") < 0) manca.push("titolo mostrato al posto del nome file");
  if (manca.length) {
    problemi++;
    console.error("  ✗ " + nome + ": manca " + manca.join(", "));
  }
});

if (problemi) {
  console.error("✗ PDF: " + problemi + " problem" + (problemi === 1 ? "a" : "i") +
    ". Si ripara con «node scripts/export-data.cjs», gli script build_*.py e poi «.venv/bin/python scripts/pdf_meta.py».");
  process.exit(1);
}

console.log("✓ PDF: " + fogli.length + " fogli con titolo, autore, lingua italiana e titolo del documento in vista");
