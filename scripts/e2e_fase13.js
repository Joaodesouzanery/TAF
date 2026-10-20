// E2E Fase 13 (demo): Painel de Contratos/Obra, conferência interna e importação de lançamentos.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');await p.evaluate(()=>{S.t.lfxs=[];save();render()});
 const T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 await p.evaluate(()=>{S.role='financeiro';S.view='pain';S.tab.pain='contrato';render()});await p.selectOption('#role','financeiro');
 ok('painel mostra os blocos do painel',await T('Fat. direto')&&await T('Prov. gasto')&&await T('Saldo a faturar')&&await T('Custo fixo')&&await T('Lucro (projetado)'));
 ok('contrato da 342 = 3.257.970,74',await p.evaluate(()=>painelCalc().contrato===3257970.74));
 ok('zerado sem lançamentos: gasto 0, saldo a faturar = contrato',await p.evaluate(()=>{const c=painelCalc();return c.gasto===0&&c.saldoFat===c.contrato&&c.fat===0}));
 // importa lançamentos (cenário: gasto pago, a pagar, atrasado, provisão, custo fixo)
 await p.evaluate(()=>{S.tab.pain='imp';render()});
 const csv='tipo;numero;fornecedor;descricao;vencimento;valor;pago_em;fat_direto\ngasto;1;A;Cimento;01/01/2020;6.065,79;01/01/2020;\ngasto;2;B;Brita;01/01/2999;2.011,26;;\ngasto;3;C;Areia;01/01/2020;2.021,60;;\nprovisao;;Folha;Prov;30/11/2999;126.731,81;;\ncusto_fixo;;ADM;Rateio;30/11/2026;261.331,70;;\ngasto;4;D;X;01/01/2999;abc;;';
 await p.fill('#lf-csv',csv);await p.click('[data-act=lf-imp]');
 const c=await p.evaluate(()=>painelCalc());
 ok('gasto pago 6.065,79',c.pago===6065.79);ok('a pagar 2.011,26',c.aPagar===2011.26);ok('atrasado 2.021,60',c.atrasado===2021.6);ok('gasto = 10.098,65',Math.abs(c.gasto-10098.65)<0.005);
 ok('provisão 126.731,81 e custo fixo 261.331,70',c.prov===126731.81&&c.custoFixo===261331.7);
 ok('saldo a faturar = contrato − faturado',c.saldoFat===c.contrato);
 ok('lucro = contrato×(1−trib) − comprometido',Math.abs(c.lucro-(c.contrato*(1-0.085)-c.comprom))<0.01);
 ok('linha inválida é reportada, não importada',await p.evaluate(()=>S.t.lfxs.length===5)&&await T('valor inválido'));
 await p.fill('#lf-csv',csv);await p.click('[data-act=lf-imp]');ok('reimportar não duplica',await p.evaluate(()=>S.t.lfxs.length===5));
 await p.click('[data-act=lf-undo]');ok('desfazer remove o lote',await p.evaluate(()=>S.t.lfxs.length===0));
 await p.fill('#lf-csv',csv);await p.click('[data-act=lf-imp]');
 // conferência
 await p.evaluate(()=>{S.tab.pain='conf';render()});
 ok('conferência automática: 6 verificações, sem campos para digitar',await p.evaluate(()=>document.querySelectorAll('[data-cf]').length===0&&document.querySelectorAll('.tbl tbody tr').length===6));
 ok('"gasto = pago + a pagar + atrasado" bate',await p.evaluate(()=>[...document.querySelectorAll('.tbl tbody tr')].some(r=>/pago \+ a pagar/.test(r.innerText)&&/bate/i.test(r.innerText))));
 ok('verificação que difere mostra a causa',await p.evaluate(()=>{const r=[...document.querySelectorAll('.tbl tbody tr')].filter(r=>/difere/i.test(r.innerText));return r.every(x=>x.cells[5].innerText.length>5)}));
 // permissão
 await p.selectOption('#role','engenheiro');await p.evaluate(()=>{S.tab.pain='imp';render()});
 ok('engenheiro não importa',await p.isDisabled('[data-act=lf-imp]'));

 // ---- financeiro nativo ----
 await p.setViewportSize({width:1400,height:1000});
 await p.selectOption('#role','financeiro');
 await p.evaluate(()=>{S.t.bancos.push({id:'bk1',desc:'Conta Obra 342',banco:'Banco X',saldoIni:1000,ativo:true});
  S.t.notas.push({id:'nA',num:'NF-9001',emitente:'Forn A',valor:1000,emissao:'2026-01-01',oc:'',rateio:[],status:'liberada'},{id:'nB',num:'NF-9002',emitente:'Forn B',valor:3000,emissao:'2026-01-01',oc:'',rateio:[],status:'liberada'});
  S.view='fin';S.tab.fin='contas';render()});
 ok('contas mostram saldo inicial',await T('Conta Obra 342'));
 await p.evaluate(()=>{document.querySelectorAll('.bx').forEach(e=>e.checked=true)});
 await p.fill('#bx-j','40');await p.fill('#bx-d','0');await p.click('[data-act=bx-ok]');
 ok('baixa múltipla paga as duas notas',await p.evaluate(()=>S.t.notas.filter(n=>n.status==='paga').length>=2));
 ok('encargos de R$ 40 rateados por valor (10 + 30)',await p.evaluate(()=>{const a=S.t.notas.find(n=>n.id==='nA'),b=S.t.notas.find(n=>n.id==='nB');return a.encargos===10&&b.encargos===30}));
 ok('saldo da conta = 1000 − 4040',await p.evaluate(()=>saldoConta(S.t.bancos[0])===-3040));
 const ofx='<OFX><STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20261116120000<TRNAMT>-1010.00<FITID>F1<MEMO>PIX Forn A</STMTTRN><STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261117<TRNAMT>500,00<FITID>F2<MEMO>TED cliente</STMTTRN></OFX>';
 await p.fill('#ofx-arq',ofx);await p.click('[data-act=ofx-imp]');
 ok('OFX importa 2 movimentos',await p.evaluate(()=>S.t.movs.filter(m=>m.origem==='OFX').length===2));
 ok('saída de 1.010 concilia com a nota A paga (1.000 + 10)',await p.evaluate(()=>{const m=S.t.movs.find(m=>m.fitid==='F1');return m.valor===-1010&&m.conc==='NF-9001'}));
 ok('extrato que confirma a baixa não conta o pagamento duas vezes',await p.evaluate(()=>saldoConta(S.t.bancos[0])===-3040+500));
 await p.fill('#ofx-arq',ofx);await p.click('[data-act=ofx-imp]');ok('OFX repetido não duplica',await p.evaluate(()=>S.t.movs.filter(m=>m.origem==='OFX').length===2));
 await p.evaluate(()=>{S.t.notas.push({id:'nC',num:'NF-9003',emitente:'Forn C',valor:700,emissao:'2026-01-01',oc:'',rateio:[],status:'liberada'});render()});
 await p.click('[data-act=cnab-gera]');ok('remessa CNAB tem linhas de 240 posições',await p.evaluate(()=>S.cnabOut.split('\r\n').every(l=>l.length===240)&&S.cnabOut.split('\r\n').length>=5));
 // cobrança
 await p.evaluate(()=>{S.t.fats.push({id:'ftx',num:'FT-1',bc:'b',bcNum:'BC-1',valor:1000,ret:0,emissao:'2020-01-01',venc:'2020-02-01'});S.tab.fin='cobr';render()});
 ok('cobrança lista NF vencida com etapa',await T('FT-1')&&await T('Jurídico'));
 await p.click('[data-act=cobr-reg]');ok('contato fica registrado',await p.evaluate(()=>S.t.cobrs.length===1));
 ok('cobrança entra no atrasado a receber do painel',await p.evaluate(()=>painelCalc().atrRec===1000));

 // ---- fechamento da fase 13: drill-down, parcelas, renegociação, agrupamento, carteira ----
 await p.evaluate(()=>{S.view='pain';S.tab.pain='contrato';render()});
 ok('drill-down: soma das linhas = bloco, para todos os blocos',await p.evaluate(()=>{const c=painelCalc(),m={fat:'fat',recebido:'recebido',aReceber:'aReceber',atrRec:'atrRec',gasto:'gasto',pago:'pago',aPagar:'aPagar',atrasado:'atrasado',requisicao:'requisicao',custoFixo:'custoFixo',prov:'prov'};
  return Object.entries(m).every(([k,f])=>Math.abs(painelLinhas(k).reduce((s,x)=>s+x.valor,0)-c[f])<0.01)}));
 await p.click('.pk[data-k=gasto]');ok('clique abre a composição do gasto',await T('Composição'));await p.click('[data-act=fechar]');
 ok('carteira lista as 3 obras',await T('Carteira de obras')&&await p.evaluate(()=>OBRAS_PADRAO.length===3&&document.querySelector('#view').innerText.includes('Mozarl')));
 await p.evaluate(()=>{S.t.titulos.push({id:'tP',oc:'ocP',ocNum:'OC-P',forn:'Forn P',valor:1000,venc:'2999-01-31'},{id:'tQ',oc:'ocQ',ocNum:'OC-Q',forn:'Forn P',valor:500,venc:'2999-02-15'},{id:'tR',oc:'ocR',ocNum:'OC-R',forn:'Forn R',valor:100,venc:'2999-02-15'});S.view='fin';S.tab.fin='tit';render()});
 await p.click('[data-act=tit-parc][data-id=tP]');await p.fill('#pa-n','3');await p.click('[data-act=tit-parc-ok]');
 ok('parcelas somam o título (333,33+333,33+333,34)',await p.evaluate(()=>{const t=S.t.titulos.find(x=>x.id==='tP');return t.parcelas.length===3&&r2(t.parcelas.reduce((s,q)=>s+q.valor,0))===1000&&t.parcelas[2].valor===333.34}));
 await p.click('[data-act=tit-reneg][data-id=tQ]');await p.fill('#rn-v','450');await p.fill('#rn-d','2999-03-01');
 await p.click('[data-act=tit-reneg-ok]');ok('renegociação exige motivo',await p.evaluate(()=>S.t.titulos.find(x=>x.id==='tQ').valor===500));
 await p.fill('#rn-m','acordo');await p.click('[data-act=tit-reneg-ok]');
 ok('renegociação registra histórico e auditoria',await p.evaluate(()=>{const t=S.t.titulos.find(x=>x.id==='tQ');return t.valor===450&&t.hist.length===1&&t.hist[0].valorAntes===500&&S.t.aud.some(a=>a.campo==='renegociado')}));
 await p.evaluate(()=>{document.querySelectorAll('.tg').forEach(e=>{if(['tP','tR'].includes(e.value))e.checked=true})});await p.click('[data-act=tit-agrup]');
 ok('agrupar fornecedores diferentes é recusado',await p.evaluate(()=>!S.t.titulos.some(t=>t.agrupaDe)));
 await p.evaluate(()=>{document.querySelectorAll('.tg').forEach(e=>{e.checked=['tP','tQ'].includes(e.value)})});await p.click('[data-act=tit-agrup]');
 ok('agrupa do mesmo fornecedor: novo título = soma, originais cancelados',await p.evaluate(()=>{const g=S.t.titulos.find(t=>t.agrupaDe);return g&&g.valor===1450&&S.t.titulos.find(x=>x.id==='tP').cancelado&&S.t.titulos.find(x=>x.id==='tQ').cancelado}));
 // visual: sem overflow horizontal
 for(const w of [1400,400]){await p.setViewportSize({width:w,height:900});await p.evaluate(()=>{S.tab.pain='contrato';render()});
  ok('sem overflow horizontal a '+w+'px',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));}
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
