# Backup e recuperação

## O que existe e onde
| O quê | Onde | Observação |
|---|---|---|
| Código, migrações, testes, planilhas-fonte, dados das obras 342/343/281 | GitHub (repositório privado, branch `claude/obras-compras-management-e4nsfm`) | O commit `5ed308a` (Fase 18) marca o fim desta rodada |
| Dados em uso (documentos, obras, perfis) | Supabase, projeto `TAF` (`kefkgydvjjakqaonyjau`) | Backups automáticos conforme o plano do Supabase (diário; recuperação ponto-a-ponto só em planos pagos) |
| Backup da obra aberta (JSON) | Administração → Gerar backup | Restaura só no modo demonstração |
| Demonstração (Artifact) | claude.ai | Dados ficam no navegador de cada pessoa |

## Rotina recomendada
1. **Semanal:** `bash scripts/backup_supabase.sh` (precisa de `pg_dump` e da string de conexão em `TAF_DB_URL`). Guarde o `.dump` e o CSV **fora do repositório** (nuvem privada).
2. **Antes de qualquer migração:** rode o backup acima e confirme `bash scripts/qa.sh` verde.
3. **Mensal:** em Administração, gere o backup JSON de cada obra aberta e guarde junto.
4. **Depois de importar planilhas novas:** `python3 scripts/verifica_342.py` confere o sistema contra a planilha.

## Recuperar
- **Apagou ou alterou documentos:** a Auditoria tem antes e depois de cada mudança; documentos não são apagados pelo app (cancelar muda o status). Restaure do `.dump`: `pg_restore --clean --if-exists --no-owner -d "$TAF_DB_URL" taf-AAAAMMDD.dump`.
- **Banco novo (outro projeto Supabase):** aplicar `supabase/migrations/0001…0015` em ordem, depois `supabase/seed/*`, depois restaurar o dump dos dados; criar a conta Admin e conferir `supabase/tests/*.sql`.
- **Perdeu o front:** `python3 scripts/build_web.py` regenera `web/index.html` a partir de `web/src`.

## Segurança
- Chave `service_role` e senha do banco **nunca** no front nem no GitHub. A chave publicável em `web/config.js` é pública; o RLS protege os dados.
- Depois de criar os usuários, **feche o cadastro aberto** (Authentication → Providers → Email → desligar "Allow new users to sign up").
- Verificação feita na Fase 18 (`get_advisors`): sem alertas críticos. Avisos informativos restantes: tabelas relacionais antigas com RLS ligado e sem política (não usadas pelo app, que grava em `documento`; ninguém acessa pela API) e índices de chave estrangeira nessas mesmas tabelas. Funções `meu_papel`, `tem_papel`, `pode_escrever`, `reservar_numeros` e `importar_obra` são chamáveis por usuário autenticado de propósito.
