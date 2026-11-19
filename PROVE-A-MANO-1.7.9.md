# Prove a mano · versione 1.7.9

Quello che i test automatici non possono vedere: la voce che parte davvero, la pagina che si legge su un telefono, il messaggio che compare al momento giusto. Sono sessantadue prove, un quarto d'ora in tutto, da fare **prima** di considerare chiusa una release.

Vale dalla 1.4.0 alla 1.7.9. Per la 1.4.1 vale il messaggio dell'import corretto, indicato nella prova 3.3; per la 1.5.0 ci sono le cinque prove della sezione 7, sulla ricerca nelle cose scritte; per la 1.6.0 le tre della sezione 8, sul confronto a sette o trenta giorni e sulla sua stampa; per la 1.7.0 le tre della sezione 9, sugli estratti e sul movimento ridotto; per la 1.7.1 la prova della sezione 10, sull'estratto che non ripete il titolo; per la 1.7.2 le due della sezione 11, sui campi della scheda e sullo scorrimento con movimento ridotto; per la 1.7.3 la prova della sezione 12, sull'installazione della voce naturale; per la 1.7.4 le due della sezione 13, sull'avviso di versione nuova del sito; per la 1.7.5 le due della sezione 14, sulla protezione dello spazio; per la 1.7.6 le tre della sezione 15, su elenco completo, modifica e schede del pensiero; per la 1.7.7 le due della sezione 16, sui sinonimi della ricerca; per la 1.7.8 le quattro della sezione 17, sugli estratti della ricerca; per la 1.7.9 le due della sezione 18, sull'uscita rapida.

C'è anche in PDF A4, per stamparlo e spuntarlo a penna: `assets/pdf/Psicologo-Digitale-Prove-a-mano.pdf`, con una casella per ogni prova e la tabella d'esito in fondo, allegato alla release insieme agli altri fogli. Nasce da questo file con `scripts/build_prove_a_mano_pdf.py`: le prove si scrivono qui, il PDF si rigenera.

**Dove si prova.** Sul sito — <https://danilodauria.github.io/psicologo-digitale/> — e nell'app installata. La pagina per scaricare i pacchetti è **Installa l'app** (`#/installa`), che porta alle [release su GitHub](https://github.com/danilodauria/psicologo-digitale/releases/latest); lì c'è anche il backup dei sorgenti. Quando una prova dipende dal dispositivo, è scritto nella riga.

**Cosa serve.** Un browser con i dati del programma già un po' popolati (qualche voce di diario, almeno un questionario compilato). Per le prove su riepilogo e invito al diario serve qualche giorno di dati: si può simulare come spiegato qui sotto, senza aspettare una settimana.

> **Prima di iniziare: esporta un backup.** Diverse prove importano file e sostituiscono i dati. Se qualcosa va storto, il file esportato è il modo per tornare indietro.

---

## Come preparare i dati per il riepilogo (2 minuti)

1. Licenze e progetto → **Esporta backup**. Salva il file `psicologo-digitale-backup.json`.
2. Aprilo con un editor di testo. Dentro `"diary"` copia due volte una voce che hai già, cambiando solo `"date"`:
   - una copia a **2 giorni fa**, una a **3 giorni fa** (finiscono negli «ultimi 7 giorni»);
   - una copia a **9 giorni fa**, una a **10 giorni fa** (finiscono nei «7 giorni prima»).
   La data è in formato ISO, per esempio `"2026-11-15T09:00:00.000Z"`.
3. Cambia anche `"mood"` delle copie (per esempio 7 e 5 nella settimana recente, 3 e 3 in quella prima) così la differenza si vede.
4. Salva con un altro nome — `prova-1.4.0.json` — e reimportalo da Licenze → **Importa backup**.

Se non vuoi toccare i file: salta le prove 1.2 e 1.3 e fai le altre.

---

