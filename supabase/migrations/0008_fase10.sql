-- Fase 10: fechamento mensal ao contador (fech). O XML bruto da NF-e não é guardado; ficam os campos lidos na própria nota (documento nf).
alter table documento drop constraint if exists documento_tipo_check;
alter table documento add constraint documento_tipo_check check (tipo in ('sol','oc','nf','tit','med','conc','aud','apt','rst','atv','tar','bc','fat','rec','lan','fech'));
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
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;
revoke execute on function public.pode_escrever(text) from public, anon;
