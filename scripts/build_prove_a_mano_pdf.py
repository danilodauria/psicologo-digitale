#!/usr/bin/env python3
# =============================================================================
#  Psicologo Digitale · genera il foglio «Prove a mano» in PDF
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Produce assets/pdf/Psicologo-Digitale-Prove-a-mano.pdf
#
#  Il testo non è scritto qui: si legge PROVE-A-MANO-<versione>.md e si
#  impagina su A4, con la stessa testata e lo stesso piè di pagina degli altri
#  fogli. Il markdown resta l'unico posto dove le prove si scrivono, così il
#  foglio da stampare e quello che si legge nel repository non possono
#  raccontare due cose diverse.
#
#  Il file di partenza è il più recente per versione: quando una release porta
#  un nuovo PROVE-A-MANO-X.Y.Z.md, si rigenera e il PDF lo segue senza toccare
#  questo script.
#
#  Uso:
#    .venv/bin/python scripts/build_prove_a_mano_pdf.py
# =============================================================================

import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from reportlab.lib import colors  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402
from reportlab.lib.styles import ParagraphStyle  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle  # noqa: E402

from build_come_installare_pdf import (  # noqa: E402
    BASE,
    CARTA,
    GRIGIO,
    INDACO,
    LINEA,
    Foglio,
    riquadro,
    stili,
    versione,
)

USCITA = os.path.join(BASE, "assets", "pdf", "Psicologo-Digitale-Prove-a-mano.pdf")
DISPONIBILE = A4[0] - 36 * mm

# Caratteri che Helvetica non ha. La casella da spuntare si disegna, il resto
# si sostituisce con qualcosa che si legge: sul foglio un quadratino vuoto al
# posto di una freccia non aiuta nessuno.
SOSTITUZIONI = {
    "\u2192": "->",
    "\u2212": "\u2013",
    "\u2026": "...",
}

RIGA_TABELLA = re.compile(r"^\s*\|.*\|\s*$")
SEPARATORE = re.compile(r"^\s*\|(\s*:?-{2,}:?\s*\|)+\s*$")
ELENCO_PUNTI = re.compile(r"^(\s*)[-*]\s+(.*)$")
ELENCO_NUMERI = re.compile(r"^(\s*)\d+[.)]\s+(.*)$")


def sorgente():
    """Il foglio delle prove più recente, per versione."""
    fogli = glob.glob(os.path.join(BASE, "PROVE-A-MANO-*.md"))

    def chiave(percorso):
        numeri = re.findall(r"\d+", os.path.basename(percorso))
        return tuple(int(n) for n in numeri)

    if not fogli:
        raise SystemExit("Nessun PROVE-A-MANO-*.md nella radice del progetto.")
    return max(fogli, key=chiave)


def inline(testo):
    """Grassetto, corsivo, codice e collegamenti del markdown, per reportlab."""
    for da, a in SOSTITUZIONI.items():
        testo = testo.replace(da, a)
    testo = testo.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    def codice(m):
        return '<font face="Courier" size="8.6">' + m.group(1) + "</font>"

    testo = re.sub(r"`([^`]+)`", codice, testo)

    def link(m):
        return '<link href="%s" color="#22345c">%s</link>' % (m.group(2), m.group(1))

    testo = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", link, testo)

    def auto(m):
        return '<link href="%s" color="#22345c">%s</link>' % (m.group(1), m.group(1))

    # Dopo l'escape l'autolink <https://…> è diventato &lt;https://…&gt;.
    testo = re.sub(r"&lt;(https?://[^\s&]+)&gt;", auto, testo)
    testo = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", testo)
    testo = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<i>\1</i>", testo)
    return testo


def casella():
    """La casella da spuntare a penna: un quadrato disegnato, non un carattere."""
    quadrato = Table([[""]], colWidths=[8.6], rowHeights=[8.6])
    quadrato.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.7, GRIGIO),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return quadrato


