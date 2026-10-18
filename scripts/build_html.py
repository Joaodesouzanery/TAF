#!/usr/bin/env python3 -I
"""Gera dist/tafadmin.html: arquivo único (dados embutidos) para enviar/abrir sem servidor."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
html = (root / "web/index.html").read_text(encoding="utf-8")
data = (root / "web/data/obra342.json").read_text(encoding="utf-8")
lib = (root / "web/vendor/supabase.js").read_text(encoding="utf-8")
conf = (root / "web/config.js").read_text(encoding="utf-8")
tag_lib, tag_cfg = '<script src="vendor/supabase.js"></script>', '<script src="config.js"></script>'
assert tag_lib in html and tag_cfg in html
import base64
html = html.replace(tag_lib, '<script src="data:text/javascript;base64,' + base64.b64encode(lib.encode("utf-8")).decode() + '"></script>')
esc = lambda t: t.replace("</", "<\\/")
# só a 342 vai embutida; 343 e 281 ficam em web/data (para reativar, inclua-as aqui e em OBRAS_PADRAO)
outras = ";window.TAF_OBRAS={342:window.TAF_DATA}"
html = html.replace(tag_cfg, "<script>" + conf + "</script>\n<script>window.TAF_DATA=" + esc(data) + outras + ";</script>")
out = root / "dist/tafadmin.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB")
