-- Fase 15: est e inv. Requer 0001-0012.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000a1','al@x'),('00000000-0000-0000-0000-0000000000a2','en@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000a1','almox','almox'),('00000000-0000-0000-0000-0000000000a2','eng','engenheiro') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f15-e',ob,'est','{"tipo":"ent"}'),('f15-i',ob,'inv','{"status":"aberto"}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
  insert into documento(id,obra_id,tipo,dados) values ('f15-e2',ob,'est','{"tipo":"sai"}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f15-i2',ob,'inv','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO grava inventário';
end $$;
select 'fase15 ok';
