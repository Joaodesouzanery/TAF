-- Fase 10: RLS do fechamento mensal (fech). Requer migrações 0001-0008 e a obra 342.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000c1','adm@x'),('00000000-0000-0000-0000-0000000000c2','enc@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000c1','adm','adm'),('00000000-0000-0000-0000-0000000000c2','enc','encarregado') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f10-fech',ob,'fech','{}'),('f10-nf',ob,'nf','{}');
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000c2',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f10-x',ob,'fech','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO fecha competência';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f10-y',ob,'nf','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO lança nota';
end $$;
select 'OK: fase 10 passou' as resultado;
