-- Fase 16: ctr, prj, pat, frt, fmv. Requer 0001-0013.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000b1','en@x'),('00000000-0000-0000-0000-0000000000b2','ad@x'),('00000000-0000-0000-0000-0000000000b3','en2@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000b1','eng','engenheiro'),('00000000-0000-0000-0000-0000000000b2','adm','adm'),('00000000-0000-0000-0000-0000000000b3','enc','encarregado') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f16-c',ob,'ctr','{}'),('f16-p',ob,'prj','{}'),('f16-v',ob,'frt','{}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f16-b',ob,'pat','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO cadastra patrimônio';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b2',true);
  insert into documento(id,obra_id,tipo,dados) values ('f16-b2',ob,'pat','{}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000b3',true);
  insert into documento(id,obra_id,tipo,dados) values ('f16-m',ob,'fmv','{"tipo":"abast"}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f16-c2',ob,'ctr','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO grava contrato';
end $$;
select 'fase16 ok';
