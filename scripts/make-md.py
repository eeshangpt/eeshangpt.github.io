#!/usr/bin/env python3
"""Regenerate writing/graphrag-vs-tuned-hybrid/index.md from the page's article block.
Run from repo root after the final article text lands: python3 scripts/make-md.py"""
import html, re
from html.parser import HTMLParser

SRC = "writing/graphrag-vs-tuned-hybrid/index.html"
OUT = "writing/graphrag-vs-tuned-hybrid/index.md"
BASE = "https://eeshangpt.github.io/writing/graphrag-vs-tuned-hybrid/"
REPO = "https://github.com/eeshangpt/graphrag-vs-tuned-hybrid"


class P(HTMLParser):
    def __init__(self):
        super().__init__()
        self.o, self.href, self.rows, self.row, self.cell = [], [], [], None, None

    def w(self, t):
        (self.cell if self.cell is not None else self.o).append(t)

    def handle_starttag(self, t, a):
        a = dict(a)
        if t in ("h2", "h3"):
            self.w("\n\n" + "#" * int(t[1]) + " ")
        elif t == "p":
            self.w("\n\n")
        elif t == "ul":
            self.w("\n")
        elif t == "li":
            self.w("\n- ")
        elif t == "a":
            self.href.append(a.get("href", ""))
            self.w("[")
        elif t == "tr":
            self.row = []
        elif t in ("td", "th"):
            self.cell = []
        elif t == "img":
            self.w(f"\n\n![{a.get('alt', '')}]({BASE}{a.get('src', '')})")
        elif t == "figcaption":
            self.w("\n\n")

    def handle_endtag(self, t):
        if t == "ul":
            self.w("\n")
        elif t == "a":
            h = self.href.pop()
            if h.startswith("/"):
                h = "https://eeshangpt.github.io" + h
            self.w(f"]({h})")
        elif t in ("td", "th"):
            self.row.append("".join(self.cell).strip())
            self.cell = None
        elif t == "tr":
            self.rows.append(self.row)
            self.row = None
        elif t == "table":
            r, self.rows = self.rows, []
            self.o.append("\n\n| " + " | ".join(r[0]) + " |\n|" + "---|" * len(r[0]))
            for x in r[1:]:
                self.o.append("\n| " + " | ".join(x) + " |")

    def handle_data(self, d):
        d = re.sub(r"\s+", " ", d)
        if d.strip():
            self.w(d)


def md(fragment):
    p = P()
    p.feed(fragment)
    return "".join(p.o)


src = open(SRC, encoding="utf-8").read()
title = html.unescape(re.search(r"<h1>(.*?)</h1>", src).group(1))
body = re.search(r'<div class="article-body">(.*?)</div>\s*<!-- ARTICLE BODY END', src, re.S).group(1)
box = re.search(r"<!-- BOX START -->(.*?)<!-- BOX END", src, re.S).group(1)
text = (f"# {title}\n\nBy Eeshan Gupta. Published 24 October 2026. Canonical page: {BASE}\n"
        f"{md(body)}\n\n{md(box).strip()}\n")
text = html.unescape(re.sub(r"\n{3,}", "\n\n", text)).strip() + "\n"
open(OUT, "w", encoding="utf-8").write(text)
print("wrote", OUT, len(text))
