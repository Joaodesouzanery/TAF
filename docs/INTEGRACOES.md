# Integrações: NF-e e Sankhya

Estado: **nada é chamado externamente**. O app funciona sem nenhuma credencial.

## NF-e
- **Hoje**: "Importar XML" em *Notas e rateio* lê o XML da NF-e no navegador (emitente, CNPJ, número, chave de 44 dígitos, data, valor, itens, retenções quando existirem), sugere a OC pelo fornecedor e valor (dentro da tolerância) e recusa chave repetida. O rateio continua manual.
- **Depois**: contratar um provedor que baixe os XMLs contra o CNPJ da TAF (ex.: Focus NFe, Arquivei). Ponto de encaixe: objeto `FISCAL` em `web/index.html` e a função `importaXmls(lista)`; o provedor só precisa entregar `[nome, textoXML]`. Guardar credencial no servidor (função do Supabase), nunca no HTML.

## Sankhya
- Só pela **API oficial** da Sankhya (gateway com appkey + token do desenvolvedor e usuário de integração). Sem engenharia reversa. O repositório `morluto/rea` não se aplica: é ferramenta de análise de binários, não integração de ERP.
- **Quem faz**: o administrador do Sankhya da TAF gera o acesso. Não colocar senha/token no chat nem no HTML.
- **Mapeamento proposto**: obra → centro de resultado; conta do plano de contas → natureza; nota rateada → lançamento financeiro (parceiro = CNPJ do emitente); competência → fechamento.
- **Hoje**: *Financeiro → Fechamento e integrações* gera o arquivo do contador (CSV `;`, vírgula decimal, UTF-8) e um arquivo de apoio com colunas básicas para o Sankhya. O layout final depende da rotina de importação configurada lá.
- **Próximo passo** quando houver credencial: função no Supabase que autentica na API, lê naturezas e centros de resultado para conferir o plano de contas e envia os lançamentos do fechamento.
