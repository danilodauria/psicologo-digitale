#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · test di interfaccia con jsdom
   Licenza: MIT · Danilo D'Auria
   ========================================================================== */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
let checks = 0;
let fails = 0;

function ok(cond, msg) {
  checks++;
  if (!cond) { fails++; console.error("  ✗ " + msg); }
  else console.log("  ✓ " + msg);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8")
  .replace(/<script src="[^"]+"><\/script>/g, "");

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

window.scrollTo = function () {};
window.matchMedia = function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {} };
};
window.confirm = function () { return true; };
window.alert = function () {};

// Il sistema di prova ha solo voci inglesi e tedesche: serve a verificare il
// ripiego quando manca una voce italiana, il caso tipico del pacchetto desktop.
window.speechSynthesis = {
  getVoices: function () {
    return [
      { name: "Alice", lang: "en-US" },
      { name: "Anna", lang: "de-DE" }
    ];
  },
  speak: function () {},
  cancel: function () {},
  addEventListener: function () {}
};
window.SpeechSynthesisUtterance = function (testo) { this.text = testo; };

const scripts = [
  "assets/js/data-scales.js",
  "assets/js/data-intake.js",
  "assets/js/data-course.js",
  "assets/js/data-manual.js",
  "assets/js/data-manual2.js",
  "assets/js/data-extra.js",
  "assets/js/data-quiz.js",
  "assets/js/data-nutrizione.js",
  "assets/js/data-ai.js",
  "assets/js/neura.js",
  "assets/js/app.js",
  "assets/js/app-intake.js",
  "assets/js/app-scales.js",
  "assets/js/app-course.js",
  "assets/js/app-neura.js",
  "assets/js/app-views.js",
  "assets/js/app-nutrizione.js",
  "assets/js/app-installa.js",
  "assets/js/app-status.js",
  "assets/js/app-report.js",
  "assets/js/app-init.js",
  "assets/js/app-welcome.js"
];

let loadError = null;
scripts.forEach(function (f) {
  try {
    window.eval(fs.readFileSync(path.join(root, f), "utf8"));
  } catch (e) {
    loadError = f + ": " + e.message;
  }
});

console.log("Psicologo Digitale · test di interfaccia\n");
ok(!loadError, "tutti gli script si caricano senza errori" + (loadError ? " (" + loadError + ")" : ""));

const NP = window.NP;
ok(!!NP && !!NP.app, "NP.app è disponibile");
ok(document.querySelector(".hero"), "la home è renderizzata");
ok(document.querySelectorAll(".site-footer a").length > 0, "il footer contiene i collegamenti");

/* Navigazione ------------------------------------------------------------- */

function navigate(route) {
  window.location.hash = route;
  NP.app.render();
}

navigate("#/manuale");
ok(document.querySelectorAll('a[href^="#/manuale/"]').length === 12, "l'elenco del manuale mostra dodici capitoli");

navigate("#/manuale/ansia");
ok(document.body.textContent.indexOf("allarme") >= 0, "il capitolo sull'ansia è leggibile");

// Precedente e successivo: al capitolo adiacente, non a uno qualsiasi.
const capitoli = NP.data.manuale;
const nav = function (verso) { return document.querySelector('#app [data-nav="' + verso + '"]'); };
navigate("#/manuale/" + capitoli[1].id);
ok(!!nav("prev") && nav("prev").getAttribute("href") === "#/manuale/" + capitoli[0].id, "«precedente» porta al capitolo prima");
ok(!!nav("next") && nav("next").getAttribute("href") === "#/manuale/" + capitoli[2].id, "«successivo» porta al capitolo dopo");
ok(nav("next").textContent.indexOf(capitoli[2].titolo) >= 0, "il pulsante dice il titolo del capitolo che apre");
navigate("#/manuale/" + capitoli[0].id);
ok(!nav("prev"), "il primo capitolo non offre un «precedente»");
navigate("#/manuale/" + capitoli[capitoli.length - 1].id);
ok(!nav("next"), "l'ultimo capitolo non offre un «successivo»");

// La posizione in cima deve dire il posto vero, non un numero scritto a mano.
capitoli.forEach(function (c, i) {
  navigate("#/manuale/" + c.id);
  const crumb = document.querySelector("#app .crumbs").textContent;
  ok(crumb.indexOf("Capitolo " + (i + 1) + " di " + capitoli.length) >= 0, "il capitolo «" + c.id + "» dice di essere il " + (i + 1) + " di " + capitoli.length);
});

navigate("#/glossario");
const glossItems = document.querySelectorAll(".glossary-item").length;
ok(glossItems >= 40, "il glossario mostra tutte le voci (" + glossItems + ")");
const search = document.getElementById("glossSearch");
search.value = "evitamento";
search.dispatchEvent(new window.Event("input", { bubbles: true }));
ok(document.querySelectorAll(".glossary-item").length < glossItems, "la ricerca del glossario filtra le voci");

navigate("#/sicurezza");
ok(document.body.textContent.indexOf("112") >= 0, "la pagina sicurezza mostra il 112");
ok(document.body.textContent.indexOf("1522") >= 0, "la pagina sicurezza mostra il 1522");

navigate("#/esercizi");
ok(document.querySelectorAll('a[href^="#/esercizi/"]').length >= 10, "la pagina esercizi elenca le pratiche");

navigate("#/esercizi/respiro-4-6");
ok(document.body.textContent.indexOf("Inspira") >= 0, "l'esercizio guidato mostra i passi");
ok(document.getElementById("timerBtn"), "l'esercizio offre un timer");

const pratiche = NP.data.percorso.esercizi;
const navEs = function (verso) { return document.querySelector('#app [data-nav="' + verso + '"]'); };
navigate("#/esercizi/" + pratiche[1].id);
ok(!!navEs("prev") && navEs("prev").getAttribute("href") === "#/esercizi/" + pratiche[0].id, "negli esercizi «precedente» porta a quello prima");
ok(!!navEs("next") && navEs("next").getAttribute("href") === "#/esercizi/" + pratiche[2].id, "negli esercizi «successivo» porta a quello dopo");
ok(navEs("next").textContent.indexOf(pratiche[2].titolo) >= 0, "il pulsante dice il titolo dell'esercizio che apre");
navigate("#/esercizi/" + pratiche[0].id);
ok(!navEs("prev"), "il primo esercizio non offre un «precedente»");
navigate("#/esercizi/" + pratiche[pratiche.length - 1].id);
ok(!navEs("next"), "l'ultimo esercizio non offre un «successivo»");

// La posizione vale anche per gli esercizi, con il posto nell'elenco.
pratiche.forEach(function (e, i) {
  navigate("#/esercizi/" + e.id);
  const crumb = document.querySelector("#app .crumbs").textContent;
  ok(crumb.indexOf("Esercizio " + (i + 1) + " di " + pratiche.length) >= 0, "l'esercizio «" + e.id + "» dice di essere il " + (i + 1) + " di " + pratiche.length);
});

// Lettura e pratica si rimandano a vicenda, con lo stesso abbinamento nei dati.
const abbinati = {};
capitoli.forEach(function (c) {
  navigate("#/manuale/" + c.id);
  const link = document.querySelector("#app [data-esercizio-collegato]");
  ok(!!link, "il capitolo «" + c.id + "» porta all'esercizio che gli corrisponde");
  const esercizio = NP.app.esercizioDelCapitolo(c);
  ok(!!esercizio && !!link && link.getAttribute("href") === "#/esercizi/" + esercizio.id, "il collegamento del capitolo «" + c.id + "» è quello abbinato nei dati");
  if (esercizio) abbinati[esercizio.id] = (abbinati[esercizio.id] || 0) + 1;
});
ok(Object.keys(abbinati).length === pratiche.length, "tutti i " + pratiche.length + " esercizi sono abbinati a un capitolo");
pratiche.forEach(function (e) {
  navigate("#/esercizi/" + e.id);
  const link = document.querySelector("#app [data-capitolo]");
  const capitolo = NP.app.capitoloDellEsercizio(e.id);
  ok(!!link && !!capitolo && link.getAttribute("href") === "#/manuale/" + capitolo.id, "l'esercizio «" + e.id + "» riporta al capitolo che lo accompagna");
});

/* Colloquio --------------------------------------------------------------- */

navigate("#/colloquio");
ok(document.getElementById("intakeCard"), "il colloquio mostra una domanda");
ok(document.getElementById("consentBox"), "la prima domanda è il consenso");

const consent = document.getElementById("consentBox");
consent.checked = true;
consent.dispatchEvent(new window.Event("change", { bubbles: true }));
ok(NP.app.state.intake.consent === true, "il consenso viene registrato");

function answerCurrent() {
  const radios = document.querySelectorAll('#answerArea input[type="radio"]');
  if (radios.length) {
    radios[0].checked = true;
    radios[0].dispatchEvent(new window.Event("change", { bubbles: true }));
    return;
  }
  const checks = document.querySelectorAll('#answerArea input[type="checkbox"]');
  if (checks.length) {
    checks[0].checked = true;
    checks[0].dispatchEvent(new window.Event("change", { bubbles: true }));
    return;
  }
  const range = document.getElementById("scaleRange");
  if (range) {
    range.value = range.value;
    range.dispatchEvent(new window.Event("input", { bubbles: true }));
    return;
  }
  const text = document.getElementById("textAnswer");
  if (text) {
    text.value = "Test";
    text.dispatchEvent(new window.Event("input", { bubbles: true }));
  }
}

for (let i = 0; i < 8; i++) {
  answerCurrent();
  const next = document.getElementById("nextBtn");
  if (!next || next.disabled) break;
  next.click();
}

const answered = Object.keys(NP.app.state.intake.answers).length;
ok(answered >= 6, "il colloquio registra le risposte (" + answered + ")");
ok(NP.app.intakeProgress().total > 10, "il colloquio conta le domande visibili");

/* Questionario ------------------------------------------------------------ */

navigate("#/valutazione");
ok(document.querySelectorAll(".scale-item").length === 6, "la pagina valutazione elenca sei questionari");

navigate("#/valutazione/umore");
ok(document.querySelectorAll(".item-block").length === 9, "il questionario umore mostra nove item");

document.querySelectorAll('.item-block input[value="3"]').forEach(function (input) {
  input.checked = true;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
});

const submit = document.getElementById("scaleSubmit");
submit.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

ok(NP.app.state.scales.umore && NP.app.state.scales.umore.score === 27, "il punteggio massimo dell'umore è calcolato (27)");
ok(document.body.textContent.indexOf("Grave") >= 0, "il risultato mostra la fascia grave");
ok(document.body.textContent.indexOf("112") >= 0, "il risultato con item di rischio mostra il 112");
ok(document.querySelector(".result-hero"), "il risultato è visualizzato");

/* Storico dei punteggi ---------------------------------------------------- */

ok(NP.app.storicoDi("umore").length === 1 && NP.app.storicoDi("umore")[0].punti === 27,
  "completare un questionario lascia un punto nello storico, con il punteggio di allora");
const scalaUmore = NP.data.scales.filter(function (s) { return s.id === "umore"; })[0];
ok(NP.app.storicoDi("umore")[0].massimo === NP.app.scaleMax(scalaUmore),
  "il punto conserva anche il massimo vero della scala, così le barre non sono disegnate a occhio");

navigate("#/valutazione");
ok(!document.querySelector(".storico-punteggi"), "con una sola misurazione non si finge una serie nel tempo");

// Rifarlo non deve sostituire il punteggio nella memoria del tempo: si aggiunge.
navigate("#/valutazione/umore");
document.querySelector('a[href="#/valutazione/umore"]').click();
document.querySelectorAll('.item-block input[value="0"]').forEach(function (input) {
  input.checked = true;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
});
document.getElementById("scaleSubmit").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

const serie = NP.app.storicoDi("umore");
ok(serie.length === 2, "rifacendolo, lo storico cresce invece di sostituire il punteggio precedente");
ok(serie[1].punti < serie[0].punti, "il secondo punto è quello nuovo, con il suo punteggio");
ok(!!serie[1].quando && new Date(serie[1].quando) >= new Date(serie[0].quando), "e porta la data della misurazione");
ok(/Come cambia nel tempo/.test(document.body.textContent), "il risultato mostra come cambia nel tempo");
ok(document.querySelectorAll(".storico-righe .storico-riga").length === 2, "con una riga per misurazione");

navigate("#/valutazione");
ok(document.querySelectorAll(".storico-righe .storico-riga").length === 2,
  "la pagina Valutazione mostra lo storico accanto al questionario");
ok(/punti sotto la prima|punti sopra la prima/.test(document.body.textContent),
  "e dice se l'ultimo punteggio sta sopra o sotto la prima misurazione");
ok(NP.app.raccogliDati().storicoPunteggi.umore.length === 2, "lo storico entra nel backup, insieme agli altri dati");

/* Relazione --------------------------------------------------------------- */

navigate("#/relazione");
ok(document.querySelector(".report-sheet"), "la relazione è generata");
ok(document.body.textContent.indexOf("RELAZIONE PRELIMINARE") >= 0 || document.body.textContent.indexOf("Relazione preliminare") >= 0, "la relazione ha un'intestazione");
ok(document.getElementById("pdfBtn"), "la relazione offre il download PDF");

const generated = NP.reportPdf && NP.reportPdf.generate();
ok(generated && generated.length > 1500, "il PDF viene costruito (" + (generated ? generated.length : 0) + " byte)");
const head = generated ? String.fromCharCode.apply(null, Array.from(generated.slice(0, 8))) : "";
ok(head.indexOf("%PDF-1.4") === 0, "il file generato è un PDF 1.4");
const pdfText = generated ? Buffer.from(generated).toString("latin1") : "";
ok(pdfText.indexOf("Psicologo Digitale") >= 0, "il PDF contiene l'intestazione del progetto");
ok(pdfText.indexOf("/Type /Page") >= 0, "il PDF contiene almeno una pagina");
ok(pdfText.indexOf("%%EOF") > 0, "il PDF è chiuso correttamente");

/* Cosa finisce nella relazione -------------------------------------------- */

console.log("\nCosa finisce nella relazione");

const diarioPrimaRelazione = NP.app.state.diary;
const pensieriPrimaRelazione = NP.app.readJSON("thoughts", []);
const notePrimaRelazione = { note: NP.app.state.reportNotes.note, clinician: NP.app.state.reportNotes.clinician };
NP.app.state.diary = [{ id: "rel-d1", date: "2026-11-18T09:00:00.000Z", mood: 4, anxiety: 5, sleep: 6, energy: 5, note: "voce di diario inclusa" }];
NP.app.writeJSON("thoughts", [{
  id: "rel-t1", date: "2026-11-18T10:00:00.000Z",
  situation: "situazione inclusa", thought: "pensiero incluso", emotion: "ansia", intensity: 6, alternative: "alternativa inclusa"
}]);
NP.app.state.reportNotes.note = "nota personale inclusa";
NP.app.state.reportNotes.clinician = "spazio del professionista";
NP.app.saveReportNotes();

navigate("#/relazione");
const incDiario = document.getElementById("incDiario");
const incPensieri = document.getElementById("incPensieri");
const incNote = document.getElementById("incNote");
ok(!!incDiario && !!incPensieri && !!incNote, "la relazione offre tre caselle prima di generare il PDF");
ok(incDiario.checked && incPensieri.checked && incNote.checked, "senza scelte, le tre parti sono incluse");
ok(/Diario recente/.test(document.getElementById("reportBody").textContent) &&
  /Schede del pensiero/.test(document.getElementById("reportBody").textContent) &&
  /Note della persona/.test(document.getElementById("reportBody").textContent), "il foglio mostra tutte e tre le parti");

[incDiario, incPensieri, incNote].forEach(function (input) {
  input.checked = false;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
});
const corpoRidotto = document.getElementById("reportBody").textContent;
ok(!/Diario recente/.test(corpoRidotto) && !/Schede del pensiero/.test(corpoRidotto) && !/Note della persona/.test(corpoRidotto),
  "togliendo le tre caselle, le tre parti spariscono dal foglio");
ok(/8\. Domande suggerite per il clinico/.test(corpoRidotto), "le domande restano, con la numerazione senza buchi");
ok(/Spazio per il professionista/.test(corpoRidotto), "lo spazio del professionista non è una nota personale e resta");

incDiario.checked = true;
incDiario.dispatchEvent(new window.Event("change", { bubbles: true }));
const corpoSoloDiario = document.getElementById("reportBody").textContent;
ok(/8\. Diario recente/.test(corpoSoloDiario) && !/Schede del pensiero/.test(corpoSoloDiario) && !/Note della persona/.test(corpoSoloDiario),
  "rimettendo solo il diario, torna solo quella parte");
ok(/9\. Domande suggerite per il clinico/.test(corpoSoloDiario), "e le domande slittano di un numero, senza salti");

const pdfCompleto = NP.reportPdf.generate({ diario: true, pensieri: true, note: true });
const pdfRidotto = NP.reportPdf.generate({ diario: false, pensieri: false, note: false });
const testoPdfCompleto = Buffer.from(pdfCompleto).toString("latin1");
const testoPdfRidotto = Buffer.from(pdfRidotto).toString("latin1");
ok(pdfRidotto.length < pdfCompleto.length, "il PDF senza le tre parti è più corto (" + pdfRidotto.length + " contro " + pdfCompleto.length + " byte)");
ok(/Diario recente/.test(testoPdfCompleto) && /Schede del pensiero/.test(testoPdfCompleto) && /Note della persona/.test(testoPdfCompleto),
  "il PDF completo contiene le tre parti");
ok(!/Diario recente/.test(testoPdfRidotto) && !/Schede del pensiero/.test(testoPdfRidotto) && !/Note della persona/.test(testoPdfRidotto),
  "il PDF ridotto non le contiene");

NP.app.state.diary = diarioPrimaRelazione;
NP.app.writeJSON("thoughts", pensieriPrimaRelazione);
NP.app.state.reportNotes.note = notePrimaRelazione.note;
NP.app.state.reportNotes.clinician = notePrimaRelazione.clinician;
NP.app.saveReportNotes();

