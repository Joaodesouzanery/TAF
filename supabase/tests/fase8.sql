-- Fase 8: papéis de campo/planejamento e documentos apt/rst/atv/tar.  Requer migrações 0001-0006 e a obra 342 importada.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000a1','enc@x'),('00000000-0000-0000-0000-0000000000a2','pla@x'),('00000000-0000-0000-0000-0000000000a3','alm@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000a1','enc','encarregado'),('00000000-0000-0000-0000-0000000000a2','pla','planejamento'),('00000000-0000-0000-0000-0000000000a3','alm','almox') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; falhou boolean;
begin
  select id into ob from obra limit 1;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f8-apt',ob,'apt','{}'),('f8-rst',ob,'rst','{}'),('f8-tar',ob,'tar','{}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f8-oc',ob,'oc','{}'); exception when others then falhou := true; end;
  assert falhou, 'encarregado NÃO escreve OC';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a2',true);
  insert into documento(id,obra_id,tipo,dados) values ('f8-atv',ob,'atv','{}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f8-apt2',ob,'apt','{}'); exception when others then falhou := true; end;
  assert falhou, 'planejamento NÃO lança apontamento';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000a3',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f8-apt3',ob,'apt','{}'); exception when others then falhou := true; end;
  assert falhou, 'almoxarife NÃO lança apontamento';
  assert (select count(*) from funcao_mo) > 20, 'banco de MO legível por autenticado com papel';
  reset role; set local role anon;
  assert (select count(*) from funcao_mo) = 0, 'anon não lê banco de MO';
end $$;
select 'OK: fase 8 passou' as resultado;
