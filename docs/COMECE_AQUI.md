# Comece aqui (guia para continuar o projeto em outra conta ou com outra pessoa)

## O que é
SaaS de gestão de obras da **TAF** (saneamento). Cada obra é um centro de custo; cada item da planilha orçamentária (EAP) tem meta e teto. Fluxo: solicitação → mapa de cotação → ordem de compra (com semáforo e alçadas) → título a pagar → nota fiscal com **rateio manual somando 100%** → pagamento e conciliação → medição → lucro ou prejuízo por item. Depois vieram campo (apontamento), Lean, faturamento ao cliente, DRE, caixa e fechamento ao contador. Pedido original em `BRIEF_ORIGINAL.md`; fluxo em `FLUXO_NF.md`; cobertura em `CHECKLIST_REQUISITOS.md`; QA em `QA_RELATORIO.md`; integrações em `INTEGRACOES.md`; plano e histórico completo em `PLANO_E_HISTORICO.md`.

## Onde está cada coisa
| Parte | Caminho |
|---|---|
| App (JS puro, fonte modular) | `web/src/` → `web/index.html` (+ `web/config.js`, `web/data/obra*.json`, `web/vendor/supabase.js`) |
| Gera o arquivo único para entregar | `python3 scripts/build_html.py` → `dist/tafadmin.html`; `python3 scripts/build_artifact.py` → `dist/tafadmin_artifact.html` (versão do link do Claude) |
| Banco (Postgres/Supabase) | `supabase/migrations/0001…0008`, seeds em `supabase/seed/`, testes em `supabase/tests/` |
| Importador das planilhas | `python3 -I scripts/import_planilhas.py fontes/OBRA_342_ESTUDO_DE_OBRA_INTERNO_REV10.xlsx` (gera JSON e seeds) |
| Testes | `bash scripts/qa.sh` (tudo) e `node scripts/qa_visual.js` (telas). Precisa de Node + Playwright global, Chromium em `/opt/pw-browsers`, Postgres 16 |
| Planilhas e documentos de origem | `fontes/` (versões substituídas em `fontes/antigas/`). **Contêm contratos e custos: o repositório precisa continuar privado.** |

Regras de negócio vivem em JS (`prep`, `saldos`, `semaforo`, `derive`) e espelham o SQL (`calc_semaforo`, triggers). Mudou uma regra, mude nos dois.

## Como funciona agora
- **Modo aberto (sem login)**: `web/config.js` tem `modo: 'aberto'`. O app abre direto, com seletor "Entrar como". Dados ficam no `localStorage` de cada navegador.
- **Modo Supabase (com login)**: troque para `modo: 'supabase'` (ou abra com `?sb=1`). Primeiro cadastro vira Administrador; os demais ficam "pendente" até o admin atribuir papel na tela Usuários. RLS fecha tudo para anônimos. Depois de criar a conta do admin, **feche o cadastro aberto** no painel do Supabase (Auth → Providers).
- **Link do app**: Artifact do Claude, `https://claude.ai/artifact/AmUjKVFnEXoqfu2SPj2m9x` (privado do dono; compartilhar pelo menu Share). Republicar com a ferramenta Artifact usando `dist/tafadmin_artifact.html`. Em outra conta, será outro link: publique de novo.
- **Vercel**: projeto `taf` (id `prj_ih9VtHO2oIBvMXvs0HPpQxQk3vQR`, domínio `taf-phi.vercel.app`), publica a pasta `web/` a cada push (`vercel.json`). O nome `tafadmin` ainda precisa ser trocado pelo dono em Settings → General.

## Identificadores
- Supabase: projeto **TAF**, ref `kefkgydvjjakqaonyjau`, URL `https://kefkgydvjjakqaonyjau.supabase.co`. A chave publishable está em `web/config.js` (pública por desenho). **Nunca** colocar a service key no repositório.
- Banco já carregado: obra 342, 451 linhas de EAP (346 itens), 21 pacotes, 38 contas, 32 funções de MO.
- Branch de trabalho: `claude/obras-compras-management-e4nsfm`.

## Decisões do usuário (ordem cronológica)
1. Design como nas 4 imagens de referência (limpo, cartões, pílulas, barras de marcas).
2. Entregar por fases, sempre com HTML atualizado; depois: entregar como **link**.
3. Saudação fixa "Bom dia, Administrador!".
4. Ordem: Supabase → Apontamento e Lean → BM/faturamento e DRE → NF-e/fiscal/ERP de referência.
5. Fiscal: provedor externo + exportar ao contador. ERP de referência: só API oficial; REA não se aplica.
6. As planilhas já enviadas bastam; não esperar REV13/META REV02.
7. Sem autenticação por enquanto.
8. Guardar tudo no GitHub (migração de conta) e guardar as planilhas no repositório.

