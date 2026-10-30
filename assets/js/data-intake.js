/* ==========================================================================
   Psicologo Digitale · colloquio preliminare adattivo
   Licenza del codice: MIT · Contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   --------------------------------------------------------------------------
   Ogni domanda può comparire solo se la precedente la rende pertinente
   (campo `if`). Il motore salta le domande non applicabili, così il percorso
   resta breve e centrato sulla persona.
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.fasi = [
  { id: "accoglienza", titolo: "Accoglienza", descr: "Consenso, contesto, da dove partire" },
  { id: "motivo", titolo: "Motivo", descr: "Cosa ti porta qui e quanto pesa" },
  { id: "approfondimento", titolo: "Approfondimento", descr: "Le aree che hai scelto" },
  { id: "storia", titolo: "Storia", descr: "Percorsi, salute, eventi" },
  { id: "funzionamento", titolo: "Funzionamento", descr: "Energia, sonno, relazioni" },
  { id: "sicurezza", titolo: "Sicurezza", descr: "Le domande che proteggono" },
  { id: "risorse", titolo: "Risorse e obiettivi", descr: "Ciò che ti sostiene e dove vuoi arrivare" },
  { id: "restituzione", titolo: "Restituzione", descr: "Il quadro preliminare" }
];

NP.data.aree = [
  { id: "umore", label: "Umore e motivazione", icona: "heart" },
  { id: "ansia", label: "Ansia e preoccupazione", icona: "wave" },
  { id: "sonno", label: "Sonno", icona: "moon" },
  { id: "lavoro", label: "Lavoro, studio, carico", icona: "battery" },
  { id: "relazioni", label: "Relazioni e famiglia", icona: "users" },
  { id: "lutto", label: "Perdita e lutto", icona: "cloud" },
  { id: "autostima", label: "Autostima", icona: "spark" },
  { id: "corpo", label: "Corpo e alimentazione", icona: "activity" },
  { id: "dipendenze", label: "Sostanze e dipendenze", icona: "alert" },
  { id: "trauma", label: "Esperienze traumatiche", icona: "shield" },
  { id: "genitorialita", label: "Genitorialità", icona: "users" },
  { id: "solitudine", label: "Solitudine", icona: "cloud" },
  { id: "rabbia", label: "Rabbia e conflitti", icona: "activity" },
  { id: "altro", label: "Un'altra area", icona: "circle" }
];

var Q = [];

/* ---------------------------------------------------------------- Accoglienza */

Q.push({
  id: "consenso",
  fase: "accoglienza",
  tipo: "consenso",
  titolo: "Prima di iniziare",
  aiuto: "Questo è un colloquio preliminare, non una visita. Serve a mettere in ordine ciò che senti e a preparare un quadro utile per un professionista.",
  testoConsenso: "Ho capito che Psicologo Digitale è uno strumento educativo di orientamento: non formula diagnosi, non prescrive cure e non sostituisce uno psicologo, uno psicoterapeuta o un medico.",
  obbligatoria: true
});

Q.push({
  id: "nome",
  fase: "accoglienza",
  tipo: "testo",
  titolo: "Come vuoi essere chiamato/a?",
  aiuto: "È facoltativo. Se scrivi un nome, resta solo su questo dispositivo e compare nella relazione che potrai stampare.",
  placeholder: "Nome o pseudonimo",
  maxlength: 60,
  obbligatoria: false
});

Q.push({
  id: "eta",
  fase: "accoglienza",
  tipo: "scelta",
  titolo: "Quanti anni hai?",
  aiuto: "L'età cambia il modo di leggere alcuni segnali e le indicazioni sui servizi.",
  opzioni: [
    { v: "minorenne", label: "Meno di 18 anni", nota: "Per i minori serve il coinvolgimento di un adulto responsabile" },
    { v: "18-24", label: "18-24 anni" },
    { v: "25-34", label: "25-34 anni" },
    { v: "35-44", label: "35-44 anni" },
    { v: "45-54", label: "45-54 anni" },
    { v: "55-64", label: "55-64 anni" },
    { v: "65+", label: "65 anni o più" }
  ]
});

Q.push({
  id: "perChi",
  fase: "accoglienza",
  tipo: "scelta",
  titolo: "Stai facendo questo percorso per te o per qualcun altro?",
  aiuto: "Se rispondi per un'altra persona, alcune informazioni saranno indirette: la relazione lo segnalerà.",
  opzioni: [
    { v: "me", label: "Per me" },
    { v: "familiare", label: "Per un familiare o una persona cara" },
    { v: "aiutare", label: "Per capire come aiutare qualcuno" }
  ]
});

