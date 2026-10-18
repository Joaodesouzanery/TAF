# Levar o TAF Admin para a Lovable (continuar amanhã)

## Onde está tudo
- **GitHub (privado), branch `claude/obras-compras-management-e4nsfm`**: código, banco (migrações e testes), dados das obras 342/343/281, **planilhas-fonte** (`fontes/`), documentação. Conferido: o último commit local é igual ao do GitHub. A pasta do sandbox do Claude **não** é a sua pasta local; o que vale é o GitHub. Para ter na sua máquina: `git clone <url do repositório>` e `git checkout claude/obras-compras-management-e4nsfm`.
- **Supabase** (projeto `TAF`, id `kefkgydvjjakqaonyjau`, us-east-1): banco com a obra 342 carregada e todas as migrações 0001–0015 aplicadas. Chave pública em `web/config.js`; **nunca** use a `service_role` no front.
- **Vercel**: serve a pasta `web/` (arquivo único `index.html`, gerado de `web/src/`).
- Demonstração: https://claude.ai/artifact/AmUjKVFnEXoqfu2SPj2m9x (modo aberto, sem login).

## Conferência da obra 342 (feita)
`python3 scripts/verifica_342.py` compara o JSON do sistema com as planilhas, item a item. Resultado: 346 itens, preço licitado, quantidade, meta e teto de cada item conferem com as abas 31, 11 e 12 do Estudo REV10; 21 pacotes conferem; contrato R$ 3.257.970,74; a soma dos itens licitados dá R$ 3.257.999,99 (diferença de R$ 29,25 que já vem da planilha). O banco Supabase tem os mesmos totais (itens: venda 3.257.999,99; meta 2.857.563,84; teto 2.981.070,02). Pontos a saber:
- A meta de compra enviada estava marcada como substituída pela REV02; foi usada a aba 11/12 do Estudo REV10, aguardando REV13/META REV02.
- 80 itens estão "a cotar" (meta R$ 774.347,14) e 68 itens têm meta acima do teto: são avisos do próprio estudo, não erro de carga.
- Nada de custo realizado existe ainda na 342 (obra começa em 19/10/2026).
- Só a obra 342 está no Supabase; 343 e 281 entram pelo botão "Obras → importar" (dados em `web/data/obra343.json` e `obra281.json`).

## Como usar na Lovable (duas opções)
**Opção A — rápida (recomendada para amanhã):** a Lovable gera React + Vite + Supabase. Crie um projeto novo, conecte o **mesmo** projeto Supabase e copie para `public/taf/` o conteúdo de `web/` (`index.html`, `config.js`, `data/`, `vendor/`). Na Lovable, crie uma rota que abra `/taf/index.html` em tela cheia (iframe ou link). O sistema já tem login (Supabase Auth), papéis e RLS; a Lovable só hospeda e você segue evoluindo a partir do GitHub.

**Opção B — reescrever em React aos poucos:** cada tela vira um componente lendo as mesmas tabelas. O modelo de dados é: tabelas `obra`, `pacote`, `item_eap`, `plano_contas`, `perfil`, `contador` e a tabela genérica `documento(id, obra_id, tipo, dados jsonb)` com os tipos `sol, oc, nf, tit, med, conc, aud, apt, rst, atv, tar, bc, fat, rec, lan, fech, forn, ins, banc, lfx, mov, cobr, ctb, est, inv`. Regras de negócio (semáforo, alçadas, rateio = 100%) estão em `web/src/js/05_motor_de_regras.js` e espelhadas em SQL (`supabase/migrations/0002_semaforo_saldo.sql`). Papéis e permissões: `web/src/js/01_papeis.js` e `pode_escrever()` no banco.

## Prompt para colar na Lovable
"Este projeto continua o sistema TAF Admin (gestão de obras de saneamento: cada obra é centro de custo; EAP com meta e teto; solicitação → cotação → OC com semáforo e alçadas → nota com rateio 100% → pagamento/conciliação → medição → resultado por item; financeiro, contábil, estoque). Use o Supabase já conectado (projeto kefkgydvjjakqaonyjau), não altere as tabelas existentes sem criar migração em supabase/migrations e teste em supabase/tests. Leia docs/COMECE_AQUI.md e docs/FLUXO_NF.md antes de qualquer mudança. O front atual está em web/ (HTML único gerado de web/src por scripts/build_web.py)."

## Primeiros passos amanhã
1. Clonar o repositório e rodar `bash scripts/qa.sh` (precisa de Postgres local e Playwright; opcional).
2. Criar a conta de **administrador** no site (a primeira conta vira Admin) e **fechar o cadastro aberto** no Supabase (Authentication → Providers → desligar "Allow new users to sign up" depois de criar os usuários).
3. Importar 343 e 281 pelo botão Obras.


## Atualização (Fase 18)
O sistema está completo até a Fase 18: Dashboard no Início, 8 áreas, manuais por papel (`docs/MANUAL_*.md` e botão Ajuda), QA com 17 conjuntos SQL e 14 e2e. Fim da rodada: commit `5ed308a`. Ao trazer para a Lovable, rode `bash scripts/qa.sh` (precisa de Postgres local e Playwright) ou apenas `node scripts/check_acoes.js` e `python3 scripts/verifica_342.py`.
