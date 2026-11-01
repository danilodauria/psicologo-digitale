#!/usr/bin/env python3
# =============================================================================
#  Psicologo Digitale · genera il PDF di «Come si installa»
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Produce assets/pdf/come-installare-psicologo-digitale.pdf
#
#  Il testo non è scritto qui: si legge come-installare.html e si impagina.
#  Una pagina sola da mantenere, e il foglio che si manda per email non può
#  dire qualcosa di diverso dalla pagina online.
#
#  Uso:
#    .venv/bin/python scripts/build_come_installare_pdf.py
# =============================================================================

import json
import os
from html.parser import HTMLParser

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGINA = os.path.join(BASE, "come-installare.html")
USCITA = os.path.join(BASE, "assets", "pdf", "Psicologo-Digitale-Come-si-installa.pdf")

INDACO = colors.HexColor("#22345c")
GRIGIO = colors.HexColor("#5b6472")
CARTA = colors.HexColor("#f7f5ef")
LINEA = colors.HexColor("#c9c4b8")

# Classi la cui discendenza non deve finire sul foglio: sono i comandi che su
# carta non si possono premere.
SALTA = ("btn-row", "no-print", "header-actions", "status-bar", "footer-grid", "crumbs")

# Tag che aprono un blocco di testo.
BLOCCHI = ("h1", "h2", "h3", "p", "li")


def versione():
    with open(os.path.join(BASE, "package.json"), "r", encoding="utf-8") as fh:
        return json.load(fh)["version"]


class Nodo:
    """Un riquadro: card, avviso o griglia che contiene altri blocchi."""

    def __init__(self, classi):
        self.classi = classi
        self.figli = []


class Blocco:
    def __init__(self, tipo, classi=""):
        self.tipo = tipo
        self.classi = classi
        self.testo = ""