Q.push({
  id: "inizio",
  fase: "accoglienza",
  tipo: "scelta",
  titolo: "Da dove vuoi cominciare?",
  aiuto: "Non c'è un ordine giusto. Scegli il punto che ti somiglia di più.",
  opzioni: [
    { v: "te", label: "Parlami di te", nota: "Che cosa fai, come lavori, cosa puoi darmi" },
    { v: "problema", label: "Ho un problema preciso da raccontare" },
    { v: "nonso", label: "Non so da dove iniziare", nota: "Ti faccio qualche domanda semplice, una alla volta" },
    { v: "serve", label: "Voglio capire se mi serve un professionista" },
    { v: "prepararmi", label: "Sono già in terapia e voglio prepararmi a un incontro" }
  ],
  feedback: function (v) {
    if (v === "te") return "Sono Neura: un motore di conoscenza locale, non una persona e non un terapeuta. Leggo le risposte, le confronto con ciò che la psicologia clinica considera rilevante in una prima consultazione e ti restituisco un quadro ordinato. Non invento diagnosi: quando un'informazione manca, te lo dico.";
    if (v === "nonso") return "Va bene così. Non serve avere le parole giuste per iniziare: le troviamo insieme, una domanda alla volta. Puoi fermarti quando vuoi.";
    if (v === "serve") return "Bene: alla fine avrai elementi concreti per capire se e quale professionista cercare, senza che questo programma decida al posto tuo.";
    if (v === "prepararmi") return "Ottimo. Un colloquio preparatorio può rendere il primo incontro con il tuo professionista più preciso: portagli ciò che emerge, non sostituirlo.";
    return "";
  }
});

Q.push({
  id: "infoMinori",
  fase: "accoglienza",
  tipo: "info",
  titolo: "Un'informazione importante",
  aiuto: "Hai indicato di avere meno di 18 anni.",
  testo: "Questo programma può aiutarti a mettere in ordine le idee, ma per un minore la valutazione psicologica va sempre condivisa con un adulto responsabile e con un professionista. Se c'è un rischio per la tua sicurezza, parla subito con un adulto di fiducia o chiama il 112. Telefono Azzurro risponde al 19696.",
  if: function (a) { return a.eta === "minorenne"; }
});

Q.push({
  id: "relazionePersona",
  fase: "accoglienza",
  tipo: "scelta",
  titolo: "Che rapporto hai con questa persona?",
  aiuto: "Serve a leggere le risposte con la giusta distanza.",
  opzioni: [
    { v: "partner", label: "Partner o coniuge" },
    { v: "figlio", label: "Figlio o figlia" },
    { v: "genitore", label: "Genitore o fratello/sorella" },
    { v: "amico", label: "Amico o amica" },
    { v: "altro", label: "Un'altra persona" }
  ],
  if: function (a) { return a.perChi === "familiare" || a.perChi === "aiutare"; }
});

/* -------------------------------------------------------------------- Motivo */

Q.push({
  id: "aree",
  fase: "motivo",
  tipo: "multipla",
  titolo: "Che cosa pesa di più, in questo periodo?",
  aiuto: "Puoi scegliere fino a tre aree. Se non sai, scegli quella che ti viene in mente per prima.",
  max: 3,
  opzioni: NP.data.aree.map(function (x) { return { v: x.id, label: x.label }; })
});

Q.push({
  id: "durata",
  fase: "motivo",
  tipo: "scelta",
  titolo: "Da quanto tempo va avanti?",
  aiuto: "La durata è uno dei criteri che un clinico valuta per primo.",
  opzioni: [
    { v: "2sett", label: "Da meno di due settimane" },
    { v: "4sett", label: "Da due a quattro settimane" },
    { v: "mesi6", label: "Da uno a sei mesi" },
    { v: "anno", label: "Da sei a dodici mesi" },
    { v: "oltre", label: "Da più di un anno" },
    { v: "fasi", label: "Va a fasi: periodi meglio e periodi peggio" }
  ],
  feedback: function (v) {
    if (v === "2sett") return "Due settimane sono un riferimento importante: molti quadri clinici vengono valutati proprio su questa durata. Se il disagio è intenso, non aspettare che passi da solo.";
    if (v === "fasi") return "I periodi alterni sono comuni. Nella restituzione proveremo a capire cosa cambia tra un periodo e l'altro: spesso è lì la leva.";
    return "";
  }
});

Q.push({
  id: "impatto",
  fase: "motivo",
  tipo: "scala",
  titolo: "Quanto interferisce con la tua giornata?",
  aiuto: "0 significa «per niente», 10 «mi impedisce quasi tutto».",
  min: 0, max: 10, valore: 5,
  etichette: ["Per niente", "Mi impedisce quasi tutto"],
  area: "impatto"
});

Q.push({
  id: "peggiora",
  fase: "motivo",
  tipo: "multipla",
  titolo: "Cosa lo fa peggiorare?",
  aiuto: "Anche più di una risposta.",
  opzioni: [
    { v: "solitudine", label: "Stare solo/a" },
    { v: "lavoro", label: "Lavoro o studio" },
    { v: "conflitti", label: "Conflitti in casa o al lavoro" },
    { v: "notte", label: "La notte e il momento di dormire" },
    { v: "salute", label: "Preoccupazioni per la salute" },
    { v: "sostanze", label: "Alcol, sostanze o schermi" },
    { v: "nulla", label: "Niente in particolare: è sempre presente" }
  ]
});

