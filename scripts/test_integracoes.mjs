// Testa os adaptadores de NF-e contra servidores simulados (sem credenciais reais). Node >= 22.6 (strip-types).
import http from 'node:http';
import assert from 'node:assert/strict';
const { buscaNotas } = await import('../supabase/functions/_shared/nfe.ts');
const calls = [];
const srv = http.createServer((req, res) => {
  let body = ''; req.on('data', (d) => body += d); req.on('end', () => {
    calls.push({ m: req.method, u: req.url, a: req.headers.authorization, x: req.headers['x-token'], b: body });
    const j = (o, s = 200, h = {}) => { res.writeHead(s, { 'content-type': 'application/json', ...h }); res.end(JSON.stringify(o)); };
    if (req.url.startsWith('/v2/nfes_recebidas?')) return j([{ chave_nfe: '3'.repeat(44) }, { chave_nfe: 'curta' }], 200, { 'x-max-version': '77' });
    if (req.url.endsWith('.xml')) { res.writeHead(200, { 'content-type': 'text/xml' }); return res.end('<nfeProc/>'); }
    if (req.url === '/authenticate') return body.includes('client_id=cid') && req.headers['x-token'] === 'tok' ? j({ access_token: 'AT1' }) : j({}, 401);
    if (req.url.includes('loadRecords')) {
      if (req.headers.authorization !== 'Bearer AT1') return j({}, 401);
      const rb = JSON.parse(body).requestBody.dataSet.rootEntity;
      return j({ status: '1', responseBody: { entities: { metadata: { fields: { field: rb === 'Natureza' ? [{ name: 'CODNAT' }, { name: 'DESCRNAT' }] : [{ name: 'CODCENCUS' }, { name: 'DESCRCENCUS' }] } }, entity: [{ f0: { $: '10101' }, f1: { $: 'Materiais' } }] } } });
    }
    if (req.url.includes('saveRecord')) return j({ status: '1' });
    j({}, 404);
  });
});
await new Promise((r) => srv.listen(0, r));
const url = `http://127.0.0.1:${srv.address().port}`;
const out = [];
const ok = (n, f) => { try { f(); out.push('OK   ' + n); } catch (e) { out.push('FALHA ' + n + ' :: ' + e.message); process.exitCode = 1; } };

// NF-e
let r = await buscaNotas({}, fetch);
ok('NF-e sem credenciais: não configurado e sem chamada', () => { assert.equal(r.configurado, false); assert.equal(calls.length, 0); });
r = await buscaNotas({ NFE_PROVIDER_TOKEN: 'T', NFE_CNPJ: '12.345.678/0001-95', NFE_PROVIDER_URL: url }, fetch, { versao: '5' });
ok('NF-e lista, ignora chave inválida e baixa o XML', () => { assert.equal(r.notas.length, 1); assert.equal(r.notas[0].nome, '3'.repeat(44) + '.xml'); assert.equal(r.proximaVersao, '77'); });
ok('NF-e usa Basic auth com o token e CNPJ só com dígitos', () => { const c = calls[0]; assert.equal(c.a, 'Basic ' + Buffer.from('T:').toString('base64')); assert.match(c.u, /cnpj=12345678000195&versao=5/); });

console.log(out.join('\n')); srv.close();
