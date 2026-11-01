/* ==========================================================================
   Psicologo Digitale · contenitore desktop
   Carica l'app statica da desktop/app, senza server e senza rete.
   In più parla con Ollama dal processo principale, così il browser non deve
   autorizzare nessuna origine locale.
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");

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
