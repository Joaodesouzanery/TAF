# Plano — SaaS de Gestão de Obras TAF (MVP: compras e custo por item)

## Context
A TAF controla obras de saneamento em planilhas (Estudo 342, META DE COMPRA, TAF rev6) e compra/lança notas no Sankhya, sem amarrar o custo ao item do orçamento. Resultado (doc "Fluxo Completo rev00"): 16% do custo da 281 sem centro de custo, meta sem semáforo, versões vencidas. Objetivo: cada obra = centro de custo; cada item da EAP (346 itens na 342) tem meta e teto; solicitação → cotação → OC → nota com rateio sempre "banana com banana", com semáforo (verde/amarelo/vermelho/bloqueado) e saldos meta / comprometido / realizado por item e pacote.
Repo `joaodesouzanery/taf` está vazio (branch `claude/obras-compras-management-e4nsfm`, sem commits).

## Dados lidos (base da modelagem)
- **META DE COMPRA** (`1. PACOTES` 21 pacotes; `2. ITENS`, ~346 linhas): pacote, item analítico (B.3.1.7.1), qtd, evento, precisa em obra, fechar até, meta unitária/total, teto, status (Orçado / A cotar), fonte da meta. As duas versões enviadas (rev1 e a "REV02 substituída") diferem — usar só como fixture; versão vigente é decisão pendente do usuário (REV13/META REV02).
- **Estudo 342 REV10**: `06 ORÇAMENTO ANALÍTICO` (EAP código/nível/preço licitado/BDI), `31 COMPOSIÇÃO POR ITEM` (custo direto aberto em MO, Material, Máquinas, Terceiros, Indireto), `11/12 META` (mesmos dados da META), `00 RESULTADO` (contrato R$ 3.257.970,74; custo meta; margem ~7%).
- **Auditoria 21 erros**: lista E01–E21 → vira backlog de travas (fases futuras).
- Regras do doc usadas: teto = preço licitado × (1 − 8,5%); saldo livre = meta − comprometido − realizado sem pedido; nota rateada soma 100%; alçadas; estados da OC.

## Arquivos adicionais recebidos (mesma sessão)
- **Fluxo Completo rev00 (2 cópias antigas) e rev01**: são versões do mesmo doc; a **rev01 (a mais longa, 763 linhas) é a vigente** e já foi usada. Ignorar as rev00.
- **TAF rev6**: `08. CUSTOS` (nº, competência, obra, conta MO/EQP/MAT/TER/ADM, valor, favorecido, situação) e `08D. LANÇAMENTOS 281` (emissão, vencimento, fornecedor, documento, valor, central de custo, grupo→conta) → usados como **fixture/importação de histórico da 281** (itens sem obra/item vão para a fila "sem item"); `03. CONTRATOS` → cadastro de contratos (342 R$ 3,258 mi, 343 R$ 5,227 mi, 281 R$ 17,12 mi); `05B/05C` (apontamento, restrições) ficam para a Fase B.
- **Viabilidade CAESB Sobradinho (.xlsm)**: `PLANILHA` (código, descrição, un, qtd, valor unitário), `COTAÇÃO`, `CPU/ANALÍTICA/ABC` → serve como 2º modelo de EAP/importador (obra 343, preço unitário) e valida que o importador é genérico (não só a 342).

## Resposta à dúvida do usuário (HTML + Supabase + Vercel + Next.js)
Sim, dá para testar começando por **um único `index.html`** (supabase-js via CDN, sem build), hospedado como estático na Vercel, já falando com o Supabase. O **schema SQL e as regras ficam no Postgres** (triggers/views), então a migração para Next.js depois só troca a casca de UI. Fase A = HTML; Fase B = Next.js reaproveitando o mesmo banco.

