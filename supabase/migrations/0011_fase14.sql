-- Fase 14: lançamentos contábeis manuais/ajustes (ctb), fechamento de competência no servidor.
alter table documento drop constraint if exists documento_tipo_check;
alter table documento add constraint documento_tipo_check check (tipo in ('sol','oc','nf','tit','med','conc','aud','apt','rst','atv','tar','bc','fat','rec','lan','fech','forn','ins','banc','lfx','mov','cobr','ctb'));

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
    when 'lfx'  then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'mov'  then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'ctb'  then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'cobr' then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;
revoke execute on function public.pode_escrever(text) from public, anon;

-- Competência fechada (documento tipo fech com dados.comp): nada contábil nem operacional de data naquele mês entra, muda ou sai.
create or replace function public.trg_competencia_fechada() returns trigger language plpgsql security definer set search_path = public as $$
declare r record; c text; d text;
begin
  r := case when tg_op = 'DELETE' then old else new end;
  if r.tipo = 'fech' then
    if tg_op = 'DELETE' then raise exception 'Fechamento não pode ser apagado: reabra'; end if;
    if tg_op = 'UPDATE' and coalesce(new.dados->>'reaberta','false') = 'true' and coalesce(old.dados->>'reaberta','false') <> 'true'
       and not public.tem_papel('admin','diretoria') then raise exception 'Só a Diretoria reabre competência'; end if;
    return r;
  end if;
  if r.tipo not in ('ctb','nf','fat','rec','lan') then return r; end if;
  if r.tipo = 'nf' and tg_op <> 'INSERT' then return r; end if; -- pagar/conferir nota antiga é permitido; o cliente bloqueia o pagamento em competência fechada
  d := coalesce(r.dados->>'data', r.dados->>'emissao', r.dados->>'pago');
  c := left(d, 7);
  if c is not null and exists (select 1 from documento f where f.obra_id = r.obra_id and f.tipo = 'fech' and f.dados->>'comp' = c and coalesce(f.dados->>'reaberta','false') <> 'true') then
    raise exception 'Competência % fechada', c;
  end if;
  return r;
end $$;
drop trigger if exists documento_competencia_fechada on documento;
create trigger documento_competencia_fechada before insert or update or delete on documento for each row execute function public.trg_competencia_fechada();
