#!/usr/bin/env python3 -I
"""Importa a obra 342 (Estudo REV10) -> web/data/obra342.json + supabase/seed/342.sql.

Uso: python3 -I scripts/import_planilhas.py <Estudo.xlsx> [saida_dir]
"""
import json, sys, datetime as dt
from pathlib import Path
import openpyxl

ESTUDO = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT
CONTRATO_342 = 3257970.74
ISS_TRIB = 0.085  # ISS 2% + lucro presumido 6,5% (doc rev01, sec. 5)
NAT = ["MO", "MAT", "EQP", "TER", "ADM"]  # colunas K..O da aba 31


def d(v):
    return v.date().isoformat() if isinstance(v, (dt.datetime, dt.date)) else None


def rows(ws, header_row, max_col):
    it = ws.iter_rows(values_only=True, max_col=max_col)
    data = list(it)
    hdr = data[header_row - 1]
    return [dict(zip(hdr, r)) for r in data[header_row:] if any(c is not None for c in r)]


wb = openpyxl.load_workbook(ESTUDO, read_only=True, data_only=True)

# --- EAP (aba 31) ---------------------------------------------------------
eap, pai_stack = [], {}
for r in rows(wb["31. COMPOSIÇÃO POR ITEM"], 3, 16):
    cod = r["Código"]
    if not cod or cod == "GERAL":
        continue
    nivel = int(r["Nível"])
    pai_stack[nivel] = cod
    nat = {n: round(r[c] or 0, 2) for n, c in zip(
        NAT, ["Mão de obra", "Material e equipamento fornecido", "Máquinas e veículos",
              "Serviços de terceiros", "Indireto da obra"])}
    eap.append({
        "codigo": cod, "descricao": (r["Descrição"] or "").strip(), "unidade": r["Und"],
        "qtd": r["Qtd"], "nivel": nivel, "pai": pai_stack.get(nivel - 1) if nivel > 1 else None,
        "tipo_linha": r["Tipo"].lower(),
        "preco_venda_total": round(r["Preço licitado"] or 0, 2),
        "custo_direto_composicao": round(r["Custo direto"] or 0, 2),
        "natureza": nat,
    })
por_cod = {e["codigo"]: e for e in eap}

# --- Pacotes (aba 11) ------------------------------------------------------
pacotes = []
for r in rows(wb["11. META - PACOTES"], 3, 18):
    if not r.get("Pacote") or r["Pacote"] == "TOTAL":
        continue
    pacotes.append({
        "codigo": r["Pacote"], "nome": r["O que fechar"], "tipo": r["Tipo"],
        "responsavel": r["Responsável"], "eventos": r["Eventos"],
        "precisa_em_obra": d(r["Precisa em obra"]), "antecedencia_dias": r["Antecedência (dias)"],
        "fechar_ate": d(r["Fechar até"]), "meta": round(r["Meta de custo"] or 0, 2),
        "teto": round(r["Teto (margem zero)"] or 0, 2), "sem_cotacao": r["Sem cotação"] or 0,
        "condicao_pagamento": r["Condição de pagamento meta"], "observacoes": r["Observações"],
    })

# --- Meta por item (aba 12) ------------------------------------------------
sem_meta, itens_meta = [], 0
for r in rows(wb["12. META - ITENS"], 3, 21):
    cod = r.get("Item")
    if not cod or cod not in por_cod:
        continue
    e = por_cod[cod]
    qtd = r["Qtd"] or e["qtd"] or 0
    meta_total = round(r["Custo adotado"] if r["Custo adotado"] is not None else r["Meta custo total"], 2)
    e.update({
        "pacote": r["Pacote"], "evento": r["Evento"], "tipo": r["Tipo"],
        "meta_unit": round(meta_total / qtd, 4) if qtd else 0,
        "meta_total": meta_total, "teto_total": round(r["Teto total (margem zero)"] or 0, 2),
        "status_cotacao": r["Status"], "fonte_meta": r["Fonte da meta"],
        "precisa_em_obra": d(r["Precisa em obra"]), "fechar_ate": d(r["Fechar até"]),
    })
    itens_meta += 1

items = [e for e in eap if e["tipo_linha"] == "item"]
for e in items:
    if "meta_total" not in e:
        sem_meta.append(e["codigo"])
    # teto = preço licitado x (1 - 8,5%) quando a planilha não trouxe
    e.setdefault("teto_total", round(e["preco_venda_total"] * (1 - ISS_TRIB), 2))

