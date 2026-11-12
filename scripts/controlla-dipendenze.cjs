#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · controllo delle dipendenze
   Licenza del codice: MIT · Danilo D'Auria

   Confronta i due pacchetti del progetto (sito e desktop) con il registro
   npm e riporta due cose:

   - gli aggiornamenti disponibili (`npm outdated`);
   - le vulnerabilità note che riguardano le versioni in uso (`npm audit`).

   Non installa nulla: legge package.json e package-lock.json, quindi si può
   eseguire anche su una macchina appena clonata.

   Codici di uscita, perché il workflow settimanale deve sapere che fare:
     0  tutto in ordine
     1  solo aggiornamenti disponibili
     2  vulnerabilità note
     3  il registro non ha risposto (non è «tutto bene», è «non lo so»)

   Uso: node scripts/controlla-dipendenze.cjs [--report file.md]
   ========================================================================== */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const RADICE = path.join(__dirname, "..");

const PACCHETTI = [
  { nome: "sito e test", cartella: RADICE },
  { nome: "desktop", cartella: path.join(RADICE, "desktop") },
];

const SEVERITA = ["critical", "high", "moderate", "low", "info"];

function eseguiNpm(argomenti, cartella) {
  try {
    const testo = execFileSync("npm", argomenti, {
      cwd: cartella,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 32 * 1024 * 1024,
    });
    return { codice: 0, testo };
  } catch (errore) {
    return { codice: typeof errore.status === "number" ? errore.status : 1, testo: errore.stdout || "" };
  }
}

function leggiJson(testo) {
  const pulito = (testo || "").trim();
  if (!pulito) return null;
  try {
    return JSON.parse(pulito);
  } catch {
    return null;
  }
}

/* Le versioni nel rapporto si riducono a «quella in uso → quella ultima»:
   il resto (range, tipo di bump) lo decide Dependabot, non serve qui. */
function rigaAggiornamento(nome, dati, bloccate) {
  const attuale = dati.current || bloccate[nome] || "—";
  const ultima = dati.latest || "—";
  const richiesta = dati.wanted && dati.wanted !== attuale ? " (richiesta " + dati.wanted + ")" : "";
  return "| " + nome + " | " + attuale + " | " + ultima + richiesta + " |";
}

/* Senza node_modules `npm outdated` non conosce la versione installata: la si
   prende dal lockfile, che è l'unica cosa che c'è davvero nel repository. */
const blocchi = new Map();
function versioniBloccate(cartella) {
  if (blocchi.has(cartella)) return blocchi.get(cartella);
  const versioni = {};
  try {
    const lock = JSON.parse(fs.readFileSync(path.join(cartella, "package-lock.json"), "utf8"));
    for (const [percorso, voce] of Object.entries(lock.packages || {})) {
      if (!voce || !voce.version) continue;
      const nome = percorso.replace(/^.*node_modules\//, "");
      if (nome && !versioni[nome]) versioni[nome] = voce.version;
    }
  } catch {
    /* senza lockfile si resta con quello che dice npm */
  }
  blocchi.set(cartella, versioni);
  return versioni;
}

function main() {
  const argomenti = process.argv.slice(2);
  const indiceReport = argomenti.indexOf("--report");
  const percorsoReport = indiceReport >= 0 ? argomenti[indiceReport + 1] : null;

  const righe = [];
  let aggiornamenti = 0;
  let vulnerabilita = 0;
  let registroMuto = false;
  const perSeverita = { critical: [], high: [], moderate: [], low: [], info: [] };

  for (const pacchetto of PACCHETTI) {
    const vecchi = eseguiNpm(["outdated", "--json"], pacchetto.cartella);
    const elenco = leggiJson(vecchi.testo) || {};
    const nomi = Object.keys(elenco)
      .sort()
      .filter((nome) => {
        const voce = elenco[nome];
        const attuale = voce.current || versioniBloccate(pacchetto.cartella)[nome];
        return Boolean(voce.latest) && voce.latest !== attuale;
      });
    aggiornamenti += nomi.length;
    const bloccate = versioniBloccate(pacchetto.cartella);

    righe.push("### " + pacchetto.nome);
    righe.push("");
    if (nomi.length === 0) {
      righe.push("Nessun aggiornamento disponibile.");
    } else {
      righe.push("| Pacchetto | In uso | Ultima |");
      righe.push("|---|---|---|");
      for (const nome of nomi) righe.push(rigaAggiornamento(nome, elenco[nome], bloccate));
    }
    righe.push("");

    const audit = eseguiNpm(["audit", "--json"], pacchetto.cartella);
    const risultato = leggiJson(audit.testo);
    const riepilogo = risultato && risultato.metadata && risultato.metadata.vulnerabilities;
    if (!riepilogo) {
      registroMuto = true;
      righe.push("Il registro non ha risposto alla richiesta di controllo: da rifare a mano.");
      righe.push("");
      continue;
    }

    const totale = SEVERITA.reduce((somma, grado) => somma + (riepilogo[grado] || 0), 0);
    vulnerabilita += totale;
    righe.push(totale === 0 ? "Nessuna vulnerabilità nota." : "Vulnerabilità note: " + totale + ".");
    righe.push("");

    const dettagli = risultato.vulnerabilities || {};
    for (const nome of Object.keys(dettagli).sort()) {
      const voce = dettagli[nome];
      const grado = SEVERITA.includes(voce.severity) ? voce.severity : "info";
      let attraverso = "";
      if (Array.isArray(voce.via)) {
        const diretti = voce.via.filter((v) => typeof v === "object" && v.title).map((v) => v.title);
        if (diretti.length > 0) attraverso = " · " + diretti[0];
      }
      const riferimento = voce.fixAvailable
        ? " · correzione disponibile"
        : " · nessuna correzione automatica";
      perSeverita[grado].push("- **" + nome + "** (" + grado + ")" + attraverso + riferimento);
    }
  }

  if (vulnerabilita > 0) {
    righe.push("### Vulnerabilità in dettaglio");
    righe.push("");
    for (const grado of SEVERITA) {
      if (perSeverita[grado].length === 0) continue;
      righe.push("**" + grado + "**");
      righe.push("");
      righe.push(...perSeverita[grado]);
      righe.push("");
    }
  }

  const intestazione = [
    "# Dipendenze: controllo settimanale",
    "",
    "Generato da `scripts/controlla-dipendenze.cjs` il " + new Date().toISOString().slice(0, 10) + ".",
    "",
    aggiornamenti === 0 ? "Aggiornamenti disponibili: nessuno." : "Aggiornamenti disponibili: " + aggiornamenti + ".",
    vulnerabilita === 0 ? "Vulnerabilità note: nessuna." : "Vulnerabilità note: " + vulnerabilita + ".",
    "",
  ];

  const rapporto = intestazione.concat(righe).join("\n");

  if (percorsoReport) {
    fs.writeFileSync(percorsoReport, rapporto + "\n", "utf8");
  } else {
    console.log(rapporto);
  }

  if (registroMuto) return 3;
  if (vulnerabilita > 0) return 2;
  if (aggiornamenti > 0) return 1;
  return 0;
}

process.exit(main());
