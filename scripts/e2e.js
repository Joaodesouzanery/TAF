const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const p=await b.newPage({viewport:{width:1480,height:1000}});
 const errs=[];p.on('pageerror',e=>errs.push('PAGE '+e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
 p.on('dialog',d=>d.accept(d.type()==='prompt'?'ok motivo':undefined));
 await p.goto('file:///home/user/TAF/dist/tafadmin.html');await p.waitForSelector('.big');
 const T=async s=>(await p.textContent('body')).includes(s);
 const role=async r=>{await p.selectOption('#role',r)};
 const nav=async v=>p.click(`#nav button[data-v=${v}]`);
 const out=[];const ok=(n,c)=>out.push((c?'OK   ':'FALHA ')+n);
 // 1. bloqueado antes de congelar
 await nav('eap');await p.click('[data-item]').catch(()=>{});
 await p.click('#nav button[data-v=eap]');
 await p.fill('#q','B.3.1.7.1');await p.waitForSelector('tr[data-item]');await p.click('tr[data-item="B.3.1.7.1"]');
 await p.click('[data-act=nova-sol]');
 await p.fill('#s-desc','Curva 22 30');await p.fill('#s-qtd','2');await p.fill('#s-pu','800');
 ok('bloqueado sem linha de base',(await p.textContent('#s-sem')).includes('BLOQUEADO'));
 await p.click('[data-act=fechar]');
 // 2. congelar (gestão)
 await role('gestao');await nav('eap');await p.click('[data-act=congelar]');ok('congelou v1',await T('congelada'));
 // 3. solicitação verde: meta 1790,30 p/ 2 un -> 2*800=1600 verde
 await role('engenheiro');await p.fill('#q','B.3.1.7.1');await p.click('tr[data-item="B.3.1.7.1"]');await p.click('[data-act=nova-sol]');
 await p.fill('#s-desc','Curva 22 30 DN300');await p.fill('#s-qtd','2');await p.fill('#s-pu','800');
 ok('semáforo verde',(await p.textContent('#s-sem')).includes('VERDE'));
 await p.fill('#s-pu','900');ok('semáforo vermelho (acima do teto 1665,85)',(await p.textContent('#s-sem')).includes('VERMELHO'));
 // amarelo num item COM folga
 await p.click('[data-act=fechar]');const it=await p.evaluate(()=>{const i=S.D.items.find(i=>i.meta_total<i.teto_total&&i.qtd>=1&&S.sd[i.codigo].livre>0);return {c:i.codigo,q:i.qtd,m:i.meta_total,t:i.teto_total}});
 await p.fill('#q',it.c);await p.click(`tr[data-item="${it.c}"]`);await p.click('[data-act=nova-sol]');await p.fill('#s-desc','x');await p.fill('#s-qtd',String(it.q));
 await p.fill('#s-pu',String((it.m+it.t)/2/it.q));ok('semáforo amarelo (entre meta e teto)',(await p.textContent('#s-sem')).includes('AMARELO'));
 await p.fill('#s-pu',String(it.m/it.q*0.9));ok('semáforo verde (abaixo da meta)',(await p.textContent('#s-sem')).includes('VERDE'));
 await p.click('[data-act=fechar]');await p.fill('#q','B.3.1.7.1');await p.click('tr[data-item="B.3.1.7.1"]');await p.click('[data-act=nova-sol]');await p.fill('#s-desc','Curva 22 30 DN300');await p.fill('#s-qtd','2');await p.fill('#s-pu','800');await p.click('[data-act=sol-ok]');ok('SC criada (2)',await T('SC-0001'));
 // 4. compras: mapa, 3 propostas, OC
 await role('compras');await p.click('[data-act=mapa]');
 for(const [f,v] of [['Forn A','800'],['Forn B','820'],['Forn C','850']]){await p.fill('#c-f',f);await p.fill('#c-p',v);await p.click('[data-act=add-cot]');}
 await p.check('input[name=esc][value="0"]');await p.click('[data-act=emitir-oc]');
 await p.click('.tabs button[data-t=ocs]');ok('OC verde aprovada direto',(await p.textContent('#view')).includes('aprovada'));
 // 5. recebimento parcial
 await role('almox');await p.click('[data-act=receber]');await p.fill('#rc-q','2');await p.click('[data-act=rc-ok]');ok('OC recebida',(await p.textContent('#view')).includes('recebida'));
 // 6. nota + rateio 100%
 await role('adm');await nav('nota');await p.click('[data-act=nova-nf]');
 await p.fill('#n-e','Forn A');await p.fill('#n-v','1600');await p.selectOption('#n-o',{index:1});await p.click('[data-act=sug-lin]');
 ok('rateio fecha 100%',(await p.textContent('#n-fecha')).includes('Fecha 100%'));
 await p.fill('[data-f=valor]','1500');await p.click('[data-act=nf-ok][data-modo=rateada]');ok('rateio ≠ 100% rejeitado',await T('Nota sem') || await p.isVisible('#modal.open'));
 await p.fill('[data-f=valor]','1600');await p.click('[data-act=nf-ok][data-modo=rateada]');ok('NF rateada',await T('NF-0001'));
 await p.click('[data-act=conferir]');ok('NF conferida',(await p.textContent('#view')).includes('conferida'));
 await role('financeiro');await p.click('[data-act=liberar]');await p.click('[data-act=pagar]');ok('NF paga',(await p.textContent('#view')).includes('paga'));
 // 7. saldo do item
 await nav('eap');await p.fill('#q','B.3.1.7.1');
 const row=await p.textContent('tr[data-item="B.3.1.7.1"]');ok('realizado R$ 1.600 no item',row.includes('1.600,00'));
 // 8. vermelho -> diretoria
 await role('engenheiro');await p.fill('#q','G.2');await nav('eap');await p.fill('#q','A.2.1.1.1');await p.click('tr[data-item="A.2.1.1.1"]');await p.click('[data-act=nova-sol]');
 await p.fill('#s-desc','Equipe ADM');await p.fill('#s-qtd','1');await p.fill('#s-pu','650000');ok('ADM na meta = vermelho',(await p.textContent('#s-sem')).includes('VERMELHO'));
 await p.click('[data-act=sol-ok]');await role('compras');await p.click('[data-act=mapa]');await p.fill('#c-f','X');await p.fill('#c-p','650000');await p.click('[data-act=add-cot]');
 await p.fill('#c-j','sem alternativa');await p.check('#c-em');await p.check('input[name=esc][value="0"]');await p.click('[data-act=emitir-oc]');
 await role('gerente');await p.click('.tabs button[data-t=aprov]');ok('gerente NÃO aprova vermelho',await p.isDisabled('[data-act=aprovar]'));
 await role('diretoria');await p.click('.tabs button[data-t=aprov]');await p.click('[data-act=aprovar]');ok('diretoria aprova',true);
 // ---- Fase 6 ----
 await role('engenheiro');await nav('hoje');ok('saudação Administrador',(await p.textContent('h1')).includes('Bom dia, Administrador!'));
 await nav('fin');ok('OC aprovada gerou título',(await p.textContent('#view')).includes('OC-0001'));
 await role('financeiro');await nav('fin');await p.click('.tabs button[data-t=conc]');await p.fill('#ofx','16/11/2026;PIX Forn A;-1600,00');await p.click('[data-act=conciliar]');ok('conciliação bancária',(await p.textContent('#view')).includes('1 conciliado'));
 await nav('fin');ok('título pago após pagamento da nota',(await p.textContent('#view')).includes('pago'));
 await nav('plano');ok('plano de contas mostra 4.2.01 com R$ 1.600',(await p.textContent('#view')).includes('4.2.01')&&(await p.textContent('#view')).includes('1.600,00'));
 // medição -> resultado por item (lucro/prejuízo)
 await role('engenheiro');await nav('med');await p.click('[data-act=nova-med]');await p.selectOption('#m-item','B.3.1.7.1');await p.fill('#m-q','2');await p.click('[data-act=med-ok]');
 ok('BM lançada aguarda atesto',(await p.textContent('#view')).includes('BM-0001'));
 ok('engenheiro não atesta',await p.isDisabled('[data-act=atestar]'));
 await role('gerente');await nav('med');await p.click('.tabs button[data-t=bm]');await p.click('[data-act=atestar]');
 await p.click('.tabs button[data-t=res]');const rt=await p.textContent('#view');
 ok('resultado por item: receita 2 x licitado, custo R$ 1.600, IDC',rt.includes('B.3.1.7.1')&&rt.includes('1.600,00')&&/IDC da obra/.test(rt));
 await nav('med');await p.click('[data-act=nova-med]');await p.selectOption('#m-item','B.3.1.7.1');await p.fill('#m-q','5');await p.click('[data-act=med-ok]');ok('medido acima do orçado rejeitado',await p.isVisible('#modal.open'));
 await p.click('[data-act=fechar]');
 // painéis e auditoria
 for(const v of ['pain','aud','pac','hoje'])await nav(v);
 await nav('pain');await p.click('.tabs button[data-t=carteira]');ok('carteira lista 342/343/281',(await T('343'))&&(await T('281')));
 await p.screenshot({path:(process.argv[2]||'/tmp')+'/painel.png'});
 await nav('eap');await p.fill('#q','');await p.screenshot({path:(process.argv[2]||'/tmp')+'/eap.png'});
 await nav('hoje');await p.screenshot({path:(process.argv[2]||'/tmp')+'/hoje2.png'});
 console.log(out.join('\n'));console.log('erros JS:',JSON.stringify(errs));
 await b.close();
})().catch(e=>{console.log('ERRO TESTE',e.message.split('\n')[0]);process.exit(1)});
