/* ==========================================================================
   Psicologo Digitale · avvio ed eventi globali
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const THEME_KEY = A.PREFIX + "theme";

  /* Tema ------------------------------------------------------------------ */

  function currentTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0a1020" : "#22345c");
    const btn = document.getElementById("themeBtn");
    if (btn) btn.setAttribute("aria-label", theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro");
  }

  applyTheme(currentTheme());

  /* Menu ------------------------------------------------------------------ */

  function closeMenus() {
    const nav = document.getElementById("mainNav");
    const btn = document.getElementById("menuBtn");
    if (nav) nav.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    const more = document.getElementById("moreMenu");
    const mbtn = document.getElementById("moreBtn");
    if (more) more.hidden = true;
    if (mbtn) mbtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  const themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");
  if (menuBtn && mainNav) menuBtn.addEventListener("click", function () {
    const open = mainNav.classList.contains("is-open");
    mainNav.classList.toggle("is-open", !open);
    menuBtn.setAttribute("aria-expanded", open ? "false" : "true");
  });

  const moreBtn = document.getElementById("moreBtn");
  const moreMenu = document.getElementById("moreMenu");
  if (moreBtn && moreMenu) moreBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    moreMenu.hidden = !moreMenu.hidden;
    moreBtn.setAttribute("aria-expanded", moreMenu.hidden ? "false" : "true");
  });

  document.addEventListener("click", function (e) {
    if (moreMenu && !moreMenu.hidden && !e.target.closest(".nav-more")) {
      moreMenu.hidden = true;
      if (moreBtn) moreBtn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenus();
      if (NP.neuraUI) NP.neuraUI.stop();
    }
  });

  /* Voce ------------------------------------------------------------------ */

  const voiceBtn = document.getElementById("voiceBtn");
  if (voiceBtn) {
    const on = !(function () {
      try { return localStorage.getItem(A.PREFIX + "voice") === "false"; } catch (e) { return false; }
    })();
    voiceBtn.setAttribute("aria-pressed", on ? "true" : "false");
    voiceBtn.addEventListener("click", function () {
      const next = voiceBtn.getAttribute("aria-pressed") !== "true";
      NP.neuraUI.setVoice(next);
      if (!next) NP.neuraUI.stop();
      A.toast(next ? "Voce di Neura attiva." : "Voce di Neura disattivata.");
    });
    // Su alcuni browser le voci arrivano in modo asincrono.
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = function () {};
    }
  }

  /* Numeri di telefono ----------------------------------------------------- */

  // Nel programma installato un collegamento «tel:» non ha un telefono da
  // chiamare: il numero viene copiato negli appunti, così resta utilizzabile.
  // Nel browser resta il comportamento normale, che sul telefono avvia la chiamata.
  document.addEventListener("click", function (e) {
    const a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (!a) return;
    const d = window.npDesktop;
    if (!d || !d.sistema || typeof d.sistema.copia !== "function") return;
    e.preventDefault();
    const numero = (a.textContent || "").replace(/\s+/g, " ").trim() || a.getAttribute("href").slice(4);
    Promise.resolve(d.sistema.copia(numero)).then(function (r) {
      A.toast(r && r.ok ? "Numero copiato: " + numero : "Chiama il " + numero);
    }).catch(function () { A.toast("Chiama il " + numero); });
  });

  /* Modalità discreta ------------------------------------------------------ */

  const mostraDiscreto = document.getElementById("mostraDiscreto");
  if (mostraDiscreto) mostraDiscreto.addEventListener("click", function () { A.svelaContenuti(); });

  /* Aggiornamento del sito -------------------------------------------------- */

  // Il service worker nuovo si installa e prende il controllo da solo, ma la
  // pagina aperta continua a girare con i file vecchi: senza un avviso una
  // versione nuova arriva solo alla riapertura. La barra compare quando il
  // controllo è già passato al service worker nuovo, e il pulsante ricarica
  // una volta sola: due clic non fanno due ricariche.
  function collegaAvvisoAggiornamento(reg, opzioni) {
    const opt = opzioni || {};
    const nav = opt.nav || (navigator.serviceWorker || null);
    const box = opt.box || document.getElementById("avvisoAggiornamento");
    const bottone = opt.bottone || document.getElementById("aggiornaRicaricando");
    const ricarica = opt.ricarica || function () { window.location.reload(); };
    const attesa = typeof opt.attesa === "number" ? opt.attesa : 1500;
    const avevaControllo = !!(nav && nav.controller);
    let cliccato = false;
    let ricaricato = false;
    let timer = null;

    function ricaricaUnaVolta() {
      if (ricaricato) return;
      ricaricato = true;
      if (timer) { clearTimeout(timer); timer = null; }
      if (bottone) bottone.disabled = true;
      ricarica();
    }

    function mostra() {
      if (box) box.hidden = false;
    }

    function aggiorna() {
      if (cliccato || ricaricato) return;
      cliccato = true;
      if (bottone) bottone.disabled = true;
      const inAttesa = reg && reg.waiting;
      if (inAttesa && typeof inAttesa.postMessage === "function") {
        // Il service worker deve prendere il controllo prima della ricarica,
        // o la pagina ripartirebbe con i file vecchi. Se il browser non manda
        // l'evento, il timer di riserva ricarica lo stesso.
        try { inAttesa.postMessage({ type: "SKIP_WAITING" }); } catch (e) {}
        timer = setTimeout(ricaricaUnaVolta, attesa);
      } else {
        ricaricaUnaVolta();
      }
    }

    if (nav && typeof nav.addEventListener === "function") {
      nav.addEventListener("controllerchange", function () {
        if (ricaricato) return;
        if (cliccato) { ricaricaUnaVolta(); return; }
        // Alla prima installazione il controllo passa per la prima volta: non
        // c'è una versione precedente da sostituire, quindi niente avviso.
        if (avevaControllo) mostra();
      });
    }
    if (reg && reg.waiting) mostra();
    if (bottone) bottone.addEventListener("click", aggiorna);
    return { aggiorna: aggiorna, mostra: mostra };
  }

  A.collegaAvvisoAggiornamento = collegaAvvisoAggiornamento;

  /* Routing --------------------------------------------------------------- */

  window.addEventListener("hashchange", function () { A.render(); });

  document.querySelectorAll("#mainNav a, #moreMenu a").forEach(function (a) {
    a.addEventListener("click", function () { closeMenus(); });
  });

  /* Avvio ----------------------------------------------------------------- */

  A.setTitle("");
  A.render();

  // La copia automatica si prende all'avvio, una volta al giorno: è il momento
  // in cui i dati delle volte precedenti sono ancora tutti lì.
  A.salvaCopia(false);

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        A.collegaAvvisoAggiornamento(reg);
        // Un controllo all'avvio e uno quando si torna sulla pagina: senza il
        // secondo, un'app lasciata aperta non si accorgerebbe di nulla.
        const cerca = function () {
          if (typeof reg.update !== "function") return;
          Promise.resolve(reg.update()).catch(function () {});
        };
        cerca();
        document.addEventListener("visibilitychange", function () {
          if (!document.hidden) cerca();
        });
      }).catch(function () { /* offline non disponibile */ });
    });
  }
})();
