// Verifica o JWT do usuário e se o papel dele pode usar as integrações.
export const PAPEIS_INTEGRACAO = ['admin', 'adm', 'financeiro', 'gestao', 'diretoria'];
export async function papelDoUsuario(url: string, anon: string, authorization: string | null, createClient: any): Promise<string | null> {
  if (!authorization) return null;
  const c = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: u } = await c.auth.getUser();
  if (!u?.user) return null;
  const { data } = await c.from('perfil').select('papel').eq('user_id', u.user.id).single();
  return data?.papel ?? null;
}
