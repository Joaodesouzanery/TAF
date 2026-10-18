/* ============ PAINEL DE CONTRATOS / OBRA (Fase 13) ============ */
/* Mesmos blocos do Painel de Contratos do Sankhya, calculados dos registros do sistema (+ lançamentos importados). */
const mesCorr=()=>mesDe(hojeISO());
const lfxDe=tp=>S.t.lfxs.filter(l=>l.tipo===tp);
function vencNota(n){const t=S.t.titulos.find(x=>x.oc&&x.oc===n.oc&&!x.cancelado);return t?t.venc:addDias(n.emissao||hojeISO(),30)}
function painelCalc(){
  const T=S.t,h=hojeISO(),O=S.D.obra,X=S.X||derive(),contrato=O.valor_contrato||X.venda,trib=O.tributos_nota||0;
  const fats=T.fats,recs=T.recs,fat=r2(fats.reduce((s,f)=>s+f.valor,0));
  const faturadoAnt=r2(fats.filter(f=>mesDe(f.emissao)<mesCorr()).reduce((s,f)=>s+f.valor,0));
  const recebido=r2(recs.reduce((s,r)=>s+r.valor,0)),aReceber=r2(fats.reduce((s,f)=>s+fatSaldo(f),0));
  const atrRec=r2(fats.filter(f=>f.venc<h).reduce((s,f)=>s+fatSaldo(f),0));
  const fatDireto=r2(fats.filter(f=>f.fatDireto).reduce((s,f)=>s+f.valor,0)+T.notas.filter(n=>n.fatDireto&&n.status!=='lancada').reduce((s,n)=>s+n.valor,0)+lfxDe('gasto').filter(l=>l.fatDireto).reduce((s,l)=>s+l.valor,0));
  const impDeb=r2(fat*trib);
  const nt=T.notas.filter(n=>n.status!=='lancada'),npg=nt.filter(n=>n.status==='paga'),nab=nt.filter(n=>n.status!=='paga');
  const lg=lfxDe('gasto');
  const pago=r2(npg.reduce((s,n)=>s+n.valor,0)+lg.filter(l=>l.pago).reduce((s,l)=>s+l.valor,0));
  const atrasado=r2(nab.filter(n=>vencNota(n)<h).reduce((s,n)=>s+n.valor,0)+lg.filter(l=>!l.pago&&l.venc<h).reduce((s,l)=>s+l.valor,0));
  const aPagar=r2(nab.filter(n=>vencNota(n)>=h).reduce((s,n)=>s+n.valor,0)+lg.filter(l=>!l.pago&&l.venc>=h).reduce((s,l)=>s+l.valor,0));
  const gasto=r2(pago+atrasado+aPagar);
  const requisicao=r2(T.sols.filter(s=>['enviada','em_cotacao','cotada'].includes(s.status)).reduce((s,x)=>s+x.qtd*x.preco,0));
  const cfReal=r2(T.notas.filter(n=>n.status!=='lancada').reduce((s,n)=>s+n.rateio.filter(l=>l.nat==='ADM').reduce((a,l)=>a+ +l.valor,0),0)+lfxDe('custo_fixo').reduce((s,l)=>s+l.valor,0));
  const cfPrev=r2(S.D.items.filter(i=>i.nat==='ADM').reduce((s,i)=>s+i.meta_total,0));
  const custoFixo=Math.max(cfReal,0),prov=r2(X.comp+lfxDe('provisao').reduce((s,l)=>s+l.valor,0));
  const saldoFat=r2(contrato-fat);
  const comprom=r2(gasto+custoFixo+prov);
  const lucro=r2(contrato*(1-trib)-comprom);          // projetado com o que já está comprometido
  const lucroReal=r2(fat*(1-trib)-gasto-custoFixo);   // realizado: só o faturado contra o gasto
  return {contrato,fat,faturadoAnt,recebido,aReceber,atrRec,fatDireto,impDeb,impCred:0,pago,aPagar,atrasado,gasto,requisicao,custoFixo,cfPrev,
    pctCF:contrato?custoFixo/contrato:0,prov,saldoFat,comprom,lucro,lucroReal,pctLucro:contrato?lucro/contrato:0,trib}}
