"""Conferência independente da obra 342: compara web/data/obra342.json com as planilhas em fontes/ (e imprime os totais para comparar com o banco).
Uso: python3 scripts/verifica_342.py"""
import json, openpyxl, sys
X='fontes/OBRA_342_ESTUDO_DE_OBRA_INTERNO_REV10.xlsx'
wb=openpyxl.load_workbook(X,data_only=True,read_only=True)
d=json.load(open('web/data/obra342.json')); J={e['codigo']:e for e in d['eap'] if e.get('tipo_linha')=='item'}
def tab(nome,hdr_row):
    rows=list(wb[nome].iter_rows(values_only=True)); h=[str(c).strip() if c is not None else '' for c in rows[hdr_row-1]]
    return [dict(zip(h,r)) for r in rows[hdr_row:]]
ok=True
def chk(n,c,det=''):
    global ok; ok&=bool(c); print(('OK    ' if c else 'FALHA ')+n+(' · '+str(det) if det else ''))
t31=[r for r in tab('31. COMPOSIÇÃO POR ITEM',3) if r.get('Tipo') and str(r['Tipo']).lower()=='item']
chk('mesma quantidade de itens (planilha × JSON)',len(t31)==len(J),(len(t31),len(J)))
bad=[r['Código'] for r in t31 if r['Código'] not in J or abs(round(r['Preço licitado'] or 0,2)-J[r['Código']]['preco_venda_total'])>0.005]
chk('preço licitado de cada item confere',not bad,bad[:5])
bad=[r['Código'] for r in t31 if r['Código'] in J and abs((r['Qtd'] or 0)-(J[r['Código']]['qtd'] or 0))>1e-9]
chk('quantidade de cada item confere',not bad,bad[:5])
t12=[r for r in tab('12. META - ITENS',3) if r.get('Item') in J]
bad=[]
for r in t12:
    m=round(r['Custo adotado'] if r['Custo adotado'] is not None else r['Meta custo total'],2); e=J[r['Item']]
    if abs(m-e['meta_total'])>0.005 or abs(round(r['Teto total (margem zero)'] or 0,2)-e['teto_total'])>0.005: bad.append(r['Item'])
chk('meta e teto de cada item (aba 12) conferem',not bad and len(t12)==len(J),(len(t12),bad[:5]))
pk=[r for r in tab('11. META - PACOTES',3) if r.get('Pacote') and r['Pacote']!='TOTAL']
chk('pacotes: quantidade e meta (aba 11) conferem',len(pk)==len(d['pacotes']) and all(abs(round(r['Meta de custo'] or 0,2)-p['meta'])<0.005 for r,p in zip(pk,d['pacotes'])),len(pk))
soma=round(sum(e['preco_venda_total'] for e in J.values()),2); meta=round(sum(e['meta_total'] for e in J.values()),2); teto=round(sum(e['teto_total'] for e in J.values()),2)
print('TOTAIS itens',len(J),'venda',soma,'meta',meta,'teto',teto,'contrato',d['obra']['valor_contrato'])
chk('contrato 342 = R$ 3.257.970,74',d['obra']['valor_contrato']==3257970.74)
chk('soma licitada difere do contrato só em centavos (R$ 29,25 de arredondamento da planilha)',abs(soma-d['obra']['valor_contrato'])<30,round(soma-d['obra']['valor_contrato'],2))
grp={e['codigo'] for e in d['eap'] if e.get('tipo_linha')!='item'}; pais=[e for e in d['eap'] if e.get('pai') and e['pai'] not in {x['codigo'] for x in d['eap']}]
chk('EAP sem pai órfão',not pais,len(pais))
sys.exit(0 if ok else 1)