# --- Conferências ------------------------------------------------------------
soma_venda = round(sum(e["preco_venda_total"] for e in items), 2)
meta_pac = round(sum(p["meta"] for p in pacotes), 2)
meta_itens = round(sum(e.get("meta_total", 0) for e in items), 2)
rel = {
    "itens": len(items), "grupos": len(eap) - len(items), "pacotes": len(pacotes),
    "soma_preco_licitado": soma_venda, "contrato": CONTRATO_342,
    "diferenca_contrato": round(soma_venda - CONTRATO_342, 2),
    "meta_total_itens": meta_itens, "meta_total_pacotes": meta_pac,
    "dif_meta_itens_x_pacotes": round(meta_itens - meta_pac, 2),
    "itens_sem_meta": sem_meta,
    "itens_a_cotar": sum(1 for e in items if e.get("status_cotacao") == "A cotar"),
    "meta_a_cotar": round(sum(e.get("meta_total", 0) for e in items if e.get("status_cotacao") == "A cotar"), 2),
    "fonte": ESTUDO.name,
    "aviso": "META DE COMPRA enviada está marcada SUBSTITUÍDO pela REV02; usada a aba 11/12 do Estudo REV10. Aguardando REV13/META REV02.",
}
obra = {
    "codigo": "342", "nome": "UTR ETA Santo Antônio do Descoberto", "contratante": "SANEAGO",
    "contrato": "30000196/2026", "municipio": "Santo Antônio do Descoberto - GO",
    "valor_contrato": CONTRATO_342, "regime": "Preço global por evento (Anexo VII)",
    "tributos_nota": ISS_TRIB, "inicio_canteiro": "2026-10-19",
    "linha_base": {"versao": 1, "origem": "Estudo REV10 + META (aba 11/12)", "congelada": False},
}
(OUT / "web/data").mkdir(parents=True, exist_ok=True)
(OUT / "web/data/obra342.json").write_text(
    json.dumps({"obra": obra, "pacotes": pacotes, "eap": eap, "relatorio": rel},
               ensure_ascii=False, indent=1), encoding="utf-8")

# --- SQL seed -------------------------------------------------------------
def q(v):
    if v is None: return "null"
    if isinstance(v, (int, float)): return repr(v)
    return "'" + str(v).replace("'", "''") + "'"

L = ["-- gerado por scripts/import_planilhas.py (obra 342)", "begin;",
     f"insert into obra(codigo,nome,contratante,contrato,municipio,valor_contrato,regime,tributos_nota) values "
     f"({q(obra['codigo'])},{q(obra['nome'])},{q(obra['contratante'])},{q(obra['contrato'])},{q(obra['municipio'])},"
     f"{obra['valor_contrato']},{q(obra['regime'])},{obra['tributos_nota']});"]
for p in pacotes:
    L.append("insert into pacote(obra_id,codigo,nome,tipo,responsavel,precisa_em_obra,fechar_ate,meta,teto,condicao_pagamento,observacoes) "
             f"select id,{q(p['codigo'])},{q(p['nome'])},{q(p['tipo'])},{q(p['responsavel'])},{q(p['precisa_em_obra'])},{q(p['fechar_ate'])},"
             f"{p['meta']},{p['teto']},{q(p['condicao_pagamento'])},{q(p['observacoes'])} from obra where codigo='342';")
for e in eap:
    L.append("insert into item_eap(obra_id,codigo,descricao,unidade,qtd,nivel,pai_codigo,eh_item,preco_venda_total,meta_total,teto_total,fonte_meta,status_cotacao,evento,pacote_id) "
             f"select o.id,{q(e['codigo'])},{q(e['descricao'])},{q(e['unidade'])},{q(e['qtd'])},{e['nivel']},{q(e['pai'])},"
             f"{str(e['tipo_linha']=='item').lower()},{e['preco_venda_total']},{q(e.get('meta_total'))},{q(e.get('teto_total'))},"
             f"{q(e.get('fonte_meta'))},{q(e.get('status_cotacao'))},{q(e.get('evento'))},"
             f"(select p.id from pacote p where p.obra_id=o.id and p.codigo={q(e.get('pacote'))}) from obra o where o.codigo='342';")
L.append("commit;")
(OUT / "supabase/seed").mkdir(parents=True, exist_ok=True)
(OUT / "supabase/seed/342.sql").write_text("\n".join(L), encoding="utf-8")
print(json.dumps(rel, ensure_ascii=False, indent=1))
