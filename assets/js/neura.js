/* ==========================================================================
   Psicologo Digitale · Neura, motore di conoscenza locale
   Licenza del codice: MIT · Danilo D'Auria
   --------------------------------------------------------------------------
   Non è un modello generativo: riconosce intenti, cerca nei contenuti del
   programma e compone risposte verificabili. Quando non sa, lo dice.
   ========================================================================== */

window.NP = window.NP || {};

NP.neura = (function () {
  "use strict";

  const manuale = NP.data.manuale || [];
  const esercizi = (NP.data.percorso && NP.data.percorso.esercizi) || [];
  const glossario = NP.data.glossario || [];
  const sicurezza = NP.data.sicurezza || { numeri: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function words(s) {
    return norm(s).split(" ").filter(function (w) { return w.length > 2; });
  }

  const RISK = /(voglio morire|voglio ammazzarmi|voglio uccidermi|farla finita|togliermi la vita|non voglio piu vivere|non voglio vivere|farmi del male|mi voglio tagliare|impiccarmi|buttarmi di sotto|buttarmi dal|prendere tutte le pastiglie|sto pensando al suicidio|pensieri suicidi|suicidarmi|voglio sparire per sempre)/;
  const VIOLENZA = /(mi picchia|mi mena|mi strangola|violenza domestica|mi minaccia|mi controlla il telefono|mi stalker|mi ha stuprato|abuso sessuale|sono in pericolo a casa)/;

  const SALUTI = /^(ciao|buongiorno|buonasera|salve|hey|ehi|ciao neura)\b/;
  const RINGRAZIA = /(grazie|ti ringrazio|gentile|utilissimo)/;

  function link(route, text) {
    return '<a href="#/' + route + '">' + esc(text) + "</a>";
  }

  function urgentHTML(premessa) {
    const numeri = (sicurezza.numeri || []).slice(0, 4).map(function (n) {
      return '<div class="emergency-num"><b><a href="tel:' + n.tel + '">' + esc(n.numero) + "</a></b><span>" + esc(n.nome) + "</span></div>";
    }).join("");
    return '<div class="callout danger"><p><strong>Mi fermo un momento su questo.</strong> ' + esc(premessa) + "</p></div>" +
      "<p>Se c'è un pericolo immediato, chiama il <strong>112</strong>. Non devi avere le parole giuste e non devi aspettare: risponde anche per le emergenze psicologiche.</p>" +
      '<div class="emergency-numbers">' + numeri + "</div>" +
      "<p>Se puoi, non restare solo/a: chiama una persona di fiducia e dille cosa stai attraversando. Se stai pensando di farti del male, dillo a un professionista: è un'informazione clinica, non un segreto da custodire.</p>" +
      '<p class="mini">Trovi tutti i numeri nella sezione ' + link("sicurezza", "Sicurezza e numeri utili") + ". Questo programma non è un servizio di emergenza.</p>";
  }

  function introHTML() {
    return "<p><strong>Ciao, sono Neura.</strong> Sono il consulente digitale di Psicologo Digitale: leggo i capitoli del manuale, i questionari, gli esercizi e le schede di sicurezza, e provo a risponderti con precisione.</p>" +
      "<p>Posso spiegarti un tema (ansia, sonno, umore, stress), suggerirti un esercizio, aiutarti a capire da dove iniziare o preparare le domande per un professionista. Non faccio diagnosi e non prescrivo nulla.</p>" +
      '<p class="mini">Quello che scrivi resta su questo dispositivo. Se c\'è un rischio per la tua sicurezza, la priorità è il <strong>112</strong>. ' + link("colloquio", "Inizia il colloquio") + " · " + link("valutazione", "Questionari") + "</p>";
  }

  function chapterHTML(ch) {
    const n = ch.neura || {};
    const sintesi = (n.sintesi || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    const passi = (n.passi || []).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    const avviso = n.avviso ? '<p class="mini">' + esc(n.avviso) + "</p>" : "";
    return "<p><strong>" + esc(ch.titolo) + ".</strong></p>" + sintesi +
      (passi ? "<p><strong>In pratica:</strong></p><ul>" + passi + "</ul>" : "") +
      '<p class="mini">Approfondisci nel ' + link("manuale/" + ch.id, "capitolo " + ch.n + " del manuale") + "." + (avviso ? " " + esc(n.avviso) : "") + "</p>";
  }

  function exerciseHTML(ex) {
    const passi = ex.passo.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    return "<p><strong>" + esc(ex.titolo) + " · " + esc(ex.durata) + ".</strong> " + esc(ex.scopo) + "</p>" +
      "<ol>" + passi + "</ol>" +
      '<p class="mini">Quando: ' + esc(ex.quando) + ". " + esc(ex.nota) + " " + link("esercizi/" + ex.id, "Apri l'esercizio guidato") + "</p>";
  }

  function glossaryHTML(g) {
    return "<p><strong>" + esc(g.t) + ".</strong> " + esc(g.d) + "</p>" +
      '<p class="mini">Categoria: ' + esc(g.cat) + ". " + link("glossario", "Tutte le voci del glossario") + "</p>";
  }

  function chapterScore(ch, t, ws) {
    let s = 0;
    (ch.keywords || []).forEach(function (k) {
      if (t.indexOf(norm(k)) >= 0) s += 7;
    });
    ws.forEach(function (w) {
      if (norm(ch.titolo).indexOf(w) >= 0) s += 3;
      if (norm(ch.sommario).indexOf(w) >= 0) s += 1;
    });
    return s;
  }

  function bestChapter(t, ws) {
    let best = null;
    manuale.forEach(function (ch) {
      const s = chapterScore(ch, t, ws);
      if (!best || s > best.score) best = { ch: ch, score: s };
    });
    return best && best.score >= 5 ? best.ch : null;
  }

  function findGlossary(t) {
    let found = null;
    glossario.forEach(function (g) {
      const n = norm(g.t);
      if (n.length > 3 && t.indexOf(n) >= 0) {
        if (!found || n.length > norm(found.t).length) found = g;
      }
    });
    return found;
  }

  function findExercise(t, ws) {
    let best = null;
    esercizi.forEach(function (ex) {
      let s = 0;
      const hay = norm(ex.titolo + " " + ex.scopo + " " + ex.quando);
      ws.forEach(function (w) { if (hay.indexOf(w) >= 0) s += 2; });
      if (t.indexOf("respir") >= 0 && ex.id === "respiro-4-6") s += 12;
      if (t.indexOf("panico") >= 0 && ex.id === "grounding-54321") s += 10;
      if (t.indexOf("sonno") >= 0 && ex.id === "igiene-sonno") s += 10;
      if (t.indexOf("rimugin") >= 0 && ex.id === "finestra-preoccupazione") s += 10;
      if (t.indexOf("pensier") >= 0 && ex.id === "diario-pensieri") s += 8;
      if (!best || s > best.s) best = { ex: ex, s: s };
    });
    return best && best.s >= 5 ? best.ex : null;
  }

  function answer(text) {
    const raw = String(text || "").trim();
    const t = norm(raw);
    const ws = words(raw);

    if (!t) {
      return { html: "<p>Scrivimi una domanda, anche breve. Per esempio: «che cos'è l'ansia?», «come inizio?», «un esercizio per dormire».</p>", suggest: ["Come inizio?", "Che cos'è l'ansia?", "Un esercizio per dormire"] };
    }

    if (RISK.test(t)) {
      return {
        urgent: true,
        tag: "sicurezza",
        html: urgentHTML("Quello che hai scritto è importante e merita attenzione immediata."),
        suggest: ["Chi posso chiamare?", "Come parlo con qualcuno?"]
      };
    }

    if (VIOLENZA.test(t)) {
      return {
        urgent: true,
        tag: "sicurezza",
        html: '<div class="callout danger"><p><strong>Sei in pericolo?</strong> Chiama il 112. Per violenza e stalking il <strong>1522</strong> è gratuito, riservato e attivo 24 ore su 24.</p></div>' +
          "<p>Non sei responsabile di ciò che subisci. Se puoi, cerca un luogo sicuro e una persona di fiducia. Un centro antiviolenza può aiutarti a capire i passi concreti, anche senza denuncia immediata.</p>" +
          '<p class="mini">' + link("sicurezza", "Numeri e indicazioni di sicurezza") + ".</p>",
        suggest: ["Come trovo un centro antiviolenza?", "Cosa faccio adesso?"]
      };
    }

    if (SALUTI.test(t) && t.length < 30) {
      return { html: introHTML(), suggest: ["Come inizio?", "Che cos'è l'ansia?", "Quanto dura una terapia?"] };
    }

    if (/(chi sei|parlami di te|come funzioni|sei un vero psicologo|sei una persona|cosa sai fare|sei un medico)/.test(t)) {
      return {
        html: "<p>Sono <strong>Neura</strong>, un motore di conoscenza locale. Non sono una persona, non sono uno psicologo e non sono un modello linguistico generativo: non invento risposte e non apprendo dalle conversazioni.</p>" +
          "<p>So fare alcune cose: spiegare i temi del manuale, guidarti negli esercizi, aiutarti a preparare un colloquio, leggere i tuoi questionari e suggerirti quando è il caso di rivolgerti a un professionista. Non faccio diagnosi e non prescrivo farmaci.</p>" +
          '<p class="mini">Il progetto è di Danilo D\'Auria. ' + link("licenze", "Licenze e attribuzione") + "</p>",
        suggest: ["Come inizio?", "Cosa sono i questionari?", "Come funziona la relazione?"]
      };
    }

    if (/(come (si )?(inizia|inizio|comincio)|da dove (inizio|comincio|parto)|primo passo|non so da dove)/.test(t)) {
      return {
        html: "<p>Si parte da una cosa semplice: <strong>descrivere cosa succede</strong>, senza giudizio. Poi si guarda quanto interferisce, da quanto dura e cosa hai già provato. Solo dopo ha senso scegliere un percorso.</p>" +
          "<p>Il mio suggerimento in tre passi:</p><ol><li>Fai il colloquio preliminare: 15-20 minuti, domande adattive, nessun dato inviato.</li><li>Compila uno o due questionari sull'area che ti pesa di più.</li><li>Genera la relazione e portala a un professionista, oppure usa il percorso in otto tappe per capire cosa fare.</li></ol>" +
          '<p class="mini">Non devi fare tutto oggi. Puoi fermarti e riprendere: i dati restano sul dispositivo.</p>',
        suggest: ["Inizia il colloquio", "Quale questionario scelgo?", "Non so se mi serve un professionista"]
      };
    }

    if (/(non so se mi serve|mi serve un professionista|devo andare|quando (devo|bisogna) andare)/.test(t)) {
      return {
        html: "<p>Non esiste una soglia unica. Tre criteri pratici aiutano: <strong>durata</strong> (più di due settimane quasi ogni giorno), <strong>interferenza</strong> (lavoro, sonno, relazioni) e <strong>sofferenza</strong> (quanto ti pesa). Se uno dei tre è importante, vale un colloquio.</p>" +
          "<p>Vale sempre la pena chiedere aiuto se: eviti cose importanti, dormi male da settimane, ti isoli, bevi o usi sostanze per reggere, hai pensieri di farti del male, oppure qualcuno ti fa del male.</p>" +
          '<p class="mini">Il colloquio di questo programma produce un quadro preliminare che puoi portare con te: ' + link("colloquio", "inizia qui") + ".</p>",
        suggest: ["Come inizio?", "Come scelgo lo psicologo?", "Quanto costa una terapia?"]
      };
    }

    if (/(questionari|test|valutazione|punteggio|quale test)/.test(t)) {
      return {
        html: "<p>Ci sono <strong>sei questionari</strong>, ognuno su un'area: umore e interesse, ansia e preoccupazione, stress percepito, sonno e recupero, esaurimento legato al lavoro, benessere generale. Sono indicatori di intensità, non diagnosi.</p>" +
          "<p>Se non sai da dove partire, inizia da <strong>umore</strong> e <strong>ansia</strong>: sono le aree più frequenti. Se il problema principale è il sonno, parti da lì. Compila pensando alle ultime due settimane.</p>" +
          '<p class="mini">' + link("valutazione", "Apri i questionari") + " · " + link("palestra", "Palestra della mente (quiz divulgativo)") + "</p>",
        suggest: ["Che cos'è l'ansia?", "Come leggo il punteggio?", "Posso fare un questionario ora?"]
      };
    }

    if (/(relazione|pdf|stamp|portare al medico|report)/.test(t)) {
      return {
        html: "<p>La <strong>relazione</strong> raccoglie ciò che hai inserito: dati del colloquio, punteggi dei questionari con le fasce, segnali di sicurezza, obiettivi, diario recente e domande suggerite per il professionista. Puoi scaricarla in PDF o stamparla.</p>" +
          "<p>È pensata per essere consegnata a uno psicologo, a uno psicoterapeuta o al medico di base: serve a rendere il primo incontro più preciso, non a sostituirlo. Contiene dati sensibili: conservala con cura.</p>" +
          '<p class="mini">' + link("relazione", "Apri la relazione") + " · " + link("manuale/etica-ia", "Privacy e limiti") + "</p>",
        suggest: ["Cosa contiene la relazione?", "I miei dati sono al sicuro?", "Come preparo il primo colloquio?"]
      };
    }

    if (/(quanto (dura|costa)|prezzo|tariffa|costo|frequenza|quante sedute)/.test(t)) {
      return {
        html: "<p>Una seduta dura in genere <strong>45-60 minuti</strong>, con frequenza settimanale all'inizio. Un percorso breve strutturato dura 8-16 incontri; altri percorsi richiedono più tempo. Il costo nel privato varia indicativamente tra 40 e 100 euro a seduta, con differenze territoriali e per specializzazione.</p>" +
          "<p>Esistono servizi pubblici (consultori, CSM, SerD) e tariffe ridotte presso scuole di specializzazione e associazioni. Chiedere costi e tempi prima di iniziare è normale.</p>" +
          '<p class="mini">' + link("percorso", "Percorso in otto tappe") + " · " + link("sedute", "Protocolli e tempi") + "</p>",
        suggest: ["Come scelgo lo psicologo?", "Che differenza c'è tra psicologo e psichiatra?", "Come funziona il primo colloquio?"]
      };
    }

    if (/(psichiatra|psicoterapeuta|albo|differenza tra psicologo|come scelgo)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "scegliere-professionista"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Quanto costa una terapia?", "Come verifico l'albo?", "Primo colloquio: cosa aspettarsi?"] };
    }

    if (/(privacy|dati|salvat|cloud|internet|gdpr|dove finiscono)/.test(t)) {
      return {
        html: "<p>Non c'è un account e non c'è un server: risposte, questionari, diario e relazione restano nel <strong>localStorage</strong> del tuo browser, su questo dispositivo. Nessun dato viene inviato in rete. Non ci sono telemetria né pubblicità.</p>" +
          "<p>Se cancelli i dati del browser, i dati spariscono. Puoi esportare un backup JSON dalla sezione Licenze e progetto. La relazione PDF viene generata sul dispositivo: condividerla dipende solo da te.</p>" +
          '<p class="mini">' + link("licenze", "Privacy, backup e licenze") + "</p>",
        suggest: ["Come faccio un backup?", "La relazione contiene dati sensibili?", "Posso usarlo per un familiare?"]
      };
    }

    if (/(ollama|ia locale|intelligenza artificiale locale|modello locale|installare|installo|scaricare l app|installazione|senza connessione|offline)/.test(t)) {
      return {
        html: "<p>L'app si installa dal browser: su Android scegli «Installa app» dal menu, su iPhone «Condividi» e poi «Aggiungi alla schermata Home». Sul computer, con Chrome o Edge, l'icona di installazione compare nella barra degli indirizzi. Dopo la prima apertura funziona anche senza connessione.</p>" +
          "<p>Se poi ti va, puoi aggiungere <strong>Ollama</strong>: è un modello generativo gratuito che gira sul tuo computer, senza mandare nulla in rete. Nella pagina dedicata trovo il sistema che stai usando e ti dico quale versione scaricare e quanto pesa il modello adatto alla tua memoria. Non è obbligatorio: io funziono lo stesso, e resto la voce che conosce davvero i contenuti del programma.</p>" +
          '<p class="mini">' + link("installa", "Installa l'app e l'IA locale") + "</p>",
        suggest: ["Come installo l'app sul telefono?", "Che modello scelgo per il mio computer?", "Funziona senza internet?"]
      };
    }

    if (/(dieta|dietolog|dietista|nutrizion|alimentaz|mangiare|cibo|peso|corpo|colazione|pranzo|cena|spuntino)/.test(t)) {
      return {
        html: "<p>Il cibo e l'umore si muovono insieme: pasti regolari, fibra, sonno e luce del mattino contano più di qualsiasi «superfood». Non esiste un alimento che curi l'ansia o la depressione, e non esiste una dieta valida per tutti.</p>" +
          "<p>Nella sezione dedicata trovo cosa dicono le indicazioni italiane, un'immagine pratica del piatto, i segnali da non aspettare e la differenza tra <strong>dietista</strong>, <strong>dietologo</strong> e <strong>biologo nutrizionista</strong>. Non ti prescrivo diete: non è il mio ruolo e non sarebbe sicuro.</p>" +
          '<p class="mini">' + link("nutrizione", "Nutrizione e umore") + " · " + link("diario", "Diario") + "</p>",
        suggest: ["Cosa mangio per dormire meglio?", "Chi devo consultare?", "Il cibo può curare l'ansia?"]
      };
    }

    if (/(esercizio|cosa posso fare (adesso|subito|ora)|tecnica|calmarmi|respirare|respir)/.test(t)) {
      const ex = findExercise(t, ws) || esercizi.filter(function (e) { return e.id === "respiro-4-6"; })[0];
      return { html: exerciseHTML(ex), suggest: ["Un esercizio per l'ansia", "Un esercizio per dormire", "Tutti gli esercizi"] };
    }

    if (/(esauriment|burnout|lavoro|carico|stacch)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "stress"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Questionario esaurimento", "Un esercizio sui confini", "Quanto dura un percorso?"] };
    }

    if (/(lutto|perdita|morte di|trauma|incidente|violenza|abuso)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "trauma-lutto"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Come trovo un professionista?", "Un esercizio di ancoraggio", "Numeri utili"] };
    }

    if (/(sonno|dormire|insonnia|sveglio di notte)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "sonno"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Questionario sonno", "Le sei regole del sonno", "Perché mi sveglio di notte?"] };
    }

    if (/(ansia|panico|preoccup|paura)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "ansia"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Questionario ansia", "Esercizio di respiro", "Come smetto di evitare?"] };
    }

    if (/(depression|umore|triste|vuoto|non ho voglia|energia)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "umore"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Questionario umore", "Come ricomincio a fare?", "Quando chiedere aiuto"] };
    }

    if (/(rabbia|litig|conflitto|confini|assertiv|relazion|coppia|famiglia)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "relazioni"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Esercizio DESC", "Come metto un confine?", "Questionario relazioni"] };
    }

    if (/(caffeina|alcol|fumo|sostanze|dieta|movimento|sport|corpo)/.test(t)) {
      const ch = manuale.filter(function (c) { return c.id === "corpo-abitudini"; })[0];
      if (ch) return { html: chapterHTML(ch), suggest: ["Come smetto di bere la sera?", "Quanta caffeina è troppa?", "Il movimento aiuta l'umore?"] };
    }

    if (/(grazie|ti ringrazio)/.test(t)) {
      return { html: "<p>Figurati. Ricorda: io posso aiutarti a orientarti, ma la persona che può davvero valutare e accompagnarti è un professionista. Se vuoi, continuiamo da dove eravamo.</p>", suggest: ["Riprendiamo il colloquio", "Un esercizio", "Come preparo la relazione?"] };
    }

    // Glossario: corrispondenza esatta o contenuta
    const g = findGlossary(t);
    if (g && ws.length <= 6) {
      return { html: glossaryHTML(g), suggest: ["Approfondisci nel manuale", "Un esercizio collegato", "Fammi un'altra domanda"] };
    }

    // Recupero dai capitoli
    const ch = bestChapter(t, ws);
    if (ch) {
      return { html: chapterHTML(ch), suggest: ["Approfondisci", "Un esercizio", "Vai ai questionari"] };
    }

    // Fallback onesto
    return {
      html: "<p>Su questo non ho una risposta affidabile nei contenuti del programma, e preferisco dirtelo invece di inventare.</p>" +
        "<p>Posso aiutarti su: ansia, panico, umore, sonno, stress e burnout, relazioni, lutto e trauma, esercizi di regolazione, come scegliere un professionista, come funziona un percorso.</p>" +
        '<p class="mini">Se la domanda riguarda la tua situazione personale, il colloquio guidato è lo strumento giusto: ' + link("colloquio", "inizia il colloquio") + ". Per un parere clinico, rivolgiti a un professionista.</p>",
      suggest: ["Come inizio?", "Che cos'è l'ansia?", "Quali questionari ci sono?"]
    };
  }

  function topics() {
    return manuale.map(function (c) { return { id: c.id, n: c.n, titolo: c.titolo }; });
  }

  return { answer: answer, topics: topics, normalize: norm, exercises: esercizi };
})();
