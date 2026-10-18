// E2E Fase 18 (demo): varredura telas × papéis × temas × larguras, invariantes de dados, acessibilidade e contraste AA.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c,d)=>res.push((c?'OK   ':'FALHA ')+n+(c||!d?'':' · '+d));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const E=(f,a)=>p.evaluate(f,a);
 // cenário completo mínimo, montado direto nos dados
 await E(()=>{S.role='admin';const it=S.D.items,h=hojeISO(),i0=it[0].codigo,i1=it[1].codigo;
  S.t.inss.push({id:'in1',cod:'TB',desc:'Tubo',un:'M',natureza:'MAT',conta:'4.2.01',unAlt:[{un:'BR',fator:6}],estMin:50,estMax:200,ativo:true});
  S.t.ests.push({id:'e1',tipo:'ent',ins:'TB',qtd:10,cu:5,data:addDias(h,-30),local:'Almoxarifado'},{id:'e2',tipo:'ent',ins:'TB',qtd:10,cu:7,data:addDias(h,-20),local:'Almoxarifado'},{id:'e3',tipo:'sai',ins:'TB',qtd:8,cu:6,data:addDias(h,-10),local:'Almoxarifado',item:i0});
  S.t.notas.push({id:'n1',num:'NF-1',emitente:'A',valor:1000,emissao:addDias(h,-25),oc:'',rateio:[{item:i0,valor:600,nat:'MAT',conta:'4.2.01'},{item:i1,valor:400,nat:'TER',conta:'4.4.01'}],status:'paga',pago:addDias(h,-5)},{id:'n2',num:'NF-2',emitente:'B',valor:500,emissao:addDias(h,-3),oc:'',rateio:[{item:i0,valor:500,nat:'ADM',conta:'4.5.01'}],status:'conferida'},{id:'n3',num:'NF-3',emitente:'C',valor:300,emissao:h,oc:'',rateio:[],status:'lancada'});
  S.t.fats.push({id:'f1',num:'FT-1',bc:'b',bcNum:'BC-1',valor:8000,ret:3.5,emissao:addDias(h,-15),venc:addDias(h,15)});S.t.recs.push({id:'r1',fat:'f1',data:addDias(h,-2),valor:3000});S.t.lans.push({id:'l1',data:addDias(h,-40),valor:2000,desc:'Aporte'});
  S.t.lfxs.push({id:'x1',tipo:'gasto',numero:'1',forn:'F',desc:'d',venc:addDias(h,-9),valor:700,pago:addDias(h,-8)},{id:'x2',tipo:'provisao',numero:'',forn:'F',desc:'p',venc:addDias(h,20),valor:900,pago:''});
  S.t.pats.push({id:'pt1',cod:'EQ',desc:'Escavadeira',valor:60000,aquisicao:addDias(h,-120),vida:60,residual:10,nota:'NF-9',local:'Canteiro',manut:[]});
  S.t.cols.push({id:'c1',nome:'Ana',cpf:'52998224725',funcao:S.D.banco_mo[0].funcao,grupo:'Produção',vinculo:'CLT',admissao:'2026-01-01',ativo:true});S.t.ssts.push({id:'s1',col:'c1',tipo:'ASO',emissao:'2000-01-01',validade:addDias(h,100)});
  pontoGrava({col:'c1',data:addDias(h,-6),sit:'presente',hn:8,he:1,hc:0,item:i0});pontoGrava({col:'c1',data:addDias(h,-5),sit:'falta',hn:0,he:0,hc:0,item:''});
  S.t.ctrs.push({id:'ct1',tipo:'receita',num:'C1',parte:'Cliente',valor:100000,ini:'2026-01-01',fim:'2027-01-01',status:'ativo',aditivos:[],anexos:[],bms:[]});S.t.titulos.push({id:'ti1',oc:'o1',ocNum:'OC-1',forn:'A',valor:1000,venc:addDias(h,-2)});S.t.frts.push({id:'fr1',cod:'ESC',desc:'Escav',tipo:'equip',un:'h',leituraIni:0,cadastro:addDias(h,-90),prev:{dias:30,un:0},pneus:[]});render()});
 // ---- invariantes
 const I=await E(()=>{const X=derive(),B=balancete(),bal=balancoCtb(),pc=painelCalc(),nts=S.t.notas.filter(n=>n.status!=='lancada'),k=kardex('TB'),
   somaNotas=r2(nts.reduce((s,n)=>s+n.valor,0)+S.t.lfxs.filter(l=>l.tipo==='gasto').reduce((s,l)=>s+l.valor,0)),dr=['fat','recebido','aReceber','atrRec','gasto','pago','aPagar','atrasado','requisicao','custoFixo','prov'].every(k=>Math.abs(painelLinhas(k).reduce((s,x)=>s+x.valor,0)-pc[{fat:'fat',recebido:'recebido',aReceber:'aReceber',atrRec:'atrRec',gasto:'gasto',pago:'pago',aPagar:'aPagar',atrasado:'atrasado',requisicao:'requisicao',custoFixo:'custoFixo',prov:'prov'}[k]])<0.01);
   return {rateio:nts.every(n=>Math.abs(r2(n.rateio.reduce((s,l)=>s+ +l.valor,0))-n.valor)<0.005),dc:B.D===B.C&&B.D>0,bal:Math.abs(bal.A-bal.pasPL)<0.005,kdx:k[k.length-1].q===saldoIns('TB')&&saldoIns('TB')===12,cm:cmIns('TB')===6,gasto:Math.abs(pc.gasto-somaNotas)<0.01,drill:dr,
     gastoSoma:Math.abs(pc.gasto-(pc.pago+pc.aPagar+pc.atrasado))<0.01,real:Math.abs(X.real-r2(nts.reduce((s,n)=>s+n.rateio.reduce((a,l)=>a+ +l.valor,0),0)))<0.01,dep:partidasAuto().some(e=>e.ref.startsWith('pd:')),sitSoma:(()=>{const r=rhCalc(S.D.obra.codigo,null);return r.n===2&&Math.abs(r.freq+r.abs-1)<1e-9})()}});
 ok('rateio fecha 100% em toda nota rateada',I.rateio);ok('balancete: débito = crédito',I.dc);ok('balanço: ativo = passivo + PL + resultado',I.bal);ok('kardex termina no saldo (12) e custo médio 6',I.kdx&&I.cm);
 ok('painel: gasto = soma das notas + lançamentos importados; = pago + a pagar + atrasado',I.gasto&&I.gastoSoma);ok('drill-down de cada bloco soma o valor do bloco',I.drill);ok('custo realizado dos itens = soma dos rateios',I.real);ok('depreciação do patrimônio no Diário',I.dep);ok('RH: frequência + absenteísmo = 100%',I.sitSoma);
 // ---- varredura telas × papéis × temas × larguras
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});
  const off=await E(()=>{const bad=[];for(const th of ['light','dark']){document.documentElement.dataset.theme=th;for(const r of Object.keys(ROLES)){S.role=r;const vs=areasVisiveis().flatMap(a=>a.tabs.map(t=>t[0]));for(const v of vs){S.view=v;S.tab={};try{render()}catch(e){bad.push(r+'/'+v+' ERRO '+e.message);continue}
   if(document.documentElement.scrollWidth>window.innerWidth+1)bad.push(th+'/'+r+'/'+v+' overflow '+document.documentElement.scrollWidth)}}}document.documentElement.dataset.theme='';return bad});
  ok('varredura 12 papéis × todas as telas × claro/escuro a '+w+'px: sem erro e sem overflow',!off.length,off.slice(0,4).join(' | '));}
 await p.setViewportSize({width:1400,height:1000});
 // ---- acessibilidade
 await E(()=>{S.role='admin';S.view='pain';S.tab.pain='contrato';render()});
 ok('modal tem role=dialog, aria-modal e rótulo',await E(()=>{modal('<h3>Teste</h3><input id="zz"><button>OK</button>');const m=$('#mbox');return m.getAttribute('role')==='dialog'&&m.getAttribute('aria-modal')==='true'&&m.getAttribute('aria-label')==='Teste'}));
 await p.waitForTimeout(50);ok('foco entra no modal',await E(()=>$('#mbox').contains(document.activeElement)));
 await p.keyboard.press('Tab');await p.keyboard.press('Tab');await p.keyboard.press('Tab');ok('Tab não escapa do modal (armadilha de foco)',await E(()=>$('#mbox').contains(document.activeElement)));
 await p.keyboard.press('Escape');ok('Esc fecha o modal',await E(()=>!$('#modal').classList.contains('open')));
 ok('linhas clicáveis viram botões de teclado e tabelas têm scope',await E(()=>{S.view='pain';S.tab.pain='obra';render();const c=[...document.querySelectorAll('.clk')];return (!c.length||c.every(e=>e.tabIndex===0&&e.getAttribute('role')))&&[...document.querySelectorAll('th')].every(t=>t.getAttribute('scope'))}));
 ok('todo campo e botão do alerta tem nome acessível',await E(()=>[...document.querySelectorAll('#bell,#close')].every(e=>(e.getAttribute('aria-label')||e.textContent.trim()))));
 ok('html com lang pt-BR',await E(()=>document.documentElement.lang==='pt-BR'));
 // ---- ajuda por papel
 ok('todo papel tem manual embutido',await E(()=>Object.keys(ROLES).every(r=>MANUAIS[MAN_PAPEL[r]]&&MANUAIS[MAN_PAPEL[r]].length>200)));
 await E(()=>{S.role='compras';render()});await p.selectOption('#role','compras');await p.click('#ajuda');ok('Ajuda abre o manual do papel (Compras)',await E(()=>$('#mbox').innerText.includes('Manual de Compras')));
 await p.fill('#aj-q','emergência');ok('busca filtra o manual',await E(()=>{const t=$('#aj-t').innerText;return t.toLowerCase().includes('emergência')&&!t.includes('Cadastros (Suprimentos')}));await p.keyboard.press('Escape');
 // ---- contraste AA (texto normal ≥ 4,5; grande ≥ 3)
 const luz=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
 const CS=`(()=>{const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const rgb=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const a=m[1].split(',').map(x=>parseFloat(x));return {c:a.slice(0,3),a:a.length>3?a[3]:1}};
  const bgDe=e=>{let x=e;const L=[];while(x){const r=rgb(getComputedStyle(x).backgroundColor);if(r&&r.a>0){L.push(r);if(r.a>=1)break}x=x.parentElement}let base=[255,255,255];if(!(L.length&&L[L.length-1].a>=1)){const t=document.documentElement.dataset.theme==='dark'||(matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light')?[14,14,16]:[243,243,244];base=t}
   let out=L.length&&L[L.length-1].a>=1?L.pop().c:base;for(let i=L.length-1;i>=0;i--){const r=L[i];out=out.map((v,k)=>Math.round(r.c[k]*r.a+v*(1-r.a)))}return out};
  const bad=[];document.querySelectorAll('#view *,.side *,.top *').forEach(e=>{if(!e.childNodes.length)return;const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');if(!t||e.closest('svg')||e.disabled||e.closest('[disabled]'))return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||e.offsetParent===null)return;
   const fg=rgb(cs.color);if(!fg)return;const bg=bgDe(e),a=fg.a<1?fg.c.map((v,k)=>Math.round(v*fg.a+bg[k]*(1-fg.a))):fg.c;const l1=lum(a),l2=lum(bg),r=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),px=parseFloat(cs.fontSize),big=px>=24||(px>=18.66&&+cs.fontWeight>=700);
   if(r<(big?3:4.5))bad.push(e.tagName.toLowerCase()+'.'+(e.className||'').toString().split(' ')[0]+' "'+t.slice(0,24)+'" '+r.toFixed(2))});return [...new Set(bad)]})()`;
 const telas=[['dash',null],['pain','contrato'],['compras','sols'],['fin','tit'],['ctb','bal'],['est','saldo'],['pes','rh'],['ctr',null],['admin',null],['aud',null]];
 for(const th of ['light','dark']){const falhas=[];for(const [v,t] of telas){await E(([v,t,th])=>{document.documentElement.dataset.theme=th;S.role='admin';S.view=v;if(t)S.tab[({pain:'pain',compras:'compras',fin:'fin',ctb:'ctb',est:'est',pes:'pes'})[v]]=t;render()},[v,t,th]);const r=await E(CS);r.forEach(x=>falhas.push(v+': '+x))}
  ok('contraste AA em 10 telas, tema '+th,!falhas.length,falhas.length+' falhas · '+falhas.slice(0,6).join(' | '))}
 await E(()=>{document.documentElement.dataset.theme=''});
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
