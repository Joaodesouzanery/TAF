# Integrações: NF-e automática e Sankhya

Estado em 18/10/2026: **construídas e testadas contra servidores simulados; ainda não validadas com o Sankhya nem com um provedor reais**, porque dependem de credenciais da TAF. O app continua funcionando sem elas.

## Como funciona
- O app (no navegador) **nunca guarda credencial**. Os botões chamam duas funções do Supabase (`supabase/functions/nfe-sync` e `supabase/functions/sankhya-sync`), que leem as credenciais dos *secrets* do projeto e só respondem a usuário logado com papel Administrativo, Financeiro, Gestão, Diretoria ou Administrador.
- Por isso as integrações **exigem o login ativo** (`modo: 'supabase'` em `web/config.js`). No modo aberto os botões explicam isso, e a pré-visualização do envio ao Sankhya continua funcionando.
- Lógica testável sem Deno em `supabase/functions/_shared/`: `nfe.ts`, `sankhya.ts`, `auth.ts`. Teste: `node --experimental-strip-types scripts/test_integracoes.mjs`.

## NF-e automática (provedor)
- Função `nfe-sync`: lista as NF-e recebidas contra o CNPJ da TAF e baixa o XML de cada uma; o app importa pelo mesmo caminho do "Importar XML" (chave única, sugestão de OC, rateio manual fechando 100%).
- Provedor padrão: **Focus NFe** (HTTP Basic com o token). Rotas usadas: `GET /v2/nfes_recebidas?cnpj=…&versao=…` e `GET /v2/nfes_recebidas/{chave}.xml`. A documentação pública confirma a consulta de NF-e recebidas e a manifestação do destinatário; **a listagem com `versao` e o download do XML precisam ser confirmados com o token de homologação**. Outro provedor: trocar `NFE_PROVIDER_URL` e ajustar `nfe.ts`.
- Secrets: `NFE_PROVIDER_TOKEN`, `NFE_CNPJ` (e opcional `NFE_PROVIDER_URL`).
- O provedor precisa estar habilitado para captura de notas contra o CNPJ da TAF (ciência da operação).

## Sankhya (API oficial)
- Função `sankhya-sync`, ações: `status`, `conexao` (OAuth 2.0), `referencias` (lê naturezas e centros de resultado), `simular` (mostra o corpo que seria enviado) e `enviar`.
- Autenticação: `POST {SANKHYA_URL}/authenticate` com `X-Token` e `client_id`/`client_secret`; consulta por `CRUDServiceProvider.loadRecords` em `gateway/v1/mge/service.sbr`. Entidades usadas: `Natureza`, `CentroResultado`, `Financeiro`.
- **A gravação vem desligada**: só funciona com o secret `SANKHYA_ALLOW_WRITE=true`, depois de uma simulação e com o de-para completo (centro de resultado da obra e natureza de cada conta do plano, na tela Financeiro → Fechamento e integrações). Campos obrigatórios do financeiro (empresa, TOP, parceiro etc.) variam por instalação: **valide com o administrador do Sankhya antes do primeiro envio** e ajuste `montaFinanceiro` em `sankhya.ts`.
- Secrets: `SANKHYA_URL`, `SANKHYA_CLIENT_ID`, `SANKHYA_CLIENT_SECRET`, `SANKHYA_TOKEN`, opcionais `SANKHYA_CODEMP` e `SANKHYA_ALLOW_WRITE`.
- Detalhes da pesquisa em `SANKHYA_PESQUISA.md`.

## Passos para ligar (feitos pelo usuário)
1. No painel do Supabase (projeto TAF): *Edge Functions → Secrets*, cadastrar os secrets acima. Nunca no chat nem no repositório.
2. Publicar as funções (na máquina com o CLI): `supabase functions deploy nfe-sync` e `supabase functions deploy sankhya-sync --project-ref kefkgydvjjakqaonyjau`.
3. Reativar o login (`modo: 'supabase'`), criar a conta do administrador e fechar o cadastro aberto.
4. Em *Financeiro → Fechamento e integrações*: "Buscar notas novas", "Testar conexão", "Ler naturezas e centros", preencher o de-para, "Pré-visualizar", "Simular no servidor" e só então "Enviar ao Sankhya".

## Sem credenciais, o que já funciona
- Importar XML de NF-e à mão e arquivo do contador/arquivo de apoio para importação no Sankhya (Financeiro → Fechamento).
- Apuração estimada de tributos (Financeiro → Apuração de tributos).
