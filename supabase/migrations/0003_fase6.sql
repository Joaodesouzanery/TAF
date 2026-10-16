-- Fase 6: plano de contas, contas a pagar, medição e resultado por item
create table conta (
  codigo text primary key, nome text not null, nivel int not null, natureza text
);

create or replace function conta_padrao(p_nat text, p_pacote text) returns text language sql immutable as $$
  select case p_nat
    when 'MO'  then '4.1.01'
    when 'EQP' then '4.3.01'
    when 'TER' then '4.4.01'
    when 'ADM' then case p_pacote when 'CANT' then '4.5.02' when 'PROJ' then '4.5.06' else '4.5.01' end
    else case p_pacote
      when 'FOFO' then '4.2.01' when 'PVC' then '4.2.01' when 'TCONC' then '4.2.01'
      when 'VALV' then '4.2.02' when 'PARAF' then '4.2.08'
      when 'ELET' then '4.2.05' when 'ELETS' then '4.2.05'
      when 'CONC' then '4.2.04' when 'ACO' then '4.2.04' when 'FORMA' then '4.2.04'
      when 'IMPER' then '4.2.06' when 'BOMBA' then '4.2.07' when 'GUIND' then '4.2.07'
      when 'CIVIL' then '4.2.03' else '4.2.08' end
  end
$$;

alter table solicitacao  add column natureza text check (natureza in ('MO','MAT','EQP','TER','ADM')), add column conta_codigo text references conta(codigo);
alter table ordem_compra add column natureza text check (natureza in ('MO','MAT','EQP','TER','ADM')), add column conta_codigo text references conta(codigo);
alter table rateio_nota  add column conta_codigo text references conta(codigo);

-- Conta a pagar: nasce da OC aprovada; a nota é alocada a ela
create table titulo_pagar (
  id uuid primary key default gen_random_uuid(),
  oc_id uuid not null references ordem_compra(id),
  valor numeric(16,2) not null,
  vencimento date not null default (current_date + 30),
  pago numeric(16,2) not null default 0,
  status text not null default 'previsto' check (status in ('previsto','parcial','pago','cancelado')),
  criado_em timestamptz not null default now(),
  unique (oc_id)
);
create or replace function cria_titulo() returns trigger language plpgsql as $$
begin
  if new.status = 'aprovada' and not exists (select 1 from titulo_pagar where oc_id = new.id) then
    insert into titulo_pagar(oc_id, valor) values (new.id, new.valor);
  elsif new.status in ('cancelada','reprovada') then
    update titulo_pagar set status = 'cancelado' where oc_id = new.id and pago = 0;
  end if;
  return new;
end $$;
create trigger t_titulo after insert or update of status on ordem_compra for each row execute function cria_titulo();

-- Medição por item (qtd medida x preço licitado)
create table medicao (
  id uuid primary key default gen_random_uuid(),
  obra_id uuid not null references obra(id),
  item_id uuid not null references item_eap(id),
  periodo date not null default current_date,
  qtd numeric(16,4) not null check (qtd > 0),
  status text not null default 'lancada' check (status in ('lancada','atestada')),
  lancado_por text, atestado_por text,
  criado_em timestamptz not null default now()
);
create or replace function valida_medicao() returns trigger language plpgsql as $$
declare orcada numeric; acum numeric;
begin
  select qtd into orcada from item_eap where id = new.item_id;
  select coalesce(sum(qtd),0) into acum from medicao where item_id = new.item_id and id is distinct from new.id;
  if acum + new.qtd > orcada + 0.0001 then
    raise exception 'Medido acima do orçado (% > %)', acum + new.qtd, orcada;
  end if;
  if new.status = 'atestada' and new.atestado_por is not null and new.atestado_por = new.lancado_por then
    raise exception 'Quem lança a medição não a atesta';
  end if;
  return new;
end $$;
create trigger t_valida_medicao before insert or update on medicao for each row execute function valida_medicao();

-- Resultado por item: lucro ou prejuízo (receita medida e atestada x custo realizado), VA e IDC
create or replace view v_resultado_item with (security_invoker = true) as
select i.id as item_id, i.obra_id, i.codigo, i.pacote_id,
       coalesce(m.q,0) as qtd_medida,
       round(coalesce(m.q,0) * i.preco_venda_total / nullif(i.qtd,0), 2) as receita_medida,
       s.realizado,
       round(least(1, coalesce(m.q,0) / nullif(i.qtd,0)) * i.meta_total, 2) as valor_agregado,
       round(least(1, coalesce(m.q,0) / nullif(i.qtd,0)) * i.meta_total / nullif(s.realizado,0), 3) as idc,
       round(coalesce(m.q,0) * i.preco_venda_total / nullif(i.qtd,0) - s.realizado, 2) as resultado
from item_eap i
join v_saldo_item s on s.item_id = i.id
left join (select item_id, sum(qtd) q from medicao where status = 'atestada' group by item_id) m on m.item_id = i.id
where i.eh_item;