## Abordagem
1. **Banco (Supabase/Postgres)** — `supabase/migrations/0001_core.sql`:
   - Tabelas: `obra`, `item_eap` (codigo, nivel, pai, qtd, preco_venda, meta_unit, teto_unit, fonte_meta, pacote_id, evento, linha_base_versao), `composicao` (natureza: MO/MAT/EQP/TER/ADM), `insumo`, `pacote`, `fornecedor`, `solicitacao`, `cotacao`, `ordem_compra`, `oc_item`, `nota_fiscal`, `rateio_nota`, `evento_auditoria`.
   - Views: `v_saldo_item` (meta, comprometido, realizado, saldo livre, EAC simples), `v_saldo_pacote`, `v_semaforo`.
   - Triggers/regras: semáforo na solicitação e na OC (compara preço × meta/teto do item); nota só grava se `sum(rateio)=valor` e cada linha tem obra+item; nada é apagado (status + motivo); auditoria em campos de valor.
2. **Importador** (`scripts/import_planilhas.py`, openpyxl; também lê `PLANILHA` da Viabilidade 343 e `08D` da 281): lê META `2. ITENS`/`1. PACOTES` e Estudo `06`/`31` → insere obra 342, EAP, pacotes, metas/tetos, composição. Deduplica e reporta divergências entre versões e itens sem cotação (80 itens / R$ 774 mil na 342).
3. **UI Fase A — `web/index.html`** (single file): telas de Obra/EAP (árvore com meta, teto, comprometido, realizado), Solicitação (escolhe item → mostra semáforo ao digitar preço), Cotação/OC, Lançar NF + rateio (barra "fecha 100%"), Pacotes (a fechar em 30 dias, desvio vs meta), painel de saldo por item. Perfis simples (Engenheiro, Gerente, Diretoria) com aprovação por alçada.
4. **Deploy**: `vercel.json` estático; variáveis `SUPABASE_URL`/anon key; RLS por obra/perfil.
5. **Fase B (depois)**: Next.js (App Router) consumindo o mesmo schema; apontamento diário, Lean/restrições/PPC, EVM, DRE, XML NF-e.

## Design (aprovado pelo usuário, a partir das 4 imagens de referência)
UI clara e limpa, no estilo das referências: sidebar com logo, seletor de obra (centro de custo), seções "Workspace"/"Insights" e badges de contagem; topbar com breadcrumb, busca e sino; saudação + resumo em linguagem natural; cartões de KPI; abas segmentadas com contadores; tabelas/listas com linhas em cartão; pílulas de status (verde/amarelo/vermelho/azul); barras de "marcas" (tick bars) para meta × comprometido × realizado e matriz de conformidade por pacote; anel de progresso; painel lateral deslizante de notificações (alçadas pendentes, notas sem item); fonte mono para códigos (EAP, OC, chave NF). Tokens em CSS variables (claro/escuro). Tabelas seguem o padrão "Active Workflows"/"API Keys": cabeçalho cinza, linha em cartão, ações à direita (copiar/rotacionar → aprovar/rejeitar).

## Execução por fases (começar já, uma fase por vez, commit por fase)
- **Fase 1 — Fundação:** scaffold do repo, `0001_core.sql`, design system (CSS tokens + shell com sidebar/topbar), importador da obra 342 (EAP + pacotes + meta/teto) e tela "Hoje".
- **Fase 2 — Orçamento e metas:** telas Obra/EAP (árvore), Pacotes (meta × teto, fechar até, sem cotação), versão da linha de base.
- **Fase 3 — Compras:** Solicitação → Cotação (mapa, 3 preços) → OC com semáforo e alçadas, fila de aprovação.
- **Fase 4 — Nota e rateio:** lançar NF, rateio manual fechando 100%, saldos meta/comprometido/realizado por item, fila "sem item/sem pedido".
- **Fase 5 — Painéis:** Compras, Obra, Carteira; notificações; importação histórico 281 e EAP 343.
Cada fase termina verificada (testes SQL + abrir no Chromium) antes da próxima.

## Fora do MVP
Apontamento, Lean, BM/faturamento, DRE/plano de contas completo, NF-e automática, Sankhya, fiscal. Valores de alçada em R$ e tolerância nota×pedido entram como parâmetros configuráveis (usar defaults: tolerância 2%, verde sem confirmação até valor a definir).

