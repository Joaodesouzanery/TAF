#!/usr/bin/env bash
# Backup lógico do banco TAF (Supabase). Não roda sozinho: precisa da URL de conexão (Settings → Database → Connection string)
# e do cliente PostgreSQL (pg_dump). NUNCA grave a senha neste arquivo nem no GitHub.
#   export TAF_DB_URL='postgresql://postgres:SENHA@db.kefkgydvjjakqaonyjau.supabase.co:5432/postgres'
#   bash scripts/backup_supabase.sh
set -euo pipefail
: "${TAF_DB_URL:?defina TAF_DB_URL com a string de conexão do Supabase}"
dir="${1:-backups}"; mkdir -p "$dir"; ts=$(date +%Y%m%d-%H%M%S)
pg_dump "$TAF_DB_URL" --schema=public --no-owner --no-privileges -Fc -f "$dir/taf-$ts.dump"
# dados do app em CSV simples (documentos por obra e tipo)
psql "$TAF_DB_URL" -c "\copy (select o.codigo, d.tipo, d.id, d.dados from documento d join obra o on o.id=d.obra_id order by 1,2,3) to '$dir/documentos-$ts.csv' csv header"
echo "Backup em $dir/ (taf-$ts.dump e documentos-$ts.csv). Guarde fora do repositório."
