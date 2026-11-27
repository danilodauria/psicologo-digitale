#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Titolo, autore, lingua e ordine di lettura per i PDF del progetto.

Un PDF senza titolo si apre nella scheda con il nome del file, e un lettore di
schermo non sa in che lingua leggere: due cose piccole che cambiano l'esperienza
di chi non vede la pagina. Questo script passa dopo i generatori e riempie i
metadati di ogni foglio in assets/pdf, senza toccare il testo.

La struttura taggata (PDF/UA) resta fuori: il testo è già in ordine di lettura
lineare, e il tagging vero cambierebbe i generatori. Qui si dichiara solo quello
che si può dichiarare con certezza: titolo, autore, argomento, lingua e la
richiesta ai lettori di mostrare il titolo del documento invece del nome file.

Uso: .venv/bin/python scripts/pdf_meta.py
"""
import os
import sys

import pymupdf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARTELLA = os.path.join(BASE, "assets", "pdf")

# Il titolo è quello che una persona vede nella scheda del browser o nel
# programma di lettura: niente accenti, così il metadato resta leggibile anche
# a un controllo che legge i byte del file senza una libreria PDF.
TITOLI = {
    "Psicologo-Digitale-Come-si-installa.pdf": (
        "Come si installa Psicologo Digitale",
        "Istruzioni per installare il programma su telefono e computer, anche senza connessione.",
    ),
    "Psicologo-Digitale-Prove-a-mano.pdf": (
        "Psicologo Digitale - Prove a mano",
        "Il foglio delle prove che nessun test automatico puo vedere, da stampare e compilare.",
    ),
    "Psicologo-Digitale-Scheda-rapida.pdf": (
        "Psicologo Digitale - Scheda rapida",
        "Una pagina da portare al colloquio: cosa dire, cosa chiedere, i numeri utili.",
    ),
    "vademecum-clinico-psicologo-digitale.pdf": (
        "Psicologo Digitale - Vademecum clinico",
        "Guida per il professionista: cosa contiene la relazione, come leggerla e quali limiti ha.",
    ),
    "vademecum-psicologo-digitale-a4.pdf": (
        "Psicologo Digitale - Vademecum",
        "Il manuale completo in formato A4: capitoli, esercizi e questionari.",
    ),
    "vademecum-psicologo-digitale-libricino-a4.pdf": (
        "Psicologo Digitale - Vademecum libricino",
        "Il manuale in formato libricino, impaginato per la stampa fronte-retro.",
    ),
    "vademecum-psicologo-digitale.pdf": (
        "Psicologo Digitale - Vademecum",
        "Il manuale completo: capitoli, esercizi e questionari.",
    ),
}

AUTORE = "Danilo D'Auria"
PAROLE = "psicologia, salute mentale, autovalutazione, diario, relazione, PWA"


def titolo_per(nome):
    if nome in TITOLI:
        return TITOLI[nome]
    pulito = os.path.splitext(nome)[0].replace("-", " ").replace("_", " ").strip()
    return ("Psicologo Digitale - " + pulito, "Un foglio di Psicologo Digitale.")


def applica(percorso, titolo, argomento):
    doc = pymupdf.open(percorso)
    meta = doc.metadata or {}
    meta.update({
        "title": titolo,
        "author": AUTORE,
        "subject": argomento,
        "keywords": PAROLE,
        "creator": "Psicologo Digitale",
        "producer": "Psicologo Digitale",
    })
    doc.set_metadata(meta)
    catalogo = doc.pdf_catalog()
    doc.xref_set_key(catalogo, "Lang", "(it)")
    doc.xref_set_key(catalogo, "ViewerPreferences", "<< /DisplayDocTitle true >>")
    # Salvataggio incrementale: si aggiungono solo i metadati, mentre il testo
    # delle pagine resta esattamente quello scritto dai generatori. Riscrivere
    # tutto con PyMuPDF comprimerebbe i flussi e il testo non sarebbe più
    # leggibile a chi apre il file senza una libreria PDF, come fanno i
    # controlli del progetto.
    doc.saveIncr()
    doc.close()


def main():
    if not os.path.isdir(CARTELLA):
        raise SystemExit("Manca assets/pdf: genera prima i PDF.")
    fogli = sorted(n for n in os.listdir(CARTELLA) if n.lower().endswith(".pdf"))
    if not fogli:
        raise SystemExit("Nessun PDF in assets/pdf.")
    for nome in fogli:
        titolo, argomento = titolo_per(nome)
        applica(os.path.join(CARTELLA, nome), titolo, argomento)
        print("  " + nome + " -> " + titolo)
    print("Metadati applicati a " + str(len(fogli)) + " PDF.")


if __name__ == "__main__":
    try:
        main()
    except Exception as errore:  # pragma: no cover - l'errore si legge nel log
        print("Errore nei metadati dei PDF: " + str(errore), file=sys.stderr)
        raise
