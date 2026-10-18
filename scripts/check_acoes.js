// Verifica que todo data-act usado no código tem handler (mapa A do clique ou ACOES). Sai com 1 se houver órfão.
const fs=require('fs'),path=require('path');
const dir='web/src/js',files=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(dir,f),'utf8'));
const all=files.join('\n');
const usados=new Set();for(const m of all.matchAll(/data-act=\\?["']([a-z0-9-]+)\\?["']/gi))usados.add(m[1]);
for(const m of all.matchAll(/data-act="\$\{[^}]*\}"/g)){}           // dinâmicos: ignorados
const tem=new Set();
// mapa A: chaves 'x':  ou x:  dentro do trecho "const A={...}" até "if(A[a])"
const i=all.indexOf('const A={'),j=all.indexOf('if(A[a])');const A=all.slice(i,j);
for(const m of A.matchAll(/(?:^|[,{\s])'([a-z0-9-]+)'\s*:/gi))tem.add(m[1]);
for(const m of A.matchAll(/(?:^|[,{\s])([a-z][a-zA-Z0-9]*)\s*:\s*(?:\(|[a-zA-Z])/g))tem.add(m[1]);
for(const m of all.matchAll(/ACOES\['([a-z0-9-]+)'\]\s*=/g))tem.add(m[1]);
const orf=[...usados].filter(a=>!tem.has(a)&&a!=='fechar'&&a!=='alertas').sort();
console.log('data-act usados:',usados.size,'· com handler:',[...usados].filter(a=>tem.has(a)).length);
if(orf.length){console.log('ÓRFÃOS:',orf.join(', '));process.exit(1)}console.log('OK sem órfãos');
