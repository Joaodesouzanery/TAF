-- Fase 7: login por papel, RLS e persistência dos documentos do fluxo.
-- Primeiro usuário que se cadastra vira 'admin'; os demais entram como 'pendente' até o admin atribuir o papel.

alter table obra add column if not exists estado jsonb not null default '{}'::jsonb;   -- linha de base, remanejamentos, parâmetros
alter table item_eap add column if not exists meta_unit numeric(16,4), add column if not exists tipo text,
  add column if not exists composicao jsonb, add column if not exists natureza jsonb;

create table perfil (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel text not null default 'pendente'
    check (papel in ('admin','gestao','diretoria','gerente','engenheiro','compras','almox','adm','financeiro','pendente')),
  criado_em timestamptz not null default now()
);

create or replace function public.meu_papel() returns text language sql stable security definer set search_path = public as $$
  select papel from perfil where user_id = (select auth.uid())
$$;
create or replace function public.tem_papel(variadic p text[]) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() = any(p), false)
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into perfil(user_id, nome, papel)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)),
          case when exists (select 1 from perfil) then 'pendente' else 'admin' end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Documentos do fluxo (solicitação, OC, nota, título, medição, auditoria...) guardados como JSON com chaves relacionais
create table documento (
  id text primary key,
  obra_id uuid not null references obra(id),
  tipo text not null check (tipo in ('sol','oc','nf','tit','med','conc','aud')),
  dados jsonb not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid default auth.uid()
);
create index on documento(obra_id, tipo);

create or replace function public.pode_escrever(p_tipo text) returns boolean language sql stable security definer set search_path = public as $$
  select public.tem_papel('admin') or case p_tipo
    when 'sol'  then public.tem_papel('engenheiro','gerente','compras','diretoria')
    when 'oc'   then public.tem_papel('compras','gerente','diretoria','almox','engenheiro')
    when 'nf'   then public.tem_papel('adm','engenheiro','financeiro')
    when 'tit'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    when 'med'  then public.tem_papel('engenheiro','gerente','diretoria')
    when 'conc' then public.tem_papel('financeiro')
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;

-- RLS em todas as tabelas
alter table perfil enable row level security;
alter table documento enable row level security;
alter table obra enable row level security;
alter table pacote enable row level security;
alter table item_eap enable row level security;
alter table conta enable row level security;
alter table fornecedor enable row level security;
alter table solicitacao enable row level security;
alter table ordem_compra enable row level security;
alter table nota_fiscal enable row level security;
alter table rateio_nota enable row level security;
alter table titulo_pagar enable row level security;
alter table medicao enable row level security;
alter table evento_auditoria enable row level security;
-- (as tabelas relacionais solicitacao/ordem_compra/nota/titulo/medicao/fornecedor/auditoria ficam sem política: negadas)

create policy perfil_ler on perfil for select to authenticated using (user_id = (select auth.uid()) or public.tem_papel('admin'));
create policy perfil_admin on perfil for update to authenticated using (public.tem_papel('admin')) with check (public.tem_papel('admin'));

create policy obra_ler on obra for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');
create policy obra_editar on obra for update to authenticated using (public.tem_papel('admin','gestao','diretoria','gerente')) with check (public.tem_papel('admin','gestao','diretoria','gerente'));
create policy pacote_ler on pacote for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');
create policy item_ler on item_eap for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');
create policy conta_ler on conta for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');

create policy doc_ler on documento for select to authenticated using (public.meu_papel() is not null and public.meu_papel() <> 'pendente');
create policy doc_inserir on documento for insert to authenticated with check (public.pode_escrever(tipo));
create policy doc_atualizar on documento for update to authenticated using (public.pode_escrever(tipo) and tipo <> 'aud') with check (public.pode_escrever(tipo) and tipo <> 'aud');
-- sem política de delete: nada é apagado; auditoria só recebe inserções

-- Importa a obra (EAP, pacotes, plano de contas) a partir do JSON gerado pelo importador. Só admin/gestão/diretoria.
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
  for r in select * from jsonb_array_elements(p->'pacotes') loop
    insert into pacote(obra_id,codigo,nome,tipo,responsavel,precisa_em_obra,fechar_ate,meta,teto,condicao_pagamento,observacoes)
    values (v_obra, r->>'codigo', r->>'nome', r->>'tipo', r->>'responsavel', nullif(r->>'precisa_em_obra','')::date, nullif(r->>'fechar_ate','')::date,
            coalesce((r->>'meta')::numeric,0), coalesce((r->>'teto')::numeric,0), r->>'condicao_pagamento', r->>'observacoes')
    on conflict (obra_id,codigo) do nothing;
  end loop;
  for r in select * from jsonb_array_elements(p->'eap') loop
    select id into v_pac from pacote where obra_id = v_obra and codigo = r->>'pacote';
    insert into item_eap(obra_id,codigo,descricao,unidade,qtd,nivel,pai_codigo,eh_item,preco_venda_total,meta_total,teto_total,fonte_meta,status_cotacao,evento,pacote_id,meta_unit,tipo,composicao,natureza)
    values (v_obra, r->>'codigo', r->>'descricao', r->>'unidade', (r->>'qtd')::numeric, (r->>'nivel')::int, r->>'pai', r->>'tipo_linha' = 'item',
            coalesce((r->>'preco_venda_total')::numeric,0), (r->>'meta_total')::numeric, (r->>'teto_total')::numeric, r->>'fonte_meta', r->>'status_cotacao',
            r->>'evento', v_pac, (r->>'meta_unit')::numeric, r->>'tipo', r->'composicao', r->'natureza')
    on conflict (obra_id,codigo) do nothing;
  end loop;
  return v_obra;
end $$;
revoke execute on function public.importar_obra(jsonb) from public, anon;
grant execute on function public.importar_obra(jsonb) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Funções com search_path fixo (boa prática de segurança)
alter function public.audita_valores() set search_path = public;
alter function public.bloqueia_delete() set search_path = public;
alter function public.calc_semaforo(uuid, numeric, numeric) set search_path = public;
alter function public.exige_linha_base() set search_path = public;
alter function public.valida_nota() set search_path = public;
alter function public.conta_padrao(text, text) set search_path = public;
alter function public.cria_titulo() set search_path = public;
alter function public.valida_medicao() set search_path = public;
