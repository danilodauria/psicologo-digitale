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
  let parlando = false;

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
    if (!voiceOn() || !window.speechSynthesis) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = (tmp.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;
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
        u.rate = 0.97;
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
            '<p class="text-small muted" id="voiceNote">Lettura delle voci del sistema in corso…</p>' +
            '<div class="voice-help" id="voiceAiuto" hidden></div>' +
            '<p class="text-small muted mb-0">La voce usa il sintetizzatore del dispositivo: nessun audio lascia il computer. Su Windows e macOS la più naturale è quella «Natural» o «Premium»: se non compare, si aggiunge dalle impostazioni di sistema.</p></div>' +
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
        sel.innerHTML = '<option value="">Automatica (consigliata)</option>' +
          (gruppi.italiane.length ? '<optgroup label="Italiano">' + opzioni(gruppi.italiane) + "</optgroup>" : "") +
          (gruppi.altre.length ? '<optgroup label="Altre lingue">' + opzioni(gruppi.altre) + "</optgroup>" : "");
        sel.value = attuale ? attuale.name : "";
        const nota = document.getElementById("voiceNote");
        if (nota) {
          const tot = gruppi.italiane.length + gruppi.altre.length;
          nota.textContent = tot
            ? "Voci lette dal sistema: " + tot + (gruppi.italiane.length ? " (" + gruppi.italiane.length + " in italiano)" : "") +
              ". Il programma desktop vede solo le voci installate nel computer; Chrome ed Edge ne aggiungono altre online, che restano nel browser."
            : "Il sistema non ha ancora dichiarato le sue voci: si popolano dopo qualche istante, oppure vanno aggiunte dalle impostazioni di sistema.";
        }
        const aiuto = document.getElementById("voiceAiuto");
        if (aiuto) {
          if (vociMancanti(gruppi)) {
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
        A.toast(sel.value ? "Voce impostata: " + sel.value : "Torno alla voce automatica.");
        speak("<p>Ecco come suono. Se ti va bene, andiamo avanti.</p>");
      });
      if (window.speechSynthesis) {
        const riaggiorna = function () { riempi(); };
        if (typeof window.speechSynthesis.addEventListener === "function") window.speechSynthesis.addEventListener("voiceschanged", riaggiorna);
        else window.speechSynthesis.onvoiceschanged = riaggiorna;
      }
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
