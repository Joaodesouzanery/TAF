import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { buscaNotas } from '../_shared/nfe.ts';
import { PAPEIS_INTEGRACAO, papelDoUsuario } from '../_shared/auth.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const resp = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  const papel = await papelDoUsuario(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, req.headers.get('Authorization'), createClient);
  if (!papel || !PAPEIS_INTEGRACAO.includes(papel)) return resp({ erro: 'Sem permissão (entre com um usuário Administrativo, Financeiro ou Administrador).' }, 403);
  const body = await req.json().catch(() => ({}));
  try { return resp(await buscaNotas(Deno.env.toObject(), fetch, { versao: body.versao, max: body.max })); }
  catch (e) { return resp({ configurado: true, notas: [], erro: String((e as Error).message) }, 502); }
});
