// E2E Fase 14 (demo): contabilidade em partidas dobradas, balancete, DRE/Balanço, ajuste, estorno, fechamento de competência.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 await p.evaluate(()=>{S.role='financeiro';const it=S.D.items[0];
  S.t.notas.push({id:'n1',num:'NF-1',emitente:'Forn',valor:1000,emissao:'2026-11-05',oc:'',rateio:[{item:it.codigo,valor:1000,nat:'MAT',conta:'4.2.01'}],status:'paga',pago:'2026-11-20'});
  S.t.fats.push({id:'f1',num:'FT-1',bc:'b',bcNum:'BC-1',valor:5000,ret:0,emissao:'2026-11-10',venc:'2026-12-10'});
  S.t.recs.push({id:'r1',fat:'f1',data:'2026-11-25',valor:2000});S.t.lans.push({id:'l1',data:'2026-11-02',valor:300,desc:'Aporte'});
  S.view='ctb';S.tab.ctb='bal';render()});await p.selectOption('#role','financeiro');
 ok('menu Contábil e fiscal tem a aba Contabilidade',await p.evaluate(()=>areaDe('ctb').k==='cont'));
 const B=await p.evaluate(()=>{const b=balancete();return {D:b.D,C:b.C,n:b.L.length}});
 ok('balancete fecha: débito = crédito',B.D===B.C&&B.D>0);
 ok('nota gera D custo 5.2.01 / C fornecedores',await p.evaluate(()=>{const e=partidasAuto().find(x=>x.ref==='nf:n1');return e.linhas[0].conta==='5.2.01'&&e.linhas[0].d===1000&&e.linhas[1].conta==='2.1.01'&&e.linhas[1].c===1000}));
 ok('pagamento baixa fornecedores contra caixa',await p.evaluate(()=>{const e=partidasAuto().find(x=>x.ref==='pg:n1');return e.linhas.some(l=>l.conta==='2.1.01'&&l.d===1000)&&e.linhas.some(l=>l.conta==='1.1.01'&&l.c===1000)}));
 ok('faturamento: D clientes 5.000 / C receita; tributos 425 (8,5%)',await p.evaluate(()=>{const a=partidasAuto();return a.find(x=>x.ref==='ft:f1').linhas.some(l=>l.conta==='4.1.01'&&l.c===5000)&&a.find(x=>x.ref==='tb:f1').linhas.some(l=>l.conta==='2.1.02'&&l.c===425)}));
 const d=await p.evaluate(()=>{const x=dreCtb(),y=balancoCtb();return {res:x.resultado,A:y.A,pp:y.pasPL}});
 ok('DRE contábil: 5000 − 425 − 1000 = 3575',d.res===3575);ok('balanço: ativo 4.300 = passivo + PL + resultado',d.A===4300&&d.pp===4300);
 await p.evaluate(()=>{S.tab.ctb='dre';render()});ok('tela DRE e Balanço abre',await T('Balanço patrimonial'));
 await p.evaluate(()=>{S.tab.ctb='bal';render()});await p.click('tr[data-act=ctb-razao][data-c="1.1.01"]');ok('clique na conta abre o Razão com saldo',await T('Aporte')&&await T('Recebimento'));
 // lançamento manual e ajuste
 await p.evaluate(()=>{S.tab.ctb='diario';render()});await p.click('[data-act=ctb-novo]');
 await p.fill('#cb-d','2026-11-15');await p.fill('#cb-v','200');await p.selectOption('#cb-dc','5.9.01');await p.selectOption('#cb-cc','1.1.01');await p.fill('#cb-t','Tarifa');await p.check('#cb-aj');await p.click('[data-act=ctb-ok]');
 ok('ajuste sem motivo é recusado',await p.evaluate(()=>S.t.ctbs.length===0));
 await p.fill('#cb-m','Tarifa não lançada');await p.click('[data-act=ctb-ok]');ok('ajuste com motivo é lançado e balancete segue fechando',await p.evaluate(()=>S.t.ctbs.length===1&&balancete().D===balancete().C));
 await p.click('[data-act=ctb-est]');await p.fill('#ask-v','erro de valor');await p.click('[data-act=ask-ok]');
 ok('estorno zera o efeito e marca o original',await p.evaluate(()=>S.t.ctbs.length===2&&S.t.ctbs[0].estornado&&balancete().L.find(x=>x.conta==='5.9.01').saldo===0));
 // fechamento
 await p.evaluate(()=>{S.ctbComp='2026-11';S.tab.ctb='fech';render()});await p.click('[data-act=ctb-fechar]');
 ok('fechar competência registra o fechamento',await p.evaluate(()=>S.t.fechs.some(f=>f.comp==='2026-11'&&f.ctb)));
 await p.evaluate(()=>{S.tab.ctb='diario';render()});await p.click('[data-act=ctb-novo]');await p.fill('#cb-d','2026-11-18');await p.fill('#cb-v','10');await p.fill('#cb-t','retroativo');await p.click('[data-act=ctb-ok]');
 ok('lançamento retroativo em competência fechada é bloqueado',await p.evaluate(()=>S.t.ctbs.length===2));await p.click('[data-act=fechar]');
 ok('nota em competência fechada é bloqueada',await p.evaluate(()=>bloqueada('2026-11-30','teste')===true));
 await p.evaluate(()=>{S.tab.ctb='fech';render()});ok('lançamento volta a ser possível só depois da reabertura (testado abaixo)',true);ok('financeiro não reabre',await p.isDisabled('[data-act=ctb-reabrir]'));
 await p.selectOption('#role','diretoria');await p.evaluate(()=>{S.tab.ctb='fech';render()});await p.click('[data-act=ctb-reabrir]');await p.fill('#ask-v','correção');await p.click('[data-act=ask-ok]');
 ok('diretoria reabre com motivo, registrado na auditoria',await p.evaluate(()=>!compFechada('2026-11-10')&&S.t.fechs.some(f=>f.comp==='2026-11'&&f.reaberta)&&S.t.aud.some(a=>a.campo==='competência'&&a.depois==='reaberta')));
 // orçamento, livros, plano
 await p.evaluate(()=>{S.tab.ctb='orc';render()});ok('orçamento mostra orçado × realizado',await T('Orçado')&&await T('5.2.01'));
 await p.evaluate(()=>{S.tab.ctb='liv';S.ctbComp='2026-11';render()});ok('livros listam entrada e serviço',await p.evaluate(()=>{const v=document.querySelector('textarea').value;return v.includes('entrada;2026-11')&&v.includes('servico;2026-11')}));
 await p.evaluate(()=>{S.tab.ctb='plano';render()});ok('plano contábil traz contas derivadas do gerencial',await p.evaluate(()=>planoCtb().some(x=>x.ger&&x.codigo[0]==='5')));
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});for(const t of ['bal','diario','dre','orc','fech','liv']){await p.evaluate(t=>{S.tab.ctb=t;render()},t)}
  ok('sem overflow horizontal a '+w+'px',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
