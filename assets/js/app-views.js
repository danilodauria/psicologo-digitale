/* ==========================================================================
   Psicologo Digitale · manuale, glossario, sicurezza, diario, licenze
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;

  // Due barre per questionario, sulla stessa scala: la differenza fra oggi e la
  // copia si vede prima di leggere i numeri. Il grafico è muto per i lettori di
  // schermo perché gli stessi punteggi sono scritti sopra, in chiaro.
  function graficoConfronto(questionari) {
    return '<div class="confronto-grafico" aria-hidden="true">' + questionari.map(function (q) {
      const larghezza = function (punti) {
        if (typeof punti !== "number" || !(q.massimo > 0)) return 0;
        return Math.max(0, Math.min(100, (punti / q.massimo) * 100));
      };
      return '<p class="text-small mb-0">' + esc(q.titolo) + "</p>" +
        '<div class="confronto-riga"><span class="confronto-etichetta">oggi</span>' +
          '<span class="confronto-barra oggi"><span style="width:' + larghezza(q.oggiPunti).toFixed(1) + '%"></span></span></div>' +
        '<div class="confronto-riga"><span class="confronto-etichetta">nella copia</span>' +
          '<span class="confronto-barra copia"><span style="width:' + larghezza(q.copiaPunti).toFixed(1) + '%"></span></span></div>';
    }).join("") + "</div>";
  }
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
    const esercizio = A.esercizioDelCapitolo(c);

    A.setTitle(c.titolo);
    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/manuale">Manuale</a><span>›</span>Capitolo ' + c.n + " di " + list.length + "</p>" +
        "<h1>" + esc(c.titolo) + "</h1>" +
        '<p class="lead">' + esc(c.sommario) + "</p>" +
        '<p class="text-small muted">Tempo di lettura: ' + c.minuti + " minuti</p>" +
        '<div class="btn-row mt-1"><button type="button" class="btn btn-ghost btn-sm" id="ascoltaCapitolo">' +
          A.icon("wave") + "Ascolta il capitolo</button></div></div>" +
      '<div class="grid grid-3">' +
        '<article class="card" style="grid-column:1/-1"><div class="prose">' +
          c.sezioni.map(function (s) {
            return "<h2>" + esc(s.h) + "</h2>" + s.p.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
          }).join("") +
        "</div></article>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("activity") + " Esercizio</h2><h3 class=h-sub-sm>" + esc(c.esercizio.titolo) + "</h3><p>" + esc(c.esercizio.testo) + "</p>" +
          (esercizio ? '<a class="chip" data-esercizio-collegato href="#/esercizi/' + esercizio.id + '">' + esc(esercizio.titolo) + " " + A.icon("arrow") + "</a>" : "") +
        "</div>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("alert") + " Quando preoccuparsi</h2><h3 class=h-sub-sm>" + esc(c.quando.titolo) + "</h3><p>" + esc(c.quando.testo) + "</p></div>" +
        '<div class="card"><h2 class=h-sub>' + A.icon("spark") + " In sintesi, per Neura</h2><p class=\"text-small\">" + esc((c.neura.sintesi || [])[0]) + "</p>" +
          '<a class="chip" href="#/neura">Chiedi a Neura</a></div>' +
      "</div>" +
      '<div class="callout warn mt-2"><p><strong>Avviso.</strong> ' + esc(c.neura.avviso) + "</p></div>" +
      '<div class="card mt-2"><h2 class=h-sub>Riferimenti</h2><ul class="text-small muted">' + c.fonti.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="btn-row mt-3">' +
        (prev ? '<a class="btn btn-ghost" data-nav="prev" href="#/manuale/' + prev.id + '">← ' + esc(prev.titolo) + "</a>" : "") +
        '<a class="btn btn-soft" href="#/manuale">Tutti i capitoli</a>' +
        (next ? '<a class="btn btn-ghost" data-nav="next" href="#/manuale/' + next.id + '">' + esc(next.titolo) + " →</a>" : "") +
      "</div>"
    );

    const ascolta = document.getElementById("ascoltaCapitolo");
    if (ascolta) ascolta.addEventListener("click", function () {
      const testo = c.titolo + ". " + c.sommario + " " + c.sezioni.map(function (s) {
        return s.h + ". " + s.p.join(" ");
      }).join(" ");
      A.leggiCapitolo(testo);
    });
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

  // Quale copia si sta guardando prima di ripristinarla: sta qui perché la
  // vista si ridisegna a ogni scelta, e la scelta deve restare.
  let copiaInEsame = null;

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
      // I dati stanno solo qui: se non escono mai, una svuotata del browser li
      // porta via. Il promemoria è la cosa più utile che questa pagina può dire.
      (function () {
        const giorni = A.giorniSenzaBackup();
        const quando = A.ultimoBackup();
        const haRoba = A.haDati(A.raccogliDati());
        if (!haRoba) return "";
        if (giorni === null) {
          return '<div class="callout warn mt-2" id="backupPromemoria"><p><strong>Non hai ancora esportato un backup.</strong> I dati vivono solo in questo browser: basta svuotare i dati del sito, cambiare browser o perdere il telefono e non restano. Un file di pochi kB li mette al sicuro.</p></div>';
        }
        if (giorni >= 30) {
          return '<div class="callout warn mt-2" id="backupPromemoria"><p><strong>L\'ultimo backup è di ' + giorni + ' giorni fa.</strong> Da allora i dati sono cresciuti e il file non li contiene. Esportarne uno adesso costa pochi secondi.</p></div>';
        }
        return '<p class="text-small muted mt-1" id="backupPromemoria">Ultima esportazione: ' + esc(A.fmtDate(quando)) +
          (giorni === 0 ? " (oggi)." : " (" + giorni + (giorni === 1 ? " giorno fa)." : " giorni fa).")) + "</p>";
      })() +
      '<div class="btn-row mt-2"><button type="button" class="btn btn-soft btn-sm" id="backupBtn">' + A.icon("download") + "Esporta backup</button>" +
        '<label class="btn btn-ghost btn-sm" for="importFile">' + A.icon("refresh") + 'Importa backup</label><input type="file" id="importFile" accept="application/json,.json" hidden>' +
        '<button type="button" class="btn btn-danger btn-sm" id="resetBtn">Cancella tutti i dati</button></div>' +
      "</div>" +

      (function () {
        const d = A.spazioDati();
        const pct = Math.max(1, Math.min(100, d.quota * 100));
        const stretto = d.quota >= 0.8;
        return '<div class="card mt-2" id="spazioDati"><h2 class=h-sub>Cosa occupa spazio</h2>' +
          '<p>I dati di questa app occupano <strong>' + A.fmtBytes(d.totale) + "</strong> su circa " +
            A.fmtBytes(d.limite) + ', la quota che un browser concede di solito a un sito: <strong>' +
            (d.quota * 100).toFixed(1).replace(".", ",") + "%</strong>.</p>" +
          '<div class="progress-track" aria-hidden="true" style="max-width:22rem"><div class="progress-bar" style="width:' + pct + '%"></div></div>' +
          (A.salvataggioNonRiuscito()
            ? '<div class="callout warn" id="spazioPienoAvviso"><p><strong>L\'ultimo salvataggio non è riuscito.</strong> Il browser ha rifiutato di scrivere, quasi sempre perché lo spazio è finito: l\'ultima modifica non è registrata.</p>' +
                '<div class="btn-row"><button type="button" class="btn btn-soft btn-sm" id="spazioPienoEsporta">' + A.icon("download") +
                'Esporta backup ora</button></div>' +
                '<p class="text-small mt-1 mb-0">Poi compatta i dati vecchi qui sotto: appena lo spazio torna, il salvataggio viene ritentato da solo.</p></div>'
            : "") +
          '<p class="text-small muted mt-1">' +
            (stretto
              ? "Siamo vicini al limite: quando lo spazio finisce il browser rifiuta i salvataggi. Si può ridurre il numero di copie automatiche, o esportare il backup e alleggerire le voci più pesanti."
              : "La quota è quella tipica, non una misura esatta: browser diversi ne concedono un po' di più o di meno.") +
          "</p>" +
          (d.perChiave.length
            ? '<ul class="text-small">' + d.perChiave.map(function (v) {
                return "<li>" + esc(v.nome) + ": " + A.fmtBytes(v.byte) + "</li>";
              }).join("") + "</ul>"
            : '<p class="text-small muted mb-0">Nessun dato salvato: c\'è solo la struttura del programma.</p>') +
          (function () {
            // Il totale resta anche dopo aver chiuso l'app: chi compatta ogni
            // tanto deve poter vedere quanto ha liberato in tutto, non solo
            // l'ultima volta.
            const liberato = A.liberatoTotale();
            if (!liberato.volte) return "";
            return '<p class="text-small mt-1" id="liberatoTotaleSegno">In tutto hai liberato <strong>' +
              A.fmtBytes(liberato.byte) + "</strong> " +
              (liberato.volte === 1 ? "con una compattazione." : "con " + liberato.volte + " compattazioni.") + "</p>";
          })() +
          (function () {
            // La soglia si sceglie qui: quanto è vecchio «vecchio» dipende da
            // come scrive chi usa l'app, non da un numero deciso per tutti.
            const piano = A.pianificaCompatta();
            const scelte = A.compattaScelte();
            const oltre = scelte.filter(function (g) { return g > piano.giorni; });
            const html = '<div class="mt-2" id="compattaBox"><h3 class="h-sub-sm">Compattare i dati vecchi</h3>' +
              '<div class="btn-row">' +
                '<label class="text-small" for="compattaGiorni">Schede più vecchie di</label>' +
                '<select id="compattaGiorni" style="width:auto;padding:.35rem .6rem;font-size:.85rem">' +
                  scelte.map(function (g) {
                    return '<option value="' + g + '"' + (g === piano.giorni ? " selected" : "") + ">" + g + " giorni</option>";
                  }).join("") +
                "</select>" +
                '<span class="text-small muted">si può cambiare quando si vuole</span>' +
              "</div>";
            if (!piano.byte) {
              return html + '<p class="text-small muted mb-0">Con la soglia di ' + piano.giorni +
                ' giorni non c\'è niente da togliere: nessuna conversazione salvata e nessuna scheda più vecchia' +
                (oltre.length ? ". Si può alzare la soglia a " + oltre.join(" o ") + " giorni." : ".") + "</p></div>";
            }
            const cose = [];
            if (piano.messaggi) cose.push(piano.messaggi + (piano.messaggi === 1 ? " messaggio con Neura" : " messaggi con Neura"));
            if (piano.pensieri) cose.push(piano.pensieri + (piano.pensieri === 1 ? " scheda del pensiero" : " schede del pensiero") + " più vecchie di " + piano.giorni + " giorni");
            return html +
              '<p class="text-small mt-1">Si toglierebbero ' + cose.join(" e ") + ": circa <strong>" + A.fmtBytes(piano.byte) + "</strong> liberati. Colloquio, questionari, diario e note non si toccano" +
                (piano.pensieri ? ", e restano comunque le ultime " + piano.minime + " schede" : "") + ".</p>" +
              '<div class="btn-row"><button type="button" class="btn btn-soft btn-sm" id="compattaBtn">Compatta e libera ' + A.fmtBytes(piano.byte) + "</button></div></div>";
          })() +
        "</div>";
      })() +

      '<div class="card mt-2" id="letturaPrivacy"><h2 class=h-sub>Lettura e privacy</h2>' +
        '<div class="btn-row"><label class="text-small" for="testoScelta">Dimensione del testo</label>' +
          '<select id="testoScelta" style="width:auto;padding:.35rem .6rem;font-size:.85rem">' +
            A.testiScelte().map(function (n) {
              return '<option value="' + n + '"' + (n === A.testoScelto() ? " selected" : "") + ">" + n + "%</option>";
            }).join("") +
          "</select>" +
          '<span class="text-small muted">vale per tutta l\'app, non solo per questa pagina</span></div>' +
        '<div class="btn-row mt-1"><button type="button" class="btn btn-soft btn-sm" id="discretoToggle">' +
          (A.discretoAttivo() ? "Mostra i contenuti sensibili" : "Attiva la modalità discreta") + "</button>" +
          '<span class="text-small muted">copre i contenuti finché non li scopri: utile in un posto affollato</span></div></div>' +

      '<div class="card mt-2"><h2 class=h-sub>Copia di sicurezza automatica</h2>' +
        (function () {
          const appena = A.ripristinoDaAnnullare();
          if (!appena) return "";
          return '<div class="callout info" id="ripristinoAvviso"><p><strong>Hai appena ripristinato la copia del ' +
            esc(A.fmtDate(appena.ripristinata)) + '.</strong> I dati che c\'erano prima sono ancora qui: si torna indietro con un clic, senza cercare la copia giusta nell\'elenco.</p>' +
            '<div class="btn-row"><button type="button" class="btn btn-soft btn-sm" id="annullaRipristinoBtn">Annulla il ripristino</button></div></div>';
        })() +
        '<p>Una copia dei dati resta in questo browser, aggiornata una volta al giorno. Non esce dal dispositivo, non richiede un account e non viene toccata da «Cancella tutti i dati»: serve proprio per un azzeramento fatto per sbaglio.</p>' +
        (function () {
          const massimo = A.copieMassimo();
          const spazio = A.spazioCopie();
          const copie = A.copieAutomatiche();
          let html = '<div class="btn-row mb-0">' +
            '<label class="text-small" for="copieScelta">Copie da tenere</label>' +
            '<select id="copieScelta" style="width:auto;padding:.35rem .6rem;font-size:.85rem">' +
              [1, 2, 3, 4, 5, 6, 7].map(function (n) {
                return '<option value="' + n + '"' + (n === massimo ? " selected" : "") + ">" + n + (n === 1 ? " copia" : " copie") + "</option>";
              }).join("") +
            "</select>" +
            '<span class="text-small muted">una al giorno' + (massimo === 1 ? ", sempre la stessa" : "") + "</span>" +
          "</div>" +
          '<p class="text-small muted mt-1">Occupano <strong>' + A.fmtBytes(spazio.totale) + "</strong>" +
            (copie.length ? " in " + copie.length + (copie.length === 1 ? " copia" : " copie") : "") +
            ". Il browser concede in genere 5 MB a questo sito: quando lo spazio finisce, si tengono meno copie invece di perdere quella nuova.</p>" +
          '<p class="text-small muted">«Esporta» scarica quella copia come file JSON: si conserva fuori dal browser e si rimette a posto con «Importa backup».</p>';
          if (!copie.length) return html + '<p class="text-small muted mb-0">Nessuna copia ancora: arriva al prossimo avvio, se ci sono dati da salvare.</p>';
          html += '<ul class="text-small">' + copie.map(function (c, i) {
            const d = c.dati || {};
            const risposte = d.intake && d.intake.answers ? Object.keys(d.intake.answers).length : 0;
            const voci = d.diary ? d.diary.length : 0;
            return '<li>' + (c.etichetta ? '<span class="badge badge-blue">Punto di ritorno</span> ' : "") +
              esc(A.fmtDateTime(c.quando)) + (c.etichetta ? ' <span class="text-small muted">' + esc(c.etichetta) + "</span>" : "") +
              " — " + risposte + (risposte === 1 ? " risposta" : " risposte") +
              ", " + voci + (voci === 1 ? " voce di diario" : " voci di diario") + " · " + A.fmtBytes(spazio.pesi[i] || 0) +
              " · cancellandola liberi " + A.fmtBytes(spazio.liberabili[i] || 0) +
              ' <button type="button" class="btn btn-ghost btn-sm" data-copia="' + i + '">Ripristina</button>' +
              ' <button type="button" class="btn btn-ghost btn-sm" data-copia-esporta="' + i + '">Esporta</button>' +
              ' <button type="button" class="btn btn-ghost btn-sm" data-copia-cancella="' + i + '">Cancella</button></li>';
          }).join("") + "</ul>";
          // Pulizia in un gesto: quando le copie si sono accumulate, quella che
          // serve è quasi sempre solo l'ultima. Il conto sta nel pulsante.
          const contoVecchie = A.copieDaTenere();
          if (contoVecchie.quante > 0) {
            html += '<div class="btn-row mt-2" id="pulisciCopie">' +
              '<button type="button" class="btn btn-soft btn-sm" id="cancellaCopieVecchie">Tieni solo la più recente e libera ' +
                A.fmtBytes(contoVecchie.byte) + "</button>" +
              '<span class="text-small muted">' + contoVecchie.quante +
                (contoVecchie.quante === 1 ? " copia più vecchia sparisce" : " copie più vecchie spariscono") +
                ", quella del " + esc(A.fmtDate(contoVecchie.resta.quando)) + " resta.</span></div>";
          }
          // Anteprima: prima di sostituire i dati si vede cosa cambierebbe,
          // e se non cambierebbe niente lo dice invece di fingere un rischio.
          if (copiaInEsame !== null) {
            const c = A.confrontoCopia(copiaInEsame);
            if (c) {
              html += '<div class="callout info" id="copiaAnteprima"><p><strong>Copia del ' + esc(A.fmtDateTime(c.quando)) + ".</strong> " +
                (c.voci.length ? "Rispetto a oggi cambierebbe:" : "Rispetto a oggi non cambierebbe nulla.") + "</p>" +
                (c.voci.length ? '<ul class="text-small">' + c.voci.map(function (v) {
                  const riga = esc(v.cosa) + ": da " + v.ora + " a " + v.copia;
                  if (v.questionari && v.questionari.length) {
                    return "<li>" + riga + " — punteggi:" +
                      '<ul class="text-small">' + v.questionari.map(function (q) {
                        return "<li>" + esc(q.titolo) + ": oggi " + esc(q.oggi) + ", nella copia " + esc(q.copia) + "</li>";
                      }).join("") + "</ul>" + graficoConfronto(v.questionari) + "</li>";
                  }
                  if (!v.perse || !v.perse.length) return "<li>" + riga + ".</li>";
                  const mostrate = v.perse.slice(0, 5);
                  const resto = v.perse.length - mostrate.length;
                  return "<li>" + riga +
                    (v.perse.length === 1 ? " — mancherebbe questa voce:" : " — mancherebbero " + v.perse.length + " voci:") +
                    '<ul class="text-small">' + mostrate.map(function (p) {
                      return "<li>" + esc(A.fmtDate(p.data)) + " — " + esc(p.testo) + "</li>";
                    }).join("") +
                    (resto > 0 ? "<li>e altre " + resto + " voci.</li>" : "") +
                    "</ul></li>";
                }).join("") + "</ul>" : "") +
                '<p class="text-small muted">Prima di sostituire, i dati di adesso diventano una copia: se il ripristino non convince, si torna indietro ripristinando quella. Tema e numero di copie non vengono toccati.</p>' +
                '<div class="btn-row">' +
                  '<button type="button" class="btn btn-primary btn-sm" id="copiaConferma">Ripristina questa copia</button>' +
                  '<button type="button" class="btn btn-ghost btn-sm" id="copiaAnnulla">Annulla</button>' +
                "</div></div>";
            }
          }
          return html;
        })() +
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

      // Il foglio delle prove non serve a chi usa il programma, ma a chi ne
      // prepara una versione: sta qui perché è qui che si cercano i documenti,
      // invece di restare raggiungibile solo dal repository.
      '<div class="card mt-2"><h2 class=h-sub>Prove a mano</h2>' +
        '<p>Il foglio di chi prepara una versione nuova: le cose che nessun test automatico può vedere — la voce che parte, la pagina su un telefono stretto, il messaggio che compare al momento giusto — una per riga, con il risultato atteso e una casella da spuntare.</p>' +
        '<div class="btn-row mt-2">' +
          '<a class="btn btn-soft btn-sm" href="assets/pdf/Psicologo-Digitale-Prove-a-mano.pdf" download>' + A.icon("check") + "Foglio delle prove · A4</a>" +
        "</div>" +
        '<p class="text-small muted mt-2">Si stampa e si compila a penna; in fondo c\'è lo spazio per data, dispositivo ed esito. Nasce dal file delle prove che sta nel repository, quindi le due versioni non possono raccontare cose diverse.</p></div>' +

      '<div class="card mt-2"><h2 class=h-sub>Domande frequenti</h2>' +
        NP.data.faq.map(function (f) {
          return '<details style="border-top:1px solid var(--line);padding:.7rem 0"><summary style="cursor:pointer;font-weight:600">' + esc(f.d) + '</summary><p class="text-small mt-1">' + esc(f.r) + "</p></details>";
        }).join("") +
      "</div>" +

      '<div class="card mt-2"><h2 class=h-sub>Fonti e riferimenti</h2><ul class="text-small">' + NP.data.fonti.map(function (f) {
        return '<li><a href="' + f.u + '" target="_blank" rel="noopener">' + esc(f.t) + "</a> — " + esc(f.n) + "</li>";
      }).join("") + "</ul></div>" +

      '<p class="text-small muted mt-3">Versione 1.4.2 · novembre 2026 · Codice MIT · Contenuti CC BY-NC-SA 4.0 · © Danilo D\'Auria. <a href="#/versioni">Cosa è cambiato, versione per versione</a></p>'
    );

    const backup = document.getElementById("backupBtn");
    if (backup) backup.addEventListener("click", function () {
      A.esportaBackup();
    });

    const testoScelta = document.getElementById("testoScelta");
    if (testoScelta) testoScelta.addEventListener("change", function () {
      A.impostaTesto(testoScelta.value);
    });

    const discretoToggle = document.getElementById("discretoToggle");
    if (discretoToggle) discretoToggle.addEventListener("click", function () {
      A.impostaDiscreto(!A.discretoAttivo());
      A.render();
    });

    const esportaSubito = document.getElementById("spazioPienoEsporta");
    if (esportaSubito) esportaSubito.addEventListener("click", function () {
      A.esportaBackup();
    });

    const compatta = document.getElementById("compattaBtn");
    if (compatta) compatta.addEventListener("click", function () {
      if (A.compattaDati()) A.render();
    });

    const soglia = document.getElementById("compattaGiorni");
    if (soglia) soglia.addEventListener("change", function () {
      // Cambiando soglia cambia il conto: si ridisegna, e la scelta resta
      // scritta accanto ai dati perché valga anche al prossimo avvio.
      if (A.impostaGiorniCompatta(soglia.value)) A.render();
    });

    const imp = document.getElementById("importFile");
    if (imp) imp.addEventListener("change", function () {
      const file = imp.files && imp.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const letto = JSON.parse(reader.result);
          if (!letto || letto.app !== "Psicologo Digitale") throw new Error("Formato non valido");
          // Un file vecchio si completa prima di leggerlo: importare un formato
          // che nel frattempo è cambiato sarebbe una perdita silenziosa.
          const esito = A.migraBackup(letto);
          if (esito.errore) { A.toast(esito.errore, 8000); return; }
          const data = esito.dati;
          if (!confirm("Importare il backup? I dati attuali verranno sostituiti.")) return;
          state.intake = data.intake || state.intake;
          state.scales = data.scales || {};
          state.diary = data.diary || [];
          state.course = data.course || { done: [], notes: {} };
          state.quizStats = data.quizStats || state.quizStats;
          state.reportNotes = data.reportNotes || { note: "", clinician: "" };
          A.writeJSON("thoughts", Array.isArray(data.thoughts) ? data.thoughts : []);
          A.writeJSON("storicoPunteggi", data.storicoPunteggi && typeof data.storicoPunteggi === "object" &&
            !Array.isArray(data.storicoPunteggi) ? data.storicoPunteggi : {});
          A.saveIntake(); A.saveScales(); A.saveDiary(); A.saveCourse(); A.saveQuizStats(); A.saveReportNotes();
          A.toast("Backup importato" + (esito.migrato ? " e aggiornato al formato attuale." : "."));
          A.render();
        } catch (e) {
          alert("Il file non sembra un backup valido di Psicologo Digitale.");
        }
      };
      reader.readAsText(file, "utf-8");
    });

    const reset = document.getElementById("resetBtn");
    if (reset) reset.addEventListener("click", function () {
      // La stessa funzione che usa il pulsante dentro il colloquio: qui, dopo
      // aver cancellato, si torna alla pagina iniziale.
      if (A.cancellaDati()) A.go("");
    });

    const sceltaCopie = document.getElementById("copieScelta");
    if (sceltaCopie) sceltaCopie.addEventListener("change", function () {
      const n = A.impostaCopieMassimo(Number(sceltaCopie.value));
      A.toast("Copie automatiche da tenere: " + n + ".");
      A.render();
    });

    document.querySelectorAll("[data-copia]").forEach(function (b) {
      b.addEventListener("click", function () {
        copiaInEsame = Number(b.getAttribute("data-copia"));
        A.render();
      });
    });

    document.querySelectorAll("[data-copia-esporta]").forEach(function (b) {
      b.addEventListener("click", function () {
        A.esportaCopia(Number(b.getAttribute("data-copia-esporta")));
      });
    });

    document.querySelectorAll("[data-copia-cancella]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!A.cancellaCopia(Number(b.getAttribute("data-copia-cancella")))) return;
        copiaInEsame = null;
        A.render();
      });
    });

    const confermaCopia = document.getElementById("copiaConferma");
    if (confermaCopia) confermaCopia.addEventListener("click", function () {
      const i = copiaInEsame;
      copiaInEsame = null;
      if (A.ripristinaCopia(i)) A.render();
    });

    const pulisciCopie = document.getElementById("cancellaCopieVecchie");
    if (pulisciCopie) pulisciCopie.addEventListener("click", function () {
      if (A.cancellaCopieVecchie()) {
        copiaInEsame = null;
        A.render();
      }
    });

    const annullaRipristinoBtn = document.getElementById("annullaRipristinoBtn");
    if (annullaRipristinoBtn) annullaRipristinoBtn.addEventListener("click", function () {
      if (A.annullaRipristino()) A.render();
    });

    const annullaCopia = document.getElementById("copiaAnnulla");
    if (annullaCopia) annullaCopia.addEventListener("click", function () {
      copiaInEsame = null;
      A.render();
    });
  };

  /* ------------------------------------------------------------- Riepilogo */

  // I dati sono già tutti nel dispositivo: il riepilogo non li interpreta, li
  // mette in fila. Due settimane affiancate dicono più di un numero solo.
  views.riepilogo = function () {
    const ora = A.statistichePeriodo(7, 0);
    const prima = A.statistichePeriodo(7, 7);
    const vuoto = !ora.voci && !ora.schede && !ora.misure && !prima.voci && !prima.schede && !prima.misure;
    const num = function (n) { return n === null ? "—" : (Math.round(n * 10) / 10).toString().replace(".", ","); };
    const diff = function (a, b) {
      if (a === null || b === null) return "—";
      const d = Math.round((a - b) * 10) / 10;
      if (d === 0) return "uguale";
      return (d > 0 ? "+" : "−") + Math.abs(d).toString().replace(".", ",");
    };
    const riga = function (etichetta, campo) {
      return '<tr><th scope="row">' + etichetta + "</th><td>" + num(ora.media[campo]) + "</td><td>" +
        num(prima.media[campo]) + "</td><td>" + diff(ora.media[campo], prima.media[campo]) + "</td></tr>";
    };

    A.setTitle("Riepilogo dei periodi");
    A.page(
      '<div class="page-head"><p class="eyebrow">Riepilogo</p><h1>Gli ultimi sette giorni, accanto ai sette prima</h1>' +
        '<p class="lead">Le stesse misure in due periodi vicini. Non è un giudizio: è il modo più semplice per vedere se una direzione c\'è.</p></div>' +
      (vuoto
        ? '<div class="callout info"><p><strong>Non ci sono ancora dati in questi quattordici giorni.</strong> Bastano una voce di diario o un questionario perché il confronto abbia qualcosa da dire.</p></div>'
        : '<div class="card"><h2 class="h-sub">Medie del diario</h2>' +
          '<table class="text-small"><thead><tr><th scope="col">Voce</th><th scope="col">Ultimi 7 giorni</th><th scope="col">7 giorni prima</th><th scope="col">Differenza</th></tr></thead><tbody>' +
            riga("Umore", "umore") + riga("Ansia", "ansia") + riga("Sonno", "sonno") + riga("Energia", "energia") +
          '</tbody></table>' +
          '<p class="text-small muted mb-0">Differenza calcolata sulla media dei valori inseriti, da 0 a 10. Con poche voci una media si muove facilmente: vale come traccia, non come prova.</p></div>' +
        '<div class="grid grid-2 mt-2">' +
          '<div class="card"><h2 class="h-sub">Cosa hai fatto</h2><ul class="list-check">' +
            "<li>" + ora.voci + (ora.voci === 1 ? " voce di diario" : " voci di diario") + " (prima: " + prima.voci + ")</li>" +
            "<li>" + ora.schede + (ora.schede === 1 ? " scheda del pensiero" : " schede del pensiero") + " (prima: " + prima.schede + ")</li>" +
            "<li>" + ora.misure + (ora.misure === 1 ? " questionario compilato" : " questionari compilati") + " (prima: " + prima.misure + ")</li>" +
          "</ul></div>" +
          '<div class="card"><h2 class="h-sub">Cosa farne</h2><p class="text-small">Scegli una cosa sola da portare al prossimo colloquio: una voce di diario, un punteggio che si è mosso, o una scheda che si ripete. Il resto può aspettare.</p>' +
            '<div class="btn-row"><a class="btn btn-ghost btn-sm" href="#/diario">Apri il diario</a><a class="btn btn-ghost btn-sm" href="#/valutazione">Questionari</a></div></div>' +
        "</div>") +
      '<p class="mt-3"><a class="btn btn-soft" href="#/">Torna alla home</a></p>'
    );
  };

  /* ---------------------------------------------------------------- Cerca */

  // Cercare dentro i contenuti: dodici capitoli, glossario ed esercizi sono
  // troppi per essere attraversati a mano quando si cerca una parola sola.
  function indiceContenuti() {
    const voci = [];
    (NP.data.manuale || []).forEach(function (c) {
      const testo = [c.titolo, c.sommario].concat(c.sezioni.map(function (s) { return s.h + " " + s.p.join(" "); })).join(" ");
      voci.push({ tipo: "Capitolo " + c.n, titolo: c.titolo, testo: testo, rotta: "#/manuale/" + c.id });
    });
    (NP.data.glossario || []).forEach(function (v) {
      voci.push({ tipo: "Glossario", titolo: v.t, testo: v.d, rotta: "#/glossario" });
    });
    const esercizi = (NP.data.percorso && Array.isArray(NP.data.percorso.esercizi)) ? NP.data.percorso.esercizi : [];
    esercizi.forEach(function (e) {
      if (!e || typeof e !== "object" || !e.id) return;
      voci.push({ tipo: "Esercizio", titolo: e.titolo || e.id, testo: [e.titolo, e.testo, e.durata].join(" "), rotta: "#/esercizi/" + e.id });
    });
    return voci;
  }

  views.cerca = function (params) {
    const q = (params && params[0]) ? String(params[0]).trim() : "";
    const parole = q.toLowerCase().split(/\s+/).filter(function (p) { return p.length > 1; });
    const risultati = !parole.length ? [] : indiceContenuti().filter(function (v) {
      const testo = (v.titolo + " " + v.testo).toLowerCase();
      return parole.every(function (p) { return testo.indexOf(p) >= 0; });
    }).slice(0, 40);

    A.setTitle("Cerca");
    A.page(
      '<div class="page-head"><p class="eyebrow">Ricerca</p><h1>Cerca nei contenuti</h1>' +
        '<p class="lead">Capitoli del manuale, voci di glossario ed esercizi guidati. La ricerca avviene qui, sul dispositivo: nessuna parola esce da qui.</p></div>' +
      '<form class="card" id="cercaForm"><label class="text-small" for="cercaInput">Parole da cercare</label>' +
        '<div class="btn-row"><input id="cercaInput" name="q" type="search" value="' + esc(q) + '" placeholder="per esempio: sonno, rimuginio, respiro" style="flex:1;min-width:12rem;padding:.5rem .7rem">' +
        '<button type="submit" class="btn btn-primary btn-sm">' + A.icon("list") + "Cerca</button></div>" +
        '<p class="text-small muted mb-0">Si possono cercare più parole: vengono cercate tutte insieme.</p></form>' +
      (q && !risultati.length
        ? '<div class="callout info mt-2"><p><strong>Nessun risultato per «' + esc(q) + '».</strong> Prova una parola più corta, o il termine clinico invece di quello comune.</p></div>'
        : "") +
      (risultati.length
        ? '<div class="card mt-2"><h2 class="h-sub">' + risultati.length + (risultati.length === 1 ? " risultato" : " risultati") + '</h2><ul class="text-small">' +
          risultati.map(function (v) {
            return '<li><a href="' + v.rotta + '"><strong>' + esc(v.titolo) + "</strong></a> — " + esc(v.tipo) + "</li>";
          }).join("") + "</ul></div>"
        : "") +
      '<div class="card mt-2"><h2 class="h-sub">Non è un motore di ricerca</h2><p class="text-small mb-0">La ricerca confronta le parole con i testi del programma: se non trova niente, non significa che l\'argomento non esista, ma che non è scritto con quella parola. Per una domanda aperta c\'è Neura.</p></div>'
    );

    const modulo = document.getElementById("cercaForm");
    if (modulo) modulo.addEventListener("submit", function (e) {
      e.preventDefault();
      const valore = (document.getElementById("cercaInput").value || "").trim();
      A.go(valore ? "cerca/" + encodeURIComponent(valore) : "cerca");
    });
  };
})();
