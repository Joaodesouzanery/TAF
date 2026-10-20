// E2E Fase 20: ícones de tema no fim da sidebar, escuro mais claro, período "Hoje", natureza em popover, conferência interna, sem Sankhya.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c,d)=>res.push((c?'OK   ':'FALHA ')+n+(c||!d?'':' · '+d));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1400,height:1000},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const E=(f,a)=>p.evaluate(f,a);
 // tema
 ok('ícones de tema na sidebar, sem texto',await E(()=>{const a=document.getElementById('t-claro'),e=document.getElementById('t-escuro');return !!a.closest('.side')&&!!e.closest('.side')&&a.innerText.trim()===''&&e.innerText.trim()===''&&a.getBoundingClientRect().width<=32}));
 ok('ícones ficam abaixo do seletor de papel (fim da sidebar)',await E(()=>document.getElementById('t-claro').getBoundingClientRect().top>document.getElementById('role').getBoundingClientRect().top));
 await p.click('#t-escuro');
 ok('escuro: fundo cinza (não quase preto)',await E(()=>{const c=getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);return c[0]>=24&&c[0]<=50}));
 ok('escuro persiste após recarregar',await (async()=>{await p.reload();await p.waitForSelector('.big');return E(()=>document.documentElement.dataset.theme==='dark'&&document.getElementById('t-escuro').getAttribute('aria-pressed')==='true')})());
 // contraste escuro
 const cr=await E(()=>{const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const px=x=>(x.match(/[\d.]+/g)||[0,0,0]).map(Number),bad=[];
  const bgDe=e=>{while(e){const c=px(getComputedStyle(e).backgroundColor);if(!(c.length>3&&c[3]===0)&&getComputedStyle(e).backgroundColor!=='rgba(0, 0, 0, 0)')return c;e=e.parentElement}return [28,29,33]};
  for(const th of ['dark','light']){document.documentElement.dataset.theme=th;S.view='dash';render();document.querySelectorAll('.pbar button,.pbar input,.presumo,.tema-ic button,.kpi4 .k-l').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;const l1=lum(px(getComputedStyle(e).color)),l2=lum(bgDe(e)),q=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(q<4.5)bad.push(th+' '+e.className+' '+q.toFixed(2))})}
  document.documentElement.dataset.theme='dark';return bad.length?bad.join(' | '):true});
 ok('contraste da barra de filtros e ícones nos dois temas',cr===true,cr);
 await p.click('#t-claro');
 // início
 ok('Início abre com período "Hoje"',await E(()=>biPar().periodo==='hoje'&&document.querySelector('.pseg [aria-pressed=true]').innerText.trim()==='Hoje'&&/Hoje|\d{2}\/\d{2}\/\d{4}/.test(document.querySelector('.pseg').parentElement.querySelector('.presumo').innerText)));
 ok('barra com 7 períodos e sem <select> de período/natureza',await E(()=>document.querySelectorAll('.pseg button').length===7&&!document.querySelector('#d-per,#d-nat')));
 for(const k of ['7d','mes','3m','ano','tudo']){await p.click(`[data-act=dash-per][data-p="${k}"]`);ok('período '+k+' aplica',await E(k=>biPar().periodo===k&&document.querySelector('.pseg [aria-pressed=true]').dataset.p===k,k))}
 await p.click('[data-act=dash-per][data-p=custom]');ok('personalizado mostra De/Até',await p.isVisible('#d-de')&&await p.isVisible('#d-ate'));
 await p.fill('#d-de','2026-01-01');await p.dispatchEvent('#d-de','change');await p.fill('#d-ate','2026-03-31');await p.dispatchEvent('#d-ate','change');
 ok('intervalo personalizado vale no resumo',await E(()=>/01\/01\/2026 a 31\/03\/2026/.test(document.querySelector('.pseg').parentElement.querySelector('.presumo').innerText)));
 ok('intervalo filtra por data e por mês',await E(()=>{const R=periodoRange();return R.has('2026-02-10')&&!R.has('2026-04-01')&&R.has('2026-03')&&!R.has('2026-04')}));
 // natureza
 await p.click('[data-act=dash-natpop]');ok('popover de natureza lista as 5 + Todas',await E(()=>document.querySelectorAll('.pop [role=option]').length===6));
 await p.keyboard.press('Escape');ok('Esc fecha o popover',await E(()=>!document.querySelector('.pop')));
 await p.click('[data-act=dash-natpop]');await p.click('.pop [data-n=MAT]');
 ok('natureza aplicada aparece como chip com ×',await E(()=>S.dashNat==='MAT'&&!!document.querySelector('.pseg').parentElement.querySelector('.pill.x')&&/Material/.test(document.querySelector('.pseg').parentElement.innerText)));
 await p.click('.pseg ~ .pwrap .pill.x');ok('× limpa a natureza',await E(()=>S.dashNat===''));
 await p.click('[data-act=dash-natpop]');await p.click('#crumb');ok('clique fora fecha o popover',await E(()=>!document.querySelector('.pop')));
 // painel da obra com a mesma barra
 await E(()=>{S.view='pain';S.tab={pain:'contrato'};render()});ok('Painel da obra usa a mesma barra',await E(()=>!!document.querySelector('#view .pbar')));
 // conferência
 await E(()=>{S.tab.pain='conf';render()});
 ok('aba chama-se Conferência e não pede digitação',await E(()=>/Conferência/.test(document.querySelector('.toolbar').innerText)&&!document.querySelector('[data-cf]')&&document.querySelectorAll('.tbl tbody tr').length===6));
 // sem sankhya
 let achou=[];for(const v of ['dash','pain','nota','fin','est','pes','ctr','aud','bi','adm']){await E(v=>{S.view=v;S.tab={};render()},v);if(/sankhya/i.test(await p.innerText('body')))achou.push(v)}
 await E(()=>{S.view='fin';S.tab={fin:'fech'};render()});if(/sankhya/i.test(await p.innerText('body')))achou.push('fech');
 ok('nenhuma tela cita Sankhya',achou.length===0,achou.join(','));
 ok('a ajuda também não cita Sankhya',await E(()=>!/sankhya/i.test(JSON.stringify(typeof AJUDA!=='undefined'?AJUDA:''))));
 // seletor de obras
 ok('seletor de obras na sidebar abre a lista',await (async()=>{await p.click('.obra-sel');return p.isVisible('.modal, #modal, [role=dialog]')})());
 // mobile
 await p.keyboard.press('Escape');await p.setViewportSize({width:400,height:900});await E(()=>{closeModal&&closeModal();S.view='dash';render()});
 ok('mobile: sem overflow horizontal e botões 44px',await E(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.getElementById('t-claro').getBoundingClientRect().height>=44));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