## Fase 12 (18/10/2026): base do ERP
Decisão do usuário: **não integrar com o ERP de referência; criar as funções equivalentes aqui**, em 8 áreas de menu com abas internas, com login e banco compartilhado. Plano das fases 12 a 18 em `docs/PLANO_E_HISTORICO.md`; rastreio de cada item do inventário em `docs/MATRIZ_FUNCIONALIDADES.md` (gerada por `scripts/gera_matriz.py`).
- **Código modular**: edite `web/src/` (`shell.html`, `style.css`, `js/NN_*.js`) e rode `python3 scripts/build_web.py` (gera `web/index.html`, que a Vercel publica) e `python3 scripts/build_html.py` (arquivo único `dist/tafadmin.html`, com as 3 obras embutidas). `scripts/build_artifact.py` gera a versão do link do Claude (modo aberto, sem Supabase).
- **Login é o padrão** (`web/config.js`, `modo: 'supabase'`). **O link do Claude bloqueia rede**: lá o app roda só em demonstração. O link de uso real é o da Vercel (`tafadmin.vercel.app`). O **primeiro cadastro vira Administrador**: crie a sua conta antes de passar o link a alguém e depois feche o cadastro aberto (Supabase → Authentication → Sign In / Providers → desligar "Allow new users to sign up"; novos usuários entram só por convite).
- Numeração (SC-, OC-, NF-…) vem do servidor (`reservar_numeros`, migração `0009`), sem repetir entre pessoas.
- Cadastros base (fornecedores e clientes, insumos, contas bancárias) valem para todas as obras (documentos `forn`, `ins`, `banc`).
- Várias obras: seletor no topo do menu. 343 (só preço licitado, sem estudo de custo) e 281 (histórico do consórcio, tudo no item S.1) vêm de `web/data/` (gerados por `scripts/import_outras_obras.py`); no banco entram por "Importar" (Gestão/Diretoria).

## Fase 11 (18/10/2026)
Alçadas por faixa de valor, atualização das metas pela planilha, apuração estimada de tributos, e as integrações de NF-e e ERP de referência em funções do Supabase (`supabase/functions/`), prontas para ligar. Leia `docs/INTEGRACOES.md` e `docs/a pesquisa em fontes/`. A atualização pela planilha grava a nova linha de base em `obra.estado` (campos `baseOv` e `basePac`); o `item_eap` do banco guarda a versão 1.

## Pendências do usuário
1. Renomear o projeto Vercel para `tafadmin` (e conferir Domains e a Production Branch).
2. Decidir quando reativar o login (e fechar o cadastro aberto no Supabase).
3. Credenciais de API do ERP de referência (com o administrador de lá), contratar/habilitar o provedor de NF-e, cadastrar os secrets e publicar as funções (passo a passo em `docs/INTEGRACOES.md`). Exige reativar o login.
4. Definir valores de alçada (R$: hoje verde sem confirmação até 100.000, Gerente até 250.000) e a tolerância nota × pedido (2%), e conferir as alíquotas da apuração com o contador.
5. Confirmar a versão vigente da META (REV13/META REV02), quando existir.

## Próximos passos sugeridos
- **7b**: importar a EAP da obra 343 (Viabilidade CAESB, preço unitário) e o histórico da 281 (aba 08D do TAF rev6) para a fila "sem item".
- Numeração de documentos no servidor (evita repetir número com vários usuários).
- Quando houver credencial: função no Supabase para ERP de referência e para o provedor de NF-e.
- Reabrir login e testar com contas reais de cada papel.

## Cuidados
- No link do Claude: `alert/confirm/prompt` não aparecem, downloads são bloqueados e só scripts de cdnjs/jsdelivr/unpkg carregam. O app foi ajustado para isso (janelas na página, texto copiável).
- Ao editar `web/index.html`, rode `bash scripts/qa.sh` antes de publicar.

