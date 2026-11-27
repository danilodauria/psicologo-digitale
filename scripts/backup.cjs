#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · copia di riserva dell'ultima versione funzionante
   Licenza: MIT · Danilo D'Auria

   Un archivio ZIP del commit indicato (per default HEAD), con dentro solo i
   file versionati: niente node_modules, niente build, niente segreti. Il nome
   porta la versione e la data, così due copie non si confondono mai:

       backup/psicologo-digitale-1.8.0-2026-11-27.zip

   La versione si legge dal package.json del commit archiviato, non da quello
   nel disco: se la working tree è a metà di una release, il nome dice comunque
   la verità su quello che c'è dentro.

   Uso: npm run backup            (HEAD)
        npm run backup -- <ref>  (un tag o un commit preciso)
   ========================================================================== */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ref = process.argv[2] || "HEAD";

function git(args, opzioni) {
  return execFileSync("git", args, Object.assign({ cwd: root, encoding: "utf8" }, opzioni || {}));
}

let versione;
try {
  versione = JSON.parse(git(["show", ref + ":package.json"])).version;
} catch (e) {
  console.error("✗ backup: non riesco a leggere package.json da " + ref);
  process.exit(1);
}
if (!versione || !/^\d+\.\d+\.\d+$/.test(versione)) {
  console.error("✗ backup: la versione di " + ref + " non è valida («" + versione + "»)");
  process.exit(1);
}

const data = new Date().toISOString().slice(0, 10);
const cartella = path.join(root, "backup");
fs.mkdirSync(cartella, { recursive: true });
const nome = "psicologo-digitale-" + versione + "-" + data + ".zip";
const destinazione = path.join(cartella, nome);

// `git archive` prende solo quello che è stato committato: è la definizione di
// «ultima versione funzionante» che questo progetto usa, perché i test girano
// sul commit prima della pubblicazione.
git(["archive", "--format=zip", "--prefix=psicologo-digitale-" + versione + "/", "-o", destinazione, ref]);

const byte = fs.statSync(destinazione).size;
console.log("✓ backup: " + path.relative(root, destinazione) + " (" + Math.round(byte / 1024) + " kB, da " + ref + ")");
