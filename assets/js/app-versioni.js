/* ==========================================================================
   Psicologo Digitale · versioni e novità
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;

  // La versione in uso. Un test controlla che resti uguale a package.json:
  // una cronologia che annuncia la versione sbagliata è peggio di nessuna
  // cronologia, perché sembra una conferma.
  const VERSIONE = "1.3.16";

  // Una voce per ogni release pubblicata, dalla più recente. I testi dicono
  // cosa è cambiato per chi usa il programma, non come è stato scritto.
  const NOVITA = [
    {
      v: "1.3.16",
      data: "1 novembre 2026",
      titolo: "Il foglio di installazione in PDF",
      punti: [
        "La pagina Come si installa ha un pulsante Scarica il PDF: quattro pagine da allegare a un'email, senza dover stampare dal browser.",
        "Il PDF non è una seconda copia del testo: è generato leggendo la pagina, quindi quando la pagina cambia cambia anche il foglio.",
        "Anche il PDF è allegato alla pagina della versione, con le altre cose da scaricare."
      ]
    },
    {
      v: "1.3.15",
      data: "1 novembre 2026",
      titolo: "Le istruzioni che si possono stampare",
      punti: [
        "La pagina Come si installa ha un pulsante Stampa o salva in PDF: sulla carta escono una colonna sola, riquadri senza ombre e nessun pulsante.",
        "In testa al foglio finiscono versione e indirizzo della pagina, così chi lo riceve sa a quando risale e dove trovarne una aggiornata.",
        "Il foglio stampato porta con sé l'avvertenza e il numero 112: chi lo legge su carta non deve fidarsi della memoria di chi gliel'ha dato."
      ]
    },
    {
      v: "1.3.14",
      data: "1 novembre 2026",
      titolo: "Le domande frequenti dell'installazione",
      punti: [
        "Dieci domande prese dai punti in cui l'installazione si blocca davvero: il file dichiarato «danneggiato» su macOS, il pulsante Apri comunque che non compare, il collegamento Esegui comunque assente su Windows.",
        "Risposte brevi, con il percorso esatto dei menu, dalla finestra bianca al microfono bloccato, dal download che non parte al backup da salvare prima di disinstallare.",
        "Ricorda anche che Ollama non è obbligatorio e che su iPhone e tablet si usa la PWA, non un pacchetto desktop."
      ]
    },
    {
      v: "1.3.13",
      data: "1 novembre 2026",
      titolo: "La pagina Come si installa",
      punti: [
        "Una pagina pubblica con i passaggi per Windows, macOS e Linux, raggiungibile anche da chi il programma non l'ha mai aperto.",
        "Spiega quale file scegliere, cosa succede al primo avvio e come verificare l'impronta SHA-256 del file scaricato.",
        "Funziona anche offline e senza programmi attivi: è una pagina del sito, non una schermata dell'applicazione."
      ]
    },
    {
      v: "1.3.12",
      data: "1 novembre 2026",
      titolo: "I download si controllano da soli",
      punti: [
        "Ogni giorno, e subito dopo una pubblicazione, un controllo apre tutti i link della release e confronta le impronte dei file.",
        "Se un link non risponde o un'impronta non combacia, si apre una segnalazione con l'elenco preciso e la build diventa rossa.",
        "Quando torna tutto a posto la segnalazione si chiude da sola: nessuno deve ricordarsi di guardare."
      ]
    },
    {
      v: "1.3.11",
      data: "1 novembre 2026",
      titolo: "Un archivio con tutto il progetto",
      punti: [
        "Nella pagina della versione c'è anche <strong>Psicologo-Digitale-Sorgenti.zip</strong>: sito, programma desktop, script, test e PDF in un unico file che si apre con doppio clic.",
        "Serve a chi vuole conservare una copia completa, ricostruire il pacchetto o leggerne il codice senza passare da Git.",
        "Anche il backup ha la sua impronta SHA-256, e il controllo di completezza considera la release finita solo se c'è."
      ]
    },
    {
      v: "1.3.10",
      data: "1 novembre 2026",
      titolo: "Installare sempre, senza certificati",
      punti: [
        "Il progetto rinuncia ai certificati commerciali: resta il primo avvio con una conferma, e nient'altro da pagare o da attendere.",
        "Ogni schermata che parla di installazione dice il percorso giusto per il sistema in uso, e un controllo automatico vigila che ci sia.",
        "La firma ad-hoc dei pacchetti macOS resta attiva: non convince Gatekeeper, ma senza di lei Apple Silicon non eseguirebbe affatto il programma."
      ]
    },
    {
      v: "1.3.9",
      data: "1 novembre 2026",
      titolo: "Mac: istruzioni vere e firma ad-hoc",
      punti: [
        "Da macOS 15 il «tasto destro → Apri» non aggira più il controllo: le istruzioni ora descrivono il percorso che esiste, cioè Fine → Privacy e sicurezza → Apri comunque.",
        "I pacchetti macOS escono con una firma ad-hoc: nessuna identità Apple, ma una firma valida e coerente, che Apple Silicon pretende per eseguire il codice.",
        "La build verifica quella firma a ogni release: un pacchetto rotto si vede in CI, non sul computer di chi lo scarica.",
        "Resta detto chiaro: la notarizzazione Apple è a pagamento e non ha scorciatoie gratuite. Il README spiega perché, Homebrew compreso."
      ]
    },
    {
      v: "1.3.8",
      data: "1 novembre 2026",
      titolo: "La cronologia che stai leggendo",
      punti: [
        "Questa pagina: che cosa ha portato ogni versione, dalla 1.2.0 a oggi, con un segno sulla versione in uso.",
        "Ci si arriva dal menu Altro, dal pannello degli aggiornamenti nella barra di stato e dal piè di pagina di Licenze e progetto.",
        "Accanto al numero c'è la data: se un aggiornamento non è arrivato, si vede subito quale versione manca."
      ]
    },
    {
      v: "1.3.7",
      data: "1 novembre 2026",
      titolo: "Il programma si aggiorna da solo",
      punti: [
        "Chi ha installato il programma non deve più riscaricarlo: la nuova versione si scarica in sottofondo e si installa alla chiusura.",
        "Quando è pronta, nella barra compare «Riavvia per aggiornare»: un tocco riavvia il programma e completa l'installazione.",
        "I file di servizio che rendono possibile tutto questo viaggiano nella release, e una build rossa segnala se mancano.",
        "Su macOS l'aggiornamento automatico richiede un pacchetto firmato: senza firma il programma lo dice e rimanda ai download."
      ]
    },
    {
      v: "1.3.6",
      data: "1 novembre 2026",
      titolo: "Il sito si controlla dopo la pubblicazione",
      punti: [
        "Ogni pubblicazione verifica che il sito serva davvero il service worker appena costruito, non quello della versione precedente.",
        "Controlla anche l'impronta SHA-256 dei quattro PDF: un vademecum vecchio non passa più inosservato."
      ]
    },
    {
      v: "1.3.5",
      data: "1 novembre 2026",
      titolo: "Neura parla anche quando l'italiano manca",
      punti: [
        "Se il sistema non ha voci italiane, Neura ripiega sulla migliore voce disponibile invece di restare muta.",
        "La scheda Voce mostra le istruzioni del sistema in uso per installare una voce italiana, e un pulsante per provarla subito."
      ]
    },
    {
      v: "1.3.4",
      data: "1 novembre 2026",
      titolo: "Il sistema in uso, spiegato",
      punti: [
        "Un pulsante nella barra racconta su quale sistema gira il programma e come consentirgli l'avvio.",
        "Il selettore delle voci elenca tutte le voci installate, raggruppate per lingua.",
        "Le release sono controllate: se un pacchetto o un'impronta manca, la build diventa rossa."
      ]
    },
    {
      v: "1.3.3",
      data: "1 novembre 2026",
      titolo: "Pacchetti non firmati: come aprirli",
      punti: [
        "Istruzioni passo per passo per autorizzare l'avvio su Windows e macOS, senza disattivare le protezioni del sistema.",
        "La firma dei pacchetti è predisposta: basta aggiungere i certificati e la build firma da sola, senza modificare il codice."
      ]
    },
    {
      v: "1.3.2",
      data: "1 novembre 2026",
      titolo: "I vademecum non restano indietro",
      punti: [
        "Un test impedisce di pubblicare PDF che dichiarano una versione diversa da quella del programma."
      ]
    },
    {
      v: "1.3.1",
      data: "1 novembre 2026",
      titolo: "Vademecum rigenerati",
      punti: [
        "I PDF sono ricostruiti a ogni versione, così il numero stampato in copertina corrisponde a quello del programma."
      ]
    },
    {
      v: "1.3.0",
      data: "1 novembre 2026",
      titolo: "La barra di stato",
      punti: [
        "Una barra discreta in alto dice se la voce è pronta, se i dati sono salvati e se il modello locale risponde.",
        "La lettura ad alta voce di Neura è più naturale, con la possibilità di scegliere la voce."
      ]
    },
    {
      v: "1.2.0",
      data: "30 ottobre 2026",
      titolo: "I programmi installabili",
      punti: [
        "Psicologo Digitale diventa un programma per Windows, Linux e macOS, oltre che una pagina web installabile.",
        "Link diretti ai pacchetti e impronte SHA-256 per verificare i file scaricati."
      ]
    }
  ];

  views.versioni = function () {
    A.setTitle("Versioni e novità");

    const elenco = NOVITA.map(function (r) {
      const inUso = r.v === VERSIONE;
      return '<article class="card mt-2">' +
        '<div class="pill-row" style="align-items:center">' +
          '<span class="badge badge-blue">' + esc(r.v) + "</span>" +
          '<span class="text-small muted">' + esc(r.data) + "</span>" +
          (inUso ? '<span class="badge badge-green">in uso</span>' : "") +
        "</div>" +
        '<h3 class="mt-1">' + esc(r.titolo) + "</h3>" +
        '<ul class="list-check text-small">' +
          r.punti.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") +
        "</ul></article>";
    }).join("");

    A.page(
      '<div class="page-head">' +
        '<p class="crumbs"><a href="#/licenze">Licenze e progetto</a><span>›</span>Versioni</p>' +
        "<h1>Versioni e novità</h1>" +
        '<p class="lead">Che cosa ha portato ogni versione, dalla prima installabile a oggi. Il segno <strong>in uso</strong> dice quale stai usando adesso.</p>' +
      "</div>" +

      '<div class="callout info"><p><strong>Nel browser</strong> la pagina si aggiorna da sé quando il sito pubblica una versione nuova: cambia il numero del service worker e il telefono se ne accorge al primo avvio. <strong>Nel programma installato</strong> se ne occupa l\'aggiornamento automatico, dalla 1.3.7 in poi.</p></div>' +

      elenco +

      '<div class="btn-row mt-3">' +
        '<a class="btn btn-ghost btn-sm" href="#/licenze">Licenze e progetto</a>' +
        '<a class="btn btn-ghost btn-sm" href="https://github.com/danilodauria/psicologo-digitale/releases" target="_blank" rel="noopener">Tutte le release su GitHub</a>' +
      "</div>" +

      '<p class="text-small muted mt-3">Una nota pratica: se qui la versione «in uso» è più vecchia dell\'ultima pubblicata, l\'aggiornamento non è ancora arrivato. Nel browser basta ricaricare; nel programma si può forzare il controllo dal pannello degli aggiornamenti.</p>'
    );
  };
})();
