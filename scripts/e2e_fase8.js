// E2E Fase 8 (demo): apontamento -> conferência -> aprovação -> % físico/VA; Lean (restrição, lookahead, PPC, tarefas).
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('dialog',d=>d.accept(d.type()==='prompt'?'2099-01-01':undefined));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const role=r=>p.selectOption('#role',r),nav=v=>p.click(`#nav button[data-v=${v}]`),T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 const cod=await p.evaluate(()=>{const i=S.D.items.find(i=>i.hh_unit&&i.qtd>=10&&i.meta_unit);return i.codigo});
 // --- Campo ---
 await role('encarregado');await nav('campo');
 ok('encarregado vê o botão Novo apontamento habilitado',!(await p.isDisabled('[data-act=novo-apt]')));
 await p.click('[data-act=novo-apt]');await p.selectOption('#a-item',cod);await p.fill('#a-q','5');
 await p.click('[data-act=apt-addp]');await p.click('[data-act=apt-adde]');
 await p.fill('[data-ek="0"][data-f=nome]','Retroescavadeira');await p.fill('#a-ch','3');
 await p.click('[data-act=apt-ok]');
 ok('apontamento salvo como rascunho',await T('AP-0001')&&await T('Rascunho'));
 const f0=await p.evaluate(c=>resItem(S.byCod[c]).fis,cod);ok('rascunho não vira % físico',f0===0);
 await p.click('[data-act=apt-conf]');ok('conferido',await T('Conferido'));
 ok('encarregado não aprova',await p.isDisabled('[data-act=apt-apr]'));
 await role('engenheiro');await nav('campo');await p.click('[data-act=apt-apr]');
 ok('aprovado pelo engenheiro (quem lança não aprova, outro papel aprova)',await T('Aprovado'));
 const r=await p.evaluate(c=>{const i=S.byCod[c],x=resItem(i);return {fis:x.fis,va:x.va,qtd:i.qtd,mu:i.meta_unit,hh:aptCalc(S.t.apts[0]).hh,cmo:aptCalc(S.t.apts[0]).cmo}},cod);
 ok('% físico = 5/qtd e VA = % × meta',Math.abs(r.fis-5/r.qtd)<1e-9&&Math.abs(r.va-5/r.qtd*(r.mu*r.qtd))<0.01);
 ok('HH real 8 + 8 e custo de MO > 0',r.hh===16&&r.cmo>0);
 await p.click('.tabs button[data-t=prod]');ok('produção por item mostra o item',await T(cod));
 await nav('pain');await p.click('.tabs button[data-t=prod]');ok('painel Produção por frente',await T('Valor agregado'));
 await p.screenshot({path:out+'/campo.png'});
 // --- Lean ---
 await nav('lean');
 await p.click('[data-act=nova-rst]');await p.selectOption('#r-item',cod);await p.fill('#r-desc','Tubo FoFo não entregue');await p.fill('#r-dono','Compras');await p.fill('#r-val','50000');await p.click('[data-act=rst-salvar]');
 ok('restrição criada',await T('Tubo FoFo não entregue'));
 await p.click('.tabs button[data-t=look]');await p.click('[data-act=nova-atv]');await p.selectOption('#v-item',cod);await p.fill('#v-desc','Assentar trecho 1');await p.click('[data-act=atv-salvar]');
 ok('atividade com restrição aberta fica bloqueada',await T('Com restrição')&&await p.isDisabled('[data-act=atv-ok]'));
 await p.click('.tabs button[data-t=restr]');await p.click('[data-act=rst-ok]');
 await p.click('.tabs button[data-t=look]');ok('resolvida a restrição, atividade fica Pronta',await T('Pronta')&&!(await p.isDisabled('[data-act=atv-ok]')));
 await p.click('[data-act=atv-ok]');
 await p.click('[data-act=nova-atv]');await p.fill('#v-desc','Concretar laje');await p.click('[data-act=atv-salvar]');
 await p.click('[data-act=atv-no]');await p.selectOption('#v-causa','Chuva');await p.click('[data-act=atv-no-ok]');
 await p.click('.tabs button[data-t=ppc]');ok('PPC 50% com Pareto de causas',await T('50%')&&await T('Chuva'));
 // limite de 8 restrições por dono
 for(let k=0;k<8;k++){await p.click('[data-act=nova-rst]');await p.fill('#r-desc','R'+k);await p.fill('#r-dono','Fulano');await p.click('[data-act=rst-salvar]')}
 const n=await p.evaluate(()=>S.t.rsts.filter(r=>r.dono==='Fulano').length);ok('limite de 8 abertas por dono',n===8);
 await p.click('[data-act=nova-rst]');await p.fill('#r-desc','9a');await p.fill('#r-dono','Fulano');await p.click('[data-act=rst-salvar]');
 ok('9ª restrição do mesmo dono é recusada',(await p.evaluate(()=>S.t.rsts.filter(r=>r.dono==='Fulano').length))===8);
 await p.click('[data-act=fechar]');
 await p.click('[data-act=nova-tar]');await p.fill('#t-oque','Cobrar entrega do tubo');await p.fill('#t-quem','Compras');await p.click('[data-act=tar-salvar]');
 await p.click('[data-act=tar-mv]');ok('tarefa vai para Fazendo',(await p.innerText('.cols')).includes('Fazendo · 1'));
 await p.click('.tabs button[data-t=pauta]');await p.screenshot({path:out+'/lean.png'});
 ok('pauta de segunda renderiza',await T('Compromissos da semana'));
 // persistência demo
 await p.reload();await p.waitForSelector('.big');
 ok('estado persiste (apontamentos e restrições)',await p.evaluate(()=>S.t.apts.length===1&&S.t.rsts.length>=9&&S.t.tars.length===1));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,4).join(' '));process.exit(1)});
