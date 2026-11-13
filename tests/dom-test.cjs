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
  const rimaste = Object.keys(window.localStorage).filter(function (k) { return k.indexOf(NP.app.PREFIX) === 0; });
  ok(rimaste.length === 1 && rimaste[0] === NP.app.PREFIX + "copie", "azzerare toglie i dati e lascia solo la copia automatica (" + rimaste.length + ")");
  ok(!!document.getElementById("consentBox"), "dopo l'azzeramento si riparte dalla prima domanda");

  // La rete sotto l'azzeramento: la copia sopravvive e riporta indietro i dati.
  ok(NP.app.copieAutomatiche().length >= 1, "l'azzeramento non porta via la copia automatica");
  ok(NP.app.copieAutomatiche()[0].dati.diary.length === diarioPrima, "la copia contiene i dati com'erano prima dell'azzeramento");
  ok(NP.app.ripristinaCopia(0) === true, "la copia si può ripristinare");
  ok(NP.app.state.diary.length === diarioPrima, "ripristinare riporta il diario");
  navigate("#/licenze");
  ok(!!document.querySelector("[data-copia]"), "il ripristino si raggiunge dalla pagina Licenze");

  console.log("\n" + (fails === 0 ? "✓" : "✗") + " " + (checks - fails) + "/" + checks + " test superati");
  if (fails) {
    console.error("\n" + fails + " test falliti.");
    process.exit(1);
  }
}, 700);
