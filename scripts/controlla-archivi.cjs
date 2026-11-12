#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo degli archivi installabili
   Licenza del codice: MIT · Danilo D'Auria

   Apre un pacchetto già costruito (.zip portatile, .deb) e confronta il suo
   app.asar con desktop/app: stessi file, stesse impronte. Serve a scoprire i
   file persi o alterati durante la compressione, che nessun test sul
   repository può vedere.

   Uso:
     node scripts/controlla-archivi.cjs desktop/dist/Psicologo-Digitale-Linux-amd64.deb
     node scripts/controlla-archivi.cjs desktop/dist/Psicologo-Digitale-Windows-portatile.zip
     node scripts/controlla-archivi.cjs --cartella desktop/dist/win-unpacked
   ========================================================================== */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const radice = path.join(__dirname, "..");
const pacchetto = path.join(radice, "desktop", "app");
const problemi = [];

// I file che il programma carica all'avvio non vengono da desktop/app: sono
// accanto a main.cjs e devono comunque essere nell'archivio.
const AVVIO = ["main.cjs", "preload.cjs", "motore.cjs"];

function impronta(dati) {
  return crypto.createHash("sha256").update(dati).digest("hex");
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

function estrai(archivio, destinazione) {
  fs.rmSync(destinazione, { recursive: true, force: true });
  fs.mkdirSync(destinazione, { recursive: true });
  const nome = path.basename(archivio).toLowerCase();

  if (nome.endsWith(".zip")) {
    execFileSync("unzip", ["-o", "-q", archivio, "-d", destinazione], { stdio: "pipe" });
    return;
  }

  if (nome.endsWith(".deb")) {
    // Un .deb è un archivio «ar» con dentro data.tar.xz (o .gz).
    const membri = execFileSync("ar", ["t", archivio]).toString().split("\n").map((m) => m.trim());
    const membro = membri.find((m) => /^data\.tar(\.(xz|gz|zst))?$/.test(m));
    if (!membro) throw new Error("il .deb non contiene data.tar");
    const dati = execFileSync("ar", ["p", archivio, membro], { maxBuffer: 1 << 30 });
    const temporaneo = path.join(destinazione, membro);
    fs.writeFileSync(temporaneo, dati);
    execFileSync("tar", ["-xf", temporaneo, "-C", destinazione], { stdio: "pipe" });
    fs.rmSync(temporaneo, { force: true });
    return;
  }

  throw new Error("formato non gestito: " + path.basename(archivio) + " (restano fuori AppImage, .exe e .dmg)");
}

function trovaAsar(cartella) {
  for (const { relativo, pieno } of fileRicorsivi(cartella, "")) {
    if (relativo.endsWith("/app.asar") || relativo === "app.asar") return pieno;
  }
  return null;
}

// L'asar non è compresso: un'intestazione con l'elenco dei file, poi i byte.
// Si legge direttamente, senza dipendenze.
function leggiAsar(file) {
  const fd = fs.openSync(file, "r");
  const testa = Buffer.alloc(8);
  fs.readSync(fd, testa, 0, 8, 0);
  const dimensione = testa.readUInt32LE(4);
  const blocco = Buffer.alloc(dimensione);
  fs.readSync(fd, blocco, 0, dimensione, 8);
  // L'intestazione è un «pickle»: la dimensione del blocco, poi la lunghezza
  // della stringa JSON, poi il JSON stesso.
  const lunghezza = blocco.readUInt32LE(4);
  const header = JSON.parse(blocco.toString("utf8", 8, 8 + lunghezza));
  const base = 8 + dimensione;

  const voci = new Map();
  const cammina = (nodo, prefisso) => {
    for (const [nome, valore] of Object.entries(nodo.files || {})) {
      const percorso = prefisso ? prefisso + "/" + nome : nome;
      if (valore.files) cammina(valore, percorso);
      // L'asar scrive dimensioni e posizioni come stringhe quando sono grandi.
      else voci.set(percorso, {
        dimensione: Number(valore.size || 0),
        offset: Number(valore.offset || 0),
        sciolto: valore.unpacked === true
      });
    }
  };
  cammina(header, "");
  return { fd, base, voci };
}

function controlla(percorsoAsar, dove) {
  if (!fs.existsSync(pacchetto)) {
    problemi.push("desktop/app non esiste: esegui prima scripts/prepare-desktop.cjs");
    return;
  }
  const asar = leggiAsar(percorsoAsar);
  let controllati = 0;

  for (const { relativo, pieno } of fileRicorsivi(pacchetto, "")) {
    // Dentro l'asar il sito sta sotto «app/»; i file di avvio stanno alla radice.
    const chiave = asar.voci.has("app/" + relativo) ? "app/" + relativo : relativo;
    const voce = asar.voci.get(chiave);
    if (!voce) {
      problemi.push(dove + " → manca nell'archivio: " + relativo);
      continue;
    }
    const dati = fs.readFileSync(pieno);
    if (voce.sciolto) {
      // I file «unpacked» stanno fuori dall'asar, accanto: si controllano lì.
      const sciolto = path.join(path.dirname(percorsoAsar), "app.asar.unpacked", chiave);
      if (!fs.existsSync(sciolto)) {
        problemi.push(dove + " → dichiarato fuori dall'archivio ma assente: " + relativo);
        continue;
      }
      if (impronta(fs.readFileSync(sciolto)) !== impronta(dati)) problemi.push(dove + " → contenuto diverso: " + relativo);
      controllati++;
      continue;
    }
    if (voce.dimensione !== dati.length) {
      problemi.push(dove + " → dimensione diversa per " + relativo + " (" + voce.dimensione + " invece di " + dati.length + ")");
      continue;
    }
    const nelPacchetto = Buffer.alloc(dati.length);
    if (dati.length) fs.readSync(asar.fd, nelPacchetto, 0, dati.length, asar.base + voce.offset);
    if (impronta(nelPacchetto) !== impronta(dati)) {
      problemi.push(dove + " → contenuto diverso: " + relativo);
      continue;
    }
    controllati++;
  }

  for (const avvio of AVVIO) {
    if (!asar.voci.has(avvio)) problemi.push(dove + " → manca il file di avvio: " + avvio);
  }

  fs.closeSync(asar.fd);
  return controllati;
}

/* Avvio -------------------------------------------------------------------- */

const argomenti = process.argv.slice(2);
if (!argomenti.length) {
  console.error("Uso: node scripts/controlla-archivi.cjs <archivio.zip|.deb> | --cartella <cartella>");
  process.exit(2);
}

let totale = 0;
const temporanee = [];

try {
  if (argomenti[0] === "--cartella") {
    const cartella = path.resolve(argomenti[1] || "");
    const asar = trovaAsar(cartella);
    if (!asar) throw new Error("nessun app.asar trovato in " + cartella);
    totale += controlla(asar, path.basename(cartella)) || 0;
  } else {
    for (const archivio of argomenti) {
      if (!fs.existsSync(archivio)) throw new Error("archivio inesistente: " + archivio);
      const destinazione = fs.mkdtempSync(path.join(os.tmpdir(), "psd-archivio-"));
      temporanee.push(destinazione);
      estrai(archivio, destinazione);
      const asar = trovaAsar(destinazione);
      if (!asar) throw new Error("nessun app.asar dentro " + path.basename(archivio));
      const quanti = controlla(asar, path.basename(archivio));
      console.log("  · " + path.basename(archivio) + ": " + quanti + " file verificati");
      totale += quanti || 0;
    }
  }
} catch (err) {
  problemi.push(String((err && err.message) || err));
} finally {
  for (const cartella of temporanee) fs.rmSync(cartella, { recursive: true, force: true });
}

console.log("\nControllo degli archivi installabili");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " problemi nell'archivio.");
  process.exit(1);
}
console.log("  ✓ " + totale + " file dell'app identici a desktop/app dentro gli archivi.");