## Arquivos a criar
`supabase/migrations/0001_core.sql`, `supabase/seed/` (gerado pelo importador), `scripts/import_planilhas.py`, `web/index.html`, `vercel.json`, `README.md` (como rodar/importar/publicar).

## Verificação
- Rodar o importador nas 4 planilhas: conferir soma da EAP = R$ 3.257.970,74 e 21 pacotes / ~346 itens; metas por pacote batem com `1. PACOTES` (ex.: FOFO R$ 683.957,46).
- Teste SQL: solicitação abaixo da meta → verde; acima da meta e ≤ teto → amarelo; acima do teto → vermelho; item inexistente → bloqueado; nota com rateio ≠ 100% é rejeitada; cenários do doc (retroescavadeira 16.000 vs 17.500; tubo 100 vs 102).
- Abrir `web/index.html` no navegador (Playwright/Chromium pré-instalado) e percorrer solicitação → OC → NF → saldo do item.
- Observação: aplicar migrações no Supabase só com sua confirmação do projeto.

---
# FASE 6 (nova rodada) — fechar as lacunas do pedido original

## Checagem do pedido original (estado após fases 1–5)
FEITO: obra = centro de custo; item da EAP com meta/teto; solicitação alocada no item com semáforo; mapa de cotação; OC; nota alocada na OC com rateio 100%; recebimento; auditoria.
LACUNAS: (1) plano de contas (codificação 4.1.01… do doc seção 12) — hoje só 5 naturezas; (2) composição/insumos do item ("tubo 220 mm" dentro do assentamento) — a solicitação não escolhe insumo; (3) título a pagar gerado pela OC + conciliação bancária ("gera a conta a pagar, depois aloca a nota"); (4) MEDIÇÃO por item → lucro/prejuízo por item (receita medida × custo realizado, VA/IDC) — ponto central do pedido; (5) produção/estudo (apontamento) ainda fora; (6) dados só no navegador (sem Supabase).

## Pedidos desta mensagem
- Trocar saudação "Bom dia, <usuário>" por **"Bom dia, Administrador!"** (web/index.html, viewHoje).
- **Vercel**: projeto existente chama-se `taf` (id prj_ih9VtHO2oIBvMXvs0HPpQxQk3vQR, team team_yqBLMg8jWVHIXVYD3hXCz7ov), domínio atual taf-phi.vercel.app. Renomear para `tafadmin` (update_project name) e conferir/atribuir o domínio tafadmin.vercel.app; garantir outputDirectory=web e redeploy. Se a API recusar o nome (já usado) → reportar e sugerir alternativa. (A conexão Vercel caiu no meio da sessão; reconectar via ToolSearch antes de executar.)

## Atualização (execução já iniciada)
- Saudação "Bom dia, Administrador!" já aplicada em web/index.html (falta rebuild + commit).
- Vercel: a API recusou (403) o escopo "joaodesouzanerys-projects" e list_teams veio vazio → o conector não tem acesso à equipe. NÃO consigo renomear o projeto `taf` por aqui. Caminho: o usuário renomeia em Settings → General → Project Name = `tafadmin` (e confere Domains), ou reautoriza o conector Vercel com esse escopo. O deploy em si é automático a cada push na branch conectada (confirmar que a Production Branch da Vercel aponta para a branch usada).
- Seguir com itens 2–6 da Fase 6 sem depender da Vercel.

