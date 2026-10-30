/* ==========================================================================
   Psicologo Digitale · relazione per il professionista + generatore PDF
   Licenza del codice: MIT · Danilo D'Auria
   --------------------------------------------------------------------------
   Il PDF è costruito sul dispositivo, senza librerie: PDF 1.4, font standard
   Helvetica/Helvetica-Bold, codifica WinAnsi. Nessun dato lascia il browser.
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;
  const state = A.state;

  /* ------------------------------------------------------------ Dati relazione */

  function docId() {
    const d = new Date();
    const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    let h = 0;
    const src = JSON.stringify(state.intake.answers || {}) + String(state.intake.completedAt || "");
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) % 9973;
    return "PD-" + stamp + "-" + String(h).padStart(4, "0");
  }

  function ageLabel(v) {
    const map = {
      minorenne: "Meno di 18 anni", "18-24": "18-24 anni", "25-34": "25-34 anni", "35-44": "35-44 anni",
      "45-54": "45-54 anni", "55-64": "55-64 anni", "65+": "65 anni o più"
    };
    return map[v] || "non indicata";
  }

  function perChiLabel(v) {
    return { me: "Per sé", familiare: "Per un familiare o una persona cara", aiutare: "Per capire come aiutare qualcuno" }[v] || "non indicato";
  }

  function durataLabel(v) {
    return {
      "2sett": "meno di due settimane", "4sett": "due-quattro settimane", mesi6: "uno-sei mesi",
      anno: "sei-dodici mesi", oltre: "più di un anno", fasi: "andamento a fasi"
    }[v] || "non indicata";
  }

  function urgenzaLabel(v) {
    return { calma: "può attendere qualche settimana", presto: "entro pochi giorni", subito: "il prima possibile" }[v] || "non indicata";
  }

  function disponibilitaLabel(v) {
    return { settimanale: "un incontro a settimana", bisettimanale: "ogni due settimane", online: "preferenza online", nonso: "non definita" }[v] || "non indicata";
  }

  function collect() {
    const a = state.intake.answers || {};
    const p = A.buildProfile();
    const scales = Object.keys(state.scales).map(function (id) {
      const s = A.getScale(id);
      const rec = state.scales[id];
      if (!s || !rec || !rec.doneAt) return null;
      const band = A.scaleBand(s, rec.score);
      return { scale: s, rec: rec, band: band, pct: A.scalePercent(s, rec.score) };
    }).filter(Boolean);

    const diary = (state.diary || []).slice().sort(function (x, y) { return (y.date || "").localeCompare(x.date || ""); }).slice(0, 10);
    const thoughts = A.readJSON("thoughts", []).slice(-5);

    return { a: a, p: p, scales: scales, diary: diary, thoughts: thoughts, flags: p.sicurezza };
  }

  function clinicoQuestions(d) {
    const q = [];
    const a = d.a;
    if (d.flags.length) q.push("Approfondire subito la valutazione del rischio e la rete di supporto.");
    if (a.durata && a.durata !== "2sett") q.push("Verificare criteri di durata e impatto funzionale per l'area principale.");
    if (a.salute && Array.isArray(a.salute) && a.salute.indexOf("nessuna") < 0) q.push("Considerare la valutazione medica delle condizioni segnalate prima di attribuire tutto al quadro psicologico.");
    if (a.farmaci === "psiche") q.push("Chiarire la terapia farmacologica in corso e il coordinamento con lo psichiatra.");
    if (a.terapia === "corso") q.push("Chiarire il percorso in corso e il motivo della consulenza aggiuntiva.");
    if (a.sostanzeFrequenza === "giorno" || a.sostanzeFrequenza === "settimana") q.push("Valutare il ruolo di alcol o sostanze nel quadro e l'eventuale invio ai servizi specialistici.");
    if (a.sic_violenza === "si") q.push("Valutare sicurezza, rete di protezione e contatto con i servizi antiviolenza.");
    if (Array.isArray(a.cor_comportamenti) && a.cor_comportamenti.some(function (v) { return v !== "nessuno"; })) q.push("Approfondire il rapporto con cibo e corpo; considerare una valutazione specialistica dei disturbi alimentari.");
    if (a.sic_pensieri && a.sic_pensieri !== "no") q.push("Esplorare ideazione suicidaria, intento, piano, mezzi e fattori protettivi.");
    if (a.eta === "minorenne") q.push("Coinvolgere un adulto responsabile e verificare il consenso e la cornice di tutela del minore.");
    if (a.perChi && a.perChi !== "me") q.push("Le informazioni sono indirette: raccogliere il racconto della persona direttamente coinvolta, con il suo consenso.");
    q.push("Definire obiettivi misurabili e una verifica condivisa a 4-6 settimane.");
    return q.slice(0, 8);
  }

  function labelsFor(qid, values) {
    const q = (NP.data.intake || []).filter(function (x) { return x.id === qid; })[0];
    if (!q || !q.opzioni) return values.join(", ");
    return values.map(function (v) {
      const o = q.opzioni.filter(function (x) { return x.v === v; })[0];
      return o ? o.label.toLowerCase() : v;
    }).join(", ");
  }

  function sections(d) {
    const out = [];
    const a = d.a;
    const p = d.p;

    out.push({ type: "kv", rows: [
      ["Nome o pseudonimo", a.nome || "non indicato"],
      ["Fascia d'età", ageLabel(a.eta)],
      ["Percorso richiesto", perChiLabel(a.perChi)],
      ["Colloquio completato il", state.intake.completedAt ? A.fmtDateTime(state.intake.completedAt) : "non completato"],
      ["Durata del quadro", durataLabel(a.durata)],
      ["Impatto dichiarato", p.impatto != null ? p.impatto + "/10" : "non indicato"],
      ["Urgenza percepita", urgenzaLabel(a.urgenza)],
      ["Disponibilità", disponibilitaLabel(a.disponibilita)]
    ] });

    out.push({ type: "h", text: "1. Motivo e aree emerse" });
    if (p.aree.length) {
      out.push({ type: "table", head: ["Area", "Intensità percepita", "Lettura"], rows: p.aree.map(function (x) {
        return [x.label, x.score.toFixed(1) + "/10", x.label2];
      }) });
      out.push({ type: "p", text: A.profileSummary(p) });
    } else {
      out.push({ type: "p", text: "Il colloquio non è completo: non sono disponibili aree valutabili." });
    }
    if (a.altro_descr) out.push({ type: "p", text: "Nota libera della persona: «" + a.altro_descr + "»" });

    out.push({ type: "h", text: "2. Storia e contesto" });
    out.push({ type: "kv", rows: [
      ["Percorsi psicologici", { no: "nessuno", concluso: "concluso", corso: "in corso", interrotto: "interrotto" }[a.terapia] || "non indicato"],
      ["Farmaci", { no: "nessuno", psiche: "per umore, ansia o sonno", altro: "per altre condizioni", passo: "non dichiarati" }[a.farmaci] || "non indicato"],
      ["Salute", Array.isArray(a.salute) && a.salute.length ? a.salute.filter(function (x) { return x !== "nessuna"; }).join(", ") || "nessuna condizioni segnalata" : "non indicata"],
      ["Alcol o sostanze", { mai: "mai", occasionale: "occasionalmente", settimana: "più volte a settimana", giorno: "quasi ogni giorno" }[a.sostanzeFrequenza] || "non indicato"],
      ["Eventi ultimi 12 mesi", Array.isArray(a.eventi) && a.eventi.length ? a.eventi.filter(function (x) { return x !== "nessuno"; }).join(", ") || "nessuno" : "non indicati"],
      ["Familiarità", { no: "negata", si: "riferita", nonso: "non nota" }[a.famiglia] || "non indicata"],
      ["Infanzia", { serena: "serena", alti: "alti e bassi", difficile: "difficile", passo: "non dichiarata" }[a.infanzia] || "non indicata"]
    ] });

    out.push({ type: "h", text: "3. Ambiti e comportamenti riferiti" });
    const ambiti = [];
    if (Array.isArray(a.an_manifestazioni) && a.an_manifestazioni.length) ambiti.push("Ansia: " + labelsFor("an_manifestazioni", a.an_manifestazioni));
    if (Array.isArray(a.an_evitamento) && a.an_evitamento.indexOf("nulla") < 0 && a.an_evitamento.length) ambiti.push("Evitamento: " + labelsFor("an_evitamento", a.an_evitamento));
    if (Array.isArray(a.so_tipo) && a.so_tipo.length) ambiti.push("Sonno: " + labelsFor("so_tipo", a.so_tipo));
    if (Array.isArray(a.cor_comportamenti) && a.cor_comportamenti.indexOf("nessuno") < 0 && a.cor_comportamenti.length) ambiti.push("Cibo e corpo: " + labelsFor("cor_comportamenti", a.cor_comportamenti));
    if (Array.isArray(a.dip_sostanze) && a.dip_sostanze.indexOf("nessuna") < 0 && a.dip_sostanze.length) ambiti.push("Sostanze o comportamenti: " + labelsFor("dip_sostanze", a.dip_sostanze));
    if (Array.isArray(a.tra_sintomi) && a.tra_sintomi.indexOf("nessuno") < 0 && a.tra_sintomi.length) ambiti.push("Dopo l'evento: " + labelsFor("tra_sintomi", a.tra_sintomi));
    if (ambiti.length) out.push({ type: "ul", items: ambiti });
    else out.push({ type: "p", text: "Nessun comportamento specifico segnalato nelle aree esplorate." });

    out.push({ type: "h", text: "4. Funzionamento attuale" });
    out.push({ type: "table", head: ["Dimensione", "Valore (0-10)", "Nota"], rows: [
      ["Energia", a.fn_energia != null ? a.fn_energia : "—", "0 nessuna, 10 buona"],
      ["Qualità del sonno", a.fn_sonnoQ != null ? a.fn_sonnoQ : "—", "0 pessima, 10 ottima"],
      ["Concentrazione", a.fn_concentrazione != null ? a.fn_concentrazione : "—", "0 per niente, 10 come sempre"],
      ["Supporto percepito", a.fn_relazioni != null ? a.fn_relazioni : "—", "0 per niente, 10 molto"],
      ["Attività quotidiane", a.fn_giornata != null ? a.fn_giornata : "—", "0 grande fatica, 10 senza problemi"]
    ] });

    out.push({ type: "h", text: "5. Questionari di autovalutazione" });
    if (d.scales.length) {
      out.push({ type: "table", head: ["Strumento", "Punteggio", "Fascia", "Compilato"], rows: d.scales.map(function (x) {
        return [x.scale.titolo + " (" + x.scale.sigla + ")", x.rec.score + "/" + A.scaleMax(x.scale) + " · " + x.pct + "%", x.band.label, A.fmtDate(x.rec.doneAt)];
      }) });
      d.scales.forEach(function (x) {
        out.push({ type: "p", text: x.scale.titolo + " — " + x.band.testo });
      });
    } else {
      out.push({ type: "p", text: "Nessun questionario completato." });
    }

    out.push({ type: "h", text: "6. Sicurezza" });
    if (d.flags.length) {
      d.flags.forEach(function (f) { out.push({ type: "flag", text: "[" + f.level.toUpperCase() + "] " + f.testo }); });
    } else {
      out.push({ type: "p", text: "Non sono emersi segnali di rischio acuto nelle domande dirette del colloquio. La valutazione clinica del rischio resta necessaria." });
    }

    out.push({ type: "h", text: "7. Obiettivi e aspettative" });
    out.push({ type: "kv", rows: [
      ["Obiettivo dichiarato", p.obiettivi || "non indicato"],
      ["Tipo di aiuto cercato", { capire: "capire meglio", stare: "stare meglio con strumenti concreti", terapia: "decidere se iniziare una psicoterapia", preparare: "prepararsi a un colloquio", altro: "altro" }[a.aspettative] || "non indicato"],
      ["Rete di supporto", Array.isArray(a.rete) && a.rete.length ? a.rete.map(function (x) { return x === "nessuno" ? "nessuno" : x; }).join(", ") : "non indicata"],
      ["Risorse personali", Array.isArray(a.forze) && a.forze.length ? a.forze.join(", ") : "non indicate"]
    ] });

    if (d.diary.length) {
      out.push({ type: "h", text: "8. Diario recente" });
      out.push({ type: "table", head: ["Data", "Umore", "Ansia", "Sonno", "Nota"], rows: d.diary.map(function (e) {
        return [e.date || "—", e.mood + "/10", e.anxiety + "/10", e.sleep + " h", (e.note || "").slice(0, 80)];
      }) });
    }

    if (d.thoughts.length) {
      out.push({ type: "h", text: (d.diary.length ? "9" : "8") + ". Schede del pensiero recenti" });
      d.thoughts.forEach(function (t) {
        out.push({ type: "p", text: "Situazione: " + (t.situation || "—") + " · Pensiero: «" + (t.thought || "—") + "» · Emozione: " + (t.emotion || "—") + " (" + t.intensity + "/10). Alternativa: " + (t.alternative || "non formulata") + "." });
      });
    }

    out.push({ type: "h", text: (d.diary.length ? "10" : d.thoughts.length ? "9" : "8") + ". Domande suggerite per il clinico" });
    out.push({ type: "ul", items: clinicoQuestions(d) });

    if (state.reportNotes.note) {
      out.push({ type: "h", text: "Note della persona" });
      out.push({ type: "p", text: state.reportNotes.note });
    }
    if (state.reportNotes.clinician) {
      out.push({ type: "h", text: "Spazio per il professionista" });
      out.push({ type: "p", text: state.reportNotes.clinician });
    }

    return out;
  }

  /* ---------------------------------------------------------------- Vista HTML */

  let editing = false;

  function renderHTML(sectionsData, d) {
    return sectionsData.map(function (s) {
      if (s.type === "h") return "<h2>" + esc(s.text) + "</h2>";
      if (s.type === "p") return "<p>" + esc(s.text) + "</p>";
      if (s.type === "ul") return "<ul>" + s.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
      if (s.type === "flag") return '<div class="flag"><b>Segnale da valutare.</b> ' + esc(s.text) + "</div>";
      if (s.type === "kv") return '<dl class="kv">' + s.rows.map(function (r) {
        return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
      }).join("") + "</dl>";
      if (s.type === "table") return '<div class="table-wrap" style="margin:.6rem 0"><table><thead><tr>' +
        s.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        s.rows.map(function (r) {
          return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table></div>";
      return "";
    }).join("");
  }

  views.relazione = function () {
    const d = collect();
    const hasData = Object.keys(state.intake.answers || {}).length > 0 || d.scales.length > 0;
    if (!hasData) {
      A.setTitle("Relazione");
      A.page(
        '<div class="page-head"><p class="eyebrow">Relazione</p><h1>Un documento da consegnare</h1>' +
          '<p class="lead">La relazione raccoglie colloquio, punteggi, diario e domande per il professionista. Per generarla serve almeno una parte di dati.</p></div>' +
        '<div class="card report-empty"><div class="report-ico">' + A.icon("print") + "</div>" +
          "<h2>Non ci sono ancora dati</h2>" +
          '<p class="text-small muted">Inizia dal colloquio: bastano poche domande. Puoi aggiungere i questionari in un secondo momento.</p>' +
          '<div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="#/colloquio">Inizia il colloquio</a><a class="btn btn-ghost" href="#/valutazione">Vai ai questionari</a></div>' +
        "</div>"
      );
      return;
    }

    const data = sections(d);
    const when = new Date();

    A.setTitle("Relazione");
    A.page(
      '<div class="page-head"><p class="eyebrow">Relazione preliminare</p><h1>Da consegnare al professionista</h1>' +
        '<p class="lead">Un riassunto leggibile di ciò che hai raccolto. Portala a uno psicologo, a uno psicoterapeuta o al medico di base: serve a rendere il colloquio più preciso, non a sostituirlo.</p></div>' +

      '<div class="report-actions no-print"><span class="grow">Il PDF viene generato sul tuo dispositivo. Contiene dati sensibili: conservalo con cura.</span>' +
        '<button type="button" class="btn btn-primary" id="pdfBtn">' + A.icon("download") + "Scarica PDF</button>" +
        '<button type="button" class="btn btn-ghost" id="printBtn">' + A.icon("print") + "Stampa</button>" +
        '<button type="button" class="btn btn-ghost" id="noteBtn">' + A.icon("pen") + "Aggiungi note</button></div>" +

      '<div id="noteBox" class="card no-print"' + (editing ? "" : ' hidden') + ' style="margin-bottom:1.2rem">' +
        '<div class="form-field"><label class="field-label" for="notePerson">Note della persona <span class="muted text-small">(facoltative, compaiono nella relazione)</span></label>' +
          '<textarea class="textarea" id="notePerson" maxlength="1200" placeholder="Cose che vuoi aggiungere e che non sono emerse…">' + esc(state.reportNotes.note || "") + "</textarea></div>" +
        '<div class="form-field"><label class="field-label" for="noteClin">Spazio per il professionista</label>' +
          '<textarea class="textarea" id="noteClin" maxlength="1200" placeholder="Osservazioni, ipotesi, indicazioni…">' + esc(state.reportNotes.clinician || "") + "</textarea></div>" +
        '<button type="button" class="btn btn-soft btn-sm" id="saveNotes">Salva le note</button>' +
      "</div>" +

      '<article class="report-sheet" id="reportSheet">' +
        '<header class="report-head"><div class="report-brand">Psicologo Digitale<span>Relazione preliminare · uso educativo</span></div>' +
          '<div class="report-id"><b>' + esc(docId()) + "</b><br>Generata il " + esc(when.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })) + "</div></header>" +
        '<p class="small" style="margin-top:0">Documento preparato dalla persona con un programma di psicoeducazione e autovalutazione. <strong>Non è una diagnosi</strong> e non sostituisce una valutazione clinica. I punteggi sono indicatori di intensità.</p>' +
        renderHTML(data, d) +
        '<div class="signatures"><div>Firma della persona</div><div>Firma del professionista</div></div>' +
        '<p class="report-foot">«Psicologo Digitale — La stanza d\'ascolto» di Danilo D\'Auria · progetto FeniceOS · contenuti CC BY-NC-SA 4.0 · codice MIT. Documento generato localmente: nessun dato è stato inviato. In caso di emergenza: 112. Numeri di ascolto: Telefono Amico 02 2327 2327 · Samaritans 06 77208977 · 1522 antiviolenza.</p>' +
      "</article>" +

      '<p class="text-small muted mt-2 no-print">Se la relazione contiene un segnale di rischio, non aspettare il prossimo appuntamento: chiama il 112 o uno dei numeri nella sezione <a href="#/sicurezza">Sicurezza</a>.</p>'
    );

    const noteBtn = document.getElementById("noteBtn");
    const noteBox = document.getElementById("noteBox");
    if (noteBtn && noteBox) noteBtn.addEventListener("click", function () {
      noteBox.hidden = !noteBox.hidden;
      if (!noteBox.hidden) {
        const t = document.getElementById("notePerson");
        if (t) t.focus();
      }
    });

    const save = document.getElementById("saveNotes");
    if (save) save.addEventListener("click", function () {
      state.reportNotes.note = document.getElementById("notePerson").value.trim();
      state.reportNotes.clinician = document.getElementById("noteClin").value.trim();
      A.saveReportNotes();
      A.toast("Note salvate. Rigenero la relazione.");
      editing = true;
      views.relazione();
    });

    const printBtn = document.getElementById("printBtn");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    const pdfBtn = document.getElementById("pdfBtn");
    if (pdfBtn) pdfBtn.addEventListener("click", function () {
      try {
        const pdf = buildPdf(data, d, docId(), when);
        downloadPdf(pdf, "relazione-psicologo-digitale-" + when.toISOString().slice(0, 10) + ".pdf");
        A.toast("PDF generato.");
      } catch (e) {
        A.toast("Non riesco a generare il PDF: usa Stampa.");
      }
    });
  };

  /* ------------------------------------------------------------------ PDF 1.4 */

  const CP1252 = {
    "€": 128, "‚": 130, "ƒ": 131, "„": 132, "…": 133, "†": 134, "‡": 135, "ˆ": 136, "‰": 137,
    "Š": 138, "‹": 139, "Œ": 140, "Ž": 142, "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149,
    "–": 150, "—": 151, "˜": 152, "™": 153, "š": 154, "›": 155, "œ": 156, "ž": 158, "Ÿ": 159,
    "°": 176, "±": 177, "²": 178, "³": 179, "µ": 181, "¹": 185, "º": 186, "¼": 188, "½": 189,
    "¾": 190, "À": 192, "Á": 193, "Â": 194, "Ã": 195, "Ä": 196, "Å": 197, "Æ": 198, "Ç": 199,
    "È": 200, "É": 201, "Ê": 202, "Ë": 203, "Ì": 204, "Í": 205, "Î": 206, "Ï": 207, "Ð": 208,
    "Ñ": 209, "Ò": 210, "Ó": 211, "Ô": 212, "Õ": 213, "Ö": 214, "×": 215, "Ø": 216, "Ù": 217,
    "Ú": 218, "Û": 219, "Ü": 220, "Ý": 221, "Þ": 222, "ß": 223, "à": 224, "á": 225, "â": 226,
    "ã": 227, "ä": 228, "å": 229, "æ": 230, "ç": 231, "è": 232, "é": 233, "ê": 234, "ë": 235,
    "ì": 236, "í": 237, "î": 238, "ï": 239, "ð": 240, "ñ": 241, "ò": 242, "ó": 243, "ô": 244,
    "õ": 245, "ö": 246, "÷": 247, "ø": 248, "ù": 249, "ú": 250, "û": 251, "ü": 252, "ý": 253,
    "þ": 254, "ÿ": 255
  };

  const REPLACE = { "→": "->", "←": "<-", "≤": "<=", "≥": ">=", "≈": "~", "∞": "infinito", "™": "(TM)" };

  function toWinAnsi(text) {
    let out = "";
    const src = String(text == null ? "" : text);
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      const code = ch.charCodeAt(0);
      if (code < 128) { out += ch; continue; }
      if (REPLACE[ch]) { out += REPLACE[ch]; continue; }
      if (CP1252[ch] != null) { out += String.fromCharCode(CP1252[ch]); continue; }
      const base = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      out += base || "?";
    }
    return out;
  }

  function pdfString(text) {
    return toWinAnsi(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[\r\n]/g, " ");
  }

  function textWidth(text, size, bold) {
    let w = 0;
    const s = String(text);
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if ("iljtfrI.,:;!|'`".indexOf(ch) >= 0) w += 0.29;
      else if ("mwMW@".indexOf(ch) >= 0) w += 0.87;
      else if (/[A-ZÀÈÉÌÒÙ]/.test(ch)) w += 0.67;
      else if (/[0-9]/.test(ch)) w += 0.56;
      else if (ch === " ") w += 0.27;
      else w += 0.51;
    }
    return w * size * (bold ? 1.045 : 1);
  }

  function wrap(text, maxWidth, size, bold) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    words.forEach(function (word) {
      const test = cur ? cur + " " + word : word;
      if (textWidth(test, size, bold) <= maxWidth) cur = test;
      else {
        if (cur) lines.push(cur);
        if (textWidth(word, size, bold) > maxWidth) {
          let part = "";
          for (let i = 0; i < word.length; i++) {
            if (textWidth(part + word[i], size, bold) > maxWidth) { lines.push(part); part = word[i]; }
            else part += word[i];
          }
          cur = part;
        } else cur = word;
      }
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  function buildPdf(sectionsData, d, id, when) {
    const W = 595.28, H = 841.89, M = 54, CONTENT_W = W - M * 2;
    const ops = [];
    let y = H - M;

    function ensure(h) {
      if (y - h < M + 8) {
        ops.push({ newPage: true });
        y = H - M;
      }
    }
    function text(str, size, bold, color, x, indent) {
      ensure(size * 1.45);
      y -= size * 1.32;
      ops.push({ kind: "text", text: str, x: (x != null ? x : M) + (indent || 0), y: y, size: size, bold: !!bold, color: color || 0.12 });
    }
    function para(str, size, color, indent) {
      const s = size || 9.6;
      const lines = wrap(str, CONTENT_W - (indent || 0), s, false);
      if (y - lines.length * s * 1.35 < M + 8) {
        ops.push({ newPage: true });
        y = H - M;
      }
      lines.forEach(function (l) { text(l, s, false, color, M, indent || 0); });
      y -= 3;
    }
    function heading(str, size) {
      ensure((size || 11.5) * 3.2);
      y -= 14;
      ops.push({ kind: "line", x1: M, y1: y, x2: W - M, y2: y, gray: 0.84, width: 0.7 });
      y -= 4;
      text(str, size || 11.5, true, 0.08);
      y -= 2;
    }
    function rule() {
      ensure(10);
      y -= 5;
      ops.push({ kind: "line", x1: M, y1: y, x2: W - M, y2: y, gray: 0.86, width: 0.6 });
      y -= 4;
    }

    // Intestazione
    ops.push({ kind: "text", x: M, y: H - M, size: 16, bold: true, color: 0.08, text: "Psicologo Digitale" });
    ops.push({ kind: "text", x: M, y: H - M - 12, size: 8, bold: false, color: 0.45, text: "RELAZIONE PRELIMINARE - USO EDUCATIVO - NON E UNA DIAGNOSI" });
    ops.push({ kind: "text", x: W - M - 160, y: H - M, size: 8.5, bold: true, color: 0.12, text: id });
    ops.push({ kind: "text", x: W - M - 160, y: H - M - 11, size: 8, bold: false, color: 0.4, text: "Generata il " + when.toLocaleDateString("it-IT") });
    y = H - M - 22;
    ops.push({ kind: "line", x1: M, y1: y, x2: W - M, y2: y, gray: 0.2, width: 1.4 });
    y -= 2;

    para("Documento preparato dalla persona con un programma di psicoeducazione e autovalutazione. I punteggi sono indicatori di intensita, non diagnosi. La valutazione clinica resta al professionista.", 8.6, 0.42);

    sectionsData.forEach(function (s) {
      if (s.type === "h") heading(s.text);
      else if (s.type === "p") para(s.text, 9.4, 0.2);
      else if (s.type === "flag") {
        ensure(28);
        y -= 6;
        ops.push({ kind: "rect", x: M, y: y - 22, w: CONTENT_W, h: 26, gray: 0.97 });
        ops.push({ kind: "rect", x: M, y: y - 22, w: 3, h: 26, gray: 0.64 });
        y -= 2;
        wrap(s.text, CONTENT_W - 10, 9, true).forEach(function (l, i) {
          ops.push({ kind: "text", x: M + 8, y: y - 10 - i * 11, size: 9, bold: true, color: 0.55, text: l });
        });
        y -= 24;
      } else if (s.type === "ul") {
        s.items.forEach(function (item) {
          const lines = wrap(item, CONTENT_W - 12, 9.2, false);
          ensure(lines.length * 12 + 4);
          lines.forEach(function (l, i) {
            y -= 11.4;
            ops.push({ kind: "text", x: M + (i === 0 ? 0 : 10), y: y, size: 9.2, bold: false, color: 0.24, text: (i === 0 ? "- " : "") + l });
          });
        });
        y -= 3;
      } else if (s.type === "kv") {
        s.rows.forEach(function (row) {
          const lines = wrap(row[1], CONTENT_W - 150, 9.2, false);
          ensure(Math.max(1, lines.length) * 12 + 2);
          lines.forEach(function (l, i) {
            y -= 11.6;
            if (i === 0) ops.push({ kind: "text", x: M, y: y, size: 8.8, bold: false, color: 0.42, text: row[0] });
            ops.push({ kind: "text", x: M + 140, y: y, size: 9.2, bold: false, color: 0.15, text: l });
          });
        });
        y -= 4;
      } else if (s.type === "table") {
        const cols = s.head.length;
        const colW = CONTENT_W / cols;
        ensure(24);
        y -= 14;
        ops.push({ kind: "rect", x: M, y: y - 5, w: CONTENT_W, h: 16, gray: 0.95 });
        s.head.forEach(function (h, i) {
          ops.push({ kind: "text", x: M + 4 + i * colW, y: y, size: 7.6, bold: true, color: 0.32, text: toWinAnsi(h).slice(0, 40) });
        });
        y -= 4;
        s.rows.forEach(function (row) {
          const cells = row.map(function (c, i) {
            return wrap(String(c == null ? "" : c), colW - 8, 8.4, false);
          });
          const hMax = Math.max.apply(null, cells.map(function (c) { return c.length; }));
          ensure(hMax * 10.6 + 4);
          for (let line = 0; line < hMax; line++) {
            y -= 10.4;
            cells.forEach(function (c, i) {
              if (c[line]) ops.push({ kind: "text", x: M + 4 + i * colW, y: y, size: 8.4, bold: false, color: 0.18, text: c[line] });
            });
          }
          ops.push({ kind: "line", x1: M, y1: y - 4, x2: W - M, y2: y - 4, gray: 0.9, width: 0.4 });
          y -= 1;
        });
        y -= 4;
      }
    });

    // Firme
    ensure(70);
    y -= 26;
    ops.push({ kind: "line", x1: M, y1: y, x2: M + 190, y2: y, gray: 0.1, width: 0.8 });
    ops.push({ kind: "line", x1: W - M - 190, y1: y, x2: W - M, y2: y, gray: 0.1, width: 0.8 });
    ops.push({ kind: "text", x: M, y: y - 12, size: 8, bold: false, color: 0.4, text: "Firma della persona" });
    ops.push({ kind: "text", x: W - M - 190, y: y - 12, size: 8, bold: false, color: 0.4, text: "Firma del professionista" });

    // Piè di pagina su ogni pagina
    ops.push({ kind: "footer", text: "Psicologo Digitale - Danilo D'Auria - CC BY-NC-SA 4.0 - Documento generato localmente. Emergenze: 112. Telefono Amico 02 2327 2327." });

    // Paginazione
    const pages = [];
    let current = [];
    ops.forEach(function (op) {
      if (op.newPage) { pages.push(current); current = []; return; }
      current.push(op);
    });
    pages.push(current);

    const pageCount = pages.length;
    const objects = [];
    const pageIds = [];
    for (let i = 0; i < pageCount; i++) pageIds.push(5 + i * 2);

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[2] = "<< /Type /Pages /Kids [" + pageIds.map(function (id) { return id + " 0 R"; }).join(" ") + "] /Count " + pageCount + " >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

    pages.forEach(function (pageOps, i) {
      const pid = 5 + i * 2;
      const cid = pid + 1;
      const content = [];
      pageOps.forEach(function (op) {
        if (op.kind === "text") {
          content.push("BT /" + (op.bold ? "F2" : "F1") + " " + op.size.toFixed(1) + " Tf " + op.color.toFixed(2) + " g 1 0 0 1 " +
            op.x.toFixed(1) + " " + op.y.toFixed(1) + " Tm (" + pdfString(op.text) + ") Tj ET");
        } else if (op.kind === "line") {
          content.push(op.gray.toFixed(2) + " G " + (op.width || 0.7).toFixed(2) + " w " + op.x1.toFixed(1) + " " + op.y1.toFixed(1) + " m " + op.x2.toFixed(1) + " " + op.y2.toFixed(1) + " l S");
        } else if (op.kind === "rect") {
          content.push(op.gray.toFixed(2) + " g " + op.x.toFixed(1) + " " + op.y.toFixed(1) + " " + op.w.toFixed(1) + " " + op.h.toFixed(1) + " re f");
        }
      });
      // piè di pagina
      content.push("0.45 g BT /F1 7 Tf 1 0 0 1 " + M + " " + (M - 22) + " Tm (" + pdfString("Psicologo Digitale - Danilo D'Auria - CC BY-NC-SA 4.0 - Documento generato localmente. Emergenze: 112.") + ") Tj ET");
      content.push("0.45 g BT /F1 7 Tf 1 0 0 1 " + (W - M - 45) + " " + (M - 22) + " Tm (Pag. " + (i + 1) + "/" + pageCount + ") Tj ET");
      const stream = content.join("\n");
      objects[pid] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + cid + " 0 R >>";
      objects[cid] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
    });

    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
    const offsets = [0];
    for (let i = 1; i < objects.length; i++) {
      if (!objects[i]) continue;
      offsets[i] = out.length;
      out += i + " 0 obj\n" + objects[i] + "\nendobj\n";
    }
    const xrefPos = out.length;
    const count = objects.length;
    out += "xref\n0 " + count + "\n0000000000 65535 f \n";
    for (let i = 1; i < count; i++) {
      out += (offsets[i] || 0).toString().padStart(10, "0") + " 00000 n \n";
    }
    out += "trailer\n<< /Size " + count + " /Root 1 0 R >>\nstartxref\n" + xrefPos + "\n%%EOF";

    const bytes = new Uint8Array(out.length);
    for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
    return bytes;
  }

  function downloadPdf(bytes, filename) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  // Superficie usata dai test e da eventuali integrazioni future.
  NP.reportPdf = {
    collect: collect,
    sections: sections,
    docId: docId,
    generate: function () {
      const d = collect();
      return buildPdf(sections(d), d, docId(), new Date());
    }
  };
})();
