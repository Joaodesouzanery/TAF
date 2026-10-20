#!/usr/bin/env python3 -I
"""Monta web/index.html a partir de web/src (shell.html + style.css + js/*.js em ordem). Rode depois de editar qualquer arquivo em web/src."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
src = root / "web/src"
# manuais em docs/MANUAL_*.md viram dados da Ajuda embutida (fonte única: os .md)
import json
man = {f.stem[7:]: f.read_text(encoding="utf-8") for f in sorted((root / "docs").glob("MANUAL_*.md"))}
(src / "js/40_ajuda_dados.js").write_text("/* GERADO por scripts/build_web.py a partir de docs/MANUAL_*.md: não edite. */\nconst MANUAIS=" + json.dumps(man, ensure_ascii=False) + ";\n", encoding="utf-8")
ex = {p.stem[7:]: json.loads(p.read_text(encoding="utf-8")) for p in sorted((root / "web/data").glob("extrato*.json"))}
(src / "js/45_extrato_dados.js").write_text("/* GERADO por scripts/build_web.py a partir de web/data/extrato*.json: não edite. */\nwindow.TAF_EXTRATO=" + json.dumps(ex, ensure_ascii=False) + ";\n", encoding="utf-8")
shell = (src / "shell.html").read_text(encoding="utf-8")
css = (src / "style.css").read_text(encoding="utf-8").rstrip("\n")
js = "\n".join(p.read_text(encoding="utf-8").rstrip("\n") for p in sorted((src / "js").glob("*.js")))
out = shell.replace("/*@@STYLE@@*/", css).replace("/*@@SCRIPT@@*/", js)
(root / "web/index.html").write_text(out, encoding="utf-8")
print("web/index.html", len(out) // 1024, "KB,", len(list((src / "js").glob("*.js"))), "módulos")
