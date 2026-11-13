/* ==========================================================================
   Psicologo Digitale · percorso, sedute, esercizi (interfaccia)
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;
  const P = NP.data.percorso;

  function isDone(id) { return (state.course.done || []).indexOf(id) >= 0; }

  function toggleDone(id) {
    const arr = state.course.done || [];
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(id);
    state.course.done = arr;
    A.saveCourse();
  }

  function moduleHTML(m) {
    const done = isDone(m.id);
    return '<article class="tl-item" data-module="' + m.id + '">' +
      '<div class="tl-num">' + m.n + "</div>" +
      "<div><h2 class=h-sub>" + esc(m.titolo) + "</h2>" +
      '<p class="tl-sub">' + esc(m.sottotitolo) + " · " + esc(m.settimane) + " · " + esc(m.durata) + "</p>" +
      "<p>" + esc(m.obiettivo) + "</p>" +
      '<div class="tl-meta"><span class="badge badge-blue">Tappa ' + m.n + "</span>" +
        '<span class="badge">' + m.esercizi.length + " esercizi</span>" +
        (done ? '<span class="badge badge-green">Completata</span>' : "") + "</div>" +
      '<button type="button" class="module-toggle" aria-expanded="false">' + A.icon("chevron") + "Contenuti, pratica e indicatore</button>" +
      '<div class="module-body">' +
        "<h3 class=h-sub-sm>Che cosa si fa</h3><ul>" + m.contenuti.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
        "<h3 class=h-sub-sm>Pratica tra le sedute</h3><p>" + esc(m.pratica) + "</p>" +
        "<h3 class=h-sub-sm>Indicatore di progresso</h3><p>" + esc(m.indicatore) + "</p>" +
        '<div class="callout warn"><p>' + esc(m.nota) + "</p></div>" +
        '<h3 class=h-sub-sm>Esercizi collegati</h3><div class="pill-row">' + m.esercizi.map(function (id) {
          const ex = P.esercizi.filter(function (e) { return e.id === id; })[0];
          return ex ? '<a class="chip" href="#/esercizi/' + ex.id + '">' + esc(ex.titolo) + "</a>" : "";
        }).join("") + "</div>" +
        '<div class="btn-row mt-2"><button type="button" class="btn btn-soft btn-sm mark-btn" data-id="' + m.id + '">' + (done ? "Segna come da fare" : "Segna come completata") + "</button></div>" +
      "</div></div></article>";
  }

  views.percorso = function () {
    const doneCount = (state.course.done || []).filter(function (id) {
      return P.moduli.some(function (m) { return m.id === id; });
    }).length;
    const pct = Math.round((doneCount / P.moduli.length) * 100);

    A.setTitle("Percorso");
    A.page(
      '<div class="page-head"><p class="eyebrow">Percorso strutturato</p><h1>Otto tappe, circa quattro mesi</h1>' +
        '<p class="lead">Un percorso educativo ispirato ai programmi brevi strutturati: obiettivi osservabili, pratica tra gli incontri, misurazioni ogni due settimane. Non è una psicoterapia: è la sua impalcatura.</p></div>' +
      '<div class="callout info"><p><strong>Come leggerlo.</strong> ' + esc(P.premessa) + "</p></div>" +
      '<div class="course-progress"><div class="progress"><div class="progress-meta"><span>Completate <strong>' + doneCount + " di " + P.moduli.length + "</strong></span><span>" + pct + '%</span></div><div class="progress-track"><div class="progress-bar" style="width:' + pct + '%"></div></div></div></div>' +
      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><h2 class=h-sub>Le regole del percorso</h2><ul class="list-check">' + P.regole.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="card"><h2 class=h-sub>Prima di iniziare</h2><p class="text-small">Se non hai ancora fatto il colloquio, parti da lì: le tappe funzionano meglio quando sai quale area vuoi lavorare.</p>' +
          '<div class="pill-row"><a class="chip" href="#/colloquio">Colloquio</a><a class="chip" href="#/valutazione">Questionari</a><a class="chip" href="#/sedute">Protocolli di seduta</a></div>' +
          '<p class="text-small muted mt-2">Se il rischio è alto, il percorso autonomo non è la strada: serve una valutazione professionale.</p></div>' +
      "</div>" +
      '<h2 class="mt-3">Le tappe</h2>' +
      '<div class="timeline mt-2">' + P.moduli.map(moduleHTML).join("") + "</div>" +
      '<div class="btn-row mt-3"><a class="btn btn-primary" href="#/esercizi">' + A.icon("activity") + 'Vai agli esercizi</a><a class="btn btn-ghost" href="#/sedute">Sedute e tempi</a></div>'
    );

    document.querySelectorAll(".module-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        const body = btn.nextElementSibling;
        if (body) body.classList.toggle("is-open", !open);
      });
    });

    document.querySelectorAll(".mark-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        toggleDone(btn.getAttribute("data-id"));
        views.percorso();
      });
    });
  };

  views.sedute = function () {
    A.setTitle("Sedute e tempi");
    A.page(
      '<div class="page-head"><p class="eyebrow">Protocolli</p><h1>Sette sedute, con tempi e contenuti</h1>' +
        '<p class="lead">Come si struttura un incontro di 45-60 minuti, cosa si fa in ciascuna fase e quali domande aiutano. È un modello per il professionista e una mappa per chi vuole capire cosa aspettarsi.</p></div>' +
      '<div class="callout warn"><p><strong>Questi protocolli non sono una terapia fai-da-te.</strong> Descrivono una cornice di lavoro clinico. La conduzione richiede formazione, supervisione e responsabilità professionale.</p></div>' +
      '<div class="grid grid-2 mt-2">' + P.sedute.map(function (s) {
        return '<article class="card exercise-card"><h2 class=h-sub>' + s.n + ". " + esc(s.titolo) + "</h2>" +
          '<p class="text-small muted">' + esc(s.durata) + " · " + esc(s.quando) + "</p>" +
          '<p><strong>Obiettivi.</strong></p><ul class="text-small">' + s.obiettivi.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" +
          '<div class="agenda">' + s.agenda.map(function (a) {
            return '<div class="agenda-row"><span class="agenda-min">' + esc(a.min) + "</span><div><b>" + esc(a.titolo) + "</b><span>" + esc(a.cosa) + "</span></div></div>";
          }).join("") + "</div>" +
          '<details class="mt-2"><summary style="cursor:pointer;font-weight:600;font-size:.9rem">Domande, materiali e compito</summary>' +
            '<p class="text-small mt-2"><strong>Domande utili</strong></p><ul class="text-small">' + s.domande.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
            '<p class="text-small"><strong>Materiali:</strong> ' + s.materiali.map(esc).join(", ") + "</p>" +
            '<p class="text-small"><strong>Compito:</strong> ' + esc(s.compito) + "</p>" +
            '<div class="callout warn"><p>' + esc(s.attenzione) + "</p></div>" +
          "</details></article>";
      }).join("") + "</div>" +
      '<p class="text-small muted mt-3">Frequenza iniziale consigliata: un incontro a settimana. Verifica dei progressi ogni due settimane con questionari brevi e diario.</p>'
    );
  };

  function exerciseCard(ex) {
    return '<a class="card card-link exercise-card" href="#/esercizi/' + ex.id + '">' +
      '<div class="card-icon">' + A.icon("activity") + "</div>" +
      "<h2 class=h-sub>" + esc(ex.titolo) + "</h2>" +
      '<p class="text-small muted">' + esc(ex.durata) + "</p>" +
      "<p>" + esc(ex.scopo) + "</p>" +
      '<span class="go">Apri ' + A.icon("arrow") + "</span></a>";
  }

  views.esercizi = function (params) {
    const id = params && params[0];
    if (id) { renderExercise(id); return; }

    A.setTitle("Esercizi");
    A.page(
      '<div class="page-head"><p class="eyebrow">Pratica guidata</p><h1>Dodici esercizi, passo per passo</h1>' +
        '<p class="lead">Strumenti di regolazione, attivazione e consapevolezza. Non sono una cura: sono pratiche da provare e discutere con il professionista.</p></div>' +
      '<div class="callout info"><p><strong>Come usarli.</strong> Scegli un esercizio, provalo una volta con calma e annota com\'è andata. Se ti fa stare peggio, fermati: non tutti gli strumenti vanno bene per tutti.</p></div>' +
      '<div class="grid grid-3 mt-2">' + P.esercizi.map(exerciseCard).join("") + "</div>" +
      '<p class="text-small muted mt-3">Se hai dolore cronico, condizioni mediche o una storia di trauma, chiedi indicazioni prima di praticare esercizi di respirazione forzata, contrazione muscolare o esposizione.</p>'
    );
  };

  // Precedente e successivo nell'ordine del percorso: lo stesso gesto che si
  // fa nel manuale, così non si torna all'elenco solo per andare avanti.
  function navEsercizi(ex) {
    const elenco = P.esercizi;
    const i = elenco.findIndex(function (e) { return e.id === ex.id; });
    const prev = elenco[i - 1], next = elenco[i + 1];
    return '<div class="btn-row mt-3">' +
      (prev ? '<a class="btn btn-ghost" data-nav="prev" href="#/esercizi/' + prev.id + '">← ' + esc(prev.titolo) + "</a>" : "") +
      '<a class="btn btn-soft" href="#/esercizi">Tutti gli esercizi</a>' +
      (next ? '<a class="btn btn-ghost" data-nav="next" href="#/esercizi/' + next.id + '">' + esc(next.titolo) + " →</a>" : "") +
      "</div>";
  }

  function renderExercise(id) {
    const elenco = P.esercizi;
    const posizione = elenco.findIndex(function (e) { return e.id === id; });
    const ex = elenco[posizione];
    if (!ex) { views.esercizi(); return; }

    A.setTitle(ex.titolo);
    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/esercizi">Esercizi</a><span>›</span>Esercizio ' + (posizione + 1) +
        " di " + elenco.length + " · " + esc(ex.durata) + "</p>" +
        "<h1>" + esc(ex.titolo) + "</h1><p class=\"lead\">" + esc(ex.scopo) + "</p></div>" +
      '<div class="grid grid-2">' +
        '<div class="card"><h2 class=h-sub>Quando usarlo</h2><p>' + esc(ex.quando) + "</p>" +
          "<h2 class=\"mt-2 h-sub\">Passo per passo</h2><ol class=\"exercise-steps\">" + ex.passo.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ol>" +
          '<div class="btn-row mt-2"><button type="button" class="btn btn-soft btn-sm" id="timerBtn">' + A.icon("clock") + "Avvia un timer" + "</button>" +
            '<button type="button" class="btn btn-ghost btn-sm" id="printEx">' + A.icon("print") + "Stampa</button></div>" +
          '<p class="text-small muted mt-2" id="timerOut" aria-live="polite"></p>' +
        "</div>" +
        '<div class="card"><h2 class=h-sub>Variante</h2><p>' + esc(ex.variante || "—") + "</p>" +
          "<h2 class=\"mt-2 h-sub\">Da sapere</h2><p>" + esc(ex.nota) + "</p>" +
          '<div class="callout warn"><p><strong>Non è una cura.</strong> Se l\'ansia o l\'umore restano alti, l\'esercizio non sostituisce una valutazione. Se compare un rischio, chiama il 112.</p></div>' +
          '<div class="pill-row mt-2"><a class="chip" href="#/percorso">Torna al percorso</a><a class="chip" href="#/neura">Chiedi a Neura</a><a class="chip" href="#/diario">Annota nel diario</a></div>' +
        "</div>" +
      "</div>" +
      navEsercizi(ex)
    );

    const printBtn = document.getElementById("printEx");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    const timerBtn = document.getElementById("timerBtn");
    const out = document.getElementById("timerOut");
    let timer = null;
    if (timerBtn) timerBtn.addEventListener("click", function () {
      if (timer) { clearInterval(timer); timer = null; timerBtn.textContent = "Avvia un timer"; if (out) out.textContent = "Timer fermato."; return; }
      const minutes = parseInt(ex.durata, 10) || 5;
      let secs = minutes * 60;
      timerBtn.textContent = "Ferma il timer";
      if (out) out.textContent = "Tempo rimasto: " + minutes + ":00";
      timer = setInterval(function () {
        secs--;
        const m = Math.floor(secs / 60), s = secs % 60;
        if (out) out.textContent = "Tempo rimasto: " + m + ":" + (s < 10 ? "0" : "") + s;
        if (secs <= 0) {
          clearInterval(timer); timer = null;
          timerBtn.textContent = "Avvia un timer";
          if (out) out.textContent = "Tempo concluso. Prenditi un momento per notare come stai.";
          A.toast("Esercizio concluso.");
        }
      }, 1000);
    });
  }
})();
