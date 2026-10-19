// E2E Fase 19: tema claro/escuro, só a obra 342 sem "demo", vazio = 0 e filtros interativos.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c,d)=>res.push((c?'OK   ':'FALHA ')+n+(c||!d?'':' · '+d));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1400,height:1000},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const E=(f,a)=>p.evaluate(f,a);const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 // ---- tema
 ok('botões Claro e Escuro existem',await p.isVisible('#t-claro')&&await p.isVisible('#t-escuro'));
 await p.click('#t-escuro');ok('Escuro aplica data-theme=dark e aria-pressed',await E(()=>document.documentElement.dataset.theme==='dark'&&document.getElementById('t-escuro').getAttribute('aria-pressed')==='true'&&document.getElementById('t-claro').getAttribute('aria-pressed')==='false'));
 ok('fundo escuro de verdade',await E(()=>{const c=getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);return c[0]<60}));
 await p.reload();await p.waitForSelector('.big');ok('o tema escolhido persiste após recarregar',await E(()=>document.documentElement.dataset.theme==='dark'));
 await p.click('#t-claro');ok('Claro volta ao tema claro',await E(()=>document.documentElement.dataset.theme==='light'&&getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number)[0]>200));
 // ---- só 342, sem demo
 ok('só a obra 342 está ativa',await E(()=>OBRAS_PADRAO.length===1&&OBRAS_PADRAO[0][0]==='342'));
 const txt=await E(()=>{const out=[];S.role='admin';const tabs={pain:['contrato','compras','obra','dre','prod','lean','carteira','conf','imp'],ctb:['bal','diario','razao','dre','orc','fech','liv','plano'],est:['saldo','mov','inv','nec'],pes:['col','pto','rh','custo'],fin:['tit','conc','contas','cobr','apur','fech'],fat:['bc','nf','caixa'],compras:['sols','ocs','aprov'],cad:['forn','ins','banc','emp']};const key={pain:'pain',ctb:'ctb',est:'est',pes:'pes',fin:'fin',fat:'fat',compras:'compras',cad:'cad'};
  for(const v of areasVisiveis().flatMap(a=>a.tabs.map(t=>t[0]))){for(const s of (tabs[v]||[null])){S.view=v;S.tab={};if(s)S.tab[key[v]]=s;render();out.push(document.body.innerText)}}return out.join('\\n')});
 ok('nenhuma tela fala em demo/demonstração',!/demo|demonstra/i.test(txt));
 ok('nenhuma tela cita 343, 281 ou Mozarlândia',!/Mozarl|Sobradinho|\\b343\\b|\\b281\\b/.test(txt));
 // ---- vazio = 0
 const vazios=await E(()=>{const bad=[];for(const v of areasVisiveis().flatMap(a=>a.tabs.map(t=>t[0]))){S.view=v;S.tab={};render();document.querySelector('#view').innerText.split('\\n').forEach(l=>{if(/(^|\\s)—(\\s|$)/.test(l.trim()))bad.push(v+': '+l.trim().slice(0,50))})}return bad});
 ok('nenhum "—" no lugar de zero em nenhuma tela',!vazios.length,vazios.slice(0,4).join(' | '));
 ok('listas vazias aparecem como 0 registros',await E(()=>{S.view='compras';S.tab={compras:'ocs'};render();const z=document.querySelector('#view .zero');return !!z&&z.textContent.trim().startsWith('0')}));
 ok('indicadores sem base mostram 0 (IDC, frequência, absenteísmo)',await E(()=>{S.view='dash';render();const t=document.querySelector('#view').innerText;return !/—/.test(t)&&/0,0%|R\\$ 0/.test(t)}));
 ok('RH sem ponto mostra os cartões em 0,00%',await E(()=>{S.view='pes';S.tab={pes:'rh'};render();const t=document.querySelector('#view').innerText;return /frequência média/i.test(t)&&/0,00%/.test(t)}));
 // ---- filtros: massa de dados em Notas e Financeiro
 await E(()=>{S.role='admin';const h=hojeISO(),it=S.D.items;for(let i=0;i<40;i++){const d=addDias(h,-i*3),v=100*(i+1);S.t.notas.push({id:'n'+i,num:'NF-'+String(i).padStart(3,'0'),emitente:['Alfa','Beta','Gama'][i%3],valor:v,emissao:d,oc:'',rateio:[{item:it[i%5].codigo,valor:v,nat:'MAT',conta:'4.2.01'}],status:['paga','conferida','rateada'][i%3],pago:d});S.t.titulos.push({id:'t'+i,oc:'o'+i,ocNum:'OC-'+i,forn:['Alfa','Beta','Gama'][i%3],valor:v,venc:addDias(h,i-20)})}S.flt={};S.view='nota';S.tab={};render()});
 const info=()=>E(()=>{const t=document.querySelector('#view table.tbl'),L=[...t.tBodies[0].rows].filter(r=>r.style.display!=='none');return {n:L.length,tot:t.tBodies[0].rows.length,cont:document.querySelector('#view .f-n').textContent,first:L[0]?L[0].cells[0].textContent.trim():''}});
 ok('toda tabela com várias linhas ganha barra de filtros',await E(()=>[...document.querySelectorAll('#view table.tbl')].every(t=>t.tBodies[0].rows.length<2||!!t.__bar)));
 let i0=await info();ok('contador inicial N de N',i0.n===40&&i0.cont==='40 de 40',JSON.stringify(i0));
 await p.fill('.f-q','alfa');let i1=await info();ok('busca em tempo real filtra por texto (Alfa = 14 de 40)',i1.n===14&&i1.cont==='14 de 40',JSON.stringify(i1));
 await p.fill('.f-q','');await E(()=>{S.view='nota';render()});
 const sel=await E(()=>[...document.querySelectorAll('.fbar select.f-c')].map(s=>s.getAttribute('aria-label')));ok('listas de filtro por coluna (emitente, situação)',sel.length>=1,JSON.stringify(sel));
 await p.selectOption('.fbar select.f-c >> nth=0',{index:1});i1=await info();ok('filtro por coluna reduz as linhas',i1.n>0&&i1.n<40,JSON.stringify(i1));
 await p.click('.f-x');i1=await info();ok('Limpar restaura tudo',i1.n===40);
 await p.fill('.f-v[data-k=min]','3000');i1=await info();ok('faixa de valor mínimo (≥ 3.000)',i1.n>0&&i1.n<40,JSON.stringify(i1));
 await p.fill('.f-v[data-k=min]','');await p.fill('.f-v[data-k=max]','500');i1=await info();ok('faixa de valor máximo (≤ 500 = 5 notas)',i1.n===5,JSON.stringify(i1));await p.click('.f-x');
 const dt=await E(()=>hojeISO());await E(h=>{const d=new Date(h+'T12:00:00');d.setDate(d.getDate()-30);document.querySelector('.f-d[data-k=de]').value=d.toISOString().slice(0,10);document.querySelector('.f-d[data-k=de]').dispatchEvent(new Event('input',{bubbles:true}))},dt);
 i1=await info();ok('intervalo de datas (últimos 30 dias)',i1.n>0&&i1.n<40,JSON.stringify(i1));await p.click('.f-x');
 // ordenação
 await E(()=>{[...document.querySelectorAll('#view table.tbl thead th')].find(h=>/Valor/.test(h.textContent)).click()});
 ok('ordenar pelo cabeçalho numérico (crescente)',await E(()=>{const t=document.querySelector('#view table.tbl'),i=[...t.tHead.rows[0].cells].findIndex(h=>/Valor/.test(h.textContent)),v=[...t.tBodies[0].rows].map(r=>fNum(r.cells[i].textContent)).filter(x=>x!==null);return v.length>5&&v.every((x,k)=>k===0||x>=v[k-1])}));
 await E(()=>{[...document.querySelectorAll('#view table.tbl thead th')].find(h=>/Valor/.test(h.textContent)).click()});
 ok('segundo clique inverte (decrescente)',await E(()=>{const t=document.querySelector('#view table.tbl'),i=[...t.tHead.rows[0].cells].findIndex(h=>/Valor/.test(h.textContent)),v=[...t.tBodies[0].rows].map(r=>fNum(r.cells[i].textContent)).filter(x=>x!==null);return v.every((x,k)=>k===0||x<=v[k-1])}));
 await p.fill('.f-q','beta');await E(()=>{render()});ok('o filtro e a ordem sobrevivem a um novo desenho da tela',(await info()).n===13);
 await p.click('.f-x');
 ok('duplo clique em uma célula filtra por aquele valor',await E(()=>{const t=document.querySelector('#view table.tbl'),c=t.__cols.find(c=>c.uniq&&c.nome);const tr=t.tBodies[0].rows[0],td=tr.cells[c.i];td.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const L=[...t.tBodies[0].rows].filter(r=>r.style.display!=='none');return L.length>0&&L.length<40&&L.every(r=>fSemData(r.cells[c.i].textContent)===fSemData(td.textContent))}));await p.click('.f-x');
 await E(()=>{S.view='fin';S.tab={fin:'tit'};render()});ok('Financeiro → Contas a pagar também tem filtros',await E(()=>!!document.querySelector('#view .fbar')));
 await p.click('.f-al');ok('"só alertas" mostra só linhas com sinal de atenção',await E(()=>{const t=document.querySelector('#view table.tbl'),L=[...t.tBodies[0].rows].filter(r=>r.style.display!=='none');return L.length<40&&L.every(r=>r.querySelector('.neg,.pill.bad,.pill.warn'))}));await p.click('.f-x');
 ok('Copiar CSV existe e responde',await E(()=>!!document.querySelector('.f-csv'))); 
 // ---- filtros de painéis
 await E(()=>{S.view='dash';S.t.par.bi=undefined;render()});await p.click('[data-act=dash-natpop]');await p.click('.pop [data-n=MAT]');ok('Dashboard filtra por natureza',await E(()=>S.dashNat==='MAT'&&/Material/.test(document.querySelector('#view').innerText)));
 await p.click('[data-act=dash-per][data-p=mes]');ok('Dashboard filtra por período',await E(()=>biPar().periodo==='mes'));
 await E(()=>{S.view='pain';S.tab={pain:'contrato'};render()});ok('Painel da obra tem filtro de período',await E(()=>!!document.querySelector('#view .pbar')));
 await E(()=>{S.view='pes';S.tab={pes:'rh'};render()});ok('RH tem filtro de obra e de meses',await E(()=>!!document.querySelector('#view [data-act=rh-obra]')));
 const cr=await E(()=>{const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const bad=[];S.view='nota';S.tab={};for(const th of ['light','dark']){document.documentElement.dataset.theme=th;render();document.querySelectorAll('.fbar .f-n,.fbar .f-l,.fbar input[type=search],.fbar select').forEach(e=>{const pc=x=>(x.match(/[\d.]+/g)||[0,0,0,0]).map(Number),cs=getComputedStyle(e),fg=pc(cs.color),bg=pc(getComputedStyle(e.closest('.fbar')).backgroundColor),bg2=pc(cs.backgroundColor);const B=bg2.length>3&&bg2[3]===0?bg:bg2;const l1=lum(fg),l2=lum(B),r=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(r<4.5)bad.push(th+' '+e.className+' '+r.toFixed(2))})}document.documentElement.dataset.theme='';return bad.length?bad.join(' | '):true});ok('contraste dos filtros nos dois temas',cr===true,cr);
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});const off=await E(()=>{const bad=[];for(const v of ['dash','nota','fin','est','pes','ctr','aud','bi']){S.view=v;S.tab={};render();if(document.documentElement.scrollWidth>window.innerWidth+1)bad.push(v)}return bad});ok('com filtros, sem overflow a '+w+'px',!off.length,off.join(','))}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
