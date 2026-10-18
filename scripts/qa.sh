#!/usr/bin/env bash
# QA completo: SQL (Postgres local, migrações 0001..0008 + seeds) e e2e (Playwright). Uso: bash scripts/qa.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
export NODE_PATH="$(npm root -g)"; SH=/tmp/qa_shots; mkdir -p $SH
fail=0; log(){ printf '%-34s %s\n' "$1" "$2"; }
python3 scripts/build_web.py >/dev/null && python3 scripts/build_html.py >/dev/null && python3 scripts/build_artifact.py >/dev/null
service postgresql start >/dev/null 2>&1; sleep 4
PS="su postgres -c"
$PS "psql -q -c 'drop database if exists taf_qa' -c 'create database taf_qa'" >/dev/null 2>&1
$PS "psql -q -d taf_qa -f $ROOT/scripts/qa_setup.sql" >/dev/null 2>&1
for f in supabase/migrations/*.sql supabase/seed/342.sql supabase/seed/plano_contas.sql supabase/seed/fase8_342.sql; do
  out=$($PS "psql -q -d taf_qa -v ON_ERROR_STOP=1 -f $ROOT/$f" 2>&1 | grep -i error | head -1); [ -n "$out" ] && { log "SQL $f" "ERRO $out"; fail=1; }; done
$PS "psql -q -d taf_qa -c 'grant usage on schema public to anon,authenticated' -c 'grant all on all tables in schema public to anon,authenticated'" >/dev/null 2>&1
for t in semaforo fase6 rls fase8 fase9 fase10 fase12 fase13 fase14 fase15 fase16 fase17; do
  r=$($PS "psql -q -d taf_qa -f $ROOT/supabase/tests/$t.sql" 2>&1 | grep -ci "error\|assert"); [ "$r" = 0 ] && log "SQL $t" OK || { log "SQL $t" "FALHOU"; fail=1; }; done
for t in e2e e2e_fase8 e2e_fase9 e2e_fase10 e2e_fase11 e2e_fase12 e2e_fase13 e2e_fase14 e2e_fase15 e2e_fase16 e2e_fase17 e2e_sb; do
  o=$(timeout 150 node scripts/$t.js $SH 2>&1); n=$(echo "$o" | grep -c '^OK'); f=$(echo "$o" | grep -c 'FALHA\|ERRO TESTE'); j=$(echo "$o" | grep 'erros JS' | grep -vc '\[\]')
  if [ "$f" = 0 ] && [ "$j" = 0 ] && [ "$n" -gt 0 ]; then log "E2E $t" "OK ($n checks)"; else log "E2E $t" "FALHOU"; echo "$o" | grep 'FALHA\|ERRO' | head -3; fail=1; fi; done
o=$(node --experimental-strip-types scripts/test_integracoes.mjs 2>&1 | grep -v ExperimentalWarning); n=$(echo "$o" | grep -c '^OK'); f=$(echo "$o" | grep -c 'FALHA\|Error')
if [ "$f" = 0 ] && [ "$n" -gt 0 ]; then log "Integrações (adaptadores)" "OK ($n checks)"; else log "Integrações (adaptadores)" "FALHOU"; echo "$o" | head -5; fail=1; fi
v=$(timeout 250 node scripts/qa_visual.js $SH/visual 2>&1 | tail -3); echo "$v" | grep -q "sem problemas" && log "Varredura visual" OK || { log "Varredura visual" "FALHOU"; echo "$v"; fail=1; }
[ $fail = 0 ] && echo "QA: TUDO OK" || echo "QA: HÁ FALHAS"; exit $fail
