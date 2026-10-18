-- Fase 14: ctb e competência fechada. Requer 0001-0011.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000f1','f@x'),('00000000-0000-0000-0000-0000000000f2','d@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000f1','fin','financeiro'),('00000000-0000-0000-0000-0000000000f2','dir','diretoria') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000f1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f14-a',ob,'ctb','{"comp":"2026-11","data":"2026-11-05"}');
  insert into documento(id,obra_id,tipo,dados) values ('f14-fech',ob,'fech','{"comp":"2026-11"}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f14-b',ob,'ctb','{"comp":"2026-11","data":"2026-11-20"}'); exception when others then falhou := true; end;
  assert falhou, 'lançamento contábil em competência fechada é recusado';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f14-n',ob,'nf','{"emissao":"2026-11-02"}'); exception when others then falhou := true; end;
  assert falhou, 'nota com emissão em competência fechada é recusada';
  insert into documento(id,obra_id,tipo,dados) values ('f14-c',ob,'ctb','{"comp":"2026-12","data":"2026-12-01"}');
  falhou := false; begin update documento set dados = dados || '{"reaberta":true}' where id = 'f14-fech'; exception when others then falhou := true; end;
  assert falhou, 'financeiro NÃO reabre competência';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000f2',true);
  update documento set dados = dados || '{"reaberta":true}' where id = 'f14-fech';
  insert into documento(id,obra_id,tipo,dados) values ('f14-d',ob,'ctb','{"comp":"2026-11","data":"2026-11-21"}');
end $$;
select 'fase14 ok';
