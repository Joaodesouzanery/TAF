#!/usr/bin/env python3 -I
"""Gera dist/tafadmin_artifact.html: o mesmo app sem <html>/<head>/<body> e sem o supabase-js (modo aberto não usa)."""
import re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
h = (root / "dist/tafadmin.html").read_text(encoding="utf-8")
h = re.sub(r'<script src="data:[^"]*"></script>\n?', "", h)
title = re.search(r"<title>.*?</title>", h).group(0)
fonts = re.findall(r'<link rel="(?:preconnect|stylesheet)"[^>]*>', h)
style = re.search(r"<style>.*?</style>", h, re.S).group(0)
body = re.search(r"<body>(.*)</body>", h, re.S).group(1)
out = title + "\n" + "\n".join(fonts) + "\n" + style + "\n" + body
(root / "dist/tafadmin_artifact.html").write_text(out, encoding="utf-8")
print(len(out) // 1024, "KB")
