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

  function chiudi(pannello, definitivo) {
    if (definitivo) scrivi(CHIAVE_NASCOSTO, "1");
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
