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
  // La busta cifrata resta qui fra la scelta del file e la password: è solo
  // testo cifrato, e serve a non rileggere il file ogni volta che si sbaglia.
  let backupCifratoInAttesa = null;

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
      '<div class="card mt-2" id="taccuinoCapitolo"><h2 class=h-sub>Una domanda per il clinico</h2>' +
        '<p class="text-small">Se leggendo ti viene in mente qualcosa da chiedere al professionista, scrivilo qui: lo ritrovi nel taccuino e puoi scegliere se portarlo nella relazione.</p>' +
        A.moduloDomanda("domandaCapitolo", "formDomandaCapitolo", "linkTaccuinoCapitolo") + "</div>" +
      '<div class="btn-row mt-3">' +
        (prev ? '<a class="btn btn-ghost" data-nav="prev" href="#/manuale/' + prev.id + '">← ' + esc(prev.titolo) + "</a>" : "") +
        '<a class="btn btn-soft" href="#/manuale">Tutti i capitoli</a>' +
        (next ? '<a class="btn btn-ghost" data-nav="next" href="#/manuale/' + next.id + '">' + esc(next.titolo) + " →</a>" : "") +
      "</div>"
    );

    A.collegaFormDomanda("formDomandaCapitolo", "domandaCapitolo", "linkTaccuinoCapitolo");

    const ascolta = document.getElementById("ascoltaCapitolo");
    if (ascolta) ascolta.addEventListener("click", function () {
      const testo = c.titolo + ". " + c.sommario + " " + c.sezioni.map(function (s) {
        return s.h + ". " + s.p.join(" ");
      }).join(" ");
      A.leggiCapitolo(testo);
    });
  }

  /* ---------------------------------------------------------------- Taccuino */

  // Le domande che la persona vuole fare al clinico. Non vengono interpretate:
  // sono appunti suoi, che sceglie se portare nella relazione o nella scheda.
  let taccuinoInModifica = null;

  views.taccuino = function () {
    const domande = state.domandePersonali || [];
    const inModifica = taccuinoInModifica ? domande.filter(function (q) { return q.id === taccuinoInModifica; })[0] : null;
    if (taccuinoInModifica && !inModifica) taccuinoInModifica = null;

    A.setTitle("Taccuino");
    A.page(
      '<div class="page-head"><p class="eyebrow">Taccuino</p><h1>Le domande che vuoi fare</h1>' +
        '<p class="lead">Scrivile quando ti vengono, mentre leggi o parli con Neura. Restano su questo dispositivo e prima della relazione scegli tu quali affiancare a quelle generate.</p></div>' +
      '<div class="grid grid-2">' +
        '<div class="card" id="taccuinoNuova"><h2 class=h-sub>' + (inModifica ? "Correggi la domanda" : "Aggiungi una domanda") + "</h2>" +
          '<p class="text-small muted">Una domanda alla volta, con parole tue. Non serve che sia perfetta: serve che sia la tua.</p>' +
          '<form id="taccuinoForm"><div class="form-field"><label class="field-label" for="domandaTesto">La domanda</label>' +
            '<textarea class="textarea" id="domandaTesto" maxlength="200" rows="3" required placeholder="Per esempio: che cosa posso fare se gli attacchi arrivano la sera?">' + esc(inModifica ? inModifica.testo : "") + "</textarea></div>" +
            '<div class="btn-row"><button type="submit" class="btn btn-primary">' + (inModifica ? "Salva la modifica" : "Aggiungi al taccuino") + "</button>" +
              (inModifica ? '<button type="button" class="btn btn-ghost" id="annullaModifica">Annulla</button>' : "") + "</div>" +
            '<p class="text-small muted mb-0">Massimo 200 caratteri. Resta su questo dispositivo.</p></form></div>' +
        '<div class="card"><h2 class=h-sub>Il taccuino' + (domande.length ? " (" + domande.length + ")" : "") + "</h2>" +
          (domande.length
            ? '<ul class="taccuino-lista" id="taccuinoList">' + domande.map(function (q) {
                return '<li class="taccuino-voce"><p>' + esc(q.testo) + '</p><p class="text-small muted">Scritta il ' + esc(A.fmtDate(q.creato)) + '</p>' +
                  '<div class="btn-row"><button type="button" class="chip" data-modifica="' + esc(q.id) + '">Modifica</button>' +
                  '<button type="button" class="chip" data-elimina="' + esc(q.id) + '">Togli</button></div></li>';
              }).join("") + "</ul>"
            : '<p class="text-small muted">Il taccuino è vuoto. Puoi scrivere la prima domanda qui accanto, oppure aggiungerla alla fine di un capitolo del <a href="#/manuale">manuale</a> o dalla pagina di <a href="#/neura">Neura</a>.</p>') +
          '<div class="btn-row mt-2"><a class="chip" href="#/relazione">Scegli per la relazione</a><a class="chip" href="#/scheda">Prepara la scheda</a></div></div>' +
      "</div>"
    );

    const form = document.getElementById("taccuinoForm");
    const input = document.getElementById("domandaTesto");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      const esito = inModifica ? A.modificaDomanda(inModifica.id, input.value) : A.aggiungiDomanda(input.value);
      if (esito.ok === false) { A.toast(esito.motivo, 5000); return; }
      A.toast(inModifica ? "Domanda aggiornata." : "Domanda aggiunta al taccuino.");
      taccuinoInModifica = null;
      views.taccuino();
    });

    const annulla = document.getElementById("annullaModifica");
    if (annulla) annulla.addEventListener("click", function () {
      taccuinoInModifica = null;
      views.taccuino();
    });

    const lista = document.getElementById("taccuinoList");
    if (lista) lista.addEventListener("click", function (e) {
      const modifica = e.target.closest("[data-modifica]");
      if (modifica) {
        taccuinoInModifica = modifica.getAttribute("data-modifica");
        views.taccuino();
        const campo = document.getElementById("domandaTesto");
        if (campo) { campo.focus(); campo.setSelectionRange(campo.value.length, campo.value.length); }
        return;
      }
      const togli = e.target.closest("[data-elimina]");
      if (!togli) return;
      if (!confirm("Togliere questa domanda dal taccuino?")) return;
      const id = togli.getAttribute("data-elimina");
      if (!A.eliminaDomanda(id)) { A.toast("Non è stato possibile togliere la domanda.", 5000); return; }
      if (taccuinoInModifica === id) taccuinoInModifica = null;
      A.toast("Domanda tolta dal taccuino.");
      views.taccuino();
    });
  };

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

  // Il piano di sicurezza personale: cinque campi che compila la persona, non
  // il programma. Nessun testo viene suggerito o generato; si salva in locale
  // e si stampa, anche in bianco, per scriverlo a penna.
  function pianoSicurezza() {
    const piano = A.readJSON("pianoSicurezza", null) || {};
    const contatti = Array.isArray(piano.contatti) ? piano.contatti : [];
    const valore = function (v) { return v == null ? "" : String(v); };

    const campo = function (id, titolo, aiuto, testo, righe) {
      return '<div class="piano-campo"><label class="field-label" for="' + id + '">' + titolo + '</label>' +
        '<p class="text-small muted mb-1">' + aiuto + '</p>' +
        '<textarea class="input piano-area" id="' + id + '" rows="' + (righe || 3) + '">' + esc(testo) + '</textarea></div>';
    };
    const rigaContatto = function (i, c) {
      const n = i + 1;
      return '<div class="piano-contatto">' +
        '<div><label class="field-label" for="pianoNome' + i + '">Persona ' + n + '</label>' +
          '<input class="input" id="pianoNome' + i + '" type="text" autocomplete="off" value="' + esc(valore(c && c.nome)) + '"></div>' +
        '<div><label class="field-label" for="pianoTel' + i + '">Numero ' + n + '</label>' +
          '<input class="input" id="pianoTel' + i + '" type="tel" inputmode="tel" autocomplete="off" value="' + esc(valore(c && c.tel)) + '"></div>' +
        '</div>';
    };
    const voceStampa = function (titolo, testo) {
      const dentro = testo ? esc(testo).replace(/\n/g, "<br>") : '<span class="piano-riga">&nbsp;</span>';
      return '<section class="piano-voce"><h2>' + titolo + '</h2><p class="piano-testo">' + dentro + '</p></section>';
    };
    const stampaHTML = function (p) {
      const c = Array.isArray(p.contatti) ? p.contatti : [];
      return '<p class="piano-titolo">Il mio piano di sicurezza</p>' +
        '<p class="piano-nota">Scritto da me, sul mio dispositivo. Non è una prescrizione e non sostituisce una persona.</p>' +
        voceStampa("I miei segnali", p.segnali) +
        voceStampa("Cosa faccio nei primi minuti", p.primiMinuti) +
        '<section class="piano-voce"><h2>Chi chiamo</h2><ul class="piano-contatti-stampa">' +
          [0, 1, 2].map(function (i) {
            const x = c[i] || {};
            return '<li><span class="piano-riga">' + esc(valore(x.nome)) + '</span>' +
              '<span class="piano-riga">' + esc(valore(x.tel)) + '</span></li>';
          }).join("") + "</ul></section>" +
        voceStampa("Come rendo l'ambiente più sicuro", p.ambiente) +
        voceStampa("Una ragione per chiamare", p.ragione);
    };

    A.setTitle("Il mio piano di sicurezza");
    A.page(
      '<div class="page-head no-print"><p class="eyebrow">Sicurezza</p><h1>Il mio piano di sicurezza</h1>' +
        '<p class="lead">Cinque cose scritte da te, da rileggere quando è difficile decidere. Il programma non aggiunge consigli: i campi restano come li lasci.</p>' +
        '<p class="mt-1 mb-0"><a class="chip" href="#/sicurezza">Torna a Sicurezza</a></p></div>' +
      '<div class="callout info no-print"><p><strong>Resta su questo dispositivo.</strong> Il piano si salva qui, viaggia nel backup e non viene inviato a nessuno. Se c\'è un pericolo immediato, chiama il <strong>112</strong>.</p></div>' +
      '<form class="card mt-2 piano-modulo no-print" id="pianoForm">' +
        campo("pianoSegnali", "I miei segnali", "Come mi accorgo che le cose stanno peggiorando: sensazioni, pensieri, comportamenti.", valore(piano.segnali), 3) +
        campo("pianoPrimiMinuti", "Cosa faccio nei primi minuti", "I passi che ho deciso di fare, uno per riga.", valore(piano.primiMinuti), 4) +
        '<h2 class="h-sub mt-2">Chi chiamo</h2>' +
        '<div class="piano-contatti">' + [0, 1, 2].map(function (i) { return rigaContatto(i, contatti[i]); }).join("") + "</div>" +
        campo("pianoAmbiente", "Come rendo l'ambiente più sicuro", "Cosa tolgo, metto via o chiedo a qualcuno.", valore(piano.ambiente), 3) +
        campo("pianoRagione", "Una ragione per chiamare", "La frase che voglio rileggere quando non riesco a decidere.", valore(piano.ragione), 2) +
        '<div class="btn-row mt-2"><button class="btn btn-primary" type="submit">Salva il piano</button>' +
          '<button class="btn btn-soft" type="button" id="stampaPiano">Stampa il piano</button></div>' +
      "</form>" +
      '<div class="solo-stampa piano-stampa" id="pianoStampa"></div>'
    );

    const leggi = function () {
      const v = function (id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
      return {
        segnali: v("pianoSegnali"),
        primiMinuti: v("pianoPrimiMinuti"),
        contatti: [0, 1, 2].map(function (i) {
          return { nome: v("pianoNome" + i), tel: v("pianoTel" + i) };
        }),
        ambiente: v("pianoAmbiente"),
        ragione: v("pianoRagione"),
        aggiornato: new Date().toISOString()
      };
    };
    const aggiornaStampa = function (dati) {
      const box = document.getElementById("pianoStampa");
      if (box) box.innerHTML = stampaHTML(dati || {});
    };
    aggiornaStampa(piano);

    const modulo = document.getElementById("pianoForm");
    if (modulo) modulo.addEventListener("submit", function (e) {
      e.preventDefault();
      const dati = leggi();
      if (A.writeJSON("pianoSicurezza", dati) === false) {
        A.toast("Non è stato possibile salvare il piano: lo spazio del browser è pieno. Esporta un backup e riprova.", 9000);
        return;
      }
      aggiornaStampa(dati);
      A.toast("Piano salvato.");
    });
    const stampa = document.getElementById("stampaPiano");
    if (stampa) stampa.addEventListener("click", function () {
      // Si stampa quello che c'è ora, anche se non è stato salvato: chi ha
      // appena scritto non deve perdere il foglio per un clic dimenticato.
      aggiornaStampa(leggi());
      window.print();
    });
  }

  views.sicurezza = function (params) {
    if (params && params[0] === "piano") { pianoSicurezza(); return; }
    const S = NP.data.sicurezza;
    A.setTitle("Sicurezza e numeri utili");
    A.page(
      '<div class="page-head"><p class="eyebrow">Sicurezza</p><h1>Quando la priorità non è l\'app</h1>' +
        '<p class="lead">' + esc(S.introduzione) + "</p></div>" +
      // Un'uscita sola, in cima: chi ha bisogno di sparire non deve cercarla
      // fra i numeri. La pagina neutra non è una cancellazione, e qui lo dice.
      '<div class="card uscita-rapida" id="uscitaRapida">' +
        '<div class="btn-row" style="justify-content:space-between;align-items:center;gap:1rem">' +
          '<div><h2 class="h-sub" style="margin-bottom:.2rem">Se qualcuno sta arrivando</h2>' +
          '<p class="text-small mb-0"><strong>Esci subito</strong> apre una pagina neutra, senza contenuti del programma. Non cancella la cronologia del browser: la visita resta nella cronologia, e con il pulsante Indietro si torna qui.</p></div>' +
          '<a class="btn btn-primary" id="esciSubito" href="#/nuova">Esci subito</a>' +
        "</div></div>" +
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

      '<div class="card mt-2" id="pianoSicurezzaCard"><div class="btn-row" style="justify-content:space-between;align-items:center;gap:1rem"><div><h2 class="h-sub" style="margin-bottom:.2rem">Il mio piano di sicurezza</h2><p class="text-small mb-0">Segnali, primi passi, persone da chiamare, ambiente e una ragione: lo compili tu, resta sul dispositivo e si stampa.</p></div><a class="btn btn-soft btn-sm" href="#/sicurezza/piano">Apri il piano</a></div></div>' +
      '<div class="callout warn mt-2"><p><strong>Nota.</strong> ' + esc(S.nota) + "</p></div>" +
      '<div class="callout info"><p><strong>Se stai leggendo per un\'altra persona:</strong> non lasciarla sola, ascolta senza giudicare, non promettere segreti che riguardano la sua sicurezza e aiutala a contattare un professionista. In pericolo immediato: 112.</p></div>' +
      '<div class="btn-row mt-2"><a class="btn btn-primary" href="#/neura">Parla con Neura</a><a class="btn btn-ghost" href="#/colloquio">Colloquio</a></div>'
    );
  };

  // Uscita rapida: una pagina che non dice niente di chi la stava guardando.
  // Non è una pagina bianca: un orologio e una data sono quello che mostra una
  // scheda nuova, e non rivelano né il programma né l'argomento. La cronologia
  // del browser non si tocca: la voce resta, e Indietro riporta alla sicurezza.
  views.nuova = function () {
    document.title = "Nuova scheda";
    const data = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    const aggiornaOrologio = function () {
      const ora = document.getElementById("nuovaSchedaOra");
      if (!ora) return;
      ora.textContent = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      setTimeout(aggiornaOrologio, 15000);
    };
    A.page(
      '<div class="nuova-scheda-pagina">' +
        '<h1 class="nuova-scheda-nome">Nuova scheda</h1>' +
        '<div class="nuova-scheda-centro">' +
          '<p class="nuova-scheda-ora" id="nuovaSchedaOra"></p>' +
          '<p class="nuova-scheda-data">' + esc(data.charAt(0).toUpperCase() + data.slice(1)) + "</p>" +
        "</div>" +
      "</div>"
    );
    aggiornaOrologio();
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

  // Una voce cercata si apre qui, anche se è più vecchia delle otto in elenco:
  // senza questo il risultato della ricerca porterebbe a una pagina in cui la
  // voce non c'è.
  function dataBreve(iso) {
    const t = new Date(iso).getTime();
    if (!isFinite(t)) return "";
    return new Date(t).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
  }

  views.diario = function (params) {
    const chiesto = (params && params[0]) || "";
    const idChiesto = (params && params[1]) || "";
    const voceInEvidenza = chiesto === "voce" && idChiesto
      ? (state.diary || []).filter(function (e) { return e && e.id === idChiesto; })[0]
      : null;
    const schedaInEvidenza = chiesto === "scheda" && idChiesto
      ? A.readJSON("thoughts", []).filter(function (t) { return t && t.id === idChiesto; })[0]
      : null;

    // L'elenco completo si apre con #/diario/tutte, e una voce si modifica con
    // #/diario/modifica/<id>: la forma è la stessa, cambia quello che c'è
    // dentro, così una voce sbagliata si corregge senza cancellarla e
    // riscriverla (e senza lasciare un buco nelle medie del riepilogo).
    const tutte = chiesto === "tutte";
    const inModifica = chiesto === "modifica" && idChiesto
      ? (state.diary || []).filter(function (e) { return e && e.id === idChiesto; })[0]
      : null;
    const entries = (state.diary || []).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    const last = tutte ? entries : entries.slice(0, 8);
    if (!tutte && voceInEvidenza && last.indexOf(voceInEvidenza) < 0) last.unshift(voceInEvidenza);
    const avgMood = entries.length ? (entries.reduce(function (s, e) { return s + (Number(e.mood) || 0); }, 0) / entries.length).toFixed(1) : "—";
    const schede = A.readJSON("thoughts", []).filter(function (t) { return t && typeof t === "object"; })
      .sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });

    const listHTML = last.length ? last.map(function (e, i) {
      const trovata = voceInEvidenza && e.id === voceInEvidenza.id;
      return '<div class="diary-entry' + (trovata ? " is-trovata" : "") + '"' + (trovata ? ' id="voceCercata"' : "") + '><span class="diary-date">' + esc(e.date ? new Date(e.date + "T12:00:00").toLocaleDateString("it-IT", { day: "2-digit", month: "short" }) : "—") + "</span>" +
        '<span class="diary-mood"><span class="mood-dot" style="background:' + moodColor(e.mood) + '"></span>Umore ' + esc(e.mood) + "/10 · Ansia " + esc(e.anxiety) + "/10 · Sonno " + esc(e.sleep) + "h</span>" +
        '<a class="chip" href="#/diario/modifica/' + esc(e.id) + '" title="Modifica questa voce">Modifica</a>' +
        '<button type="button" class="chip" data-del="' + esc(e.id) + '" title="Elimina">✕</button>' +
        (e.note ? '<p class="diary-note" style="grid-column:1/-1">' + esc(e.note) + "</p>" : "") + "</div>";
    }).join("") : '<p class="muted text-small">Nessuna voce. Anche tre righe al giorno bastano per vedere un pattern.</p>';

    A.setTitle("Diario");
    A.page(
      '<div class="page-head"><p class="eyebrow">Diario</p><h1>Misurare senza ossessionarsi</h1>' +
        '<p class="lead">Umore, ansia, sonno e una nota. Serve a te e al professionista: i pattern contano più della singola giornata.</p></div>' +
      '<div class="diary-grid">' +
        '<div class="card"><h2>' + (inModifica ? "Modifica la voce" : "Voce di oggi") + "</h2>" +
          (inModifica ? '<p class="text-small muted">Stai correggendo la voce del ' + esc(dataBreve(inModifica.date)) + ". La data resta quella: non diventa una voce nuova.</p>" : "") +
          '<form id="diaryForm">' +
            '<div class="form-field"><label class="field-label" for="dDate">Data</label><input class="input" type="date" id="dDate" value="' + esc(String(inModifica ? inModifica.date : todayISO()).slice(0, 10)) + '"></div>' +
            '<div class="form-field"><span class="field-label">Umore <span class="muted text-small">(0 pessimo · 10 ottimo)</span></span><div class="mood-scale-row" id="moodRow">' +
              [0,1,2,3,4,5,6,7,8,9,10].map(function (v) { return '<button type="button" class="mood-pick' + (v === (inModifica ? Number(inModifica.mood) : 5) ? " is-active" : "") + '" data-mood="' + v + '">' + v + "</button>"; }).join("") + "</div></div>" +
            '<div class="form-field"><label class="field-label" for="dAnx">Ansia <span class="muted text-small">(0-10)</span></label><div class="scale-input"><input type="range" id="dAnx" min="0" max="10" value="' + esc(inModifica ? inModifica.anxiety : 4) + '"><output class="scale-value" id="dAnxOut">' + esc(inModifica ? inModifica.anxiety : 4) + "</output></div></div>" +
            '<div class="form-grid">' +
              '<div class="form-field"><label class="field-label" for="dSleep">Ore di sonno</label><input class="input" type="number" id="dSleep" min="0" max="14" step="0.5" value="' + esc(inModifica ? inModifica.sleep : 7) + '"></div>' +
              '<div class="form-field"><label class="field-label" for="dEnergy">Energia (0-10)</label><input class="input" type="number" id="dEnergy" min="0" max="10" value="' + esc(inModifica ? inModifica.energy : 5) + '"></div>' +
            "</div>" +
            '<div class="form-field"><label class="field-label" for="dNote">Nota <span class="muted text-small">(facoltativa)</span></label><textarea class="textarea" id="dNote" maxlength="400" placeholder="Cosa è successo, cosa hai notato…">' + esc(inModifica ? inModifica.note : "") + '</textarea></div>' +
            '<div class="btn-row"><button type="submit" class="btn btn-primary">' + A.icon("pen") + (inModifica ? "Salva le modifiche" : "Salva la voce") + "</button>" +
              (inModifica ? '<a class="btn btn-ghost" href="#/diario">Annulla</a>' : "") + "</div>" +
          "</form>" +
        "</div>" +
        '<div class="grid" style="gap:1rem">' +
          (schedaInEvidenza
            ? '<div class="card" id="schedaCercata"><div class="btn-row" style="justify-content:space-between"><h2 style="margin:0">Scheda del pensiero</h2>' +
                '<span class="text-small muted">' + esc(dataBreve(schedaInEvidenza.date)) + "</span></div>" +
                '<p class="mt-1"><strong>Situazione.</strong> ' + esc(schedaInEvidenza.situation || "—") + "</p>" +
                '<p><strong>Pensiero.</strong> ' + esc(schedaInEvidenza.thought || "—") + "</p>" +
                '<p><strong>Emozione.</strong> ' + esc(schedaInEvidenza.emotion || "—") +
                  (isFinite(schedaInEvidenza.intensity) ? " (" + esc(schedaInEvidenza.intensity) + "/10)" : "") + "</p>" +
                '<p><strong>Lettura alternativa.</strong> ' + esc(schedaInEvidenza.alternative || "non formulata") + "</p>" +
                '<div class="btn-row"><button type="button" class="btn btn-danger btn-sm" id="eliminaScheda">Elimina la scheda</button>' +
                '<a class="btn btn-ghost btn-sm" href="#/cerca">Torna alla ricerca</a></div></div>'
            : "") +
          '<div class="card"><div class="btn-row" style="justify-content:space-between"><h2 style="margin:0">' + (tutte ? "Tutte le voci" : "Le ultime voci") + '</h2><span class="badge badge-blue">Media umore ' + avgMood + "</span></div><div class=\"diary-list mt-2\">" + listHTML + "</div>" +
            (!tutte && entries.length > 8
              ? '<p class="text-small mt-1 mb-0"><a class="chip" href="#/diario/tutte">Vedi tutte le ' + entries.length + ' voci</a></p>'
              : (tutte ? '<p class="text-small mt-1 mb-0"><a class="chip" href="#/diario">Torna al diario</a></p>' : "")) +
          "</div>" +
          '<div class="card"><h2 class=h-sub>Scheda del pensiero</h2><p class="text-small">La classica scheda a sette colonne, ridotta all&rsquo;essenziale. Compila quando un pensiero ti ha fatto stare male.</p>' +
            '<form id="thoughtForm" class="thought-grid">' +
              '<div class="form-field"><label class="field-label" for="tSit">Situazione</label><input class="input" id="tSit" placeholder="Chi, dove, quando"></div>' +
              '<div class="form-field"><label class="field-label" for="tThought">Pensiero</label><input class="input" id="tThought" placeholder="La frase esatta"></div>' +
              '<div class="form-grid"><div class="form-field"><label class="field-label" for="tEmo">Emozione</label><input class="input" id="tEmo" placeholder="Ansia, vergogna…"></div>' +
              '<div class="form-field"><label class="field-label" for="tInt">Intensità (0-10)</label><input class="input" id="tInt" type="number" min="0" max="10" value="6"></div></div>' +
              '<div class="form-field"><label class="field-label" for="tAlt">Una lettura alternativa</label><textarea class="textarea" id="tAlt" maxlength="400" placeholder="Più precisa, non più ottimista…"></textarea></div>' +
              '<button type="submit" class="btn btn-soft">Salva la scheda</button>' +
            "</form></div>" +
          '<div class="card"><div class="btn-row" style="justify-content:space-between"><h2 style="margin:0">Le ultime schede</h2><span class="badge badge-blue">' + schede.length + "</span></div>" +
            (schede.length
              ? '<ul class="text-small thought-list mt-2">' + schede.slice(0, 5).map(function (t) {
                  return '<li class="thought-item"><div class="btn-row" style="justify-content:space-between"><span class="muted">' + esc(dataBreve(t.date)) + '</span>' +
                    '<button type="button" class="chip" data-del-thought="' + esc(t.id) + '" title="Elimina questa scheda">✕</button></div>' +
                    '<p class="mb-0"><strong>' + esc(t.thought || "—") + "</strong></p>" +
                    '<span class="muted">' + esc(t.emotion || "—") + (isFinite(t.intensity) ? " · " + esc(t.intensity) + "/10" : "") + "</span></li>";
                }).join("") + "</ul>" +
                (schede.length > 5 ? '<p class="text-small muted mb-0">Le più vecchie si trovano con la ricerca: ogni risultato apre la scheda con il pulsante per eliminarla.</p>' : "")
              : '<p class="text-small muted mb-0">Nessuna scheda salvata. Compila quella sopra quando un pensiero ti ha fatto stare male.</p>') +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="callout warn mt-3"><p><strong>Il diario non è una pagella.</strong> Se ti accorgi di controllarlo in modo compulsivo o che ti fa stare peggio, parlane con il professionista: anche il monitoraggio può diventare un problema.</p></div>'
    );

    let mood = inModifica ? Number(inModifica.mood) : 5;
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
      const dati = {
        // Un campo data vuoto non deve cambiare la data di una voce che si sta
        // correggendo: se il browser non restituisce niente, resta quella sua.
        date: document.getElementById("dDate").value || (inModifica ? String(inModifica.date).slice(0, 10) : todayISO()),
        mood: mood,
        anxiety: Number(document.getElementById("dAnx").value),
        sleep: Number(document.getElementById("dSleep").value),
        energy: Number(document.getElementById("dEnergy").value),
        note: document.getElementById("dNote").value.trim()
      };
      // Una voce in modifica si aggiorna sul posto: id e data restano, quindi
      // non compare una seconda voce e le medie non contano due volte lo stesso
      // giorno. Una voce nuova, invece, si aggiunge in fondo.
      if (inModifica) {
        const i = state.diary.findIndex(function (x) { return x && x.id === inModifica.id; });
        if (i >= 0) state.diary[i] = Object.assign({}, inModifica, dati);
        A.saveDiary();
        A.toast("Voce aggiornata.");
        A.go("diario");
        return;
      }
      state.diary.push(Object.assign({ id: "d" + Date.now() }, dati));
      A.saveDiary();
      A.toast("Voce salvata nel diario.");
      A.render();
    });

    document.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Eliminare questa voce?")) return;
        state.diary = state.diary.filter(function (x) { return x.id !== btn.getAttribute("data-del"); });
        A.saveDiary();
        A.render();
      });
    });

    // Le schede del pensiero si eliminano da qui e dalla scheda aperta con la
    // ricerca, con la stessa conferma: una scheda contiene pensieri personali e
    // non deve sparire per un tocco sbagliato.
    function eliminaSchedaPensiero(id) {
      if (!id) return;
      if (!confirm("Eliminare questa scheda del pensiero? L'operazione non si può annullare.")) return;
      const restanti = A.readJSON("thoughts", []).filter(function (t) { return t && t.id !== id; });
      if (A.writeJSON("thoughts", restanti) === false) {
        A.toast("Non sono riuscito a salvare la cancellazione: lo spazio è pieno.");
        return;
      }
      A.toast("Scheda eliminata.");
      A.go("diario");
    }
    document.querySelectorAll("[data-del-thought]").forEach(function (btn) {
      btn.addEventListener("click", function () { eliminaSchedaPensiero(btn.getAttribute("data-del-thought")); });
    });
    const eliminaScheda = document.getElementById("eliminaScheda");
    if (eliminaScheda) eliminaScheda.addEventListener("click", function () {
      eliminaSchedaPensiero(schedaInEvidenza && schedaInEvidenza.id);
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
      '<div class="btn-row mt-2"><button type="button" class="btn btn-soft btn-sm" id="backupBtn">' + A.icon("download") + "Esporta backup in chiaro</button>" +
        '<label class="btn btn-ghost btn-sm" for="importFile">' + A.icon("refresh") + 'Importa backup</label><input type="file" id="importFile" accept="application/json,.json" hidden>' +
        '<button type="button" class="btn btn-danger btn-sm" id="resetBtn">Cancella tutti i dati</button></div>' +
        '<p class="text-small muted mt-1 mb-0">Il backup in chiaro è un file JSON leggibile: scegli tu se basta, o se proteggerlo qui sotto. Un backup cifrato si importa dallo stesso pulsante.</p>' +
        '<div class="callout info mt-2" id="backupSblocco" hidden><p><strong>Questo backup è protetto.</strong> Scrivi la password scelta quando l\'hai esportato: non è stata salvata, serve solo ora per aprirlo.</p>' +
          '<form id="backupSbloccoForm"><div class="form-field"><label class="field-label" for="backupSbloccoPassword">Password del backup</label>' +
            '<input class="input" type="password" id="backupSbloccoPassword" autocomplete="current-password"></div>' +
            '<div class="btn-row"><button type="submit" class="btn btn-primary btn-sm" id="backupSbloccoApri">Apri il backup</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" id="backupSbloccoAnnulla">Annulla</button></div>' +
            '<p class="text-small muted mb-0" id="backupSbloccoStato" role="status"></p></form></div>' +
      "</div>" +

      '<div class="card mt-2" id="backupCifrato"><h2 class=h-sub>Un backup protetto da password</h2>' +
        '<p>Se il file deve uscire dal computer, puoi cifrarlo qui, sul dispositivo, con AES-GCM. La password non viene salvata e non viene inviata a nessuno: senza di essa il file non si apre.</p>' +
        '<div class="callout warn"><p><strong>Una password persa è un file perso.</strong> Non c\'è un pulsante «recupera»: se la dimentichi, il file resta chiuso anche per noi. Il backup in chiaro resta disponibile qui sopra, senza password.</p></div>' +
        '<form id="backupCifratoForm"><div class="form-field"><label class="field-label" for="backupPassword">Password <span class="muted text-small">(almeno ' + A.passwordMinima + " caratteri)</span></label>" +
          '<input class="input" type="password" id="backupPassword" autocomplete="new-password" minlength="' + A.passwordMinima + '" required></div>' +
          '<div class="form-field"><label class="field-label" for="backupPassword2">Ripeti la password</label>' +
          '<input class="input" type="password" id="backupPassword2" autocomplete="new-password" minlength="' + A.passwordMinima + '" required></div>' +
          '<div class="btn-row"><button type="submit" class="btn btn-soft btn-sm" id="backupCifratoBtn">Esporta cifrato</button></div>' +
          '<p class="text-small muted mb-0" id="backupCifratoStato" role="status"></p></form></div>' +

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

      (function () {
        const stato = A.statoSpazioPersistente();
        const esporta = '<div class="btn-row mt-1"><button type="button" class="btn btn-soft btn-sm" id="protezioneEsporta">' +
          A.icon("download") + "Esporta backup</button></div>";
        let corpo;
        if (!stato) {
          corpo = '<p>Sto chiedendo al browser se può proteggere i dati di questa app…</p>';
        } else if (!stato.supportato) {
          corpo = "<p><strong>Questo browser non offre la protezione dello spazio.</strong> Non può garantire che i dati restino quando lo spazio scarseggia: il backup è l'unica copia che non dipende da lui.</p>" + esporta;
        } else if (stato.protetto) {
          corpo = "<p><strong>I dati sono protetti dallo spazio.</strong> Il browser li conserva anche quando lo spazio scarseggia e non li cancella da solo per fare posto ad altri siti. Restano i limiti di sempre: svuotare i dati del sito o cambiare browser li porta via lo stesso.</p>";
        } else {
          corpo = '<p><strong>I dati non sono protetti dallo spazio.</strong> Il browser può cancellarli da solo quando lo spazio finisce, per fare posto ad altri siti. Non è successo adesso: è un rischio da conoscere, e il backup è la copia che resta anche se il browser cambia idea.</p>' +
            '<div class="btn-row mt-1"><button type="button" class="btn btn-soft btn-sm" id="protezioneEsporta">' + A.icon("download") + "Esporta backup</button>" +
            '<button type="button" class="btn btn-ghost btn-sm" id="protezioneRiprova">Riprova a proteggere</button></div>';
        }
        return '<div class="card mt-2" id="protezioneSpazio"><h2 class=h-sub>Protezione dello spazio</h2>' + corpo + "</div>";
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

      '<p class="text-small muted mt-3">Versione 1.7.15 · novembre 2026 · Codice MIT · Contenuti CC BY-NC-SA 4.0 · © Danilo D\'Auria. <a href="#/versioni">Cosa è cambiato, versione per versione</a></p>'
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

    const protezioneEsporta = document.getElementById("protezioneEsporta");
    if (protezioneEsporta) protezioneEsporta.addEventListener("click", function () { A.esportaBackup(); });

    const protezioneRiprova = document.getElementById("protezioneRiprova");
    if (protezioneRiprova) protezioneRiprova.addEventListener("click", function () {
      A.chiediSpazioPersistente().then(function () { A.render(); });
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

    const importa = function (letto) {
      // Un file vecchio si completa prima di leggerlo: importare un formato
      // che nel frattempo è cambiato sarebbe una perdita silenziosa.
      const esito = A.migraBackup(letto);
      if (esito.errore) { A.toast(esito.errore, 8000); return false; }
      if (!confirm("Importare il backup? I dati attuali verranno sostituiti.")) return false;
      // Una sola strada per rimettere a posto i dati: import da file, ripristino
      // di una copia e annullamento non possono divergere sui campi toccati.
      A.applicaBackup(esito.dati);
      A.toast("Backup importato" + (esito.migrato ? " e aggiornato al formato attuale." : "."));
      A.render();
      return true;
    };

    const mostraSblocco = function (busta, nome) {
      backupCifratoInAttesa = busta;
      const box = document.getElementById("backupSblocco");
      if (!box) return;
      box.hidden = false;
      const pwd = document.getElementById("backupSbloccoPassword");
      if (pwd) { pwd.value = ""; pwd.focus(); }
      const stato = document.getElementById("backupSbloccoStato");
      if (stato) stato.textContent = "Backup «" + nome + "»: scrivi la password per aprirlo.";
    };

    const imp = document.getElementById("importFile");
    if (imp) imp.addEventListener("change", function () {
      const file = imp.files && imp.files[0];
      if (!file) return;
      const box = document.getElementById("backupSblocco");
      if (box) box.hidden = true;
      backupCifratoInAttesa = null;
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const letto = JSON.parse(reader.result);
          if (!letto || letto.app !== "Psicologo Digitale") throw new Error("Formato non valido");
          if (A.isBackupCifrato(letto)) { mostraSblocco(letto, file.name); return; }
          importa(letto);
        } catch (e) {
          alert("Il file non sembra un backup valido di Psicologo Digitale.");
        }
      };
      reader.readAsText(file, "utf-8");
    });

    const sblocco = document.getElementById("backupSbloccoForm");
    if (sblocco) sblocco.addEventListener("submit", function (e) {
      e.preventDefault();
      const pwd = document.getElementById("backupSbloccoPassword");
      const stato = document.getElementById("backupSbloccoStato");
      const bottone = document.getElementById("backupSbloccoApri");
      if (!backupCifratoInAttesa) { if (stato) stato.textContent = "Scegli prima un file."; return; }
      if (!pwd || !pwd.value) { if (stato) stato.textContent = "Scrivi la password del backup."; if (pwd) pwd.focus(); return; }
      if (stato) stato.textContent = "Apro il file sul dispositivo…";
      if (bottone) bottone.disabled = true;
      A.decifraBackup(backupCifratoInAttesa, pwd.value).then(function (dati) {
        backupCifratoInAttesa = null;
        pwd.value = "";
        const box = document.getElementById("backupSblocco");
        if (box) box.hidden = true;
        importa(dati);
      }).catch(function (err) {
        if (stato) stato.textContent = err && err.message ? err.message : "Password errata o file danneggiato.";
        if (pwd) { pwd.focus(); pwd.select(); }
      }).finally(function () { if (bottone) bottone.disabled = false; });
    });

    const annullaSblocco = document.getElementById("backupSbloccoAnnulla");
    if (annullaSblocco) annullaSblocco.addEventListener("click", function () {
      backupCifratoInAttesa = null;
      const box = document.getElementById("backupSblocco");
      if (box) box.hidden = true;
      const pwd = document.getElementById("backupSbloccoPassword");
      if (pwd) pwd.value = "";
      if (imp) imp.value = "";
    });

    const cifraForm = document.getElementById("backupCifratoForm");
    if (cifraForm) cifraForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const pwd = document.getElementById("backupPassword");
      const pwd2 = document.getElementById("backupPassword2");
      const stato = document.getElementById("backupCifratoStato");
      const bottone = document.getElementById("backupCifratoBtn");
      if (!pwd || pwd.value.length < A.passwordMinima) {
        if (stato) stato.textContent = "La password deve avere almeno " + A.passwordMinima + " caratteri.";
        if (pwd) pwd.focus();
        return;
      }
      if (!pwd2 || pwd.value !== pwd2.value) {
        if (stato) stato.textContent = "Le due password non coincidono.";
        if (pwd2) pwd2.focus();
        return;
      }
      if (!A.cifraturaDisponibile()) {
        if (stato) stato.textContent = "Questo browser non sa cifrare i backup: usa quello in chiaro.";
        return;
      }
      if (stato) stato.textContent = "Cifro il file sul dispositivo…";
      if (bottone) bottone.disabled = true;
      A.esportaBackupCifrato(pwd.value).then(function () {
        pwd.value = "";
        if (pwd2) pwd2.value = "";
        if (stato) stato.textContent = "Backup cifrato esportato. La password non è stata salvata: senza di essa il file non si apre.";
      }).catch(function (err) {
        if (stato) stato.textContent = err && err.message ? err.message : "Non è stato possibile cifrare il backup: usa quello in chiaro.";
      }).finally(function () { if (bottone) bottone.disabled = false; });
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
  // mette in fila. Due periodi affiancati dicono più di un numero solo. La
  // scelta fra sette e trenta giorni è solo un'altra chiamata alla stessa
  // funzione: qui non esiste una seconda formula da tenere allineata.
  views.riepilogo = function (params) {
    const giorni = params && params[0] === "30" ? 30 : 7;
    const ora = A.statistichePeriodo(giorni, 0);
    const prima = A.statistichePeriodo(giorni, giorni);
    const parole = giorni === 30 ? "trenta" : "sette";
    const totale = giorni === 30 ? "sessanta" : "quattordici";
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

    const dalAl = function (s) { return "dal " + A.fmtDate(s.dal) + " al " + A.fmtDate(s.al); };

    A.setTitle("Riepilogo dei periodi");
    A.page(
      '<div class="page-head"><p class="eyebrow">Riepilogo</p><h1>Gli ultimi ' + parole + ' giorni, accanto ai ' + parole + ' prima</h1>' +
        '<p class="lead">Le stesse misure in due periodi vicini. Non è un giudizio: è il modo più semplice per vedere se una direzione c\'è.</p>' +
        '<div class="riepilogo-scelta no-print"><nav class="btn-row" aria-label="Periodo da confrontare">' +
          '<a class="btn btn-sm ' + (giorni === 7 ? "btn-primary" : "btn-soft") + '" href="#/riepilogo"' + (giorni === 7 ? ' aria-current="page"' : "") + ">7 giorni</a>" +
          '<a class="btn btn-sm ' + (giorni === 30 ? "btn-primary" : "btn-soft") + '" href="#/riepilogo/30"' + (giorni === 30 ? ' aria-current="page"' : "") + ">30 giorni</a>" +
        '</nav><button type="button" class="btn btn-ghost btn-sm" id="stampaRiepilogo">' + A.icon("print") + "Stampa il confronto</button></div>" +
        '<p class="riepilogo-date text-small muted">' + esc(dalAl(ora)) + ". I " + parole + " giorni prima: " + esc(dalAl(prima)) + "</p></div>" +
      (vuoto
        ? '<div class="callout info"><p><strong>Non ci sono ancora dati in questi ' + totale + ' giorni.</strong> Bastano una voce di diario o un questionario perché il confronto abbia qualcosa da dire.</p></div>'
        : '<div class="card"><h2 class="h-sub">Medie del diario</h2>' +
          '<table class="text-small"><thead><tr><th scope="col">Voce</th><th scope="col">Ultimi ' + giorni + ' giorni</th><th scope="col">' + giorni + ' giorni prima</th><th scope="col">Differenza</th></tr></thead><tbody>' +
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
      '<p class="mt-3 no-print"><a class="btn btn-soft" href="#/">Torna alla home</a></p>'
    );

    const stampa = document.getElementById("stampaRiepilogo");
    if (stampa) stampa.addEventListener("click", function () { window.print(); });
  };

  /* ---------------------------------------------------------------- Cerca */

  // Cercare dentro i contenuti: dodici capitoli, glossario ed esercizi sono
  // troppi per essere attraversati a mano quando si cerca una parola sola.
  function indiceContenuti() {
    const voci = [];
    // Il titolo non entra nel testo da cui si ricava l'estratto: è già scritto
    // sopra il risultato, e incollato al sommario faceva sembrare che la prima
    // frase cominciasse con lui («Ansia L'ansia è…»). Quello che si cerca è il
    // corpo, con un a capo fra un pezzo e l'altro: per estratto() l'a capo è
    // anche un confine di frase, quindi la riga sotto un titolo non si porta
    // dietro il titolo della sezione.
    (NP.data.manuale || []).forEach(function (c) {
      // Il titolo della sezione serve per trovare il capitolo, non per
      // l'estratto: chi cerca «suicidario» deve vedere il capitolo, non la
      // riga «Il rischio suicidario» al posto di una frase. Il testo per la
      // ricerca tiene i titoli, quello per l'estratto tiene solo la prosa.
      const prosa = [c.sommario];
      const corpo = [c.sommario];
      c.sezioni.forEach(function (s) {
        corpo.push(s.h);
        s.p.forEach(function (p) { corpo.push(p); prosa.push(p); });
      });
      voci.push({ tipo: "Capitolo " + c.n, titolo: c.titolo, testo: corpo.join("\n"), frase: prosa.join("\n"), rotta: "#/manuale/" + c.id });
    });
    (NP.data.glossario || []).forEach(function (v) {
      voci.push({ tipo: "Glossario", titolo: v.t, testo: v.d, frase: v.d, rotta: "#/glossario" });
    });
    const esercizi = (NP.data.percorso && Array.isArray(NP.data.percorso.esercizi)) ? NP.data.percorso.esercizi : [];
    esercizi.forEach(function (e) {
      if (!e || typeof e !== "object" || !e.id) return;
      // Il testo di un esercizio non è un campo solo: scopo, quando, passi,
      // variante e nota. Prima l'indice leggeva `e.testo`, che negli esercizi
      // non esiste, quindi restavano cercabili solo titolo e durata — ed era
      // la durata a finire nell'estratto. La durata resta cercabile, ma non
      // può prendere il posto della frase.
      const prosa = [e.testo, e.scopo, e.quando].concat(
        Array.isArray(e.passo) ? e.passo : [], [e.variante, e.nota]
      ).filter(function (parte) { return !!parte; }).join("\n");
      voci.push({ tipo: "Esercizio", titolo: e.titolo || e.id, testo: [prosa, e.durata].filter(function (parte) { return !!parte; }).join("\n"), frase: prosa, rotta: "#/esercizi/" + e.id });
    });
    return voci;
  }

  /* --------------------------------------------------------- Le tue cose */

  // Le cose scritte dalla persona si cercano qui, in una funzione separata da
  // indiceContenuti(): quella conosce solo i testi del programma e non deve
  // sapere niente del diario, delle schede o delle note. I due indici restano
  // divisi apposta, e un test controlla che non si mescolino.
  // L'estratto è la frase in cui compaiono le parole cercate, non una finestra
  // fissa di caratteri: quaranta caratteri prima del match lasciano fuori
  // proprio il pezzo che dice di cosa si sta parlando.
  function estratto(testo, parole) {
    const basso = testo.toLowerCase();
    let primo = -1;
    let ultimo = -1;
    parole.forEach(function (p) {
      const i = basso.indexOf(p);
      if (i < 0) return;
      if (primo < 0 || i < primo) primo = i;
      if (i + p.length > ultimo) ultimo = i + p.length;
    });
    // Nessun termine cercato nella prosa: il risultato è comparso per il
    // titolo o per una durata, e non c'è una frase da mostrare. Meglio niente
    // estratto che una frase che non c'entra.
    if (primo < 0) return "";
    // Punto, punto esclamativo o interrogativo seguiti da uno spazio, e l'a
    // capo: sono i posti in cui comincia una frase nuova. Il punto e virgola
    // non è un confine: «È utile quando…; diventa un problema quando…» è una
    // frase sola, e tagliarla lì lasciava una dipendente senza la principale.
    const confini = [". ", "! ", "? ", "\n"];
    let inizio = 0;
    confini.forEach(function (c) {
      const i = testo.lastIndexOf(c, primo);
      if (i >= 0 && i + c.length > inizio) inizio = i + c.length;
    });
    let fine = testo.length;
    confini.forEach(function (c) {
      const i = testo.indexOf(c, ultimo);
      // Il punto fermo resta nella frase, lo spazio dopo no.
      if (i >= 0 && i + c.length - 1 < fine) fine = i + c.length - 1;
    });
    // Una frase lunghissima — un paragrafo senza punti — si taglia lo stesso,
    // ma sempre lasciando dentro le parole cercate e senza spezzare una parola:
    // un estratto che finisce con «personalizzaz» non è una frase, è un errore.
    if (fine - inizio > 220) {
      const inizioParola = function (i) {
        while (i > 0 && !/\s/.test(testo.charAt(i - 1))) i--;
        return i;
      };
      const fineParola = function (i) {
        while (i < testo.length && !/\s/.test(testo.charAt(i))) i++;
        return i;
      };
      inizio = Math.max(inizio, inizioParola(Math.max(inizio, primo - 40)));
      const taglio = Math.max(ultimo, Math.min(fine, inizio + 180));
      const dietro = inizioParola(taglio);
      // Se la parola tagliata comincia dopo il termine cercato, si arretra al
      // suo inizio; altrimenti si va avanti fino alla sua fine.
      fine = dietro > ultimo ? dietro : Math.min(fine, fineParola(taglio));
    }
    const pezzo = testo.slice(inizio, fine).trim();
    const re = new RegExp("(" + parole.map(function (p) {
      return p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")", "gi");
    // split con un gruppo tiene le parole trovate: si alternano a pezzi da
    // lasciare com'erano, e si evidenzia solo quello che si è cercato.
    const html = pezzo.split(re).map(function (parte, i) {
      return i % 2 ? "<mark>" + esc(parte) + "</mark>" : esc(parte);
    }).join("");
    return (inizio > 0 ? "… " : "") + html + (fine < testo.length ? " …" : "");
  }

  // La tabella dei sinonimi (data-extra.js) vale per tutte e due le ricerche:
  // chi cerca «dormire» deve trovare il capitolo sul sonno, e chi cerca
  // «sonno» deve trovare la nota in cui ha scritto «ho dormito poco». Un
  // termine fuori dalla tabella resta sé stesso: la ricerca non indovina.
  function gruppoDiSinonimi(parola) {
    const gruppi = (NP.data && NP.data.sinonimi) || [];
    for (let i = 0; i < gruppi.length; i++) {
      if (gruppi[i].indexOf(parola) >= 0) return gruppi[i];
    }
    return [parola];
  }

  function espandiParole(parole) {
    const perParola = parole.map(gruppoDiSinonimi);
    const visti = {};
    const tutti = [];
    perParola.forEach(function (gruppo) {
      gruppo.forEach(function (termine) {
        if (visti[termine]) return;
        visti[termine] = true;
        tutti.push(termine);
      });
    });
    // Le parole più lunghe prima: «ansiosamente» non deve essere evidenziata
    // solo a metà da «ansia».
    tutti.sort(function (a, b) { return b.length - a.length; });
    return { perParola: perParola, tutti: tutti };
  }

  function contieneLeParole(testo, gruppi) {
    const basso = String(testo || "").toLowerCase();
    return gruppi.every(function (gruppo) {
      return gruppo.some(function (termine) { return basso.indexOf(termine) >= 0; });
    });
  }

  function cercaPersonale(espansione) {
    const trova = function (testo) {
      return contieneLeParole(testo, espansione.perParola);
    };
    const voci = [];

    (state.diary || []).forEach(function (v) {
      const testo = String((v && v.note) || "");
      if (!trova(testo)) return;
      voci.push({
        etichetta: "Diario",
        dettaglio: dataBreve(v.date),
        estratto: estratto(testo, espansione.tutti),
        rotta: "#/diario/voce/" + encodeURIComponent(v.id)
      });
    });

    A.readJSON("thoughts", []).forEach(function (t) {
      if (!t || typeof t !== "object") return;
      // I campi sono cose diverse, non una frase sola: uniti con «·»
      // l'estratto ne mostrava tre di fila senza punteggiatura. L'a capo è
      // anche un confine di frase, quindi la ricerca mostra il campo giusto.
      const testo = [t.situation, t.thought, t.emotion, t.alternative].filter(Boolean).join("\n");
      if (!trova(testo)) return;
      voci.push({
        etichetta: "Scheda del pensiero",
        dettaglio: dataBreve(t.date),
        estratto: estratto(testo, espansione.tutti),
        rotta: "#/diario/scheda/" + encodeURIComponent(t.id)
      });
    });

    const note = (state.course && state.course.notes) || {};
    Object.keys(note).forEach(function (id) {
      const testo = String(note[id] || "");
      if (!trova(testo)) return;
      const esercizi = (NP.data.percorso && NP.data.percorso.esercizi) || [];
      const ex = esercizi.filter(function (e) { return e && e.id === id; })[0];
      voci.push({
        etichetta: "Nota del percorso",
        dettaglio: ex ? ex.titolo : id,
        estratto: estratto(testo, espansione.tutti),
        rotta: "#/esercizi/" + encodeURIComponent(id) + "/nota"
      });
    });

    return voci.slice(0, 30);
  }

  function vocePersonaleHTML(v) {
    return '<li class="cerca-voce"><a href="' + v.rotta + '"><strong>' + esc(v.etichetta) + "</strong></a>" +
      (v.dettaglio ? ' <span class="text-small muted">' + esc(v.dettaglio) + "</span>" : "") +
      '<p class="text-small mb-0">' + v.estratto + "</p></li>";
  }

  views.cerca = function (params) {
    const q = (params && params[0]) ? String(params[0]).trim() : "";
    const parole = q.toLowerCase().split(/\s+/).filter(function (p) { return p.length > 1; });
    const espansione = espandiParole(parole);
    const risultati = !parole.length ? [] : indiceContenuti().filter(function (v) {
      return contieneLeParole(v.titolo + " " + v.testo, espansione.perParola);
    }).slice(0, 40);
    const personali = parole.length ? cercaPersonale(espansione) : [];
    const nessuno = !!q && !risultati.length && !personali.length;

    A.setTitle("Cerca");
    A.page(
      '<div class="page-head"><p class="eyebrow">Ricerca</p><h1>Cerca nei contenuti e nelle tue cose</h1>' +
        '<p class="lead">Capitoli del manuale, glossario ed esercizi, e anche quello che hai scritto tu: voci di diario, schede del pensiero e note del percorso. La ricerca avviene qui, sul dispositivo: nessuna parola esce da qui.</p></div>' +
      '<form class="card" id="cercaForm"><label class="text-small" for="cercaInput">Parole da cercare</label>' +
        '<div class="btn-row"><input id="cercaInput" name="q" type="search" value="' + esc(q) + '" placeholder="per esempio: sonno, rimuginio, respiro" style="flex:1;min-width:12rem;padding:.5rem .7rem">' +
        '<button type="submit" class="btn btn-primary btn-sm">' + A.icon("list") + "Cerca</button></div>" +
        '<p class="text-small muted mb-0">Si possono cercare più parole: vengono cercate tutte insieme, nei testi del programma e in quello che hai scritto. La ricerca capisce anche i sinonimi più comuni: «dormire» trova il capitolo sul sonno, «ansioso» trova l\'ansia.</p></form>' +
      (nessuno
        ? '<div class="callout info mt-2"><p><strong>Nessun risultato per «' + esc(q) + '».</strong> Prova una parola più corta, o il termine clinico invece di quello comune.</p></div>'
        : "") +
      (risultati.length
        ? '<div class="card mt-2 cerca-contenuti"><h2 class="h-sub">Nei contenuti · ' + risultati.length + (risultati.length === 1 ? " risultato" : " risultati") + '</h2><ul class="text-small">' +
          risultati.map(function (v) {
            const frase = estratto(v.frase || v.testo, espansione.tutti);
            return '<li><a href="' + v.rotta + '"><strong>' + esc(v.titolo) + "</strong></a> — " + esc(v.tipo) +
              (frase ? '<p class="text-small muted mb-0">' + frase + "</p>" : "") + "</li>";
          }).join("") + "</ul></div>"
        : "") +
      (personali.length
        ? '<div class="card mt-2 cerca-personali" id="cercaPersonale"><h2 class="h-sub">Nelle tue cose · ' + personali.length + (personali.length === 1 ? " risultato" : " risultati") + '</h2>' +
          '<ul class="cerca-risultati">' + personali.map(vocePersonaleHTML).join("") + "</ul>" +
          '<p class="text-small muted mb-0">Sono le cose che hai scritto tu: restano su questo dispositivo e la ricerca le legge qui.</p></div>'
        : "") +
      '<div class="card mt-2"><h2 class="h-sub">Non è un motore di ricerca</h2><p class="text-small mb-0">La ricerca confronta le parole con i testi del programma e con quello che hai scritto. I sinonimi sono una tabella curata a mano, non un\'intelligenza: fuori da quella tabella resta letterale, e se non trova niente non significa che l\'argomento non esista, ma che non è scritto con quella parola. Per una domanda aperta c\'è Neura.</p></div>'
    );

    const modulo = document.getElementById("cercaForm");
    if (modulo) modulo.addEventListener("submit", function (e) {
      e.preventDefault();
      const valore = (document.getElementById("cercaInput").value || "").trim();
      A.go(valore ? "cerca/" + encodeURIComponent(valore) : "cerca");
    });
  };
})();
