# TAF Obras

Gestão de obras onde cada real entra amarrado a **obra + item do orçamento + natureza**: compra travada na meta e no teto do item, nota com rateio fechando 100%, saldos meta / comprometido / realizado.

Especificação: *SaaS de Gestão de Obras TAF — Fluxo Completo do Sistema (rev01)*.

## Estado (por fases)
| Fase | Conteúdo | Situação |
|---|---|---|
| 1 | Schema, importador da 342, design system, tela **Hoje** | feita |
| 2 | Orçamento (EAP), pacotes, linha de base | a fazer |
| 3 | Solicitação → cotação → OC com semáforo e alçadas | a fazer |
| 4 | Nota fiscal e rateio, saldos por item | a fazer |
| 5 | Painéis e histórico da 281 / EAP da 343 | a fazer |

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
psql -d taf -f supabase/migrations/0001_core.sql
psql -d taf -f supabase/seed/342.sql
psql -d taf -f supabase/tests/semaforo.sql      # deve imprimir "OK: todas as regras passaram"
```
Regras já no banco: semáforo (`calc_semaforo`), teto vale sempre (meta > teto nasce vermelho), nada é apagado, auditoria de meta/teto/preço, views de saldo por item e pacote.

## Deploy
Vercel: projeto estático, `outputDirectory = web` (ver `vercel.json`).

## Pendências do usuário
Versão vigente da META (REV02) e do Estudo (REV13); valores de alçada em R$; plano de contas validado com o contador.