## 1. Riepilogo dei periodi

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 1.1 Dalla home, sotto l'invito, premi **Confronta con la settimana prima** | Si apre `#/riepilogo`, titolo «Gli ultimi sette giorni, accanto ai sette prima»; la scheda in home si chiama «La tua settimana» e dice quante voci di diario, quante schede del pensiero e quanti questionari ci sono negli ultimi sette giorni |
| ☐ | 1.2 Con i dati preparati sopra, guarda la tabella «Medie del diario» | Quattro righe (Umore, Ansia, Sonno, Energia) e tre colonne: «Ultimi 7 giorni», «7 giorni prima», «Differenza». Numeri con la virgola, tra 0 e 10. La differenza ha il segno (`+2`, `−1,5`) oppure dice «uguale» o «—» |
| ☐ | 1.3 Controlla una media a mano | La media è la somma dei valori del periodo diviso **quante voci hanno quel valore**: una voce con il campo vuoto non conta e non abbassa la media. Se nella settimana ci sono solo le due copie con 7 e 5, la media è 6; se è rimasta anche la voce di partenza entra nel conto anche lei (per esempio 7, 5 e 8 danno 6,7). Il numero mostrato è arrotondato a una cifra dopo la virgola. Se non torna, annota le voci usate e i valori che avevano |
| ☐ | 1.4 Guarda «Cosa hai fatto» | Tre righe con il conteggio dei sette giorni e, fra parentesi, quello dei sette prima. Devono coincidere con le voci che hai inserito |
| ☐ | 1.5 Cancella tutti i dati (Licenze → in fondo) e riapri `#/riepilogo` | Compare solo l'avviso «Non ci sono ancora dati in questi quattordici giorni.» — nessuna tabella di trattini, nessun errore. La scheda «La tua settimana» sparisce dalla home |

## 2. Ricerca nei contenuti

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 2.1 Dal piè di pagina apri **Cerca nei contenuti** | Campo con il suggerimento «per esempio: sonno, rimuginio, respiro» e il pulsante **Cerca** |
| ☐ | 2.2 Cerca `sonno` e premi Invio | Compare «N risultati» e un elenco dove ogni riga dice il titolo, il tipo (Capitolo 3, Glossario, Esercizio) e porta alla pagina giusta: aprendone una, il titolo corrisponde |
| ☐ | 2.3 Cerca `sonno igiene` | Meno risultati di prima, e ognuno contiene davvero entrambe le parole. Le parole si cercano tutte insieme |
| ☐ | 2.4 Cerca `zxqv` | «Nessun risultato per «zxqv».» con il suggerimento di provare una parola più corta o il termine clinico |
| ☐ | 2.5 Cerca `Sonno` con la maiuscola | Gli stessi risultati della prova 2.2: la ricerca non distingue maiuscole e minuscole |
| ☐ | 2.6 Stacca la rete e ripeti la 2.2 | Funziona lo stesso, senza attese. Con gli strumenti di sviluppo aperti, la scheda Rete non mostra nessuna richiesta durante la ricerca |

## 3. Backup e migrazione

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 3.1 Licenze → **Esporta backup** | Si scarica `psicologo-digitale-backup.json`. Aprendolo: `"app": "Psicologo Digitale"`, `"version": 2`, e dentro `"storicoPunteggi"` le misure dei questionari |
| ☐ | 3.2 Guarda la riga dell'esportazione | «Ultima esportazione: <data> (oggi).» — e resta la stessa dopo aver ricaricato la pagina |
| ☐ | 3.3 Reimporta subito lo stesso file | Chiede conferma, poi dice **«Backup importato.»** e basta. Non deve dire «e aggiornato al formato attuale»: quel file era già nel formato attuale (è il difetto corretto nella 1.4.1) |
| ☐ | 3.4 Apri il file, togli la riga `"version": 2` (o metti `1`), salvalo e importalo | «Backup importato e aggiornato al formato attuale.» — il file vecchio viene completato, non rifiutato |
| ☐ | 3.5 Metti `"version": 9` e importa | Messaggio «Il file viene da una versione più recente dell'app (formato 9). Aggiorna l'app e riprova.» e **i dati restano quelli di prima**: controlla il diario |
| ☐ | 3.6 Importa un file che non è un backup (per esempio una foto rinominata `.json`) | «Il file non sembra un backup valido di Psicologo Digitale.» e dati intatti |
| ☐ | 3.7 Su un browser pulito, con qualche dato inserito ma senza aver mai esportato, apri Licenze | Avviso «Non hai ancora esportato un backup.» con la spiegazione che i dati vivono solo lì. Dopo la prova 3.1 l'avviso diventa la riga con la data |

