/* ==========================================================================
   Psicologo Digitale · barra di stato
   Licenza del codice: MIT · Danilo D'Auria
   --------------------------------------------------------------------------
   Dice sempre, in alto, dove stiamo girando (browser, PWA installata o
   programma desktop), se sul computer c'è un modello locale, se il microfono
   c'è e se va autorizzato. Da qui si ferma la voce, si torna indietro e si
   raggiungono i numeri di emergenza in un tocco.
   ========================================================================== */

(function () {
  "use strict";

  const A = NP && NP.app;
  if (!A) return;

  const esc = A.esc;
  const NUMERI = (NP.data && NP.data.sicurezza && NP.data.sicurezza.numeri) || [];
  const SISTEMI = { win32: "Windows", darwin: "macOS", linux: "Linux", freebsd: "FreeBSD" };

  let ultimaIa = null;       // { ok, modelli, errore }
  let aperto = null;         // pannello attualmente aperto
  let statoMic = { presente: false, permesso: "sconosciuto" };
  let inCorso = false;       // una richiesta a Ollama è in volo

  /* Ambiente --------------------------------------------------------------- */

  function desktop() {
    const d = window.npDesktop;
    return d && d.platform ? d : null;
  }

  function pwa() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.navigator.standalone === true) return true;
    } catch (e) { /* niente */ }
    return false;
  }

  function modo() {
    const d = desktop();
    if (d) {
      return {
        id: "desktop",
        titolo: "Programma installato",
        dove: SISTEMI[d.platform] || d.platform,
        nota: "Stai usando il pacchetto desktop: finestra propria, nessun browser di mezzo, funziona anche senza connessione."
      };
    }
    if (pwa()) {
      return {
        id: "pwa",
        titolo: "App installata",
        dove: "PWA a schermo intero",
        nota: "Stai usando la PWA installata sul dispositivo: si apre dall'icona, senza barra degli indirizzi, e funziona offline."
      };
    }
    return {
      id: "browser",
      titolo: "Nel browser",
      dove: "scheda del browser",
      nota: "Questa è la versione web: non è installata. Se la installi la trovi tra le app del dispositivo, apre a schermo intero e resta disponibile senza rete."
    };
  }

  function dispositivo() {
    try {
      return NP.ambiente && typeof NP.ambiente.detect === "function" ? NP.ambiente.detect() : null;
    } catch (e) { return null; }
  }

  /* Voce e dettatura ------------------------------------------------------- */

  function notificaStato() {
    const btn = document.getElementById("statusStop");
    if (!btn) return;
    const voce = !!(NP.neuraUI && typeof NP.neuraUI.isSpeaking === "function" && NP.neuraUI.isSpeaking());
    const dettatura = !!(NP.neuraUI && typeof NP.neuraUI.isListening === "function" && NP.neuraUI.isListening());
    const attivo = voce || dettatura;
    btn.setAttribute("data-active", attivo ? "true" : "false");
    btn.setAttribute("title", attivo ? "Ferma la voce o la dettatura in corso" : "Ferma l'audio di Neura");
    btn.setAttribute("aria-label", attivo ? "Ferma l'audio in corso" : "Ferma l'audio di Neura");
  }

  function fermaAudio() {
    let fermato = false;
    if (NP.neuraUI) {
      if (typeof NP.neuraUI.isSpeaking === "function" && NP.neuraUI.isSpeaking()) fermato = true;
      if (typeof NP.neuraUI.stopListening === "function" && NP.neuraUI.stopListening()) fermato = true;
      if (typeof NP.neuraUI.stop === "function") NP.neuraUI.stop();
    }
    notificaStato();
    A.toast(fermato ? "Audio fermato." : "Nessun audio in corso.");
  }

  /* Microfono -------------------------------------------------------------- */

  function permessoMicrofono(cb) {
    const nav = window.navigator || {};
    if (!nav.permissions || typeof nav.permissions.query !== "function") { cb("sconosciuto"); return; }
    let p;
    try { p = nav.permissions.query({ name: "microphone" }); } catch (e) { cb("sconosciuto"); return; }
    if (!p || typeof p.then !== "function") { cb("sconosciuto"); return; }
    p.then(function (s) {
      cb(String((s && s.state) || "sconosciuto"));
      if (s) s.onchange = function () { aggiornaMicrofono(); };
    }).catch(function () { cb("sconosciuto"); });
  }

  function aggiornaMicrofono() {
    const nav = window.navigator || {};
    statoMic.presente = !!(nav.mediaDevices && typeof nav.mediaDevices.getUserMedia === "function");

    const testo = document.getElementById("statusMicText");
    const dot = document.getElementById("statusMicDot");
    const bottone = document.getElementById("statusMic");

    function scrivi(etichetta, statoDot) {
      if (testo) testo.textContent = etichetta;
      if (dot) dot.setAttribute("data-state", statoDot);
      if (bottone) bottone.setAttribute("title", etichetta + ": tocca per i dettagli");
    }

    if (!statoMic.presente) { scrivi("Microfono: non disponibile", "off"); return; }

    permessoMicrofono(function (stato) {
      statoMic.permesso = stato;
      if (stato === "granted") scrivi("Microfono: pronto", "ok");
      else if (stato === "denied") scrivi("Microfono: bloccato", "no");
      else scrivi("Microfono: da attivare", "attesa");
      if (aperto === "microfono") riempiPannello();
    });
  }

  /* Sistema operativo ------------------------------------------------------ */

  // Su desktop la piattaforma la dichiara Electron (l'unica affidabile, perché
  // il riconoscimento dal browser string è una deduzione); nel browser si legge
  // quello che dice NP.ambiente.
  function sistemaOperativo() {
    const d = desktop();
    if (d) {
      const id = d.platform === "win32" ? "windows" : d.platform === "darwin" ? "macos" : d.platform === "linux" ? "linux" : "altro";
      return { id: id, nome: SISTEMI[d.platform] || d.platform, certo: true };
    }
    const det = dispositivo();
    const os = (det && det.os) || "altro";
    const nomi = { windows: "Windows", macos: "macOS", linux: "Linux", android: "Android", ios: "iPhone o iPad" };
    return { id: os === "mac" ? "macos" : os, nome: nomi[os] || "Sistema non riconosciuto", certo: false };
  }

  function vociDisponibili() {
    try {
      const voci = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
      return {
        totali: voci.length,
        italiane: voci.filter(function (v) { return /^it/i.test(v.lang); }).length
      };
    } catch (e) { return { totali: 0, italiane: 0 }; }
  }

  function istruzioniAvvio(id) {
    if (id === "windows") {
      return "<li><strong>Windows</strong> — se compare <em>Windows ha protetto il PC</em>: <em>Altro informazioni</em> → <em>Esegui comunque</em>. Se il file resta bloccato, tasto destro → <em>Proprietà</em> → <em>Sblocca</em> → <em>OK</em>.</li>";
    }
    if (id === "macos") {
      return "<li><strong>macOS</strong> — doppio clic sull'app, poi <em>Fine</em>; <em>Impostazioni di Sistema</em> → <em>Privacy e sicurezza</em>, in fondo alla sezione <em>Sicurezza</em> trovi <em>Apri comunque</em>: conferma con password o Touch ID. Da macOS 15 il menu contestuale non aggira più il controllo.</li>";
    }
    if (id === "linux") {
      return "<li><strong>Linux</strong> — <code>.deb</code>: doppio clic e installa; <code>.AppImage</code>: <em>Proprietà</em> → <em>Consenti l'esecuzione</em>, oppure <code>chmod +x</code>.</li>";
    }
    return "<li><strong>Telefono o tablet</strong> — qui il programma si installa come app dal browser: non ci sono avvisi di questo tipo da superare.</li>";
  }

  function contenutoSistema() {
    const s = sistemaOperativo();
    const v = vociDisponibili();
    const m = modo();

    let html = "<h2 class=h-sub>Sistema in uso</h2>" +
      "<p><strong>" + esc(s.nome) + "</strong> · " + esc(m.titolo) + " · " + esc(m.dove) + "</p>" +
      '<p class="text-small muted">' + (s.certo
        ? "Il sistema lo dichiara il programma installato: il riconoscimento è esatto, non una deduzione."
        : "Il sistema è dedotto dal browser: se non corrisponde, non cambia nulla nel funzionamento.") + "</p>";

    html += "<h2 class=h-sub>Voci del dispositivo</h2>" +
      "<p>Voci disponibili: <strong>" + v.totali + "</strong>" + (v.italiane ? " (" + v.italiane + " in italiano)" : "") + ".</p>" +
      '<p class="text-small muted">Le voci naturali si installano dal pannello Voce e restano dentro il programma; le altre arrivano dal sistema operativo, e senza una voce italiana Neura tace e risponde per iscritto. Chrome ed Edge, nel browser, aggiungono voci online che il programma desktop non vede: lì restano solo quelle installate nel sistema. Per averne altre: su Windows <em>Impostazioni</em> → <em>Data e ora e lingua</em> → <em>Riconoscimento vocale</em> → <em>Aggiungi voci</em>; su macOS <em>Impostazioni di Sistema</em> → <em>Accessibilità</em> → <em>Contenuto pronunciato</em> → <em>Voce di sistema</em> → <em>Gestisci voci</em>.</p>' +
      '<div class="status-actions"><a class="btn btn-soft btn-sm" href="#/neura" data-status-close>Scegliere la voce</a></div>';

    html += "<h2 class=h-sub>Se il sistema chiede conferma</h2>" +
      "<p>I pacchetti non hanno un certificato commerciale: il sistema avvisa una volta sola e poi lascia lavorare. Il consenso si dà così.</p>" +
      "<ul class=\"text-small\">" + istruzioniAvvio(s.id) + "</ul>" +
      '<div class="status-actions"><a class="btn btn-ghost btn-sm" href="#/installa" data-status-close>Pagina Installa</a>' +
        '<a class="btn btn-ghost btn-sm" href="come-installare.html" data-status-close>Passaggio per passaggio</a></div>';
    return html;
  }

  /* Pannello --------------------------------------------------------------- */

  /* Aggiornamenti ----------------------------------------------------------- */

  // Il ponte esiste solo nel programma installato: nel browser la pagina si
  // aggiorna da sé quando il sito pubblica una nuova versione.
  function ponteAggiornamenti() {
    const d = window.npDesktop;
    return d && d.aggiornamenti ? d.aggiornamenti : null;
  }

  let statoUpdate = { fase: "sconosciuto", versione: "", percentuale: 0, messaggio: "" };

  function mostraStatoUpdate() {
    const chip = document.getElementById("statusUpdate");
    if (!chip) return;
    const fase = statoUpdate.fase;
    chip.hidden = !(fase === "pronto" || fase === "disponibile" || fase === "scaricamento");
    const testo = document.getElementById("statusUpdateText");
    if (testo) {
      testo.textContent = fase === "pronto" ? "Riavvia per aggiornare"
        : fase === "scaricamento" ? "Nuova versione " + (statoUpdate.percentuale || 0) + "%"
        : "Nuova versione " + (statoUpdate.versione || "");
    }
    const dot = document.getElementById("statusUpdateDot");
    if (dot) dot.setAttribute("data-state", fase === "pronto" ? "ok" : "attesa");
    chip.setAttribute("aria-label", (testo ? testo.textContent : "Aggiornamento") + ": apri i dettagli");
  }

  function controllaAggiornamenti() {
    const ponte = ponteAggiornamenti();
    if (!ponte) return;
    statoUpdate = { fase: "verifica", versione: statoUpdate.versione || "", percentuale: 0, messaggio: "Controllo le nuove versioni…" };
    mostraStatoUpdate();
    if (aperto === "modo") riempiPannello();
    ponte.controlla();
  }

  function installaAggiornamento() {
    const ponte = ponteAggiornamenti();
    if (!ponte) return;
    const ok = window.confirm("Riavvio il programma per installare la versione " + (statoUpdate.versione || "nuova") + ". Diario, questionari e chat restano salvati.");
    if (ok) ponte.installa();
  }

  function bloccoAggiornamenti() {
    const ponte = ponteAggiornamenti();
    let html = "<h2 class=h-sub>Aggiornamenti</h2>";

    if (!ponte) {
      return html + '<p class="text-small muted mb-0">Qui gli aggiornamenti non si gestiscono: nel browser la pagina si rinnova da sé quando il sito pubblica una nuova versione. Il controllo automatico riguarda il programma installato.</p>';
    }

    const fase = statoUpdate.fase;
    if (fase === "pronto") {
      html += "<p><strong>Versione " + esc(statoUpdate.versione || "nuova") + " pronta.</strong> " + esc(statoUpdate.messaggio || "Si installa alla chiusura del programma.") + "</p>" +
        '<div class="status-actions"><button type="button" class="btn btn-soft btn-sm" data-update-install>Riavvia e aggiorna</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-status-close>Più tardi</button></div>';
    } else if (fase === "scaricamento") {
      html += "<p>Scaricamento in corso: <strong>" + (statoUpdate.percentuale || 0) + "%</strong>. Puoi continuare a usare il programma.</p>";
    } else if (fase === "disponibile") {
      html += "<p>Nuova versione " + esc(statoUpdate.versione || "") + " trovata: la scarico in sottofondo e la installo alla chiusura.</p>";
    } else if (fase === "verifica") {
      html += '<p class="muted">Controllo le nuove versioni…</p>';
    } else if (fase === "aggiornato") {
      html += "<p><span class=\"badge badge-green\">Aggiornato</span> Questa è la versione più recente.</p>" +
        '<div class="status-actions"><button type="button" class="btn btn-ghost btn-sm" data-update-check>Controlla adesso</button></div>';
    } else if (fase === "errore") {
      html += "<p><strong>Aggiornamento non riuscito.</strong> " + esc(statoUpdate.messaggio || "") + "</p>" +
        '<div class="status-actions"><button type="button" class="btn btn-soft btn-sm" data-update-check>Riprova</button>' +
        '<a class="btn btn-ghost btn-sm" href="https://github.com/danilodauria/psicologo-digitale/releases/latest" target="_blank" rel="noopener">Pagina dei download</a></div>';
    } else {
      html += '<p class="muted">' + esc(statoUpdate.messaggio || "Stato degli aggiornamenti non ancora letto.") + "</p>" +
        '<div class="status-actions"><button type="button" class="btn btn-soft btn-sm" data-update-check>Controlla adesso</button></div>';
    }

    html += '<p class="text-small muted mb-0">Il programma scarica la nuova versione dalle release GitHub e la installa da solo. Su Windows e Linux AppImage funziona senza intervento; su macOS serve un pacchetto firmato, altrimenti il download resta manuale.</p>' +
      '<div class="status-actions"><a class="btn btn-ghost btn-sm" href="#/versioni" data-status-close>Cosa è cambiato in ogni versione</a></div>';
    return html;
  }

  function contenutoModo() {
    const m = modo();
    const d = dispositivo();
    const telefono = !!(d && d.telefono);

    let html = "<h2 class=h-sub>Dove stai usando il programma</h2>" +
      "<p><strong>" + esc(m.titolo) + "</strong> · " + esc(m.dove) + "</p>" +
      "<p>" + esc(m.nota) + "</p>" +
      '<div class="status-actions"><a class="btn btn-ghost btn-sm" href="#/installa" data-status-close>Pagina Installa</a></div>' +
      "<h2 class=h-sub>Intelligenza artificiale sul dispositivo</h2>";

    if (telefono) {
      html += "<p>Su telefono e tablet non c'è un modello locale, e non serve: Neura legge i contenuti del programma e risponde senza inventare.</p>";
    } else if (!ultimaIa) {
      html += '<p class="muted">' + (inCorso ? "Sto controllando se Ollama risponde…" : "Stato di Ollama non ancora letto.") + "</p>";
    } else if (ultimaIa.ok && ultimaIa.modelli.length) {
      html += '<p><span class="badge badge-green">Ollama attivo</span> Modello in uso: <strong>' + esc(ultimaIa.modelli[0]) + "</strong>" +
        (ultimaIa.modelli.length > 1 ? " (e altri " + (ultimaIa.modelli.length - 1) + ")" : "") + ".</p>" +
        "<p>Risponde solo sul tuo computer: nessuna domanda esce da qui. Si usa nella pagina Installa per le domande libere; le risposte verificate restano quelle di Neura.</p>";
    } else if (ultimaIa.ok) {
      html += '<p><span class="badge">Ollama attivo</span> Non ci sono ancora modelli scaricati.</p>' +
        "<p>Copia il comando <code>ollama pull</code> dalla pagina Installa e riprova.</p>";
    } else {
      html += "<p><strong>Nessun modello locale trovato.</strong> Ollama non è installato oppure non è avviato. Non è un problema: Neura non dipende da lui e funziona lo stesso.</p>" +
        "<p>Se lo vuoi, è gratuito e si installa in pochi minuti: la pagina Installa riconosce il sistema e indica il pacchetto giusto.</p>";
    }

    html += '<div class="status-actions">' +
      '<button type="button" class="btn btn-soft btn-sm" data-ai-check>Controlla di nuovo</button>' +
      (telefono ? "" : '<a class="btn btn-ghost btn-sm" href="#/installa" data-status-close>Installare Ollama</a>') +
      "</div>";
    html += bloccoAggiornamenti();
    return html;
  }

  function contenutoMicrofono() {
    let html = "<h2 class=h-sub>Microfono</h2>";

    if (!statoMic.presente) {
      html += "<p><strong>Qui il microfono non è disponibile</strong> per l'app: succede con browser molto vecchi, con i permessi bloccati o su dispositivi senza microfono.</p>" +
        "<p>Non è un limite del programma: puoi scrivere le domande e Neura risponde lo stesso, e la voce in uscita continua a funzionare.</p>";
    } else if (statoMic.permesso === "granted") {
      html += '<p><span class="badge badge-green">Microfono pronto</span> Il permesso è già stato concesso a questo programma.</p>';
    } else if (statoMic.permesso === "denied") {
      html += '<p><span class="badge">Microfono bloccato</span> Il permesso è stato negato. Per riattivarlo: icona del lucchetto o del tondino accanto all\'indirizzo → <em>Microfono</em> → <em>Consenti</em>, poi ricarica. Nel programma installato si gestisce dalle impostazioni di sistema del computer.</p>';
    } else {
      html += '<p><span class="badge">Da attivare</span> Il microfono c\'è, ma il permesso non è ancora stato dato: la prima volta il browser — o il programma — chiede il consenso.</p>';
    }

    if (statoMic.presente) {
      html += "<p><strong>Come si usa.</strong></p><ul class=\"text-small\">" +
        "<li>Vai nella pagina <a href=\"#/neura\" data-status-close>Neura</a>: accanto alla casella della domanda c'è l'icona dell'onda.</li>" +
        "<li>Toccala e parla con calma; toccala di nuovo per fermare. La frase compare nella casella e parte da sola.</li>" +
        "<li>Alla prima richiesta rispondi <em>Consenti</em>: senza permesso la dettatura non parte.</li>" +
        "</ul>" +
        '<div class="status-actions"><button type="button" class="btn btn-soft btn-sm" data-mic-attiva>Attiva adesso il microfono</button></div>';
    }

    html += '<p class="text-small muted"><strong>Una cosa da sapere.</strong> La dettatura usa il riconoscimento vocale del browser: su Chrome ed Edge l\'audio può essere elaborato dai loro server, quindi non è detto che resti sul dispositivo. Se preferisci, scrivi. La voce di Neura in uscita, invece, è generata sul tuo computer.</p>';
    return html;
  }

  function contenutoAiuto() {
    const numeri = NUMERI.filter(function (n) {
      return ["112", "1522", "19696"].indexOf(n.numero) >= 0;
    });

    return "<h2 class=h-sub>Se hai bisogno di una persona, adesso</h2>" +
      "<p>Questa app non è un servizio di emergenza e nessuno la sta guardando. Se c'è un pericolo, una violenza o pensieri di farti del male, la priorità è una persona.</p>" +
      '<div class="status-numbers">' + numeri.map(function (n) {
        return '<a class="status-num" href="tel:' + esc(n.tel) + '"><b>' + esc(n.numero) + "</b><span>" + esc(n.nome) + "</span></a>";
      }).join("") + "</div>" +
      '<p class="text-small muted">Le chiamate sono gratuite e riservate. Il 112 risponde anche per le emergenze psicologiche.</p>' +
      '<div class="status-actions"><a class="btn btn-soft btn-sm" href="#/sicurezza" data-status-close>Numeri e cosa fare</a></div>';
  }

  function riempiPannello() {
    const panel = document.getElementById("statusPanel");
    if (!panel) return;
    const mappa = { modo: contenutoModo, microfono: contenutoMicrofono, aiuto: contenutoAiuto, sistema: contenutoSistema };
    const fn = mappa[aperto] || contenutoModo;
    panel.innerHTML = '<div class="wrap status-panel-inner">' + fn() + "</div>";
    collegaPannello();
  }

  function chiudiPannello() {
    const panel = document.getElementById("statusPanel");
    if (panel) { panel.hidden = true; panel.innerHTML = ""; }
    aperto = null;
    ["statusMode", "statusOs", "statusMic", "statusHelp"].forEach(function (id) {
      const b = document.getElementById(id);
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  function apriPannello(nome, bottone) {
    if (aperto === nome) { chiudiPannello(); return; }
    chiudiPannello();
    aperto = nome;
    riempiPannello();
    const panel = document.getElementById("statusPanel");
    if (panel) panel.hidden = false;
    if (bottone) bottone.setAttribute("aria-expanded", "true");
  }

  function collegaPannello() {
    const panel = document.getElementById("statusPanel");
    if (!panel) return;

    panel.querySelectorAll("[data-status-close]").forEach(function (a) {
      a.addEventListener("click", function () { chiudiPannello(); });
    });

    const check = panel.querySelector("[data-ai-check]");
    if (check) check.addEventListener("click", function () { controllaIa(); });

    const attiva = panel.querySelector("[data-mic-attiva]");
    if (attiva) attiva.addEventListener("click", function () {
      const nav = window.navigator || {};
      if (!nav.mediaDevices || typeof nav.mediaDevices.getUserMedia !== "function") return;
      attiva.disabled = true;
      nav.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) { /* niente */ }
        A.toast("Microfono autorizzato: ora puoi dettare nella pagina Neura.");
        aggiornaMicrofono();
      }).catch(function () {
        A.toast("Permesso negato: puoi riattivarlo dalle impostazioni del sito.");
        aggiornaMicrofono();
      }).then(function () { attiva.disabled = false; });
    });
  }

  /* Ollama ----------------------------------------------------------------- */

  function controllaIa() {
    const testo = document.getElementById("statusAiText");
    const dot = document.getElementById("statusAiDot");
    if (testo) testo.textContent = "IA locale: controllo…";
    if (dot) dot.setAttribute("data-state", "attesa");
    inCorso = true;

    if (aperto === "modo") riempiPannello();

    const amb = NP.ambiente;
    const richiesta = amb && typeof amb.tags === "function"
      ? amb.tags()
      : Promise.resolve({ ok: false, error: "controllo non disponibile" });

    richiesta.then(function (r) {
      const modelli = (r && r.ok && r.models ? r.models : []).map(function (m) { return m.name; }).filter(Boolean);
      ultimaIa = { ok: !!(r && r.ok), modelli: modelli, errore: r && r.error };
      inCorso = false;

      // Nel chip resta lo stato, non il nome del modello: il nome tecnico si
      // legge nel pannello, dove c'è spazio per dirlo per esteso.
      if (testo) testo.textContent = modelli.length ? "IA locale: pronta" : "IA locale: essenziale";
      if (dot) dot.setAttribute("data-state", modelli.length ? "ok" : "attesa");
      if (aperto === "modo") riempiPannello();
    }).catch(function () {
      inCorso = false;
      ultimaIa = { ok: false, modelli: [], errore: "errore" };
      if (testo) testo.textContent = "IA locale: essenziale";
      if (dot) dot.setAttribute("data-state", "attesa");
      if (aperto === "modo") riempiPannello();
    });
  }

  /* Costruzione ------------------------------------------------------------ */

  function costruisci() {
    if (document.getElementById("statusBar")) return;

    const bar = document.createElement("aside");
    bar.className = "status-bar no-print";
    bar.id = "statusBar";
    bar.setAttribute("aria-label", "Stato del programma");

    const m = modo();

    bar.innerHTML =
      '<div class="wrap status-inner">' +
        '<button type="button" class="status-chip" id="statusBack" title="Torna alla pagina precedente">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>' +
          "<span>Indietro</span></button>" +
        '<button type="button" class="status-chip" id="statusMode" aria-expanded="false" aria-controls="statusPanel" title="Dove gira il programma e quale IA è presente">' +
          '<span class="status-dot" id="statusModeDot" data-state="' + (m.id === "browser" ? "off" : "ok") + '" aria-hidden="true"></span>' +
          '<span id="statusModeText">' + esc(m.titolo) + "</span>" +
          '<span class="status-sep" aria-hidden="true">·</span>' +
          '<span class="status-dot status-dot-sm" id="statusAiDot" data-state="attesa" aria-hidden="true"></span>' +
          '<span id="statusAiText" class="status-ai">IA locale: controllo…</span></button>' +
        '<button type="button" class="status-chip status-os" id="statusOs" aria-expanded="false" aria-controls="statusPanel" title="Sistema operativo in uso">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/></svg>' +
          '<span id="statusOsText">' + esc(modo() && sistemaOperativo().nome) + "</span></button>" +
        '<button type="button" class="status-chip status-update" id="statusUpdate" hidden title="Aggiornamento del programma">' +
          '<span class="status-dot" id="statusUpdateDot" data-state="attesa" aria-hidden="true"></span>' +
          '<span id="statusUpdateText">Aggiornamento</span></button>' +
        '<button type="button" class="status-chip" id="statusMic" aria-expanded="false" aria-controls="statusPanel" title="Stato del microfono">' +
          '<span class="status-dot" id="statusMicDot" data-state="attesa" aria-hidden="true"></span>' +
          '<span id="statusMicText">Microfono: controllo…</span></button>' +
        '<button type="button" class="status-chip status-stop" id="statusStop" data-active="false" title="Ferma la voce o la dettatura">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/></svg>' +
          "<span>Ferma l'audio</span></button>" +
        '<button type="button" class="status-chip status-help" id="statusHelp" aria-expanded="false" aria-controls="statusPanel" title="Numeri utili, subito">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>' +
          "<span>Aiuto subito</span></button>" +
      "</div>" +
      '<div class="status-panel" id="statusPanel" hidden></div>';

    const header = document.getElementById("siteHeader");
    if (header && header.parentNode) header.parentNode.insertBefore(bar, header.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);

    const back = document.getElementById("statusBack");
    if (back) back.addEventListener("click", function () {
      if (window.history && typeof window.history.back === "function" && (location.hash && location.hash !== "#/" || window.history.length > 1)) {
        window.history.back();
        return;
      }
      A.go("");
    });

    const mode = document.getElementById("statusMode");
    if (mode) mode.addEventListener("click", function () { apriPannello("modo", mode); });

    const mic = document.getElementById("statusMic");
    if (mic) mic.addEventListener("click", function () {
      aggiornaMicrofono();
      apriPannello("microfono", mic);
    });

    const stop = document.getElementById("statusStop");
    if (stop) stop.addEventListener("click", fermaAudio);

    const os = document.getElementById("statusOs");
    if (os) os.addEventListener("click", function () { apriPannello("sistema", os); });

    const help = document.getElementById("statusHelp");
    if (help) help.addEventListener("click", function () { apriPannello("aiuto", help); });

    // Il pulsante compare solo quando c'è qualcosa da fare: se l'aggiornamento
    // è pronto installa subito, altrimenti apre il pannello che lo racconta.
    const upd = document.getElementById("statusUpdate");
    if (upd) upd.addEventListener("click", function () {
      if (statoUpdate.fase === "pronto") { installaAggiornamento(); return; }
      apriPannello("modo", mode);
    });

    const pannello = document.getElementById("statusPanel");
    if (pannello) pannello.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest("[data-update-check]")) { controllaAggiornamenti(); return; }
      if (e.target.closest("[data-update-install]")) installaAggiornamento();
    });

    document.addEventListener("click", function (e) {
      if (!aperto) return;
      if (e.target.closest && (e.target.closest("#statusBar") || e.target.closest(".status-panel"))) return;
      chiudiPannello();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") chiudiPannello();
    });

    window.addEventListener("hashchange", chiudiPannello);

    document.addEventListener("np:voce", notificaStato);

    const ponteUpd = ponteAggiornamenti();
    if (ponteUpd) {
      ponteUpd.stato().then(function (s) {
        if (s) statoUpdate = s;
        mostraStatoUpdate();
        if (aperto === "modo") riempiPannello();
      }).catch(function () { /* nessuno stato disponibile */ });
      if (typeof ponteUpd.on === "function") ponteUpd.on(function (s) {
        statoUpdate = s || statoUpdate;
        mostraStatoUpdate();
        if (aperto === "modo") riempiPannello();
        if (statoUpdate.fase === "pronto") A.toast("Aggiornamento pronto: si installa alla chiusura.");
        else if (statoUpdate.fase === "disponibile") A.toast("Nuova versione " + (statoUpdate.versione || "") + ": la scarico in sottofondo.");
      });
    }
    mostraStatoUpdate();

    aggiornaMicrofono();
    controllaIa();
    notificaStato();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", costruisci);
  } else {
    costruisci();
  }
})();
