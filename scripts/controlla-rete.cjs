#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo della rete
   Licenza del codice: MIT · Danilo D'Auria

   L'app promette che niente esce dal dispositivo. Questo controllo la prende
   in parola: legge il codice che arriva al browser e diventa rosso se trova
   una chiamata di rete, un WebSocket, un EventSource, un beacon, un worker
   caricato da fuori o una risorsa esterna (script, foglio di stile, immagine,
   iframe, modulo che invia altrove).

   L'unica eccezione ammessa è Ollama su http://127.0.0.1:11434: resta dentro
   il computer e parte solo se la persona lo collega. Sono ammesse anche le
   richieste che prendono un file dell'app — una pagina, `sw.js`, il manifest,
   qualcosa dentro `assets/` — e la sola `fetch(request)` di `sw.js`, che
   ripassa dalla cache la richiesta del browser. Un percorso relativo vale solo
   se quel file esiste davvero: `fetch("assets/js/app.js?dati=1")` è rosso,
   perché una query è un dato che esce dal programma anche restando sulla
   stessa origine. Sono ammessi i collegamenti che la persona sceglie di
   aprire: un <a href="https://…"> non carica niente da solo, quindi non è una
   risorsa esterna.

   Cosa guarda: le pagine della cartella, `sw.js`, `manifest.webmanifest` e
   tutto `assets/` (JavaScript, CSS, JSON). Non guarda `desktop/`: il
   contenitore Electron è un programma a parte, che scarica il motore vocale
   solo quando la persona lo chiede, e ha un'altra pipeline.

   Gira dentro `npm test`, quindi prima della pubblicazione.

   Uso:
     node scripts/controlla-rete.cjs
   ========================================================================== */

"use strict";

const fs = require("fs");
const path = require("path");

const radice = path.join(__dirname, "..");

// Ollama, e solo Ollama. La porta è quella predefinita; un percorso dopo
// l'origine va bene (`/api/tags`, `/api/generate`).
const OLLAMA = /^http:\/\/127\.0\.0\.1:11434(?:\/|$)/;

const ESTENSIONI = [".js", ".css", ".json", ".webmanifest", ".html"];

const problemi = [];
const fileLetti = [];
let versoOllama = 0;
let stessaOrigine = 0;
let risorseLocali = 0;
let collegamentiEsterni = 0;

function problema(dove, cosa) {
  problemi.push(dove + " → " + cosa);
}

/* Lettura dei file --------------------------------------------------------- */

function fileRicorsivi(cartella, prefisso, estensioni) {
  const risultati = [];
  for (const voce of fs.readdirSync(cartella, { withFileTypes: true })) {
    const relativo = prefisso ? prefisso + "/" + voce.name : voce.name;
    const pieno = path.join(cartella, voce.name);
    if (voce.isDirectory()) risultati.push(...fileRicorsivi(pieno, relativo, estensioni));
    else if (voce.isFile() && (!estensioni || estensioni.includes(path.extname(voce.name)))) risultati.push(relativo);
  }
  return risultati;
}

const daLeggere = [
  ...fs.readdirSync(radice).filter((f) => f.endsWith(".html")).sort(),
  "sw.js",
  "manifest.webmanifest",
  ...fileRicorsivi(path.join(radice, "assets"), "assets", ESTENSIONI),
].filter((f) => fs.existsSync(path.join(radice, f)));

// I file che l'app può chiedere a sé stessa: le pagine, `sw.js`, il manifest e
// tutto quello che sta in `assets/`, compresi PDF e immagini. Un percorso che
// non è qui dentro non è un file dell'app, nemmeno se esiste nel progetto:
// `scripts/`, `tests/` e `desktop/` non arrivano al browser.
const FILE_APP = new Set(
  [
    ...fs.readdirSync(radice).filter((f) => f.endsWith(".html")),
    "sw.js",
    "manifest.webmanifest",
    ...fileRicorsivi(path.join(radice, "assets"), "assets"),
  ].filter((f) => fs.existsSync(path.join(radice, f)))
);