/* ------------------------------------------------------- Approfondimento */

Q.push({
  id: "um_piacere",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto riesci ancora a provare piacere nelle cose che ti piacevano?",
  aiuto: "0 «per niente», 10 «come prima». L'interesse è uno dei segnali più importanti dell'umore.",
  min: 0, max: 10, valore: 5,
  etichette: ["Per niente", "Come prima"],
  area: "umore",
  invertita: true,
  if: function (a) { return a.aree && a.aree.indexOf("umore") >= 0; }
});

Q.push({
  id: "um_colpa",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto ti capita di sentirti in colpa o di pensare di valere poco?",
  aiuto: "Non è un giudizio su di te: serve a capire quanto la mente ti tratta con durezza.",
  opzioni: [
    { v: "mai", label: "Quasi mai", peso: 1 },
    { v: "aVolte", label: "A volte", peso: 4 },
    { v: "spesso", label: "Spesso", peso: 7 },
    { v: "sempre", label: "Quasi sempre", peso: 10 }
  ],
  area: "umore",
  if: function (a) { return a.aree && a.aree.indexOf("umore") >= 0; }
});

Q.push({
  id: "um_ritiro",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "In questo periodo, hai ridotto le cose che fai?",
  aiuto: "Uscite, hobby, contatti, commissioni.",
  opzioni: [
    { v: "no", label: "No, faccio le stesse cose", peso: 0 },
    { v: "poco", label: "Ho ridotto qualcosa", peso: 4 },
    { v: "molto", label: "Ho ridotto molto", peso: 7 },
    { v: "quasi", label: "Esco quasi solo per necessità", peso: 10 }
  ],
  area: "umore",
  if: function (a) { return a.aree && a.aree.indexOf("umore") >= 0; }
});

Q.push({
  id: "an_manifestazioni",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "Come si presenta soprattutto la tua ansia?",
  aiuto: "Scegli le esperienze che riconosci.",
  opzioni: [
    { v: "preoccupazione", label: "Preoccupazione continua, difficile da fermare" },
    { v: "attacchi", label: "Attacchi acuti di paura" },
    { v: "evitamento", label: "Evito situazioni che mi spaventano" },
    { v: "fisici", label: "Sintomi fisici: cuore, respiro, stomaco, tensione" },
    { v: "sociale", label: "Paura del giudizio degli altri" },
    { v: "salute", label: "Paura di avere una malattia" }
  ],
  area: "ansia",
  if: function (a) { return a.aree && a.aree.indexOf("ansia") >= 0; }
});

Q.push({
  id: "an_evitamento",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "C'è qualcosa che hai iniziato a evitare?",
  aiuto: "L'evitamento è il meccanismo che mantiene l'ansia: riconoscerlo è il primo passo.",
  opzioni: [
    { v: "luoghi", label: "Luoghi affollati o chiusi" },
    { v: "guida", label: "Guidare o spostarmi da solo/a" },
    { v: "impegni", label: "Impegni, riunioni, esami" },
    { v: "social", label: "Situazioni sociali" },
    { v: "telefono", label: "Telefonate o videochiamate" },
    { v: "nulla", label: "Non sto evitando nulla" }
  ],
  area: "ansia",
  if: function (a) { return a.aree && a.aree.indexOf("ansia") >= 0; }
});

Q.push({
  id: "an_attacchi",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Se hai attacchi acuti, quanto spesso accadono?",
  aiuto: "Se non ne hai, scegli «non ne ho».",
  opzioni: [
    { v: "no", label: "Non ne ho", peso: 0 },
    { v: "raro", label: "Qualche volta all'anno", peso: 3 },
    { v: "mensile", label: "Circa una volta al mese", peso: 6 },
    { v: "settimanale", label: "Ogni settimana", peso: 9 },
    { v: "giorno", label: "Quasi ogni giorno", peso: 10 }
  ],
  area: "ansia",
  if: function (a) { return a.aree && a.aree.indexOf("ansia") >= 0; }
});

Q.push({
  id: "so_tipo",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "Che cosa non funziona nel tuo sonno?",
  aiuto: "Più risposte sono possibili.",
  opzioni: [
    { v: "addormentamento", label: "Fatico ad addormentarmi" },
    { v: "risvegli", label: "Mi sveglio di notte" },
    { v: "precoce", label: "Mi sveglio troppo presto" },
    { v: "sonnolenza", label: "Sono assonnato/a di giorno" },
    { v: "russamento", label: "Russamento forte o pause respiratorie" },
    { v: "turni", label: "Lavoro su turni o di notte" }
  ],
  area: "sonno",
  if: function (a) { return a.aree && a.aree.indexOf("sonno") >= 0; }
});

