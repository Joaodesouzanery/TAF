// E2E Fase 9 (modo aberto, sem login): medição atestada -> boletim -> aprovação com glosa -> NF -> recebimento -> DRE e caixa.
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('dialog',d=>d.accept());
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 ok('abre direto, sem tela de login',!(await p.isVisible('#login.open'))&&(await p.innerText('body')).includes('Dashboard'));
 const role=r=>p.selectOption('#role',r),nav=v=>p.evaluate(v=>{S.view=v;render()},v),T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 const it=await p.evaluate(()=>{const i=S.D.items.find(i=>i.qtd>=10&&i.preco_venda_total>1000);return {c:i.codigo,pu:i.preco_venda_total/i.qtd}});
 // medição 10 un, atestada
 await role('engenheiro');await nav('med');await p.click('[data-act=nova-med]');await p.selectOption('#m-item',it.c);await p.fill('#m-q','10');await p.click('[data-act=med-ok]');
 await role('gerente');await nav('med');await p.click('.tabs button[data-t=bm]');await p.click('[data-act=atestar]');
 const bruto=10*it.pu;
 await nav('fat');ok('medição atestada habilita gerar boletim',!(await p.isDisabled('[data-act=bc-novo]')));
 await p.click('[data-act=bc-novo]');await p.fill('#b-rj','5');await p.click('[data-act=bc-ok]');
 ok('boletim BC-0001 gerado com o valor medido',await T('BC-0001')&&Math.abs(await p.evaluate(()=>bcBruto(S.t.bcs[0]))-bruto)<0.01);
 ok('medição não entra em dois boletins',await p.evaluate(()=>medsLivres().length===0));
 await p.click('[data-act=bc-env]');await p.click('[data-act=bc-apr]');
 const tot=bruto*1.05;await p.fill('#b-ap',String(tot+100));await p.click('[data-act=bc-apr-ok]');
 ok('aprovado acima do medido é recusado',await p.evaluate(()=>S.t.bcs[0].status==='enviado'));
 await p.click('[data-act=fechar]');await p.click('[data-act=bc-apr]');await p.fill('#b-ap',String(Math.round(tot*0.9*100)/100));await p.click('[data-act=bc-apr-ok]');
 const g=await p.evaluate(()=>({g:bcGlosa(S.t.bcs[0]),a:bcAprov(S.t.bcs[0]),t:bcTotal(S.t.bcs[0])}));
 ok('glosa = total − aprovado',Math.abs(g.g-(g.t-g.a))<0.01&&g.g>0);
 await role('financeiro');await nav('fat');ok('financeiro fatura o boletim aprovado',!(await p.isDisabled('[data-act=bc-fat]')));
 await p.click('[data-act=bc-fat]');
 ok('NF FT-0001 emitida e boletim faturado',await T('FT-0001')&&await p.evaluate(()=>S.t.bcs[0].status==='faturado'));
 await p.evaluate(()=>{});await p.click('[data-act=rec-novo]');const sal=await p.evaluate(()=>fatSaldo(S.t.fats[0]));
 await p.fill('#rc-v',String(sal+1));await p.click('[data-act=rec-ok]');ok('recebimento acima do saldo recusado',await p.evaluate(()=>S.t.recs.length===0));await p.fill('#rc-v',String(Math.round(sal/2*100)/100));
 await p.click('[data-act=rec-ok]');
 ok('recebimento parcial baixa o saldo',await p.evaluate(s=>Math.abs(fatSaldo(S.t.fats[0])-(s-Math.round(s/2*100)/100))<0.02,sal));
 const rv=await p.evaluate(()=>S.t.recs[0].valor);
 await p.fill('#ofx-e',`20/11/2026;TED SANEAGO;${String(rv.toFixed(2)).replace('.',',')}`);await p.click('[data-act=conc-ent]');
 ok('extrato concilia o recebimento',await p.evaluate(()=>!!S.t.recs[0].conc));
 // caixa: lançamento manual e entradas
 await p.click('[data-act=lan-novo]');await p.fill('#l-v','-5000');await p.fill('#l-t','DARF');await p.click('[data-act=lan-ok]');
 const cx=await p.evaluate(()=>{const c=caixa();return {ent:c.rows.reduce((s,r)=>s+r.entR+r.entP,0),man:c.rows.reduce((s,r)=>s+r.man,0),f:fatLiq(S.t.fats[0])}});
 ok('caixa soma entradas = líquido da NF e o lançamento manual',Math.abs(cx.ent-cx.f)<0.02&&cx.man===-5000);
 ok('gráfico de caixa renderiza',await p.isVisible('svg[aria-label="Entradas e saídas por mês"]'));
 await p.screenshot({path:out+'/caixa.png'});
 // DRE
 await nav('pain');await p.click('.tabs button[data-t=dre]');
 const d=await p.evaluate(()=>{const x=dre();return {aprov:x.aprov,liq:x.liq,ded:x.ded,trib:S.D.obra.tributos_nota,g:x.glosa}});
 ok('DRE: receita líquida = aprovado × (1 − tributos)',Math.abs(d.liq-d.aprov*(1-d.trib))<0.02&&Math.abs(d.aprov-(g.t-g.g))<0.02);
 ok('DRE mostra resultado e visão medido × executado',await T('Receita líquida')&&await T('Medido × executado × meta'));
 await p.screenshot({path:out+'/dre.png'});
 // permissões
 await role('almox');await nav('fat');ok('almoxarife não gera boletim nem lança caixa',await p.isDisabled('[data-act=bc-novo]')&&await p.isDisabled('[data-act=lan-novo]'));
 await p.reload();await p.waitForSelector('.big');ok('estado persiste no navegador',await p.evaluate(()=>S.t.bcs.length===1&&S.t.fats.length===1&&S.t.recs.length===1&&S.t.lans.length===1));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,4).join(' '));process.exit(1)});