## Entregas da Fase 6 (ordem)
1. Saudação + rename do projeto Vercel + redeploy + conferência da URL.
2. **Plano de contas**: tabela `conta` (códigos 4.1…4.6, 3.x, 5–7 da seção 12) em `0003_plano_contas.sql` + seed; cada insumo/natureza aponta para uma conta; rateio e DRE gravam conta; tela "Plano de contas" (árvore) no app.
3. **Composição/insumos**: importar aba 31/25 (insumos por item); solicitação passa a escolher insumo da composição do item (natureza e conta herdadas, nunca digitadas).
4. **Contas a pagar**: OC aprovada gera título (previsto); nota liga ao título; pagamento baixa; tela Financeiro com conciliação simples (OFX/CSV) — banco fora do MVP além disso.
5. **Medição → resultado por item**: boletim de medição por item (qtd medida × preço licitado), receita medida vs custo realizado, VA = %físico × meta, IDC, margem por item/pacote, semáforo de lucro/prejuízo; tela "Medição" e painel "Resultado".
6. Atualizar testes (e2e + SQL), `dist/tafadmin.html`, README; commit/push; enviar HTML.
Supabase real, login por papel e importação 343/281 ficam para a Fase 7 (precisa da confirmação do usuário para aplicar migrações).

## ESCOPO AMPLIADO (decisão do usuário): entra tudo no MVP, em fases
Ordem escolhida: **7 Supabase → 8 Apontamento e Lean → 9 BM/faturamento e DRE → 10 NF-e/fiscal/Sankhya**.
- Fiscal: provedor externo (ex.: Focus NFe) baixa o XML; o sistema vincula nota→obra/contrato/item (CNO, município, base de INSS) e exporta lote mensal ao contador. Sem motor fiscal próprio. Até o provedor ser contratado: importar XML manual.
- Sankhya: integração só pela API oficial (OAuth 2.0), leitura de naturezas/centros de resultado/financeiro; depende de credenciais do admin do Sankhya. Sem engenharia reversa (REA não se aplica: é ferramenta de análise de binários/apps, não ERP).
- Fase 8: apontamento diário (celular/offline), histograma real, produtividade, VA por apontamento; Lean (lookahead, restrições com dono/prazo/R$, compromisso semanal, PPC, pauta de segunda).
- Fase 9: BM ao cliente, faturamento/recebimento, reajuste, DRE por obra (medido × executado), caixa.
- Fase 10: XML NF-e → nota, exportação ao contador, integração Sankhya.

## FASE 7 — Supabase real (projeto "TAF", ref kefkgydvjjakqaonyjau, us-east-1, vazio)
1. Aplicar migrações 0001–0003 + seeds (342, plano de contas) via MCP apply_migration/execute_sql. Revisar com get_advisors (segurança/RLS).
2. `0004_auth_rls.sql`: tabela `perfil` (user_id → papel, nome); RLS em TODAS as tabelas (leitura: autenticados; escrita por papel: engenheiro/gerente/compras/almox/adm/financeiro/diretoria/gestao conforme matriz CAN do app); anon sem acesso. Ajustar colunas para refletir o estado do app (cotações, recebimento, justificativa, aprovador, título, medição, auditoria com autor).
3. App (`web/index.html`): supabase-js via CDN; tela de login (e-mail/senha); papel vem de `perfil` (seletor "Entrar como" só no modo demonstração); camada de dados que lê/grava no banco e mantém o motor de regras atual; sem config → modo demo (localStorage) continua funcionando. `web/config.js` com URL + chave publishable (públicas; nunca a service key).
4. Primeiro acesso: o usuário cria sua conta (Auth) e eu promovo a "Administrador" (diretoria+gestão) por SQL; demais papéis o admin atribui numa tela "Usuários".
5. Testes: SQL (fase6 + RLS: anon bloqueado, papel errado não escreve) e e2e contra o banco; commit/push; enviar dist/tafadmin.html.
6. Fase 7b (depois): importar EAP da 343 e histórico da 281; apontamento diário.
Não aplicar nada em outros projetos (TE AMAR, NERY AGRO, CIRCLE NEW).

