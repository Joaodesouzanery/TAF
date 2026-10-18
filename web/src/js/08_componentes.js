/* ============ componentes ============ */
/* Navegação: 8 áreas com abas internas. S.view continua sendo a chave da tela; a área é derivada. Áreas sem telas ainda ficam ocultas. */
const AREAS=[
 {k:'inicio',n:'Início',i:'hoje',tabs:[['hoje','Hoje'],['pain','Painéis']]},
 {k:'obra',n:'Obra',i:'eap',tabs:[['eap','Orçamento (EAP)'],['pac','Pacotes'],['campo','Campo'],['lean','Lean e planejamento'],['med','Medição e resultado']]},
 {k:'sup',n:'Suprimentos',i:'compras',tabs:[['compras','Compras'],['nota','Notas e rateio'],['cad','Cadastros']]},
 {k:'fin',n:'Financeiro',i:'fin',tabs:[['fin','Pagar e conciliar'],['fat','Faturamento e caixa']]},
 {k:'cont',n:'Contábil e fiscal',i:'plano',tabs:[['plano','Plano de contas']]},
 {k:'adm',n:'Gestão e administração',i:'aud',tabs:[['aud','Auditoria'],['usuarios','Usuários']]},
];
/* Quais telas cada papel vê no menu (as ações dentro de cada tela continuam limitadas por can()). Papéis de gestão veem tudo. */
const TELAS_PAPEL={encarregado:['hoje','eap','campo','lean'],almox:['hoje','pac','compras','nota','cad','lean'],planejamento:['hoje','pain','eap','pac','campo','lean','med'],
  compras:['hoje','pain','eap','pac','compras','nota','cad','lean'],adm:['hoje','compras','nota','cad','fin','plano','aud'],financeiro:['hoje','pain','compras','nota','cad','fin','fat','plano','aud']};
const tabVisivel=k=>{if(k==='usuarios')return MODO_SB&&S.role==='admin';const l=TELAS_PAPEL[S.role];return !l||l.includes(k)};
const areasVisiveis=()=>AREAS.map(a=>({...a,tabs:a.tabs.filter(t=>tabVisivel(t[0]))})).filter(a=>a.tabs.length);
const areaDe=v=>areasVisiveis().find(a=>a.tabs.some(t=>t[0]===v))||areasVisiveis()[0];
const NAV_BASE=AREAS.flatMap(a=>a.tabs.map(t=>[t[0],t[1],a.i]));
const navItens=()=>NAV_BASE.filter(n=>tabVisivel(n[0]));
const badgeArea=(a,X)=>a.tabs.map(t=>badgeFor(t[0],X)).join('');
const abasDaArea=a=>a.tabs.length<2?'':`<div class="tabs areatabs">${a.tabs.map(([k,l])=>`<button data-v="${k}" class="${S.view===k?'on':''}">${l}</button>`).join('')}</div>`;
function badgeFor(k,X){return k==='compras'?(X.pendAprov.length?`<span class="badge hot">${X.pendAprov.length}</span>`:''):k==='nota'?(X.semRateio.length?`<span class="badge hot">${X.semRateio.length}</span>`:''):''}
function ticks(items){return items.map(i=>`<i class="${i.meta_total>i.teto_total?'r':i.status_cotacao==='A cotar'?'w':''}" title="${i.codigo}"></i>`).join('')}
function ring(p,c){return `<div class="ring" style="--p:${Math.round(p*100)};--c:${c}"><span>${Math.round(p*100)}</span></div>`}
function bar(a,b,tot){const w=x=>tot>0?Math.min(100,Math.max(0,x/tot*100)):0;return `<div class="bar" title="comprometido ${brl(a)} · realizado ${brl(b)} · meta ${brl(tot)}"><i class="b" style="width:${w(b)}%"></i><i class="a" style="width:${Math.min(w(a),100-w(b))}%"></i></div>`}
function tabs(id,list,cur){return `<div class="tabs" data-tabs="${id}">${list.map(([k,l,n])=>`<button data-t="${k}" class="${cur===k?'on':''}">${l}${n?` <em>${n}</em>`:''}</button>`).join('')}</div>`}
function modal(html){$('#mbox').innerHTML=html;$('#modal').classList.add('open')}
function closeModal(){$('#modal').classList.remove('open')}
const itemOptions=(sel)=>S.D.items.map(i=>`<option value="${i.codigo}" ${sel===i.codigo?'selected':''}>${i.codigo} · ${esc(i.descricao.slice(0,70))}</option>`).join('');

