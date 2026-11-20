# Consegna del progetto · Psicologo Digitale

Questo file è per chi riprende il repository senza la storia della chat: una persona al primo giorno o un'altra IA. Dice com'è fatto, che cosa non si può rompere, come si pubblica e che cosa i controlli automatici verificano davvero. Non ripete il README (che racconta il programma a chi lo usa): qui si parla a chi lo mantiene.

Ultimo aggiornamento: versione **1.7.14**, 20 novembre 2026.

---

## 1. Che cos'è, in cinque righe

Una PWA statica in italiano — nessun build, nessun server, nessun account — che accompagna una persona a mettere in ordine quello che sente prima di parlarne con un professionista: colloquio guidato con Neura, sei questionari di autovalutazione, un percorso in otto tappe, un diario, una relazione PDF da portare al clinico, un backup in chiaro o cifrato con password. Tutto vive nel `localStorage` del browser. Il sito è su GitHub Pages; esiste anche un contenitore Electron (`desktop/`) che apre la stessa app in locale e, se c'è Ollama, le dà una voce più naturale.

Non è una terapia, non fa diagnosi, non manda niente in rete. Queste tre frasi non sono marketing: sono vincoli di progetto e compaiono nei testi, nei PDF e nei test.

---

## 2. Architettura

```
index.html            una sola pagina; ogni schermata è una vista a hash (#/diario, #/valutazione/<id>, …)
assets/css/styles.css tutti gli stili, temi chiaro/scuro, stampa
assets/js/data-*.js   i contenuti: scale, colloquio, percorso, manuale, glossario, quiz, nutrizione, AI
assets/js/app*.js     il comportamento, in ordine di caricamento (vedi index.html)
assets/js/neura.js    il motore di regole e recupero di Neura
desktop/              contenitore Electron (main.cjs, preload, pacchetto)
scripts/              generazione PDF, export dei dati, controlli automatici
tests/                verify.cjs (dati e coerenza) e dom-test.cjs (interfaccia con jsdom)
.github/workflows/    pubblicazione, pacchetti desktop, controlli delle dipendenze
```

Punti fermi dell'impianto:

- **Niente build.** I file vengono serviti così come sono. Non ci sono bundler, transpiler o moduli ES: gli script si caricano in ordine da `index.html` e parlano attraverso un unico spazio dei nomi, `NP`. Se aggiungi un file, va aggiunto **sia** in `index.html` **sia** nella lista `scripts` di `tests/dom-test.cjs`, altrimenti non entra nei test.
- **`NP.app` è l'API del programma**: stato (`NP.app.state`), lettura e scrittura (`readJSON`/`writeJSON`), viste (`NP.app.views`), utilità (`esc`, `fmtDate`, `fmtBytes`, `toast`, `page`). Le altre parti (`NP.data`, `NP.neuraUI`, `NP.sistema`) sono contenuti e servizi.
- **Le viste sono funzioni** registrate in `NP.app.views.nome`; il router (`parseHash` + `render` in `app.js`) le chiama e `render()` si occupa di ciò che vale per tutte: titolo del documento, focus sul titolo, annuncio per i lettori di schermo, chiusura dei menu.
- **I contenuti stanno nei `data-*.js`**, mai dentro le viste. Aggiungere un capitolo o una scala è un lavoro sui dati; una vista che contiene testi clinici è un errore di struttura.
- **Una sola implementazione per ogni logica.** Esempi: `statistichePeriodo()` calcola le medie dei periodi e nessun'altra parte le ricalcola; `migraBackup()` è l'unico posto che conosce i formati dei backup; la voce è una sola (`NP.neuraUI.speak`) e anche la lettura di un capitolo passa da lì. Se ti trovi a scrivere la seconda copia di qualcosa, fermati.

---

## 3. Invarianti da non rompere