## FASE 8 — Apontamento diário e Lean (decisão do usuário: "as planilhas enviadas já são tudo o necessário": não depender de REV13/META REV02; usar o que existe)
0. Fechar o carregamento do banco TAF: obra/pacotes/contas já entraram; itens EAP: blocos 01 e 02 carregados (242 de 451); faltam os blocos 03 e 04 (verificar contagem antes; "on conflict do nothing" torna o reenvio seguro) — antes eram "faltam blocos 02–04" de /tmp/load (gerados do JSON) → conferir 451 itens / 346 folhas e metas por pacote = abas 11/12. (Dados carregados pelo MCP; o botão "Importar" do app continua como alternativa.)
1. Migração `0006_fase8.sql` (aplicar no TAF e guardar no repo): ampliar `documento.tipo` (apt, rst, atv, tar), `perfil.papel` (+encarregado, planejamento) e `pode_escrever` (apt: encarregado/engenheiro/gerente; rst/atv/tar: engenheiro/gerente/planejamento/encarregado conforme matriz RACI do doc); testes RLS atualizados.
2. Importador: acrescentar banco de MO (aba 18, custo/hora = custo mensal ÷ 220) e HH por unidade de cada item (aba 24, col. HH ÷ qtd) para produtividade de referência; regenerar JSON (carga por SQL).
3. App — **Campo (apontamento)**: formulário mobile-first por dia e frente (item EAP): quantidade, pessoas por função com horas, equipamentos com horímetro/horas paradas, chuva (mm), parou? motivo/horas, observação; fluxo rascunho → conferido (apontador, até 9h do dia seguinte) → aprovado (engenheiro; retroativo marcado); alerta de dia útil sem apontamento; cálculos: produção acumulada e % físico por item (alimenta VA/IDC, no lugar da medição), HH real, produtividade real × referência, custo do dia (HH×custo/h + horas de máquina), valor agregado do dia (qtd × meta unitária); fila offline (localStorage) com reenvio ao voltar o sinal.
4. App — **Lean**: abas Pauta de segunda (automática), Lookahead 6 semanas (atividade por item/semana; só fica "Pronta" sem restrição aberta; "Não cumprida" exige causa), Restrições (frente/item, tipo e categoria, dono, prazo, próximo passo, R$ em jogo, replanejamentos; escalonamento a cada 3 dias úteis; limite de 8 abertas por pessoa; restrição automática de pacote com "fechar até" vencido sem pedido), PPC semanal (verde ≥80%, amarelo ≥60%) com Pareto de causas e custo da espera, Tarefas/ata (1 linha = 1 ação: o quê, quem, quando, por quê, onde, como, quanto; Kanban a fazer/fazendo/feito, ligadas à restrição/item).
5. Painéis: Produção (por frente) e Lean (PPC, restrições por dono) no menu Painéis; alertas no sino.
6. Testes: e2e demo + e2e conectado (apontamento→aprovação→% físico→IDC; restrição bloqueia atividade; PPC), `rls.sql`; build; README; commit/push; enviar HTML.
Fora desta fase (seguem as fases 9 e 10): BM/faturamento/DRE, NF-e/fiscal/Sankhya, importar 343/281.

### Progresso Fase 8 (já feito antes do modo plano)
- Banco TAF carregado (451 itens/346 folhas). Importador estendido (banco_mo 32 funções, hh_unit em 198 itens); JSON regenerado.
- `0006_fase8.sql` escrita e aplicada no TAF (tipos apt/rst/atv/tar, papéis encarregado/planejamento, pode_escrever, tabela funcao_mo, item_eap.hh_unit). FALTA: rodar `supabase/seed/fase8_342.sql` no TAF (funcao_mo + hh_unit).
- Restante: telas Campo e Lean em web/index.html, painéis, testes, README, build, commit/push, SendUserFile.

## Verificação Fase 6
e2e Playwright cobrindo: saudação; criar insumo→solicitação com conta herdada; OC gera título; pagamento baixa; medição de item gera margem e IDC; `semaforo.sql` + novos testes SQL; abrir tafadmin.vercel.app e conferir status 200 e a saudação.

---
# FASE 9 — BM ao cliente, faturamento/recebimento, DRE e caixa (Fase 8 já entregue: commit 99beb9d)