def stili_prove():
    s = stili()
    s["th"] = ParagraphStyle(
        "th", fontName="Helvetica-Bold", fontSize=8.6, leading=11, textColor=INDACO
    )
    s["cella"] = ParagraphStyle("cella", fontName="Helvetica", fontSize=8.5, leading=9.0)
    # Il foglio è cresciuto con le prove, non con l'aria fra i paragrafi: le
    # sezioni restano staccate, ma senza lasciare una pagina quasi vuota in coda.
    s["h2"] = ParagraphStyle("h2", parent=s["h2"], spaceBefore=4, spaceAfter=3)
    s["p"] = ParagraphStyle("p", parent=s["p"], leading=12.4, spaceAfter=2)
    return s


def tabella(righe, s):
    """Le tabelle del markdown diventano tabelle vere, con l'intestazione ripetuta."""
    intestazione = righe[0]
    colonne = len(intestazione)
    larghezze = [11 * mm]
    resto = DISPONIBILE - larghezze[0]
    if colonne == 3:
        larghezze += [resto * 0.34, resto * 0.66]
    else:
        larghezze += [resto / (colonne - 1)] * (colonne - 1)

    dati = [[Paragraph("Fatto", s["th"])] + [Paragraph(inline(c), s["th"]) for c in intestazione[1:]]]
    for riga in righe[1:]:
        riga = riga + [""] * (colonne - len(riga))
        prima = casella() if riga[0].strip() in ("\u2610", "\u2611") else Paragraph(inline(riga[0]), s["cella"])
        dati.append([prima] + [Paragraph(inline(c), s["cella"]) for c in riga[1:]])

    foglio = Table(dati, colWidths=larghezze, repeatRows=1)
    foglio.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), CARTA),
                ("GRID", (0, 0), (-1, -1), 0.4, LINEA),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 0.8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0.8),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#fbfaf7")]),
            ]
        )
    )
    return foglio


def impagina(markdown, s):
    """Dal markdown alla lista di elementi che reportlab sa disporre."""
    elementi = []
    paragrafo = []
    citazione = []
    tabella_righe = []
    elenco = []
    contatori = {}

    def chiudi_paragrafo():
        nonlocal paragrafo
        if paragrafo:
            testo = " ".join(paragrafo).strip()
            if testo:
                elementi.append(Paragraph(inline(testo), s["p"]))
            paragrafo = []

    def chiudi_citazione():
        nonlocal citazione
        if citazione:
            testo = " ".join(citazione).strip()
            if testo:
                elementi.append(riquadro([Paragraph(inline(testo), s["p_small"])], CARTA, s))
                elementi.append(Spacer(1, 4))
            citazione = []

    def chiudi_tabella():
        nonlocal tabella_righe
        if tabella_righe:
            elementi.append(tabella(tabella_righe, s))
            elementi.append(Spacer(1, 4))
            tabella_righe = []

    def chiudi_elenco():
        nonlocal elenco, contatori
        for tipo, livello, testo in elenco:
            rientro = 11 + livello * 11
            if tipo == "testo":
                # Il seguito di una voce, rientrato: resta dentro l'elenco, così
                # la numerazione dopo di lui non riparte da uno.
                stile = ParagraphStyle(
                    "seguito%d" % livello,
                    parent=s["p"],
                    leftIndent=rientro,
                    spaceBefore=3,
                    spaceAfter=3,
                )
                elementi.append(Paragraph(inline(testo), stile))
                continue
            if tipo == "numero":
                contatori[livello] = contatori.get(livello, 0) + 1
                punto = "%d." % contatori[livello]
            else:
                punto = "\u2022"
            stile = ParagraphStyle(
                "voce%d" % livello,
                parent=s["li"],
                leftIndent=rientro,
                bulletIndent=rientro - 9,
            )
            elementi.append(Paragraph(inline(testo), stile, bulletText=punto))
        if elenco:
            elementi.append(Spacer(1, 5))
        elenco = []
        contatori = {}

    def chiudi_tutto():
        chiudi_paragrafo()
        chiudi_citazione()
        chiudi_tabella()
        chiudi_elenco()

    for riga in markdown.splitlines():
        spoglia = riga.strip()

        if not spoglia:
            # Una riga vuota chiude il paragrafo ma non l'elenco: fra una voce e
            # l'altra il markdown respira, e la numerazione non deve ripartire.
            chiudi_paragrafo()
            chiudi_citazione()
            continue

        if RIGA_TABELLA.match(riga):
            chiudi_paragrafo()
            chiudi_citazione()
            chiudi_elenco()
            if SEPARATORE.match(riga):
                continue
            tabella_righe.append([c.strip() for c in spoglia.strip("|").split("|")])
            continue
        chiudi_tabella()

        if spoglia.startswith("# "):
            chiudi_tutto()
            elementi.append(Paragraph(inline(spoglia[2:]), s["h1"]))
            elementi.append(Spacer(1, 2))
            continue
        if spoglia.startswith("## "):
            chiudi_tutto()
            elementi.append(Paragraph(inline(spoglia[3:]), s["h2"]))
            continue
        if spoglia.startswith("### "):
            chiudi_tutto()
            elementi.append(Paragraph(inline(spoglia[4:]), s["h3"]))
            continue
        if spoglia.startswith(">"):
            chiudi_paragrafo()
            chiudi_elenco()
            citazione.append(spoglia.lstrip("> ").strip())
            continue
        if spoglia == "---":
            chiudi_tutto()
            continue

        punti = ELENCO_PUNTI.match(riga)
        numeri = ELENCO_NUMERI.match(riga)
        if punti or numeri:
            chiudi_paragrafo()
            chiudi_citazione()
            m = punti or numeri
            livello = len(m.group(1)) // 3
            elenco.append(("punto" if punti else "numero", livello, m.group(2)))
            continue

        if elenco and riga[:1].isspace():
            livello = (len(riga) - len(riga.lstrip(" "))) // 3
            elenco.append(("testo", livello, spoglia))
            continue

        chiudi_elenco()
        paragrafo.append(spoglia)

    chiudi_tutto()
    return elementi


