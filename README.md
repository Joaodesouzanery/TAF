# TAF Obras

> **Quem for continuar o projeto: leia [`docs/COMECE_AQUI.md`](docs/COMECE_AQUI.md).** Planilhas e documentos de origem estão em `fontes/` (repositório privado: não torne público).

Gestão de obras onde cada real entra amarrado a **obra + item do orçamento + natureza**: compra travada na meta e no teto do item, nota com rateio fechando 100%, saldos meta / comprometido / realizado.

Especificação: *SaaS de Gestão de Obras TAF — Fluxo Completo do Sistema (rev01)*.

## Estado (por fases)
| Fase | Conteúdo | Situação |
|---|---|---|
| 1 | Schema, importador da 342, design system, tela **Hoje** | feita |
| 2 | Orçamento (EAP em árvore), pacotes, congelar linha de base, remanejar saldo | feita |
| 3 | Solicitação → mapa de cotação → OC com semáforo, alçadas e recebimento | feita |
| 4 | Nota fiscal, rateio fechando 100%, conferência, liberação e pagamento | feita |
| 5 | Painéis (compras, obra, carteira) e auditoria | feita (demo) |
| 6 | Plano de contas, composição por natureza, contas a pagar + conciliação, medição e resultado por item (lucro/prejuízo, VA, IDC, EAC) | feita (demo) |
| 7 | Supabase real: login, papéis, RLS, documentos gravados no banco, importação da obra 342, tela Usuários | feita |
| 8 | **Campo** (apontamento diário: rascunho → conferido → aprovado, HH, produtividade × CPU, custo de MO, fila offline) e **Lean** (pauta de segunda, lookahead de 6 semanas, restrições com limite de 8 por dono e escalonamento, PPC com Pareto, tarefas) | feita |
| 9 | **Faturamento e caixa**: boletim ao cliente (medições atestadas + reajuste, aprovação com glosa), NF de serviço, recebimento e conciliação de extrato, caixa mensal; **DRE** por obra e visão medido × executado × meta | feita |
| 10 | **Importar XML de NF-e** (chave única, sugestão de OC), **fechamento mensal ao contador** (CSV), arquivo de apoio Sankhya; API do Sankhya e provedor de NF-e aguardam credenciais | feita (sem integrações externas) |
| 11 | Alçadas por faixa de valor, atualizar metas pela planilha (nova versão da linha de base), apuração estimada de tributos, funções de NF-e automática e Sankhya (prontas para ligar, exigem login e credenciais) | feita |
| 7b | Importar EAP da 343 e histórico da 281 | a fazer |

## Supabase (projeto "TAF")
Migrações em `supabase/migrations/` (0001–0008) já aplicadas no projeto. `web/config.js` aponta para ele com a chave **publishable** (pública; a segurança está no RLS). A biblioteca `supabase-js` está em `web/vendor/` (sem CDN).

**Primeiro acesso:** abra o app e *Criar conta*. **O primeiro cadastro vira Administrador** e os demais ficam "Aguardando liberação" até o admin atribuir o papel em *Usuários*. Faça isso logo após publicar e, depois, desative novos cadastros em Supabase › Authentication › Sign In / Providers (*Allow new users to sign up*) se quiser fechar o acesso. Se o Supabase exigir confirmação de e-mail, confirme pelo link recebido (ou desative *Confirm email* nas mesmas configurações).
Depois do login, o admin clica em **Importar obra 342** (orçamento, pacotes, metas e plano de contas).

Papéis: admin, gestão, diretoria, gerente, engenheiro, compras, almoxarife, administrativo, financeiro. Os documentos do fluxo (solicitação, OC, nota, título, medição, auditoria) ficam na tabela `documento`; o RLS impede apagar e impede editar a auditoria. As regras de negócio (semáforo, alçadas, rateio 100%) rodam no app; as travas SQL das migrações 0001–0003 valem para o modelo relacional futuro.
Testes: `supabase/tests/rls.sql`, `node scripts/e2e.js` (demo, abre com `?demo=1`) e `node scripts/e2e_sb.js` (modo conectado contra um Auth/PostgREST simulado).

## Arquivo único
`python3 -I scripts/build_html.py` gera `dist/tafadmin.html` (dados embutidos, abre sem servidor). Na versão demo, os lançamentos ficam no `localStorage` do navegador; o motor de regras em JS espelha as regras SQL (`0001`/`0002`). A próxima etapa é ligar o app ao Supabase (mesmo schema).

## Rodar
```bash
# 1. gerar dados a partir da planilha (Estudo 342 REV10)
python3 -I scripts/import_planilhas.py "OBRA 342 - ESTUDO DE OBRA INTERNO REV10.xlsx"   # requer openpyxl
# 2. abrir a interface (usa web/data/obra342.json)
cd web && python3 -m http.server 8000
```
Para ler do Supabase, preencha `web/config.js` com a URL e a chave **pública** do projeto. Nunca coloque a chave de serviço no front.

## Banco
```bash
psql -d taf -f supabase/migrations/0001_core.sql -f supabase/migrations/0002_semaforo_saldo.sql -f supabase/migrations/0003_fase6.sql
psql -d taf -f supabase/seed/342.sql -f supabase/seed/plano_contas.sql
psql -d taf -f supabase/tests/semaforo.sql      # "OK: todas as regras passaram"
psql -d taf -f supabase/tests/fase6.sql         # "OK: fase 6 passou"
node scripts/e2e.js                             # teste de ponta a ponta no navegador (Playwright)
```
Regras já no banco: semáforo (`calc_semaforo`), teto vale sempre (meta > teto nasce vermelho), nada é apagado, auditoria de meta/teto/preço, views de saldo por item e pacote.

## Deploy (tafadmin.vercel.app)
Na Vercel: *Add New → Project* → importar `Joaodesouzanery/TAF` → nome do projeto `tafadmin` → *Framework: Other*, sem build. O `vercel.json` já aponta `outputDirectory = web`.

## Pendências do usuário
Versão vigente da META (REV02) e do Estudo (REV13); valores de alçada em R$; plano de contas validado com o contador.

## Fase 8
Testes: `node scripts/e2e_fase8.js` (demo) e `supabase/tests/fase8.sql` (RLS dos papéis encarregado/planejamento). Banco de MO (aba 18, custo/h = mensal ÷ 220) e HH por unidade (aba 24) vêm do importador (`supabase/seed/fase8_342.sql`). Equipamentos: informe R$/h no apontamento para entrar no custo do dia.

## Modo aberto (sem login)
`web/config.js` traz `modo: 'aberto'`: o app abre direto, com o seletor “Entrar como”, e cada navegador guarda seus dados. Para reativar login e banco compartilhado, troque para `modo: 'supabase'` (ou abra com `?sb=1`). Testes da Fase 9: `node scripts/e2e_fase9.js` e `supabase/tests/fase9.sql`.
