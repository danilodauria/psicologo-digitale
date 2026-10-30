/* ==========================================================================
   Psicologo Digitale · installazione e intelligenza artificiale locale
   Licenza dei contenuti: CC BY-NC-SA 4.0 · Danilo D'Auria
   ========================================================================== */

window.NP = window.NP || {};
NP.data = NP.data || {};

NP.data.ai = {
  introduzione:
    "Neura funziona da sola e non ha bisogno di nulla. Se però ti va di avere accanto anche un modello " +
    "generativo che gira sul tuo computer, puoi installare Ollama: è gratuito, open source e non manda " +
    "niente in rete. Qui sotto trovi la versione adatta al sistema che stai usando e il modello che il tuo " +
    "hardware riesce a reggere senza affannarsi.",

  build: {
    windows: {
      sistema: "Windows 10 (22H2) o Windows 11",
      url: "https://ollama.com/download/windows",
      scarica: "Scarica per Windows",
      nota: "Un solo programma per processori Intel, AMD e ARM. Se Windows è a 32 bit o precedente al 10, Ollama non è disponibile: la guida interna funziona lo stesso."
    },
    mac: {
      sistema: "macOS 11 o successivo",
      url: "https://ollama.com/download/mac",
      scarica: "Scarica per macOS",
      nota: "Un unico file per Mac con chip Apple (M1 e successivi) e per Mac Intel. Sui chip Apple è molto più veloce."
    },
    linux: {
      sistema: "Linux a 64 bit",
      url: "https://ollama.com/download/linux",
      scarica: "Scarica per Linux",
      nota: "C'è il pacchetto di installazione e lo script da terminale. Su distribuzioni molto vecchie servono aggiornamenti di sistema."
    }
  },

  requisiti: [
    " Otto gigabyte di memoria sono il minimo per un uso sereno; sedici rendono tutto più fluido.",
    "Da cinque a dieci gigabyte liberi su disco: i modelli si scaricano una volta e restano lì.",
    "Processore x86 con istruzioni AVX (in pratica: dal 2011 in avanti) oppure chip Apple. Su processori più vecchi Ollama potrebbe non partire.",
    "Una scheda grafica dedicata aiuta ma non è obbligatoria: senza GPU risponde più lentamente, tutto qui.",
    "Internet serve solo per il download. Dopo, il modello lavora in locale, anche staccando la rete."
  ],

  modelli: [
    { id: "qwen2.5:1.5b", nome: "Qwen 2.5 · 1,5 miliardi", ramMin: 4, peso: "circa 1 GB", uso: "Il più leggero. Parte in pochi secondi anche su portatili vecchi; risposte brevi e semplici." },
    { id: "llama3.2:3b", nome: "Llama 3.2 · 3 miliardi", ramMin: 8, peso: "circa 2 GB", uso: "Il compromesso più equilibrato per un computer di tutti i giorni." },
    { id: "qwen2.5:7b", nome: "Qwen 2.5 · 7 miliardi", ramMin: 16, peso: "circa 4,7 GB", uso: "Scrive meglio in italiano e regge testi più lunghi. Serve un computer recente." },
    { id: "qwen2.5:14b", nome: "Qwen 2.5 · 14 miliardi", ramMin: 32, peso: "circa 9 GB", uso: "Per workstation con molta memoria. Lento su un portatile." }
  ],

  passi: [
    { t: "Installa Ollama", d: "Scarica il programma per il tuo sistema e aprilo. Su Windows e macOS parte da solo e resta in ascolto; su Linux lo script configura il servizio." },
    { t: "Scarica un modello", d: "Apri il terminale (Prompt dei comandi su Windows) e incolla il comando qui sotto. Il download può richiedere qualche minuto." },
    { t: "Provalo", d: "Sempre dal terminale, avvia il modello e scrivi una domanda. Se risponde, è pronto anche per questa pagina." },
    { t: "Collega la pagina", d: "Torna qui e premi «Verifica il collegamento». Se il browser viene bloccato, leggi la nota sui permessi: è una protezione di Ollama, non un errore tuo." }
  ],

  comandi: {
    windows: "setx OLLAMA_ORIGINS \"https://danilodauria.github.io\"",
    mac: "launchctl setenv OLLAMA_ORIGINS \"https://danilodauria.github.io\"",
    linux: "OLLAMA_ORIGINS=https://danilodauria.github.io ollama serve"
  },

  avvertenze: [
    "Un modello locale è generico: non conosce il manuale di questo programma e può sbagliare con sicurezza. Le risposte verificate restano quelle di Neura.",
    "Non è un medico e non è uno psicologo: non chiedergli diagnosi, dosi di farmaci o giudizi su di te.",
    "Le sue risposte non vengono filtrate da nessuno: leggile con lo stesso spirito critico con cui leggeresti un forum.",
    "Tutto resta sul tuo computer, ma le conversazioni vengono salvate nella memoria del modello solo se lo decidi tu: qui non conserviamo nulla."
  ],

  fonti: [
    { t: "Ollama · sito ufficiale e download", u: "https://ollama.com/download" },
    { t: "Ollama · documentazione", u: "https://docs.ollama.com" },
    { t: "Ollama · libreria dei modelli", u: "https://ollama.com/library" }
  ]
};
