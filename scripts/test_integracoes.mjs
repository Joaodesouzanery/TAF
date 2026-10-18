// Testa os adaptadores de NF-e e Sankhya contra servidores simulados (sem credenciais reais). Node >= 22.6 (strip-types).
import http from 'node:http';
import assert from 'node:assert/strict';
const { buscaNotas } = await import('../supabase/functions/_shared/nfe.ts');
const sk = await import('../supabase/functions/_shared/sankhya.ts');
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

// Sankhya
const env = { SANKHYA_URL: url, SANKHYA_CLIENT_ID: 'cid', SANKHYA_CLIENT_SECRET: 'sec', SANKHYA_TOKEN: 'tok' };
ok('Sankhya: configurado só com os 4 secrets', () => { assert.equal(sk.configurado(env), true); assert.equal(sk.configurado({ SANKHYA_URL: url }), false); });
const tk = await sk.autentica(env, fetch);
ok('Sankhya: OAuth devolve o token e envia X-Token', () => assert.equal(tk, 'AT1'));
await assert.rejects(() => sk.autentica({ ...env, SANKHYA_CLIENT_ID: 'x' }, fetch), /recusada/).then(() => out.push('OK   Sankhya: credencial errada é recusada'));
const nat = await sk.lista(env, fetch, tk, 'Natureza', ['CODNAT', 'DESCRNAT']);
ok('Sankhya: lê naturezas em objetos nomeados', () => assert.deepEqual(nat, [{ CODNAT: '10101', DESCRNAT: 'Materiais' }]));
const l = { nota: '123', data: '18/10/2026', cnpj: '1', nome: 'Forn', natureza: '10101', centro: '342', valor: 1600 };
ok('Sankhya: simulação monta o corpo sem chamar a API', () => { const n = calls.length; const p = sk.montaFinanceiro(l, env); assert.equal(p.dataSet.dataRow.localFields.VLRDESDOB.$, '1600.00'); assert.equal(p.dataSet.dataRow.localFields.CODNAT.$, '10101'); assert.equal(calls.length, n); });
await assert.rejects(() => sk.envia(env, fetch, tk, [l]), /desligada/).then(() => out.push('OK   Sankhya: escrita bloqueada por padrão'));
const e2 = await sk.envia({ ...env, SANKHYA_ALLOW_WRITE: 'true' }, fetch, tk, [l]);
ok('Sankhya: com a trava liberada, envia e reporta por nota', () => assert.deepEqual(e2, [{ nota: '123', ok: true }]));
console.log(out.join('\n')); srv.close();
