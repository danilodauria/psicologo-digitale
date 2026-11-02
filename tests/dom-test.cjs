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
  document.getElementById("statusMode").click();
  ok(document.getElementById("statusPanel").hidden === true, "il pannello si richiude");
  ok(!!document.getElementById("statusOs"), "la barra mostra il sistema in uso con un pulsante");
  document.getElementById("statusOs").click();
  ok(/Sistema in uso/.test(document.getElementById("statusPanel").textContent), "il pannello dice su quale sistema gira il programma");
  ok(/Voci del dispositivo/.test(document.getElementById("statusPanel").textContent), "il pannello conta le voci disponibili");
  document.getElementById("statusOs").click();

  const before = document.documentElement.getAttribute("data-theme");
  document.getElementById("themeBtn").click();
  const after = document.documentElement.getAttribute("data-theme");
  ok(before !== after, "il pulsante cambia tema");

  /* Voce naturale (solo nel programma installato) ------------------------- */

  const chiamateVoce = { scarica: 0, pronuncia: 0, rimuovi: 0, ultimoRitmo: null };
  const audioRiprodotti = [];
  window.Audio = function (src) {
    this.src = src;
    this.play = function () { audioRiprodotti.push(src); return Promise.resolve(); };
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
      stato: function () { return Promise.resolve({ ok: true, disponibile: true, installata: false, voce: "Paola", peso: 86 }); },
      scarica: function () {
        chiamateVoce.scarica++;
        return Promise.resolve({ ok: true, disponibile: true, installata: true, voce: "Paola", peso: 86 });
      },
      pronuncia: function (testo, passo) {
        chiamateVoce.pronuncia++;
        chiamateVoce.ultimoRitmo = passo;
        return Promise.resolve({ ok: true, wav: [82, 73, 70, 70] });
      },
      rimuovi: function () {
        chiamateVoce.rimuovi++;
        return Promise.resolve({ ok: true, disponibile: true, installata: false, voce: "Paola" });
      },
      onProgresso: function () {}
    }
  };

  navigate("#/neura");
  await new Promise(function (r) { setTimeout(r, 30); });
  ok(!!document.getElementById("voiceNaturale"), "nel programma la scheda Voce propone la voce naturale");
  ok(/facoltativa/.test(document.getElementById("voiceNaturaleNota").textContent), "la nota dice che è facoltativa");
  ok(/86 MB/.test(document.getElementById("voiceNaturaleNota").textContent), "la nota dice quanto pesa, una volta sola");

  document.getElementById("voiceNaturaleInstalla").click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.scarica === 1, "il pulsante scarica la voce naturale");
  ok(!!document.querySelector('#voiceSelect option[value="__naturale__"]'), "la voce installata entra nell'elenco");
  ok(/Paola/.test(document.getElementById("voiceNaturaleNota").textContent), "la scheda conferma quale voce è pronta");
  ok(document.getElementById("voiceNaturaleInstalla").hidden === true, "dopo l'installazione il pulsante di download sparisce");

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
  ok(audioRiprodotti.length >= 1, "l'audio prodotto viene riprodotto");
  NP.neuraUI.stop();

  document.getElementById("voiceNaturaleRimuovi").click();
  await new Promise(function (r) { setTimeout(r, 40); });
  ok(chiamateVoce.rimuovi === 1, "la voce naturale si può togliere");
  ok(!document.querySelector('#voiceSelect option[value="__naturale__"]'), "tolta la voce, l'elenco torna alle voci del sistema");

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
  ok(document.getElementById("voiceNaturaleInstalla").hidden === true, "su Mac non compare un pulsante di download che non servirebbe");
  ok(NP.neuraUI.ritmo() === 1.3, "la velocità scelta resta memorizzata fra una visita e l'altra");

  console.log("\n" + (fails === 0 ? "✓" : "✗") + " " + (checks - fails) + "/" + checks + " test superati");
  if (fails) {
    console.error("\n" + fails + " test falliti.");
    process.exit(1);
  }
}, 700);
