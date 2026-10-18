// Cliente mínimo da API oficial do Sankhya (OAuth 2.0 + gateway). Lógica pura, testável sem Deno.
// ATENÇÃO: nomes de entidades/campos (Natureza, CentroResultado, Financeiro) e o formato de envio seguem exemplos públicos da comunidade
// e NÃO foram validados contra o Sankhya da TAF. Escrita fica desligada até SANKHYA_ALLOW_WRITE=true e exige confirmação explícita.
export type Env = Record<string, string | undefined>;
export type Fetch = (url: string, init?: any) => Promise<any>;

export const configurado = (e: Env) => !!(e.SANKHYA_URL && e.SANKHYA_CLIENT_ID && e.SANKHYA_CLIENT_SECRET && e.SANKHYA_TOKEN);
const base = (e: Env) => (e.SANKHYA_URL || '').replace(/\/$/, '');

export async function autentica(e: Env, f: Fetch): Promise<string> {
  const r = await f(`${base(e)}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': e.SANKHYA_TOKEN! },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: e.SANKHYA_CLIENT_ID!, client_secret: e.SANKHYA_CLIENT_SECRET! }).toString(),
  });
  if (!r.ok) throw new Error(`Autenticação recusada (${r.status})`);
  const j = await r.json();
  if (!j.access_token) throw new Error('Resposta de autenticação sem access_token');
  return j.access_token;
}

async function servico(e: Env, f: Fetch, token: string, nome: string, requestBody: unknown) {
  const r = await f(`${base(e)}/gateway/v1/mge/service.sbr?serviceName=${nome}&outputType=json`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ requestBody }),
  });
  if (!r.ok) throw new Error(`${nome}: HTTP ${r.status}`);
  const j = await r.json();
  if (j.status && String(j.status) !== '1') throw new Error(`${nome}: ${j.statusMessage || 'erro do Sankhya'}`);
  return j;
}

export async function lista(e: Env, f: Fetch, token: string, entidade: string, campos: string[]) {
  const j = await servico(e, f, token, 'CRUDServiceProvider.loadRecords', {
    dataSet: { rootEntity: entidade, includePresentationFields: 'N', offsetPage: '0', criteria: { expression: { $: '1=1' } }, entity: { fieldset: { list: campos.join(',') } } },
  });
  const ent = j.responseBody?.entities;
  const campo = ent?.metadata?.fields?.field;
  const nomes: string[] = (Array.isArray(campo) ? campo : campo ? [campo] : []).map((c: any) => c.name);
  const rows = ent?.entity ? (Array.isArray(ent.entity) ? ent.entity : [ent.entity]) : [];
  return rows.map((row: any) => Object.fromEntries(nomes.map((n, i) => [n, row['f' + i]?.$ ?? null])));
}

export interface Lancamento { nota: string; data: string; cnpj: string; nome: string; natureza: string; centro: string; valor: number }

// Monta o corpo de gravação do financeiro (a pagar). Ajustável conforme a TOP e os campos obrigatórios da TAF.
export const montaFinanceiro = (l: Lancamento, e: Env) => ({
  dataSet: { rootEntity: 'Financeiro', includePresentationFields: 'N', dataRow: { localFields: {
    CODEMP: { $: e.SANKHYA_CODEMP || '1' }, NUMNOTA: { $: l.nota }, DTNEG: { $: l.data }, VLRDESDOB: { $: l.valor.toFixed(2) },
    CODNAT: { $: l.natureza }, CODCENCUS: { $: l.centro }, RECDESP: { $: '-1' }, HISTORICO: { $: `TAF Obras · ${l.nome}`.slice(0, 250) },
  } }, entity: { fieldset: { list: 'NUFIN' } } },
});

export async function envia(e: Env, f: Fetch, token: string, ls: Lancamento[]) {
  if (e.SANKHYA_ALLOW_WRITE !== 'true') throw new Error('Escrita no Sankhya desligada (SANKHYA_ALLOW_WRITE). Use a simulação.');
  const out: { nota: string; ok: boolean; erro?: string }[] = [];
  for (const l of ls) {
    try { await servico(e, f, token, 'CRUDServiceProvider.saveRecord', montaFinanceiro(l, e)); out.push({ nota: l.nota, ok: true }); }
    catch (x: any) { out.push({ nota: l.nota, ok: false, erro: String(x.message || x) }); }
  }
  return out;
}