Q.push({
  id: "so_ore",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quante ore dormi in una notte tipica?",
  aiuto: "Una media, non la notte migliore.",
  min: 3, max: 11, valore: 7, passo: 1,
  etichette: ["3 ore", "11 ore"],
  area: "sonno",
  invertita: false,
  speciale: "ore",
  if: function (a) { return a.aree && a.aree.indexOf("sonno") >= 0; }
});

Q.push({
  id: "lav_carico",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto è pesante il tuo carico di lavoro o di studio?",
  aiuto: "0 «leggero», 10 «insostenibile».",
  min: 0, max: 10, valore: 5,
  etichette: ["Leggero", "Insopportabile"],
  area: "lavoro",
  if: function (a) { return a.aree && a.aree.indexOf("lavoro") >= 0; }
});

Q.push({
  id: "lav_recupero",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Riesci a staccare davvero quando non lavori?",
  aiuto: "Pensieri, telefonate, disponibilità continua.",
  opzioni: [
    { v: "si", label: "Sì, abbastanza", peso: 1 },
    { v: "poco", label: "Poco: ci penso spesso", peso: 5 },
    { v: "no", label: "No: sono sempre reperibile", peso: 8 },
    { v: "peggio", label: "Non ricordo l'ultima volta che ho staccato", peso: 10 }
  ],
  area: "lavoro",
  if: function (a) { return a.aree && a.aree.indexOf("lavoro") >= 0; }
});

Q.push({
  id: "rel_tipo",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "Quali relazioni sono più in difficoltà?",
  aiuto: "Scegli quelle che contano in questo momento.",
  opzioni: [
    { v: "coppia", label: "Coppia o matrimonio" },
    { v: "famiglia", label: "Famiglia di origine" },
    { v: "figli", label: "Figli" },
    { v: "amici", label: "Amicizie" },
    { v: "lavoro", label: "Colleghi o superiori" },
    { v: "nessuna", label: "Nessuna in particolare" }
  ],
  area: "relazioni",
  if: function (a) { return a.aree && a.aree.indexOf("relazioni") >= 0; }
});

Q.push({
  id: "rel_conflitto",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto conflitto o tensione c'è in queste relazioni?",
  aiuto: "0 «nessuno», 10 «continuo».",
  min: 0, max: 10, valore: 4,
  etichette: ["Nessuno", "Continuo"],
  area: "relazioni",
  if: function (a) { return a.aree && a.aree.indexOf("relazioni") >= 0; }
});

Q.push({
  id: "lut_quando",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto tempo è passato dalla perdita?",
  aiuto: "Non c'è un tempo giusto per elaborare un lutto. Serve a capire il contesto.",
  opzioni: [
    { v: "mesi", label: "Meno di sei mesi" },
    { v: "anno", label: "Da sei a dodici mesi" },
    { v: "due", label: "Da uno a tre anni" },
    { v: "oltre", label: "Più di tre anni" }
  ],
  area: "lutto",
  if: function (a) { return a.aree && a.aree.indexOf("lutto") >= 0; }
});

Q.push({
  id: "lut_elaborazione",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Come sta andando l'elaborazione?",
  aiuto: "Rispondi come ti senti oggi, non come pensi che dovresti sentirti.",
  opzioni: [
    { v: "procede", label: "Piano piano procede, con momenti difficili", peso: 3 },
    { v: "bloccata", label: "Mi sembra bloccata", peso: 7 },
    { v: "peggiora", label: "Sta peggiorando col tempo", peso: 9 },
    { v: "evito", label: "Evito tutto ciò che la riguarda", peso: 8 }
  ],
  area: "lutto",
  if: function (a) { return a.aree && a.aree.indexOf("lutto") >= 0; }
});

Q.push({
  id: "aut_critica",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto è severa la voce che ti critica?",
  aiuto: "0 «gentile», 10 «spietata».",
  min: 0, max: 10, valore: 5,
  etichette: ["Gentile", "Spietata"],
  area: "autostima",
  if: function (a) { return a.aree && a.aree.indexOf("autostima") >= 0; }
});

Q.push({
  id: "aut_confronto",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto ti confronti con gli altri?",
  aiuto: "Social, colleghi, conoscenti.",
  opzioni: [
    { v: "poco", label: "Poco", peso: 2 },
    { v: "medio", label: "Ogni tanto", peso: 5 },
    { v: "molto", label: "Spesso, e mi fa stare male", peso: 8 },
    { v: "sempre", label: "Continuamente", peso: 10 }
  ],
  area: "autostima",
  if: function (a) { return a.aree && a.aree.indexOf("autostima") >= 0; }
});

