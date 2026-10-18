// E2E Fase 15 (demo): compras (cotação colada, sugestão, devolução, ocorrência) e estoque do canteiro.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 const E=f=>p.evaluate(f);
 await E(()=>{S.role='almox';S.t.inss.push({id:'i1',cod:'TB',desc:'Tubo PVC',un:'M',natureza:'MAT',conta:'4.2.01',unAlt:[{un:'BR',fator:6}],estMin:50,estMax:200,ativo:true});
  S.view='est';render()});await p.selectOption('#role','almox');
 ok('aba Estoque existe na área Suprimentos',await E(()=>areaDe('est').k==='sup'));
 // entrada avulsa 10@5 e 10@7 -> custo médio 6
 for(const [q,c] of [[10,5],[10,7]]){await p.click('[data-act=mv-novo][data-t=ent]');await p.fill('#mv-q','');await p.fill('#mv-q',String(q));await p.fill('#mv-c',String(c));await p.click('[data-act=mv-ok]')}
 ok('custo médio ponderado 10@5 + 10@7 = 6',await E(()=>cmIns('TB')===6&&saldoIns('TB')===20));
 // saída por item
 await p.click('[data-act=mv-novo][data-t=sai]');await p.fill('#mv-q','25');await p.click('[data-act=mv-ok]');
 ok('saída maior que o saldo é recusada',await E(()=>saldoIns('TB')===20));
 await p.fill('#mv-q','8');await p.fill('#mv-f','Rede A');await p.click('[data-act=mv-ok]');
 ok('saída de 8 baixa o saldo e apropria ao item ao custo médio',await E(()=>saldoIns('TB')===12&&S.t.ests.find(m=>m.tipo==='sai').cu===6&&S.t.ests.find(m=>m.tipo==='sai').item));
 ok('kardex fecha com o saldo',await E(()=>{const k=kardex('TB');return k[k.length-1].q===saldoIns('TB')&&k.length===3}));
 await p.click('[data-act=kdx]');ok('kardex abre',await T('Kardex'));await p.click('[data-act=fechar]');
 // ajuste exige motivo
 await p.click('[data-act=mv-novo][data-t=ajuste]');await p.fill('#mv-q','2');await p.selectOption('#mv-s','-1');await p.click('[data-act=mv-ok]');
 ok('ajuste sem motivo é recusado',await E(()=>saldoIns('TB')===12));await p.fill('#mv-m','quebra');await p.click('[data-act=mv-ok]');ok('ajuste com motivo',await E(()=>saldoIns('TB')===10));
 // transferência e recebimento
 await p.click('[data-act=mv-novo][data-t=transf]');await p.fill('#mv-q','4');await p.fill('#mv-d','343');await p.click('[data-act=mv-ok]');
 ok('transferência baixa o saldo e gera código',await E(()=>saldoIns('TB')===6&&!!S.codeTransf));
 const code=await E(()=>S.codeTransf);await E(()=>{S.t.ests=S.t.ests.filter(m=>m.tipo!=='transf')});
 await p.click('[data-act=transf-rec]');await p.fill('#tr-c',code);await p.click('[data-act=transf-ok]');
 ok('obra de destino recebe 4 ao custo médio de origem',await E(()=>{const m=S.t.ests.find(x=>x.codeTr);return m&&m.qtd===4&&m.cu===6}));
 await p.click('[data-act=transf-rec]');await p.fill('#tr-c',code);await p.click('[data-act=transf-ok]');ok('o mesmo código não entra duas vezes',await E(()=>S.t.ests.filter(x=>x.codeTr).length===1));await p.click('[data-act=fechar]');
 // mín/máx
 await E(()=>{S.tab.est='nec';render()});ok('abaixo do mínimo (saldo 14 < 50) sugere até o máximo (186)',await E(()=>{const m=minMax()[0];return m&&m.saldo===14&&m.sug===186})&&await T('Por mínimo e máximo'));
 await p.selectOption('#role','engenheiro');await p.click('[data-act=mm-sol]');ok('Solicitar abre a solicitação com o insumo',await E(()=>$('#s-ins').value==='TB'&&$('#s-qtd').value==='186'));await p.selectOption('#role','almox');await p.click('[data-act=fechar]');
 // inventário
 await E(()=>{S.view='est';S.tab.est='inv';render()});await p.click('[data-act=inv-novo]');await p.fill('#inv-csv','TB;7');await p.click('[data-act=inv-csv]');
 ok('coletor CSV importa a contagem',await E(()=>invAb().linhas[0].contado===7));
 await p.click('[data-act=inv-fechar]');ok('inventário fechado gera ajuste de −7 e saldo = 7',await E(()=>saldoIns('TB')===7&&S.t.invs[0].status==='fechado'&&S.t.ests.some(m=>m.motivo&&m.motivo.startsWith('Inventário'))));
 // validade
 await E(()=>{novoMov({tipo:'ent',ins:'TB',qtd:1,cu:6,validade:'2000-01-01',lote:'L1'});render()});ok('validade vencida entra no alerta de 30 dias',await E(()=>vencendo().length===1));
 // compras: cotação colada e sugestão, recebimento com unidade BR, devolução, ocorrência
 await E(()=>{S.role='engenheiro';const it=S.D.items[0];S.t.sols.push({id:'sx',num:'SC-9',item:it.codigo,nat:'MAT',conta:'4.2.01',desc:'Tubo',ins:'TB',qtd:100,preco:10,status:'enviada',sem:'verde',cots:[],criado:hojeISO(),solicitante:'x'});S.view='compras';S.tab.compras='sols';render();modalMapa('sx')});
 await p.fill('#c-csv','Forn A;11,50;10 dias\nForn B;9,80;15 dias\nForn C;9,80;7 dias\nlinha ruim');await p.click('[data-act=cot-colar]');
 ok('3 propostas coladas, linha ruim ignorada',await E(()=>S.t.sols.find(s=>s.id==='sx').cots.length===3));
 await p.click('[data-act=cot-sug]');ok('sugestão: menor preço, desempate por prazo (Forn C)',await E(()=>S.t.sols.find(s=>s.id==='sx').escolhida===2));await p.click('[data-act=fechar]');
 await E(()=>{const it=S.D.items[0];S.t.ocs.push({id:'ox',num:'OC-9',sol:'sx',item:it.codigo,nat:'MAT',conta:'4.2.01',forn:'Forn C',ins:'TB',qtd:100,preco:9.8,valor:980,sem:'verde',status:'aprovada',recebido:0,criado:hojeISO(),solicitante:'x'});S.role='almox';S.tab.compras='ocs';render()});
 await p.selectOption('#role','almox');await p.click('[data-act=receber][data-id=ox]');await p.fill('#rc-q','10');await p.selectOption('#rc-u','BR');await p.click('[data-act=rc-ok]');
 ok('receber 10 BR entra 60 m ao custo 9,8/6',await E(()=>{const m=S.t.ests.find(x=>x.oc==='ox');return m&&m.qtd===60&&Math.abs(m.cu-9.8/6)<1e-9}));
 await p.click('[data-act=oc-dev][data-id=ox]');await p.fill('#dv-q','5');await p.click('[data-act=oc-dev-ok]');ok('devolução exige motivo',await E(()=>!S.t.ocs.find(o=>o.id==='ox').devolvido));
 await p.fill('#dv-m','avaria');await p.click('[data-act=oc-dev-ok]');ok('devolução baixa o estoque e registra crédito',await E(()=>{const o=S.t.ocs.find(o=>o.id==='ox');return o.devolvido===5&&S.t.ests.some(m=>m.tipo==='dev'&&m.qtd===5)&&o.ocorr.some(x=>x.tipo==='Devolução'&&x.texto.includes('49'))}));
 await p.click('[data-act=oc-ocor][data-id=ox]');await p.fill('#oo-x','chegou 2 dias atrasado');await p.click('[data-act=oc-ocor-ok]');ok('ocorrência registrada',await E(()=>S.t.ocs.find(o=>o.id==='ox').ocorr.length===2));
 await E(()=>{S.t.ests.push({id:'cx',tipo:'sai',ins:'TB',qtd:1,cu:6,item:S.D.items[0].codigo,data:hojeISO(),local:'Almoxarifado'});S.role='financeiro';S.view='pain';S.tab.pain='contrato';render()});ok('painel mostra consumo apropriado × meta',await T('Consumo de material apropriado'));
 await E(()=>{S.role='engenheiro';S.view='est';S.tab.est='saldo';render()});await p.selectOption('#role','engenheiro');ok('engenheiro não faz inventário',await E(()=>!can('inventario')));
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});for(const t of ['saldo','mov','inv','nec']){await E(t=>{S.view='est';S.tab.est=t;render()},t)}
  ok('sem overflow horizontal a '+w+'px',await E(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
