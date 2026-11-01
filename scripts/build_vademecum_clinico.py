#!/usr/bin/env python3
# =============================================================================
#  Psicologo Digitale · genera la guida per il professionista (PDF, A4)
#  Licenza del codice: MIT · Danilo D'Auria
#  ---------------------------------------------------------------------------
#  Secondo vademecum, scritto per chi riceve la relazione: come leggere i
#  punteggi dei sei questionari, che cosa il programma non può sapere e quali
#  sono i limiti dichiarati. Riusa impaginazione e stili del vademecum
#  principale.
#
#  Uso:
#    node scripts/export-data.cjs
#    .venv/bin/python scripts/build_vademecum_clinico.py
# =============================================================================

import html
import json
import os
import sys

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, Spacer, Table, TableStyle
from reportlab.platypus.tableofcontents import TableOfContents

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from build_vademecum import (  # noqa: E402
    ACCENTO,
    GRIGIO,
    INDACO,
    LINEA,
    Guida,
    riquadro,
    stili,
    tabella,
)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATI = os.path.join(BASE, "assets", "data", "vademecum.json")
USCITA = os.path.join(BASE, "assets", "pdf")
NOME = "vademecum-clinico-psicologo-digitale.pdf"

FINESTRA = {
    "umore": "ultime 2 settimane",
    "ansia": "ultime 2 settimane",
    "stress": "ultimo mese",
    "sonno": "ultimo mese",
    "esaurimento": "ultimi 3 mesi",
    "benessere": "ultime 2 settimane",
}

# Nota di lettura per ogni fascia, nello stesso ordine delle bande nel dato.
LETTURA = {
    "umore": [
        "Nessun segnale riferito. Non esclude un quadro negato o minimizzato: conta il racconto, non il totale.",
        "Sintomi lievi, comuni nei periodi di stress. Verificare durata e impatto prima di qualsiasi ipotesi.",
        "Fascia in cui la compromissione va esplorata: sonno, lavoro, relazioni, ritiro sociale.",
        "Quadro consistente. Se c'è una terapia in corso, valutare il coordinamento con chi la prescrive.",
        "Priorità alta. Esplorare ideazione, piano, mezzi e fattori protettivi senza rimandare.",
    ],
    "ansia": [
        "Ansia contenuta. Se sale in situazioni specifiche, chiedere quali e che cosa viene evitato.",
        "Preoccupazione presente: mappare i trigger, l'evitamento e i sintomi fisici.",
        "L'ansia occupa parte della giornata: distinguere preoccupazione libera da attacchi di panico.",
        "Livello alto: verificare sonno, condotte di evitamento e uso di alcol o ansiolitici.",
    ],
    "stress": [
        "Carico percepito contenuto rispetto alle risorse dichiarate.",
        "Il carico inizia a erodere energia: chiedere che cosa è stato ridotto o abbandonato.",
        "Carico elevato: verificare ore, recupero, conflitti di ruolo e sintomi somatici.",
    ],
    "sonno": [
        "Sonno riferito sufficiente: restano utili regolarità e igiene del sonno.",
        "Qualche notte difficile: chiedere orari reali e tempo passato a letto da svegli.",
        "Disturbo significativo: la CBT-I è il trattamento di prima scelta; valutare l'invio.",
        "Disturbo marcato: escludere apnea (russamento, pause, sonnolenza diurna) e cause mediche.",
    ],
    "esaurimento": [
        "Nessun segnale rilevante di esaurimento.",
        "Affaticamento presente: rivedere carichi, pause, delega e confini.",
        "Esaurimento alto: valutare l'impatto su sonno e umore e le possibilità di tutela.",
        "Quadro severo: non è mancanza di volontà; servono una pausa reale e un supporto.",
    ],
    "benessere": [
        "Benessere molto basso: segnale da non sottovalutare, valutare l'invio.",
        "Sotto la soglia di attenzione: utile una valutazione se il quadro persiste oltre due settimane.",
        "Risorse presenti, con alti e bassi: coltivare recupero, relazioni e attività che danno senso.",
        "Benessere buono: proteggere le abitudini che lo sostengono.",
    ],
}


def e(testo):
    return html.escape(str(testo), quote=False)


def intervalli(s):
    """Etichette di intervallo per le fasce, rispettando scala somma o 0-100."""
    fuori = []
    prec = s["min"]
    for b in s["bande"]:
        if s["tipo"] == "scala100":
            fuori.append("%d-%d%%" % (prec, b["fino"]))
        else:
            fuori.append("%d-%d" % (prec, b["fino"]))
        prec = b["fino"] + 1
    return fuori


def nota(i, s, indice, b):
    note = LETTURA.get(s["id"], [])
    return note[indice] if indice < len(note) else b["testo"]


