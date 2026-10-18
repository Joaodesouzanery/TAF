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
4. Ordem: Supabase → Apontamento e Lean → BM/faturamento e DRE → NF-e/fiscal/Sankhya.
5. Fiscal: provedor externo + exportar ao contador. Sankhya: só API oficial; REA não se aplica.
6. As planilhas já enviadas bastam; não esperar REV13/META REV02.
7. Sem autenticação por enquanto.
8. Guardar tudo no GitHub (migração de conta) e guardar as planilhas no repositório.

## Fase 12 (18/10/2026): base do ERP
Decisão do usuário: **não integrar com o Sankhya; criar as funções equivalentes aqui**, em 8 áreas de menu com abas internas, com login e banco compartilhado. Plano das fases 12 a 18 em `docs/PLANO_E_HISTORICO.md`; rastreio de cada item do inventário em `docs/MATRIZ_SANKHYA_X_TAF.md` (gerada por `scripts/gera_matriz.py`).
- **Código modular**: edite `web/src/` (`shell.html`, `style.css`, `js/NN_*.js`) e rode `python3 scripts/build_web.py` (gera `web/index.html`, que a Vercel publica) e `python3 scripts/build_html.py` (arquivo único `dist/tafadmin.html`, com as 3 obras embutidas). `scripts/build_artifact.py` gera a versão do link do Claude (modo aberto, sem Supabase).
- **Login é o padrão** (`web/config.js`, `modo: 'supabase'`). **O link do Claude bloqueia rede**: lá o app roda só em demonstração. O link de uso real é o da Vercel (`tafadmin.vercel.app`). O **primeiro cadastro vira Administrador**: crie a sua conta antes de passar o link a alguém e depois feche o cadastro aberto (Supabase → Authentication → Sign In / Providers → desligar "Allow new users to sign up"; novos usuários entram só por convite).
- Numeração (SC-, OC-, NF-…) vem do servidor (`reservar_numeros`, migração `0009`), sem repetir entre pessoas.
- Cadastros base (fornecedores e clientes, insumos, contas bancárias) valem para todas as obras (documentos `forn`, `ins`, `banc`).
- Várias obras: seletor no topo do menu. 343 (só preço licitado, sem estudo de custo) e 281 (histórico do consórcio, tudo no item S.1) vêm de `web/data/` (gerados por `scripts/import_outras_obras.py`); no banco entram por "Importar" (Gestão/Diretoria).

## Fase 11 (18/10/2026)
Alçadas por faixa de valor, atualização das metas pela planilha, apuração estimada de tributos, e as integrações de NF-e e Sankhya em funções do Supabase (`supabase/functions/`), prontas para ligar. Leia `docs/INTEGRACOES.md` e `docs/SANKHYA_PESQUISA.md`. A atualização pela planilha grava a nova linha de base em `obra.estado` (campos `baseOv` e `basePac`); o `item_eap` do banco guarda a versão 1.

## Pendências do usuário
1. Renomear o projeto Vercel para `tafadmin` (e conferir Domains e a Production Branch).
2. Decidir quando reativar o login (e fechar o cadastro aberto no Supabase).
3. Credenciais de API do Sankhya (com o administrador de lá), contratar/habilitar o provedor de NF-e, cadastrar os secrets e publicar as funções (passo a passo em `docs/INTEGRACOES.md`). Exige reativar o login.
4. Definir valores de alçada (R$: hoje verde sem confirmação até 100.000, Gerente até 250.000) e a tolerância nota × pedido (2%), e conferir as alíquotas da apuração com o contador.
5. Confirmar a versão vigente da META (REV13/META REV02), quando existir.

## Próximos passos sugeridos
- **7b**: importar a EAP da obra 343 (Viabilidade CAESB, preço unitário) e o histórico da 281 (aba 08D do TAF rev6) para a fila "sem item".
- Numeração de documentos no servidor (evita repetir número com vários usuários).
- Quando houver credencial: função no Supabase para Sankhya e para o provedor de NF-e.
- Reabrir login e testar com contas reais de cada papel.

## Cuidados
- No link do Claude: `alert/confirm/prompt` não aparecem, downloads são bloqueados e só scripts de cdnjs/jsdelivr/unpkg carregam. O app foi ajustado para isso (janelas na página, texto copiável).
- Ao editar `web/index.html`, rode `bash scripts/qa.sh` antes de publicar.

## Fase 13 — Painel de Contratos/Obra, conferência Sankhya e financeiro nativo
- **Painel**: Início → Painéis → aba *Contrato da obra* (`29_painel_contrato.js`): mesmos blocos do Painel de Contratos do Sankhya (contrato, faturado, fat. direto, impostos, gasto pago/a pagar/atrasado, requisição, custo fixo, prov. gasto, saldo a faturar, lucro) + gráfico contrato×custos×lucro, Curva S, saúde (IDC, margem), alertas, desvios, custo por natureza, cópia CSV.
- **Conferência Sankhya** (aba): digita os totais do Sankhya e vê bate/difere + causa provável. **Importar lançamentos** (aba): CSV `tipo;numero;fornecedor;descricao;vencimento;valor;pago_em;fat_direto` (tipo gasto|custo_fixo|provisao), sem duplicar, com desfazer.
- **Financeiro** → *Contas e extrato* (OFX, baixa múltipla com juros/multa/desconto, CNAB 240 genérico — validar com o banco) e *Cobrança* (mensagem + link WhatsApp manual).
- Migração `0010_fase13.sql` (tipos lfx, mov, cobr) já aplicada no Supabase TAF. Testes: `supabase/tests/fase13.sql`, `scripts/e2e_fase13.js`.
- Os prints do Sankhya são da obra **343**; só o contrato (R$ 5.226.634,03) existia nas planilhas — gasto/provisão/custo fixo vêm do financeiro do Sankhya (importar CSV para conferir).
