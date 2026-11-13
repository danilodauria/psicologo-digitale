/* ==========================================================================
   Psicologo Digitale · nucleo dell'applicazione
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

window.NP = window.NP || {};

NP.app = (function () {
  "use strict";

  const app = document.getElementById("app");
  const views = {};
  const PREFIX = "psicologo-digitale:v1:";

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* spazio pieno o storage negato */ }
  }

  const state = {
    intake: readJSON("intake", { answers: {}, started: false, completedAt: null, consent: false, updatedAt: null }),
    scales: readJSON("scales", {}),
    diary: readJSON("diary", []),
    course: readJSON("course", { done: [], notes: {} }),
    quizStats: readJSON("quiz", { played: 0, best: 0, correct: 0, total: 0, byCat: {} }),
    reportNotes: readJSON("reportNotes", { note: "", clinician: "" }),
    chat: [],
    pendingAsk: null,
    filters: { q: "", cat: "tutte" }
  };

  function saveIntake() { state.intake.updatedAt = new Date().toISOString(); writeJSON("intake", state.intake); }
  function saveScales() { writeJSON("scales", state.scales); }
  function saveDiary() { writeJSON("diary", state.diary); }
  function saveCourse() { writeJSON("course", state.course); }
  function saveQuizStats() { writeJSON("quiz", state.quizStats); }
  function saveReportNotes() { writeJSON("reportNotes", state.reportNotes); }
  function saveChat() { writeJSON("chat", state.chat.slice(-40)); }

  const ICONS = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    wave: '<path d="M2 12c2.5 0 2.5-5 5-5s2.5 10 5 10 2.5-5 5-5 2.5 2 5 2"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="M5 10v4M9 10v4M13 10v4"/>',
    spark: '<path d="m12 3 1.9 5.8L20 10.7l-6.1 1.9L12 18.4l-1.9-5.8L4 10.7l6.1-1.9L12 3Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.9 6.4-6.4 2.9 2.9-6.4 6.4-2.9Z"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    crown: '<path d="M3 7l4 5 5-7 5 7 4-5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>',
    pin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.circle) + "</svg>";
  }

  const esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  function page(html) {
    app.innerHTML = '<div class="wrap page fade-in">' + html + "</div>";
  }

  function setTitle(t) {
    document.title = (t ? t + " · " : "") + "Psicologo Digitale";
  }

  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2800);
  }

  function go(route) {
    const next = "#/" + String(route || "").replace(/^#?\/?/, "");
    if (location.hash === next) render();
    else location.hash = next;
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  }
  function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) + " · " +
      d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  /* ---------------------------------------------------------------- Scale */

  function getScale(id) {
    return (NP.data.scales || []).filter(function (s) { return s.id === id; })[0] || null;
  }

  function scaleScore(scale, answers) {
    let sum = 0;
    const nOpt = (scale.opzioni || []).length;
    scale.items.forEach(function (it, i) {
      let v = answers[i];
      if (v == null) v = 0;
      v = Number(v) || 0;
      if (it.inverso) v = (nOpt - 1) - v;
      sum += v;
    });
    if (scale.punteggio.tipo === "scala100") return sum * 4;
    return sum;
  }

  function scaleMax(scale) {
    return scale.punteggio.tipo === "scala100" ? 100 : scale.punteggio.max;
  }

  function scaleBand(scale, score) {
    const bands = scale.punteggio.bande;
    for (let i = 0; i < bands.length; i++) {
      if (score <= bands[i].fino) return bands[i];
    }
    return bands[bands.length - 1];
  }

  function scalePercent(scale, score) {
    return Math.round((score / scaleMax(scale)) * 100);
  }

  function scaleDone(id) {
    return !!(state.scales[id] && state.scales[id].doneAt);
  }

  /* ---------------------------------------------------------------- Intake */

  function intakeQuestions() {
    return NP.data.intake || [];
  }

  function intakeVisible() {
    const a = state.intake.answers || {};
    return intakeQuestions().filter(function (q) {
      if (typeof q.if !== "function") return true;
      try { return !!q.if(a); } catch (e) { return false; }
    });
  }

  function intakeProgress() {
    const visible = intakeVisible();
    const answered = visible.filter(function (q) { return isAnswered(q); }).length;
    return { answered: answered, total: visible.length, pct: visible.length ? Math.round((answered / visible.length) * 100) : 0 };
  }

  function isAnswered(q) {
    const a = state.intake.answers || {};
    const v = a[q.id];
    if (q.tipo === "consenso") return v === true;
    if (q.tipo === "fine" || q.tipo === "info" || q.tipo === "allerta") return true;
    if (q.tipo === "multipla") return Array.isArray(v) && v.length > 0;
    if (q.tipo === "scala") return typeof v === "number";
    if (v == null || v === "") return false;
    return true;
  }

  function nextQuestionIndex() {
    const visible = intakeVisible();
    for (let i = 0; i < visible.length; i++) {
      if (!isAnswered(visible[i])) return i;
    }
    return visible.length - 1;
  }

  function riskFlags() {
    const a = state.intake.answers || {};
    const flags = [];
    if (a.sic_pensieri === "piano") flags.push({ level: "alto", testo: "Riferiti pensieri di morte con un piano o un gesto già compiuto: richiede una valutazione immediata." });
    else if (a.sic_pensieri === "ricorrenti") flags.push({ level: "alto", testo: "Pensieri ricorrenti che sarebbe meglio non esserci: da valutare con urgenza." });
    else if (a.sic_pensieri === "fugaci") flags.push({ level: "medio", testo: "Pensieri fugaci di morte senza intenzione riferita: da esplorare in colloquio." });
    if (a.sic_sicuro === "no") flags.push({ level: "alto", testo: "La persona riferisce di non sentirsi al sicuro in questo momento." });
    if (a.sic_autolesione === "alcune") flags.push({ level: "medio", testo: "Autolesionismo ripetuto negli ultimi dodici mesi." });
    else if (a.sic_autolesione === "una") flags.push({ level: "basso", testo: "Un episodio di autolesionismo negli ultimi dodici mesi." });
    if (a.sic_violenza === "si") flags.push({ level: "alto", testo: "Riferita violenza, minaccia o controllo da parte di qualcuno." });
    if (Array.isArray(a.cor_comportamenti) && a.cor_comportamenti.some(function (v) { return v !== "nessuno"; })) {
      flags.push({ level: "medio", testo: "Comportamenti alimentari a rischio: serve una valutazione specializzata." });
    }
    if (a.dip_controllo === "sempre") flags.push({ level: "medio", testo: "Uso di sostanze o comportamenti con conseguenze quotidiane riferite." });
    return flags;
  }

  function areaLabel(id) {
    const a = (NP.data.aree || []).filter(function (x) { return x.id === id; })[0];
    return a ? a.label : id;
  }

  function intensityLabel(v) {
    if (v < 2.5) return { label: "Contenuta", livello: 1 };
    if (v < 5) return { label: "Moderata", livello: 2 };
    if (v < 7.5) return { label: "Alta", livello: 3 };
    return { label: "Molto alta", livello: 4 };
  }

  function buildProfile() {
    const a = state.intake.answers || {};
    const acc = {};

    intakeQuestions().forEach(function (q) {
      if (!q.area || !a[q.id] && a[q.id] !== 0) return;
      const v = a[q.id];
      let val = null;

      if (q.tipo === "scala") {
        const min = q.min != null ? q.min : 0, max = q.max != null ? q.max : 10;
        const num = Number(v);
        if (isNaN(num)) return;
        if (q.speciale === "ore") {
          val = Math.max(0, Math.min(10, (8 - num) * 2.4));
        } else {
          let p = ((num - min) / (max - min)) * 10;
          if (q.invertita) p = 10 - p;
          val = Math.max(0, Math.min(10, p));
        }
      } else if (q.tipo === "scelta") {
        const opt = (q.opzioni || []).filter(function (o) { return o.v === v; })[0];
        if (opt && typeof opt.peso === "number") val = Math.max(0, Math.min(10, opt.peso));
      } else if (q.tipo === "multipla" && Array.isArray(v)) {
        val = Math.max(0, Math.min(10, v.length * 2.8));
      }

      if (val != null && q.area !== "impatto" && q.area !== "sicurezza" && q.area !== "funzionamento") {
        acc[q.area] = acc[q.area] || [];
        acc[q.area].push(val);
      }
    });

    const aree = Object.keys(acc).map(function (id) {
      const avg = acc[id].reduce(function (s, x) { return s + x; }, 0) / acc[id].length;
      const band = intensityLabel(avg);
      return { id: id, label: areaLabel(id), score: Math.round(avg * 10) / 10, label2: band.label, livello: band.livello };
    }).sort(function (x, y) { return y.score - x.score; });

    const impatto = typeof a.impatto === "number" ? a.impatto : null;

    return {
      aree: aree,
      impatto: impatto,
      sicurezza: riskFlags(),
      risorse: Array.isArray(a.forze) ? a.forze : [],
      rete: Array.isArray(a.rete) ? a.rete : [],
      obiettivi: a.obiettivi || "",
      urgenza: a.urgenza || "",
      disponibilita: a.disponibilita || "",
      aspettative: a.aspettative || ""
    };
  }

  function profileSummary(p) {
    if (!p.aree.length) return "Il colloquio non è ancora completo: mancano le aree principali.";
    const top = p.aree.slice(0, 3);
    return "Aree emerse, in ordine di intensità percepita: " +
      top.map(function (x) { return x.label.toLowerCase() + " (" + x.label2.toLowerCase() + ")"; }).join(", ") +
      (p.impatto != null ? ". Impatto sulla vita quotidiana dichiarato: " + p.impatto + "/10." : ".");
  }

  /* -------------------------------------------------------------- Routing */

  function parseHash() {
    const raw = (location.hash || "#/").replace(/^#\/?/, "");
    const parts = raw.split("/").filter(Boolean).map(function (p) { return decodeURIComponent(p); });
    return { name: parts[0] || "home", params: parts.slice(1) };
  }

  const MORE_ROUTES = ["sedute", "esercizi", "nutrizione", "manuale", "palestra", "glossario", "sicurezza", "relazione", "licenze", "installa", "versioni"];

  function updateNav(name) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === name);
    });
    const moreBtn = document.getElementById("moreBtn");
    if (moreBtn) moreBtn.classList.toggle("is-active", MORE_ROUTES.indexOf(name) >= 0);
    document.querySelectorAll("#moreMenu a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-nav") === name);
    });
  }

  function render() {
    const r = parseHash();
    const name = views[r.name] ? r.name : "home";
    const view = views[name];
    try {
      view(r.params);
    } catch (err) {
      app.innerHTML = '<div class="wrap page"><div class="callout danger"><p><strong>Qualcosa non ha funzionato.</strong> Torna alla pagina iniziale e riprova.</p></div><p><a class="btn btn-primary" href="#/">Pagina iniziale</a></p></div>';
      if (window.console) console.error(err);
    }
    updateNav(name);
    window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    const nav = document.getElementById("mainNav");
    if (nav) nav.classList.remove("is-open");
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    const more = document.getElementById("moreMenu");
    if (more) more.hidden = true;
  }

  /* ------------------------------------------------------------------ Home */

  views.home = function () {
    const scales = (NP.data.scales || []).length;
    const moduli = NP.data.percorso ? NP.data.percorso.moduli.length : 0;
    const esercizi = NP.data.percorso ? NP.data.percorso.esercizi.length : 0;
    const voci = (NP.data.glossario || []).length;
    const prog = intakeProgress();
    const doneScales = Object.keys(state.scales).filter(function (k) { return scaleDone(k); }).length;
    const hasData = prog.answered > 0 || doneScales > 0;

    const resume = hasData
      ? '<div class="card card-soft mt-2"><div class="btn-row" style="justify-content:space-between"><div><h2 class="h-sub" style="margin-bottom:.2rem">Riprendi da dove eri</h2><p class="mb-0 text-small">' +
        (prog.answered ? "Colloquio: " + prog.answered + " domande su " + prog.total + " (" + prog.pct + "%). " : "") +
        (doneScales ? "Questionari completati: " + doneScales + ". " : "") +
        "I dati restano su questo dispositivo.</p></div>" +
        '<a class="btn btn-soft btn-sm" href="' + (prog.pct < 100 ? "#/colloquio" : "#/relazione") + '">' + (prog.pct < 100 ? "Riprendi il colloquio" : "Apri la relazione") + "</a></div></div>"
      : "";

    setTitle("La stanza d'ascolto");
    page(
      '<section class="hero"><div class="hero-grid">' +
        '<div class="hero-copy">' +
          '<p class="eyebrow">Pre-analisi psicologica guidata</p>' +
          '<h1>Prima di parlarne con qualcuno, <span class="accent">mettilo in ordine</span>.</h1>' +
          '<p class="lead">Un colloquio preliminare con <strong>Neura</strong>, sei questionari di autovalutazione, un percorso in otto tappe e una relazione da consegnare al professionista. Nulla esce dal tuo dispositivo.</p>' +
          '<div class="hero-actions"><a class="btn btn-primary" href="#/colloquio">' + icon("chat") + "Inizia il colloquio</a>" +
            '<a class="btn btn-ghost" href="#/valutazione">' + icon("list") + "Vai ai questionari</a></div>" +
          '<div class="hero-meta"><span>' + icon("lock") + "Nessun account</span><span>" + icon("download") + "Funziona offline</span><span>" + icon("shield") + "Non è una diagnosi</span></div>" +
        "</div>" +
        '<div class="orb-stage" aria-hidden="true"><div class="orb"><span class="orb-ring"></span><span class="orb-core"></span></div><span class="orb-caption">Neura · ascolto guidato</span></div>' +
      "</div>" +
      '<div class="stats">' +
        '<div class="stat"><b>' + scales + '</b><span>questionari su aree diverse</span></div>' +
        '<div class="stat"><b>' + moduli + '</b><span>tappe del percorso</span></div>' +
        '<div class="stat"><b>' + esercizi + '</b><span>esercizi guidati</span></div>' +
        '<div class="stat"><b>' + voci + '</b><span>voci di glossario</span></div>' +
      "</div>" +
      '<div class="disclaimer-band">' + icon("alert") +
        "<p><strong>Non sostituisce uno psicologo.</strong> Questo programma è educativo e di orientamento: aiuta a preparare un colloquio, non formula diagnosi e non prescrive cure. In caso di emergenza chiama il <strong>112</strong>.</p></div>" +
      resume +
      "</section>" +

      '<section class="section"><div class="section-head"><p class="eyebrow">Da dove iniziare</p><h2>Quattro porte, nessun ordine obbligato</h2><p>Scegli quella che ti somiglia di più. Puoi cambiare strada quando vuoi: i dati restano.</p></div>' +
        '<div class="grid grid-2">' +
          '<a class="card card-link" href="#/colloquio"><div class="card-icon">' + icon("chat") + "</div><h2 class=h-sub>Colloquio con Neura</h2><p>Domande adattive su motivo, storia, funzionamento e sicurezza. Neura restituisce un quadro preliminare e ti dice cosa portare al professionista.</p><span class=\"go\">Inizia · 15-20 minuti " + icon("arrow") + "</span></a>" +
          '<a class="card card-link" href="#/valutazione"><div class="card-icon">' + icon("list") + "</div><h2 class=h-sub>Questionari di autovalutazione</h2><p>Sei strumenti su umore, ansia, stress, sonno, esaurimento e benessere. Punteggi, fasce e spiegazioni, con avvisi di sicurezza.</p><span class=\"go\">Scegli un questionario " + icon("arrow") + "</span></a>" +
          '<a class="card card-link" href="#/percorso"><div class="card-icon">' + icon("compass") + "</div><h2 class=h-sub>Percorso in otto tappe</h2><p>Un programma strutturato di 8-16 settimane: obiettivi, pratiche, indicatori. Con protocolli di seduta e tempi.</p><span class=\"go\">Vedi il percorso " + icon("arrow") + "</span></a>" +
          '<a class="card card-link" href="#/relazione"><div class="card-icon">' + icon("print") + "</div><h2 class=h-sub>Relazione per il professionista</h2><p>Un documento PDF stampabile con dati, punteggi, segnali di sicurezza, obiettivi e domande suggerite per il clinico.</p><span class=\"go\">Genera la relazione " + icon("arrow") + "</span></a>" +
        "</div></section>" +

      '<section class="section"><div class="section-head"><p class="eyebrow">Come funziona</p><h2>Quattro passi, un obiettivo: arrivare preparato</h2></div>' +
        '<div class="steps">' +
          '<div class="step"><div><h3 class=h-sub-sm>Racconta</h3><p>Il colloquio adattivo esplora ciò che pesa, da quanto, come interferisce. Puoi fermarti e riprendere.</p></div></div>' +
          '<div class="step"><div><h3 class=h-sub-sm>Misura</h3><p>Uno o due questionari aggiungono intensità e confronto. Sono indicatori, non diagnosi.</p></div></div>' +
          '<div class="step"><div><h3 class=h-sub-sm>Orienta</h3><p>Neura propone un percorso, esercizi e domande da portare al professionista, con i segnali da non ignorare.</p></div></div>' +
          '<div class="step"><div><h3 class=h-sub-sm>Condividi</h3><p>La relazione PDF raccoglie tutto in modo leggibile: la consegni a chi può valutare davvero.</p></div></div>' +
        "</div></section>" +

      '<section class="section"><div class="grid grid-3">' +
        '<a class="card card-link" href="#/neura"><div class="card-icon">' + icon("spark") + "</div><h2 class=h-sub>Chiedi a Neura</h2><p>Un consulente digitale che risponde sui contenuti del programma, con voce e collegamenti. Non inventa.</p></a>" +
        '<a class="card card-link" href="#/manuale"><div class="card-icon">' + icon("book") + "</div><h2 class=h-sub>Manuale</h2><p>Dodici capitoli: primo colloquio, ansia, umore, sonno, stress, emozioni, pensieri, relazioni, trauma, corpo, etica.</p></a>" +
        '<a class="card card-link" href="#/sicurezza"><div class="card-icon">' + icon("shield") + "</div><h2 class=h-sub>Sicurezza e numeri utili</h2><p>Segnali d'allarme, cosa fare subito, numeri di ascolto e indicazioni per minori e violenza.</p></a>" +
      "</div></section>" +

      '<section class="section"><blockquote class="quote">Un programma non può sostituire una persona. Può però aiutarti ad arrivare preparato, con parole più precise e domande migliori.<footer>Il progetto · Psicologo Digitale</footer></blockquote></section>' +

      '<section class="section"><div class="grid grid-2">' +
        '<a class="card card-link" href="#/nutrizione"><div class="card-icon">' + icon("heart") + "</div><h2 class=h-sub>Nutrizione e umore</h2><p>Come cibo, sonno ed energia si parlano, cosa chiedere a dietista o dietologo e quali segnali non vale la pena aspettare.</p><span class=\"go\">Apri la sezione " + icon("arrow") + "</span></a>" +
        '<a class="card card-link" href="#/installa"><div class="card-icon">' + icon("download") + "</div><h2 class=h-sub>Portala con te</h2><p>Installa l'app sul telefono o sul computer, usala senza connessione e, se vuoi, aggiungi un modello locale con Ollama.</p><span class=\"go\">Installa " + icon("arrow") + "</span></a>" +
      "</div></section>" +

      '<section class="section"><div class="card"><h2 class=h-sub>Prima di cominciare, tre cose da sapere</h2><ul class="list-check">' +
        "<li>I dati restano nel browser del tuo dispositivo. Non c'è un server, non c'è un account.</li>" +
        "<li>I punteggi non sono una diagnosi e non definiscono chi sei.</li>" +
        "<li>Se c'è un rischio per la tua sicurezza, la priorità non è l'app: è il 112 o una persona di fiducia.</li>" +
      "</ul></div></section>"
    );
  };

  /* ------------------------------------------------------------ Backup */

  // Un posto solo anche per il backup: lo usano la pagina Licenze e il
  // colloquio prima di cancellare, così il file è sempre lo stesso e si
  // reimporta senza sorprese.
  function raccogliDati() {
    return {
      app: "Psicologo Digitale",
      version: 1,
      exportedAt: new Date().toISOString(),
      intake: state.intake,
      scales: state.scales,
      diary: state.diary,
      thoughts: readJSON("thoughts", []),
      course: state.course,
      quizStats: state.quizStats,
      reportNotes: state.reportNotes
    };
  }

  function esportaBackup() {
    const data = raccogliDati();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "psicologo-digitale-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 800);
    toast("Backup esportato.");
  }

  /* ------------------------------------------- Copia automatica nel browser */

  // Una copia al giorno, dentro lo stesso browser: se si azzera per sbaglio,
  // quella di ieri è ancora lì. Restano le ultime tre, e la chiave sopravvive
  // proprio all'azzeramento, che altrimenti porterebbe via anche la rete.
  const CHIAVE_COPIE = "copie";
  const CHIAVE_COPIE_MAX = "copieMax";
  const COPIE_MIN = 1;
  const COPIE_MAX = 7;
  const COPIE_PREDEFINITE = 3;

  // Quante copie tenere lo decide chi usa il programma: un diario lungo pesa,
  // e lo spazio del browser non è infinito. Il numero resta dentro un minimo
  // e un massimo, così la scelta non può svuotare la rete né mangiare tutto.
  function copieMassimo() {
    const n = Number(readJSON(CHIAVE_COPIE_MAX, COPIE_PREDEFINITE));
    if (!isFinite(n)) return COPIE_PREDEFINITE;
    return Math.max(COPIE_MIN, Math.min(COPIE_MAX, Math.round(n)));
  }

  function impostaCopieMassimo(n) {
    const pulito = Math.max(COPIE_MIN, Math.min(COPIE_MAX, Math.round(Number(n) || COPIE_PREDEFINITE)));
    writeJSON(CHIAVE_COPIE_MAX, pulito);
    // Riducendo il numero, le copie in più si tolgono subito invece di
    // restare lì fino al giorno dopo.
    const copie = copieAutomatiche();
    if (copie.length > pulito) scriviCopie(copie.slice(0, pulito));
    return pulito;
  }

  function fmtBytes(byte) {
    const b = Number(byte) || 0;
    if (b < 1024) return b + " B";
    if (b < 1048576) return Math.round(b / 1024) + " KB";
    return (b / 1048576).toFixed(1).replace(".", ",") + " MB";
  }

  function peso(testo) {
    try { return new Blob([testo]).size; } catch (e) { return String(testo).length; }
  }

  // Lo spazio si misura sul contenuto vero, non stimato: chi sceglie quante
  // copie tenere deve vedere quanto costano davvero.
  function spazioCopie() {
    const copie = copieAutomatiche();
    const pesi = copie.map(function (c) { return peso(JSON.stringify(c)); });
    return {
      pesi: pesi,
      totale: pesi.reduce(function (a, b) { return a + b; }, 0),
      totaleArchivio: peso(localStorage.getItem(PREFIX + CHIAVE_COPIE) || "[]"),
      massimo: copieMassimo()
    };
  }

  function haDati(d) {
    return !!d && !!(
      (d.intake && d.intake.answers && Object.keys(d.intake.answers).length) ||
      (d.scales && Object.keys(d.scales).length) ||
      (d.diary && d.diary.length) ||
      (d.thoughts && d.thoughts.length)
    );
  }

  function copieAutomatiche() {
    const elenco = readJSON(CHIAVE_COPIE, []);
    return Array.isArray(elenco) ? elenco : [];
  }

  function scriviCopie(elenco) {
    try { localStorage.setItem(PREFIX + CHIAVE_COPIE, JSON.stringify(elenco)); return true; }
    catch (e) { return false; }
  }

  // `forza` la usano gli azzeramenti: la copia si prende comunque, anche se
  // oggi è già stata fatta, perché è l'ultimo momento utile per averla.
  function salvaCopia(forza) {
    const oggi = new Date().toISOString().slice(0, 10);
    const copie = copieAutomatiche();
    const giaOggi = copie.length > 0 && String(copie[0].quando).slice(0, 10) === oggi;
    if (giaOggi && !forza) return false;
    const dati = raccogliDati();
    if (!haDati(dati)) return false;
    const voce = { quando: new Date().toISOString(), dati: dati };
    const aggiornate = giaOggi ? [voce].concat(copie.slice(1)) : [voce].concat(copie);
    // Se lo spazio è finito si tengono meno copie, invece di perdere quella nuova.
    for (let n = Math.min(aggiornate.length, copieMassimo()); n >= 1; n--) {
      if (scriviCopie(aggiornate.slice(0, n))) return true;
    }
    return false;
  }

  function ripristinaCopia(indice) {
    const copia = copieAutomatiche()[indice || 0];
    if (!copia || !copia.dati) return false;
    const d = copia.dati;
    state.intake = d.intake || state.intake;
    state.scales = d.scales || {};
    state.diary = d.diary || [];
    state.course = d.course || { done: [], notes: {} };
    state.quizStats = d.quizStats || state.quizStats;
    state.reportNotes = d.reportNotes || { note: "", clinician: "" };
    writeJSON("thoughts", Array.isArray(d.thoughts) ? d.thoughts : []);
    saveIntake(); saveScales(); saveDiary(); saveCourse(); saveQuizStats(); saveReportNotes();
    toast("Copia del " + fmtDate(copia.quando) + " ripristinata.");
    return true;
  }

  /* --------------------------------------------- Cancellare solo il colloquio */

  // Rifare il colloquio non deve costare i questionari già compilati né il
  // diario: si azzera ciò che appartiene al colloquio, e nient'altro. Il
  // consenso torna da confermare, perché le domande che seguono dipendono da
  // quello che si è appena accettato.
  function cancellaColloquio() {
    if (!confirm("Azzerare il colloquio e ricominciare dalla prima domanda? Questionari e diario restano.")) return false;
    salvaCopia(true);
    state.intake = { answers: {}, started: false, completedAt: null, consent: false, updatedAt: null, index: 0 };
    saveIntake();
    toast("Colloquio azzerato: questionari e diario sono rimasti.");
    return true;
  }

  /* ----------------------------------------------------- Cancellare i dati */

  // Un solo posto per l'azzeramento: lo usano la pagina Licenze e il colloquio,
  // così le due strade cancellano esattamente le stesse cose. Due conferme,
  // perché non si torna indietro.
  function cancellaDati() {
    if (!confirm("Cancellare colloquio, questionari, diario e note da questo dispositivo? L'operazione non si può annullare.")) return false;
    if (!confirm("Ultima conferma: vuoi davvero cancellare tutti i dati?")) return false;
    // Prima di cancellare: è l'ultimo momento in cui i dati ci sono ancora.
    salvaCopia(true);
    try {
      Object.keys(localStorage).forEach(function (k) {
        // La copia automatica non si tocca: è la rete sotto l'azzeramento.
        if (k.indexOf(PREFIX) === 0 && k !== PREFIX + CHIAVE_COPIE && k !== PREFIX + CHIAVE_COPIE_MAX) localStorage.removeItem(k);
      });
    } catch (e) { /* storage negato: la memoria si azzera lo stesso */ }
    state.intake = { answers: {}, started: false, completedAt: null, consent: false, updatedAt: null, index: 0 };
    state.scales = {};
    state.diary = [];
    state.course = { done: [], notes: {} };
    state.quizStats = { played: 0, best: 0, correct: 0, total: 0, byCat: {} };
    state.reportNotes = { note: "", clinician: "" };
    state.chat = [];
    toast("Dati cancellati.");
    return true;
  }

  return {
    state: state,
    views: views,
    PREFIX: PREFIX,
    esc: esc,
    icon: icon,
    page: page,
    setTitle: setTitle,
    toast: toast,
    go: go,
    render: render,
    readJSON: readJSON,
    writeJSON: writeJSON,
    saveIntake: saveIntake,
    saveScales: saveScales,
    saveDiary: saveDiary,
    saveCourse: saveCourse,
    saveQuizStats: saveQuizStats,
    saveReportNotes: saveReportNotes,
    saveChat: saveChat,
    esportaBackup: esportaBackup,
    salvaCopia: salvaCopia,
    copieAutomatiche: copieAutomatiche,
    copieMassimo: copieMassimo,
    impostaCopieMassimo: impostaCopieMassimo,
    spazioCopie: spazioCopie,
    fmtBytes: fmtBytes,
    ripristinaCopia: ripristinaCopia,
    cancellaColloquio: cancellaColloquio,
    cancellaDati: cancellaDati,
    fmtDate: fmtDate,
    fmtDateTime: fmtDateTime,
    getScale: getScale,
    scaleScore: scaleScore,
    scaleBand: scaleBand,
    scalePercent: scalePercent,
    scaleMax: scaleMax,
    scaleDone: scaleDone,
    intakeQuestions: intakeQuestions,
    intakeVisible: intakeVisible,
    intakeProgress: intakeProgress,
    isAnswered: isAnswered,
    nextQuestionIndex: nextQuestionIndex,
    riskFlags: riskFlags,
    buildProfile: buildProfile,
    profileSummary: profileSummary,
    areaLabel: areaLabel,
    intensityLabel: intensityLabel
  };
})();