def main():
    percorso = sorgente()
    ver = versione()
    with open(percorso, "r", encoding="utf-8") as fh:
        markdown = fh.read()

    s = stili_prove()
    storia = impagina(markdown, s)

    # In coda, cosa il foglio è e cosa non è.
    storia.append(Spacer(1, 8))
    storia.append(
        Paragraph(
            "<b>Questo foglio non sostituisce i test.</b> I controlli automatici (<font face=\"Courier\" "
            "size=\"8.6\">npm test</font>) coprono dati, interfaccia, collegamenti, accessibilità e testi; "
            "qui resta quello che solo una persona può vedere e sentire: la voce che parte, la pagina su un "
            "telefono, il messaggio che compare al momento giusto.",
            s["p_small"],
        )
    )
    storia.append(
        Paragraph(
            "Il foglio nasce da <font face=\"Courier\" size=\"8.6\">%s</font>: se una prova cambia, "
            "cambiano il markdown e questo PDF insieme, rigenerandolo con "
            "<font face=\"Courier\" size=\"8.6\">scripts/build_prove_a_mano_pdf.py</font>."
            % os.path.basename(percorso),
            s["p_small"],
        )
    )

    os.makedirs(os.path.dirname(USCITA), exist_ok=True)
    # Con sessanta prove l'esito non sta più per forza su un foglio suo: tenerlo
    # tutto insieme lasciava una settima pagina quasi vuota. Ora segue il testo,
    # e la tabella scende solo se non c'è spazio per l'intestazione.
    documento = Foglio(
        USCITA,
        ver,
        titolo="Psicologo Digitale · Prove a mano",
        url="github.com/danilodauria/psicologo-digitale/blob/main/" + os.path.basename(percorso),
        soggetto="Prove da fare a mano prima di considerare chiusa una release",
        creatore="scripts/build_prove_a_mano_pdf.py",
    )
    documento.build(storia)
    print(
        "PDF scritto: %s (%d byte, versione %s, da %s)"
        % (os.path.relpath(USCITA, BASE), os.path.getsize(USCITA), ver, os.path.basename(percorso))
    )


if __name__ == "__main__":
    main()
