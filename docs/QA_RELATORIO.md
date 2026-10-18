# Relatório de QA (16/10/2026)

Execução: `bash scripts/qa.sh` (sobe Postgres 16 local, aplica `supabase/migrations/*` e seeds, roda os testes SQL e os e2e no Chromium) e `node scripts/qa_visual.js` (todas as telas em 1400 px e 400 px, claro e escuro).

## Resultado
| Suíte | Resultado |
|---|---|
| SQL semaforo, fase6, rls, fase8, fase9, fase10 | OK |
| e2e geral (28 checks), Fase 8 (19), Fase 9 (17), Fase 10 (14), conectado simulado (19) | OK, sem erro de JavaScript |
| Varredura visual (13 telas × 4 variações) | sem overflow horizontal nem texto cortado depois das correções |

## Achados e correções
1. **Menu ocupava a primeira tela no celular** (Campo é mobile-first e ficava escondido abaixo do menu). Menu virou barra horizontal rolável; corrigido.
2. **Barra de menu empurrava a página para 1.900 px de largura no celular** após a primeira correção (item de grade sem `min-width: 0`). Corrigido e coberto pela varredura visual.
3. **`CAN.receber` duplicado**: a Fase 9 sobrescreveu a permissão de recebimento de OC (almoxarife). Detectado pelo e2e antigo; a permissão nova passou a se chamar `recFat`.
4. **`prompt()` e `confirm()` não funcionam no link do Claude**: congelar linha de base, reprovar, cancelar OC e replanejar restrição viraram janelas dentro da página; "Restaurar demonstração" pede segundo clique.
5. **`rls.sql` dependia de usuários criados à mão**: agora cria os próprios usuários de teste.
6. Download por `<a download>` é bloqueado no link do Claude: o arquivo do contador aparece em caixa de texto com botão Copiar (o botão Baixar funciona fora do link, por exemplo na Vercel).

## Supabase (projeto TAF)
- Contagens conferidas: 451 linhas de EAP, 346 itens, 21 pacotes, 38 contas, 32 funções de MO, 198 itens com HH de referência, meta total R$ 2.857.563,84, 0 documentos, 0 perfis.
- Migrações 0001 a 0008 aplicadas. 
- Avisos do analisador de segurança: (a) 8 tabelas relacionais antigas com RLS ligado e sem política: intencional, ficam negadas (o app usa `documento`); (b) 4 funções `SECURITY DEFINER` executáveis por usuários autenticados (`meu_papel`, `tem_papel`, `pode_escrever`, `importar_obra`): intencional, as políticas dependem delas e `importar_obra` checa o papel por dentro; `anon` não executa nenhuma.

## Limites conhecidos
- Modo aberto: dados por navegador, não compartilhados. Não há concorrência a tratar.
- Numeração de documentos é local (`SC-0001`…); com vários usuários simultâneos no modo Supabase pode repetir número (ver `COMECE_AQUI.md`).
- Alçadas em R$ e tolerância nota × pedido usam valores padrão até a Diretoria definir.
- O teste de login real no Supabase não é possível a partir do ambiente de desenvolvimento (domínio bloqueado); só a versão simulada foi testada.

## Atualização 18/10/2026 (Fase 11)
`bash scripts/qa.sh` agora roda 6 testes SQL, 6 conjuntos e2e (28 + 19 + 17 + 14 + 18 + 22 verificações), os adaptadores de integração (10) e a varredura visual: tudo OK.
- Novos testes: alçadas por faixa, atualização pela planilha (.json e .xlsx sintético), apuração de tributos com valores conhecidos, integrações sem login, e funções de NF-e e Sankhya simuladas no modo conectado.
- As funções `nfe-sync` e `sankhya-sync` **não foram publicadas** no Supabase nem testadas contra um serviço real. O arquivo `index.ts` de cada uma (camada Deno) não é executado pelos testes; a lógica está em `supabase/functions/_shared/` e é testada com `node --experimental-strip-types`.
- O botão "Baixar .csv" não funciona dentro do link do Claude (download bloqueado); use "Copiar".

## Fechamento da rodada (Fase 18, 18/10/2026)
`bash scripts/qa.sh` roda: 17 conjuntos SQL, 14 e2e, ações sem handler, desempenho com massa de dados, conferência da obra 342 contra a planilha, adaptadores e varredura visual.
- **Varredura geral** (`e2e_fase18.js`): 12 papéis × todas as telas visíveis × tema claro/escuro × 1400 e 400 px sem erro de JS e sem overflow horizontal; invariantes de dados (rateio 100%, balancete D=C, balanço A=P+PL+resultado, kardex=saldo, painel=soma das notas, drill-down=bloco, RH frequência+absenteísmo=100%).
- **Ações órfãs** (`check_acoes.js`): 187 ações de botão, todas com handler.
- **Desempenho** (`perf.js`, render por tela, massa aleatória): antes — N=1.000 registros por tipo: Administração 1.439 ms (backup JSON desenhado na tela), Dashboard 424 ms, demais ~150 ms; depois (cálculos memoizados por render, índices por insumo e por OC, backup sob demanda) — pior tela 127 ms; N=3.000: pior tela ~400 ms. Orçamento do QA: ≤ 300 ms (N=1.000) e ≤ 1 s (N=3.000). A passada de acessibilidade custa ~4 ms em tabela de 1.000 linhas.
- **Acessibilidade**: modais com `role=dialog`, foco inicial, armadilha de Tab e Esc; linhas clicáveis acessíveis por teclado; `th scope`; `:focus-visible`; movimento reduzido; alvos de 44 px no celular; **contraste AA** medido em 10 telas nos dois temas (pills corrigidas com tokens `--*-ink`).
- **Segurança** (`get_advisors`): corrigido o gatilho de competência chamável por RPC (migração 0015). Restam apenas avisos informativos das tabelas relacionais antigas sem uso (documentado em `BACKUP_E_RECUPERACAO.md`).
- **Limites conhecidos**: acesso temporário, suplência e horário valem só na interface; login real no Supabase não é testável deste ambiente (testado com Auth simulado e em uso manual); CNAB é layout genérico; SPED/Reinf só como arquivo de apoio.

## Fase 19
`bash scripts/qa.sh` verde: 15 e2e (e2e_fase19 com 35 checks: tema, só 342, zeros, filtros, contraste nos dois temas, sem overflow a 400/1400 px), SQL, ações, desempenho (164 ms @1000, 600 ms @3000), conferência 342.
