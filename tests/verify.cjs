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
const barraStato = read("assets/js/app-status.js");
ok(/IA locale: pronta/.test(barraStato) && /IA locale: essenziale/.test(barraStato), "il chip IA dice «pronta» o «essenziale»");
ok(!/IA locale: da installare/.test(barraStato) && !/IA locale: " \+ modelli\[0\]/.test(barraStato), "il chip non dice più «da installare» e non mostra il nome del modello");
ok(/Modello in uso:/.test(barraStato), "il nome del modello si legge nel pannello, come «Modello in uso»");
// Il pannello Sistema rimanda a una pagina del sito: nel pacchetto desktop deve
// esserci davvero, altrimenti il pulsante apre una finestra vuota.
const preparaDesktop = read("scripts/prepare-desktop.cjs");
ok(/come-installare\.html/.test(preparaDesktop) && /scheda-rapida\.html/.test(preparaDesktop), "il pacchetto desktop include le pagine Come si installa e la scheda rapida");
const contenitore = read("desktop/main.cjs");
ok(/fs\.statSync\(percorso\)\.isFile\(\)/.test(contenitore), "il contenitore desktop controlla che la pagina locale esista prima di aprirla");
// Nel programma installato non ci sono né telefono né lettore PDF interno:
// entrambi devono passare dal sistema, altrimenti il clic non fa nulla.
ok(/sistema:copia/.test(contenitore) && /clipboard\.writeText/.test(contenitore), "il contenitore copia il numero di telefono negli appunti");
ok(/will-download/.test(contenitore) && /shell\.openPath/.test(contenitore), "i PDF locali si aprono con il lettore del sistema");
const ponte = read("desktop/preload.cjs");
ok(/copia: \(testo\) => ipcRenderer\.invoke\("sistema:copia"/.test(ponte), "il ponte espone la copia del numero alla pagina");
const installa = read("assets/js/app-installa.js");
ok(/Windows-portatile\.zip/.test(installa) && /Linux-x86_64\.AppImage/.test(installa), "la pagina Installa offre anche lo ZIP portatile e l'AppImage");

ok(/#\/nutrizione/.test(html), "index.html collega la sezione nutrizione");
ok(/#\/installa/.test(html), "index.html collega la pagina di installazione");

const nutrizioneRisposta = ask("cosa devo mangiare per l'ansia?");
ok(/nutrizione/i.test(nutrizioneRisposta.html), "Neura rimanda alla sezione nutrizione");
const installaRisposta = ask("come installo ollama?");
ok(/Ollama/.test(installaRisposta.html), "Neura spiega come installare Ollama");

/* Vademecum --------------------------------------------------------------- */

const pdfFiles = [
  "assets/pdf/vademecum-psicologo-digitale.pdf",
  "assets/pdf/vademecum-psicologo-digitale-a4.pdf",
  "assets/pdf/vademecum-psicologo-digitale-libricino-a4.pdf"
];
pdfFiles.forEach((f) => {
  ok(exists(f), "esiste il vademecum " + f);
  const bytes = fs.readFileSync(path.join(root, f));
  ok(bytes.slice(0, 5).toString("latin1") === "%PDF-", "il file " + f + " è un PDF");
  const testo = bytes.toString("latin1");
  ok(/%%EOF/.test(testo), "il PDF " + f + " è chiuso correttamente");
  const pagine = (testo.match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pagine >= 8, "il vademecum " + f + " ha almeno otto pagine (" + pagine + ")");
});
ok(/vademecum-psicologo-digitale\.pdf/.test(read("assets/js/app-views.js")), "la pagina licenze collega il vademecum");
ok(/vademecum-psicologo-digitale\.pdf/.test(html), "il footer di index.html collega il vademecum");
ok(exists("scripts/export-data.cjs") && /reportlab/.test(read("scripts/build_vademecum.py")), "il generatore del vademecum è nel progetto");

/* Guida per il professionista --------------------------------------------- */

const clinico = "assets/pdf/vademecum-clinico-psicologo-digitale.pdf";
ok(exists(clinico), "esiste la guida per il professionista " + clinico);
const cb = fs.readFileSync(path.join(root, clinico));
ok(cb.slice(0, 5).toString("latin1") === "%PDF-", "la guida per il professionista è un PDF");
const ct = cb.toString("latin1");
ok(/%%EOF/.test(ct), "la guida per il professionista è chiusa correttamente");
const cpages = (ct.match(/\/Type\s*\/Page[^s]/g) || []).length;
ok(cpages >= 10, "la guida per il professionista ha almeno dieci pagine (" + cpages + ")");
ok(/vademecum-clinico-psicologo-digitale\.pdf/.test(read("assets/js/app-views.js")), "la pagina licenze collega la guida per il professionista");
ok(/vademecum-clinico-psicologo-digitale\.pdf/.test(html), "il footer collega la guida per il professionista");
ok(exists("scripts/build_vademecum_clinico.py") && /limiti dichiarati/i.test(read("scripts/build_vademecum_clinico.py")), "il generatore della guida dichiara i limiti");
ok(/clinico/.test(read("scripts/export-data.cjs")), "l'esportazione include i dati per la guida del clinico");

/* I PDF dichiarano la versione del programma ------------------------------ */

// Se si aggiorna package.json senza rigenerare i PDF, la versione nei piedi di
// pagina resta quella vecchia: questo controllo lo intercetta.
const versione = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
const pdfVersione = [
  "assets/pdf/vademecum-psicologo-digitale.pdf",
  "assets/pdf/vademecum-psicologo-digitale-a4.pdf",
  "assets/pdf/vademecum-psicologo-digitale-libricino-a4.pdf",
  "assets/pdf/vademecum-clinico-psicologo-digitale.pdf",
  "assets/pdf/Psicologo-Digitale-Come-si-installa.pdf",
  "assets/pdf/Psicologo-Digitale-Scheda-rapida.pdf"
];
pdfVersione.forEach((f) => {
  const testo = fs.readFileSync(path.join(root, f)).toString("latin1");
  ok(testo.indexOf("versione=" + versione) !== -1, "il PDF " + f + " dichiara la versione " + versione);
});
// assets/data/vademecum.json è generato e non versionato: in CI non esiste, e
// il confronto che conta è quello sui PDF, che invece sono nel repository.

/* Foglio di installazione in PDF ------------------------------------------ */

// Il foglio esiste per chi consegna le istruzioni a qualcun altro, quindi deve
// restare leggero e autonomo: nessun collegamento da cui dipendere.
const pdfInstalla = "assets/pdf/Psicologo-Digitale-Come-si-installa.pdf";
ok(exists(pdfInstalla), "esiste il foglio di installazione " + pdfInstalla);
const ib = fs.readFileSync(path.join(root, pdfInstalla));
ok(ib.slice(0, 5).toString("latin1") === "%PDF-", "il foglio di installazione è un PDF");
const it = ib.toString("latin1");
ok(/%%EOF/.test(it), "il foglio di installazione è chiuso correttamente");
const ipagine = (it.match(/\/Type\s*\/Page[^s]/g) || []).length;
ok(ipagine >= 3 && ipagine <= 8, "il foglio di installazione sta fra tre e otto pagine (" + ipagine + ")");
ok(ib.length > 15000 && ib.length < 400000, "il foglio di installazione si può allegare a un'email (" + ib.length + " byte)");
ok(/Psicologo-Digitale-Come-si-installa\.pdf/.test(read("come-installare.html")), "la pagina pubblica collega il foglio in PDF");
ok(/Psicologo-Digitale-Come-si-installa\.pdf/.test(read("README.md")), "il README indica il foglio in PDF");
ok(exists("scripts/build_come_installare_pdf.py"), "il generatore del foglio è nel progetto");
// Se il generatore smettesse di leggere la pagina, il PDF tornerebbe a essere
// una copia da aggiornare a mano: è il controllo che tiene in piedi il resto.
const generatore = read("scripts/build_come_installare_pdf.py");
ok(/come-installare\.html/.test(generatore), "il generatore legge la pagina pubblica");
ok(!/danneggiata|Aggiungi a schermata Home|Nessun modello locale/.test(generatore), "il generatore non contiene una seconda copia delle risposte");

/* Scheda rapida, una pagina sola ------------------------------------------ */

// La scheda esiste per essere stampata e appesa: se occupa due pagine ha
// perso il suo senso, quindi il numero di pagine è un controllo, non un dato.
const schedaHtml = read("scheda-rapida.html");
const schedaPdf = "assets/pdf/Psicologo-Digitale-Scheda-rapida.pdf";
ok(exists("scheda-rapida.html"), "esiste la scheda rapida come pagina del sito");
ok(/class="[^"]*pagina-scheda/.test(schedaHtml), "la scheda è marcata per le regole di stampa");
["Windows", "macOS", "Linux"].forEach((sistema) => {
  ok(new RegExp("<h[1-6]>" + sistema + "</h[1-6]>").test(schedaHtml), "la scheda ha il blocco " + sistema);
});
ok((schedaHtml.match(/<li>/g) || []).length >= 12, "la scheda ha i passaggi essenziali dei tre sistemi");
ok(/112/.test(schedaHtml), "la scheda porta con sé il numero di emergenza");
ok(exists(schedaPdf), "esiste il PDF della scheda " + schedaPdf);
const sb = fs.readFileSync(path.join(root, schedaPdf));
ok(sb.slice(0, 5).toString("latin1") === "%PDF-", "la scheda è un PDF");
const st = sb.toString("latin1");
ok(/%%EOF/.test(st), "la scheda è chiusa correttamente");
const spagine = (st.match(/\/Type\s*\/Page[^s]/g) || []).length;
ok(spagine === 1, "la scheda sta in una pagina sola (" + spagine + ")");
ok(/Psicologo-Digitale-Scheda-rapida\.pdf/.test(schedaHtml), "la scheda collega il proprio PDF");
ok(/scheda-rapida\.html/.test(read("come-installare.html")), "la pagina lunga rimanda alla scheda");
ok(/scheda rapida/i.test(read("README.md")), "il README parla della scheda");
ok(exists("scripts/build_scheda_rapida_pdf.py") && /build_come_installare_pdf/.test(read("scripts/build_scheda_rapida_pdf.py")), "la scheda riusa l'impaginatore del foglio lungo");
ok(/scheda-rapida\.html/.test(read("sw.js")), "la scheda è fra i file che il service worker tiene offline");

/* Programmi installabili e benvenuto --------------------------------------- */

ok(exists("desktop/package.json"), "esiste la configurazione dei pacchetti desktop");
const desk = exists("desktop/package.json") ? read("desktop/package.json") : "";
ok(/it\.feniceos\.psicologodigitale/.test(desk), "l'app desktop ha un identificativo proprio");

/* Firma dei pacchetti ------------------------------------------------------ */

const wf = read(".github/workflows/desktop.yml");
ok(!/WIN_CSC_LINK|MAC_CSC_LINK|APPLE_TEAM_ID|APPLE_API_KEY/.test(wf), "il workflow non chiede certificati né credenziali Apple");
ok(!/CSC_IDENTITY_AUTO_DISCOVERY/.test(wf), "la build non cerca più identità di firma");
ok(!/Get-AuthenticodeSignature/.test(wf) && !/stapler validate/.test(wf), "la build non verifica firme che il progetto non usa");
ok(/codesign --verify/.test(wf), "la build verifica la firma ad-hoc dei pacchetti macOS");
ok(/Firma ad-hoc, e perché basta/.test(read("README.md")), "il README spiega la firma ad-hoc e perché basta");
ok(/Controllo che la release sia completa/.test(wf), "il workflow controlla che la release non perda pezzi");

// Dopo la pubblicazione il sito deve servire davvero la versione appena uscita:
// un service worker vecchio in cache non si vede finché qualcuno non apre la pagina.
const pagine = exists(".github/workflows/pages.yml") ? read(".github/workflows/pages.yml") : "";
ok(/Il sito serve la versione giusta/.test(pagine), "il controllo del sito ha un nome riconoscibile");
ok(/needs: deploy/.test(pagine) && /sw\.js/.test(pagine), "dopo la pubblicazione si controlla il service worker servito");
ok(/sha256sum/.test(pagine) && /vademecum-clinico-psicologo-digitale\.pdf/.test(pagine), "il controllo confronta le impronte dei PDF pubblicati");
/* Aggiornamenti automatici ------------------------------------------------ */

const mainDesk = read("desktop/main.cjs");
const pkgDesk = read("desktop/package.json");
ok(/electron-updater/.test(pkgDesk) && /electron-updater/.test(mainDesk), "il programma desktop usa electron-updater");
ok(/"provider": "github"/.test(pkgDesk), "i pacchetti dichiarano le release GitHub come sorgente degli aggiornamenti");
ok(/update:controlla/.test(mainDesk) && /quitAndInstall/.test(mainDesk), "il processo principale controlla e installa gli aggiornamenti");
ok(/checkForUpdates/.test(mainDesk) && /isPackaged/.test(mainDesk), "l'aggiornamento agisce solo nel programma installato");
ok(/signature|code signature/i.test(mainDesk), "su macOS senza firma l'errore viene spiegato");
ok(/aggiornamenti/.test(read("desktop/preload.cjs")), "il ponte espone gli aggiornamenti alla pagina");
ok(/statusUpdate/.test(read("assets/js/app-status.js")) && /data-update-install/.test(read("assets/js/app-status.js")), "la barra mostra quando un aggiornamento è pronto");
ok(/latest\*\.yml/.test(wf), "il workflow allega alla release i file di aggiornamento");
ok(/Aggiornamenti automatici/.test(read("README.md")), "il README spiega l'aggiornamento automatico");

/* Pagina delle versioni ---------------------------------------------------- */

const versioni = read("assets/js/app-versioni.js");
ok(/app-versioni\.js/.test(html), "index.html carica la pagina delle versioni");
ok(/#\/versioni/.test(html), "il menu Altro collega la pagina delle versioni");
ok(/"versioni"/.test(read("assets/js/app.js")), "la pagina delle versioni resta nel menu Altro anche da altre sezioni");
ok(/app-versioni\.js/.test(sw), "il service worker tiene la pagina delle versioni in cache");
ok(/views\.versioni = function/.test(versioni), "la pagina delle versioni è una vista dell'app");
const vUso = (versioni.match(/const VERSIONE = "([0-9.]+)"/) || [])[1];
ok(!!vUso && vUso === JSON.parse(read("package.json")).version, "la cronologia dichiara la stessa versione di package.json (" + vUso + ")");
ok(!!vUso && versioni.indexOf('v: "' + vUso + '"') > 0, "la versione in uso compare nella cronologia");
ok(versioni.indexOf('v: "1.2.0"') > 0, "la cronologia risale fino alla prima versione installabile");
ok(/in uso/i.test(versioni), "la cronologia segnala la versione installata");

/* macOS senza certificato: firma ad-hoc e istruzioni vere ------------------ */

const readmeTxt = read("README.md");
const statoJs = read("assets/js/app-status.js");
const installaJs = read("assets/js/app-installa.js");
const afterPack = read("desktop/after-pack.cjs");
ok(/afterPack/.test(read("desktop/package.json")), "electron-builder chiama l'hook della firma ad-hoc");
ok(/codesign", \["--force", "--deep", "--sign", "-"/.test(afterPack), "l'hook firma davvero i pacchetti macOS in ad-hoc");
ok(!/CSC_LINK|WIN_CSC|APPLE_ID|APPLE_API_KEY|notarize/.test(wf), "la build non chiede certificati né credenziali Apple");
ok(!/Developer Program|Developer ID|CSC_LINK/.test(readmeTxt), "il README non rimanda più a certificati a pagamento");
ok(/codesign --verify/.test(wf), "la build verifica la firma ad-hoc dei pacchetti macOS");
ok(/Apri comunque/.test(readmeTxt) && /Esegui comunque/.test(readmeTxt) && /chmod \+x/.test(readmeTxt), "il README spiega come installare su tutti e tre i sistemi");
ok(/Apri comunque/.test(statoJs) && /Apri comunque/.test(installaJs), "le pagine del programma ripetono le istruzioni di avvio");
ok(/installarlo ci sia sempre/.test(readmeTxt), "il README promette che il modo per installarlo c'è sempre");
ok(/backup:/.test(wf) && /git archive --format=zip/.test(wf), "la release allega un archivio completo dei sorgenti");
ok(/Psicologo-Digitale-Sorgenti\.zip/.test(wf), "il controllo di completezza esige il backup");
ok(/Backup completo nella release/.test(readmeTxt), "il README spiega il backup e a cosa serve");

/* Controllo dei link di download ------------------------------------------ */

const links = read("scripts/check-links.cjs");
const wfLink = read(".github/workflows/link.yml");
ok(/Psicologo-Digitale-Windows-x64\.exe/.test(links) && /Psicologo-Digitale-Sorgenti\.zip/.test(links), "il controllo conosce tutti i file attesi");
ok(/latest-mac\.yml/.test(links) && /SHA256SUMS\.txt/.test(links), "il controllo include impronte e file di aggiornamento");
ok(/digest/.test(links) && /impronta diversa da quella pubblicata/.test(links), "il controllo confronta le impronte dichiarate");
ok(/tentativi = 3/.test(links), "un 404 passeggero viene ritentato prima di essere segnalato");
ok(/process\.exit\(1\)/.test(links), "un link rotto fa fallire il controllo");
ok(/schedule:/.test(wfLink) && /workflow_dispatch:/.test(wfLink) && /workflow_run:/.test(wfLink), "il controllo gira ogni giorno, a mano e dopo ogni pubblicazione");
ok(/issues: write/.test(wfLink), "il workflow può aprire segnalazioni");
ok(/gh issue create/.test(wfLink) && /gh issue close/.test(wfLink), "la segnalazione si apre da sola e si chiude quando torna tutto a posto");
ok(/Controllo dei link di download/.test(readmeTxt), "il README descrive il controllo dei link");

/* Pagina pubblica «Come si installa» -------------------------------------- */

const paginaComeInstallare = read("come-installare.html");
ok(/<h1>Come si installa<\/h1>/.test(paginaComeInstallare), "esiste la pagina pubblica Come si installa");
ok(/Esegui comunque/.test(paginaComeInstallare) && /Apri comunque/.test(paginaComeInstallare) && /AppImage/.test(paginaComeInstallare), "la pagina copre Windows, macOS e Linux");
ok(/Tasto destro|tasto destro/.test(paginaComeInstallare) && /Sblocca/.test(paginaComeInstallare), "spiega cosa fare se il file Windows resta bloccato");
ok(/non funziona più/.test(paginaComeInstallare) && /macOS 15/.test(paginaComeInstallare), "avverte che il menu contestuale macOS non funziona più");
ok(/Get-FileHash/.test(paginaComeInstallare) && /sha256sum/.test(paginaComeInstallare) && /shasum -a 256/.test(paginaComeInstallare), "spiega come verificare l'impronta su ogni sistema");
const vPagina = (paginaComeInstallare.match(/Aggiornata alla versione ([0-9.]+)/) || [])[1];
ok(!!vPagina && vPagina === JSON.parse(read("package.json")).version, "la pagina è aggiornata alla versione del programma (" + vPagina + ")");
ok(/come-installare\.html/.test(sw), "il service worker tiene la pagina disponibile anche offline");
ok(/come-installare\.html/.test(html), "il piè di pagina del sito collega la pagina");
ok(/come-installare\.html/.test(installaJs) && /come-installare\.html/.test(statoJs), "il programma rimanda alla pagina pubblica");
ok(/Come si installa/.test(readmeTxt), "il README cita la pagina");
ok(/id="domande-frequenti"/.test(paginaComeInstallare), "la pagina ha una sezione Domande frequenti");
ok(/href="#domande-frequenti"/.test(paginaComeInstallare), "le domande si raggiungono dall'inizio della pagina");
const domande = (paginaComeInstallare.match(/<h3>/g) || []).length;
ok(domande >= 10, "le domande frequenti sono almeno dieci (" + domande + ")");
ok(/danneggiata/.test(paginaComeInstallare) && /architettura sbagliata/.test(paginaComeInstallare), "spiega il file «danneggiato» su macOS");
ok(/dopo un tentativo di apertura andato a vuoto/.test(paginaComeInstallare), "dice perché il pulsante Apri comunque non compare");
ok(/ripristinalo dalla cronologia dell'antivirus/.test(paginaComeInstallare), "spiega la quarantena dell'antivirus su Windows");
ok(/esporta prima il backup JSON/.test(paginaComeInstallare), "avverte di salvare il backup prima di disinstallare");
ok(/Nessun modello locale trovato/.test(paginaComeInstallare) && /Aggiungi a schermata Home/.test(paginaComeInstallare), "chiarisce che Ollama non serve e che su iPhone c'è la PWA");
ok(/Domande frequenti/.test(readmeTxt), "il README descrive le domande frequenti");
ok(/<body class="pagina-installa">/.test(paginaComeInstallare), "la pagina è marcata per le regole di stampa");
ok(/data-stampa/.test(paginaComeInstallare) && /window\.print\(\)/.test(paginaComeInstallare), "c'è un pulsante che apre la stampa del sistema");
ok(/Ctrl\+P/.test(paginaComeInstallare) && /⌘P/.test(paginaComeInstallare), "spiega la scorciatoia di stampa a chi non usa il pulsante");
ok(/class="solo-stampa"/.test(paginaComeInstallare) && /112/.test(paginaComeInstallare.match(/class="solo-stampa"[\s\S]{0,900}/)[0]), "il foglio stampato porta con sé l'avvertenza e il 112");
ok(/class="btn-row[^"]*no-print"/.test(paginaComeInstallare), "i pulsanti non finiscono sulla carta");
const css = read("assets/css/styles.css");
ok(/\.solo-stampa \{ display: none; \}/.test(css), "il blocco per la carta resta nascosto a schermo");
ok(/\.pagina-installa \.grid \{ display: block !important; \}/.test(css), "sulla carta il testo va in una colonna sola");
ok(/\.pagina-installa \{[\s\S]{0,600}break-inside: avoid/.test(css) || /\.pagina-installa \.card[\s\S]{0,400}break-inside: avoid/.test(css), "i riquadri non si spezzano a metà foglio");
ok(/@media print[\s\S]{0,4000}\.pagina-installa \.card/.test(css), "le regole di stampa valgono per questa pagina");
ok(/Stampa o salva in PDF/.test(readmeTxt), "il README spiega come si stampa la pagina");
ok(/firma ad-hoc/i.test(readmeTxt), "il README spiega la firma ad-hoc");
ok(/non può essere notarizzato/i.test(readmeTxt), "il README dice che la notarizzazione non è disponibile senza abbonamento");
ok(/Homebrew/.test(readmeTxt), "il README spiega perché una cask Homebrew non risolve");
ok(!/Ctrl\+clic/.test(readmeTxt), "il README non suggerisce più il menu contestuale, rimosso da macOS 15");
ok(!/tasto destro sull'app/.test(statoJs), "la barra di stato non suggerisce più il menu contestuale su macOS");
ok(!/tasto destro sull'app/.test(installaJs), "la pagina Installa non suggerisce più il menu contestuale su macOS");
ok(/Da macOS 15/.test(statoJs), "la barra di stato spiega il percorso di macOS 15 e successivi");
ok(/Apri comunque/.test(statoJs) && /Fine/.test(statoJs), "la barra di stato descrive i passaggi reali di macOS");

// I certificati restano facoltativi: le istruzioni per consentire l'avvio dal
// sistema operativo devono restare sia nel README sia nella pagina di installazione.
const readme = read("README.md");
ok(/Consentire l'avvio/.test(readme) && /Esegui comunque/.test(readme), "il README spiega come consentire l'avvio su Windows");
ok(/Privacy e sicurezza/.test(readme) && /com\.apple\.quarantine/.test(readme), "il README spiega come consentire l'avvio su macOS");
ok(/Consenti l'esecuzione/.test(readme), "il README spiega come consentire l'avvio su Linux");
const paginaInstalla = read("assets/js/app-installa.js");
ok(/Esegui comunque/.test(paginaInstalla) && /Privacy e sicurezza/.test(paginaInstalla), "la pagina di installazione lascia le istruzioni per consentire l'avvio");
ok(/nsis/.test(desk) && /dmg/.test(desk) && /"deb"/.test(desk), "i pacchetti coprono Windows, macOS e Linux");
ok(/electron-builder/.test(desk), "i pacchetti sono costruiti con electron-builder");
ok(exists("desktop/main.cjs") && /127\.0\.0\.1:11434/.test(read("desktop/main.cjs")), "il contenitore desktop parla con Ollama");
ok(/ipcMain\.handle\("ollama:tags"/.test(read("desktop/main.cjs")), "il processo principale espone i modelli installati");
ok(exists("desktop/preload.cjs") && /contextBridge/.test(read("desktop/preload.cjs")), "il preload espone un ponte isolato");
ok(exists("scripts/prepare-desktop.cjs") && /desktop/.test(read("scripts/prepare-desktop.cjs")), "lo script prepara il contenuto desktop");
ok(exists("desktop/build/icon.png"), "l'icona dei pacchetti è nel progetto");

ok(/app-welcome\.js/.test(html), "index.html carica il benvenuto di Neura");
const welcome = exists("assets/js/app-welcome.js") ? read("assets/js/app-welcome.js") : "";
ok(/Sono Neura/.test(welcome), "Neura si presenta all'apertura");
ok(/speechSynthesis|NP\.neuraUI\.speak/.test(welcome), "il benvenuto usa la voce del dispositivo");
ok(/welcome-hidden/.test(welcome), "il benvenuto si può nascondere");
ok(/npDesktop/.test(welcome) && /Prima volta su questo computer/.test(welcome), "al primo avvio desktop il benvenuto spiega come consentire l'esecuzione");
ok(/Altro informazioni/.test(welcome) && /Apri comunque/.test(welcome), "l'avviso del primo avvio copre Windows e macOS");

/* Barra di stato ---------------------------------------------------------- */

ok(/app-status\.js/.test(html), "index.html carica la barra di stato");
const status = exists("assets/js/app-status.js") ? read("assets/js/app-status.js") : "";
ok(/npDesktop/.test(status), "la barra riconosce il programma installato");
ok(/display-mode: standalone/.test(status), "la barra riconosce la PWA installata");
ok(/mediaDevices/.test(status), "la barra controlla la presenza del microfono");
ok(/neuraUI\.stop/.test(status), "la barra ferma la voce di Neura");
ok(/history\.back/.test(status), "la barra torna alla pagina precedente");
ok(/112/.test(status) && /1522/.test(status), "la barra offre i numeri di emergenza");
ok(/data-state/.test(status), "la barra segnala lo stato con un indicatore");
ok(/statusOs/.test(status) && /Sistema in uso/.test(status), "la barra ha un pulsante che dichiara il sistema operativo");
ok(/Aggiungi voci/.test(status) && /Gestisci voci/.test(status), "il pannello spiega dove aggiungere voci di sistema");

const neuraUI = read("assets/js/app-neura.js");
ok(/natural\|neural\|premium/.test(neuraUI), "la voce privilegia le voci naturali del dispositivo");
ok(/voiceSelect/.test(neuraUI), "si può scegliere la voce del dispositivo");
ok(/tutteLeVoci/.test(neuraUI) && /Altre lingue/.test(neuraUI), "il selettore elenca tutte le voci del sistema, con le italiane in cima");
ok(/voiceNote/.test(neuraUI), "la pagina Neura dichiara quante voci vede il sistema");
ok(/vociMancanti/.test(neuraUI) && /Il sistema non offre voci italiane/.test(neuraUI), "se il sistema non ha voci italiane la pagina lo dice");
ok(/function istruzioniVoci/.test(neuraUI) && /Aggiungi voci/.test(neuraUI) && /Gestisci voci/.test(neuraUI) && /espeak-ng/.test(neuraUI), "i passaggi per aggiungere una voce seguono il sistema rilevato");
ok(/function sistemaRilevato/.test(neuraUI) && /window\.npDesktop/.test(neuraUI) && /NP\.ambiente\.detect/.test(neuraUI), "il sistema si legge dalla piattaforma dichiarata, non solo dal browser");
ok(/voiceProva/.test(neuraUI) && /gruppi\.italiane\.length \? gruppi\.italiane : gruppi\.altre/.test(neuraUI), "senza voci italiane la lettura ripiega su quella migliore disponibile");
ok(/voiceRileggi/.test(neuraUI) && /voiceImpostazioni/.test(neuraUI), "la scheda Voce apre le impostazioni e rilegge l'elenco");
ok(/Online \(Natural\)/.test(neuraUI) && /cloud di Microsoft/.test(neuraUI) && /non le vede/.test(neuraUI), "il programma spiega perché le voci del browser non compaiono");
ok((neuraUI.match(/addEventListener\("voiceschanged"/g) || []).length === 1, "l'ascolto delle voci si registra una volta sola");
const preloadC = read("desktop/preload.cjs");
ok(/sistema:/ .test(preloadC) && /impostazioniVoce/.test(preloadC), "il ponte desktop espone il pannello delle voci");
const mainC = read("desktop/main.cjs");
ok(/sistema:impostazioniVoce/.test(mainC) && /ms-settings:speech/.test(mainC) && /universalaccess\?SpokenContent/.test(mainC), "il processo principale apre il pannello voce giusto per Windows e macOS");

/* Voce naturale (facoltativa) --------------------------------------------- */

ok(/voceNaturale/.test(preloadC) && /voceNaturale:scarica/.test(preloadC) && /pronuncia/.test(preloadC), "il ponte desktop espone download e lettura della voce naturale");
ok(/voceNaturale:scarica/.test(mainC) && /voceNaturale:pronuncia/.test(mainC) && /voceNaturale:rimuovi/.test(mainC), "il processo principale scarica, legge e rimuove la voce naturale");
ok(/piper_windows_amd64\.zip/.test(mainC) && /piper_linux_x86_64\.tar\.gz/.test(mainC) && /piper_linux_aarch64\.tar\.gz/.test(mainC) && /it_IT-paola-medium\.onnx/.test(mainC), "il motore è fissato a una versione precisa per Windows e Linux");
ok((mainC.match(/sha256: "[0-9a-f]{64}"/g) || []).length === 7, "ogni file scaricato (motore per sistema e voci) ha un'impronta SHA-256 fissata");
ok(/it_IT-riccardo-x_low\.onnx/.test(mainC) && /"riccardo"/.test(mainC) && /maschile/.test(mainC), "c'è una seconda voce italiana, maschile");
ok(/function vocePerId/.test(mainC) && /for \(const file of voce\.file\)/.test(mainC), "ogni voce è un modello a sé, scaricato solo quando serve");
ok(/function motoreVoce/.test(mainC) && /process\.platform \+ "-" \+ process\.arch/.test(mainC), "il motore si sceglie in base al sistema e al processore");
ok(/createHash\("sha256"\)/.test(mainC) && /impronta SHA-256 diversa/.test(mainC), "i file scaricati sono verificati prima di essere usati");
const motoreC = read("desktop/motore.cjs");
ok(/require\("\.\/motore\.cjs"\)/.test(mainC) && /scompattaMotore\(/.test(mainC), "il motore si scompatta dentro il programma");
ok(/unzipSync/.test(motoreC) && /gunzipSync/.test(motoreC) && /symlinkSync/.test(motoreC) && /chmodSync/.test(motoreC), "ZIP e tar.gz si aprono senza strumenti esterni, con librerie e permessi");
ok(/motore\.cjs/.test(read("desktop/package.json")), "anche il nuovo modulo entra nel pacchetto");
ok(/\["--model", dove\.modello, "--config", dove\.config/.test(mainC) && /stdin\.end\(pulito/.test(mainC), "la voce legge il testo dall'ingresso standard e restituisce un WAV");
ok(/voiceNaturaleVoci/.test(neuraUI) && /voiceNaturaleRimuovi/.test(neuraUI) && /data-voce/.test(neuraUI), "la scheda Voce mostra una voce naturale per pulsante");
ok(/naturaleVoci/.test(neuraUI) && /CHIAVE_VOCE_NATURALE/.test(neuraUI), "la voce naturale scelta resta memorizzata");
ok(/voceNaturale:rimuoviVoce/.test(mainC) && /rimuoviVoce/.test(preloadC), "una voce naturale si può togliere da sola");
ok(/data-rimuovi/.test(neuraUI) && /voceNaturale:rimuoviVoce/.test(mainC), "la scheda Voce offre «Togli» accanto a ogni voce installata");
ok(/function byteCartella/.test(mainC) && /mbReale/.test(mainC) && /spazio: Math\.round/.test(mainC), "il programma misura lo spazio realmente occupato, non la stima del catalogo");
ok(/mbReale/.test(neuraUI) && /pesoVoce\(v\)/.test(neuraUI) && /MB sul disco, motore compreso/.test(neuraUI), "la scheda Voce dice quanto pesa ogni voce installata e il totale");
ok(/liberati/.test(mainC) && /liberati/.test(neuraUI), "togliendo una voce la scheda dice quanti MB ha liberato");
ok(/voiceNaturaleConfronta/.test(neuraUI) && /function confrontaVoci/.test(neuraUI), "la scheda Voce offre il confronto fra le voci installate");
ok(/function ascoltaConVoce/.test(neuraUI) && /onended = function \(\) \{ chiudi\(true\)/.test(neuraUI), "il confronto aspetta la fine di una voce prima di far parlare l'altra");
ok(/pronte\.length < 2/.test(neuraUI) && /FRASE_CONFRONTO/.test(neuraUI), "il confronto usa la stessa frase e compare solo con due voci");
ok(/"__naturale__"/.test(neuraUI) && /function parlaNaturale/.test(neuraUI), "la voce naturale entra nell'elenco e nella lettura");
ok(/parlaConSistema\(testo\)/.test(neuraUI) && /se la voce naturale non parte/i.test(neuraUI), "se la voce naturale non parte si torna alla voce del sistema");
ok(/darwin/.test(neuraUI) && /Premium/.test(neuraUI), "su Mac la scheda indica le voci naturali di Apple");
ok(/voiceRitmo/.test(neuraUI) && /CHIAVE_RITMO/.test(neuraUI) && /u\.rate = Math\.min\(2, 0\.97 \* ritmo\(\)\)/.test(neuraUI), "la velocità di lettura si sceglie e vale per le voci del sistema");
ok(/pronuncia\(pezzo, ritmo\(\), scelta\)/.test(neuraUI) && /--length_scale/.test(mainC), "la voce naturale rispetta velocità e voce scelte");
ok(/pronuncia: \(testo, ritmo, voce\)/.test(preloadC) && /scarica: \(voce\)/.test(preloadC), "il ponte passa velocità e voce scelte alla voce naturale");
ok(/stopListening/.test(neuraUI), "la dettatura si può interrompere");

const inst = read("assets/js/app-installa.js");
ok(/api\/tags/.test(inst), "la pagina installa legge i modelli presenti");
ok(/Installato sul tuo computer/.test(inst), "il modello installato viene evidenziato");
ok(/releases\/latest/.test(inst), "la pagina installa rimanda ai pacchetti desktop");
ok(/npDesktop/.test(inst), "la pagina usa il ponte desktop quando è disponibile");

/* Relazione e PDF --------------------------------------------------------- */

ok(/buildPdf|NP\.reportPdf/.test(read("assets/js/app-report.js")), "il generatore PDF è presente");
ok(/115|MediaBox|PDF-1\.4/.test(read("assets/js/app-report.js")), "il generatore produce un PDF 1.4 valido");
ok(/WinAnsiEncoding/.test(read("assets/js/app-report.js")), "il PDF gestisce gli accenti con WinAnsi");

/* Controllo automatico dei collegamenti ------------------------------------ */

// Un collegamento rotto deve fermare la pubblicazione, non arrivare a chi legge.
const pacchettoJson = JSON.parse(read("package.json"));
ok(exists("scripts/controlla-collegamenti.cjs"), "esiste il controllo dei collegamenti interni");
ok(/controlla-collegamenti/.test(pacchettoJson.scripts.test || ""), "npm test esegue il controllo dei collegamenti");
ok(/controlla-collegamenti/.test(pacchettoJson.scripts["test:links"] || ""), "il controllo si può lanciare da solo con npm run test:links");
const controlloLink = read("scripts/check-links.cjs");
ok(/const PAGINE = \[/.test(controlloLink), "il controllo quotidiano apre anche le pagine del sito");
ok(/function indirizziCitati/.test(controlloLink), "il controllo quotidiano apre le fonti citate nei contenuti");
// I pannelli costruiscono i link quando si aprono: senza questa lettura del
// codice, un pulsante rotto dentro un pannello passerebbe inosservato.
const controlloInterno = read("scripts/controlla-collegamenti.cjs");
ok(/function controllaLetterali/.test(controlloInterno) && /controllaLetterali\(pacchetto, viste\)/.test(controlloInterno), "il controllo legge anche i collegamenti scritti nel codice");
ok(/function rendiApp/.test(controlloInterno) && /function controllaPagine/.test(controlloInterno), "il controllo apre pagine, viste e collegamenti");
// Accessibilità: contrasto, ordine dei titoli, testo alternativo.
const accessibilita = read("scripts/controlla-accessibilita.cjs");
ok(/function controllaTesti/.test(accessibilita), "l'accessibilità misura il contrasto dei testi");
ok(/function controllaTitoli/.test(accessibilita) && /titolo fuori ordine/.test(accessibilita), "l'accessibilità controlla l'ordine dei titoli");
ok(/function controllaImmagini/.test(accessibilita) && /senza testo alternativo/.test(accessibilita), "l'accessibilità chiede il testo alternativo");
ok(/controlla-accessibilita\.cjs/.test(read("package.json")), "npm test esegue anche il controllo di accessibilità");
ok(/html\[data-theme="dark"\]/.test(read("assets/css/styles.css")), "il foglio di stile ha il tema scuro, e il controllo lo misura");
// Testi: refusi, ripetizioni, conteggi.
const controlloTesti = read("scripts/controlla-testi.cjs");
ok(/function controllaRefusi/.test(controlloTesti) && /function controllaErrori/.test(controlloTesti), "il controllo dei testi cerca refusi e forme sbagliate");
ok(/function controllaRipetizioni/.test(controlloTesti) && /function controllaConteggi/.test(controlloTesti), "il controllo dei testi cerca ripetizioni e conteggi diversi");
ok(/controlla-testi\.cjs/.test(read("package.json")), "npm test esegue anche il controllo dei testi");

/* Esito ------------------------------------------------------------------- */

console.log("\n" + (fails === 0 ? "✓" : "✗") + " " + (checks - fails) + "/" + checks + " verifiche superate");
if (fails) {
  console.error("\n" + fails + " verifiche fallite.");
  process.exit(1);
}