1. **Nessun dato esce dal dispositivo.** Niente richieste di rete con dati della persona, niente analytics, niente chiavi. L'unica chiamata di rete opzionale è verso Ollama su `127.0.0.1:11434`, e solo se l'utente la attiva.
2. **Nessun segreto nel repository.** Il token di pubblicazione vive nella configurazione git locale, non nei file. Non scrivere mai un token in un comando che finisce in un log o in un file versionato.
3. **I workflow si toccano solo dall'integrazione GitHub.** Il token di push non ha lo scope `workflow`: un commit che modifica `.github/workflows/` viene rifiutato. Prima di ogni commit: `git reset -q .github/workflows`. Se serve cambiare una GitHub Action, si fa dall'integrazione GitHub, non da qui.
4. **La versione è una sola, nei file che la dichiarano.** `package.json`, `package-lock.json`, `desktop/package.json`, `desktop/package-lock.json`, `sw.js` (`psd-vX.Y.Z`), `come-installare.html`, `scheda-rapida.html`, il piè di pagina in `assets/js/app-views.js`, più `VERSIONE` in `assets/js/app-versioni.js`. Un test confronta `VERSIONE` con `package.json`: se restano indietro, la build è rossa. I due lockfile si allineano con `npm install --package-lock-only`, mai con una sostituzione di testo, e `tests/verify.cjs` controlla per entrambi che dichiarino la stessa versione del proprio `package.json` e che ogni pacchetto risolto corrisponda alla versione che dichiara: il lockfile principale era rimasto a 1.3.37 mentre il programma era alla 1.4.2, perché solo quello desktop era controllato.
5. **Ogni release ha la sua voce in `NOVITA`** (`assets/js/app-versioni.js`), scritta per chi usa il programma — cosa cambia nella sua giornata — non per chi legge il diff.
6. **Le promesse nelle pagine sono verificate.** Se *Versioni* o il README dicono che un controllo esiste, quel controllo esiste come script o test che può diventare rosso. Una garanzia non testata è una bugia che invecchia bene.
7. **Il backup ha un formato dichiarato.** `raccogliDati()` scrive `version` (oggi `3`); `migraBackup()` completa i file vecchi e rifiuta quelli di una versione futura. Cambiando la forma dei dati si incrementa `VERSIONE_BACKUP` e si aggiunge un passo in `MIGRAZIONI`: mai leggere un formato sconosciuto alla cieca. Il campo `migrato` è vero solo se il formato di partenza era diverso da quello di arrivo: un file già aggiornato non deve dichiarare una conversione che non c'è stata, e un test lo blocca.
8. **I metadati non sono dati della persona.** La data dell'ultima esportazione (`segnaBackup`) si scrive con `localStorage.setItem` diretto: se fallisce non deve finire nella coda dei salvataggi rimasti fuori, o il prossimo salvataggio vero si confonde.
9. **Chi non vede lo schermo deve sapere dov'è.** Al cambio di pagina il titolo riceve il focus (`tabindex="-1"`) e `#annuncioRotta` annuncia il caricamento. Il focus si sposta **solo** al cambio rotta: spostarlo a ogni ridisegno porta via il cursore a chi sta scrivendo.
10. **Niente serie, punteggi-premio o confronti sociali.** Il diario propone, non rimprovera: gli inviti dicono un fatto e offrono un gesto piccolo. È una scelta deontologica, non estetica.
11. **Il piano di sicurezza è un modulo, non un testo.** I cinque campi e i tre contatti li compila la persona: il programma non precompila consigli né interpreta quello che legge. Vive in `localStorage` (`pianoSicurezza`), entra in `raccogliDati`, nel ripristino e nell'anteprima delle copie, e si stampa anche vuoto.
12. **La relazione si consegna per parti, ma i dati restano.** Prima del PDF tre caselle scelgono diario, schede del pensiero e note personali; senza scelte sono tutte incluse. L'esclusione vale per il foglio, la stampa e il PDF, non cancella niente dal dispositivo, e la numerazione delle sezioni si ricalcola. Domande per il clinico e spazio del professionista non sono parti personali e restano sempre.
13. **La scheda da portare non è una seconda relazione.** È una pagina sola, con un massimo dichiarato (`SCHEDA_MAX`: tre aree, tre punteggi, quattro domande), una voce di diario e una scheda del pensiero scelte dalla persona. Non aggiunge dati, non interpreta e non cancella: legge quello che c'è. Il PDF è costruito per stare su una pagina e un segnale di rischio resta in cima, non viene tolto per fare spazio.
14. **Il taccuino è testo della persona, non un'altra fonte clinica.** Le domande scritte a mano vivono in `domandePersonali` (`{id, testo, creato}`, massimo 200 caratteri e 50 voci), entrano in `raccogliDati` e nelle copie, e si scelgono prima della relazione o della scheda. Non vengono interpretate, non generano punteggi e togliere una spunta non cancella la domanda: le domande generate dai dati restano separate e vengono prima.
15. **Il backup cifrato è una busta, non una seconda copia in chiaro.** `cifraBackup()` produce `formato: "backup-cifrato"` con AES-GCM a 256 bit e chiave derivata con PBKDF2-SHA-256 (250.000 iterazioni, sale di 16 byte e IV di 12 byte). La password non viene scritta da nessuna parte; il file contiene solo parametri e blocchetto cifrato. `decifraBackup()` rifiuta password errata, formato futuro o parametri fuori scala senza toccare i dati. Il backup in chiaro resta sempre disponibile accanto. Cambiando la busta si incrementa `BACKUP_CIFRATO_VERSIONE`; i test verificano assenza di testo in chiaro, andata e ritorno, password sbagliata e import da file.

