#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · casi di prova del controllo della rete
   Licenza del codice: MIT · Danilo D'Auria

   `scripts/controlla-rete.cjs` decide che cosa è una richiesta innocua. Se
   sbaglia per eccesso di fiducia, il controllo diventa verde su un programma
   che manda dati fuori: per questo va provato anche al contrario.

   Qui si costruisce un progetto in miniatura in una cartella temporanea, con
   la copia del controllo dentro, e gli si chiede di giudicare una `fetch` per
   volta. Il caso che conta: un `fetch("assets/js/app.js?dati=1")` verso la
   stessa origine deve essere rosso, perché dopo il punto interrogativo
   viaggiano i dati. Devono essere rossi anche un file che non esiste e un file
   del progetto che al browser non arriva (`scripts/`).

   Gira dentro `npm test`, subito dopo `scripts/controlla-rete.cjs`.
   ========================================================================== */

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const radice = path.join(__dirname, "..");
const controllo = path.join(radice, "scripts", "controlla-rete.cjs");

let casi = 0;
let falliti = 0;

function ok(cond, msg) {
  casi++;
  if (!cond) {
    falliti++;
    console.error("  ✗ " + msg);
  }
}

// Un progetto in miniatura sufficiente a far girare il controllo senza trovare
// problemi veri: così ogni rosso viene dal caso che stiamo provando, non da un
// file di esempio scritto male. `app.js` è il file che cambia da un caso
// all'altro.
function progetto(appJs) {
  const cartella = fs.mkdtempSync(path.join(os.tmpdir(), "psd-rete-"));
  const scrivi = (relativo, testo) => {
    const pieno = path.join(cartella, relativo);
    fs.mkdirSync(path.dirname(pieno), { recursive: true });
    fs.writeFileSync(pieno, testo);
  };

  scrivi("scripts/controlla-rete.cjs", fs.readFileSync(controllo, "utf8"));
  scrivi(
    "index.html",
    '<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Prova</title>' +
      '<link rel="stylesheet" href="assets/css/stile.css"></head>' +
      '<body><script src="assets/js/app.js"></script></body></html>'
  );
  // La sola richiesta alla stessa origine che il programma fa davvero: il
  // service worker che ripassa dalla cache la richiesta del browser.
  scrivi("sw.js", 'self.addEventListener("fetch", function (event) {\n  event.respondWith(fetch(request));\n});\n');
  scrivi("manifest.webmanifest", '{"name":"Prova","start_url":"."}');
  scrivi("assets/css/stile.css", "body{color:#000}");
  scrivi("assets/js/app.js", appJs);
  // L'altra eccezione ammessa: Ollama sul computer. Senza, il controllo dice
  // che l'indirizzo è cambiato, e ogni caso diventerebbe rosso per quel motivo.
  scrivi("assets/js/app-installa.js", 'const HOST = "http://127.0.0.1:11434";\nfetch(HOST + "/api/tags");\n');

  return cartella;
}

function esegui(cartella) {
  const programma = path.join(cartella, "scripts", "controlla-rete.cjs");
  try {
    const uscita = execFileSync(process.execPath, [programma], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { codice: 0, uscita: uscita };
  } catch (errore) {
    return {
      codice: typeof errore.status === "number" ? errore.status : -1,
      uscita: String(errore.stdout || "") + String(errore.stderr || ""),
    };
  }
}

// Costruisce il progetto, lo fa giudicare e lo cancella comunque, anche se il
// caso fallisce: la cartella temporanea non deve restare in giro.
function giudica(appJs) {
  const cartella = progetto(appJs);
  try {
    return esegui(cartella);
  } finally {
    fs.rmSync(cartella, { recursive: true, force: true });
  }
}

console.log("Controllo della rete · casi di prova\n");

const senzaProblemi = giudica('fetch("assets/js/app.js");\n');
ok(
  senzaProblemi.codice === 0,
  "un fetch verso un file dell'app, senza query, passa il controllo" +
    (senzaProblemi.codice === 0 ? "" : " → " + senzaProblemi.uscita.trim().split("\n").slice(-3).join(" | "))
);

const conQuery = giudica('fetch("assets/js/app.js?dati=1");\n');
ok(conQuery.codice !== 0, "un fetch con dati in query verso la stessa origine fa fallire il controllo");
ok(
  /chiamata di rete verso «assets\/js\/app\.js\?dati=1»/.test(conQuery.uscita),
  "il messaggio nomina l'indirizzo rifiutato, con la query" +
    (conQuery.codice === 0 ? " (il controllo è passato: nessun messaggio)" : "")
);

const inesistente = giudica('fetch("assets/js/non-esiste.js");\n');
ok(inesistente.codice !== 0, "un fetch verso un file che non esiste fa fallire il controllo");

const fuoriApp = giudica('fetch("scripts/controlla-rete.cjs");\n');
ok(
  fuoriApp.codice !== 0,
  "un fetch verso un file del progetto che al browser non arriva (scripts/) fa fallire il controllo"
);

if (falliti) {
  console.error("\n" + falliti + " casi falliti su " + casi + ".");
  process.exit(1);
}

console.log("  ✓ " + casi + "/" + casi + " casi di prova superati");