/* La scheda da portare ---------------------------------------------------- */

console.log("\nLa scheda da portare");

const intakePrimaScheda = JSON.parse(JSON.stringify(NP.app.state.intake));
const scalesPrimaScheda = JSON.parse(JSON.stringify(NP.app.state.scales));
const diarioPrimaScheda = NP.app.state.diary;
const pensieriPrimaScheda = NP.app.readJSON("thoughts", []);

NP.app.state.intake.answers = Object.assign({}, NP.app.state.intake.answers, {
  aree: ["ansia", "sonno", "umore"],
  durata: "mesi6",
  impatto: 7,
  obiettivi: "Dormire meglio e capire da dove cominciare",
  um_piacere: 3,
  an_manifestazioni: ["tensione", "evitamento"],
  so_tipo: ["addormentamento"],
  lav_recupero: "no",
  salute: ["altro"],
  farmaci: "psiche",
  terapia: "corso",
  sic_pensieri: "fugaci"
});
NP.app.saveIntake();
NP.app.state.scales = {
  ansia: { score: 12, doneAt: "2026-11-17T10:00:00.000Z" },
  umore: { score: 9, doneAt: "2026-11-16T10:00:00.000Z" },
  sonno: { score: 15, doneAt: "2026-11-15T10:00:00.000Z" },
  stress: { score: 22, doneAt: "2026-11-14T10:00:00.000Z" }
};
NP.app.saveScales();
NP.app.state.diary = [
  { id: "sch-d1", date: "2026-11-18", mood: 4, anxiety: 6, sleep: 6, energy: 4, note: "giornata difficile al lavoro" },
  { id: "sch-d2", date: "2026-11-17", mood: 6, anxiety: 4, sleep: 7, energy: 6, note: "voce precedente" }
];
NP.app.saveDiary();
NP.app.writeJSON("thoughts", [
  { id: "sch-t1", date: "2026-11-18T10:00:00.000Z", situation: "riunione con il capo", thought: "non sono capace", emotion: "ansia", intensity: 7, alternative: "ho già gestito situazioni simili" },
  { id: "sch-t2", date: "2026-11-17T10:00:00.000Z", situation: "situazione vecchia", thought: "pensiero vecchio", emotion: "tristezza", intensity: 4, alternative: "" }
]);

navigate("#/relazione");
ok(!!document.querySelector('a[href="#/scheda"]'), "la relazione porta alla scheda da portare");

navigate("#/scheda");
ok(document.querySelector(".scheda-sheet"), "la scheda da portare è generata");
ok(/Una pagina sola, per il colloquio/.test(document.querySelector("h1").textContent), "la scheda dice che sta in una pagina");
const caselleAree = document.querySelectorAll('#schedaScelte input[data-gruppo="aree"]');
const casellePunteggi = document.querySelectorAll('#schedaScelte input[data-gruppo="punteggi"]');
const caselleDomande = document.querySelectorAll('#schedaScelte input[data-gruppo="domande"]');
ok(caselleAree.length === 4, "la scheda offre tutte le aree del colloquio (" + caselleAree.length + ")");
ok(document.querySelectorAll('#schedaScelte input[data-gruppo="aree"]:checked').length === 3, "senza scelte parte con tre aree");
ok(document.querySelectorAll('#schedaScelte input[data-gruppo="punteggi"]:checked').length === 3, "e con tre punteggi");
ok(document.querySelectorAll('#schedaScelte input[data-gruppo="domande"]:checked').length === 3, "e con tre domande");
ok(document.querySelectorAll('#schedaScelte input[data-gruppo="aree"]:not(:checked):disabled').length === 1, "la quarta area si ferma finché non se ne toglie una");

const corpoScheda = document.getElementById("schedaBody");
ok(/Le aree che mi pesano di più/.test(corpoScheda.textContent), "la scheda comincia dal motivo");
ok(/giornata difficile al lavoro/.test(corpoScheda.textContent), "la scheda parte dall'ultima voce di diario");
ok(/non sono capace/.test(corpoScheda.textContent), "e dall'ultima scheda del pensiero");
ok(/Cosa voglio chiedere/.test(corpoScheda.textContent), "e dalle domande scelte");
ok(/Da non rimandare/.test(corpoScheda.textContent), "un segnale di rischio resta in cima, non sparisce");

const pdfScheda = NP.reportPdf.scheda();
const testoPdfScheda = Buffer.from(pdfScheda).toString("latin1");
ok((testoPdfScheda.match(/\/Type\s*\/Page[^s]/g) || []).length === 1, "il PDF della scheda sta in una pagina sola");
ok(/Cosa voglio chiedere/.test(testoPdfScheda) && /giornata difficile al lavoro/.test(testoPdfScheda), "il PDF porta le parti scelte");
ok(/Da non rimandare/.test(testoPdfScheda), "e il segnale di rischio");

const pdfSoloMotivo = NP.reportPdf.scheda({ aree: [], punteggi: [], voce: -1, pensiero: -1, domande: [] });
const testoSoloMotivo = Buffer.from(pdfSoloMotivo).toString("latin1");
ok((testoSoloMotivo.match(/\/Type\s*\/Page[^s]/g) || []).length === 1, "anche la scheda ridotta sta in una pagina");
ok(!/Cosa voglio chiedere/.test(testoSoloMotivo) && !/Le aree che pesano/.test(testoSoloMotivo), "senza scelte restano fuori le sezioni vuote");

Array.prototype.forEach.call(caselleAree, function (c) { c.checked = false; c.dispatchEvent(new window.Event("change", { bubbles: true })); });
ok(!/Le aree che pesano/.test(corpoScheda.textContent), "togliendo le aree, la sezione sparisce anche a schermo");
ok(!caselleAree[3].disabled, "liberando un posto, la quarta area si può scegliere");
caselleAree[3].checked = true;
caselleAree[3].dispatchEvent(new window.Event("change", { bubbles: true }));
ok(/Le aree che pesano/.test(corpoScheda.textContent), "scegliendo la quarta area, la sezione torna");

const voceDue = document.querySelector('#schedaScelte input[name="schedaVoce"][value="1"]');
voceDue.checked = true;
voceDue.dispatchEvent(new window.Event("change", { bubbles: true }));
ok(/voce precedente/.test(corpoScheda.textContent) && !/giornata difficile al lavoro/.test(corpoScheda.textContent), "scegliendo un'altra voce, la scheda la segue");

const pensieroDue = document.querySelector('#schedaScelte input[name="schedaPensiero"][value="1"]');
pensieroDue.checked = true;
pensieroDue.dispatchEvent(new window.Event("change", { bubbles: true }));
ok(/pensiero vecchio/.test(corpoScheda.textContent) && !/non sono capace/.test(corpoScheda.textContent), "scegliendo un'altra scheda, la scheda la segue");

ok(caselleDomande.length >= 5, "la scheda offre almeno cinque domande (" + caselleDomande.length + ")");
caselleDomande[3].checked = true;
caselleDomande[3].dispatchEvent(new window.Event("change", { bubbles: true }));
ok(caselleDomande[4].disabled, "alla quarta domanda le altre si fermano");
ok(/Chiarire la terapia farmacologica/.test(corpoScheda.textContent), "la quarta domanda entra nella scheda");

NP.app.state.intake = intakePrimaScheda;
NP.app.saveIntake();
NP.app.state.scales = scalesPrimaScheda;
NP.app.saveScales();
NP.app.state.diary = diarioPrimaScheda;
NP.app.saveDiary();
NP.app.writeJSON("thoughts", pensieriPrimaScheda);

/* Il taccuino delle domande ----------------------------------------------- */

console.log("\nIl taccuino delle domande");
NP.app.state.domandePersonali = [];
NP.app.saveDomandePersonali();

const avviso = function () { return document.getElementById("toast").textContent; };

navigate("#/manuale/ansia");
const formCapitolo = document.getElementById("formDomandaCapitolo");
const campoCapitolo = document.getElementById("domandaCapitolo");
ok(!!formCapitolo && !!campoCapitolo, "alla fine di un capitolo c'è il modulo per una domanda");
campoCapitolo.value = "  Che cosa   posso fare la sera?  ";
formCapitolo.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
ok(NP.app.state.domandePersonali.length === 1, "la domanda scritta nel capitolo entra nel taccuino");
ok(NP.app.state.domandePersonali[0].testo === "Che cosa posso fare la sera?", "gli spazi in più vengono tolti");
ok(/Apri il taccuino \(1\)/.test(document.getElementById("linkTaccuinoCapitolo").textContent), "il collegamento dice quante domande ci sono");
ok(campoCapitolo.value === "", "il campo si svuota dopo l'aggiunta");

navigate("#/neura");
const formNeura = document.getElementById("formDomandaNeura");
ok(!!formNeura && !!document.getElementById("domandaNeura"), "anche Neura offre il modulo per il taccuino");
document.getElementById("domandaNeura").value = "Posso parlarne con il medico di base?";
formNeura.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
ok(NP.app.state.domandePersonali.length === 2, "la domanda scritta parlando con Neura entra nello stesso taccuino");
ok(/Apri il taccuino \(2\)/.test(document.getElementById("linkTaccuinoNeura").textContent), "il collegamento si aggiorna senza ricaricare la pagina");

navigate("#/taccuino");
ok(/Le domande che vuoi fare/.test(document.querySelector("h1").textContent), "il taccuino ha una pagina sua");
ok(document.querySelectorAll("#taccuinoList .taccuino-voce").length === 2, "il taccuino elenca le due domande");
ok(!!document.getElementById("taccuinoNuova"), "e offre il modulo per aggiungerne una");

const campoNuovo = document.getElementById("domandaTesto");
campoNuovo.value = "che cosa posso fare la sera?";
document.getElementById("taccuinoForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
ok(NP.app.state.domandePersonali.length === 2, "una domanda già scritta non viene duplicata");
ok(/già nel taccuino/.test(avviso()), "e l'avviso dice perché");

const idPrima = NP.app.state.domandePersonali[0].id;
document.querySelector('[data-modifica="' + idPrima + '"]').click();
ok(/Correggi la domanda/.test(document.getElementById("taccuinoNuova").textContent), "Modifica apre la domanda scelta");
ok(document.getElementById("domandaTesto").value === "Posso parlarne con il medico di base?", "con il testo già dentro");
document.getElementById("domandaTesto").value = "Che cosa posso fare se arriva la sera?";
document.getElementById("taccuinoForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
ok(NP.app.state.domandePersonali.some(function (q) { return q.testo === "Che cosa posso fare se arriva la sera?"; }), "salvando, la domanda viene corretta");
ok(/Domanda aggiornata/.test(avviso()), "e l'avviso lo conferma");

const idSeconda = NP.app.state.domandePersonali[1].id;
const confirmPrima = window.confirm;
window.confirm = function () { return true; };
document.querySelector('[data-elimina="' + idSeconda + '"]').click();
ok(NP.app.state.domandePersonali.length === 1, "Togli elimina solo la domanda scelta");
window.confirm = confirmPrima;

NP.app.state.diary = [{ id: "tacc-d1", date: "2026-11-18T09:00:00.000Z", mood: 5, anxiety: 4, sleep: 6, energy: 5, note: "voce per il taccuino" }];
NP.app.saveDiary();
navigate("#/relazione");
ok(!!document.getElementById("reportDomande"), "la relazione mostra le domande scritte");
const casellaPersonale = document.querySelector("#reportDomande input[data-domanda]");
ok(!!casellaPersonale && casellaPersonale.checked, "prima del PDF la domanda è inclusa");
ok(/Che cosa posso fare se arriva la sera\?/.test(document.getElementById("reportBody").textContent), "e compare nel testo della relazione");
ok(/Le domande che ho scritto:/.test(document.getElementById("reportBody").textContent), "sotto le domande generate, con un'etichetta chiara");
casellaPersonale.checked = false;
casellaPersonale.dispatchEvent(new window.Event("change", { bubbles: true }));
ok(!/Che cosa posso fare se arriva la sera\?/.test(document.getElementById("reportBody").textContent), "togliendola, sparisce dal testo");
ok(!/Le domande che ho scritto:/.test(document.getElementById("reportBody").textContent), "e l'etichetta sparisce con lei");
casellaPersonale.checked = true;
casellaPersonale.dispatchEvent(new window.Event("change", { bubbles: true }));
ok(/Che cosa posso fare se arriva la sera\?/.test(document.getElementById("reportBody").textContent), "rimettendola, torna al suo posto");

const idPersonale = NP.app.state.domandePersonali[0].id;
const pdfConPersonale = NP.reportPdf.generate({ personali: [idPersonale] });
const pdfSenzaPersonale = NP.reportPdf.generate({ personali: [] });
const testoConPersonale = Buffer.from(pdfConPersonale).toString("latin1");
const testoSenzaPersonale = Buffer.from(pdfSenzaPersonale).toString("latin1");
ok(/Che cosa posso fare se arriva la sera\?/.test(testoConPersonale), "il PDF scelto contiene la domanda scritta");
ok(!/Che cosa posso fare se arriva la sera\?/.test(testoSenzaPersonale), "il PDF senza quella casella non la contiene");

navigate("#/scheda");
const caselleScheda = Array.prototype.slice.call(document.querySelectorAll('#schedaScelte input[data-gruppo="domande"]'));
const indiceTua = caselleScheda.findIndex(function (c) {
  return /\(tua\)/.test(c.closest(".report-opzione").textContent);
});
ok(indiceTua >= 0, "la scheda mette le domande scritte accanto a quelle generate, segnate come tue");
caselleScheda[indiceTua].checked = true;
caselleScheda[indiceTua].dispatchEvent(new window.Event("change", { bubbles: true }));
ok(/Che cosa posso fare se arriva la sera\?/.test(document.getElementById("schedaBody").textContent), "e scegliendola entra nella scheda");

NP.app.state.domandePersonali = [];
NP.app.saveDomandePersonali();
NP.app.state.diary = diarioPrimaScheda;
NP.app.saveDiary();

/* Percorso e sedute ------------------------------------------------------- */

navigate("#/percorso");
ok(document.querySelectorAll(".tl-item").length === 8, "il percorso mostra otto tappe");

const toggle = document.querySelector(".module-toggle");
toggle.click();
ok(document.querySelector(".module-body").classList.contains("is-open"), "la tappa si apre");

navigate("#/sedute");
ok(document.querySelectorAll(".agenda").length === 7, "le sette sedute mostrano l'agenda");

/* Palestra ---------------------------------------------------------------- */

navigate("#/palestra");
ok(document.getElementById("mixBtn"), "la Palestra propone una sessione mista");
document.getElementById("mixBtn").click();
ok(document.querySelector(".quiz-q"), "la sessione di quiz è iniziata");
const opt = document.querySelector(".quiz-opt");
opt.click();
ok(document.querySelector(".quiz-feedback"), "la risposta mostra la spiegazione");

/* Neura ------------------------------------------------------------------- */

navigate("#/neura");
ok(document.getElementById("chatLog"), "la chat di Neura è presente");
ok(!!document.getElementById("voiceSelect"), "la pagina Neura offre la scelta della voce");
ok(typeof NP.neuraUI.voceAttuale === "function", "la voce migliore viene scelta automaticamente");
ok(NP.neuraUI.mancanoItaliane() === true, "il test riconosce un sistema senza voci italiane");
const voceRipiego = NP.neuraUI.voceAttuale();
ok(!!voceRipiego && !/^it/i.test(voceRipiego.lang), "senza voci italiane la lettura usa la migliore disponibile");
const voiceAiuto = document.getElementById("voiceAiuto");
ok(!!voiceAiuto && voiceAiuto.hidden === false, "la scheda Voce spiega che manca una voce italiana");
ok(/non offre voci italiane/.test(voiceAiuto.textContent), "l'avviso lo dice a parole chiare");
ok(/Aggiungi voci|Gestisci voci|espeak-ng|Sintesi vocale/.test(voiceAiuto.textContent), "l'avviso dà i passaggi del sistema in uso");
ok(!!document.getElementById("voiceProva"), "la voce di ripiego si può ascoltare");
ok(!!document.getElementById("voiceRileggi"), "l'elenco delle voci si può rileggere senza riaprire il programma");
const voiceSpiega = document.getElementById("voiceSpiega");
ok(!!voiceSpiega && voiceSpiega.hidden === false, "la scheda Voce spiega la differenza fra browser e programma");
ok(/Chrome ed Edge/.test(voiceSpiega.textContent) && /programma installato non vede/.test(voiceSpiega.textContent), "la spiegazione nomina le voci online del browser");
document.getElementById("voiceRileggi").click();
ok(/Voci lette dal sistema: 2/.test(document.getElementById("voiceNote").textContent), "rileggere l'elenco aggiorna il conteggio delle voci");

const input = document.getElementById("neuraInput");
const form = document.getElementById("chatForm");
input.value = "che cos'è l'ansia?";
form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));

