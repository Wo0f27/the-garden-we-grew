/* Prototype 02 scene controller. Original scene/state logic.
   Ambient CSS motion is adapted from yZhanWeather (see vendor/yZhanWeather/LICENSE). */
(function(){
"use strict";
const M=window.GardenModel,L=window.GardenLandscape,D=window.GardenDisplay,el=id=>document.getElementById(id)||D.get(id);
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
const stable=()=>document.documentElement.classList.contains("stable-art");
let initialized=false, gateOpen=false, letterOpen=false, letterOpening=false, letterTimer=0, letterReady=false, gateTimer=0, lastSignature="", lastBloomCount=-1, copy;
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
  const target=el(id);if(reduce.matches||stable())target.replaceChildren();else ambient(target,kind,count);
 }
}
function openGate(){
 if(gateOpen){if(!stable())el("gardenPath").scrollIntoView({behavior:reduce.matches?"instant":"smooth"});return;}
 gateOpen=true;el("openGate").setAttribute("aria-expanded","true");el("openGate").textContent=copy.gateOpened;
 document.body.classList.add("gate-open");el("gardenJourney").hidden=false;
 if(stable()){el("gateLeft").setAttribute("visibility","hidden");el("gateRight").setAttribute("visibility","hidden");D.refreshAll();}else{clearTimeout(gateTimer);gateTimer=setTimeout(()=>{el("gardenPath").focus({preventScroll:true});el("gardenPath").scrollIntoView({behavior:reduce.matches?"instant":"smooth"});},reduce.matches?0:650);}
 motion();
}
function closeLetter(restoreFocus=false){
 clearTimeout(letterTimer);letterTimer=0;letterOpening=false;letterOpen=false;
 const station=el("letterStation"),button=el("openLetter");
 station.classList.remove("letter-opening","letter-open");
 button.setAttribute("aria-expanded","false");button.removeAttribute("aria-disabled");
 el("gardenLetter").hidden=true;el("envelopeLabel").textContent=letterReady?copy.openLetter:copy.letterLocked;
 if(restoreFocus&&letterReady)button.focus({preventScroll:true});
}
function revealLetter(){
 if(!letterReady||!letterOpening)return;
 clearTimeout(letterTimer);letterTimer=0;letterOpening=false;letterOpen=true;
 el("letterStation").classList.remove("letter-opening");el("letterStation").classList.add("letter-open");
 const button=el("openLetter");button.removeAttribute("aria-disabled");button.setAttribute("aria-expanded","true");
 el("envelopeLabel").textContent=copy.letterOpened;
 const paper=el("gardenLetter");paper.hidden=false;paper.focus({preventScroll:true});if(!stable())paper.scrollIntoView({block:"nearest",behavior:reduce.matches?"instant":"smooth"});
}
function openLetter(){
 if(!letterReady||letterOpening)return;
 if(letterOpen){el("gardenLetter").focus({preventScroll:true});if(!stable())el("gardenLetter").scrollIntoView({block:"nearest",behavior:reduce.matches?"instant":"smooth"});return;}
 letterOpening=true;el("openLetter").setAttribute("aria-disabled","true");el("envelopeLabel").textContent=copy.letterOpening;
 el("letterStation").classList.add("letter-opening");
 if(reduce.matches||stable()||document.hidden)revealLetter();else letterTimer=setTimeout(revealLetter,900);
}
function init(config){
 if(initialized)return;initialized=true;copy=config;
 el("openGate").addEventListener("click",openGate);
 el("openLetter").addEventListener("click",openLetter);
 el("closeLetter").addEventListener("click",()=>closeLetter(true));
 el("letterBotanical").innerHTML='<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+group(90,113,.60,M.flowerMarkup(base("rose",4)))+group(57,111,.39,M.flowerMarkup(base("gypsophila",4)))+group(122,112,.43,M.flowerMarkup(base("peony",4)))+'</svg>';
 if(reduce.addEventListener)reduce.addEventListener("change",()=>{motion();if(reduce.matches&&letterOpening)revealLetter();});
 if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle("scene-visible",e.isIntersecting)),{threshold:.04});for(const scene of document.querySelectorAll(".scene-picture"))io.observe(scene);}
 else for(const scene of document.querySelectorAll(".scene-picture"))scene.classList.add("scene-visible");
 document.addEventListener("visibilitychange",()=>{document.body.classList.toggle("motion-paused",document.hidden);if(document.hidden&&letterOpening)revealLetter();});
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
 }
 if(grown!==lastBloomCount){lastBloomCount=grown;drawTree(grown);updateLandscape(grown);}
 el("pathProgress").textContent=grown?config.pathGrown.replace("{count}",grown).replace("{total}",M.species.length):config.pathReady;
 const ready=grown===M.species.length;letterReady=ready;el("openLetter").disabled=!ready;
 el("letterStation").classList.toggle("letter-ready",ready);el("benchEnvelope").setAttribute("visibility",ready?"visible":"hidden");
 el("letterStatus").textContent=ready?config.letterReady:config.letterWaiting;
 el("letterProgress").textContent=config.letterProgress.replace("{count}",grown).replace("{total}",M.species.length);
 el("finalBloomMeter").innerHTML=M.species.map((id,i)=>'<span class="final-bloom'+(state.plants[id]?.stage===4?' bloomed':'')+'"><svg viewBox="0 0 24 24"><path d="M12 9C3 2 1 13 8 13C1 20 12 24 12 16C19 24 26 14 16 13C23 4 12 2 12 9Z" fill="currentColor"/><circle cx="12" cy="13" r="2.3" fill="#d2ad72"/></svg></span>').join("");
 if(!ready)closeLetter();else if(!letterOpen&&!letterOpening)el("envelopeLabel").textContent=config.openLetter;
 if(stable())D.refreshAll();
}
function flatten(){for(const container of document.querySelectorAll(".hero-art,.scene-picture,.florist-room,.letter-botanical"))D.flatten(container);}
window.GardenScenes={init,update,flatten};
})();