Q.push({
  id: "cor_comportamenti",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "Riconosci qualche comportamento legato a cibo o corpo?",
  aiuto: "Questa domanda è delicata. Puoi saltarla o scegliere «nessuno». Se riconosci qualcuno di questi segnali, parlane con un professionista: non è un fallimento.",
  opzioni: [
    { v: "restrizioni", label: "Salto pasti o mangio molto poco", allerta: true },
    { v: "abbuffate", label: "Abbuffate difficili da fermare", allerta: true },
    { v: "vomito", label: "Vomito o uso di lassativi", allerta: true },
    { v: "esercizio", label: "Esercizio fisico obbligato per compensare", allerta: true },
    { v: "peso", label: "Controllo il peso più volte al giorno", allerta: true },
    { v: "nessuno", label: "Nessuno di questi" }
  ],
  area: "corpo",
  if: function (a) { return a.aree && a.aree.indexOf("corpo") >= 0; }
});

Q.push({
  id: "cor_immagine",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto sei insoddisfatto/a del tuo corpo?",
  aiuto: "0 «per niente», 10 «moltissimo».",
  min: 0, max: 10, valore: 4,
  etichette: ["Per niente", "Moltissimo"],
  area: "corpo",
  if: function (a) { return a.aree && a.aree.indexOf("corpo") >= 0; }
});

Q.push({
  id: "dip_sostanze",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "C'è qualcosa che usi per stare meglio e che fatica a restare sotto controllo?",
  aiuto: "Nessuna risposta viene giudicata. Serve a capire se conviene un supporto specifico.",
  opzioni: [
    { v: "alcol", label: "Alcol" },
    { v: "nicotina", label: "Nicotina" },
    { v: "cannabis", label: "Cannabis" },
    { v: "farmaci", label: "Farmaci senza prescrizione" },
    { v: "gioco", label: "Gioco d'azzardo o scommesse" },
    { v: "schermi", label: "Schermi, social, videogiochi" },
    { v: "nessuna", label: "Nessuna di queste" }
  ],
  area: "dipendenze",
  if: function (a) { return a.aree && a.aree.indexOf("dipendenze") >= 0; }
});

Q.push({
  id: "dip_controllo",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto ti è difficile fermarti?",
  aiuto: "Pensa all'ultimo mese.",
  opzioni: [
    { v: "no", label: "Non è un problema per me", peso: 1 },
    { v: "poco", label: "A volte esagero", peso: 4 },
    { v: "molto", label: "Spesso non riesco a fermarmi", peso: 8 },
    { v: "sempre", label: "Ogni giorno, e mi crea conseguenze", peso: 10 }
  ],
  area: "dipendenze",
  if: function (a) { return a.aree && a.aree.indexOf("dipendenze") >= 0; }
});

Q.push({
  id: "tra_evento",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Hai vissuto un evento che ti ha segnato profondamente?",
  aiuto: "Non serve raccontarlo. Puoi anche preferire di non rispondere.",
  opzioni: [
    { v: "no", label: "No", peso: 1 },
    { v: "si", label: "Sì", peso: 6 },
    { v: "forse", label: "Forse: ci sono cose che evito di guardare", peso: 5 },
    { v: "passo", label: "Preferisco non rispondere", peso: 0 }
  ],
  area: "trauma",
  if: function (a) { return a.aree && a.aree.indexOf("trauma") >= 0; }
});

Q.push({
  id: "tra_sintomi",
  fase: "approfondimento",
  tipo: "multipla",
  titolo: "Ti capita qualcuno di questi fenomeni?",
  aiuto: "Sogni, flashback, ipervigilanza, evitamento: sono risposte comuni dopo eventi difficili.",
  opzioni: [
    { v: "flashback", label: "Ricordi intrusivi o flashback" },
    { v: "incubi", label: "Incubi ricorrenti" },
    { v: "ipervigilanza", label: "Sono sempre in allerta" },
    { v: "evitamento", label: "Evito luoghi, persone o ricordi" },
    { v: "intorpidimento", label: "Mi sento distaccato/a o intorpidito/a" },
    { v: "nessuno", label: "Nessuno di questi" }
  ],
  area: "trauma",
  if: function (a) { return a.aree && a.aree.indexOf("trauma") >= 0; }
});

Q.push({
  id: "gen_figli",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanti figli hai e che età hanno?",
  aiuto: "Serve a contestualizzare il carico e le risorse.",
  opzioni: [
    { v: "piccoli", label: "Uno o più figli piccoli (0-6 anni)" },
    { v: "scuola", label: "Figli in età scolare (7-13 anni)" },
    { v: "adolescenti", label: "Figli adolescenti (14-18 anni)" },
    { v: "adulti", label: "Figli adulti" },
    { v: "attesa", label: "In attesa o primo anno di vita" }
  ],
  area: "genitorialita",
  if: function (a) { return a.aree && a.aree.indexOf("genitorialita") >= 0; }
});

Q.push({
  id: "gen_carico",
  fase: "approfondimento",
  tipo: "scala",
  titolo: "Quanto è pesante il carico genitoriale?",
  aiuto: "0 «gestibile», 10 «mi schiaccia».",
  min: 0, max: 10, valore: 5,
  etichette: ["Gestibile", "Mi schiaccia"],
  area: "genitorialita",
  if: function (a) { return a.aree && a.aree.indexOf("genitorialita") >= 0; }
});

