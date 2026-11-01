# Psicologo Digitale · La stanza d'ascolto

**Pre-analisi guidata, colloquio con Neura, sei questionari, un percorso in otto tappe e una relazione PDF da consegnare al professionista.** Tutto in italiano, senza account, senza pubblicità e funzionante anche offline.

**Ideato, scritto e sviluppato da [Danilo D'Auria](https://github.com/danilodauria)** — un progetto **FeniceOS**.

[**Apri l'applicazione**](https://danilodauria.github.io/psicologo-digitale/) · [Codice su GitHub](https://github.com/danilodauria/psicologo-digitale)

> Questo programma **non è una terapia e non sostituisce** uno psicologo, uno psicoterapeuta o un medico.
> È uno strumento di psicoeducazione e orientamento: serve a preparare un colloquio, non a evitarlo.

---

## Perché esiste

La maggior parte delle persone che arriva a un primo colloquio psicologico ha due problemi: non sa **da dove iniziare** e non sa **cosa dire**. Il risultato è che i primi venti minuti si spendono a ricostruire informazioni che potrebbero essere già ordinate, e alcune cose importanti — durata dei sintomi, sonno, sostanze, salute, rischio — emergono tardi o non emergono.

Psicologo Digitale nasce per colmare quel vuoto:

- un **colloquio preliminare adattivo** che mette in ordine motivo, storia, funzionamento e sicurezza;
- **sei questionari** su aree diverse, con punteggi, fasce e spiegazioni oneste;
- un **percorso in otto tappe** con obiettivi, pratiche e indicatori di progresso;
- **protocolli di seduta** con tempi e contenuti, per capire cosa aspettarsi;
- una **relazione in PDF** stampabile, pensata per essere consegnata a chi può valutare davvero.

Il programma non prova a "fare lo psicologo". Prova a fare bene una cosa diversa: **l'apripista**.

## Che cosa contiene

| Sezione | Contenuto |
|---|---|
| **Colloquio** | Percorso adattivo in otto fasi: accoglienza, motivo, approfondimento per area, storia, funzionamento, sicurezza, risorse, restituzione. Le domande cambiano in base alle risposte. |
| **Valutazione** | Sei questionari: umore e piacere, ansia e preoccupazione, stress percepito, sonno e recupero, esaurimento legato al lavoro, benessere generale. Punteggi, fasce, lettura clinica e cosa portare al professionista. |
| **Percorso** | Otto tappe (16 settimane circa): orientarsi, corpo, attivazione, pensieri, emozioni, relazioni, valori, mantenimento. Con pratica settimanale e indicatori. |
| **Sedute** | Sette protocolli clinici: primo colloquio, formulazione condivisa, psicoeducazione, pensieri e comportamenti, esposizione, regolazione emotiva, chiusura. Agenda minuto per minuto. |
| **Esercizi** | Dodici pratiche guidate: respiro 4-6, ancoraggio 5-4-3-2-1, attivazione comportamentale, scheda del pensiero, finestra della preoccupazione, igiene del sonno, autocompassione, DESC, bussola dei valori, rilassamento muscolare, camminata consapevole, piano di mantenimento. |
| **Diario** | Umore, ansia, sonno, energia e nota giornaliera; scheda del pensiero integrata. Tutto locale, incluso nella relazione. |
| **Relazione** | Documento A4 con dati, aree emerse, storia, funzionamento, punteggi, segnali di sicurezza, obiettivi, diario, domande per il clinico, firme. PDF generato sul dispositivo. |
| **Neura** | Assistente locale: spiega, cerca, propone esercizi, orienta e riconosce le situazioni di rischio. Legge le risposte ad alta voce (sintesi vocale del dispositivo) e accetta la dettatura, se il browser la supporta. |
| **Manuale** | Dodici capitoli: primo colloquio, scelta del professionista, ansia, umore, sonno, stress e burnout, emozioni, pensieri, relazioni, trauma e lutto, corpo e sostanze, etica e limiti dell'IA. |
| **Palestra della mente** | 36 domande divulgative in sei aree, con spiegazioni: miti da smontare, evidenze, linguaggio corretto. |
| **Glossario** | 48 voci di psicologia clinica, metodo e terapia, con ricerca istantanea. |
| **Sicurezza** | 112, Telefono Amico, Samaritans, Telefono Azzurro, 1522, 114. Segnali d'allarme, cosa fare subito, indicazioni per minori e violenza. |
| **Nutrizione** | Alimentazione e umore: cinque principi, un piatto di riferimento, ritmo dei pasti, differenze tra dietista, dietologo e biologo nutrizionista, segnali dei disturbi alimentari, domande per il professionista. Nessuna dieta e nessuna prescrizione. |
| **Installa** | Installazione come app su Android, iPhone e computer, uso offline e guida facoltativa a **Ollama**: riconosce sistema e memoria dichiarata dal browser, indica il pacchetto giusto e il modello adatto, verifica il collegamento locale. |
| **Licenze** | Attribuzione, licenze, privacy, backup, cancellazione dati, FAQ e fonti. |

## Neura, il consulente digitale

Neura **non è un modello linguistico generativo** e non chiama servizi esterni. È un motore di conoscenza locale composto da:

- un riconoscimento degli intenti (spiegazione, esercizio, orientamento, professione, privacy, sicurezza);
- un indice sui capitoli del manuale, sul glossario e sugli esercizi;
- regole esplicite per il rischio: pensieri di morte, autolesionismo, violenza;
- risposte costruite da contenuti verificati, con collegamenti alle sezioni.

Quando non trova una risposta affidabile, **lo dice**. È una scelta di progetto: meglio un assistente che ammette i limiti che una macchina che sembra sapere tutto.

La voce usa `speechSynthesis` del dispositivo: nessun audio lascia il computer. Il pulsante dell'altoparlante in alto attiva o disattiva la lettura; `Esc`, **Stop** o **Ferma l'audio** nella barra di stato la interrompono.

La voce viene scelta tra quelle installate dando la precedenza alle italiane e, fra queste, alle versioni **Natural**, **Neural** e **Premium**, che sono registrazioni e non sintesi a formanti, e il testo viene spezzato in frasi perché la lettura respiri. Nella pagina Neura, sotto la chat, puoi scegliere una voce diversa: l'elenco mostra tutte quelle che il sistema offre — prima le italiane, poi le altre lingue — e la preferenza resta sul dispositivo.

Una differenza da conoscere: nel browser Chrome ed Edge aggiungono voci online — le «Online (Natural)» di Microsoft — che il programma desktop non può usare, perché vivono sul cloud e non si installano nel computer; il pacchetto legge solo le voci installate (SAPI su Windows, voce di sistema su macOS), e per questo nel `.exe` l'elenco è più corto. La scheda Voce lo dice a parole semplici e non lascia a metà: **Aggiungi una voce** apre il pannello giusto del sistema, **Rileggi l'elenco** aggiorna le voci senza chiudere il programma — e se il numero non cambia, avverte che una voce appena installata richiede di riaprire. I percorsi restano questi: su Windows *Impostazioni* → *Data e ora e lingua* → *Riconoscimento vocale* → *Aggiungi voci*; su macOS *Impostazioni di Sistema* → *Accessibilità* → *Contenuto pronunciato* → *Voce di sistema* → *Gestisci voci*.

Se vuoi una voce davvero naturale, il pannello Voce offre **Installa la voce naturale**: scarica una volta sola (circa 86 MB) un motore neurale che gira sul computer, con la voce italiana *Paola*, e da quel momento il programma legge con quella anche senza Internet. Non sta nel pacchetto — peserebbe su chi non la usa — e non manda niente a nessuno: l'audio si genera qui, ogni file scaricato è verificato con la sua impronta SHA-256, e **Rimuovi la voce naturale** restituisce lo spazio quando non serve più. Se il motore non parte, la lettura continua da sola con le voci del sistema. Oggi questa aggiunta è disponibile nel programma per Windows.

Se il computer non ha nessuna voce italiana, la pagina Neura non lascia la lettura muta: sceglie **la voce migliore fra quelle disponibili** e lo dice apertamente, con i passaggi per aggiungere una voce italiana su quel sistema — quelli di Windows, di macOS o di Linux, riconosciuto il sistema in uso — e un pulsante per ascoltare subito la voce di ripiego.

### La barra di stato

Sotto l'intestazione c'è una barra sempre visibile, che non richiede account e non manda nulla in rete:

- **dove stai girando**: programma installato (con il sistema riconosciuto), PWA installata o scheda del browser;
- **sistema in uso**: un pulsante con il sistema operativo riconosciuto (Windows, macOS, Linux, Android, iOS), quante voci di sintesi vede il sistema e, se serve, i passaggi per consentire l'avvio del pacchetto quando il sistema chiede conferma;
- **IA locale**: se Ollama risponde e quale modello è installato, oppure l'avviso che manca e il collegamento alla guida;
- **microfono**: presente, pronto, da attivare o bloccato, con il permesso richiesto da un pulsante e le istruzioni per riattivarlo;
- **ferma l'audio**: interrompe voce e dettatura da qualsiasi pagina;
- **indietro**: torna alla pagina precedente;
- **aiuto subito**: 112, 1522 e Telefono Azzurro in un tocco, più il rimando alla sezione Sicurezza.

La barra è onesta su un punto: la dettatura usa il riconoscimento vocale del browser, quindi su Chrome ed Edge l'audio può essere elaborato dai loro server. La voce in uscita, invece, resta sul dispositivo.

### Ollama, se lo vuoi

La sezione **Installa** offre anche una via facoltativa: un modello generativo che gira sul tuo computer con [Ollama](https://ollama.com). La pagina legge sistema operativo, core, memoria dichiarata e scheda grafica dal browser, propone il pacchetto corretto e il modello che quella memoria regge, mostra i comandi `ollama pull` e `ollama run` pronti da copiare e verifica il collegamento su `127.0.0.1:11434`.

Resta un extra dichiarato: Neura non lo usa, non gli passa i tuoi dati e le risposte verificate restano quelle del programma. Un modello generico non conosce il manuale e può sbagliare con sicurezza; la pagina lo dice prima di ogni risposta. Se il browser blocca la chiamata locale, basta autorizzare l'origine una volta con `OLLAMA_ORIGINS`: il comando esatto è indicato nella pagina, per ogni sistema.

## Vademecum in PDF

La guida tascabile è generata in tre versioni, tutte scaricabili dalla pagina **Licenze** e dal footer:

| File | Formato | Uso |
|---|---|---|
| `vademecum-psicologo-digitale.pdf` | A5, 15 pagine | Lettura su schermo e stampa tascabile |
| `vademecum-psicologo-digitale-a4.pdf` | A4, 12 pagine | Stampa domestica con margini comodi |
| `vademecum-psicologo-digitale-libricino-a4.pdf` | A4 orizzontale, 8 facciate | Libricino A5 già imposto: quattro fogli, fronte-retro |
| `vademecum-clinico-psicologo-digitale.pdf` | A4, 16 pagine | Guida per lo psicologo che riceve la relazione |

Contengono l'avvertenza, le otto fasi del colloquio, i sei questionari con la loro finalità, il percorso e gli esercizi, i segnali d'allarme con i numeri utili, la sezione sulla nutrizione, l'installazione e la checklist da portare al professionista. L'indice riporta i numeri di pagina reali.

La quarta versione è un documento diverso, scritto per il clinico: descrive che cosa arriva in mano a chi riceve la relazione, come si legge ciascuno dei sei punteggi fascia per fascia (con la nota su che cosa non dice), gli errori frequenti, i limiti dichiarati in sedici punti, ciò che il programma non può sapere, i segnali che cambiano la priorità e dieci domande per il primo incontro. Chiude con una scheda di sintesi da tenere accanto alla relazione.

### Come si rigenera

```bash
python3 -m venv .venv
.venv/bin/pip install reportlab pymupdf
node scripts/export-data.cjs
.venv/bin/python scripts/build_vademecum.py           # A5, A4 e libricino
.venv/bin/python scripts/build_vademecum_clinico.py   # guida per il professionista
# oppure, entrambi: npm run vademecum
```

`scripts/export-data.cjs` estrae i dati dall'app (questionari, fasi, esercizi, sicurezza, nutrizione, fonti) in `assets/data/vademecum.json`; `scripts/build_vademecum.py` impagina A5 e A4 con `reportlab` e impone il libricino con `pymupdf`; `scripts/build_vademecum_clinico.py` riusa gli stessi stili per la guida del professionista. I PDF sono artefatti versionati: il sito li serve come file statici e non li genera a runtime.

## Programmi installabili

Oltre alla PWA il repository produce i pacchetti desktop per Windows, Linux e macOS: stessa app, finestra propria, icona nel menu avvio, nessun browser di mezzo. Li costruisce GitHub Actions (`.github/workflows/desktop.yml`) quando si pubblica un tag `v*`, e li allega alla release insieme a `SHA256SUMS.txt`.

| Sistema | File | Note |
|---|---|---|
| Windows | `Psicologo-Digitale-Windows-x64.exe` | installatore NSIS, cartella a scelta e collegamento sul desktop; c'è anche la versione portatile in ZIP |
| Linux | `Psicologo-Digitale-Linux-amd64.deb` | Debian, Ubuntu e derivate |
| Linux | `Psicologo-Digitale-Linux-x86_64.AppImage` | nessuna installazione: `chmod +x` e avvio |
| macOS Intel | `Psicologo-Digitale-Mac-x64.dmg` | |
| macOS Apple Silicon | `Psicologo-Digitale-Mac-arm64.dmg` | |

I download stanno nella [pagina delle release](https://github.com/danilodauria/psicologo-digitale/releases/latest) e i link diretti sono questi:

- [Windows x64](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Windows-x64.exe) · [portatile ZIP](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Windows-portatile.zip)
- [Linux .deb](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Linux-amd64.deb) · [AppImage](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Linux-x86_64.AppImage)
- [macOS Apple Silicon](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Mac-arm64.dmg) · [macOS Intel](https://github.com/danilodauria/psicologo-digitale/releases/latest/download/Psicologo-Digitale-Mac-x64.dmg)
Oggi i pacchetti escono **senza firma**: Windows mostra SmartScreen e macOS blocca il doppio clic. Non è un difetto da aggirare in fretta, è solo un passaggio in più: vedi [Consentire l'avvio](#consentire-lavvio) per le istruzioni, che restano nel README finché i pacchetti sono non firmati. La pipeline è però già pronta: appena aggiungi i certificati, le build dei tag firmano da sole, senza toccare il codice — vedi [Firma dei pacchetti](#firma-dei-pacchetti). Le impronte SHA-256 permettono di verificare che il file scaricato sia quello pubblicato.

### Consentire l'avvio

Nessun certificato commerciale: il primo avvio chiede una conferma, una volta sola, e poi il programma funziona normalmente. L'impronta in `SHA256SUMS.txt` dimostra che il file è quello pubblicato. Queste istruzioni accompagnano ogni release e non vanno tolte: sono la garanzia che il programma si possa sempre installare.

**Windows.** Se compare *Windows ha protetto il PC*, scegli **Altro informazioni** → **Esegui comunque**. Se il browser ha segnato il file scaricato, tasto destro sul file → **Proprietà** → in fondo **Sblocca** → **OK**.

**macOS.** Da macOS 15 il menu contestuale non aggira più il controllo: **il «tasto destro → Apri» è stato rimosso da Apple**. Il percorso è questo, e vale per Sequoia e successivi.

1. Doppio clic sull'app: compare *Apple non ha potuto verificare che «Psicologo Digitale» sia esente da malware*.
2. Premi **Fine**, non **Sposta nel cestino**.
3. **Impostazioni di Sistema** → **Privacy e sicurezza**: scorri in fondo, fino alla sezione **Sicurezza**, dove compare una riga su *Psicologo Digitale* → **Apri comunque**.
4. Autentica con password o Touch ID e conferma **Apri**.

La voce *Apri comunque* appare solo dopo un tentativo di apertura bloccato e resta per circa un'ora: se non la vedi, riprova ad aprire l'app e torna lì. Si fa una volta per versione installata. Se il pacchetto è in *Applicazioni* e resta bloccato, da Terminale:

```bash
sudo xattr -dr com.apple.quarantine "/Applications/Psicologo Digitale.app"
```

Togliere la quarantena è un aggiramento noto ma non supportato da Apple: salta i controlli del primo avvio, quindi ha senso solo per un file che viene da qui e la cui impronta coincide con `SHA256SUMS.txt`. Va ripetuto a ogni nuova versione scaricata.

**Linux.** Il `.deb` si installa con doppio clic oppure `sudo apt install ./Psicologo-Digitale-Linux-amd64.deb`. Per l'`AppImage`: `chmod +x Psicologo-Digitale-Linux-x86_64.AppImage`, oppure tasto destro → **Proprietà** → **Consenti l'esecuzione**; se manca FUSE, `./Psicologo-Digitale-Linux-x86_64.AppImage --appimage-extract-and-run`.

### Firma ad-hoc, e perché basta

Il progetto non usa certificati commerciali e non ne prevede: è una scelta di coerenza, non un risparmio rinviato. Le conseguenze, dette come stanno: ogni sistema chiede conferma una volta sola al primo avvio, e macOS non può essere notarizzato senza un abbonamento Apple a pagamento. Nessuna delle due cose impedisce di usare il programma.

Quello che il progetto garantisce è che **il modo per installarlo ci sia sempre**, e che sia scritto dove serve: qui sotto, nella pagina *Installa l'app*, nella barra di stato e nella pagina *Versioni e novità*. Se un sistema cambia le regole, l'istruzione cambia con lui: è già successo con macOS 15, che ha rimosso il menu contestuale, e le istruzioni sono state corrette di conseguenza.

Tre cose rendono l'installazione verificabile senza certificati:

- **Firma ad-hoc dei pacchetti macOS**, applicata da `desktop/after-pack.cjs` dopo l'impacchettamento e verificata a ogni release con `codesign --verify`. Non dice chi ha firmato, quindi Gatekeeper chiede conferma; serve a un'altra cosa, e non è poco: su Apple Silicon il sistema esegue solo codice con una firma valida, e un bundle non firmato può risultare «danneggiato» invece che «non verificato» — cioè senza modo di aprirlo.
- **Impronte SHA-256** in `SHA256SUMS.txt`: dicono se il file scaricato è esattamente quello pubblicato, indipendentemente da chi lo firma.
- **Codice leggibile e ricostruibile**: chi non si fida del pacchetto può compilarlo, perché la build sta nel repository.

Una scorciatoia che sembrava promettente e non lo è: distribuire con una **cask Homebrew**. Homebrew conserva di proposito la quarantena sui pacchetti che installa, i flag `--no-quarantine` sono deprecati dalla 5.0 e le cask che non superano Gatekeeper sono disattivate da settembre 2026. Non è una strada per un'app senza certificato.

**Windows** e **Linux** non hanno bisogno di firma per funzionare: SmartScreen e i gestori di pacchetti non bloccano l'esecuzione, chiedono al massimo una conferma. E se un pacchetto risultasse rotto, il controllo di completezza rende rossa la build: un file che non si apre non arriva a nessuno in silenzio.

### Come si costruiscono

```bash
node scripts/prepare-desktop.cjs
cd desktop
npm ci
npm run dist:linux   # oppure dist:win / dist:mac
```

`scripts/prepare-desktop.cjs` copia il sito in `desktop/app` (che resta fuori dal versionamento); `desktop/main.cjs` apre quella cartella con Electron e fa da ponte verso Ollama, così la versione desktop non ha bisogno di `OLLAMA_ORIGINS`. La stessa finestra è un normale Chromium isolato: `contextIsolation`, `sandbox` e nessun accesso a Node dalla pagina.

## Il colloquio, in dettaglio

1. **Accoglienza** — consenso informato, nome facoltativo, fascia d'età, per chi si sta facendo il percorso, da dove si vuole iniziare. Se minorenne, compare un avviso specifico.
2. **Motivo** — aree che pesano (fino a tre), durata, impatto 0-10, fattori che peggiorano.
3. **Approfondimento** — domande solo per le aree scelte: umore, ansia, sonno, lavoro, relazioni, lutto, autostima, corpo, sostanze, trauma, genitorialità, solitudine, rabbia.
4. **Storia** — percorsi precedenti, farmaci, salute, sostanze, eventi degli ultimi dodici mesi, familiarità, infanzia (con opzione "preferisco non rispondere").
5. **Funzionamento** — energia, sonno, concentrazione, supporto percepito, attività quotidiane.
6. **Sicurezza** — domande dirette su pensieri di morte, sicurezza percepita, autolesionismo, violenza. Se emerge un rischio, compare subito un blocco con i numeri utili, e la relazione lo segnala in apertura.
7. **Risorse e obiettivi** — rete, punti di forza, obiettivo dichiarato, tipo di aiuto cercato, disponibilità, urgenza.
8. **Restituzione** — aree emerse con intensità, sintesi, segnali di rischio, domande da portare al clinico e passi successivi.

Si può interrompere e riprendere: lo stato è salvato nel browser. "Rivedi le risposte" permette di correggere senza ricominciare.

## I questionari

| Strumento | Area | Item | Punteggio | Costrutto di riferimento |
|---|---|---|---|---|
| UMS-9 | Umore, interesse, piacere | 9 | 0-27 | PHQ-9 (Kroenke et al., 2001) |
| ANS-7 | Ansia, tensione, preoccupazione | 7 | 0-21 | GAD-7 (Spitzer et al., 2006) |
| STR-10 | Stress percepito | 10 (4 inversi) | 0-40 | PSS-10 (Cohen et al., 1983) |
| SON-7 | Sonno e recupero | 7 | 0-28 | ISI e criteri clinici dell'insonnia |
| ESA-8 | Esaurimento e carico | 8 | 0-32 | Burnout (ICD-11 QD85) e MBI |
| BEN-5 | Benessere generale | 5 | 0-25 → 0-100 | WHO-5 (Topp et al., 2015) |

Gli item sono **formulati in italiano per questo progetto** e si ispirano ai costrutti degli strumenti citati: non sono la versione ufficiale e non ne rivendicano la validazione psicometrica. I punteggi sono indicatori di intensità, **non diagnosi**. Il nono item dell'UMS-9 esplora i pensieri di morte e attiva un avviso immediato.

## La relazione

La relazione raccoglie:

- dati del colloquio (nome facoltativo, fascia d'età, durata, impatto, urgenza);
- aree emerse con intensità percepita e lettura;
- storia, salute, sostanze, eventi;
- funzionamento quotidiano;
- punteggi dei questionari con fasce e interpretazione;
- segnali di sicurezza, in evidenza;
- obiettivi, disponibilità, rete e risorse;
- diario recente e schede del pensiero;
- domande suggerite per il clinico, generate in base ai dati;
- spazio per le note della persona e del professionista;
- firme e avvertenze.

Si scarica in **PDF** (generato sul dispositivo, senza librerie) oppure si stampa con il comando del browser. Contiene dati sensibili: va conservata e condivisa con cura.

## Sicurezza e deontologia

- Il programma è **educativo**: non diagnostica, non prescrive, non cura.
- Le domande sul rischio sono dirette, rispettose e non giudicanti; la formazione sul rischio è parte della competenza clinica, non un tabù.
- In caso di pericolo: **112**. Ascolto: **Telefono Amico 02 2327 2327**, **Samaritans 06 77208977**, **Telefono Azzurro 19696**, **1522** antiviolenza, **114** emergenza infanzia.
- Per i minori la valutazione va condivisa con un adulto responsabile e con un professionista.
- La violenza non è un conflitto di coppia: è un reato. Il 1522 è gratuito e riservato.
- Il programma **non è un dispositivo medico** ai sensi del Regolamento UE 2017/745.

## Privacy

- Nessun account, nessun server, nessuna telemetria, nessuna pubblicità.
- Risposte, questionari, diario, note e chat restano nel `localStorage` del browser.
- Il PDF è costruito sul dispositivo e non viene inviato.
- Il service worker salva l'applicazione nella cache per l'uso offline.
- Backup e cancellazione sono nella pagina **Licenze e progetto**.

## Struttura del progetto

```
index.html                  # shell dell'applicazione
manifest.webmanifest        # PWA
sw.js                       # cache offline
assets/
  css/styles.css            # design system completo, tema chiaro/scuro, stampa
  img/icon.svg              # marchio vettoriale
  img/icon-192.png          # icona PWA
  img/icon-512.png          # icona PWA / maskable
  js/
    data-scales.js          # sei questionari e fasce
    data-intake.js          # colloquio adattivo (oltre 50 domande)
    data-course.js          # percorso, sette sedute, dodici esercizi
    data-manual.js          # capitoli 1-6
    data-manual2.js         # capitoli 7-12
    data-extra.js           # glossario, sicurezza, fonti, FAQ
    data-quiz.js            # 36 domande della Palestra
    neura.js                # motore locale (intenti, recupero, sicurezza)
    app.js                  # nucleo, stato, punteggi, routing, home
    app-intake.js           # colloquio: interfaccia e restituzione
    app-scales.js           # questionari e Palestra
    app-course.js           # percorso, sedute, esercizi
    app-neura.js            # chat, voce, dettatura
    app-views.js            # manuale, glossario, sicurezza, diario, licenze
    app-report.js           # relazione e generatore PDF 1.4
    app-init.js             # avvio, tema, menu, service worker
scripts/make_icons.py       # rigenera le icone PNG
scripts/export-data.cjs     # esporta i dati dell'app per il Vademecum
scripts/build_vademecum.py  # genera il Vademecum in PDF
scripts/build_vademecum_clinico.py  # genera la guida per il professionista
assets/pdf/                 # Vademecum A5, A4 e libricino imposto (senza dipendenze)
tests/verify.cjs            # integrità dati, collegamenti, Neura
tests/dom-test.cjs          # interfaccia con jsdom
.github/workflows/pages.yml # test e pubblicazione automatica
```

Architettura: **PWA statica**, nessuna dipendenza a runtime, nessun build step. I dati sono file JavaScript; il routing è a hash; lo stato è in `localStorage` con prefisso `psicologo-digitale:v1:`.

## Sviluppo e test

Serve Node 20+ solo per i test.

```bash
npm install
npm test                  # verify + dom
npm run test:data         # solo integrità
npm run test:dom          # solo interfaccia
python3 -m http.server 3000 --bind 0.0.0.0   # anteprima con service worker
```

Rigenerare le icone:

```bash
python3 scripts/make_icons.py
```

Quando si aggiornano i contenuti, incrementare `VERSION` in `sw.js` (per esempio `psd-v1.1.0`): il service worker elimina la cache vecchia.

## Pubblicazione

- **Applicazione:** https://danilodauria.github.io/psicologo-digitale/
- **Repository:** https://github.com/danilodauria/psicologo-digitale

Il sito è un *project site* di GitHub Pages: l'applicazione vive in una sottocartella, quindi tutti i percorsi sono relativi e il manifest usa `./` come `start_url` e `scope`. La PWA resta confinata al progetto e non interferisce con gli altri siti FeniceOS pubblicati sullo stesso dominio.

### Come avviene la pubblicazione

Pages è impostato su **GitHub Actions**. A ogni push su `main` il workflow `.github/workflows/pages.yml` installa le dipendenze con `npm ci` ed esegue `npm test`: se una sola verifica fallisce la pubblicazione non avviene e il sito resta sull'ultima versione buona. Se i test passano, i file pubblici vengono copiati in un artefatto (senza test, script e dipendenze) e pubblicati con `actions/deploy-pages`.

`.nojekyll` è presente, quindi Jekyll non interferisce con i file del progetto; i percorsi restano relativi e l'app funziona anche nella sottocartella.

Per far girare i test senza pubblicare basta lanciare il workflow a mano da **Actions → Test e pubblicazione → Run workflow**.

### Aggiornamenti automatici

I pacchetti desktop si aggiornano da soli. All'avvio il programma chiede a GitHub l'ultima release (`electron-updater`, sorgente dichiarata in `desktop/package.json`); se ce n'è una nuova la scarica in sottofondo e la installa alla chiusura. Quando il download è finito compare nella barra in alto il pulsante **Riavvia per aggiornare**, che installa subito senza aspettare la prossima apertura. Il pannello della barra, sezione *Aggiornamenti*, mostra a che punto è e permette di controllare a mano.

Tre limiti da conoscere:

- **Windows** (installatore `.exe`) e **Linux AppImage** si aggiornano davvero da soli. Il `.deb` no: lì l'aggiornamento lo fa il gestore di pacchetti della distribuzione.
- **macOS** accetta l'aggiornamento automatico solo da pacchetti firmati: senza certificato il programma lo dice e rimanda alla pagina dei download, invece di provare e fallire in silenzio.
- La versione portatile in ZIP non si aggiorna: è pensata per essere sostituita.

Perché funzioni, la release deve contenere anche i tre file di servizio che GitHub non mostra tra i download: `latest.yml` (Windows), `latest-mac.yml` e `latest-linux.yml`. Li scrive `electron-builder` a ogni build e il workflow li allega; *Controllo che la release sia completa* verifica che ci siano, perché senza di loro il programma installato non vede le nuove versioni.

### Controllo del sito pubblicato

Dopo la pubblicazione parte il job **Il sito serve la versione giusta**. Scarica `sw.js` e verifica che dichiari la versione di `package.json`: un service worker vecchio in cache non dà errori, resta lì finché qualcuno non apre la pagina. Poi scarica i quattro PDF e ne confronta l'impronta SHA-256 con quella dei file del repository, così un PDF non copiato nell'artefatto si vede subito. I tentativi si ripetono per qualche minuto, perché Pages non è aggiornato nell'istante in cui il deploy finisce; se la versione resta sbagliata la build diventa rossa e il problema si vede senza aprire il browser.

### Aggiornare il sito

```bash
git add -A
git commit -m "Descrizione della modifica"
git push origin main
```

Se cambiano file presenti nella cache, incrementare `VERSION` in `sw.js` (per esempio `psd-v1.1.0`).

### Anteprima locale identica al sito

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Aprire `http://localhost:3000/`: percorsi relativi, hash routing e service worker si comportano come in produzione.

## Versioni e novità

La pagina **Versioni e novità** (`#/versioni`, nel menu *Altro*) elenca le release pubblicate e che cosa ha portato ciascuna, con il segno **in uso** sulla versione che si sta guardando. Ci si arriva anche dal pannello degli aggiornamenti nella barra di stato e dal piè di pagina di *Licenze e progetto*.

L'elenco vive in `assets/js/app-versioni.js`, in due punti: la costante `VERSIONE`, che deve coincidere con `package.json`, e l'array `NOVITA`, da aggiornare a ogni release. I test confrontano la costante con il campo `version` di `package.json`: se resta indietro, la build diventa rossa prima di pubblicare una pagina che annuncia la versione sbagliata.

## Come si installa: la pagina pubblica

`come-installare.html` è una pagina del sito, non una schermata del programma: si apre nel browser senza avviare nulla, e serve soprattutto a chi il programma non ce l'ha ancora o non riesce ad aprirlo. Contiene il file giusto per ogni sistema, i passaggi del primo avvio con le parole esatte degli avvisi di Windows e macOS, la verifica dell'impronta SHA-256 con il comando adatto a ciascun sistema, e il rimando al backup dei sorgenti.

La pagina si chiude con una sezione **Domande frequenti**: dieci domande che non sono un elenco di cortesia, ma i punti in cui l'installazione si blocca davvero — il file dichiarato «danneggiato» su macOS, il pulsante *Apri comunque* che non compare, il collegamento *Esegui comunque* assente su Windows, la finestra bianca dopo un aggiornamento, il microfono che non parte, Ollama che sembra obbligatorio e non lo è. Ogni risposta dice il percorso esatto dei menu e che cosa fare se l'impronta non corrisponde, e l'ultima dice cosa salvare prima di disinstallare.

C'è anche **la scheda rapida**, per chi vuole una pagina sola da tenere accanto al computer: `scheda-rapida.html`, con quattro passaggi per sistema, e `assets/pdf/Psicologo-Digitale-Scheda-rapida.pdf` per stamparla o allegarla. Non ripete le istruzioni complete né le domande frequenti: sceglie i passaggi in cui ci si ferma davvero — l'avviso di Windows, *Apri comunque* su macOS, AppImage su Linux — e lascia il resto alla pagina lunga, che resta raggiungibile da lì. La scheda usa lo stesso impaginatore del foglio lungo (`scripts/build_scheda_rapida_pdf.py` chiama `build_come_installare_pdf.py`), quindi anche lei nasce dalla pagina e non da un testo a parte.

C'è anche il PDF, per chi deve mandarlo per email: `assets/pdf/Psicologo-Digitale-Come-si-installa.pdf`, quattro pagine A4, allegato alla pagina della versione. Non è scritto a mano in un secondo posto — `scripts/build_come_installare_pdf.py` legge `come-installare.html`, ne estrae il `<main>` e lo impagina con reportlab, quindi il foglio e la pagina raccontano la stessa cosa per costruzione; se il testo cambia, cambiano entrambi alla rigenerazione successiva. Nel PDF restano fuori i pulsanti, il menu e le briciole di navigazione, i passaggi numerati restano numerati, e in testa a ogni pagina finiscono versione e indirizzo.

La pagina si stampa. Il pulsante *Stampa o salva in PDF* apre la stampa del sistema, e da lì *Salva come PDF* dà un file da allegare o da consegnare; funziona anche `Ctrl+P` / `⌘P`, quindi senza JavaScript. Il foglio non è una fotografia della pagina: le regole `@media print` in `assets/css/styles.css` (blocco `.pagina-installa`) tolgono menu, pulsanti, ombre e colori pieni, portano il testo in una colonna sola e non spezzano i riquadri a metà, mentre `.solo-stampa` aggiunge in testa versione e indirizzo della pagina e in coda l'avvertenza con il 112 — cose che a schermo non servono e su carta sì.

È raggiungibile in tre modi: dal piè di pagina del sito, dalla pagina *Installa l'app*, e dal pannello della barra di stato quando il sistema chiede conferma all'avvio. È nella cache del service worker, quindi resta consultabile anche offline, e non ha bisogno di JavaScript per essere letta: chi ha un browser bloccato o vecchio la vede lo stesso.

## Backup completo nella release

Ogni release allega **`Psicologo-Digitale-Sorgenti.zip`**: l'intero progetto al momento del rilascio — sito, programma desktop, script, test, PDF e workflow — in un archivio che si apre con doppio clic. Serve a due cose: conservare una copia indipendente dal repository e ricostruire il pacchetto senza clonare nulla.

Il file è prodotto dal job `backup` con `git archive` sul tag, allegato alla release e incluso in `SHA256SUMS.txt` come gli altri: sette impronte in tutto. Il controllo di completezza considera la release finita solo se il backup c'è, e un backup mancante rende la build rossa esattamente come un pacchetto mancante.

## Controllo dei link di download

Un workflow separato — `Link di download` — apre ogni giorno, subito dopo una pubblicazione e su richiesta tutti gli indirizzi della release più recente: sei pacchetti, backup dei sorgenti, `SHA256SUMS.txt` e i tre file dell'aggiornamento automatico. Non si limita a guardare l'elenco: scarica l'intestazione di ogni file, e confronta l'impronta dichiarata in `SHA256SUMS.txt` con il digest che GitHub ha calcolato al caricamento.

Se un file manca, risponde con un errore o ha un'impronta diversa, il controllo diventa rosso e apre una segnalazione sul repository con la tabella dei problemi; ai controlli successivi aggiorna la stessa segnalazione invece di aprirne una nuova, e la chiude quando torna tutto a posto.

Si lancia anche a mano, che è il modo per capire subito se un link è rotto davvero:

```bash
node scripts/check-links.cjs              # ultima release
node scripts/check-links.cjs psd-v1.3.12  # un tag preciso
```

Un 404 appena dopo un ri-caricamento viene ritentato tre volte prima di essere segnalato, perché il CDN di GitHub a volte serve per qualche secondo la risposta vecchia: è successo davvero con `SHA256SUMS.txt` della 1.3.10, e senza i tentativi il controllo avrebbe gridato al lupo.

## Limitazioni note

- Non è una terapia e non sostituisce una visita.
- I questionari non sono strumenti diagnostici validati: sono indicatori divulgativi ispirati a costrutti noti.
- Neura è un motore di regole e recupero, non un'IA generativa: non risponde fuori dal corpus e non apprende.
- Il programma non raccoglie dati, quindi non sincronizza tra dispositivi: il backup JSON serve a questo.
- La sintesi vocale dipende dalle voci installate sul dispositivo; la dettatura dipende dal browser.
- Il PDF è volutamente essenziale: testo, tabelle e firme. Non è un documento con valore medico-legale.
- I protocolli di seduta sono un modello didattico, non un manuale di condotta clinica.
- I contenuti non sostituiscono formazione, supervisione e responsabilità professionale.

## Licenze e attribuzione

- **Codice** (HTML, CSS, JavaScript, service worker, script, test): **MIT** — vedi [LICENSE](LICENSE).
- **Contenuti** (capitoli, questionari, esercizi, protocolli, glossario, grafica, personaggio di Neura): **CC BY-NC-SA 4.0** — vedi [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

Citazione consigliata:

> «Psicologo Digitale — La stanza d'ascolto» di Danilo D'Auria — un progetto FeniceOS — licenza CC BY-NC-SA 4.0.

Il personaggio di **Neura** e il marchio del progetto sono creazioni di Danilo D'Auria e appartengono allo stesso ecosistema dei progetti [*Professore Digitale*](https://danilodauria.github.io/professore-digitale/), [*Consulente Digitale*](https://danilodauria.github.io/consulente-digitale/) e [*Naturopata Digitale*](https://danilodauria.github.io/naturopata-digitale/).

## Crediti

Ideato, scritto e sviluppato da **Danilo D'Auria**, tecnico IT e divulgatore digitale, autore di *Tecnologia Gentile: Informatica Sostenibile* e creatore di FeniceOS.

Versione **1.0.0** · ottobre 2026.
