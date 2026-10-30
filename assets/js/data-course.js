/* ==========================================================================
   Psicologo Digitale · percorso, sedute, esercizi
   Licenza del codice: MIT · Contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.percorso = {
  premessa: "Un percorso psicologico non è una serie di consigli: è un lavoro strutturato, con obiettivi, tempi e verifiche. Questa proposta riprende la cornice dei percorsi brevi strutturati (8-12 settimane, incontri settimanali di 45-60 minuti, compiti tra una seduta e l'altra, misurazioni periodiche). È un modello educativo: il professionista lo adatterà alla tua storia.",
  regole: [
    "Otto tappe, da due settimane ciascuna: circa quattro mesi se segui il ritmo pieno, meno se il professionista concentra il lavoro.",
    "Ogni tappa ha un obiettivo osservabile, un esercizio e un indicatore di progresso.",
    "Le tappe non sono una scala da salire: si può tornare indietro, saltare o sostare.",
    "Ogni due settimane si misura: questionari brevi, diario, una domanda semplice («cosa è cambiato?»).",
    "Il percorso non sostituisce la psicoterapia: la prepara, la accompagna o la integra con psicoeducazione.",
    "Se compare un rischio per la sicurezza, il percorso si ferma e si passa alla valutazione professionale immediata."
  ],
  moduli: [
    {
      id: "m1",
      n: 1,
      titolo: "Orientarsi",
      sottotitolo: "Dare un nome a ciò che succede",
      settimane: "Settimane 1-2",
      durata: "2 incontri · 45-60 min",
      obiettivo: "Passare dal «sto male» a una descrizione condivisa: che cosa succede, da quando, quanto interferisce, che cosa lo mantiene.",
      contenuti: [
        "Mappa del problema: sintomi, contesto, durata, conseguenze.",
        "Le tre domande di partenza: cosa è cambiato, cosa ho provato a fare, cosa temo.",
        "Differenza tra evento, interpretazione, emozione e comportamento.",
        "Prima misurazione: questionari e diario per sette giorni."
      ],
      esercizi: ["diario-pensieri", "respiro-4-6"],
      pratica: "Un diario breve ogni sera: situazione, emozione (0-10), cosa ho fatto. Non serve scrivere molto: serve la regolarità.",
      indicatore: "Riesci a raccontare il problema in cinque righe, senza giudicarti.",
      nota: "Se il problema è acuto o c'è rischio, questa tappa diventa una consulenza professionale, non un percorso autonomo."
    },
    {
      id: "m2",
      n: 2,
      titolo: "Ritrovare il corpo",
      sottotitolo: "Respiro, sonno, movimento",
      settimane: "Settimane 3-4",
      durata: "2 incontri · 45 min",
      obiettivo: "Ridurre l'attivazione fisiologica e ristabilire le condizioni di base: sonno, luce, movimento, caffeina.",
      contenuti: [
        "Perché il corpo va prima delle parole: iperattivazione e recupero.",
        "Respirazione lenta e ancoraggio sensoriale: quando servono, quando no.",
        "Igiene del sonno e controllo dello stimolo.",
        "Movimento come regolatore dell'umore e dell'ansia."
      ],
      esercizi: ["respiro-4-6", "grounding-54321", "igiene-sonno"],
      pratica: "Ogni giorno: 5 minuti di respiro lento e una camminata di 15-20 minuti. Ogni sera: stesso orario, luce bassa, letto solo per dormire.",
      indicatore: "Ti addormenti più rapidamente o ti svegli meno stanco/a; l'ansia fisica scende di almeno un punto su dieci.",
      nota: "Se russi forte, ti addormenti di giorno o ti sei addormentato/a alla guida, parla prima con il medico."
    },
    {
      id: "m3",
      n: 3,
      titolo: "Ricominciare a fare",
      sottotitolo: "Attivazione comportamentale",
      settimane: "Settimane 5-6",
      durata: "2 incontri · 45-50 min",
      obiettivo: "Rompere il circolo «non ho voglia → non faccio → sto peggio» con azioni piccole, programmate e realistiche.",
      contenuti: [
        "La voglia arriva dopo l'azione: il principio dell'attivazione.",
        "Attività piacevoli, attività necessarie, attività di padronanza.",
        "Scala dell'impegno: partire dal 20% di quello che faresti in un giorno buono.",
        "Come gestire i giorni no senza considerarlo un fallimento."
      ],
      esercizi: ["attivazione", "camminata-consapevole"],
      pratica: "Tre attività a settimana, scelte in anticipo, annotate con il livello di piacere e di padronanza prima e dopo.",
      indicatore: "Almeno due attività svolte su tre, anche nei giorni in cui non avevi voglia.",
      nota: "L'attivazione non è «forzarsi a sorridere»: è un esperimento per verificare se l'umore segue l'azione."
    },
    {
      id: "m4",
      n: 4,
      titolo: "Guardare i pensieri",
      sottotitolo: "Ristrutturazione cognitiva",
      settimane: "Settimane 7-8",
      durata: "2 incontri · 50 min",
      obiettivo: "Distinguere fatti e interpretazioni, riconoscere le distorsioni e costruire letture più accurate.",
      contenuti: [
        "Il modello ABC: evento, pensiero, conseguenza emotiva e comportamentale.",
        "Le distorsioni più comuni: catastrofizzazione, tutto-o-niente, lettura della mente, etichettamento, doverizzazione.",
        "Le domande socratiche: quali prove, quali alternative, cosa direi a un amico.",
        "Il pensiero non è un fatto: accettare l'emozione senza obbedire al pensiero."
      ],
      esercizi: ["diario-pensieri", "finestra-preoccupazione"],
      pratica: "Un pensiero al giorno, analizzato con la scheda a sette colonne. Non tutti: uno.",
      indicatore: "Riesci a formulare almeno una lettura alternativa credibile del pensiero più frequente.",
      nota: "La ristrutturazione non è pensiero positivo: è precisione. Se il pensiero è realistico, il lavoro è sul problema, non sulla frase."
    },
    {
      id: "m5",
      n: 5,
      titolo: "Reggere le emozioni",
      sottotitolo: "Regolazione e autocompassione",
      settimane: "Settimane 9-10",
      durata: "2 incontri · 50 min",
      obiettivo: "Aumentare la capacità di stare con emozioni intense senza evitarle e senza esserne travolti.",
      contenuti: [
        "Le emozioni hanno una funzione: paura, rabbia, tristezza, vergogna, colpa.",
        "Riconoscere, nominare, validare: la sequenza che riduce l'intensità.",
        "Strategie di regolazione: temperatura, respiro, movimento, contatto sociale, scrittura.",
        "Autocompassione: trattarsi come si tratterebbe una persona cara."
      ],
      esercizi: ["autocompassione", "rilassamento-muscolare"],
      pratica: "Quando l'emozione supera 7/10: nominarla, abbassare l'attivazione, rimandare la decisione di almeno 20 minuti.",
      indicatore: "Riesci a riconoscere l'emozione prima che diventi comportamento automatico.",
      nota: "Se emerge un ricordo traumatico, non forzare: il lavoro sul trauma va fatto con un professionista formato."
    },
    {
      id: "m6",
      n: 6,
      titolo: "Confini e relazioni",
      sottotitolo: "Comunicare senza perdere te",
      settimane: "Settimane 11-12",
      durata: "2 incontri · 50 min",
      obiettivo: "Esprimere bisogni e limiti in modo chiaro, riducendo conflitti inutili e senso di colpa.",
      contenuti: [
        "Differenza tra aggressivo, passivo e assertivo.",
        "Lo schema DESC: descrivi, esprimi, specifica, concludi.",
        "Dire no senza giustificarsi: frasi pronte.",
        "Riparare dopo un conflitto: riconoscere, scusarsi, proporre."
      ],
      esercizi: ["confini-DESC"],
      pratica: "Una conversazione difficile a settimana, preparata con lo schema DESC e valutata dopo.",
      indicatore: "Hai espresso almeno un bisogno o un limite senza attaccare e senza ritirarti.",
      nota: "In presenza di violenza o controllo, la priorità è la sicurezza: 1522 e 112, non l'assertività."
    },
    {
      id: "m7",
      n: 7,
      titolo: "Direzione e valori",
      sottotitolo: "Dove vuoi andare, non solo cosa evitare",
      settimane: "Settimane 13-14",
      durata: "2 incontri · 50 min",
      obiettivo: "Collegare le azioni quotidiane a ciò che conta, per sostenere la motivazione oltre il sintomo.",
      contenuti: [
        "Valori come direzioni, non come traguardi.",
        "Aree di vita: salute, relazioni, lavoro, crescita, contributo, tempo libero.",
        "Azioni impegnate: piccoli passi coerenti con i valori.",
        "Accettazione: fare spazio a ciò che non dipende da noi."
      ],
      esercizi: ["valori-bussola"],
      pratica: "Una azione al giorno coerente con il valore più importante. Annotare cosa cambia.",
      indicatore: "Sai indicare tre azioni concrete collegate ai tuoi valori e ne hai fatta almeno una.",
      nota: "I valori non sono obblighi: se diventano un'altra voce che ti giudica, vanno riformulati."
    },
    {
      id: "m8",
      n: 8,
      titolo: "Consolidare",
      sottotitolo: "Prevenire le ricadute, restare autonomo",
      settimane: "Settimane 15-16",
      durata: "1-2 incontri · 50 min",
      obiettivo: "Riconoscere i segnali precoci, avere un piano scritto e sapere quando chiedere aiuto.",
      contenuti: [
        "Mappa dei segnali precoci: sonno, ritiro, irritabilità, pensieri.",
        "Piano personale: cosa faccio, chi chiamo, cosa evito.",
        "Bilancio del percorso: cosa è cambiato, cosa resta da fare.",
        "Come scegliere se continuare, fermarsi o cambiare professionista."
      ],
      esercizi: ["piano-ricadute"],
      pratica: "Scrivi il piano in una pagina e tienilo dove lo vedi. Condividilo con una persona di fiducia.",
      indicatore: "Hai un piano scritto e sai a chi rivolgerti se i segnali tornano.",
      nota: "Una ricaduta non cancella il percorso: è un'informazione su cosa va rinforzato."
    }
  ],
  sedute: [
    {
      id: "s1",
      n: 1,
      titolo: "Primo colloquio",
      durata: "60 minuti",
      quando: "Inizio del percorso",
      obiettivi: [
        "Costruire un clima di fiducia e spiegare il setting.",
        "Raccogliere motivo, storia, funzionamento e rete.",
        "Valutare il rischio e l'urgenza.",
        "Concordare obiettivi e primi passi."
      ],
      agenda: [
        { min: "0-10", titolo: "Accoglienza e cornice", cosa: "Chi sei, come lavori, durata, costo, segreto professionale e suoi limiti, possibilità di interrompere." },
        { min: "10-25", titolo: "Motivo", cosa: "Cosa ti porta qui, da quando, quanto interferisce, cosa hai già provato." },
        { min: "25-40", titolo: "Storia e funzionamento", cosa: "Percorsi precedenti, salute, farmaci, sonno, sostanze, relazioni, lavoro." },
        { min: "40-50", titolo: "Rischio", cosa: "Domande dirette su pensieri di farsi male, autolesionismo, violenza, sicurezza." },
        { min: "50-60", titolo: "Restituzione e piano", cosa: "Prima ipotesi condivisa, obiettivi, frequenza, compito, prossimo appuntamento." }
      ],
      materiali: ["Scheda anamnestica", "Questionari brevi", "Contatto di emergenza", "Modulo privacy"],
      domande: [
        "Cosa ti ha portato qui proprio ora?",
        "Qual è la cosa che ti pesa di più?",
        "Cosa hai già provato e cosa ha aiutato, anche solo un po'?",
        "Come dormi, come mangi, come stai fisicamente?",
        "Chi c'è nella tua vita su cui puoi contare?",
        "Hai pensato che sarebbe meglio non esserci?"
      ],
      compito: "Diario per sette giorni e questionari di base. Se emergono pensieri di morte, contatto immediato.",
      attenzione: "Non riempire tutti i silenzi. Il primo colloquio serve anche a capire come la persona racconta di sé."
    },
    {
      id: "s2",
      n: 2,
      titolo: "Formulazione condivisa",
      durata: "50 minuti",
      quando: "Secondo o terzo incontro",
      obiettivi: [
        "Restituire una formulazione comprensibile e non giudicante.",
        "Verificare che la persona si riconosca nella descrizione.",
        "Scegliere insieme priorità e tappe."
      ],
      agenda: [
        { min: "0-10", titolo: "Come è andata la settimana", cosa: "Diario, sonno, eventi, umore." },
        { min: "10-30", titolo: "Mappa condivisa", cosa: "Fattori predisponenti, scatenanti, di mantenimento e protettivi." },
        { min: "30-40", titolo: "Priorità", cosa: "Cosa cambiare per primo: sintomo, funzionamento o contesto." },
        { min: "40-50", titolo: "Patto di lavoro", cosa: "Obiettivi misurabili, frequenza, compiti, verifica tra due settimane." }
      ],
      materiali: ["Schema della formulazione", "Questionari", "Diario"],
      domande: [
        "Ti riconosci in questa descrizione?",
        "Cosa ho capito male?",
        "Se dovessimo cambiare una sola cosa nelle prossime due settimane, quale sarebbe?",
        "Come capiremo che sta funzionando?"
      ],
      compito: "Prima pratica concordata, scelta tra gli esercizi della tappa 1-2.",
      attenzione: "La formulazione è un'ipotesi, non un'etichetta. Va aggiornata con i dati."
    },
    {
      id: "s3",
      n: 3,
      titolo: "Psicoeducazione",
      durata: "45 minuti",
      quando: "Dopo la formulazione",
      obiettivi: [
        "Spiegare il meccanismo che mantiene il problema.",
        "Ridurre colpa e vergogna con informazioni accurate.",
        "Collegare sintomi e comportamenti."
      ],
      agenda: [
        { min: "0-10", titolo: "Verifica", cosa: "Cosa è cambiato, cosa è rimasto uguale." },
        { min: "10-30", titolo: "Meccanismo", cosa: "Modello del problema con esempi tratti dalla vita della persona." },
        { min: "30-40", titolo: "Conseguenze pratiche", cosa: "Cosa fare e cosa evitare; cosa aspettarsi." },
        { min: "40-45", titolo: "Domande", cosa: "Dubbi, timori, obiezioni." }
      ],
      materiali: ["Schede del manuale", "Disegno del circolo vizioso", "Esercizi"],
      domande: [
        "Cosa ti è stato detto in passato su questo problema?",
        "Cosa pensi che significhi, per te, stare così?",
        "C'è qualcosa che ti sembra non tornare?"
      ],
      compito: "Leggere un capitolo del manuale e annotare due domande.",
      attenzione: "Evita il gergo. Se la persona non può ripeterlo con parole sue, non è stato spiegato."
    },
    {
      id: "s4",
      n: 4,
      titolo: "Pensieri e comportamenti",
      durata: "50 minuti",
      quando: "Tappe 4-5",
      obiettivi: [
        "Riconoscere il pensiero che precede l'emozione.",
        "Mettere in discussione una lettura catastrofica.",
        "Progettare un comportamento alternativo."
      ],
      agenda: [
        { min: "0-10", titolo: "Diario", cosa: "Rivedere una scheda compilata." },
        { min: "10-30", titolo: "Analisi guidata", cosa: "Prove a favore e contro, alternative, cosa direbbe un amico." },
        { min: "30-40", titolo: "Esperimento", cosa: "Un comportamento diverso da provare entro la settimana." },
        { min: "40-50", titolo: "Piano", cosa: "Quando, dove, con chi, cosa potrebbe ostacolare." }
      ],
      materiali: ["Scheda a sette colonne", "Scala 0-10", "Diario"],
      domande: [
        "Qual è la prova che questo pensiero sia vero al 100%?",
        "Qual è una spiegazione alternativa?",
        "Cosa succederebbe se lo credessi meno?",
        "Cosa faresti se non avessi paura?"
      ],
      compito: "Una scheda al giorno e un esperimento comportamentale.",
      attenzione: "Non discutere il contenuto con tono polemico: la persona deve scoprire, non essere corretta."
    },
    {
      id: "s5",
      n: 5,
      titolo: "Esposizione e azione",
      durata: "50 minuti",
      quando: "Quando l'evitamento è centrale",
      obiettivi: [
        "Costruire una scala di esposizione graduale.",
        "Prevedere l'andamento dell'ansia.",
        "Ridurre l'evitamento in modo sicuro."
      ],
      agenda: [
        { min: "0-10", titolo: "Rassegna", cosa: "Cosa è stato evitato e quanto è costato." },
        { min: "10-25", titolo: "Scala", cosa: "Dieci gradini dal più facile al più difficile, con tempi." },
        { min: "25-40", titolo: "Primo passo", cosa: "Simulazione, previsione, piano B." },
        { min: "40-50", titolo: "Regole", cosa: "Restare finché l'ansia scende, non fuggire, ripetere." }
      ],
      materiali: ["Scala di esposizione", "Scheda previsione-esito"],
      domande: [
        "Cosa pensi che succederà?",
        "Quanto pensi che salirà l'ansia?",
        "Cosa faresti se salisse davvero?",
        "Qual è il passo più piccolo che potresti fare oggi?"
      ],
      compito: "Un gradino al giorno, annotando previsione e risultato.",
      attenzione: "L'esposizione va costruita con il clinico, soprattutto con trauma, panico o condizioni mediche."
    },
    {
      id: "s6",
      n: 6,
      titolo: "Regolazione emotiva",
      durata: "50 minuti",
      quando: "Tappa 5",
      obiettivi: [
        "Riconoscere l'emozione e la sua funzione.",
        "Ridurre l'intensità senza evitare.",
        "Aumentare la tolleranza alla frustrazione."
      ],
      agenda: [
        { min: "0-10", titolo: "Episodio", cosa: "Un momento emotivo della settimana, ricostruito." },
        { min: "10-25", titolo: "Riconoscere", cosa: "Nome, intensità, segnali corporei, impulso." },
        { min: "25-40", titolo: "Regolare", cosa: "Provare due strategie e valutarle." },
        { min: "40-50", titolo: "Piano", cosa: "Cosa fare la prossima volta, prima che l'intensità salga." }
      ],
      materiali: ["Ruota delle emozioni", "Scheda di regolazione", "Esercizi"],
      domande: [
        "A cosa ti serve questa emozione?",
        "Cosa hai fatto quando è salita?",
        "Cosa avresti voluto fare?",
        "Cosa ti aiuterebbe nei primi trenta secondi?"
      ],
      compito: "Nominare l'emozione tre volte al giorno, anche quando è piacevole.",
      attenzione: "Con emozioni traumatiche o dissociazione, procedere solo con supporto specialistico."
    },
    {
      id: "s7",
      n: 7,
      titolo: "Valori, mantenimento e chiusura",
      durata: "50 minuti",
      quando: "Fine del percorso",
      obiettivi: [
        "Collegare i cambiamenti ai valori.",
        "Scrivere il piano di mantenimento.",
        "Valutare l'esito e decidere i passi successivi."
      ],
      agenda: [
        { min: "0-10", titolo: "Bilancio", cosa: "Confronto tra misure iniziali e attuali." },
        { min: "10-25", titolo: "Valori", cosa: "Cosa conta e quale azione lo esprime questa settimana." },
        { min: "25-40", titolo: "Piano", cosa: "Segnali precoci, strategie, rete, quando tornare." },
        { min: "40-50", titolo: "Chiusura", cosa: "Cosa porti con te, cosa resta aperto, come salutarsi." }
      ],
      materiali: ["Grafici dei questionari", "Piano di mantenimento", "Contatti"],
      domande: [
        "Cosa è cambiato dall'inizio?",
        "Cosa ha funzionato e cosa no?",
        "Qual è il segnale che ti dirà di chiedere aiuto di nuovo?",
        "Cosa vuoi proteggere d'ora in poi?"
      ],
      compito: "Piano di mantenimento in una pagina, condiviso con una persona fidata.",
      attenzione: "La chiusura va preparata, non improvvisata: è parte dell'intervento."
    }
  ],
  esercizi: [
    {
      id: "respiro-4-6",
      titolo: "Respiro lento 4-6",
      durata: "5 minuti",
      scopo: "Abbassare l'attivazione fisiologica e interrompere l'iperventilazione.",
      quando: "Prima di dormire, prima di una situazione temuta, quando senti il corpo in allarme.",
      passo: [
        "Siediti con la schiena appoggiata e i piedi a terra.",
        "Inspira dal naso contando fino a 4, riempiendo la pancia prima del petto.",
        "Espira dalla bocca contando fino a 6, come se soffiassi su una candela.",
        "Ripeti per 10 cicli, senza forzare. Se ti gira la testa, respira normalmente per un minuto.",
        "Nota come cambia il corpo: spalle, mandibola, mani."
      ],
      variante: "Se il 4-6 è difficile, usa 3-5 o conta solo l'espirazione.",
      nota: "Non è un esercizio di prestazione: se l'ansia non scende, non hai sbagliato. Respirare più lentamente non è sempre la risposta giusta per tutti."
    },
    {
      id: "grounding-54321",
      titolo: "Ancoraggio 5-4-3-2-1",
      durata: "5 minuti",
      scopo: "Tornare al presente quando la mente corre o ti senti distaccato/a.",
      quando: "Attacchi di panico, rimuginio intenso, sensazione di irrealtà.",
      passo: [
        "Nomina 5 cose che vedi, descrivendole con un dettaglio di colore.",
        "Nomina 4 cose che puoi toccare: tessuto, sedia, pelle, superficie.",
        "Nomina 3 suoni che senti, vicini e lontani.",
        "Nomina 2 odori, o due odori che ricordi con piacere.",
        "Nomina 1 sapore, o bevi un sorso d'acqua con attenzione.",
        "Chiudi dicendo a te stesso/a: «Sono qui, in questo momento, e questo momento è tollerabile»."
      ],
      variante: "Fallo camminando, se stare fermo/a aumenta l'ansia.",
      nota: "L'ancoraggio non elimina la causa: riporta la persona in condizione di scegliere."
    },
    {
      id: "attivazione",
      titolo: "Attivazione comportamentale",
      durata: "10 minuti di pianificazione",
      scopo: "Rimettersi in movimento quando l'umore toglie la voglia.",
      quando: "Ritiro, apatia, giornate che si svuotano.",
      passo: [
        "Elenca tre attività: una piacevole, una necessaria, una di padronanza.",
        "Riducile al 20%: se pensavi a un'ora, fanne dodici minuti.",
        "Decidi giorno e ora esatti. Scrivilo.",
        "Prima di iniziare, valuta piacere e senso da 0 a 10.",
        "Dopo, rivaluta. Annota anche se non avevi voglia.",
        "Se salti, non recuperare tutto: riprendi dalla prossima."
      ],
      variante: "Parti da un'attività di 5 minuti se tutto il resto sembra troppo.",
      nota: "L'obiettivo non è il piacere immediato: è raccogliere dati contro la previsione «non servirà a niente»."
    },
    {
      id: "diario-pensieri",
      titolo: "Scheda del pensiero",
      durata: "15 minuti",
      scopo: "Separare situazione, pensiero, emozione e comportamento.",
      quando: "Un pensiero ti ha fatto stare male e vuoi capirlo.",
      passo: [
        "Situazione: cosa è successo, in modo osservabile (chi, dove, quando).",
        "Pensiero: la frase esatta che ti è passata in testa.",
        "Emozione: nome e intensità da 0 a 10.",
        "Comportamento: cosa hai fatto o evitato.",
        "Prove a favore del pensiero: fatti, non impressioni.",
        "Prove contro e spiegazioni alternative.",
        "Pensiero alternativo: più preciso, non più ottimista.",
        "Esito: come ti senti ora e cosa farai."
      ],
      variante: "Se scrivere è troppo, registra un vocale di due minuti.",
      nota: "Non serve analizzare ogni pensiero: uno al giorno è sufficiente. L'obiettivo è la precisione, non l'autocritica."
    },
    {
      id: "finestra-preoccupazione",
      titolo: "Finestra della preoccupazione",
      durata: "10 minuti",
      scopo: "Contenere il rimuginio senza sopprimerlo.",
      quando: "Preoccupazioni che tornano durante il giorno o prima di dormire.",
      passo: [
        "Scegli una fascia fissa di 15 minuti, sempre la stessa, non prima di dormire.",
        "Durante il giorno, quando arriva una preoccupazione, annotala e rimandala alla finestra.",
        "All'ora stabilita, apri l'elenco e valuta: è un problema risolvibile o un'ipotesi?",
        "Per i problemi risolvibili: scrivi il primo passo concreto.",
        "Per le ipotesi: lasciale andare, ricordando che rimuginare non le risolve.",
        "Chiudi la finestra con un cambio di attività."
      ],
      variante: "Se la preoccupazione è troppo intensa, usa prima l'ancoraggio.",
      nota: "Rimandare non è evitare: è dare un tempo e un luogo al pensiero, togliendogli la giornata."
    },
    {
      id: "igiene-sonno",
      titolo: "Sonno: le sei regole",
      durata: "10 minuti",
      scopo: "Ricostruire il legame tra letto, orario e sonno.",
      quando: "Insonnia lieve o sonno irregolare.",
      passo: [
        "Sveglia sempre alla stessa ora, anche nel weekend.",
        "Letto solo per dormire e per l'intimità: niente lavoro, schermi, discussioni.",
        "Se dopo circa 20 minuti non dormi, alzati, luce bassa, attività noiosa, torna quando hai sonno.",
        "Niente caffeina dopo le 14; alcol la sera solo se sai che ti frammenta la notte (e allora no).",
        "Luce naturale al mattino e movimento durante il giorno.",
        "Riduci il tempo a letto: se dormi 6 ore, non stare a letto 10."
      ],
      variante: "Se lavori su turni, ancora la routine all'ora di sveglia e usa la luce per orientarti.",
      nota: "L'insonnia cronica ha un trattamento specifico (CBT-I): queste regole sono un inizio, non una cura."
    },
    {
      id: "autocompassione",
      titolo: "Pausa di autocompassione",
      durata: "8 minuti",
      scopo: "Ridurre autocritica e vergogna, che mantengono ansia e umore basso.",
      quando: "Dopo un errore, un rifiuto, una giornata in cui ti sei giudicato/a duramente.",
      passo: [
        "Riconosci: «Questo è un momento difficile». Nomina l'emozione.",
        "Ricorda l'umanità comune: «Anche altre persone si sentono così. Non sono rotto/a».",
        "Metti una mano sul petto e respira lentamente per un minuto.",
        "Chiediti: «Cosa direi a un amico che sta vivendo questo?»",
        "Scrivi una frase che unisca il riconoscimento e la cura di te.",
        "Scegli un gesto concreto di cura per oggi."
      ],
      variante: "Se l'autocompassione ti sembra estranea, inizia dal riconoscere il dolore senza giudizio.",
      nota: "L'autocompassione non è indulgenza: è la condizione per potersi correggere senza odiarsi."
    },
    {
      id: "confini-DESC",
      titolo: "Una conversazione difficile (DESC)",
      durata: "15 minuti",
      scopo: "Esprimere un bisogno o un limite in modo chiaro e non aggressivo.",
      quando: "Un conflitto che si ripete, un favore che pesa, un limite da mettere.",
      passo: [
        "Descrivi il fatto: «Quando succede che...», senza giudizi.",
        "Esprimi l'emozione: «Mi sento...», in prima persona.",
        "Specifica la richiesta: «Ti chiedo di...», concreta e realizzabile.",
        "Concludi con la conseguenza: cosa cambia per te, cosa offri.",
        "Scegli il momento e il luogo. Evita messaggi mentre sei arrabbiato/a.",
        "Dopo, annota com'è andata: cosa ha funzionato, cosa rifaresti."
      ],
      variante: "Se la conversazione è pericolosa, non usare il DESC: cerca supporto e protezione.",
      nota: "Assertività non significa ottenere sempre ciò che chiedi: significa smettere di tradire i tuoi bisogni."
    },
    {
      id: "valori-bussola",
      titolo: "Bussola dei valori",
      durata: "20 minuti",
      scopo: "Orientare le scelte quotidiane verso ciò che conta.",
      quando: "Confusione, mancanza di motivazione, sensazione di vivere per gli altri.",
      passo: [
        "Elenca sei aree: salute, relazioni, lavoro/studio, crescita, contributo, tempo libero.",
        "Per ciascuna, scrivi una frase: «Per me questa area conta perché...».",
        "Assegna un punteggio da 0 a 10 a quanto ci stai investendo oggi.",
        "Scegli l'area con il divario maggiore tra importanza e investimento.",
        "Definisci una azione settimanale piccola e concreta in quell'area.",
        "Rileggi tra sette giorni: l'azione ti ha avvicinato o allontanato?"
      ],
      variante: "Se un valore genera solo senso di colpa, riformulalo in termini di direzione, non di prestazione.",
      nota: "I valori sono direzioni, non risultati: non si «finito» di essere una persona presente."
    },
    {
      id: "rilassamento-muscolare",
      titolo: "Rilassamento muscolare progressivo",
      durata: "15 minuti",
      scopo: "Riconoscere e rilasciare la tensione accumulata.",
      quando: "Tensione cronica, difficoltà a rilassarsi, prima di dormire.",
      passo: [
        "Siediti o sdraiati in un posto tranquillo.",
        "Tendi i piedi per 5 secondi, poi rilascia per 15. Nota la differenza.",
        "Salì lentamente: polpacci, cosce, glutei, pancia, mani, braccia, spalle, viso.",
        "Mantieni la respirazione regolare, senza trattenerla.",
        "Alla fine, resta immobile per due minuti e nota il corpo.",
        "Se una zona è dolorante, salta la contrazione e lavora solo sul rilascio."
      ],
      variante: "Versione breve di 5 minuti: mani, spalle, viso.",
      nota: "Se hai dolore cronico o condizioni mediche, chiedi indicazioni prima di contrarre i muscoli."
    },
    {
      id: "camminata-consapevole",
      titolo: "Camminata consapevole",
      durata: "15 minuti",
      scopo: "Unire movimento, attenzione al presente e riduzione del rimuginio.",
      quando: "Giornate sedentarie, testa piena, bisogno di staccare.",
      passo: [
        "Esci senza cuffie per i primi cinque minuti.",
        "Nota il contatto dei piedi con il terreno, uno per volta.",
        "Allarga l'attenzione ai suoni, agli odori, alla temperatura.",
        "Quando la mente va via, riportala al passo successivo, senza rimprovero.",
        "Alla fine, annota una cosa che hai notato e che prima non vedevi."
      ],
      variante: "In casa: cammina avanti e indietro per cinque minuti, a passo lento.",
      nota: "Non è una pratica spirituale obbligatoria: è attenzione addestrata."
    },
    {
      id: "piano-ricadute",
      titolo: "Piano di mantenimento",
      durata: "20 minuti",
      scopo: "Avere un piano scritto per i momenti difficili.",
      quando: "Fine del percorso e ogni volta che ti senti più stabile.",
      passo: [
        "Scrivi i tuoi cinque segnali precoci (sonno, ritiro, irritabilità, pensieri, corpo).",
        "Per ciascuno, indica cosa fare nelle prime 24 ore.",
        "Elenca tre persone o servizi da contattare, con numeri.",
        "Scrivi cosa hai imparato che funziona e cosa peggiora le cose.",
        "Indica la soglia oltre la quale chiedere un appuntamento professionale.",
        "Firma il piano e mettilo dove lo vedi."
      ],
      variante: "Condividilo con una persona di fiducia, se ti va.",
      nota: "Una ricaduta non è un fallimento: è il momento in cui il piano serve davvero."
    }
  ]
};
