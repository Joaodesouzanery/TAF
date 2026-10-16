// Varredura visual: cada tela em 1400px e 400px, claro e escuro; reporta overflow horizontal, texto cortado e erros JS.
const {chromium}=require('playwright');
(async()=>{
 const out=process.argv[2]||'/tmp/qa_visual';require('fs').mkdirSync(out,{recursive:true});
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const probs=[];
 const views=['hoje','eap','pac','compras','nota','fin','campo','fat','lean','med','plano','pain','aud'];
 for(const [w,h,tag] of [[1400,900,'d'],[400,800,'m']])for(const tema of ['light','dark']){
  const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:tema});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file:///home/user/TAF/dist/tafadmin.html');await p.waitForSelector('.big');
  for(const v of views){await p.evaluate(v=>{S.view=v;render()},v);
   const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,bad:[...document.querySelectorAll('#view *')].filter(e=>{const c=getComputedStyle(e);return e.scrollWidth>e.clientWidth+2&&e.clientWidth>0&&c.overflow==='hidden'&&c.textOverflow!=='ellipsis'&&e.children.length===0&&e.textContent.trim().length>0}).slice(0,3).map(e=>e.className+':'+e.textContent.trim().slice(0,30))}));
   if(r.sw>r.cw+1)probs.push(`${tag}/${tema}/${v}: scroll horizontal da página (${r.sw}>${r.cw})`);
   if(r.bad.length)probs.push(`${tag}/${tema}/${v}: texto cortado ${JSON.stringify(r.bad)}`);
   if(tema==='light'||v==='hoje')await p.screenshot({path:`${out}/${tag}_${tema}_${v}.png`,fullPage:false})}
  if(errs.length)probs.push(`${tag}/${tema}: erros JS ${errs.join('|')}`);await ctx.close()}
 await b.close();console.log(probs.length?probs.join('\n'):'VISUAL: sem problemas detectados');
})().catch(e=>{console.log('ERRO',e.message);process.exit(1)});
