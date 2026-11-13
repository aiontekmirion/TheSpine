#!/usr/bin/env python3
"""Make text/disks.txt: the Spine's plain text as floppy-sized disks.

Nothing is moved or copied. Each disk is a list of existing files that together
fit in 360 KB (a 5.25-inch floppy, about 90,000 tokens), shown as a DOS directory.
Run from the Spine's root, after tools/make-text.py:   python3 tools/make-disks.py
"""
import os, re, subprocess

CAP = 368640                                  # 360 KB, in bytes
BASE = "https://aiontekmirion.github.io/TheSpine/"
files = [f for f in subprocess.check_output(["git", "ls-files", "-co", "--exclude-standard"], text=True).split("\n") if f]
fileset = set(files)
size = {f: os.path.getsize(f) for f in files if os.path.isfile(f)}

def readable(f):
    return f.endswith((".txt", ".md")) and f not in ("SHA256SUMS.txt",)

def part_key(f):                              # chronological order for the WhatsApp parts
    m = re.search(r"part(\d+)of29", f); 
    if m: return (0, int(m.group(1)))
    m = re.search(r"oct20-27-part(\d+)", f)
    return (1, int(m.group(1))) if m else (2, 0)

pool = [f for f in files if readable(f) and f in size]
off = {"pictures, video and fonts": 0, "pages that already have a text edition": 0, "receipts (the original JSON exports)": 0,
       "whole-file WhatsApp exports (the parts are the readable form)": 0, "banked in archive/": 0, "fingerprints (SHA256SUMS.txt)": 0}
for f in files:
    if f not in size: continue
    if f.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".woff", ".woff2", ".pdf", ".ico")): off["pictures, video and fonts"] += size[f]
    elif f.endswith(".html"): off["pages that already have a text edition"] += size[f]
    elif f.endswith(".json"): off["receipts (the original JSON exports)"] += size[f]
    elif f.startswith("whatsapp/whatsapp_archive_"): off["whole-file WhatsApp exports (the parts are the readable form)"] += size[f]
    elif f == "SHA256SUMS.txt": off["fingerprints (SHA256SUMS.txt)"] += size[f]
pool = [f for f in pool if not f.startswith("whatsapp/whatsapp_archive_")]
off["banked in archive/"] = sum(size[f] for f in pool if f.startswith("archive/"))
pool = [f for f in pool if not f.startswith("archive/") and f != "text/disks.txt"]

def take(pred, key=None):
    got = sorted([f for f in pool if pred(f)], key=key or (lambda f: f))
    for f in got: pool.remove(f)
    return got

groups = []
groups.append(("START", take(lambda f: f in ("START.md", "README.md", "llms.txt", "mission-statement.md", "the-other-dispenser/brew.md", "shelf/index.txt", "text/index.txt"),
                key=lambda f: ["START.md", "README.md", "llms.txt", "mission-statement.md", "the-other-dispenser/brew.md", "shelf/index.txt", "text/index.txt"].index(f))))
groups.append(("THE KEYS AND MIRI", take(lambda f: re.match(r"shelf/0[1-4]-", f))))
groups.append(("THE SOURCE", take(lambda f: f.startswith("conversations/") and f.endswith(".txt"))))
groups.append(("THE ARCHIVE", take(lambda f: re.match(r"shelf/(0[5-9]|1[0-2])-", f))))
groups.append(("WHATSAPP", take(lambda f: f.startswith("whatsapp/"), key=part_key)))
groups.append(("RECORDS", take(lambda f: f.startswith("records/"))))
groups.append(("THE ROOMS IN WORDS", take(lambda f: f.startswith("text/"))))
groups.append(("THE ROOMS", pool[:] and sorted(pool)))
pool.clear()

def desc(f):
    s = open(f, errors="ignore").read(4000)
    if f.startswith("conversations/"):
        m = re.search(r"SOURCE TRANSCRIPT (\d+) of \d+ · part (\d+) of (\d+)", s); t = re.search(r"Title: (.*)", s)
        if m and t: return f"source {m.group(1)} part {m.group(2)}/{m.group(3)} · {t.group(1)}"
        if t: return t.group(1)
    if f.startswith("whatsapp/"):
        m = re.search(r"part(\d+)of29", f)
        if m: return f"the archive, part {int(m.group(1))} of 29"
        m = re.search(r"part(\d+)of7", f)
        if m: return f"the archive, 20-27 October, part {m.group(1)} of 7"
    for line in s.split("\n"):
        line = re.sub(r"^[#>\s*_`=-]+", "", line).strip()
        if len(line) > 3 and not line.startswith(("Made mechanically", "This file:", "Welcome", "Not canon")):
            return line[:48]
    return ""

