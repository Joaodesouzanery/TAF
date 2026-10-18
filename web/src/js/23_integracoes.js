/* ============ INTEGRAÇÕES (NF-e provedor e Sankhya): só com login ativo ============ */
const INTEG={msg:'',sk:null,prev:null,busy:false};
async function chamaFuncao(nome,body){if(!MODO_SB)throw new Error('As integrações usam credenciais guardadas no servidor e exigem o login ativo (config.js com modo "supabase").');
  const r=await SB.c.functions.invoke(nome,{body});if(r.error)throw new Error(r.error.message||'Falha ao chamar '+nome);return r.data}
const dataBR=iso=>iso?iso.split('-').reverse().join('/'):'';
function lancamentosMes(comp){const mapa=S.t.par.skMap||{},centro=S.t.par.skCentro||'',ls=[],sem=new Set();
  S.t.notas.filter(n=>n.status!=='lancada'&&mesDe(n.emissao)===comp).forEach(n=>n.rateio.forEach(l=>{const nat=mapa[l.conta]||'';if(!nat)sem.add(l.conta);ls.push({nota:String(n.nfNum||n.num),data:dataBR(n.emissao),cnpj:n.cnpj||'',nome:n.emitente,natureza:nat,centro,valor:r2(l.valor),conta:l.conta})}));
  return {ls,sem:[...sem],semCentro:!centro}}
async function nfeBuscar(){INTEG.busy=true;INTEG.msg='Buscando notas no provedor…';render();
  try{const d=await chamaFuncao('nfe-sync',{versao:S.t.par.nfeVersao,max:20});
    if(!d.configurado)INTEG.msg='Provedor ainda sem credenciais: cadastre NFE_PROVIDER_TOKEN e NFE_CNPJ nos secrets do Supabase.';
    else if(d.erro)INTEG.msg='Provedor: '+d.erro;
    else{const r=importaXmls(d.notas.map(n=>[n.nome,n.xml]));if(d.proximaVersao)S.t.par.nfeVersao=d.proximaVersao;save();INTEG.msg=`${r.ok.length} nota(s) nova(s) importada(s)${r.dup.length?' · '+r.dup.length+' já lançada(s)':''}${r.erro.length?' · '+r.erro.length+' com erro':''}.`}}
  catch(e){INTEG.msg=e.message}INTEG.busy=false;render()}
async function skAcao(acao){INTEG.busy=true;INTEG.msg='Consultando o Sankhya…';render();
  try{const comp=S.comp||mesDe(hojeISO()),L=lancamentosMes(comp).ls;
    const d=await chamaFuncao('sankhya-sync',acao==='conexao'||acao==='referencias'?{acao}:{acao,lancamentos:L});
    if(d.configurado===false)INTEG.msg='Sankhya ainda sem credenciais: cadastre SANKHYA_URL, SANKHYA_CLIENT_ID, SANKHYA_CLIENT_SECRET e SANKHYA_TOKEN nos secrets do Supabase.';
    else if(d.erro)INTEG.msg='Sankhya: '+d.erro;
    else if(acao==='conexao')INTEG.msg='Conexão com o Sankhya OK.';
    else if(acao==='referencias'){INTEG.sk={naturezas:d.naturezas,centros:d.centros};INTEG.msg=`${d.naturezas.length} naturezas e ${d.centros.length} centros de resultado lidos.`}
    else if(acao==='simular'){INTEG.simulou=true;INTEG.msg=`Simulação: ${d.payloads.length} lançamento(s) seriam enviados. Nada foi gravado.`}
    else if(acao==='enviar')INTEG.msg=`Enviado: ${d.resultados.filter(x=>x.ok).length} ok, ${d.resultados.filter(x=>!x.ok).length} com erro.`}
  catch(e){INTEG.msg=e.message}INTEG.busy=false;render()}