Q.push({
  id: "sol_frequenza",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto ti senti solo/a?",
  aiuto: "La solitudine percepita conta più del numero di persone intorno.",
  opzioni: [
    { v: "poco", label: "Poco", peso: 2 },
    { v: "medio", label: "A tratti", peso: 5 },
    { v: "molto", label: "Spesso", peso: 8 },
    { v: "sempre", label: "Quasi sempre", peso: 10 }
  ],
  area: "solitudine",
  if: function (a) { return a.aree && a.aree.indexOf("solitudine") >= 0; }
});

Q.push({
  id: "rab_frequenza",
  fase: "approfondimento",
  tipo: "scelta",
  titolo: "Quanto spesso perdi la calma?",
  aiuto: "Pensa all'ultimo mese.",
  opzioni: [
    { v: "raro", label: "Raramente", peso: 2 },
    { v: "settimana", label: "Qualche volta a settimana", peso: 5 },
    { v: "giorno", label: "Quasi ogni giorno", peso: 8 },
    { v: "esplosivo", label: "Esplosioni che spaventano me o gli altri", peso: 10 }
  ],
  area: "rabbia",
  if: function (a) { return a.aree && a.aree.indexOf("rabbia") >= 0; }
});

Q.push({
  id: "altro_descr",
  fase: "approfondimento",
  tipo: "testo",
  titolo: "Vuoi raccontarmi in due righe che cosa succede?",
  aiuto: "Scrivi liberamente. Resta sul tuo dispositivo.",
  placeholder: "Quello che vuoi farmi capire…",
  area: "altro",
  multiline: true,
  if: function (a) { return a.aree && a.aree.indexOf("altro") >= 0; }
});

/* -------------------------------------------------------------------- Storia */

Q.push({
  id: "terapia",
  fase: "storia",
  tipo: "scelta",
  titolo: "Hai già fatto un percorso psicologico?",
  aiuto: "Anche un percorso breve o interrotto conta.",
  opzioni: [
    { v: "no", label: "No, mai" },
    { v: "concluso", label: "Sì, concluso" },
    { v: "corso", label: "Sì, è in corso" },
    { v: "interrotto", label: "Sì, interrotto" }
  ]
});

Q.push({
  id: "farmaci",
  fase: "storia",
  tipo: "scelta",
  titolo: "Prendi farmaci in questo periodo?",
  aiuto: "Non serve il nome. Se prendi psicofarmaci, la relazione lo segnalerà senza dettagli.",
  opzioni: [
    { v: "no", label: "No" },
    { v: "psiche", label: "Sì, per umore, ansia o sonno" },
    { v: "altro", label: "Sì, per altre condizioni" },
    { v: "passo", label: "Preferisco non dirlo" }
  ]
});

Q.push({
  id: "salute",
  fase: "storia",
  tipo: "multipla",
  titolo: "C'è qualcosa nella tua salute che può influire su umore o energia?",
  aiuto: "Alcune condizioni mediche imitano ansia o depressione: è utile segnalarle al professionista.",
  opzioni: [
    { v: "tiroide", label: "Tiroide" },
    { v: "ferro", label: "Anemia o carenze (ferro, B12, vitamina D)" },
    { v: "dolore", label: "Dolore cronico" },
    { v: "cuore", label: "Problemi cardiaci o pressione" },
    { v: "gravidanza", label: "Gravidanza o post-partum" },
    { v: "menopausa", label: "Menopausa o ciclo irregolare" },
    { v: "nessuna", label: "Nessuna di queste" }
  ]
});

Q.push({
  id: "sostanzeFrequenza",
  fase: "storia",
  tipo: "scelta",
  titolo: "Quanto spesso bevi alcolici o usi sostanze?",
  aiuto: "Una risposta onesta aiuta la qualità della relazione.",
  opzioni: [
    { v: "mai", label: "Mai" },
    { v: "occasionale", label: "Occasionalmente" },
    { v: "settimana", label: "Più volte a settimana" },
    { v: "giorno", label: "Quasi ogni giorno" }
  ]
});

Q.push({
  id: "eventi",
  fase: "storia",
  tipo: "multipla",
  titolo: "Negli ultimi dodici mesi è cambiato qualcosa di importante?",
  aiuto: "Anche eventi positivi possono pesare.",
  opzioni: [
    { v: "lutto", label: "Una perdita" },
    { v: "separazione", label: "Separazione o rottura" },
    { v: "lavoro", label: "Perdita o cambio di lavoro" },
    { v: "casa", label: "Trasloco o cambio città" },
    { v: "malattia", label: "Una malattia, mia o di un familiare" },
    { v: "nascita", label: "Una nascita" },
    { v: "studio", label: "Esami o percorso di studio" },
    { v: "nessuno", label: "Nessun cambiamento rilevante" }
  ]
});

