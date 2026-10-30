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

  function voiceFor() {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.filter(function (v) { return /it(-|_)?IT/i.test(v.lang); })[0] ||
      voices.filter(function (v) { return /^it/i.test(v.lang); })[0] || null;
  }

  function speak(html) {
    if (!voiceOn() || !window.speechSynthesis) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = (tmp.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.slice(0, 900));
      u.lang = "it-IT";
      u.rate = 0.98;
      u.pitch = 1.02;
      const v = voiceFor();
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function stopSpeaking() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
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
            '<button type="button" class="icon-btn" id="micBtn" title="Detta la domanda" aria-label="Detta la domanda" style="display:none">' + A.icon("wave") + "</button>" +
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
          '<div class="card"><h3>Voce</h3><p class="text-small">Il pulsante dell\'altoparlante in alto attiva o disattiva la lettura. Puoi fermarla con Stop o con Esc.</p>' +
            '<p class="text-small muted mb-0">La voce usa il sintetizzatore del dispositivo: nessun audio lascia il computer.</p></div>' +
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
          recog.onstart = function () { listening = true; mic.setAttribute("aria-pressed", "true"); A.toast("Ti ascolto…"); };
          recog.onend = function () { listening = false; mic.setAttribute("aria-pressed", "false"); };
          recog.onerror = function () { listening = false; mic.setAttribute("aria-pressed", "false"); A.toast("Microfono non disponibile."); };
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
  NP.neuraUI = { send: send, speak: speak, stop: stopSpeaking, setVoice: setVoice, voiceOn: voiceOn, welcome: WELCOME };
})();
