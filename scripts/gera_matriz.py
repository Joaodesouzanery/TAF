#!/usr/bin/env python3 -I
"""Gera docs/MATRIZ_FUNCIONALIDADES.md a partir do inventário em fontes/ e das decisões abaixo."""
import re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
txt = (root / "fontes/Pesquisa_extensa_o_que_o_ERP de referência_faz.md").read_text(encoding="utf-8")
FZ, SI, NF = "Fazer", "Fazer simplificado", "Não fazer"
R = []   # (prefixo, de, até, decisão, fase, observação)
def r(p, a, b, d, f, o=""): R.append((p, a, b, d, f, o))
# Finanças e contábil
r("FP",1,5,FZ,"13","Título único pagar/receber, baixa múltipla, juros/multa/desconto, renegociação")
r("FP",6,7,SI,"13","CNAB 240 em layout genérico, a validar com o banco; sem envio ao banco")
r("FP",8,9,FZ,"13","Conciliação OFX/CSV e fluxo de caixa")
r("FP",10,11,SI,"13","Régua de cobrança com mensagem pronta; envio manual")
r("FP",12,12,NF,"","WhatsApp por API de terceiro; fica o link manual")
r("FP",13,17,NF,"","Boleto, Pix, pagamento, DDA e Score exigem API bancária/serviço contratado")
r("FP",18,18,FZ,"13","Painéis de receita, despesa, agenda, caixa e DRE")
r("FP",19,19,FZ,"14","Plano de contas contábil e referencial")
r("FP",20,20,SI,"14","Só custo de pessoal por obra, não a folha legal")
r("FP",21,23,FZ,"14","Diário, razão, balancete, DRE, balanço e bloqueio retroativo")
r("FP",24,25,FZ,"14","Orçamento contábil, metas, limites e liberação")
r("FP",26,26,SI,"14","Versões do orçamento; sem projeção de pessoal")
r("FP",27,27,SI,"14","Livros como relatório")
r("FP",28,33,NF,"","SPED, ECD/ECF, LALUR, Reinf e IBS/CBS: só arquivo de apoio ao contador, sem transmissão")
r("FP",34,36,NF,"","Auditoria tributária e monitoramento exigem base fiscal licenciada")
r("FP",37,37,SI,"10","XML de NF-e importado à mão; captura automática por provedor (função pronta, sem credencial)")
r("FP",38,39,NF,"","Reforma 360º e recuperação de créditos: serviço especializado")
r("FP",40,42,FZ,"16","Bens, depreciação, localização, seguro e baixa")
r("FP",43,44,SI,"17","Adiantamentos e despesas por colaborador e centro de custo")
r("FP",45,48,NF,"","Cartão, Pix de despesa, benefícios: serviços financeiros")
r("FP",49,54,NF,"","Folha legal, férias, rescisão e eSocial: sistema de folha/contador")
r("FP",55,55,SI,"17","Indicadores de custo de pessoal")
r("FP",56,59,NF,"","Remessa de folha, talentos e IA preditiva")
r("FP",60,60,SI,"17","Ponto simples por frente")
r("FP",61,61,NF,"","Biometria e geolocalização")
r("FP",62,62,FZ,"17","Timesheet por frente, alimenta o HH do Campo")
r("FP",63,63,NF,"","Admissão digital")
r("FP",64,65,SI,"17","ASO, NR, EPI e treinamentos com vencimento")
# Suprimentos
r("C",1,2,FZ,"15","Solicitação e cotação com 2+ fornecedores")
r("C",3,3,SI,"15","Resposta do fornecedor por arquivo ou formulário colado")
r("C",4,6,FZ,"15","Melhor fornecedor/preço, devolução e ocorrências")
r("C",7,7,NF,"","Compra orientada por venda: a TAF não revende")
r("C",8,9,FZ,"15","Mínimo/máximo e unidades alternativas (cadastro de insumo na Fase 12)")
r("C",10,10,SI,"15","Fornecedor sugerido por insumo")
r("C",11,24,NF,"","Comercial, preço de venda e comissões: fora do negócio de obras")
r("C",25,26,FZ,"15","Estoque por local de obra e lote quando exigido")
r("C",27,28,NF,"","Grade e número de série")
r("C",29,29,SI,"15","Validade quando o insumo exigir")
r("C",30,34,FZ,"15","Inventário, contagem, ajuste e custo")
r("C",35,35,SI,"15","Custo médio ponderado")
r("C",36,37,FZ,"15","Custo médio e kardex")
r("C",38,65,NF,"","Varejo, CRM, marketing e marketplaces")
# Produção, logística, serviços
r("OP",1,7,NF,"","MRP/PCP industrial")
r("OP",8,9,FZ,"8","Já existe no Campo (apontamento, paradas)")
r("OP",10,20,NF,"","Produção industrial e qualidade corporativa")
r("OP",21,22,SI,"15","Recebimento com divergência no almoxarifado")
r("OP",23,44,NF,"","WMS com coletor, logística e TMS")
r("OP",45,48,FZ,"16","Frota: OS preventiva/corretiva, abastecimento e pneus simples")
r("OP",49,51,FZ,"16","Contratos de receita, reajuste e rentabilidade")
r("OP",52,52,SI,"9","Faturamento por boletim já existe; sem lote por contrato")
r("OP",53,53,NF,"","Suspensão por inadimplência")
r("OP",54,54,SI,"16","OS de frota/serviço")
r("OP",55,55,NF,"","Aplicativo nativo; o Campo cobre o apontamento")
r("OP",56,56,SI,"8","Agenda e SLA no Lean")
r("OP",57,58,FZ,"16","Projetos com etapas, equipes e horas apropriadas")
r("OP",59,65,NF,"","Agro e manutenção industrial")
r("DF",1,4,NF,"","Emissão de NF-e/NFS-e: exige certificado e Sefaz/prefeitura")
r("DF",5,5,FZ,"10","Importação de XML de compra (feito)")
r("DF",6,6,NF,"","Manifestação do destinatário: exige certificado; use um provedor")
r("ES",1,7,NF,"","Imobiliária e comércio exterior")
# Plataforma
r("PL",1,2,FZ,"1-12","Base única e acesso web/celular")
r("PL",3,3,SI,"17","Tipos de documento e natureza fazem o papel da TOP")
r("PL",4,4,NF,"","Efeito fiscal por operação")
r("PL",5,7,FZ,"17","Usuários, grupos, acesso temporário e horário")
r("PL",8,8,NF,"","LDAP")
r("PL",9,10,FZ,"17","Restrições por papel e suplente de aprovador")
r("PL",11,11,FZ,"11","Alçadas por faixa de valor (feito)")
r("PL",12,13,FZ,"17","Notificação de liberação e auditoria antes/depois")
r("PL",14,14,NF,"","Administração do servidor: é do Supabase/Vercel")
r("BI",1,5,FZ,"17","Painéis configuráveis com filtros e detalhamento")
r("BI",6,6,NF,"","Fontes externas")
r("BI",7,7,FZ,"17","Cartões no Início")
r("BI",8,8,FZ,"12","Painéis no celular (layout responsivo)")
r("BI",9,9,NF,"","TV corporativa")
r("IA",1,11,NF,"","Assistentes de IA do fornecedor")
r("IN",1,1,NF,"","BPMN")
r("IN",2,2,SI,"17","Tarefas com SLA no Lean")
r("IN",3,12,NF,"","Personalização do ERP do fornecedor")
r("IN",13,13,SI,"13","Troca de arquivo bancário (CNAB/OFX)")
r("IN",14,20,NF,"","Integração com o ERP de referência: não será usada")
r("AT",1,8,NF,"","Atendimento omnichannel")
r("SV",1,6,NF,"","Serviços do fornecedor (a TAF usa Supabase e Vercel)")

