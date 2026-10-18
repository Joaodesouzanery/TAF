-- Fase 17: col, pto, sst. Requer 0001-0014.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000c1','enc@x'),('00000000-0000-0000-0000-0000000000c2','adm@x'),('00000000-0000-0000-0000-0000000000c3','alm@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000c1','enc','encarregado'),('00000000-0000-0000-0000-0000000000c2','adm','adm'),('00000000-0000-0000-0000-0000000000c3','alm','almox') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f17-p',ob,'pto','{"sit":"presente"}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f17-c',ob,'col','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO cadastra colaborador';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f17-s',ob,'sst','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO grava SST';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c2',true);
  insert into documento(id,obra_id,tipo,dados) values ('f17-c2',ob,'col','{}'),('f17-s2',ob,'sst','{}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c3',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f17-p2',ob,'pto','{}'); exception when others then falhou := true; end;
  assert falhou, 'almoxarife NÃO lança ponto';
end $$;
select 'fase17 ok';