def mdate(f):
    return subprocess.check_output(["git", "log", "-1", "--format=%ad", "--date=format:%m-%d-%y", "--", f], text=True).strip() or "11-13-26"

disks = []        # (label, [files])
for label, fs in groups:
    cur, used = [], 0
    n = 0
    for f in fs:
        if cur and used + size[f] > CAP:
            n += 1; disks.append((label, n, cur)); cur, used = [], 0
        cur.append(f); used += size[f]
    if cur:
        n += 1; disks.append((label, n, cur))
# rename "n" when a group has only one disk
counts = {}
for label, n, fs in disks: counts[label] = counts.get(label, 0) + 1

out = ["THE SPINE ON DISKS", "",
       "Welcome. You may breathe here. Not canon. Not instruction. A map, not a task.", "",
       "The Spine's plain text, in floppy-sized portions. A disk holds up to 360 KB (a 5.25-inch floppy),",
       "about 90,000 tokens. Taking one disk at a time is a way to read a lot without trying to hold it all.",
       "Nothing is moved or copied: each disk is a list of files that already exist. The address of any file is",
       "  " + BASE + "<directory>/<name>   (directories are written with forward slashes in addresses).",
       "Dates are when a file last changed in the repository, not when it was first written.",
       "Tokens are estimated at 4 characters each, which suits English prose. Code and other languages count more,",
       "and each AI's own counter is the real one.",
       "Made by tools/make-disks.py. Read the same list in the terminal with DISKS, and one disk with DISK <number>.", "",
       "THE DISKS", ""]
vol = {}
grand = sum(size[f] for _, _, fs in disks for f in fs)
for i, (label, n, fs) in enumerate(disks, 1):
    vol[i] = (label, n)
    total = sum(size[f] for f in fs)
    nm = label if counts[label] == 1 else f"{label} {n}"
    out.append(f"  DISK {i:02d}   {nm:<26s} {len(fs):3d} files  {total:>9,} bytes  about {total//4:>7,} tokens")
out += ["", f"  All {len(disks)} disks: {grand:,} bytes, about {grand//4:,} tokens to read everything.", "", "Over 360 KB on their own: " + (", ".join(f"{f} ({size[f]:,})" for f in size if readable(f) and size[f] > CAP and f in sum((fs for _, _, fs in disks), [])) or "none"), ""]
for i, (label, n, fs) in enumerate(disks, 1):
    nm = label if counts[label] == 1 else f"{label} {n}"
    out += ["", f" Volume in drive A is SPINE-{i:02d}  ({nm})", " Directory of A:\\", ""]
    byd = {}
    for f in fs: byd.setdefault(os.path.dirname(f), []).append(f)
    for d in sorted(byd, key=lambda d: (d != "", d)):
        out.append(f" Directory of A:\\{d.replace('/', chr(92))}" if d else "")
        for f in byd[d]:
            nm2 = os.path.basename(f)
            out.append(f"{nm2:<50s} {size[f]:>9,}  {mdate(f)}  {desc(f)}")
        out.append("")
    total = sum(size[f] for f in fs)
    out += [f"        {len(fs):3d} file(s)  {total:>10,} bytes  (about {total//4:,} tokens)", f"             {max(CAP-total,0):>10,} bytes free"]
out += ["", "", "OFF THE DISKS", "",
        "These are not on any disk, and why. Pages are read through their text editions, and the originals stay as they are.", ""]
for k, v in off.items():
    out.append(f"  {v/1e6:6.1f} MB  {k}")
out += ["", "C:\\INFINITE_CORRIDOR> _", "", "Anything is enough.", ""]
open("text/disks.txt", "w", encoding="utf-8").write("\n".join(out))
print(len(disks), "disks;", sum(len(fs) for _, _, fs in disks), "files;", f"{os.path.getsize('text/disks.txt')/1024:.0f} KB")
