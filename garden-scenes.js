/* Prototype 02 scene controller. Original scene/state logic.
   Ambient CSS motion is adapted from yZhanWeather (see vendor/yZhanWeather/LICENSE). */
(function(){
"use strict";
const M=window.GardenModel,el=id=>document.getElementById(id);
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
let initialized=false, gateOpen=false, letterOpen=false, gateTimer=0, lastSignature="", copy;
const base=(id,stage)=>({id,seed:M.seedFor(id),stage});
function group(x,y,scale,markup){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+markup+'</g>';}
function gardenFlowers(target,state,locations){
 target.innerHTML=M.species.map((id,i)=>{const p=state.plants[id];const [x,y,s]=locations[i];return group(x,y,s,M.flowerMarkup(p||base(id,0)));}).join("");
}
function decor(target,locations){target.innerHTML=locations.map(([x,y,s,id])=>group(x,y,s,M.flowerMarkup(base(id,4)))).join("");}
function drawTree(grown){
 const positions=[[93,87,24],[121,65,28],[153,65,35],[189,55,27],[220,68,31],[251,91,28],[144,99,37],[183,95,38],[215,113,32],[105,122,24],[269,125,23],[161,131,29]];
 el("treeBlooms").innerHTML=positions.map(([x,y,r],i)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(i<grown*2?["#dca9b1","#e8bfc2","#efc9c4"][i%3]:["#a3b59b","#8da589","#b5c1a4"][i%3])+'" opacity=".92"/>').join("")+
 positions.slice(0,grown*2).map(([x,y],i)=>group(x,y+10,.20,M.flowerMarkup(base(i%2?"rose":"peony",4)))).join("");
}
function ambient(target,kind,num){
 if(!target||target.childElementCount||reduce.matches)return;
 for(let i=0;i<num;i++){const p=document.createElement("i");p.className="ambient-"+kind;p.style.setProperty("--x",(9+(i*37)%84)+"%");p.style.setProperty("--duration",(8+i%5*1.7)+"s");p.style.setProperty("--delay",(-i*1.65)+"s");p.style.setProperty("--drift",((i%2?1:-1)*(18+i%4*10))+"px");target.append(p);}
}
function motion(){
 for(const [id,kind,count] of [["pathEffects","petal",9],["finalEffects","firefly",9]]){
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
 decor(el("pathDecor"),[[28,316,.42,"daisy"],[578,312,.4,"gypsophila"],[108,239,.25,"tulip"],[482,244,.25,"rose"]]);
 decor(el("glassPlants"),[[39,280,.52,"rose"],[76,285,.36,"daisy"],[523,282,.36,"tulip"],[568,288,.48,"peony"]]);
}
function update(state,config,grown){
 if(!initialized)return;
 const sig=M.species.map(id=>state.plants[id]?.stage??-1).join(",");
 if(sig!==lastSignature){lastSignature=sig;
 gardenFlowers(el("pathPlants"),state,[[72,296,.63],[153,287,.48],[218,246,.31],[386,241,.31],[466,288,.55],[548,299,.65]]);
 gardenFlowers(el("finalPlants"),state,[[38,314,.40],[100,316,.31],[223,315,.29],[416,315,.29],[490,314,.40],[560,315,.48]]);
 drawTree(grown);}
 el("pathProgress").textContent=grown?config.pathGrown.replace("{count}",grown).replace("{total}",M.species.length):config.pathReady;
 const ready=grown===M.species.length;el("openLetter").disabled=!ready;el("letterStatus").textContent=ready?config.letterReady:config.letterWaiting;
 if(!ready&&letterOpen){letterOpen=false;el("gardenLetter").hidden=true;el("openLetter").setAttribute("aria-expanded","false");}
}
window.GardenScenes={init,update};
})();
