#!/usr/bin/env python3 -I
"""Gera dist/tafadmin.html: arquivo único (dados embutidos) para enviar/abrir sem servidor."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
html = (root / "web/index.html").read_text(encoding="utf-8")
data = (root / "web/data/obra342.json").read_text(encoding="utf-8")
cfg = '<script src="config.js"></script>'
assert cfg in html
html = html.replace(cfg, "<script>window.TAF_DATA=" + data.replace("</", "<\\/") + ";</script>")
out = root / "dist/tafadmin.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB")
