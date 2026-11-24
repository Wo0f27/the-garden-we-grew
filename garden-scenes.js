/* Prototype 02 scene controller. Original scene/state logic.
   Ambient CSS motion is adapted from yZhanWeather (see vendor/yZhanWeather/LICENSE). */
(function(){
"use strict";
const M=window.GardenModel,L=window.GardenLandscape,el=id=>document.getElementById(id);
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
let initialized=false, gateOpen=false, letterOpen=false, gateTimer=0, lastSignature="", copy;
const base=(id,stage)=>({id,seed:M.seedFor(id),stage});
function group(x,y,scale,markup){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+markup+'</g>';}
function gardenFlowers(target,state,locations){
 target.innerHTML=M.species.map((id,i)=>{const p=state.plants[id];const [x,y,s]=locations[i];return group(x,y,s,M.flowerMarkup(p||base(id,0)));}).join("");
}
function decor(target,locations){target.innerHTML=locations.map(([x,y,s,id])=>group(x,y,s,M.flowerMarkup(base(id,4)))).join("");}
function drawTree(grown){el("treeBlooms").innerHTML=L.treeCanopy(grown);}
function updateLandscape(grown){
 const growth=.50+grown/12;
 el("pathFoliage").innerHTML=L.bed(0,188,268,113,.72)+L.bed(1,177,261,284,.72);
 el("pathForeground").innerHTML=L.bed(0,172,314,377,growth)+L.bed(1,162,314,501,growth);
 el("finalFoliage").innerHTML=L.bed(0,120,270,277,.7)+L.bed(1,150,270,415,.7);
 el("finalForeground").innerHTML=L.bed(0,175,325,713,growth)+L.bed(1,155,325,819,growth);
}
function ambient(target,kind,num){
 if(!target||target.childElementCount||reduce.matches)return;
 for(let i=0;i<num;i++){const p=document.createElement("i");p.className="ambient-"+kind;if(kind==="butterfly"){p.append(document.createElement("span"),document.createElement("span"));}p.style.setProperty("--x",(9+(i*37)%84)+"%");p.style.setProperty("--duration",(8+i%5*1.7)+"s");p.style.setProperty("--delay",(-i*1.65)+"s");p.style.setProperty("--drift",((i%2?1:-1)*(18+i%4*10))+"px");target.append(p);}
}
function motion(){
 for(const [id,kind,count] of [["pathEffects","petal",9],["butterflyEffects","butterfly",3],["finalEffects","firefly",9]]){
  const target=el(id);if(reduce.matches)target.replaceChildren();else ambient(target,kind,count);
 }
}
function openGate(){
 if(gateOpen){el("gardenPath").scrollIntoView({behavior:reduce.matches?"instant":"smooth"});return;}
 gateOpen=true;el("openGate").setAttribute("aria-expanded","true");el("openGate").textContent=copy.gateOpened;
 document.body.classList.add("gate-open");el("gardenJourney").hidden=false;
 clearTimeout(gateTimer);gateTimer=setTimeout(()=>{el("gardenPath").focus({preventScroll:true});el("gardenPath").scrollIntoView({behavior:reduce.matches?"instant":"smooth"});},reduce.matches?0:650);
 motion();
}
function init(config){
 if(initialized)return;initialized=true;copy=config;
 el("openGate").addEventListener("click",openGate);
 el("openLetter").addEventListener("click",()=>{if(el("openLetter").disabled)return;letterOpen=!letterOpen;el("openLetter").setAttribute("aria-expanded",String(letterOpen));el("gardenLetter").hidden=!letterOpen;if(letterOpen){el("gardenLetter").focus({preventScroll:true});el("gardenLetter").scrollIntoView({block:"nearest",behavior:reduce.matches?"instant":"smooth"});}});
 if(reduce.addEventListener)reduce.addEventListener("change",motion);
 if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle("scene-visible",e.isIntersecting)),{threshold:.04});for(const scene of document.querySelectorAll(".scene-picture"))io.observe(scene);}
 else for(const scene of document.querySelectorAll(".scene-picture"))scene.classList.add("scene-visible");
 document.addEventListener("visibilitychange",()=>document.body.classList.toggle("motion-paused",document.hidden));
 el("heroFoliage").innerHTML=L.bush(55,289,22,82)+L.bush(306,290,23,223)+L.fern(48,295,43,317)+L.fern(312,296,46,812);
 el("heroVines").innerHTML=L.vine(66,181,35,119,1,23)+L.vine(294,184,35,121,-1,41);
 el("glassFoliage").innerHTML=L.bush(60,264,28,13)+L.bush(540,264,28,53)+L.fern(95,276,35,79)+L.fern(507,276,35,107);
 el("glassVines").innerHTML=L.vine(109,177,40,94,1,32)+L.vine(491,177,40,94,-1,76);
 el("pathWash").innerHTML=L.wash("pathPigment",761);
 el("finalWash").innerHTML=L.wash("finalPigment",925);
 decor(el("pathDecor"),[[28,316,.42,"daisy"],[578,312,.4,"gypsophila"],[108,239,.25,"tulip"],[482,244,.25,"rose"]]);
 decor(el("glassPlants"),[[39,280,.52,"rose"],[76,285,.36,"daisy"],[523,282,.36,"tulip"],[568,288,.48,"peony"]]);
}
function update(state,config,grown){
 if(!initialized)return;
 const sig=M.species.map(id=>state.plants[id]?.stage??-1).join(",");
 if(sig!==lastSignature){lastSignature=sig;
 gardenFlowers(el("pathPlants"),state,[[72,296,.63],[153,287,.48],[218,246,.31],[386,241,.31],[466,288,.55],[548,299,.65]]);
 gardenFlowers(el("finalPlants"),state,[[38,314,.40],[100,316,.31],[223,315,.29],[416,315,.29],[490,314,.40],[560,315,.48]]);
 drawTree(grown);updateLandscape(grown);}
 el("pathProgress").textContent=grown?config.pathGrown.replace("{count}",grown).replace("{total}",M.species.length):config.pathReady;
 const ready=grown===M.species.length;el("openLetter").disabled=!ready;el("letterStatus").textContent=ready?config.letterReady:config.letterWaiting;
 if(!ready&&letterOpen){letterOpen=false;el("gardenLetter").hidden=true;el("openLetter").setAttribute("aria-expanded","false");}
}
window.GardenScenes={init,update};
})();
