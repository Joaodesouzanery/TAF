// E2E Fase 10 (modo aberto): importar XML de NF-e (sintético), duplicidade por chave, rateio, fechamento ao contador.
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]||'/tmp',res=[];const ok=(n,c)=>res.push((c?'OK   ':'FALHA ')+n);
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.big');
 const role=r=>p.selectOption('#role',r),nav=v=>p.evaluate(v=>{S.view=v;render()},v),T=async s=>(await p.innerText('body')).toLowerCase().includes(s.toLowerCase());
 const hoje=await p.evaluate(()=>hojeISO());const chave='35'+'2610'+'12345678000195'+'55'+'001'+'000000123'+'1'+'12345678'+'0';
 const xml=(ch,v)=>`<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe${ch}" versao="4.00"><ide><nNF>123</nNF><serie>1</serie><dhEmi>${hoje}T10:00:00-03:00</dhEmi></ide><emit><CNPJ>12345678000195</CNPJ><xNome>Fornecedor Teste Ltda</xNome></emit><det nItem="1"><prod><xProd>Tubo FoFo DN300</xProd><qCom>2.0000</qCom><vProd>${v}</vProd></prod></det><total><ICMSTot><vNF>${v}</vNF></ICMSTot></total></infNFe></NFe></nfeProc>`;
 ok('chave sintética tem 44 dígitos',chave.length===44);
 await role('adm');await nav('nota');await p.click('[data-act=xml-novo]');await p.fill('#x-t',xml(chave,'1600.00'));await p.click('[data-act=xml-ok]');
 ok('XML importado vira nota na fila sem rateio',await p.evaluate(c=>S.t.notas.some(n=>n.chave===c&&n.status==='lancada'&&n.valor===1600&&n.cnpj==='12345678000195'&&n.itensXml.length===1),chave));
 await p.fill('#x-t',xml(chave,'1600.00'));await p.click('[data-act=xml-ok]');
 ok('mesma chave é recusada (duplicidade)',await p.evaluate(()=>S.t.notas.length===1)&&await T('chave já lançada'));
 await p.fill('#x-t','<xml>quebrado');await p.click('[data-act=xml-ok]');ok('XML inválido é recusado sem quebrar',await p.evaluate(()=>S.t.notas.length===1));
 await p.click('[data-act=fechar]');
 // lançamento manual com a mesma chave também é barrado
 await p.click('[data-act=nova-nf]');await p.fill('#n-e','Outro');await p.fill('#n-c',chave);await p.fill('#n-v','10');await p.fill('#n-j','teste');await p.click('[data-act=nf-ok][data-modo=lancada]');
 ok('lançamento manual com chave repetida é barrado',await p.evaluate(()=>S.t.notas.length===1));
 await p.click('[data-act=fechar]');
 // ratear: sem fechar 100% é recusado; fechando grava
 await p.click('[data-act=ratear]');const cod=await p.evaluate(()=>S.D.items.find(i=>i.qtd>=1).codigo);
 await p.selectOption('[data-lin="0"][data-f=item]',cod);await p.fill('[data-lin="0"][data-f=valor]','1000');await p.click('[data-act=nf-ok][data-modo=rateada]');
 ok('rateio de 1000 em 1600 é recusado',await p.evaluate(()=>S.t.notas[0].status==='lancada'));
 await p.fill('[data-lin="0"][data-f=valor]','1600');await p.click('[data-act=nf-ok][data-modo=rateada]');
 ok('rateio fechando 100% grava',await p.evaluate(()=>S.t.notas[0].status==='rateada'&&S.t.notas[0].rateio[0].conta));
 // fechamento
 await role('financeiro');await nav('fin');await p.click('.tabs button[data-t=fech]');
 await p.fill('#f-cno','90.123.45678/12');await p.dispatchEvent('#f-cno','change');
 ok('integrações aparecem e avisam que exigem login',await T('Requer login')&&await T('NF-e recebidas (provedor)'));
 await p.click('[data-act=fech-csv]');
 const csv=await p.inputValue('#f-out');
 ok('arquivo do contador traz chave, CNPJ, conta, item e CNO',csv.includes(chave)&&csv.includes('12345678000195')&&csv.includes(cod)&&csv.includes('90.123.45678/12')&&csv.split('\n').length>=2);
 ok('valores com vírgula decimal e separador ;',csv.includes('1600,00')&&csv.split('\n')[0].includes(';'));
 await p.click('[data-act=fech-sk]');ok('arquivo de apoio Sankhya gerado',(await p.inputValue('#f-out')).startsWith('centro_resultado;natureza_conta'));
 await p.click('[data-act=fech-fechar]');ok('competência fechada e registrada',await p.evaluate(()=>S.t.fechs.length===1)&&await T('Fechada em'));
 await p.screenshot({path:out+'/fiscal.png'});
 await role('almox');await nav('fin');await p.click('.tabs button[data-t=fech]');ok('almoxarife não fecha competência',await p.isDisabled('[data-act=fech-fechar]'));
 await p.reload();await p.waitForSelector('.big');ok('estado persiste',await p.evaluate(()=>S.t.notas.length===1&&S.t.fechs.length===1&&S.t.par.cno==='90.123.45678/12'));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n').slice(0,4).join(' '));process.exit(1)});
