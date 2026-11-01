/* ==========================================================================
   Psicologo Digitale · installa l'app e collega un modello locale
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const AI = NP.data.ai;
  const HOST = "http://127.0.0.1:11434";
  const SCARICA = "https://github.com/danilodauria/psicologo-digitale/releases/latest";
  const PACCHETTI = {
    windows: SCARICA + "/download/Psicologo-Digitale-Windows-x64.exe",
    linux: SCARICA + "/download/Psicologo-Digitale-Linux-amd64.deb",
    mac: SCARICA + "/download/Psicologo-Digitale-Mac-arm64.dmg",
    macIntel: SCARICA + "/download/Psicologo-Digitale-Mac-x64.dmg"
  };

  let promptEvent = null;
  if (window.addEventListener) {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      promptEvent = e;
    });
  }

  /* Rilevamento ------------------------------------------------------------ */

  function standalone() {
    try {
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.navigator.standalone === true) return true;
    } catch (e) { /* niente */ }
    return false;
  }

  function gpuName() {
    if (typeof window.WebGLRenderingContext === "undefined") return null;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (!ext) return null;
      const nome = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      return nome ? String(nome).replace(/\s+/g, " ").trim().slice(0, 70) : null;
    } catch (e) { return null; }
  }

  function detect() {
    const nav = window.navigator || {};
    const ua = String(nav.userAgent || "");
    const touchMac = /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
    let os = "altro";
    let sistema = "Sistema non riconosciuto";

    if (/Windows/i.test(ua)) { os = "windows"; sistema = "Windows"; }
    else if (/Android/i.test(ua)) { os = "android"; sistema = "Android"; }
    else if (/iPhone|iPad|iPod/i.test(ua) || touchMac) { os = "ios"; sistema = "iPhone o iPad"; }
    else if (/Mac OS X|Macintosh/i.test(ua)) { os = "mac"; sistema = "macOS"; }
    else if (/CrOS/.test(ua)) { os = "altro"; sistema = "ChromeOS"; }
    else if (/Linux|X11/i.test(ua)) { os = "linux"; sistema = "Linux"; }

    return {
      os: os,
      sistema: sistema,
      telefono: os === "android" || os === "ios",
      ram: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
      core: typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : null,
      gpu: gpuName()
    };
  }

  function pickModel(ram) {
    const lista = AI.modelli || [];
    if (!ram) return lista.filter(function (m) { return m.ramMin === 8; })[0] || lista[0];
    let scelto = lista[0];
    lista.forEach(function (m) { if (ram >= m.ramMin) scelto = m; });
    return scelto;
  }

  /* Appunti ---------------------------------------------------------------- */

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        document.body.appendChild(ta);
        ta.select();
        const fatto = document.execCommand && document.execCommand("copy");
        document.body.removeChild(ta);
        fatto ? resolve() : reject(new Error("copia non disponibile"));
      } catch (e) { reject(e); }
    });
  }

  function comando(text) {
    return '<div class="btn-row" style="align-items:stretch;gap:.4rem">' +
      '<code style="flex:1;min-width:0;overflow-x:auto;white-space:nowrap;background:var(--surface-2);padding:.55rem .7rem;border-radius:10px;font-size:.82rem">' + esc(text) + "</code>" +
      '<button type="button" class="btn btn-ghost btn-sm" data-copy="' + esc(text) + '">Copia</button></div>';
  }

  /* Ollama ----------------------------------------------------------------- */

  function ponte() {
    const d = window.npDesktop;
    return d && d.ollama && typeof d.ollama.tags === "function" ? d.ollama : null;
  }

  function tags() {
    const p = ponte();
    if (p) {
      return p.tags().catch(function (e) {
        return { ok: false, error: String((e && e.message) || e) };
      });
    }

    if (typeof fetch !== "function") {
      return Promise.resolve({ ok: false, error: "richieste non disponibili" });
    }

    let ctrl = null;
    try {
      ctrl = new AbortController();
      window.setTimeout(function () { ctrl.abort(); }, 4000);
    } catch (e) { /* browser senza AbortController */ }

    return fetch(HOST + "/api/tags", { signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        return {
          ok: true,
          models: ((data && data.models) || []).map(function (m) {
            return { name: String(m.name || m.model || "") };
          })
        };
      })
      .catch(function (e) {
        return { ok: false, error: String((e && e.message) || e) };
      });
  }

  function genera(payload) {
    const p = ponte();
    if (p && typeof p.generate === "function") {
      return p.generate(payload).catch(function (e) {
        return { ok: false, error: String((e && e.message) || e) };
      });
    }
    if (typeof fetch !== "function") {
      return Promise.resolve({ ok: false, error: "richieste non disponibili" });
    }
    return fetch(HOST + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        return { ok: true, response: String((data && data.response) || "") };
      })
      .catch(function (e) {
        return { ok: false, error: String((e && e.message) || e) };
      });
  }

  /* Vista ------------------------------------------------------------------ */

  views.installa = function () {
    const d = detect();
    const modello = pickModel(d.ram);
    const build = AI.build[d.os] || null;
    const gia = standalone();

    const ram = d.ram
      ? "circa " + d.ram + " GB" + (d.ram >= 8 ? " (il browser non dichiara più di 8)" : "")
      : "non dichiarata dal browser";

    A.setTitle("Installa l'app");

    const hardware = [
      { k: "Sistema", v: d.sistema + (d.telefono ? " · telefono o tablet" : "") },
      { k: "Memoria", v: ram },
      { k: "Processore", v: d.core ? d.core + " core logici" : "non dichiarato" },
      { k: "Scheda grafica", v: d.gpu || "non leggibile dal browser" }
    ].map(function (r) {
      return '<div style="display:flex;justify-content:space-between;gap:1rem;padding:.45rem 0;border-bottom:1px solid var(--line)">' +
        '<span class="text-small muted">' + esc(r.k) + '</span><span class="text-small" style="text-align:right">' + esc(r.v) + "</span></div>";
    }).join("");

    const connessione = d.telefono
      ? '<div class="callout info"><p><strong>Da qui Ollama non si installa.</strong> Su telefono e tablet l\'app funziona benissimo da sola: un modello locale ha bisogno di un computer. Se ne hai uno, apri questa pagina lì e troverai la versione giusta.</p></div>'
      : build
        ? '<div class="card"><h3>La versione per il tuo sistema</h3>' +
            '<p>Per <strong>' + esc(build.sistema) + "</strong> ti serve questo:</p>" +
            '<div class="btn-row mt-1"><a class="btn btn-primary" href="' + build.url + '" target="_blank" rel="noopener">' + A.icon("download") + esc(build.scarica) + "</a>" +
            '<a class="btn btn-ghost" href="https://ollama.com/library" target="_blank" rel="noopener">Catalogo dei modelli</a></div>' +
            '<p class="text-small muted mt-2">' + esc(build.nota) + "</p></div>"
        : '<div class="callout warn"><p><strong>Non riesco a riconoscere il sistema.</strong> Apri la pagina di Ollama e scegli la versione che corrisponde al tuo computer: è la stessa che avresti scaricato da qui.</p>' +
          '<div class="btn-row mt-1"><a class="btn btn-soft" href="https://ollama.com/download" target="_blank" rel="noopener">Pagina dei download</a></div></div>';

    A.page(
      '<div class="page-head"><p class="eyebrow">Installa</p><h1>Portala con te, anche senza rete</h1>' +
        '<p class="lead">Non c\'è un negozio di applicazioni e non serve: questa è una PWA, si installa dal browser in dieci secondi. Poi resta sul dispositivo, apre a schermo intero e funziona pure in aereo. Se preferisci un programma vero e proprio, ci sono anche i pacchetti per Windows, Linux e macOS.</p>' +
        (gia ? '<p class="badge badge-green mt-1">Stai già usando la versione installata</p>' : "") +
      "</div>" +

      '<div class="grid grid-2">' +
        '<div class="card"><h3>Su telefono e tablet</h3>' +
          "<p><strong>Android (Chrome):</strong> menu ⋮ in alto a destra, poi <em>Installa app</em> (su alcuni telefoni <em>Aggiungi alla schermata Home</em>).</p>" +
          "<p><strong>iPhone e iPad (Safari):</strong> tocca <em>Condividi</em>, scorri e scegli <em>Aggiungi alla schermata Home</em>. Da lì si apre come un'app, senza barra degli indirizzi.</p>" +
          '<p class="text-small muted">Se il menu non mostra l\'opzione, aggiorna il browser: l\'installazione richiede Chrome, Edge, Samsung Internet o Safari recenti.</p>' +
        "</div>" +
        '<div class="card"><h3>Su computer</h3>' +
          "<p><strong>Chrome e Edge:</strong> l\'icona di installazione compare a destra nella barra degli indirizzi (un monitor con la freccia). In alternativa, menu ⋮ → <em>App</em> → <em>Installa questo sito come app</em>.</p>" +
          "<p><strong>Safari su Mac:</strong> menu <em>File</em> → <em>Aggiungi al Dock</em>.</p>" +
          '<p class="text-small muted">Sul desktop l\'app si apre in una finestra sua e resta disponibile nel menu avvio, come qualsiasi altro programma.</p>' +
          (promptEvent ? '<div class="btn-row mt-2"><button type="button" class="btn btn-primary btn-sm" id="installBtn">' + A.icon("download") + "Installa adesso</button></div>" : "") +
        "</div>" +
      "</div>" +

      '<div class="card mt-2"><h3>Che cosa cambia davvero</h3>' +
        '<ul class="list-check">' +
          "<li>La prima apertura salva l'app nella memoria del browser: le volte successive partono senza connessione.</li>" +
          "<li>Risposte, questionari, diario e relazione restano su quel dispositivo. Non c'è un account da ricordare.</li>" +
          "<li>Se cancelli i dati del browser o disinstalli, i contenuti salvati spariscono: esporta un backup dalla sezione Licenze.</li>" +
          "<li>Gli aggiornamenti arrivano da soli alla riapertura, quando il dispositivo è in rete.</li>" +
        "</ul></div>" +

      '<div class="card mt-2"><h3>I programmi installabili</h3>' +
        '<p>Oltre alla PWA ci sono i pacchetti desktop, costruiti dalla stessa base: finestra propria, icona nel menu avvio e nessun browser di mezzo.</p>' +
        '<ul class="text-small">' +
          "<li><strong>Windows</strong> — installatore <code>.exe</code> per processori x64, con cartella a scelta e collegamento sul desktop; c'è anche la versione portatile in ZIP.</li>" +
          "<li><strong>Linux</strong> — pacchetto <code>.deb</code> per Debian, Ubuntu e derivate, oppure <code>.AppImage</code> da rendere eseguibile senza installare nulla.</li>" +
          "<li><strong>macOS</strong> — <code>.dmg</code> per Intel e per Apple Silicon.</li>" +
        "</ul>" +
        '<div class="btn-row mt-1">' +
          '<a class="btn btn-soft btn-sm" href="' + PACCHETTI.windows + '">' + A.icon("download") + "Windows .exe</a>" +
          '<a class="btn btn-soft btn-sm" href="' + PACCHETTI.linux + '">' + A.icon("download") + "Linux .deb</a>" +
          '<a class="btn btn-soft btn-sm" href="' + PACCHETTI.mac + '">' + A.icon("download") + "macOS Apple Silicon</a>" +
          '<a class="btn btn-ghost btn-sm" href="' + PACCHETTI.macIntel + '">macOS Intel</a>' +
        "</div>" +
        '<div class="btn-row mt-1"><a class="btn btn-ghost btn-sm" href="' + SCARICA + '" target="_blank" rel="noopener">Tutti i file della versione</a>' +
          '<a class="btn btn-ghost btn-sm" href="https://github.com/danilodauria/psicologo-digitale#programmi-installabili" target="_blank" rel="noopener">Come si installano</a></div>' +
        '<p class="text-small muted mt-2">I pacchetti non hanno un certificato commerciale, quindi il sistema chiede conferma una volta sola. Non è un errore e non serve rinunciare: basta consentire l\'avvio.</p>' +
        '<ul class="text-small muted">' +
          "<li><strong>Windows</strong> — se compare <em>Windows ha protetto il PC</em>: <em>Altro informazioni</em> → <em>Esegui comunque</em>. Se il file resta bloccato, tasto destro → <em>Proprietà</em> → <em>Sblocca</em> → <em>OK</em>.</li>" +
          "<li><strong>macOS</strong> — doppio clic sull'app, <em>Fine</em>, poi <em>Impostazioni di Sistema</em> → <em>Privacy e sicurezza</em> → <em>Apri comunque</em> (da macOS 15 il menu contestuale non basta più).</li>" +
          "<li><strong>Linux</strong> — <code>.deb</code>: doppio clic e installa; <code>.AppImage</code>: <code>chmod +x</code> oppure <em>Proprietà</em> → <em>Consenti l'esecuzione</em>.</li>" +
        "</ul>" +
        '<p class="text-small muted">Nella pagina della versione trovi <code>SHA256SUMS.txt</code>: se l\'impronta del file scaricato coincide, il programma è esattamente quello pubblicato.</p></div>' +

      '<div class="section-head mt-3"><p class="eyebrow">Facoltativo</p><h2>Un modello locale, se ti va</h2>' +
        '<p>Neura non ha bisogno di nulla: è un motore di conoscenza che legge i contenuti del programma e non inventa. Se però ti interessa un modello generativo che gira sul tuo computer, si chiama <strong>Ollama</strong>: gratuito, open source, senza account.</p></div>' +

      '<div class="callout info"><p>' + esc(AI.introduzione) + "</p></div>" +

      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><h3>Il tuo dispositivo, come lo vede il browser</h3>' + hardware +
          '<p class="text-small muted mt-2">Il browser non può leggere tutto: la memoria è dichiarata solo da Chrome ed Edge e si ferma a 8 GB. Se il tuo computer ne ha 16 o 32, consideralo un margine in più.</p></div>' +
        '<div class="card"><h3>Il modello che ti consiglio</h3>' +
          "<p><strong>" + esc(modello.nome) + '</strong> · ' + esc(modello.peso) +
            ' <span class="badge badge-green" id="modelloBadge" hidden>Installato</span></p>' +
          "<p>" + esc(modello.uso) + "</p>" +
          '<div class="btn-row mt-1"><span class="chip chip-static">Almeno ' + modello.ramMin + " GB di memoria</span></div>" +
          '<p class="text-small muted mt-2">Per sapere quanta memoria hai davvero: su Windows <em>Impostazioni → Sistema → Informazioni</em>; su macOS menu  → <em>Informazioni su questo Mac</em>; su Linux <code>free -h</code>.</p>' +
        "</div>" +
      "</div>" +

      connessione +

      '<div class="card mt-2"><h3>Quattro passi</h3><ol class="number-list">' +
        AI.passi.map(function (p) { return "<li><strong>" + esc(p.t) + ".</strong> " + esc(p.d) + "</li>"; }).join("") +
      "</ol></div>" +

      '<div class="card mt-2"><h3>I comandi, pronti da copiare</h3>' +
        '<p class="text-small muted">Scarica il modello consigliato e avvialo. Su Windows usa il Prompt dei comandi o PowerShell.</p>' +
        "<p class=\"text-small\"><strong>1. Scarica</strong></p>" + comando("ollama pull " + modello.id) +
        "<p class=\"text-small mt-2\"><strong>2. Prova</strong></p>" + comando("ollama run " + modello.id) +
        '<p class="text-small muted mt-2">Se il computer è lento, chiudi tutto il resto o scegli un modello più piccolo. Se Ollama non parte affatto, la causa più comune è un processore senza istruzioni AVX: in quel caso resta la guida interna, che è già qui.</p>' +
      "</div>" +

      '<div class="card mt-2"><h3>Prova il collegamento</h3>' +
        '<p class="text-small">Se Ollama è installato e in esecuzione, questa pagina può parlarci direttamente: il browser contatta solo il tuo computer, sulla porta 11434. Nessun dato esce da qui.</p>' +
        '<div id="ollamaStato" class="text-small mb-1"><span class="muted">Controllo Ollama su questo computer…</span></div>' +
        '<div class="btn-row mt-1"><button type="button" class="btn btn-soft btn-sm" id="ollamaCheck">Verifica il collegamento</button></div>' +
        '<div id="ollamaOut" class="mt-2"></div>' +
      "</div>" +

      '<div class="card mt-2"><h3>Una domanda al modello locale</h3>' +
        '<p class="text-small">Serve un collegamento attivo. Il modello è generico: non conosce il manuale e può sbagliare. Le risposte verificate restano quelle di Neura.</p>' +
        '<form id="ollamaForm" class="mt-1">' +
          '<div class="form-field"><label class="field-label" for="ollamaModel">Modello</label>' +
            '<input class="input" id="ollamaModel" value="' + esc(modello.id) + '" list="ollamaModelli" autocomplete="off">' +
            '<datalist id="ollamaModelli"></datalist></div>' +
          '<div class="form-field"><label class="field-label" for="ollamaQuestion">La tua domanda</label>' +
            '<textarea class="textarea" id="ollamaQuestion" maxlength="600" placeholder="Per esempio: aiutami a scrivere in modo più chiaro cosa provo prima di un esame."></textarea></div>' +
          '<button type="submit" class="btn btn-primary btn-sm">Chiedi al modello</button>' +
        "</form>" +
        '<div id="ollamaAnswer" class="mt-2"></div>' +
      "</div>" +

      '<div class="callout warn mt-3"><p><strong>Da tenere a mente.</strong></p><ul class="text-small">' +
        AI.avvertenze.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") +
      "</ul></div>" +

      '<div class="card mt-2"><h3>Riferimenti</h3><div class="pill-row">' +
        AI.fonti.map(function (f) { return '<a class="chip" href="' + f.u + '" target="_blank" rel="noopener">' + esc(f.t) + "</a>"; }).join("") +
      "</div></div>"
    );

    /* Eventi --------------------------------------------------------------- */

    const installBtn = document.getElementById("installBtn");
    if (installBtn) installBtn.addEventListener("click", function () {
      if (!promptEvent) return;
      promptEvent.prompt();
      promptEvent = null;
      installBtn.disabled = true;
      A.toast("Segui la richiesta del browser per completare l'installazione.");
    });

    document.querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copyText(btn.getAttribute("data-copy")).then(function () {
          A.toast("Comando copiato.");
        }).catch(function () {
          A.toast("Copia non disponibile: seleziona il testo a mano.");
        });
      });
    });

    const check = document.getElementById("ollamaCheck");
    if (check) check.addEventListener("click", function () { verifica(check); });

    const form = document.getElementById("ollamaForm");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      chiediAlModello();
    });

    aggiornaStato(modello.id);
  };

  /* Stato dei modelli ------------------------------------------------------ */

  function aggiornaStato(consigliato) {
    const stato = document.getElementById("ollamaStato");
    if (!stato) return;

    stato.innerHTML = '<span class="muted">Controllo Ollama su questo computer…</span>';

    tags().then(function (r) {
      const badge = document.getElementById("modelloBadge");
      const input = document.getElementById("ollamaModel");
      const lista = document.getElementById("ollamaModelli");

      if (!r || !r.ok) {
        stato.innerHTML = '<span class="muted">Ollama non risponde' + (r && r.error ? " (" + esc(r.error) + ")" : "") + ": puoi installarlo qui sopra, oppure usare Neura senza.</span>";
        return;
      }

      const nomi = (r.models || []).map(function (m) { return m.name; }).filter(Boolean);
      if (!nomi.length) {
        stato.innerHTML = '<span class="muted">Ollama è in esecuzione ma non ha ancora modelli: copia il comando <code>ollama pull</code> e riprova.</span>';
        return;
      }

      const base = String(consigliato || "").split(":")[0];
      const stessoFamiglia = nomi.filter(function (n) { return n.split(":")[0] === base; });
      const scelto = nomi.filter(function (n) { return n === consigliato; })[0] || stessoFamiglia[0] || nomi[0];

      if (badge) {
        const installato = !!stessoFamiglia.length;
        badge.hidden = !installato;
        badge.textContent = installato ? "Installato sul tuo computer" : "";
      }
      if (input) input.value = scelto;
      if (lista) {
        lista.innerHTML = nomi.map(function (n) {
          return '<option value="' + esc(n) + '"></option>';
        }).join("");
      }

      const altri = nomi.filter(function (n) { return n !== scelto; });
      stato.innerHTML = '<span class="badge badge-green">Ollama attivo</span> ' +
        "Modello installato: <strong>" + esc(scelto) + "</strong>" +
        (altri.length ? ' <span class="muted">· altri presenti: ' + esc(altri.join(", ")) + "</span>" : "") +
        ' <span class="muted">— è quello che userai qui sotto.</span>';
    });
  }

  /* Collegamento ----------------------------------------------------------- */

  function verifica(btn) {
    const out = document.getElementById("ollamaOut");
    if (!out) return;
    out.innerHTML = '<p class="text-small muted">Sto provando a contattare Ollama su questo computer…</p>';
    btn.disabled = true;

    tags().then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "irraggiungibile");
      const modelli = r.models || [];
      out.innerHTML = modelli.length
        ? '<div class="callout info"><p><strong>Ollama risponde.</strong> Modelli già presenti su questo computer:</p><ul class="text-small">' +
            modelli.map(function (m) { return "<li><code>" + esc(m.name || "modello") + "</code></li>"; }).join("") +
          "</ul><p class=\"text-small muted mb-0\">Il modello installato è già selezionato nel campo qui sotto.</p></div>"
        : '<div class="callout info"><p><strong>Ollama risponde, ma non ha ancora modelli.</strong> Copia il comando <code>ollama pull</code> qui sopra e riprova.</p></div>';
    }).catch(function () {
      const d = detect();
      const c = AI.comandi[d.os];
      out.innerHTML = '<div class="callout warn"><p><strong>Non riesco a raggiungerlo.</strong> Le cause più comuni sono tre:</p>' +
        "<ol class=\"text-small\"><li>Ollama non è avviato: aprilo e lascialo in esecuzione.</li>" +
        "<li>Il browser blocca la richiesta per sicurezza, perché la pagina e il programma sono su indirizzi diversi.</li>" +
        "<li>Un antivirus o un firewall chiude la porta locale.</li></ol>" +
        (c ? "<p class=\"text-small\">Per il secondo caso, autorizza l'origine di questa pagina una volta sola, poi riavvia Ollama:</p>" + comando(c) : "") +
        '<p class="text-small muted mb-0">Non è un errore dell\'app: senza permesso il browser non può leggere la risposta di un altro programma. Nella versione desktop per Windows, Linux e macOS il collegamento passa dal programma e non ha bisogno di permessi.</p></div>';
    }).then(function () {
      btn.disabled = false;
    });
  }

  function chiediAlModello() {
    const out = document.getElementById("ollamaAnswer");
    const domanda = (document.getElementById("ollamaQuestion").value || "").trim();
    const modello = (document.getElementById("ollamaModel").value || "").trim();
    if (!out) return;
    if (!domanda) { A.toast("Scrivi prima una domanda."); return; }
    if (!modello) { A.toast("Indica il nome del modello."); return; }

    out.innerHTML = '<p class="text-small muted">Sto aspettando la risposta dal tuo computer. Su un portatile può volerci un minuto…</p>';

    genera({
      model: modello,
      prompt: domanda,
      stream: false,
      system: "Rispondi in italiano semplice, in non più di 150 parole. Non fare diagnosi, non consigliare farmaci, dosi o diete, non sostituire un professionista. Se emergono segnali di rischio (idee di suicidio, violenza, disturbi alimentari gravi) invita a contattare subito il 112 o un professionista."
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "errore");
      const testo = String(r.response || "").trim();
      out.innerHTML = testo
        ? '<div class="callout info"><p>' + esc(testo) + '</p><p class="text-small muted mb-0">Risposta di un modello locale, non verificata: non è un parere clinico. Per i contenuti del programma chiedi a Neura.</p></div>'
        : '<div class="callout warn"><p>Il modello ha risposto a vuoto. Prova a riformulare, o controlla di aver scaricato il modello indicato.</p></div>';
    }).catch(function () {
      out.innerHTML = '<div class="callout warn"><p>Non sono riuscito a ottenere la risposta. Verifica che Ollama sia avviato e che il modello <code>' + esc(modello) + "</code> sia stato scaricato, poi riprova.</p>" +
        '<p class="text-small muted mb-0">Se il problema è il permesso del browser, usa il pulsante «Verifica il collegamento» qui sopra: trovi il comando da copiare.</p></div>';
    });
  }

  /* API condivisa ----------------------------------------------------------- */

  // La barra di stato in alto riusa gli stessi controlli invece di duplicarli.
  NP.ambiente = { detect: detect, standalone: standalone, tags: tags, genera: genera };
})();
