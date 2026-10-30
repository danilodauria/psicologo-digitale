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

  /* Routing --------------------------------------------------------------- */

  window.addEventListener("hashchange", function () { A.render(); });

  document.querySelectorAll("#mainNav a, #moreMenu a").forEach(function (a) {
    a.addEventListener("click", function () { closeMenus(); });
  });

  /* Avvio ----------------------------------------------------------------- */

  A.setTitle("");
  A.render();

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline non disponibile */ });
    });
  }
})();