---

## 4. Pipeline di una release

Dalla directory del progetto, in quest'ordine. Ogni passo che può fallire deve fermare i successivi.

```bash
# 0. Dipendenze, solo dopo un ripristino dell'ambiente
npm ci
python3 -m venv .venv && .venv/bin/pip install -q reportlab pymupdf

# 1. Versione in tutti i file (sostituire X.Y.Z con la precedente).
#    I lockfile NON vanno toccati con sed: contengono le versioni delle
#    dipendenze, e una sostituzione globale può cambiarle (è successo con `once`,
#    che ha fatto fallire la build di tutti e tre i sistemi dopo il tag).
sed -i 's/X\.Y\.Z/NEW.VER/g' package.json desktop/package.json \
  sw.js come-installare.html scheda-rapida.html assets/js/app-views.js
(cd desktop && npm install --package-lock-only --no-audit --no-fund)
#   anche il lockfile principale porta la versione: senza questo resta indietro
#   (è rimasto a 1.3.37 fino alla 1.4.2). Riscrive solo i metadati del pacchetto
#   radice; se nel diff compare una versione di dipendenza cambiata, fermarsi.
npm install --package-lock-only --no-audit --no-fund --ignore-scripts
git diff --stat package-lock.json desktop/package-lock.json
#   poi a mano: VERSIONE in assets/js/app-versioni.js, nuova voce in NOVITA,
#   README (versione in fondo + eventuale sezione), questo file se cambiano le regole

# 2. Dati per i PDF, poi i cinque fogli
node scripts/export-data.cjs
.venv/bin/python scripts/build_come_installare_pdf.py
.venv/bin/python scripts/build_scheda_rapida_pdf.py
.venv/bin/python scripts/build_prove_a_mano_pdf.py
.venv/bin/python scripts/build_vademecum.py
.venv/bin/python scripts/build_vademecum_clinico.py

# 3. Pacchetto desktop (allinea desktop/ alla versione corrente)
node scripts/prepare-desktop.cjs

# 4. Tutti i controlli
npm test

# 5. Commit (senza footer di attribuzione), push, tag, release
git add -A && git reset -q .github/workflows
git commit -m "Release NEW.VER: <una frase su cosa cambia per chi usa il programma>"
git push https://github.com/danilodauria/psicologo-digitale.git HEAD:main
git tag -a psd-vNEW.VER -m "Psicologo Digitale NEW.VER"
git push https://github.com/danilodauria/psicologo-digitale.git psd-vNEW.VER
```

Il push su `main` passa con «Bypassed rule violations» perché il check richiesto (*Pacchetto desktop: esito*) arriva dopo: è normale, non è un errore da correggere. Il tag fa partire il workflow **Pacchetti desktop**, che compila i tre pacchetti, calcola le impronte, allega i file alla release e pubblica il sito.

### Verifica finale, obbligatoria

```bash
gh api repos/danilodauria/psicologo-digitale/releases/tags/psd-vNEW.VER \
  --jq '.assets | length'                       # atteso: 14
gh api repos/danilodauria/psicologo-digitale/actions/runs \
  --jq '.workflow_runs[0] | "\(.name) \(.conclusion)"'   # sei job verdi
curl -s https://danilodauria.github.io/psicologo-digitale/sw.js | grep psd-vNEW.VER
curl -s https://danilodauria.github.io/psicologo-digitale/assets/js/app-versioni.js | grep NEW.VER
```

