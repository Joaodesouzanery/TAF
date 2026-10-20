// E2E Fase 21: Painel de Contratos no Início (filtros, 8 cartões, composição), detalhe por natureza → lançamentos, extrato importado, 3 obras.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c,d)=>res.push((c?'OK   ':'FALHA ')+n+(c||!d?'':' · '+d));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1400,height:1000},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');await p.waitForSelector('.kcard');await p.waitForTimeout(400);
 const E=(f,a)=>p.evaluate(f,a);const txt=async s=>(await p.innerText(s));
 const card=k=>E(k=>document.querySelector(`.kcard[data-k=${k}] .kv`).innerText.replace(/\s/g,' '),k);
 // cartões e filtros
 ok('8 cartões: gasto, custo fixo, prov., faturado, fat. direto, saldo, impostos, lucro',await E(()=>[...document.querySelectorAll('.kcard')].map(k=>k.dataset.k).join()==='gasto,custoFixo,prov,fat,fatDireto,saldoFat,impostos,lucro'));
 ok('padrão: as 3 obras, sem filtro',await E(()=>obrasSel().join()==='342,343,281'&&nFlt()===0));
 await p.click('[data-act=flt-open]');ok('painel de filtros com os 6 grupos',await E(()=>document.querySelectorAll('.fpanel fieldset').length===6&&/Empresa/i.test(document.querySelector('.fpanel').innerText)&&/Gerente/i.test(document.querySelector('.fpanel').innerText)&&/Vendedor/i.test(document.querySelector('.fpanel').innerText)&&/Tipo de contrato/i.test(document.querySelector('.fpanel').innerText)&&/Situação/i.test(document.querySelector('.fpanel').innerText)&&/Nº do contrato/i.test(document.querySelector('.fpanel').innerText)));
 await p.click('.fpanel [data-g=obras][data-v="342"]');
 ok('Nº do contrato = 342 filtra e mostra o contador',await E(()=>obrasSel().join()==='342'&&/Filtros · 1/.test(document.querySelector('[data-act=flt-open]').innerText)));
 await p.keyboard.press('Escape');ok('Esc fecha o painel',await E(()=>!document.querySelector('.fpanel')));
 ok('342: gasto 31.159,67 (pago 28.709,84 + a pagar 2.449,83; sem o adiantamento)',await card('gasto')==='R$ 31.159,67'&&await E(()=>/28\.709,84/.test(document.querySelector('.kcard[data-k=gasto]').innerText)&&/2\.449,83/.test(document.querySelector('.kcard[data-k=gasto]').innerText)));
 ok('342: prov. gasto 62.723,55; custo fixo 0; faturado 0; fat. direto 0; impostos 0',await card('prov')==='R$ 62.723,55'&&await card('custoFixo')==='R$ 0,00'&&await card('fat')==='R$ 0,00'&&await card('fatDireto')==='R$ 0,00'&&await card('impostos')==='R$ 0,00');
 ok('342: saldo a faturar = contrato (3.257.970,74)',await card('saldoFat')==='R$ 3.257.970,74');
 ok('342: lucro do painel −93.883,22 e lucro com custo fixo previsto de 5 %',await card('lucro')==='-R$ 93.883,22'&&await E(()=>{const c=painelCalc();return c.lucroPrev===Math.round((-93883.22-c.cfPrev)*100)/100&&Math.abs(c.cfPrev-162898.54)<.01}));
 await p.click('[data-act=prov-tog]');ok('desligar "considera provisão" zera prov. e o lucro vira −31.159,67',await card('prov')==='R$ 0,00'&&await card('lucro')==='-R$ 31.159,67');
 await p.click('[data-act=prov-tog]');ok('ligar de novo restaura',await card('prov')==='R$ 62.723,55');
 // vazio = 0 nas outras obras
 ok('343 e 281 sem extrato: tudo 0',await E(()=>['343','281'].every(c=>{const k=kpisObra(c);return k&&k.gasto===0&&k.prov===0&&k.fat===0})));
 // filtros por cadastro
 await E(()=>{CAD_PAD['343']={tipo:'Ata',situacao:'Financeiro',gerente:'THADEU.FIDELIS'};CAD_PAD['281']={tipo:'Comissão',situacao:'Fechada',vendedor:'THALITA.SILVA'};S.flt={empresa:[],gerente:[],vendedor:[],tipo:[],situacao:[],obras:[]};render()});
 ok('filtro por tipo',await E(()=>{S.flt.tipo=['Ata'];const r=obrasSel().join();S.flt.tipo=[];return r==='343'}));
 ok('filtro por situação',await E(()=>{S.flt.situacao=['Fechada'];const r=obrasSel().join();S.flt.situacao=[];return r==='281'}));
 ok('filtro por gerente e por vendedor',await E(()=>{S.flt.gerente=['THADEU.FIDELIS'];const a=obrasSel().join();S.flt.gerente=[];S.flt.vendedor=['THALITA.SILVA'];const c=obrasSel().join();S.flt.vendedor=[];return a==='343'&&c==='281'}));
 ok('filtro por empresa',await E(()=>{S.flt.empresa=['TAF EQUIPAMENTOS E SERVICOS LTDA'];const r=obrasSel().length;S.flt.empresa=[];return r===3}));
 ok('filtros sem resultado mostram aviso e "Limpar"',await E(()=>{S.flt.tipo=['Ata'];S.flt.situacao=['Fechada'];render();const r=/Nenhuma obra/.test(document.querySelector('#view').innerText);S.flt.tipo=[];S.flt.situacao=[];render();return r}));
 await E(()=>{S.flt.obras=[];render()});
 ok('composição do contrato: uma barra por obra + total',await E(()=>document.querySelectorAll('.crow').length===4));
 // detalhe
 await E(()=>{S.flt.obras=['342'];render()});
 await p.click('.kcard[data-k=gasto]');
 ok('detalhe do gasto: 15 naturezas com as 18 colunas e total',await E(()=>document.querySelectorAll('#mbox tbody tr').length===15&&document.querySelectorAll('#mbox thead th').length===18));
 ok('total da coluna Gasto = 32.908,67 (adiantamento aparece na tabela)',await E(()=>[...document.querySelectorAll('#mbox tfoot td')].some(t=>t.innerText.replace(/\s/g,' ')==='R$ 32.908,67')));
 ok('coluna do cartão destacada',await E(()=>!!document.querySelector('#mbox th.hl')&&document.querySelector('#mbox th.hl').innerText.trim().toLowerCase()==='gasto'));
 await p.fill('#det-q','combust');ok('busca na tabela filtra as linhas',await E(()=>[...document.querySelectorAll('#mbox tbody tr')].filter(r=>r.style.display!=='none').length===1));
 await p.fill('#det-q','');
 await p.click('#mbox tr.clk[data-c="1040302"]');
 ok('clicar na natureza abre os lançamentos (nota 397, R$ 594,00, 15 colunas)',await E(()=>document.querySelectorAll('#mbox thead th').length===15&&/397/.test(document.querySelector('#mbox tbody').innerText)&&/594,00/.test(document.querySelector('#mbox tbody').innerText)&&/RESTAURANTE DELICIA/.test(document.querySelector('#mbox tbody').innerText)));
 await p.click('[data-act=det-back]');ok('voltar às naturezas',await E(()=>document.querySelectorAll('#mbox tbody tr').length===15));
 await p.click('[data-act=det-cfg]');ok('configuração de colunas abre com 18 opções',await E(()=>document.querySelectorAll('#mbox [data-colk]').length===18));
 await p.uncheck('#mbox [data-colk=impF]');await p.click('#mbox [data-act=col-down][data-k=cod]');await p.click('[data-act=col-save]');
 ok('coluna escondida some e a ordem muda',await E(()=>document.querySelectorAll('#mbox thead th').length===17&&document.querySelector('#mbox thead th').innerText.trim().toLowerCase()==='natureza'));
 await E(()=>{abreDet({cfg:true})});await p.click('[data-act=col-reset]');ok('restaurar padrão volta às 18 colunas',await E(()=>document.querySelectorAll('#mbox thead th').length===18));
 ok('copiar CSV responde',await E(()=>{try{ACOES['det-csv']();return true}catch(e){return false}}));
 await p.click('#mbox [data-act=fechar]');
 // cadastro da obra
 await p.selectOption('#role','gestao');await p.click('[data-act=cad-obra]');await p.selectOption('#cd-ger','FABRICIO.OLIVEIRA');await p.selectOption('#cd-sit','Financeiro');await p.fill('#cd-cf','4');await p.click('[data-act=cad-obra-ok]');
 ok('cadastro da obra grava gerente, situação e custo fixo previsto',await E(()=>{const c=cadDe('342',S.t);return c.gerente==='FABRICIO.OLIVEIRA'&&c.situacao==='Financeiro'&&Math.abs(painelCalc().cfPrev-130318.83)<.01}));
 ok('o cadastro vira opção de filtro',await E(()=>{S.flt.obras=[];S.flt.gerente=['FABRICIO.OLIVEIRA'];const r=obrasSel().join();S.flt.gerente=[];S.flt.obras=['342'];return r==='342'}));
 await E(()=>{S.t.par.cfPrevPct=5;S.t.par.cad={};render()});
 // importar extrato (colar) numa obra limpa
 await E(()=>{S.t.lfxs=[];S.t.par.extratoCorte='';render()});ok('sem extrato: painel em 0',await card('gasto')==='R$ 0,00'&&await card('prov')==='R$ 0,00');
 await p.selectOption('#role','financeiro');await E(()=>{S.tab.pain='imp';S.view='pain';render()});
 const nat='Cód. Natureza\tNatureza\tFaturado\tCód. CR.\tCentro de Resultado\tSaldo Por CR\tFaturado (Recebido)\tFaturado (A Receber)\tFaturado (Atrasado)\tGasto\tGasto (Pago)\tGasto (A Pagar)\tGasto (Atrasado)\tGasto (Requisição)\tProv. Gasto\tImpostos Débito\tImposto Crédito\tImposto Final\n1050101\tDESPESA COMBUSTIVEL\t0\t104023\tCONSTRUÇÃO CIVIL - OBRAS\t-100\t0\t0\t0\t100\t60\t40\t0\t0\t10\t0\t0\t0\n2010101\tDESPESA ADIANTAMENTO A FORNECEDORES\t0\t104023\tCONSTRUÇÃO CIVIL - OBRAS\t-50\t0\t0\t0\t50\t50\t0\t0\t0\t0\t0\t0\t0';
 await p.fill('#ex-nat',nat);await p.fill('#ex-natcod','1050101');await p.fill('#ex-lan','Origem\tReceita/Despesa\tProvisão?\tNr. Nota\tEmpresa\tParceiro\tVlr. Desdobramento\tVlr. Nota\tDt. Negociação\tDt. Baixa\tVendedor/Comprador\tDt. Vencimento\tTOP\tDescrição TOP\tTipo Movimento\nEstoque\tDespesa\tNão\t9\tTAF\tPOSTO X\t100,00\t100,00\t01/10/2026\t\t<SEM VENDEDOR>\t30/10/2026\t1403\tUSO\tC-Compra');
 await p.click('[data-act=ex-imp]');await E(()=>{S.view='dash';S.tab={};render()});await p.waitForSelector('.kcard');
 ok('extrato colado: gasto 100 (adiantamento fora), pago 60, a pagar 40, prov 10',await card('gasto')==='R$ 100,00'&&await card('prov')==='R$ 10,00'&&await E(()=>{const c=painelCalc();return c.pago===60&&c.aPagar===40}));
 await E(()=>{S.view='pain';S.tab.pain='imp';render()});await p.fill('#ex-lan','Origem\tReceita/Despesa\tProvisão?\tNr. Nota\tEmpresa\tParceiro\tVlr. Desdobramento\tVlr. Nota\tDt. Negociação\tDt. Baixa\tVendedor/Comprador\tDt. Vencimento\tTOP\tDescrição TOP\tTipo Movimento\nEstoque\tDespesa\tNão\t9\tTAF\tPOSTO X\t100,00\t100,00\t01/10/2026\t\t<SEM VENDEDOR>\t30/10/2026\t1403\tUSO\tC-Compra');await p.fill('#ex-natcod','1050101');await p.click('[data-act=ex-imp]');
 ok('reimportar o lançamento não duplica e o detalhe não entra no total',await E(()=>S.t.lfxs.filter(l=>l.detalhe).length===1&&painelCalc().gasto===100));
 // tema e contraste
 const cr=await E(()=>{S.view='dash';render();const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const px=x=>(x.match(/[\d.]+/g)||[0,0,0]).map(Number),bad=[];
  const bgDe=e=>{while(e){const bg=getComputedStyle(e).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)')return px(bg);e=e.parentElement}return [255,255,255]};
  for(const th of ['light','dark']){document.documentElement.dataset.theme=th;render();S.popFlt=true;render();document.querySelectorAll('.kcard .kt,.kcard .kv,.kcard .ksub,.kcard .kgo,.fpanel legend,.fpanel [role=checkbox],.crow .cl,.crow .cv,.pbar .pill').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width)return;const l1=lum(px(getComputedStyle(e).color)),l2=lum(bgDe(e)),q=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(q<4.5)bad.push(th+' '+e.className+' '+q.toFixed(2))});S.popFlt=false}
  document.documentElement.dataset.theme='';render();return bad.length?[...new Set(bad)].join(' | '):true});
 ok('contraste dos cartões, filtros e composição nos dois temas',cr===true,cr);
 // mobile
 await p.setViewportSize({width:400,height:900});await E(()=>{S.view='dash';S.popFlt=false;render()});
 ok('mobile 400px: sem overflow horizontal e cartões em 1 coluna',await E(()=>document.documentElement.scrollWidth<=innerWidth+1&&getComputedStyle(document.querySelector('.kgrid')).gridTemplateColumns.split(' ').length===1));
 await p.click('.kcard[data-k=gasto]');ok('mobile: detalhe cabe na tela (a tabela rola por dentro)',await E(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
