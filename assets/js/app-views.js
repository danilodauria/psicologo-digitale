/* ==========================================================================
   Psicologo Digitale · manuale, glossario, sicurezza, diario, licenze
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;

  /* ------------------------------------------------------------------ Manuale */

  views.manuale = function (params) {
    const id = params && params[0];
    if (id) { renderChapter(id); return; }

    A.setTitle("Manuale");
    A.page(
      '<div class="page-head"><p class="eyebrow">Manuale</p><h1>Dodici capitoli per capire meglio</h1>' +
        '<p class="lead">Psicoeducazione onesta: che cosa sappiamo, che cosa aiuta, quando serve un professionista. Ogni capitolo ha un esercizio e un avviso.</p></div>' +
      '<div class="callout info"><p><strong>Come leggerlo.</strong> Non è un libro da finire: scegli il capitolo che riguarda il tuo momento. Le informazioni non sostituiscono una valutazione.</p></div>' +
      '<div class="grid grid-2 mt-2">' + NP.data.manuale.map(function (c) {
        return '<a class="card card-link" href="#/manuale/' + c.id + '"><div class="card-icon">' + A.icon("book") + "</div>" +
          '<p class="text-small muted" style="margin-bottom:.2rem">Capitolo ' + c.n + " · " + c.minuti + " min</p>" +
          "<h2 class=h-sub>" + esc(c.titolo) + "</h2><p>" + esc(c.sommario) + "</p>" +
          '<span class="go">Leggi ' + A.icon("arrow") + "</span></a>";
      }).join("") + "</div>" +
      '<div class="card mt-3"><h2 class=h-sub>Fonti e metodo</h2><p class="text-small">I contenuti si appoggiano a linee guida e letteratura clinica (NICE, OMS, CNOP, DSM-5-TR, riviste peer-reviewed). Quando l\'evidenza è limitata, è scritto. Quando un tema richiede competenza specialistica, è indicato.</p>' +
        '<div class="pill-row">' + NP.data.fonti.map(function (f) { return '<a class="chip" href="' + f.u + '" target="_blank" rel="noopener">' + esc(f.t) + "</a>"; }).join("") + "</div></div>"
    );
  };

  function renderChapter(id) {
    const list = NP.data.manuale;
    const idx = list.findIndex(function (c) { return c.id === id; });
    const c = list[idx];
    if (!c) { views.manuale(); return; }
    const prev = list[idx - 1], next = list[idx + 1];

    A.setTitle(c.titolo);
    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/manuale">Manuale</a><span>›</span>Capitolo ' + c.n + "</p>" +
        "<h1>" + esc(c.titolo) + "</h1>" +
        '<p class="lead">' + esc(c.sommario) + "</p>" +
        '<p class="text-small muted">Tempo di lettura: ' + c.minuti + " minuti</p></div>" +
      '<div class="grid grid-3">' +
        '<article class="card" style="grid-column:1/-1"><div class="prose">' +
          c.sezioni.map(function (s) {
            return "<h2>" + esc(s.h) + "</h2>" + s.p.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
          }).join("") +
        "</div></article>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("activity") + " Esercizio</h2><h3 class=h-sub-sm>" + esc(c.esercizio.titolo) + "</h3><p>" + esc(c.esercizio.testo) + "</p></div>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("alert") + " Quando preoccuparsi</h2><h3 class=h-sub-sm>" + esc(c.quando.titolo) + "</h3><p>" + esc(c.quando.testo) + "</p></div>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("spark") + " In sintesi, per Neura</h2><p class=\"text-small\">" + esc((c.neura.sintesi || [])[0]) + "</p>" +
          '<a class="chip" href="#/neura">Chiedi a Neura</a></div>' +
      "</div>" +
      '<div class="callout warn mt-2"><p><strong>Avviso.</strong> ' + esc(c.neura.avviso) + "</p></div>" +
      '<div class="card mt-2"><h2 class=h-sub>Riferimenti</h2><ul class="text-small muted">' + c.fonti.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="btn-row mt-3">' +
        (prev ? '<a class="btn btn-ghost" href="#/manuale/' + prev.id + '">← ' + esc(prev.titolo) + "</a>" : "") +
        '<a class="btn btn-soft" href="#/manuale">Tutti i capitoli</a>' +
        (next ? '<a class="btn btn-ghost" href="#/manuale/' + next.id + '">' + esc(next.titolo) + " →</a>" : "") +
      "</div>"
    );
  }

  /* ---------------------------------------------------------------- Glossario */

  views.glossario = function () {
    A.setTitle("Glossario");
    A.page(
      '<div class="page-head"><p class="eyebrow">Glossario</p><h1>Le parole della salute mentale</h1>' +
        '<p class="lead">' + NP.data.glossario.length + " voci per capire i termini che si incontrano in un percorso, senza gergo inutile.</p></div>" +
      '<div class="form-field" style="max-width:460px"><label class="field-label" for="glossSearch">Cerca una voce</label>' +
        '<input class="input" id="glossSearch" type="search" placeholder="Per esempio: evitamento, CBT, lutto…"></div>' +
      '<p class="text-small muted" id="glossCount"></p>' +
      '<div class="glossary-list mt-2" id="glossList">' + glossHTML(NP.data.glossario) + "</div>"
    );

    const input = document.getElementById("glossSearch");
    const listEl = document.getElementById("glossList");
    const countEl = document.getElementById("glossCount");
    function update() {
      const q = (input.value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtered = NP.data.glossario.filter(function (g) {
        const hay = (g.t + " " + g.d + " " + g.cat).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return !q || hay.indexOf(q) >= 0;
      });
      listEl.innerHTML = glossHTML(filtered);
      countEl.textContent = filtered.length + " di " + NP.data.glossario.length + " voci";
    }
    if (input) input.addEventListener("input", update);
    update();
  };

  function glossHTML(items) {
    if (!items.length) return '<p class="muted">Nessuna voce corrisponde alla ricerca.</p>';
    return items.map(function (g) {
      return '<dl class="glossary-item"><dt>' + esc(g.t) + ' <span class="badge">' + esc(g.cat) + "</span></dt><dd>" + esc(g.d) + "</dd></dl>";
    }).join("");
  }

  /* ---------------------------------------------------------------- Sicurezza */

  views.sicurezza = function () {
    const S = NP.data.sicurezza;
    A.setTitle("Sicurezza e numeri utili");
    A.page(
      '<div class="page-head"><p class="eyebrow">Sicurezza</p><h1>Quando la priorità non è l\'app</h1>' +
        '<p class="lead">' + esc(S.introduzione) + "</p></div>" +
      '<div class="emergency-box"><h2>Emergenza</h2>' +
        '<div class="emergency-numbers">' + S.numeri.map(function (n) {
          return '<div class="emergency-num"><b><a href="tel:' + n.tel + '">' + esc(n.numero) + "</a></b><span>" + esc(n.nome) + "</span><p class=\"text-small muted mb-0\">" + esc(n.nota) + "</p></div>";
        }).join("") + "</div></div>" +

      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><h2>Segnali da non ignorare</h2><ul class="list-check">' + S.segnali.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>" +
        '<div class="card"><h2>Cosa fare subito</h2><ol class="number-list">' + S.cosaFare.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div>" +
      "</div>" +

      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><h2 class=h-sub>Minori</h2><p>' + esc(S.minori) + "</p></div>" +
        '<div class="card"><h2 class=h-sub>Violenza e stalking</h2><p>' + esc(S.violenza) + "</p></div>" +
      "</div>" +

      '<div class="callout warn mt-2"><p><strong>Nota.</strong> ' + esc(S.nota) + "</p></div>" +
      '<div class="callout info"><p><strong>Se stai leggendo per un\'altra persona:</strong> non lasciarla sola, ascolta senza giudicare, non promettere segreti che riguardano la sua sicurezza e aiutala a contattare un professionista. In pericolo immediato: 112.</p></div>' +
      '<div class="btn-row mt-2"><a class="btn btn-primary" href="#/neura">Parla con Neura</a><a class="btn btn-ghost" href="#/colloquio">Colloquio</a></div>'
    );
  };

  /* -------------------------------------------------------------------- Diario */

  function todayISO() {
    const d = new Date();
    const off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
  }

  function moodColor(v) {
    if (v <= 2) return "var(--rosso)";
    if (v <= 4) return "#c4713a";
    if (v <= 6) return "var(--ambra)";
    if (v <= 8) return "var(--salvia)";
    return "var(--verde)";
  }

  views.diario = function () {
    const entries = (state.diary || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    const last = entries.slice(0, 8);
    const avgMood = entries.length ? (entries.reduce(function (s, e) { return s + (Number(e.mood) || 0); }, 0) / entries.length).toFixed(1) : "—";

    const listHTML = last.length ? last.map(function (e, i) {
      return '<div class="diary-entry"><span class="diary-date">' + esc(e.date ? new Date(e.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) : "—") + "</span>" +
        '<span class="diary-mood"><span class="mood-dot" style="background:' + moodColor(e.mood) + '"></span>Umore ' + esc(e.mood) + "/10 · Ansia " + esc(e.anxiety) + "/10 · Sonno " + esc(e.sleep) + "h</span>" +
        '<button type="button" class="chip" data-del="' + esc(e.id) + '" title="Elimina">✕</button>' +
        (e.note ? '<p class="diary-note" style="grid-column:1/-1">' + esc(e.note) + "</p>" : "") + "</div>";
    }).join("") : '<p class="muted text-small">Nessuna voce. Anche tre righe al giorno bastano per vedere un pattern.</p>';

    A.setTitle("Diario");
    A.page(
      '<div class="page-head"><p class="eyebrow">Diario</p><h1>Misurare senza ossessionarsi</h1>' +
        '<p class="lead">Umore, ansia, sonno e una nota. Serve a te e al professionista: i pattern contano più della singola giornata.</p></div>' +
      '<div class="diary-grid">' +
        '<div class="card"><h2>Voce di oggi</h2>' +
          '<form id="diaryForm">' +
            '<div class="form-field"><label class="field-label" for="dDate">Data</label><input class="input" type="date" id="dDate" value="' + todayISO() + '"></div>' +
            '<div class="form-field"><span class="field-label">Umore <span class="muted text-small">(0 pessimo · 10 ottimo)</span></span><div class="mood-scale-row" id="moodRow">' +
              [0,1,2,3,4,5,6,7,8,9,10].map(function (v) { return '<button type="button" class="mood-pick' + (v === 5 ? " is-active" : "") + '" data-mood="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" +
            '<div class="form-field"><label class="field-label" for="dAnx">Ansia <span class="muted text-small">(0-10)</span></label><div class="scale-input"><input type="range" id="dAnx" min="0" max="10" value="4"><output class="scale-value" id="dAnxOut">4</output></div></div>' +
            '<div class="form-grid">' +
              '<div class="form-field"><label class="field-label" for="dSleep">Ore di sonno</label><input class="input" type="number" id="dSleep" min="0" max="14" step="0.5" value="7"></div>' +
              '<div class="form-field"><label class="field-label" for="dEnergy">Energia (0-10)</label><input class="input" type="number" id="dEnergy" min="0" max="10" value="5"></div>' +
            "</div>" +
            '<div class="form-field"><label class="field-label" for="dNote">Nota <span class="muted text-small">(facoltativa)</span></label><textarea class="textarea" id="dNote" maxlength="400" placeholder="Cosa è successo, cosa hai notato…"></textarea></div>' +
            '<button type="submit" class="btn btn-primary btn-wide">' + A.icon("pen") + "Salva la voce</button>" +
          "</form>" +
        "</div>" +
        '<div class="grid" style="gap:1rem">' +
          '<div class="card"><div class="btn-row" style="justify-content:space-between"><h2 style="margin:0">Le ultime voci</h2><span class="badge badge-blue">Media umore ' + avgMood + "</span></div><div class=\"diary-list mt-2\">" + listHTML + "</div></div>" +
          '<div class="card"><h2 class=h-sub>Scheda del pensiero</h2><p class="text-small">La classica scheda a sette colonne, ridotta all&rsquo;essenziale. Compila quando un pensiero ti ha fatto stare male.</p>' +
            '<form id="thoughtForm" class="thought-grid">' +
              '<div class="form-field"><label class="field-label" for="tSit">Situazione</label><input class="input" id="tSit" placeholder="Chi, dove, quando"></div>' +
              '<div class="form-field"><label class="field-label" for="tThought">Pensiero</label><input class="input" id="tThought" placeholder="La frase esatta"></div>' +
              '<div class="form-grid"><div class="form-field"><label class="field-label" for="tEmo">Emozione</label><input class="input" id="tEmo" placeholder="Ansia, vergogna…"></div>' +
              '<div class="form-field"><label class="field-label" for="tInt">Intensità (0-10)</label><input class="input" id="tInt" type="number" min="0" max="10" value="6"></div></div>' +
              '<div class="form-field"><label class="field-label" for="tAlt">Una lettura alternativa</label><textarea class="textarea" id="tAlt" maxlength="400" placeholder="Più precisa, non più ottimista…"></textarea></div>' +
              '<button type="submit" class="btn btn-soft">Salva la scheda</button>' +
            "</form></div>" +
        "</div>" +
      "</div>" +
      '<div class="callout warn mt-3"><p><strong>Il diario non è una pagella.</strong> Se ti accorgi di controllarlo in modo compulsivo o che ti fa stare peggio, parlane con il professionista: anche il monitoraggio può diventare un problema.</p></div>'
    );

    let mood = 5;
    const moodRow = document.getElementById("moodRow");
    if (moodRow) moodRow.addEventListener("click", function (e) {
      const b = e.target.closest("[data-mood]");
      if (!b) return;
      mood = Number(b.getAttribute("data-mood"));
      moodRow.querySelectorAll(".mood-pick").forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
    });

    const anx = document.getElementById("dAnx");
    const anxOut = document.getElementById("dAnxOut");
    if (anx && anxOut) anx.addEventListener("input", function () { anxOut.textContent = anx.value; });

    const form = document.getElementById("diaryForm");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.diary.push({
        id: "d" + Date.now(),
        date: document.getElementById("dDate").value || todayISO(),
        mood: mood,
        anxiety: Number(document.getElementById("dAnx").value),
        sleep: Number(document.getElementById("dSleep").value),
        energy: Number(document.getElementById("dEnergy").value),
        note: document.getElementById("dNote").value.trim()
      });
      A.saveDiary();
      A.toast("Voce salvata nel diario.");
      views.diario();
    });

    document.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Eliminare questa voce?")) return;
        state.diary = state.diary.filter(function (x) { return x.id !== btn.getAttribute("data-del"); });
        A.saveDiary();
        views.diario();
      });
    });

    const tf = document.getElementById("thoughtForm");
    if (tf) tf.addEventListener("submit", function (e) {
      e.preventDefault();
      const thoughts = A.readJSON("thoughts", []);
      thoughts.push({
        id: "t" + Date.now(),
        date: new Date().toISOString(),
        situation: document.getElementById("tSit").value.trim(),
        thought: document.getElementById("tThought").value.trim(),
        emotion: document.getElementById("tEmo").value.trim(),
        intensity: Number(document.getElementById("tInt").value),
        alternative: document.getElementById("tAlt").value.trim()
      });
      A.writeJSON("thoughts", thoughts.slice(-60));
      A.toast("Scheda del pensiero salvata.");
      views.diario();
    });
  };

  /* ------------------------------------------------------------------ Licenze */

  views.licenze = function () {
    A.setTitle("Licenze e progetto");
    A.page(
      '<div class="page-head"><p class="eyebrow">Il progetto</p><h1>Licenze, privacy, attribuzione</h1>' +
        '<p class="lead">Chi ha ideato questo programma, con quale licenza, quali dati restano sul dispositivo e quali sono i limiti dichiarati.</p></div>' +

      '<div class="card"><h2>Attribuzione</h2>' +
        '<p><strong>«Psicologo Digitale — La stanza d\'ascolto»</strong> è ideato, scritto e sviluppato da <strong>Danilo D\'Auria</strong>, un progetto <strong>FeniceOS</strong>.</p>' +
        '<p>Nasce dallo stesso impianto dei progetti <em>Professore Digitale</em>, <em>Consulente Digitale</em> e <em>Naturopata Digitale</em>: contenuti chiari, strumenti semplici, nessun tracciamento, uso anche senza connessione. Il personaggio di <strong>Neura</strong>, il cervello digitale che ascolta e parla, è creazione dell\'autore ed è parte di questo ecosistema.</p>' +
        '<p class="text-small muted">Citazione consigliata: «Psicologo Digitale — La stanza d\'ascolto» di Danilo D\'Auria — un progetto FeniceOS — licenza CC BY-NC-SA 4.0.</p>' +
      "</div>" +

      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><h2 class=h-sub>Codice</h2><p>HTML, CSS, JavaScript, service worker e test sono distribuiti con licenza <strong>MIT</strong>. Puoi usarli, modificarli e ridistribuirli citando il copyright.</p></div>' +
        '<div class="card"><h2 class=h-sub>Contenuti</h2><p>Testi, capitoli, questionari, esercizi, protocolli, glossario e grafica sono distribuiti con licenza <strong>Creative Commons BY-NC-SA 4.0</strong>: attribuzione, non commerciale, stessa licenza.</p></div>' +
      "</div>" +

      '<div class="card mt-2"><h2 class=h-sub>Privacy, in pratica</h2><ul class="list-check">' +
        "<li>Nessun account, nessun server, nessuna telemetria.</li>" +
        "<li>Risposte, diario, questionari e relazione restano nel <code>localStorage</code> del browser.</li>" +
        "<li>Il PDF viene generato sul dispositivo: non viene inviato da nessuna parte.</li>" +
        "<li>Se cancelli i dati del browser, i dati spariscono. Esporta un backup se vuoi conservarli.</li>" +
      "</ul>" +
      '<div class="btn-row mt-2"><button type="button" class="btn btn-soft btn-sm" id="backupBtn">' + A.icon("download") + "Esporta backup</button>" +
        '<label class="btn btn-ghost btn-sm" for="importFile">' + A.icon("refresh") + 'Importa backup</label><input type="file" id="importFile" accept="application/json,.json" hidden>' +
        '<button type="button" class="btn btn-danger btn-sm" id="resetBtn">Cancella tutti i dati</button></div>' +
      "</div>" +

      '<div class="card mt-2"><h2 class=h-sub>Limiti dichiarati</h2><ul class="text-small">' +
        "<li>Non è un dispositivo medico ai sensi del Regolamento UE 2017/745.</li>" +
        "<li>Non formula diagnosi, non prescrive terapie, non gestisce emergenze.</li>" +
        "<li>Neura è un motore di conoscenza locale, non un'IA generativa: non apprende e non risponde fuori dal corpus.</li>" +
        "<li>I questionari sono indicatori di intensità, non strumenti diagnostici.</li>" +
        "<li>I contenuti sono divulgativi e non sostituiscono la formazione e la responsabilità di un professionista.</li>" +
      "</ul></div>" +

      '<div class="card mt-2"><h2 class=h-sub>Vademecum in PDF</h2>' +
        '<p>La guida tascabile raccoglie colloquio, questionari, percorso, sicurezza, nutrizione e installazione: si legge sul telefono o si stampa e si tiene accanto al computer.</p>' +
        '<div class="btn-row mt-2">' +
          '<a class="btn btn-soft btn-sm" href="assets/pdf/vademecum-psicologo-digitale.pdf" download>' + A.icon("download") + "A5 · da leggere</a>" +
          '<a class="btn btn-ghost btn-sm" href="assets/pdf/vademecum-psicologo-digitale-a4.pdf" download>' + A.icon("print") + "A4 · da stampare</a>" +
          '<a class="btn btn-ghost btn-sm" href="assets/pdf/vademecum-psicologo-digitale-libricino-a4.pdf" download>' + A.icon("layers") + "Libricino A4</a>" +
        "</div>" +
        '<p class="text-small muted mt-2">Il libricino A4 contiene le stesse pagine in formato A5 già impostate: si stampa fronte-retro, si piega in due e diventa un opuscolo da quattro fogli. Codice MIT, contenuti CC BY-NC-SA 4.0.</p></div>' +

      '<div class="card mt-2"><h2 class=h-sub>Guida per il professionista</h2>' +
        '<p>Un secondo documento, scritto per chi riceve la relazione: che cosa contiene il PDF, come si leggono i punteggi dei sei questionari fascia per fascia e quali sono i limiti dichiarati del programma.</p>' +
        '<div class="btn-row mt-2">' +
          '<a class="btn btn-soft btn-sm" href="assets/pdf/vademecum-clinico-psicologo-digitale.pdf" download>' + A.icon("download") + "Guida per il clinico · A4</a>" +
        "</div>" +
        '<p class="text-small muted mt-2">Serve a rendere il primo colloquio più preciso, non a sostituirlo: il documento resta un\'autovalutazione, non un test validato.</p></div>' +

      '<div class="card mt-2"><h2 class=h-sub>Domande frequenti</h2>' +
        NP.data.faq.map(function (f) {
          return '<details style="border-top:1px solid var(--line);padding:.7rem 0"><summary style="cursor:pointer;font-weight:600">' + esc(f.d) + '</summary><p class="text-small mt-1">' + esc(f.r) + "</p></details>";
        }).join("") +
      "</div>" +

      '<div class="card mt-2"><h2 class=h-sub>Fonti e riferimenti</h2><ul class="text-small">' + NP.data.fonti.map(function (f) {
        return '<li><a href="' + f.u + '" target="_blank" rel="noopener">' + esc(f.t) + "</a> — " + esc(f.n) + "</li>";
      }).join("") + "</ul></div>" +

      '<p class="text-small muted mt-3">Versione 1.3.37 · novembre 2026 · Codice MIT · Contenuti CC BY-NC-SA 4.0 · © Danilo D\'Auria. <a href="#/versioni">Cosa è cambiato, versione per versione</a></p>'
    );

    const backup = document.getElementById("backupBtn");
    if (backup) backup.addEventListener("click", function () {
      const data = {
        app: "Psicologo Digitale",
        version: 1,
        exportedAt: new Date().toISOString(),
        intake: state.intake,
        scales: state.scales,
        diary: state.diary,
        thoughts: A.readJSON("thoughts", []),
        course: state.course,
        quizStats: state.quizStats,
        reportNotes: state.reportNotes
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "psicologo-digitale-backup.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 800);
      A.toast("Backup esportato.");
    });

    const imp = document.getElementById("importFile");
    if (imp) imp.addEventListener("change", function () {
      const file = imp.files && imp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const data = JSON.parse(reader.result);
          if (!data || data.app !== "Psicologo Digitale") throw new Error("Formato non valido");
          if (!confirm("Importare il backup? I dati attuali verranno sostituiti.")) return;
          state.intake = data.intake || state.intake;
          state.scales = data.scales || {};
          state.diary = data.diary || [];
          state.course = data.course || { done: [], notes: {} };
          state.quizStats = data.quizStats || state.quizStats;
          state.reportNotes = data.reportNotes || { note: "", clinician: "" };
          A.writeJSON("thoughts", Array.isArray(data.thoughts) ? data.thoughts : []);
          A.saveIntake(); A.saveScales(); A.saveDiary(); A.saveCourse(); A.saveQuizStats(); A.saveReportNotes();
          A.toast("Backup importato.");
          A.render();
        } catch (e) {
          alert("Il file non sembra un backup valido di Psicologo Digitale.");
        }
      };
      reader.readAsText(file, "utf-8");
    });

    const reset = document.getElementById("resetBtn");
    if (reset) reset.addEventListener("click", function () {
      if (!confirm("Cancellare colloquio, questionari, diario e note da questo dispositivo? L'operazione non si può annullare.")) return;
      if (!confirm("Ultima conferma: vuoi davvero cancellare tutti i dati?")) return;
      try {
        Object.keys(localStorage).forEach(function (k) {
          if (k.indexOf(A.PREFIX) === 0) localStorage.removeItem(k);
        });
      } catch (e) {}
      state.intake = { answers: {}, started: false, completedAt: null, consent: false, updatedAt: null, index: 0 };
      state.scales = {};
      state.diary = [];
      state.course = { done: [], notes: {} };
      state.quizStats = { played: 0, best: 0, correct: 0, total: 0, byCat: {} };
      state.reportNotes = { note: "", clinician: "" };
      state.chat = [];
      A.toast("Dati cancellati.");
      A.go("");
    });
  };
})();
