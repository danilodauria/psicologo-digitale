/* ==========================================================================
   Psicologo Digitale · manuale, parte seconda (capitoli 7-12)
   Licenza dei contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.manuale = (NP.data.manuale || []).concat([
  {
    id: "emozioni",
    n: 7,
    titolo: "Emozioni e regolazione",
    sommario: "A cosa servono le emozioni, perché a volte travolgono e come si impara a reggerle.",
    minuti: 8,
    keywords: ["emozioni", "rabbia", "paura", "vergogna", "colpa", "regolazione", "autocompassione", "dbt"],
    sezioni: [
      {
        h: "Le emozioni hanno una funzione",
        p: [
          "La paura protegge dal pericolo, la rabbia difende i confini, la tristezza segnala una perdita e chiede vicinanza, la vergogna regola l'appartenenza, la gioia rinforza ciò che è importante. Non esistono emozioni «sbagliate»: esistono emozioni spiacevoli e modi di gestirle che aiutano o che peggiorano le cose.",
          "Il problema non è sentire molto: è restare bloccati. Due estremi: evitare l'emozione (sopprimere, distrarsi, bere) oppure esserne travolti (agire d'impulso, rimuginare per giorni)."
        ]
      },
      {
        h: "La finestra di tolleranza",
        p: [
          "Quando l'attivazione è troppo alta o troppo bassa, la capacità di pensare si riduce. Dentro la «finestra» si può provare l'emozione e scegliere cosa fare; fuori, si reagisce. Imparare a riconoscere i primi segnali del corpo è più utile che aspettare il picco.",
          "Le persone con storie di trauma hanno spesso una finestra più stretta: per loro la regolazione va costruita con gradualità e con un professionista."
        ]
      },
      {
        h: "Quattro passi",
        p: [
          "1) Riconosci: nome, intensità 0-10, sensazioni corporee. 2) Valida: «ha senso che mi senta così, dato quello che è successo». 3) Regola: respiro, temperatura, movimento, contatto con una persona fidata, scrittura. 4) Scegli: cosa fare adesso, non tra un secondo.",
          "L'autocompassione non è indulgenza: è la voce che ti permette di correggerti senza odiarti. La ricerca mostra che riduce vergogna e ruminazione e migliora la capacità di affrontare gli errori."
        ]
      },
      {
        h: "Quando chiedere aiuto",
        p: [
          "Se le emozioni portano a comportamenti pericolosi (autolesionismo, abuso di sostanze, aggressioni), se la vergogna ti isola, se la rabbia spaventa te o gli altri, serve un supporto specifico. La terapia dialettico-comportamentale (DBT) è tra gli approcci più studiati per la disregolazione emotiva.",
          "In caso di pericolo immediato per te o per altri: 112."
        ]
      }
    ],
    esercizio: {
      titolo: "Nominare tre volte al giorno",
      testo: "Tre volte al giorno fermati e nomina l'emozione che c'è, anche se è piacevole, con un'intensità da 0 a 10. Non devi cambiarla: devi solo riconoscerla. Dopo una settimana annota quali emozioni ricorrono e in quali contesti."
    },
    quando: {
      titolo: "Se ti vergogni di come stai",
      testo: "La vergogna è una delle emozioni più difficili da dire ad alta voce. Puoi iniziare con una frase piccola: «Mi vergogno di come sto». È già un passo."
    },
    neura: {
      sintesi: [
        "Ogni emozione ha una funzione: non va eliminata, va riconosciuta e regolata. Il problema è l'evitamento o l'essere travolti, non l'intensità in sé.",
        "Quattro passi: riconosci, valida, regola, scegli. L'autocompassione riduce vergogna e autocritica e migliora la capacità di affrontare gli errori."
      ],
      passi: [
        "Nomina l'emozione e la sua intensità da 0 a 10.",
        "Valida: «ha senso, dato quello che è successo».",
        "Usa una strategia di regolazione prima di decidere.",
        "Se l'emozione porta a comportamenti pericolosi, chiedi aiuto."
      ],
      avviso: "La disregolazione grave, l'autolesionismo e gli impulsi aggressivi richiedono un professionista. Pericolo immediato: 112."
    },
    fonti: [
      "Linehan M., Terapia dialettico-comportamentale",
      "Neff K., Self-Compassion, 2011",
      "Gross J.J., modello di regolazione emotiva"
    ]
  },
  {
    id: "pensieri",
    n: 8,
    titolo: "Pensieri, schemi e distorsioni",
    sommario: "Come la mente interpreta i fatti e perché a volte lo fa in modo poco accurato.",
    minuti: 9,
    keywords: ["pensieri", "distorsioni", "schema", "abc", "catastrofizzazione", "rimuginio", "cbt", "interpretazione"],
    sezioni: [
      {
        h: "Tra evento e reazione c'è un pensiero",
        p: [
          "Non sono gli eventi a determinare direttamente le emozioni, ma il modo in cui li interpretiamo. Il modello ABC lo descrive: A è l'evento, B è la valutazione, C è la conseguenza emotiva e comportamentale. Due persone ricevono lo stesso messaggio e provano emozioni diverse perché lo leggono diversamente.",
          "Questo non significa che basti «pensare positivo». Significa che vale la pena verificare se l'interpretazione è precisa."
        ]
      },
      {
        h: "Le distorsioni più comuni",
        p: [
          "Tutto-o-niente («o perfetto o fallito»), catastrofizzazione («andrà male e non lo sopporterò»), lettura della mente («pensa che sono stupido»), etichettamento («sono un incapace»), doverizzazione («devo sempre»), filtro mentale (un dettaglio negativo cancella il resto), personalizzazione (tutto dipende da me), ragionamento emotivo («lo sento, quindi è vero»).",
          "Nessuno è immune: le distorsioni sono scorciatoie cognitive. Diventano un problema quando sono rigide e frequenti e guidano le scelte."
        ]
      },
      {
        h: "Domande che aprono",
        p: [
          "Quali prove ho che questo pensiero sia vero? Quali prove contrarie? Esiste una spiegazione alternativa? Cosa direi a una persona cara nella stessa situazione? Se lo credessi meno, cosa farei di diverso? Tra sei mesi, quanto conterà?",
          "L'obiettivo non è sostituire un pensiero con un pensiero «bello», ma arrivare a una frase più precisa e più utile, che tenga conto dei fatti."
        ]
      },
      {
        h: "Quando il pensiero è realistico",
        p: [
          "A volte il pensiero negativo è corretto: un problema esiste davvero. In quel caso il lavoro non è discutere la frase, ma affrontare il problema, chiedere aiuto, pianificare. La terapia cognitivo-comportamentale distingue tra preoccupazione produttiva e improduttiva.",
          "Se il rimuginio occupa ore e non porta a decisioni, non è problem solving: è un circuito che mantiene l'ansia."
        ]
      }
    ],
    esercizio: {
      titolo: "La scheda a sette colonne",
      testo: "Situazione, pensiero, emozione e intensità, comportamento, prove a favore, prove contro, pensiero alternativo. Compila una scheda al giorno, non di più: la qualità conta più della quantità."
    },
    quando: {
      titolo: "Se ti accorgi di rimuginare",
      testo: "Chiediti: «Questo pensiero mi porta a un'azione concreta?». Se sì, scrivi il primo passo. Se no, prova la finestra della preoccupazione: 15 minuti fissi, poi si chiude."
    },
    neura: {
      sintesi: [
        "Tra evento ed emozione c'è un'interpretazione. Le distorsioni cognitive (tutto-o-niente, catastrofizzazione, etichettamento, lettura della mente, doverizzazione) sono scorciatoie che diventano problematiche quando sono rigide.",
        "Le domande socratiche cercano precisione, non ottimismo. Se il pensiero è realistico, si affronta il problema."
      ],
      passi: [
        "Scrivi il pensiero esatto, non una parafrasi.",
        "Cerca prove a favore e prove contro.",
        "Formula un'alternativa più precisa.",
        "Se il pensiero è realistico, pianifica un'azione."
      ],
      avviso: "Se il rimuginio è costante e invalidante, una terapia strutturata aiuta più dell'autoanalisi."
    },
    fonti: [
      "Beck A.T., Cognitive Therapy and the Emotional Disorders",
      "Burns D., Sentirsi bene",
      "NICE, linee guida CBT"
    ]
  },
  {
    id: "relazioni",
    n: 9,
    titolo: "Relazioni, confini e comunicazione",
    sommario: "Perché alcuni legami pesano, come si mette un limite e come si riparano i conflitti.",
    minuti: 9,
    keywords: ["relazioni", "confini", "assertività", "conflitto", "attaccamento", "coppia", "comunicazione", "desc"],
    sezioni: [
      {
        h: "Il bisogno di legame",
        p: [
          "Siamo animali sociali: il bisogno di vicinanza non è debolezza. La teoria dell'attaccamento descrive modi diversi di cercare sicurezza: alcuni si avvicinano, altri si ritirano, altri oscillano. Questi schemi si costruiscono nelle prime relazioni e si riattivano nelle relazioni adulte, soprattutto nei momenti di stress.",
          "Riconoscere il proprio schema non serve a incolpare la famiglia: serve a capire cosa si porta in una relazione e cosa si può cambiare."
        ]
      },
      {
        h: "Confini, non muri",
        p: [
          "Un confine sano dice cosa è accettabile per te e cosa no, senza attaccare l'altro. Non è un ultimatum: è una posizione. Spesso il senso di colpa quando si dice no segnala che il confine mancava da tempo.",
          "I confini si esprimono in prima persona: «Quando alzi la voce, io mi chiudo. Ti chiedo di parlarne con calma». Descrivi il fatto, esprimi l'emozione, specifica la richiesta, concludi con ciò che offri (schema DESC)."
        ]
      },
      {
        h: "Conflitto e riparazione",
        p: [
          "Il conflitto non è la prova che la relazione è finita: è normale. Conta come si riparа. Riconoscere la propria parte, scusarsi senza «ma», proporre un cambiamento concreto, chiedere scusa anche quando l'altro non lo fa per primo.",
          "Evita le generalizzazioni («sempre», «mai»), gli attacchi alla persona e il silenzio punitivo. Se il conflitto degenera in minacce, controllo o violenza, la priorità non è comunicare meglio: è la sicurezza."
        ]
      },
      {
        h: "Quando la relazione è pericolosa",
        p: [
          "Controllo del telefono, isolamento dagli amici, minacce, percosse, violenza sessuale, stalking: non sono conflitti, sono violenze. Il 1522 è il numero gratuito antiviolenza e stalking, attivo 24 ore su 24. In pericolo immediato: 112.",
          "Anche la violenza psicologica (svalutazione sistematica, umiliazione, ricatto) è violenza. Nessuno deve restare per paura."
        ]
      }
    ],
    esercizio: {
      titolo: "Un confine in una frase",
      testo: "Pensa a una situazione che si ripete e ti pesa. Scrivi: «Quando... mi sento... Ti chiedo... Se succede...». Leggilo ad alta voce. Se ti trema la voce, è normale: stai facendo qualcosa di nuovo."
    },
    quando: {
      titolo: "Se il conflitto ti isola",
      testo: "Se hai smesso di vedere amici o familiari per evitare reazioni, parlane con una persona fidata e con un professionista. L'isolamento è un segnale, non una soluzione."
    },
    neura: {
      sintesi: [
        "Il bisogno di legame è normale. Gli schemi di attaccamento spiegano perché in momenti di stress alcuni si avvicinano e altri si ritirano.",
        "Un confine sano dice cosa è accettabile per te senza attaccare. Lo schema DESC (descrivi, esprimi, specifica, concludi) aiuta a comunicare. La riparazione conta più dell'assenza di conflitto."
      ],
      passi: [
        "Scrivi il confine in una frase in prima persona.",
        "Scegli un momento calmo, non durante il litigio.",
        "Riconosci la tua parte e proponi un cambiamento concreto.",
        "Se c'è violenza, chiama il 1522 o il 112."
      ],
      avviso: "Controllo, minacce e violenza non si risolvono con la comunicazione assertiva: serve protezione."
    },
    fonti: [
      "Bowlby J., teoria dell'attaccamento",
      "Gottman J., ricerca sulle relazioni",
      "Dipartimento per le Pari Opportunità, numero 1522"
    ]
  },
  {
    id: "trauma-lutto",
    n: 10,
    titolo: "Trauma, lutto e perdita",
    sommario: "Che cosa succede dopo un evento traumatico o una perdita e quando serve un aiuto specifico.",
    minuti: 10,
    keywords: ["trauma", "ptsd", "lutto", "perdita", "emdr", "flashback", "dissociazione", "grief"],
    sezioni: [
      {
        h: "Trauma: non è solo l'evento",
        p: [
          "Un evento traumatico è intenso, minaccioso e travolge le capacità di gestione. Non tutti sviluppano un disturbo: conta il contesto, il supporto, la storia personale. Il disturbo da stress post-traumatico (PTSD) comprende ricordi intrusivi, incubi, evitamento, ipervigilanza, alterazioni dell'umore e della cognizione, e dura più di un mese.",
          "Nei primi giorni dopo un evento sono normali reazioni acute. Non tutto va «elaborato subito»: spesso servono sicurezza, riposo, vicinanza e una routine."
        ]
      },
      {
        h: "Trattamenti con evidenza",
        p: [
          "Le linee guida internazionali (OMS, NICE) indicano la psicoterapia focalizzata sul trauma come prima scelta: terapia cognitivo-comportamentale focalizzata sul trauma ed EMDR sono tra gli approcci raccomandati. I farmaci possono avere un ruolo in alcuni casi, ma non sono la prima scelta per il PTSD.",
          "L'esposizione a ricordi traumatici va fatta con un professionista formato: fai-da-te e tecniche improvvisate possono peggiorare il quadro."
        ]
      },
      {
        h: "Il lutto",
        p: [
          "Il lutto non è una malattia: è un processo. Non ha una scadenza e non segue una scala lineare. Onde, anniversari, date, canzoni: il dolore torna. La cultura e la rete sociale influenzano molto come si vive.",
          "Il lutto prolungato (DSM-5-TR: disturbo da lutto persistente e complicato) si caratterizza per un dolore intenso e invalidante che persiste oltre un anno negli adulti, con difficoltà a riprendere la vita. Non è «non voler reagire»: è una condizione trattabile."
        ]
      },
      {
        h: "Come stare accanto",
        p: [
          "Non serve avere le parole giuste. Serve esserci: «Non so cosa dire, ma sono qui». Evita frasi come «ora è in un posto migliore» o «devi fartene una ragione». Non fissare scadenze al dolore altrui.",
          "Se una persona esprime desiderio di morire per raggiungere chi ha perso, o non riesce più a funzionare, accompagnala da un professionista e, in caso di pericolo, chiama il 112."
        ]
      }
    ],
    esercizio: {
      titolo: "Una lettera che non spedisci",
      testo: "Scrivi a chi hai perso, o a te stesso/a prima dell'evento. Non serve scrivere bene: serve dare forma a ciò che c'è. Puoi conservarla, rileggerla tra un mese o strapparla."
    },
    quando: {
      titolo: "Se i ricordi ti invadono",
      testo: "Non forzare l'esposizione da solo/a. Usa l'ancoraggio per tornare al presente, poi parla con un professionista formato sul trauma. Se ti senti distaccato/a o «fuori dal corpo», dillo: è un'informazione clinica."
    },
    neura: {
      sintesi: [
        "Il trauma non coincide con l'evento: conta l'impatto. Il PTSD comprende intrusi, evitamento, ipervigilanza e alterazioni dell'umore, oltre un mese dopo l'evento.",
        "Per il PTSD le linee guida indicano psicoterapia focalizzata sul trauma ed EMDR. Il lutto è un processo, non una malattia; il lutto prolungato è una condizione trattabile."
      ],
      passi: [
        "Nei primi giorni: sicurezza, riposo, routine, vicinanza.",
        "Non forzare il racconto del trauma da solo/a.",
        "Cerca un professionista formato su trauma o lutto.",
        "Se il dolore ti toglie il funzionamento o compare rischio, chiedi aiuto subito."
      ],
      avviso: "Se pensi di farti del male o di raggiungere chi hai perso: 112, oppure Telefono Amico 02 2327 2327."
    },
    fonti: [
      "OMS, linee guida su stress acuto e PTSD",
      "NICE, Post-traumatic stress disorder",
      "DSM-5-TR, disturbo da lutto persistente e complicato"
    ]
  },
  {
    id: "corpo-abitudini",
    n: 11,
    titolo: "Corpo, abitudini e sostanze",
    sommario: "Movimento, alimentazione, caffeina, alcol, fumo e sostanze: come influenzano umore e ansia.",
    minuti: 8,
    keywords: ["corpo", "movimento", "alimentazione", "caffeina", "alcol", "fumo", "sostanze", "esami", "sonno"],
    sezioni: [
      {
        h: "Il corpo è parte della mente",
        p: [
          "Umore, ansia e sonno non vivono solo nel cervello. Attività fisica regolare, alimentazione adeguata, luce, riposo e sostanze modificano l'energia e la regolazione emotiva. Non è moralismo: è fisiologia.",
          "L'OMS raccomanda circa 150 minuti di attività moderata a settimana per gli adulti, oltre al movimento quotidiano. Non serve la palestra: serve la regolarità."
        ]
      },
      {
        h: "Caffeina, alcol, nicotina",
        p: [
          "La caffeina ha un'emivita di circa 5-6 ore e può aumentare ansia, palpitazioni e insonnia. L'alcol dà un sollievo breve ma frammenta il sonno, peggiora l'umore nei giorni successivi e mantiene un ciclo di astinenza-ricerca. La nicotina riduce temporaneamente la tensione e la aumenta tra una sigaretta e l'altra.",
          "Ridurre è già un intervento terapeutico. Se smettere da solo/a è difficile, esistono percorsi efficaci (medico, centri antifumo, psicoterapia)."
        ]
      },
      {
        h: "Sostanze e gioco",
        p: [
          "Cannabis, stimolanti, oppioidi, gioco d'azzardo, schermi compulsivi: il meccanismo è spesso lo stesso, un sollievo immediato che crea un debito. La domanda utile non è «sono dipendente?», ma «ciò che uso sta peggiorando la mia vita e riesco a fermarmi?».",
          "I SerD (Servizi per le Dipendenze) sono gratuiti e riservati. Anche il medico di base può orientare. Non serve arrivare al fondo."
        ]
      },
      {
        h: "Escludere le cause mediche",
        p: [
          "Stanchezza persistente, umore basso, ansia nuova, sonno alterato: prima o insieme al percorso psicologico, è ragionevole controllare tiroide, emocromo, ferro, vitamina B12, vitamina D, glicemia e, se indicato, apnee del sonno. Alcuni farmaci (cortisonici, ormoni, decongestionanti) possono influire.",
          "Nessun esame «diagnostica» la depressione: servono a escludere ciò che la imita."
        ]
      }
    ],
    esercizio: {
      titolo: "Una settimana di misura",
      testo: "Per sette giorni annota: ore di sonno, caffè, alcol, minuti di movimento, umore serale 0-10. Non cambiare nulla: misura. Alla fine cerca la relazione più evidente e scegli una sola modifica."
    },
    quando: {
      titolo: "Se il corpo chiede aiuto",
      testo: "Perdita di peso involontaria, palpitazioni nuove, dolore toracico, svenimenti, fiato corto: rivolgiti al medico o al 112 se acuto. Non attribuire tutto allo stress senza una valutazione."
    },
    neura: {
      sintesi: [
        "Movimento, alimentazione, sonno e sostanze influenzano direttamente umore e ansia. L'OMS raccomanda circa 150 minuti di attività moderata a settimana.",
        "Caffeina (emivita 5-6 ore), alcol e nicotina peggiorano ansia e sonno. Le cause mediche vanno escluse con il medico."
      ],
      passi: [
        "Riduci la caffeina del pomeriggio.",
        "Cammina 15-20 minuti al giorno.",
        "Misura alcol e schermi per una settimana.",
        "Chiedi al medico gli esami di base se la stanchezza persiste."
      ],
      avviso: "Non sospendere farmaci da solo/a. Sintomi acuti (dolore al petto, fiato corto) richiedono il 112."
    },
    fonti: [
      "OMS, raccomandazioni sull'attività fisica",
      "ISS, stili di vita e salute mentale",
      "NICE, alcohol-use disorders"
    ]
  },
  {
    id: "etica-ia",
    n: 12,
    titolo: "Etica, privacy e limiti dell'intelligenza artificiale",
    sommario: "Che cosa può e non può fare questo programma, quali dati restano sul dispositivo e perché la responsabilità resta umana.",
    minuti: 7,
    keywords: ["privacy", "etica", "intelligenza artificiale", "ia", "dati", "gdpr", "limiti", "neura", "diagnosi"],
    sezioni: [
      {
        h: "Che cosa è Neura",
        p: [
          "Neura è un motore di conoscenza locale: legge i contenuti di questo programma, riconosce le domande, recupera le informazioni pertinenti e le organizza. Non è un modello linguistico generativo, non apprende dalle conversazioni e non invia nulla in rete.",
          "Non formula diagnosi, non prescrive farmaci, non sostituisce una visita. Quando non sa, lo dice. È una scelta di progetto: meglio un limite dichiarato che una sicurezza simulata."
        ]
      },
      {
        h: "Dove finiscono i tuoi dati",
        p: [
          "Risposte, questionari, diario e relazione restano nella memoria locale del browser (localStorage) del tuo dispositivo. Non c'è un account, non c'è un server, non c'è telemetria. Se cancelli i dati del browser, i dati spariscono: esporta il backup prima.",
          "La relazione PDF viene generata sul dispositivo. Se la invii a un professionista, la condivisione dipende da te e dal canale che scegli. Il programma non la invia da solo."
        ]
      },
      {
        h: "La cornice etica",
        p: [
          "La psicologia è una professione regolamentata, con un codice deontologico che tutela dignità, riservatezza, competenza e responsabilità. Un software non ha titolo per esercitarla. Questo programma è uno strumento di psicoeducazione e orientamento: aiuta a preparare un colloquio, non a sostituirlo.",
          "Non è un dispositivo medico ai sensi del Regolamento UE 2017/745. Non va usato per decisioni cliniche, per valutazioni di idoneità o in situazioni di emergenza."
        ]
      },
      {
        h: "I rischi da conoscere",
        p: [
          "Gli strumenti digitali possono sbagliare, semplificare, non vedere il contesto e rassicurare troppo. Possono anche aumentare l'ansia da autovalutazione («mi misuro in continuazione»). I questionari non sono diagnosi e i punteggi non definiscono una persona.",
          "Il rischio maggiore è il ritardo: usare un'app al posto di chiedere aiuto quando serve. Se il disagio è intenso, persistente o c'è rischio, la priorità è un professionista umano."
        ]
      }
    ],
    esercizio: {
      titolo: "Il tuo patto di utilizzo",
      testo: "Scrivi tre righe: a cosa ti serve questo programma, cosa non gli chiederai (diagnosi, prescrizioni), a chi porterai la relazione. Tienile accanto al piano di mantenimento."
    },
    quando: {
      titolo: "Se qualcosa non torna",
      testo: "Se un contenuto ti sembra sbagliato o ti confonde, non adattarti al software: segnalalo e portalo al professionista. I contenuti sono divulgativi e possono avere limiti."
    },
    neura: {
      sintesi: [
        "Neura è un motore locale di conoscenza, non un'IA generativa: non apprende, non invia dati, non formula diagnosi. I tuoi dati restano nel browser del dispositivo.",
        "Il programma è psicoeducativo e di orientamento, non un dispositivo medico. La responsabilità clinica resta al professionista umano."
      ],
      passi: [
        "Esporta un backup se vuoi conservare i dati.",
        "Porta la relazione a un professionista, non usarla come diagnosi.",
        "Non inserire dati di altre persone senza il loro consenso.",
        "In emergenza non usare l'app: chiama il 112."
      ],
      avviso: "Nessun software può sostituire una valutazione clinica. In caso di rischio: 112."
    },
    fonti: [
      "Regolamento UE 2017/745 sui dispositivi medici",
      "Regolamento UE 2016/679 (GDPR)",
      "CNOP, Codice deontologico degli psicologi italiani"
    ]
  }
]);
