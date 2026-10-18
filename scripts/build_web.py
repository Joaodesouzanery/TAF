#!/usr/bin/env python3 -I
"""Monta web/index.html a partir de web/src (shell.html + style.css + js/*.js em ordem). Rode depois de editar qualquer arquivo em web/src."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / "web/src"
shell = (src / "shell.html").read_text(encoding="utf-8")
css = (src / "style.css").read_text(encoding="utf-8").rstrip("\n")
js = "\n".join(p.read_text(encoding="utf-8").rstrip("\n") for p in sorted((src / "js").glob("*.js")))
out = shell.replace("/*@@STYLE@@*/", css).replace("/*@@SCRIPT@@*/", js)
(root / "web/index.html").write_text(out, encoding="utf-8")
print("web/index.html", len(out) // 1024, "KB,", len(list((src / "js").glob("*.js"))), "módulos")