## Pedido novo do usuário: o HTML tem que chegar como LINK (não arquivo)
- Após cada fase: build de `dist/tafadmin.html`, push (a Vercel republica sozinha em taf-phi.vercel.app / tafadmin.vercel.app após o rename feito pelo usuário) E publicar o mesmo HTML como Artifact privado do claude.ai (tool Artifact, publish do mesmo file_path a cada fase = mesmo link), entregando a URL no chat. Antes: carregar skill `artifact-design`; o HTML é app completo com supabase-js embutido (limite 16 MB ok, 603 KB). Atenção: no Artifact o domínio é outro, mas o Supabase aceita (chave publishable + RLS). Não enviar mais como arquivo anexo.

## Escopo (decisões padrão, sem bloquear em dúvidas)
1. Migração `0007_fase9.sql` (aplicar no TAF + salvar no repo): `documento.tipo` += `bm` (boletim ao cliente), `fat` (nota de serviço emitida / faturamento), `rec` (recebimento), `lan` (lançamento manual de caixa/DRE); `perfil` sem novos papéis (financeiro/gerente/diretoria/gestao); `pode_escrever`: bm → gerente/engenheiro/diretoria; fat/rec → financeiro/adm/diretoria; lan → financeiro/diretoria. Testes RLS (`supabase/tests/fase9.sql`).
2. **BM ao cliente (aba "Faturamento")**: BM por período = soma das medições ATESTADAS ainda não faturadas (quantidade × preço licitado unitário, já existente em `S.t.meds`) + reajuste (índice informado) − glosas; retenção contratual (% parametrizável, default 0) e tributos da nota (tributos_nota 8,5%). Fluxo rascunho → enviado ao cliente → aprovado pelo cliente (valor aprovado pode diferir: diferença vira glosa) → faturado. Trava: não fatura medição já faturada; BM não excede qtd orçada.
3. **Faturamento/recebimento**: NF de serviço emitida liga ao BM (número, emissão, vencimento = emissão + prazo do contrato, default 30 d); recebimento parcial/total baixa; conciliação com extrato (mesmo parser CSV/OFX simples da Fase 6, lado entrada); alerta de recebível vencido.
4. **DRE por obra** (aba nova em Painéis): receita bruta (BM aprovados) − deduções (ISS/PIS/COFINS pela alíquota `tributos_nota`, glosas) = receita líquida; custos pelo plano de contas já existente (realizado por conta 4.x); resultado e margem; regimes lado a lado: **medido × executado** (receita medida vs. custo realizado vs. VA do Campo) e **previsto pela meta**; EAC/resultado final projetado (IDC da Fase 6/8). Sem rateio de administração central (fica conta 5 informativa).
5. **Caixa**: fluxo mensal previsto × realizado: entradas = BMs/NFs a receber por vencimento e recebimentos; saídas = títulos a pagar (Fase 6) por vencimento + pagos; saldo acumulado e posição de exposição (maior saldo negativo); lançamentos manuais (`lan`) para itens fora do fluxo (impostos, financeiro). Gráfico de barras em SVG simples, sem biblioteca.
6. Alertas no sino: BM aprovado não faturado, recebível vencido, caixa projetado negativo nos próximos 60 dias, medição atestada sem BM.
7. Onde mexer: `web/index.html` (novas views `viewFat`, `viewDRE` dentro de Painéis, `viewCaixa`; DOCS += bm/fat/rec/lan; CAN += faturar, receber; nav "Faturamento e caixa"); `supabase/migrations/0007_fase9.sql`; `supabase/tests/fase9.sql`; `scripts/e2e_fase9.js` (demo) e extensão de `scripts/e2e_sb.js`; README; reutilizar `medAcum`, `resItem`, `titulos`, `tituloInfo`, `doConciliar`, `contaPadrao`, `nextNum`, `tabs`, `modal`.

## Verificação
- e2e demo: medição atestada → BM → aprovar com glosa → faturar → receber parcial → conciliar; DRE bate (receita líquida = bruta × (1 − trib) − glosa; resultado = líquida − custo realizado por conta); caixa soma entradas/saídas por mês; travas (re-faturar, exceder qtd).
- e2e conectado (documentos bm/fat/rec/lan gravados), SQL RLS por papel, regressão das suítes e2e.js/e2e_fase8.js/e2e_sb.js.
- Build, commit/push, publicar Artifact e responder com o LINK; informar que o link da Vercel atualiza sozinho pelo push.

