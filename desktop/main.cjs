/* ==========================================================================
   Psicologo Digitale · contenitore desktop
   Carica l'app statica da desktop/app, senza server e senza rete.
   In più parla con Ollama dal processo principale, così il browser non deve
   autorizzare nessuna origine locale.
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { spawn } = require("child_process");
const { scompattaMotore } = require("./motore.cjs");

const HOME = path.join(__dirname, "app", "index.html");
const OLLAMA = "http://127.0.0.1:11434";

function isExternal(url) {
  return /^https?:\/\//i.test(url);
}

/* Ollama ------------------------------------------------------------------- */

function messaggio(err) {
  if (err && err.name === "TimeoutError") return "Ollama non ha risposto in tempo";
  if (err && err.cause && err.cause.code === "ECONNREFUSED") return "Ollama non è in esecuzione";
  return String((err && err.message) || err || "errore sconosciuto");
}

ipcMain.handle("ollama:tags", async () => {
  try {
    const res = await fetch(OLLAMA + "/api/tags", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, error: "HTTP " + res.status };
    const data = await res.json();
    const modelli = Array.isArray(data && data.models) ? data.models : [];
    return {
      ok: true,
      models: modelli.map((m) => ({
        name: String(m.name || m.model || ""),
        size: Number(m.size) || 0,
        modified: String(m.modified_at || "")
      }))
    };
  } catch (err) {
    return { ok: false, error: messaggio(err) };
  }
});

ipcMain.handle("ollama:generate", async (_event, payload) => {
  const model = String((payload && payload.model) || "").trim().slice(0, 120);
  const prompt = String((payload && payload.prompt) || "").trim().slice(0, 2000);
  const system = String((payload && payload.system) || "").trim().slice(0, 2000);
  if (!model || !prompt) return { ok: false, error: "modello o domanda mancanti" };

  try {
    const res = await fetch(OLLAMA + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, system, stream: false }),
      signal: AbortSignal.timeout(180000)
    });
    if (!res.ok) return { ok: false, error: "HTTP " + res.status };
    const data = await res.json();
    return { ok: true, model, response: String((data && data.response) || "") };
  } catch (err) {
    return { ok: false, error: messaggio(err) };
  }
});

/* Impostazioni del sistema -------------------------------------------------- */

// Le voci installate si aggiungono dalle impostazioni del sistema: aprire il
// pannello giusto evita di doverlo cercare a mano fra le schermate.
ipcMain.handle("sistema:impostazioniVoce", async () => {
  const pannelli = {
    win32: "ms-settings:speech",
    darwin: "x-apple.systempreferences:com.apple.preference.universalaccess?SpokenContent"
  };
  const pannello = pannelli[process.platform];
  if (!pannello) return { ok: false, motivo: "linux" };
  try {
    await shell.openExternal(pannello);
    return { ok: true };
  } catch (err) {
    return { ok: false, motivo: "errore", errore: String((err && err.message) || err) };
  }
});

/* Voce naturale (facoltativa) ---------------------------------------------- */

// Il programma parla con le voci del sistema. Per averne una davvero naturale
// senza mandare il testo a nessuno si aggiunge un motore neurale che gira qui:
// non sta nel pacchetto (86 MB), si scarica una volta dal pannello Voce e
// resta nella cartella dei dati dell'utente. Ogni file ha un'impronta fissata
// qui sotto e viene controllato prima di essere usato.
// Un motore per sistema e processore: su Windows arriva uno ZIP, su Linux un
// tar.gz con dentro il binario e le sue librerie.
const VOCE_MOTORE = {
  "win32-x64": {
    tipo: "zip",
    url: "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip",
    sha256: "f3c58906402b24f3a96d92145f58acba6d86c9b5db896d207f78dc80811efcea",
    byte: 22477236
  },
  "linux-x64": {
    tipo: "tar",
    url: "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz",
    sha256: "a50cb45f355b7af1f6d758c1b360717877ba0a398cc8cbe6d2a7a3a26e225992",
    byte: 26460462
  },
  "linux-arm64": {
    tipo: "tar",
    url: "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_aarch64.tar.gz",
    sha256: "fea0fd2d87c54dbc7078d0f878289f404bd4d6eea6e7444a77835d1537ab88eb",
    byte: 26004717
  }
};

// macOS resta fuori: gli archivi ufficiali di Piper per Mac non contengono le
// librerie che i binari cercano (libonnxruntime, libespeak-ng), quindi non
// potrebbero funzionare. Lì la voce naturale sono quelle «Premium» di Apple.
function motoreVoce() {
  return VOCE_MOTORE[process.platform + "-" + process.arch] || null;
}

