/* ==========================================================================
   Psicologo Digitale · questionari e Palestra della mente
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;

  /* ------------------------------------------------------- Elenco questionari */

  function scaleCard(s) {
    const done = A.scaleDone(s.id);
    const rec = state.scales[s.id];
    let badge = '<span class="badge">Da compilare</span>';
    if (done && rec) {
      const band = A.scaleBand(s, rec.score);
      badge = '<span class="badge ' + (band.livello >= 4 ? "badge-red" : band.livello >= 3 ? "badge-amber" : "badge-green") + '">' +
        esc(band.label) + " · " + rec.score + (s.punteggio.tipo === "scala100" ? "/100" : "/" + s.punteggio.max) + "</span>";
    }
    return '<a class="scale-item" href="#/valutazione/' + s.id + '">' +
      "<div><h2 class=h-sub>" + esc(s.titolo) + "</h2><p>" + esc(s.sigla) + " · " + esc(s.area) + " · " + esc(s.tempo) + "</p>" +
      '<div class="scale-meta">' + badge + '<span class="badge badge-blue">' + s.items.length + " item</span></div></div>" +
      '<span class="arrow" aria-hidden="true">' + A.icon("chevron") + "</span></a>";
  }

  views.valutazione = function (params) {
    if (params && params[0]) {
      const s = A.getScale(params[0]);
      if (s) { renderScale(s, params[1] === "nuovo"); return; }
    }

    const done = Object.keys(state.scales).filter(function (k) { return A.scaleDone(k); }).length;
    A.setTitle("Questionari");
    A.page(
      '<div class="page-head"><p class="eyebrow">Autovalutazione</p><h1>Misurare aiuta, se non diventa un&rsquo;etichetta</h1>' +
        '<p class="lead">Sei questionari costruiti su costrutti clinici riconosciuti. Indicano l\'intensità di un\'area nelle ultime settimane: non sono diagnosi e non definiscono chi sei.</p></div>' +
      (done
        ? '<div class="callout info"><p><strong>' + done + " di " + NP.data.scales.length + " questionari completati.</strong> Puoi rifarli quando vuoi: i punteggi precedenti vengono sostituiti. Confronta periodi diversi, non te stesso/a con gli altri.</p></div>"
        : '<div class="callout warn"><p><strong>Prima di iniziare.</strong> Rispondi pensando alle ultime due settimane (o al periodo indicato). Non c\'è una risposta giusta: c\'è la tua esperienza.</p></div>') +
      '<div class="scale-list mt-2">' + NP.data.scales.map(scaleCard).join("") + "</div>" +
      '<div class="callout warn mt-3"><p><strong>Un punteggio alto non è una diagnosi.</strong> Ansia e umore possono essere influenzati da sonno, sostanze, farmaci, condizioni mediche ed eventi di vita. Se un punteggio ti preoccupa, parlane con un professionista.</p></div>' +
      '<p class="mt-2"><a class="btn btn-soft" href="#/relazione">' + A.icon("print") + "Vai alla relazione</a></p>"
    );
  };

  /* ------------------------------------------------------------- Compilazione */

  function renderScale(scale, reset) {
    if (reset) {
      delete state.scales[scale.id];
      A.saveScales();
    }
    const rec = state.scales[scale.id];
    if (rec && rec.doneAt) { renderResult(scale, rec); return; }

    const answers = (rec && rec.answers) ? rec.answers : {};
    const answeredCount = Object.keys(answers).filter(function (k) { return answers[k] != null; }).length;
    const pct = Math.round((answeredCount / scale.items.length) * 100);

    const itemsHTML = scale.items.map(function (it, i) {
      const v = answers[i];
      return '<div class="item-block" data-item="' + i + '">' +
        '<div class="item-text"><span class="num">' + (i + 1) + ".</span><span>" + esc(it.t) + (it.rischio ? ' <span class="badge badge-red">segnale da segnalare</span>' : "") + "</span></div>" +
        '<div class="item-options">' + scale.opzioni.map(function (o, oi) {
          return '<label class="choice choice-compact' + (v === oi ? " is-selected" : "") + '"><input type="radio" name="it_' + i + '" value="' + oi + '"' + (v === oi ? " checked" : "") + "><span>" + esc(o) + "</span></label>";
        }).join("") + "</div></div>";
    }).join("");

    A.setTitle(scale.titolo);
    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/valutazione">Questionari</a><span>›</span>' + esc(scale.area) + "</p>" +
        "<h1>" + esc(scale.titolo) + "</h1>" +
        '<p class="lead">' + esc(scale.istruzioni) + "</p>" +
        '<div class="pill-row mt-1"><span class="badge badge-blue">' + esc(scale.sigla) + '</span><span class="badge">' + esc(scale.tempo) + '</span><span class="badge">' + scale.items.length + " domande</span></div></div>" +
      '<div class="scale-run">' +
        (scale.nota ? '<div class="callout info"><p><strong>Perché questo questionario.</strong> ' + esc(scale.perche) + "</p></div>" : "") +
        '<div class="scale-progress-slim"><div id="scaleProg" style="width:' + pct + '%"></div></div>' +
        '<form id="scaleForm" class="quiz-card">' + itemsHTML +
          '<div class="intake-actions"><span class="hint" id="scaleHint">' + answeredCount + " di " + scale.items.length + " risposte</span>" +
          '<button type="submit" class="btn btn-primary" id="scaleSubmit">' + A.icon("check") + "Calcola il risultato</button></div>" +
        "</form>" +
        '<p class="text-small muted mt-2">' + esc(scale.notaClinica) + "</p>" +
      "</div>"
    );

    const form = document.getElementById("scaleForm");
    if (!form) return;

    function refresh() {
      const n = Object.keys(answers).filter(function (k) { return answers[k] != null; }).length;
      const p = document.getElementById("scaleProg");
      const h = document.getElementById("scaleHint");
      if (p) p.style.width = Math.round((n / scale.items.length) * 100) + "%";
      if (h) h.textContent = n + " di " + scale.items.length + " risposte";
      const btn = document.getElementById("scaleSubmit");
      if (btn) btn.disabled = n < scale.items.length;
    }

    form.querySelectorAll('input[type="radio"]').forEach(function (input) {
      input.addEventListener("change", function () {
        const block = input.closest(".item-block");
        const idx = Number(block.getAttribute("data-item"));
        answers[idx] = Number(input.value);
        state.scales[scale.id] = { answers: answers, updatedAt: new Date().toISOString() };
        A.saveScales();
        block.querySelectorAll(".choice").forEach(function (c) { c.classList.remove("is-selected"); });
        const lab = input.closest(".choice");
        if (lab) lab.classList.add("is-selected");
        refresh();
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const n = Object.keys(answers).filter(function (k) { return answers[k] != null; }).length;
      if (n < scale.items.length) { A.toast("Rispondi a tutte le domande."); return; }
      const score = A.scaleScore(scale, answers);
      const band = A.scaleBand(scale, score);
      state.scales[scale.id] = {
        answers: answers, score: score, band: band.label, livello: band.livello,
        doneAt: new Date().toISOString()
      };
      A.saveScales();
      renderResult(scale, state.scales[scale.id]);
    });

    refresh();
  }

  function renderResult(scale, rec) {
    const band = A.scaleBand(scale, rec.score);
    const max = A.scaleMax(scale);
    const pct = A.scalePercent(scale, rec.score);
    const riskItem = scale.items.filter(function (i) { return i.rischio; })[0];
    const riskIdx = riskItem ? scale.items.indexOf(riskItem) : -1;
    const riskValue = riskIdx >= 0 && rec.answers ? Number(rec.answers[riskIdx]) : 0;

    const levels = scale.punteggio.bande.map(function (b) {
      return '<div class="bar-row"><span class="bar-label">' + esc(b.label) + '</span><span class="bar-track"><span class="bar-fill lv-' + b.livello + '" style="width:' + Math.round((b.fino / max) * 100) + '%"></span></span><span class="bar-value">≤ ' + b.fino + "</span></div>";
    }).join("");

    const itemsBars = scale.items.map(function (it, i) {
      const v = rec.answers && rec.answers[i] != null ? Number(rec.answers[i]) : 0;
      let val = v;
      if (it.inverso) val = (scale.opzioni.length - 1) - v;
      const p = Math.round((val / (scale.opzioni.length - 1)) * 100);
      return '<div class="bar-row"><span class="bar-label">' + esc(it.t.length > 58 ? it.t.slice(0, 56) + "…" : it.t) + '</span><span class="bar-track"><span class="bar-fill lv-' + (val >= 3 ? 4 : val >= 2 ? 3 : val >= 1 ? 2 : 1) + '" style="width:' + p + '%"></span></span><span class="bar-value">' + v + "</span></div>";
    }).join("");

    A.setTitle(scale.titolo + " · risultato");
    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/valutazione">Questionari</a><span>›</span>' + esc(scale.titolo) + "</p>" +
        "<h1>Il tuo risultato</h1></div>" +
      '<div class="scale-run">' +
        '<div class="result-hero">' +
          '<div class="score-big">' + rec.score + "</div>" +
          '<p class="score-sub">punteggio su ' + max + " · " + pct + "%</p>" +
          '<p class="score-band"><span class="badge ' + (band.livello >= 4 ? "badge-red" : band.livello >= 3 ? "badge-amber" : "badge-green") + '">' + esc(band.label) + "</span></p>" +
          "<p class=\"mt-2\" style=\"max-width:60ch;margin-inline:auto\">" + esc(band.testo) + "</p>" +
          '<p class="text-small muted">Compilato il ' + esc(A.fmtDate(rec.doneAt)) + "</p>" +
        "</div>" +

        (riskValue > 0
          ? '<div class="callout danger mt-2"><p><strong>Hai segnalato pensieri di farsi del male.</strong> Non è un dettaglio da mettere in fondo: parlane oggi con una persona di fiducia e con un professionista. Se c\'è un pericolo immediato, chiama il <strong>112</strong>.</p></div>' +
            '<div class="emergency-numbers">' + NP.data.sicurezza.numeri.slice(0, 3).map(function (n) {
              return '<div class="emergency-num"><b><a href="tel:' + n.tel + '">' + esc(n.numero) + "</a></b><span>" + esc(n.nome) + "</span></div>";
            }).join("") + "</div>"
          : "") +

        '<div class="card mt-2"><h2 class=h-sub>Come leggere le fasce</h2><div class="bars">' + levels + "</div>" +
          '<p class="text-small muted mb-0">La tua posizione è ' + esc(band.label.toLowerCase()) + ". Le fasce sono riferimenti di intensità, non soglie diagnostiche.</p></div>" +

        '<details class="card mt-2"><summary style="cursor:pointer;font-weight:600">Le tue risposte, una per una</summary><div class="bars mt-2">' + itemsBars + "</div></details>" +

        '<div class="grid grid-2 mt-2">' +
          '<div class="card"><h2 class=h-sub>Cosa portare al professionista</h2><ul class="list-check">' + scale.cosaPortare.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="card"><h2 class=h-sub>Riferimenti</h2><ul class="text-small muted">' + scale.riferimenti.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
            "<p class=\"text-small muted mb-0\">" + esc(scale.notaClinica) + "</p></div>" +
        "</div>" +

        '<div class="btn-row mt-3">' +
          '<a class="btn btn-primary" href="#/relazione">' + A.icon("print") + "Aggiungi alla relazione</a>" +
          '<a class="btn btn-ghost" href="#/valutazione/' + scale.id + '">Rifai il questionario</a>' +
          '<a class="btn btn-ghost" href="#/valutazione">Tutti i questionari</a>' +
        "</div>" +
        '<p class="text-small muted mt-2">Questo programma non formula diagnosi. Un punteggio è un punto di partenza per una conversazione, non una conclusione.</p>' +
      "</div>"
    );

    const redo = document.querySelector('a[href="#/valutazione/' + scale.id + '"]');
    if (redo) redo.addEventListener("click", function (e) {
      e.preventDefault();
      delete state.scales[scale.id];
      A.saveScales();
      renderScale(scale, false);
    });
  }

  /* --------------------------------------------------------- Palestra della mente */

  let session = null;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function catTitolo(id) {
    const c = NP.data.quiz.categorie.filter(function (x) { return x.id === id; })[0];
    return c ? c.titolo : id;
  }

  function startQuiz(cat, liv) {
    let pool = NP.data.quiz.domande.filter(function (q) {
      return (cat === "tutte" || q.cat === cat) && (liv === "tutti" || q.liv === liv);
    });
    if (!pool.length) pool = NP.data.quiz.domande.slice();
    session = { items: shuffle(pool).slice(0, 10), index: 0, correct: 0, answers: [], cat: cat, liv: liv, done: false };
    renderQuiz();
  }

  function renderQuiz() {
    if (!session) { renderHome(); return; }
    if (session.done) { renderQuizResult(); return; }
    const q = session.items[session.index];
    const answered = session.answers[session.index];
    const letters = ["A", "B", "C", "D"];

    A.setTitle("Palestra della mente");
    A.page(
      '<div class="wrap-narrow" style="padding-top:1.6rem">' +
        '<div class="quiz-card">' +
          '<div class="quiz-meta"><span>' + esc(catTitolo(q.cat)) + " · " + esc(NP.data.quizLivelli[q.liv]) + "</span><span>Domanda " + (session.index + 1) + " di " + session.items.length + "</span></div>" +
          '<div class="scale-progress-slim"><div style="width:' + Math.round((session.index / session.items.length) * 100) + '%"></div></div>' +
          '<h1 class="quiz-q">' + esc(q.d) + "</h1>" +
          '<div class="quiz-opts" id="quizOpts">' + q.o.map(function (o, i) {
            let cls = "";
            if (answered != null) {
              if (i === q.r) cls = " is-right";
              else if (i === answered) cls = " is-wrong";
            }
            return '<button type="button" class="quiz-opt' + cls + '" data-opt="' + i + '"' + (answered != null ? " disabled" : "") + '><span class="key">' + letters[i] + "</span><span>" + esc(o) + "</span></button>";
          }).join("") + "</div>" +
          (answered != null
            ? '<div class="quiz-feedback"><strong>' + (answered === q.r ? "Risposta corretta." : "Non è questa.") + "</strong>" + esc(q.sp) + "</div>" +
              '<div class="btn-row mt-2"><button type="button" class="btn btn-primary" id="quizNext">' + (session.index === session.items.length - 1 ? "Vedi il risultato" : "Domanda successiva") + " →</button></div>"
            : '<p class="text-small muted mt-2">Scegli una risposta: la spiegazione compare subito.</p>') +
        "</div>" +
        '<p class="text-small muted mt-2"><a href="#/palestra">Esci dalla sessione</a></p>' +
      "</div>"
    );

    const opts = document.getElementById("quizOpts");
    if (opts) opts.addEventListener("click", function (e) {
      const btn = e.target.closest(".quiz-opt");
      if (!btn || btn.disabled) return;
      const i = Number(btn.getAttribute("data-opt"));
      session.answers[session.index] = i;
      if (i === q.r) session.correct++;
      renderQuiz();
    });

    const next = document.getElementById("quizNext");
    if (next) next.addEventListener("click", function () {
      if (session.index >= session.items.length - 1) {
        session.done = true;
        const pct = Math.round((session.correct / session.items.length) * 100);
        state.quizStats.played = (state.quizStats.played || 0) + 1;
        state.quizStats.correct = (state.quizStats.correct || 0) + session.correct;
        state.quizStats.total = (state.quizStats.total || 0) + session.items.length;
        state.quizStats.best = Math.max(state.quizStats.best || 0, pct);
        session.items.forEach(function (item, idx) {
          const ok = session.answers[idx] === item.r;
          const c = state.quizStats.byCat[item.cat] || { c: 0, t: 0 };
          c.t++; if (ok) c.c++;
          state.quizStats.byCat[item.cat] = c;
        });
        A.saveQuizStats();
        renderQuizResult();
      } else {
        session.index++;
        renderQuiz();
      }
    });
  }

  function renderQuizResult() {
    const pct = Math.round((session.correct / session.items.length) * 100);
    const label = pct >= 80 ? "Ottimo" : pct >= 60 ? "Buono" : pct >= 40 ? "Da rinforzare" : "Da riprendere";
    const rows = session.items.map(function (q, i) {
      const ok = session.answers[i] === q.r;
      return '<div class="glossary-item"><dt>' + (ok ? "✓" : "✗") + " " + esc(q.d) + '</dt><dd>' + esc(q.o[q.r]) + ". " + esc(q.sp) + "</dd></div>";
    }).join("");

    A.setTitle("Palestra · risultato");
    A.page(
      '<div class="wrap-narrow" style="padding-top:1.6rem">' +
        '<div class="result-hero"><div class="score-big">' + pct + "%</div>" +
          '<p class="score-sub">' + session.correct + " risposte corrette su " + session.items.length + "</p>" +
          '<p class="score-band"><span class="badge badge-blue">' + label + "</span></p>" +
          '<p class="mt-2">La Palestra serve a smontare miti e fissare concetti utili. Non è una valutazione clinica e non misura la tua salute.</p></div>' +
        '<div class="glossary-list mt-2">' + rows + "</div>" +
        '<div class="btn-row mt-3"><button type="button" class="btn btn-primary" id="againBtn">Nuova sessione</button><a class="btn btn-ghost" href="#/palestra">Cambia argomento</a><a class="btn btn-ghost" href="#/valutazione">Vai ai questionari</a></div>' +
      "</div>"
    );
    const again = document.getElementById("againBtn");
    if (again) again.addEventListener("click", function () { startQuiz(session.cat, session.liv); });
  }

  function renderHome() {
    const stats = state.quizStats;
    A.setTitle("Palestra della mente");
    A.page(
      '<div class="page-head"><p class="eyebrow">Palestra della mente</p><h1>Miti, evidenze e parole giuste</h1>' +
        '<p class="lead">Un quiz divulgativo per allenare il linguaggio della salute mentale: 36 domande in sei aree, con spiegazioni. Non è un test clinico.</p></div>' +
      (stats.played
        ? '<div class="callout info"><p><strong>Le tue sessioni:</strong> ' + stats.played + " · media risposte corrette " + (stats.total ? Math.round((stats.correct / stats.total) * 100) : 0) + "% · record " + (stats.best || 0) + "%.</p></div>"
        : "") +
      '<div class="grid grid-2 mt-2">' +
        NP.data.quiz.categorie.map(function (c) {
          const n = NP.data.quiz.domande.filter(function (q) { return q.cat === c.id; }).length;
          return '<button type="button" class="card card-link" data-cat="' + c.id + '" style="text-align:left;font-family:inherit;border:1px solid var(--line);cursor:pointer"><h2 class=h-sub>' + esc(c.titolo) + "</h2><p>" + n + " domande · tre livelli</p><span class=\"go\">Allena questa area " + A.icon("arrow") + "</span></button>";
        }).join("") +
      "</div>" +
      '<div class="btn-row mt-3"><button type="button" class="btn btn-primary" id="mixBtn">' + A.icon("spark") + "Sessione mista (10 domande)</button></div>" +
      '<p class="text-small muted mt-2">Le spiegazioni citano il consenso scientifico quando è solido e segnalano i limiti quando non lo è.</p>'
    );

    document.querySelectorAll("[data-cat]").forEach(function (btn) {
      btn.addEventListener("click", function () { startQuiz(btn.getAttribute("data-cat"), "tutti"); });
    });
    const mix = document.getElementById("mixBtn");
    if (mix) mix.addEventListener("click", function () { startQuiz("tutte", "tutti"); });
  }

  views.palestra = function () {
    session = null;
    renderHome();
  };
})();
