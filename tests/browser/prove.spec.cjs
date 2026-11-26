/* ==========================================================================
   Psicologo Digitale · le prove del foglio a mano, in un browser vero
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

// Coprono le sezioni 27–31 di PROVE-A-MANO-1.7.20.md: cursore nel campo della
// ricerca, anteprima del backup, fascicolo e stampa, nessuna richiesta esterna.
// Ogni prova gira due volte: con la finestra di un telefono e con quella di un
// computer (vedi playwright.config.cjs).

const fs = require("fs");
const { test, expect } = require("@playwright/test");

const PREFISSO = "psicologo-digitale:v1:";
const VOCE = { id: "prova-voce", date: "2026-01-10", mood: 6, anxiety: 4, sleep: 7, energy: 5, note: "Voce di prova" };

// Il benvenuto coprirebbe le prove con un pannello: si tiene chiuso, come fa
// chi ha già usato il programma.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(function (prefisso) {
    localStorage.setItem(prefisso + "welcome-hidden", "1");
  }, PREFISSO);
});

// I dati di oggi con una voce di diario in più: quello che un backup vero
// porterebbe.
function datiConVoce(page) {
  return page.evaluate(function (voce) {
    const dati = NP.app.raccogliDati();
    return Object.assign({}, dati, { diary: (dati.diary || []).concat([voce]) });
  }, VOCE);
}

function scegliFile(page, nome, contenuto) {
  return page.setInputFiles("#provaFile", {
    name: nome,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(contenuto))
  });
}

function bustaProtetta(page, password) {
  return datiConVoce(page).then(function (dati) {
    return page.evaluate(function (d) {
      return NP.app.cifraBackup(d.dati, d.password);
    }, { dati: dati, password: password });
  });
}

// Una voce di diario, così fascicolo e stampa hanno qualcosa da mettere insieme.
function conDiario(page) {
  return page.addInitScript(function (d) {
    if (!localStorage.getItem(d.prefisso + "diary")) {
      localStorage.setItem(d.prefisso + "diary", JSON.stringify([d.voce]));
    }
  }, { prefisso: PREFISSO, voce: VOCE });
}

test("la lente apre Cerca e mette il cursore nel campo", async ({ page }) => {
  await page.goto("/index.html");
  await page.click("#cercaBtn");
  await expect(page).toHaveURL(/#\/cerca$/);
  await expect(page.locator("#cercaInput")).toBeFocused();
});

test("scrivendo nella ricerca i risultati compaiono senza altri clic", async ({ page }) => {
  await page.goto("/index.html");
  await page.click("#cercaBtn");
  await page.locator("#cercaInput").pressSequentially("ansia");
  await page.press("#cercaInput", "Enter");
  await expect(page).toHaveURL(/#\/cerca\/ansia/);
  await expect(page.locator(".cerca-contenuti")).toContainText("risultat");
});

test("a finestra stretta la pagina non scorre in orizzontale", async ({ page }) => {
  for (const rotta of ["/index.html", "/index.html#/cerca", "/index.html#/diario", "/index.html#/licenze"]) {
    await page.goto(rotta);
    await expect(page.locator("#app")).toBeVisible();
    const sbordo = await page.evaluate(function () {
      const doc = document.documentElement;
      const app = document.getElementById("app");
      return {
        pagina: doc.scrollWidth - doc.clientWidth,
        vista: app.scrollWidth - app.clientWidth
      };
    });
    expect(sbordo.pagina, "la pagina non deve allargarsi (" + rotta + ")").toBeLessThanOrEqual(1);
    expect(sbordo.vista, "la vista non deve allargarsi (" + rotta + ")").toBeLessThanOrEqual(1);
  }
});

test("l'anteprima di un backup compare e non tocca i dati", async ({ page }) => {
  await page.goto("/index.html#/licenze");
  await scegliFile(page, "backup-prova.json", await datiConVoce(page));

  const anteprima = page.locator("#backupAnteprima");
  await expect(anteprima).toContainText("Il file contiene:");
  await expect(anteprima).toContainText("Rispetto ai dati di oggi cambierebbe:");

  const voci = await page.evaluate(function (prefisso) {
    return JSON.parse(localStorage.getItem(prefisso + "diary") || "[]").length;
  }, PREFISSO);
  expect(voci).toBe(0);
});

test("scegliendo un file protetto l'anteprima del file precedente sparisce", async ({ page }) => {
  await page.goto("/index.html#/licenze");
  await scegliFile(page, "backup-chiaro.json", await datiConVoce(page));
  await expect(page.locator("#backupAnteprima")).toBeVisible();

  await scegliFile(page, "backup-protetto.json", await bustaProtetta(page, "password-di-prova"));
  await expect(page.locator("#backupAnteprima")).toHaveCount(0);
  await expect(page.locator("#backupSbloccoPassword")).toBeVisible();
});

test("la password sbagliata non apre l'anteprima, quella giusta sì", async ({ page }) => {
  await page.goto("/index.html#/licenze");
  await scegliFile(page, "backup-protetto.json", await bustaProtetta(page, "password-di-prova"));

  await page.fill("#backupSbloccoPassword", "password-sbagliata");
  await page.click("#backupSbloccoApri");
  await expect(page.locator("#backupSbloccoStato")).toContainText("Password errata");
  await expect(page.locator("#backupAnteprima")).toHaveCount(0);

  await page.fill("#backupSbloccoPassword", "password-di-prova");
  await page.click("#backupSbloccoApri");
  await expect(page.locator("#backupAnteprima")).toBeVisible();
});

test("il fascicolo ha cinque parti e si scarica come un solo PDF", async ({ page }) => {
  await conDiario(page);
  await page.goto("/index.html#/fascicolo");
  const foglio = page.locator("#fascicoloSheet");
  for (const parte of [
    "Parte 1 — Relazione preliminare",
    "Parte 2 — Scheda da portare",
    "Parte 3 — Piano di sicurezza",
    "Parte 4 — Confronto dei periodi",
    "Parte 5 — Domande scelte per il colloquio"
  ]) {
    await expect(foglio).toContainText(parte);
  }

  const [download] = await Promise.all([page.waitForEvent("download"), page.click("#fascicoloPdfBtn")]);
  expect(download.suggestedFilename()).toMatch(/^fascicolo-psicologo-digitale-\d{4}-\d{2}-\d{2}\.pdf$/);
  const contenuto = fs.readFileSync(await download.path());
  expect(contenuto.subarray(0, 5).toString("latin1")).toBe("%PDF-");
});

test("la stampa del fascicolo mostra solo il foglio", async ({ page }) => {
  await conDiario(page);
  // window.print non apre nulla in un browser senza finestre: si registra la
  // chiamata, e la stampa si guarda con i mezzi di stampa attivi.
  await page.addInitScript(function () {
    window.__stampe = 0;
    window.print = function () { window.__stampe += 1; };
  });
  await page.goto("/index.html#/fascicolo");
  await page.click("#fascicoloPrintBtn");
  expect(await page.evaluate(() => window.__stampe)).toBe(1);

  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.locator(".report-actions")).toBeHidden();
  await expect(page.locator("#fascicoloSheet")).toBeVisible();
});

test("usando il programma non parte nessuna richiesta fuori dal sito", async ({ page }) => {
  // Ollama è l'unica eccezione ammessa, e solo sul computer: il programma lo
  // interroga su 127.0.0.1:11434. Tutto il resto deve restare dentro il sito.
  const fuori = [];
  page.on("request", function (richiesta) {
    const url = richiesta.url();
    if (!/^https?:\/\//.test(url)) return;
    if (/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(url)) return;
    fuori.push(url);
  });

  for (const rotta of ["/index.html", "/index.html#/diario", "/index.html#/cerca", "/index.html#/relazione", "/index.html#/fascicolo", "/index.html#/licenze"]) {
    await page.goto(rotta);
    await expect(page.locator("#app")).toBeVisible();
  }

  expect(fuori, "richieste verso altri siti: " + fuori.join(", ")).toEqual([]);
});
