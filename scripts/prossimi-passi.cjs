#!/usr/bin/env node
/* ==========================================================================
   Psicologo Digitale · stato delle migliorie
   Licenza: MIT · Danilo D'Auria

   Le idee per il programma vivono in scripts/migliorie.json, non in una tabella
   che invecchia in fondo a un documento. Questo controllo le legge e verifica
   due regole:
   1. un'idea segnata «fatta» deve indicare un controllo che esiste davvero ed è
      eseguito da `npm test`: una promessa senza una prova diventa rossa qui;
   2. un'idea «aperta» deve dire perché: «non c'è tempo» non è un motivo, un
      vincolo sì.
   In più stampa l'elenco, così a ogni release si vede cosa resta senza rileggere
   tutto il documento di consegna.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(__dirname, "migliorie.json");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const catena = String((pkg.scripts && pkg.scripts.test) || "");

let elenco;
try {
  elenco = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.error("✗ migliorie: scripts/migliorie.json non si legge (" + e.message + ")");
  process.exit(1);
}
const idee = Array.isArray(elenco.idee) ? elenco.idee : [];
if (!idee.length) {
  console.error("✗ migliorie: l'elenco è vuoto");
  process.exit(1);
}

let problemi = 0;
const stati = { fatta: 0, aperta: 0 };

idee.forEach(function (idea) {
  const nome = idea.id || idea.titolo || "(senza nome)";
  if (!idea.titolo) {
    problemi++;
    console.error("  ✗ " + nome + ": manca il titolo");
    return;
  }
  if (idea.stato === "fatta") {
    stati.fatta++;
    if (!idea.controllo) {
      problemi++;
      console.error("  ✗ " + nome + ": è segnata fatta ma non dice quale controllo la tiene in piedi");
      return;
    }
    if (!fs.existsSync(path.join(root, idea.controllo))) {
      problemi++;
      console.error("  ✗ " + nome + ": il controllo " + idea.controllo + " non esiste");
      return;
    }
    // Non basta che il file esista: se non è nella catena di `npm test`, non
    // gira a ogni pubblicazione e non protegge niente.
    const dentro = catena.indexOf(idea.controllo) >= 0 ||
      (idea.controllo === "tests/dom-test.cjs" && catena.indexOf("tests/dom-test.cjs") >= 0);
    if (!dentro) {
      problemi++;
      console.error("  ✗ " + nome + ": il controllo " + idea.controllo + " esiste ma non è eseguito da npm test");
    }
  } else if (idea.stato === "aperta") {
    stati.aperta++;
    if (!String(idea.motivo || "").trim()) {
      problemi++;
      console.error("  ✗ " + nome + ": è aperta ma non dice perché");
    }
  } else {
    problemi++;
    console.error("  ✗ " + nome + ": stato sconosciuto («" + idea.stato + "»): vale «fatta» o «aperta»");
  }
});

if (problemi) {
  console.error("✗ migliorie: " + problemi + " problem" + (problemi === 1 ? "a" : "i"));
  process.exit(1);
}

console.log("✓ migliorie: " + stati.fatta + " fatte con un controllo, " + stati.aperta + " aperte con un motivo");
if (stati.aperta) {
  console.log("  Restano:");
  idee.filter(function (i) { return i.stato === "aperta"; }).forEach(function (i) {
    console.log("   · " + i.titolo);
  });
}
