/* ==========================================================================
   Psicologo Digitale · configurazione della suite nel browser vero
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

// Le prove del foglio a mano che si possono automatizzare: cursore nel campo,
// anteprima del backup, fascicolo, stampa, nessuna richiesta esterna. Girano
// due volte, con la finestra di un telefono e con quella di un computer, perché
// metà dei difetti trovati a mano si vedeva solo a 360 pixel.
//
// Il service worker è bloccato: fra una prova e l'altra terrebbe in cache la
// versione precedente dei file, e i test misurerebbero una pagina che non è
// quella del repository.
const { defineConfig } = require("@playwright/test");

const PORTA = 4173;
const ORIGINE = "http://127.0.0.1:" + PORTA;

module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  use: {
    baseURL: ORIGINE,
    serviceWorkers: "block",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "python3 -m http.server " + PORTA + " --bind 127.0.0.1",
    url: ORIGINE + "/index.html",
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "ignore",
    timeout: 20000
  },
  projects: [
    {
      name: "telefono",
      use: { viewport: { width: 360, height: 740 }, isMobile: true }
    },
    {
      name: "computer",
      use: { viewport: { width: 1280, height: 800 } }
    }
  ]
});