def tabella_fasce(s, st, doc):
    righe = []
    for indice, (b, rng) in enumerate(zip(s["bande"], intervalli(s))):
        righe.append([rng, "<b>" + e(b["label"]) + "</b>", e(nota(s["id"], s, indice, b))])
    return tabella(
        righe,
        ["Punteggio", "Fascia", "Nota di lettura"],
        st,
        doc,
        larghezze=[doc.width * 0.16, doc.width * 0.26, doc.width * 0.58],
    )


def costruisci(percorso, d):
    cl = d["clinico"]
    doc = Guida(
        percorso,
        formato="a4",
        versione=d["versione"],
        titolo="Guida per il professionista · Psicologo Digitale",
        soggetto="Come leggere la relazione e i punteggi, con i limiti dichiarati",
        etichetta="Guida per il professionista",
    )
    st = stili(doc)
    c = d["counts"]
    storia = []

    # ---------------------------------------------------------------- Copertina
    storia += [
        Spacer(1, 12 * mm),
        Paragraph("GUIDA PER IL PROFESSIONISTA", st["occhiello"]),
        Paragraph("Leggere la relazione<br/>di Psicologo Digitale", st["copertina"]),
        Paragraph(
            "Come si leggono i sei questionari, che cosa un punteggio non dice<br/>e quali sono i limiti dichiarati del programma",
            st["sottotitolo"],
        ),
        Spacer(1, 4 * mm),
        Paragraph(
            "Questa guida accompagna la relazione preliminare che la persona porta al primo colloquio. "
            "Non è un manuale diagnostico e non sostituisce la valutazione clinica: serve a rendere "
            "esplicito che cosa il documento contiene, come è costruito e dove finisce la sua affidabilità.",
            st["Corpo"],
        ),
        Spacer(1, 3 * mm),
        Paragraph(
            "Ideato, scritto e sviluppato da <b>Danilo D'Auria</b><br/>un progetto <b>FeniceOS</b>",
            st["Piccolo"],
        ),
        Paragraph(
            "Versione " + e(d["versione"]) + " · " + e(d["url"]) + "<br/>"
            "Codice MIT · Contenuti CC BY-NC-SA 4.0 · " + str(c["scale"]) + " questionari, " + str(c["fasi"]) + " fasi di colloquio",
            st["Piccolo"],
        ),
        Spacer(1, 6 * mm),
        riquadro(
            "<b>Documento di supporto alla lettura.</b> Il programma non è un dispositivo medico, non produce "
            "diagnosi e non è un test psicometrico validato. Le note che seguono servono a formulare domande "
            "migliori, non a sostenere una classificazione. In caso di rischio immediato: <b>112</b>.",
            st, doc,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------------------- Indice
    indice = TableOfContents()
    indice.levelStyles = [
        ParagraphStyle(
            "IndiceVoce", fontName="Helvetica", fontSize=doc.corpo + 0.4, leading=(doc.corpo + 0.4) * 2.05,
            textColor=colors.HexColor("#1e2430"), leftIndent=0,
        )
    ]
    storia += [
        Paragraph("Indice", st["Sezione"]),
        Paragraph(
            "Le prime due sezioni descrivono che cosa arriva in mano al clinico e come è costruito il "
            "documento. La terza e la quarta entrano nel merito dei punteggi, fascia per fascia. La quinta "
            "elenca i limiti dichiarati, senza edulcorarli: è la parte che conviene leggere per prima se il "
            "documento deve entrare in una cartella o in una discussione di équipe.",
            st["Piccolo"],
        ),
        Spacer(1, 3 * mm),
        indice,
        PageBreak(),
    ]

    # ------------------------------------------------ Che cosa arriva al clinico
    storia += [
        Paragraph("Che cosa arriva in mano al clinico", st["Capitolo"]),
        Paragraph(
            "La persona compila il colloquio e uno o più questionari nel browser, poi genera un PDF sul proprio "
            "dispositivo. Nessun dato passa da un server: il file che ricevi è l'unico esemplare, e chi te lo "
            "consegna può averlo rigenerato più volte. Va letto come un <b>documento preparatorio scritto da chi "
            "chiede aiuto</b>, non come una cartella clinica.",
            st["Corpo"],
        ),
        Paragraph("La struttura della relazione", st["Sezione"]),
        Paragraph(
            "La numerazione delle sezioni cambia se la persona non ha compilato il diario o le schede del "
            "pensiero: le voci sotto restano le stesse, in quest'ordine.",
            st["Corpo"],
        ),
        tabella(
            [
                ["Dati del colloquio", "Nome o pseudonimo, fascia d'età, durata del quadro, impatto 0-10, urgenza percepita, disponibilità.", "Il quadro soggettivo: leggere urgenza e impatto insieme, non da soli."],
                ["1. Motivo e aree", "Aree scelte, intensità percepita 0-10, sintesi del profilo, eventuale nota libera.", "Utile per la formulazione iniziale; l'intensità è autovalutata."],
                ["2. Storia e contesto", "Percorsi precedenti, farmaci, salute, sostanze, eventi, familiarità, infanzia.", "Spesso la parte più informativa: cercare cause mediche e trattamenti in corso."],
                ["3. Ambiti e comportamenti", "Manifestazioni d'ansia, evitamento, sonno, cibo e corpo, sostanze, sintomi post-evento.", "Segnali riferiti, non osservati: da verificare a colloquio."],
                ["4. Funzionamento", "Energia, sonno, concentrazione, supporto, attività quotidiane (0-10).", "Serve a pesare la compromissione, che nessun questionario misura."],
                ["5. Questionari", "Punteggio, massimo, percentuale, fascia, data; poi la lettura della fascia.", "Il cuore di questa guida: vedi le sezioni successive."],
                ["6. Sicurezza", "Segnali emersi dalle domande dirette del colloquio.", "Non è una valutazione del rischio: un'assenza di segnali non rassicura."],
                ["7. Obiettivi e risorse", "Obiettivo dichiarato, tipo di aiuto, rete, punti di forza.", "Materiale per l'alleanza e per gli obiettivi misurabili."],
                ["8. Diario recente", "Fino a dieci voci: data, umore, ansia, ore di sonno, nota.", "L'unica serie temporale del documento: guardarla come tendenza."],
                ["9. Schede del pensiero", "Fino a cinque situazioni, pensieri, emozioni, alternative.", "Utile per la concettualizzazione cognitiva."],
                ["10. Domande suggerite", "Fino a otto domande generate dai dati del colloquio.", "Sono ipotesi di lavoro automatiche: vanno scremate."],
            ],
            ["Sezione", "Contenuto", "Come leggerla"],
            st, doc,
            larghezze=[doc.width * 0.22, doc.width * 0.42, doc.width * 0.36],
        ),
        Spacer(1, 3 * mm),
        Paragraph("L'identificativo del documento", st["Sezione"]),
        Paragraph(
            "Il codice in testa al PDF ha la forma <b>PD-AAAAMMGG-NNNN</b> e deriva da un calcolo sui dati del "
            "colloquio. Serve a riconoscere due stampe dello stesso documento, non a dimostrarne l'autenticità: "
            "non è una firma digitale, non è un timbro temporale e chiunque può rigenerare il PDF con dati "
            "diversi o modificarlo. Se ti serve un documento autenticato, chiedi alla persona di consegnarlo di "
            "persona e verbalizza tu la ricezione.",
            st["Corpo"],
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------- Prima del punteggio
    storia += [
        Paragraph("Prima di leggere un punteggio", st["Capitolo"]),
        Paragraph(
            "Cinque cose restano vere per tutti e sei gli strumenti. Se ne dimentichi una, il numero che hai "
            "davanti diventa più autorevole di quello che è.",
            st["Corpo"],
        ),
        Paragraph("<b>1. È un'autovalutazione, non un esame.</b> La persona risponde da sola, sul proprio telefono o computer, senza che nessuno chiarisca i dubbi in tempo reale. Non vedi come ha risposto, non sai quanto ci ha messo, non sai se ha letto le istruzioni.", st["Elenco"]),
        Paragraph("<b>2. Non è uno strumento validato.</b> Gli item sono formulati in italiano per questo progetto e si ispirano a costrutti di PHQ-9, GAD-7, PSS-10, ISI, MBI e WHO-5, ma non sono le versioni ufficiali e non ne ereditano validazione, norme o cut-off.", st["Elenco"]),
        Paragraph("<b>3. Le finestre temporali sono diverse.</b> Umore, ansia e benessere chiedono le ultime due settimane; stress e sonno l'ultimo mese; esaurimento gli ultimi tre mesi. I punteggi non sono contemporanei e non si sommano in un indice unico.", st["Elenco"]),
        Paragraph("<b>4. La percentuale non è un percentile.</b> È il punteggio diviso il massimo, moltiplicato per cento. Non dice come si colloca la persona rispetto alla popolazione, né quanto è «grave» in assoluto: serve solo a confrontare strumenti con massimi diversi.", st["Elenco"]),
        Paragraph("<b>5. Il totale non è la persona.</b> Due persone con lo stesso punteggio possono avere quadri diversi. Contano il profilo tra aree, gli item critici, la durata, la compromissione funzionale e la storia.", st["Elenco"]),
        Spacer(1, 3 * mm),
        riquadro(
            "<b>Regola pratica.</b> Un punteggio cambia la tua prima domanda, non la tua diagnosi. Se il numero "
            "ti serve per decidere qualcosa, chiediti che cosa avresti chiesto senza quel numero: spesso è la "
            "domanda giusta.",
            st, doc, colors.HexColor("#eef3f8"), ACCENTO,
        ),
        Spacer(1, 2 * mm),
        Paragraph(
            "Un'ultima nota sul metodo: il programma non calcola punteggi parziali. Se manca anche una sola "
            "risposta, il questionario non viene calcolato, quindi ogni punteggio che leggi è completo. Non ci "
            "sono però item di controllo della coerenza, né tempi minimi di compilazione: una compilazione "
            "affrettata o casuale produce comunque un numero plausibile.",
            st["Corpo"],
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------ I sei strumenti
    storia += [
        Paragraph("I sei strumenti", st["Capitolo"]),
        Paragraph(
            "Ogni questionario ha un massimo diverso, un'ancora di risposta diversa e una finestra temporale "
            "diversa. Questa tabella serve a non confonderli tra loro.",
            st["Corpo"],
        ),
        tabella(
            [
                [
                    s["sigla"],
                    s["titolo"],
                    str(s["item"]),
                    str(s["inversi"]) if s["inversi"] else "-",
                    ("0-100" if s["tipo"] == "scala100" else str(s["min"]) + "-" + str(s["max"])),
                    FINESTRA.get(s["id"], "-"),
                ]
                for s in cl["scales"]
            ],
            ["Sigla", "Strumento", "Item", "Inversi", "Punteggio", "Finestra"],
            st, doc,
            larghezze=[doc.width * 0.1, doc.width * 0.36, doc.width * 0.08, doc.width * 0.1, doc.width * 0.16, doc.width * 0.2],
        ),
        Spacer(1, 2 * mm),
        Paragraph(
            "Gli item inversi sono già invertiti dal programma: il punteggio riportato è quello corretto, non "
            "va ricalcolato. Il solo strumento che cambia unità di misura è il BEN-5, espresso 0-25 e riportato "
            "a 0-100 moltiplicando per quattro.",
            st["Piccolo"],
        ),
    ]

    for s in cl["scales"]:
        blocco = [
            Paragraph(s["titolo"] + " · " + s["sigla"], st["Sezione"]),
            Paragraph(
                "Istruzione data: «" + e(s["istruzioni"]) + "» Risposta su " + str(len(s["opzioni"])) +
                " livelli. " + e(s["perche"]),
                st["Piccolo"],
            ),
            Spacer(1, 1.5 * mm),
            tabella_fasce(s, st, doc),
        ]
        if s["notaClinica"]:
            blocco.append(Spacer(1, 1.5 * mm))
            blocco.append(Paragraph("<b>Nota dello strumento.</b> " + e(s["notaClinica"]), st["Piccolo"]))
        if s["cosaPortare"]:
            blocco.append(
                Paragraph(
                    "<b>Da chiedere a colloquio.</b> " + e("; ".join(s["cosaPortare"])) + ".",
                    st["Piccolo"],
                )
            )
        blocco.append(Spacer(1, 3 * mm))
        storia.append(KeepTogether(blocco))

    storia.append(PageBreak())

    # ------------------------------------------------ Dal punteggio al colloquio
    storia += [
        Paragraph("Dal punteggio al colloquio, in cinque passaggi", st["Capitolo"]),
        Paragraph(
            "La sequenza che segue non è un protocollo: è un modo per non fermarsi al numero e per non "
            "scavalcarlo. Funziona anche quando il punteggio è alto e la persona arriva già con un'etichetta "
            "che si è data da sola.",
            st["Corpo"],
        ),
        Paragraph("<b>1. Colloca il punteggio nel suo intervallo.</b> Le fasce sono costruite a priori, non derivate da curve ROC: servono a dare un linguaggio comune, non a fissare una soglia. Un punteggio al confine tra due fasce va letto come «al confine», non come appartenente alla più bassa.", st["Elenco"]),
        Paragraph("<b>2. Guarda il profilo, non la media.</b> Un umore alto con un benessere discreto racconta altro rispetto a un umore alto con esaurimento severo. Le sei aree non sono sottoscale di un unico costrutto.", st["Elenco"]),
        Paragraph("<b>3. Cerca l'item critico.</b> Nell'UMS-9 il nono item esplora i pensieri di morte e pesa nella somma come gli altri: un totale basso può convivere con un item positivo. Chiedi sempre se ci sono state risposte affermative a quell'item.", st["Elenco"]),
        Paragraph("<b>4. Pesa la compromissione.</b> Il colloquio riporta impatto 0-10 e funzionamento su cinque dimensioni. Sono dati grossolani, ma più vicini alla vita quotidiana di qualunque punteggio.", st["Elenco"]),
        Paragraph("<b>5. Escludi prima le cause mediche.</b> Sonno, appetito, energia e concentrazione cambiano con ipotiroidismo, anemia, dolore cronico, farmaci, alcol e sostanze. Il documento segnala salute e farmaci: usali.", st["Elenco"]),
        Spacer(1, 3 * mm),
        Paragraph("Errori frequenti", st["Sezione"]),
        Paragraph("trattare la fascia come cut-off diagnostico, o citarla in una relazione come tale;", st["Elenco"]),
        Paragraph("sommare o mediare punteggi di strumenti con massimi e finestre diversi;", st["Elenco"]),
        Paragraph("confrontare il punteggio di questa persona con quello di un'altra, o con il proprio;", st["Elenco"]),
        Paragraph("leggere la percentuale come percentile o come gravità assoluta;", st["Elenco"]),
        Paragraph("ignorare che la ripetizione del questionario sostituisce il punteggio precedente: il documento non conserva una serie storica, quindi non permette di stimare il cambiamento;", st["Elenco"]),
        Paragraph("dare per acquisito che «nessun segnale di sicurezza» significhi assenza di rischio;", st["Elenco"]),
        Paragraph("usare il PDF come referto, perizia o documento di parte senza una propria valutazione.", st["Elenco"]),
        PageBreak(),
    ]

    # ------------------------------------------------------------ Limiti
    storia += [
        Paragraph("Limiti dichiarati", st["Capitolo"]),
        Paragraph(
            "Questi limiti sono parte del progetto, non un'appendice difensiva. Vanno letti prima di usare il "
            "documento in qualsiasi contesto che non sia il colloquio con la persona che lo ha compilato.",
            st["Corpo"],
        ),
        Paragraph("Metodo e validazione", st["Sezione"]),
        Paragraph("<b>1. Nessuno studio di validazione.</b> Non esistono, per questo adattamento, stime di coerenza interna, attendibilità test-retest, validità di costrutto o di criterio.", st["Elenco"]),
        Paragraph("<b>2. Nessun campione normativo.</b> Non ci sono percentili, punteggi T o confronti con popolazione generale o gruppi clinici: un punteggio si legge solo rispetto alla persona e al suo prima.", st["Elenco"]),
        Paragraph("<b>3. Item adattati, non traduzioni ufficiali.</b> La formulazione italiana è stata scritta per questo programma: non è equivalente alle versioni originali e non autorizza a usare i loro cut-off.", st["Elenco"]),
        Paragraph("<b>4. Fasce costruite a priori.</b> Gli intervalli sono stati definiti per dare un linguaggio comune; non derivano da analisi ROC né da punti di taglio validati.", st["Elenco"]),
        Paragraph("<b>5. Nessuna verifica delle proprietà psicometriche.</b> Non sono disponibili affidabilità inter-valutatore (non applicabile), errore di misura, effetto pavimento o soffitto, invarianza di misura tra gruppi.", st["Elenco"]),
        Paragraph("Dati e misura", st["Sezione"]),
        Paragraph("<b>6. Autosomministrazione senza osservazione.</b> Nessun clinico è presente: non si osservano esitazioni, incomprensioni, stanchezza, compulsione a finire in fretta.", st["Elenco"]),
        Paragraph("<b>7. Nessuna fonte collaterale.</b> Un solo informatore, senza familiari, documentazione medica o osservazioni di altri professionisti.", st["Elenco"]),
        Paragraph("<b>8. Nessun punteggio parziale.</b> Se manca un item il questionario non viene calcolato: non ci sono stime per i dati mancanti, e la persona potrebbe aver evitato proprio l'item più significativo.", st["Elenco"]),
        Paragraph("<b>9. Somma di risposte ordinali.</b> Il calcolo assume che la distanza tra un'opzione e l'altra sia uguale, cosa non verificata. Il punteggio è un indice, non una misura a intervalli.", st["Elenco"]),
        Paragraph("<b>10. Nessun controllo di validità interna.</b> Non ci sono item di controllo, scale di desiderabilità sociale, tempi minimi o rilevazione di risposte casuali.", st["Elenco"]),
        Paragraph("<b>11. Nessuna serie storica.</b> Rifare un questionario sostituisce il punteggio precedente: il documento mostra l'ultima compilazione, non l'andamento. Solo il diario conserva una sequenza.", st["Elenco"]),
        Paragraph("Sicurezza", st["Sezione"]),
        Paragraph("<b>12. Le domande sulla sicurezza sono di triage.</b> Non sono una scala validata (per esempio C-SSRS) e non esplorano intento, piano, mezzi, precedenti tentativi e fattori protettivi con la necessaria profondità.", st["Elenco"]),
        Paragraph("<b>13. Un «no» non esclude il rischio.</b> Vergogna, desiderabilità, timore delle conseguenze e ambivalenza riducono la probabilità di una risposta affermativa. La valutazione del rischio resta clinica e va fatta di persona.", st["Elenco"]),
        Paragraph("Uso e responsabilità", st["Sezione"]),
        Paragraph("<b>14. Non è un dispositivo medico.</b> Non rientra nel Regolamento UE 2017/745, non produce refertazione, non è un atto sanitario e non è destinato a prevenire, diagnosticare o trattare patologie.", st["Elenco"]),
        Paragraph("<b>15. Non sostituisce il giudizio clinico.</b> Nessuna responsabilità professionale si trasferisce al programma, all'autore o al documento. Il PDF è un racconto della persona, non un parere.", st["Elenco"]),
        Paragraph("<b>16. Non è utilizzabile in ambito valutativo o forense.</b> Non va usato per perizie, contenziosi, selezione del personale, valutazioni assicurative, capacità o idoneità, né per decisioni su minori o persone non in grado di prestare consenso.", st["Elenco"]),
        Spacer(1, 2 * mm),
        riquadro(
            "<b>In sintesi.</b> Il documento è utile perché è stato scritto con cura da chi chiede aiuto e "
            "perché ordina informazioni che altrimenti andrebbero raccolte in tre sedute. Non è utile, e può "
            "essere dannoso, se il numero viene trattato come una misura oggettiva.",
            st, doc, colors.HexColor("#eef3f8"), ACCENTO,
        ),
        PageBreak(),
    ]

    # -------------------------------------------- Che cosa non può sapere
    storia += [
        Paragraph("Che cosa il programma non può sapere", st["Capitolo"]),
        Paragraph(
            "Il documento tace su alcune dimensioni che contano più dei punteggi. Non è una dimenticanza: sono "
            "fuori dalla portata di un'autovalutazione scritta in autonomia.",
            st["Corpo"],
        ),
        Paragraph("<b>Comorbilità.</b> Ansia, umore, sonno, sostanze e dolore cronico si intrecciano. Sei punteggi separati non dicono quale quadro spieghi gli altri.", st["Elenco"]),
        Paragraph("<b>Cause mediche.</b> Ipotiroidismo, anemia, apnee, dolore, farmaci e astinenza possono imitare un disturbo dell'umore o dell'ansia. Il programma registra ciò che la persona dichiara, non esamina nulla.", st["Elenco"]),
        Paragraph("<b>Trauma e dissociazione.</b> Non ci sono strumenti per esperienze traumatiche, sintomi dissociativi o flashback: la sezione eventi è una lista, non una valutazione.", st["Elenco"]),
        Paragraph("<b>Psicosi, mania, disturbi di personalità.</b> Fuori dal perimetro. Un punteggio alto di ansia o esaurimento non orienta su questi quadri e non li esclude.", st["Elenco"]),
        Paragraph("<b>Funzionamento relazionale e sociale.</b> Il supporto percepito è un numero 0-10: non dice chi c'è davvero, quanto è affidabile, che cosa la persona chiede e che cosa ottiene.", st["Elenco"]),
        Paragraph("<b>Contesto materiale.</b> Casa, lavoro, debiti, violenza economica, carichi di cura, immigrazione, discriminazione: compaiono solo se la persona sceglie di raccontarli in una nota libera.", st["Elenco"]),
        Paragraph("<b>Evoluzione nel tempo.</b> Senza serie storiche non si distingue un episodio acuto da un andamento cronico, né si può attribuire un miglioramento a un intervento.", st["Elenco"]),
        Paragraph("<b>Ciò che la persona non sa dire.</b> Alessitimia, vergogna, cultura di appartenenza, alfabetizzazione, timore del giudizio: tutto ciò che rende una risposta vera ma incompleta.", st["Elenco"]),
        Spacer(1, 3 * mm),
        Paragraph(
            "Il modo più onesto di usare il documento è leggerlo come una <b>lettera di presentazione strutturata</b>: "
            "dice che cosa la persona pensa di provare, in quali aree, con quale intensità percepita e con quale "
            "urgenza. Il resto è il tuo lavoro.",
            st["Corpo"],
        ),
        PageBreak(),
    ]

    # ---------------------------------------------------------- Sicurezza
    sic = d["sicurezza"]
    storia += [
        Paragraph("Segnali che cambiano la priorità", st["Capitolo"]),
        Paragraph(sic["introduzione"], st["Corpo"]),
        Paragraph(
            "Nella tabella, la colonna centrale indica che cosa il segnale cambia nella conduzione del primo "
            "incontro: non è una graduatoria di gravità e non sostituisce la valutazione del rischio.",
            st["Corpo"],
        ),
        tabella(
            [
                ["UMS-9, nono item positivo", "Ideazione riferita", "Esplorare subito intento, piano, mezzi, precedenti tentativi e fattori protettivi; valutazione del rischio e rete. Se il rischio è imminente: 112."],
                ["Violenza subita o percepita", "Sicurezza della persona", "Non approfondire in presenza di chi esercita violenza; 1522, rete antiviolenza, piano di sicurezza."],
                ["Comportamenti su cibo e corpo", "Possibile disturbo alimentare", "Approfondire senza colpevolizzare; valutazione specialistica e medica, controllo dei parametri."],
                ["Sostanze più volte a settimana", "Quadro potenzialmente misto", "Valutare il ruolo di alcol e sostanze; invio ai servizi specialistici se indicato."],
                ["Persona minorenne", "Tutela e consenso", "Coinvolgere un adulto responsabile, verificare la cornice di tutela e i limiti di riservatezza."],
                ["Informazioni indirette (per un familiare)", "Nessun consenso del diretto interessato", "Raccogliere il racconto della persona coinvolta, con il suo consenso; non formulare ipotesi su chi non è presente."],
                ["Russamento, pause respiratorie, sonnolenza diurna", "Possibile apnea", "Valutazione medica o specialistica del sonno prima di trattare l'insonnia come psicologica."],
            ],
            ["Segnale nel documento", "Che cosa cambia", "Come procedere"],
            st, doc,
            larghezze=[doc.width * 0.28, doc.width * 0.22, doc.width * 0.5],
        ),
        Spacer(1, 3 * mm),
        Paragraph("Numeri utili", st["Sezione"]),
        tabella(
            [[n["numero"], n["nome"], n["nota"]] for n in sic["numeri"]],
            ["Numero", "Servizio", "A che cosa serve"],
            st, doc,
            larghezze=[doc.width * 0.16, doc.width * 0.28, doc.width * 0.56],
        ),
        Spacer(1, 2 * mm),
        riquadro(
            "<b>In pericolo immediato: 112.</b> Se il rischio riguarda una persona che hai davanti, non lasciarla "
            "sola e aiutala a chiamare. Se il rischio riguarda un terzo, segui le procedure del tuo servizio.",
            st, doc,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------ Primo incontro
    storia += [
        Paragraph("Il primo incontro, in dieci domande", st["Capitolo"]),
        Paragraph(
            "Le domande sono quelle che il documento rende possibili, non obbligatorie. Servono a partire dai "
            "dati senza far ripetere alla persona quello che ha già scritto.",
            st["Corpo"],
        ),
        Paragraph("Che cosa hai risposto al nono item dell'UMS-9, e che cosa hai pensato mentre rispondevi?", st["Elenco"]),
        Paragraph("Da quanto tempo va così, e che cosa è cambiato nelle settimane in cui è peggiorato?", st["Elenco"]),
        Paragraph("Che cosa hai smesso di fare, e che cosa continui a fare nonostante la fatica?", st["Elenco"]),
        Paragraph("Chi sa di questo periodo, e che cosa ha visto?", st["Elenco"]),
        Paragraph("Hai parlato con un medico? Hai fatto analisi di recente? Prendi farmaci o integratori?", st["Elenco"]),
        Paragraph("Quanto bevi, e quanto fumi o usi altre sostanze in una settimana tipo?", st["Elenco"]),
        Paragraph("Il sonno com'è davvero: a che ora vai a letto, quante volte ti svegli, come ti senti al mattino?", st["Elenco"]),
        Paragraph("Che cosa hai già provato, e che cosa ha funzionato anche solo un po'?", st["Elenco"]),
        Paragraph("Che cosa vorresti fosse diverso tra sei settimane, in termini concreti e osservabili?", st["Elenco"]),
        Paragraph("C'è qualcosa che non hai scritto nel documento e che vorresti dirmi adesso?", st["Elenco"]),
        Spacer(1, 3 * mm),
        Paragraph(
            "Se hai in mano le risposte ai questionari, evita di leggerle ad alta voce come un referto. È più "
            "utile dire: «ho letto che nelle ultime due settimane l'umore ti è pesato quasi ogni giorno; "
            "raccontami com'è una giornata». La persona riconosce o corregge: in entrambi i casi il dato diventa "
            "clinico.",
            st["Corpo"],
        ),
        Spacer(1, 3 * mm),
        Paragraph("Se la persona usa il programma anche in seduta", st["Sezione"]),
        Paragraph(
            "La barra in alto dice dove sta girando il programma — browser, PWA installata o applicazione per "
            "computer —, se un modello locale risponde e se il microfono è pronto, con il permesso da concedere. "
            "<b>Ferma l'audio</b> interrompe la voce in qualsiasi momento, <b>Indietro</b> torna alla pagina "
            "precedente e <b>Aiuto subito</b> mette i numeri di emergenza a un tocco: serve se durante il "
            "colloquio emerge un rischio che non avevi previsto.",
            st["Corpo"],
        ),
        Paragraph(
            "Un avviso da dare prima: la dettatura usa il riconoscimento vocale del browser e su Chrome ed Edge "
            "l'audio può essere elaborato dai loro server. Per contenuti clinici sensibili conviene la tastiera. "
            "La voce in uscita resta invece sul dispositivo.",
            st["Corpo"],
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------- Privacy
    storia += [
        Paragraph("Privacy, consenso, conservazione", st["Capitolo"]),
        Paragraph(
            "Il programma non ha account e non ha server. Colloquio, questionari, diario, schede del pensiero e "
            "relazione restano nel <i>localStorage</i> del browser, su quel dispositivo. Il PDF viene costruito "
            "nel browser e scaricato: nessuna telemetria, nessuna pubblicità, nessun invio a terzi.",
            st["Corpo"],
        ),
        Paragraph("Che cosa comporta per te", st["Sezione"]),
        Paragraph("il documento che ricevi contiene <b>dati relativi alla salute</b>: trattali come tali, con la base giuridica, le misure di sicurezza e i tempi di conservazione del tuo studio o servizio;", st["Elenco"]),
        Paragraph("l'identificativo non è una firma: annota tu data e modalità di ricezione, e conserva il file dove conservi la documentazione clinica, non nella posta personale;", st["Elenco"]),
        Paragraph("la persona può cancellare i dati del browser in qualsiasi momento: se ti serve la storia, chiedile un backup JSON o una nuova compilazione guidata;", st["Elenco"]),
        Paragraph("se il documento ti arriva per email o tramite un familiare, verifica consenso e identità prima di usarlo;", st["Elenco"]),
        Paragraph("il segreto professionale e i limiti di riservatezza verso i familiari restano tuoi: il programma non li gestisce e non li conosce.", st["Elenco"]),
        Spacer(1, 3 * mm),
        Paragraph("Che cosa puoi dire alla persona", st["Sezione"]),
        Paragraph(
            "«Il programma ti ha aiutato a mettere in ordine quello che senti, e questo file mi serve per "
            "partire. Non è una diagnosi e non decide nulla: quello che conta è quello che mi racconti adesso.»",
            st["Corpo"],
        ),
        Spacer(1, 2 * mm),
        riquadro(
            "<b>Un limite da ricordare.</b> Il documento è generato sul dispositivo della persona: può essere "
            "rigenerato, modificato o compilato da qualcun altro. Non è un atto verificabile, e questo va tenuto "
            "presente se il suo contenuto dovesse avere conseguenze per terzi.",
            st, doc, colors.HexColor("#eef3f8"), ACCENTO,
        ),
        PageBreak(),
    ]

    # ------------------------------------------------------ Scheda di sintesi
    storia += [
        Paragraph("Scheda di sintesi", st["Capitolo"]),
        Paragraph(
            "Una pagina da tenere accanto alla relazione, per il primo incontro e per la discussione di équipe.",
            st["Corpo"],
        ),
        Spacer(1, 2 * mm),
        tabella(
            [
                ["Leggere il profilo prima dei totali", "Citare la fascia come cut-off diagnostico"],
                ["Cercare l'item critico (UMS-9, nono item)", "Sommare o mediare strumenti diversi"],
                ["Pesare durata, impatto e funzionamento", "Confrontare la persona con altri o con sé stessi"],
                ["Escludere cause mediche e sostanze", "Trattare la percentuale come percentile"],
                ["Verificare la sicurezza di persona", "Dedurre l'assenza di rischio da un «no»"],
                ["Chiedere che cosa non è stato scritto", "Usare il PDF come referto o perizia"],
            ],
            ["Fare", "Non fare"],
            st, doc,
            larghezze=[doc.width * 0.5, doc.width * 0.5],
        ),
        Spacer(1, 4 * mm),
        Paragraph("Riferimenti", st["Sezione"]),
    ]
    visti = set()
    for s in cl["scales"]:
        for r in s["riferimenti"]:
            if r in visti:
                continue
            visti.add(r)
            storia.append(Paragraph("• " + e(r), st["Piccolo"]))
    for extra in (
        "Regolamento UE 2017/745 sui dispositivi medici (esclusione dei software non diagnostici)",
        "Mokkink L.B. et al., COSMIN checklist for methodological quality, Qual Life Res 2010",
        "World Medical Association, Dichiarazione di Helsinki, ultima revisione",
    ):
        if extra not in visti:
            storia.append(Paragraph("• " + e(extra), st["Piccolo"]))
    storia += [
        Spacer(1, 4 * mm),
        Paragraph(
            "Guida per il professionista di Psicologo Digitale · versione " + e(d["versione"]) + " · " + e(d["repo"]) +
            "<br/>Documento di supporto alla lettura della relazione. Non è un dispositivo medico, non formula "
            "diagnosi e non sostituisce la valutazione clinica.",
            st["Piccolo"],
        ),
    ]

    doc.multiBuild(storia)
    return doc.page


def main():
    if not os.path.exists(DATI):
        sys.exit("Manca assets/data/vademecum.json: esegui prima `node scripts/export-data.cjs`.")
    with open(DATI, "r", encoding="utf-8") as fh:
        d = json.load(fh)
    if "clinico" not in d:
        sys.exit("Il JSON non contiene i dati del clinico: riesegui `node scripts/export-data.cjs`.")

    os.makedirs(USCITA, exist_ok=True)
    percorso = os.path.join(USCITA, NOME)
    pagine = costruisci(percorso, d)
    peso = os.path.getsize(percorso) / 1024
    print("%-58s %3d pagine  %6.1f KB" % (NOME, pagine, peso))


if __name__ == "__main__":
    main()