## AJUSTE (mensagem do usuário): "sem autenticação por enquanto"
- O app passa a abrir direto, sem tela de login: modo "aberto" = demonstração local (já existe, `?demo=1`) com seletor "Entrar como" para trocar de papel; dados ficam no navegador de cada pessoa (localStorage). Implementação: `web/config.js` ganha `modo:'aberto'` (padrão) — `MODO_SB` só liga se `modo==='supabase'`; o código de login/Supabase/RLS permanece intacto para reativar depois (basta trocar a flag).
- NÃO abrir o banco para anon (RLS continua fechando tudo): dados no Supabase só voltam quando o login for reativado. Avisar o usuário que, até lá, cada navegador tem seus próprios lançamentos (não compartilhados) e que o Supabase fica parado.
- Testes: e2e_sb.js passa a forçar `modo:'supabase'` (via config de teste) ; e2e demo cobre o modo aberto; build verifica que a página abre sem login.

---
# FASE 10 + QA GERAL + CONTINUIDADE (pedido do usuário: migrar de conta Claude depois)

## Decisões
- Fontes: guardar TUDO no repo (pasta `fontes/`: 4 xlsx/xlsm + auditoria + Fluxo rev01 .md; as rev00 antigas ficam em `fontes/antigas/`). O usuário confirmou. Avisar que o repo `joaodesouzanerys/taf` precisa ser PRIVADO (tem contratos e custos) e checar com get_repository/visibilidade via GitHub MCP.
- Link do HTML segue como Artifact (mesmo URL AmUjKVFnEXoqfu2SPj2m9x, republicar a cada fase). App sem login (modo aberto) permanece.

## 1. Fase 10 (NF-e / fiscal / Sankhya) — o que dá para entregar sem credenciais
1. **Importar XML de NF-e** (tela Notas e rateio → "Importar XML"): parser no navegador (DOMParser) lê emitente (CNPJ/nome), número/série, chave de 44 dígitos, data, valor total, itens (descrição, qtd, valor), impostos retidos (ISS/INSS quando houver). Cria a nota na fila "sem rateio" já ligada à OC por sugestão (mesmo CNPJ/fornecedor + valor dentro da tolerância) e bloqueia duplicidade pela chave de acesso (E-trava nova). Rateio segue manual somando 100% (regra central do pedido). Aceita vários XML de uma vez.
2. **Dados fiscais da obra** em Parâmetros: CNO, município de execução, regime de retenção (INSS 11%, ISS), base; nota guarda esses campos para o contador.
3. **Exportação ao contador** (aba Financeiro → "Fechamento mensal"): CSV (`;`, UTF-8 BOM) por competência com: data, fornecedor/CNPJ, nota, chave, valor, retenções, obra/CNO, item EAP, conta do plano, natureza, status de pagamento; também resumo por conta. Botão copiar/baixar (no Artifact download é bloqueado → mostrar em área de texto copiável; na Vercel baixa).
4. **Provedor externo de NF-e (Focus NFe etc.)**: camada adaptadora `FISCAL` com `provedor:null`; deixar contrato de dados e doc em `docs/INTEGRACOES.md`; nada chamado sem credencial. Não inventar chamadas.
5. **Sankhya**: `docs/INTEGRACOES.md` descreve a API oficial (login por appkey/token, serviços `CRUDServiceProvider`/consultas de naturezas e centros de resultado), mapeamento nosso→Sankhya (obra=centro de resultado, conta do plano=natureza, nota=lançamento financeiro) e adaptador em `web/index.html` com `SANKHYA.config` vazio + botão "Exportar para o Sankhya (arquivo)" que gera o mesmo CSV no layout de importação. Sem engenharia reversa; REA não se aplica. Dependência explícita: credenciais do administrador do Sankhya (não pedir senha no chat).
6. Migração `0008_fase10.sql` (documentos tipo `nfx` p/ XML bruto opcional e `fech` fechamento mensal; pode_escrever adm/financeiro) aplicada no TAF + `supabase/tests/fase10.sql`; `scripts/e2e_fase10.js` com XML de exemplo sintético (gerar no teste, sem dados reais).

