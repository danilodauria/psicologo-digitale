/* ==========================================================================
   Psicologo Digitale · ponte tra la pagina e il processo principale
   Espone solo ciò che serve: piattaforma e due chiamate a Ollama.
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("npDesktop", {
  platform: process.platform,
  electron: process.versions.electron,
  ollama: {
    tags: () => ipcRenderer.invoke("ollama:tags"),
    generate: (payload) => ipcRenderer.invoke("ollama:generate", payload)
  }
});