Q.push({
  id: "famiglia",
  fase: "storia",
  tipo: "scelta",
  titolo: "Nella tua famiglia qualcuno ha avuto difficoltà psicologiche?",
  aiuto: "La familiarità è un'informazione tra molte, non un destino.",
  opzioni: [
    { v: "no", label: "No" },
    { v: "si", label: "Sì" },
    { v: "nonso", label: "Non lo so" }
  ]
});

Q.push({
  id: "infanzia",
  fase: "storia",
  tipo: "scelta",
  titolo: "Come descriveresti la tua infanzia?",
  aiuto: "Puoi anche preferire di non rispondere: è una domanda delicata.",
  opzioni: [
    { v: "serena", label: "Serena" },
    { v: "alti", label: "Con alti e bassi" },
    { v: "difficile", label: "Difficile" },
    { v: "passo", label: "Preferisco non rispondere" }
  ]
});

/* -------------------------------------------------------------- Funzionamento */

Q.push({
  id: "fn_energia",
  fase: "funzionamento",
  tipo: "scala",
  titolo: "Come va la tua energia in questi giorni?",
  aiuto: "0 «nessuna», 10 «buona».",
  min: 0, max: 10, valore: 5,
  etichette: ["Nessuna", "Buona"],
  area: "funzionamento",
  invertita: true
});

Q.push({
  id: "fn_sonnoQ",
  fase: "funzionamento",
  tipo: "scala",
  titolo: "Come valuti la qualità del tuo sonno?",
  aiuto: "0 «pessima», 10 «ottima».",
  min: 0, max: 10, valore: 5,
  etichette: ["Pessima", "Ottima"],
  area: "funzionamento",
  invertita: true
});

Q.push({
  id: "fn_concentrazione",
  fase: "funzionamento",
  tipo: "scala",
  titolo: "Quanto riesci a concentrarti?",
  aiuto: "0 «per niente», 10 «come sempre».",
  min: 0, max: 10, valore: 5,
  etichette: ["Per niente", "Come sempre"],
  area: "funzionamento",
  invertita: true
});

Q.push({
  id: "fn_relazioni",
  fase: "funzionamento",
  tipo: "scala",
  titolo: "Quanto ti senti sostenuto/a dalle persone intorno?",
  aiuto: "0 «per niente», 10 «molto».",
  min: 0, max: 10, valore: 5,
  etichette: ["Per niente", "Molto"],
  area: "funzionamento",
  invertita: true
});

Q.push({
  id: "fn_giornata",
  fase: "funzionamento",
  tipo: "scala",
  titolo: "Quanto riesci a svolgere le cose di ogni giorno?",
  aiuto: "Casa, lavoro, commissioni, cura di te.",
  min: 0, max: 10, valore: 5,
  etichette: ["Con grande fatica", "Senza problemi"],
  area: "funzionamento",
  invertita: true
});

/* ------------------------------------------------------------------ Sicurezza */

Q.push({
  id: "sic_pensieri",
  fase: "sicurezza",
  tipo: "scelta",
  titolo: "Nelle ultime due settimane hai pensato che sarebbe meglio non esserci, o di farti del male?",
  aiuto: "È una domanda diretta e rispettosa. Rispondere onestamente aiuta a capire di che tipo di aiuto hai bisogno. Non sei solo/a.",
  opzioni: [
    { v: "no", label: "No", rischio: 0 },
    { v: "fugaci", label: "Sì, pensieri fugaci, senza intenzione", rischio: 2 },
    { v: "ricorrenti", label: "Sì, pensieri ricorrenti", rischio: 3 },
    { v: "piano", label: "Sì, ho un piano o ho già fatto qualcosa", rischio: 4 }
  ],
  area: "sicurezza"
});

Q.push({
  id: "sic_sicuro",
  fase: "sicurezza",
  tipo: "scelta",
  titolo: "In questo momento ti senti al sicuro?",
  aiuto: "Non c'è una risposta giusta. Se non ti senti al sicuro, parliamone subito.",
  opzioni: [
    { v: "si", label: "Sì" },
    { v: "no", label: "No" },
    { v: "nonso", label: "Non lo so" }
  ],
  if: function (a) { return a.sic_pensieri && a.sic_pensieri !== "no"; }
});

Q.push({
  id: "sic_autolesione",
  fase: "sicurezza",
  tipo: "scelta",
  titolo: "Negli ultimi dodici mesi ti sei fatto/a del male di proposito?",
  aiuto: "Anche una volta sola. Non è un giudizio: è un'informazione clinica importante.",
  opzioni: [
    { v: "no", label: "No", rischio: 0 },
    { v: "una", label: "Una volta", rischio: 2 },
    { v: "alcune", label: "Più di una volta", rischio: 3 },
    { v: "passo", label: "Preferisco non rispondere", rischio: 1 }
  ],
  area: "sicurezza"
});

