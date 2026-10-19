// E2E Fase 11 (modo aberto): alçadas por faixa, atualização pela planilha (.json e .xlsx), apuração de tributos e integrações sem login.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
 const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:fs.readFileSync(__dirname+'/vendor_test/xlsx.full.min.js','utf8')}));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const role=r=>p.selectOption('#role',r),nav=v=>p.evaluate(v=>{S.view=v;render()},v),T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 // ---- 1. alçadas por faixa ----
 const A=await p.evaluate(()=>{S.t.par.limite=1000;S.t.par.gerenteAte=50000;return [alcadaDe('verde',500),alcadaDe('verde',5000),alcadaDe('amarelo',20000),alcadaDe('amarelo',60000),alcadaDe('vermelho',100)]});
 ok('faixas: verde pequeno sem alçada, verde grande e amarelo no Gerente, acima da faixa e vermelho na Diretoria',JSON.stringify(A)==='[null,"gerente","gerente","diretoria","diretoria"]');
 await role('diretoria');await nav('compras');await p.click('[data-act=params]');await p.fill('#p-g','12345');await p.click('[data-act=params-ok]');
 ok('parâmetro Gerente aprova até grava e aparece na tela',await p.evaluate(()=>S.t.par.gerenteAte===12345)&&await T('Gerente até'));
 // emissão real de OC amarela com valor acima da faixa -> Diretoria
 await role('gestao');await nav('eap');await p.click('[data-act=congelar]');await p.click('[data-act=ask-ok]');
 const it=await p.evaluate(()=>{const i=S.D.items.find(i=>i.meta_total<i.teto_total&&i.qtd>=1&&S.sd[i.codigo].livre>0);return {c:i.codigo,q:i.qtd,pu:(i.meta_total+i.teto_total)/2/i.qtd,tot:(i.meta_total+i.teto_total)/2}});
 await p.evaluate(t=>{S.t.par.gerenteAte=Math.floor(t-1)},it.tot);
 await role('engenheiro');await nav('eap');await p.fill('#q',it.c);await p.click(`tr[data-item="${it.c}"]`);await p.click('[data-act=nova-sol]');await p.fill('#s-desc','x');await p.fill('#s-qtd',String(it.q));await p.fill('#s-pu',String(it.pu));await p.click('[data-act=sol-ok]');
 await role('compras');await nav('compras');await p.click('[data-act=mapa]');
 for(const [f,v] of [['A',it.pu],['B',it.pu*1.01],['C',it.pu*1.02]]){await p.fill('#c-f',f);await p.fill('#c-p',String(v));await p.click('[data-act=add-cot]')}
 await p.check('input[name=esc][value="0"]');await p.fill('#c-j','acima da meta, aprovado').catch(()=>{});await p.click('[data-act=emitir-oc]');
 ok('OC amarela acima da faixa do Gerente vai para a Diretoria',await p.evaluate(()=>S.t.ocs[0]&&S.t.ocs[0].alcada==='diretoria'&&S.t.ocs[0].status==='em_alcada'));
 // ---- 2. atualização pela planilha (.json) ----
 const alvo=await p.evaluate(()=>{const a=S.D.items.filter(i=>i.meta_total>0&&i.pacote).slice(5,7).map(i=>i.codigo);return a});
 const eap=await p.evaluate(()=>S.D.eap.filter(e=>e.tipo_linha==='item'&&e.meta_total!=null).map(e=>({codigo:e.codigo,tipo_linha:'item',qtd:e.qtd,meta_total:e.meta_total,teto_total:e.teto_total,status_cotacao:e.status_cotacao})));
 const meta0=await p.evaluate(c=>c.map(x=>S.byCod[x].meta_base),alvo);
 eap.forEach(e=>{if(e.codigo===alvo[0])e.meta_total=+(e.meta_total+100).toFixed(2);if(e.codigo===alvo[1])e.status_cotacao='Orçado'});
 eap.push({codigo:'Z.9.9.9',tipo_linha:'item',qtd:1,meta_total:10,teto_total:11,status_cotacao:'Orçado'});
 fs.writeFileSync('/tmp/sync_teste.json',JSON.stringify({eap,pacotes:[]}));
 await role('gestao');await nav('eap');await p.click('[data-act=sync-novo]');await p.setInputFiles('#sy-f','/tmp/sync_teste.json');await p.click('[data-act=sync-ler]');await p.waitForSelector('#sy-r .kpi4');
 const d=await p.evaluate(()=>({n:SYNC.dif.length,novos:SYNC.info.novos,dm:SYNC.dMeta}));
 ok('diferenças: 1 meta alterada (+100), item fora do orçamento ignorado',d.n>=1&&d.novos.includes('Z.9.9.9')&&Math.abs(d.dm-100)<0.01);
 const v0=await p.evaluate(()=>S.t.versao);await p.click('#sy-ap');
 ok('aplicar cria nova versão da linha de base e muda a meta',await p.evaluate(([c,m,v0])=>S.t.versao===v0+1&&Math.abs(S.byCod[c].meta_total-(m+100))<0.01&&S.t.hist.length>=2,[alvo[0],meta0[0],v0]));
 ok('auditoria registra a atualização da linha de base',await p.evaluate(()=>S.t.aud.some(a=>a.campo==='linha_base'&&a.depois.includes('v')))); 
 await p.reload();await p.waitForSelector('.big');ok('nova meta persiste após recarregar',await p.evaluate(([c,m])=>Math.abs(S.byCod[c].meta_total-(m+100))<0.01,[alvo[0],meta0[0]]));
 // ---- 2b. .xlsx sintético ----
 const XLSX=require('./vendor_test/xlsx.full.min.js');const wb=XLSX.utils.book_new();
 const it2=await p.evaluate(()=>{const i=S.D.items.find(i=>i.pacote&&i.meta_total>0&&!S.t.baseOv[i.codigo]);return {c:i.codigo,q:i.qtd,m:i.meta_base,t:i.teto_total,st:i.status_cotacao,pc:i.pacote}});
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['META'],[],['Pacote','Nome do pacote','Item','Descrição','Und','Qtd','Evento','Precisa em obra','Fechar até','Preço SANEAGO unit.','Meta custo unit.','Meta custo total','Teto total (margem zero)','Fornecedor','Status','Custo adotado'],[it2.pc,'x',it2.c,'d','UN',it2.q,'1',null,null,0,0,it2.m,it2.t,null,it2.st,it2.m+250]]),'12. META - ITENS');
 XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['PAC'],[],['Pacote','O que fechar','Meta de custo','Teto (margem zero)','Fechar até']]),'11. META - PACOTES');
 fs.writeFileSync('/tmp/sync_teste.xlsx',XLSX.write(wb,{type:'buffer',bookType:'xlsx'}));
 await nav('eap');await p.click('[data-act=sync-novo]');await p.setInputFiles('#sy-f','/tmp/sync_teste.xlsx');await p.click('[data-act=sync-ler]');await p.waitForSelector('#sy-r .kpi4');
 ok('.xlsx do Estudo é lido no navegador (abas 11 e 12) e mostra +250',await p.evaluate(()=>Math.abs(SYNC.dMeta-250)<0.01&&SYNC.dif[0].codigo));
 await p.click('[data-act=fechar]');
 await role('almox');await nav('eap');ok('só Gestão/Diretoria atualizam a linha de base',await p.isDisabled('[data-act=sync-novo]'));
 // ---- 3. apuração ----
 await role('financeiro');
 const ap=await p.evaluate(()=>{const hoje=hojeISO();S.t.fats.push({id:'ftx',num:'FT-9001',bc:'x',bcNum:'BC-x',valor:100000,ret:0,emissao:hoje,venc:hoje});
  S.t.notas.push({id:'nx',num:'NF-9001',emitente:'Empreiteira',cnpj:'1',chave:'k',valor:10000,emissao:hoje,oc:'',rateio:[{item:S.D.items[0].codigo,valor:10000,nat:'TER',conta:'4.4.01'}],status:'rateada'});
  save();const f=apuraFaturamento(mesDe(hoje)).T,r=retencoesNota(S.t.notas[S.t.notas.length-1]);return {f,r}});
 ok('apuração: 100.000 faturados → ISS 2.000, PIS 650, COFINS 3.000, IRPJ+CSLL 2.850, total 8.500',ap.f.iss===2000&&ap.f.pis===650&&ap.f.cofins===3000&&ap.f.irpjCsll===2850&&ap.f.total===8500);
 ok('retenção: 10.000 de serviço de terceiros → INSS 11% = 1.100, líquido 8.900',ap.r.inss===1100&&ap.r.liquido===8900);
 await nav('fin');await p.click('.tabs button[data-t=apur]');ok('aba Apuração mostra os valores e o aviso de estimativa',await T('Estimativa para conferência')&&await T('Total a recolher'));
 await p.fill('[data-fisc=iss]','5');await p.dispatchEvent('[data-fisc=iss]','change');
 ok('alíquota editável recalcula (ISS 5% → 5.000)',await p.evaluate(()=>apuraFaturamento(mesDe(hojeISO())).T.iss===5000));
 await p.click('.tabs button[data-t=fech]');await p.click('[data-act=fech-csv]');const csv=await p.inputValue('#f-out');
 ok('arquivo do contador traz a retenção de INSS calculada',csv.includes('1100,00'));
 // ---- 4. integrações sem login ----
 await p.click('[data-act=nfe-buscar]');ok('NF-e automática sem login explica que exige login',await T('exigem o login'));
 await p.screenshot({path:out+'/integracoes.png'});
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,4).join(' '));process.exit(1)});
