#!/usr/bin/env python3
# =============================================================================
#  Psicologo Digitale · genera la scheda rapida in PDF
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Produce assets/pdf/Psicologo-Digitale-Scheda-rapida.pdf
#
#  Una pagina sola, i tre sistemi affiancati: quella che si stampa e si tiene
#  accanto al computer. Come per il foglio lungo, il testo non è scritto qui:
#  si legge scheda-rapida.html e si impagina.
#
#  Uso:
#    .venv/bin/python scripts/build_scheda_rapida_pdf.py
# =============================================================================

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_come_installare_pdf import BASE, main  # noqa: E402

PAGINA = os.path.join(BASE, "scheda-rapida.html")
USCITA = os.path.join(BASE, "assets", "pdf", "Psicologo-Digitale-Scheda-rapida.pdf")

if __name__ == "__main__":
    # chiusura=False: la scheda porta già la sua avvertenza in fondo, e
    # aggiungerne una seconda la renderebbe una pagina ripetitiva.
    main(
        pagina=PAGINA,
        uscita=USCITA,
        titolo="Psicologo Digitale · Scheda rapida",
        url="danilodauria.github.io/psicologo-digitale/scheda-rapida.html",
        chiusura=False,
    )
