#!/usr/bin/env node
/* Prepara il contenuto del programma desktop: copia il sito pubblicato
   dentro desktop/app, senza test, script di sviluppo o dipendenze.
   Uso: node scripts/prepare-desktop.cjs                                  */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "desktop", "app");

// Le pagine che il programma apre al suo interno devono viaggiare con lui:
// senza, il pulsante «Passaggio per passaggio» portava a una finestra vuota.
const files = ["index.html", "come-installare.html", "scheda-rapida.html", "manifest.webmanifest", "sw.js", "LICENSE", "LICENSE-CONTENT.md", "README.md"];
const dirs = ["assets"];

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

files.forEach((f) => {
  const from = path.join(root, f);
  if (!fs.existsSync(from)) throw new Error("File mancante: " + f);
  fs.copyFileSync(from, path.join(dest, f));
});

dirs.forEach((d) => {
  const from = path.join(root, d);
  if (!fs.existsSync(from)) throw new Error("Cartella mancante: " + d);
  fs.cpSync(from, path.join(dest, d), { recursive: true });
});

// La pagina dei download e i sorgenti non servono dentro il pacchetto.
fs.rmSync(path.join(dest, "assets", "data"), { recursive: true, force: true });

const count = (p) => fs.statSync(p).isDirectory()
  ? fs.readdirSync(p).reduce((n, f) => n + count(path.join(p, f)), 0)
  : 1;

console.log("desktop/app pronta: " + count(dest) + " file.");
