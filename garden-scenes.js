/* Prototype 02 scene controller. Original scene/state logic.
   Ambient CSS motion is adapted from yZhanWeather (see vendor/yZhanWeather/LICENSE). */
(function(){
"use strict";
const M=window.GardenModel,L=window.GardenLandscape,el=id=>document.getElementById(id);
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
let initialized=false, gateOpen=false, gateWalking=false, gateArriving=false, gateFrame=0, letterOpen=false, letterOpening=false, letterExtracting=false, letterUnsealed=false, letterRead=false, letterTimer=0, letterReady=false, gateTimer=0, lastSignature="", lastBloomCount=-1, copy;
const SCENES=["gardenPath","nursery","glassEntrance","greenhouse","finalGarden"];
const NEIGHBORS={gardenPath:["nursery"],nursery:["gardenPath","glassEntrance"],glassEntrance:["nursery","greenhouse"],greenhouse:["glassEntrance","finalGarden"],finalGarden:["greenhouse","nursery"]};
let activeScene="gardenPath",sceneTimer=0,pendingScene=null,scenePhase="idle";
const PETAL_COVER_MS=580,PETAL_HOLD_MS=90,PETAL_REVEAL_MS=580;
function revealScene(id){
 for(const key of SCENES){const scene=el(key);scene.classList.remove("scene-leaving","scene-entering");scene.hidden=key!==id;}
 el("gardenClosing").hidden=id!=="finalGarden"||!letterRead;activeScene=id;
 el("glassEntrance").classList.remove("glass-door-opening");
 el(id).scrollTop=0;
}
function buildTransitionPetals(){
 const root=el("transitionPetals");if(root.childElementCount)return;
 const colors=["#edb8c4","#d995a8","#f7d6d7","#e5a3b7","#f4d9bd","#f9e6d8","#c786a0"];
 for(let i=0;i<36;i++){const p=document.createElement("i"),col=i%6,row=Math.floor(i/6);
  p.className="transition-petal";
  p.style.setProperty("--x",((col+.5)*100/6+((i*13)%9-4))+"%");
  p.style.setProperty("--y",((row+.5)*100/6+((i*7)%9-4))+"%");
  p.style.setProperty("--size",(11+(i*17)%12)+"vmin");
  p.style.setProperty("--rot",((i*47)%360)+"deg");
  p.style.setProperty("--delay",((i*19)%110)+"ms");
  p.style.setProperty("--color",colors[i%colors.length]);
  root.append(p);
 }
}
function finishSceneTransition(){
 if(!pendingScene)return;
 clearTimeout(sceneTimer);sceneTimer=0;
 const id=pendingScene;if(activeScene!==id)revealScene(id);
 const overlay=el("petalTransition");overlay.hidden=true;overlay.removeAttribute("data-phase");
 el("app").inert=false;pendingScene=null;scenePhase="idle";
 if(!document.hidden)el(id).focus({preventScroll:true});
}
function coverScene(){
 if(!pendingScene||scenePhase!=="covering")return;
 if(reduce.matches||document.hidden){finishSceneTransition();return;}
 const overlay=el("petalTransition");overlay.dataset.phase="covered";scenePhase="covered";
 // The opaque veil is fully painted before any chapter changes.
 revealScene(pendingScene);
 sceneTimer=setTimeout(()=>{
  if(!pendingScene||scenePhase!=="covered")return;
  overlay.dataset.phase="revealing";scenePhase="revealing";
  sceneTimer=setTimeout(finishSceneTransition,PETAL_REVEAL_MS);
 },PETAL_HOLD_MS);
}
function startPetalCurtain(){
 if(!pendingScene)return;
 if(reduce.matches||document.hidden){finishSceneTransition();return;}
 buildTransitionPetals();
 const overlay=el("petalTransition");overlay.hidden=false;overlay.dataset.phase="covering";scenePhase="covering";el("app").inert=true;
 sceneTimer=setTimeout(coverScene,PETAL_COVER_MS);
}
function navigateScene(id){
 if(!gateOpen||gateWalking||pendingScene||!NEIGHBORS[activeScene]?.includes(id))return;
 if(activeScene==="finalGarden"&&(letterOpening||letterExtracting||letterOpen||letterUnsealed))closeLetter();
 pendingScene=id;
 if(reduce.matches||document.hidden){finishSceneTransition();return;}
 if(activeScene==="glassEntrance"&&id==="greenhouse"){
  scenePhase="door-opening";el("app").inert=true;el("glassEntrance").classList.add("glass-door-opening");
  sceneTimer=setTimeout(startPetalCurtain,380);return;
 }
 startPetalCurtain();
}
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
// Match the entrance's final 3.6x zoom on the destination path, then pull back.
// Only two bounded SVG cameras move; the document and its text never scale.
const GATE_WIDE=[0,0,360,330],GATE_CLOSE=[148,162,100,100*330/360];
const PATH_WIDE=[0,0,600,320],PATH_CLOSE=[244,191,600/3.6,320/3.6];
const setCamera=(camera,box)=>camera.setAttribute("viewBox",box.join(" "));
function showPath(){
 if(!el("gardenJourney").hidden)return;
 el("gardenJourney").hidden=false;
 el("gateIntro").hidden=true;
 el("openGate").setAttribute("aria-expanded","true");
 const path=el("gardenPath");
 path.scrollTop=0;path.focus({preventScroll:true});
 setCamera(el("gateCamera"),GATE_WIDE);
}
function finishGate(){
 if(!gateWalking)return;
 clearTimeout(gateTimer);
 if(typeof cancelAnimationFrame==="function")cancelAnimationFrame(gateFrame);
 setCamera(el("pathCamera"),PATH_WIDE);
 showPath();
 gateWalking=false;gateArriving=false;gateOpen=true;
 const b=el("openGate");
 b.removeAttribute("aria-disabled");b.setAttribute("aria-expanded","true");b.textContent=copy.gateOpened;
 document.body.classList.remove("gate-arriving");
 motion();
}
function animateCamera(camera,from,to,duration,done){
 let first=null,last=-Infinity;
 function frame(now){
  if(!gateWalking)return;
  if(reduce.matches||document.hidden){finishGate();return;}
  if(first===null)first=now;
  const t=Math.min(1,(now-first)/duration);
  if(now-last>=32||t===1){
   const eased=t*t*(3-2*t);
   if(t===1)setCamera(camera,to);
   else camera.setAttribute("viewBox",from.map((v,i)=>(v+(to[i]-v)*eased).toFixed(3)).join(" "));
   last=now;
  }
  if(t<1)gateFrame=requestAnimationFrame(frame);else done();
 }
 gateFrame=requestAnimationFrame(frame);
}
function arriveThroughGate(){
 if(!gateWalking||gateArriving)return;
 if(reduce.matches||document.hidden){finishGate();return;}
 gateArriving=true;
 const camera=el("pathCamera");
 // Set the close-up before revealing the section, so there is no wide-view flash.
 setCamera(camera,PATH_CLOSE);
 document.body.classList.add("gate-arriving");
 showPath();
 // Keep the first arriving frame for a short beat before the pullback.
 gateTimer=setTimeout(()=>animateCamera(camera,PATH_CLOSE,PATH_WIDE,1250,finishGate),100);
}
function walkThrough(){
 if(!gateWalking)return;
 if(reduce.matches||document.hidden){finishGate();return;}
 animateCamera(el("gateCamera"),GATE_WIDE,GATE_CLOSE,1100,()=>{gateTimer=setTimeout(arriveThroughGate,130);});
}
function openGate(){
 if(gateWalking)return;
 if(gateOpen)return;
 gateWalking=true;
 const button=el("openGate"),camera=el("gateCamera");
 button.setAttribute("aria-disabled","true");
 if(!reduce.matches&&!document.hidden){
  const rect=camera.getBoundingClientRect(),height=window.innerHeight;
  if(rect.top<0||rect.bottom>height)camera.scrollIntoView({behavior:"instant",block:"center"});
 }
 document.body.classList.add("gate-open");
 if(reduce.matches||document.hidden||typeof requestAnimationFrame!=="function"){finishGate();return;}
 // Let both gate leaves finish opening before moving toward the path.
 gateTimer=setTimeout(walkThrough,820);
}
function closeLetter(restoreFocus=false){
 clearTimeout(letterTimer);letterTimer=0;letterOpening=false;letterExtracting=false;letterUnsealed=false;letterOpen=false;
 const station=el("letterStation"),button=el("openLetter"),dialog=el("letterDialog");
 station.classList.remove("letter-opening","letter-open","letter-unsealed","letter-extracting");
 button.setAttribute("aria-expanded","false");button.removeAttribute("aria-disabled");
 if(dialog.open)dialog.close();el("gardenLetter").hidden=true;
 el("envelopeLabel").textContent=letterReady?(letterRead?copy.letterOpened:copy.openLetter):copy.letterLocked;
 el("gardenClosing").hidden=!letterRead||activeScene!=="finalGarden";
 if(restoreFocus&&letterReady){button.focus({preventScroll:true});button.scrollIntoView({block:"nearest",behavior:"instant"});}
}
function finishUnseal(){
 if(!letterReady||!letterOpening)return;clearTimeout(letterTimer);letterTimer=0;letterOpening=false;letterUnsealed=true;
 const station=el("letterStation"),button=el("openLetter");
 station.classList.remove("letter-opening");station.classList.add("letter-unsealed");button.removeAttribute("aria-disabled");el("envelopeLabel").textContent=copy.letterPull;
}
function revealLetter(){
 if(!letterReady||!letterExtracting)return;clearTimeout(letterTimer);letterTimer=0;letterExtracting=false;letterOpen=true;letterRead=true;
 const station=el("letterStation"),button=el("openLetter");station.classList.remove("letter-extracting","letter-unsealed");station.classList.add("letter-open");
 button.removeAttribute("aria-disabled");button.setAttribute("aria-expanded","true");el("envelopeLabel").textContent=copy.letterOpened;
 const paper=el("gardenLetter"),dialog=el("letterDialog");paper.hidden=false;if(!dialog.open)dialog.showModal();dialog.scrollTop=0;paper.focus({preventScroll:true});
}
function openLetter(){
 if(!letterReady||letterOpening||letterExtracting||letterOpen)return;
 const station=el("letterStation"),button=el("openLetter");button.setAttribute("aria-disabled","true");
 if(letterUnsealed){letterExtracting=true;station.classList.add("letter-extracting");el("envelopeLabel").textContent=copy.letterExtracting;if(reduce.matches||document.hidden)revealLetter();else letterTimer=setTimeout(revealLetter,480);return;}
 letterOpening=true;el("envelopeLabel").textContent=copy.letterOpening;station.classList.add("letter-opening");
 if(reduce.matches||document.hidden)finishUnseal();else letterTimer=setTimeout(finishUnseal,900);
}
function init(config){
 if(initialized)return;initialized=true;copy=config;
 el("openGate").addEventListener("click",openGate);
 el("gardenJourney").addEventListener("click",event=>{const link=event.target.closest("[data-scene-go]");if(!link)return;event.preventDefault();if(link.closest("section")?.id!==activeScene)return;navigateScene(link.dataset.sceneGo);});
 el("openLetter").addEventListener("click",openLetter);
 el("closeLetter").addEventListener("click",()=>closeLetter(true));
 el("letterDialog").addEventListener("cancel",event=>{event.preventDefault();closeLetter(true);});
 el("letterDialog").addEventListener("click",event=>{if(event.target===el("letterDialog"))closeLetter(true);});
 el("letterBotanical").innerHTML='<svg viewBox="0 0 180 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+group(90,113,.60,M.flowerMarkup(base("rose",4)))+group(57,111,.39,M.flowerMarkup(base("gypsophila",4)))+group(122,112,.43,M.flowerMarkup(base("peony",4)))+'</svg>';
 if(reduce.addEventListener)reduce.addEventListener("change",()=>{motion();if(reduce.matches&&gateWalking)finishGate();if(reduce.matches&&letterOpening)finishUnseal();if(reduce.matches&&letterExtracting)revealLetter();if(reduce.matches&&pendingScene)finishSceneTransition();});
 if("IntersectionObserver" in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle("scene-visible",e.isIntersecting)),{threshold:.04});for(const scene of document.querySelectorAll(".scene-picture"))io.observe(scene);}
 else for(const scene of document.querySelectorAll(".scene-picture"))scene.classList.add("scene-visible");
 document.addEventListener("visibilitychange",()=>{document.body.classList.toggle("motion-paused",document.hidden);if(document.hidden&&gateWalking)finishGate();if(document.hidden&&letterOpening)finishUnseal();if(document.hidden&&letterExtracting)revealLetter();if(document.hidden&&pendingScene)finishSceneTransition();});
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
 if(!ready){letterRead=false;closeLetter();}else if(!letterOpen&&!letterOpening&&!letterUnsealed&&!letterExtracting)el("envelopeLabel").textContent=letterRead?config.letterOpened:config.openLetter;
}
window.GardenScenes={init,update};
})();
