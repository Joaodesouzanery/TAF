// E2E Fase 17 (demo): Pessoas (ponto, RH, SST), Dashboard/BI do Início e Administração.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());const E=(f,a)=>p.evaluate(f,a);
 const go=async(v,r)=>{await E(([v,r])=>{S.role=r;S.view=v;render()},[v,r]);await p.selectOption('#role',r)};
 ok('Início abre no Dashboard',await E(()=>S.view==='dash'&&areaDe('dash').k==='inicio')&&await T('Contrato × custos × lucro'));
 // ---- colaboradores
 await go('pes','adm');await p.click('[data-act=col-novo]');await p.fill('#cl-n','Ana');await p.fill('#cl-c','52998224726');await p.selectOption('#cl-f','Armador');await p.click('[data-act=col-ok]');
 ok('CPF inválido é recusado',await E(()=>S.t.cols.length===0));
 await p.fill('#cl-c','529.982.247-25');await p.click('[data-act=col-ok]');
 await p.click('[data-act=col-novo]');await p.fill('#cl-n','Bia');await p.fill('#cl-c','11144477735');await p.selectOption('#cl-f','Auxiliar de escritório');await p.selectOption('#cl-g','Administrativo');await p.click('[data-act=col-ok]');
 await p.click('[data-act=col-novo]');await p.fill('#cl-n','Clara');await p.fill('#cl-c','52998224725');await p.click('[data-act=col-ok]');ok('CPF repetido é recusado',await E(()=>S.t.cols.length===2));await p.click('[data-act=fechar]');
 const ids=await E(()=>S.t.cols.map(c=>c.id));
 // ---- SST e bloqueio de ponto
 const r0=await E(()=>{const it=S.D.items[0].codigo,h=hojeISO();return pontoGrava({col:S.t.cols[0].id,data:addDias(h,-10),sit:'presente',hn:8,he:0,hc:0,item:it})});
 ok('ponto sem ASO é bloqueado',/ASO ausente/.test(r0));
 await E(()=>{const h=hojeISO();S.t.ssts.push({id:'s1',col:S.t.cols[0].id,tipo:'ASO',emissao:'2000-01-01',validade:addDias(h,365)},{id:'s2',col:S.t.cols[1].id,tipo:'ASO',emissao:'2000-01-01',validade:addDias(h,365)},{id:'s3',col:S.t.cols[0].id,tipo:'NR-35',emissao:'2000-01-01',validade:addDias(h,10)})});
 ok('com ASO válido o ponto é aceito',await E(()=>{const it=S.D.items[0].codigo,h=hojeISO();return pontoGrava({col:S.t.cols[0].id,data:addDias(h,-10),sit:'presente',hn:8,he:2,hc:0,item:it})===''}));
 ok('duplicar colaborador+dia+frente é recusado',await E(()=>{const it=S.D.items[0].codigo,h=hojeISO();return /Já existe/.test(pontoGrava({col:S.t.cols[0].id,data:addDias(h,-10),sit:'presente',hn:4,he:0,hc:0,item:it}))}));
 ok('mais de 24 h e data futura são recusadas',await E(()=>{const it=S.D.items[0].codigo,h=hojeISO(),c=S.t.cols[1].id;return /24/.test(pontoGrava({col:c,data:addDias(h,-9),sit:'presente',hn:20,he:5,hc:0,item:it}))&&/futura/.test(pontoGrava({col:c,data:addDias(h,3),sit:'presente',hn:8,he:0,hc:0,item:it}))}));
 ok('presente com horas exige a frente',await E(()=>/frente/.test(pontoGrava({col:S.t.cols[1].id,data:addDias(hojeISO(),-9),sit:'presente',hn:8,he:0,hc:0,item:''}))));
 await E(()=>{const h=hojeISO();S.t.ssts.push({id:'s4',col:S.t.cols[1].id,tipo:'ASO',emissao:'2000-01-01',validade:addDias(h,-1)});S.t.ssts=S.t.ssts.filter(x=>x.id!=='s2')});
 ok('ASO vencido bloqueia o ponto',await E(()=>/ASO vencido/.test(pontoGrava({col:S.t.cols[1].id,data:hojeISO(),sit:'presente',hn:8,he:0,hc:0,item:S.D.items[0].codigo}))));
 ok('SST vencendo em 30 dias aparece nos alertas',await E(()=>alertas(derive()).some(a=>a[1].includes('NR-35')&&a[1].includes('30 dias'))));
 await E(()=>{S.t.ssts=S.t.ssts.filter(x=>x.id!=='s4');S.t.ssts.push({id:'s2',col:S.t.cols[1].id,tipo:'ASO',emissao:'2000-01-01',validade:addDias(hojeISO(),365)})});
 // ---- custo e banco de horas
 ok('custo de pessoal = 8×24,64 + 2×24,64×1,5 = 271,04',await E(()=>custoPessoal().tot===271.04));
 ok('banco de horas = 2 h; compensar 3 h é recusado',await E(()=>{const id=S.t.cols[0].id;return bancoHoras(id)===2}));
 await go('pes','adm');await E(()=>{S.tab.pes='pto';render()});await p.click('[data-act=pto-comp]');await p.fill('#pc-h','3');await p.click('[data-act=pto-comp-ok]');ok('compensação acima do saldo recusada',await E(()=>bancoHoras(S.t.cols[0].id)===2));
 await p.fill('#pc-h','1');await p.fill('#pc-d','');await E(()=>{$('#pc-d').value=addDias(hojeISO(),-1)});await p.click('[data-act=pto-comp-ok]');ok('compensação de 1 h reduz o saldo para 1',await E(()=>bancoHoras(S.t.cols[0].id)===1));
 // ---- indicadores de RH (cenário à mão)
 await E(()=>{const h=hojeISO(),mes=mesDe(addDias(h,-60)),d=n=>mes+'-0'+n,it=S.D.items[0].codigo,a=S.t.cols[0].id,b2=S.t.cols[1].id,g=(c,n,sit)=>pontoGrava({col:c,data:d(n),sit,hn:sit==='presente'?8:0,he:0,hc:0,item:sit==='presente'?it:''});
  g(a,1,'presente');g(a,2,'presente');g(a,3,'presente');g(a,4,'falta');g(a,5,'folga');g(b2,1,'presente');g(b2,2,'presente');g(b2,3,'atestado');g(b2,4,'ferias');window.__mes=mes});
 const R=await E(()=>{const r=rhCalc(S.D.obra.codigo,new Set([window.__mes]));return {n:r.n,pres:r.conta.presente,abs:r.abs,freq:r.freq,f:r.M[0].faltas,at:r.M[0].ativos,rz:r.M[0].razao,ef:r.efet.reduce((s,e)=>s+e.adm+e.prod,0),tot:r.totAtivos,pct:Object.values(r.conta).reduce((s,v)=>s+v,0)/r.n}});
 ok('9 registros, 5 presentes',R.n===9&&R.pres===5);ok('absenteísmo = (1 falta + 1 atestado) ÷ (9 − 1 folga − 1 férias) = 28,57%',Math.abs(R.abs-2/7)<1e-9);ok('frequência + absenteísmo = 100%',Math.abs(R.freq+R.abs-1)<1e-9);
 ok('faltas por funcionário = 1 ÷ 2 ativos',R.f===1&&R.at===2&&R.rz===.5);ok('efetivo por cargo soma o total (2) e situações somam 100%',R.ef===2&&R.tot===2&&Math.abs(R.pct-1)<1e-9);
 await E(()=>{S.tab.pes='rh';S.rhMeses=new Set([window.__mes]);render()});ok('tela de indicadores de RH mostra frequência, absenteísmo e faltas por funcionário',await T('Frequência média')&&await T('Absenteísmo médio')&&await T('Faltas por funcionário')&&await T('Efetivo por cargo'));
 // ---- puxar do ponto no Campo
 await E(()=>{S.role='encarregado';S.view='campo';render();modalApt();APT.data=window.__mes+'-01';APT.item=S.D.items[0].codigo;pintaApt()});await p.selectOption('#role','encarregado');await p.click('[data-act=apt-ponto]');
 ok('"Puxar do ponto" preenche a equipe por função (2 funções, 8 h)',await E(()=>APT.pessoas.length===2&&APT.pessoas.every(x=>x.n===1&&x.h===8)));await E(()=>closeModal());
 // ---- Dashboard
 await E(()=>{S.role='diretoria';S.view='dash';S.rhMeses=new Set();render()});await p.selectOption('#role','diretoria');
 for(const s of ['Contrato × custos × lucro','Curva S','Fluxo de caixa mensal','Custo por natureza','Maiores desvios','Funil de compras','Pessoas: frequência','Pendências']) ok('Dashboard tem a seção "'+s+'"',await T(s));
 await E(()=>{S.t.par.bi={cards:['contrato','absenteismo'],meta:{contrato:3000000,absenteismo:.5},secoes:{},periodo:'all'};render()});
 ok('cartão com meta: contrato 3,26 mi ≥ 3,0 mi = na meta; absenteísmo 28,6% ≤ 50% = na meta',await E(()=>indSem('contrato',3257970.74)==='ok'&&indSem('absenteismo',.2857)==='ok')&&await T('na meta'));
 ok('fora da meta: contrato 3,26 mi com meta 4 mi = fora (< 90%)',await E(()=>{S.t.par.bi.meta.contrato=4000000;return indSem('contrato',3257970.74)==='bad'}));
 await p.click('[data-act=dash-cfg]');await p.uncheck('.dc-s[value=funil]');await p.click('[data-act=dash-ok]');ok('desligar a seção Funil a remove do Dashboard',!(await T('Funil de compras')));
 await E(()=>{S.t.par.bi.secoes={};S.t.sols.push({id:'sa',num:'SC-A',item:S.D.items[0].codigo,qtd:1,preco:1,status:'enviada',cots:[],criado:'2020-01-01'},{id:'sb',num:'SC-B',item:S.D.items[0].codigo,qtd:1,preco:1,status:'enviada',cots:[],criado:hojeISO()});S.t.par.bi.periodo='all';render()});
 const f1=await E(()=>dashFunil(mesesPeriodo()));await E(()=>{S.t.par.bi.periodo='mes';render()});const f2=await E(()=>dashFunil(mesesPeriodo()));
 ok('filtro de período muda o funil (2 solicitações → 1 no mês atual)',/Solicitações<\/span>[\s\S]*?>2 ·/.test(f1)&&/Solicitações<\/span>[\s\S]*?>1 ·/.test(f2));
 // ---- painel dinâmico
 await go('bi','diretoria');await p.selectOption('#bi-f','ponto');await p.selectOption('#bi-d','colaborador');await p.selectOption('#bi-m','horas');
 ok('painel dinâmico: soma por colaborador = total de horas do ponto',await E(()=>{const t=pivot('ponto','colaborador','horas').reduce((s,x)=>s+x[1],0);return t===r2(S.t.ptos.reduce((s,x)=>s+(x.hn||0)+(x.he||0),0))&&t>0}));
 // ---- administração
 await E(()=>{S.t.ctrs.push({id:'cz',tipo:'despesa',num:'S-1',parte:'Emp',valor:500000,ini:'2026-01-01',fim:'2027-12-31',status:'ativo',aditivos:[],anexos:[],bms:[{id:'bz',n:1,data:hojeISO(),valor:10000,item:S.D.items[0].codigo,desc:'x',status:'lancado'}],retPct:11});S.role='engenheiro';render()});await p.selectOption('#role','engenheiro');
 ok('engenheiro não aprova medição de subempreiteiro',await E(()=>!can('aprovaSub')));
 const nome=await E(()=>user());
 await E(n=>{const h=hojeISO();S.t.par.adm={grupos:[],acessos:[],horario:null,suplentes:[{id:'su',nome:n,papel:'gerente',ini:addDias(h,-1),fim:addDias(h,1)}]}},nome);
 ok('suplente nomeado para o período aprova',await E(()=>can('aprovaSub')));
 await E(n=>{const h=hojeISO();S.t.par.adm.suplentes[0].ini=addDias(h,-5);S.t.par.adm.suplentes[0].fim=addDias(h,-2)},nome);ok('fora da vigência não aprova',await E(()=>!can('aprovaSub')));
 await E(n=>{const h=hojeISO();S.t.par.adm.acessos=[{id:'ac',nome:n,papel:'diretoria',ini:h,fim:h}]},nome);ok('acesso temporário concede o papel durante a vigência',await E(()=>isRole('diretoria')));
 await E(()=>{S.t.par.adm.acessos=[];S.t.par.adm.horario={ini:'23:59',fim:'23:59',papeis:['engenheiro']}});ok('fora do horário o papel só consulta',await E(()=>!can('solicitar')&&horarioBloqueado()));
 ok('administrador não é afetado pelo horário',await E(()=>{S.role='admin';const r=can('solicitar');S.role='engenheiro';return r}));
 await E(()=>{S.t.par.adm.horario=null});
 await E(()=>{S.t.par.alcadaEv={ajuste_ctb:1000,medicao_sub:5000};S.role='adm'});
 ok('alçada por evento: ajuste de 5.000 só a Diretoria; 500 passa',await E(()=>{const a=alcadaOk('ajuste_ctb',5000);const b=alcadaOk('ajuste_ctb',500);S.role='diretoria';const c=alcadaOk('ajuste_ctb',5000);return !a&&b&&c}));
 await E(()=>{S.role='gerente'});await go('ctr','gerente');await p.click('[data-act=bms-apr]');ok('medição de 10.000 acima da alçada (5.000) não é aprovada pelo Gerente',await E(()=>S.t.ctrs.find(c=>c.id==='cz').bms[0].status==='lancado'));
 await E(()=>{S.t.par.alcadaEv.medicao_sub=0});await p.click('[data-act=bms-apr]');ok('sem limite o Gerente aprova',await E(()=>S.t.ctrs.find(c=>c.id==='cz').bms[0].status==='aprovado'));
 // auditoria
 await go('aud','diretoria');await E(()=>{S.audF={ent:'ponto'};render()});ok('auditoria filtra por entidade',await E(()=>audFiltro().every(a=>a.ent==='ponto')&&audFiltro().length>0&&audFiltro().length<S.t.aud.length));await E(()=>{S.audF={}});
 // backup
 await go('admin','diretoria');ok('backup traz o sistema e os dados da obra',await E(()=>{const j=JSON.parse(backupJson());return j.sistema==='TAF Admin'&&j.obra==='342'&&j.dados.cols.length===2}));
 await E(()=>{window.__bk=backupJson();S.t.cols.push({id:'x',nome:'Extra',cpf:'0',funcao:'',grupo:'Produção'});render()});await p.fill('#bk-txt',await E(()=>window.__bk));await p.click('[data-act=bk-rest]');await p.fill('#ask-v','errado');await p.click('[data-act=ask-ok]');
 ok('restaurar exige digitar RESTAURAR',await E(()=>S.t.cols.length===3));await p.click('[data-act=bk-rest]');await p.fill('#ask-v','RESTAURAR');await p.click('[data-act=ask-ok]');ok('backup restaurado',await E(()=>S.t.cols.length===2));
 // fluxos
 await go('fluxo','engenheiro');await p.click('[data-act=fl-novo][data-f=admissao]');ok('fluxo de admissão gera 4 tarefas com SLA',await E(()=>S.t.tars.filter(t=>t.fluxo==='admissao').length===4&&S.t.tars.every(t=>!t.fluxo||t.sla>0)));
 await E(()=>{S.t.tars.find(t=>t.fluxo).quando=addDias(hojeISO(),-2);render()});ok('tarefa vencida aparece como atrasada',await T('atrasada'));
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});for(const v of ['dash','pes','sst','bi','admin','fluxo','aud']){await E(v=>{S.role='diretoria';S.view=v;S.tab.pes='rh';render()},v)}
  ok('sem overflow horizontal a '+w+'px',await E(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
