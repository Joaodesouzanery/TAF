-- Funções auxiliares de RLS: só usuários autenticados podem chamar (anon não)
revoke execute on function public.meu_papel() from public, anon;
revoke execute on function public.tem_papel(variadic text[]) from public, anon;
revoke execute on function public.pode_escrever(text) from public, anon;
grant execute on function public.meu_papel() to authenticated;
grant execute on function public.tem_papel(variadic text[]) to authenticated;
grant execute on function public.pode_escrever(text) to authenticated;
-- rls_auto_enable() existe só no Supabase (event trigger); a linha abaixo é ignorada se não existir
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