## 4. Dimensione del testo

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 4.1 Licenze → **Lettura e privacy** → menu «Dimensione del testo» | Tre voci: 100%, 112%, 125% |
| ☐ | 4.2 Scegli 125% | Tutto il testo cresce subito — anche menu, piè di pagina e pulsanti — senza sovrapposizioni né righe tagliate. Ricarica: resta 125% |
| ☐ | 4.3 Scegli 100% | Il testo torna alla dimensione di prima e l'attributo `data-testo` sparisce dall'elemento `<html>` (si vede negli strumenti di sviluppo). Non torna nemmeno dopo aver ricaricato: all'avvio la pagina applica solo 112 e 125. Se resta scritto `data-testo="100"` è un difetto, perché quel valore non serve a niente |
| ☐ | 4.4 Con 125%, su un telefono o con lo zoom al 200% | I menu si aprono, i pulsanti restano raggiungibili e nessun testo esce dallo schermo in orizzontale |

## 5. Modalità discreta

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 5.1 Licenze → **Attiva la modalità discreta** | Compare in alto la barra «Modalità discreta attiva. I contenuti sono coperti.» con il pulsante **Mostra i contenuti**; il contenuto dell'app è sfocato e illeggibile, la barra no |
| ☐ | 5.2 Premi **Mostra i contenuti** | I contenuti tornano leggibili; la barra resta al suo posto |
| ☐ | 5.3 Cambia pagina (per esempio apri il diario) | I contenuti tornano sfocati da soli: è il comportamento voluto, non un difetto |
| ☐ | 5.4 Ricarica l'app | La modalità resta attiva e i contenuti coperti (attributo `data-discreto="1"` su `<html>`) |
| ☐ | 5.5 Da Licenze spegni la modalità | La barra sparisce, i contenuti sono nitidi, e la scelta resta spenta anche dopo aver ricaricato |

## 6. Lettura ad alta voce

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 6.1 Apri un capitolo del manuale | Sotto il tempo di lettura c'è **Ascolta il capitolo** |
| ☐ | 6.2 Con l'altoparlante in alto attivo, premi il pulsante | Parte la lettura in italiano del capitolo. Si interrompe subito con **Ferma l'audio** nella barra in alto o con **Esc** |
| ☐ | 6.3 Spegni l'altoparlante in alto e premi di nuovo | Avviso «La voce è spenta: accendila con l'altoparlante in alto, poi riprova.» e nessun audio: non deve partire lo stesso |
| ☐ | 6.4 Su un dispositivo senza voci italiane (o con una sola voce) | La lettura parte comunque con la voce disponibile; nella sezione Neura → Voce la pagina dice quali voci mancano e come aggiungerle |
| ☐ | 6.5 Blocca lo schermo o cambia app durante la lettura, poi torna | Qui **non c'è una promessa**: dipende dal sistema e dal browser. Su alcuni la voce si interrompe, su altri continua anche a schermo bloccato. Quello che deve valere sempre: tornando nell'app la pagina è al suo posto, la lettura non riparte da sola e **Ferma l'audio** ferma quello che sta ancora suonando. Annota cosa succede sul tuo dispositivo, compreso se la voce si è fermata da sola mentre il pulsante restava attivo: in quel caso il sistema non ha avvisato la pagina |

---

## 7. Ricerca nelle tue cose (dalla 1.5.0)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 7.1 Scrivi nel diario una nota con una parola che non compare nei capitoli (per esempio il nome del tuo animale) e cercala | Compare la sezione **«Nelle tue cose»** con il risultato del diario, la data e l'estratto della nota con la parola in evidenza. Nessun risultato nei contenuti: quella parola lì non esiste |
| ☐ | 7.2 Apri quel risultato | Si apre il diario con la voce in evidenza, anche se è più vecchia delle otto che la pagina mostra di solito |
| ☐ | 7.3 Apri un esercizio, scrivi una nota in «Come è andata» e cercala | La nota compare in «Nelle tue cose»; aprendola si riapre l'esercizio con il cursore già nel campo della nota, e il testo è quello salvato |
| ☐ | 7.4 Salva una scheda del pensiero con una parola riconoscibile e cercala | Il risultato apre la scheda in sola lettura, con situazione, pensiero, emozione e lettura alternativa |
| ☐ | 7.5 Cerca una parola che sta in un capitolo e anche in una tua nota | Due sezioni distinte: «Nei contenuti» con capitoli, glossario ed esercizi; «Nelle tue cose» con la nota. Nessuna voce personale finisce fra i contenuti |

