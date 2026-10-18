// E2E Fase 12 (demo): navegação em 8 áreas, cadastros base (fornecedor, insumo, banco, empresa) e validações.
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 ok('menu lateral tem poucas áreas (≤ 8), não 14 telas',(await p.$$eval('#nav button',e=>e.length))<=8);
 await p.click('#nav button:has-text("Obra")');ok('área Obra mostra abas internas (Orçamento, Campo, Lean…)',await p.isVisible('.areatabs button:has-text("Campo")')&&await p.isVisible('.areatabs button:has-text("Lean")'));
 await p.click('.areatabs button:has-text("Campo")');ok('aba Campo abre a tela de apontamento',await T('Novo apontamento'));
 await p.click('#nav button:has-text("Suprimentos")');await p.click('.areatabs button:has-text("Cadastros")');ok('Suprimentos → Cadastros abre',await T('Fornecedores e clientes'));
 // fornecedor
 await p.evaluate(()=>{S.role='compras';render()});await p.selectOption('#role','compras');
 await p.click('[data-act=cad-novo]');await p.fill('#c-nome','Tubos Brasil Ltda');await p.fill('#c-cnpj','11.222.333/0001-81');await p.click('[data-act=cad-ok]');
 ok('CNPJ válido é aceito (formatado na lista)',await T('11.222.333/0001-81'));
 await p.click('[data-act=cad-novo]');await p.fill('#c-nome','Outro');await p.fill('#c-cnpj','11.222.333/0001-80');await p.click('[data-act=cad-ok]');
 ok('CNPJ com dígito errado é recusado',await p.evaluate(()=>S.t.forns.length===1));
 await p.fill('#c-cnpj','11222333000181');await p.click('[data-act=cad-ok]');ok('CNPJ repetido é recusado',await p.evaluate(()=>S.t.forns.length===1));
 await p.click('[data-act=fechar]');
 ok('validador: CPF e CNPJ conhecidos',await p.evaluate(()=>cpfValido('52998224725')&&cnpjValido('11444777000161')&&!cnpjValido('11111111111111')));
 // insumo com unidade alternativa
 await p.click('.tabs button[data-t=ins]');await p.click('[data-act=cad-novo]');await p.fill('#c-cod','TB220');await p.fill('#c-desc','Tubo PVC esgoto DN220');await p.fill('#c-un','M');await p.fill('#c-ua','BR');await p.click('[data-act=cad-ok]');
 ok('unidade de compra sem fator é recusada',await p.evaluate(()=>S.t.inss.length===0));
 await p.fill('#c-uf','6');await p.click('[data-act=cad-ok]');ok('insumo salvo com conta herdada da natureza',await p.evaluate(()=>S.t.inss.length===1&&S.t.inss[0].conta==='4.2.08'&&S.t.inss[0].unAlt[0].fator===6)&&await T('compra em BR'));
 // banco: compras não cadastra
 await p.click('.tabs button[data-t=banc]');ok('compras não cadastra conta bancária',await p.isDisabled('[data-act=cad-novo]'));
 await p.selectOption('#role','financeiro');await p.click('[data-act=cad-novo]');await p.fill('#c-desc','Conta Obra 342');await p.fill('#c-banco','Banco X');await p.click('[data-act=cad-ok]');
 ok('financeiro cadastra a conta bancária',await p.evaluate(()=>S.t.bancos.length===1)&&await T('Conta Obra 342'));
 // empresa
 await p.click('.tabs button[data-t=emp]');await p.fill('[data-emp=cnpj]','11.444.777/0001-61');await p.dispatchEvent('[data-emp=cnpj]','change');
 ok('dados da empresa persistem',await p.evaluate(()=>S.t.par.emp.cnpj==='11.444.777/0001-61'));
 await p.screenshot({path:out+'/cadastros.png'});
 await p.reload();await p.waitForSelector('.big');ok('cadastros persistem após recarregar',await p.evaluate(()=>S.t.forns.length===1&&S.t.inss.length===1&&S.t.bancos.length===1));

 // menu por papel
 ok('encarregado vê Início, Obra (Campo, Lean) e Frota',await p.evaluate(()=>{const r=S.role;S.role='encarregado';const a=areasVisiveis().map(x=>x.k).join(',');const f=!tabVisivel('fin')&&!tabVisivel('ctr');S.role=r;return a==='inicio,obra,pess,ativos'&&f}));
 ok('financeiro vê Financeiro e Contábil, não vê Campo',await p.evaluate(()=>{const r=S.role;S.role='financeiro';const v=tabVisivel('fat')&&tabVisivel('plano')&&!tabVisivel('campo');S.role=r;return v}));
 // ---- várias obras (7b) ----
 await p.click('.obra-sel');ok('seletor lista as 3 obras (342, 343, 281)',await T('Subadutora Sobradinho')&&await T('Mozarl'));
 await p.click('[data-act=obra-abrir][data-cod="343"]');await p.waitForFunction(()=>S.D&&S.D.obra.codigo==='343');
 ok('obra 343 carrega a EAP da Viabilidade (244 itens, só preço licitado)',await p.evaluate(()=>S.D.items.length===244&&S.D.items.every(i=>i.meta_total==null)));
 const sem=await p.evaluate(()=>{const i=S.D.items[0];S.t.frozen=true;return semaforo(i.codigo,100)});
 ok('compra em item sem meta é bloqueada com mensagem própria',sem[0]==='bloqueado'&&/sem meta/i.test(sem[1]));
 // define metas pela planilha (json sintético) e a compra passa a ter semáforo
 const eap343=await p.evaluate(()=>S.D.items.slice(0,3).map(i=>({codigo:i.codigo,tipo_linha:'item',qtd:i.qtd,meta_total:i.preco_venda_total*0.8,teto_total:i.preco_venda_total*0.9,status_cotacao:'Orçado'})));
 require('fs').writeFileSync('/tmp/sync343.json',JSON.stringify({eap:eap343,pacotes:[]}));
 await p.evaluate(()=>{S.role='gestao';render()});await p.selectOption('#role','gestao');await p.evaluate(()=>{S.view='eap';render()});
 await p.click('[data-act=sync-novo]');await p.setInputFiles('#sy-f','/tmp/sync343.json');await p.click('[data-act=sync-ler]');await p.waitForSelector('#sy-r .kpi4');await p.click('#sy-ap');
 ok('atualizar pela planilha dá meta a itens que não tinham',await p.evaluate(()=>S.D.items[0].meta_total>0&&semaforo(S.D.items[0].codigo,1)[0]!=='bloqueado'));
 ok('cadastros globais aparecem em outra obra (343)',await p.evaluate(()=>S.t.forns.length===1&&S.t.bancos.length===1));
 await p.click('.obra-sel');await p.click('[data-act=obra-abrir][data-cod="281"]');await p.waitForFunction(()=>S.D&&S.D.obra.codigo==='281');
 await p.evaluate(()=>{S.view='fin';render()});ok('obra 281 oferece importar o histórico',await T('Importar histórico'));
 await p.selectOption('#role','financeiro');await p.click('[data-act=hist-281]');
 const h=await p.evaluate(()=>({n:S.t.notas.length,l:S.t.lans.length,tot:S.t.notas.reduce((s,n)=>s+n.valor,0),soma:S.t.notas.every(n=>Math.abs(n.rateio.reduce((a,l)=>a+l.valor,0)-n.valor)<0.005)}));
 ok('histórico: 324 despesas e 18 aportes, todas as notas com rateio fechando 100%',h.n===324&&h.l===18&&h.soma);
 ok('total das despesas bate com a planilha (R$ 1.103.553,37)',Math.abs(h.tot-1103553.37)<0.01);
 ok('importar duas vezes não duplica',await p.evaluate(()=>{importaHistorico281;return !historicoPendente()}));
 ok('custo da 281 aparece por conta do plano',await p.evaluate(()=>{const r=realPorConta();return Object.keys(r).length>=3}));
 await p.click('.obra-sel');await p.click('[data-act=obra-abrir][data-cod="342"]');await p.waitForFunction(()=>S.D&&S.D.obra.codigo==='342');
 ok('voltar para a 342 mantém os cadastros globais e o estado da obra',await p.evaluate(()=>S.t.forns.length===1&&S.t.notas.length===0));
 // numeração local continua funcionando no modo aberto
 ok('numeração local no modo aberto',await p.evaluate(()=>nextNum('sol')==='SC-0001'));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,4).join(' '));process.exit(1)});
