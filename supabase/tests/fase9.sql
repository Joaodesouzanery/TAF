-- Fase 9: RLS dos documentos bc/fat/rec/lan.  Requer migrações 0001-0007 e a obra 342.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000b1','fin@x'),('00000000-0000-0000-0000-0000000000b2','alm@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000b1','fin','financeiro'),('00000000-0000-0000-0000-0000000000b2','alm','almox') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f9-fat',ob,'fat','{}'),('f9-rec',ob,'rec','{}'),('f9-lan',ob,'lan','{}'),('f9-bc',ob,'bc','{}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b2',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f9-x',ob,'fat','{}'); exception when others then falhou := true; end;
  assert falhou, 'almoxarife NÃO emite NF de serviço';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f9-y',ob,'lan','{}'); exception when others then falhou := true; end;
  assert falhou, 'almoxarife NÃO lança caixa';
end $$;
select 'OK: fase 9 passou' as resultado;
