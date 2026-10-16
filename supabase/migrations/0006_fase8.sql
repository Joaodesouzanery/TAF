-- Fase 8: apontamento diário e Lean (apt, rst, atv, tar), papéis de campo e planejamento, banco de MO e HH por unidade.
alter table documento drop constraint if exists documento_tipo_check;
alter table documento add constraint documento_tipo_check check (tipo in ('sol','oc','nf','tit','med','conc','aud','apt','rst','atv','tar'));
alter table perfil drop constraint if exists perfil_papel_check;
alter table perfil add constraint perfil_papel_check check (papel in ('admin','gestao','diretoria','gerente','engenheiro','compras','almox','adm','financeiro','encarregado','planejamento','pendente'));

alter table item_eap add column if not exists hh_unit numeric(12,4);   -- HH de referência por unidade (CPU Saneago, aba 24)

create table if not exists funcao_mo (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  funcao text not null, equipe text, custo_mensal numeric(12,2) not null, custo_hora numeric(10,2) not null,
  unique (obra_id, funcao)
);
alter table funcao_mo enable row level security;
create policy funcao_ler on funcao_mo for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');

create or replace function public.pode_escrever(p_tipo text) returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_papel('admin') or case p_tipo
    when 'sol'  then public.tem_papel('engenheiro','gerente','compras','diretoria')
    when 'oc'   then public.tem_papel('compras','gerente','diretoria','almox','engenheiro')
    when 'nf'   then public.tem_papel('adm','engenheiro','financeiro')
    when 'tit'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    when 'med'  then public.tem_papel('engenheiro','gerente','diretoria')
    when 'conc' then public.tem_papel('financeiro')
    when 'apt'  then public.tem_papel('encarregado','engenheiro','gerente')
    when 'rst'  then public.tem_papel('engenheiro','gerente','planejamento','encarregado','compras','diretoria')
    when 'atv'  then public.tem_papel('engenheiro','gerente','planejamento','encarregado')
    when 'tar'  then public.tem_papel('engenheiro','gerente','planejamento','encarregado','compras','adm','almox','financeiro','diretoria')
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;

-- importar_obra passa a gravar o banco de MO e o HH por unidade
create or replace function public.importar_obra(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare v_obra uuid; r jsonb; v_pac uuid;
begin
  if not public.tem_papel('admin','gestao','diretoria') then raise exception 'Sem permissão para importar'; end if;
  insert into obra(codigo,nome,contratante,contrato,municipio,valor_contrato,regime,tributos_nota)
  values (p#>>'{obra,codigo}', p#>>'{obra,nome}', p#>>'{obra,contratante}', p#>>'{obra,contrato}', p#>>'{obra,municipio}',
          (p#>>'{obra,valor_contrato}')::numeric, p#>>'{obra,regime}', coalesce((p#>>'{obra,tributos_nota}')::numeric, 0.085))
  on conflict (codigo) do update set nome = excluded.nome returning id into v_obra;
  for r in select * from jsonb_array_elements(coalesce(p->'plano','[]'::jsonb)) loop
    insert into conta(codigo,nome,nivel,natureza) values (r->>'codigo', r->>'nome', (r->>'nivel')::int, r->>'natureza') on conflict do nothing;
  end loop;
  for r in select * from jsonb_array_elements(coalesce(p->'banco_mo','[]'::jsonb)) loop
    insert into funcao_mo(obra_id,funcao,equipe,custo_mensal,custo_hora) values (v_obra, r->>'funcao', r->>'equipe', (r->>'custo_mensal')::numeric, (r->>'custo_hora')::numeric)
    on conflict (obra_id,funcao) do nothing;
  end loop;
  for r in select * from jsonb_array_elements(p->'pacotes') loop
    insert into pacote(obra_id,codigo,nome,tipo,responsavel,precisa_em_obra,fechar_ate,meta,teto,condicao_pagamento,observacoes)
    values (v_obra, r->>'codigo', r->>'nome', r->>'tipo', r->>'responsavel', nullif(r->>'precisa_em_obra','')::date, nullif(r->>'fechar_ate','')::date,
            coalesce((r->>'meta')::numeric,0), coalesce((r->>'teto')::numeric,0), r->>'condicao_pagamento', r->>'observacoes')
    on conflict (obra_id,codigo) do nothing;
  end loop;
  for r in select * from jsonb_array_elements(p->'eap') loop
    select id into v_pac from pacote where obra_id = v_obra and codigo = r->>'pacote';
    insert into item_eap(obra_id,codigo,descricao,unidade,qtd,nivel,pai_codigo,eh_item,preco_venda_total,meta_total,teto_total,fonte_meta,status_cotacao,evento,pacote_id,meta_unit,tipo,composicao,natureza,hh_unit)
    values (v_obra, r->>'codigo', r->>'descricao', r->>'unidade', (r->>'qtd')::numeric, (r->>'nivel')::int, r->>'pai', r->>'tipo_linha' = 'item',
            coalesce((r->>'preco_venda_total')::numeric,0), (r->>'meta_total')::numeric, (r->>'teto_total')::numeric, r->>'fonte_meta', r->>'status_cotacao',
            r->>'evento', v_pac, (r->>'meta_unit')::numeric, r->>'tipo', r->'composicao', r->'natureza', (r->>'hh_unit')::numeric)
    on conflict (obra_id,codigo) do nothing;
  end loop;
  return v_obra;
end $$;
revoke execute on function public.importar_obra(jsonb) from public, anon;
grant execute on function public.importar_obra(jsonb) to authenticated;
