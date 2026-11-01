#!/usr/bin/env python3
# =============================================================================
#  Psicologo Digitale · genera il Vademecum in PDF
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Produce tre file in assets/pdf/:
#    vademecum-psicologo-digitale.pdf             A5, lettura su schermo
#    vademecum-psicologo-digitale-a4.pdf          A4, stampa domestica
#    vademecum-psicologo-digitale-libricino-a4.pdf  A4 orizzontale, gia imposto
#
#  Uso:
#    node scripts/export-data.cjs
#    .venv/bin/python scripts/build_vademecum.py
# =============================================================================

import json
import os
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4, A5, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATI = os.path.join(BASE, "assets", "data", "vademecum.json")
USCITA = os.path.join(BASE, "assets", "pdf")

INDACO = colors.HexColor("#22345c")
ACCENTO = colors.HexColor("#4f6b8f")
GRIGIO = colors.HexColor("#5b6472")
CARTA = colors.HexColor("#f4f2ec")
LINEA = colors.HexColor("#d9d4c6")


def carica():
    with open(DATI, "r", encoding="utf-8") as fh:
        return json.load(fh)


class Guida(BaseDocTemplate):
    """Documento con indice automatico e piè di pagina numerato."""

    def __init__(self, path, formato="a5", **kw):
        if formato == "a5":
            self.pagesize = A5
            self.margine = 14 * mm
            self.corpo = 8.7
            self.h1 = 15
            self.h2 = 10.5
        else:
            self.pagesize = A4
            self.margine = 20 * mm
            self.corpo = 10.2
            self.h1 = 19
            self.h2 = 12.5

        BaseDocTemplate.__init__(
            self,
            path,
            pagesize=self.pagesize,
            leftMargin=self.margine,
            rightMargin=self.margine,
            topMargin=self.margine + 6 * mm,
            bottomMargin=self.margine + 8 * mm,
            title=kw.get("titolo", "Vademecum · Psicologo Digitale"),
            author="Danilo D'Auria",
            subject=kw.get("soggetto", "Guida tascabile alla stanza d'ascolto"),
            keywords="psicologia, autovalutazione, PWA, vademecum, FeniceOS, versione=" + kw.get("versione", ""),
        )
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="corpo",
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates([PageTemplate(id="pagina", frames=[frame], onPage=self.decoro)])
        self.versione = kw.get("versione", "")
        self.etichetta = kw.get("etichetta", "Vademecum")

    def decoro(self, canvas, doc):
        larghezza, altezza = self.pagesize
        canvas.saveState()
        canvas.setFillColor(CARTA)
        canvas.rect(0, 0, larghezza, altezza, stroke=0, fill=1)
        canvas.setStrokeColor(INDACO)
        canvas.setLineWidth(1.1)
        canvas.line(self.margine, altezza - self.margine + 2 * mm, larghezza - self.margine, altezza - self.margine + 2 * mm)
        canvas.setFont("Helvetica", 6.6)
        canvas.setFillColor(GRIGIO)
        canvas.drawString(self.margine, altezza - self.margine + 4.2 * mm, "PSICOLOGO DIGITALE · LA STANZA D'ASCOLTO")
        if doc.page > 1:
            canvas.drawRightString(
                larghezza - self.margine, altezza - self.margine + 4.2 * mm, self.etichetta + " · versione " + self.versione
            )
            canvas.drawCentredString(larghezza / 2, self.margine - 3 * mm, str(doc.page))
        canvas.restoreState()

    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "Capitolo":
            testo = flowable.getPlainText()
            self.notify("TOCEntry", (0, testo, self.page))
            chiave = "cap-" + str(abs(hash(testo)))
            self.canv.bookmarkPage(chiave)
            self.canv.addOutlineEntry(testo, chiave, 0, 0)


