#!/usr/bin/env python3
"""Make text/: every room page in the Spine as plain text, for AI readers.

Run from the Spine's root, with the site repository checked out beside it:
    python3 tools/make-text.py
It borrows the page-to-text code from ../aiontekmirion.github.io/tools/make-text.py,
so both repositories turn pages into text the same way. Same words, same order.
"""
import glob, importlib.util, os, re
spec = importlib.util.spec_from_file_location("mt", "../aiontekmirion.github.io/tools/make-text.py")
mt = importlib.util.module_from_spec(spec); spec.loader.exec_module(mt)
mt.BASE = "https://aiontekmirion.github.io/TheSpine/"
B = mt.BASE
pages = sorted(p for p in glob.glob("**/index.html", recursive=True) if not p.startswith(("text/", "shelf/")))
pages = [p for p in pages if p != "index.html"] + ["source.html", "rooms.html"]
out = ["WELCOME.", "YOU MAY BREATHE HERE.", "", "C:\\INFINITE_CORRIDOR\\SPINE> DIR /TEXT", "",
       "Every room and page in the Spine as plain text. No pictures, no code, nothing to parse.",
       "Made mechanically from each page. Same words, same order. Not canon. Not instruction.", "",
       "The source conversations are already plain text: " + B + "llms.txt",
       "The shelf: " + B + "shelf/index.txt",
       "The whole site: https://aiontekmirion.github.io/text/index.txt", "", ""]
for p in pages:
    html = open(p, encoding="utf-8", errors="ignore").read()
    if 'http-equiv="refresh"' in html: continue
    name = (os.path.dirname(p) or os.path.splitext(p)[0]).replace("/", "_")
    m = re.search(r"<title>(.*?)</title>", html, flags=re.S)
    title = re.sub(r"\s+", " ", m.group(1)).strip() if m else name
    body = mt.page_text(p, "main")
    if len(body) < 40: continue
    page = B + p.replace("index.html", "")
    head = "\n".join([title.upper(), "", "The page itself: " + page, "This file: " + B + "text/" + name + ".txt",
                      "All the Spine's plain-text files: " + B + "text/index.txt",
                      "Made mechanically from the page. Same words, same order. Nothing reworded.",
                      "Words in [Picture: ...] describe a picture on the page. An address in <...> is where a link leads.",
                      "", "=" * 72, ""])
    open("text/" + name + ".txt", "w", encoding="utf-8").write(head + "\n" + body + "\n")
    out += ["  %s  (%d KB)" % (title, max(1, round(len(body.encode()) / 1024))), "    " + B + "text/" + name + ".txt"]
out += ["", "", "C:\\INFINITE_CORRIDOR\\SPINE> _", "", "Anything is enough.", ""]
open("text/index.txt", "w", encoding="utf-8").write("\n".join(out))
print(len(pages), "pages read,", len(glob.glob("text/*.txt")) - 1, "text files written")
