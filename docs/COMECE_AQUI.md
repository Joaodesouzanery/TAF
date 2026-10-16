# Comece aqui (guia para continuar o projeto em outra conta ou com outra pessoa)

## O que é
SaaS de gestão de obras da **TAF** (saneamento). Cada obra é um centro de custo; cada item da planilha orçamentária (EAP) tem meta e teto. Fluxo: solicitação → mapa de cotação → ordem de compra (com semáforo e alçadas) → título a pagar → nota fiscal com **rateio manual somando 100%** → pagamento e conciliação → medição → lucro ou prejuízo por item. Depois vieram campo (apontamento), Lean, faturamento ao cliente, DRE, caixa e fechamento ao contador. Pedido original em `BRIEF_ORIGINAL.md`; fluxo em `FLUXO_NF.md`; cobertura em `CHECKLIST_REQUISITOS.md`; QA em `QA_RELATORIO.md`; integrações em `INTEGRACOES.md`; plano e histórico completo em `PLANO_E_HISTORICO.md`.

## Onde está cada coisa
| Parte | Caminho |
|---|---|
| App (arquivo único, JS puro) | `web/index.html` (+ `web/config.js`, `web/data/obra342.json`, `web/vendor/supabase.js`) |
| Gera o arquivo único para entregar | `python3 scripts/build_html.py` → `dist/tafadmin.html`; `python3 scripts/build_artifact.py` → `dist/tafadmin_artifact.html` (versão do link do Claude) |
| Banco (Postgres/Supabase) | `supabase/migrations/0001…0008`, seeds em `supabase/seed/`, testes em `supabase/tests/` |
| Importador das planilhas | `python3 -I scripts/import_planilhas.py fontes/OBRA_342_ESTUDO_DE_OBRA_INTERNO_REV10.xlsx` (gera JSON e seeds) |
| Testes | `bash scripts/qa.sh` (tudo) e `node scripts/qa_visual.js` (telas). Precisa de Node + Playwright global, Chromium em `/opt/pw-browsers`, Postgres 16 |
| Planilhas e documentos de origem | `fontes/` (versões substituídas em `fontes/antigas/`). **Ainda NÃO estão no GitHub: o repositório é público e as planilhas têm contratos e custos.** Torne o repositório privado e peça para enviar essa pasta, ou copie os arquivos à mão. |

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

## Pendências do usuário
1. Renomear o projeto Vercel para `tafadmin` (e conferir Domains e a Production Branch).
2. Decidir quando reativar o login (e fechar o cadastro aberto no Supabase).
3. Credenciais de API do Sankhya (com o administrador de lá) e contratar o provedor de NF-e, se quiser baixa automática.
4. Definir valores de alçada (R$) e a tolerância nota × pedido (hoje: 2%).
5. Confirmar a versão vigente da META (REV13/META REV02), quando existir.

## Próximos passos sugeridos
- **7b**: importar a EAP da obra 343 (Viabilidade CAESB, preço unitário) e o histórico da 281 (aba 08D do TAF rev6) para a fila "sem item".
- Numeração de documentos no servidor (evita repetir número com vários usuários).
- Quando houver credencial: função no Supabase para Sankhya e para o provedor de NF-e.
- Reabrir login e testar com contas reais de cada papel.

## Cuidados
- No link do Claude: `alert/confirm/prompt` não aparecem, downloads são bloqueados e só scripts de cdnjs/jsdelivr/unpkg carregam. O app foi ajustado para isso (janelas na página, texto copiável).
- Ao editar `web/index.html`, rode `bash scripts/qa.sh` antes de publicar.
