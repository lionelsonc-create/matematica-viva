const fs = require('fs');
const ef = JSON.parse(fs.readFileSync('scripts/ensino-fundamental.json','utf8'));
const em = JSON.parse(fs.readFileSync('scripts/ensino-medio.json','utf8'));
const ctx = new Map([...ef.contextos_organizacao, ...em.contextos_organizacao].map(x=>[x.id,x.nome]));
const ma = ef.habilidades.filter(h=>h.componente==='ef-comp-ma').map(h=>({
  code:h.codigo,
  stage:h.anos.every(y=>y<=5)?'EF1':'EF2',
  years:h.anos,
  year:h.anos[0],
  unit:ctx.get(h.organizacao.unidade_tematica)||'Matemática',
  object:(h.objetos_conhecimento||[]).map(x=>ctx.get(x)).filter(Boolean).join(' · '),
  description:h.texto,
  source:'BNCC 2018'
}));
const maem = em.habilidades.filter(h=>h.area==='em-area-mat').map(h=>({
  code:h.codigo,
  stage:'EM',
  years:[0],
  year:0,
  unit:'Matemática e suas Tecnologias',
  object:'Competências específicas de Matemática e suas Tecnologias',
  description:h.texto,
  source:'BNCC 2018'
}));
const all = [...ma,...maem];
fs.writeFileSync('src/data/bncc.json', JSON.stringify(all,null,2));
console.log('generated', all.length, 'EF', ma.length, 'EM', maem.length);
console.log(all.filter(x=>x.code==='EF07MA01'||x.code==='EM13MAT101'));