// Un indirizzo relativo vale solo se porta a uno di quei file. `?` e `#` lo
// rendono subito estraneo: dopo il punto interrogativo viaggiano i dati, e la
// promessa è che non ne esca nessuno. Un percorso assoluto (`/assets/…`) non
// vale perché il programma vive in una sottocartella, non alla radice del sito.
function fileDellApp(destinazione) {
  const testo = String(destinazione || "").trim();
  if (!testo || /[?#]/.test(testo)) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(testo) || /^[\\/]/.test(testo)) return null;
  const normalizzato = path.posix.normalize(testo.replace(/\\/g, "/"));
  if (normalizzato === "." || normalizzato.startsWith("..")) return null;
  return FILE_APP.has(normalizzato) ? normalizzato : null;
}

/* Il sorgente senza commenti ----------------------------------------------- */

// Un `fetch(` dentro un commento non è una chiamata: si tolgono i commenti
// conservando le righe, così i numeri nei messaggi restano quelli veri. Le
// stringhe invece si tengono: gli indirizzi da controllare sono lì dentro.
function senzaCommenti(sorgente) {
  let fuori = "";
  let apice = null;
  for (let i = 0; i < sorgente.length; i++) {
    const c = sorgente[i];
    const d = sorgente[i + 1];
    if (apice) {
      fuori += c;
      if (c === "\\") {
        fuori += sorgente[i + 1] || "";
        i++;
      } else if (c === apice) apice = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      apice = c;
      fuori += c;
      continue;
    }
    if (c === "/" && d === "/") {
      while (i < sorgente.length && sorgente[i] !== "\n") i++;
      fuori += "\n";
      continue;
    }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < sorgente.length && !(sorgente[i] === "*" && sorgente[i + 1] === "/")) {
        if (sorgente[i] === "\n") fuori += "\n";
        i++;
      }
      i++;
      continue;
    }
    fuori += c;
  }
  return fuori;
}

function rigaDi(sorgente, indice) {
  return sorgente.slice(0, indice).split("\n").length;
}

function scorcia(testo) {
  const t = testo.replace(/\s+/g, " ").trim();
  return t.length > 90 ? t.slice(0, 87) + "…" : t;
}

/* Dal sorgente all'indirizzo ------------------------------------------------ */

function primoArgomento(sorgente, aperta) {
  let profondita = 0;
  let testo = "";
  for (let i = aperta; i < sorgente.length; i++) {
    const c = sorgente[i];
    if (c === "(" || c === "[" || c === "{") profondita++;
    else if (c === ")" || c === "]" || c === "}") {
      profondita--;
      if (profondita === 0) break;
    } else if (c === "," && profondita === 1) break;
    if (profondita === 1 && c === "(") continue;
    testo += c;
  }
  return testo.trim();
}

function costante(sorgente, nome) {
  const modello = new RegExp(
    "(?:const|let|var)\\s+" + nome.replace(/[$]/g, "\\$") + "\\s*=\\s*([\"'`])([\\s\\S]*?)\\1"
  );
  const trovata = sorgente.match(modello);
  return trovata ? trovata[2] : null;
}

