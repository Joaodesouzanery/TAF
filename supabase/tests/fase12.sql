-- Fase 12: numeração no servidor e cadastros base. Requer migrações 0001-0009 e a obra 342.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000d1','a@x'),('00000000-0000-0000-0000-0000000000d2','b@x'),('00000000-0000-0000-0000-0000000000d3','p@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-0000000000d1','a','compras'),('00000000-0000-0000-0000-0000000000d2','b','engenheiro'),('00000000-0000-0000-0000-0000000000d3','p','pendente') on conflict (user_id) do update set papel=excluded.papel;
do $$
declare ob uuid; a int; b int; c int; falhou boolean;
begin
  select id into ob from obra limit 1;
  insert into documento(id,obra_id,tipo,dados) values ('f12-sc7',ob,'sol','{"num":"SC-0007"}');
  set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d1',true);
  a := reservar_numeros(ob,'sol',5);
  assert a = 8, 'primeira reserva começa depois do maior número existente (SC-0007): ' || a;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d2',true);
  b := reservar_numeros(ob,'sol',5);
  assert b = 13, 'segunda pessoa recebe faixa seguinte, sem repetir: ' || b;
  c := reservar_numeros(ob,'oc',3);
  assert c = 1, 'outro tipo começa em 1';
  falhou := false; begin perform reservar_numeros(ob,'xyz',1); exception when others then falhou := true; end;
  assert falhou, 'tipo inválido é recusado';
  falhou := false; begin perform reservar_numeros(ob,'sol',500); exception when others then falhou := true; end;
  assert falhou, 'faixa grande demais é recusada';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d3',true);
  falhou := false; begin perform reservar_numeros(ob,'sol',1); exception when others then falhou := true; end;
  assert falhou, 'pendente não reserva número';
  -- cadastros: compras escreve fornecedor; engenheiro não
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d1',true);
  insert into documento(id,obra_id,tipo,dados) values ('f12-forn',ob,'forn','{}'),('f12-ins',ob,'ins','{}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f12-banc',ob,'banc','{}'); exception when others then falhou := true; end;
  assert falhou, 'compras NÃO cadastra conta bancária';
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d2',true);
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('f12-forn2',ob,'forn','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO cadastra fornecedor';
  -- contador não é acessível direto
  reset role; set local role authenticated;
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-0000000000d1',true);
  assert (select count(*) from contador) = 0, 'contador fechado por RLS';
end $$;
select 'OK: fase 12 passou' as resultado;
