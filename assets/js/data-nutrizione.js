/* ==========================================================================
   Psicologo Digitale · nutrizione e umore
   Licenza dei contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   --------------------------------------------------------------------------
   Materiale divulgativo. Non è una dieta, non è una prescrizione e non
   sostituisce dietista, dietologo, biologo nutrizionista o medico.
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.nutrizione = {
  introduzione:
    "Mangiare non è solo carburante: è sonno, energia, umore, digestione, relazioni e spesso anche il modo " +
    "in cui ci prendiamo cura di noi. Questa sezione non ti dà una dieta e non ti dice cosa devi pesare. " +
    "Serve a capire cosa conta davvero, quali domande portare a chi è competente e quando il cibo smette " +
    "di essere un piacere e diventa una preoccupazione.",

  avviso:
    "Nessuna pagina web può sostituire una valutazione. Se il rapporto con il cibo ti sta causando sofferenza, " +
    "se il peso cambia senza volerlo o se qualcuno ti ha parlato di un disturbo alimentare, la strada giusta " +
    "è un professionista, non un'app.",

  principi: [
    {
      t: "La regolarità conta più della perfezione",
      d: "Il corpo lavora meglio con orari stabili: colazione, pranzo, cena e, se serve, uno spuntino. Saltare i pasti per rimediare a un pasto abbondante è la mossa che più spesso peggiora fame, umore e sonno. Non esiste il pasto «sbagliato» da espiare."
    },
    {
      t: "Il modello mediterraneo regge il confronto",
      d: "È uno dei modelli alimentari più studiati: verdure e frutta in abbondanza, legumi, cereali integrali, pesce, olio d'oliva, frutta secca; carne rossa e dolci con moderazione. Non è una moda: è una tradizione con alle spalle anni di osservazione."
    },
    {
      t: "La fibra parla con l'intestino e con l'umore",
      d: "Legumi, cereali integrali, verdura e frutta nutrono la flora intestinale. Le indicazioni italiane parlano di circa 25 grammi al giorno per un adulto; la maggior parte delle persone ne mangia meno della metà. Si aumenta piano, bevendo di più."
    },
    {
      t: "Caffeina e alcol si sentono sul sonno",
      d: "La caffeina resta in circolo per ore: un caffè alle 17 può pesare alle 23. L'alcol fa addormentare prima ma frammenta la seconda metà della notte, e il sonno perso si ripercuote su umore e fame del giorno dopo."
    },
    {
      t: "Muoversi e vedere la luce del mattino",
      d: "Non è nutrizione, ma lavora sullo stesso sistema: una camminata e venti minuti di luce naturale al mattino aiutano ritmo sonno-veglia, appetito e tono dell'umore. Vale più di qualsiasi integratore."
    }
  ],

  piatto: {
    titolo: "Un piatto che regge, senza bilancia",
    intro:
      "Non è una prescrizione: è un'immagine pratica da tenere a mente quando devi decidere cosa mettere nel piatto. Le quantità vere dipendono da età, sesso, attività, salute e cultura, e le stabilisce chi ti valuta.",
    righe: [
      { parte: "Metà del piatto", cosa: "Verdura, cotta o cruda, di colori diversi. La frutta sta fuori dal piatto: due o tre porzioni al giorno." },
      { parte: "Un quarto", cosa: "Proteine: legumi, pesce, uova, carne bianca, formaggi con moderazione. I legumi contano sia come proteine sia come fibra." },
      { parte: "Un quarto", cosa: "Carboidrati: pasta, riso, pane, patate, meglio se integrali e alternati nel corso della settimana." },
      { parte: "Un filo", cosa: "Grassi buoni: olio d'oliva a crudo, frutta secca non salata, semi. Bastano piccole quantità." },
      { parte: "Sempre", cosa: "Acqua. Circa un litro e mezzo o due al giorno, di più con caldo e attività fisica." }
    ]
  },

  ritmo: [
    { t: "Colazione", d: "Non deve essere perfetta, deve esserci. Se al mattino non hai fame, meglio qualcosa di piccolo che niente: un frutto e uno yogurt, pane e un velo di marmellata, latte e fiocchi." },
    { t: "Pranzo", d: "Il pasto che più spesso si salta per lavoro. Un piatto unico con cereali, legumi e verdura è la soluzione più rapida e completa." },
    { t: "Cena", d: "Meglio non troppo tardi e non troppo abbondante: il sonno ringrazia. Se la cena è il pasto conviviale della famiglia, va bene lo stesso, basta non trasformarla ogni sera in una maratona." },
    { t: "Spuntini", d: "Servono se la distanza tra i pasti è lunga: frutta, yogurt, una manciata di frutta secca, un pezzo di formaggio. Non sono un premio né una colpa." }
  ],

  segnali: [
    "Perdita o aumento di peso involontario, superiore al cinque per cento in un mese.",
    "Restringere sempre di più ciò che mangi, contare calorie o grammi in modo ossessivo, saltare pasti in modo ricorrente.",
    "Abbuffate con la sensazione di perdere il controllo e, dopo, vergogna o comportamenti di compenso.",
    "Vomito autoindotto, uso di lassativi o diuretici, esercizio fisico usato per «bruciare» ciò che hai mangiato.",
    "Paura intensa di ingrassare che condiziona scelte, uscite e relazioni.",
    "Il pensiero del cibo occupa gran parte della giornata e ti impedisce di fare altro.",
    "Amenorrea non spiegata, svenimenti, battito accelerato, dolore toracico, vomito persistente.",
    "Dolore addominale che non passa, difficoltà a deglutire, sangue nelle feci, gonfiore improvviso."
  ],

  segnaliNota:
    "Se riconosci anche solo uno dei primi sei segnali, non aspettare: parlane con il medico di base o con un centro " +
    "per i disturbi dell'alimentazione della tua azienda sanitaria. Non è un problema di volontà e non si risolve con " +
    "forza di carattere. Per un malessere improvviso chiama il 112.",

  professionisti: [
    {
      ruolo: "Dietista",
      chi: "Laurea triennale in Dietistica, professione sanitaria con albo dedicato. Lavora in ospedale, in consultorio, in ambulatorio o in studio.",
      cosa: "Valuta lo stato nutrizionale, educa, costruisce e accompagna un piano alimentare, gestisce allergie e intolleranze insieme al medico.",
      quando: "Quando serve un piano concreto e un accompagnamento nel tempo, anche attraverso il servizio pubblico."
    },
    {
      ruolo: "Dietologo",
      chi: "Medico laureato in Medicina e specializzato in Scienza dell'alimentazione.",
      cosa: "Inquadra anche le patologie, prescrive esami, diete e, se serve, farmaci; collabora con altri specialisti.",
      quando: "Quando c'è una malattia da gestire, un peso che mette a rischio la salute o più problemi insieme."
    },
    {
      ruolo: "Biologo nutrizionista",
      chi: "Laurea magistrale in Biologia, iscrizione all'albo dei biologi e competenza specifica in nutrizione.",
      cosa: "Elabora piani alimentari per persone sane o con condizioni stabilizzate; non è un medico e non prescrive farmaci.",
      quando: "Quando serve un percorso nutrizionale in studio privato, senza patologie mediche da trattare."
    },
    {
      ruolo: "Medico di medicina generale",
      chi: "Il tuo medico di base.",
      cosa: "È il primo passo: visita, esami, valutazione del rischio, invio allo specialista giusto e, se serve, prescrizioni.",
      quando: "Sempre, come punto di partenza, e obbligatoriamente se ci sono sintomi fisici o farmaci in corso."
    },
    {
      ruolo: "Psicologo o psicoterapeuta",
      chi: "Professionista della salute mentale iscritto all'albo.",
      cosa: "Lavora sulla relazione con il cibo, sull'immagine corporea e sui disturbi alimentari, spesso in équipe con dietista e medico.",
      quando: "Quando il cibo è diventato un modo per gestire emozioni, o quando è stato diagnosticato un disturbo alimentare."
    }
  ],

  domande: [
    "Quali esami del sangue servono prima di cambiare alimentazione?",
    "Quanto tempo serve per vedere un effetto realistico, e come lo misuriamo?",
    "Come gestisco pranzi fuori casa, viaggi e cene con gli altri?",
    "Devo pesare gli alimenti o contare le calorie? Se sì, per quanto tempo?",
    "Cosa faccio nelle giornate in cui mangio molto più del previsto?",
    "Come capiamo se il problema è il cibo, l'ansia o tutti e due?",
    "Ci sono interazioni con i farmaci che prendo?",
    "A chi posso rivolgermi nel servizio pubblico, e con quali tempi?"
  ],

  limiti: [
    "Questa sezione non contiene diete, schemi personalizzati, grammature o integratori consigliati.",
    "Non valuta esami, non interpreta sintomi e non dice se un alimento è «vietato» per te.",
    "Non sostituisce dietista, dietologo, biologo nutrizionista o medico: sono figure con obblighi, formazione e responsabilità diverse.",
    "I disturbi del comportamento alimentare sono condizioni serie: richiedono una presa in carico specializzata, non un'app.",
    "Nessun dato che inserisci qui viene inviato: le note restano nel diario sul tuo dispositivo."
  ],

  fonti: [
    { t: "CREA · Linee guida per una sana alimentazione", u: "https://www.crea.gov.it/web/alimenti-e-nutrizione/-/linee-guida-per-una-sana-alimentazione-2018" },
    { t: "SINU · Livelli di assunzione di riferimento (LARN)", u: "https://sinu.it/2019/07/09/larn-2014/" },
    { t: "OMS · Alimentazione sana", u: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" },
    { t: "NHS · Eat well", u: "https://www.nhs.uk/live-well/eat-well/" },
    { t: "ISS · Nutrizione e salute", u: "https://www.iss.it" },
    { t: "Ministero della Salute · Nutrizione", u: "https://www.salute.gov.it" }
  ]
};
