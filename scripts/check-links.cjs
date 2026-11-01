#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo dei link di download
   Licenza del codice: MIT · Danilo D'Auria

   Apre ogni indirizzo della release e verifica che risponda, che il file ci
   sia e che l'impronta dichiarata in SHA256SUMS.txt coincida con quella che
   GitHub ha calcolato al caricamento. Un link rotto non deve scoprirlo la
   persona che stava scaricando.

   Uso:
     node scripts/check-links.cjs              # ultima release
     node scripts/check-links.cjs psd-v1.3.12  # un tag preciso

   Variabili: GITHUB_REPOSITORY, GITHUB_TOKEN (facoltativo, alza il limite di
   richieste), REPORT (dove scrivere il riepilogo dei problemi).
   ========================================================================== */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const REPO = process.env.GITHUB_REPOSITORY || "danilodauria/psicologo-digitale";
const TAG = process.argv[2] || process.env.TAG || "";
const TOKEN = process.env.GITHUB_TOKEN || "";
const REPORT = process.env.REPORT || path.join(os.tmpdir(), "link-report.md");
const AGENTE = "psicologo-digitale-link-check";

// Tutto quello che una release deve contenere per essere scaricabile e
// aggiornabile: sei pacchetti, il backup dei sorgenti, le impronte e i tre
// file che l'aggiornamento automatico legge.
const ATTESI = [
  "Psicologo-Digitale-Windows-x64.exe",
  "Psicologo-Digitale-Windows-portatile.zip",
  "Psicologo-Digitale-Linux-amd64.deb",
  "Psicologo-Digitale-Linux-x86_64.AppImage",
  "Psicologo-Digitale-Mac-arm64.dmg",
  "Psicologo-Digitale-Mac-x64.dmg",
  "Psicologo-Digitale-Sorgenti.zip",
  "SHA256SUMS.txt",
  "latest.yml",
  "latest-mac.yml",
  "latest-linux.yml"
];

function intestazioni() {
  const h = { Accept: "application/vnd.github+json", "User-Agent": AGENTE };
  if (TOKEN) h.Authorization = "Bearer " + TOKEN;
  return h;
}

async function trovaRelease() {
  const url = TAG
    ? "https://api.github.com/repos/" + REPO + "/releases/tags/" + TAG
    : "https://api.github.com/repos/" + REPO + "/releases/latest";
  const r = await fetch(url, { headers: intestazioni() });
  // Nessuna release ancora pubblicata non è un guasto: succede al primo avvio.
  if (r.status === 404) return null;
  if (!r.ok) {
    // 403 e 429 senza token sono il limite di richieste anonime, non un
    // guasto del repository: dirlo aiuta chi lancia lo script a mano.
    if ((r.status === 403 || r.status === 429) && !TOKEN) {
      throw new Error(
        "GitHub ha limitato le richieste anonime (" + r.status + "): rilancia con GITHUB_TOKEN impostato, " +
          "oppure guarda l'esito del workflow «Link di download», che in CI lo esegue con il suo token."
      );
    }
    throw new Error("l'API di GitHub ha risposto " + r.status + " per " + url);
  }
  return r.json();
}

const attesa = (ms) => new Promise((risolvi) => setTimeout(risolvi, ms));

// Il CDN di GitHub ogni tanto restituisce 404 su un allegato appena
// ri-caricato: tre tentativi distinguono il disguido dal guasto vero.
async function raggiungibile(url, tentativi = 3) {
  let stato = 0;
  let errore = "";
  for (let i = 1; i <= tentativi; i++) {
    try {
      const r = await fetch(url, {
        redirect: "follow",
        headers: { "User-Agent": AGENTE }
      });
      stato = r.status;
      // Il contenuto non serve: si chiude subito il corpo della risposta.
      if (r.body) { try { await r.body.cancel(); } catch (e) {} }
      if (stato >= 200 && stato < 300) return { ok: true, stato: stato };
    } catch (e) {
      errore = e.message;
    }
    if (i < tentativi) await attesa(5000);
  }
  return { ok: false, stato: stato, errore: errore };
}

(async function main() {
  let rel;
  try {
    rel = await trovaRelease();
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }

  if (!rel) {
    console.log("Nessuna release pubblicata" + (TAG ? " per " + TAG : "") + ": niente da controllare.");
    return;
  }

  console.log("Release " + rel.tag_name + " · " + rel.assets.length + " allegati");
  const perNome = new Map(rel.assets.map((a) => [a.name, a]));
  const problemi = [];

  for (const nome of ATTESI) {
    if (!perNome.has(nome)) {
      problemi.push([nome, "manca nella release"]);
      continue;
    }
    const a = perNome.get(nome);
    const esito = await raggiungibile(a.browser_download_url);
    if (esito.ok) console.log("✓ " + nome + " (HTTP " + esito.stato + ")");
    else {
      problemi.push([
        nome,
        "HTTP " + (esito.stato || "errore") +
          (esito.errore ? " · " + esito.errore : "") +
          " · " + a.browser_download_url
      ]);
    }
  }

  // Le impronte: il digest lo calcola GitHub al caricamento, quindi si può
  // confrontare senza riscaricare centinaia di megabyte.
  const sha = perNome.get("SHA256SUMS.txt");
  if (sha) {
    const r = await fetch(sha.browser_download_url, { redirect: "follow", headers: { "User-Agent": AGENTE } });
    if (!r.ok) {
      problemi.push(["SHA256SUMS.txt", "non scaricabile (HTTP " + r.status + ")"]);
    } else {
      const testo = await r.text();
      const indicati = new Map();
      for (const riga of testo.split("\n")) {
        const m = riga.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
        if (m) indicati.set(m[2].trim(), m[1].toLowerCase());
      }
      for (const [nome, hash] of indicati) {
        const a = perNome.get(nome);
        if (!a) {
          problemi.push([nome, "elencato in SHA256SUMS.txt ma non presente nella release"]);
          continue;
        }
        const digest = String(a.digest || "").replace(/^sha256:/, "").toLowerCase();
        if (!digest) problemi.push([nome, "GitHub non dichiara un digest per questo file"]);
        else if (digest !== hash) problemi.push([nome, "impronta diversa da quella pubblicata"]);
        else console.log("  impronta ok: " + nome);
      }
      for (const nome of ATTESI) {
        if (nome === "SHA256SUMS.txt" || nome.startsWith("latest")) continue;
        if (!indicati.has(nome)) problemi.push([nome, "non compare in SHA256SUMS.txt"]);
      }
    }
  }

  if (!problemi.length) {
    console.log("Tutti i " + ATTESI.length + " link rispondono e le impronte combaciano.");
    try { fs.rmSync(REPORT, { force: true }); } catch (e) {}
    return;
  }

  const tabella = problemi
    .map(([nome, p]) => "| `" + nome + "` | " + String(p).replace(/\|/g, "\\|") + " |")
    .join("\n");
  const corpo = [
    "# Link di download non raggiungibili",
    "",
    "Controllo del " + new Date().toISOString().slice(0, 16).replace("T", " ") +
      " UTC sulla release **" + rel.tag_name + "**.",
    "",
    "| File | Problema |",
    "|---|---|",
    tabella,
    "",
    "Il controllo gira ogni giorno e dopo ogni pubblicazione. Quando i link tornano a posto, la segnalazione si chiude da sola alla verifica successiva.",
    ""
  ].join("\n");

  fs.writeFileSync(REPORT, corpo);
  console.error(corpo);
  process.exit(1);
})();
