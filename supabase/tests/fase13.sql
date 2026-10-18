-- Fase 13: novos tipos de documento (lfx, mov, cobr). Requer 0001-0010.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000e1','f@x'),('00000000-0000-0000-0000-0000000000e2','e@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000e1','fin','financeiro'),('00000000-0000-0000-0000-0000000000e2','eng','engenheiro') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000e1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f13-lfx',ob,'lfx','{"valor":10}'),('f13-mov',ob,'mov','{}'),('f13-cobr',ob,'cobr','{}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000e2',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f13-x',ob,'lfx','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO grava lançamento financeiro';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f13-y',ob,'mov','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO grava movimentação bancária';
end $$;
select 'fase13 ok';
