const assert=require("node:assert/strict");require("../garden-model.js");const M=globalThis.GardenModel;
const s=M.fresh();
for(const id of M.species){
 assert.equal(M.plant(s,id),true);assert.equal(M.plant(s,id),false);assert.equal(M.add(s,id),false);
 for(let n=0;n<=40;n++){const markup=M.flowerMarkup({...s.plants[id],stage:n/10});assert.ok(markup.length>0);assert.ok(!/NaN|Infinity|undefined/.test(markup));}
 for(let i=0;i<4;i++)assert.equal(M.water(s,id),true);
 assert.equal(M.water(s,id),false);
 const mark=M.flowerMarkup(s.plants[id]);assert.equal(mark,M.flowerMarkup(s.plants[id]));
 assert.ok(M.potSvg(s.plants[id]).includes(mark));assert.equal(M.add(s,id),true);assert.equal(M.add(s,id),false);
 assert.ok(M.bouquetSvg(s,"Garden").includes(mark));
}
assert.equal(s.bouquet.length,6);assert.equal(M.move(s,"rose",1),true);assert.equal(M.remove(s,"rose"),true);assert.equal(M.add(s,"rose"),true);
assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(s))),s);
assert.ok(M.bouquetSvg(s,"<Test &>").includes("&lt;Test &amp;&gt;"));
assert.equal(M.normalize({...s,plants:{rose:{stage:3.5}}}).plants.rose,undefined);
console.log("Garden model: six species, 246 visual stages, deterministic shared geometry, stage rules, saved state and SVG escaping PASS.");
