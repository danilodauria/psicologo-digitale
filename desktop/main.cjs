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

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