setTimeout(async function () {
  const log = document.getElementById("chatLog");
  ok(log.textContent.indexOf("ansia") >= 0, "Neura risponde nella chat");
  ok(log.textContent.indexOf("In pratica") >= 0, "la risposta include passi pratici");

  /* Diario ---------------------------------------------------------------- */

  navigate("#/diario");
  ok(document.getElementById("diaryForm"), "il diario mostra il modulo");
  document.getElementById("dNote").value = "Giornata di prova";
  document.getElementById("diaryForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  ok(NP.app.state.diary.length === 1, "la voce di diario viene salvata");

  /* Licenze e backup ------------------------------------------------------ */

  navigate("#/licenze");
  ok(document.body.textContent.indexOf("Danilo D'Auria") >= 0, "la pagina licenze attribuisce l'opera");
  ok(document.body.textContent.indexOf("CC BY-NC-SA 4.0") >= 0, "la pagina licenze cita la licenza dei contenuti");
  ok(document.getElementById("backupBtn"), "è disponibile l'esportazione del backup");
  ok(!!document.getElementById("copieScelta"), "si sceglie quante copie automatiche tenere");
  const cartaSpazio = document.getElementById("spazioDati");
  ok(!!cartaSpazio && /MB/.test(cartaSpazio.textContent), "la pagina dice quanto spazio occupano tutti i dati");

  /* Nutrizione e installazione -------------------------------------------- */

  navigate("#/nutrizione");
  ok(document.body.textContent.indexOf("Dietista") >= 0, "la sezione nutrizione spiega chi è il dietista");
  ok(document.body.textContent.indexOf("112") >= 0, "la sezione nutrizione indica il 112");
  ok(document.querySelectorAll(".card").length >= 8, "la sezione nutrizione compone le schede");

  navigate("#/installa");
  ok(!!document.getElementById("ollamaCheck"), "la pagina installa offre la verifica di Ollama");
  ok(document.body.textContent.indexOf("Ollama") >= 0, "la pagina installa descrive il modello locale");

  /* Tema ------------------------------------------------------------------ */

  /* Barra di stato -------------------------------------------------------- */

  ok(!!document.getElementById("statusBar"), "la barra di stato è presente in alto");
  ok(/installata|programma|browser/i.test(document.getElementById("statusMode").textContent), "la barra dichiara dove gira il programma");
  ok(/Microfono/i.test(document.getElementById("statusMicText").textContent), "la barra mostra lo stato del microfono");
  ok(!!document.getElementById("statusBack") && !!document.getElementById("statusStop"), "la barra offre indietro e stop audio");
  document.getElementById("statusHelp").click();
  ok(document.getElementById("statusPanel").hidden === false, "il pannello si apre al tocco");
  ok(/112/.test(document.getElementById("statusPanel").textContent) && /1522/.test(document.getElementById("statusPanel").textContent), "l'aiuto immediato mostra 112 e 1522");
  document.getElementById("statusMode").click();
  ok(/Ollama|intelligenza artificiale/i.test(document.getElementById("statusPanel").textContent), "il pannello spiega l'IA locale e la modalità d'uso");

  // Con un modello installato il chip dice «pronta» e il nome tecnico resta nel
  // pannello: la barra deve essere leggibile senza sapere cosa sia un modello.
  const pannello = function () { return document.getElementById("statusPanel"); };
  const apriModo = function () {
    if (pannello().hidden) document.getElementById("statusMode").click();
  };

  NP.ambiente.tags = function () { return Promise.resolve({ ok: true, models: [{ name: "llama3.2:3b" }] }); };
  apriModo();
  document.querySelector("#statusPanel [data-ai-check]").click();
  await new Promise(function (r) { setTimeout(r, 60); });
  const chipPronta = document.getElementById("statusAiText").textContent;
  ok(chipPronta === "IA locale: pronta", "con un modello il chip dice «IA locale: pronta»");
  ok(!/llama/.test(chipPronta), "il nome del modello non sta nel chip");
  ok(document.getElementById("statusAiDot").getAttribute("data-state") === "ok", "con un modello il puntino è verde");
  apriModo();
  ok(/Modello in uso:/.test(pannello().textContent) && /llama3\.2:3b/.test(pannello().textContent), "il pannello dice «Modello in uso: …» con il nome");

  NP.ambiente.tags = function () { return Promise.resolve({ ok: false }); };
  apriModo();
  document.querySelector("#statusPanel [data-ai-check]").click();
  await new Promise(function (r) { setTimeout(r, 60); });
  ok(document.getElementById("statusAiText").textContent === "IA locale: essenziale", "senza Ollama il chip dice «IA locale: essenziale»");
  ok(document.getElementById("statusAiDot").getAttribute("data-state") === "attesa", "senza modello il puntino è ambra");
  apriModo();
  ok(!/da installare/.test(pannello().textContent), "il pannello non dice più «da installare»");
  if (!pannello().hidden) document.getElementById("statusMode").click();
  ok(pannello().hidden === true, "il pannello si richiude");
  ok(!!document.getElementById("statusOs"), "la barra mostra il sistema in uso con un pulsante");
  document.getElementById("statusOs").click();
  ok(/Sistema in uso/.test(document.getElementById("statusPanel").textContent), "il pannello dice su quale sistema gira il programma");
  ok(/Voci del dispositivo/.test(document.getElementById("statusPanel").textContent), "il pannello conta le voci disponibili");
  ok(/voci naturali/.test(document.getElementById("statusPanel").textContent), "il pannello Sistema cita le voci naturali del programma");
  ok(!/Nel browser Chrome ed Edge aggiungono/.test(document.getElementById("statusPanel").textContent), "il pannello non contiene più la frase sgrammaticata sul browser");
  document.getElementById("statusOs").click();

  const before = document.documentElement.getAttribute("data-theme");
  document.getElementById("themeBtn").click();
  const after = document.documentElement.getAttribute("data-theme");
  ok(before !== after, "il pulsante cambia tema");

  /* Voce naturale (solo nel programma installato) ------------------------- */

  const chiamateVoce = { scarica: 0, pronuncia: 0, rimuovi: 0, ultimoRitmo: null, ultimaVoce: null, installate: [], voceUsate: [] };
  const vociStato = function () {
    return [
      { id: "paola", nome: "Paola", genere: "femminile", mb: 61, mbReale: 61, installata: chiamateVoce.installate.indexOf("paola") !== -1 },
      { id: "riccardo", nome: "Riccardo", genere: "maschile", mb: 27, mbReale: 27, installata: chiamateVoce.installate.indexOf("riccardo") !== -1 }
    ];
  };
  const audioRiprodotti = [];
  window.Audio = function (src) {
    this.src = src;
    const audio = this;
    this.play = function () {
      audioRiprodotti.push(src);
      // Come un audio vero: quando finisce lo dice, così si passa alla voce
      // successiva del confronto.
      if (typeof audio.onended === "function") setTimeout(function () { if (typeof audio.onended === "function") audio.onended(); }, 0);
      return Promise.resolve();
    };
    this.pause = function () {};
  };
  if (window.URL) {
    window.URL.createObjectURL = function () { return "blob:voce"; };
    window.URL.revokeObjectURL = function () {};
  }
  window.npDesktop = {
    platform: "win32",
    sistema: { impostazioniVoce: function () { return Promise.resolve({ ok: true }); } },
    voceNaturale: {
      stato: function () {
        const voci = vociStato();
        return Promise.resolve({ ok: true, disponibile: true, installata: voci.some(function (v) { return v.installata; }), peso: 86, spazio: 127, voci: voci });
      },
      scarica: function (id) {
        chiamateVoce.scarica++;
        chiamateVoce.ultimaVoce = id;
        if (chiamateVoce.installate.indexOf(id) === -1) chiamateVoce.installate.push(id);
        const voci = vociStato();
        return Promise.resolve({ ok: true, disponibile: true, installata: true, voce: id, peso: 86, spazio: 127, voci: voci });
      },
      pronuncia: function (testo, passo, voce) {
        chiamateVoce.pronuncia++;
        chiamateVoce.ultimoRitmo = passo;
        chiamateVoce.ultimaVoceNaturale = voce;
        chiamateVoce.voceUsate.push(voce);
        return Promise.resolve({ ok: true, wav: [82, 73, 70, 70] });
      },
      rimuoviVoce: function (id) {
        chiamateVoce.rimuoviVoce = (chiamateVoce.rimuoviVoce || 0) + 1;
        chiamateVoce.voceRimossa = id;
        chiamateVoce.installate = chiamateVoce.installate.filter(function (v) { return v !== id; });
        const voci = vociStato();
        return Promise.resolve({ ok: true, disponibile: true, installata: voci.some(function (v) { return v.installata; }), spazio: voci.some(function (v) { return v.installata; }) ? 127 : 0, liberati: 61, voci: voci });
      },
      rimuovi: function () {
        chiamateVoce.rimuovi++;
        chiamateVoce.installate = [];
        return Promise.resolve({ ok: true, disponibile: true, installata: false, voci: vociStato() });
      },
      onProgresso: function () {}
    }
  };

  navigate("#/neura");
  await new Promise(function (r) { setTimeout(r, 30); });
  ok(!!document.getElementById("voiceNaturale"), "nel programma la scheda Voce propone la voce naturale");
  ok(/facoltativa/.test(document.getElementById("voiceNaturaleNota").textContent), "la nota dice che è facoltativa");
  ok(/86 MB/.test(document.getElementById("voiceNaturaleNota").textContent), "la nota dice quanto pesa, una volta sola");

  const pulsantiVoce = document.querySelectorAll("#voiceNaturaleVoci [data-voce]");
  ok(pulsantiVoce.length === 2, "la scheda Voce offre due voci naturali, una accanto all'altra");
  ok(/Riccardo/.test(document.getElementById("voiceNaturaleVoci").textContent) && /27 MB/.test(document.getElementById("voiceNaturaleVoci").textContent), "la seconda voce dice nome, genere e peso");

  document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.scarica === 1 && chiamateVoce.ultimaVoce === "paola", "il pulsante scarica la voce scelta");
  ok(!!document.querySelector('#voiceSelect option[value="__naturale__:paola"]'), "la voce installata entra nell'elenco");
  ok(/Paola/.test(document.getElementById("voiceNaturaleNota").textContent), "la scheda conferma quale voce è pronta");

  document.querySelector('#voiceNaturaleVoci [data-voce="riccardo"]').click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.scarica === 2 && chiamateVoce.ultimaVoce === "riccardo", "si aggiunge la seconda voce senza riscaricare il motore");
  ok(!!document.querySelector('#voiceSelect option[value="__naturale__:riccardo"]'), "anche la voce maschile entra nell'elenco");
  ok(/61 MB/.test(document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').textContent) && /27 MB/.test(document.querySelector('#voiceNaturaleVoci [data-voce="riccardo"]').textContent), "ogni voce installata dice quanto spazio occupa davvero");
  ok(/127 MB/.test(document.getElementById("voiceNaturaleNota").textContent), "la scheda dice quanto occupano insieme, motore compreso");

  // Confronto: la stessa frase con una voce e poi con l'altra, in ordine.
  const confronta = document.getElementById("voiceNaturaleConfronta");
  ok(!!confronta && !confronta.hidden, "con due voci installate compare «Confronta le voci»");
  ok(/Confronta/.test(confronta.textContent), "il pulsante dice a cosa serve");
  const primaDelConfronto = chiamateVoce.voceUsate.length;
  confronta.click();
  await new Promise(function (r) { setTimeout(r, 120); });
  const usate = chiamateVoce.voceUsate.slice(primaDelConfronto);
  ok(usate.length === 2 && usate[0] === "paola" && usate[1] === "riccardo", "il confronto fa parlare le due voci una dopo l'altra");
  ok(/pronte/.test(document.getElementById("voiceNaturaleNota").textContent), "a confronto finito torna la nota con i pesi");

  const cursore = document.getElementById("voiceRitmo");
  ok(!!cursore, "la scheda Voce ha il cursore della velocità");
  ok(/100%/.test(document.getElementById("voiceRitmoValore").textContent), "il cursore parte dal passo normale");
  cursore.value = "1.3";
  cursore.dispatchEvent(new window.Event("input"));
  ok(/130%/.test(document.getElementById("voiceRitmoValore").textContent), "il cursore mostra la velocità scelta");

  NP.neuraUI.speak("<p>Ecco come suono con la voce naturale.</p>");
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.pronuncia >= 1, "la lettura passa dalla voce naturale");
  ok(chiamateVoce.ultimoRitmo === 1.3, "la voce naturale riceve la velocità scelta");
  ok(chiamateVoce.ultimaVoceNaturale === "riccardo", "la lettura usa la voce appena scelta");

  document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').click();
  await new Promise(function (r) { setTimeout(r, 40); });
  NP.neuraUI.speak("<p>Provo l'altra voce.</p>");
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.ultimaVoceNaturale === "paola", "si può tornare alla voce femminile in un clic");

  document.querySelector('#voiceNaturaleVoci [data-rimuovi="paola"]').click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.rimuoviVoce === 1 && chiamateVoce.voceRimossa === "paola", "si può togliere una sola voce");
  ok(/Installa Paola/.test(document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').textContent), "la voce tolta torna da installare");
  ok(/27 MB/.test(document.querySelector('#voiceNaturaleVoci [data-voce="riccardo"]').textContent), "la voce rimasta continua a dire quanto pesa");
  ok(!!document.querySelector('#voiceSelect option[value="__naturale__:riccardo"]'), "l'altra voce resta installata");
  NP.neuraUI.speak("<p>Continuo con la voce rimasta.</p>");
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.ultimaVoceNaturale === "riccardo", "la lettura continua con la voce rimasta");
  NP.neuraUI.stop();
  ok(audioRiprodotti.length >= 1, "l'audio prodotto viene riprodotto");
  NP.neuraUI.stop();

  document.getElementById("voiceNaturaleRimuovi").click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.rimuovi === 1, "la voce naturale si può togliere");
  ok(!document.querySelector('#voiceSelect option[value="__naturale__:paola"]'), "tolte le voci, l'elenco torna alle voci del sistema");
  ok(document.querySelectorAll("#voiceNaturaleVoci [data-voce]").length === 2, "dopo la rimozione le due voci tornano da installare");
  ok(document.querySelectorAll("#voiceNaturaleVoci [data-rimuovi]").length === 0, "senza voci installate non resta alcun «Togli»");
  ok(document.getElementById("voiceNaturaleConfronta").hidden === true, "con una voce sola il confronto non compare");

  // Un download può arrivare in fondo e poi fallire — è quello che succede
  // quando il file sul server non è più quello previsto — e prima la scheda
  // restava ferma sull'ultima percentuale, perché il ramo d'errore usava una
  // variabile che non esiste. Deve dire il motivo e lasciare la voce da
  // installare, non finta installata.
  const scaricaBuona = window.npDesktop.voceNaturale.scarica;
  window.npDesktop.voceNaturale.scarica = function () {
    chiamateVoce.scarica++;
    return Promise.resolve({ ok: false, errore: "il file scaricato non è quello previsto: 63.221.984 byte invece di 63.511.038" });
  };
  document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(/non è quello previsto/.test(document.getElementById("voiceNaturaleNota").textContent), "se il download fallisce la scheda dice il motivo, invece di restare al 100%");
  ok(/Installa Paola/.test(document.querySelector('#voiceNaturaleVoci [data-voce="paola"]').textContent), "e la voce resta da installare, non compare fra quelle pronte");
  window.npDesktop.voceNaturale.scarica = scaricaBuona;

  // Su Mac il motore locale non esiste: la scheda deve mandare alle voci
  // «Premium» di Apple invece di offrire un download che non funzionerebbe.
  window.npDesktop.voceNaturale.stato = function () {
    return Promise.resolve({ ok: true, disponibile: false, installata: false, motivo: "darwin-arm64" });
  };
  navigate("#/");
  navigate("#/neura");
  await new Promise(function (r) { setTimeout(r, 40); });
  const notaMac = document.getElementById("voiceNaturaleNota");
  ok(/Premium/.test(notaMac.textContent) && /Apple/.test(notaMac.textContent), "su Mac la scheda indica le voci Premium di Apple");
  ok(document.querySelectorAll("#voiceNaturaleVoci [data-voce]").length === 0, "su Mac non compare un pulsante di download che non servirebbe");
  ok(NP.neuraUI.ritmo() === 1.3, "la velocità scelta resta memorizzata fra una visita e l'altra");

  /* Programma installato: numeri di telefono e PDF ------------------------- */

  // Nel programma desktop non c'è un telefono da chiamare: il numero si copia.
  const copiati = [];
  window.npDesktop.sistema = window.npDesktop.sistema || {};
  window.npDesktop.sistema.copia = function (t) { copiati.push(t); return Promise.resolve({ ok: true }); };
  navigate("#/sicurezza");
  const numeroTel = document.querySelector('#app a[href^="tel:"]');
  ok(!!numeroTel, "la pagina sicurezza offre un numero da chiamare");
  const clicTel = new window.MouseEvent("click", { bubbles: true, cancelable: true });
  numeroTel.dispatchEvent(clicTel);
  await new Promise(function (r) { setTimeout(r, 20); });
  ok(clicTel.defaultPrevented, "nel programma installato il clic sul numero non tenta una chiamata impossibile");
  ok(copiati.length === 1 && /\d/.test(copiati[0]), "il numero viene copiato negli appunti");
  ok(/Numero copiato/.test(document.getElementById("toast").textContent), "un avviso dice che il numero è stato copiato");

  delete window.npDesktop.sistema.copia;
  const clicTelBrowser = new window.MouseEvent("click", { bubbles: true, cancelable: true });
  document.querySelector('#app a[href^="tel:"]').dispatchEvent(clicTelBrowser);
  ok(!clicTelBrowser.defaultPrevented, "nel browser il numero resta un collegamento telefonico");

  /* Azzerare i dati, dal colloquio --------------------------------------- */

  // Azzerare non deve richiedere di cercare la pagina Licenze: il pulsante sta
  // sotto la domanda, e chiama la stessa funzione che usa quella pagina.
  navigate("#/colloquio");
  const azzera = document.getElementById("restartBtn");
  ok(!!azzera, "il colloquio offre un pulsante per azzerare i dati");
  ok(/Azzera e ricomincia/.test(azzera.textContent), "il pulsante dice cosa fa");
  ok(typeof NP.app.cancellaDati === "function", "l'azzeramento è una funzione sola, condivisa con la pagina Licenze");
  ok(typeof NP.app.esportaBackup === "function", "il backup è una funzione sola, condivisa con la pagina Licenze");
  const diarioPrima = NP.app.state.diary.length;
  const rispostePrima = Object.keys(NP.app.state.intake.answers).length;
  ok(diarioPrima >= 1 && rispostePrima >= 1, "prima di azzerare ci sono dati da cancellare");

  // Azzerare non deve cancellare senza domanda: prima si offre il backup.
  azzera.click();
  const scelta = document.getElementById("restartBtnScelta");
  ok(!!scelta && scelta.hidden === false, "azzerare chiede prima se salvare un backup");
  ok(/backup/i.test(scelta.textContent) && /reimporta/.test(scelta.textContent), "la scelta spiega cosa contiene il file e dove si reimporta");
  ok(Object.keys(NP.app.state.intake.answers).length === rispostePrima, "finché non si sceglie, le risposte restano");

  document.getElementById("restartBtnAnnulla").click();
  ok(scelta.hidden === true && document.getElementById("restartBtn").hidden === false, "«Annulla» richiude la scelta senza cancellare");
  ok(Object.keys(NP.app.state.intake.answers).length === rispostePrima, "annullare non tocca i dati");

  /* Copia automatica nel browser ----------------------------------------- */

  ok(typeof NP.app.salvaCopia === "function" && typeof NP.app.copieAutomatiche === "function", "c'è una copia automatica dei dati");
  ok(NP.app.salvaCopia(false) === true, "la copia del giorno si crea al primo avvio con dei dati");
  ok(NP.app.salvaCopia(false) === false, "nello stesso giorno non si ripete");
  ok(NP.app.copieAutomatiche().length === 1, "una copia al giorno, non una a ogni clic");

  // Quante copie tenere lo decide chi usa il programma: un diario lungo pesa.
  ok(NP.app.copieMassimo() === 3, "di copie se ne tengono tre, salvo scelta diversa");

  // Lo spazio si conta su tutti i dati, non solo sulle copie.
  const tutto = NP.app.spazioDati();
  ok(tutto.totale > 0 && tutto.limite > 0, "si misura lo spazio di tutti i dati dell'app");
  ok(tutto.totale >= NP.app.spazioCopie().totale, "il totale comprende anche le copie automatiche");
  ok(tutto.perChiave.length >= 2 && /Colloquio|Diario|Copie/.test(tutto.perChiave.map(function (v) { return v.nome; }).join(" ")), "le voci hanno un nome leggibile, non la chiave tecnica");
  ok(tutto.quota > 0 && tutto.quota < 1, "la quota rispetto al limite si calcola");
  const spazio = NP.app.spazioCopie();
  ok(spazio.totale > 0 && spazio.pesi.length === 1, "lo spazio occupato si misura sulle copie vere");
  ok(NP.app.fmtBytes(2048) === "2 KB" && NP.app.fmtBytes(3145728) === "3,0 MB", "lo spazio si legge in KB o MB, con la virgola italiana");
  ok(NP.app.impostaCopieMassimo(7) === 7 && NP.app.copieMassimo() === 7, "il numero di copie si può cambiare");
  ok(NP.app.impostaCopieMassimo(99) === 7, "il numero resta dentro il massimo consentito");
  ok(NP.app.impostaCopieMassimo(1) === 1 && NP.app.copieAutomatiche().length === 1, "riducendo il numero, le copie in più si tolgono subito");
  ok(NP.app.impostaCopieMassimo(3) === 3 && NP.app.copieMassimo() === 3, "si può tornare a tre");

  // Rifare il colloquio capita più spesso che cancellare tutto: deve costare
  // solo il colloquio, non il diario e i questionari già compilati.
  document.getElementById("restartBtn").click();
  const soloColloquio = document.getElementById("restartBtnSolo");
  ok(!!soloColloquio && /Azzera solo il colloquio/.test(soloColloquio.textContent), "si può azzerare solo il colloquio");
  ok(typeof NP.app.cancellaColloquio === "function", "anche questo azzeramento è una funzione sola");
  soloColloquio.click();
  ok(Object.keys(NP.app.state.intake.answers).length === 0, "azzerare solo il colloquio svuota le risposte");
  ok(NP.app.state.diary.length === diarioPrima, "il diario resta intatto");
  ok(!!document.getElementById("consentBox"), "il colloquio riparte dal consenso, da confermare di nuovo");
  const consensoDopo = document.getElementById("consentBox");
  consensoDopo.checked = true;
  consensoDopo.dispatchEvent(new window.Event("change", { bubbles: true }));
  ok(Object.keys(NP.app.state.intake.answers).length === 1, "il colloquio si ricomincia subito, senza altri passaggi");

  const blobPreparati = [];
  window.URL.createObjectURL = function (blob) { blobPreparati.push(blob); return "blob:finto"; };
  window.URL.revokeObjectURL = function () {};

  document.getElementById("restartBtn").click();
  const scarica = document.getElementById("restartBtnBackup");
  ok(!!scarica && /Scarica il backup e azzera/.test(scarica.textContent), "la scelta offre di scaricare il backup e poi azzerare");
  ok(!!document.getElementById("restartBtnSenza"), "si può anche azzerare senza backup, e il pulsante lo dice");
  scarica.click();
  ok(blobPreparati.length === 1, "il backup viene davvero preparato come file");
  ok(Object.keys(NP.app.state.intake.answers).length === 0, "dopo il backup le risposte vengono azzerate");
  ok(NP.app.state.diary.length === 0, "il diario sparisce con le risposte");
  const rimaste = Object.keys(window.localStorage).filter(function (k) { return k.indexOf(NP.app.PREFIX) === 0; }).sort();
  const attese = [NP.app.PREFIX + "copie", NP.app.PREFIX + "copieMax"].sort();
  ok(rimaste.join(",") === attese.join(","), "azzerare toglie i dati e lascia solo le copie e la preferenza (" + rimaste.length + " chiavi)");
  ok(!!document.getElementById("consentBox"), "dopo l'azzeramento si riparte dalla prima domanda");

  // La rete sotto l'azzeramento: la copia sopravvive e riporta indietro i dati.
  ok(NP.app.copieAutomatiche().length >= 1, "l'azzeramento non porta via la copia automatica");
  ok(NP.app.copieAutomatiche()[0].dati.diary.length === diarioPrima, "la copia contiene i dati com'erano prima dell'azzeramento");
  // Prima di sostituire i dati si vede cosa cambierebbe.
  const confronto = NP.app.confrontoCopia(0);
  ok(!!confronto && Array.isArray(confronto.voci), "la copia si confronta con i dati attuali");
  ok(confronto.voci.some(function (v) { return v.cosa === "Voci di diario" && v.ora === 0 && v.copia === diarioPrima; }), "il confronto dice che il diario passerebbe da 0 a " + diarioPrima);

  // L'anteprima non deve tacere su niente di ciò che il ripristino riscrive.
  const campiCoperti = NP.app.campiCopia.map(function (c) { return c[2]; });
  NP.app.campiRipristinati.forEach(function (campo) {
    ok(campiCoperti.indexOf(campo) >= 0, "l'anteprima nomina anche «" + campo + "»");
  });

  navigate("#/licenze");
  ok(!!document.querySelector("[data-copia]"), "il ripristino si raggiunge dalla pagina Licenze");
  document.querySelector("[data-copia]").click();
  const anteprima = document.getElementById("copiaAnteprima");
  ok(!!anteprima, "prima di ripristinare compare l'anteprima");
  ok(/da 0 a 1/.test(anteprima.textContent), "l'anteprima dice cosa cambierebbe");
  ok(/i dati di adesso diventano una copia/.test(anteprima.textContent), "l'anteprima promette la copia di sicurezza prima del ripristino");
  ok(/Tema e numero di copie non vengono toccati/.test(anteprima.textContent), "l'anteprima dice anche cosa il ripristino non tocca");
  document.getElementById("copiaAnnulla").click();
  ok(!document.getElementById("copiaAnteprima") && NP.app.state.diary.length === 0, "«Annulla» chiude l'anteprima senza toccare i dati");
  document.querySelector("[data-copia]").click();
  document.getElementById("copiaConferma").click();
  ok(NP.app.state.diary.length === diarioPrima, "confermando, i dati tornano al loro posto");

  // Un ripristino sbagliato deve potersi annullare: prima di sostituire, i dati
  // di adesso diventano una copia.
  const paginaDiario = function (id, giorno, testo) {
    return { id: id, date: giorno, mood: 3, anxiety: 4, sleep: 6, energy: 5, note: testo };
  };
  NP.app.state.diary = [paginaDiario("a1", "2026-11-01T09:00:00.000Z", "prima del ripristino")];
  NP.app.salvaCopia(true);
  NP.app.state.diary = [paginaDiario("b1", "2026-11-02T09:00:00.000Z", "dati di adesso")];
  ok(NP.app.ripristinaCopia(0) === true, "il ripristino si esegue");
  ok(NP.app.state.diary[0].note === "prima del ripristino", "i dati tornano a quelli della copia scelta");
  ok(NP.app.copieAutomatiche()[0].dati.diary[0].note === "dati di adesso", "e i dati di prima restano in una copia, non svaniscono");

  // Quella copia non è una copia di routine: nell'elenco deve riconoscersi come
  // il punto in cui si torna se il ripristino era sbagliato.
  ok(/Prima del ripristino del/.test(NP.app.copieAutomatiche()[0].etichetta), "la copia presa prima di un ripristino porta un'etichetta che la spiega");
  ok(NP.app.copieAutomatiche().slice(1).every(function (c) { return !c.etichetta; }), "e le copie di routine restano senza etichetta");
  navigate("#/licenze");
  ok(/Punto di ritorno/.test(document.body.textContent), "nell'elenco quella copia si riconosce come punto di ritorno");
  ok(/Prima del ripristino del/.test(document.body.textContent), "con la data del ripristino a cui si riferisce");
  ok(NP.app.ripristinaCopia(0) === true && NP.app.state.diary[0].note === "dati di adesso", "quindi un ripristino sbagliato si annulla con un altro ripristino");

  // L'avviso con «Annulla il ripristino»: un clic e si torna ai dati di prima,
  // senza dover riconoscere la copia giusta nell'elenco.
  navigate("#/licenze");
  const avvisoRipristino = document.getElementById("ripristinoAvviso");
  ok(!!avvisoRipristino, "dopo un ripristino compare un avviso con la via d'uscita");
  ok(/Annulla il ripristino/.test(avvisoRipristino.textContent), "l'avviso porta il pulsante per annullarlo");
  ok(/Hai appena ripristinato la copia del/.test(avvisoRipristino.textContent), "e dice quale copia è stata ripristinata");
  document.getElementById("annullaRipristinoBtn").click();
  ok(NP.app.state.diary[0].note === "prima del ripristino", "annullando, i dati tornano a quelli che c'erano prima del ripristino");
  ok(!document.getElementById("ripristinoAvviso"), "e l'avviso sparisce: non c'è più niente da annullare");
  ok(NP.app.annullaRipristino() === false, "un secondo tentativo non fa niente");
  ok(NP.app.ripristinoDaAnnullare() === null, "e non resta un'ancora appesa");


  // Percorso e quiz li riscrive il ripristino: se l'anteprima non li nominasse,
  // si perderebbero esercizi fatti e risposte ai quiz senza vederlo prima.
  NP.app.state.course = { done: [], notes: {} };
  NP.app.state.quizStats = { played: 0, best: 0, correct: 0, total: 0, byCat: {} };
  NP.app.salvaCopia(true);
  NP.app.state.course = { done: ["es-1", "es-2"], notes: {} };
  NP.app.state.quizStats = { played: 1, best: 66, correct: 4, total: 6, byCat: {} };
  const perPercorso = NP.app.confrontoCopia(0);
  ok(perPercorso.voci.some(function (v) { return v.cosa === "Esercizi completati" && v.ora === 2 && v.copia === 0; }), "l'anteprima dice che si perderebbero gli esercizi completati");
  ok(perPercorso.voci.some(function (v) { return v.cosa === "Risposte ai quiz" && v.ora === 6 && v.copia === 0; }), "l'anteprima dice che si perderebbero le risposte ai quiz");

  // «Cosa cambierebbe» serve se dice quali voci, non solo quante: si devono
  // riconoscere la pagina di diario e la scheda del pensiero che si perdono.
  const schedaPensiero = function (id, date, situation) {
    return { id: id, date: date, situation: situation, thought: "non sono capace", emotion: "ansia", intensity: 7, alternative: "" };
  };
  NP.app.state.diary = [{ id: "d1", date: "2026-11-10T09:00:00.000Z", mood: 3, anxiety: 4, sleep: 6, energy: 5, note: "prima" }];
  NP.app.writeJSON("thoughts", [schedaPensiero("t1", "2026-11-11T10:00:00.000Z", "colloquio di lavoro")]);
  NP.app.salvaCopia(true);
  NP.app.state.diary.push({ id: "d2", date: "2026-11-12T09:00:00.000Z", mood: 4, anxiety: 3, sleep: 7, energy: 6, note: "dopo" });
  NP.app.writeJSON("thoughts", [schedaPensiero("t1", "2026-11-11T10:00:00.000Z", "colloquio di lavoro"), schedaPensiero("t2", "2026-11-12T10:00:00.000Z", "telefonata difficile")]);
  const quali = NP.app.confrontoCopia(0).voci;
  const voceDiario = quali.filter(function (v) { return v.cosa === "Voci di diario"; })[0];
  ok(!!voceDiario && voceDiario.ora === 2 && voceDiario.copia === 1, "il diario si confronta voce per voce");
  ok(!!voceDiario.perse && voceDiario.perse.length === 1 && voceDiario.perse[0].data.indexOf("2026-11-12") === 0, "si dice la data della voce che sparirebbe");
  ok(voceDiario.perse[0].testo === "dopo", "della voce si dice anche il testo, non solo la data");
  const vocePensieri = quali.filter(function (v) { return v.cosa === "Schede del pensiero"; })[0];
  ok(!!vocePensieri && vocePensieri.perse.length === 1 && vocePensieri.perse[0].testo === "telefonata difficile", "la scheda del pensiero si riconosce dalla situazione, non dal numero");

  navigate("#/licenze");
  document.querySelector("[data-copia]").click();
  const conQuali = document.getElementById("copiaAnteprima");
  ok(!!conQuali && /12 novembre 2026/.test(conQuali.textContent) && /dopo/.test(conQuali.textContent), "l'anteprima elenca la voce di diario che mancherebbe");
  ok(!!conQuali && /telefonata difficile/.test(conQuali.textContent), "l'anteprima elenca la scheda del pensiero che mancherebbe");
  document.getElementById("copiaAnnulla").click();

  // Ogni questionario con il suo punteggio, non solo il numero di compilati.
  const scala = NP.data.scales[0];
  const adesso = new Date().toISOString();
  NP.app.state.scales = {};
  NP.app.state.scales[scala.id] = { answers: {}, updatedAt: adesso };
  NP.app.salvaCopia(true);
  NP.app.state.scales[scala.id] = { answers: {}, score: 12, band: "lieve", livello: "lieve", doneAt: adesso };
  const voceQuestionari = NP.app.confrontoCopia(0).voci.filter(function (v) { return v.chiave === "questionari"; })[0];
  ok(!!voceQuestionari && Array.isArray(voceQuestionari.questionari) && voceQuestionari.questionari.length === 1, "i questionari si confrontano uno per uno, non solo a numero");
  ok(/^12 su \d+/.test(voceQuestionari.questionari[0].oggi), "l'anteprima dice il punteggio di oggi");
  ok(/^0 su \d+/.test(voceQuestionari.questionari[0].copia), "e quello che c'era nella copia");

  navigate("#/licenze");
  document.querySelector("[data-copia]").click();
  const conPunteggi = document.getElementById("copiaAnteprima");
  ok(!!conPunteggi && /oggi 12 su/.test(conPunteggi.textContent) && conPunteggi.textContent.indexOf(scala.titolo) >= 0, "l'anteprima in pagina elenca il questionario con i due punteggi");

  // Gli stessi punteggi anche come barre: il confronto si vede prima di leggere.
  const grafico = conPunteggi.querySelector(".confronto-grafico");
  ok(!!grafico, "l'anteprima mostra il confronto anche come grafico a barre");
  ok(grafico.getAttribute("aria-hidden") === "true", "il grafico è muto per i lettori di schermo: i punteggi sono già scritti sopra, in chiaro");
  const barre = grafico.querySelectorAll(".confronto-barra");
  ok(barre.length === 2, "due barre per questionario: oggi e nella copia");
  const massimoScala = parseInt(voceQuestionari.questionari[0].oggi.split(" su ")[1], 10);
  ok(barre[0].firstElementChild.style.width === ((12 / massimoScala) * 100).toFixed(1) + "%", "la barra di oggi è proporzionale al punteggio, non disegnata a caso");
  ok(parseFloat(barre[1].firstElementChild.style.width) === 0, "e quella della copia sta a zero, perché lì il questionario era vuoto");
  ok(grafico.textContent.indexOf(scala.titolo) >= 0, "il grafico dice a quale questionario appartiene");
  ok(barre[0].className.indexOf("oggi") >= 0 && barre[1].className.indexOf("copia") >= 0, "le due barre si distinguono per colore, non solo per lunghezza");
  document.getElementById("copiaAnnulla").click();

  // Una copia si può anche portare fuori dal browser, come file.
  const fileCopia = NP.app.datiCopia(0);
  ok(!!fileCopia && fileCopia.app === "Psicologo Digitale", "la copia esportata ha la forma di un backup, quindi si reimporta");
  ok(Array.isArray(fileCopia.diary) && !!fileCopia.intake && !!fileCopia.quizStats, "la copia esportata porta con sé colloquio, diario e quiz");
  ok(fileCopia.copiaAutomatica === true, "il file dice che viene da una copia automatica");
  const quandoCopia = NP.app.copieAutomatiche()[0].quando;
  ok(/^psicologo-digitale-copia-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(NP.app.nomeFileCopia(quandoCopia)), "il nome del file dice giorno e ora, così due copie non si sovrascrivono");
  ok(NP.app.esportaCopia(99) === false, "se la copia non c'è, non s'esporta niente");

  const bottoneEsporta = document.querySelector("[data-copia-esporta]");
  ok(!!bottoneEsporta, "ogni copia ha il pulsante Esporta accanto a Ripristina");
  let esportataQuale = null;
  const esportaVero = NP.app.esportaCopia;
  NP.app.esportaCopia = function (i) { esportataQuale = i; return true; };
  bottoneEsporta.click();
  NP.app.esportaCopia = esportaVero;
  ok(esportataQuale === 0, "«Esporta» esporta proprio la copia a cui sta accanto");

  // Una copia si può togliere da sola: le altre restano, i dati di oggi pure.
  const copiaFinta = function (giorno, nota) {
    return { quando: giorno + "T09:00:00.000Z", dati: { diary: [paginaDiario("c" + giorno, giorno + "T09:00:00.000Z", nota)] } };
  };
  NP.app.writeJSON("copie", [copiaFinta("2026-11-07", "recente"), copiaFinta("2026-11-06", "da cancellare"), copiaFinta("2026-11-05", "vecchia")]);
  const datiPrimaDellaCancellazione = JSON.stringify(NP.app.state.diary);

  // Ogni copia dice quanto spazio libererebbe, e quel numero deve essere quello
  // vero: si misura l'archivio prima e dopo la cancellazione.
  const spazioTre = NP.app.spazioCopie();
  ok(spazioTre.liberabili.length === 3 && spazioTre.liberabili.every(function (b) { return b > 0; }), "ogni copia dice quanto spazio libera se la cancelli");
  const archivioPrima = spazioTre.totaleArchivio;

  ok(NP.app.cancellaCopia(99) === false, "un indice che non esiste non cancella niente");
  ok(NP.app.cancellaCopia(1) === true, "si cancella una copia sola");
  ok(archivioPrima - NP.app.spazioCopie().totaleArchivio === spazioTre.liberabili[1],
    "lo spazio promesso accanto alla copia è quello guadagnato davvero, non una stima");
  const copieDopo = NP.app.copieAutomatiche();
  ok(copieDopo.length === 2, "le copie passano da tre a due");
  ok(/liberati/.test(document.getElementById("toast").textContent) && /\d+ (B|KB|MB) liberati/.test(document.getElementById("toast").textContent), "il messaggio dice quanto spazio è stato liberato");
  const noteCopie = copieDopo.map(function (c) { return c.dati.diary[0].note; });
  ok(noteCopie.indexOf("da cancellare") < 0 && noteCopie.indexOf("recente") >= 0 && noteCopie.indexOf("vecchia") >= 0, "sparisce proprio quella scelta, le altre restano");
  ok(JSON.stringify(NP.app.state.diary) === datiPrimaDellaCancellazione, "i dati attuali non vengono toccati");

  navigate("#/licenze");
  const bottoneCancella = document.querySelector("[data-copia-cancella]");
  ok(!!bottoneCancella, "ogni copia ha il pulsante Cancella accanto agli altri");
  const righeCopie = document.querySelectorAll("[data-copia-cancella]");
  ok(Array.prototype.every.call(righeCopie, function (b) { return /cancellandola liberi/.test(b.parentNode.textContent); }),
    "nell'elenco ogni copia mostra lo spazio che libera se la cancelli");
  let cancellataQuale = null;
  const cancellaVero = NP.app.cancellaCopia;
  NP.app.cancellaCopia = function (i) { cancellataQuale = i; return false; };
  bottoneCancella.click();
  NP.app.cancellaCopia = cancellaVero;
  ok(cancellataQuale === 0, "«Cancella» cancella proprio la copia a cui sta accanto");

  // Pulizia in un gesto: tenere solo la più recente, sapendo quanto si libera.
  const copiaCon = function (giorno, nota) {
    return { quando: giorno + "T09:00:00.000Z", dati: { diary: [paginaDiario("p" + giorno, giorno + "T09:00:00.000Z", nota)] } };
  };
  NP.app.writeJSON("copie", [copiaCon("2026-11-09", "la più recente"), copiaCon("2026-11-08", "vecchia"), copiaCon("2026-11-07", "più vecchia")]);
  const contoPulizia = NP.app.copieDaTenere();
  ok(contoPulizia.quante === 2 && contoPulizia.byte > 0, "la pulizia sa quante copie togliere e quanto libera");
  ok(contoPulizia.resta && contoPulizia.resta.dati.diary[0].note === "la più recente", "e che resta la più recente, non una qualsiasi");
  const archivioPulizia = NP.app.spazioCopie().totaleArchivio;
  const confirmVeroPulizia = window.confirm;
  let chiestoPulizia = "";
  window.confirm = function (msg) { chiestoPulizia = msg; return true; };
  ok(NP.app.cancellaCopieVecchie() === true, "la pulizia si esegue");
  window.confirm = confirmVeroPulizia;
  ok(/2 copie/.test(chiestoPulizia) && /Libera/.test(chiestoPulizia), "la conferma dice quante copie toglie e quanto libera");
  ok(NP.app.copieAutomatiche().length === 1, "resta una copia sola");
  ok(NP.app.copieAutomatiche()[0].dati.diary[0].note === "la più recente", "ed è proprio la più recente");
  ok(archivioPulizia - NP.app.spazioCopie().totaleArchivio === contoPulizia.byte, "lo spazio liberato è quello promesso, non una stima");
  ok(/liberati/.test(document.getElementById("toast").textContent), "il messaggio dice quanto è stato liberato");
  ok(NP.app.cancellaCopieVecchie() === false, "con una copia sola non c'è niente da pulire");

  // Il pulsante in pagina: dice il conto e fa quello che dice.
  NP.app.writeJSON("copie", [copiaCon("2026-11-12", "recentissima"), copiaCon("2026-11-11", "media")]);
  navigate("#/licenze");
  const bottonePulizia = document.getElementById("cancellaCopieVecchie");
  ok(!!bottonePulizia && /libera/.test(bottonePulizia.textContent), "la pagina offre la pulizia con il conto dentro il pulsante");
  ok(/copie più vecchie spariscono|più vecchia sparisce/.test(document.getElementById("pulisciCopie").textContent), "e dice quante copie spariscono");
  window.confirm = function () { return true; };
  bottonePulizia.click();
  window.confirm = confirmVeroPulizia;
  ok(NP.app.copieAutomatiche().length === 1 && NP.app.copieAutomatiche()[0].dati.diary[0].note === "recentissima",
    "cliccandolo resta solo la più recente");
  ok(!document.getElementById("cancellaCopieVecchie"), "e il pulsante sparisce quando non c'è più niente da togliere");

  // Compattare: prima si dice quanto libera, e si tocca solo ciò che è vecchio.
  // Quanto è «vecchio» lo sceglie chi usa l'app, fra 30, 60 e 90 giorni.
  const giorniFa = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
  const scheda = (id, date, situation) => ({ id: id, date: date, situation: situation, thought: "pensiero", emotion: "ansia", intensity: 5, alternative: "" });
  NP.app.state.chat = [{ role: "utente", testo: "ciao" }, { role: "neura", testo: "ciao a te" }];
  const schede = [];
  for (let i = 0; i < 6; i++) schede.push(scheda("a" + i, giorniFa(120), "di quattro mesi fa " + i));
  for (let i = 0; i < 4; i++) schede.push(scheda("b" + i, giorniFa(75), "di due mesi e mezzo " + i));
  for (let i = 0; i < 4; i++) schede.push(scheda("c" + i, giorniFa(45), "di un mese e mezzo " + i));
  for (let i = 0; i < 12; i++) schede.push(scheda("d" + i, giorniFa(0), "recente " + i));
  NP.app.writeJSON("thoughts", schede);

  ok(NP.app.giorniCompatta() === 30, "senza una scelta la soglia è di trenta giorni");
  ok(NP.app.compattaScelte().join(",") === "30,60,90", "le soglie offerte sono trenta, sessanta e novanta giorni");
  const piano = NP.app.pianificaCompatta();
  ok(piano.byte > 0, "prima di compattare si dice quanto spazio si libera");
  ok(piano.giorni === 30 && piano.scelte.join(",") === "30,60,90", "il conto dice con quale soglia sta guardando");
  ok(piano.messaggi === 2, "il conto dice quanti messaggi con Neura si tolgono");
  ok(piano.pensieri === 14, "a trenta giorni si tolgono tutte le schede più vecchie oltre le ultime dieci");
  ok(piano.restano === 12, "restano sempre le ultime dieci schede, più quelle non ancora vecchie");

  ok(NP.app.impostaGiorniCompatta(45) === false, "una soglia non prevista viene rifiutata");
  ok(NP.app.giorniCompatta() === 30, "e non cambia quella in uso");
  ok(NP.app.impostaGiorniCompatta("60") === true, "la soglia si può portare a sessanta giorni");
  ok(NP.app.giorniCompatta() === 60, "la scelta resta scritta, non solo per questa schermata");
  ok(NP.app.pianificaCompatta().pensieri === 10, "a sessanta giorni le schede di un mese e mezzo restano");
  ok(NP.app.impostaGiorniCompatta(90) === true && NP.app.pianificaCompatta().pensieri === 6, "a novanta giorni si tolgono solo quelle di quattro mesi fa");
  NP.app.impostaGiorniCompatta(60);

  navigate("#/licenze");
  const scatolaCompatta = document.getElementById("compattaBox");
  ok(!!scatolaCompatta && /Compatta e libera/.test(scatolaCompatta.textContent), "la pagina mostra quanto libererebbe, nel pulsante stesso");
  const sceltaGiorni = document.getElementById("compattaGiorni");
  ok(!!sceltaGiorni && sceltaGiorni.options.length === 3, "la pagina offre un selettore con le tre soglie");
  ok(sceltaGiorni.value === "60", "il selettore mostra la soglia in uso");
  ok(/più vecchie di 60 giorni/.test(scatolaCompatta.textContent), "il conto sulla pagina usa quella soglia, non un numero fisso");

  // Il selettore deve contare davvero: cambiandolo cambia il conto, subito.
  sceltaGiorni.value = "90";
  sceltaGiorni.dispatchEvent(new window.Event("change"));
  ok(NP.app.giorniCompatta() === 90, "cambiando il selettore la scelta viene registrata");
  const dopoCambio = document.getElementById("compattaBox");
  ok(/più vecchie di 90 giorni/.test(dopoCambio.textContent), "e la pagina si ridisegna con il nuovo conto");
  const selettoreDopo = document.getElementById("compattaGiorni");
  selettoreDopo.value = "60";
  selettoreDopo.dispatchEvent(new window.Event("change"));

  const spazioPrima = NP.app.spazioDati().totale;
  ok(NP.app.compattaDati() === true, "la compattazione si può eseguire");
  ok(NP.app.state.chat.length === 0, "le conversazioni con Neura spariscono");
  const dopoSchede = NP.app.readJSON("thoughts", []);
  ok(dopoSchede.length === 16, "a sessanta giorni restano quindici schede recenti più quella più nuova in coda");
  ok(!dopoSchede.some((s) => s.id === "b0"), "le schede di due mesi e mezzo vengono tolte");
  ok(dopoSchede.some((s) => s.id === "c0"), "quelle di un mese e mezzo restano, perché la soglia scelta è più larga");
  ok(dopoSchede[dopoSchede.length - 1].id === "d11", "resta in coda la scheda più nuova");
  ok(NP.app.spazioDati().totale < spazioPrima, "dopo la compattazione lo spazio occupato cala davvero");
  ok(NP.app.pianificaCompatta().byte === 0, "senza roba vecchia il conto dice zero");

  // Il totale di quanto si è liberato: cresce a ogni compattazione, non si
  // azzera alla successiva e non cambia quando non c'è niente da fare.
  const liberatoPrima = NP.app.liberatoTotale();
  ok(liberatoPrima.volte === 1 && liberatoPrima.byte > 0, "dopo la prima compattazione il totale dice quanto si è liberato, e in quante volte");
  ok(NP.app.compattaDati() === false, "una seconda compattazione non fa niente");
  ok(NP.app.liberatoTotale().byte === liberatoPrima.byte && NP.app.liberatoTotale().volte === 1, "una compattazione a vuoto non gonfia il totale");

  // Un'altra compattazione si somma alla prima invece di sostituirla.
  NP.app.writeJSON("thoughts", [scheda("e0", giorniFa(120), "vecchia"), scheda("e1", giorniFa(120), "vecchia")].concat(NP.app.readJSON("thoughts", [])));
  const piano2 = NP.app.pianificaCompatta();
  ok(piano2.pensieri === 2, "le due schede rimesse in testa sono più vecchie della soglia");
  ok(NP.app.compattaDati() === true, "la seconda compattazione si può eseguire");
  const liberatoDopo = NP.app.liberatoTotale();
  ok(liberatoDopo.volte === 2, "il totale conta due compattazioni");
  ok(liberatoDopo.byte === liberatoPrima.byte + piano2.byte, "e somma i byte di entrambe, invece di tenere solo l'ultima");

  navigate("#/licenze");
  const segnoLiberato = document.getElementById("liberatoTotaleSegno");
  ok(!!segnoLiberato, "la pagina Licenze mostra il totale liberato");
  ok(segnoLiberato.textContent.indexOf(NP.app.fmtBytes(liberatoDopo.byte)) >= 0, "con lo spazio liberato in tutto");
  ok(/con 2 compattazioni/.test(segnoLiberato.textContent), "e in quante compattazioni è stato liberato");

  // Spazio finito: un salvataggio fallito non deve passare inosservato.
  // Qualche scheda vecchia resta a disposizione per far sì che, dopo, ci sia
  // davvero qualcosa da compattare quando si prova il ritentativo.
  NP.app.writeJSON("thoughts", [scheda("f0", giorniFa(120), "vecchia f0"), scheda("f1", giorniFa(120), "vecchia f1"), scheda("f2", giorniFa(120), "vecchia f2")].concat(NP.app.readJSON("thoughts", [])));
  const perso = [paginaDiario("r1", "2026-11-12T09:00:00.000Z", "recuperata")];
  const setItemVero = window.Storage.prototype.setItem;
  Object.defineProperty(window.Storage.prototype, "setItem", {
    configurable: true,
    writable: true,
    value: function () {
      const e = new Error("quota");
      e.name = "QuotaExceededError";
      throw e;
    }
  });
  ok(NP.app.writeJSON("diario", perso) === false, "il salvataggio fallito lo dice a chi lo chiama, invece di sparire");
  ok(NP.app.salvataggioNonRiuscito() === true, "l'app ricorda che l'ultimo salvataggio non è riuscito");
  ok(NP.app.salvataggiPendenti().length === 1 && NP.app.salvataggiPendenti()[0].chiave === "diario",
    "la modifica rifiutata resta in attesa, invece di sparire con l'avviso");
  const toastPieno = document.getElementById("toast");
  ok(/Non c'è spazio per salvare/.test(toastPieno.textContent), "compare un messaggio che parla di spazio esaurito");

  // Il pulsante deve stare proprio dove il problema si vede: chi perde una
  // modifica non deve andare a cercare un'altra pagina.
  const pulsanteToast = toastPieno.querySelector("button.toast-azione");
  ok(!!pulsanteToast, "l'avviso porta un pulsante, non solo una frase");
  ok(/Esporta backup/.test(pulsanteToast.textContent), "che propone subito l'esportazione del backup");
  ok(!/Licenz/.test(toastPieno.textContent), "e non rimanda alla pagina Licenze");

  // Si conta il clic sull'ancora che l'esportazione crea: se il pulsante non
  // arrivasse davvero a scaricare, questo numero resterebbe zero.
  const clickVero = window.HTMLAnchorElement.prototype.click;
  const avevaCreaURL = Object.prototype.hasOwnProperty.call(window.URL, "createObjectURL");
  const creaURLVero = window.URL.createObjectURL;
  let scaricati = 0;
  window.HTMLAnchorElement.prototype.click = function () { scaricati++; };
  window.URL.createObjectURL = function () { return "blob:finto"; };
  pulsanteToast.click();
  ok(scaricati === 1, "cliccandolo si scarica davvero il backup");

  navigate("#/licenze");
  ok(!!document.getElementById("spazioPienoAvviso"), "la pagina Licenze lo ripete in modo stabile, non solo con un messaggio che passa");
  ok(!!document.getElementById("spazioPienoEsporta"), "e anche l'avviso stabile ha il suo pulsante di esportazione");
  scaricati = 0;
  document.getElementById("spazioPienoEsporta").click();
  ok(scaricati === 1, "quel pulsante esporta il backup con un clic");

  ok(NP.app.salvataggiPendenti().length === 1, "esportare con lo spazio ancora pieno non fa perdere la modifica in attesa");

  window.HTMLAnchorElement.prototype.click = clickVero;
  if (avevaCreaURL) window.URL.createObjectURL = creaURLVero;
  else delete window.URL.createObjectURL;

  // Compattando si libera spazio: il salvataggio in sospeso viene ritentato da
  // solo, senza che l'utente debba sapere che esiste un pulsante per farlo.
  Object.defineProperty(window.Storage.prototype, "setItem", { configurable: true, writable: true, value: setItemVero });
  ok(NP.app.compattaDati() === true, "la compattazione si può eseguire anche con un salvataggio in sospeso");
  const diarioRecuperato = NP.app.readJSON("diario", []);
  ok(diarioRecuperato.length === 1 && diarioRecuperato[0].note === "recuperata",
    "dopo la compattazione la modifica in sospeso è stata salvata davvero");
  ok(NP.app.salvataggiPendenti().length === 0, "e non resta più niente in attesa");
  ok(NP.app.salvataggioNonRiuscito() === false, "l'avviso si spegne da solo");
  ok(/è stata salvata/.test(document.getElementById("toast").textContent), "e il messaggio dice che la modifica è tornata");
  navigate("#/licenze");
  ok(!document.getElementById("spazioPienoAvviso"), "l'avviso sparisce dalla pagina appena si torna a salvare");

  // Anche esportare ritenta: chi mette al sicuro una copia si aspetta che la
  // modifica rimasta fuori non resti appesa.
  const perso2 = [paginaDiario("r2", "2026-11-13T09:00:00.000Z", "recuperata esportando")];
  Object.defineProperty(window.Storage.prototype, "setItem", {
    configurable: true, writable: true,
    value: function () { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; }
  });
  ok(NP.app.writeJSON("diario", perso2) === false, "un secondo salvataggio viene rifiutato");
  Object.defineProperty(window.Storage.prototype, "setItem", { configurable: true, writable: true, value: setItemVero });
  navigate("#/licenze");
  const esportaPieno = document.getElementById("spazioPienoEsporta");
  ok(!!esportaPieno, "l'avviso in Licenze è di nuovo al suo posto, con il pulsante");
  scaricati = 0;
  window.HTMLAnchorElement.prototype.click = function () { scaricati++; };
  window.URL.createObjectURL = function () { return "blob:finto"; };
  esportaPieno.click();
  ok(scaricati === 1, "il pulsante esporta il backup");
  const dopoEsporta = NP.app.readJSON("diario", []);
  ok(dopoEsporta.length === 1 && dopoEsporta[0].note === "recuperata esportando",
    "e l'esportazione fa salvare da sola la modifica che era rimasta fuori");
  ok(NP.app.salvataggioNonRiuscito() === false, "l'avviso stabile si spegne");
  navigate("#/licenze");
  ok(!document.getElementById("spazioPienoAvviso"), "e sparisce dalla pagina");
  window.HTMLAnchorElement.prototype.click = clickVero;
  if (avevaCreaURL) window.URL.createObjectURL = creaURLVero;
  else delete window.URL.createObjectURL;

  // Se la copia di sicurezza non si riesce a fare, il ripristino lo chiede prima.
  // Sta in fondo perché provoca di proposito scritture rifiutate.
  NP.app.writeJSON("copie", [{ quando: "2026-11-09T09:00:00.000Z", dati: { diary: [paginaDiario("z0", "2026-11-08T09:00:00.000Z", "copia scelta")] } }]);
  NP.app.state.diary = [paginaDiario("z2", "2026-11-10T09:00:00.000Z", "attuale")];
  const setItemPieno = window.Storage.prototype.setItem;
  Object.defineProperty(window.Storage.prototype, "setItem", {
    configurable: true, writable: true,
    value: function () { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; }
  });
  const confirmVero = window.confirm;
  window.confirm = function () { return false; };
  ok(NP.app.ripristinaCopia(0) === false, "se la copia di sicurezza non riesce, si chiede se procedere");
  ok(NP.app.state.diary[0].note === "attuale", "rifiutando, i dati restano come sono");
  window.confirm = function () { return true; };
  ok(NP.app.ripristinaCopia(0) === true, "accettando, il ripristino procede lo stesso");
  ok(!!NP.app.ripristinoDaAnnullare(), "e resta annullabile anche senza una copia di sicurezza riuscita");
  ok(NP.app.annullaRipristino() === true, "l'annullamento funziona lo stesso, perché i dati di prima sono tenuti in mano");
  ok(NP.app.state.diary[0].note === "attuale", "riportando esattamente i dati che c'erano prima");
  window.confirm = confirmVero;
  Object.defineProperty(window.Storage.prototype, "setItem", { configurable: true, writable: true, value: setItemPieno });

  /* ------------------------------------------------- Chiusura del progetto */

  // Il backup ha una forma dichiarata: un file vecchio si completa, uno di una
  // versione futura si rifiuta. Importare alla cieca è una perdita silenziosa.
  console.log("\nFormato del backup");
  ok(NP.app.versioneBackup === 3, "il formato del backup ha una versione dichiarata");
  NP.app.state.domandePersonali = [{ id: "q-backup", testo: "Domanda nel backup", creato: "2026-11-18T10:00:00.000Z" }];
  NP.app.saveDomandePersonali();
  const raccolto = NP.app.raccogliDati();
  ok(raccolto.version === 3, "ogni file esportato dice quale formato ha");
  ok(!!raccolto.storicoPunteggi && typeof raccolto.storicoPunteggi === "object", "e porta con sé lo storico delle misure");
  ok(Array.isArray(raccolto.domandePersonali) && raccolto.domandePersonali.length === 1, "e le domande scritte per il clinico");
  const vecchio = NP.app.migraBackup({ app: "Psicologo Digitale", diary: [] });
  ok(!vecchio.errore && vecchio.dati.version === 3, "un file senza versione viene riconosciuto come il primo formato e portato a quello attuale");
  ok(vecchio.migrato === true, "e la migrazione lo dice, invece di avvenire di nascosto");
  ok(!!vecchio.dati.storicoPunteggi && Object.keys(vecchio.dati.storicoPunteggi).length === 0, "completando i campi che allora non esistevano, vuoti e non inventati");
  ok(Array.isArray(vecchio.dati.domandePersonali) && vecchio.dati.domandePersonali.length === 0, "anche il taccuino, senza inventare domande");
  const secondo = NP.app.migraBackup({ app: "Psicologo Digitale", version: 2, storicoPunteggi: {} });
  ok(!secondo.errore && secondo.dati.version === 3, "un file del formato precedente viene portato a quello attuale");
  ok(secondo.migrato === true, "e la conversione viene dichiarata");
  const attuale = NP.app.migraBackup({ app: "Psicologo Digitale", version: 3, storicoPunteggi: {}, domandePersonali: [] });
  ok(!attuale.errore && attuale.dati.version === 3, "un file già nel formato attuale viene accettato così com'è");
  ok(attuale.migrato === false, "e non si dichiara convertito: nessuna conversione è avvenuta");
  // Il caso vero: esporto adesso e reimporto lo stesso file. Se il messaggio
  // dicesse «aggiornato al formato attuale» mentirebbe, perché era già così.
  const rientro = NP.app.migraBackup(NP.app.raccogliDati());
  ok(!rientro.errore && rientro.dati.version === NP.app.versioneBackup, "un backup esportato adesso si reimporta senza errori");
  ok(rientro.migrato === false, "e l'import non annuncia un aggiornamento che non c'è stato");
  const futuro = NP.app.migraBackup({ app: "Psicologo Digitale", version: 9 });
  ok(!!futuro.errore, "un file di una versione più recente viene rifiutato, invece di essere letto male");
  ok(/più recente/.test(futuro.errore), "e il messaggio dice perché, così si sa cosa fare");

  console.log("\nPromemoria dell'esportazione");
  window.localStorage.removeItem("psicologo-digitale:v1:ultimoBackup");
  ok(NP.app.ultimoBackup() === null, "senza esportazioni la data non c'è");
  ok(NP.app.giorniSenzaBackup() === null, "e non si inventa un numero di giorni");
  NP.app.state.diary = [paginaDiario("v1", giorniFa(1), "ieri")];
  navigate("#/licenze");
  ok(!!document.getElementById("backupPromemoria"), "la pagina Licenze ricorda che manca un backup");
  ok(/Non hai ancora esportato/.test(document.getElementById("backupPromemoria").textContent), "con una frase, non solo un'icona");
  NP.app.segnaBackup();
  ok(!!NP.app.ultimoBackup(), "esportare registra la data");
  ok(NP.app.giorniSenzaBackup() === 0, "e il conto dei giorni riparte da zero");
  navigate("#/licenze");
  ok(/Ultima esportazione/.test(document.getElementById("backupPromemoria").textContent), "la pagina mostra quando è stato fatto l'ultimo backup");
  ok(/oggi/.test(document.getElementById("backupPromemoria").textContent), "e dice «oggi» quando è di oggi");
  window.localStorage.setItem("psicologo-digitale:v1:ultimoBackup", JSON.stringify(giorniFa(40)));
  ok(NP.app.giorniSenzaBackup() === 40, "il conto dei giorni usa la data salvata");
  navigate("#/licenze");
  ok(/40 giorni fa/.test(document.getElementById("backupPromemoria").textContent), "dopo un mese il promemoria torna a farsi sentire");
  ok(!document.getElementById("spazioPienoAvviso") || document.getElementById("backupPromemoria") !== document.getElementById("spazioPienoAvviso"), "e resta un avviso suo, non il posto dell'avviso sullo spazio pieno");

  // Due settimane affiancate dicono più di un numero solo, e il confronto è
  // aritmetica sui dati della persona, non un'interpretazione.
  console.log("\nRiepilogo dei periodi");
  const voce = function (id, giorni, umore) {
    return { id: id, date: giorniFa(giorni), mood: umore, anxiety: 4, sleep: 6, energy: 5, note: "prova" };
  };
  NP.app.state.diary = [voce("s1", 2, 6), voce("s2", 3, 4), voce("s3", 9, 3), voce("s4", 10, 3)];
  NP.app.writeJSON("thoughts", []);
  const questa = NP.app.statistichePeriodo(7, 0);
  const scorsa = NP.app.statistichePeriodo(7, 7);
  ok(questa.voci === 2 && scorsa.voci === 2, "le voci finiscono ciascuna nel periodo giusto");
  ok(Math.abs(questa.media.umore - 5) < 0.001, "la media dell'umore è quella delle voci del periodo");
  ok(Math.abs(scorsa.media.umore - 3) < 0.001, "e quella della settimana prima non si mescola");

  // Il foglio delle prove promette «diviso quante voci hanno quel valore»: una
  // voce con il campo vuoto non deve abbassare la media a 4, come farebbe
  // contandola zero.
  const diarioRiepilogo = NP.app.state.diary;
  NP.app.state.diary = [
    voce("s5", 1, 7), voce("s6", 2, 5),
    { id: "s7", date: giorniFa(3), anxiety: 4, sleep: 6, energy: 5, note: "senza umore" }
  ];
  const conVoceMuta = NP.app.statistichePeriodo(7, 0);
  ok(conVoceMuta.voci === 3, "una voce senza umore conta lo stesso come voce del diario");
  ok(Math.abs(conVoceMuta.media.umore - 6) < 0.001, "ma non entra nella media dell'umore: 7 e 5 danno 6, non 4");
  NP.app.state.diary = diarioRiepilogo;
  navigate("#/riepilogo");
  ok(/Riepilogo/.test(document.title), "la pagina del riepilogo ha un titolo");
  ok(document.querySelectorAll("#app table tbody tr").length === 4, "mostra le quattro misure del diario affiancate");
  ok(/\+2/.test(document.getElementById("app").textContent), "e la differenza rispetto alla settimana prima, con il segno");
  ok(/non è un giudizio/i.test(document.getElementById("app").textContent), "dichiarando che non è un giudizio");
  ok(/traccia, non come prova/i.test(document.getElementById("app").textContent), "e che con poche voci una media si muove facilmente");
  NP.app.state.diary = [];
  navigate("#/riepilogo");
  ok(/Non ci sono ancora dati/.test(document.getElementById("app").textContent), "senza dati lo dice, invece di mostrare una tabella di trattini");

  // Il periodo si sceglie in pagina e il confronto si stampa con le date: un
  // numero senza il periodo a cui si riferisce non si porta in seduta.
  NP.app.state.diary = [voce("s8", 20, 4)];
  const trenta = NP.app.statistichePeriodo(30, 30);
  ok(trenta.giorni === 30 && /^\d{4}-\d\d-\d\d/.test(trenta.dal) && /^\d{4}-\d\d-\d\d/.test(trenta.al), "la funzione del periodo dice anche le sue date");
  ok(new Date(trenta.al).getTime() - new Date(trenta.dal).getTime() === 30 * 24 * 60 * 60 * 1000, "e sono i trenta giorni dichiarati, non altri");

  navigate("#/riepilogo/30");
  const sceltaPeriodo = document.querySelector(".riepilogo-scelta");
  ok(!!sceltaPeriodo, "il riepilogo lascia scegliere il periodo");
  ok(!!sceltaPeriodo.querySelector('a[href="#/riepilogo"]'), "con i sette giorni a portata di mano");
  ok(!!sceltaPeriodo.querySelector('a[href="#/riepilogo/30"][aria-current="page"]'), "e i trenta giorni segnati come scelti");
  ok(/Ultimi 30 giorni/.test(document.getElementById("app").textContent), "la tabella parla del periodo scelto, non di uno fisso");
  ok(/1 voce di diario/.test(document.getElementById("app").textContent), "una voce di venti giorni fa entra nei trenta");
  const dateScelte = document.querySelector(".riepilogo-date").textContent;
  ok((dateScelte.match(/dal /g) || []).length === 2, "con le date di entrambi i periodi, non di uno solo");

  NP.app.state.diary = [voce("s8", 20, 4), voce("s9", 2, 6)];
  navigate("#/riepilogo");
  ok(!!document.querySelector('a[href="#/riepilogo"][aria-current="page"]'), "tornando ai sette giorni, la scelta si vede");
  ok(/Ultimi 7 giorni/.test(document.getElementById("app").textContent), "e la tabella dice sette");
  ok(/1 voce di diario/.test(document.getElementById("app").textContent), "la voce di venti giorni fa resta fuori dai sette");

  let stampe = 0;
  window.print = function () { stampe++; };
  document.getElementById("stampaRiepilogo").click();
  ok(stampe === 1, "il pulsante stampa apre la stampa del browser");
  NP.app.state.diary = [];

  // La ricerca confronta parole con i testi del programma, tutto sul dispositivo.
  console.log("\nCerca nei contenuti");
  navigate("#/cerca");
  ok(!!document.getElementById("cercaInput"), "la ricerca ha un campo dove scrivere");
  navigate("#/cerca/sonno");
  ok(/\d+ risultat/.test(document.getElementById("app").textContent), "cercando «sonno» escono risultati");
  ok(document.querySelectorAll('#app a[href^="#/manuale/"], #app a[href^="#/esercizi/"]').length > 0, "che portano a capitoli o esercizi");
  ok(!!document.querySelector("#app .cerca-contenuti li p mark"), "anche i contenuti portano l'estratto, non solo il titolo");
  navigate("#/cerca/zxqv");
  ok(/Nessun risultato/.test(document.getElementById("app").textContent), "una parola che non c'è lo dice, invece di una pagina vuota");
  ok(/nessuna parola esce da qui/i.test(document.getElementById("app").textContent), "e ricorda che la ricerca non manda niente fuori");

  // L'estratto è la frase che contiene la parola, non una finestra fissa di
  // caratteri: la frase prima non deve comparire, quella cercata sì, intera.
  // E il titolo del capitolo, già scritto sopra il risultato, non deve
  // finire davanti alla frase come se ne facesse parte («Ansia L'ansia è…»).
  const capitoloProva = NP.data.manuale[0];
  const paragrafiProva = capitoloProva.sezioni[0].p;
  capitoloProva.sezioni[0].p = ["Questa frase resta fuori dall'estratto.", "La frase che conta parla di un ottovolante e finisce qui."];
  navigate("#/cerca/ottovolante");
  const voceProva = Array.prototype.filter.call(document.querySelectorAll("#app .cerca-contenuti li"), function (li) {
    const link = li.querySelector("a");
    return !!link && link.getAttribute("href") === "#/manuale/" + capitoloProva.id;
  })[0];
  const fraseProva = voceProva && voceProva.querySelector("p");
  ok(!!fraseProva && /^(… )?La frase che conta parla di un <mark>ottovolante<\/mark> e finisce qui\./.test(fraseProva.innerHTML), "l'estratto è la frase intera che contiene la parola, senza niente davanti");
  ok(!!fraseProva && !/resta fuori/.test(fraseProva.textContent), "e la frase di prima resta fuori");
  ok(!!fraseProva && fraseProva.textContent.indexOf(capitoloProva.titolo) < 0, "il titolo non è incollato davanti alla frase, che è già scritta sopra");
  ok(!!fraseProva && !/Non è un esame/.test(fraseProva.textContent), "né il titolo della sezione sopra il paragrafo");
  capitoloProva.sezioni[0].p = paragrafiProva;

  // La ricerca copre anche le cose scritte dalla persona, in una sezione sua:
  // diario, schede del pensiero e note del percorso, con un estratto e un
  // collegamento che porta alla voce.
  const esercizioNota = NP.data.percorso.esercizi[0].id;
  NP.app.state.diary = [paginaDiario("pz1", "2026-11-12T09:00:00.000Z", "la zanzara sul muro mi ha fatto pensare al colloquio")];
  NP.app.writeJSON("thoughts", [{
    id: "tz1", date: "2026-11-13T09:00:00.000Z",
    situation: "la zanzara in cucina", thought: "non ce la farò",
    emotion: "ansia", intensity: 6, alternative: "forse è solo stanchezza"
  }]);
  NP.app.state.course = { done: [], notes: {} };
  NP.app.state.course.notes[esercizioNota] = "con la zanzara mi sono distratto subito";
  NP.app.saveCourse();

  navigate("#/cerca/zanzara");
  ok(!!document.getElementById("cercaPersonale"), "la ricerca ha una sezione «Nelle tue cose»");
  ok(/Nelle tue cose · 3 risultati/.test(document.getElementById("cercaPersonale").textContent), "con i tre risultati: diario, scheda e nota del percorso");
  ok(!document.querySelector("#app .cerca-contenuti"), "una parola che esiste solo nelle cose scritte non produce risultati nei contenuti");
  ok(!/Nei contenuti ·/.test(document.getElementById("app").textContent), "e la sezione dei contenuti non compare affatto, senza contatori a zero");

  const vociPersonali = document.querySelectorAll("#app .cerca-voce");
  ok(vociPersonali.length === 3, "un risultato per cosa trovata, non un elenco indistinto");
  ok(Array.prototype.every.call(vociPersonali, function (li) {
    return !!li.querySelector("mark") && !!li.querySelector("p.text-small");
  }), "ogni voce porta il suo estratto, con la parola cercata in evidenza");
  ok(!!document.querySelector('#app a[href="#/diario/voce/pz1"]'), "il risultato del diario porta alla sua voce");
  ok(!!document.querySelector('#app a[href="#/diario/scheda/tz1"]'), "quello della scheda porta alla scheda");
  ok(!!document.querySelector('#app a[href="#/esercizi/' + esercizioNota + '/nota"]'), "quello della nota porta all'esercizio, dove si scrive");

  // I campi di una scheda sono cose diverse, non una frase sola: l'estratto
  // mostra quello che contiene la parola, senza incollargli dietro il resto.
  const voceScheda = document.querySelector('#app a[href="#/diario/scheda/tz1"]').closest("li");
  ok(!!voceScheda && /la <mark>zanzara<\/mark> in cucina/.test(voceScheda.innerHTML), "l'estratto della scheda è il campo con la parola");
  ok(!!voceScheda && !/non ce la farò/.test(voceScheda.textContent), "senza il pensiero incollato dietro, che è un altro campo");

  // Anche nelle cose scritte l'estratto è la frase: una nota di due frasi non
  // deve portare con sé quella che non c'entra.
  const diarioPrimaDellaFrase = NP.app.state.diary;
  NP.app.state.diary = [paginaDiario("pz2", "2026-11-14T09:00:00.000Z", "La prima frase non c'entra. Poi ho visto la libellula sul balcone e mi sono fermato.")];
  navigate("#/cerca/libellula");
  const voceFrase = document.querySelector("#app .cerca-voce");
  ok(!!voceFrase && /Poi ho visto la <mark>libellula<\/mark> sul balcone/.test(voceFrase.innerHTML), "anche nelle tue cose l'estratto è la frase con la parola");
  ok(!!voceFrase && !/prima frase/.test(voceFrase.textContent), "senza la frase di prima, che non c'entra");
  NP.app.state.diary = diarioPrimaDellaFrase;

  // I collegamenti devono portare davvero alla voce, non a una pagina che la
  // nasconde: la voce cercata può essere più vecchia delle otto in elenco.
  navigate("#/diario/voce/pz1");
  const voceTrovata = document.getElementById("voceCercata");
  ok(!!voceTrovata && /zanzara sul muro/.test(voceTrovata.textContent), "aprendo il risultato la voce è in pagina, con il suo testo");

  navigate("#/diario/scheda/tz1");
  const schedaTrovata = document.getElementById("schedaCercata");
  ok(!!schedaTrovata && /la zanzara in cucina/.test(schedaTrovata.textContent), "la scheda del pensiero si apre in sola lettura");
  ok(/non ce la farò/.test(schedaTrovata.textContent) && /forse è solo stanchezza/.test(schedaTrovata.textContent), "con situazione, pensiero e lettura alternativa");

  navigate("#/esercizi/" + esercizioNota + "/nota");
  ok(document.getElementById("notaEsercizio").value === "con la zanzara mi sono distratto subito", "la nota del percorso si apre già scritta nell'esercizio");
  // La rotta cambia due volte (hash e render esplicito): si rilegge il campo
  // quando la pagina si è fermata, o si guarderebbe un elemento staccato.
  await new Promise(function (r) { setTimeout(r, 30); });
  const campoNota = document.getElementById("notaEsercizio");
  ok(document.activeElement === campoNota, "e il cursore è nella nota, che è il motivo della visita");

  campoNota.value = "nota nuova sulla zanzara";
  document.getElementById("salvaNota").click();
  ok(NP.app.readJSON("course", {}).notes[esercizioNota] === "nota nuova sulla zanzara", "la nota si salva con l'esercizio, dove la ricerca la ritrova");

  // Il punto che conta: i dati personali non entrano nell'indice dei contenuti.
  NP.app.state.diary = [paginaDiario("iso1", "2026-11-10T09:00:00.000Z", "sonno parola segreta")];
  navigate("#/cerca/sonno");
  const linkContenuti = document.querySelectorAll("#app .cerca-contenuti a");
  ok(linkContenuti.length > 0, "la ricerca nei contenuti continua a dare risultati");
  ok(Array.prototype.every.call(linkContenuti, function (a) {
    const href = a.getAttribute("href");
    return !/^#\/diario/.test(href) && !/^#\/esercizi\/.+\/nota/.test(href);
  }), "e i suoi risultati restano capitoli, glossario ed esercizi, mai voci personali");
  ok(/parola segreta/.test(document.getElementById("cercaPersonale").textContent), "la voce personale compare solo nella sezione delle tue cose");

  // In una pagina che si ridisegna da sola, chi ascolta deve sapere che è
  // cambiata, e chi naviga da tastiera deve ritrovarsi in cima.
  console.log("\nCambio di pagina");
  navigate("#/diario");
  const titoloDiario = document.querySelector("#app h1");
  ok(titoloDiario.getAttribute("tabindex") === "-1", "il titolo della pagina può ricevere il focus");
  ok(document.activeElement === titoloDiario, "e lo riceve davvero al cambio pagina");
  ok(/Pagina caricata/.test(document.getElementById("annuncioRotta").textContent), "un annuncio dice a chi ascolta che la pagina è cambiata");

  console.log("\nDimensione del testo");
  ok(NP.app.testoScelto() === 100, "di partenza il testo è alla dimensione normale");
  ok(NP.app.impostaTesto(125) === true, "si può ingrandire");
  ok(document.documentElement.getAttribute("data-testo") === "125", "e la scelta si applica alla radice, così vale per tutta l'app");
  ok(NP.app.testoScelto() === 125, "la scelta resta salvata per la prossima volta");
  ok(NP.app.impostaTesto(37) === false, "valori inventati vengono rifiutati");
  ok(NP.app.impostaTesto(100) === true && !document.documentElement.hasAttribute("data-testo"), "tornando a 100 l'attributo sparisce, invece di restare con un valore inutile");
  navigate("#/licenze");
  const sceltaTesto = document.getElementById("testoScelta");
  ok(!!sceltaTesto && sceltaTesto.options.length === 3, "la pagina Licenze offre le tre dimensioni");

  console.log("\nModalità discreta");
  ok(NP.app.discretoAttivo() === false, "la modalità discreta parte spenta");
  ok(NP.app.impostaDiscreto(true) === true, "si può accendere");
  ok(document.documentElement.getAttribute("data-discreto") === "1", "coprendo i contenuti a livello di radice, così nessuna pagina la scappa");
  navigate("#/licenze");
  ok(document.getElementById("avvisoDiscreto").hidden === false, "con una barra che spiega cosa sta succedendo");
  document.getElementById("mostraDiscreto").click();
  ok(document.getElementById("app").classList.contains("svelato"), "e un pulsante che scopre i contenuti quando serve");
  navigate("#/diario");
  ok(!document.getElementById("app").classList.contains("svelato"), "cambiando pagina i contenuti tornano coperti");
  ok(NP.app.impostaDiscreto(false) === true && !document.documentElement.hasAttribute("data-discreto"), "si può spegnere");

  // L'invito non è una serie da mantenere: dice un fatto e apre una porta.
  console.log("\nInviti gentili");
  NP.app.state.diary = [paginaDiario("g1", giorniFa(9), "vecchia")];
  navigate("#/");
  ok(!!document.getElementById("invitoDiario"), "se il diario è fermo da giorni la home lo nota");
  ok(/fermo da 9 giorni/.test(document.getElementById("app").textContent), "dicendo da quanto, senza rimproveri");
  ok(!/serie|streak|giorni di fila/i.test(document.getElementById("app").textContent), "e senza serie da mantenere");
  ok(/una riga su oggi basta/i.test(document.getElementById("app").textContent), "la richiesta è piccola, non un programma");
  ok(/La tua settimana/.test(document.getElementById("app").textContent), "la home riassume anche la settimana, quando c'è qualcosa da dire");
  NP.app.state.diary = [paginaDiario("g2", giorniFa(1), "ieri")];
  navigate("#/");
  ok(!document.getElementById("invitoDiario"), "se il diario è recente non dice niente");

  // Un capitolo si può ascoltare con la stessa voce del resto dell'app.
  console.log("\nAscoltare un capitolo");
  navigate("#/manuale/" + NP.data.manuale[0].id);
  ok(!!document.getElementById("ascoltaCapitolo"), "un capitolo ha il pulsante per ascoltarlo");
  const speakVero = window.speechSynthesis.speak;
  let parlato = 0;
  window.speechSynthesis.speak = function () { parlato++; };
  document.getElementById("ascoltaCapitolo").click();
  ok(parlato >= 1, "premendolo la voce parte davvero");
  window.speechSynthesis.speak = speakVero;

  /* ------------------------------------------------ Importare da un file */

  // I test qui sopra chiamano migraBackup; la persona, invece, sceglie un file.
  // Questo giro — input, FileReader, sostituzione dei dati, frase finale — non
  // era coperto: la frase è l'unica cosa che si legge, e se mente nessun test
  // sul formato se ne accorge.
  console.log("\nImportazione di un backup da file");

  const letture = [];
  let attesaLettura = null;
  const FileReaderVero = window.FileReader;
  function FileReaderSorvegliato() {
    const lettore = new FileReaderVero();
    letture.push(lettore);
    if (attesaLettura) {
      const risolvi = attesaLettura;
      attesaLettura = null;
      // `loadend` arriva dopo `load`: quando la promessa si chiude l'app ha già
      // letto il file e ridisegnato la pagina.
      lettore.addEventListener("loadend", function () { risolvi(); });
    }
    return lettore;
  }
  window.FileReader = FileReaderSorvegliato;

  // Il file si sceglie in un campo vero e si legge da un FileReader vero, con
  // l'attesa della lettura vera: niente scorciatoie che salterebbero il codice
  // che si vuole provare.
  const scegli = async function (contenuto, nome) {
    const campo = document.getElementById("importFile");
    const file = new window.File([contenuto], nome, { type: "application/json" });
    Object.defineProperty(campo, "files", { value: [file], configurable: true });
    const quante = letture.length;
    const finito = new Promise(function (risolvi) { attesaLettura = risolvi; });
    campo.dispatchEvent(new window.Event("change"));
    ok(letture.length === quante + 1, "«" + nome + "» viene letto da un FileReader, non saltato");
    const arrivato = await Promise.race([
      finito.then(function () { return true; }),
      new Promise(function (risolvi) { setTimeout(function () { risolvi(false); }, 2000); })
    ]);
    ok(arrivato, "la lettura di «" + nome + "» arriva a compimento");
    return document.getElementById("toast").textContent;
  };

  navigate("#/licenze");
  const campoFile = document.getElementById("importFile");
  ok(!!campoFile && campoFile.type === "file", "la pagina Licenze ha il campo per scegliere un file");
  ok(/json/i.test(campoFile.getAttribute("accept")), "e accetta i file JSON, gli unici che sa leggere");

  // Un file del primo formato: si completa, e la frase lo dice.
  NP.app.state.diary = [paginaDiario("im1", "2026-11-13T09:00:00.000Z", "dati di prima")];
  const daFileVecchio = JSON.stringify({
    app: "Psicologo Digitale",
    diary: [paginaDiario("im2", "2026-11-14T09:00:00.000Z", "dal file vecchio")]
  });
  let chiesto = "";
  const confermaVeraImport = window.confirm;
  window.confirm = function (msg) { chiesto = msg; return true; };
  const esitoVecchio = await scegli(daFileVecchio, "vecchio.json");
  window.confirm = confermaVeraImport;
  ok(/Importare il backup\?/.test(chiesto), "prima di sostituire chiede conferma, invece di farlo e basta");
  ok(esitoVecchio === "Backup importato e aggiornato al formato attuale.", "un file vecchio chiude con la frase che annuncia l'aggiornamento");
  ok(NP.app.state.diary.length === 1 && NP.app.state.diary[0].note === "dal file vecchio", "e i dati sono davvero quelli del file, non quelli di prima");
  ok(NP.app.readJSON("diary", [])[0].note === "dal file vecchio", "la frase non promette un salvataggio che poi non c'è: il diario è scritto");

  // Un file già nel formato attuale: stessa strada, frase senza aggiornamento.
  NP.app.state.diary = [paginaDiario("im3", "2026-11-16T09:00:00.000Z", "dal file attuale")];
  const fileAttuale = NP.app.raccogliDati();
  NP.app.state.diary = [paginaDiario("im4", "2026-11-17T09:00:00.000Z", "da sovrascrivere")];
  const esitoAttuale = await scegli(JSON.stringify(fileAttuale), "attuale.json");
  ok(esitoAttuale === "Backup importato.", "un file già aggiornato dice solo «Backup importato», senza annunciare una conversione che non c'è stata");
  ok(NP.app.state.diary[0].note === "dal file attuale", "anche qui i dati sono quelli del file, non restano quelli di prima");

  // Un file di una versione futura: si ferma prima di toccare i dati.
  const primaDelRifiuto = JSON.stringify(NP.app.state.diary);
  const esitoFuturo = await scegli(JSON.stringify({
    app: "Psicologo Digitale", version: 9,
    diary: [paginaDiario("im5", "2026-11-17T09:00:00.000Z", "inventato")]
  }), "futuro.json");
  ok(/versione più recente/.test(esitoFuturo), "un file di una versione futura lo dice nella frase che compare al posto del successo");
  ok(JSON.stringify(NP.app.state.diary) === primaDelRifiuto, "e non tocca i dati: l'import si ferma prima di sostituire");

  // Un file che non è un backup: lo dice, e la frase di prima non cambia.
  let avvisato = "";
  const alertVero = window.alert;
  window.alert = function (msg) { avvisato = msg; };
  const esitoRotto = await scegli("qui non c'è nessun backup", "foto.json");
  window.alert = alertVero;
  ok(/non sembra un backup valido/.test(avvisato), "un file qualsiasi lo dice con un avviso, non con un errore in console");
  ok(esitoRotto === esitoFuturo, "il file rotto non lascia una frase di successo al posto dell'errore");
  ok(JSON.stringify(NP.app.state.diary) === primaDelRifiuto, "e anche qui i dati restano quelli di prima");

  // Se alla conferma si risponde no, non succede niente.
  const primaDelNo = JSON.stringify(NP.app.state.diary);
  window.confirm = function () { return false; };
  const esitoNo = await scegli(JSON.stringify({
    app: "Psicologo Digitale", version: 2,
    diary: [paginaDiario("im6", "2026-11-17T09:00:00.000Z", "rifiutato")]
  }), "rifiutato.json");
  window.confirm = confermaVeraImport;
  ok(JSON.stringify(NP.app.state.diary) === primaDelNo, "dicendo no alla conferma, i dati restano quelli di prima");
  ok(esitoNo === esitoFuturo, "e non compare nessuna frase di backup importato");

  window.FileReader = FileReaderVero;

  // Il foglio delle prove si raggiunge dall'app, non solo dal repository.
  console.log("\nFoglio delle prove a mano");
  navigate("#/licenze");
  const linkProve = document.querySelector('#app a[href="assets/pdf/Psicologo-Digitale-Prove-a-mano.pdf"]');
  ok(!!linkProve, "la pagina Licenze collega il foglio delle prove a mano");
  ok(!!linkProve && linkProve.hasAttribute("download") && !!linkProve.closest(".card"),
    "il collegamento scarica il PDF e sta dentro una scheda con la sua spiegazione");

  /* Piano di sicurezza ------------------------------------------------------- */

  console.log("\nPiano di sicurezza");

  navigate("#/sicurezza/piano");
  ok(!!document.getElementById("pianoForm") && !!document.getElementById("pianoSegnali"), "il piano ha un modulo compilabile");
  ok(!!document.getElementById("pianoPrimiMinuti") && !!document.getElementById("pianoAmbiente") && !!document.getElementById("pianoRagione"), "con i cinque campi del piano");
  const foglioVuoto = document.getElementById("pianoStampa").textContent;
  ok(/I miei segnali/.test(foglioVuoto) && /Chi chiamo/.test(foglioVuoto) && /Una ragione per chiamare/.test(foglioVuoto), "il foglio stampabile ha le cinque voci anche vuoto");
  ok(!/respira|prova a|consiglio/i.test(foglioVuoto), "senza consigli già scritti");

  document.getElementById("pianoSegnali").value = "Dormo male e mi isolo";
  document.getElementById("pianoPrimiMinuti").value = "Esco e chiamo mia sorella";
  document.getElementById("pianoNome0").value = "Marta";
  document.getElementById("pianoTel0").value = "333 1234567";
  document.getElementById("pianoAmbiente").value = "Chiedo a Marta di tenere i farmaci";
  document.getElementById("pianoRagione").value = "Voglio vedere mia figlia domani";
  document.getElementById("pianoForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  const pianoSalvato = NP.app.readJSON("pianoSicurezza", null);
  ok(!!pianoSalvato && pianoSalvato.segnali === "Dormo male e mi isolo", "salvando, il piano resta sul dispositivo");
  ok(!!pianoSalvato && pianoSalvato.contatti[0].nome === "Marta" && pianoSalvato.contatti[0].tel === "333 1234567", "con i contatti compilati");
  ok(!!pianoSalvato && pianoSalvato.ragione === "Voglio vedere mia figlia domani", "e la ragione scritta");

  navigate("#/");
  navigate("#/sicurezza/piano");
  ok(document.getElementById("pianoSegnali").value === "Dormo male e mi isolo", "riaprendo il piano, i campi sono ancora lì");
  ok(document.getElementById("pianoNome0").value === "Marta", "compresi i contatti");

  const stampaVeraPiano = window.print;
  let stampePiano = 0;
  window.print = function () { stampePiano++; };
  document.getElementById("stampaPiano").click();
  ok(stampePiano === 1, "il pulsante Stampa chiama la stampa del browser");
  const foglioPieno = document.getElementById("pianoStampa").textContent;
  ok(/Dormo male e mi isolo/.test(foglioPieno) && /Marta/.test(foglioPieno) && /333 1234567/.test(foglioPieno), "e il foglio porta i dati compilati");

  // Chi scrive e stampa senza salvare non deve perdere quello che ha appena
  // scritto: il foglio si aggiorna dal modulo, non da quello che è in memoria.
  document.getElementById("pianoRagione").value = "Una ragione appena scritta";
  document.getElementById("stampaPiano").click();
  ok(/Una ragione appena scritta/.test(document.getElementById("pianoStampa").textContent), "il foglio stampa anche le modifiche non ancora salvate");

  ["pianoSegnali", "pianoPrimiMinuti", "pianoAmbiente", "pianoRagione"].forEach(function (id) { document.getElementById(id).value = ""; });
  [0, 1, 2].forEach(function (i) { document.getElementById("pianoNome" + i).value = ""; document.getElementById("pianoTel" + i).value = ""; });
  document.getElementById("stampaPiano").click();
  window.print = stampaVeraPiano;
  const foglioBianco = document.getElementById("pianoStampa").textContent;
  ok(!/Dormo male/.test(foglioBianco) && document.querySelectorAll("#pianoStampa .piano-riga").length >= 5, "svuotando i campi, il foglio torna bianco con le righe da scrivere a penna");

  const datiPiano = NP.app.raccogliDati();
  ok(!!datiPiano.pianoSicurezza && datiPiano.pianoSicurezza.segnali === "Dormo male e mi isolo", "il piano viaggia nel backup con gli altri dati");

  /* Uscita rapida ----------------------------------------------------------- */

  console.log("\nUscita rapida");

  navigate("#/sicurezza");
  const esciSubito = document.getElementById("esciSubito");
  ok(!!esciSubito && /Esci subito/.test(esciSubito.textContent), "la pagina Sicurezza ha il pulsante Esci subito");
  ok(!!esciSubito && esciSubito.getAttribute("href") === "#/nuova", "e porta alla pagina neutra con un solo collegamento");
  ok(/non cancella la cronologia/i.test(document.getElementById("app").textContent), "e dice che non cancella la cronologia del browser");

  navigate("#/nuova");
  ok(document.body.classList.contains("nuova-scheda"), "la pagina neutra nasconde testata, menu e piè di pagina");
  ok(document.title === "Nuova scheda", "il titolo della scheda non nomina il programma");
  const testoNeutro = document.getElementById("app").textContent;
  ok(/Nuova scheda/.test(testoNeutro), "la pagina dice solo quello che direbbe una scheda nuova");
  ok(!/Psicologo|Neura|ansia|diario|112/i.test(testoNeutro), "e non contiene niente del programma");
  ok(/^\d{1,2}:\d{2}$/.test(document.getElementById("nuovaSchedaOra").textContent), "con un orologio vero, non un segnaposto");

  navigate("#/sicurezza");
  ok(!document.body.classList.contains("nuova-scheda"), "tornando indietro la testata e il menu tornano");
  ok(/Sicurezza e numeri utili/.test(document.title), "e il titolo torna quello della pagina di prima");

  /* Aggiornamento del sito -------------------------------------------------- */

  console.log("\nAggiornamento del sito");

  // Il service worker nuovo prende il controllo da solo, ma la pagina aperta
  // continua a girare con i file vecchi: deve dirlo e offrire una ricarica.
  ok(!!document.getElementById("avvisoAggiornamento") && !!document.getElementById("aggiornaRicaricando"),
    "la pagina ha la barra e il pulsante per l'aggiornamento");
  ok(document.getElementById("avvisoAggiornamento").hidden === true, "all'avvio la barra resta nascosta");

  function bancoAggiornamento(avevaControllo) {
    const nav = new window.EventTarget();
    nav.controller = avevaControllo ? {} : null;
    const box = document.createElement("div");
    box.hidden = true;
    const bottone = document.createElement("button");
    const stato = { ricariche: 0 };
    NP.app.collegaAvvisoAggiornamento(
      { waiting: null },
      { nav: nav, box: box, bottone: bottone, attesa: 0, ricarica: function () { stato.ricariche++; } }
    );
    return { nav: nav, box: box, bottone: bottone, stato: stato };
  }

  const primaVolta = bancoAggiornamento(false);
  primaVolta.nav.dispatchEvent(new window.Event("controllerchange"));
  ok(primaVolta.box.hidden === true, "alla prima installazione non compare nessun avviso");

  const banco = bancoAggiornamento(true);
  banco.nav.dispatchEvent(new window.Event("controllerchange"));
  ok(banco.box.hidden === false, "quando il service worker cambia compare l'avviso");
  banco.bottone.click();
  ok(banco.stato.ricariche === 1, "il pulsante ricarica la pagina una volta");
  ok(banco.bottone.disabled === true, "dopo il clic il pulsante si spegne");
  banco.bottone.click();
  banco.nav.dispatchEvent(new window.Event("controllerchange"));
  ok(banco.stato.ricariche === 1, "un secondo clic non ricarica di nuovo");

  // Con un service worker in attesa la ricarica aspetta il passaggio di
  // controllo: ripartire prima vorrebbe dire tornare ai file vecchi.
  const navInAttesa = new window.EventTarget();
  navInAttesa.controller = {};
  const boxInAttesa = document.createElement("div");
  boxInAttesa.hidden = true;
  const bottoneInAttesa = document.createElement("button");
  const messaggi = [];
  let ricaricheInAttesa = 0;
  NP.app.collegaAvvisoAggiornamento(
    { waiting: { postMessage: function (m) { messaggi.push(m && m.type); } } },
    { nav: navInAttesa, box: boxInAttesa, bottone: bottoneInAttesa, attesa: 0, ricarica: function () { ricaricheInAttesa++; } }
  );
  ok(boxInAttesa.hidden === false, "un service worker in attesa fa comparire l'avviso");
  bottoneInAttesa.click();
  ok(messaggi.length === 1 && messaggi[0] === "SKIP_WAITING", "il pulsante chiede al service worker di prendere il controllo");
  ok(ricaricheInAttesa === 0, "la pagina aspetta il passaggio di controllo prima di ricaricare");
  navInAttesa.dispatchEvent(new window.Event("controllerchange"));
  ok(ricaricheInAttesa === 1, "quando il controllo passa, la pagina si ricarica");
  await new Promise(function (r) { setTimeout(r, 10); });
  ok(ricaricheInAttesa === 1, "e la ricarica resta una sola, anche col timer di riserva");

  // Se il browser non annuncia il passaggio di controllo, il timer di riserva
  // ricarica lo stesso: il pulsante non deve restare senza effetto.
  const navMuto = new window.EventTarget();
  navMuto.controller = {};
  const boxMuto = document.createElement("div");
  boxMuto.hidden = true;
  const bottoneMuto = document.createElement("button");
  let ricaricheMute = 0;
  NP.app.collegaAvvisoAggiornamento(
    { waiting: { postMessage: function () {} } },
    { nav: navMuto, box: boxMuto, bottone: bottoneMuto, attesa: 0, ricarica: function () { ricaricheMute++; } }
  );
  bottoneMuto.click();
  await new Promise(function (r) { setTimeout(r, 10); });
  ok(ricaricheMute === 1, "se l'evento non arriva, la pagina si ricarica comunque una volta sola");

  /* Ricerca con i sinonimi -------------------------------------------------- */

  console.log("\nRicerca con i sinonimi");

  const diarioPrimaDeiSinonimi = NP.app.state.diary;

  navigate("#/cerca/dormire");
  let contenutiSinonimi = document.querySelector("#app .cerca-contenuti");
  ok(!!contenutiSinonimi && /Sonno: la riparazione notturna/.test(contenutiSinonimi.textContent), "«dormire» trova il capitolo sul sonno");
  const evidenziateSinonimi = contenutiSinonimi ? Array.prototype.map.call(contenutiSinonimi.querySelectorAll("mark"), function (m) { return m.textContent.toLowerCase(); }) : [];
  ok(evidenziateSinonimi.indexOf("sonno") >= 0, "e l'estratto evidenzia la parola che c'è davvero, «sonno»");

  navigate("#/cerca/ansioso");
  contenutiSinonimi = document.querySelector("#app .cerca-contenuti");
  ok(!!contenutiSinonimi && /Ansia: il corpo che suona l'allarme/.test(contenutiSinonimi.textContent), "«ansioso» trova il capitolo sull'ansia");

  navigate("#/cerca/dormito");
  contenutiSinonimi = document.querySelector("#app .cerca-contenuti");
  ok(!!contenutiSinonimi && /Sonno: la riparazione notturna/.test(contenutiSinonimi.textContent), "una forma del verbo porta allo stesso capitolo");

  NP.app.state.diary = [{
    id: "sin1", date: "2026-11-16", mood: 5, anxiety: 4, sleep: 3, energy: 4,
    note: "Ho dormito poco e mi sono svegliato tre volte."
  }];
  navigate("#/cerca/sonno");
  const personaleSinonimi = document.getElementById("cercaPersonale");
  ok(!!personaleSinonimi && /dormito/.test(personaleSinonimi.textContent), "la tabella vale anche per le cose scritte: «sonno» trova «dormito»");
  ok(!!personaleSinonimi && /<mark>dormito<\/mark>/.test(personaleSinonimi.innerHTML), "e la parola trovata è evidenziata anche lì");

  navigate("#/cerca/zanzara");
  ok(!document.querySelector("#app .cerca-contenuti"), "una parola fuori dalla tabella resta letterale, senza parenti inventati");

  NP.app.state.diary = diarioPrimaDeiSinonimi;

  /* Estratti della ricerca -------------------------------------------------- */

  console.log("\nEstratti della ricerca");

  // Un termine che sta solo nel titolo di una sezione non deve trasformare il
  // titolo in una frase: il risultato si vede, l'estratto no.
  navigate("#/cerca/legittime");
  const rigaTitoloSezione = Array.prototype.filter.call(document.querySelectorAll("#app .cerca-contenuti li"), function (li) {
    return /Scegliere il professionista giusto/.test(li.textContent);
  })[0];
  ok(!!rigaTitoloSezione, "un termine che sta solo in un titolo di sezione trova lo stesso il capitolo");
  ok(!!rigaTitoloSezione && !rigaTitoloSezione.querySelector("p"), "ma il titolo di sezione non viene usato come estratto");

  // La durata resta una cosa cercabile; non è una frase da mostrare.
  navigate("#/cerca/pianificazione");
  const linkDurata = document.querySelector('#app .cerca-contenuti a[href="#/esercizi/attivazione"]');
  ok(!!linkDurata, "un esercizio si trova anche dalla sua durata");
  ok(!!linkDurata && !linkDurata.closest("li").querySelector("p"), "ma la durata non prende il posto della frase");

  // Il punto e virgola separa due parti della stessa frase: tagliarlo lascia
  // una dipendente senza la principale.
  navigate("#/cerca/reagisce");
  ok(/scegliere cosa fare; fuori, si reagisce/i.test(document.getElementById("app").textContent), "il punto e virgola non spezza più la frase");

  // Un paragrafo lunghissimo si taglia, ma non dentro una parola.
  navigate("#/cerca/etichettamento");
  const testoTaglio = document.getElementById("app").textContent;
  ok(/cancella il resto\),/.test(testoTaglio), "il paragrafo lungo si ferma a una parola intera");
  ok(!/personalizzaz(?!ione)/.test(testoTaglio), "e non lascia una parola mozzata come «personalizzaz»");

  /* Diario: elenco completo, modifica, schede ------------------------------ */

  console.log("\nDiario: elenco, modifica e schede");

  const diarioPrimaDiQuesteProve = NP.app.state.diary;
  const pensieriPrimaDiQuesteProve = NP.app.readJSON("thoughts", []);
  function voceDiProva(id, giorno, nota) {
    return { id: id, date: "2026-11-" + String(giorno).padStart(2, "0") + "T09:00:00.000Z", mood: 5, anxiety: 4, sleep: 7, energy: 5, note: nota };
  }
  NP.app.state.diary = [];
  for (let i = 1; i <= 10; i++) NP.app.state.diary.push(voceDiProva("v" + i, i, "nota " + i));
  NP.app.saveDiary();

  navigate("#/diario");
  ok(document.querySelectorAll("#app .diary-entry").length === 8, "il diario mostra le otto voci più recenti");
  const vediTutte = document.querySelector('#app a[href="#/diario/tutte"]');
  ok(!!vediTutte && /10 voci/.test(vediTutte.textContent), "e offre l'elenco completo con il numero vero");

  navigate("#/diario/tutte");
  ok(document.querySelectorAll("#app .diary-entry").length === 10, "l'elenco completo mostra tutte le voci");
  ok(!!document.querySelector('#app a[href="#/diario"]'), "con un ritorno al diario");

  navigate("#/diario/modifica/v7");
  ok(document.getElementById("dDate").value === "2026-11-07", "aprendo una voce il modulo porta la sua data");
  ok(document.getElementById("dNote").value === "nota 7", "e la sua nota");
  ok(document.querySelector('.mood-pick[data-mood="5"]').classList.contains("is-active"), "e il suo umore è già scelto");
  document.querySelector('.mood-pick[data-mood="9"]').click();
  document.getElementById("dNote").value = "nota 7 corretta";
  document.getElementById("diaryForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
  const modificata = NP.app.state.diary.filter(function (v) { return v.id === "v7"; })[0];
  ok(!!modificata && modificata.note === "nota 7 corretta" && modificata.mood === 9, "salvando, la voce viene aggiornata sul posto");
  ok(NP.app.state.diary.length === 10, "senza aggiungere una voce nuova");
  ok(modificata.date === "2026-11-07", "e la data resta quella di prima");

  NP.app.writeJSON("thoughts", [
    { id: "s1", date: "2026-11-10T09:00:00.000Z", situation: "cucina", thought: "non ce la farò", emotion: "ansia", intensity: 6, alternative: "forse è stanchezza" },
    { id: "s2", date: "2026-11-12T09:00:00.000Z", situation: "ufficio", thought: "tutti mi giudicano", emotion: "vergogna", intensity: 7, alternative: "non lo so" }
  ]);
  navigate("#/diario");
  ok(document.querySelectorAll("#app [data-del-thought]").length === 2, "il diario elenca le schede del pensiero salvate");
  ok(document.getElementById("app").textContent.indexOf("tutti mi giudicano") >= 0, "con il pensiero scritto, non solo la data");

  const confermaVera = window.confirm;
  window.confirm = function () { return true; };
  document.querySelector('#app [data-del-thought="s1"]').click();
  window.confirm = confermaVera;
  const schedeRimaste = NP.app.readJSON("thoughts", []);
  ok(schedeRimaste.length === 1 && schedeRimaste[0].id === "s2", "la scheda scelta viene eliminata e le altre restano");

  navigate("#/diario/scheda/s2");
  ok(!!document.getElementById("eliminaScheda"), "la scheda aperta dalla ricerca si può eliminare");
  window.confirm = function () { return true; };
  document.getElementById("eliminaScheda").click();
  window.confirm = confermaVera;
  ok(NP.app.readJSON("thoughts", []).length === 0, "eliminandola sparisce dalle schede salvate");

  NP.app.state.diary = diarioPrimaDiQuesteProve;
  NP.app.saveDiary();
  NP.app.writeJSON("thoughts", pensieriPrimaDiQuesteProve);

  /* Protezione dello spazio ------------------------------------------------ */

  console.log("\nProtezione dello spazio");

  // Il browser può cancellare i dati di un sito quando lo spazio scarseggia.
  // L'app chiede la protezione e dice in Licenze se l'ha ottenuta; quando non
  // l'ha ottenuta, propone il backup invece di lasciare il rischio muto.
  const storageVero = window.navigator.storage;
  function storageFinto(persisted, persist) {
    Object.defineProperty(window.navigator, "storage", {
      configurable: true,
      value: { persisted: persisted, persist: persist }
    });
  }

  storageFinto(function () { return Promise.resolve(false); }, function () { return Promise.resolve(true); });
  const protetto = await NP.app.chiediSpazioPersistente();
  ok(protetto.supportato === true && protetto.protetto === true, "se il browser concede la protezione, l'app lo registra");
  navigate("#/licenze");
  const cardProtetta = document.getElementById("protezioneSpazio");
  ok(!!cardProtetta && /protetti dallo spazio/.test(cardProtetta.textContent), "in Licenze si legge che i dati sono protetti");
  ok(!document.getElementById("protezioneEsporta"), "quando i dati sono protetti il backup non compare come urgenza");

  let richieste = 0;
  storageFinto(function () { return Promise.resolve(false); }, function () { richieste++; return Promise.resolve(false); });
  const nonProtetto = await NP.app.chiediSpazioPersistente();
  ok(nonProtetto.supportato === true && nonProtetto.protetto === false, "se il browser rifiuta, lo stato resta non protetto");
  ok(richieste === 1, "la protezione viene chiesta al browser, non solo letta");
  navigate("#/licenze");
  const cardNonProtetta = document.getElementById("protezioneSpazio");
  ok(/non sono protetti/.test(cardNonProtetta.textContent), "in Licenze si legge che i dati non sono protetti");
  const esportaProtezione = document.getElementById("protezioneEsporta");
  ok(!!esportaProtezione, "e viene proposto di esportare il backup");
  let esportazioni = 0;
  const esportaVera = NP.app.esportaBackup;
  NP.app.esportaBackup = function () { esportazioni++; };
  esportaProtezione.click();
  NP.app.esportaBackup = esportaVera;
  ok(esportazioni === 1, "il pulsante esporta davvero un backup");

  // Un browser senza Storage API non deve rompere la pagina né promettere
  // una protezione che non può dare.
  Object.defineProperty(window.navigator, "storage", { configurable: true, value: undefined });
  const senzaApi = await NP.app.chiediSpazioPersistente();
  ok(senzaApi.supportato === false && senzaApi.protetto === false, "senza Storage API l'app non rompe niente");
  navigate("#/licenze");
  const cardSenza = document.getElementById("protezioneSpazio");
  ok(/non offre la protezione/.test(cardSenza.textContent), "in Licenze lo dice, senza promettere una protezione che non c'è");
  ok(!!document.getElementById("protezioneEsporta"), "e anche qui propone il backup");

  if (storageVero === undefined) delete window.navigator.storage;
  else Object.defineProperty(window.navigator, "storage", { configurable: true, value: storageVero });

  console.log("\n" + (fails === 0 ? "✓" : "✗") + " " + (checks - fails) + "/" + checks + " test superati");
  if (fails) {
    console.error("\n" + fails + " test falliti.");
    process.exit(1);
  }
}, 700);
