/* ==========================================================================
   Psicologo Digitale · nutrizione e umore
   Licenza del codice: MIT · Danilo D'Auria
   ========================================================================== */

(function () {
  "use strict";

  const A = NP.app;
  const views = A.views;
  const esc = A.esc;

  views.nutrizione = function () {
    const N = NP.data.nutrizione;

    A.setTitle("Nutrizione e umore");

    A.page(
      '<div class="page-head"><p class="crumbs"><a href="#/">Pagina iniziale</a><span>›</span>Nutrizione</p>' +
        '<h1>Il cibo non cura l\'umore, ma lo accompagna</h1>' +
        '<p class="lead">' + esc(N.introduzione) + "</p></div>" +

      '<div class="callout warn"><p><strong>Prima di tutto.</strong> ' + esc(N.avviso) + "</p></div>" +

      '<div class="section-head mt-3"><p class="eyebrow">Cinque cose che contano</p><h2>Quello che le indicazioni italiane ripetono da anni</h2>' +
        '<p>Non sono novità, non sono scorciatoie e non promettono miracoli. Sono le basi su cui un professionista costruisce il resto.</p></div>' +
      '<div class="grid grid-2">' +
        N.principi.map(function (p, i) {
          return '<article class="card"><div class="card-icon">' + A.icon("heart") + "</div>" +
            '<p class="text-small muted" style="margin-bottom:.2rem">Punto ' + (i + 1) + "</p>" +
            "<h3>" + esc(p.t) + "</h3><p>" + esc(p.d) + "</p></article>";
        }).join("") +
      "</div>" +

      '<div class="card mt-2"><h2>' + esc(N.piatto.titolo) + "</h2>" +
        '<p class="text-small">' + esc(N.piatto.intro) + "</p>" +
        '<div class="mt-2">' +
          N.piatto.righe.map(function (r) {
            return '<div style="display:flex;gap:.8rem;flex-wrap:wrap;padding:.6rem 0;border-top:1px solid var(--line)">' +
              '<strong style="min-width:8rem">' + esc(r.parte) + "</strong>" +
              '<span class="text-small" style="flex:1;min-width:14rem">' + esc(r.cosa) + "</span></div>";
          }).join("") +
        "</div>" +
        '<p class="text-small muted mt-2">Un piatto così non è una cura e non è un esame: è un modo semplice per non dimenticare nessun gruppo di alimenti.</p>' +
      "</div>" +

      '<div class="section-head mt-3"><p class="eyebrow">La giornata</p><h2>Il ritmo, prima delle quantità</h2></div>' +
      '<div class="grid grid-2">' +
        N.ritmo.map(function (r) {
          return '<div class="card"><div class="card-icon">' + A.icon("clock") + "</div><h3>" + esc(r.t) + "</h3><p>" + esc(r.d) + "</p></div>";
        }).join("") +
      "</div>" +

      '<div class="callout info mt-3"><p><strong>Un esempio, non una prescrizione.</strong> Colazione con yogurt, fiocchi d\'avena e una mela; pranzo con pasta, ceci e verdure; cena con pesce, patate e insalata; acqua durante il giorno. Se una cosa non ti piace o non la digerisci, si cambia: il piano lo costruisce chi ti conosce, non una pagina web.</p></div>' +

      '<div class="section-head mt-3"><p class="eyebrow">Attenzione</p><h2>Quando il cibo smette di essere un piacere</h2>' +
        '<p>Questi segnali non sono «poca forza di volontà». Sono informazioni cliniche che meritano una persona competente, e prima si interviene meglio è.</p></div>' +
      '<div class="card"><ul class="list-check">' +
        N.segnali.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
      "</ul></div>" +
      '<div class="callout danger mt-2"><p>' + esc(N.segnaliNota) + "</p>" +
        '<div class="btn-row mt-1"><a class="btn btn-ghost btn-sm" href="#/sicurezza">Numeri utili</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/neura">Parla con Neura</a></div></div>' +

      '<div class="section-head mt-3"><p class="eyebrow">Le persone giuste</p><h2>Chi fa che cosa</h2>' +
        '<p>In Italia queste figure hanno percorsi diversi, e la differenza conta: chi ti prescrive una dieta non è sempre chi può prescriverti un esame o un farmaco.</p></div>' +
      '<div class="grid grid-2">' +
        N.professionisti.map(function (p) {
          return '<article class="card"><div class="btn-row" style="justify-content:space-between"><h3 style="margin:0">' + esc(p.ruolo) + "</h3>" +
            '<span class="chip chip-static">Professionista</span></div>' +
            '<p class="text-small mt-1"><strong>Chi è.</strong> ' + esc(p.chi) + "</p>" +
            '<p class="text-small"><strong>Cosa fa.</strong> ' + esc(p.cosa) + "</p>" +
            '<p class="text-small"><strong>Quando.</strong> ' + esc(p.quando) + "</p></article>";
        }).join("") +
      "</div>" +

      '<div class="card mt-2"><h3>Le domande da portare al primo incontro</h3>' +
        '<ul class="list-check">' + N.domande.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + "</ul>" +
        '<p class="text-small muted mt-2">Puoi annotarle nel diario e stampare la relazione: arrivare con domande precise rende il primo incontro più utile per entrambi.</p>' +
        '<div class="btn-row mt-1"><a class="btn btn-soft btn-sm" href="#/diario">Apri il diario</a>' +
        '<a class="btn btn-ghost btn-sm" href="#/relazione">Relazione per il professionista</a></div></div>' +

      '<div class="card mt-2"><h3>Che cosa questa sezione non fa</h3><ul class="text-small">' +
        N.limiti.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") +
      "</ul></div>" +

      '<div class="card mt-2"><h3>Fonti</h3><div class="pill-row">' +
        N.fonti.map(function (f) { return '<a class="chip" href="' + f.u + '" target="_blank" rel="noopener">' + esc(f.t) + "</a>"; }).join("") +
      "</div>" +
      '<p class="text-small muted mt-2">Le indicazioni sono divulgative e generali: non tengono conto di allergie, intolleranze, patologie, farmaci, gravidanza o allattamento.</p></div>'
    );
  };
})();