Se il runner macOS resta `queued` o viene annullato: `gh run rerun <id> --failed`. Non si considera una release pubblicata finché sito, `sw.js` e `app-versioni.js` non dicono tutti la stessa versione.

---

## 5. Che cosa coprono i controlli (e che cosa no)

| Comando | Cosa verifica davvero |
|---|---|
| `tests/verify.cjs` | Coerenza dei dati: ogni scala ha punteggi e fasce coerenti, ogni capitolo ha sezioni non vuote, ogni esercizio citato esiste, i conteggi dichiarati nei testi corrispondono ai dati reali, `VERSIONE` = `package.json`, i due lockfile dichiarano la versione del proprio `package.json`, presenza dei file della release |
| `tests/dom-test.cjs` | L'interfaccia in jsdom: 702 verifiche su routing, salvataggi e loro ritentativo, copie e ripristino, backup e migrazione compreso l'import da file (input, FileReader e frase finale), backup cifrato con AES-GCM/PBKDF2 e password sbagliata, riepilogo dei periodi a sette e trenta giorni con la stampa del confronto, ricerca nei contenuti e nelle cose scritte (con la prova che i due indici restano separati), preferenze di lettura, modalità discreta, inviti, lettura ad alta voce, taccuino delle domande e sua selezione nella relazione e nella scheda |
| `scripts/controlla-collegamenti.cjs` | Ogni `href` interno punta a una rotta che esiste; nessuna vista resta irraggiungibile |
| `scripts/controlla-accessibilita.cjs` | Contrasto del testo nei due temi (minimo 4,64:1), gerarchia dei titoli, immagini con nome, **incluse** la pagina di risultato di un questionario e l'anteprima di un ripristino, aperte seminando dati veri |
| `scripts/controlla-testi.cjs` | Refusi, doppi spazi, apostrofi sbagliati, ripetizioni di frasi tra pagine, conteggi in contraddizione; legge le stesse due schermate «nascoste» |
| `scripts/controlla-impronte.cjs` | Le impronte SHA-256 dichiarate corrispondono ai file |
| `scripts/controlla-archivi.cjs` | Gli archivi scaricabili si aprono e contengono quello che devono |
| `scripts/controlla-dipendenze.cjs` | Nessuna dipendenza non dichiarata o non usata |
| `scripts/riepilogo-copertura.cjs` | Scrive `artifacts/copertura/riepilogo.md`: quante viste, quante pagine di singoli elementi (30), quali controlli sono verdi |
| `PROVE-A-MANO-<versione>.md` | **Non è automatico**: le prove che una persona deve fare a mano (voce, telefoni, messaggi al momento giusto), con il risultato atteso per ciascuna. Si leggono prima di dichiarare chiusa una release. Lo stesso foglio esiste in PDF A4 (`assets/pdf/Psicologo-Digitale-Prove-a-mano.pdf`), generato dal markdown da `scripts/build_prove_a_mano_pdf.py`: `verify.cjs` controlla che ogni prova del markdown sia anche nel PDF |

Cosa **non** coprono: il comportamento reale dei browser (nessun test end-to-end), la sintesi vocale vera (nei test è simulata), il service worker in condizioni di rete vere, l'aspetto visivo. Se cambi il CSS, guarda la pagina: i test non la vedono.

Numeri aggiornati a ogni `npm test`: 22 viste, 30 pagine di singoli elementi, 3 pagine del sito (`index.html`, `come-installare.html`, `scheda-rapida.html`).

---

## 6. Dove mettere le mani