// `HOST + "/api/tags"` vale `http://127.0.0.1:11434/api/tags`: si sostituisce
// la costante con il suo valore e si tengono i pezzi di testo fra i `+`.
function indirizzo(espressione, sorgente) {
  let resto = espressione.trim();
  let testo = "";
  const inizio = resto.match(/^([A-Za-z_$][\w$]*)\s*(\+|$)/);
  if (inizio) {
    const valore = costante(sorgente, inizio[1]);
    if (valore !== null) {
      testo = valore;
      resto = resto.slice(inizio[0].length);
    }
  }
  for (const pezzo of resto.split("+")) {
    const letterale = pezzo.trim().match(/^(["'`])([\s\S]*)\1$/);
    if (letterale) testo += letterale[2];
    else if (letterale === null) testo += "…";
  }
  return testo;
}

/* Le chiamate nel codice ---------------------------------------------------- */

// Oltre a `fetch`, tutte le porte da cui un programma può parlare con
// l'esterno. Nessuna di queste deve comparire: non c'è un caso d'uso.
const ALTRE_PORTE = [
  [/\bXMLHttpRequest\b/g, "XMLHttpRequest"],
  [/\bWebSocket\b/g, "WebSocket"],
  [/\bEventSource\b/g, "EventSource"],
  [/\bRTCPeerConnection\b/g, "RTCPeerConnection"],
  [/\bsendBeacon\s*\(/g, "sendBeacon"],
  [/\bimportScripts\s*\(/g, "importScripts"],
  [/\bnew\s+Worker\s*\(/g, "new Worker"],
  [/\bimport\s*\(/g, "import() dinamico"],
];

const RICHIESTE = /\bfetch\s*\(/g;

function controllaJs(dove, grezzo) {
  const sorgente = senzaCommenti(grezzo);
  const nomeFile = dove.split(":")[0];

  for (const trovata of sorgente.matchAll(RICHIESTE)) {
    const aperta = trovata.index + trovata[0].length - 1;
    const argomento = primoArgomento(sorgente, aperta);
    const destinazione = indirizzo(argomento, sorgente);
    const riga = dove + ":" + rigaDi(sorgente, trovata.index);

    if (OLLAMA.test(destinazione)) {
      versoOllama++;
      continue;
    }
    // In `sw.js` la richiesta è l'oggetto `request` del browser: è un file
    // dell'app, non un altro sito. Solo `request`: un altro nome potrebbe
    // portarsi dietro una query.
    if (nomeFile === "sw.js" && argomento === "request") {
      stessaOrigine++;
      continue;
    }
    if (!/:\/\//.test(destinazione) && fileDellApp(destinazione)) {
      stessaOrigine++;
      continue;
    }
    problema(
      riga,
      "chiamata di rete verso «" + scorcia(destinazione || argomento) + "»: l'unica eccezione ammessa è Ollama su 127.0.0.1:11434."
    );
  }

  for (const [modello, nome] of ALTRE_PORTE) {
    for (const trovata of sorgente.matchAll(modello)) {
      problema(dove + ":" + rigaDi(sorgente, trovata.index), "«" + nome + "», cioè un canale di rete che l'app non deve avere.");
    }
  }
}

/* Le risorse caricate dalle pagine ------------------------------------------ */

// Gli attributi che fanno scaricare qualcosa a chi apre la pagina. `form`
// c'è perché un modulo può inviare i dati altrove; `a` non c'è perché un
// collegamento si apre solo se la persona lo tocca.
const RISORSE = {
  script: ["src"],
  link: ["href"],
  img: ["src", "srcset"],
  source: ["src", "srcset"],
  iframe: ["src"],
  frame: ["src"],
  embed: ["src"],
  object: ["data"],
  video: ["src", "poster"],
  audio: ["src"],
  track: ["src"],
  input: ["src"],
  form: ["action"],
  use: ["href", "xlink:href"],
};

const REL_RISORSA = /(?:^|\s)(?:stylesheet|icon|shortcut|apple-touch-icon|mask-icon|manifest|preload|modulepreload|prefetch|preconnect|dns-prefetch)(?:\s|$)/i;

function esterna(url) {
  const u = String(url || "").trim();
  if (!u || /^(?:data:|blob:|mailto:|tel:|#|javascript:)/i.test(u)) return false;
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u) || /^https?:/i.test(u);
}

function controllaHtml(dove, pagina) {
  const senzaCommentiHtml = pagina.replace(/<!--[\s\S]*?-->/g, (blocco) => blocco.replace(/[^\n]/g, ""));

  for (const tag of senzaCommentiHtml.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const nome = tag[1].toLowerCase();
    const attributi = {};
    for (const a of tag[2].matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attributi[a[1].toLowerCase()] = a[3] !== undefined ? a[3] : a[4];
    }
    const riga = dove + ":" + rigaDi(senzaCommentiHtml, tag.index);

    if (nome === "a" || nome === "area") {
      if (esterna(attributi.href)) collegamentiEsterni++;
      continue;
    }

    const cercati = RISORSE[nome];
    if (!cercati) continue;
    // Un `<link rel="canonical">` descrive la pagina, non la carica: non è
    // una risorsa. Sono risorse solo i `rel` che il browser deve scaricare.
    if (nome === "link" && attributi.rel && !REL_RISORSA.test(attributi.rel)) continue;

    for (const attributo of cercati) {
      if (!(attributo in attributi)) continue;
      const valori = attributo.endsWith("srcset")
        ? attributi[attributo].split(",").map((v) => v.trim().split(/\s+/)[0])
        : [attributi[attributo]];
      for (const valore of valori) {
        if (!valore) continue;
        if (esterna(valore)) {
          problema(riga, "<" + nome + " " + attributo + "> carica da un altro sito: «" + scorcia(valore) + "». Le risorse esterne non sono ammesse.");
        } else {
          risorseLocali++;
        }
      }
    }
  }

  // Il codice dentro <script> può chiamare la rete come un file a sé: si
  // controlla con le stesse regole, alla riga della pagina.
  for (const blocco of senzaCommentiHtml.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (!blocco[1].trim()) continue;
    const riga = dove + ":" + rigaDi(senzaCommentiHtml, blocco.index);
    controllaJs(riga + ":script", blocco[1]);
  }

  // Stili nella pagina e nei fogli: `url(https://…)` e `@import` esterno.
  controllaCss(dove + ":stile", senzaCommentiHtml);
}

/* Gli stili ----------------------------------------------------------------- */

function controllaCss(dove, testo) {
  const pulito = testo.replace(/\/\*[\s\S]*?\*\//g, (blocco) => blocco.replace(/[^\n]/g, ""));
  const modelli = [
    [/url\(\s*["']?((?:https?:)?\/\/[^)"'\s]+)/gi, "url()"],
    [/@import\s+(?:url\(\s*)?["']?((?:https?:)?\/\/[^)"'\s]+)/gi, "@import"],
  ];
  for (const [modello, nome] of modelli) {
    for (const trovata of pulito.matchAll(modello)) {
      problema(
        dove + ":" + rigaDi(pulito, trovata.index),
        nome + " carica da un altro sito: «" + scorcia(trovata[1]) + "». Le risorse esterne non sono ammesse."
      );
    }
  }
}

/* Gli indirizzi assegnati dal codice ---------------------------------------- */

// `img.src = "https://…"` non passa da nessun tag HTML: si guarda anche questo.
function controllaRisorseNelCodice(dove, grezzo) {
  const sorgente = senzaCommenti(grezzo);
  const modelli = [
    [/\.(?:src|srcset|poster)\s*=\s*(["'`])((?:https?:)?\/\/[^"'`\s]+)/g, "assegnazione a .src"],
    [/setAttribute\s*\(\s*(["'])(?:src|srcset|poster)\1\s*,\s*(["'`])((?:https?:)?\/\/[^"'`\s]+)/g, "setAttribute"],
  ];
  for (const [modello, nome] of modelli) {
    for (const trovata of sorgente.matchAll(modello)) {
      const url = trovata[trovata.length - 1];
      problema(
        dove + ":" + rigaDi(sorgente, trovata.index),
        nome + " verso un altro sito: «" + scorcia(url) + "». Le risorse esterne non sono ammesse."
      );
    }
  }
}

/* Il giro ------------------------------------------------------------------- */

for (const relativo of daLeggere) {
  const pieno = path.join(radice, relativo);
  const testo = fs.readFileSync(pieno, "utf8");
  fileLetti.push(relativo);

  if (relativo.endsWith(".html")) {
    controllaHtml(relativo, testo);
  } else if (relativo.endsWith(".js")) {
    controllaJs(relativo, testo);
    controllaRisorseNelCodice(relativo, testo);
  } else if (relativo.endsWith(".css")) {
    controllaCss(relativo, testo);
  } else if (relativo.endsWith(".json") || relativo.endsWith(".webmanifest")) {
    // I dati possono contenere indirizzi da mostrare (i numeri utili, i
    // riferimenti): sono testi da leggere, non risorse da caricare. Si
    // controlla solo che non ci sia un `http://` in chiaro, che tradirebbe
    // un indirizzo digitato senza accorgersene.
    for (const trovata of testo.matchAll(/http:\/\/(?!127\.0\.0\.1:11434)[^"'\s\\]+/g)) {
      problema(relativo + ":" + rigaDi(testo, trovata.index), "indirizzo non cifrato «" + scorcia(trovata[0]) + "»: fuori da Ollama in locale usa https://.");
    }
  }
}

if (!fileLetti.length) {
  console.error("\nControllo della rete\n  ✗ nessun file da leggere: la cartella non è quella del progetto.");
  process.exit(1);
}

if (!versoOllama) {
  // Se un giorno Ollama sparisce dal codice, o cambia porta, questo controllo
  // non deve dire «verde» senza aver visto l'unica eccezione che ammette.
  problema("assets/js/app-installa.js", "nessuna chiamata a Ollama riconosciuta: se l'indirizzo è cambiato, aggiorna l'eccezione in questo controllo.");
}

console.log("\nControllo della rete");
if (problemi.length) {
  [...new Set(problemi)].forEach((p) => console.error("  ✗ " + p));
  console.error("\n" + new Set(problemi).size + " punti da sistemare.");
  process.exit(1);
}
function plurale(quanti, singolare, plurale) {
  return quanti + " " + (quanti === 1 ? singolare : plurale);
}

console.log(
  "  ✓ " + fileLetti.length + " file letti: " + plurale(versoOllama, "chiamata a Ollama", "chiamate a Ollama") +
    " (127.0.0.1:11434), " + plurale(stessaOrigine, "richiesta alla stessa origine", "richieste alla stessa origine") +
    ", " + plurale(risorseLocali, "risorsa locale", "risorse locali") + ", " +
    plurale(collegamentiEsterni, "collegamento esterno", "collegamenti esterni") +
    " (solo navigazione). Nessun altro invio, nessun WebSocket, nessuna risorsa esterna."
);
