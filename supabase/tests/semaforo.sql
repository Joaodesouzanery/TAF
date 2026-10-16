-- Testa as regras do semáforo e do "nada é apagado". Rodar após migração + seed 342.
-- psql -d taf -v ON_ERROR_STOP=1 -f supabase/tests/semaforo.sql
begin;
create temp table t as
  select id, obra_id, qtd, meta_total m, teto_total tt from item_eap
  where eh_item and meta_total < teto_total and qtd > 1 order by meta_total desc limit 1;
do $$
declare r semaforo; t record;
begin
  select * into t from t;
  assert calc_semaforo(t.id, t.qtd, t.m/t.qtd - 0.01) = 'verde',    'dentro da meta -> verde';
  assert calc_semaforo(t.id, t.qtd, ((t.m+t.tt)/2)/t.qtd) = 'amarelo', 'entre meta e teto -> amarelo';
  assert calc_semaforo(t.id, t.qtd, t.tt/t.qtd + 1) = 'vermelho',   'acima do teto -> vermelho';
  assert calc_semaforo(gen_random_uuid(), 1, 10) = 'bloqueado',      'item inexistente -> bloqueado';
  select calc_semaforo(i.id, 1, 650000) into r from item_eap i join pacote p on p.id = i.pacote_id where p.codigo = 'ADM';
  assert r = 'vermelho', 'ADM na meta (650 mil > teto 439 mil) -> vermelho';
  select calc_semaforo(i.id, 1, 400000) into r from item_eap i join pacote p on p.id = i.pacote_id where p.codigo = 'ADM';
  assert r = 'verde', 'ADM abaixo do teto -> verde';
end $$;
-- nada é apagado
insert into ordem_compra(obra_id,item_id,qtd,preco_unit) select obra_id,id,1,10 from t;
do $$ begin
  begin delete from ordem_compra; raise exception 'delete deveria falhar';
  exception when others then assert sqlerrm like 'Nada é apagado%', sqlerrm; end;
end $$;
-- auditoria de meta
create temp table antes as select count(*) n from evento_auditoria where campo='meta_total';
update item_eap set meta_total = meta_total + 1 where id = (select id from t);
do $$ begin assert (select count(*) from evento_auditoria where campo='meta_total') = (select n from antes) + 1, 'auditoria da meta'; end $$;
rollback;
select 'OK: todas as regras passaram' as resultado;