## 2. QA de todos os processos (executar antes de fechar a fase)
- Checklist do pedido original (brief colado pelo usuário) × evidência no app, tabela em `docs/CHECKLIST_REQUISITOS.md`: cada frase do brief → tela/regra/teste que cobre (centro de custo por obra; item da EAP com composição; solicitação alocada no item com preço × meta/teto; mapa de cotação; OC; custo/conta a pagar; nota alocada na OC com rateio banana-com-banana; plano de contas; medição → lucro/prejuízo por item; fluxograma da nota; sincronização planilha↔sistema; Sankhya; apontamento/Lean; BM/DRE/caixa).
- Rodar TODAS as suítes (e2e, fase8, fase9, fase10, e2e_sb) + SQL (semaforo, fase6, rls, fase8, fase9, fase10) num script único `scripts/qa.sh` (sobe Postgres local, aplica migrações 0001–0008, seeds, roda tudo e imprime resumo).
- Varredura manual guiada por papel (screenshots Playwright de cada tela em 1400px e 400px, claro/escuro) para achar quebras de layout, texto cortado, botões mortos; corrigir o que aparecer. Auditar: números monetários arredondados, travas (rateio≠100%, medido>orçado, duplicidade, quem lança não aprova), alertas do sino, persistência/reset, fila offline, modo aberto vs `?sb=1`.
- Supabase: `get_advisors` (segurança/RLS) e checar que migrações 0001–0008 do repo = aplicadas (`list_migrations`); conferir contagens (451/346/21/38/32).
- Bugs achados viram commits pequenos com teste de regressão.

## 3. Continuidade / migração de conta (tudo no GitHub)
- `docs/COMECE_AQUI.md` (guia para um novo Claude/dev assumir): visão do produto, decisões já tomadas (lista cronológica das mensagens do usuário e respostas), arquitetura (app único HTML + Supabase + Vercel + Artifact), como rodar testes, como regenerar JSON/seeds do Excel, como reativar login (`modo:'supabase'`), IDs (Supabase ref kefkgydvjjakqaonyjau, Vercel prj_ih9VtHO2oIBvMXvs0HPpQxQk3vQR, artifact URL), pendências do usuário (renomear Vercel para tafadmin; fechar signup; credenciais Sankhya; provedor NF-e), próximos passos (7b EAP 343/281, Fase 11 sugestões).
- `docs/BRIEF_ORIGINAL.md` com o texto integral do pedido do usuário (colado na mensagem) + `docs/FLUXO_NF.md` (fluxograma mermaid da nota fiscal: solicitação → cotação → OC → título → NF → rateio → pagamento → conciliação → medição/resultado).
- `docs/INTEGRACOES.md` (Sankhya, NF-e provedor), `docs/CHECKLIST_REQUISITOS.md`, `docs/QA_RELATORIO.md` (resultado do QA com data e contagens).
- Copiar o plano `/root/.claude/plans/...md` para `docs/PLANO_E_HISTORICO.md` (a conversa não migra com a conta).
- README aponta para `docs/COMECE_AQUI.md`; `.gitignore` ok; sem segredos no repo (só a chave publishable, já pública). Commit, `git push` e conferir no GitHub MCP (get_file_contents da árvore) que tudo subiu; relatar o link do repo.
- Backup do banco: exportar contagens e dados da obra em `supabase/seed/` já existente; registrar no guia que a carga é reproduzível pelos seeds.

## Entrega final desta rodada
Republicar o Artifact (mesmo link), push, e responder: link do app, link do repo, resumo do QA (o que passou/falhou/corrigido), lista curta de pendências do usuário.