## Fase 13 — Painel de Contratos/Obra, conferência ERP de referência e financeiro nativo
- **Painel**: Início → Painéis → aba *Contrato da obra* (`29_painel_contrato.js`): mesmos blocos do Painel de Contratos do ERP de referência (contrato, faturado, fat. direto, impostos, gasto pago/a pagar/atrasado, requisição, custo fixo, prov. gasto, saldo a faturar, lucro) + gráfico contrato×custos×lucro, Curva S, saúde (IDC, margem), alertas, desvios, custo por natureza, cópia CSV.
- **Conferência** (aba): digita os totais do ERP de referência e vê bate/difere + causa provável. **Importar lançamentos** (aba): CSV `tipo;numero;fornecedor;descricao;vencimento;valor;pago_em;fat_direto` (tipo gasto|custo_fixo|provisao), sem duplicar, com desfazer.
- **Financeiro** → *Contas e extrato* (OFX, baixa múltipla com juros/multa/desconto, CNAB 240 genérico — validar com o banco) e *Cobrança* (mensagem + link WhatsApp manual).
- Migração `0010_fase13.sql` (tipos lfx, mov, cobr) já aplicada no Supabase TAF. Testes: `supabase/tests/fase13.sql`, `scripts/e2e_fase13.js`.
- Os prints do ERP de referência são da obra **343**; só o contrato (R$ 5.226.634,03) existia nas planilhas — gasto/provisão/custo fixo vêm do financeiro do ERP de referência (importar CSV para conferir).

## Fase 13 (fechamento) e Fase 14 — Contabilidade
- **Fase 13 fechada**: clique nos números do painel abre a composição (drill-down); Financeiro → Contas a pagar ganhou Parcelar, Renegociar (histórico no título) e Agrupar (mesmo fornecedor); painel mostra o comparativo da carteira (342/343/281).
- **Contabilidade** (Contábil e fiscal → Contabilidade, `32_contabil.js`): partidas dobradas calculadas das notas, pagamentos, retenções, NFs de serviço, tributos estimados, recebimentos e caixa; lançamento manual/ajuste (motivo obrigatório) e estorno (tipo `ctb`); Balancete (débito = crédito), Diário, Razão, DRE e Balanço, Orçamento por conta (pedido de liberação do excesso), Fechamento por competência (bloqueia nota, pagamento, faturamento, recebimento, caixa e lançamento retroativos; só a Diretoria reabre, com motivo), Livros de entrada/serviço em CSV de apoio (sem transmitir SPED/Reinf) e registro de processos. Plano contábil: base editável + contas de custo 5.x espelhando o plano gerencial 4.x. Alíquotas e plano a confirmar com o contador.
- Migração `0011_fase14.sql` aplicada no Supabase TAF (tipo `ctb` e trigger de competência fechada; reabrir = marcar `reaberta` no documento `fech`, nunca apagar). Testes: `supabase/tests/fase14.sql`, `scripts/e2e_fase14.js`.

## Fase 15 — Suprimentos e estoque do canteiro
- **Compras** (`12_compras.js` + `33_suprimentos.js`): solicitação com insumo opcional; mapa de cotação aceita propostas coladas (`fornecedor;preço;prazo`) e **Sugerir melhor** (menor preço, desempate por prazo); **Ocorrências** e **Devolução** na OC (a devolução baixa o estoque e registra o crédito); unidade de compra (ex.: BR = 6 m) convertida na entrada.
- **Estoque** (Suprimentos → Estoque): entrada automática pelo recebimento da OC com insumo, entrada avulsa, saída por frente/item da EAP, transferência entre obras (código copiável + "Receber transferência"), ajuste com motivo, saldo por local, custo médio ponderado, kardex, alerta de mínimo e de validade (30 dias), **inventário** (abrir, contar, recontar, coletor CSV `código;quantidade`, fechar gera ajustes), compras por necessidade (lookahead) e por mín./máx.
- **Decisão a confirmar**: o custo realizado do item continua vindo da **nota** (regime de compra); a saída do estoque registra o *consumo apropriado* (qtd × custo médio) só como informação (bloco no painel da obra). Isso evita contar o mesmo material duas vezes.
- Migração `0012_fase15.sql` (tipos `est` e `inv`). Testes: `supabase/tests/fase15.sql`, `scripts/e2e_fase15.js`. Fora do escopo: grade, número de série, WMS, PDV, marketplaces, comissões.

