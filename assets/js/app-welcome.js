/* ==========================================================================
   Psicologo Digitale · benvenuto parlato di Neura
   Licenza del codice: MIT · Danilo D'Auria
   --------------------------------------------------------------------------
   All'apertura Neura si presenta. Il pannello è discreto, chiudibile e non
   blocca nulla; la voce usa il sintetizzatore del dispositivo e la stessa
   preferenza della chat. Chi non vuole sentire nulla può silenziarlo o
   nascondere il pannello per sempre.
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const PREFIX = A.PREFIX;
  const CHIAVE_NASCOSTO = PREFIX + "welcome-hidden";
  const CHIAVE_SESSIONE = PREFIX + "welcome-ritorno";
  const CHIAVE_AVVIO = PREFIX + "avvio-spiegato";

  const PRESENTAZIONE = "Sono Neura. Sono il cervello digitale di questa stanza d'ascolto: leggo, ascolto e ti aiuto a mettere in ordine le parole. Non ho una laurea, non faccio diagnosi e non ti giudico. Conosco ogni pagina di questo programma e non ricordo niente fuori dal tuo dispositivo. Cominciamo da una domanda semplice: come stai, adesso?";

  const TESTO = "<p><strong>Ciao, sono Neura.</strong> Sono il cervello digitale di questa stanza d'ascolto: leggo, ascolto e ti aiuto a mettere in ordine le parole.</p>" +
    "<p>Non ho una laurea, non faccio diagnosi e non ti giudico. Conosco ogni pagina di questo programma e non ricordo niente fuori dal tuo dispositivo.</p>" +
    "<p class=\"mb-0\">Cominciamo da una domanda semplice: <strong>come stai, adesso?</strong></p>";

  function leggi(chiave) {
    try { return localStorage.getItem(chiave); } catch (e) { return null; }
  }

  function scrivi(chiave, valore) {
    try { localStorage.setItem(chiave, valore); } catch (e) { /* storage negato */ }
  }

  function giaVista() {
    try { return sessionStorage.getItem(CHIAVE_SESSIONE) === "1"; } catch (e) { return false; }
  }

  function segnaVista() {
    try { sessionStorage.setItem(CHIAVE_SESSIONE, "1"); } catch (e) { /* niente */ }
  }

  function parla() {
    if (NP.neuraUI && typeof NP.neuraUI.speak === "function") {
      NP.neuraUI.speak(TESTO);
      return;
    }
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") return;
    try {
      window.speechSynthesis.cancel();
      const u = new window.SpeechSynthesisUtterance(PRESENTAZIONE);
      u.lang = "it-IT";
      u.rate = 0.96;
      u.pitch = 1.04;
      const voce = (window.speechSynthesis.getVoices() || []).filter(function (v) {
        return /^it/i.test(v.lang);
      })[0];
      if (voce) u.voice = voce;
      window.speechSynthesis.speak(u);
    } catch (e) { /* sintesi non disponibile */ }
  }

  function desktop() {
    const d = window.npDesktop;
    return d && d.platform ? d : null;
  }

  function nomeSistema(platform) {
    return { win32: "Windows", darwin: "macOS", linux: "Linux" }[platform] || "questo sistema";
  }

  // Il primo avvio nel programma installato è il momento in cui l'utente ha
  // appena visto l'avviso del sistema: qui trova i passaggi, così non deve
  // cercarli. Compare una volta sola per installazione.
  function notaAvvio() {
    const d = desktop();
    if (!d) return "";
    if (leggi(CHIAVE_AVVIO) === "1") return "";

    const istruzioni = d.platform === "win32"
      ? "<li>se compare <em>Windows ha protetto il PC</em>: <em>Altro informazioni</em> → <em>Esegui comunque</em>;</li>" +
        "<li>se il file resta bloccato: tasto destro → <em>Proprietà</em> → <em>Sblocca</em> → <em>OK</em>.</li>"
      : "<li>se dice che non può verificare il programma: <em>Impostazioni di Sistema</em> → <em>Privacy e sicurezza</em> → <em>Apri comunque</em>;</li>" +
        "<li>in alternativa: tasto destro sull'app → <em>Apri</em>.</li>";

    return '<div class="welcome-note">' +
      "<p><strong>Prima volta su questo computer.</strong> Il programma non ha un certificato commerciale, quindi " + A.esc(nomeSistema(d.platform)) + " ti ha chiesto conferma per aprirlo. Succederà ancora a ogni aggiornamento: è normale, e il consenso si dà così.</p>" +
      '<ul class="text-small">' + istruzioni + "</ul>" +
      '<p class="mini mb-0">Accanto ai pacchetti c\'è <code>SHA256SUMS.txt</code>: se l\'impronta del file coincide, il programma è esattamente quello pubblicato.</p>' +
      "</div>";
  }

  function chiudi(pannello, definitivo) {    if (definitivo) scrivi(CHIAVE_NASCOSTO, "1");
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
    }
    pannello.classList.remove("is-open");
    window.setTimeout(function () { pannello.remove(); }, 200);
  }

  function costruisci() {
    const pannello = document.createElement("aside");
    pannello.className = "welcome-panel is-open";
    pannello.setAttribute("role", "complementary");
    pannello.setAttribute("aria-label", "Benvenuto di Neura");

    pannello.innerHTML =
      '<div class="welcome-head"><span class="welcome-orb" aria-hidden="true"></span>' +
        "<div><strong>Neura</strong><span class=\"welcome-role\">ascolto guidato</span></div>" +
        '<button type="button" class="welcome-x" data-welcome="close" aria-label="Chiudi il benvenuto">×</button></div>' +
      '<div class="welcome-body">' + TESTO + "</div>" +
      notaAvvio() +
      '<div class="welcome-actions">' +
        '<button type="button" class="btn btn-soft btn-sm" data-welcome="speak">' + A.icon("wave") + "Ascolta</button>" +
        '<a class="btn btn-ghost btn-sm" href="#/neura" data-welcome="chat">Parla con Neura</a>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-welcome="hide">Non mostrarmelo più</button>' +
      "</div>";

    document.body.appendChild(pannello);

    pannello.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-welcome]");
      if (!btn) return;
      const azione = btn.getAttribute("data-welcome");
      if (azione === "speak") {
        parla();
        return;
      }
      if (azione === "chat") {
        chiudi(pannello, false);
        return;
      }
      chiudi(pannello, azione === "hide");
    });

    return pannello;
  }

  function avvia() {
    if (leggi(CHIAVE_NASCOSTO) === "1") return;
    if (giaVista()) return;

    const pannello = costruisci();
    segnaVista();
    if (desktop()) scrivi(CHIAVE_AVVIO, "1");

    const voceAttiva = !NP.neuraUI || typeof NP.neuraUI.voiceOn !== "function" || NP.neuraUI.voiceOn();
    if (voceAttiva) {
      window.setTimeout(function () {
        if (document.body.contains(pannello)) parla();
      }, 700);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", avvia);
  } else {
    avvia();
  }
})();