// Le voci disponibili. Il motore si scarica una volta sola; ogni voce è un
// modello a sé e si scarica solo quando la si sceglie.
const VOCE_VOCI = [
  {
    id: "paola",
    nome: "Paola",
    genere: "femminile",
    nota: "la più naturale",
    file: [
      {
        nome: "it_IT-paola-medium.onnx",
        url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx",
        sha256: "6fc918b5a0ea6137382833dddfa567bffbe6a5060c02043c87192ee59c04210c",
        byte: 63511038
      },
      {
        nome: "it_IT-paola-medium.onnx.json",
        url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/paola/medium/it_IT-paola-medium.onnx.json",
        sha256: "aea19c0a7fce29fbc359b93f10e7902854401e4c95ae2ea328ae516b15d296cf",
        byte: 7099
      }
    ]
  },
  {
    id: "riccardo",
    nome: "Riccardo",
    genere: "maschile",
    nota: "voce maschile, più leggera",
    file: [
      {
        nome: "it_IT-riccardo-x_low.onnx",
        url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx",
        sha256: "1368de15f123275a7ef951c9e5e30be0f58a032daa14a0da44037443c1d1d21b",
        byte: 28130791
      },
      {
        nome: "it_IT-riccardo-x_low.onnx.json",
        url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx.json",
        sha256: "146ab9c634afe524e9fb7530f2510df7a42fb1db56b52658ca1fb3d98001a62a",
        byte: 4161
      }
    ]
  }
];

function vocePerId(id) {
  return VOCE_VOCI.filter((v) => v.id === id)[0] || null;
}

function cartellaVoce() {
  return path.join(app.getPath("userData"), "voce-naturale");
}

function percorsiVoce(id) {
  const cartella = cartellaVoce();
  const voce = vocePerId(id) || VOCE_VOCI[0];
  return {
    cartella: cartella,
    exe: path.join(cartella, "piper", process.platform === "win32" ? "piper.exe" : "piper"),
    modello: path.join(cartella, voce.file[0].nome),
    config: path.join(cartella, voce.file[1].nome),
    voce: voce
  };
}

function motorePronto() {
  return fs.existsSync(percorsiVoce().exe);
}

function vocePronta(id) {
  const dove = percorsiVoce(id);
  return fs.existsSync(dove.modello) && fs.existsSync(dove.config);
}

function voceInstallata() {
  return motorePronto() && VOCE_VOCI.some((v) => vocePronta(v.id));
}

function statoVoce() {
  const motore = motoreVoce();
  const voci = VOCE_VOCI.map((v) => ({
    id: v.id,
    nome: v.nome,
    genere: v.genere,
    nota: v.nota,
    mb: Math.round(v.file.reduce((s, f) => s + f.byte, 0) / 1048576),
    installata: vocePronta(v.id)
  }));
  const pronte = voci.filter((v) => v.installata);
  if (!motore) {
    return { ok: true, disponibile: false, installata: false, motivo: process.platform + "-" + process.arch, voci: voci };
  }
  const primo = VOCE_VOCI[0].file.reduce((s, f) => s + f.byte, 0);
  return {
    ok: true,
    disponibile: true,
    installata: motorePronto() && pronte.length > 0,
    voce: (pronte[0] || voci[0]).nome,
    peso: Math.round((motore.byte + primo) / 1048576),
    voci: voci
  };
}

// Download con avanzamento e verifica: se manca un byte o l'impronta non
// torna, il file non viene usato e l'installazione si ferma.
async function scaricaFile(destinazione, file, onProgresso) {
  const res = await fetch(file.url, { redirect: "follow" });
  if (!res.ok) throw new Error("download non riuscito (HTTP " + res.status + ")");
  const atteso = Number(res.headers.get("content-length")) || file.byte;
  const pezzi = [];
  let letti = 0;
  if (res.body && typeof res.body.getReader === "function") {
    const lettore = res.body.getReader();
    for (;;) {
      const passo = await lettore.read();
      if (passo.done) break;
      pezzi.push(Buffer.from(passo.value));
      letti += passo.value.length;
      if (onProgresso) onProgresso(letti, atteso);
    }
  } else {
    const tutto = Buffer.from(await res.arrayBuffer());
    pezzi.push(tutto);
    letti = tutto.length;
    if (onProgresso) onProgresso(letti, atteso);
  }
  const contenuto = Buffer.concat(pezzi);
  if (file.byte && contenuto.length !== file.byte) {
    throw new Error("file incompleto: " + contenuto.length + " byte invece di " + file.byte);
  }
  const impronta = crypto.createHash("sha256").update(contenuto).digest("hex");
  if (impronta !== file.sha256) throw new Error("impronta SHA-256 diversa da quella prevista");
  await fs.promises.mkdir(path.dirname(destinazione), { recursive: true });
  await fs.promises.writeFile(destinazione, contenuto);
  return contenuto;
}