const PAINEL_DICA={contrato:'Valor do contrato da obra.',fat:'Soma das NFs de serviço emitidas (boletins aprovados e faturados).',
 gasto:'Pago + a pagar + atrasado: notas rateadas/conferidas/pagas e lançamentos importados do tipo gasto. Atrasado = vencimento no passado e sem pagamento.',
 requisicao:'Solicitações de compra ainda sem pedido aprovado (preço × quantidade).',custoFixo:'Natureza indireta (ADM) rateada nas notas + lançamentos de custo fixo importados.',
 prov:'Comprometido: pedidos aprovados ainda sem nota + provisões importadas.',saldoFat:'Contrato − faturado.',lucro:'Contrato líquido de tributos − (gasto + custo fixo + provisão). É projeção; o realizado aparece ao lado.',impDeb:'Estimativa: faturado × tributos sobre a nota do contrato. Apuração completa na Fase 14.'};
const kv=(l,v,o={})=>`<div class="pk ${o.cls||''}" ${o.tip?`title="${esc(o.tip)}"`:''}><div class="k-l">${l}</div><div class="v ${o.neg&&v<0?'neg':''}">${brl(v)}</div>${o.sub?`<div class="mut" style="font-size:11.5px">${o.sub}</div>`:''}</div>`;
function svgBarrasContrato(c){
  const W=560,H=250,P=30,mx=Math.max(c.contrato,c.comprom,1)*1.08,y=v=>H-P-(v/mx)*(H-2*P),bw=70;
  const stack=[['Gasto',c.gasto,'var(--info)'],['Custo fixo',c.custoFixo,'var(--warn)'],['Provisão',c.prov,'var(--bad)']];
  let acc=0,seg='';stack.forEach(([n,v,col])=>{const y1=y(acc+v),y0=y(acc);seg+=`<rect x="${W*.5-bw/2}" y="${y1}" width="${bw}" height="${Math.max(0,y0-y1)}" fill="${col}"><title>${n}: ${brl(v)}</title></rect>`;acc+=v});
  const lx=W*.82,ly=y(Math.max(0,c.lucro)),lh=Math.abs(y(c.lucro)-y(0));
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto" role="img" aria-label="Contrato, custos empilhados e lucro">
   <line x1="${P}" x2="${W-P}" y1="${H-P}" y2="${H-P}" stroke="var(--line)"/>
   <rect x="${W*.18-bw/2}" y="${y(c.contrato)}" width="${bw}" height="${H-P-y(c.contrato)}" fill="var(--ink-4,#9aa)"><title>Contrato ${brl(c.contrato)}</title></rect>
   ${seg}
   <rect x="${lx-bw/2}" y="${c.lucro>=0?ly:y(0)}" width="${bw}" height="${Math.max(2,lh)}" fill="${c.lucro>=0?'var(--ok)':'var(--bad)'}"><title>Lucro ${brl(c.lucro)}</title></rect>
   <text x="${W*.18}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Contrato</text><text x="${W*.5}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Custos</text><text x="${lx}" y="${H-10}" text-anchor="middle" font-size="11" fill="var(--ink-3)">Lucro</text>
   <text x="${W*.18}" y="${y(c.contrato)-6}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${brl(c.contrato,true)}</text><text x="${W*.5}" y="${y(c.comprom)-6}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${brl(c.comprom,true)}</text><text x="${lx}" y="${(c.lucro>=0?ly:y(0)+lh)+(c.lucro>=0?-6:14)}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${brl(c.lucro,true)}</text></svg>
   <div class="legend">${stack.map(([n,,col])=>`<span><i style="background:${col}"></i>${n}</span>`).join('')}</div>`}
function curvaS(){
  const ms=new Set([mesCorr()]);S.t.meds.forEach(m=>ms.add(mesDe(m.periodo)));S.t.fats.forEach(f=>ms.add(mesDe(f.emissao)));S.t.notas.forEach(n=>n.status!=='lancada'&&ms.add(mesDe(n.emissao)));
  const L=[...ms].filter(Boolean).sort();if(L.length<2)L.unshift(addMes(L[0],-1));
  const c={medido:0,fat:0,custo:0};return L.map(m=>{c.medido+=S.t.meds.filter(x=>x.status==='atestada'&&mesDe(x.periodo)===m).reduce((s,x)=>s+medValor(x),0);
    c.fat+=S.t.fats.filter(f=>mesDe(f.emissao)===m).reduce((s,f)=>s+f.valor,0);
    c.custo+=S.t.notas.filter(n=>n.status!=='lancada'&&mesDe(n.emissao)===m).reduce((s,n)=>s+n.valor,0);return {m,...c}})}
function svgCurvaS(r){
  const W=560,H=210,P=28,mx=Math.max(1,...r.map(x=>Math.max(x.medido,x.fat,x.custo))),X=i=>P+i*(W-2*P)/Math.max(1,r.length-1),Y=v=>H-P-(v/mx)*(H-2*P);
  const ln=(k,col)=>`<polyline fill="none" stroke="${col}" stroke-width="2" points="${r.map((x,i)=>X(i)+','+Y(x[k])).join(' ')}"/>`+r.map((x,i)=>`<circle cx="${X(i)}" cy="${Y(x[k])}" r="3" fill="${col}"><title>${fmes(x.m)} · ${k}: ${brl(x[k])}</title></circle>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;height:auto" role="img" aria-label="Curva S acumulada">${ln('medido','var(--info)')}${ln('fat','var(--ok)')}${ln('custo','var(--bad)')}${r.map((x,i)=>`<text x="${X(i)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--ink-3)">${fmes(x.m)}</text>`).join('')}</svg>
   <div class="legend"><span><i style="background:var(--info)"></i>Medido (atestado)</span><span><i style="background:var(--ok)"></i>Faturado</span><span><i style="background:var(--bad)"></i>Custo (notas)</span></div>`}
function painelContrato(X){
  const c=painelCalc(),O=S.D.obra,sf=(v,l)=>({tip:PAINEL_DICA[l]});
  const totI=S.D.items.length,semMeta=S.D.items.filter(i=>!i.meta_total).length;
  const idc=(()=>{let cm=0,va=0;S.D.items.forEach(i=>{const r=resItem(i);cm+=r.real;va+=r.va});return cm>0?va/cm:null})();
  const sem=(ok,warn)=>ok?'ok':warn?'warn':'bad';
  const desv=[...S.D.items].map(i=>({i,v:S.sd[i.codigo].comp+S.sd[i.codigo].real-i.meta_total})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v).slice(0,6);
  const nat={};S.D.items.forEach(i=>{nat[i.nat]=nat[i.nat]||{meta:0,real:0};nat[i.nat].meta+=i.meta_total;nat[i.nat].real+=S.sd[i.codigo].comp+S.sd[i.codigo].real});
  const alerts=[];if(c.atrasado>0)alerts.push(['bad','Gasto atrasado',brl(c.atrasado)]);if(c.atrRec>0)alerts.push(['bad','NF vencida a receber',brl(c.atrRec)]);if(c.lucro<0)alerts.push(['bad','Lucro projetado negativo',brl(c.lucro)]);
  if(X.semFolga.length)alerts.push(['warn','Itens com meta acima do teto',String(X.semFolga.length)]);if(semMeta)alerts.push(['warn','Itens sem meta de custo',semMeta+' de '+totI]);
  const bar=(v,m)=>m>0?`<div class="bar"><i class="b" style="width:${Math.min(100,v/m*100)}%"></i></div>`:'<span class="mut">sem meta</span>';
  return `<div class="sub" style="margin-top:6px">${esc(O.contratante)} · contrato ${esc(O.contrato)} · <b>${esc(O.codigo)}</b> ${esc(O.nome)}. Passe o mouse sobre um valor para ver como foi calculado.</div>
  <div class="pgrid">
   ${kv('Contrato',c.contrato,{...sf(0,'contrato'),cls:'big'})}
   ${kv('Faturado',c.fat,{...sf(0,'fat'),sub:'anteriores '+brl(c.faturadoAnt)})}${kv('Recebido',c.recebido)}${kv('A receber',c.aReceber)}${kv('Atrasado (a receber)',c.atrRec,{neg:0,cls:c.atrRec>0?'bad':''})}
   ${kv('Fat. direto',c.fatDireto,{tip:'Faturamento direto: pago pelo cliente ao fornecedor (marque na NF).'})}
   ${kv('Impostos (débito)',c.impDeb,{...sf(0,'impDeb')})}${kv('Impostos (crédito)',c.impCred,{tip:'Créditos de impostos entram na apuração da Fase 14.'})}
   ${kv('Gasto',c.gasto,{...sf(0,'gasto'),cls:'big'})}${kv('Gasto pago',c.pago)}${kv('Gasto a pagar',c.aPagar)}${kv('Gasto atrasado',c.atrasado,{cls:c.atrasado>0?'bad':''})}${kv('Requisição',c.requisicao,{...sf(0,'requisicao')})}
   ${kv('Custo fixo',c.custoFixo,{...sf(0,'custoFixo'),sub:(c.pctCF*100).toFixed(2).replace('.',',')+' % do contrato · previsto '+brl(c.cfPrev)})}
   ${kv('Prov. gasto',c.prov,{...sf(0,'prov')})}${kv('Saldo a faturar',c.saldoFat,{...sf(0,'saldoFat')})}
   ${kv('Lucro (projetado)',c.lucro,{...sf(0,'lucro'),neg:1,cls:'big '+(c.lucro<0?'bad':''),sub:(c.pctLucro*100).toFixed(2).replace('.',',')+' % · realizado '+brl(c.lucroReal)})}
  </div>
  <div class="cols" style="margin-top:14px"><div class="card"><div class="in"><div class="panel-t">Contrato × custos × lucro</div>${svgBarrasContrato(c)}</div></div>
   <div class="card"><div class="in"><div class="panel-t">Curva S acumulada</div>${svgCurvaS(curvaS())}</div></div></div>
  <div class="cols" style="margin-top:14px"><div class="card"><div class="in"><div class="panel-t">Saúde da obra</div>
    <div class="row" style="grid-template-columns:1fr auto"><div><h4>IDC (valor agregado ÷ custo)</h4></div><span class="pill ${idc==null?'mute':sem(idc>=.95,idc>=.9)}">${idc==null?'sem custo':idc.toFixed(2).replace('.',',')}</span></div>
    <div class="row" style="grid-template-columns:1fr auto"><div><h4>Margem projetada</h4></div><span class="pill ${sem(c.pctLucro>=.05,c.pctLucro>=0)}">${(c.pctLucro*100).toFixed(1).replace('.',',')} %</span></div>
    <div class="row" style="grid-template-columns:1fr auto"><div><h4>Comprometido ÷ contrato</h4></div><span class="pill ${sem(c.comprom/c.contrato<=.85,c.comprom/c.contrato<=1)}">${(c.comprom/c.contrato*100).toFixed(1).replace('.',',')} %</span></div>
    <div class="row" style="grid-template-columns:1fr auto"><div><h4>Caixa da obra (recebido − pago)</h4></div><span class="pill ${c.recebido-c.pago>=0?'ok':'bad'}">${brl(c.recebido-c.pago,true)}</span></div></div></div>
   <div class="card"><div class="in"><div class="panel-t">Alertas</div>${alerts.length?alerts.map(a=>`<div class="row" style="grid-template-columns:1fr auto"><div><h4>${a[1]}</h4></div><span class="pill ${a[0]}">${a[2]}</span></div>`).join(''):'<div class="sub">Nenhum alerta.</div>'}</div></div></div>
  <div class="cols" style="margin-top:14px"><div class="card"><div class="in"><div class="panel-t">Maiores desvios (acima da meta)</div>${desv.length?`<table class="tbl"><tbody>${desv.map(x=>`<tr class="clk" data-item="${x.i.codigo}"><td class="mono">${x.i.codigo}</td><td>${esc(x.i.descricao.slice(0,50))}</td><td class="r neg">+${brl(x.v)}</td></tr>`).join('')}</tbody></table>`:'<div class="sub">Nenhum item acima da meta.</div>'}</div></div>
   <div class="card"><div class="in"><div class="panel-t">Custo por natureza (meta × usado)</div><table class="tbl"><tbody>${Object.entries(nat).map(([k,v])=>`<tr><td>${NATNOME[k]||k}</td><td class="r">${brl(v.real,true)} / ${brl(v.meta,true)}</td><td style="width:90px">${bar(v.real,v.meta)}</td></tr>`).join('')}</tbody></table></div></div></div>
  <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="pc-csv">Copiar números (CSV)</button><button class="btn" data-act="pc-conf">Conferir com o Sankhya</button></div>
  <div class="sub" style="margin-top:8px">Sem dados do Sankhya, a obra ${esc(O.codigo)} só mostra o que foi lançado aqui. Para trazer o histórico financeiro de lá, use a aba <b>Importar</b> (CSV).</div>`}
ACOES['pc-csv']=()=>{const c=painelCalc(),t='indicador;valor\n'+Object.entries({contrato:c.contrato,faturado:c.fat,recebido:c.recebido,a_receber:c.aReceber,atrasado_receber:c.atrRec,fat_direto:c.fatDireto,impostos_debito:c.impDeb,gasto:c.gasto,gasto_pago:c.pago,gasto_a_pagar:c.aPagar,gasto_atrasado:c.atrasado,requisicao:c.requisicao,custo_fixo:c.custoFixo,prov_gasto:c.prov,saldo_a_faturar:c.saldoFat,lucro:c.lucro}).map(([k,v])=>k+';'+String(v).replace('.',',')).join('\n');
  try{navigator.clipboard.writeText(t).then(()=>toast('Copiado'),()=>toast('Não consegui copiar'))}catch(e){toast('Não consegui copiar')}};
ACOES['pc-conf']=()=>{S.tab.pain='conf';render()};

/* ---------- Conferência com o Sankhya ---------- */
const CONF_L=[['contrato','Contrato'],['fat','Faturado'],['recebido','Recebido'],['aReceber','A receber'],['gasto','Gasto'],['pago','Gasto pago'],['aPagar','Gasto a pagar'],['atrasado','Gasto atrasado'],['custoFixo','Custo fixo'],['prov','Prov. gasto'],['saldoFat','Saldo a faturar'],['lucro','Lucro']];
const CAUSA={gasto:'Faltam notas/lançamentos aqui (importe o CSV do financeiro) ou há nota sem rateio.',pago:'Há pagamento no Sankhya sem baixa aqui.',aPagar:'Título aberto lá sem nota/lançamento aqui.',atrasado:'Vencimento diferente ou baixa não registrada aqui.',custoFixo:'Custo fixo lá é rateio contábil; aqui só conta natureza ADM.',prov:'Provisão lá sem pedido aprovado aqui.',lucro:'Bases diferentes: o Sankhya usa custo fixo/provisão próprios; confira as linhas acima.',fat:'NF de serviço sem boletim aqui.',recebido:'Recebimento não registrado aqui.',aReceber:'Efeito do faturado/recebido.',saldoFat:'Efeito do faturado.',contrato:'Valor do contrato diferente do cadastrado.'};
function confView(){
  const c=painelCalc(),sk=(S.t.par.conf||{}),num=v=>v===''||v==null||isNaN(+v)?null:+v;
  const rows=CONF_L.map(([k,l])=>{const a=c[k],b=num(sk[k]),d=b==null?null:r2(a-b),ok=d!=null&&Math.abs(d)<=1;
    return `<tr><td>${l}</td><td class="r">${brl(a)}</td><td class="r"><input class="cf-in" data-cf="${k}" type="number" step="any" value="${b==null?'':b}" placeholder="valor do Sankhya" style="width:150px;text-align:right"></td><td class="r ${d?'neg':''}">${d==null?'—':brl(d)}</td><td>${d==null?'<span class="pill mute">sem valor</span>':ok?'<span class="pill ok">bate</span>':'<span class="pill bad">difere</span>'}</td><td class="mut" style="font-size:12px">${d!=null&&!ok?CAUSA[k]:''}</td></tr>`}).join('');
  const dif=CONF_L.filter(([k])=>{const b=num(sk[k]);return b!=null&&Math.abs(c[k]-b)>1}).length,pre=CONF_L.filter(([k])=>num(sk[k])!=null).length;
  return `<div class="sub">Digite os totais do Painel de Contratos do Sankhya desta obra (<b>${esc(S.D.obra.codigo)}</b>). O sistema compara com o que ele calcula e aponta a causa provável. Fica registrado na auditoria.</div>
  <div class="kpi4"><div><div class="k-l">Valores informados</div><div class="v">${pre}</div></div><div><div class="k-l">Batem</div><div class="v">${pre-dif}</div></div><div><div class="k-l">Diferem</div><div class="v ${dif?'neg':''}">${dif}</div></div><div><div class="k-l">Tolerância</div><div class="v">R$ 1,00</div></div></div>
  <div class="tw"><table class="tbl"><thead><tr><th>Indicador</th><th class="r">Neste sistema</th><th class="r">Sankhya</th><th class="r">Diferença</th><th>Resultado</th><th>Causa provável</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div style="margin-top:10px"><button class="btn" data-act="cf-zera">Limpar valores</button></div>`}
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.cf!=null){S.t.par.conf={...(S.t.par.conf||{}),[t.dataset.cf]:t.value};log('conferencia_sankhya',S.D.obra.codigo,t.dataset.cf,'',t.value);save();render()}});
ACOES['cf-zera']=()=>{S.t.par.conf={};log('conferencia_sankhya',S.D.obra.codigo,'limpar','','');save();render()};

/* ---------- Importar lançamentos do financeiro (CSV) ---------- */
/* Colunas: tipo;numero;fornecedor;descricao;vencimento;valor;pago_em;fat_direto  (tipo: gasto | custo_fixo | provisao). Datas dd/mm/aaaa ou aaaa-mm-dd; valores 1.234,56. */
const numBR=s=>{s=String(s||'').trim().replace(/[R$\s]/g,'');if(!s)return 0;return s.includes(',')?+s.replace(/\./g,'').replace(',','.'):+s};
const dataImp=s=>{s=String(s||'').trim();const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:/^\d{4}-\d{2}-\d{2}$/.test(s)?s:''};
function lfxParse(txt){const out=[],erros=[];String(txt||'').replace(/^﻿/,'').split(/\r?\n/).forEach((ln,i)=>{if(!ln.trim())return;const c=ln.split(';').map(x=>x.trim());
  if(i===0&&/^tipo$/i.test(c[0]))return;const tp=(c[0]||'').toLowerCase();
  if(!['gasto','custo_fixo','provisao'].includes(tp))return erros.push(`Linha ${i+1}: tipo "${c[0]}" inválido (use gasto, custo_fixo ou provisao)`);
  const v=numBR(c[5]),venc=dataImp(c[4]);if(!(v>0))return erros.push(`Linha ${i+1}: valor inválido`);if(!venc)return erros.push(`Linha ${i+1}: vencimento inválido`);
  out.push({tipo:tp,numero:c[1]||'',forn:c[2]||'',desc:c[3]||'',venc,valor:r2(v),pago:dataImp(c[6])||'',fatDireto:/^(1|s|sim|x)$/i.test(c[7]||'')})});return {out,erros}}
const lfxChave=l=>[l.tipo,l.numero,l.forn.toLowerCase(),l.venc,l.valor].join('|');
function lfxImportar(){const r=lfxParse($('#lf-csv').value),ja=new Set(S.t.lfxs.map(lfxChave));
  if(!r.out.length&&r.erros.length)return toast(r.erros[0]);
  const novos=r.out.filter(l=>!ja.has(lfxChave(l)));const lote='L'+Date.now();
  novos.forEach(l=>S.t.lfxs.push({id:'lfx'+Date.now()+Math.random().toString(36).slice(2,6),origem:'Sankhya',lote,...l}));
  log('lancamentos_importados',lote,'importar','',novos.length+' novos, '+(r.out.length-novos.length)+' repetidos ignorados'+(r.erros.length?', '+r.erros.length+' linhas com erro':''));
  save();toast(novos.length+' lançamentos importados, '+(r.out.length-novos.length)+' repetidos ignorados'+(r.erros.length?', '+r.erros.length+' com erro':''));S.lfxErros=r.erros;render()}
function lfxDesfazer(){const ult=S.t.lfxs[S.t.lfxs.length-1];if(!ult)return toast('Nada para desfazer');const n=S.t.lfxs.filter(l=>l.lote===ult.lote).length;
  S.t.lfxs=S.t.lfxs.filter(l=>l.lote!==ult.lote);log('lancamentos_importados',ult.lote,'desfazer','',n+' removidos');save();toast(n+' lançamentos do último lote removidos');render()}
ACOES['lf-imp']=()=>{if(!can('lan'))return toast('Só Financeiro importa lançamentos');lfxImportar()};ACOES['lf-undo']=()=>{if(!can('lan'))return toast('Só Financeiro desfaz importação');lfxDesfazer()};
function impView(){const L=S.t.lfxs;
  return `<div class="sub">Traga para cá o histórico financeiro que hoje só existe no Sankhya. Colunas separadas por ponto e vírgula: <span class="mono">tipo;numero;fornecedor;descricao;vencimento;valor;pago_em;fat_direto</span>. Tipo: <b>gasto</b>, <b>custo_fixo</b> ou <b>provisao</b>. Deixe <span class="mono">pago_em</span> vazio para títulos em aberto. Linhas repetidas (mesmo tipo, número, fornecedor, vencimento e valor) são ignoradas.</div>
  <textarea id="lf-csv" rows="6" placeholder="gasto;123;Fornecedor X;Cimento;25/11/2026;2.011,26;;&#10;provisao;;Folha;Provisão de mão de obra;30/11/2026;126.731,81;;"></textarea>
  <div style="margin-top:8px;display:flex;gap:8px"><button class="btn dark" data-act="lf-imp" ${can('lan')?'':'disabled title="Só Financeiro"'}>Importar</button><button class="btn" data-act="lf-undo" ${can('lan')&&L.length?'':'disabled'}>Desfazer último lote</button></div>
  ${(S.lfxErros||[]).length?`<div class="err" style="margin-top:8px">${S.lfxErros.slice(0,5).map(esc).join('<br>')}</div>`:''}
  ${L.length?`<div class="tw"><table class="tbl"><thead><tr><th>Tipo</th><th>Nº</th><th>Fornecedor</th><th>Vencimento</th><th class="r">Valor</th><th>Situação</th></tr></thead><tbody>${L.slice(-30).map(l=>`<tr><td>${l.tipo}${l.fatDireto?' · fat. direto':''}</td><td class="mono">${esc(l.numero)}</td><td>${esc(l.forn)}</td><td>${fdata(l.venc)}</td><td class="r">${brl(l.valor)}</td><td>${l.tipo==='gasto'?(l.pago?'pago '+fdata(l.pago):l.venc<hojeISO()?'<span class="neg">atrasado</span>':'a pagar'):'—'}</td></tr>`).join('')}</tbody></table></div>`:''}`}
