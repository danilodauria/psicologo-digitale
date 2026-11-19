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
  const VERSIONE = "1.7.6";

  // Una voce per ogni release pubblicata, dalla più recente. I testi dicono
  // cosa è cambiato per chi usa il programma, non come è stato scritto.
  const NOVITA = [
    {
      v: "1.7.6",
      data: "19 novembre 2026",
      titolo: "Il diario si corregge, e le schede si possono togliere",
      punti: [
        "In elenco restavano solo le otto voci più recenti: una voce più vecchia si poteva aprire dalla ricerca, ma non correggere. Ora c'è «Vedi tutte le N voci», con l'elenco completo, e ogni riga ha «Modifica» accanto a «Elimina».",
        "Correggere una voce non ne crea una seconda: la data e l'identità restano, cambiano i valori. Prima l'unica strada era cancellare e riscrivere, e nel frattempo le medie del riepilogo contavano un dato sbagliato.",
        "Le schede del pensiero salvate ora si vedono nel diario e si eliminano una per una, con conferma; lo stesso pulsante c'è nella scheda che si apre dalla ricerca. Prima restavano per sempre: l'unico modo per toglierle era cancellare tutti i dati."
      ]
    },
    {
      v: "1.7.5",
      data: "19 novembre 2026",
      titolo: "Il browser dice se i dati sono al riparo",
      punti: [
        "I dati vivono nel browser, e un browser può cancellarli da solo quando lo spazio finisce, per fare posto ad altri siti. Ora l'app chiede al browser di proteggere lo spazio che occupa: è una richiesta che non mostra finestre e non manda niente in rete.",
        "In Licenze c'è una scheda che dice com'è andata: dati protetti, richiesta rifiutata, oppure browser che non offre la protezione. Quando i dati non sono protetti la scheda propone di esportare il backup con un pulsante, perché il file resta anche se il browser cambia idea.",
        "La protezione non è una garanzia: la decisione resta del browser e può cambiarla. Per questo la scheda lo dice invece di promettere che i dati siano eterni; il backup resta l'unica copia che non dipende dal browser."
      ]
    },
    {
      v: "1.7.4",
      data: "19 novembre 2026",
      titolo: "Il sito dice quando c'è una versione nuova",
      punti: [
        "Prima, se il sito veniva aggiornato mentre la pagina era aperta, si continuava a usare la versione vecchia senza saperlo: il service worker nuovo si installava in sottofondo, ma i file in uso restavano quelli di prima fino alla riapertura successiva.",
        "Ora compare una barra con «C'è una versione nuova» e il pulsante «Aggiorna e ricarica»: chiede al service worker di prendere il controllo e ricarica la pagina una volta sola. Se il browser non manda l'avviso, la ricarica avviene lo stesso dopo un attimo; un secondo clic non fa una seconda ricarica.",
        "Alla prima visita la barra non compare, perché non c'è nessuna versione precedente da sostituire. Il controllo avviene all'avvio e ogni volta che si torna sulla pagina, così anche un'app lasciata aperta se ne accorge."
      ]
    },
    {
      v: "1.7.3",
      data: "19 novembre 2026",
      titolo: "Il download della voce naturale arriva in fondo",
      punti: [
        "Il modello italiano di Paola è stato ricaricato sul server il 18 novembre: il programma si aspettava il file di prima, scaricava tutto, rifiutava il file e restava fermo al 100% senza dire niente. La scheda Voce tornava a «Installa Paola» e non si capiva perché.",
        "Ora il catalogo ha misure e impronte dei file veri, e ogni indirizzo è fissato a una versione precisa: un file ricaricato a monte non può più rompere un programma già installato. L'avanzamento si ferma al 99% finché il file non è verificato e scritto, quindi il 100% vuol dire davvero installata.",
        "Se un download fallisce — connessione, spazio, file diverso da quello previsto — la scheda scrive il motivo e la voce resta da installare. Prima il ramo d'errore usava una variabile che non esisteva: non riusciva nemmeno a mostrare l'avviso, e la nota restava ferma sull'ultima percentuale."
      ]
    },
    {
      v: "1.7.2",
      data: "19 novembre 2026",
      titolo: "La frase della ricerca non si incolla più a un altro campo",
      punti: [
        "Nella ricerca delle cose scritte, i campi di una scheda del pensiero — situazione, pensiero, emozione, lettura alternativa — erano uniti in una riga sola: cercando una parola della situazione, l'estratto mostrava anche il pensiero dietro, senza punteggiatura, come se fosse la stessa frase. Ora ogni campo comincia per conto suo e l'estratto mostra quello che contiene la parola.",
        "Con «Riduci il movimento» attivo, la regola che ferma animazioni e transizioni non arrivava allo scorrimento morbido della finestra della chat, che ha un'impostazione sua: i cambi pagina saltavano subito, la conversazione continuava a scorrere. Ora si ferma anche quello, e la regola non lascia fuori nessun elemento della pagina."
      ]
    },
    {
      v: "1.7.1",
      data: "19 novembre 2026",
      titolo: "L'estratto comincia dalla frase, non dal titolo",
      punti: [
        "Nei risultati della ricerca, sotto il titolo del capitolo, la frase compariva con il titolo incollato davanti: cercando «ansia» si leggeva «Ansia L'ansia è…». Non era un errore di visualizzazione: l'indice dei contenuti univa titolo e sommario in una riga sola, e l'estratto partiva dalla prima parola che trovava, cioè dal titolo che era già scritto sopra.",
        "Ora il titolo resta fuori dal testo da cui nasce l'estratto, e i pezzi che lo compongono — sommario, titoli di sezione, paragrafi — sono separati da un a capo, che vale come confine di frase. Ogni risultato mostra una frase intera che comincia da sé, senza ripetere quello che si è già letto nel titolo."
      ]
    },
    {
      v: "1.7.0",
      data: "17 novembre 2026",
      titolo: "La ricerca mostra la frase, e l'orbita sa fermarsi",
      punti: [
        "Ogni risultato della ricerca ora porta la frase in cui compaiono le parole cercate, con le parole in evidenza, invece di un pezzo tagliato a metà. Vale per i capitoli, il glossario e gli esercizi, e per le cose che hai scritto: una nota di tre frasi mostra quella che contiene la parola, non le altre due.",
        "Se il sistema è impostato per ridurre il movimento, l'orbita di Neura resta ferma e le transizioni spariscono. Prima l'animazione veniva solo accorciata a un ciclo di un millisecondo: un modo di dire che la preferenza si rispetta senza rispettarla davvero, perché la pagina ruotava comunque una volta.",
        "L'impostazione è quella del computer o del telefono, non del programma: non c'è un interruttore in più da trovare, e chi ha bisogno di meno movimento lo trova già rispettato alla prima apertura. Quando invece il movimento non dà fastidio, l'orbita continua a respirare come prima."
      ]
    },
    {
      v: "1.6.0",
      data: "17 novembre 2026",
      titolo: "Il confronto si sceglie e si porta in seduta",
      punti: [
        "Il riepilogo non confronta più solo due settimane: accanto al titolo ci sono «7 giorni» e «30 giorni», e la tabella cambia con il periodo scelto. Una settimana a volte è troppo poco per vedere una direzione, un mese a volte è troppo: ora si guarda quello che serve, senza un'altra pagina.",
        "Le due finestre escono dalla stessa funzione: cambiare periodo non cambia il modo di calcolare la media né i confini del periodo precedente, quindi i numeri dei sette giorni restano quelli di prima.",
        "Sotto il titolo compaiono le date vere dei due intervalli, «dal 18 ottobre 2026 al 17 novembre 2026», e restano anche sulla carta: un foglio con i numeri ma senza il periodo a cui si riferiscono non si può portare in seduta.",
        "«Stampa il confronto» prepara un foglio pulito: la tabella, le date e le indicazioni su come leggerle, senza menù, senza pulsanti e senza la scelta del periodo."
      ]
    },
    {
      v: "1.5.0",
      data: "17 novembre 2026",
      titolo: "Cercare anche nelle cose che hai scritto",
      punti: [
        "La ricerca non si ferma più ai capitoli. Nella stessa pagina c'è una sezione «Nelle tue cose» con le voci di diario, le schede del pensiero e le note degli esercizi che contengono le parole cercate: un estratto per risultato, con le parole in evidenza, e un collegamento che porta alla voce.",
        "Il risultato porta dove la cosa è scritta: la voce di diario si apre anche quando è più vecchia delle otto in elenco, la scheda del pensiero si legge per intero, la nota riapre l'esercizio con il cursore già nel campo. Ritrovare una cosa scritta mesi prima non richiede più di scorrere il diario.",
        "Le note del percorso esistevano nei dati ma non c'era un posto per scriverle: ogni esercizio ora ha la sua, «Come è andata», che resta con l'esercizio e viaggia nel backup insieme al percorso.",
        "Contenuti e cose scritte restano due ricerche separate, con due sezioni distinte: quello che scrivi non entra nell'indice dei capitoli. Tutto avviene sul dispositivo come prima, e un test impedisce che i due indici si mescolino."
      ]
    },
    {
      v: "1.4.2",
      data: "17 novembre 2026",
      titolo: "Le prove a mano scritte, invece che ricordate",
      punti: [
        "I test automatici controllano i conteggi, i contrasti e i testi, ma non possono sentire la voce che parte, vedere un telefono stretto o accorgersi di un messaggio comparso nel momento sbagliato. Quelle prove si facevano a memoria, e a memoria si saltano.",
        "Ora c'è un foglio per ogni versione: trentadue prove divise per area — riepilogo dei periodi, ricerca, backup con migrazione, dimensione del testo, modalità discreta, lettura ad alta voce — ognuna con i passi, il risultato atteso e una casella da spuntare. In testa c'è come preparare i dati in due minuti, senza aspettare una settimana di diario.",
        "Il foglio della 1.4.0 sta in PROVE-A-MANO-1.4.0.md, si legge dal repository e si raggiunge dal README; le prove dei pacchetti si fanno sull'app scaricata dalla pagina Installa l'app. Include le verifiche sul messaggio dell'import corretto nella 1.4.1, così chi prova sa quale frase deve vedere.",
        "In fondo c'è una tabella per l'esito: data, dispositivo, versione, quante prove sono passate, note. E l'avvertenza che conta: mai allegare un backup vero quando si segnala un problema, perché contiene dati personali."
      ]
    },
    {
      v: "1.4.1",
      data: "17 novembre 2026",
      titolo: "Il backup già aggiornato non finge di essere stato convertito",
      punti: [
        "Importando un backup esportato da questa stessa versione, il messaggio finale diceva «e aggiornato al formato attuale». Non era vero: quel file era già nel formato attuale e nessuna conversione era avvenuta. Un messaggio che racconta un lavoro mai fatto è peggio di nessun messaggio, perché insegna a fidarsi poco di tutti gli altri.",
        "Ora la conversione si dichiara solo quando c'è stata davvero: il campo che la segnala nasce dal confronto fra il formato del file e quello di arrivo, non dal fatto che il formato sia riconosciuto. Un file vecchio continua a dire di essere stato aggiornato, uno attuale dice solo «Backup importato».",
        "Il caso è coperto da un test: si esporta adesso e si reimporta lo stesso file, controllando che l'app non annunci nessun aggiornamento; accanto resta il test sul file vecchio, che invece l'annuncio deve darlo. La differenza è invisibile finché il messaggio non mente, ed è per questo che serve un test."
      ]
    },
    {
      v: "1.4.0",
      data: "16 novembre 2026",
      titolo: "Ritrovare le proprie cose: riepilogo, ricerca e un backup che si riconosce",
      punti: [
        "Il confronto che mancava. Una pagina nuova mette gli ultimi sette giorni accanto ai sette prima: medie di umore, ansia, sonno ed energia, quante voci di diario, quante schede del pensiero, quanti questionari — e la differenza, con il segno. Non dice se è meglio o peggio: mette due periodi vicini, che è il modo più semplice per accorgersi che una direzione c'è.",
        "Un backup che si riconosce. Ogni file esportato dichiara il formato che ha. Un file vecchio viene completato prima di essere importato, uno di una versione più recente viene rifiutato con una frase che spiega perché, invece di essere letto alla cieca e perdere quello che non conosce.",
        "Il promemoria dell'esportazione. Chi non ha mai esportato lo legge in Licenze; chi non lo fa da un mese ritrova l'avviso. Se l'ultimo backup è recente, la stessa riga dice quando è stato fatto: «Ultima esportazione: 12 novembre (4 giorni fa)». Niente notifiche di sistema da autorizzare.",
        "Cercare dentro il programma. Dodici capitoli, glossario ed esercizi in un campo solo: più parole insieme si cercano tutte, e la ricerca avviene sul dispositivo. Una parola che non c'è lo dice, invece di mostrare una pagina vuota.",
        "Il testo alla dimensione giusta. Tre scelte in Licenze — normale, grande, più grande — che valgono per tutta l'app, non solo per la pagina in cui le scegli, e restano salvate al prossimo avvio.",
        "La modalità discreta. Copre i contenuti finché non premi «Mostra i contenuti», e li ricopre appena cambi pagina: serve quando qualcuno passa dietro le spalle, non a nascondere il programma.",
        "Un capitolo si può ascoltare. Il pulsante «Ascolta il capitolo» usa la stessa voce di Neura, quindi la scelta della voce, il ritmo e il pulsante Stop valgono anche qui: una sola strada per parlare, non due.",
        "La pagina che cambia lo dice. Al cambio di pagina il titolo riceve il focus e un annuncio letto dai lettori di schermo conferma che la pagina è cambiata: prima, chi non vede lo schermo restava nella pagina precedente.",
        "Un invito, non una serie. Se il diario è fermo da qualche giorno la home lo nota e propone una riga su oggi. Nessun conteggio dei giorni saltati, nessun premio da difendere: non ci sono serie da mantenere.",
        "I controlli sono cresciuti con il programma. Le due schermate che non hanno una rotta — il risultato di un questionario e l'anteprima di un ripristino — ora vengono aperte e lette dai controlli automatici, come tutte le altre pagine: oltre cinquanta verifiche in più nei test, e nessuna pagina che si salva perché nessuno la guarda."
      ]
    },
    {
      v: "1.3.76",
      data: "13 novembre 2026",
      titolo: "Tenere solo la copia più recente, con un pulsante",
      punti: [
        "Quando le copie si accumulano, quella che serve è quasi sempre l'ultima: cancellare le altre una per una significava ripetere lo stesso gesto e rifare il conto ogni volta.",
        "Ora c'è un pulsante che dice quello che fa: «Tieni solo la più recente e libera 8,2 kB». Accanto c'è quante copie spariscono e la data di quella che resta.",
        "Funziona come le altre cancellazioni: chiede conferma, dice quali tocca, e lo spazio promesso è quello guadagnato davvero. Con una copia sola il pulsante non compare, perché non c'è niente da pulire."
      ]
    },
    {
      v: "1.3.75",
      data: "13 novembre 2026",
      titolo: "Ogni copia dice quanto spazio libera se la cancelli",
      punti: [
        "Per scegliere quale copia togliere bisognava ricordare quanto spazio occupavano le altre: l'elenco diceva la dimensione di ciascuna, non quanto avrebbe liberato cancellarla.",
        "Ora accanto a ogni copia c'è il numero: «4,1 kB · cancellandola liberi 4,2 kB» — lo stesso che compare nella richiesta di conferma e nel messaggio finale.",
        "Il numero è misurato, non stimato: si pesa l'archivio delle copie con e senza quella voce, perché togliendone una cambia anche la punteggiatura dell'elenco. Un test confronta il valore promesso con lo spazio guadagnato davvero."
      ]
    },
    {
      v: "1.3.74",
      data: "13 novembre 2026",
      titolo: "La copia di prima del ripristino si riconosce nell'elenco",
      punti: [
        "La copia presa automaticamente prima di un ripristino era identica alle altre nell'elenco: stesso aspetto, stessa data, nessun modo di sapere che quella era il punto in cui si torna se il ripristino era sbagliato.",
        "Ora porta il segno «Punto di ritorno» e la frase che dice a cosa si riferisce — «Prima del ripristino del 12 novembre 2026» — così si trova senza aprire le copie una per una. Le copie di routine restano senza etichetta.",
        "L'etichetta è un campo della copia, non un testo calcolato al volo: viene salvata con i dati e resta leggibile anche dopo aver chiuso l'app."
      ]
    },
    {
      v: "1.3.73",
      data: "13 novembre 2026",
      titolo: "Annullare un ripristino con un clic",
      punti: [
        "Annullare un ripristino sbagliato era possibile, ma bisognava capire quale copia fosse quella di prima e ripristinarla a sua volta: una via d'uscita che richiede di ragionare proprio nel momento in cui si è appena sbagliato.",
        "Dopo un ripristino, in Licenze compare un avviso con il pulsante «Annulla il ripristino»: un clic riporta i dati a com'erano prima, senza scegliere niente dall'elenco. L'avviso sparisce quando l'annullamento è fatto.",
        "L'ancora vale anche se la copia di sicurezza non era riuscita per spazio pieno, perché i dati di prima sono tenuti in mano e non solo scritti: in quel caso il ripristino resta annullabile lo stesso."
      ]
    },
    {
      v: "1.3.72",
      data: "13 novembre 2026",
      titolo: "Lo storico dei punteggi: come cambia un questionario nel tempo",
      punti: [
        "Rifacendo un questionario il punteggio precedente spariva: restava solo l'ultimo, e non c'era modo di sapere se un'area stava migliorando o peggiorando. La pagina Valutazione diceva anzi «i punteggi precedenti vengono sostituiti».",
        "Ora ogni compilazione completata lascia un punto nello storico, con data e punteggio: accanto al questionario si vedono le ultime sei misurazioni a barre, e nella pagina del risultato la serie intera, con il confronto fra l'ultima e la prima.",
        "Le bozze intermedie non contano, e la frase resta neutra — «27 punti sopra la prima», non «peggiorato»: su una scala di sintomi il numero non dice da solo come stanno le cose. Lo storico entra nel backup ed è nel conteggio dello spazio occupato."
      ]
    },
    {
      v: "1.3.71",
      data: "13 novembre 2026",
      titolo: "Il confronto dei punteggi si vede a colpo d'occhio",
      punti: [
        "L'anteprima del ripristino elencava i punteggi dei questionari in una lista: «oggi 12 su 21, nella copia 0 su 21». Giusto, ma per capire la differenza bisognava leggere e fare la sottrazione.",
        "Ora accanto alla lista ci sono due barre per questionario, sulla stessa scala: una per oggi e una per la copia. La differenza si vede prima di leggere i numeri, e i numeri restano scritti sopra, in chiaro.",
        "Il grafico è muto per i lettori di schermo, proprio perché ripete ciò che è già scritto in parole: nessuna informazione affidata al solo colore. La scala è il massimo vero del questionario, non una stima."
      ]
    },
    {
      v: "1.3.70",
      data: "13 novembre 2026",
      titolo: "La modifica rifiutata viene ritentata da sola",
      punti: [
        "Quando il browser rifiutava una scrittura, quel testo spariva: l'avviso avvisava, ma la modifica restava persa anche dopo aver liberato spazio.",
        "Ora il testo rifiutato resta in attesa, per chiave, e viene ritentato automaticamente appena si compatta o si esporta un backup: le due azioni che possono far tornare lo spazio. Riuscendo, il messaggio lo dice.",
        "Se lo spazio è ancora pieno la modifica resta in attesa per la volta dopo, senza un secondo avviso sopra quello già a schermo. Il ritentativo prende sempre l'ultima versione scritta, non una vecchia."
      ]
    },
    {
      v: "1.3.69",
      data: "13 novembre 2026",
      titolo: "Il backup si esporta dall'avviso stesso",
      punti: [
        "Quando il browser rifiuta un salvataggio, l'avviso diceva di andare in Licenze a esportare un backup. Chi ha appena perso una modifica deve invece poter mettere al sicuro quello che ha già scritto, subito e da dove si trova.",
        "L'avviso ora porta un pulsante «Esporta backup ora»: il file si scarica con un clic, senza cambiare pagina, e il messaggio si chiude da solo. Lo stesso pulsante compare nell'avviso stabile in Licenze, che resta finché un salvataggio non riesce.",
        "L'avviso resta un'area viva per i lettori di schermo, e il pulsante è raggiungibile da tastiera: il clic si conta nei test, insieme al fatto che il messaggio non rimandi più a un'altra pagina."
      ]
    },
    {
      v: "1.3.68",
      data: "13 novembre 2026",
      titolo: "Quanto spazio hai liberato in tutto",
      punti: [
        "Il messaggio di conferma diceva quanto si era liberato quella volta, poi spariva: chi compatta ogni tanto non aveva modo di sapere se ne era valsa la pena.",
        "Nella card dello spazio compare ora una riga: «In tutto hai liberato 14 kB con 2 compattazioni». Il totale si somma a ogni compattazione e resta anche dopo aver chiuso l'app.",
        "Una compattazione che non trova niente da togliere non gonfia il conto, e se il browser rifiuta di scrivere il totale resta quello di prima invece di sparire. Nello stesso elenco ora si leggono per nome anche la soglia scelta e il totale, invece della chiave grezza."
      ]
    },
    {
      v: "1.3.67",
      data: "13 novembre 2026",
      titolo: "Scegliere quanto vecchie devono essere le schede da togliere",
      punti: [
        "La compattazione guardava sempre trenta giorni indietro. Ma quanto è «vecchio» dipende da come si scrive: chi tiene un diario fitto può voler conservare tre mesi e togliere solo il resto.",
        "Nella card dello spazio c'è ora un selettore — 30, 60 o 90 giorni — e il conto si aggiorna appena lo si cambia: quante schede si toglierebbero, quanto spazio si libererebbe, quante restano.",
        "La scelta resta scritta accanto ai dati e vale anche al prossimo avvio. Un valore diverso da quelli previsti viene rifiutato, e anteprima e compattazione leggono la soglia dallo stesso punto: non possono guardare due finestre diverse."
      ]
    },
    {
      v: "1.3.66",
      data: "13 novembre 2026",
      titolo: "Il riepilogo dei controlli resta in un file leggibile",
      punti: [
        "Il riepilogo che appare in fondo a «npm test» scorreva via con il terminale: per sapere cosa avevano controllato l'ultima volta i tre controlli bisognava rilanciare tutto.",
        "Ora lo stesso riepilogo viene scritto in «artifacts/copertura/riepilogo.md»: una tabella con pagine, viste ed elementi di ciascun controllo, la riga degli elementi del programma, la data e l'esito.",
        "Il file si scrive anche quando qualcosa non torna, con l'elenco dei punti da sistemare: il motivo di un rosso è la cosa più utile da ritrovare dopo."
      ]
    },
    {
      v: "1.3.65",
      data: "13 novembre 2026",
      titolo: "I controlli dichiarano anche quali pagine hanno letto",
      punti: [
        "I controlli di testi e accessibilità leggevano già le pagine dei singoli capitoli, esercizi e questionari, perché il giro segue i collegamenti dagli elenchi. Nessuno però lo verificava: se un collegamento fosse sparito, quelle pagine sarebbero uscite dal controllo in silenzio, con tutte le viste al loro posto.",
        "Ora ognuno dei tre controlli dichiara quanti dei 30 elementi ha letto davvero, e il riepilogo si ferma se uno ne ha saltato qualcuno: «30 su 30 letti da testi, accessibilità, collegamenti».",
        "Provato inserendo una pagina attesa che non esiste: il controllo dei testi si ferma e la nomina — «pagine dei singoli elementi mai lette: capitolo #/manuale/capitolo-finto»."
      ]
    },
    {
      v: "1.3.64",
      data: "13 novembre 2026",
      titolo: "La copia prima del ripristino non può restare una promessa",
      punti: [
        "La copia di sicurezza prima di un ripristino c'era già: i dati attuali diventano una copia e si torna indietro ripristinandola. Mancava il caso in cui quella copia non si riesce a fare, per spazio esaurito.",
        "Ora, se il salvataggio della copia fallisce, l'app lo dice prima di procedere e chiede il permesso: «Il ripristino non potrà essere annullato. Procedere lo stesso?». Rifiutando, i dati restano esattamente come sono.",
        "Se invece non c'era niente da salvare non chiede nulla: non c'è nulla da perdere, e una domanda in più sarebbe solo un ostacolo."
      ]
    },
    {
      v: "1.3.63",
      data: "13 novembre 2026",
      titolo: "Cancellare una copia dice quanto libera",
      punti: [
        "La conferma della cancellazione ora dice quanto spazio libera, e il messaggio dopo aver cancellato lo ripete: «Copia del 13 novembre 2026 cancellata: 41 KB liberati».",
        "È lo stesso numero che la riga della copia mostra accanto, calcolato sulla copia vera: prima e dopo non possono dire cose diverse.",
        "Il resto non cambia: si toglie una copia sola, le altre restano e i dati attuali non vengono toccati."
      ]
    },
    {
      v: "1.3.62",
      data: "13 novembre 2026",
      titolo: "Dal capitolo all'esercizio, e ritorno",
      punti: [
        "In fondo a ogni capitolo, nella card dell'esercizio, un collegamento apre l'esercizio completo che gli corrisponde: si passa dalla lettura alla pratica senza tornare all'elenco.",
        "Viceversa, in fondo a ogni esercizio il primo collegamento riporta al capitolo che lo accompagna, con il suo titolo: chi arriva dalla pratica trova il contesto da cui viene.",
        "L'abbinamento sta in un solo campo dei dati, quindi i due collegamenti non possono indicare cose diverse. Un controllo apre tutti e ventiquattro gli elementi e verifica che ogni capitolo punti al proprio esercizio, che ogni esercizio torni al proprio capitolo e che nessuno dei dodici esercizi resti fuori."
      ]
    },
    {
      v: "1.3.61",
      data: "13 novembre 2026",
      titolo: "Capitolo 3 di 12, anche negli esercizi",
      punti: [
        "In cima a ogni capitolo ora si legge «Capitolo 3 di 12»: sapere quanto manca aiuta a scegliere se leggere ancora o fermarsi, in un manuale che non va finito.",
        "Lo stesso vale per gli esercizi: «Esercizio 5 di 12 · 4 minuti», con la durata accanto alla posizione, così si sa dove si è e quanto impegna.",
        "Il numero non è scritto a mano: viene dal posto nell'elenco, e un controllo lo confronta su tutti e ventiquattro gli elementi. Se un capitolo viene spostato o aggiunto, un numero rimasto indietro ferma la pubblicazione."
      ]
    },
    {
      v: "1.3.60",
      data: "13 novembre 2026",
      titolo: "Si può cancellare una copia sola",
      punti: [
        "Accanto a «Ripristina» ed «Esporta» ogni copia ha «Cancella»: toglie quella copia e lascia stare le altre e i dati di oggi. Prima si poteva solo ridurre il numero di copie tenute, e si perdeva sempre la più vecchia.",
        "Serve per liberare spazio tenendo la copia più recente, o per togliere una copia palesemente sbagliata senza rinunciare alle altre.",
        "La conferma dice la data della copia e che i dati attuali non vengono toccati; se la scrittura non riesce, l'app lo dice invece di far finta di aver cancellato."
      ]
    },
    {
      v: "1.3.59",
      data: "13 novembre 2026",
      titolo: "Un ripristino sbagliato si può annullare",
      punti: [
        "Prima di sostituire i dati, l'app salva quelli attuali in una copia: se il ripristino non convince, si torna indietro ripristinando quella, senza aver perso niente di ciò che c'era.",
        "L'anteprima lo dice prima di confermare, e il messaggio dopo il ripristino ricorda dove sono finiti i dati di prima. La copia si prende anche quando si ripristina quella di oggi, che altrimenti sarebbe stata sovrascritta.",
        "La copia scelta viene letta prima di salvare: salvando, l'elenco si sposta e gli indici cambiano, quindi senza questa attenzione si sarebbe potuta ripristinare la copia sbagliata."
      ]
    },
    {
      v: "1.3.58",
      data: "13 novembre 2026",
      titolo: "Anche i punteggi dei questionari nell'anteprima",
      punti: [
        "L'anteprima del ripristino non dice più solo quanti questionari sono compilati: per ognuno mostra il punteggio di oggi e quello nella copia, con la fascia — «oggi 12 su 21 · ansia moderata, nella copia 16 su 21 · ansia elevata».",
        "Compaiono solo i questionari che cambierebbero: un punteggio identico non si vede, così l'elenco resta corto. Un questionario compilato in parte è indicato come tale, invece di sembrare una misura finita.",
        "Serviva perché due questionari compilati oggi e due nella copia possono dire cose molto diverse: il numero uguale nascondeva punteggi diversi, e ripristinare poteva cambiare in silenzio la misura da portare al professionista."
      ]
    },
    {
      v: "1.3.57",
      data: "13 novembre 2026",
      titolo: "Se il salvataggio non riesce, lo dice",
      punti: [
        "Prima, quando il browser rifiutava una scrittura perché lo spazio era finito, il dato spariva in silenzio. Ora compare un messaggio che lo dice con parole chiare, e in Licenze resta un avviso finché un salvataggio non torna a riuscire.",
        "Vale per ogni scrittura: colloquio, diario, questionari, percorso, note, schede del pensiero. Ogni salvataggio dice se è andato a buon fine, e chi lo chiama non può più crederlo riuscito per errore.",
        "Il messaggio non si ripete a raffica: se il browser rifiuta più scritture di seguito, l'avviso compare una volta ogni quindici secondi, così non copre quello che stavi facendo."
      ]
    },
    {
      v: "1.3.56",
      data: "13 novembre 2026",
      titolo: "Compattare i dati vecchi, sapendo quanto libera",
      punti: [
        "Nella scheda dello spazio, in Licenze, c'è un pulsante che dice quanto libererebbe prima di farlo: «Compatta e libera 180 KB». Sopra, in chiaro, cosa si toglie e cosa resta.",
        "Si tolgono la conversazione con Neura e le schede del pensiero più vecchie di trenta giorni, tenendo sempre le ultime dieci: una pausa lunga non deve portarsi via il lavoro fatto prima. Colloquio, questionari, diario e note non si toccano mai.",
        "La compattazione non prende una copia prima, ed è voluto: la copia conterrebbe proprio le schede che si stanno togliendo, e lo spazio liberato finirebbe occupato di nuovo. La conferma lo dice senza giri di parole: non si torna indietro."
      ]
    },
    {
      v: "1.3.55",
      data: "13 novembre 2026",
      titolo: "Il riepilogo dice anche quanti elementi",
      punti: [
        "Il riepilogo in fondo a «npm test» affianca pagine e viste un'altra colonna: quanti elementi ha esaminato ciascun controllo, con la sua unità — 2022 blocchi di testo, 5902 testi misurati, 486 collegamenti. Sapere dove si è guardato non basta: conta anche quanto.",
        "Una riga a parte dice gli elementi del programma — 12 capitoli, 12 esercizi, 6 questionari — e che ognuno ha un collegamento che lo apre, così un elemento rimasto orfano si vede nel riepilogo e non solo nell'output del controllo dei collegamenti.",
        "Il riepilogo si ferma se un rapporto non dichiara i suoi elementi o se qualcuno dei 30 resta senza porta. Provato togliendo il dato a un rapporto e fingendo due elementi orfani: in entrambi i casi esce con errore e dice quale controllo è rimasto indietro."
      ]
    },
    {
      v: "1.3.54",
      data: "13 novembre 2026",
      titolo: "Precedente e successivo, anche negli esercizi",
      punti: [
        "Le pagine degli esercizi hanno ora i pulsanti «precedente» e «successivo», come i capitoli del manuale: si passa da una pratica all'altra senza tornare all'elenco ogni volta.",
        "Ogni pulsante dice il titolo di ciò che apre, e il primo e l'ultimo elemento non mostrano il pulsante che non avrebbe destinazione: nessun collegamento che porta al vuoto.",
        "Un controllo automatico, dentro la verifica dei collegamenti, apre tutti i dodici capitoli e i dodici esercizi e confronta ogni pulsante con l'elemento adiacente: se un indice sbaglia, la pubblicazione si ferma prima di arrivare sul sito."
      ]
    },
    {
      v: "1.3.53",
      data: "13 novembre 2026",
      titolo: "Anche una copia si può salvare come file",
      punti: [
        "Accanto a «Ripristina» ogni copia ha «Esporta»: scarica quella copia come file JSON, con giorno e ora nel nome, così due copie scaricate a distanza di ore non si sovrascrivono nella cartella dei download.",
        "Il file ha la stessa forma di un backup, quindi si rimette a posto con «Importa backup»: porta una copia su un altro dispositivo o in una cartella esterna senza esportare i dati di oggi.",
        "Serve proprio quando lo spazio del browser si avvicina al limite: si conserva su disco una versione precisa e la si toglie dal browser, invece di scegliere fra tutto e niente."
      ]
    },
    {
      v: "1.3.52",
      data: "13 novembre 2026",
      titolo: "Quali voci mancherebbero, una per una",
      punti: [
        "L'anteprima del ripristino non dice più soltanto quante voci si perderebbero: elenca una per una le voci di diario e le schede del pensiero che mancherebbero rispetto alla copia, con la data e con il testo che le rende riconoscibili.",
        "Per il diario compare la nota scritta, per le schede del pensiero la situazione; se la voce è senza testo si mostra almeno l'umore, così non resta un numero anonimo.",
        "Oltre cinque voci l'elenco si ferma e dice quante altre ce ne sono: l'anteprima resta leggibile anche con mesi di diario, e il testo di ogni voce è accorciato perché serve a riconoscerla, non a rileggerla."
      ]
    },
    {
      v: "1.3.51",
      data: "13 novembre 2026",
      titolo: "L'anteprima del ripristino dice tutto",
      punti: [
        "L'anteprima ora elenca anche percorso, esercizi completati e risposte ai quiz: prima il ripristino li riscriveva senza dirlo, e chi tornava a una copia vecchia perdeva il percorso fatto senza vederlo.",
        "Quando una voce sparirebbe l'anteprima dice quale: «sparirebbe la voce del 12 novembre», non solo quante sono, così si riconosce a colpo d'occhio il diario che si sta lasciando indietro.",
        "Una riga dice quello che il ripristino non tocca — tema e numero di copie — e un controllo automatico confronta le voci dell'anteprima con i dati che il ripristino riscrive: se qualcuno ne aggiunge uno senza nominarlo, il controllo si ferma."
      ]
    },
    {
      v: "1.3.50",
      data: "13 novembre 2026",
      titolo: "Quanto spazio occupano tutti i dati",
      punti: [
        "Nella pagina Licenze una scheda dice quanto occupano complessivamente colloquio, questionari, diario, note, preferenze e copie automatiche, e quanto pesano rispetto alla quota che un browser concede di solito a un sito.",
        "Le voci sono in ordine dalla più pesante alla più leggera, con il nome che si usa nel programma — Diario, Questionari — non la chiave tecnica: si vede subito cosa alleggerire.",
        "Quando lo spazio si avvicina al limite la scheda lo dice per tempo. Il numero è un metro realistico, non una quota letta dal browser, e la pagina lo scrive invece di far finta di conoscerla."
      ]
    },
    {
      v: "1.3.49",
      data: "13 novembre 2026",
      titolo: "Tre controlli, un riepilogo",
      punti: [
        "In fondo a tutti i test compare un riepilogo unico: quante pagine e quante viste ha letto ciascun controllo, con quello che ha misurato davvero — blocchi di testo, contrasti, collegamenti, elementi con una porta.",
        "I tre rapporti si confrontano fra loro: se uno legge meno pagine o visita meno viste degli altri, il riepilogo lo dice e la pubblicazione si ferma, invece di lasciare il calo nascosto in un output che nessuno rilegge.",
        "Il numero delle pagine viene dalla cartella: una pagina nuova deve comparire in tutti e tre i conteggi, altrimenti il riepilogo non torna."
      ]
    },
    {
      v: "1.3.48",
      data: "13 novembre 2026",
      titolo: "Nessun capitolo, esercizio o questionario senza una porta",
      punti: [
        "Il controllo dei collegamenti non si ferma alle viste: verifica che ognuno dei dodici capitoli, dei dodici esercizi e dei sei questionari abbia almeno un collegamento che lo apra.",
        "Un elemento senza collegamento resta nei dati ma sparisce dal programma: ora il controllo lo nomina e la pubblicazione si ferma, invece di accorgersene chi lo cerca.",
        "Gli elementi attesi si leggono dai dati, non da un elenco scritto a mano: aggiungerne uno senza collegarlo fa fallire il controllo da solo, senza che nessuno debba ricordarsi di aggiornare una lista."
      ]
    },
    {
      v: "1.3.47",
      data: "13 novembre 2026",
      titolo: "Prima di ripristinare, cosa cambia",
      punti: [
        "«Ripristina» non sostituisce più i dati alla cieca: apre un riepilogo che dice cosa cambierebbe rispetto a oggi — risposte del colloquio, questionari compilati, voci di diario, schede del pensiero, note della relazione.",
        "Si vedono solo le differenze, con il numero di oggi e quello della copia; se la copia è identica ai dati attuali lo dice, invece di far finta che ci sia qualcosa a rischio.",
        "Confermare richiede un secondo clic esplicito e «Annulla» chiude il riepilogo senza toccare niente: un test segue tutti e tre i passaggi."
      ]
    },
    {
      v: "1.3.46",
      data: "13 novembre 2026",
      titolo: "Quante copie tenere, e quanto pesano",
      punti: [
        "Nella pagina Licenze si sceglie da una a sette copie automatiche; il valore iniziale resta tre. Se si abbassa il numero, le copie in più vengono tolte subito invece di restare fino al giorno dopo.",
        "Accanto alla scelta c'è lo spazio occupato davvero: copia per copia e in totale, con il limite che il browser concede di solito a un sito. Chi ha un diario lungo sa così cosa sta chiedendo.",
        "La preferenza sopravvive all'azzeramento, come le copie: una copia sola per chi vuole restare leggero, una settimana di margine per chi preferisce averne."
      ]
    },
    {
      v: "1.3.45",
      data: "13 novembre 2026",
      titolo: "La stessa regola vale anche per accessibilità e collegamenti",
      punti: [
        "I controlli di accessibilità e dei collegamenti leggono ora le pagine dalla cartella, come quello dei testi: una pagina nuova entra in tutti e tre da sola, senza elenchi da aggiornare a mano.",
        "Anche loro partono da ogni collegamento della pagina — menu compreso — e alla fine confrontano le viste registrate con quelle davvero percorse: una vista che nessun collegamento raggiunge fa fallire il controllo e viene nominata.",
        "I collegamenti verificano anche i menu che nessuno apre durante la prova, e l'accessibilità misura il contrasto nei due temi su ogni vista, non solo su quelle della pagina iniziale."
      ]
    },
    {
      v: "1.3.44",
      data: "13 novembre 2026",
      titolo: "Nessuna pagina può restare fuori dal controllo",
      punti: [
        "Il controllo dei testi legge le pagine dalla cartella invece che da un elenco scritto a mano: una pagina nuova entra nel controllo da sola, senza che nessuno debba ricordarsi di aggiungerla.",
        "Alla fine confronta le viste registrate nel programma con quelle davvero percorse: se una non è raggiungibile da nessun collegamento, il controllo fallisce e la nomina, invece di saltarla in silenzio.",
        "È esattamente il difetto che aveva lasciato fuori questa pagina: non un errore di scrittura, ma un controllo che non guardava. Ora lo dice lui, prima che se ne accorga qualcun altro."
      ]
    },
    {
      v: "1.3.43",
      data: "13 novembre 2026",
      titolo: "Una copia di sicurezza, ogni giorno, senza fare niente",
      punti: [
        "Il programma salva da solo una copia dei dati nel browser una volta al giorno: colloquio, questionari, diario e note. Restano le ultime tre, una per giorno.",
        "Non esce dal dispositivo, non richiede un account e non viene toccata da «Cancella tutti i dati»: anzi, proprio l'azzeramento ne prepara una prima di procedere, anche quando si sceglie di non scaricare il file.",
        "Nella pagina Licenze ogni copia dice quando è stata presa, quante risposte e quante voci di diario contiene, e si ripristina con un pulsante; un test verifica che il diario torni al suo posto."
      ]
    },
    {
      v: "1.3.42",
      data: "13 novembre 2026",
      titolo: "Rifare il colloquio senza perdere il resto",
      punti: [
        "Nel riquadro dell'azzeramento c'è una scelta in più: «Azzera solo il colloquio», che riporta alla prima domanda lasciando intatti i questionari già compilati e il diario.",
        "Il consenso torna da confermare: le domande che seguono dipendono da quello che si accetta all'inizio, e ripartire dal mezzo darebbe un quadro falsato.",
        "L'azzeramento parziale è una funzione sua, separata da quella che cancella tutto, e un test verifica che il diario sopravviva mentre le risposte spariscono."
      ]
    },
    {
      v: "1.3.41",
      data: "13 novembre 2026",
      titolo: "Prima di azzerare, un backup",
      punti: [
        "«Azzera e ricomincia» ora si ferma un istante: prima di cancellare chiede se vuoi salvare un backup di colloquio, questionari, diario e note in un file che si reimporta dalla pagina Licenze.",
        "Le scelte sono esplicite — «Scarica il backup e azzera», «Azzera senza backup», «Annulla» — e dicono ciascuna cosa sta per succedere, invece di affidarsi a un sì o no.",
        "Il backup è la stessa funzione della pagina Licenze: un test verifica che il file venga preparato davvero prima che le risposte spariscano.",
        "Il controllo dei testi ora legge anche le viste che si aprono solo dal menu: la pagina che stai leggendo era l'unica rimasta fuori, e appena inclusa ha fatto trovare una frase da sistemare."
      ]
    },
    {
      v: "1.3.40",
      data: "13 novembre 2026",
      titolo: "Un pulsante per ricominciare da capo",
      punti: [
        "Il colloquio ha un pulsante in fondo alla scheda, sotto ogni domanda: azzera le risposte e riparte dalla prima, senza dover cercare la pagina delle licenze.",
        "Prima di cancellare chiede due conferme e dice cosa sparisce: colloquio, questionari, diario e note. Il pulsante c'è anche nella restituzione, quando il colloquio è già finito.",
        "La pagina Licenze usa la stessa funzione, quindi le due strade cancellano esattamente le stesse cose: un test lo verifica, perché due copie della stessa cancellazione prima o poi divergono."
      ]
    },
    {
      v: "1.3.39",
      data: "12 novembre 2026",
      titolo: "Electron 45, e una build vera prima di dire sì",
      punti: [
        "Il pacchetto desktop passa a Electron 45 e electron-builder 26: le 18 vulnerabilità note nella catena di costruzione si chiudono qui.",
        "Prima di entrare, ogni aggiornamento è stato provato con una build completa su Linux, Windows e macOS, e gli archivi sono stati aperti e confrontati file per file: non basta che il codice compili.",
        "Il test dell'interfaccia usa jsdom 31 e i controlli girano su Node 22, la versione che quella libreria richiede; il programma per chi lo usa non cambia.",
        "Le azioni dei workflow sono all'ultima versione: setup-node 7, upload-artifact 7, configure-pages 6, upload-pages-artifact 5, action-gh-release 3."
      ]
    },
    {
      v: "1.3.38",
      data: "12 novembre 2026",
      titolo: "Le dipendenze si controllano da sole, ogni settimana",
      punti: [
        "Ogni lunedì il programma confronta le sue dipendenze con il registro npm: cosa è uscito di nuovo e quali vulnerabilità note riguardano le versioni che sta usando davvero.",
        "Quando trova qualcosa apre una segnalazione con l'elenco già scritto — pacchetto, versione in uso, ultima disponibile, gravità e se esiste una correzione — e la aggiorna al controllo successivo; quando non trova nulla la chiude da sola.",
        "Gli aggiornamenti ordinari proposti da Dependabot passano dagli stessi controlli di ogni pubblicazione e vengono fusi senza intervento; un aggiornamento major resta a una persona, perché cambia troppo per affidarlo a un test.",
        "Il controllo non finge: se il registro non risponde lo dice e si ferma, invece di annunciare che è tutto a posto."
      ]
    },
    {
      v: "1.3.37",
      data: "4 novembre 2026",
      titolo: "Il pacchetto installabile viene aperto e confrontato",
      punti: [
        "Il controllo apre gli archivi installabili — .deb e ZIP portatile — e confronta ogni file del programma con quello del repository: impronte SHA-256, non solo presenza.",
        "Ha trovato un difetto vero: su Windows i file uscivano con le fine di riga convertite, PDF compresi, e la tabella interna dei PDF non tornava più. Ora gli stessi byte viaggiano su ogni sistema.",
        "Le dipendenze si aggiornano da sole: Dependabot propone le versioni nuove, e ogni proposta passa da tutti i controlli prima di arrivare online."
      ]
    },
    {
      v: "1.3.36",
      data: "4 novembre 2026",
      titolo: "Ogni pulsante del programma apre un file che c'è davvero",
      punti: [
        "Il controllo dei collegamenti ora costruisce il pacchetto desktop e verifica 430 riferimenti dentro i file veri: pagine, sei PDF, icone, foglio di stile, service worker e i file con cui il programma parte.",
        "Non si limita agli elenchi di ciò che dovrebbe essere copiato: se un PDF viene rinominato o un'icona resta fuori, la pubblicazione si ferma.",
        "Tutti i pulsanti e i collegamenti del programma sono stati verificati: nessuno puntava a un file assente, e ora nessuno potrà farlo senza essere notato."
      ]
    },
    {
      v: "1.3.35",
      data: "4 novembre 2026",
      titolo: "Le pagine di installazione hanno una finestra loro",
      punti: [
        "Nel programma desktop, «Come si installa» e la scheda rapida si aprono accanto, in una finestra separata: la schermata principale resta dov'è, con i dati e il percorso.",
        "Se quella finestra è già aperta torna davanti invece di duplicarsi, e un collegamento a un punto preciso — le domande frequenti, per esempio — la apre lì.",
        "Dalla finestra laterale si torna all'app con un collegamento alla pagina iniziale; i PDF continuano ad aprirsi nel lettore del sistema."
      ]
    },
    {
      v: "1.3.34",
      data: "4 novembre 2026",
      titolo: "Anche i testi passano un controllo automatico",
      punti: [
        "Un controllo legge le tre pagine e tutte le viste e cerca i refusi meccanici: doppi spazi, parole ripetute due volte, virgolette o parentesi spaiate, punteggiatura doppia, maiuscole dimenticate dopo il punto.",
        "Segnala le forme italiane sbagliate più frequenti («qual'è», «un'altro», «pò», «sopratutto»), la stessa frase ripetuta nello stesso posto e due frasi quasi identiche di cui una nega l'altra.",
        "Controlla anche i conteggi: se una pagina dice «sei questionari» e un'altra «cinque», la pubblicazione si ferma e resta online l'ultima versione buona."
      ]
    },
    {
      v: "1.3.33",
      data: "4 novembre 2026",
      titolo: "Ogni pagina supera un controllo di accessibilità",
      punti: [
        "Un controllo in più apre le tre pagine e ogni vista, nei due temi, e misura il contrasto vero di ogni testo sullo sfondo che ha sotto: minimo 4,5:1, la soglia AA.",
        "I testi secondari e le etichette ambra erano appena sotto: ora sono più leggibili (il minimo misurato è 4,64:1). I titoli scendono un gradino alla volta, h1, h2, h3, con la stessa misura di prima.",
        "Controlla anche che ogni immagine abbia il suo testo alternativo e che un pulsante di sola icona abbia un nome: se qualcosa resta indietro, la pubblicazione si ferma."
      ]
    },
    {
      v: "1.3.32",
      data: "4 novembre 2026",
      titolo: "Il controllo dei collegamenti guarda anche dentro i pannelli",
      punti: [
        "I collegamenti dei pannelli e delle finestre si costruiscono solo quando si aprono: ora il controllo li legge anche nel codice, non solo nella pagina già disegnata.",
        "Da 317 a 388 destinazioni verificate a ogni pubblicazione, compresi i pulsanti della barra di stato.",
        "Provato rompendo di proposito un file, una rotta e un'àncora: in tutti e tre i casi la pubblicazione si ferma."
      ]
    },
    {
      v: "1.3.31",
      data: "4 novembre 2026",
      titolo: "Ogni pubblicazione controlla i collegamenti da sola",
      punti: [
        "Un controllo automatico apre le pagine, percorre ogni vista e ogni capitolo e verifica che ogni pulsante porti a qualcosa che esiste: file, rotta o àncora.",
        "Se un file viene rinominato e un collegamento resta indietro, la pubblicazione non parte: il sito resta sull'ultima versione buona.",
        "Ogni giorno, e dopo ogni rilascio, un secondo controllo apre i file dei pacchetti, le pagine del sito e le fonti citate; se qualcosa non risponde apre una segnalazione, che si chiude da sola quando torna a posto."
      ]
    },
    {
      v: "1.3.30",
      data: "4 novembre 2026",
      titolo: "Numeri e PDF funzionano anche nel programma installato",
      punti: [
        "Nel programma installato il clic su un numero di emergenza non faceva nulla: ora il numero viene copiato negli appunti, con un avviso che lo dice.",
        "I PDF si aprono con il lettore del sistema, invece di restare in una finestra che non li sa mostrare.",
        "La pagina Installa offre anche lo ZIP portatile per Windows e l'AppImage per Linux: il testo li citava, i pulsanti no."
      ]
    },
    {
      v: "1.3.29",
      data: "3 novembre 2026",
      titolo: "«Passaggio per passaggio» si apre anche nel programma installato",
      punti: [
        "Nel programma desktop quel pulsante apriva una finestra vuota color crema: la pagina «Come si installa» non era inclusa nel pacchetto.",
        "Ora la pagina e la scheda rapida viaggiano dentro il programma e si leggono anche senza connessione, con il PDF già a disposizione.",
        "I collegamenti «Pagina iniziale» e «Apri il programma» riportano al programma; se una pagina locale manca, non resta più una finestra vuota."
      ]
    },
    {
      v: "1.3.28",
      data: "3 novembre 2026",
      titolo: "Il pannello Sistema racconta anche le voci naturali",
      punti: [
        "La sezione «Voci del dispositivo» dice ora che le voci naturali di Paola e Riccardo si installano dal pannello Voce e restano dentro il programma.",
        "Le altre voci arrivano dal sistema operativo: senza una voce italiana Neura tace e risponde per iscritto, e questo si legge prima dei passaggi per aggiungerne una.",
        "La frase sulle voci online di Chrome ed Edge è stata riscritta: prima era sgrammaticata e lasciava credere che il programma non avesse voci proprie."
      ]
    },
    {
      v: "1.3.27",
      data: "3 novembre 2026",
      titolo: "La barra dice se l'IA è pronta, senza nomi tecnici",
      punti: [
        "Il chip della barra di stato ora dice «IA locale: pronta» quando un modello è installato, «IA locale: essenziale» quando non c'è o Ollama non risponde: si capisce a colpo d'occhio, senza leggere un nome di modello.",
        "Il nome del modello non si perde: nel pannello compare come «Modello in uso: …», insieme alla spiegazione che Neura funziona lo stesso.",
        "Il puntino resta verde quando un modello c'è e ambra quando manca, così lo stato si vede anche senza aprire il pannello."
      ]
    },
    {
      v: "1.3.26",
      data: "2 novembre 2026",
      titolo: "Le due voci si ascoltano una dopo l'altra",
      punti: [
        "Accanto alle voci installate c'è «Confronta le voci»: fa sentire la stessa frase prima con Paola e poi con Riccardo, senza cambiare voce a mano.",
        "Mentre legge, la scheda dice quale voce sta parlando; alla fine torna la nota con i pesi.",
        "Il pulsante compare solo quando le voci installate sono due: con una sola non ci sarebbe niente da confrontare."
      ]
    },
    {
      v: "1.3.25",
      data: "2 novembre 2026",
      titolo: "Le voci naturali dicono quanto spazio occupano",
      punti: [
        "Accanto a ogni voce installata c'è il peso misurato sui file presenti, non la stima del download: si decide cosa togliere sapendo quanto libera.",
        "Quando le voci sono pronte la scheda dice anche il totale occupato sul disco, motore compreso.",
        "Togliendo una voce il messaggio dice quanti MB sono stati liberati davvero."
      ]
    },
    {
      v: "1.3.24",
      data: "2 novembre 2026",
      titolo: "Ogni voce naturale si toglie da sola",
      punti: [
        "Accanto a ogni voce installata c'è «Togli»: libera solo quella, e l'altra resta pronta e selezionata.",
        "Togliendo l'ultima voce si libera anche il motore: lo spazio torna tutto disponibile, senza file avanzati.",
        "Se togli la voce che stavi ascoltando, la lettura passa all'altra senza chiudere il programma."
      ]
    },
    {
      v: "1.3.23",
      data: "2 novembre 2026",
      titolo: "Due voci naturali, da scegliere",
      punti: [
        "Accanto a Paola c'è Riccardo, voce maschile: si aggiunge con un clic e pesa 27 MB, perché il motore è già installato.",
        "Ogni voce si scarica solo se la scegli, e nell'elenco delle voci compaiono tutte e due: si passa dall'una all'altra senza riavviare.",
        "Riccardo è una voce più leggera e quindi meno definita di Paola: la scheda lo dice prima del download, non dopo."
      ]
    },
    {
      v: "1.3.22",
      data: "2 novembre 2026",
      titolo: "La lettura va alla velocità che scegli",
      punti: [
        "Nel pannello Voce c'è un cursore per la velocità: dal 70% al 140%, con il 100% come passo normale, e la scelta resta anche dopo aver chiuso il programma.",
        "Vale per tutte e due le voci: quella del sistema e quella naturale, che viene rallentata o accelerata alla fonte invece di essere riprodotta a un'altra velocità.",
        "Lasciando il cursore si sente subito un esempio, e un doppio clic riporta al passo normale."
      ]
    },
    {
      v: "1.3.21",
      data: "2 novembre 2026",
      titolo: "La voce naturale arriva anche su Linux",
      punti: [
        "Nel programma per Linux, sia Intel sia ARM, la scheda Voce offre lo stesso pulsante di Windows: una voce italiana naturale, scaricata una volta (circa 86 MB) e poi disponibile anche senza Internet.",
        "Su Mac il pannello dice dove si trova la voce naturale: le voci «Premium» di Apple si scaricano una volta dalle Impostazioni di Sistema e poi entrano nell'elenco come le altre.",
        "L'audio resta generato sul computer, ogni file scaricato è verificato con la sua impronta e, se il motore non parte, la lettura continua con la voce del sistema."
      ]
    },
    {
      v: "1.3.20",
      data: "1 novembre 2026",
      titolo: "Una voce naturale, scaricata una volta",
      punti: [
        "Nel pannello Voce c'è «Installa la voce naturale»: scarica una volta sola (circa 86 MB) una voce italiana che suona come una persona e la tiene nel computer.",
        "La voce è generata dal programma, non da un server: il testo letto non esce da qui e dopo il primo scaricamento funziona anche senza Internet.",
        "Se la voce naturale non parte, la lettura torna da sola alle voci del sistema; «Rimuovi la voce naturale» libera lo spazio quando non serve più."
      ]
    },
    {
      v: "1.3.19",
      data: "1 novembre 2026",
      titolo: "Le voci che il programma può usare",
      punti: [
        "Nel programma installato la scheda Voce dice perché l'elenco è più corto che nel browser: le voci «Online (Natural)» sono sul cloud di Microsoft e non si installano nel computer.",
        "Un pulsante apre direttamente le impostazioni voce di Windows o di macOS, invece di lasciarle cercare fra le schermate del sistema.",
        "Rileggi l'elenco aggiorna le voci senza chiudere il programma, e se il numero non cambia lo dice: una voce appena aggiunta richiede di riaprire."
      ]
    },
    {
      v: "1.3.18",
      data: "1 novembre 2026",
      titolo: "La scheda da tenere accanto al computer",
      punti: [
        "Una pagina sola con i passaggi essenziali dei tre sistemi: si stampa e si tiene lì, senza rileggere le istruzioni lunghe.",
        "Ogni sistema ha i suoi quattro passaggi e la riga che serve quando il file resta bloccato: è il punto in cui ci si ferma davvero.",
        "La scheda è anche un PDF da scaricare, con la stessa versione del programma nel piè di pagina."
      ]
    },
    {
      v: "1.3.17",
      data: "1 novembre 2026",
      titolo: "Il foglio non ripete se stesso",
      punti: [
        "Nel PDF l'avvertenza e la riga delle impronte comparivano due volte, una dal testo della pagina e una dalla chiusura: ora ci sono una volta sola.",
        "Prima di dare una versione per buona il foglio viene guardato pagina per pagina: quattro pagine, nessun riquadro tagliato, nessuna riga ripetuta."
      ]
    },
    {
      v: "1.3.16",
      data: "1 novembre 2026",
      titolo: "Il foglio di installazione in PDF",
      punti: [
        "La pagina Come si installa ha un pulsante Scarica il PDF: quattro pagine da allegare a un'email, senza dover stampare dal browser.",
        "Il PDF non è una seconda copia del testo: è generato leggendo la pagina: quando la pagina cambia, cambia anche il foglio.",
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
        '<h2 class="mt-1 h-sub">' + esc(r.titolo) + "</h2>" +
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

      '<div class="callout info"><p><strong>Nel browser</strong> quando il sito pubblica una versione nuova compare una barra con «Aggiorna e ricarica»: la pagina si ricarica una volta sola e riparte con i file nuovi. <strong>Nel programma installato</strong> se ne occupa l\'aggiornamento automatico, dalla 1.3.7 in poi.</p></div>' +

      elenco +

      '<div class="btn-row mt-3">' +
        '<a class="btn btn-ghost btn-sm" href="#/licenze">Licenze e progetto</a>' +
        '<a class="btn btn-ghost btn-sm" href="https://github.com/danilodauria/psicologo-digitale/releases" target="_blank" rel="noopener">Tutte le release su GitHub</a>' +
      "</div>" +

      '<p class="text-small muted mt-3">Una nota pratica: se qui la versione «in uso» è più vecchia dell\'ultima pubblicata, l\'aggiornamento non è ancora arrivato. Nel browser la barra compare appena il service worker nuovo prende il controllo; nel programma si può forzare il controllo dal pannello degli aggiornamenti.</p>'
    );
  };
})();
