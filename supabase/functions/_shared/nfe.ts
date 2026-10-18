// Busca de NF-e recebidas em um provedor externo (padrão: Focus NFe). Lógica pura: recebe env e fetch para poder ser testada sem Deno.
// ATENÇÃO: rotas e parâmetros abaixo seguem a documentação pública da Focus NFe (consulta de NF-e recebidas) e ainda NÃO foram validados
// com uma conta real. Valide com o token de homologação antes de usar em produção.
export type Env = Record<string, string | undefined>;
export type Fetch = (url: string, init?: any) => Promise<any>;

export interface ResultadoNfe { configurado: boolean; notas: { nome: string; xml: string }[]; total?: number; proximaVersao?: string; erro?: string }

export async function buscaNotas(env: Env, f: Fetch, opts: { versao?: string; max?: number } = {}): Promise<ResultadoNfe> {
  const token = env.NFE_PROVIDER_TOKEN, cnpj = (env.NFE_CNPJ || '').replace(/\D/g, '');
  if (!token || !cnpj) return { configurado: false, notas: [] };
  const base = (env.NFE_PROVIDER_URL || 'https://api.focusnfe.com.br').replace(/\/$/, '');
  const headers = { Authorization: 'Basic ' + btoa(token + ':') };
  const max = Math.min(opts.max ?? 20, 50);
  const q = `cnpj=${cnpj}` + (opts.versao ? `&versao=${encodeURIComponent(opts.versao)}` : '');
  const r = await f(`${base}/v2/nfes_recebidas?${q}`, { headers });
  if (!r.ok) return { configurado: true, notas: [], erro: `Provedor respondeu ${r.status} na listagem` };
  const lista: any[] = await r.json();
  const prox = r.headers?.get?.('x-max-version') || undefined;
  const notas: { nome: string; xml: string }[] = [];
  for (const it of lista.slice(0, max)) {
    const chave = String(it.chave_nfe || it.chave || '').replace(/\D/g, '');
    if (chave.length !== 44) continue;
    const x = await f(`${base}/v2/nfes_recebidas/${chave}.xml`, { headers });
    if (!x.ok) continue;
    notas.push({ nome: chave + '.xml', xml: await x.text() });
  }
  return { configurado: true, notas, total: lista.length, proximaVersao: prox };
}
