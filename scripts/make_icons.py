#!/usr/bin/env python3
"""Psicologo Digitale · genera le icone PNG senza dipendenze esterne.

Disegna il marchio (testa, anello, nucleo, punto ambra) su fondo sfumato,
con supersampling 2x per bordi morbidi.

Uso: python3 scripts/make_icons.py
"""

import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def inside_round_rect(x, y, size, radius):
    r = radius
    if r <= x <= size - r or r <= y <= size - r:
        return 0 <= x <= size and 0 <= y <= size
    cx = r if x < r else size - r
    cy = r if y < r else size - r
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def render(size):
    """Restituisce una lista di righe RGBA alla dimensione richiesta."""
    ss = 2
    w = size * ss
    radius = w * 0.22
    cx, cy = w * 0.46, w * 0.48

    ring_outer = w * 0.335
    ring_inner = w * 0.285
    core_r = w * 0.075
    core_x, core_y = w * 0.585, w * 0.455
    dot_r = w * 0.042
    dot_x, dot_y = w * 0.795, w * 0.205

    acc = [[0] * (size * 4) for _ in range(size)]

    for py in range(w):
        for px in range(w):
            if not inside_round_rect(px, py, w, radius):
                continue

            t = (px + py) / (2.0 * w)
            base = lerp((27, 42, 74), (47, 125, 118), min(1.0, t * 1.25))

            # alone luminoso centrale
            d = ((px - w * 0.45) ** 2 + (py - w * 0.42) ** 2) ** 0.5
            glow = max(0.0, 1.0 - d / (w * 0.55)) * 0.22
            col = lerp(base, (243, 217, 168), glow)

            # anello
            dr = ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5
            if ring_inner <= dr <= ring_outer:
                col = (245, 241, 230)
            elif ring_outer < dr <= ring_outer + w * 0.008:
                col = lerp(col, (245, 241, 230), 0.35)

            # nucleo
            dc = ((px - core_x) ** 2 + (py - core_y) ** 2) ** 0.5
            if dc <= core_r:
                col = (245, 241, 230)

            # punto ambra
            dd = ((px - dot_x) ** 2 + (py - dot_y) ** 2) ** 0.5
            if dd <= dot_r:
                col = (227, 184, 114)

            sx, sy = px // ss, py // ss
            row = acc[sy]
            i = sx * 4
            row[i] += col[0]
            row[i + 1] += col[1]
            row[i + 2] += col[2]
            row[i + 3] += 255

    n = ss * ss
    rows = []
    for y in range(size):
        row = acc[y]
        packed = bytearray(size * 4)
        for x in range(size):
            i = x * 4
            a = row[i + 3] // n
            if a == 0:
                packed[i:i + 4] = b"\x00\x00\x00\x00"
            else:
                packed[i] = row[i] // n
                packed[i + 1] = row[i + 1] // n
                packed[i + 2] = row[i + 2] // n
                packed[i + 3] = a
        rows.append(bytes(packed))
    return rows


def write_png(path, size, rows):
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    header = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)
    print("scritto", path, len(png), "byte")


def main():
    os.makedirs(OUT, exist_ok=True)
    for size in (192, 512):
        rows = render(size)
        write_png(os.path.join(OUT, "icon-%d.png" % size), size, rows)


if __name__ == "__main__":
    main()