## 8. Confronto a sette o trenta giorni (dalla 1.6.0)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 8.1 Apri il riepilogo e scegli «30 giorni» | Titolo e intestazioni dicono trenta, la scelta si vede dal pulsante acceso e i conteggi cambiano rispetto ai sette giorni |
| ☐ | 8.2 Leggi la riga delle date sotto il titolo | Dice «dal … al …» per entrambi i periodi; cambiando periodo cambiano anche le date, non solo i numeri |
| ☐ | 8.3 Premi «Stampa il confronto» e guarda l'anteprima | Il foglio ha titolo, date, tabella e la frase «traccia, non come prova»; non ci sono menù, pulsanti, la scelta del periodo né il collegamento per tornare alla home |

## 9. Estratti e movimento ridotto (dalla 1.7.0)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 9.1 Cerca una parola che compare in un capitolo, per esempio «respiro» | Ogni risultato nei contenuti mostra, sotto il titolo, la frase in cui compare la parola, con la parola evidenziata: non solo il titolo e il tipo |
| ☐ | 9.2 Scrivi nel diario una nota di due frasi, con una parola riconoscibile solo nella seconda, e cercala | L'estratto nelle tue cose è la seconda frase, intera; la prima non compare neanche parzialmente |
| ☐ | 9.3 Attiva «Riduci il movimento» nelle impostazioni di accessibilità del sistema e riapri la home | L'orbita di Neura è ferma — niente respiro, niente anello che ruota — e i cambi pagina non hanno dissolvenze. Spegnendo l'impostazione l'animazione torna |

## 10. Estratti senza titolo (dalla 1.7.1)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 10.1 Cerca `ansia` e guarda i risultati dei capitoli | Sotto il titolo del capitolo «Ansia: il corpo che suona l'allarme», e sotto ogni altro risultato, l'estratto è una frase intera che comincia da sé: non c'è il titolo incollato davanti alla prima parola («Ansia L'ansia è…»), né il titolo di una sezione sopra il paragrafo. La parola cercata resta evidenziata |

## 11. Campi e scorrimento (dalla 1.7.2)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 11.1 Cerca una parola che sta solo nella «Situazione» di una scheda del pensiero | La scheda compare in «Nelle tue cose» con l'estratto limitato a quel campo: non porta dietro il pensiero, l'emozione o la lettura alternativa, e non ci sono «·» a incollarli in una riga sola |
| ☐ | 11.2 Con «Riduci il movimento» attivo, apri Neura e invia un messaggio | La finestra della conversazione si porta in fondo di colpo, senza scorrimento morbido; l'orbita resta ferma come nella prova 9.3 |

## 12. Voce naturale (dalla 1.7.3)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 12.1 Nel programma installato apri Neura → scheda Voce e premi **Installa Paola** | L'avanzamento sale fino al 99%, poi la scheda dice «Voci naturali pronte: Paola» e il pulsante diventa «Paola · femminile · 60 MB». La lettura parte con quella voce anche staccando la rete. Se il download si interrompe (prova con la rete spenta a metà) la scheda scrive il motivo e la voce resta da installare: non deve restare ferma al 100% |

## 13. Aggiornamento del sito (dalla 1.7.4)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 13.1 Lascia aperta una scheda del sito mentre esce una versione nuova (si prova alla release successiva, oppure riaprendo una scheda rimasta aperta da prima dell'aggiornamento) | Compare la barra «C'è una versione nuova» con il pulsante **Aggiorna e ricarica**. Un clic ricarica la pagina una volta e la barra sparisce; in **Versioni e novità** la versione in uso è quella nuova. Non è possibile un secondo clic: il pulsante è sparito con la barra |
| ☐ | 13.2 Su un browser pulito, alla prima apertura del sito | La barra non compare e la pagina non si ricarica da sola: non c'è nessuna versione precedente da sostituire |