| Compito | File |
|---|---|
| Aggiungere un capitolo del manuale | `assets/js/data-manual.js` o `data-manual2.js` (l'array `NP.data.manuale`), poi `npm test` |
| Aggiungere un esercizio | `assets/js/data-course.js`, `NP.data.percorso.esercizi`, e il riferimento nell'elenco del modulo |
| Aggiungere un questionario | `assets/js/data-scales.js` (domande, punteggi, fasce, `cosaPortare`) |
| Aggiungere una schermata | funzione in `NP.app.views.nome` + un collegamento che la raggiunga (il controllo collegamenti diventa rosso se resta orfana) + test che la apra |
| Cambiare l'aspetto | `assets/css/styles.css`; per la dimensione del testo usa `data-testo` sulla radice, non misure puntuali sparse |
| Cambiare il formato dei dati salvati | `raccogliDati`, `VERSIONE_BACKUP`, `MIGRAZIONI` in `app.js`, e un test che importi un file del formato precedente |
| Cambiare i PDF | gli script `build_*.py`, che leggono le pagine HTML: il testo si cambia nella pagina, non nello script |

---

## 7. Limiti noti, dichiarati

- **Lo storico dei punteggi non viene riscritto da un ripristino.** Una copia rimette a posto lo stato (colloquio, diario, schede, scale), non il passato delle misure: sovrascrivere la cronologia con quella di un file vecchio falserebbe il confronto dei periodi. È una scelta, non una dimenticanza.
- **L'annullamento di un ripristino vive in memoria**: se la pagina si ricarica, il pulsante «Annulla» sparisce (i dati sono comunque nella copia automatica creata prima del ripristino).
- **Le notifiche di sistema non ci sono.** Il promemoria dell'esportazione e l'invito al diario sono dentro l'app: niente permessi da chiedere, niente cose che suonano di notte.
- **La ricerca è letterale, con una tabella di sinonimi curata a mano**: trentotto gruppi di parole equivalenti (sonno/dormire, ansia/ansioso, …) allargano la ricerca nei contenuti e nelle cose scritte. Fuori da quella tabella resta letterale: se un argomento c'è ma è scritto con un'altra parola non prevista, non lo trova — ed è dichiarato nella pagina.
- **La modalità discreta non è cifratura.** Copre lo schermo da chi passa dietro; chi apre gli strumenti di sviluppo vede i dati, come in qualsiasi app locale.
- **Nessuna sincronizzazione tra dispositivi.** Il backup JSON è l'unico passaggio di consegne, e richiede un gesto esplicito.
- **La cifratura del backup dipende dal browser.** Serve Web Crypto (AES-GCM e PBKDF2): senza, il backup cifrato non si crea e resta quello in chiaro. Una password persa non si recupera, e non esiste una copia della chiave da nessuna parte.
- **L'uscita rapida non cancella la cronologia.** «Esci subito», in cima a Sicurezza, apre una pagina neutra con ora e data, senza testata né contenuti. La visita al programma resta nella cronologia del browser, e Indietro riporta alla pagina di prima: è una copertura dello schermo, non una cancellazione delle tracce.
- **L'avviso di versione nuova del sito** nei test automatici è simulato: jsdom non ha un service worker. La prova vera è la 13.1 del foglio, che richiede una pubblicazione mentre la scheda è aperta.
- **La protezione dello spazio è una richiesta, non una garanzia**: decide il browser e può revocarla. I test simulano le tre risposte (concessa, rifiutata, API assente); la prova nei browser veri è la sezione 14 del foglio.
- **Il runner macOS di GitHub** a volte si blocca in coda: si rilancia il job fallito, non si cambia il codice per farlo passare.

---

## 8. Prossimi passi sensati (con il criterio per farli)

1. **Diario: promemoria a orari scelti dalla persona**, se si accetta di chiedere il permesso di notifica. Criterio: deve funzionare anche senza permesso (fallback in-app) e non deve introdurre serie o conteggi.
2. **Esportazione della sola relazione** oltre al backup completo. Criterio: resta un file locale, nessun invio.
3. **Verifica automatica dell'aspetto** con uno screenshot di riferimento. Criterio: solo se il confronto è stabile tra macchine, altrimenti produce rumore e viene ignorato.
4. **Prova su dispositivi veri** (iOS Safari, Android Chrome) per la sintesi vocale e il salvataggio offline. È il buco più grande dei controlli attuali.

Cose da **non** fare, per coerenza con l'impianto: account e sincronizzazione cloud, streak o premi, una IA che interpreta i punteggi al posto del clinico, qualunque tracciamento.

---

## 9. Riprendere in un ambiente nuovo

```bash
npm ci
python3 -m venv .venv && .venv/bin/pip install -q reportlab pymupdf
npm test          # deve finire verde prima di toccare qualcosa
npm run serve     # http://localhost:3000/
```

`artifacts/` è in `.gitignore`: contiene solo riepiloghi di copertura rigenerabili con `npm run test:copertura`.

Se lavori in un ambiente cloud senza browser: `npx convex` e i comandi interattivi non hanno senso qui (il progetto non usa Convex), e non c'è modo di firmare o provare la voce. Tutto il resto della pipeline funziona.
