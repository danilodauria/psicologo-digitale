# Regole del progetto · Psicologo Digitale

Queste regole valgono per chiunque lavori qui: una persona, un'altra IA, un
collaboratore di passaggio. Non sono consigli di stile. Se una di queste cambia,
si cambia qui e in `CONSEGNA.md`, con il motivo scritto.

## Paternità

Il progetto — ideazione, testi, codice, grafica, personaggio di Neura — è di
**Danilo D'Auria**, un progetto **FeniceOS**. L'attribuzione sta già in
`package.json` (`author`), nel piè di pagina di ogni pagina, nei PDF, in
`LICENSE`, `LICENSE-CONTENT.md` e nella pagina Licenze del programma.

- Ogni contributo si attribuisce a Danilo D'Auria: non si aggiungono autori,
  co-autori o righe di attribuzione a terzi o a strumenti.
- **I commit non hanno footer di attribuzione**: niente `Generated with`,
  niente `Co-Authored-By`, niente firme di agenti o modelli. Il messaggio
  finisce alla sua ultima riga utile.
- Non si tolgono le attribuzioni esistenti, nemmeno per «pulire» un file.

## Dove si pubblica

- Push solo su `https://github.com/danilodauria/psicologo-digitale.git`
  (l'`origin` del repository può puntare altrove per errore: non usarlo).
- `.github/workflows/` non si tocca da qui: `git reset -q .github/workflows`
  prima di ogni commit. Le GitHub Action si cambiano dall'integrazione GitHub.
- La pipeline di una release sta in `CONSEGNA.md` §4, e si segue in ordine.

## Migliorie: nessuna idea si perde e nessuna promessa resta senza prova

Lo stato delle idee vive in `scripts/migliorie.json`; `npm run migliorie` lo
legge e diventa rosso se:

- un'idea segnata **fatta** non indica un controllo che esiste **ed è eseguito
  da `npm test`**;
- un'idea **aperta** non dice perché (un vincolo, non «non c'era tempo»).

Quando si propone o si realizza una miglioria:

1. si aggiunge o si aggiorna la sua voce in `scripts/migliorie.json`;
2. se è fatta, si scrive anche il controllo che la tiene in piedi e lo si mette
   in `npm test` — non basta che il codice ci sia;
3. se è aperta, si scrive il motivo vero e si aggiorna `CONSEGNA.md` §8;
4. `npm test` verde, poi commit.

## Copia di riserva

A ogni versione completa si produce una copia dell'ultima versione funzionante,
con data e versione nel nome:

```bash
npm run backup            # backup/psicologo-digitale-<versione>-<AAAA-MM-GG>.zip
```

L'archivio è `git archive` di `HEAD`: solo file versionati, niente dipendenze,
niente build, niente segreti. La cartella `backup/` non si committa
(sta in `.gitignore`) e serve a chi usa il programma per tenere una copia sul
proprio computer.

## Invarianti

Prima di toccare qualcosa, leggere `CONSEGNA.md` §3: niente dati che escono dal
dispositivo, nessun segreto nel repository, versione unica in tutti i file,
promesse verificate, backup con formato dichiarato. I controlli automatici sono
la memoria del progetto: se un controllo diventa rosso, si corregge la causa,
non si allenta il controllo.
