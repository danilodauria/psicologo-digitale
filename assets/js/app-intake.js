/* ==========================================================================
   Psicologo Digitale · colloquio preliminare (interfaccia)
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;

  const FASI = NP.data.fasi;

  function faseDi(q) {
    return FASI.filter(function (f) { return f.id === q.fase; })[0] || { titolo: q.fase, descr: "" };
  }

  function visible() { return A.intakeVisible(); }

  function currentIndex() {
    const vis = visible();
    let i = typeof state.intake.index === "number" ? state.intake.index : 0;
    if (!vis.length) return 0;
    if (i < 0 || i >= vis.length) i = A.nextQuestionIndex();
    return Math.max(0, Math.min(i, vis.length - 1));
  }

  function optionHTML(q, opt, checked, type) {
    return '<label class="choice' + (checked ? " is-selected" : "") + '">' +
      '<input type="' + type + '" name="q_' + esc(q.id) + '" value="' + esc(opt.v) + '"' + (checked ? " checked" : "") + ">" +
      '<span class="choice-body"><b>' + esc(opt.label) + "</b>" +
      (opt.nota ? "<small>" + esc(opt.nota) + "</small>" : "") + "</span></label>";
  }

  // Azzerare si deve poter fare da dove si sta lavorando, non solo dalla
  // pagina Licenze: il pulsante è lo stesso in ogni domanda e nella
  // restituzione, e chiama la funzione unica di A.cancellaDati.
  function resetHTML(id) {
    return '<div class="intake-reset">' +
      '<button type="button" class="btn btn-ghost btn-sm" id="' + id + '">' + A.icon("refresh") + "Azzera e ricomincia</button>" +
      '<span class="text-small muted" id="' + id + 'Nota">Cancella colloquio, questionari e diario da questo dispositivo e riparte dalla prima domanda.</span>' +
      // Chi azzera ha appena raccontato cose che gli sono costate: il backup
      // si offre prima, non si consiglia dopo.
      '<div class="reset-scelta" id="' + id + 'Scelta" hidden>' +
        '<p class="text-small"><strong>Prima di cancellare, un backup?</strong> Il file raccoglie colloquio, questionari, diario e note: si reimporta quando vuoi dalla pagina <a href="#/licenze">Licenze</a>.</p>' +
        '<div class="btn-row">' +
          '<button type="button" class="btn btn-soft btn-sm" id="' + id + 'Backup">' + A.icon("download") + "Scarica il backup e azzera</button>" +
          '<button type="button" class="btn btn-danger btn-sm" id="' + id + 'Senza">Azzera senza backup</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="' + id + 'Annulla">Annulla</button>' +
        "</div>" +
      "</div>" +
      "</div>";
  }

  function bindReset(id) {
    const bottone = document.getElementById(id);
    if (!bottone) return;
    const scelta = document.getElementById(id + "Scelta");
    const nota = document.getElementById(id + "Nota");

    function apri() {
      bottone.hidden = true;
      if (nota) nota.hidden = true;
      if (!scelta) return;
      scelta.hidden = false;
      const primo = document.getElementById(id + "Backup");
      if (primo) primo.focus();
    }

    function chiudi() {
      if (scelta) scelta.hidden = true;
      bottone.hidden = false;
      if (nota) nota.hidden = false;
      bottone.focus();
    }

    bottone.addEventListener("click", apri);

    const annulla = document.getElementById(id + "Annulla");
    if (annulla) annulla.addEventListener("click", chiudi);

    const conBackup = document.getElementById(id + "Backup");
    if (conBackup) conBackup.addEventListener("click", function () {
      A.esportaBackup();
      if (A.cancellaDati()) A.render();
    });

    const senza = document.getElementById(id + "Senza");
    if (senza) senza.addEventListener("click", function () {
      if (A.cancellaDati()) A.render();
    });
  }

  function questionBody(q, value) {
    if (q.tipo === "consenso") {
      return '<label class="choice' + (value === true ? " is-selected" : "") + '">' +
        '<input type="checkbox" id="consentBox"' + (value === true ? " checked" : "") + ">" +
        '<span class="choice-body"><b>Ho letto e capito</b><small>' + esc(q.testoConsenso) + "</small></span></label>";
    }
    if (q.tipo === "info") {
      return '<p class="lead-sm">' + esc(q.testo) + "</p>";
    }
    if (q.tipo === "allerta") {
      const numeri = (NP.data.sicurezza.numeri || []).slice(0, 3).map(function (n) {
        return '<div class="emergency-num"><b><a href="tel:' + n.tel + '">' + esc(n.numero) + "</a></b><span>" + esc(n.nome) + "</span></div>";
      }).join("");
      return '<div class="callout danger"><p><strong>Non sei solo/a.</strong> ' + esc(q.testo) + " Se c'è un pericolo immediato, chiama il <strong>112</strong>.</p></div>" +
        '<div class="emergency-numbers">' + numeri + "</div>" +
        '<p class="text-small muted mt-2">Puoi continuare a compilare, ma la relazione segnalerà questo punto come prioritario. Parlane con una persona di fiducia e con un professionista.</p>';
    }
    if (q.tipo === "scelta") {
      return '<div class="choice-list">' + q.opzioni.map(function (o) {
        return optionHTML(q, o, value === o.v, "radio");
      }).join("") + "</div>";
    }
    if (q.tipo === "multipla") {
      const vals = Array.isArray(value) ? value : [];
      return '<div class="choice-list">' + q.opzioni.map(function (o) {
        return optionHTML(q, o, vals.indexOf(o.v) >= 0, "checkbox");
      }).join("") + "</div>" + (q.max ? '<p class="text-small muted mt-1">Massimo ' + q.max + " scelte.</p>" : "");
    }
    if (q.tipo === "scala") {
      const v = typeof value === "number" ? value : (q.valore != null ? q.valore : 5);
      return '<div class="scale-input"><input type="range" id="scaleRange" min="' + q.min + '" max="' + q.max + '" step="' + (q.passo || 1) + '" value="' + v + '" aria-label="' + esc(q.titolo) + '">' +
        '<output class="scale-value" id="scaleValue">' + v + "</output></div>" +
        '<div class="scale-ends"><span>' + esc((q.etichette || [])[0] || q.min) + "</span><span>" + esc((q.etichette || [])[1] || q.max) + "</span></div>";
    }
    // testo
    if (q.multiline) {
      return '<textarea class="textarea" id="textAnswer" maxlength="' + (q.maxlength || 800) + '" placeholder="' + esc(q.placeholder || "") + '">' + esc(value || "") + "</textarea>";
    }
    return '<input class="input" id="textAnswer" type="text" maxlength="' + (q.maxlength || 120) + '" placeholder="' + esc(q.placeholder || "") + '" value="' + esc(value || "") + '">';
  }

  function canProceed(q, value) {
    if (q.tipo === "consenso") return value === true;
    if (q.tipo === "testo") return !q.obbligatoria || String(value || "").trim().length > 0;
    if (q.tipo === "multipla") return Array.isArray(value) && value.length > 0;
    if (q.tipo === "scala") return typeof value === "number";
    if (q.tipo === "scelta") return value != null && value !== "";
    return true;
  }

  function renderShell(i) {
    const vis = visible();
    const q = vis[i];
    const fase = faseDi(q);
    const prog = A.intakeProgress();
    const answers = state.intake.answers;
    const value = answers[q.id];

    const mapHTML = FASI.map(function (f) {
      const questions = vis.filter(function (x) { return x.fase === f.id; });
      if (!questions.length) return "";
      const done = questions.every(function (x) { return A.isAnswered(x); });
      const now = q.fase === f.id;
      return '<li><span class="' + (done ? "done" : now ? "now" : "") + '">' + esc(f.titolo) + "</span></li>";
    }).join("");

    const feedback = q.feedback && value != null ? q.feedback(value, answers) : "";

    A.page(
      '<div class="page-head"><p class="eyebrow">Colloquio preliminare</p><h1>Una domanda alla volta</h1>' +
        '<p class="lead">Neura adatta le domande a ciò che racconti. Puoi fermarti, tornare indietro e riprendere: i dati restano su questo dispositivo.</p></div>' +
      '<div class="intake-shell">' +
        '<div class="progress"><div class="progress-meta"><span>Fase: <strong>' + esc(fase.titolo) + "</strong></span><span>" + prog.answered + " / " + prog.total + " · " + prog.pct + "%</span></div>" +
          '<div class="progress-track"><div class="progress-bar" style="width:' + prog.pct + '%"></div></div></div>' +
        '<ul class="intake-map">' + mapHTML + "</ul>" +
        '<div class="intake-card" id="intakeCard">' +
          '<p class="intake-stage">' + esc(fase.titolo) + " · domanda " + (i + 1) + " di " + vis.length + "</p>" +
          '<h2 class="intake-q">' + esc(q.titolo) + "</h2>" +
          (q.aiuto ? '<p class="intake-help">' + esc(q.aiuto) + "</p>" : "") +
          (feedback ? '<div class="neura-note"><span class="dot-orb" aria-hidden="true"></span><p><strong>Neura:</strong> ' + esc(feedback) + "</p></div>" : "") +
          '<div id="answerArea">' + questionBody(q, value) + "</div>" +
          '<div class="intake-actions">' +
            '<button type="button" class="btn btn-ghost" id="backBtn"' + (i === 0 ? " disabled" : "") + ">← Indietro</button>" +
            '<span class="hint">' + (q.obbligatoria === false ? "Puoi saltare questa domanda" : "Nessuna risposta è giudicata") + "</span>" +
            '<button type="button" class="btn btn-primary" id="nextBtn">' + (i >= vis.length - 1 ? "Vedi il quadro" : "Avanti") + " →</button>" +
          "</div>" +
        "</div>" +
        '<p class="text-small muted mt-2">Se in qualsiasi momento vuoi interrompere, chiudi la pagina: le risposte restano salvate. <a href="#/sicurezza">Numeri utili</a></p>' +
        resetHTML("restartBtn") +
      "</div>"
    );

    mount(q, i);
    bindReset("restartBtn");
  }

  function mount(q, i) {
    const card = document.getElementById("intakeCard");
    if (!card) return;
    const answers = state.intake.answers;
    const nextBtn = document.getElementById("nextBtn");
    const backBtn = document.getElementById("backBtn");

    function set(v) {
      answers[q.id] = v;
      state.intake.started = true;
      state.intake.index = i;
      if (q.tipo === "consenso" && v === true) state.intake.consent = true;
      A.saveIntake();
    }

    function refreshNext() {
      if (!nextBtn) return;
      const ok = canProceed(q, answers[q.id]);
      nextBtn.disabled = !ok;
      nextBtn.setAttribute("aria-disabled", ok ? "false" : "true");
    }

    if (q.tipo === "consenso") {
      const box = document.getElementById("consentBox");
      if (box) box.addEventListener("change", function () {
        set(!!box.checked);
        const lab = box.closest(".choice");
        if (lab) lab.classList.toggle("is-selected", box.checked);
        refreshNext();
      });
    }

    if (q.tipo === "scala") {
      const range = document.getElementById("scaleRange");
      const out = document.getElementById("scaleValue");
      if (range && out) range.addEventListener("input", function () {
        out.textContent = range.value;
        set(Number(range.value));
        refreshNext();
      });
      if (typeof answers[q.id] !== "number") {
        const v = Number(range ? range.value : (q.valore || 5));
        set(v);
        if (out) out.textContent = v;
      }
      refreshNext();
    }

    if (q.tipo === "scelta") {
      card.querySelectorAll('input[type="radio"]').forEach(function (input) {
        input.addEventListener("change", function () {
          set(input.value);
          card.querySelectorAll(".choice").forEach(function (c) { c.classList.remove("is-selected"); });
          const lab = input.closest(".choice");
          if (lab) lab.classList.add("is-selected");
          refreshNext();
        });
      });
      refreshNext();
    }

    if (q.tipo === "multipla") {
      card.querySelectorAll('input[type="checkbox"]').forEach(function (input) {
        input.addEventListener("change", function () {
          let vals = Array.isArray(answers[q.id]) ? answers[q.id].slice() : [];
          if (input.checked) {
            if (q.max && vals.length >= q.max) {
              input.checked = false;
              A.toast("Puoi scegliere al massimo " + q.max + " aree.");
              return;
            }
            vals.push(input.value);
          } else {
            vals = vals.filter(function (x) { return x !== input.value; });
          }
          set(vals);
          const lab = input.closest(".choice");
          if (lab) lab.classList.toggle("is-selected", input.checked);
          refreshNext();
        });
      });
      refreshNext();
    }

    if (q.tipo === "testo") {
      const el = document.getElementById("textAnswer");
      if (el) {
        el.addEventListener("input", function () {
          set(el.value);
          refreshNext();
        });
      }
      refreshNext();
    }

    if (q.tipo === "info" || q.tipo === "allerta") {
      set(true);
      refreshNext();
    }

    if (backBtn) backBtn.addEventListener("click", function () {
      const vis = visible();
      for (let k = i - 1; k >= 0; k--) {
        state.intake.index = k;
        A.saveIntake();
        renderShell(k);
        return;
      }
    });

    if (nextBtn) nextBtn.addEventListener("click", function () {
      const vis = visible();
      const value = answers[q.id];
      if (!canProceed(q, value)) {
        A.toast("Scegli una risposta per continuare.");
        return;
      }
      if (q.tipo === "consenso" && value !== true) {
        A.toast("Serve il consenso per continuare.");
        return;
      }
      if (q.feedback && value != null) {
        // La restituzione empatica compare solo alla prima selezione; poi si avanza.
      }
      for (let k = i + 1; k < vis.length; k++) {
        if (!A.isAnswered(vis[k]) || vis[k].tipo === "fine") {
          state.intake.index = k;
          A.saveIntake();
          renderShell(k);
          return;
        }
      }
      state.intake.completedAt = state.intake.completedAt || new Date().toISOString();
      state.intake.index = vis.length - 1;
      A.saveIntake();
      renderResult();
    });
  }

  function suggestedScales() {
    const p = A.buildProfile();
    const map = {
      umore: "umore", ansia: "ansia", sonno: "sonno", lavoro: "esaurimento",
      relazioni: "stress", lutto: "umore", autostima: "umore", corpo: "benessere",
      dipendenze: "esaurimento", trauma: "ansia", genitorialita: "stress",
      solitudine: "benessere", rabbia: "stress", altro: "benessere"
    };
    const out = [];
    p.aree.slice(0, 3).forEach(function (a) {
      const id = map[a.id];
      if (id && out.indexOf(id) < 0) out.push(id);
    });
    return (out.length ? out : ["umore", "ansia"]).slice(0, 3);
  }

  function renderResult() {
    const p = A.buildProfile();
    const flags = p.sicurezza;
    const top = p.aree.slice(0, 6);
    const bars = top.map(function (a) {
      return '<div class="bar-row"><span class="bar-label">' + esc(a.label) + '</span><span class="bar-track"><span class="bar-fill lv-' + a.livello + '" style="width:' + (a.score * 10) + '%"></span></span><span class="bar-value">' + a.score.toFixed(1) + "</span></div>";
    }).join("");

    const flagsHTML = flags.length
      ? '<div class="callout danger"><p><strong>Segnali da mettere al primo posto.</strong></p><ul class="mb-0">' +
        flags.map(function (f) { return "<li>" + esc(f.testo) + "</li>"; }).join("") +
        "</ul></div>" +
        '<div class="emergency-numbers">' +
          NP.data.sicurezza.numeri.slice(0, 3).map(function (n) {
            return '<div class="emergency-num"><b><a href="tel:' + n.tel + '">' + esc(n.numero) + "</a></b><span>" + esc(n.nome) + "</span></div>";
          }).join("") +
        "</div>"
      : '<div class="callout ok"><p><strong>Nessun segnale di rischio acuto emerso.</strong> Resta comunque attento/a ai cambiamenti: se qualcosa peggiora, parlarne presto è la scelta migliore.</p></div>';

    const scales = suggestedScales();
    const scaleCards = scales.map(function (id) {
      const s = A.getScale(id);
      if (!s) return "";
      return '<a class="card card-link" href="#/valutazione/' + s.id + '"><h2 class=h-sub>' + esc(s.titolo) + '</h2><p>' + esc(s.istruzioni) + " · " + esc(s.tempo) + '</p><span class="go">Compila ' + A.icon("arrow") + "</span></a>";
    }).join("");

    A.page(
      '<div class="page-head"><p class="eyebrow">Restituzione preliminare</p><h1>Ecco il quadro che ho letto</h1>' +
        '<p class="lead">Non è una diagnosi. È una sintesi ordinata di ciò che hai raccontato, con le aree che pesano di più e i punti da chiarire con un professionista.</p></div>' +
      '<div class="intake-shell">' +
        (flags.length ? flagsHTML : "") +
        '<div class="intake-card mt-2">' +
          '<h2 style="margin-bottom:.3rem">Aree emerse</h2>' +
          '<p class="text-small muted">Intensità percepita, da 0 a 10, calcolata dalle tue risposte. Non è un punteggio clinico.</p>' +
          '<div class="bars mt-2">' + (bars || '<p class="muted">Nessuna area valutabile: il colloquio è troppo incompleto.</p>') + "</div>" +
          '<p class="mt-2"><strong>In sintesi.</strong> ' + esc(A.profileSummary(p)) + "</p>" +
          (p.obiettivi ? '<p class="mt-1"><strong>Il tuo obiettivo:</strong> ' + esc(p.obiettivi) + "</p>" : "") +
          '<div class="summary-band">' +
            '<div class="summary-tile"><b>' + (p.impatto != null ? p.impatto + "/10" : "—") + "</b><span>Impatto dichiarato</span></div>" +
            '<div class="summary-tile"><b>' + (A.intakeProgress().answered) + "</b><span>Risposte raccolte</span></div>" +
            '<div class="summary-tile"><b>' + esc(p.urgenza === "subito" ? "Alta" : p.urgenza === "presto" ? "Media" : "Ordinaria") + "</b><span>Urgenza percepita</span></div>" +
          "</div>" +
          '<div class="callout info"><p><strong>Come usarlo.</strong> Porta questo quadro a uno psicologo o al medico di base. Le domande che seguono sono quelle che un clinico vorrebbe vedere approfondite.</p></div>' +
          '<h2 class="mt-2 h-sub">Domande da portare al professionista</h2>' +
          '<ul class="list-check">' +
            "<li>Da quanto tempo dura il quadro e cosa è cambiato nelle ultime settimane?</li>" +
            "<li>Quali cause mediche vanno escluse (tiroide, ferro, sonno, farmaci)?</li>" +
            "<li>Quali comportamenti mantengono il problema (evitamento, ritiro, sonno irregolare)?</li>" +
            "<li>Quali risorse e persone possono sostenere il percorso?</li>" +
            "<li>Quale frequenza e quale approccio sono indicati per questa situazione?</li>" +
          "</ul>" +
          '<div class="intake-actions">' +
            '<a class="btn btn-ghost" href="#/colloquio" id="reviewBtn">Rivedi le risposte</a>' +
            '<a class="btn btn-primary" href="#/relazione">Genera la relazione PDF →</a>' +
          "</div>" +
        "</div>" +
        resetHTML("restartResultBtn") +
        '<h2 class="mt-3">Un passo successivo, se ti va</h2>' +
        '<div class="grid grid-3 mt-2">' + scaleCards +
          '<a class="card card-link" href="#/percorso"><h2 class=h-sub>Percorso in otto tappe</h2><p>Obiettivi, pratiche e tempi per lavorare sulle aree emerse.</p><span class="go">Vedi il percorso ' + A.icon("arrow") + "</span></a>" +
        "</div>" +
        '<p class="text-small muted mt-2">Se i segnali di rischio riguardano la tua sicurezza, non aspettare la relazione: chiama il 112 o uno dei numeri nella sezione <a href="#/sicurezza">Sicurezza</a>.</p>' +
      "</div>"
    );

    bindReset("restartResultBtn");

    const review = document.getElementById("reviewBtn");
    if (review) review.addEventListener("click", function (e) {
      e.preventDefault();
      state.intake.completedAt = null;
      state.intake.index = 0;
      A.saveIntake();
      renderShell(0);
    });
  }

  views.colloquio = function () {
    const vis = visible();
    const complete = state.intake.completedAt && vis.every(function (q) { return A.isAnswered(q); });
    if (complete) { renderResult(); return; }
    const i = currentIndex();
    state.intake.index = i;
    renderShell(i);
  };

  views.colloquio.reset = function () {
    state.intake = { answers: {}, started: false, completedAt: null, consent: false, updatedAt: null, index: 0 };
    A.saveIntake();
  };
})();
