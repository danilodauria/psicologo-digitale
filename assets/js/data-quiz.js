/* ==========================================================================
   Psicologo Digitale · Palestra della mente (quiz divulgativo)
   Licenza dei contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.quiz = {
  categorie: [
    { id: "ansia", titolo: "Ansia e paura" },
    { id: "umore", titolo: "Umore ed energia" },
    { id: "sonno", titolo: "Sonno e riposo" },
    { id: "corpo", titolo: "Corpo e stile di vita" },
    { id: "terapia", titolo: "Terapia e professionisti" },
    { id: "miti", titolo: "Miti da smontare" }
  ],
  domande: [
    {
      id: "an1", cat: "ansia", liv: "base",
      d: "Che cosa accade nel corpo durante la risposta di attacco o fuga?",
      o: ["Il corpo si attiva per affrontare un pericolo percepito", "Il corpo si spegne e perde ogni sensibilità", "L'attività cerebrale si interrompe per qualche secondo", "La pressione sanguigna scende sempre in modo pericoloso"],
      r: 0,
      sp: "Il sistema nervoso autonomo simpatico accelera cuore e respiro, tende i muscoli e aumenta il glucosio disponibile. È una risposta normale e utile, che diventa problematica quando si attiva spesso senza un pericolo reale."
    },
    {
      id: "an2", cat: "ansia", liv: "base",
      d: "Evitare una situazione che fa paura, nel breve periodo...",
      o: ["Riduce l'ansia, ma nel lungo periodo la mantiene", "Elimina definitivamente la paura", "Peggiora sempre l'ansia immediatamente", "Non ha alcun effetto misurabile"],
      r: 0,
      sp: "L'evitamento dà un sollievo immediato, ma impedisce di scoprire che la situazione è tollerabile. Così la paura non viene corretta: è il meccanismo centrale dei disturbi d'ansia."
    },
    {
      id: "an3", cat: "ansia", liv: "intermedio",
      d: "L'iperventilazione tipica dell'attacco di panico può causare:",
      o: ["Vertigini, formicolii e senso di sbandamento", "Aumento permanente della memoria", "Paralisi totale degli arti", "Riduzione del battito a valori minimi"],
      r: 0,
      sp: "Respirare rapidamente abbassa l'anidride carbonica nel sangue e può produrre vertigini, formicolii e sensazione di irrealtà. Sono sintomi spiacevoli ma non pericolosi: questa spiegazione è già parte del trattamento."
    },
    {
      id: "an4", cat: "ansia", liv: "intermedio",
      d: "Un attacco di panico, di solito, raggiunge il picco:",
      o: ["Entro i primi 10-15 minuti", "Solo dopo due ore", "Dopo una notte intera", "Solo durante il sonno profondo"],
      r: 0,
      sp: "Il picco è rapido, spesso entro 10 minuti, e si esaurisce in genere in 20-30 minuti. Conoscere la curva aiuta: il corpo non può restare attivato a lungo."
    },
    {
      id: "an5", cat: "ansia", liv: "avanzato",
      d: "Nel disturbo d'ansia generalizzata, la preoccupazione è definita problematica quando:",
      o: ["È eccessiva, difficile da controllare e dura almeno 6 mesi", "Compare solo in giorni di esame", "Riguarda sempre un unico evento concreto", "Dura meno di 24 ore"],
      r: 0,
      sp: "Il criterio temporale dei 6 mesi e la difficoltà a controllare la preoccupazione distinguono il disturbo da una normale preoccupazione. Serve comunque una valutazione clinica."
    },
    {
      id: "an6", cat: "ansia", liv: "avanzato",
      d: "L'esposizione graduale funziona perché:",
      o: ["Permette di apprendere che la paura scende senza evitare", "Distrae la persona dal problema", "Aumenta la soglia del dolore fisico", "Elimina ogni emozione negativa per sempre"],
      r: 0,
      sp: "L'esposizione è un apprendimento correttivo: il corpo si abitua e le previsioni catastrofiche vengono smentite dall'esperienza. Va costruita con gradualità, meglio se guidata da un professionista."
    },

    {
      id: "um1", cat: "umore", liv: "base",
      d: "La depressione è meglio descritta come:",
      o: ["Un disturbo che coinvolge umore, pensieri, corpo e comportamento", "Una semplice mancanza di forza di volontà", "Una condizione che riguarda solo chi ha subito un trauma", "Una scelta per attirare attenzione"],
      r: 0,
      sp: "Non è pigrizia: cambiano il tono dell'umore, l'energia, il sonno, l'appetito, la concentrazione e il modo di interpretare la realtà. Per questo serve un trattamento, non un rimprovero."
    },
    {
      id: "um2", cat: "umore", liv: "base",
      d: "Che cos'è l'attivazione comportamentale?",
      o: ["Programmare piccole attività utili o piacevoli anche quando manca la voglia", "Aspettare di stare meglio per ricominciare a fare", "Aumentare le ore di lavoro per distrarsi", "Evitare ogni impegno sociale"],
      r: 0,
      sp: "Nella depressione la voglia arriva dopo l'azione, non prima. L'attivazione comportamentale rompe il circolo 'non ho voglia → non faccio → sto peggio': è una tecnica centrale della terapia cognitivo-comportamentale."
    },
    {
      id: "um3", cat: "umore", liv: "intermedio",
      d: "Un episodio depressivo maggiore richiede, tra i criteri, una durata di:",
      o: ["Almeno due settimane", "Almeno due giorni", "Almeno sei mesi", "Almeno un anno"],
      r: 0,
      sp: "La durata minima è di due settimane, con sintomi presenti quasi ogni giorno e compromissione del funzionamento. La diagnosi differenziale spetta al clinico."
    },
    {
      id: "um4", cat: "umore", liv: "intermedio",
      d: "Il pensiero «sono un fallimento totale» è un esempio di:",
      o: ["Etichettamento e generalizzazione", "Descrizione oggettiva dei fatti", "Ipotesi scientifica verificabile", "Ricordo autobiografico accurato"],
      r: 0,
      sp: "È una distorsione cognitiva: si parte da un evento e si etichetta l'intera persona. Imparare a distinguere fatti e interpretazioni è parte del lavoro terapeutico."
    },
    {
      id: "um5", cat: "umore", liv: "avanzato",
      d: "Chiedere direttamente a una persona se ha pensieri suicidari:",
      o: ["Non aumenta il rischio e può aprire un dialogo utile", "Aumenta sempre il rischio di metterlo in atto", "È compito esclusivo dello psichiatra", "Va evitato in ogni caso"],
      r: 0,
      sp: "Le evidenze non mostrano un aumento del rischio. Una domanda diretta, rispettosa e non giudicante può aiutare la persona a sentirsi vista e a chiedere aiuto. In caso di pericolo immediato: 112."
    },
    {
      id: "um6", cat: "umore", liv: "avanzato",
      d: "Che rapporto c'è tra attività fisica e umore?",
      o: ["L'esercizio regolare ha un effetto positivo, moderato ma reale", "Non esiste alcun legame dimostrato", "Conta solo se è agonistico", "Sostituisce sempre la psicoterapia"],
      r: 0,
      sp: "L'attività fisica regolare è associata a un miglioramento dell'umore e a una riduzione dei sintomi depressivi lievi-moderati. È un alleato, non un sostituto del trattamento quando serve."
    },

    {
      id: "so1", cat: "sonno", liv: "base",
      d: "Per la salute del sonno, gli orari migliori sono:",
      o: ["Regolari anche nel fine settimana", "Molto variabili per 'recuperare'", "Sempre posticipati di due ore il sabato", "Senza regola purché si dorma otto ore"],
      r: 0,
      sp: "La regolarità rafforza il ritmo circadiano. Grandi variazioni nel weekend producono un vero e proprio jet lag sociale."
    },
    {
      id: "so2", cat: "sonno", liv: "base",
      d: "L'alcol, prima di dormire:",
      o: ["Può far addormentare prima, ma frammenta il sonno e peggiora la qualità", "Migliora sempre il sonno profondo", "È il rimedio consigliato per l'insonnia cronica", "Non ha effetti sul sonno"],
      r: 0,
      sp: "L'alcol riduce la latenza del sonno ma altera l'architettura del sonno, in particolare il REM, e provoca risvegli nella seconda parte della notte."
    },
    {
      id: "so3", cat: "sonno", liv: "intermedio",
      d: "La regola del controllo dello stimolo suggerisce di:",
      o: ["Usare il letto solo per dormire e alzarsi se non si dorme dopo circa 20 minuti", "Restare a letto finché non arriva il sonno, anche per ore", "Dormire il pomeriggio per recuperare", "Andare a letto sempre più presto"],
      r: 0,
      sp: "Stare a letto svegli associa il letto alla frustrazione. Alzarsi, fare qualcosa di tranquillo con poca luce e tornare quando arriva sonnolenza ricostruisce l'associazione letto-sonno."
    },
    {
      id: "so4", cat: "sonno", liv: "intermedio",
      d: "Russamento forte, pause respiratorie e sonnolenza diurna suggeriscono:",
      o: ["Una valutazione medica per sospetta apnea ostruttiva del sonno", "Solo un po' di stanchezza da recuperare", "Un problema esclusivamente psicologico", "Di dormire di più nel weekend"],
      r: 0,
      sp: "L'apnea del sonno è frequente e sottodiagnosticata; influisce su pressione, cuore, umore e attenzione. Va valutata con un esame del sonno, non con un'app."
    },
    {
      id: "so5", cat: "sonno", liv: "avanzato",
      d: "La melatonina è soprattutto:",
      o: ["Un segnale cronobiologico utile per jet lag e ritmi spostati", "Un sedativo potente", "Un antidepressivo", "Un sostituto del sonno"],
      r: 0,
      sp: "La melatonina segnala al corpo che è buio: aiuta a spostare il ritmo, non 'spegne' il cervello. Per l'insonnia cronica la prima scelta è la terapia cognitivo-comportamentale."
    },
    {
      id: "so6", cat: "sonno", liv: "avanzato",
      d: "La deprivazione cronica di sonno:",
      o: ["Non si compensa del tutto dormendo di più nel weekend", "Si risolve con una sola notte lunga", "Riguarda solo chi lavora di notte", "Migliora la concentrazione"],
      r: 0,
      sp: "Il debito di sonno accumulato lascia effetti su attenzione, umore e metabolismo. La soluzione è ridurre la deprivazione, non recuperarla tutta in due giorni."
    },

    {
      id: "co1", cat: "corpo", liv: "base",
      d: "La respirazione diaframmatica lenta:",
      o: ["Favorisce l'attivazione del sistema parasimpatico", "Aumenta l'ansia in ogni caso", "Riduce l'ossigeno nel sangue in modo pericoloso", "Serve solo agli atleti"],
      r: 0,
      sp: "Respirare lentamente, con la pancia e con espirazioni più lunghe delle inspirazioni, attiva la branca parasimpatica e abbassa la frequenza cardiaca. È un utile strumento, non una cura."
    },
    {
      id: "co2", cat: "corpo", liv: "base",
      d: "La caffeina, assunta nel pomeriggio:",
      o: ["Può peggiorare ansia e sonno perché resta in circolo per ore", "Sparisce dall'organismo in 20 minuti", "Migliora sempre il sonno profondo", "Non ha effetti sulle persone abituate"],
      r: 0,
      sp: "L'emivita della caffeina è di circa 5-6 ore, e può essere più lunga in alcune persone. Un caffè alle 17 può ridurre la qualità del sonno a mezzanotte."
    },
    {
      id: "co3", cat: "corpo", liv: "intermedio",
      d: "Prima di attribuire stanchezza e umore basso solo a cause psicologiche, è ragionevole:",
      o: ["Escludere cause mediche con il medico (per esempio tiroide, ferro, vitamina B12)", "Iniziare subito un farmaco antidepressivo", "Ignorare i sintomi fisici", "Fare solo attività fisica intensa"],
      r: 0,
      sp: "Ipotiroidismo, anemia, carenza di B12, apnee e disturbi metabolici possono imitare ansia o depressione. Il medico di base è il primo passaggio corretto."
    },
    {
      id: "co4", cat: "corpo", liv: "intermedio",
      d: "Le diete molto restrittive, dal punto di vista psicologico:",
      o: ["Possono peggiorare umore, energia e rapporto con il corpo", "Migliorano sempre l'autostima", "Sono raccomandate a tutti", "Non hanno effetti sull'umore"],
      r: 0,
      sp: "Restrizioni rigide aumentano irritabilità, stanchezza e pensieri sul cibo, e sono un fattore di rischio per disturbi alimentari. La qualità della dieta conta più della quantità di rinunce."
    },
    {
      id: "co5", cat: "corpo", liv: "avanzato",
      d: "Il fumo di sigaretta e l'ansia:",
      o: ["La nicotina dà sollievo breve, ma l'astinenza aumenta ansia e irritabilità", "Riduce l'ansia in modo stabile nel tempo", "È consigliato nei disturbi d'ansia", "Non ha relazione con l'umore"],
      r: 0,
      sp: "Il fumo mantiene un ciclo di sollievo e astinenza. Smettere peggiora temporaneamente l'umore, ma nel medio periodo ansia e umore migliorano."
    },
    {
      id: "co6", cat: "corpo", liv: "avanzato",
      d: "Il movimento fisico regolare, per l'ansia:",
      o: ["Riduce la tensione e migliora il sonno, con effetti moderati", "È dannoso se si è ansiosi", "Sostituisce la psicoterapia in ogni caso", "Ha effetto solo se intenso"],
      r: 0,
      sp: "Attività aerobica moderata e regolare riduce la reattività allo stress e migliora il sonno. Anche una camminata quotidiana conta."
    },

    {
      id: "te1", cat: "terapia", liv: "base",
      d: "Chi può esercitare la psicoterapia in Italia?",
      o: ["Lo psicologo iscritto all'albo con specializzazione quadriennale riconosciuta (o il medico specializzato)", "Chiunque abbia letto molti libri di psicologia", "Qualsiasi laureato in scienze umane", "Solo lo psichiatra"],
      r: 0,
      sp: "La psicoterapia è una professione regolamentata: serve la laurea in psicologia (o medicina), l'abilitazione, l'iscrizione all'albo e una specializzazione quadriennale. Verificare albo e formazione è un diritto del paziente."
    },
    {
      id: "te2", cat: "terapia", liv: "base",
      d: "Una seduta di psicoterapia dura in genere:",
      o: ["45-60 minuti, con frequenza iniziale settimanale", "5-10 minuti", "Tre ore consecutive", "Dipende solo dal costo"],
      r: 0,
      sp: "La cornice classica è di 45-60 minuti, una volta a settimana all'inizio. La frequenza può cambiare nel tempo, ma la stabilità del setting è parte del trattamento."
    },
    {
      id: "te3", cat: "terapia", liv: "intermedio",
      d: "Qual è la differenza principale tra psicologo, psicoterapeuta e psichiatra?",
      o: ["Lo psichiatra è medico e può prescrivere farmaci; lo psicoterapeuta è abilitato alla psicoterapia", "Sono tre nomi per la stessa professione", "Lo psicologo può prescrivere farmaci", "Lo psicoterapeuta non può fare colloqui clinici"],
      r: 0,
      sp: "Lo psicologo si occupa di valutazione, sostegno e interventi psicologici; lo psicoterapeuta ha la specializzazione per la psicoterapia; lo psichiatra è un medico specializzato in psichiatria e può prescrivere farmaci."
    },
    {
      id: "te4", cat: "terapia", liv: "intermedio",
      d: "Il segreto professionale dello psicologo:",
      o: ["È la regola, con limiti previsti dalla legge in situazioni di pericolo", "Non esiste", "Può essere violato liberamente", "Vale solo per i maggiorenni"],
      r: 0,
      sp: "Il segreto professionale è centrale nel codice deontologico. Esistono limiti e obblighi di legge, per esempio in caso di rischio per la vita o di reati previsti. Lo psicologo spiega questi limiti all'inizio del percorso."
    },
    {
      id: "te5", cat: "terapia", liv: "avanzato",
      d: "Quanto tempo serve, di solito, per vedere i primi cambiamenti in terapia?",
      o: ["Alcune settimane: dipende dal problema, dall'alleanza e dal tipo di intervento", "Un solo incontro è sempre sufficiente", "Mai prima di cinque anni", "Non si può mai misurare"],
      r: 0,
      sp: "Molti percorsi mostrano segnali di miglioramento nelle prime settimane, altri richiedono mesi. L'alleanza terapeutica è uno dei migliori predittori dell'esito: se non si costruisce, è legittimo parlarne o cambiare."
    },
    {
      id: "te6", cat: "terapia", liv: "avanzato",
      d: "Farmaci e psicoterapia, nella depressione moderata-grave:",
      o: ["Possono essere combinati, con vantaggi in molti casi", "Non vanno mai combinati", "La psicoterapia è inutile se si prendono farmaci", "I farmaci sostituiscono sempre la terapia"],
      r: 0,
      sp: "Le linee guida indicano la combinazione come opzione efficace per quadri moderati-gravi. La scelta spetta al clinico, insieme alla persona."
    },

    {
      id: "mi1", cat: "miti", liv: "base",
      d: "«La psicoterapia serve solo a chi è 'matto'»: è vero?",
      o: ["Falso: è utile per difficoltà comuni, crisi e prevenzione", "Vero: serve solo nei casi gravi", "Vero: è riservata agli adolescenti", "Vero: riguarda solo il passato"],
      r: 0,
      sp: "Si va in terapia per ansia, lutti, lavoro, relazioni, scelte di vita, autostima. Non serve essere 'gravi' per stare meglio: chiedere aiuto presto è spesso più efficace."
    },
    {
      id: "mi2", cat: "miti", liv: "base",
      d: "«Basta volerlo, la depressione passa»: è vero?",
      o: ["Falso: la depressione non è una questione di volontà", "Vero: dipende solo dall'impegno", "Vero: serve solo distrarsi", "Vero: chi è forte non ne soffre"],
      r: 0,
      sp: "La depressione coinvolge biologia, pensieri, ambiente e storia personale. Dire 'basta volerlo' aggiunge colpa a una persona già in difficoltà."
    },
    {
      id: "mi3", cat: "miti", liv: "intermedio",
      d: "«Il tempo guarisce tutto»: è sempre vero?",
      o: ["No: alcuni lutti e traumi richiedono un aiuto per elaborarsi", "Sì, sempre, senza eccezioni", "Sì, se si evita l'argomento", "Sì, entro un mese"],
      r: 0,
      sp: "Il tempo aiuta, ma non basta se il dolore resta bloccato: il lutto complicato e il trauma post-traumatico hanno trattamenti efficaci. Riconoscerli presto cambia la prognosi."
    },
    {
      id: "mi4", cat: "miti", liv: "intermedio",
      d: "Un'app o un'intelligenza artificiale possono sostituire uno psicologo?",
      o: ["No: possono informare, orientare e preparare, non diagnosticare né curare", "Sì, se il modello è abbastanza grande", "Sì, per tutti i disturbi", "Sì, perché non hanno bias"],
      r: 0,
      sp: "Gli strumenti digitali possono aumentare l'accesso, la psicoeducazione e il monitoraggio. Non possono sostituire la relazione clinica, la responsabilità professionale e la valutazione del contesto."
    },
    {
      id: "mi5", cat: "miti", liv: "avanzato",
      d: "«Chiedere aiuto è un segno di debolezza»: è vero?",
      o: ["Falso: riconoscere un limite e chiedere aiuto è una competenza", "Vero: bisogna farcela da soli", "Vero: chi chiede aiuto non migliora", "Vero, ma solo per gli uomini"],
      r: 0,
      sp: "La ricerca sull'aiuto efficace mostra il contrario: la capacità di chiedere supporto è associata a migliori esiti di salute mentale. Il coraggio sta anche nel dire 'ho bisogno'."
    },
    {
      id: "mi6", cat: "miti", liv: "avanzato",
      d: "«Se prendo farmaci, la terapia non serve»: è vero?",
      o: ["Falso: farmaci e psicoterapia hanno effetti diversi e possono integrarsi", "Vero: i farmaci bastano sempre", "Vero: la terapia è controindicata", "Vero: i farmaci cambiano la personalità"],
      r: 0,
      sp: "I farmaci agiscono sui sintomi, la psicoterapia lavora su pensieri, comportamenti e significati. La combinazione è spesso più efficace della sola farmacoterapia nei quadri moderati-gravi."
    }
  ]
};

NP.data.quizLivelli = {
  base: "Base",
  intermedio: "Intermedio",
  avanzato: "Avanzato"
};