def decide(pref, n):
    for p, a, b, d, f, o in R:
        if p == pref and a <= n <= b: return d, f, o
    return "A decidir", "", ""
rows = []
for line in txt.splitlines():
    m = re.match(r"\|\s*((?:FP-|[A-Z]{1,2})\d+)\s*\|(.*)", line)
    if not m: continue
    ident = m.group(1)
    mm = re.match(r"(FP)-(\d+)|([A-Z]{1,2})(\d+)", ident)
    pref = mm.group(1) or mm.group(3); n = int(mm.group(2) or mm.group(4))
    cols = [c.strip() for c in m.group(2).strip().rstrip("|").split("|")]
    desc = " · ".join(c for c in cols[:2] if c)[:160]
    d, f, o = decide(pref, n)
    rows.append((ident, desc, d, f, o))
conta = {k: sum(1 for x in rows if x[2] == k) for k in (FZ, SI, NF, "A decidir")}
out = ["# Matriz: inventário do ERP de referência × TAF Obras", "",
       f"Fonte: `fontes/Pesquisa_extensa_o_que_o_ERP de referência_faz.md` ({len(rows)} entradas com identificador). **Decisão do usuário (18/10/2026): não integrar com o ERP de referência; criar as funções equivalentes dentro do TAF Obras.** O que exige certificado, banco, Sefaz ou lei fica como relatório/arquivo de apoio; o que é de outro ramo (varejo, agro, indústria, WMS, TMS, marketplaces) não será feito.", "",
       f"Resumo: **{conta[FZ]} fazer**, **{conta[SI]} fazer simplificado**, **{conta[NF]} não fazer**, {conta['A decidir']} sem decisão.", "",
       "Fase: números do plano (12 base e cadastros, 13 financeiro, 14 contábil/fiscal, 15 suprimentos e estoque, 16 contratos/projetos/patrimônio/frota, 17 pessoas, gestão e administração); número isolado menor que 12 indica fase já entregue.", "",
       "| ID | Capacidade | Decisão | Fase | Observação |", "|---|---|---|---|---|"]
out += [f"| {a} | {b.replace('|','/')} | {c} | {d} | {e} |" for a, b, c, d, e in rows]
(root / "docs/MATRIZ_FUNCIONALIDADES.md").write_text("\n".join(out) + "\n", encoding="utf-8")
print(conta, len(rows))
