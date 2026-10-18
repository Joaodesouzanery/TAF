// Mede o tempo de render() de cada tela com massa de dados. Uso: node scripts/perf.js [N] [--budget=ms]
const {chromium}=require('playwright');
const N=+(process.argv[2]||1000),BUD=+((process.argv.find(a=>a.startsWith('--budget='))||'--budget=0').split('=')[1]);
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1400,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 await p.evaluate(N=>{S.role='admin';const it=S.D.items,h=hojeISO();let id=0;const rnd=k=>Math.floor(Math.random()*k);
  S.t.inss.push(...Array.from({length:60},(_,k)=>({id:'in'+k,cod:'I'+k,desc:'Insumo '+k,un:'UN',natureza:'MAT',conta:'4.2.01',unAlt:[],estMin:10,estMax:100,ativo:true})));
  S.t.cols.push(...Array.from({length:80},(_,k)=>({id:'cl'+k,nome:'Colab '+k,cpf:String(k),funcao:S.D.banco_mo[k%S.D.banco_mo.length].funcao,grupo:k%4?'Produção':'Administrativo',vinculo:'CLT',admissao:'2026-01-01',ativo:true})));
  for(let i=0;i<N;i++){const dia=addDias(h,-rnd(200)),i1=it[rnd(it.length)].codigo,v=100+rnd(5000);
   S.t.notas.push({id:'n'+i,num:'NF-'+i,emitente:'Forn '+rnd(40),valor:v,emissao:dia,oc:'',rateio:[{item:i1,valor:v,nat:'MAT',conta:'4.2.01'}],status:i%3?'paga':'conferida',pago:dia});
   S.t.titulos.push({id:'t'+i,oc:'o'+i,ocNum:'OC-'+i,forn:'Forn '+rnd(40),valor:v,venc:addDias(h,rnd(120)-60)});
   S.t.ests.push({id:'e'+i,tipo:i%4?'ent':'sai',ins:'I'+rnd(60),qtd:1+rnd(20),cu:5+rnd(10),data:dia,local:'Almoxarifado',item:i1});
   S.t.ptos.push({id:'p'+i,col:'cl'+rnd(80),data:dia,sit:['presente','presente','presente','falta','folga'][rnd(5)],hn:8,he:0,hc:0,item:i1});
   S.t.sols.push({id:'s'+i,num:'SC-'+i,item:i1,desc:'x',qtd:1,preco:10,status:'enviada',cots:[],criado:dia,nat:'MAT',conta:'4.2.01',solicitante:'x'});
   if(i%5===0)S.t.fats.push({id:'f'+i,num:'FT-'+i,bc:'b',bcNum:'B',valor:1000+rnd(9000),ret:0,emissao:dia,venc:addDias(dia,30)});
   if(i%7===0)S.t.lfxs.push({id:'l'+i,tipo:'gasto',numero:String(i),forn:'F',desc:'d',venc:dia,valor:50+rnd(500),pago:''})}
  S.t.ptos=S.t.ptos.filter((x,k,a)=>a.findIndex(y=>y.col===x.col&&y.data===x.data)===k);
 },N);
 const R=await p.evaluate(()=>{const out=[];const views=areasVisiveis().flatMap(a=>a.tabs.map(t=>t[0]));const tabs={pain:['contrato','compras','obra','dre','prod','lean','carteira','conf','imp'],ctb:['bal','diario','razao','dre','orc','fech','liv'],est:['saldo','mov','inv','nec'],pes:['col','pto','rh','custo'],fin:['tit','conc','contas','cobr','apur','fech'],fat:['bc','nf','caixa'],compras:['sols','ocs','aprov']};
  for(const v of views){const sub=tabs[v]||[null];for(const s of sub){S.view=v;S.tab={};if(s){const k={pain:'pain',ctb:'ctb',est:'est',pes:'pes',fin:'fin',fat:'fat',compras:'compras'}[v];S.tab[k]=s}
   const t0=performance.now();try{render()}catch(e){out.push([v+(s?':'+s:''),-1,String(e.message)]);continue}out.push([v+(s?':'+s:''),Math.round(performance.now()-t0)])}}return out});
 R.sort((a,b)=>b[1]-a[1]);console.log('N='+N);R.slice(0,12).forEach(r=>console.log(String(r[1]).padStart(6)+' ms  '+r[0]+(r[2]?'  ERRO '+r[2]:'')));
 const lento=R.filter(r=>BUD&&(r[1]>BUD||r[1]<0));console.log('erros JS:',JSON.stringify(errs));if(lento.length){console.log('ACIMA DO ORÇAMENTO ('+BUD+' ms):',lento.map(r=>r[0]+' '+r[1]).join(', '));process.exit(1)}
 await b.close();
})().catch(e=>{console.log('ERRO',e.message);process.exit(1)});
