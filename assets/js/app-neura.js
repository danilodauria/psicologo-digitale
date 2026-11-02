/* ==========================================================================
   Psicologo Digitale · interfaccia di Neura (chat e voce)
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;

  const WELCOME = '<p><strong>Ciao, sono Neura.</strong> Sono il consulente digitale di Psicologo Digitale: leggo i capitoli, i questionari, gli esercizi e le schede di sicurezza, e provo a risponderti con precisione.</p>' +
    '<p>Posso spiegarti un tema, suggerirti una pratica, aiutarti a capire da dove iniziare o preparare le domande per un professionista. Non faccio diagnosi e non prescrivo nulla.</p>' +
    '<p class="mini">Quello che scrivi resta su questo dispositivo. Se c\'è un rischio per la tua sicurezza, la priorità è il <strong>112</strong>.</p>';

  let recog = null;
  let listening = false;

  function voiceOn() {
    try { return localStorage.getItem(A.PREFIX + "voice") !== "false"; } catch (e) { return true; }
  }
  function setVoice(on) {
    try { localStorage.setItem(A.PREFIX + "voice", on ? "true" : "false"); } catch (e) {}
    const btn = document.getElementById("voiceBtn");
    if (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("aria-label", on ? "Voce di Neura attiva" : "Voce di Neura disattivata");
    }
  }

  const CHIAVE_VOCE = A.PREFIX + "voice-name";
  const CHIAVE_RITMO = A.PREFIX + "voice-rate";
  let parlando = false;

  // Voce naturale: un motore neurale che il programma installa su richiesta.
  // Genera l'audio sul computer, quindi nessun testo esce da qui.
  const NATURALE = "__naturale__";
  const VOCE_NATURALE = "Paola";
  const CHIAVE_VOCE_NATURALE = A.PREFIX + "voice-natural-id";
  let naturalePronta = false;
  // Le voci naturali che il programma conosce, come le racconta lui: ognuna
  // con il suo stato, perché il motore resta uno e i modelli si scaricano a sé.
  let naturaleVoci = [];
  let audioNaturale = null;

  function ponteNaturale() {
    const d = window.npDesktop;
    return d && d.voceNaturale ? d.voceNaturale : null;
  }

  function voceNaturaleSalvata() {
    let id = null;
    try { id = localStorage.getItem(CHIAVE_VOCE_NATURALE); } catch (e) { id = null; }
    return id;
  }

  function setVoceNaturale(id) {
    try {
      if (id) localStorage.setItem(CHIAVE_VOCE_NATURALE, id);
      else localStorage.removeItem(CHIAVE_VOCE_NATURALE);
    } catch (e) { /* storage negato */ }
  }

  function voceNaturalePronta(id) {
    return naturaleVoci.some(function (v) { return v.installata && (!id || v.id === id); });
  }

  // Il peso misurato dal programma sui file presenti, non la stima del
  // catalogo: è quello che si libera davvero togliendo la voce.
  function pesoVoce(v) {
    if (!v) return 0;
    return v.mbReale || v.mb || 0;
  }

  // La voce naturale in uso: quella scelta se è installata, altrimenti la
  // prima disponibile. Restituisce l'identificativo, o null se non ce n'è.
  function naturaleScelta() {
    if (!naturalePronta || !ponteNaturale()) return null;
    const scelta = voceNaturaleSalvata();
    if (scelta && voceNaturalePronta(scelta)) return scelta;
    const prima = naturaleVoci.filter(function (v) { return v.installata; })[0];
    return prima ? prima.id : null;
  }

  function aggiornaNaturale() {
    const p = ponteNaturale();
    if (!p || typeof p.stato !== "function") {
      naturalePronta = false;
      return Promise.resolve({ ok: true, disponibile: false, installata: false });
    }
    return Promise.resolve(p.stato()).then(function (s) {
      naturalePronta = !!(s && s.ok && s.installata);
      naturaleVoci = (s && Array.isArray(s.voci)) ? s.voci : [];
      return s || { ok: true, disponibile: true, installata: false };
    }).catch(function () {
      naturalePronta = false;
      naturaleVoci = [];
      return { ok: false, installata: false };
    });
  }

  function fermaAudio() {
    if (audioNaturale) {
      try { audioNaturale.pause(); } catch (e) { /* già fermo */ }
      audioNaturale = null;
    }
  }

  // L'audio arriva come WAV dal processo principale: si riproduce a pezzi, così
  // la lettura comincia subito anche su un testo lungo.
  function parlaNaturale(testo) {
    const p = ponteNaturale();
    const scelta = naturaleScelta();
    if (!p || typeof p.pronuncia !== "function" || !scelta) return false;
    const pezzi = frasi(testo);
    if (!pezzi.length) return false;

    stopSpeaking();
    parlando = true;
    let indice = 0;
    let audioPartito = false;

    const avanti = function () {
      if (!parlando || indice >= pezzi.length) {
        parlando = false;
        notifica();
        return;
      }
      const pezzo = pezzi[indice++];
      Promise.resolve(p.pronuncia(pezzo, ritmo(), scelta)).then(function (r) {
        if (!parlando) return;
        if (!r || !r.ok || !r.wav) throw new Error((r && (r.errore || r.motivo)) || "voce naturale non disponibile");
        const byte = new Uint8Array(r.wav);
        const url = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(new window.Blob([byte], { type: "audio/wav" })) : "";
        const audio = new window.Audio(url);
        audioNaturale = audio;
        audio.onended = function () {
          if (url) { try { URL.revokeObjectURL(url); } catch (e) { /* niente */ } }
          audioNaturale = null;
          avanti();
        };
        audio.onerror = audio.onended;
        audioPartito = true;
        return audio.play();
      }).catch(function (err) {
        if (!parlando) return;
        parlando = false;
        fermaAudio();
        if (!audioPartito) {
          // Se la voce naturale non parte, la lettura continua con la voce del
          // sistema: non deve restare muta.
          try { if (window.console && window.console.warn) window.console.warn("Voce naturale: " + String((err && err.message) || err)); } catch (e) { /* niente */ }
          parlaConSistema(testo);
        } else {
          notifica();
        }
      });
    };

    avanti();
    notifica();
    return true;
  }

  // All'avvio si sa già se la voce naturale è installata.
  aggiornaNaturale();

  // Un solo ascoltatore per tutta l'app: la vista di Neura si ridisegna a ogni
  // visita, e registrarlo ogni volta li accumulerebbe senza motivo.
  let aggiornaElencoVoci = null;
  if (window.speechSynthesis) {
    const quandoCambiano = function () { if (typeof aggiornaElencoVoci === "function") aggiornaElencoVoci(); };
    if (typeof window.speechSynthesis.addEventListener === "function") window.speechSynthesis.addEventListener("voiceschanged", quandoCambiano);
    else window.speechSynthesis.onvoiceschanged = quandoCambiano;
  }

  function vociItaliane() {
    if (!window.speechSynthesis) return [];
    const voci = window.speechSynthesis.getVoices() || [];
    return voci.filter(function (v) { return /^it/i.test(v.lang); });
  }

  // Il programma desktop usa solo le voci installate nel sistema (SAPI su
  // Windows, voce di sistema su macOS): Chrome ed Edge aggiungono voci online
  // che lì non esistono. Per questo il selettore mostra tutte quelle che il
  // sistema offre, con le italiane in cima, invece di nascondere le altre.
  function tutteLeVoci() {
    if (!window.speechSynthesis) return { italiane: [], altre: [] };
    const voci = (window.speechSynthesis.getVoices() || []).slice();
    const italiane = voci.filter(function (v) { return /^it/i.test(v.lang); })
      .sort(function (a, b) { return punteggioVoce(b) - punteggioVoce(a); });
    const altre = voci.filter(function (v) { return !/^it/i.test(v.lang); })
      .sort(function (a, b) {
        return String(a.lang).localeCompare(String(b.lang)) || String(a.name).localeCompare(String(b.name));
      });
    return { italiane: italiane, altre: altre };
  }

  const NOMI_SISTEMA = { windows: "Windows", macos: "macOS", linux: "Linux", android: "Android", ios: "iPhone o iPad", altro: "questo sistema" };

  // Il sistema può non avere voci italiane: succede spesso nel programma
  // desktop appena installato, dove restano solo voci di altre lingue. Qui si
  // riconosce il sistema per dare i passaggi giusti, non quelli generici.
  function sistemaRilevato() {
    const d = window.npDesktop;
    if (d && d.platform) {
      if (d.platform === "win32") return "windows";
      if (d.platform === "darwin") return "macos";
      if (d.platform === "linux") return "linux";
      return "altro";
    }
    try {
      const det = NP.ambiente && typeof NP.ambiente.detect === "function" ? NP.ambiente.detect() : null;
      const os = det && det.os;
      if (os === "mac") return "macos";
      return os || "altro";
    } catch (e) { return "altro"; }
  }

  function istruzioniVoci(id) {
    const coda = '<li class="mini">Torna qui quando hai finito: l\'elenco si aggiorna da solo, senza riavviare.</li></ol>';
    const inizio = '<ol class="voice-steps">';
    if (id === "windows") {
      return inizio +
        "<li><em>Impostazioni</em> → <em>Data e ora e lingua</em> → <em>Riconoscimento vocale</em>.</li>" +
        "<li><em>Aggiungi voci</em> → scegli <strong>Italiano (Italia)</strong> → <em>Aggiungi</em>.</li>" + coda;
    }
    if (id === "macos") {
      return inizio +
        "<li><em>Impostazioni di Sistema</em> → <em>Accessibilità</em> → <em>Contenuto pronunciato</em>.</li>" +
        "<li><em>Voce di sistema</em> → <em>Gestisci voci</em> → <strong>Italiano</strong> → <em>Scarica</em> (meglio una <em>Premium</em> o <em>Migliorata</em>).</li>" + coda;
    }
    if (id === "linux") {
      return inizio +
        "<li>Installa le voci italiane: <code>sudo apt install espeak-ng</code> (o <code>speech-dispatcher</code> con <code>pico2wave</code>).</li>" +
        "<li>Se usi il programma installato, riaprilo dopo l\'installazione.</li>" + coda;
    }
    return inizio +
      "<li>Il sistema è questo dispositivo: le voci si aggiungono da <em>Impostazioni</em> → <em>Accessibilità</em> → <em>Sintesi vocale</em>.</li>" +
      "<li>Installa la voce <strong>italiana</strong> e torna qui.</li>" + coda;
  }

  function vociMancanti(gruppi) {
    return !!(gruppi && gruppi.italiane.length === 0 && gruppi.altre.length > 0);
  }

  // Le voci «Natural», «Neural» e «Premium» sono registrazioni, non sintesi a
  // formanti: a parità di italiano vale la pena sceglierle.
  function punteggioVoce(v) {
    const nome = String(v.name || "");
    let s = 0;
    if (/natural|neural|premium|enhanced/i.test(nome)) s += 9;
    if (/^google/i.test(nome)) s += 6;
    if (/microsoft/i.test(nome) && /(elsa|isabella|diego|cosimo|fiamma|giuseppe|benigno|alice|giulia)/i.test(nome)) s += 5;
    if (/siri/i.test(nome)) s += 4;
    if (/^(alice|luca|paola|federica|chiara|fabio)/i.test(nome)) s += 3;
    if (/compact|espeak|pico|festival|robot/i.test(nome)) s -= 8;
    if (/^it[-_]it/i.test(v.lang)) s += 2;
    return s;
  }

  function voceSalvata() {
    let nome = null;
    try { nome = localStorage.getItem(CHIAVE_VOCE); } catch (e) { nome = null; }
    if (!nome) return null;
    const basso = String(nome).toLowerCase();
    // Si cerca fra tutte le voci del sistema: una voce scelta in un'altra
    // lingua deve restare valida anche dopo una ricarica.
    const tutte = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
    return tutte.filter(function (v) { return String(v.name).toLowerCase() === basso; })[0] || null;
  }

  function voceMigliore() {
    const salvata = voceSalvata();
    if (salvata) return salvata;
    const gruppi = tutteLeVoci();
    // Senza voci italiane si legge con la migliore disponibile: una voce in
    // un'altra lingua è comunque meglio del silenzio.
    const lista = gruppi.italiane.length ? gruppi.italiane : gruppi.altre;
    if (!lista.length) return null;
    return lista.slice().sort(function (a, b) { return punteggioVoce(b) - punteggioVoce(a); })[0];
  }

  function setVoce(nome) {
    try {
      if (nome) localStorage.setItem(CHIAVE_VOCE, nome);
      else localStorage.removeItem(CHIAVE_VOCE);
    } catch (e) { /* storage negato */ }
  }

  // Velocità di lettura: 1 è il passo normale. Il valore vale sia per le voci
  // del sistema sia per quella naturale, che viene rallentata o accelerata
  // alla fonte invece di essere riprodotta a un'altra velocità.
  const RITMO_MIN = 0.7;
  const RITMO_MAX = 1.4;

  function ritmo() {
    let v = 1;
    try { v = parseFloat(localStorage.getItem(CHIAVE_RITMO)); } catch (e) { v = 1; }
    if (!isFinite(v) || v <= 0) v = 1;
    return Math.min(RITMO_MAX, Math.max(RITMO_MIN, v));
  }

  function setRitmo(v) {
    const pulito = Math.min(RITMO_MAX, Math.max(RITMO_MIN, Number(v) || 1));
    try { localStorage.setItem(CHIAVE_RITMO, String(pulito)); } catch (e) { /* storage negato */ }
    return pulito;
  }

  function notifica() {
    try {
      if (typeof window.CustomEvent !== "function") return;
      document.dispatchEvent(new window.CustomEvent("np:voce", { detail: { attiva: parlando, dettatura: listening } }));
    } catch (e) { /* niente */ }
  }

  // Il testo viene spezzato in frasi: la sintesi respira invece di correre, e
  // le pause tra una frase e l'altra sono quelle di una lettura vera.
  function frasi(testo) {
    const pezzi = String(testo || "").match(/[^.!?;:]+[.!?;:]*/g) || [];
    const out = [];
    let corrente = "";
    pezzi.forEach(function (p) {
      const t = p.trim();
      if (!t) return;
      if (corrente && (corrente + " " + t).length > 190) { out.push(corrente); corrente = t; }
      else corrente = corrente ? corrente + " " + t : t;
    });
    if (corrente) out.push(corrente);
    return out.slice(0, 8);
  }

  function speak(html) {
    if (!voiceOn()) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = (tmp.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;
    if (parlaNaturale(text)) return;
    parlaConSistema(text);
  }

  // Voce del sistema: è la strada di sempre, e resta il ripiego quando la voce
  // naturale non risponde.
  function parlaConSistema(text) {
    if (!window.speechSynthesis) return;
    const lista = frasi(text);
    if (!lista.length) return;

    try {
      window.speechSynthesis.cancel();
      const voce = voceMigliore();
      parlando = true;
      lista.forEach(function (t, i) {
        const u = new SpeechSynthesisUtterance(t);
        // Con una voce di ripiego in un'altra lingua la lingua va allineata,
        // altrimenti il motore legge il testo con una fonetica che non c'è.
        u.lang = (voce && voce.lang) || "it-IT";
        u.rate = Math.min(2, 0.97 * ritmo());
        u.pitch = 1;
        u.volume = 1;
        if (voce) u.voice = voce;
        if (i === lista.length - 1) {
          u.onend = function () { parlando = false; notifica(); };
          u.onerror = function () { parlando = false; notifica(); };
        }
        window.speechSynthesis.speak(u);
      });
      notifica();
    } catch (e) { parlando = false; }
  }

  function stopSpeaking() {
    parlando = false;
    fermaAudio();
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    notifica();
  }

  function stopListening() {
    if (!listening) return false;
    try { if (recog) recog.stop(); } catch (e) { /* niente */ }
    listening = false;
    const mic = document.getElementById("micBtn");
    if (mic) mic.setAttribute("aria-pressed", "false");
    notifica();
    return true;
  }

  function renderLog(typing) {
    const log = document.getElementById("chatLog");
    if (!log) return;
    log.innerHTML = state.chat.map(function (m) {
      return '<div class="msg ' + m.role + '"><span class="msg-avatar" aria-hidden="true">' + (m.role === "neura" ? "N" : "Tu") + '</span><div class="msg-body">' + m.html + "</div></div>";
    }).join("") + (typing ? '<div class="msg neura typing"><span class="msg-avatar" aria-hidden="true">N</span><div class="msg-body" aria-label="Neura sta scrivendo"><span class="typing"><i></i><i></i><i></i></span></div></div>' : "");
    log.scrollTop = log.scrollHeight;
  }

  function quickChips(list) {
    const box = document.getElementById("chatQuick");
    if (!box) return;
    box.innerHTML = (list || []).map(function (s) {
      return '<button type="button" class="chip" data-suggest="' + esc(s) + '">' + esc(s) + "</button>";
    }).join("");
  }

  function send(text) {
    const clean = String(text || "").trim();
    if (!clean) return;
    if (!state.chat.length) state.chat.push({ role: "neura", html: WELCOME });

    state.chat.push({ role: "user", html: "<p>" + esc(clean) + "</p>" });
    renderLog(true);
    const input = document.getElementById("neuraInput");
    if (input) { input.value = ""; input.style.height = "auto"; }

    setTimeout(function () {
      let res;
      try { res = NP.neura.answer(clean); }
      catch (e) { res = { html: "<p>Ho avuto un problema a leggere i contenuti. Riprova con una domanda più semplice.</p>", suggest: ["Come inizio?"] }; }
      state.chat.push({ role: "neura", html: res.html });
      A.saveChat();
      renderLog(false);
      quickChips(res.suggest);
      speak(res.html);
    }, 360);
  }

  views.neura = function () {
    const suDesktop = !!(window.npDesktop && window.npDesktop.platform);
    const piattaforma = sistemaRilevato();
    if (!state.chat.length) {
      state.chat.push({ role: "neura", html: WELCOME });
    }

    A.setTitle("Neura");
    A.page(
      '<div class="page-head" style="margin-bottom:1.2rem"><p class="eyebrow">Consulente digitale</p><h1>Chiedi, capisci, orientati.</h1>' +
        '<p class="lead">Neura lavora solo sui contenuti di questo programma: niente cloud, niente account. Quando non sa, lo dice.</p></div>' +
      '<div class="neura-layout">' +
        '<section class="chat-panel" aria-label="Conversazione con Neura">' +
          '<header class="chat-head"><span class="neura-orb" aria-hidden="true"></span><div><h2>Neura</h2><p>Conoscenza locale · nessun dato inviato</p></div>' +
            '<button type="button" class="chip chat-stop" id="stopBtn" title="Zittisci la voce">Stop</button><span class="chat-status">pronta</span></header>' +
          '<div class="chat-log" id="chatLog" role="log" aria-live="polite"></div>' +
          '<div class="chat-quick" id="chatQuick"></div>' +
          '<form class="chat-form" id="chatForm">' +
            '<button type="button" class="icon-btn" id="micBtn" title="Detta la domanda" aria-label="Detta la domanda" aria-pressed="false" style="display:none">' + A.icon("wave") + "</button>" +
            '<textarea class="chat-input" id="neuraInput" rows="1" placeholder="Scrivi una domanda…" aria-label="La tua domanda"></textarea>' +
            '<button type="submit" class="send-btn" aria-label="Invia">' + A.icon("arrow") + "</button>" +
          "</form>" +
        "</section>" +
        '<aside class="grid" style="gap:1rem">' +
          '<div class="card"><h3>Che cosa posso chiedere</h3><ul class="text-small">' +
            "<li>«Che cos'è l'ansia?»</li><li>«Un esercizio per dormire»</li><li>«Come inizio?»</li><li>«Che differenza c'è tra psicologo e psichiatra?»</li><li>«I miei dati sono al sicuro?»</li>" +
          "</ul></div>" +
          '<div class="card"><h3>Quando non basta</h3><p class="text-small">Se il disagio è intenso, dura da settimane o c\'è un rischio, Neura non è lo strumento giusto: serve una persona.</p>' +
            '<div class="pill-row"><a class="chip" href="#/sicurezza">Numeri utili</a><a class="chip" href="#/colloquio">Colloquio</a></div></div>' +
          '<div class="card"><h3>Voce</h3><p class="text-small">Il pulsante dell\'altoparlante in alto attiva o disattiva la lettura. Puoi fermarla con Stop, con «Ferma l\'audio» nella barra in alto o con Esc.</p>' +
            '<div class="form-field"><label class="field-label" for="voiceSelect">Voce del dispositivo</label>' +
              '<select class="input" id="voiceSelect"><option value="">Automatica (consigliata)</option></select></div>' +
            '<div class="form-field voice-ritmo"><label class="field-label" for="voiceRitmo">Velocità di lettura</label>' +
              '<div class="ritmo-riga"><input type="range" id="voiceRitmo" min="0.7" max="1.4" step="0.05" value="1" aria-describedby="voiceRitmoValore">' +
              '<output class="ritmo-valore" id="voiceRitmoValore" for="voiceRitmo">100%</output></div>' +
              '<p class="text-small muted mb-0">Vale per tutte le voci, naturale compresa.</p></div>' +
            '<p class="text-small muted" id="voiceNote">Lettura delle voci del sistema in corso…</p>' +
            '<div class="pill-row" id="voiceAzioni">' +
              '<button type="button" class="chip" id="voiceRileggi" title="Rilegge l\'elenco delle voci installate">Rileggi l\'elenco</button>' +
              (suDesktop && piattaforma !== "linux" ? '<button type="button" class="chip" id="voiceImpostazioni" title="Apre le impostazioni voce del sistema">Aggiungi una voce</button>' : "") +
            "</div>" +
            (ponteNaturale() ? '<div class="voice-naturale" id="voiceNaturale">' +
              '<p class="text-small mb-0" id="voiceNaturaleNota"></p>' +
              '<div class="pill-row" id="voiceNaturaleVoci"></div>' +
              '<div class="pill-row">' +
                '<button type="button" class="chip" id="voiceNaturaleRimuovi" title="Libera lo spazio occupato dalle voci naturali" hidden>Rimuovi le voci naturali</button>' +
              "</div></div>" : "") +
            '<p class="text-small muted" id="voiceSpiega" hidden></p>' +
            '<div class="voice-help" id="voiceAiuto" hidden></div>' +
            '<p class="text-small muted mb-0">La voce usa il sintetizzatore del dispositivo: nessun audio lascia il computer. Su Windows la più naturale è quella «Natural», su macOS quella «Premium»: se non compare, si aggiunge dalle impostazioni di sistema.</p></div>' +
        "</aside>" +
      "</div>"
    );

    renderLog(false);
    quickChips(["Come inizio?", "Che cos'è l'ansia?", "Un esercizio per dormire", "Come preparo la relazione?"]);

    const form = document.getElementById("chatForm");
    const input = document.getElementById("neuraInput");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input ? input.value : "");
    });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          send(input.value);
        }
      });
      input.addEventListener("input", function () {
        input.style.height = "auto";
        input.style.height = Math.min(130, input.scrollHeight) + "px";
      });
    }

    const quick = document.getElementById("chatQuick");
    if (quick) quick.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-suggest]");
      if (btn) send(btn.getAttribute("data-suggest"));
    });

    const stop = document.getElementById("stopBtn");
    if (stop) stop.addEventListener("click", function () { stopSpeaking(); A.toast("Voce fermata."); });

    // Scelta della voce: quella migliore disponibile resta il default.
    const sel = document.getElementById("voiceSelect");
    if (sel) {
      const riempi = function () {
        const gruppi = tutteLeVoci();
        const attuale = voceMigliore();
        const opzioni = function (lista) {
          return lista.map(function (v) {
            return '<option value="' + esc(v.name) + '">' + esc(v.name) + " (" + esc(v.lang) + ")</option>";
          }).join("");
        };
        const pronte = naturaleVoci.filter(function (v) { return v.installata; });
        sel.innerHTML = '<option value="">Automatica (consigliata)</option>' +
          (pronte.length ? '<optgroup label="Voci naturali">' + pronte.map(function (v) {
            return '<option value="' + NATURALE + ":" + esc(v.id) + '">' + esc(v.nome) + " — voce naturale (" + esc(v.genere) + ")</option>";
          }).join("") + "</optgroup>" : "") +
          (gruppi.italiane.length ? '<optgroup label="Italiano">' + opzioni(gruppi.italiane) + "</optgroup>" : "") +
          (gruppi.altre.length ? '<optgroup label="Altre lingue">' + opzioni(gruppi.altre) + "</optgroup>" : "");
        const naturale = naturaleScelta();
        sel.value = naturale ? NATURALE + ":" + naturale : (attuale ? attuale.name : "");
        const nota = document.getElementById("voiceNote");
        if (nota) {
          const tot = gruppi.italiane.length + gruppi.altre.length;
          nota.textContent = (pronte.length ? "Voce naturale installata. " : "") + (tot
            ? "Voci lette dal sistema: " + tot + (gruppi.italiane.length ? " (" + gruppi.italiane.length + " in italiano)" : "") + "."
            : "Il sistema non ha ancora dichiarato le sue voci: si popolano dopo qualche istante, oppure vanno aggiunte dalle impostazioni di sistema.");
        }
        // Le voci «Online (Natural)» di Edge vivono sul cloud di Microsoft: non
        // si installano nel computer, e il programma non può usarle. Meglio
        // dirlo qui, dove si sceglie la voce, che lasciare il dubbio.
        const spiega = document.getElementById("voiceSpiega");
        if (spiega) {
          spiega.hidden = false;
          spiega.textContent = suDesktop
            ? "Le voci «Online (Natural)» che il browser mostra (Elsa Online, Diego Online…) sono sul cloud di Microsoft: non si installano nel computer, quindi il programma non le vede. Qui restano le voci installate in " +
              (NOMI_SISTEMA[piattaforma] || "questo sistema") + ": scegline una, oppure aggiungine altre."
            : "Chrome ed Edge aggiungono voci online che il programma installato non vede: qui puoi usarle, nel programma restano quelle del sistema.";
        }
        const aiuto = document.getElementById("voiceAiuto");
        if (aiuto) {
          if (vociMancanti(gruppi) && !naturalePronta) {
            const ripiego = voceMigliore();
            aiuto.hidden = false;
            aiuto.innerHTML = "<p><strong>Il sistema non offre voci italiane.</strong> Neura legge lo stesso, con " +
              (ripiego ? "<strong>" + esc(ripiego.name) + "</strong> (" + esc(ripiego.lang) + ")" : "la voce predefinita") +
              ": si sente, ma la pronuncia non è italiana. Una voce italiana si aggiunge in un minuto, su " + esc(NOMI_SISTEMA[sistemaRilevato()] || "questo sistema") + ":</p>" +
              istruzioniVoci(sistemaRilevato()) +
              '<button type="button" class="chip" id="voiceProva" title="Fai parlare Neura con questa voce">Ascoltala</button>';
          } else {
            aiuto.hidden = true;
            aiuto.innerHTML = "";
          }
        }
      };
      const aiutoBox = document.getElementById("voiceAiuto");
      if (aiutoBox) aiutoBox.addEventListener("click", function (e) {
        if (!e.target.closest || !e.target.closest("#voiceProva")) return;
        speak("<p>Ecco come suono con la voce che ho trovato. Se vuoi la pronuncia italiana, aggiungi una voce del sistema.</p>");
        A.toast("Provo la voce disponibile.");
      });
      riempi();
      sel.addEventListener("change", function () {
        setVoce(sel.value);
        const sceltaNaturale = /^__naturale__:/.test(sel.value)
          ? naturaleVoci.filter(function (v) { return NATURALE + ":" + v.id === sel.value; })[0]
          : null;
        A.toast(sceltaNaturale ? "Voce naturale: " + sceltaNaturale.nome + "." : (sel.value ? "Voce impostata: " + sel.value : "Torno alla voce automatica."));
        speak("<p>Ecco come suono. Se ti va bene, andiamo avanti.</p>");
      });
      // L'ascolto delle voci è registrato una volta sola all'avvio del modulo:
      // qui si aggiorna solo la funzione che ridisegna l'elenco.
      if (window.speechSynthesis && typeof window.speechSynthesis.addEventListener !== "function") {
        window.speechSynthesis.onvoiceschanged = function () { riempi(); };
      }
      aggiornaElencoVoci = riempi;

      // Velocità di lettura: l'anteprima parte quando si lascia il cursore,
      // non a ogni passo, altrimenti le frasi si accavallano.
      const ritmoBox = document.getElementById("voiceRitmo");
      const ritmoValore = document.getElementById("voiceRitmoValore");
      const mostraRitmo = function (v) {
        if (ritmoValore) ritmoValore.textContent = Math.round(v * 100) + "%";
        if (ritmoBox) ritmoBox.value = String(v);
      };
      mostraRitmo(ritmo());
      if (ritmoBox) {
        ritmoBox.addEventListener("input", function () { mostraRitmo(setRitmo(ritmoBox.value)); });
        ritmoBox.addEventListener("change", function () {
          const v = setRitmo(ritmoBox.value);
          mostraRitmo(v);
          A.toast(v < 0.95 ? "Leggo più piano." : (v > 1.05 ? "Leggo più veloce." : "Velocità normale."));
          speak("<p>Ecco come leggo a questa velocità.</p>");
        });
        // Un doppio clic riporta al passo normale, senza cercare il centro.
        ritmoBox.addEventListener("dblclick", function () { mostraRitmo(setRitmo(1)); A.toast("Velocità normale."); });
      }

      const rileggi = document.getElementById("voiceRileggi");
      if (rileggi) rileggi.addEventListener("click", function () {
        const prima = tutteLeVoci();
        const nPrima = prima.italiane.length + prima.altre.length;
        riempi();
        const dopo = tutteLeVoci();
        const nDopo = dopo.italiane.length + dopo.altre.length;
        if (!nDopo) A.toast("Nessuna voce leggibile: aggiungine una dalle impostazioni del sistema.");
        else if (nDopo !== nPrima) A.toast("Ora il sistema offre " + nDopo + " voci.");
        else if (suDesktop) A.toast("Sono sempre " + nDopo + ": se ne hai appena aggiunta una, chiudi e riapri il programma.");
        else A.toast("Sono sempre " + nDopo + ".");
      });

      // Voce naturale facoltativa: si scarica una volta e resta nel computer.
      const scatolaNaturale = document.getElementById("voiceNaturale");
      const notaNaturale = document.getElementById("voiceNaturaleNota");
      const vociNaturale = document.getElementById("voiceNaturaleVoci");
      const rimuoviNaturale = document.getElementById("voiceNaturaleRimuovi");
      const disegnaNaturale = function (s) {
        if (!scatolaNaturale || !notaNaturale) return;
        const stato = s || {};
        if (Array.isArray(stato.voci)) naturaleVoci = stato.voci;
        const voci = naturaleVoci;
        const pronte = voci.filter(function (v) { return v.installata; });
        naturalePronta = !!stato.installata || (stato.installata === undefined && pronte.length > 0);

        // Una voce per pulsante: quelle già installate si scelgono, le altre
        // dicono quanto pesano e si scaricano una alla volta.
        if (vociNaturale) {
          const scelta = naturaleScelta();
          vociNaturale.innerHTML = voci.map(function (v) {
            const attiva = v.installata && v.id === scelta;
            const testo = v.installata
              ? esc(v.nome) + " · " + esc(v.genere) + " · " + pesoVoce(v) + " MB" + (attiva ? " ✓" : "")
              : "Installa " + esc(v.nome) + " · " + v.mb + " MB";
            const pulsante = '<button type="button" class="chip' + (attiva ? " is-active" : "") + '" data-voce="' + esc(v.id) + '"' +
              (v.installata ? ' aria-pressed="' + (attiva ? "true" : "false") + '"' : "") + ">" + testo + "</button>";
            // Una voce installata si può togliere da sola: l'altra resta.
            return v.installata
              ? '<span class="voce-naturale-riga">' + pulsante +
                '<button type="button" class="chip chip-togli" data-rimuovi="' + esc(v.id) + '" title="Togli ' + esc(v.nome) +
                ' e libera ' + pesoVoce(v) + ' MB">Togli</button></span>'
              : pulsante;
          }).join("");
        }

        if (stato.disponibile === false) {
          // Su Mac il motore locale non c'è (gli archivi ufficiali non
          // contengono le librerie che servono): la voce naturale sono quelle
          // «Premium» di Apple, che il programma usa come voci del sistema.
          if (/^darwin/.test(String(stato.motivo || ""))) {
            notaNaturale.innerHTML = "Su Mac la voce naturale è quella <strong>«Premium» di Apple</strong>: si scarica una volta da Impostazioni di Sistema → Accessibilità → Contenuto pronunciato → Gestisci voci, poi compare qui nell'elenco.";
          } else {
            notaNaturale.textContent = "La voce naturale si scarica per Windows e Linux, su processori Intel e ARM: su questo sistema restano le voci del sistema.";
          }
          if (vociNaturale) vociNaturale.innerHTML = "";
          if (rimuoviNaturale) rimuoviNaturale.hidden = true;
          return;
        }

        if (pronte.length) {
          // Il totale dice quanto si libera togliendo tutto: voci misurate più
          // il motore, che resta finché serve almeno una voce.
          notaNaturale.innerHTML = "<strong>Voci naturali pronte: " +
            pronte.map(function (v) { return esc(v.nome); }).join(" e ") + ".</strong> " +
            (stato.spazio ? "Occupano " + stato.spazio + " MB sul disco, motore compreso. " : "") +
            "Sono generate sul tuo computer: nessun testo esce da qui.";
        } else {
          notaNaturale.textContent = "Voce naturale (facoltativa): suona come una persona, non come un robot. Si scarica una volta sola" +
            (stato.peso ? " (circa " + stato.peso + " MB)" : "") + " e poi funziona anche senza Internet.";
        }
        if (rimuoviNaturale) rimuoviNaturale.hidden = pronte.length === 0;
      };

      if (ponteNaturale()) {
        aggiornaNaturale().then(function (s) { disegnaNaturale(s); riempi(); });

        if (vociNaturale) vociNaturale.addEventListener("click", function (e) {
          const bottone = e.target && e.target.closest ? e.target.closest("[data-voce],[data-rimuovi]") : null;
          if (!bottone) return;
          const p = ponteNaturale();
          if (!p) return;

          // Togliere una sola voce: il motore e l'altra restano dove sono.
          if (bottone.hasAttribute("data-rimuovi")) {
            const togli = bottone.getAttribute("data-rimuovi");
            if (typeof p.rimuoviVoce !== "function") return;
            bottone.disabled = true;
            Promise.resolve(p.rimuoviVoce(togli)).then(function (s) {
              const voci = (s && Array.isArray(s.voci)) ? s.voci : naturaleVoci;
              naturaleVoci = voci;
              naturalePronta = !!(s && s.installata);
              if (voceNaturaleSalvata() === togli) setVoceNaturale(null);
              // Se era quella in uso, si continua con l'altra senza riavviare.
              const restante = naturaleScelta();
              setVoce(restante ? NATURALE + ":" + restante : null);
              disegnaNaturale(s && s.ok ? s : { disponibile: true, installata: naturalePronta, voci: voci });
              riempi();
              const nome = (voci.filter(function (v) { return v.id === togli; })[0] || {}).nome || togli;
              A.toast("Voce naturale rimossa: " + nome +
                (s && s.liberati ? " · liberati " + s.liberati + " MB" : "") + ".");
            }).catch(function () { A.toast("Non sono riuscito a rimuovere quella voce."); });
            return;
          }

          const id = bottone.getAttribute("data-voce");
          const voce = naturaleVoci.filter(function (v) { return v.id === id; })[0];
          if (!voce) return;

          // Già installata: la si sceglie, e si sente subito come suona.
          if (voce.installata) {
            setVoceNaturale(id);
            setVoce(NATURALE + ":" + id);
            disegnaNaturale({ disponibile: true, installata: true, voci: naturaleVoci });
            riempi();
            A.toast("Voce naturale: " + voce.nome + ".");
            speak("<p>Ecco come suono con questa voce.</p>");
            return;
          }

          if (typeof p.scarica !== "function") return;
          bottone.disabled = true;
          if (notaNaturale) notaNaturale.textContent = "Scarico " + voce.nome + ": ci vuole un minuto e non serve altro.";
          A.toast("Scarico la voce naturale…");
          Promise.resolve(p.scarica(id)).then(function (s) {
            if (s && s.ok && s.installata) {
              naturalePronta = true;
              setVoceNaturale(id);
              setVoce(NATURALE + ":" + id);
              disegnaNaturale(s);
              riempi();
              A.toast("Voce naturale pronta: " + voce.nome + ".");
            } else {
              disegnaNaturale({ disponibile: true, installata: pronte.length > 0, voci: naturaleVoci });
              A.toast("Voce naturale non installata: " + ((s && (s.errore || s.motivo)) || "riprova") + ".");
            }
          }).catch(function () {
            disegnaNaturale({ disponibile: true, installata: pronte.length > 0, voci: naturaleVoci });
            A.toast("Voce naturale non installata: controlla la connessione e riprova.");
          });
        });

        if (rimuoviNaturale) rimuoviNaturale.addEventListener("click", function () {
          const p = ponteNaturale();
          if (!p || typeof p.rimuovi !== "function") return;
          Promise.resolve(p.rimuovi()).then(function (s) {
            naturalePronta = !!(s && s.installata);
            if (!naturalePronta) { setVoce(null); setVoceNaturale(null); }
            // Prima si aggiorna l'elenco delle voci, poi il selettore: al
            // contrario resterebbero le opzioni appena rimosse.
            disegnaNaturale(s && s.ok ? s : { disponibile: true, installata: naturalePronta, voci: naturaleVoci });
            riempi();
            A.toast("Voce naturale rimossa: torno alle voci del sistema.");
          }).catch(function () { A.toast("Non sono riuscito a rimuovere la voce naturale."); });
        });

        if (typeof ponteNaturale().onProgresso === "function") {
          ponteNaturale().onProgresso(function (st) {
            if (!notaNaturale || !st) return;
            notaNaturale.textContent = "Scarico la voce naturale… " + (st.percentuale || 0) + "%";
          });
        }
      }

      // Il pannello delle voci si apre dal processo principale: la pagina non
      // può lanciare da sola i collegamenti di sistema.
      const imposta = document.getElementById("voiceImpostazioni");
      if (imposta) imposta.addEventListener("click", function () {
        const d = window.npDesktop;
        const apri = d && d.sistema && d.sistema.impostazioniVoce;
        if (typeof apri !== "function") { A.toast("Le impostazioni voce si aprono dal sistema."); return; }
        Promise.resolve(apri()).then(function (r) {
          if (r && r.ok) A.toast("Aperte le impostazioni voce di " + (NOMI_SISTEMA[piattaforma] || "sistema") + ".");
          else A.toast("Non sono riuscito ad aprire le impostazioni: cercale nel sistema.");
        }).catch(function () { A.toast("Non sono riuscito ad aprire le impostazioni."); });
      });
    }

    // Riconoscimento vocale, se disponibile
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const mic = document.getElementById("micBtn");
    if (mic && SR) {
      mic.style.display = "grid";
      mic.addEventListener("click", function () {
        if (listening) { try { recog.stop(); } catch (e) {} return; }
        try {
          recog = new SR();
          recog.lang = "it-IT";
          recog.interimResults = false;
          recog.maxAlternatives = 1;
          recog.onstart = function () { listening = true; mic.setAttribute("aria-pressed", "true"); A.toast("Ti ascolto…"); notifica(); };
          recog.onend = function () { listening = false; mic.setAttribute("aria-pressed", "false"); notifica(); };
          recog.onerror = function () { listening = false; mic.setAttribute("aria-pressed", "false"); A.toast("Microfono non disponibile: controlla il permesso nella barra in alto."); notifica(); };
          recog.onresult = function (ev) {
            const t = ev.results[0][0].transcript;
            if (input) input.value = t;
            send(t);
          };
          recog.start();
        } catch (e) { A.toast("Riconoscimento vocale non disponibile."); }
      });
    }

    setTimeout(function () { if (input) input.focus(); }, 120);
  };

  // API per il resto dell'app
  NP.neuraUI = {
    send: send,
    speak: speak,
    stop: stopSpeaking,
    setVoice: setVoice,
    voiceOn: voiceOn,
    welcome: WELCOME,
    voci: vociItaliane,
    vociTutte: tutteLeVoci,
    voceNaturale: aggiornaNaturale,
    ritmo: ritmo,
    setRitmo: setRitmo,
    naturaleAttiva: naturaleScelta,
    parlaNaturale: parlaNaturale,
    voceAttuale: voceMigliore,
    mancanoItaliane: function () { return vociMancanti(tutteLeVoci()); },
    istruzioniVoci: istruzioniVoci,
    sistema: sistemaRilevato,
    setVoce: setVoce,
    stopListening: stopListening,
    isSpeaking: function () { return parlando; },
    isListening: function () { return listening; }
  };
})();