// Il motore si scompatta dentro il programma (vedi motore.cjs), così non
// serve né unzip né tar né il permesso di amministratore.

let scaricamentoVoce = null;

ipcMain.handle("voceNaturale:stato", () => statoVoce());

ipcMain.handle("voceNaturale:scarica", async (evento, id) => {
  const motore = motoreVoce();
  if (!motore) return { ok: false, disponibile: false, motivo: process.platform + "-" + process.arch };
  const voce = vocePerId(id) || VOCE_VOCI[0];
  const motoreCera = motorePronto();
  if (motoreCera && vocePronta(voce.id)) return statoVoce();
  if (scaricamentoVoce) return scaricamentoVoce;

  const manda = (dati) => {
    const mittente = evento && evento.sender;
    if (mittente && !mittente.isDestroyed()) mittente.send("voceNaturale:progresso", dati);
  };
  const cartella = cartellaVoce();
  const archivio = path.join(cartella, "motore.zip");
  const pesoTotale = (motoreCera ? 0 : motore.byte) + voce.file.reduce((s, f) => s + f.byte, 0);
  let fatto = 0;

  scaricamentoVoce = (async () => {
    await fs.promises.mkdir(cartella, { recursive: true });
    if (!motoreCera) {
      manda({ fase: "motore", percentuale: 0 });
      await scaricaFile(archivio, motore, (letti) => manda({ fase: "motore", percentuale: Math.round((letti / pesoTotale) * 100) }));
      fatto += motore.byte;
      scompattaMotore(await fs.promises.readFile(archivio), cartella, motore.tipo);
      await fs.promises.unlink(archivio).catch(() => {});
      if (!fs.existsSync(percorsiVoce().exe)) throw new Error("l'archivio non conteneva il motore vocale");
    }

    for (const file of voce.file) {
      const prima = fatto;
      await scaricaFile(path.join(cartella, file.nome), file, (letti) => manda({
        fase: "voce",
        percentuale: Math.round(((prima + letti) / pesoTotale) * 100)
      }));
      fatto += file.byte;
    }
    manda({ fase: "pronta", percentuale: 100 });
    return statoVoce();
  })()
    .catch(async (err) => {
      // Un'installazione a metà non deve restare lì a sembrare completa.
      if (!motoreCera) await fs.promises.rm(path.join(cartella, "piper"), { recursive: true, force: true }).catch(() => {});
      await fs.promises.rm(archivio, { force: true }).catch(() => {});
      for (const file of voce.file) await fs.promises.rm(path.join(cartella, file.nome), { force: true }).catch(() => {});
      return { ok: false, errore: String((err && err.message) || err) };
    })
    .finally(() => { scaricamentoVoce = null; });

  return scaricamentoVoce;
});

// La voce si genera qui, in un processo separato, e torna alla pagina come
// WAV: l'audio non passa da nessun server e non resta sul disco.
ipcMain.handle("voceNaturale:pronuncia", async (_evento, testo, ritmo, id) => {
  const pulito = String(testo || "").replace(/\s+/g, " ").trim().slice(0, 800);
  // La velocità scelta nella pagina diventa il passo del motore: in Piper
  // «length_scale» più basso vuol dire lettura più veloce.
  const passo = Math.min(1.6, Math.max(0.5, 1 / (Number(ritmo) || 1)));
  if (!pulito) return { ok: false, errore: "testo vuoto" };
  const dove = percorsiVoce(id);
  if (!motorePronto() || !vocePronta(dove.voce.id)) {
    return { ok: false, errore: "la voce naturale scelta non è installata" };
  }
  // Su macOS e Linux il motore arriva con i suoi permessi, ma un archivio
  // scompattato altrove potrebbe averli persi: il bit di esecuzione serve.
  if (process.platform !== "win32") {
    try { fs.chmodSync(dove.exe, 0o755); } catch (e) { /* già eseguibile */ }
  }
  const wav = path.join(app.getPath("temp"), "psicologo-digitale-voce-" + process.pid + ".wav");

  return new Promise((risolvi) => {
    let finito = false;
    let errori = "";
    const chiudi = (risposta) => {
      if (finito) return;
      finito = true;
      fs.promises.unlink(wav).catch(() => {});
      risolvi(risposta);
    };

    let figlio;
    try {
      figlio = spawn(dove.exe, ["--model", dove.modello, "--config", dove.config, "--length_scale", passo.toFixed(2), "--output_file", wav], { windowsHide: true });
    } catch (err) {
      chiudi({ ok: false, errore: String((err && err.message) || err) });
      return;
    }

    const scadenza = setTimeout(() => {
      try { figlio.kill(); } catch (e) { /* già finito */ }
      chiudi({ ok: false, errore: "la voce non ha risposto in tempo" });
    }, 20000);

    if (figlio.stderr) figlio.stderr.on("data", (d) => { errori = (errori + String(d)).slice(-300); });
    figlio.on("error", (err) => {
      clearTimeout(scadenza);
      chiudi({ ok: false, errore: String((err && err.message) || err) });
    });
    figlio.on("close", (codice) => {
      clearTimeout(scadenza);
      if (codice !== 0) {
        chiudi({ ok: false, errore: "motore vocale: " + (errori.trim() || "codice " + codice) });
        return;
      }
      fs.promises.readFile(wav)
        .then((dati) => chiudi({ ok: true, wav: dati }))
        .catch((err) => chiudi({ ok: false, errore: String((err && err.message) || err) }));
    });

    // Piper legge il testo dall'ingresso standard: una riga, un file audio.
    try { figlio.stdin.end(pulito + "\n"); } catch (e) { /* il processo è già uscito */ }
  });
});

