# TAF Obras

Gestão de obras onde cada real entra amarrado a **obra + item do orçamento + natureza**: compra travada na meta e no teto do item, nota com rateio fechando 100%, saldos meta / comprometido / realizado.

Especificação: *SaaS de Gestão de Obras TAF — Fluxo Completo do Sistema (rev01)*.

## Estado (por fases)
| Fase | Conteúdo | Situação |
|---|---|---|
| 1 | Schema, importador da 342, design system, tela **Hoje** | feita |
| 2 | Orçamento (EAP em árvore), pacotes, congelar linha de base, remanejar saldo | feita |
| 3 | Solicitação → mapa de cotação → OC com semáforo, alçadas e recebimento | feita |
| 4 | Nota fiscal, rateio fechando 100%, conferência, liberação e pagamento | feita |
| 5 | Painéis (compras, obra, carteira) e auditoria | feita (demo); falta importar 281 e 343 |

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
psql -d taf -f supabase/migrations/0001_core.sql
psql -d taf -f supabase/seed/342.sql
psql -d taf -f supabase/tests/semaforo.sql      # deve imprimir "OK: todas as regras passaram"
```
Regras já no banco: semáforo (`calc_semaforo`), teto vale sempre (meta > teto nasce vermelho), nada é apagado, auditoria de meta/teto/preço, views de saldo por item e pacote.

## Deploy (tafadmin.vercel.app)
Na Vercel: *Add New → Project* → importar `Joaodesouzanery/TAF` → nome do projeto `tafadmin` → *Framework: Other*, sem build. O `vercel.json` já aponta `outputDirectory = web`.

## Pendências do usuário
Versão vigente da META (REV02) e do Estudo (REV13); valores de alçada em R$; plano de contas validado com o contador.
