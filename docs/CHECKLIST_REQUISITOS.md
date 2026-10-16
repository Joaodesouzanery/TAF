# Checklist: pedido original × o que está no sistema

Legenda: **OK** = feito e coberto por teste. **Parcial** = feito com limite descrito. **Pendente** = depende de terceiros.

| # | O que o pedido diz | Onde está no app | Teste | Situação |
|---|---|---|---|---|
| 1 | Cada obra vira um **centro de custo** | Seletor de obra, `obra.codigo`; todo documento carrega a obra | e2e, e2e_sb | OK (só a 342 carregada; 343 e 281 em 7b) |
| 2 | A planilha orçamentária (itens, serviços, composições) vira a base | Orçamento (EAP): 451 linhas, 346 itens, composição MO/MAT/EQP/TER/ADM | importador, e2e | OK |
| 3 | Cada item tem **meta** e **teto** | EAP, Pacotes, semáforo; teto = licitado × (1 − 8,5%) | semaforo.sql, e2e | OK |
| 4 | **Solicitação de compra** pelo engenheiro, alocada no item | Compras → nova solicitação; escolhe item/insumo | e2e | OK |
| 5 | Preço digitado já mostra **abaixo/acima do planejado** (banana com banana) | Semáforo verde/amarelo/vermelho/bloqueado sobre o saldo acumulado | semaforo.sql, e2e | OK |
| 6 | Aprovação de compra | Alçadas: verde sem alçada, amarelo Gerente, vermelho Diretoria | e2e | OK (valores de alçada são parâmetros a definir) |
| 7 | **Mapa de cotação / coleta** | Mapa com 3 propostas e escolha | e2e | OK |
| 8 | **Ordem de compra** | Emissão a partir do mapa, recebimento parcial | e2e | OK |
| 9 | OC gera **custo / conta a pagar** | Título criado na aprovação da OC; Financeiro → Contas a pagar | e2e, fase6.sql | OK |
| 10 | **Alocar a nota fiscal à OC** (o "segredo das planilhas") | Notas e rateio: nota ligada à OC e rateada por item | e2e | OK |
| 11 | Rateio soma **100%** e cada linha tem item | Barra "fecha 100%"; recusa se não fecha | e2e, e2e_fase10 | OK |
| 12 | Lançar a nota para a **compensação bancária** | Liberar → Pagar → Conciliação por extrato | e2e | OK |
| 13 | **Plano de contas** (insumos, mão de obra, equipamentos…) | 38 contas; conta herdada da natureza e do pacote, nunca digitada | e2e, fase6.sql | OK |
| 14 | Custos da obra alocados no plano de contas | Tela Plano de contas com meta/comprometido/realizado por conta | e2e | OK |
| 15 | **Estudo detalhado** baseado em custos e **produção** | Campo: apontamento diário, HH, produtividade × CPU, custo do dia | e2e_fase8 | OK |
| 16 | De cada item, uma **medição** | Medição e resultado: lançar, atestar | e2e | OK |
| 17 | Saber se cada item dá **lucro ou prejuízo** | Resultado por item e por pacote: receita × custo, VA, IDC, EAC | e2e | OK |
| 18 | **Fluxograma** do processo da nota | `docs/FLUXO_NF.md` (mermaid) | revisão | OK |
| 19 | Planilha e sistema **sincronizados** | Importador Excel→JSON→SQL repetível (`scripts/import_planilhas.py`) | seeds, contagens | Parcial: importação é por carga; não há leitura contínua da planilha |
| 20 | Lançamento de nota como no **Sankhya** (SANKEA) | Fechamento ao contador + arquivo de apoio Sankhya; XML de NF-e | e2e_fase10 | Parcial: API do Sankhya depende de credenciais |
| 21 | Faturar o cliente, DRE, caixa | Faturamento e caixa, DRE em Painéis | e2e_fase9 | OK |
| 22 | Lean (restrições, lookahead, PPC) | Lean e planejamento | e2e_fase8 | OK |
| 23 | Auditoria: ninguém apaga | Auditoria; cancelar muda status e grava motivo | e2e, rls.sql | OK |
| 24 | Acesso por papel | RLS no Supabase e seletor de papel no modo aberto | rls.sql, e2e_sb | Parcial: login desligado a pedido (modo aberto) |
| 25 | Dados compartilhados entre pessoas | Supabase com login (`modo:'supabase'`) | e2e_sb | Parcial: no modo aberto os dados ficam em cada navegador |

Itens que ainda dependem de decisão ou acesso do usuário estão em `COMECE_AQUI.md`.
