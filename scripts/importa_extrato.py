"""Converte os dois exports financeiros da obra (por natureza e por lançamento, .xls) em web/data/extrato<obra>.json.
Uso: python3 scripts/importa_extrato.py <obra> <por_natureza.xls> [<lancamentos.xls> [<cod_natureza>]]   (precisa de xlrd)"""
import sys, json, re, datetime, xlrd
obra, nat_xls = sys.argv[1], sys.argv[2]
lan_xls = sys.argv[3] if len(sys.argv) > 3 else None
nat_cod = sys.argv[4] if len(sys.argv) > 4 else ""   # código da natureza aberta ao exportar os lançamentos
def num(v):
    if v in ('', None): return 0.0
    if isinstance(v, (int, float)): return round(float(v), 2)
    s = str(v).strip().replace('R$', '').replace(' ', '')
    if not s: return 0.0
    return round(float(s.replace('.', '').replace(',', '.')) if ',' in s else float(s), 2)
def dt(v, book):
    if v in ('', None): return ''
    if isinstance(v, float): return (datetime.date(1899, 12, 30) + datetime.timedelta(days=int(v))).isoformat()
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})', str(v)); return f'{m[3]}-{m[2]}-{m[1]}' if m else ''
def folha(path):
    b = xlrd.open_workbook(path); s = b.sheet_by_index(0)
    emi = s.cell_value(1, 0); m = re.search(r'(\d{2})/(\d{2})/(\d{4})', emi)
    return b, s, (f'{m[3]}-{m[2]}-{m[1]}' if m else '')
b, s, corte = folha(nat_xls)
H = [str(c).strip() for c in s.row_values(2)]
ix = {h: i for i, h in enumerate(H)}
campos = [('fat', 'Faturado'), ('rec', 'Faturado (Recebido)'), ('areceber', 'Faturado (A Receber)'), ('atrasoRec', 'Faturado (Atrasado)'), ('saldoCR', 'Saldo Por CR'),
          ('gasto', 'Gasto'), ('pago', 'Gasto (Pago)'), ('aPagar', 'Gasto (A Pagar)'), ('atrasado', 'Gasto (Atrasado)'), ('req', 'Gasto (Requisição)'), ('prov', 'Prov. Gasto'),
          ('impD', 'Impostos Débito'), ('impC', 'Imposto Crédito'), ('impF', 'Imposto Final')]
nat = []
for r in range(3, s.nrows):
    v = s.row_values(r)
    if not str(v[ix['Cód. Natureza']]).strip(): continue
    d = {'cod': str(int(float(v[ix['Cód. Natureza']]))), 'nome': str(v[ix['Natureza']]).strip(), 'cr': str(int(float(v[ix['Cód. CR.']]))), 'crNome': str(v[ix['Centro de Resultado']]).strip()}
    for k, h in campos: d[k] = num(v[ix[h]])
    d['foraGasto'] = bool(re.search(r'ADIANTAMENTO A FORNECE', d['nome']))
    nat.append(d)
lanc = []
if lan_xls:
    _, s2, _ = folha(lan_xls); H2 = [str(c).strip() for c in s2.row_values(2)]; j = {h: i for i, h in enumerate(H2)}
    for r in range(3, s2.nrows):
        v = s2.row_values(r)
        if not str(v[j['Origem']]).strip(): continue
        lanc.append({'origem': v[j['Origem']], 'rd': v[j['Receita/Despesa']], 'prov': v[j['Provisão?']], 'nota': str(int(float(v[j['Nr. Nota']]))), 'empresa': v[j['Empresa']],
                     'parceiro': v[j['Parceiro']], 'desdob': num(v[j['Vlr. Desdobramento']]), 'valorNota': num(v[j['Vlr. Nota']]), 'dtNeg': dt(v[j['Dt. Negociação']], b),
                     'dtBaixa': dt(v[j['Dt. Baixa']], b), 'vendComp': v[j['Vendedor/Comprador']], 'venc': dt(v[j['Dt. Vencimento']], b), 'top': str(int(float(v[j['TOP']]))),
                     'topDesc': v[j['Descrição TOP']], 'tipoMov': v[j['Tipo Movimento']], 'natCod': nat_cod})
out = {'obra': obra, 'corte': corte, 'nat': nat, 'lanc': lanc}
json.dump(out, open(f'web/data/extrato{obra}.json', 'w'), ensure_ascii=False, indent=1)
print(obra, 'corte', corte, len(nat), 'naturezas', len(lanc), 'lançamentos')
