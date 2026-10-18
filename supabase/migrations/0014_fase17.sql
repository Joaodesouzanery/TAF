-- Fase 17: colaboradores (col), ponto (pto) e registros de SST (sst).
alter table documento drop constraint if exists documento_tipo_check;
alter table documento add constraint documento_tipo_check check (tipo in ('sol','oc','nf','tit','med','conc','aud','apt','rst','atv','tar','bc','fat','rec','lan','fech','forn','ins','banc','lfx','mov','cobr','ctb','est','inv','ctr','prj','pat','frt','fmv','col','pto','sst'));

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
    when 'est'  then public.tem_papel('almox','adm','engenheiro','compras','financeiro','diretoria','gestao')
    when 'inv'  then public.tem_papel('almox','adm','diretoria','gestao')
    when 'ctr'  then public.tem_papel('gerente','diretoria','adm','financeiro','engenheiro','gestao')
    when 'prj'  then public.tem_papel('engenheiro','gerente','planejamento','diretoria','gestao')
    when 'pat'  then public.tem_papel('adm','financeiro','diretoria','gestao')
    when 'frt'  then public.tem_papel('almox','adm','engenheiro','encarregado','gerente','diretoria','gestao')
    when 'fmv'  then public.tem_papel('almox','adm','engenheiro','encarregado','gerente','diretoria','gestao')
    when 'col'  then public.tem_papel('adm','gerente','engenheiro','diretoria','gestao')
    when 'pto'  then public.tem_papel('encarregado','engenheiro','gerente','adm','diretoria','gestao')
    when 'sst'  then public.tem_papel('adm','engenheiro','gerente','diretoria','gestao')
    when 'cobr' then public.tem_papel('financeiro','adm','diretoria','gestao')
    when 'aud'  then public.meu_papel() is not null and public.meu_papel() <> 'pendente'
    else false end
$$;
revoke execute on function public.pode_escrever(text) from public, anon;