## Decisão registrada (Fase 15): custo do material
Decidido (delegado ao Claude pelo usuário): o **custo realizado do item vem da nota fiscal** (regime de compra), porque é o que fecha com contas a pagar, contabilidade e rateio 100%. A saída de estoque mostra o *consumo apropriado* só como informação (consumo × meta). Motivo: apropriar por consumo duplicaria o custo já lançado pela nota e quebraria o balancete. Se um dia quiserem custo por consumo, a mudança é: nota de estoque vai para conta de estoque (ativo) e a saída reconhece o custo — exige revisar a contabilidade (Fase 14).

## Fase 16 — Contratos, projetos, patrimônio e frota (área "Contratos e ativos")
- **Contratos** (`34_contratos.js`): receita (cliente) e despesa (empreiteiro/locação) com vigência, aditivos de valor e prazo, alerta de vencimento (60 dias) e de reajuste, anexos por link, bloquear/reativar/encerrar. **Medição de subempreiteiro**: Engenheiro lança, Gerente/Diretoria aprova; a aprovação gera uma **nota** rateada ao item (entra no custo, no fluxo de liberar/pagar e na retenção de INSS do contrato). Não excede o valor vigente; contrato bloqueado não aceita medição.
- **Projetos**: modelos com etapas e cronograma, equipe, % por etapa, horas apropriadas (custo da hora em `par.custoHoraPrj`, padrão R$ 120).
- **Patrimônio** (`35_patrimonio.js`): bens com depreciação linear mensal pró-rata (vida contábil; a fiscal só informa), seguro, manutenção, local e baixa. A ativação, a depreciação e a baixa entram **automaticamente no Diário** (contas 1.2.01, 1.2.02, 5.9.03–5.9.05).
- **Frota**: veículos/equipamentos com horímetro/km, abastecimento, checklist (reprovação abre OS corretiva), OS preventiva/corretiva (alerta por prazo ou uso), pneus e **custo por hora** (combustível + OS + depreciação do bem vinculado), que preenche o R$/h do equipamento no apontamento do Campo.
- Migração `0013_fase16.sql` (tipos `ctr, prj, pat, frt, fmv`). Testes: `supabase/tests/fase16.sql`, `scripts/e2e_fase16.js`.

## Fase 17 — Pessoas, Dashboard/BI e Administração
- **Início abre no Dashboard** (`37_gestao.js`): cartões de indicadores com meta e semáforo, contrato × custos × lucro, Curva S, fluxo de caixa, custo por natureza e pacote, maiores desvios, funil de compras, Campo/Lean (PPC), estoque, **Pessoas** (frequência, absenteísmo, situação, faltas por funcionário, efetivo por cargo, no estilo dos exemplos enviados, nas cores do sistema), carteira de obras e pendências. Filtro de período (mês atual, 3 meses, tudo) e "Escolher o que mostrar" (seções, cartões e metas, guardados em `par.bi`). A aba "Hoje" segue como lista de ação.
- **Pessoas** (`36_pessoas.js`, área Pessoas): colaboradores (CPF validado, função do banco de MO, grupo Administrativo/Produção), **ponto por situação** (presente, folga, falta, atestado, férias, externo, INSS) com horas por frente, banco de horas, custo de pessoal (extra ×1,5, encargos configuráveis), "Puxar do ponto" no apontamento do Campo, **SST** (ASO, NR, EPI) com alerta de 30 dias e **bloqueio de ponto** com ASO vencido/ausente. Absenteísmo = (falta + atestado + INSS) ÷ (registros − folga − férias); frequência = 1 − absenteísmo.
- **Indicadores e BI**: catálogo de 16 indicadores e painel dinâmico (fonte × agrupar × somar, com CSV).
- **Administração** (`38_admin.js`): grupos de permissão, acesso temporário e suplente de aprovador (por período), horário de acesso, alçadas por evento (medição de subempreiteiro e ajuste contábil acima do limite só com a Diretoria), parâmetros de pessoas, backup JSON (restaura só no modo demonstração), auditoria com filtros e CSV, fluxos com SLA (admissão, mobilização, fechamento mensal).
- **Limite conhecido**: acesso temporário, suplência e horário valem na interface; no banco só vale o papel gravado em `perfil`. Para dar escrita real a alguém, mude o papel dele em Usuários.
- Migração `0014_fase17.sql` (tipos `col`, `pto`, `sst`) aplicada. Testes: `supabase/tests/fase17.sql`, `scripts/e2e_fase17.js` (51 checks).