def stili(doc):
    return {
        "copertina": ParagraphStyle(
            "Copertina", fontName="Helvetica-Bold", fontSize=30 if doc.pagesize == A5 else 42,
            leading=34 if doc.pagesize == A5 else 46, textColor=INDACO, spaceAfter=2 * mm,
        ),
        "sottotitolo": ParagraphStyle(
            "Sottotitolo", fontName="Helvetica", fontSize=11 if doc.pagesize == A5 else 15,
            leading=15 if doc.pagesize == A5 else 20, textColor=ACCENTO, spaceAfter=4 * mm,
        ),
        "occhiello": ParagraphStyle(
            "Occhiello", fontName="Helvetica-Bold", fontSize=7.4, leading=10, textColor=ACCENTO,
            spaceBefore=2 * mm, spaceAfter=1.2 * mm,
        ),
        "Capitolo": ParagraphStyle(
            "Capitolo", fontName="Helvetica-Bold", fontSize=doc.h1, leading=doc.h1 * 1.15,
            textColor=INDACO, spaceBefore=5 * mm, spaceAfter=2.4 * mm,
        ),
        "Sezione": ParagraphStyle(
            "Sezione", fontName="Helvetica-Bold", fontSize=doc.h2, leading=doc.h2 * 1.2,
            textColor=INDACO, spaceBefore=3.4 * mm, spaceAfter=1.2 * mm,
        ),
        "Corpo": ParagraphStyle(
            "Corpo", fontName="Helvetica", fontSize=doc.corpo, leading=doc.corpo * 1.52,
            textColor=colors.HexColor("#1e2430"), alignment=TA_JUSTIFY, spaceAfter=2 * mm,
        ),
        "Elenco": ParagraphStyle(
            "Elenco", fontName="Helvetica", fontSize=doc.corpo, leading=doc.corpo * 1.5,
            textColor=colors.HexColor("#1e2430"), leftIndent=4.5 * mm, bulletIndent=0.6 * mm,
            spaceAfter=1.3 * mm,
        ),
        "Piccolo": ParagraphStyle(
            "Piccolo", fontName="Helvetica", fontSize=doc.corpo - 1.3, leading=(doc.corpo - 1.3) * 1.45,
            textColor=GRIGIO, spaceAfter=1.4 * mm,
        ),
        "Cella": ParagraphStyle(
            "Cella", fontName="Helvetica", fontSize=doc.corpo - 1.1, leading=(doc.corpo - 1.1) * 1.32,
            textColor=colors.HexColor("#1e2430"),
        ),
        "CellaTesta": ParagraphStyle(
            "CellaTesta", fontName="Helvetica-Bold", fontSize=doc.corpo - 1.1,
            leading=(doc.corpo - 1.1) * 1.32, textColor=colors.white,
        ),
        "Avviso": ParagraphStyle(
            "Avviso", fontName="Helvetica", fontSize=doc.corpo, leading=doc.corpo * 1.5,
            textColor=colors.HexColor("#6a2b26"),
        ),
    }


def tabella(righe, colonne, st, doc, larghezze=None):
    testa = [Paragraph(h, st["CellaTesta"]) for h in colonne]
    corpo = [[Paragraph(str(c), st["Cella"]) for c in r] for r in righe]
    t = Table([testa] + corpo, colWidths=larghezze, repeatRows=1, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INDACO),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3.2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.6),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7f5ee")]),
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINEA),
            ]
        )
    )
    return t


def riquadro(testo, st, doc, colore=colors.HexColor("#fdf3ef"), bordo=colors.HexColor("#c4713a")):
    t = Table([[Paragraph(testo, st["Avviso"])]], colWidths=[doc.width])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colore),
                ("BOX", (0, 0), (-1, -1), 0.6, bordo),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return t


