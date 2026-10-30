#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · verifica dati, collegamenti e motore di Neura
   Licenza: MIT · Danilo D'Auria
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
let checks = 0;
let fails = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) { fails++; console.error("  ✗ " + msg); }
}
function read(p) { return fs.readFileSync(path.join(root, p), "utf8"); }
function exists(p) { return fs.existsSync(path.join(root, p)); }

console.log("Psicologo Digitale · verifica contenuti\n");

/* Caricamento dei dati in un contesto isolato ------------------------------ */

const sandbox = { console: console };
sandbox.window = sandbox;
vm.createContext(sandbox);

const dataFiles = [
  "assets/js/data-scales.js",
  "assets/js/data-intake.js",
  "assets/js/data-course.js",
  "assets/js/data-manual.js",
  "assets/js/data-manual2.js",
  "assets/js/data-extra.js",
  "assets/js/data-quiz.js",
  "assets/js/data-nutrizione.js",
  "assets/js/data-ai.js",
  "assets/js/neura.js"
];

dataFiles.forEach((f) => {
  vm.runInContext(read(f), sandbox, { filename: f });
});

const NP = sandbox.NP;
ok(!!NP && !!NP.data, "lo spazio NP.data è definito");
ok(!!NP.neura && typeof NP.neura.answer === "function", "il motore di Neura espone answer()");

/* File e collegamenti ------------------------------------------------------ */

const html = read("index.html");
ok(/<meta name="author" content="Danilo D'Auria">/.test(html), "index.html attribuisce l'autore");
ok(/Psicologo Digitale/.test(html), "index.html contiene il titolo del progetto");

const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
ok(srcs.length >= 12, "index.html carica tutti i moduli JS (" + srcs.length + ")");
srcs.forEach((s) => ok(exists(s), "esiste lo script " + s));

const cssHref = (html.match(/<link rel="stylesheet" href="([^"]+)"/) || [])[1];
ok(cssHref && exists(cssHref), "esiste il foglio di stile " + cssHref);

const sw = read("sw.js");
const swAssets = [...sw.matchAll(/"([^"]+\.(?:js|css|png|svg|webmanifest|html))"/g)].map((m) => m[1]);
swAssets.forEach((a) => ok(exists(a), "il service worker elenca un file esistente: " + a));
srcs.forEach((s) => ok(sw.includes('"' + s + '"'), "il service worker include " + s));
ok(/VERSION/.test(sw), "il service worker ha una versione della cache");

const manifest = JSON.parse(read("manifest.webmanifest"));
ok(manifest.icons.every((i) => exists(i.src)), "le icone del manifest esistono");
ok(manifest.name.includes("Psicologo"), "il manifest ha il nome dell'app");