ipcMain.handle("voceNaturale:rimuovi", async () => {
  try {
    await fs.promises.rm(cartellaVoce(), { recursive: true, force: true });
    return statoVoce();
  } catch (err) {
    return { ok: false, errore: String((err && err.message) || err) };
  }
});

/* Aggiornamenti ------------------------------------------------------------ */

// Le nuove versioni arrivano dalle release GitHub. Su Windows e Linux AppImage
// l'aggiornamento non chiede nulla; su macOS serve un pacchetto firmato, e
// quindi l'errore va spiegato invece di lasciare l'utente in attesa.
let statoUpdate = { fase: "sconosciuto", versione: "", percentuale: 0, messaggio: "" };

function aggiornaStato(nuovo) {
  statoUpdate = Object.assign({}, statoUpdate, nuovo);
  BrowserWindow.getAllWindows().forEach((w) => {
    if (!w.isDestroyed() && w.webContents) w.webContents.send("update:stato", statoUpdate);
  });
}

function preparaAggiornamenti() {
  if (!app.isPackaged) {
    aggiornaStato({ fase: "sviluppo", messaggio: "Gli aggiornamenti funzionano solo nel programma installato." });
    return;
  }

  let autoUpdater;
  try {
    autoUpdater = require("electron-updater").autoUpdater;
  } catch (e) {
    aggiornaStato({ fase: "disattivato", messaggio: "Questa build non include il modulo degli aggiornamenti." });
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => aggiornaStato({ fase: "verifica", messaggio: "Controllo le nuove versioni…" }));
  autoUpdater.on("update-available", (info) => aggiornaStato({
    fase: "disponibile",
    versione: String((info && info.version) || ""),
    messaggio: "Nuova versione in scaricamento."
  }));
  autoUpdater.on("update-not-available", () => aggiornaStato({
    fase: "aggiornato", percentuale: 0, messaggio: "Questa è la versione più recente."
  }));
  autoUpdater.on("download-progress", (p) => aggiornaStato({
    fase: "scaricamento", percentuale: Math.round((p && p.percent) || 0)
  }));
  autoUpdater.on("update-downloaded", (info) => aggiornaStato({
    fase: "pronto",
    versione: String((info && info.version) || ""),
    percentuale: 100,
    messaggio: "L'aggiornamento è pronto: si installa alla chiusura, o subito se preferisci."
  }));
  autoUpdater.on("error", (err) => {
    const testo = String((err && err.message) || err || "errore sconosciuto");
    const firma = /signature|code sign|not signed|Could not get code signature/i.test(testo);
    aggiornaStato({
      fase: "errore",
      messaggio: firma
        ? "macOS aggiorna da solo solo i pacchetti firmati: scarica la nuova versione dalla pagina delle release."
        : "Controllo non riuscito: " + testo
    });
  });

  ipcMain.handle("update:stato", () => statoUpdate);
  ipcMain.handle("update:controlla", async () => {
    try { await autoUpdater.checkForUpdates(); } catch (e) { /* l'errore arriva dall'evento */ }
    return statoUpdate;
  });
  ipcMain.handle("update:installa", () => {
    if (statoUpdate.fase !== "pronto") return { ok: false, motivo: "nessun aggiornamento pronto" };
    setImmediate(() => autoUpdater.quitAndInstall(false, true));
    return { ok: true };
  });

  // Il primo controllo non blocca l'avvio: la finestra si apre comunque.
  setTimeout(() => { autoUpdater.checkForUpdates().catch(() => {}); }, 4000);
}

/* Finestra ----------------------------------------------------------------- */

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: "#f4f2ec",
    title: "Psicologo Digitale",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  win.once("ready-to-show", () => win.show());
  win.loadFile(HOME);

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("file://")) return;
    if (isExternal(url)) shell.openExternal(url);
    event.preventDefault();
  });

  return win;
}

const unoSolo = app.requestSingleInstanceLock();
if (!unoSolo) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
    preparaAggiornamenti();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
