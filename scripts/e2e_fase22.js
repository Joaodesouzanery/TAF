// E2E Fase 22: marca, modo apresentação, dashboard e consulta de compras (Σ, colunas, Excel, importar), ficha do contrato.
const {chromium}=require('playwright');
(async()=>{
 const res=[];const ok=(n,c,d)=>res.push((c?'OK   ':'FALHA ')+n+(c||!d?'':' · '+d));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const ctx=await b.newContext({viewport:{width:1400,height:1000},colorScheme:'light'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html?demo=1');await p.waitForSelector('.kcard');await p.waitForTimeout(500);
 const E=(f,a)=>p.evaluate(f,a);const body=async()=>(await p.innerText('body')).replace(/\s+/g,' ');
 // marca
 ok('sidebar diz Grupo Nery (logo G), sem "TAF Admin"',await E(()=>document.getElementById('marca').innerText==='Grupo Nery'&&document.getElementById('marca-logo').innerText==='G'&&!/TAF Admin/.test(document.querySelector('.side').innerText)));
 // dados de teste: notas e pedidos
 await E(()=>{S.t.lfxs=S.t.lfxs.filter(l=>l.tipo!=='ped');S.t.notas.push({id:'nx1',num:'NF-9',emitente:'ACME CONSTRUTORA',valor:500,emissao:'2026-10-02',status:'conferida',rateio:[{item:S.D.items[0].codigo,valor:500,nat:'MAT',conta:'4.4.01'}]});
  S.t.sols=[{id:'s1',status:'aprovada',cots:[{forn:'ACME CONSTRUTORA',prazo:'10',preco:100}]}];
  S.t.ocs=[{id:'o1',num:'OC-0001',sol:'s1',item:S.D.items[0].codigo,nat:'MAT',ins:'',forn:'ACME CONSTRUTORA',qtd:10,preco:100,valor:1000,status:'aprovada',recebido:4,criado:'2026-10-01'},{id:'o2',num:'OC-0002',sol:'',item:S.D.items[1].codigo,nat:'MO',ins:'',forn:'BETA LTDA',qtd:5,preco:200,valor:1000,status:'recebida',recebido:5,criado:'2026-10-05'}];S.t.forns=[{id:'f1',nome:'ACME CONSTRUTORA',cnpj:'12.345.678/0001-90'}];save();render()});
 // modo apresentação
 await p.click('#ap-btn');ok('menu de apresentação com 3 chaves',await E(()=>document.querySelectorAll('#ap-menu [role=switch]').length===3&&!document.getElementById('ap-menu').hidden));
 await p.click('#ap-menu [data-k=obra]');
 ok('ocultar obra: sidebar e Início mostram só o código',await E(()=>{const t=document.querySelector('.side').innerText+document.querySelector('#view').innerText;return /Obra 342/.test(t)&&!/Santo Ant/.test(t)&&!/SANEAGO/.test(t)&&!document.getElementById('ap-faixa').hidden}));
 await p.click('#ap-menu [data-k=val]');
 ok('ocultar valores: cartões em R$ •••, % e contagens ficam',await E(()=>{const t=document.querySelector('.kgrid').innerText;return /R\$ •••/.test(t)&&!/31\.159/.test(t)&&/0,00 %/.test(t)}));
 await E(()=>{S.view='nota';S.tab={};render()});
 await p.click('#ap-menu [data-k=forn]');await E(()=>{render()});
 ok('ocultar fornecedores: emitente vira "Fornecedor NN" nas notas',await E(()=>{const t=document.querySelector('#view').innerText;return /Fornecedor 0\d/.test(t)&&!/ACME CONSTRUTORA/.test(t)}));
 await E(()=>{S.view='cdash';render()});
 ok('dashboard de compras mascarado (fornecedores e valores)',await E(()=>{const t=document.querySelector('#view').innerText;return !/ACME CONSTRUTORA|BETA LTDA/.test(t)&&!/R\$ 2\.000,00/.test(t)}));
 ok('CSV copiado sai mascarado',await E(()=>{S.view='pedc';render();const c=mascara(gradeCsv('pedc'));return !/ACME CONSTRUTORA/.test(c)&&/Fornecedor/.test(c)&&!/(^|;)1000(;|\r)/.test(c)}));
 await p.reload();await p.waitForSelector('.kcard');await p.waitForTimeout(400);
 ok('a escolha persiste após recarregar',await E(()=>apresOn()&&/R\$ •••/.test(document.querySelector('.kgrid').innerText)));
 await p.click('#ap-btn');for(const k of ['obra','forn','val'])await p.click(`#ap-menu [data-k=${k}]`);
 ok('desligar tudo restaura nomes e valores',await E(()=>{const t=document.querySelector('.side').innerText+document.querySelector('.kgrid').innerText;return /Santo Ant/.test(t)&&!/•••/.test(t)&&document.getElementById('ap-faixa').hidden}));
 await p.click('#crumb');
 // compras: dashboard
 await E(()=>{S.view='cdash';render()});
 const kv=t=>E(t=>[...document.querySelectorAll('#view .kcard')].find(k=>k.querySelector('.kt').innerText.toLowerCase()===t).querySelector('.kv').innerText.replace(/\s/g,' '),t);
 ok('dashboard: 2 pedidos, R$ 2.000,00, entregue 1.400, pendente 600',await kv('pedidos')==='2'&&await kv('valor pedido')==='R$ 2.000,00'&&await kv('entregue')==='R$ 1.400,00'&&await kv('pendente')==='R$ 600,00');
 ok('dashboard: 1 atrasado e prazo médio de 10 dias',await kv('atrasados')==='1'&&await kv('prazo médio')==='10 dias');
 ok('gráficos por fornecedor, obra, natureza, mês e previsão',await E(()=>/por fornecedor/i.test(document.querySelector('#view').innerText)&&/por obra/i.test(document.querySelector('#view').innerText)&&/por natureza/i.test(document.querySelector('#view').innerText)&&/por mês/i.test(document.querySelector('#view').innerText)&&/previsão de entrega/i.test(document.querySelector('#view').innerText)));
 // consulta
 await E(()=>{S.view='pedc';render()});
 ok('consulta tem as 22 colunas e 2 linhas',await E(()=>document.querySelectorAll('.grw[data-id=pedc] thead th').length===22&&document.querySelectorAll('.grw[data-id=pedc] tbody tr').length===2));
 ok('Pedido pendente?: S para a OC com saldo, N para a recebida',await E(()=>{const r=S.grRows.pedc;return r.find(x=>x.nrPedido==='OC-0001').pend==='S'&&r.find(x=>x.nrPedido==='OC-0002').pend==='N'}));
 await p.click('[data-act=gr-sum][data-id=pedc]');
 ok('Σ Estatísticas: soma, média, ocorrências, maior e menor (Vlr. total 2.000 / 1.000 / 2 / 1.000 / 1.000)',await E(()=>{const r=[...document.querySelectorAll('#mbox tbody tr')].find(x=>/Vlr\. total/i.test(x.cells[0].innerText));const c=[...r.cells].map(x=>x.innerText.replace(/\s/g,' '));return c[1]==='R$ 2.000,00'&&c[2]==='R$ 1.000,00'&&c[3]==='2'&&c[4]==='R$ 1.000,00'&&c[5]==='R$ 1.000,00'}));
 ok('estatística de Qtd.: soma 15',await E(()=>{const r=[...document.querySelectorAll('#mbox tbody tr')].find(x=>/^Qtd\.$/i.test(x.cells[0].innerText.trim()));return r&&r.cells[1].innerText.trim()==='15'}));
 await p.click('#mbox [data-act=cfg-cancel]');
 await p.click('[data-act=gr-cfg][data-id=pedc]');await p.uncheck('#mbox [data-colk=empresa]');await p.click('[data-act=col-save]');
 ok('esconder coluna Empresa: 21 colunas',await E(()=>document.querySelectorAll('.grw[data-id=pedc] thead th').length===21));
 await p.click('[data-act=gr-cfg][data-id=pedc]');await p.click('[data-act=col-reset]');ok('restaurar padrão: 22 colunas',await E(()=>document.querySelectorAll('.grw[data-id=pedc] thead th').length===22));
 ok('planilha Excel gerada com o cabeçalho e as linhas',await E(()=>{const x=gradeXls('pedc');return /Nr\. único/.test(x)&&/OC-0002/.test(x)&&/<table/.test(x)&&x.split('<tr>').length===4}));
 await p.fill('.gr-q[data-id=pedc]','beta');ok('busca filtra a grade',await E(()=>[...document.querySelectorAll('.grw[data-id=pedc] tbody tr')].filter(r=>r.style.display!=='none').length===1));
 // importar pedidos
 await p.selectOption('#role','compras');await E(()=>{S.view='pain';S.tab.pain='imp';render()});
 const ped='Nr. Único\tNr. Pedido\tPedido Pendente?\tDt. Negociação\tPrev. Entrega\tCód. Empresa\tEmpresa\tCód. Parceiro\tParceiro\tNº Contrato\tObra (Contrato)\tCód. Produto\tProduto\tVolume\tVlr. Unitário\tQtd.\tVlr. Total\tQtd. Entregue\tQtd. Pendente\n441\t64\tS\t26/09/2024\t08/10/2024\t1\tTAF\t493\tNS TUBOS E MATERIAIS\t342\tTESTE\t5000073\tPARAFUSO SEXT\tUN\t10,00\t100\t1.000,00\t40\t60\n442\t65\tN\t27/09/2024\t\t1\tTAF\t494\tOUTRO FORN\t342\tTESTE\t5000074\tARRUELA\tUN\t2,00\t50\t100,00\t50\t0';
 await p.fill('#pd-txt',ped);await p.click('[data-act=ped-imp]');
 ok('importar pedidos: 2 novos',await E(()=>S.t.lfxs.filter(l=>l.tipo==='ped').length===2));
 await p.fill('#pd-txt',ped);await p.click('[data-act=ped-imp]');ok('reimportar não duplica',await E(()=>S.t.lfxs.filter(l=>l.tipo==='ped').length===2));
 ok('pedidos importados ficam fora do gasto e da provisão',await E(()=>{const c=painelCalc();return c.gasto===31659.67&&c.pago+c.aPagar+c.atrasado===c.gasto}));
 await E(()=>{S.view='pedc';render()});ok('consulta mostra os 4 pedidos (2 do sistema + 2 importados)',await E(()=>document.querySelectorAll('.grw[data-id=pedc] tbody tr').length===4));
 // ficha do contrato
 await p.selectOption('#role','gestao');await E(()=>{S.view='ctr';render()});
 ok('lista de contratos de obra com as 3 obras e colunas do Sankhya',await E(()=>document.querySelectorAll('.grw[data-id=ctrlist] tbody tr').length===3&&document.querySelectorAll('.grw[data-id=ctrlist] thead th').length===14));
 await p.click('tr.clk[data-cod="342"]');await p.waitForSelector('#mbox .tabs');
 ok('ficha com as 7 abas',await E(()=>[...document.querySelectorAll('#mbox [role=tab]')].map(x=>x.innerText.trim()).join('|')==='Geral|Responsáveis|Anexos|Extrato mov.|Produtos/Serviços|Provisões financeiras|Pedidos/Notas'));
 ok('Geral: parceiro 1246 SANEAMENTO, contrato 29/07/2026 a 26/08/2027, projeto 10010007, IE 100133576',await E(()=>{const v=[...document.querySelectorAll('#mbox [data-fi]')].map(x=>x.value).join('|');return /1246/.test(v)&&/SANEAMENTO DE GOIAS S\/A/.test(v)&&/2026-07-29/.test(v)&&/2027-08-26/.test(v)&&/10010007/.test(v)&&/100133576/.test(v)}));
 ok('Geral: gasto (31.659,67 com a nota de teste) e % lucro calculados',await E(()=>/31\.659,67/.test(document.querySelector('#mbox').innerText.replace(/\s/g,' '))&&/%/.test(document.querySelector('#mbox').innerText)));
 await p.click('[data-act=ficha-tab][data-t=resp]');
 ok('Responsáveis: gerente 130 FABRICIO.OLIVEIRA, gestor 81, eng. de campo 126, analista 115',await E(()=>{const v=[...document.querySelectorAll('#mbox [data-fi]')].map(x=>x.value).join('|');return /130\|FABRICIO\.OLIVEIRA/.test(v)&&/81\|ALECIO\.VINICIUS/.test(v)&&/126\|MARKO\.LUIZ/.test(v)&&/115\|GUSTAVO\.TERHORST/.test(v)}));
 await p.fill('[data-fi="resp.gerente.nome"]','TIAGO.MARINHO');await p.click('[data-act=fi-salvar]');
 ok('salvar a ficha muda o gerente e o filtro do Início',await E(()=>{const g=cadDe('342',S.t).gerente==='TIAGO.MARINHO';S.flt={empresa:[],gerente:['TIAGO.MARINHO'],vendedor:[],tipo:[],situacao:[],obras:[]};const r=obrasSel().join()==='342';S.flt={empresa:[],gerente:[],vendedor:[],tipo:[],situacao:[],obras:[]};return g&&r&&S.t.aud.some(a=>a.ent==='contrato')}));
 await p.click('[data-act=ficha-tab][data-t=anx]');await p.fill('#fa-n','Contrato assinado');await p.fill('#fa-u','https://exemplo.com/c.pdf');await p.click('[data-act=fi-anx]');
 ok('Anexos: documento adicionado com link',await E(()=>/Contrato assinado/.test(document.querySelector('#mbox').innerText)&&fichaAtual().anexos.length===1));
 await p.click('[data-act=fi-anx-del]');ok('Anexos: remover',await E(()=>fichaAtual().anexos.length===0));
 await p.click('[data-act=ficha-tab][data-t=ext]');ok('Extrato mov.: as 15 naturezas importadas + as do sistema e botão do extrato completo',await E(()=>document.querySelectorAll('.grw[data-id=ficha_ext] tbody tr').length>=16&&!!document.querySelector('[data-act=fi-ext]')));
 await p.click('[data-act=ficha-tab][data-t=prod]');ok('Produtos/Serviços: um por item da EAP',await E(()=>document.querySelectorAll('.grw[data-id=ficha_prod] tbody tr').length===S.D.items.length));
 await p.click('[data-act=ficha-tab][data-t=prov]');
 ok('Provisões: total do extrato (62.723,55) + pedidos sem nota, com produtos e serviços',await E(()=>{const t=document.querySelector('#mbox').innerText.replace(/\s/g,' ');return /Produtos/.test(t)&&/Serviços/.test(t)&&S.grRows.ficha_prov.some(r=>r.tipo==='Serviço'&&Math.abs(r.valor-39150)<.01)&&S.grRows.ficha_prov.some(r=>r.tipo==='Produto'&&Math.abs(r.valor-19830.5)<.01)}));
 await p.click('[data-act=ficha-tab][data-t=ped]');ok('Pedidos/Notas: pedidos e a nota lançada',await E(()=>S.grRows.ficha_ped.length>=4&&S.grRows.ficha_nf.some(n=>n.num==='NF-9')));
 await p.click('#mbox [data-act=fechar]');
 await p.selectOption('#role','engenheiro');await E(()=>{fichaAbre('geral')});
 ok('engenheiro vê a ficha, mas não salva',await E(()=>document.querySelector('[data-act=fi-salvar]').disabled&&[...document.querySelectorAll('#mbox [data-fi]')].every(x=>x.readOnly||x.disabled)));
 await p.click('#mbox [data-act=fechar]');
 // contraste e mobile
 const cr=await E(()=>{const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};const px=x=>(x.match(/[\d.]+/g)||[0,0,0]).map(Number),bad=[];
  const bgDe=e=>{while(e){const bg=getComputedStyle(e).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)')return px(bg);e=e.parentElement}return [255,255,255]};
  const chk=(th,sel)=>document.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!e.innerText.trim())return;const l1=lum(px(getComputedStyle(e).color)),l2=lum(bgDe(e)),q=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);if(q<4.5)bad.push(th+' '+sel.split(',')[0]+' '+e.className+' '+q.toFixed(2))});
  for(const th of ['light','dark']){document.documentElement.dataset.theme=th;S.apMenu=true;paintApres();chk(th,'.apbtn,.apmenu button,.apfaixa');S.apMenu=false;paintApres();S.view='pedc';render();chk(th,'.grw th,.grw td,.dtools .btn,.kcard .kt');S.view='ctr';render();chk(th,'.grw th,.grw td');fichaAbre('geral');chk(th,'#mbox label,#mbox .k-l,#mbox .v,#mbox .tabs button');closeModal()}
  document.documentElement.dataset.theme='';render();return bad.length?[...new Set(bad)].slice(0,8).join(' | '):true});
 ok('contraste do menu de apresentação, grades e ficha nos dois temas',cr===true,cr);
 await p.setViewportSize({width:400,height:900});
 ok('mobile 400px: dashboard e consulta sem overflow horizontal',await E(()=>{const r=[];for(const v of ['cdash','pedc','ctr','dash']){S.view=v;render();r.push(document.documentElement.scrollWidth<=innerWidth+1)}return r.every(Boolean)}));
 console.log(res.join('\n'));console.log('erros JS:',JSON.stringify(errs));await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message);process.exit(1)});