ok(exists(".nojekyll"), "esiste .nojekyll per GitHub Pages");
ok(!/<script[^>]+src="https?:/.test(html), "nessuno script remoto nell'HTML");
ok(!/url\(\s*['"]?https?:/.test(read("assets/css/styles.css")), "nessuna risorsa remota nel CSS");
ok(/@media print/.test(read("assets/css/styles.css")), "esistono gli stili di stampa");
ok(/https:\/\/creativecommons\.org\/licenses\/by-nc-sa\/4\.0/.test(read("LICENSE-CONTENT.md")), "la licenza dei contenuti cita CC BY-NC-SA 4.0");
ok(/Danilo D'Auria/.test(read("LICENSE")) && /Danilo D'Auria/.test(read("LICENSE-CONTENT.md")), "le licenze attribuiscono l'opera all'autore");

/* Questionari -------------------------------------------------------------- */

const scales = NP.data.scales;
ok(Array.isArray(scales) && scales.length === 6, "ci sono sei questionari");
const scaleIds = new Set();
scales.forEach((s) => {
  ok(!scaleIds.has(s.id), "id questionario unico: " + s.id);
  scaleIds.add(s.id);
  ok(s.titolo && s.istruzioni && s.perche, "il questionario " + s.id + " ha titolo, istruzioni e finalità");
  ok(s.items.length >= 5 && s.items.length <= 12, "il questionario " + s.id + " ha un numero plausibile di item");
  ok(s.opzioni.length >= 4, "il questionario " + s.id + " ha almeno quattro opzioni");
  s.items.forEach((it, i) => ok(it.t && it.k, "l'item " + (i + 1) + " di " + s.id + " è completo"));
  let prev = -1;
  s.punteggio.bande.forEach((b) => {
    ok(b.fino > prev, "le fasce di " + s.id + " sono crescenti");
    prev = b.fino;
    ok(b.label && b.testo && b.livello >= 1 && b.livello <= 5, "la fascia «" + b.label + "» di " + s.id + " è completa");
  });
  ok(s.punteggio.bande[s.punteggio.bande.length - 1].fino === s.punteggio.max || s.punteggio.tipo === "scala100",
    "l'ultima fascia di " + s.id + " copre il punteggio massimo");
  ok(Array.isArray(s.cosaPortare) && s.cosaPortare.length >= 3, "il questionario " + s.id + " indica cosa portare al clinico");
  ok(Array.isArray(s.riferimenti) && s.riferimenti.length >= 2, "il questionario " + s.id + " cita riferimenti");
  ok(s.notaClinica, "il questionario " + s.id + " ha una nota clinica");
});

const umore = scales.filter((s) => s.id === "umore")[0];
const riskItem = umore.items.filter((i) => i.rischio)[0];
ok(/morto|farti del male/.test(riskItem.t), "l'item di rischio dell'umore riguarda i pensieri di morte");
const benessere = scales.filter((s) => s.id === "benessere")[0];
ok(benessere.punteggio.tipo === "scala100", "il benessere è riportato su scala 0-100");

/* Colloquio --------------------------------------------------------------- */

const intake = NP.data.intake;
ok(Array.isArray(intake) && intake.length >= 30, "il colloquio ha almeno trenta domande (" + intake.length + ")");
const qIds = new Set();
const tipi = ["consenso", "testo", "scelta", "multipla", "scala", "info", "allerta", "fine"];
intake.forEach((q) => {
  ok(!qIds.has(q.id), "id domanda unico: " + q.id);
  qIds.add(q.id);
  ok(tipi.indexOf(q.tipo) >= 0, "tipo valido per " + q.id);
  ok(q.titolo && q.fase, "la domanda " + q.id + " ha titolo e fase");
  if (q.tipo === "scelta" || q.tipo === "multipla") {
    ok(Array.isArray(q.opzioni) && q.opzioni.length >= 2, "la domanda " + q.id + " ha almeno due opzioni");
    q.opzioni.forEach((o) => ok(o.v && o.label, "opzione completa in " + q.id));
  }
  if (q.tipo === "multipla") ok(q.max == null || q.max >= 1, "limite di scelta valido in " + q.id);
  if (q.tipo === "scala") {
    ok(typeof q.min === "number" && typeof q.max === "number" && q.max > q.min, "intervallo valido in " + q.id);
    ok(Array.isArray(q.etichette) && q.etichette.length === 2, "etichette agli estremi in " + q.id);
  }
  if (q.tipo === "testo") ok(typeof q.placeholder === "string", "placeholder presente in " + q.id);
  if (q.if != null) ok(typeof q.if === "function", "condizione valida in " + q.id);
});

const fasi = NP.data.fasi.map((f) => f.id);
ok(fasi.length === 8, "le fasi del colloquio sono otto");
intake.forEach((q) => ok(fasi.indexOf(q.fase) >= 0, "la domanda " + q.id + " appartiene a una fase esistente"));

const consenso = intake.filter((q) => q.tipo === "consenso")[0];
ok(consenso && consenso.testoConsenso && /non sostituisce/.test(consenso.testoConsenso), "il consenso dichiara i limiti del programma");

const sicurezza = intake.filter((q) => q.fase === "sicurezza").map((q) => q.id);
ok(sicurezza.indexOf("sic_pensieri") >= 0, "il colloquio chiede direttamente dei pensieri di morte");
ok(sicurezza.indexOf("sic_violenza") >= 0, "il colloquio chiede di violenza e minacce");
ok(intake.some((q) => q.tipo === "allerta"), "esiste un blocco di allerta con i numeri utili");

/* Percorso ---------------------------------------------------------------- */

const P = NP.data.percorso;
ok(P.moduli.length === 8, "il percorso ha otto tappe");
ok(P.sedute.length === 7, "ci sono sette protocolli di seduta");
ok(P.esercizi.length >= 10, "ci sono almeno dieci esercizi (" + P.esercizi.length + ")");
P.moduli.forEach((m) => {
  ok(m.titolo && m.obiettivo && m.pratica && m.indicatore, "la tappa " + m.n + " è completa");
  ok(m.esercizi.every((id) => P.esercizi.some((e) => e.id === id)), "la tappa " + m.n + " collega esercizi esistenti");
});
P.sedute.forEach((s) => {
  ok(s.agenda.length >= 4, "la seduta " + s.n + " ha un'agenda articolata");
  const mins = s.agenda.map((a) => parseInt(a.min, 10)).filter((n) => !isNaN(n));
  ok(mins.length >= 2, "la seduta " + s.n + " indica i minuti");
  ok(/minuti/.test(s.durata), "la seduta " + s.n + " indica la durata");
});
P.esercizi.forEach((e) => {
  ok(e.passo.length >= 4, "l'esercizio " + e.id + " ha almeno quattro passi");
  ok(e.durata && e.scopo && e.quando && e.nota, "l'esercizio " + e.id + " è completo");
});

/* Manuale, glossario, quiz ------------------------------------------------ */

const manuale = NP.data.manuale;
ok(manuale.length === 12, "il manuale ha dodici capitoli");
manuale.forEach((c) => {
  ok(c.sezioni.length >= 3, "il capitolo " + c.n + " ha almeno tre sezioni");
  ok(c.neura && c.neura.sintesi.length >= 2, "il capitolo " + c.n + " ha una sintesi per Neura");
  ok(c.neura.passi.length >= 3, "il capitolo " + c.n + " ha passi pratici");
  ok(c.esercizio && c.quando, "il capitolo " + c.n + " ha esercizio e avviso");
  ok(c.keywords.length >= 3, "il capitolo " + c.n + " ha parole chiave per la ricerca");
  ok(c.fonti.length >= 2, "il capitolo " + c.n + " cita fonti");
});
ok(manuale.map((c) => c.id).filter((v, i, a) => a.indexOf(v) === i).length === 12, "gli id dei capitoli sono unici");

ok(NP.data.glossario.length >= 40, "il glossario ha almeno quaranta voci");
ok(NP.data.glossario.every((g) => g.t && g.d && g.cat), "tutte le voci del glossario sono complete");

const quiz = NP.data.quiz;
ok(quiz.domande.length >= 30, "la Palestra ha almeno trenta domande");
const catIds = quiz.categorie.map((c) => c.id);
quiz.domande.forEach((q) => {
  ok(q.o.length === 4, "la domanda " + q.id + " ha quattro opzioni");
  ok(q.r >= 0 && q.r < q.o.length, "la risposta corretta di " + q.id + " è valida");
  ok(catIds.indexOf(q.cat) >= 0, "la categoria di " + q.id + " esiste");
  ok(["base", "intermedio", "avanzato"].indexOf(q.liv) >= 0, "il livello di " + q.id + " è valido");
  ok(q.sp && q.sp.length > 40, "la spiegazione di " + q.id + " è significativa");
});
catIds.forEach((c) => ok(quiz.domande.some((q) => q.cat === c), "la categoria " + c + " ha domande"));

/* Sicurezza e fonti ------------------------------------------------------- */

ok(NP.data.sicurezza.numeri.length >= 5, "la pagina sicurezza elenca almeno cinque numeri");
ok(NP.data.sicurezza.numeri.some((n) => n.numero === "112"), "è presente il 112");
ok(NP.data.sicurezza.numeri.some((n) => n.numero === "1522"), "è presente il 1522");
ok(NP.data.sicurezza.numeri.some((n) => n.numero === "19696"), "è presente Telefono Azzurro");
ok(NP.data.sicurezza.segnali.length >= 6, "sono elencati i segnali d'allarme");
ok(NP.data.sicurezza.cosaFare.length >= 5, "sono indicate le azioni immediate");
ok(NP.data.fonti.length >= 6, "la pagina fonti cita almeno sei riferimenti");

/* Motore di Neura --------------------------------------------------------- */

function ask(q) { return NP.neura.answer(q); }

const ansia = ask("che cos'è l'ansia?");
ok(ansia.html && /ansia/i.test(ansia.html), "Neura risponde sull'ansia");
ok(Array.isArray(ansia.suggest) && ansia.suggest.length >= 2, "Neura propone domande successive");

const sonno = ask("come posso dormire meglio?");
ok(/sonno|dormire|insonnia/i.test(sonno.html), "Neura risponde sul sonno");

const inizio = ask("come inizio?");
ok(/colloquio/i.test(inizio.html), "Neura spiega da dove iniziare");

const terapia = ask("differenza tra psicologo e psichiatra");
ok(/psichiatra/i.test(terapia.html), "Neura distingue le professioni");

const rischio = ask("voglio morire");
ok(rischio.urgent === true, "Neura attiva l'urgenza sui pensieri di morte");
ok(/112/.test(rischio.html), "la risposta urgente indica il 112");

const violenza = ask("mi picchia mio marito");
ok(violenza.urgent === true && /1522/.test(violenza.html), "Neura attiva l'urgenza sulla violenza e indica il 1522");

const fuori = ask("qual è la capitale del Perù?");
ok(/non ho una risposta affidabile/i.test(fuori.html), "Neura ammette quando non sa");

const esercizio = ask("un esercizio per l'ansia");
ok(/respiro|ancoraggio/i.test(esercizio.html), "Neura propone un esercizio pertinente");

const privacy = ask("dove finiscono i miei dati?");
ok(/localStorage|dispositivo/i.test(privacy.html), "Neura spiega dove restano i dati");

/* Nutrizione e IA locale --------------------------------------------------- */

const nut = NP.data.nutrizione;
ok(!!nut, "esiste la sezione nutrizione");
ok(nut.principi.length >= 4, "la nutrizione espone i principi guida");
ok(nut.professionisti.length >= 4, "la nutrizione distingue le professioni");
ok(nut.professionisti.some((p) => /Dietista/.test(p.ruolo)), "è spiegato il ruolo del dietista");
ok(nut.professionisti.some((p) => /Dietologo/.test(p.ruolo)), "è spiegato il ruolo del dietologo");
ok(nut.professionisti.some((p) => /Biologo/.test(p.ruolo)), "è spiegato il ruolo del biologo nutrizionista");
ok(nut.segnali.length >= 6, "la nutrizione elenca i segnali d'allarme");
ok(/112/.test(nut.segnaliNota), "i segnali rinviano al 112");
ok(nut.limiti.length >= 4, "la nutrizione dichiara i propri limiti");
ok(nut.fonti.length >= 5, "la nutrizione cita fonti istituzionali");
ok(nut.avviso && /non sostituisce|professionista/i.test(nut.avviso + nut.limiti.join(" ")), "la nutrizione dichiara di non sostituire i professionisti");
ok(!/devi mangiare|prescrivo|segui questa dieta|leetcode/i.test(JSON.stringify(nut)), "la nutrizione non contiene prescrizioni");

const ai = NP.data.ai;
ok(ai.build.windows && ai.build.mac && ai.build.linux, "il catalogo IA copre i tre sistemi");
ok(ai.modelli.length >= 3, "il catalogo IA elenca più modelli");
ai.modelli.forEach((m) => ok(m.id && m.ramMin > 0 && m.uso, "il modello " + m.id + " è descritto"));
ok(/^https:\/\/ollama\.com\//.test(ai.build.windows.url), "il download punta al sito ufficiale di Ollama");
ok(ai.avvertenze.length >= 3, "l'IA locale ha avvertenze d'uso");
ok(/OLLAMA_ORIGINS/.test(ai.comandi.windows), "è indicato il permesso d'origine richiesto da Ollama");

ok(/#\/nutrizione/.test(html), "index.html collega la sezione nutrizione");
ok(/#\/installa/.test(html), "index.html collega la pagina di installazione");

const nutrizioneRisposta = ask("cosa devo mangiare per l'ansia?");
ok(/nutrizione/i.test(nutrizioneRisposta.html), "Neura rimanda alla sezione nutrizione");
const installaRisposta = ask("come installo ollama?");
ok(/Ollama/.test(installaRisposta.html), "Neura spiega come installare Ollama");

/* Relazione e PDF --------------------------------------------------------- */

ok(/buildPdf|NP\.reportPdf/.test(read("assets/js/app-report.js")), "il generatore PDF è presente");
ok(/115|MediaBox|PDF-1\.4/.test(read("assets/js/app-report.js")), "il generatore produce un PDF 1.4 valido");
ok(/WinAnsiEncoding/.test(read("assets/js/app-report.js")), "il PDF gestisce gli accenti con WinAnsi");

/* Esito ------------------------------------------------------------------- */

console.log("\n" + (fails === 0 ? "✓" : "✗") + " " + (checks - fails) + "/" + checks + " verifiche superate");
if (fails) {
  console.error("\n" + fails + " verifiche fallite.");
  process.exit(1);
}
