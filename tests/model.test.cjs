const assert=require("node:assert/strict");require("../garden-model.js");const M=globalThis.GardenModel;
const s=M.fresh();
for(const id of M.species){
 assert.equal(M.plant(s,id),true);assert.equal(M.plant(s,id),false);assert.equal(M.add(s,id),false);
 for(let n=0;n<=40;n++){const markup=M.flowerMarkup({...s.plants[id],stage:n/10});assert.ok(markup.length>0);assert.ok(!/NaN|Infinity|undefined/.test(markup));}
 for(let i=0;i<4;i++)assert.equal(M.water(s,id),true);
 assert.equal(M.water(s,id),false);
 const mark=M.flowerMarkup(s.plants[id]);assert.equal(mark,M.flowerMarkup(s.plants[id]));
 assert.ok(M.potSvg(s.plants[id]).includes(mark));assert.equal(M.add(s,id),true);
 assert.ok(M.bouquetSvg(s,"Garden").includes(mark));
}
assert.equal(s.bouquet.length,6);assert.equal(M.move(s,"rose",1),true);assert.equal(M.remove(s,"rose"),true);assert.equal(M.add(s,"rose"),true);
assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(s))),s);
assert.ok(M.bouquetSvg(s,"<Test &>").includes("&lt;Test &amp;&gt;"));
assert.equal(M.normalize({...s,plants:{rose:{stage:3.5}}}).plants.rose,undefined);
console.log("Garden model: six species, 246 visual stages, deterministic shared geometry, stage rules, saved state and SVG escaping PASS.");

const legacy={version:1,plants:s.plants,bouquet:s.bouquet.slice(),wrap:"blush",ribbon:"gold",greenery:false};
const migrated=M.normalize(legacy);assert.equal(migrated.wrapped,true);assert.equal(migrated.paperStyle,"plain");assert.equal(migrated.ribbonStyle,"bow");assert.deepEqual(migrated.bouquet,legacy.bouquet);
const unwrapped=M.bouquetSvg(s,"Garden");assert.ok(!unwrapped.includes('class="wrap-left"'));assert.equal(M.setWrapped(s,true),true);assert.equal(M.setWrapped(s,true),false);
for(const paperStyle of M.paperStyles)for(const ribbonStyle of M.ribbonStyles){s.paperStyle=paperStyle;s.ribbonStyle=ribbonStyle;const svg=M.bouquetSvg(s,"Garden");assert.ok(svg.includes('class="wrap-left"'));assert.ok(svg.includes('class="wrap-tie"'));assert.equal(svg.includes('id="paperPattern"'),paperStyle!=="plain");assert.ok(!/NaN|Infinity|undefined/.test(svg));}
assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(s))),s);assert.equal(M.move(s,s.bouquet[0],1),true);assert.equal(s.wrapped,false);assert.equal(M.setWrapped(M.fresh(),true),false);assert.deepEqual(M.bouquetLayout(["rose"]).map(x=>x.angle),[0]);assert.equal(M.bouquetLayout(M.species).length,6);assert.equal(M.normalize({...s,paperStyle:"bad",ribbonStyle:"bad"}).paperStyle,"plain");assert.equal(M.normalize({...s,paperStyle:"bad",ribbonStyle:"bad"}).ribbonStyle,"bow");console.log("Prototype 04 wrapping, migration, paper/ribbon combinations, layout PASS.");

const prior=M.bouquetSnapshot(s),growth=JSON.stringify(s.plants),id=s.bouquet[0],item=M.bouquetLayout(s.bouquet,s.placements).find(v=>v.id===id),head=M.flowerHead(s.plants[id],item);
assert.deepEqual(M.placementFromHead(s.plants[id],item,head.x,head.y),{angle:item.angle,scale:item.scale});
assert.equal(M.setPlacement(s,id,{angle:999,scale:999}),true);assert.deepEqual(s.placements[id],{angle:40,scale:1.68});
assert.equal(M.setPlacement(s,id,{angle:NaN,scale:1}),false);assert.equal(M.setPlacement(s,"not-a-flower",{angle:0,scale:1}),false);assert.equal(M.setPlacement(s,id,{angle:40,scale:1.68}),false);
const custom=M.bouquetSnapshot(s);assert.ok(M.bouquetSvg(s,"Garden").includes('rotate(40) scale(1.68)'));assert.ok(!M.bouquetSvg(s,"Garden").includes("position-handles"));assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(s))),s);
M.restoreBouquet(s,prior);assert.deepEqual(M.bouquetSnapshot(s),prior);assert.equal(JSON.stringify(s.plants),growth);
M.restoreBouquet(s,custom);assert.deepEqual(M.bouquetSnapshot(s),custom);assert.equal(JSON.stringify(s.plants),growth);assert.equal(M.clearPlacement(s,id),true);assert.equal(M.clearPlacement(s,id),false);
assert.equal(M.setPlacement(s,id,{angle:-35,scale:1.2}),true);assert.equal(M.autoArrange(s),true);assert.deepEqual(s.placements,{});assert.equal(M.autoArrange(s),false);
assert.equal(M.setPlacement(s,id,{angle:10,scale:1.1}),true);assert.equal(M.remove(s,id),true);assert.equal(s.placements[id],undefined);assert.equal(M.add(s,id),true);
assert.deepEqual(M.normalize({...s,placements:{[id]:{angle:Infinity,scale:2},unknown:{angle:10,scale:1.2}}}).placements,{});
const planted=M.fresh();M.plant(planted,"rose");const empty=M.bouquetSnapshot(planted);M.water(planted,"rose");M.restoreBouquet(planted,empty);assert.equal(planted.plants.rose.stage,1);
console.log("Prototype 07 position bounds, exact head inverse, migration, export, and bouquet-only history PASS.");

// 8.12: the live workbench does not include the exported keepsake frame.
{
 const s=M.fresh();M.plant(s,"rose");for(let i=0;i<4;i++)M.water(s,"rose");M.add(s,"rose");
 const live=M.bouquetSvg(s,"QA",{workbench:true}), exported=M.bouquetSvg(s,"QA");
 if(!live.includes('data-flower="rose"')||live.includes('<text x="200" y="420"')||!exported.includes('<text x="200" y="420"'))throw Error("Workbench/keepsake rendering separation failed");
}

// Repeat stems, independent instance placements, persistence and bounded quantity.
{
 const s=M.fresh();M.plant(s,"rose");for(let i=0;i<4;i++)M.water(s,"rose");
 for(let i=0;i<12;i++)assert.equal(M.add(s,"rose"),true);assert.equal(M.add(s,"rose"),false);assert.equal(M.add(s,"daisy"),false);
 assert.equal(new Set(s.bouquet).size,12);assert.equal(M.stemCount(s,"rose"),12);assert.equal(M.stemSpecies("rose~12"),"rose");assert.equal(M.stemSpecies("rose~13"),null);
 assert.equal(M.setPlacement(s,"rose~2",{angle:11,scale:1.2}),true);assert.equal(s.placements.rose,undefined);assert.deepEqual(M.normalize(JSON.parse(JSON.stringify(s))),s);
 const svg=M.bouquetSvg(s,"QA");assert.equal((svg.match(/data-flower=/g)||[]).length,12);assert.ok(svg.includes('data-flower="rose~2"'));assert.ok(!/NaN|Infinity|undefined/.test(svg));
 const before=M.bouquetSnapshot(s);assert.equal(M.remove(s,"rose~2"),true);assert.equal(s.placements["rose~2"],undefined);M.restoreBouquet(s,before);assert.deepEqual(M.bouquetSnapshot(s),before);
}
