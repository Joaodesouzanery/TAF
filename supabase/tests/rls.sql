-- RLS por papel. Requer usuários criados (1=admin, 2=engenheiro, 3=pendente) e a obra importada.
-- Em Supabase: os ids devem existir em auth.users; aqui usamos set_config para simular o JWT.
insert into auth.users(id,email) values ('00000000-0000-0000-0000-000000000001','admin@x'),('00000000-0000-0000-0000-000000000002','eng@x'),('00000000-0000-0000-0000-000000000003','pend@x') on conflict do nothing;
insert into perfil(user_id,nome,papel) values ('00000000-0000-0000-0000-000000000001','admin','admin'),('00000000-0000-0000-0000-000000000002','eng','engenheiro'),('00000000-0000-0000-0000-000000000003','pend','pendente') on conflict (user_id) do update set papel=excluded.papel;
create or replace procedure _como(p_user text) language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', p_user, false); end $$;
do $$
declare ob uuid; n int; falhou boolean;
begin
  select id into ob from obra limit 1;
  -- admin escreve documentos de qualquer tipo
  set local role authenticated; perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
  insert into documento(id,obra_id,tipo,dados) values ('t-sol',ob,'sol','{}'),('t-nf',ob,'nf','{}');
  -- engenheiro: pode solicitação e medição, não nota?? (engenheiro lança nota: sim) mas NÃO conciliação
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
  insert into documento(id,obra_id,tipo,dados) values ('t-sol2',ob,'sol','{}');
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('t-conc',ob,'conc','{}'); exception when others then falhou := true; end;
  assert falhou, 'engenheiro NÃO escreve conciliação';
  -- engenheiro não congela linha de base
  update obra set estado = '{"frozen":true}'; get diagnostics n = row_count; assert n = 0, 'engenheiro NÃO edita obra';
  -- ninguém apaga
  delete from documento; get diagnostics n = row_count; assert n = 0, 'delete bloqueado por RLS';
  -- auditoria não é editável
  insert into documento(id,obra_id,tipo,dados) values ('t-aud',ob,'aud','{"x":1}');
  update documento set dados='{"x":2}' where id='t-aud'; get diagnostics n = row_count; assert n = 0, 'auditoria não edita';
  -- pendente não lê nada
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
  select count(*) into n from item_eap; assert n = 0, 'pendente não lê EAP';
  select count(*) into n from documento; assert n = 0, 'pendente não lê documentos';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('t-x',ob,'sol','{}'); exception when others then falhou := true; end;
  assert falhou, 'pendente não escreve';
  falhou := false; begin perform importar_obra('{}'::jsonb); exception when others then falhou := sqlerrm like 'Sem permissão%'; end;
  assert falhou, 'pendente não importa';
  -- anon: sem acesso
  reset role; set local role anon;
  select count(*) into n from item_eap; assert n = 0, 'anon não lê EAP';
  select count(*) into n from documento; assert n = 0, 'anon não lê documentos';
  falhou := false; begin insert into documento(id,obra_id,tipo,dados) values ('t-anon',ob,'sol','{}'); exception when others then falhou := true; end;
  assert falhou, 'anon não escreve';
end $$;
select 'OK: RLS por papel passou' as resultado;