function viewIntegracoes(comp){
  const lm=lancamentosMes(comp),mapa=S.t.par.skMap||{},contas=[...new Set(S.t.notas.filter(n=>n.status!=='lancada').flatMap(n=>n.rateio.map(l=>l.conta)))].sort(cmpCod);
  const pill=MODO_SB?'<span class="pill info">Login ativo</span>':'<span class="pill mute">Requer login</span>';
  return `<div class="panel-t" style="margin-top:18px">Integrações ${pill}</div>
  <div class="sub">As credenciais ficam só nos secrets do servidor (Supabase), nunca no app. Sem login ativo os botões abaixo explicam o que falta. ${INTEG.msg?`<b>${esc(INTEG.msg)}</b>`:''}</div>
  <div class="tw"><table class="tbl"><tbody>
  <tr><td><b>NF-e recebidas (provedor)</b><div class="mut" style="font-size:11.5px">Busca os XMLs das notas emitidas contra o CNPJ da TAF e importa pela fila “sem rateio”</div></td><td class="r"><button class="btn sm dark" data-act="nfe-buscar" ${INTEG.busy||!(can('nota')||can('recFat'))?'disabled':''}>Buscar notas novas</button></td></tr>
  <tr><td><b>Sankhya (API oficial)</b><div class="mut" style="font-size:11.5px">Testa a conexão, lê naturezas e centros de resultado e envia o fechamento (primeiro simulado)</div></td><td class="r"><button class="btn sm" data-act="sk-conexao" ${INTEG.busy?'disabled':''}>Testar conexão</button> <button class="btn sm" data-act="sk-ref" ${INTEG.busy?'disabled':''}>Ler naturezas e centros</button></td></tr></tbody></table></div>
  <div class="panel-t" style="margin-top:14px">De-para com o Sankhya</div>
  <div class="g3" style="grid-template-columns:1fr 2fr;margin-top:6px"><div><label style="margin-top:0">Centro de resultado da obra ${S.D.obra.codigo}</label><input id="sk-centro" value="${esc(S.t.par.skCentro||'')}" placeholder="código no Sankhya"></div><div class="sub" style="align-self:end">${INTEG.sk?`Referência lida: ${INTEG.sk.centros.length} centros, ${INTEG.sk.naturezas.length} naturezas.`:'Informe o código do centro de resultado e a natureza de cada conta do plano.'}</div></div>
  ${contas.length?`<div class="tw"><table class="tbl"><thead><tr><th>Conta do plano</th><th>Natureza no Sankhya</th></tr></thead><tbody>${contas.map(c=>`<tr><td><span class="mono">${c}</span> ${esc(nomeConta(c))}</td><td><input data-skmap="${c}" value="${esc(mapa[c]||'')}" placeholder="código da natureza"></td></tr>`).join('')}</tbody></table></div>`:'<div class="sub">As contas aparecem aqui depois das primeiras notas rateadas.</div>'}
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn" data-act="sk-previa" ${lm.ls.length?'':'disabled'}>Pré-visualizar envio do mês</button><button class="btn" data-act="sk-simular" ${INTEG.busy||!lm.ls.length?'disabled':''}>Simular no servidor</button><button class="btn ok" data-act="sk-enviar" ${INTEG.busy||!lm.ls.length||lm.sem.length||lm.semCentro||!can('recFat')?'disabled title="Só envia com de-para completo e perfil Financeiro, Adm ou Diretoria"':''}>Enviar ao Sankhya</button></div>
  ${INTEG.prev?`<div class="tw"><table class="tbl"><thead><tr><th>Nota</th><th>Data</th><th>Parceiro</th><th>Natureza</th><th>Centro</th><th class="r">Valor</th></tr></thead><tbody>${INTEG.prev.ls.map(x=>`<tr><td class="mono">${esc(x.nota)}</td><td>${x.data}</td><td>${esc(x.nome)}</td><td class="${x.natureza?'':'neg'}">${esc(x.natureza||'sem de-para')}</td><td class="${x.centro?'':'neg'}">${esc(x.centro||'—')}</td><td class="r">${brl(x.valor)}</td></tr>`).join('')}</tbody></table></div>`:''}
  <div class="sub" style="margin-top:8px">A gravação no Sankhya vem desligada no servidor (SANKHYA_ALLOW_WRITE) e os nomes de campos precisam ser validados com o administrador do Sankhya antes do primeiro envio.</div>`}