## Visão geral final (fim da rodada, Fase 18)
**Mapa do código** (`web/src/js`, concatenado por `scripts/build_web.py` em `web/index.html`): 00 util/memo · 01 papéis · 02 estado · 03 Supabase · 04–06 plano de contas, motor de regras (semáforo/alçadas), derivados · 07 alertas · 08 menu/áreas · 09 Hoje · 10–11 orçamento/pacotes · 12 compras · 13 notas · 14 financeiro · 15 medição · 17–18 Campo/Lean · 19 faturamento/caixa/DRE · 20–23 fiscal, planilha, apuração, integrações · 24 painéis · 25 auditoria · 26 render/eventos · 27 cadastros · 28 obras · 29 painel da obra · 30–31 financeiro nativo/títulos · 32 contabilidade · 33 suprimentos/estoque · 34 contratos/projetos · 35 patrimônio/frota · 36 pessoas · 37 dashboard/BI · 38 administração · 39 acessibilidade · 40 ajuda (gerada de `docs/MANUAL_*.md`) · 99 boot. Banco: `supabase/migrations/0001…0015`, testes em `supabase/tests`. Manuais por papel: `docs/MANUAL_*.md` (e botão **Ajuda** no sistema). Backup: `docs/BACKUP_E_RECUPERACAO.md`. Levar para a Lovable: `docs/HANDOFF_LOVABLE.md`.

**Como trabalhar**: edite `web/src`, rode `python3 scripts/build_web.py && python3 scripts/build_html.py`, depois `bash scripts/qa.sh`. Mudança de banco = nova migração + teste SQL; no Supabase aplique em partes pequenas por `execute_sql` se `apply_migration` der timeout.

**Pendências do usuário** (não dependem de código): criar a conta Admin e fechar o cadastro aberto; definir valores de alçada e metas dos cartões; confirmar alíquotas e plano de contas com o contador; exportar do ERP de referência os lançamentos da 343/342 para a conferência; decidir se um dia o custo do material passa a ser por consumo (hoje é pela nota).

## Fase 19 — Tema claro/escuro, só obra 342, vazio = 0, filtros em tudo
- **Tema**: botões **Claro | Escuro** no topo (`web/src/js/41_tema.js`); a escolha fica em `localStorage.taf_tema`; sem escolha, segue o sistema.
- **Só a 342**: o sistema não mostra mais textos/botões de "demonstração" nem as obras 343/281. Elas ficam guardadas em `web/data/` e voltam acrescentando uma linha em `OBRAS_PADRAO` (`28_obras.js`) e em `scripts/build_html.py` (`TAF_OBRAS`).
- **Vazio = 0**: o que não tem dado aparece como `0` (`43_zeros.js`), nunca "—".
- **Filtros** (`42_filtros.js`): cada tabela ganha busca, filtro por coluna, datas, faixa de valor, ordenação no cabeçalho, "só alertas", duplo clique para filtrar por valor, Limpar e Copiar CSV. Dashboard e Painel da obra têm filtro de período (e natureza).
- Teste: `scripts/e2e_fase19.js` (incluído em `qa.sh`).

## Fase 20 — Tema discreto, filtros do Início, sem Sankhya
- **Tema**: dois ícones (sol/lua) no fim da sidebar; o escuro agora é cinza (`--bg:#1c1d21`).
- **Início**: barra de período (**Hoje** padrão · 7 dias · Mês · 3 meses · Ano · Tudo · Personalizado De/Até) e natureza em popover com chip ×. Mesma barra no Painel da obra. Código: `periodoRange()` e `barraFiltros()` em `37_gestao.js`.
- **Sem Sankhya**: removidos da tela, dos testes e das funções de servidor. A aba **Conferência** agora confere o próprio sistema (contrato × EAP, notas × rateio, gasto × realizado, faturado × recebido, comprometido × teto). A matriz virou `docs/MATRIZ_FUNCIONALIDADES.md`. As `fontes/` originais não foram alteradas.
- **Obra**: o bloco no topo da sidebar (com ▾) abre o seletor de obras.
- Teste: `scripts/e2e_fase20.js` (no `qa.sh`).

## Link na Vercel (sem login)
- Projeto Vercel `taf` (liga ao GitHub; a branch padrão do repositório é `claude/obras-compras-management-e4nsfm`, então cada push publica). Serve a pasta `web/` (`vercel.json`).
- `web/config.js` está em `modo: 'aberto'` (sem login, cada navegador guarda os próprios dados). Para ligar login e banco compartilhado, troque para `modo: 'supabase'`.
- Sem login, quem tiver o link vê a obra 342.
