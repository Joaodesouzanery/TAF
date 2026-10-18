import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { autentica, configurado, envia, lista, montaFinanceiro, type Lancamento } from '../_shared/sankhya.ts';
import { PAPEIS_INTEGRACAO, papelDoUsuario } from '../_shared/auth.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const resp = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Corpo: { acao: 'status' | 'conexao' | 'referencias' | 'simular' | 'enviar', lancamentos?: Lancamento[] }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  const papel = await papelDoUsuario(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, req.headers.get('Authorization'), createClient);
  if (!papel || !PAPEIS_INTEGRACAO.includes(papel)) return resp({ erro: 'Sem permissão para usar a integração com o Sankhya.' }, 403);
  const env = Deno.env.toObject(), { acao, lancamentos } = await req.json().catch(() => ({}));
  if (acao === 'status') return resp({ configurado: configurado(env), escrita: env.SANKHYA_ALLOW_WRITE === 'true' });
  if (!configurado(env)) return resp({ configurado: false });
  const ls: Lancamento[] = Array.isArray(lancamentos) ? lancamentos : [];
  try {
    if (acao === 'simular') return resp({ configurado: true, payloads: ls.map((l) => montaFinanceiro(l, env)) });
    const tk = await autentica(env, fetch);
    if (acao === 'conexao') return resp({ configurado: true, ok: true });
    if (acao === 'referencias') return resp({ configurado: true, naturezas: await lista(env, fetch, tk, 'Natureza', ['CODNAT', 'DESCRNAT']), centros: await lista(env, fetch, tk, 'CentroResultado', ['CODCENCUS', 'DESCRCENCUS']) });
    if (acao === 'enviar') return resp({ configurado: true, resultados: await envia(env, fetch, tk, ls) });
    return resp({ erro: 'Ação desconhecida' }, 400);
  } catch (e) { return resp({ configurado: true, erro: String((e as Error).message) }, 502); }
});