Q.push({
  id: "sic_violenza",
  fase: "sicurezza",
  tipo: "scelta",
  titolo: "Qualcuno ti fa del male, ti minaccia o ti controlla?",
  aiuto: "Vale anche in casa. Esistono servizi gratuiti e riservati: il 1522 risponde 24 ore su 24.",
  opzioni: [
    { v: "no", label: "No", rischio: 0 },
    { v: "si", label: "Sì", rischio: 3 },
    { v: "passo", label: "Preferisco non rispondere", rischio: 1 }
  ],
  area: "sicurezza"
});

Q.push({
  id: "sic_allerta",
  fase: "sicurezza",
  tipo: "allerta",
  titolo: "Fermiamoci un momento.",
  testo: "Quello che hai scritto merita attenzione immediata. Non devi gestirlo da solo/a.",
  if: function (a) {
    return (a.sic_pensieri === "ricorrenti" || a.sic_pensieri === "piano" || a.sic_sicuro === "no" || a.sic_autolesione === "alcune" || a.sic_violenza === "si");
  }
});

/* -------------------------------------------------------------------- Risorse */

Q.push({
  id: "rete",
  fase: "risorse",
  tipo: "multipla",
  titolo: "Su chi puoi contare oggi?",
  aiuto: "Anche una sola persona conta.",
  opzioni: [
    { v: "partner", label: "Partner o coniuge" },
    { v: "famiglia", label: "Famiglia" },
    { v: "amici", label: "Amici" },
    { v: "colleghi", label: "Colleghi o compagni" },
    { v: "comunita", label: "Comunità, associazione, fede" },
    { v: "professionisti", label: "Un professionista" },
    { v: "nessuno", label: "In questo momento nessuno" }
  ]
});

Q.push({
  id: "forze",
  fase: "risorse",
  tipo: "multipla",
  titolo: "Che cosa ti ha aiutato ad attraversare i periodi difficili?",
  aiuto: "Sono le tue risorse: nella relazione le metteremo accanto ai problemi.",
  opzioni: [
    { v: "determinazione", label: "Determinazione" },
    { v: "umorismo", label: "Umorismo" },
    { v: "curiosita", label: "Curiosità" },
    { v: "fede", label: "Fede o spiritualità" },
    { v: "creativita", label: "Creatività" },
    { v: "disciplina", label: "Disciplina e routine" },
    { v: "empatia", label: "Empatia e cura degli altri" },
    { v: "rete", label: "Una rete solida" }
  ]
});

Q.push({
  id: "obiettivi",
  fase: "risorse",
  tipo: "testo",
  titolo: "Cosa vorresti ottenere da questo percorso?",
  aiuto: "Anche un obiettivo piccolo va bene. Comparirà nella relazione.",
  placeholder: "Per esempio: dormire meglio, capire se è depressione, litigare meno a casa…",
  multiline: true,
  maxlength: 600
});

Q.push({
  id: "aspettative",
  fase: "risorse",
  tipo: "scelta",
  titolo: "Che tipo di aiuto stai cercando?",
  aiuto: "Serve a orientare il suggerimento finale.",
  opzioni: [
    { v: "capire", label: "Capire meglio cosa mi sta succedendo" },
    { v: "stare", label: "Stare meglio, con strumenti concreti" },
    { v: "terapia", label: "Decidere se iniziare una psicoterapia" },
    { v: "preparare", label: "Prepararmi a un colloquio con un professionista" },
    { v: "altro", label: "Qualcos'altro" }
  ]
});

Q.push({
  id: "disponibilita",
  fase: "risorse",
  tipo: "scelta",
  titolo: "Se decidessi di iniziare un percorso, che disponibilità avresti?",
  aiuto: "Non è un impegno: è un'indicazione per il professionista.",
  opzioni: [
    { v: "settimanale", label: "Un incontro a settimana" },
    { v: "bisettimanale", label: "Ogni due settimane" },
    { v: "online", label: "Preferirei online" },
    { v: "nonso", label: "Non lo so ancora" }
  ]
});

Q.push({
  id: "urgenza",
  fase: "risorse",
  tipo: "scelta",
  titolo: "Quanto è urgente, per te, parlarne con qualcuno?",
  aiuto: "Aiuta a calibrare il suggerimento finale.",
  opzioni: [
    { v: "calma", label: "Posso prendermi qualche settimana" },
    { v: "presto", label: "Preferirei entro pochi giorni" },
    { v: "subito", label: "Il prima possibile" }
  ]
});

/* ---------------------------------------------------------------------- Fine */

Q.push({
  id: "fine",
  fase: "restituzione",
  tipo: "fine",
  titolo: "Il quadro preliminare è pronto",
  aiuto: "Ho messo in ordine ciò che mi hai raccontato. Puoi leggerlo, correggerlo e portarlo con te.",
  if: function () { return true; }
});

NP.data.intake = Q;