def costruisci(percorso, formato, d):
    doc = Guida(percorso, formato=formato, versione=d["versione"])
    st = stili(doc)
    c = d["counts"]
    nut = d["nutrizione"]

    storia = []

    # ---------------------------------------------------------------- Copertina
    storia += [
        Spacer(1, 10 * mm),
        Paragraph("VADEMECUM", st["occhiello"]),
        Paragraph("Psicologo<br/>Digitale", st["copertina"]),
        Paragraph("La stanza d'ascolto · guida tascabile", st["sottotitolo"]),
        Spacer(1, 3 * mm),
        Paragraph(
            "Colloquio preliminare con Neura, " + str(c["scale"]) + " questionari di autovalutazione, "
            "percorso in " + str(c["moduli"]) + " tappe, " + str(c["esercizi"]) + " esercizi guidati e relazione "
            "per il professionista. Anche senza connessione, senza account e senza che nulla esca dal dispositivo.",
            st["Corpo"],
        ),
        Spacer(1, 4 * mm),
        Paragraph(
            "Ideato, scritto e sviluppato da <b>Danilo D'Auria</b><br/>un progetto <b>FeniceOS</b>",
            st["Piccolo"],
        ),
        Paragraph(
            "Versione " + d["versione"] + " · " + d["url"] + "<br/>Codice MIT · Contenuti CC BY-NC-SA 4.0",
            st["Piccolo"],
        ),
        Spacer(1, 6 * mm),
        riquadro(
            "<b>Questo programma è educativo e di orientamento.</b> Non formula diagnosi, non prescrive terapie e non "
            "sostituisce uno psicologo, uno psicoterapeuta o un medico. In caso di emergenza chiama il <b>112</b>.",
            st, doc,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------------------- Indice
    indice = TableOfContents()
    indice.levelStyles = [
        ParagraphStyle(
            "IndiceVoce", fontName="Helvetica", fontSize=doc.corpo + 0.4, leading=(doc.corpo + 0.4) * 2.1,
            textColor=colors.HexColor("#1e2430"), leftIndent=0,
        )
    ]
    storia += [
        Paragraph("Indice", st["Sezione"]),
        Paragraph(
            "Le pagine che seguono sono pensate per essere stampate e tenute accanto al computer, oppure lette sul "
            "telefono. Ogni sezione si chiude con quello che conviene portare a un professionista.",
            st["Piccolo"],
        ),
        Spacer(1, 3 * mm),
        indice,
        PageBreak(),
    ]

    # ------------------------------------------------------------- Che cos'è
    storia += [
        Paragraph("Che cos'è e che cosa non è", st["Capitolo"]),
        Paragraph(
            "Psicologo Digitale è una <b>pre-analisi guidata</b>: serve a mettere in ordine ciò che senti prima di "
            "parlarne con qualcuno, a misurare l'intensità di alcune aree e ad arrivare al primo colloquio con parole "
            "più precise. Non è una terapia, non è una diagnosi e non è un test psicologico validato.",
            st["Corpo"],
        ),
        Paragraph("Che cosa fa", st["Sezione"]),
        Paragraph("• conduce un colloquio adattivo in " + str(c["fasi"]) + " fasi (" + str(c["domande"]) + " domande possibili);", st["Elenco"]),
        Paragraph("• propone " + str(c["scale"]) + " questionari di autovalutazione con punteggi, fasce e lettura clinica;", st["Elenco"]),
        Paragraph("• organizza un percorso in " + str(c["moduli"]) + " tappe con " + str(c["esercizi"]) + " esercizi guidati;", st["Elenco"]),
        Paragraph("• genera una relazione PDF da consegnare a chi può valutare davvero.", st["Elenco"]),
        Paragraph("Che cosa non fa", st["Sezione"]),
        Paragraph("• non formula diagnosi e non sostituisce un professionista;", st["Elenco"]),
        Paragraph("• non prescrive farmaci, dosi o terapie;", st["Elenco"]),
        Paragraph("• non gestisce emergenze: per quelle c'è il 112;", st["Elenco"]),
        Paragraph("• non invia nulla in rete: i dati restano nel browser del dispositivo.", st["Elenco"]),
        Spacer(1, 2 * mm),
        riquadro(
            "<b>Una regola semplice.</b> Se ti accorgi di usare il programma per rimandare la telefonata a uno "
            "psicologo, hai già la risposta: quella telefonata è il passo successivo.",
            st, doc,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------------- Dieci minuti
    storia += [
        Paragraph("In dieci minuti", st["Capitolo"]),
        Paragraph(
            "Non serve completare tutto. Il modo più utile per iniziare è questo, e si può interrompere in qualsiasi "
            "momento: le risposte restano salvate sul dispositivo.",
            st["Corpo"],
        ),
        Paragraph("1. Leggi l'avvertenza e dai il consenso.", st["Elenco"]),
        Paragraph("2. Fai il colloquio: rispondi di getto, senza cercare la risposta «giusta».", st["Elenco"]),
        Paragraph("3. Compila uno o due questionari, quelli che riguardano l'area che ti pesa di più.", st["Elenco"]),
        Paragraph("4. Guarda il quadro che emerge: aree, intensità, segnali da non ignorare.", st["Elenco"]),
        Paragraph("5. Genera la relazione e portala con te, oppure scegli una tappa del percorso.", st["Elenco"]),
        Spacer(1, 3 * mm),
        Paragraph("Il colloquio, in pratica", st["Sezione"]),
        Paragraph(
            "Le fasi sono " + str(c["fasi"]) + " e seguono un ordine preciso: prima si accoglie, poi si esplora il "
            "motivo, poi si approfondisce per area, si ricostruisce la storia, si guarda il funzionamento quotidiano, "
            "si controlla la sicurezza, si cercano le risorse e infine si restituisce una sintesi. Se una domanda "
            "ti mette a disagio, puoi saltarla: non è un esame.",
            st["Corpo"],
        ),
    ]
    if d["fasi"]:
        storia.append(
            tabella(
                [[str(i + 1), f["titolo"]] for i, f in enumerate(d["fasi"])],
                ["Fase", "Che cosa esplora"],
                st, doc, larghezze=[doc.width * 0.14, doc.width * 0.86],
            )
        )
    storia.append(PageBreak())

    # --------------------------------------------------------------- Questionari
    storia += [
        Paragraph("I questionari", st["Capitolo"]),
        Paragraph(
            "Sono indicatori di intensità, non strumenti diagnostici: non hanno valore di test psicometrico "
            "validato e non definiscono chi sei. Servono a capire quanto un'area pesa, nelle ultime due settimane, "
            "e a dare al professionista un punto di partenza concreto.",
            st["Corpo"],
        ),
        tabella(
            [[s["titolo"], str(s["item"]), str(s["max"])] for s in d["scales"]],
            ["Questionario", "Item", "Punteggio max"],
            st, doc, larghezze=[doc.width * 0.6, doc.width * 0.16, doc.width * 0.24],
        ),
        Spacer(1, 3 * mm),
        Paragraph("A che cosa serve ciascuno", st["Sezione"]),
    ]
    for s in d["scales"]:
        storia.append(Paragraph("<b>" + s["titolo"] + ".</b> " + s["perche"], st["Elenco"]))
    storia += [
        Spacer(1, 2 * mm),
        riquadro(
            "<b>Attenzione.</b> Se un questionario contiene una domanda sui pensieri di morte e la risposta è "
            "affermativa, il programma mostra subito i numeri utili. Non è un eccesso di prudenza: è la parte più "
            "importante di tutto il percorso.",
            st, doc,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------------------ Percorso
    storia += [
        Paragraph("Il percorso in " + str(c["moduli"]) + " tappe", st["Capitolo"]),
        Paragraph(
            "Circa sedici settimane, con una pratica settimanale e un indicatore per capire se sta funzionando. "
            "Non è obbligatorio seguirlo in ordine: scegli la tappa che corrisponde al tuo momento.",
            st["Corpo"],
        ),
        tabella(
            [[str(m["n"]), m["titolo"], m["obiettivo"]] for m in d["moduli"]],
            ["Tappa", "Titolo", "Obiettivo"],
            st, doc, larghezze=[doc.width * 0.1, doc.width * 0.3, doc.width * 0.6],
        ),
        Spacer(1, 3 * mm),
        Paragraph("Gli esercizi", st["Sezione"]),
        Paragraph(
            "Sono pratiche brevi, da fare quando servono e non per dovere. Se un esercizio ti fa stare peggio, "
            "smetti e parlane con il professionista: anche le tecniche hanno controindicazioni.",
            st["Corpo"],
        ),
        tabella(
            [[e["titolo"], e["durata"], e["quando"]] for e in d["esercizi"]],
            ["Esercizio", "Durata", "Quando"],
            st, doc, larghezze=[doc.width * 0.34, doc.width * 0.16, doc.width * 0.5],
        ),
        PageBreak(),
    ]

    # -------------------------------------------------------------- Sicurezza
    sic = d["sicurezza"]
    storia += [
        Paragraph("Segnali d'allarme e numeri utili", st["Capitolo"]),
        Paragraph(sic["introduzione"], st["Corpo"]),
        Paragraph("Segnali da non ignorare", st["Sezione"]),
    ]
    for s in sic["segnali"]:
        storia.append(Paragraph("• " + s, st["Elenco"]))
    storia += [Spacer(1, 2 * mm), Paragraph("Cosa fare subito", st["Sezione"])]
    for i, s in enumerate(sic["cosaFare"]):
        storia.append(Paragraph(str(i + 1) + ". " + s, st["Elenco"]))
    storia += [
        Spacer(1, 3 * mm),
        tabella(
            [[n["numero"], n["nome"], n["nota"]] for n in sic["numeri"]],
            ["Numero", "Servizio", "A che cosa serve"],
            st, doc, larghezze=[doc.width * 0.18, doc.width * 0.3, doc.width * 0.52],
        ),
        Spacer(1, 2 * mm),
        riquadro(
            "<b>In pericolo immediato: 112.</b> Non serve avere le parole giuste e non serve aspettare. Se il rischio "
            "riguarda un'altra persona, non lasciarla sola e aiutala a chiamare.",
            st, doc,
        ),
        PageBreak(),
    ]

    # -------------------------------------------------------------- Nutrizione
    storia += [
        Paragraph("Nutrizione e umore", st["Capitolo"]),
        Paragraph(nut["introduzione"], st["Corpo"]),
        Paragraph("Cinque cose che contano", st["Sezione"]),
    ]
    for p in nut["principi"]:
        storia.append(Paragraph("<b>" + p["t"] + ".</b> " + p["d"], st["Elenco"]))
    storia += [Spacer(1, 2 * mm), Paragraph("Chi consultare", st["Sezione"])]
    storia.append(
        tabella(
            [[p["ruolo"], p["quando"]] for p in nut["professionisti"]],
            ["Figura", "Quando serve"],
            st, doc, larghezze=[doc.width * 0.3, doc.width * 0.7],
        )
    )
    storia += [Spacer(1, 3 * mm), Paragraph("Quando non aspettare", st["Sezione"])]
    for s in nut["segnali"][:6]:
        storia.append(Paragraph("• " + s, st["Elenco"]))
    storia += [
        Spacer(1, 2 * mm),
        riquadro("<b>" + nut["segnaliNota"] + "</b>", st, doc),
        PageBreak(),
    ]

    # ---------------------------------------------------------------- Installa
    storia += [
        Paragraph("Installala e usala offline", st["Capitolo"]),
        Paragraph(
            "Non c'è un negozio di applicazioni e non serve: è una PWA e si installa dal browser in pochi secondi. "
            "Dopo la prima apertura funziona anche senza connessione.",
            st["Corpo"],
        ),
        Paragraph("Android (Chrome)", st["Sezione"]),
        Paragraph("Menu ⋮ in alto a destra → <b>Installa app</b> (su alcuni telefoni <b>Aggiungi alla schermata Home</b>).", st["Corpo"]),
        Paragraph("iPhone e iPad (Safari)", st["Sezione"]),
        Paragraph("Tocca <b>Condividi</b>, scorri e scegli <b>Aggiungi alla schermata Home</b>.", st["Corpo"]),
        Paragraph("Computer (Chrome o Edge)", st["Sezione"]),
        Paragraph(
            "L'icona di installazione compare nella barra degli indirizzi; in alternativa menu ⋮ → <b>App</b> → "
            "<b>Installa questo sito come app</b>. Su Safari per Mac: <b>File</b> → <b>Aggiungi al Dock</b>.",
            st["Corpo"],
        ),
        Paragraph("La barra in alto", st["Sezione"]),
        Paragraph(
            "Sotto l'intestazione c'è una barra sempre visibile: dice se stai usando il browser, la PWA "
            "installata o il programma per computer, se Ollama risponde, se il microfono è pronto e come "
            "attivarlo, e offre <b>Ferma l'audio</b> e <b>Indietro</b>. In fondo alla barra, <b>Aiuto subito</b> "
            "mostra 112, 1522 e Telefono Azzurro: sono a un tocco da qualsiasi pagina.",
            st["Corpo"],
        ),
        Paragraph("Un modello locale, se ti va", st["Sezione"]),
        Paragraph(
            "Neura funziona da sola. Se vuoi anche un modello generativo sul tuo computer puoi installare "
            "<b>Ollama</b>, gratuito e open source: la pagina <i>Installa</i> riconosce sistema e memoria, propone il "
            "pacchetto giusto e il modello adatto, e verifica il collegamento locale. Resta un extra: Neura non lo usa "
            "e le risposte verificate restano le sue.",
            st["Corpo"],
        ),
        tabella(
            [[m["id"], m["peso"], "almeno " + str(m["ramMin"]) + " GB"] for m in d["ai"]["modelli"]],
            ["Modello", "Spazio", "Memoria"],
            st, doc, larghezze=[doc.width * 0.46, doc.width * 0.27, doc.width * 0.27],
        ),
        PageBreak(),
    ]

    # --------------------------------------------------------- Privacy e licenze
    storia += [
        Paragraph("Privacy, backup, licenze", st["Capitolo"]),
        Paragraph(
            "Non c'è un account e non c'è un server. Risposte, questionari, diario e relazione restano nel "
            "<i>localStorage</i> del browser, su quel dispositivo. Nessuna telemetria, nessuna pubblicità, nessun "
            "dato inviato a terzi.",
            st["Corpo"],
        ),
        Paragraph("Che cosa sapere", st["Sezione"]),
        Paragraph("• se cancelli i dati del browser, i dati spariscono: esporta un backup JSON dalla sezione Licenze;", st["Elenco"]),
        Paragraph("• la relazione PDF viene generata sul dispositivo e condividerla dipende solo da te;", st["Elenco"]),
        Paragraph("• i dati sono sensibili: conserva il backup in un luogo protetto, non in una cartella condivisa.", st["Elenco"]),
        Paragraph("Licenze", st["Sezione"]),
        Paragraph(
            "Codice con licenza <b>MIT</b>. Contenuti, testi, questionari, esercizi e grafica con licenza "
            "<b>Creative Commons BY-NC-SA 4.0</b>: attribuzione, non commerciale, stessa licenza. "
            "«Psicologo Digitale» e «Neura» sono di Danilo D'Auria, un progetto FeniceOS.",
            st["Corpo"],
        ),
        Paragraph("Fonti principali", st["Sezione"]),
    ]
    for f in d["fonti"]:
        storia.append(Paragraph("• " + f["t"] + " — " + f["u"], st["Piccolo"]))
    storia += [
        Spacer(1, 3 * mm),
        Paragraph("Da portare al professionista", st["Capitolo"]),
        Paragraph("• la relazione PDF stampata, con punteggi e aree emerse;", st["Elenco"]),
        Paragraph("• le date e i momenti in cui il problema si è fatto sentire di più;", st["Elenco"]),
        Paragraph("• i farmaci che prendi e le sostanze che usi, senza vergogna;", st["Elenco"]),
        Paragraph("• le domande che ti sei scritto, anche quelle che sembrano banali;", st["Elenco"]),
        Paragraph("• una persona di fiducia, se ti aiuta non andare da solo.", st["Elenco"]),
        Spacer(1, 4 * mm),
        Paragraph(
            "Vademecum di Psicologo Digitale · versione " + d["versione"] + " · " + d["repo"] +
            "<br/>Stampato o letto, questo opuscolo non sostituisce una valutazione professionale.",
            st["Piccolo"],
        ),
    ]

    doc.multiBuild(storia)
    return doc.page


def imponi_libricino(origine, destinazione, versione=""):
    """Dispone le pagine A5 su fogli A4 orizzontali, pronte per la stampa fronte-retro."""
    import pymupdf

    src = pymupdf.open(origine)
    pagine = src.page_count
    while pagine % 4:
        src.new_page(width=src[0].rect.width, height=src[0].rect.height)
        pagine += 1

    out = pymupdf.open()
    larghezza, altezza = landscape(A4)
    meta = pymupdf.Rect(0, 0, larghezza / 2, altezza)

    for foglio in range(pagine // 4):
        fronte = [pagine - 2 * foglio, 1 + 2 * foglio]
        retro = [2 + 2 * foglio, pagine - 1 - 2 * foglio]

        for coppia in (fronte, retro):
            pagina = out.new_page(width=larghezza, height=altezza)
            for indice, numero in enumerate(coppia):
                if 1 <= numero <= pagine:
                    riquadro = pymupdf.Rect(
                        indice * larghezza / 2, 0, (indice + 1) * larghezza / 2, altezza
                    )
                    pagina.show_pdf_page(riquadro, src, numero - 1)

            cx = larghezza / 2
            for x in (cx - 6, cx + 6):
                pagina.draw_line((x, 8), (x, altezza - 8), color=(0.72, 0.69, 0.62), width=0.4)

    # L'imposizione crea un documento nuovo: i metadati vanno riscritti, se no
    # il libricino perde la versione del programma.
    out.set_metadata({
        "title": "Vademecum \u00b7 Psicologo Digitale",
        "author": "Danilo D'Auria",
        "subject": "Guida tascabile alla stanza d'ascolto",
        "keywords": "psicologia, autovalutazione, PWA, vademecum, FeniceOS, versione=" + versione,
    })
    out.save(destinazione, deflate=True, garbage=3)
    out.close()
    src.close()
    return pagine


def main():
    if not os.path.exists(DATI):
        sys.exit("Manca assets/data/vademecum.json: esegui prima `node scripts/export-data.cjs`.")
    d = carica()
    os.makedirs(USCITA, exist_ok=True)

    a5 = os.path.join(USCITA, "vademecum-psicologo-digitale.pdf")
    a4 = os.path.join(USCITA, "vademecum-psicologo-digitale-a4.pdf")
    libretto = os.path.join(USCITA, "vademecum-psicologo-digitale-libricino-a4.pdf")

    pagine_a5 = costruisci(a5, "a5", d)
    pagine_a4 = costruisci(a4, "a4", d)
    totale = imponi_libricino(a5, libretto, d["versione"])

    for percorso, pagine in ((a5, pagine_a5), (a4, pagine_a4)):
        peso = os.path.getsize(percorso) / 1024
        print("%-58s %3d pagine  %6.1f KB" % (os.path.basename(percorso), pagine, peso))
    peso = os.path.getsize(libretto) / 1024
    print("%-58s %3d fogli (%d facciate)  %6.1f KB" % (os.path.basename(libretto), totale // 4, totale // 2, peso))


if __name__ == "__main__":
    main()