class Estrattore(HTMLParser):
    """Trasforma il <main> della pagina in blocchi e riquadri."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.radice = Nodo("radice")
        self.pila = [self.radice]  # nodi aperti
        self.salti = 0  # profondità dentro un contenitore da ignorare
        self.blocco = None
        self.in_main = False
        self.profondita_main = 0

    # -- utilità ------------------------------------------------------------
    def _annida(self, elemento):
        self.pila[-1].figli.append(elemento)

    def _chiudi_blocco(self):
        if self.blocco is None:
            return
        testo = " ".join(self.blocco.testo.split())
        if testo:
            self._annida(self.blocco)
        self.blocco = None

    # -- parser -------------------------------------------------------------
    def handle_starttag(self, tag, attrs):
        classi = dict(attrs).get("class", "") or ""
        if tag == "main":
            self.in_main = True
            self.profondita_main = 1
            return
        if not self.in_main:
            return
        if tag == "main":
            return
        if self.salti:
            if tag in ("div", "section", "ul", "ol", "nav", "header", "footer", "script", "p", "li"):
                self.salti += 1
            return
        # Vale per qualunque tag: le briciole di navigazione sono un <p>, i
        # pulsanti un <div>, e su carta non servono né gli uni né gli altri.
        if any(c in classi.split() for c in SALTA):
            self._chiudi_blocco()
            self.salti = 1
            return
        if tag in ("script", "style", "button", "nav", "header", "footer"):
            self._chiudi_blocco()
            self.salti = 1
            return
        if tag in BLOCCHI:
            self._chiudi_blocco()
            self.blocco = Blocco(tag, classi)
            return
        if tag in ("ol", "ul"):
            # Il tipo di elenco serve a numerare i passaggi: «Scarica, apri,
            # trascina» senza numeri perde l'ordine che ha nella pagina.
            self._chiudi_blocco()
            nodo = Nodo("__" + tag)
            self._annida(nodo)
            self.pila.append(nodo)
            return
        if tag == "div":
            self._chiudi_blocco()
            nodo = Nodo(classi)
            self._annida(nodo)
            self.pila.append(nodo)
            return
        if tag in ("strong", "b"):
            if self.blocco:
                self.blocco.testo += "<b>"
            return
        if tag in ("em", "i"):
            if self.blocco:
                self.blocco.testo += "<i>"
            return
        if tag == "code":
            if self.blocco:
                self.blocco.testo += '<font face="Courier" size="8.6">'
            return
        if tag == "br":
            if self.blocco:
                self.blocco.testo += "<br/>"

    def handle_endtag(self, tag):
        if not self.in_main:
            return
        if tag == "main":
            self._chiudi_blocco()
            self.in_main = False
            return
        if self.salti:
            if tag in ("div", "section", "ul", "ol", "nav", "header", "footer", "script", "p", "li"):
                self.salti -= 1
            return
        if tag in BLOCCHI:
            self._chiudi_blocco()
            return
        if tag in ("ol", "ul") and len(self.pila) > 1:
            self._chiudi_blocco()
            self.pila.pop()
            return
        if tag == "div" and len(self.pila) > 1:
            self._chiudi_blocco()
            self.pila.pop()
            return
        if tag in ("strong", "b"):
            if self.blocco:
                self.blocco.testo += "</b>"
            return
        if tag in ("em", "i"):
            if self.blocco:
                self.blocco.testo += "</i>"
            return
        if tag == "code":
            if self.blocco:
                self.blocco.testo += "</font>"
            return

    def handle_data(self, data):
        if self.in_main and not self.salti and self.blocco is not None:
            # Helvetica non ha il simbolo del tasto Command: sul foglio si
            # scrive «Cmd», che si legge, invece di un quadratino vuoto.
            testo = data.replace("\u2318P", "Cmd+P").replace("\u2318", "Cmd")
            self.blocco.testo += testo.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


class Foglio(BaseDocTemplate):
    """A4 con intestazione, numero di pagina e versione nel piè di pagina."""

    def __init__(self, path, ver, **kw):
        self.ver = ver
        BaseDocTemplate.__init__(
            self,
            path,
            pagesize=A4,
            leftMargin=18 * mm,
            rightMargin=18 * mm,
            topMargin=22 * mm,
            bottomMargin=18 * mm,
            title="Psicologo Digitale · Come si installa",
            author="Danilo D'Auria",
            subject="Istruzioni di installazione per Windows, macOS e Linux",
            creator="scripts/build_come_installare_pdf.py",
            # Il testo resta leggibile nel file: i test possono controllare che
            # la versione dichiarata sia quella di package.json.
            pageCompression=0,
            **kw
        )
        larghezza = self.pagesize[0] - self.leftMargin - self.rightMargin
        altezza = self.pagesize[1] - self.topMargin - self.bottomMargin
        self.addPageTemplates(
            [
                PageTemplate(
                    id="foglio",
                    frames=[Frame(self.leftMargin, self.bottomMargin, larghezza, altezza, id="testo")],
                    onPage=self.decorazioni,
                )
            ]
        )

    def decorazioni(self, canvas, doc):
        canvas.saveState()
        larghezza = self.pagesize[0]
        canvas.setFont("Helvetica", 7.6)
        canvas.setFillColor(GRIGIO)
        canvas.drawString(self.leftMargin, self.pagesize[1] - 14 * mm, "Psicologo Digitale · Come si installa")
        canvas.drawRightString(larghezza - self.rightMargin, self.pagesize[1] - 14 * mm, "versione=" + self.ver)
        canvas.setStrokeColor(LINEA)
        canvas.setLineWidth(0.5)
        canvas.line(self.leftMargin, self.pagesize[1] - 16 * mm, larghezza - self.rightMargin, self.pagesize[1] - 16 * mm)
        canvas.drawString(self.leftMargin, 11 * mm, "danilodauria.github.io/psicologo-digitale/come-installare.html")
        canvas.drawRightString(larghezza - self.rightMargin, 11 * mm, "pagina %d" % doc.page)
        canvas.restoreState()


def stili():
    return {
        "h1": ParagraphStyle(
            "h1",
            fontName="Helvetica-Bold",
            fontSize=21,
            leading=25,
            textColor=INDACO,
            spaceAfter=6,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=INDACO,
            spaceBefore=13,
            spaceAfter=5,
            keepWithNext=1,
        ),
        "h3": ParagraphStyle(
            "h3",
            fontName="Helvetica-Bold",
            fontSize=10.6,
            leading=13.2,
            textColor=INDACO,
            spaceBefore=2,
            spaceAfter=3,
        ),
        "p": ParagraphStyle("p", fontName="Helvetica", fontSize=9.9, leading=13.6, alignment=TA_JUSTIFY, spaceAfter=3),
        # I testi piccoli stanno a sinistra: giustificati, con gli indirizzi
        # lunghi spezzati, lasciano voragini fra le parole.
        "p_small": ParagraphStyle("p_small", fontName="Helvetica", fontSize=9.2, leading=12.6, alignment=TA_LEFT, spaceAfter=2),
        "li": ParagraphStyle(
            "li",
            fontName="Helvetica",
            fontSize=9.2,
            leading=12.6,
            alignment=TA_LEFT,
            leftIndent=11,
            bulletIndent=2,
            spaceAfter=2.5,
            bulletFontName="Helvetica",
            bulletFontSize=9.2,
        ),
        "voce": ParagraphStyle("voce", fontName="Helvetica", fontSize=9.2, leading=12.6, alignment=TA_LEFT, spaceAfter=2),
    }


def riquadro(contenuto, sfondo, s):
    """Un riquadro con bordo leggero: è la card della pagina, senza ombra."""
    tabella = Table([[contenuto]], colWidths=[None])
    tabella.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), sfondo),
                ("BOX", (0, 0), (-1, -1), 0.5, LINEA),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return tabella


def impagina(figli, s, annidato=False, elenco=None):
    """Converte blocchi e riquadri in elementi di reportlab."""
    fuori = []
    numerati = 0
    for figlio in figli:
        if isinstance(figlio, Nodo):
            if figlio.classi in ("__ol", "__ul"):
                fuori.extend(impagina(figlio.figli, s, annidato=True, elenco=figlio.classi))
                continue
            interno = impagina(figlio.figli, s, annidato=True)
            if not interno:
                continue
            classi = figlio.classi.split()
            if "card" in classi or "callout" in classi:
                sfondo = CARTA if "callout" in classi else colors.white
                contenuto = []
                for indice, elemento in enumerate(interno):
                    if indice:
                        contenuto.append(Spacer(1, 2))
                    contenuto.append(elemento)
                fuori.append(riquadro(contenuto, sfondo, s))
                fuori.append(Spacer(1, 4.5))
            else:
                fuori.extend(interno)
            continue

        testo = figlio.testo.strip()
        if not testo:
            continue
        classi = figlio.classi.split()
        if figlio.tipo == "h1":
            fuori.append(Paragraph(testo, s["h1"]))
        elif figlio.tipo == "h2":
            fuori.append(Paragraph(testo, s["h2"]))
        elif figlio.tipo == "h3":
            fuori.append(Paragraph(testo, s["h3"]))
        elif figlio.tipo == "li":
            if elenco == "__ol":
                numerati += 1
                fuori.append(Paragraph(testo, s["li"], bulletText="%d." % numerati))
            else:
                fuori.append(Paragraph(testo, s["li"], bulletText="•"))
        else:
            stile = s["p_small"] if "text-small" in classi else s["p"]
            fuori.append(Paragraph(testo, stile))
            if not annidato:
                fuori.append(Spacer(1, 3))
    return fuori


def main():
    ver = versione()
    with open(PAGINA, "r", encoding="utf-8") as fh:
        html = fh.read()

    estrattore = Estrattore()
    estrattore.feed(html)
    estrattore.close()

    s = stili()
    storia = impagina(estrattore.radice.figli, s)

    # In coda, ciò che sulla carta conta ma a schermo sta nel piè di pagina.
    storia.append(Spacer(1, 8))
    storia.append(
        Paragraph(
            "<b>Avvertenza.</b> Il programma è educativo e di orientamento: non formula diagnosi, "
            "non prescrive terapie e non sostituisce il parere di uno psicologo, di uno psicoterapeuta "
            "o di un medico. In caso di emergenza chiama il <b>112</b>.",
            s["p_small"],
        )
    )
    storia.append(
        Paragraph(
            "Le impronte dei file stanno in <font face=\"Courier\" size=\"8.6\">SHA256SUMS.txt</font>, "
            "nella pagina della versione: <font face=\"Courier\" size=\"8.6\">"
            "github.com/danilodauria/psicologo-digitale/releases/latest</font>.",
            s["p_small"],
        )
    )

    os.makedirs(os.path.dirname(USCITA), exist_ok=True)
    documento = Foglio(USCITA, ver)
    documento.build(storia)
    peso = os.path.getsize(USCITA)
    print("PDF scritto: %s (%d byte, versione %s)" % (os.path.relpath(USCITA, BASE), peso, ver))


if __name__ == "__main__":
    main()
