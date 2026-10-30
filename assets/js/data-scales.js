/* ==========================================================================
   Psicologo Digitale · questionari di autovalutazione
   Licenza del codice: MIT · Contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   --------------------------------------------------------------------------
   Gli item sono formulati in italiano per questo programma e si ispirano a
   costrutti e strumenti validati (PHQ-9, GAD-7, PSS-10, WHO-5, ISI e scale
   di esaurimento professionale). Non sono la versione ufficiale degli
   strumenti originali e non producono diagnosi.
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.scales = [
  {
    id: "umore",
    sigla: "UMS-9",
    titolo: "Umore, interesse e piacere",
    area: "Umore",
    tempo: "3 minuti",
    icona: "heart",
    istruzioni: "Nelle ultime due settimane, quanto spesso ti è capitato quanto segue?",
    perche: "Esplora il tono dell'umore, l'interesse, l'energia e la fiducia in sé. È l'area che più spesso accompagna ansia, stress e cambiamenti di vita.",
    opzioni: ["Mai", "Alcuni giorni", "Più della metà dei giorni", "Quasi ogni giorno"],
    items: [
      { k: "interesse", t: "Poco interesse o piacere nel fare cose che di solito ti piacciono" },
      { k: "tristezza", t: "Sentirti giù, triste, vuoto/a o senza speranza" },
      { k: "sonno", t: "Difficoltà ad addormentarti, svegliarti di notte o dormire troppo" },
      { k: "energia", t: "Sentirti stanco/a o con poca energia" },
      { k: "appetito", t: "Poco appetito oppure mangiare più del solito" },
      { k: "colpa", t: "Pensare male di te, sentirti un fallimento o in colpa" },
      { k: "concentrazione", t: "Difficoltà a concentrarti su letture, lavoro, studio o conversazioni" },
      { k: "psicomotorio", t: "Muoverti o parlare più lentamente del solito, oppure essere irrequieto/a" },
      { k: "rischio", t: "Pensieri che sarebbe meglio essere morto/a o di farti del male", rischio: true }
    ],
    punteggio: {
      tipo: "somma",
      min: 0,
      max: 27,
      bande: [
        { fino: 4, livello: 1, label: "Assente o minimo", testo: "Non emergono segnali rilevanti in quest'area nelle ultime due settimane. Resta utile osservare come cambia nelle prossime settimane." },
        { fino: 9, livello: 2, label: "Lieve", testo: "Sono presenti alcuni segnali di umore basso. Possono essere una reazione a un periodo difficile; se durano o aumentano, vale la pena parlarne con un professionista." },
        { fino: 14, livello: 3, label: "Moderato", testo: "Il quadro è compatibile con un disagio dell'umore di entità moderata. Una valutazione professionale è consigliabile, soprattutto se il sonno, il lavoro o le relazioni ne risentono." },
        { fino: 19, livello: 4, label: "Moderatamente grave", testo: "I segnali sono consistenti. È opportuno un confronto con uno psicologo o uno psicoterapeuta e, se il medico lo ritiene, una valutazione medica." },
        { fino: 27, livello: 5, label: "Grave", testo: "Il livello di sofferenza riportato è alto. Rivolgiti quanto prima a un professionista della salute mentale; se compaiono pensieri di farsi del male, chiama subito il 112." }
      ]
    },
    notaClinica: "Il nono item esplora i pensieri di morte: se ottiene un punteggio superiore a zero, il programma apre immediatamente la scheda di sicurezza. Un punteggio alto non è una diagnosi di depressione: la diagnosi richiede un colloquio clinico e la valutazione di durata, compromissione e altre cause.",
    cosaPortare: ["Da quanto tempo dura questo periodo", "Se c'è stato un evento scatenante", "Come dormi e come mangi", "Se hai già parlato con qualcuno o assunto farmaci"],
    riferimenti: ["Kroenke K. et al., PHQ-9, J Gen Intern Med 2001", "Linee guida NICE su depressione negli adulti", "DSM-5-TR, disturbo depressivo maggiore"]
  },
  {
    id: "ansia",
    sigla: "ANS-7",
    titolo: "Ansia, tensione e preoccupazione",
    area: "Ansia",
    tempo: "2 minuti",
    icona: "wave",
    istruzioni: "Nelle ultime due settimane, quanto spesso ti è capitato quanto segue?",
    perche: "Distingue la preoccupazione fisiologica da quella che occupa la giornata, disturba il sonno e spinge a evitare situazioni.",
    opzioni: ["Mai", "Alcuni giorni", "Più della metà dei giorni", "Quasi ogni giorno"],
    items: [
      { k: "nervoso", t: "Sentirti nervoso/a, ansioso/a o con i nervi a fior di pelle" },
      { k: "preoccupazione", t: "Non riuscire a smettere o a controllare la preoccupazione" },
      { k: "troppo", t: "Preoccuparti troppo per cose diverse" },
      { k: "rilassarsi", t: "Difficoltà a rilassarti" },
      { k: "irrequietezza", t: "Essere così irrequieto/a da faticare a stare fermo/a" },
      { k: "irritabilità", t: "Essere irritabile o facilmente infastidito/a" },
      { k: "paura", t: "Provare paura, come se potesse succedere qualcosa di brutto" }
    ],
    punteggio: {
      tipo: "somma",
      min: 0,
      max: 21,
      bande: [
        { fino: 4, livello: 1, label: "Assente o minimo", testo: "L'ansia riportata è contenuta. Se in alcuni momenti sale, prova un esercizio di respirazione lenta o di ancoraggio." },
        { fino: 9, livello: 2, label: "Lieve", testo: "Una quota di ansia è presente. Utile capire in quali situazioni aumenta, cosa eviti e quanto ti costa." },
        { fino: 14, livello: 3, label: "Moderato", testo: "L'ansia sembra occupare una parte importante della giornata. Una valutazione professionale aiuta a distinguere preoccupazione, evitamento e sintomi fisici." },
        { fino: 21, livello: 5, label: "Grave", testo: "Il livello riportato è alto e può interferire con sonno, lavoro e relazioni. È consigliabile un confronto tempestivo con uno psicologo o uno psicoterapeuta." }
      ]
    },
    notaClinica: "L'ansia è normale e utile: diventa un problema quando è sproporzionata, persistente e porta a evitare ciò che conta. Il questionario non distingue tra disturbo d'ansia generalizzata, attacchi di panico, fobia sociale e ansia da salute: serve il colloquio clinico.",
    cosaPortare: ["Le situazioni che eviti", "I sintomi fisici (respiro, cuore, stomaco)", "Quanto durano gli episodi acuti", "Caffeina, alcol, sonno e sostanze"],
    riferimenti: ["Spitzer R.L. et al., GAD-7, Arch Intern Med 2006", "Linee guida NICE su disturbo d'ansia generalizzata", "DSM-5-TR, disturbi d'ansia"]
  },
  {
    id: "stress",
    sigla: "STR-10",
    titolo: "Stress percepito",
    area: "Stress",
    tempo: "3 minuti",
    icona: "activity",
    istruzioni: "Nell'ultimo mese, quanto spesso ti sei sentito/a in questo modo?",
    perche: "Misura quanto la vita ti sembra imprevedibile, fuori controllo o sovraccarica: un fattore che influenza sonno, umore e salute fisica.",
    opzioni: ["Mai", "Quasi mai", "A volte", "Spesso", "Molto spesso"],
    items: [
      { k: "teso", t: "Nervoso/a e teso/a" },
      { k: "controllo", t: "Incapace di controllare le cose importanti della tua vita" },
      { k: "agitato", t: "Agitato/a e stressato/a" },
      { k: "fiducia", t: "Sicuro/a della tua capacità di gestire i problemi personali", inverso: true },
      { k: "comeVolevi", t: "Che le cose andassero come volevi", inverso: true },
      { k: "troppo", t: "Di non farcela con tutte le cose che dovevi fare" },
      { k: "irritazioni", t: "Capace di controllare le irritazioni della tua vita", inverso: true },
      { k: "sopra", t: "Di avere tutto sotto controllo", inverso: true },
      { k: "arrabbiato", t: "Arrabbiato/a per cose che sfuggivano al tuo controllo" },
      { k: "accumulo", t: "Che le difficoltà si accumulassero tanto da non riuscire a superarle" }
    ],
    punteggio: {
      tipo: "somma",
      min: 0,
      max: 40,
      bande: [
        { fino: 13, livello: 1, label: "Basso", testo: "Lo stress percepito è contenuto. Le tue risorse sembrano sufficienti per il carico attuale." },
        { fino: 26, livello: 3, label: "Moderato", testo: "Il carico è presente e inizia a erodere energia e lucidità. Utile lavorare su priorità, recupero e confini." },
        { fino: 40, livello: 5, label: "Alto", testo: "Lo stress percepito è elevato e può pesare su sonno, umore e salute. È consigliabile un confronto professionale e una revisione concreta dei carichi." }
      ]
    },
    notaClinica: "Lo stress non è una diagnosi: è la relazione tra domande e risorse percepite. Quattro item sono formulati in positivo e vengono invertiti nel calcolo, come nelle scale di stress perceputo.",
    cosaPortare: ["Quante ore lavori o studi", "Cosa hai smesso di fare per il carico", "Quali sintomi fisici noti", "Chi può aiutarti concretamente"],
    riferimenti: ["Cohen S. et al., Perceived Stress Scale, 1983", "APA, Stress in America", "OMS, stress occupazionale"]
  },
  {
    id: "sonno",
    sigla: "SON-7",
    titolo: "Sonno e recupero",
    area: "Sonno",
    tempo: "2 minuti",
    icona: "moon",
    istruzioni: "Nell'ultimo mese, quanto spesso ti è capitato?",
    perche: "Il sonno è il primo segnale che cambia in ansia, umore basso e burnout. Migliorarlo spesso migliora tutto il resto.",
    opzioni: ["Mai", "1-2 notti a settimana", "3-4 notti a settimana", "5-6 notti a settimana", "Quasi ogni notte"],
    items: [
      { k: "addormentarsi", t: "Impiegare più di 30 minuti per addormentarti" },
      { k: "risvegli", t: "Svegliarti durante la notte e faticare a riaddormentarti" },
      { k: "precoce", t: "Svegliarti prima del previsto senza riuscire a dormire ancora" },
      { k: "riposato", t: "Sentirti poco riposato/a al mattino" },
      { k: "ore", t: "Dormire meno di sei ore" },
      { k: "diurno", t: "Avere sonnolenza diurna che interferisce con le attività" },
      { k: "aiuti", t: "Usare farmaci, alcol o altri aiuti per dormire" }
    ],
    punteggio: {
      tipo: "somma",
      min: 0,
      max: 28,
      bande: [
        { fino: 6, livello: 1, label: "Buono", testo: "Il sonno sembra reggere. Mantieni orari stabili e una routine di rallentamento la sera." },
        { fino: 13, livello: 2, label: "Lieve", testo: "Qualche notte difficile. Prima di tutto: orari regolari, luce al mattino, meno caffeina nel pomeriggio, letto solo per dormire." },
        { fino: 20, livello: 4, label: "Moderato", testo: "Il sonno è disturbato in modo significativo. La psicoterapia cognitivo-comportamentale per l'insonnia è il trattamento di prima scelta: parlane con un professionista." },
        { fino: 28, livello: 5, label: "Marcato", testo: "L'insonnia riportata è marcata e probabilmente amplifica ansia, umore e stanchezza. Rivolgiti al medico o a uno specialista del sonno, soprattutto se russi forte o ti addormenti di giorno." }
      ]
    },
    notaClinica: "Russamento forte, pause respiratorie riferite dal partner, sonnolenza alla guida o mal di testa al risveglio richiedono una valutazione medica per sospetta apnea ostruttiva del sonno. I farmaci ipnotici non sono la prima scelta per l'insonnia cronica.",
    cosaPortare: ["Orari reali di sonno e veglia", "Quanto tempo passi a letto sveglio/a", "Caffeina, alcol, schermi", "Russamento o pause respiratorie"],
    riferimenti: ["Bastien C.H. et al., Insomnia Severity Index, 2001", "Linee guida europee ESRS sull'insonnia", "AASM, raccomandazioni sul sonno"]
  },
  {
    id: "esaurimento",
    sigla: "ESA-8",
    titolo: "Esaurimento e carico di lavoro",
    area: "Lavoro e studio",
    tempo: "3 minuti",
    icona: "battery",
    istruzioni: "Pensando agli ultimi tre mesi, quanto spesso ti riconosci in queste frasi?",
    perche: "Il burnout non è una malattia ma un fenomeno legato al lavoro: esaurimento, distacco mentale ed efficacia ridotta. Riconoscerlo presto cambia le scelte possibili.",
    opzioni: ["Mai", "Raramente", "A volte", "Spesso", "Quasi sempre"],
    items: [
      { k: "svuotato", t: "Mi sento emotivamente svuotato/a dal lavoro o dagli impegni" },
      { k: "mattino", t: "Al mattino mi pesa dover affrontare la giornata" },
      { k: "distacco", t: "Mi sono allontanato/a mentalmente da ciò che faccio" },
      { k: "senso", t: "Dubito dell'utilità o del senso di quello che faccio" },
      { k: "efficacia", t: "Mi sento inefficace davanti ai problemi" },
      { k: "recupero", t: "Non riesco a recuperare energia nemmeno nel tempo libero" },
      { k: "irritabile", t: "Sono irritabile o intollerante verso colleghi, utenti o familiari" },
      { k: "minimo", t: "Ho ridotto l'impegno e faccio il minimo indispensabile" }
    ],
    punteggio: {
      tipo: "somma",
      min: 0,
      max: 32,
      bande: [
        { fino: 8, livello: 1, label: "Basso", testo: "Non emergono segnali rilevanti di esaurimento. Continua a proteggere recupero e confini." },
        { fino: 17, livello: 2, label: "Moderato", testo: "Alcuni segnali di affaticamento sono presenti. Vale la pena rivedere carichi, pause e possibilità di delega." },
        { fino: 26, livello: 4, label: "Alto", testo: "Il livello di esaurimento è alto. Parlarne con il medico di base e con un professionista aiuta a prevenire conseguenze su sonno, umore e salute." },
        { fino: 32, livello: 5, label: "Molto alto", testo: "Il quadro è severo. Non è pigrizia né mancanza di volontà: serve una pausa reale e un supporto professionale. Se il lavoro è insostenibile, valuta tutele e alternative." }
      ]
    },
    notaClinica: "L'OMS colloca il burnout (ICD-11, QD85) tra i fenomeni legati al lavoro, non tra le malattie. Non va confuso con la depressione, anche se i due quadri possono convivere: solo una valutazione clinica può distinguerli.",
    cosaPortare: ["Quante ore lavori e quanto recuperi", "Cosa è cambiato negli ultimi mesi", "Se il problema è il carico, il ruolo o il clima", "Cosa ti aiuterebbe davvero"],
    riferimenti: ["OMS, ICD-11, QD85 burnout", "Maslach C., Burnout: the Cost of Caring", "EU-OSHA, rischi psicosociali"]
  },
  {
    id: "benessere",
    sigla: "BEN-5",
    titolo: "Benessere generale",
    area: "Risorse",
    tempo: "2 minuti",
    icona: "spark",
    istruzioni: "Nelle ultime due settimane, per quanto tempo ti sei sentito/a così?",
    perche: "Non misura solo i sintomi: guarda a vitalità, interesse e piacere. Serve a bilanciare il quadro e a vedere le risorse, non solo le difficoltà.",
    opzioni: ["In nessun momento", "Raramente", "Meno della metà del tempo", "Più della metà del tempo", "Quasi sempre", "Sempre"],
    items: [
      { k: "allegro", t: "Allegro/a e di buon umore" },
      { k: "calmo", t: "Calmo/a e rilassato/a" },
      { k: "attivo", t: "Attivo/a ed energico/a" },
      { k: "riposato", t: "Sveglio/a e riposato/a al mattino" },
      { k: "interessi", t: "La mia giornata è stata piena di cose che mi interessano" }
    ],
    punteggio: {
      tipo: "scala100",
      min: 0,
      max: 25,
      bande: [
        { fino: 27, livello: 5, label: "Molto basso", testo: "Il benessere percepito è molto basso. È un segnale da non sottovalutare: parlane con un professionista." },
        { fino: 50, livello: 4, label: "Basso", testo: "Il benessere è sotto la soglia di attenzione. Può valere una valutazione, soprattutto se il quadro dura da più di due settimane." },
        { fino: 68, livello: 2, label: "Discreto", testo: "Ci sono risorse, ma con alti e bassi. Utile coltivare recupero, relazioni e attività che danno senso." },
        { fino: 100, livello: 1, label: "Buono", testo: "Il benessere percepito è buono. Proteggi le abitudini che lo sostengono e affronta presto i primi segnali di cambiamento." }
      ]
    },
    notaClinica: "Punteggio grezzo 0-25, riportato a 0-100 moltiplicando per quattro. Un valore pari o inferiore a 50 è considerato una soglia di attenzione per un eventuale screening depressivo. Non è un test diagnostico.",
    cosaPortare: ["Cosa ti fa stare bene oggi", "Chi c'è nella tua rete", "Quali abitudini vuoi proteggere", "Cosa ti piacerebbe cambiare"],
    riferimenti: ["WHO-5 Well-Being Index, Psychiatric Research Unit, Hillerød", "Topp C.W. et al., WHO-5, 2015"]
  }
];

NP.data.scaleBands = function () {
  var out = [];
  NP.data.scales.forEach(function (s) {
    s.punteggio.bande.forEach(function (b) {
      out.push({ area: s.area, label: b.label, livello: b.livello });
    });
  });
  return out;
};
