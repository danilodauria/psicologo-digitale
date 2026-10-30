#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · esporta i dati per il Vademecum
   Licenza: MIT · Danilo D'Auria
   --------------------------------------------------------------------------
   Legge i moduli dati dell'app in un contesto isolato e scrive un JSON con
   tutto ciò che serve al generatore PDF. Nessuna dipendenza esterna.
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");

const files = [
  "assets/js/data-scales.js",
  "assets/js/data-intake.js",
  "assets/js/data-course.js",
  "assets/js/data-manual.js",
  "assets/js/data-manual2.js",
  "assets/js/data-extra.js",
  "assets/js/data-nutrizione.js",
  "assets/js/data-ai.js"
];

const sandbox = { console: console };
sandbox.window = sandbox;
vm.createContext(sandbox);

files.forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), sandbox, { filename: f });
});

const d = sandbox.NP.data;
const pkg = require(path.join(root, "package.json"));

const dati = {
  versione: pkg.version,
  autore: "Danilo D'Auria",
  url: "https://danilodauria.github.io/psicologo-digitale/",
  repo: "https://github.com/danilodauria/psicologo-digitale",
  counts: {
    scale: d.scales.length,
    domande: d.intake.length,
    fasi: d.fasi.length,
    moduli: d.percorso.moduli.length,
    esercizi: d.percorso.esercizi.length,
    sedute: d.percorso.sedute.length,
    capitoli: d.manuale.length,
    glossario: d.glossario.length
  },
  fasi: d.fasi.map((f) => ({ id: f.id, titolo: f.titolo || f.label || f.nome || f.id })),
  scales: d.scales.map((s) => ({
    id: s.id,
    titolo: s.titolo,
    perche: s.perche,
    item: s.items.length,
    max: s.punteggio.tipo === "scala100" ? 100 : s.punteggio.max,
    tipo: s.punteggio.tipo || "somma"
  })),
  moduli: d.percorso.moduli.map((m) => ({ n: m.n, titolo: m.titolo, obiettivo: m.obiettivo })),
  esercizi: d.percorso.esercizi.map((e) => ({ titolo: e.titolo, durata: e.durata, quando: e.quando })),
  manuale: d.manuale.map((c) => ({ n: c.n, titolo: c.titolo, sommario: c.sommario })),
  sicurezza: {
    introduzione: d.sicurezza.introduzione,
    numeri: d.sicurezza.numeri.map((n) => ({ numero: n.numero, nome: n.nome, nota: n.nota })),
    segnali: d.sicurezza.segnali,
    cosaFare: d.sicurezza.cosaFare
  },
  nutrizione: {
    introduzione: d.nutrizione.introduzione,
    principi: d.nutrizione.principi,
    segnali: d.nutrizione.segnali,
    segnaliNota: d.nutrizione.segnaliNota,
    professionisti: d.nutrizione.professionisti.map((p) => ({ ruolo: p.ruolo, chi: p.chi, quando: p.quando })),
    domande: d.nutrizione.domande
  },
  ai: {
    build: Object.keys(d.ai.build).map((k) => ({ sistema: k, nome: d.ai.build[k].sistema })),
    modelli: d.ai.modelli.map((m) => ({ id: m.id, peso: m.peso, ramMin: m.ramMin })),
    passi: d.ai.passi
  },
  fonti: d.fonti.map((f) => ({ t: f.t, u: f.u }))
};

/* Dati per la guida del clinico: struttura degli strumenti, item e fasce. */
dati.clinico = {
  scales: d.scales.map((s) => ({
    id: s.id,
    sigla: s.sigla,
    titolo: s.titolo,
    area: s.area,
    tempo: s.tempo,
    istruzioni: s.istruzioni,
    perche: s.perche,
    opzioni: s.opzioni,
    item: s.items.length,
    tipo: s.punteggio.tipo || "somma",
    min: s.punteggio.min,
    max: s.punteggio.max,
    bande: s.punteggio.bande.map((b) => ({
      fino: b.fino,
      livello: b.livello,
      label: b.label,
      testo: b.testo
    })),
    inversi: s.items.filter((i) => i.inverso).length,
    itemRischio: s.items.filter((i) => i.rischio).map((i) => i.k),
    notaClinica: s.notaClinica,
    cosaPortare: s.cosaPortare,
    riferimenti: s.riferimenti
  }))
};

const outDir = path.join(root, "assets", "data");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "vademecum.json");
fs.writeFileSync(outFile, JSON.stringify(dati, null, 2), "utf8");

console.log(
  "Dati esportati: " + dati.scales.length + " questionari, " + dati.fasi.length + " fasi, " +
  dati.moduli.length + " tappe, " + dati.esercizi.length + " esercizi, " + dati.manuale.length + " capitoli."
);
console.log("Scritto " + path.relative(root, outFile));
