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
  },
  // Aggiornamenti: la pagina può leggerne lo stato, chiedere un controllo e
  // riavviare il programma quando la nuova versione è pronta.
  aggiornamenti: {
    stato: () => ipcRenderer.invoke("update:stato"),
    controlla: () => ipcRenderer.invoke("update:controlla"),
    installa: () => ipcRenderer.invoke("update:installa"),
    on: (fn) => {
      const ascolta = (_evento, stato) => fn(stato);
      ipcRenderer.on("update:stato", ascolta);
      return () => ipcRenderer.removeListener("update:stato", ascolta);
    }
  }
});
