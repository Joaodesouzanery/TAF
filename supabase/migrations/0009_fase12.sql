-- Fase 12: cadastros base compartilhados (forn, ins, banc) e numeração de documentos no servidor.
alter table documento drop constraint if exists documento_tipo_check;
alter table documento add constraint documento_tipo_check check (tipo in ('sol','oc','nf','tit','med','conc','aud','apt','rst','atv','tar','bc','fat','rec','lan','fech','forn','ins','banc'));

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
    when 'bc'   then public.tem_papel('gerente','engenheiro','diretoria','financeiro','adm')
    when 'fat'  then public.tem_papel('financeiro','adm','gerente','diretoria')
    when 'rec'  then public.tem_papel('financeiro','adm','diretoria')
    when 'lan'  then public.tem_papel('financeiro','diretoria')
    when 'fech' then public.tem_papel('financeiro','adm','diretoria')
    when 'forn' then public.tem_papel('compras','adm','financeiro','gerente','diretoria','gestao','almox')
    when 'ins'  then public.tem_papel('compras','adm','financeiro','gerente','diretoria','gestao','almox')
    when 'banc' then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;
revoke execute on function public.pode_escrever(text) from public, anon;

-- Contador de números por obra e tipo de documento (SC-0001, OC-0001...). Só a função mexe nele.
create table if not exists contador (
  obra_id uuid not null references obra(id),
  tipo text not null check (tipo in ('sol','oc','nf','bm','apt','rst','tar','bc','fat')),
  ultimo int not null default 0,
  primary key (obra_id, tipo)
);
alter table contador enable row level security;

-- Reserva uma faixa de números e devolve o primeiro. Atômico: duas pessoas nunca recebem o mesmo número.
create or replace function public.reservar_numeros(p_obra uuid, p_tipo text, p_qtd int default 20) returns int
language plpgsql security definer set search_path = public as $$
declare v int; t text;
begin
  if not (public.meu_papel() is not null and public.meu_papel() <> 'pendente') then raise exception 'Sem permissão'; end if;
  if p_qtd < 1 or p_qtd > 100 then raise exception 'Quantidade inválida'; end if;
  t := case p_tipo when 'bm' then 'med' else p_tipo end;
  if p_tipo not in ('sol','oc','nf','bm','apt','rst','tar','bc','fat') then raise exception 'Tipo inválido'; end if;
  if not exists (select 1 from contador where obra_id = p_obra and tipo = p_tipo) then
    select coalesce(max((regexp_replace(dados->>'num','\D','','g'))::int), 0) into v
      from documento where obra_id = p_obra and tipo = t and (dados->>'num') ~ '\d';
    insert into contador(obra_id, tipo, ultimo) values (p_obra, p_tipo, v) on conflict do nothing;
  end if;
  update contador set ultimo = ultimo + p_qtd where obra_id = p_obra and tipo = p_tipo returning ultimo - p_qtd + 1 into v;
  return v;
end $$;
revoke execute on function public.reservar_numeros(uuid, text, int) from public, anon;
grant execute on function public.reservar_numeros(uuid, text, int) to authenticated;
