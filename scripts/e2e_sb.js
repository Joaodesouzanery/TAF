// E2E do modo conectado: a biblioteca real do supabase-js contra um Auth/PostgREST simulado em memória.
// (O RLS em si é testado no Postgres: supabase/tests/rls.sql.)  Uso: node scripts/e2e_sb.js [dir_screenshots]
const {chromium}=require('playwright');
const fs=require('fs');
const URL_SB='https://kefkgydvjjakqaonyjau.supabase.co';
const payload=JSON.parse(fs.readFileSync(__dirname+'/../web/data/obra342.json','utf8'));
const XML_NFE='<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe'+'4'.repeat(44)+'"><ide><nNF>55</nNF><dhEmi>2026-10-18T10:00:00-03:00</dhEmi></ide><emit><CNPJ>11222333000144</CNPJ><xNome>Forn Mock</xNome></emit><det><prod><xProd>Tubo</xProd><qCom>1</qCom><vProd>900.00</vProd></prod></det><total><ICMSTot><vNF>900.00</vNF></ICMSTot></total></infNFe></NFe></nfeProc>';
const db={users:[],perfil:[],obra:[],pacote:[],item_eap:[],conta:[],documento:[],funcao_mo:[]};
const log=[];
const uid=e=>'u-'+e.split('@')[0];
const sess=u=>({access_token:'tok-'+u.id,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r-'+u.id,user:{id:u.id,aud:'authenticated',email:u.email,app_metadata:{},user_metadata:u.meta||{}}});
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','access-control-expose-headers':'*'};
const json=(route,status,body,extra={})=>route.fulfill({status,headers:{...CORS,'content-type':'application/json',...extra},body:body===undefined?'':JSON.stringify(body)});
function filtra(rows,sp){return rows.filter(r=>[...sp.entries()].every(([k,v])=>{if(['select','order','limit','on_conflict','columns'].includes(k))return true;const m=/^eq\.(.*)$/.exec(v);return m?String(r[k])===m[1]:true}))}
function importar(p){
  const ob={id:'ob-1',codigo:p.obra.codigo,nome:p.obra.nome,contratante:p.obra.contratante,contrato:p.obra.contrato,municipio:p.obra.municipio,valor_contrato:String(p.obra.valor_contrato),regime:p.obra.regime,tributos_nota:'0.085',estado:{}};db.obra=[ob];
  db.conta=p.plano.map(c=>({...c}));db.funcao_mo=(p.banco_mo||[]).map(f=>({...f}));
  db.pacote=p.pacotes.map(x=>({id:'pc-'+x.codigo,obra_id:ob.id,codigo:x.codigo,nome:x.nome,tipo:x.tipo,responsavel:x.responsavel,precisa_em_obra:x.precisa_em_obra,fechar_ate:x.fechar_ate,meta:String(x.meta),teto:String(x.teto),condicao_pagamento:x.condicao_pagamento,observacoes:x.observacoes}));
  db.item_eap=p.eap.map(e=>({id:'i-'+e.codigo,obra_id:ob.id,codigo:e.codigo,descricao:e.descricao,unidade:e.unidade,qtd:e.qtd==null?null:String(e.qtd),nivel:e.nivel,pai_codigo:e.pai,eh_item:e.tipo_linha==='item',preco_venda_total:String(e.preco_venda_total),meta_total:e.meta_total==null?null:String(e.meta_total),teto_total:e.teto_total==null?null:String(e.teto_total),meta_unit:e.meta_unit==null?null:String(e.meta_unit),fonte_meta:e.fonte_meta,status_cotacao:e.status_cotacao,evento:e.evento,pacote_id:e.pacote?'pc-'+e.pacote:null,tipo:e.tipo,composicao:e.composicao,natureza:e.natureza,hh_unit:e.hh_unit==null?null:String(e.hh_unit)}));
}
async function mock(page){
  await page.route(URL_SB+'/**',async route=>{
    const req=route.request(),u=new URL(req.url()),m=req.method(),path=u.pathname;
    if(m==='OPTIONS')return route.fulfill({status:204,headers:CORS});
    const body=req.postData()?JSON.parse(req.postData()):null;
    if(path==='/auth/v1/signup'){const e=body.email;if(db.users.find(x=>x.email===e))return json(route,422,{msg:'User already registered'});
      const user={id:uid(e),email:e,meta:body.data};db.users.push(user);db.perfil.push({user_id:user.id,nome:(body.data&&body.data.nome)||e,papel:db.perfil.length?'pendente':'admin',criado_em:new Date().toISOString()});log.push('signup '+e);return json(route,200,sess(user))}
    if(path==='/auth/v1/token'){const user=db.users.find(x=>x.email===body.email);if(!user)return json(route,400,{error:'invalid_grant',error_description:'Invalid login credentials'});return json(route,200,sess(user))}
    if(path==='/auth/v1/logout')return json(route,204);
    if(path.startsWith('/rest/v1/rpc/importar_obra')){const tok=(req.headers()['authorization']||'').replace('Bearer tok-','');const pf=db.perfil.find(x=>x.user_id===tok);
      if(!pf||!['admin','gestao','diretoria'].includes(pf.papel))return json(route,400,{message:'Sem permissão para importar'});importar(body.p);log.push('importar_obra');return json(route,200,'ob-1')}
    if(path.startsWith('/functions/v1/')){const tok=(req.headers()['authorization']||'').replace('Bearer tok-','');if(!db.perfil.find(x=>x.user_id===tok))return json(route,403,{erro:'sem login'});
      if(path.endsWith('nfe-sync')){log.push('fn nfe-sync');return json(route,200,{configurado:true,notas:[{nome:'n1.xml',xml:XML_NFE}],proximaVersao:'9'})}
      if(path.endsWith('sankhya-sync')){log.push('fn sankhya-sync');return json(route,200,{configurado:false})}}
    const t=path.replace('/rest/v1/','');
    if(!db[t])return json(route,404,{message:'tabela '+t});
    const single=(req.headers()['accept']||'').includes('vnd.pgrst.object');
    if(m==='GET'){let rows=filtra(db[t],u.searchParams);const lim=u.searchParams.get('limit');if(lim)rows=rows.slice(0,+lim);
      if(single){if(rows.length!==1)return json(route,406,{message:'JSON object requested, multiple (or no) rows returned'});return json(route,200,rows[0])}return json(route,200,rows)}
    if(m==='POST'){const arr=Array.isArray(body)?body:[body];arr.forEach(r=>{const i=db[t].findIndex(x=>x.id===r.id);i>=0?db[t][i]={...db[t][i],...r}:db[t].push(r)});log.push('upsert '+t+' x'+arr.length);return route.fulfill({status:201,headers:CORS,body:''})}
    if(m==='PATCH'){filtra(db[t],u.searchParams).forEach(r=>Object.assign(r,body));log.push('patch '+t);return route.fulfill({status:204,headers:CORS})}
    return json(route,405,{message:'método'});
  });
}
(async()=>{
  const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const novo=async()=>{const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await mock(p);p.on('dialog',d=>d.accept(d.type()==='prompt'?'ok':undefined));return {ctx,p}};
  const T=async(p,s)=>(await p.innerText('body')).includes(s);
  const entrar=async(p,email,novoUser)=>{await p.fill('#l-e',email);await p.fill('#l-s','senha123');await p.click(novoUser?'[data-act=l-novo]':'[data-act=l-entrar]')};

  // ---- admin: primeiro cadastro ----
  let {ctx,p}=await novo();
  await p.goto('file:///home/user/TAF/dist/tafadmin.html?sb=1');await p.waitForSelector('#login.open');
  ok('abre na tela de login (modo conectado)',await p.isVisible('#login.open #l-e'));
  await entrar(p,'admin@taf.com',false);await p.waitForSelector('#l-msg');ok('login inexistente recusado',(await p.textContent('#l-msg')).includes('incorretos'));
  await entrar(p,'admin@taf.com',true);
  await p.waitForSelector('[data-act=importar]');ok('primeiro cadastro = admin, sem obra: oferece importar',true);
  await p.click('[data-act=importar]');await p.waitForSelector('.big');
  ok('obra 342 importada e carregada (346 itens)',await T(p,'Bom dia, Administrador!')&&db.item_eap.filter(i=>i.eh_item).length===346);
  ok('menu Usuários só para admin',await p.isVisible('#nav button[data-v=usuarios]'));
  // fluxo gravando no banco
  await p.click('#nav button[data-v=eap]');await p.click('[data-act=congelar]');await p.click('[data-act=ask-ok]');await p.waitForTimeout(600);
  ok('congelar grava obra.estado',db.obra[0].estado&&db.obra[0].estado.frozen===true);
  await p.fill('#q','B.3.1.7.1');await p.click('tr[data-item="B.3.1.7.1"]');await p.click('[data-act=nova-sol]');
  await p.fill('#s-desc','Curva 22 30');await p.fill('#s-qtd','2');await p.fill('#s-pu','800');await p.click('[data-act=sol-ok]');await p.waitForTimeout(800);
  const sol=db.documento.find(d=>d.tipo==='sol');ok('solicitação gravada em documento (tipo sol)',!!sol&&sol.dados.num==='SC-0001'&&sol.obra_id==='ob-1');
  ok('auditoria gravada',db.documento.some(d=>d.tipo==='aud'));
  // persistência: recarrega e mantém sessão
  await p.reload();await p.waitForSelector('.big');
  ok('sessão persiste e estado volta do banco (linha de base congelada)',!(await T(p,'compras bloqueadas')));
  await p.click('#nav button[data-v=compras]');ok('SC-0001 volta do banco',await T(p,'SC-0001'));
  // Fase 8: apontamento grava em documento (tipo apt) e usa o banco de MO
  await p.click('#nav button[data-v=campo]');await p.click('[data-act=novo-apt]');
  const ci=await p.evaluate(()=>S.D.items.find(i=>i.hh_unit&&i.qtd>=10).codigo);
  await p.selectOption('#a-item',ci);await p.fill('#a-q','4');await p.click('[data-act=apt-ok]');await p.waitForTimeout(800);
  const apt=db.documento.find(d=>d.tipo==='apt');ok('apontamento gravado em documento (tipo apt)',!!apt&&apt.dados.num==='AP-0001'&&apt.dados.pessoas.length===1);
  ok('banco de MO carregado do banco (funcao_mo)',await p.evaluate(()=>S.D.banco_mo.length>20&&custoHora('Pedreiro')>0));
  // offline: a gravação falha por rede, fica na fila local e sobe depois
  await p.route('**/rest/v1/documento**',r=>r.abort('failed'));
  await p.click('[data-act=apt-conf]');await p.waitForTimeout(900);
  ok('sem rede: registro guardado na fila do aparelho',await p.evaluate(()=>!!localStorage.getItem(filaKey())));
  await p.unroute('**/rest/v1/documento**');await p.evaluate(()=>sbSync());await p.waitForTimeout(900);
  ok('com rede: fila sobe e é limpa',await p.evaluate(()=>!localStorage.getItem(filaKey()))&&db.documento.find(d=>d.tipo==='apt').dados.status==='conferido');
  // Fase 11: integrações usam funções do servidor (só com login)
  await p.click('#nav button[data-v=fin]');await p.click('.tabs button[data-t=fech]');await p.click('[data-act=nfe-buscar]');await p.waitForTimeout(900);
  ok('NF-e automática (função simulada) importa a nota para a fila sem rateio e grava no banco',db.documento.some(d=>d.tipo==='nf'&&d.dados.chave==='4'.repeat(44)&&d.dados.status==='lancada'));
  await p.click('[data-act=nfe-buscar]');await p.waitForTimeout(600);
  ok('mesma chave na segunda busca não duplica',db.documento.filter(d=>d.tipo==='nf'&&d.dados.chave==='4'.repeat(44)).length===1);
  await p.click('[data-act=sk-conexao]');await p.waitForTimeout(500);
  ok('Sankhya sem credenciais no servidor: avisa o que cadastrar',(await p.innerText('body')).includes('SANKHYA_CLIENT_ID'));
  // usuários: libera o segundo
  await p.click('#nav button[data-v=usuarios]');await p.waitForTimeout(200);
  await p.screenshot({path:out+'/usuarios.png'});
  // ---- segundo usuário: pendente ----
  const seg=await novo();await seg.p.goto('file:///home/user/TAF/dist/tafadmin.html?sb=1');await seg.p.waitForSelector('#login.open');
  await entrar(seg.p,'eng@taf.com',true);await seg.p.waitForSelector('.soon');
  ok('novo usuário fica aguardando liberação',await T(seg.p,'Aguardando liberação'));
  await seg.ctx.close();
  // admin atribui engenheiro
  await p.reload();await p.waitForSelector('.big');await p.click('#nav button[data-v=usuarios]');
  await p.selectOption('select[data-perfil="u-eng"]','engenheiro');await p.waitForTimeout(500);
  ok('admin atribui papel (grava perfil)',db.perfil.find(x=>x.user_id==='u-eng').papel==='engenheiro');
  // ---- engenheiro entra e vê a SC, sem menu Usuários ----
  const e2=await novo();await e2.p.goto('file:///home/user/TAF/dist/tafadmin.html?sb=1');await e2.p.waitForSelector('#login.open');
  await entrar(e2.p,'eng@taf.com',false);await e2.p.waitForSelector('.big');
  ok('engenheiro entra, vê o estado compartilhado e não vê Usuários',!(await e2.p.isVisible('#nav button[data-v=usuarios]'))&&(await e2.p.textContent('#userbox')).includes('Engenheiro'));
  await e2.p.click('#nav button[data-v=compras]');ok('engenheiro vê SC-0001 criada pelo admin',await T(e2.p,'SC-0001'));
  await e2.p.screenshot({path:out+'/login_eng.png'});
  // ---- sair ----
  await e2.p.click('[data-act=sair]');await e2.p.waitForSelector('#login.open');ok('sair volta ao login',true);
  console.log(res.join('\n'));console.log('requisições:',log.join(' | '));
  console.log('erros JS:',JSON.stringify([...p.errs,...e2.p.errs]));
  await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,3).join(' '));process.exit(1)});
