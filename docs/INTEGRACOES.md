# Integrações: NF-e automática

Estado em 18/10/2026: **construídas e testadas contra servidores simulados; ainda não validadas com um provedor real**, porque dependem de credenciais da TAF. O app continua funcionando sem elas.

## Como funciona
- Por isso as integrações **exigem o login ativo** (`modo: 'supabase'` em `web/config.js`). No modo aberto os botões explicam isso funcionando.

## NF-e automática (provedor)
- Função `nfe-sync`: lista as NF-e recebidas contra o CNPJ da TAF e baixa o XML de cada uma; o app importa pelo mesmo caminho do "Importar XML" (chave única, sugestão de OC, rateio manual fechando 100%).
- Provedor padrão: **Focus NFe** (HTTP Basic com o token). Rotas usadas: `GET /v2/nfes_recebidas?cnpj=…&versao=…` e `GET /v2/nfes_recebidas/{chave}.xml`. A documentação pública confirma a consulta de NF-e recebidas e a manifestação do destinatário; **a listagem com `versao` e o download do XML precisam ser confirmados com o token de homologação**. Outro provedor: trocar `NFE_PROVIDER_URL` e ajustar `nfe.ts`.
- Secrets: `NFE_PROVIDER_TOKEN`, `NFE_CNPJ` (e opcional `NFE_PROVIDER_URL`).
- O provedor precisa estar habilitado para captura de notas contra o CNPJ da TAF (ciência da operação).

## Passos para ligar (feitos pelo usuário)
1. No painel do Supabase (projeto TAF): *Edge Functions → Secrets*, cadastrar os secrets acima. Nunca no chat nem no repositório.
3. Reativar o login (`modo: 'supabase'`), criar a conta do administrador e fechar o cadastro aberto.
4. Em *Financeiro → Fechamento e integrações*: "Buscar notas novas".

## Sem credenciais, o que já funciona
- Importar XML de NF-e à mão e arquivo do contador (Financeiro → Fechamento).
- Apuração estimada de tributos (Financeiro → Apuração de tributos).