## 14. Protezione dello spazio (dalla 1.7.5)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 14.1 Apri **Licenze e progetto** in un browser che concede la protezione (Chrome o Edge usati da un po') | La scheda «Protezione dello spazio» dice che i dati sono protetti, e **non** c'è il pulsante del backup: non c'è urgenza da segnalare |
| ☐ | 14.2 Apri **Licenze e progetto** in una finestra privata, o in un browser senza Storage API | La scheda dice che i dati non sono protetti (o che il browser non offre la protezione) e propone **Esporta backup**; il pulsante scarica `psicologo-digitale-backup.json`, senza cambiare pagina |

## 15. Diario completo, modifica e schede (dalla 1.7.6)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 15.1 Con più di otto voci di diario, apri **Diario** | Sotto le ultime voci c'è **Vedi tutte le N voci**, con il numero vero. Il collegamento apre l'elenco completo, con tutte le voci in ordine di data; **Torna al diario** riporta alle ultime otto |
| ☐ | 15.2 In una voce qualsiasi premi **Modifica**, cambia umore e nota e salva | La voce è quella di prima — stessa data, stesso posto nell'elenco — con i valori nuovi; il numero di voci non aumenta e il riepilogo usa i valori corretti |
| ☐ | 15.3 Elimina una scheda del pensiero dal diario, e un'altra dalla scheda aperta con la ricerca | In entrambi i casi chiede conferma, la scheda scelta sparisce e le altre restano; il messaggio dice che è stata eliminata |

## 16. Sinonimi della ricerca (dalla 1.7.7)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 16.1 Cerca «dormire» e poi «ansioso» | «Dormire» trova il capitolo **Sonno: la riparazione notturna** con «sonno» evidenziato nell'estratto; «ansioso» trova il capitolo sull'ansia, con «ansia» evidenziato. Il risultato non è un titolo senza spiegazione: la frase mostrata contiene la parola che lo ha fatto comparire |
| ☐ | 16.2 Scrivi nel diario una nota con «ho dormito poco», poi cerca «sonno»; infine cerca «zanzara» | La nota compare in **Nelle tue cose** con «dormito» evidenziato; «zanzara», che non è nella tabella, non inventa parenti e dà gli stessi risultati di prima (nessuno, se non l'hai scritta) |

## 17. Estratti della ricerca (dalla 1.7.8)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 17.1 Cerca «legittime» | Compare **Scegliere il professionista giusto** senza una riga che ripeta il titolo di sezione «Domande legittime»: il titolo serve a trovarlo, non a spiegarlo |
| ☐ | 17.2 Cerca «pianificazione» e poi «padronanza» | «Pianificazione» trova **Attivazione comportamentale** senza «10 minuti di pianificazione» come estratto; «padronanza» trova lo stesso esercizio con la frase dei passi, parola evidenziata |
| ☐ | 17.3 Cerca «reagisce» | L'estratto comincia prima del punto e virgola: si legge «… scegliere cosa fare; fuori, si reagisce», non solo la parte dopo |
| ☐ | 17.4 Cerca «etichettamento» | L'estratto si ferma a una parola intera («… cancella il resto),») e non lascia una parola mozzata come «personalizzaz» |

## 18. Uscita rapida (dalla 1.7.9)

| ✓ | Prova | Risultato atteso |
|---|---|---|
| ☐ | 18.1 Apri **Sicurezza** e premi **Esci subito**, in cima alla pagina | Un tocco: compare una pagina bianca con «Nuova scheda», l'ora e la data. Testata, menu, piè di pagina e barra di stato spariscono, e il titolo della scheda non nomina il programma |
| ☐ | 18.2 Dalla pagina neutra premi **Indietro**, poi apri la cronologia del browser | Si torna a Sicurezza con i dati intatti. La pagina neutra e quelle del programma sono ancora nella cronologia: il pulsante non cancella niente, e la scritta accanto lo diceva già |

## Se qualcosa non torna

Annota, senza correggere niente a mano: la versione (pagina **Versioni e novità**), il dispositivo e il browser, la prova (per esempio «3.3»), i passi e **cosa è successo invece** di quello atteso. Se il problema riguarda un file importato, allega il file di prova (`prova-1.4.0.json`), **mai un backup vero**: contiene dati personali.

## Esito

| Data | Dispositivo | Versione | Prove superate | Note |
|---|---|---|---|---|
|  |  | 1.7.9 | /62 |  |
