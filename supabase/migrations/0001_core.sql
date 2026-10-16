-- TAF Gestão de Obras · núcleo (Fase 1: obra, EAP, pacote, auditoria, saldos)
-- Regra: nenhum real entra sem obra + item. Nada é apagado (status + motivo).

create extension if not exists pgcrypto;

create table obra (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  contratante text,
  contrato text,
  municipio text,
  valor_contrato numeric(16,2),
  regime text,
  tributos_nota numeric(6,4) not null default 0.085,   -- teto = preço x (1 - tributos)
  linha_base_versao int not null default 1,
  linha_base_congelada boolean not null default false,
  criado_em timestamptz not null default now()
);

create table pacote (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  codigo text not null,
  nome text not null,
  tipo text,
  responsavel text,
  precisa_em_obra date,
  fechar_ate date,
  meta numeric(16,2) not null default 0,
  teto numeric(16,2) not null default 0,
  condicao_pagamento text,
  observacoes text,
  unique (obra_id, codigo)
);

create table item_eap (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  codigo text not null,                 -- código do cliente, ex.: A.3.1.3.1
  descricao text not null,
  unidade text,
  qtd numeric(16,4),
  nivel int not null check (nivel between 1 and 5),
  pai_codigo text,
  eh_item boolean not null default false,  -- nível 5 recebe custo; grupos só somam
  preco_venda_total numeric(16,2) not null default 0,
  meta_total numeric(16,2),
  teto_total numeric(16,2),
  fonte_meta text,
  status_cotacao text,                  -- Orçado | A cotar
  evento text,
  pacote_id uuid references pacote(id),
  linha_base_versao int not null default 1,
  unique (obra_id, codigo)
);
create index on item_eap(obra_id, pacote_id);

create table fornecedor (
  id uuid primary key default gen_random_uuid(),
  cnpj text unique, razao text not null, bloqueado boolean not null default false
);

-- Compras (Fase 3) ---------------------------------------------------------
create type semaforo as enum ('verde','amarelo','vermelho','bloqueado');

create table solicitacao (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  item_id uuid not null references item_eap(id),   -- sem item não grava
  descricao text not null,
  qtd numeric(16,4) not null check (qtd > 0),
  preco_unit numeric(16,4) not null check (preco_unit >= 0),
  data_necessaria date,
  solicitante text,
  status text not null default 'rascunho',
  semaforo semaforo,
  criado_em timestamptz not null default now()
);

create table ordem_compra (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  item_id uuid not null references item_eap(id),
  fornecedor_id uuid references fornecedor(id),
  qtd numeric(16,4) not null check (qtd > 0),
  preco_unit numeric(16,4) not null check (preco_unit >= 0),
  valor numeric(16,2) generated always as (round(qtd*preco_unit,2)) stored,
  semaforo semaforo,
  status text not null default 'rascunho'
    check (status in ('rascunho','em_alcada','aprovada','recebida_parcial','recebida','cancelada','reprovada')),
  motivo_cancelamento text,
  criado_em timestamptz not null default now()
);

-- Notas e rateio (Fase 4) ----------------------------------------------------
create table nota_fiscal (
  id uuid primary key default gen_random_uuid(),
  chave text unique, tipo text default 'NF-e', emitente text,
  emissao date, valor numeric(16,2) not null,
  oc_id uuid references ordem_compra(id),
  status text not null default 'lancada'
    check (status in ('lancada','rateada','conferida','liberada','paga','divergente'))
);

create table rateio_nota (
  id uuid primary key default gen_random_uuid(),
  nota_id uuid not null references nota_fiscal(id),
  obra_id uuid not null references obra(id),
  item_id uuid not null references item_eap(id),
  natureza text not null check (natureza in ('MO','MAT','EQP','TER','ADM')),
  valor numeric(16,2) not null
);

-- Auditoria que não se apaga ---------------------------------------------------
create table evento_auditoria (
  id bigserial primary key,
  quando timestamptz not null default now(),
  quem text default current_user,
  entidade text not null, registro_id uuid, campo text,
  antes text, depois text, motivo text
);

create or replace function audita_valores() returns trigger language plpgsql as $$
declare k text; o jsonb := to_jsonb(old); n jsonb := to_jsonb(new);
begin
  foreach k in array array['meta_total','teto_total','preco_venda_total','meta','teto'] loop
    if o ? k and o->>k is distinct from n->>k then
      insert into evento_auditoria(entidade,registro_id,campo,antes,depois)
      values (tg_table_name,(n->>'id')::uuid,k,o->>k,n->>k);
    end if;
  end loop;
  return new;
end $$;
create trigger t_aud_item before update on item_eap for each row execute function audita_valores();
create trigger t_aud_pacote before update on pacote for each row execute function audita_valores();

-- Nada é apagado -----------------------------------------------------------------
create or replace function bloqueia_delete() returns trigger language plpgsql as $$
begin raise exception 'Nada é apagado: cancele com motivo (tabela %)', tg_table_name; end $$;
create trigger t_nd_oc before delete on ordem_compra for each row execute function bloqueia_delete();
create trigger t_nd_nf before delete on nota_fiscal for each row execute function bloqueia_delete();
create trigger t_nd_rat before delete on rateio_nota for each row execute function bloqueia_delete();

-- Semáforo: preço x meta/teto do item (doc, seção 6) ---------------------------------
create or replace function calc_semaforo(p_item uuid, p_qtd numeric, p_preco numeric)
returns semaforo language plpgsql stable as $$
declare i item_eap; total numeric := p_qtd * p_preco;
begin
  select * into i from item_eap where id = p_item;
  if not found or not i.eh_item or i.meta_total is null then return 'bloqueado'; end if;
  -- o teto (margem zero) vale sempre: acima dele o item dá prejuízo, mesmo que a meta seja maior (caso ADM da 342)
  if i.teto_total is not null and total > i.teto_total then return 'vermelho'; end if;
  if total <= i.meta_total then return 'verde'; end if;
  return 'amarelo';
end $$;

-- Saldos por item: meta, comprometido, realizado, saldo livre ------------------------
create or replace view v_saldo_item with (security_invoker = true) as
select i.id as item_id, i.obra_id, i.codigo, i.descricao, i.pacote_id, i.status_cotacao,
       i.meta_total, i.teto_total,
       coalesce(c.v,0) as comprometido,
       coalesce(r.v,0) as realizado,
       coalesce(i.meta_total,0) - coalesce(c.v,0) - coalesce(r.v,0) as saldo_livre
from item_eap i
left join (select item_id, sum(valor) v from ordem_compra
           where status in ('aprovada','recebida_parcial','recebida') group by item_id) c on c.item_id = i.id
left join (select item_id, sum(valor) v from rateio_nota group by item_id) r on r.item_id = i.id
where i.eh_item;

create or replace view v_saldo_pacote with (security_invoker = true) as
select p.id as pacote_id, p.obra_id, p.codigo, p.nome, p.fechar_ate, p.meta, p.teto,
       count(s.item_id) as itens,
       count(*) filter (where s.status_cotacao = 'A cotar') as sem_cotacao,
       coalesce(sum(s.comprometido),0) as comprometido,
       coalesce(sum(s.realizado),0) as realizado
from pacote p left join v_saldo_item s on s.pacote_id = p.id
group by p.id;

alter table obra enable row level security;  -- políticas por perfil entram na Fase 3 (M17)
