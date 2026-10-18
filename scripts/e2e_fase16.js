// E2E Fase 16 (demo): contratos, medição de subempreiteiro, projetos, patrimônio (depreciação no Diário) e frota.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());const E=(f,a)=>p.evaluate(f,a);
 const go=async(v,r)=>{await E(([v,r])=>{S.role=r;S.view=v;render()},[v,r]);await p.selectOption('#role',r)};
 // ---- contratos
 await go('ctr','adm');ok('área Contratos e ativos existe (adm vê 3 abas, diretoria 4)',await E(()=>areaDe('ctr').k==='ativos'&&areaDe('ctr').tabs.length===3));
 await p.click('[data-act=ctr-novo]');await p.selectOption('#ct-t','despesa');await p.fill('#ct-n','SUB-01');await p.fill('#ct-v','100000');await p.fill('#ct-p','Empreiteira X');await p.fill('#ct-i','2026-01-01');await p.fill('#ct-f','2026-12-31');await p.fill('#ct-ri','11');await p.click('[data-act=ctr-ok]');
 ok('contrato de despesa criado',await E(()=>S.t.ctrs.length===1&&S.t.ctrs[0].tipo==='despesa'));
 await p.click('[data-act=ctr-novo]');await p.selectOption('#ct-t','despesa');await p.fill('#ct-n','SUB-01');await p.fill('#ct-v','5');await p.fill('#ct-p','Y');await p.click('[data-act=ctr-ok]');ok('número repetido é recusado',await E(()=>S.t.ctrs.length===1));await p.click('[data-act=fechar]');
 await p.click('[data-act=ctr-adt]');await p.fill('#ad-v','20000');await p.fill('#ad-d','30');await p.fill('#ad-x','Aditivo 1');await p.click('[data-act=ctr-adt-ok]');
 ok('aditivo soma valor e prazo (120.000 / fim 30/01/2027)',await E(()=>{const c=S.t.ctrs[0];return ctrVig(c)===120000&&ctrFim(c)==='2027-01-30'}));
 await p.click('[data-act=ctr-anx]');await p.fill('#an-n','Contrato assinado');await p.fill('#an-u','ftp://x');await p.click('[data-act=ctr-anx-ok]');ok('anexo exige link http(s)',await E(()=>S.t.ctrs[0].anexos.length===0));
 await p.fill('#an-u','https://drive.example/x');await p.click('[data-act=ctr-anx-ok]');ok('anexo por link',await E(()=>S.t.ctrs[0].anexos.length===1));
 await go('ctr','engenheiro');await p.click('[data-act=bms-novo]');await p.fill('#bs-v','150000');await p.fill('#bs-x','medição 1');await p.click('[data-act=bms-ok]');
 ok('medição acima do valor vigente é recusada',await E(()=>S.t.ctrs[0].bms.length===0));await p.fill('#bs-v','40000');await p.click('[data-act=bms-ok]');
 ok('medição lançada aguarda aprovação',await E(()=>S.t.ctrs[0].bms[0].status==='lancado'));
 ok('engenheiro não aprova a própria medição',await p.isDisabled('[data-act=bms-apr]'));
 await go('ctr','gerente');await p.click('[data-act=bms-apr]');
 ok('aprovação gera nota rateada ao item, com retenção de 11% (4.400)',await E(()=>{const n=S.t.notas.find(x=>x.ctr);return n&&n.valor===40000&&n.rateio[0].valor===40000&&n.retInss===4400&&n.status==='conferida'&&retencoesNota(n).inss===4400}));
 ok('custo do item sobe 40.000 e saldo a medir cai',await E(()=>{S.X=derive();return S.sd[S.t.notas[0].rateio[0].item].real>=40000&&ctrVig(S.t.ctrs[0])-ctrMedido(S.t.ctrs[0])===80000}));
 await p.click('[data-act=ctr-st][data-s=bloqueado]');await p.fill('#ask-v','inadimplência');await p.click('[data-act=ask-ok]');
 await go('ctr','engenheiro');await p.click('[data-act=bms-novo]');ok('contrato bloqueado não aceita medição',await E(()=>S.t.ctrs[0].bms.length===1));
 // ---- projetos
 await go('prj','engenheiro');await p.click('[data-act=prj-novo]');await p.fill('#pj-n','Executivo UTR');await p.fill('#pj-e','Ana, Bia');await p.click('[data-act=prj-ok]');
 ok('projeto criado com as etapas do modelo',await E(()=>S.t.prjs[0].etapas.length===5&&S.t.prjs[0].etapas[1].ini===addDias(S.t.prjs[0].etapas[0].ini,7)));
 await p.fill('[data-pe="0"]','100');await p.press('[data-pe="0"]','Tab');ok('andamento = média das etapas (20%)',await E(()=>prjPct(S.t.prjs[0])===20));
 await p.click('[data-act=prj-h]');await p.fill('#ph-h','10');await p.click('[data-act=prj-h-ok]');ok('10 h × R$ 120 = custo apropriado 1.200',await E(()=>prjHoras(S.t.prjs[0])*custoHoraPrj()===1200));
 // ---- patrimônio
 await go('pat','adm');await p.click('[data-act=pat-novo]');await p.fill('#pb-c','EQ-1');await p.fill('#pb-d','Escavadeira');await p.fill('#pb-v','120000');await p.fill('#pb-a','2026-01-01');await p.fill('#pb-m','60');await p.fill('#pb-r','0');await p.fill('#pb-n','NF-77');await p.click('[data-act=pat-ok]');
 ok('bem cadastrado',await E(()=>S.t.pats.length===1));
 ok('depreciação mensal 2.000 (120.000 / 60), acumulada = meses decorridos × 2.000',await E(()=>{const b=S.t.pats[0],n=deprecBem(b).length;return n>=10&&deprecAcum(b)===r2(n*2000)&&deprecBem(b)[0].valor===2000}));
 ok('pró-rata no mês de aquisição (bem comprado em 16/01: 16/31 de 2.000)',await E(()=>{const b={...S.t.pats[0],aquisicao:'2026-01-16'};return deprecBem(b)[0].valor===r2(2000*16/31)}));
 ok('depreciação entra no Diário e o balancete fecha',await E(()=>{const a=partidasAuto();return a.some(e=>e.ref.startsWith('pd:'))&&a.some(e=>e.ref==='pa:'+S.t.pats[0].id)&&balancete().D===balancete().C}));
 ok('valor contábil = valor − depreciação; fiscal usa 120 meses (1.000/mês)',await E(()=>{const b=S.t.pats[0];return valorContabil(b)===r2(b.valor-deprecAcum(b))&&deprecBem(b,true)[0].valor===1000}));
 await p.click('[data-act=pat-seg]');await p.fill('#sg-a','AP-1');await p.fill('#sg-v','2020-01-01');await p.click('[data-act=pat-seg-ok]');ok('seguro vencido gera alerta',await T('Seguro vencendo ou vencido'));
 await p.click('[data-act=pat-baixa]');await p.fill('#bx-d2','2026-06-30');await p.fill('#bx-m2','venda');await p.click('[data-act=pat-baixa-ok]');
 ok('baixa interrompe a depreciação em jun/2026 (6 meses = 12.000)',await E(()=>deprecAcum(S.t.pats[0])===12000&&partidasAuto().some(e=>e.ref==='pb:'+S.t.pats[0].id)&&balancete().D===balancete().C));
 // ---- frota
 await go('frt','almox');await p.click('[data-act=frt-novo]');await p.fill('#fv-c','ESC-1');await p.fill('#fv-d','Escavadeira hidráulica');await p.fill('#fv-l','100');await p.fill('#fv-pu','50');await p.click('[data-act=frt-ok]');
 ok('equipamento cadastrado (horímetro)',await E(()=>S.t.frts.length===1&&S.t.frts[0].un==='h'));
 await p.click('[data-act=frt-mv][data-t=abast]');await p.fill('#fm-l','110');await p.fill('#fm-q','200');await p.fill('#fm-v','1200');await p.click('[data-act=frt-mv-ok]');
 await p.click('[data-act=frt-mv][data-t=leitura]');await p.fill('#fm-l','90');await p.click('[data-act=frt-mv-ok]');ok('leitura menor que a anterior é recusada',await E(()=>leituraV(S.t.frts[0].id)===110));await p.fill('#fm-l','160');await p.click('[data-act=frt-mv-ok]');
 ok('custo por hora = 1.200 / (160−100) = R$ 20/h',await E(()=>custoHoraVeic(S.t.frts[0].id)===20));
 ok('preventiva vencida por uso (60 h ≥ 50 h)',await E(()=>!!prevVencida(S.t.frts[0])));
 await p.click('[data-act=frt-mv][data-t=check]');await p.uncheck('.fm-ck >> nth=1');await p.click('[data-act=frt-mv-ok]');
 ok('checklist reprovado abre OS corretiva',await E(()=>S.t.fmvs.some(m=>m.tipo==='os'&&m.sub==='corretiva'&&m.status==='aberta'&&m.desc.includes('Freios'))));
 await p.click('[data-act=os-fecha]');await p.fill('#ask-v','350');await p.click('[data-act=ask-ok]');ok('OS fechada entra no custo (1.550 / 60)',await E(()=>custoUnidade(S.t.frts[0].id).gasto===1550));
 await E(()=>{S.t.frts[0].bem=S.t.pats[0].id;render()});ok('depreciação do bem vinculado soma ao custo/h',await E(()=>custoUnidade(S.t.frts[0].id).dep===12000));
 await E(()=>{S.t.frts[0].bem='';S.role='encarregado';S.view='campo';render();modalApt()});await p.selectOption('#role','encarregado');
 await E(()=>{APT.equip=[{nome:'ESC-1',h:4,rh:0}];APT.qtd='1';lerApt();frotaAplicaRh()});ok('apontamento puxa o R$/h do equipamento da frota',await E(()=>APT.equip[0].rh===custoHoraVeic(S.t.frts[0].id)&&APT.equip[0].rh>0));
 await E(()=>closeModal());
 await go('frt','encarregado');ok('encarregado lança abastecimento mas não cadastra contrato',await E(()=>can('frt')&&!can('ctr')));
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});for(const v of ['ctr','prj','pat','frt']){await E(v=>{S.role='adm';S.view=v;render()},v)}
  ok('sem overflow horizontal a '+w+'px',await E(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
