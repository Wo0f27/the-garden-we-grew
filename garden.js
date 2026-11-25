/* UI controller; no third-party requests, analytics or personal data upload. */
(function(){
"use strict";
const M=window.GardenModel, el=id=>document.getElementById(id), KEY="the-garden-we-grew-prototype-v1";
let copy,state=M.fresh(),noticeTimer,storageOK=true;
let paperPreview=false,editMode=false,selectedFlower=null,drag=null,undoStack=[],redoStack=[], nurserySignature="",traySignature="",pngBusy=false;
function clearNotice(){clearTimeout(noticeTimer);el("notice").textContent="";}
function tell(message){clearNotice();el("notice").textContent=message;noticeTimer=setTimeout(clearNotice,3500);}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageOK=false;tell("This browser could not save the garden. Keep this tab open.");}}
function loadCopy(){
 return new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="garden-text.js?v="+Date.now();let timeout=setTimeout(()=>{script.remove();reject(new Error("Text load timed out"));},7000);
 script.onload=()=>{clearTimeout(timeout);window.GARDEN_TEXT?resolve(window.GARDEN_TEXT):reject(new Error("Invalid text file"));};
 script.onerror=()=>{clearTimeout(timeout);reject(new Error("Text file unavailable"));};document.head.appendChild(script);});
}
function node(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function button(label,action,id,cls=""){const b=node("button",cls,label);b.type="button";b.dataset.action=action;b.dataset.id=id;return b;}
// Animate only the changed pot. State is committed at the start of each watering
// action; interrupted or reduced-motion animations cannot lose progress.
function growPot(art,plant){
 const end=plant.stage;
 if(end<1||window.matchMedia("(prefers-reduced-motion: reduce)").matches||document.hidden||typeof requestAnimationFrame!=="function")return;
 const duration=end===4?950:620;
 const initial=end-1;
 let first=null,last=-Infinity;
 art.innerHTML=M.potSvg({...plant,stage:initial});
 function frame(now){
  if(!art.isConnected)return;
  if(first===null)first=now;
  const t=Math.min(1,(now-first)/duration);
  if(document.hidden||window.matchMedia("(prefers-reduced-motion: reduce)").matches||t===1){art.innerHTML=M.potSvg(plant);return;}
  if(now-last>=32){const ease=t*t*(3-2*t);art.innerHTML=M.potSvg({...plant,stage:initial+ease});last=now;}
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
// History is intentionally session-local and contains no plant progress.
function record(before){
 if(JSON.stringify(before)===JSON.stringify(M.bouquetSnapshot(state)))return false;
 undoStack.push(before);if(undoStack.length>30)undoStack.shift();redoStack=[];return true;
}
function bouquetChange(fn,focus){
 const before=M.bouquetSnapshot(state);if(fn()===false||!record(before))return false;
 persist();render(focus);return true;
}
function historyStep(from,to){
 if(!from.length)return;paperPreview=false;cancelDrag();to.push(M.bouquetSnapshot(state));M.restoreBouquet(state,from.pop());persist();render();
}
function stemName(id){const kind=M.stemSpecies(id);const n=id===kind?1:Number(id.split("~")[1]);return copy.flowers[kind].name+(M.stemCount(state,kind)>1?" "+n:"");}
function selectedItem(){return M.bouquetLayout(state.bouquet,state.placements).find(x=>x.id===selectedFlower);}
function svgPoint(svg,e){
 try{const matrix=svg.getScreenCTM();if(!matrix)return null;const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const v=p.matrixTransform(matrix.inverse());return Number.isFinite(v.x)&&Number.isFinite(v.y)?v:null;}catch{return null;}
}
function addHandles(){
 const art=el("bouquetArt"),svg=art.querySelector("svg");
 art.classList.toggle("position-mode",editMode);
 if(!svg||!editMode)return;
 const ns="http://www.w3.org/2000/svg",layer=document.createElementNS(ns,"g");layer.setAttribute("class","position-handles");layer.setAttribute("aria-hidden","true");
 for(const item of M.bouquetLayout(state.bouquet,state.placements)){
  const pt=M.flowerHead(M.stemPlant(state,item.id),item),g=document.createElementNS(ns,"g");
  g.dataset.handle=item.id;g.setAttribute("class","flower-handle"+(item.id===selectedFlower?" selected":""));g.setAttribute("transform","translate("+pt.x+" "+pt.y+")");
  const hit=document.createElementNS(ns,"circle");hit.setAttribute("r","23");hit.setAttribute("fill","transparent");
  const ring=document.createElementNS(ns,"circle");ring.setAttribute("r","11");ring.setAttribute("class","handle-ring");
  const cross=document.createElementNS(ns,"path");cross.setAttribute("d","M-5 0H5M0 -5V5");cross.setAttribute("class","handle-cross");
  g.append(hit,ring,cross);layer.append(g);
 }
 svg.append(layer);
}
function renderPositionControls(){
 if(!state.bouquet.includes(selectedFlower))selectedFlower=state.bouquet[0]||null;
 if(state.wrapped||!selectedFlower)editMode=false;
 const select=el("positionFlower");select.replaceChildren();for(const id of state.bouquet){const o=node("option","",stemName(id));o.value=id;select.append(o);}select.value=selectedFlower||"";select.disabled=!selectedFlower;
 const editable=!!selectedFlower&&!state.wrapped;
 const button=el("editPosition");button.disabled=!editable;button.setAttribute("aria-pressed",String(editMode));button.textContent=editMode?copy.finishPosition:copy.editPosition;
 el("positionHint").textContent=!selectedFlower?copy.positionEmpty:state.wrapped?copy.positionWrapped:editMode?copy.positionActive:copy.positionHint;
 const item=selectedItem();for(const [id,disabled] of [["tiltLeft",item?.angle<=-40],["tiltRight",item?.angle>=40],["raiseFlower",item?.scale>=1.68],["lowerFlower",item?.scale<=1.10],["resetFlower",!state.placements[selectedFlower]],["autoArrange",!Object.keys(state.placements).length]])el(id).disabled=!editable||disabled;
 el("undoBouquet").disabled=!undoStack.length;el("redoBouquet").disabled=!redoStack.length;
}
function updatePreview(){
 const art=el("bouquetArt");art.classList.remove("wrap-sequence");const preview=paperPreview&&!state.wrapped&&!editMode&&state.bouquet.length>0;art.innerHTML=M.bouquetSvg(state,copy.brand,{workbench:true,previewWrap:preview});el("paperPreviewStatus").hidden=!preview;renderPositionControls();addHandles();
}
function cancelDrag(restore=false){
 if(!drag)return;const active=drag;drag=null;
 const art=el("bouquetArt");try{if(art.hasPointerCapture(active.pointerId))art.releasePointerCapture(active.pointerId);}catch{}
 if(restore)updatePreview();
}
function beginDrag(e){
 if(!editMode||state.wrapped||drag||e.isPrimary===false||(e.pointerType==="mouse"&&e.button!==0))return;
 const art=el("bouquetArt"),handle=e.target.closest("[data-handle]");if(!handle)return;
 const id=handle.dataset.handle,item=M.bouquetLayout(state.bouquet,state.placements).find(x=>x.id===id),svg=art.querySelector("svg");
 if(!item||!svg)return;const start=svgPoint(svg,e);if(!start)return;
 const head=M.flowerHead(M.stemPlant(state,id),item),group=svg.querySelector('[data-flower="'+id+'"]');if(!group)return;
 e.preventDefault();selectedFlower=id;el("positionFlower").value=id;
 for(const x of svg.querySelectorAll("[data-handle]"))x.classList.toggle("selected",x===handle);
 drag={id,pointerId:e.pointerId,item,head,start,svg,group,handle,next:null};try{art.setPointerCapture(e.pointerId);}catch{drag=null;updatePreview();}
}
function moveDrag(e){
 if(!drag||e.pointerId!==drag.pointerId)return;const p=svgPoint(drag.svg,e);if(!p)return;
 e.preventDefault();const dx=p.x-drag.start.x,dy=p.y-drag.start.y;
 if(!drag.next&&Math.hypot(dx,dy)<2)return;
 const next=M.placementFromHead(M.stemPlant(state,drag.id),drag.item,drag.head.x+dx,drag.head.y+dy);if(!next)return;
 drag.next=next;const item={...drag.item,...next},pt=M.flowerHead(M.stemPlant(state,drag.id),item);
 drag.group.setAttribute("transform",M.placementTransform(item));drag.handle.setAttribute("transform","translate("+pt.x+" "+pt.y+")");
}
function finishDrag(e,commit){
 if(!drag||e.pointerId!==drag.pointerId)return;const active=drag;cancelDrag();
 if(commit&&active.next&&bouquetChange(()=>M.setPlacement(state,active.id,active.next)))return;
 updatePreview();
}
function nudge(angle,scale){
 paperPreview=false;const item=selectedItem();if(!item||state.wrapped)return;bouquetChange(()=>M.setPlacement(state,item.id,{angle:item.angle+angle,scale:item.scale+scale}));
}
function render(focus){
 cancelDrag();
 const root=el("plants");const signature=M.species.map(id=>(state.plants[id]?.stage??-1)+":"+M.stemCount(state,id)).join(",");
 const grown=M.species.filter(id=>state.plants[id]?.stage===4).length;
 if(nurserySignature!==signature){nurserySignature=signature;root.replaceChildren();
 for(const id of M.species){
  const p=state.plants[id], c=copy.flowers[id], stage=p?.stage??-1;
  const card=node("article","plant-card");const art=node("div","plant-art");art.innerHTML=M.potSvg(p);if(focus?.id===id&&focus.action==="plant")art.classList.add("growth-reveal");card.append(art,node("h3","",c.name),node("div","species-meaning",c.meaning),node("div","stage",stage<0?"Ready to plant":copy.stages[stage]));
  const meter=node("div","stage-meter");meter.setAttribute("aria-hidden","true");for(let i=0;i<5;i++)meter.append(node("i",i<=stage?"filled":""));card.append(meter);
  if(stage===4)card.append(node("p","plant-message",c.message));
  const action=stage<0?"plant":stage<4?"water":"add", added=M.stemCount(state,id)>0;
  const b=button(action==="plant"?copy.plant:action==="water"?copy.water:added?copy.added:copy.add,action,id,"action");
  b.setAttribute("aria-label",b.textContent+" — "+c.name);b.disabled=action==="add"&&(added||state.bouquet.length>=M.MAX_STEMS);card.append(b);root.append(card);if(focus?.id===id&&focus.action==="water"&&p)growPot(art,p);
 }}
 if(window.GardenScenes)window.GardenScenes.update(state,copy,grown);
 el("progressText").textContent=grown+" of "+M.species.length+" flowers in bloom";el("progress").max=M.species.length;el("progress").value=grown;
 const bouquetArt=el("bouquetArt");updatePreview();
 // Render final paper immediately; avoid SVG group transform animations on mobile.
 const tray=el("flowerTray"),trayKey=signature+"|"+state.bouquet.join(",");if(traySignature!==trayKey){traySignature=trayKey;tray.replaceChildren();
 const ids=[...state.bouquet,...M.species.filter(kind=>!M.stemCount(state,kind))];
 for(const id of ids){const kind=M.stemSpecies(id),p=state.plants[kind],i=state.bouquet.indexOf(id),selected=i>=0,ready=p?.stage===4,name=selected?stemName(id):copy.flowers[kind].name;
  const card=node("article","tray-flower"+(selected?" tray-selected":""));card.dataset.flower=id;
  const preview=node("div","tray-art");preview.innerHTML=M.potSvg(p);
  card.append(preview,node("span","tray-name",name),node("small","tray-state",selected?copy.traySelected+" · "+(i+1):ready?copy.trayReady:copy.trayGrowing));
  if(selected){const controls=node("div","tray-arrange");for(const [action,label,disabled,aria] of [["up","↑",i===0,"Move earlier"],["down","↓",i===state.bouquet.length-1,"Move later"],["remove","×",false,"Remove"]]){const b=button(label,action,id,"secondary");b.disabled=disabled;b.setAttribute("aria-label",aria+" — "+name);controls.append(b);}card.append(controls);}
  if(!selected||state.bouquet.find(stem=>M.stemSpecies(stem)===kind)===id){const add=button(selected?copy.trayAddMore:copy.trayAdd,"add",kind,"secondary tray-add");add.disabled=!ready||state.bouquet.length>=M.MAX_STEMS;add.setAttribute("aria-label",(selected?copy.trayAddMore:copy.trayAdd)+" — "+copy.flowers[kind].name);card.append(add);}
  tray.append(card);
 }}
 el("paperStyle").value=state.paperStyle;el("ribbonStyle").value=state.ribbonStyle;
 const wrapButton=el("wrapBouquet");wrapButton.disabled=!state.bouquet.length;wrapButton.textContent=state.wrapped?copy.unwrapButton:copy.wrapButton;wrapButton.setAttribute("aria-pressed",String(state.wrapped));
 el("wrapStatus").textContent=!state.bouquet.length?copy.wrapEmpty:state.wrapped?copy.wrapReady:copy.wrapWaiting;
 el("bouquetCount").textContent=state.bouquet.length?state.bouquet.length+" / "+M.MAX_STEMS+" flowers in your bouquet":copy.emptyBouquet;
 el("wrap").value=state.wrap;el("ribbon").value=state.ribbon;el("greenery").checked=state.greenery;el("svg").disabled=!state.bouquet.length;el("png").disabled=pngBusy||!state.bouquet.length;
 if(focus?.id){const scope=focus.scope?el(focus.scope):root,list=[...scope.querySelectorAll("button[data-id]")],target=list.find(b=>b.dataset.id===focus.id&&b.dataset.action===focus.action&&!b.disabled)||list.find(b=>b.dataset.id===focus.id&&!b.disabled)||list.find(b=>!b.disabled);(target||(focus.scope==="flowerTray"?el("positionFlower"):null))?.focus({preventScroll:true});}
}
function act(e){const b=e.target.closest("button[data-action]");if(!b||b.disabled)return;const {id,action}=b.dataset;let changed=false;const before=M.bouquetSnapshot(state);
 if(action==="plant")changed=M.plant(state,id);
 if(action==="water")changed=M.water(state,id);
 if(action==="add")changed=M.add(state,id);
 if(action==="remove")changed=M.remove(state,id);
 if(action==="up"||action==="down")changed=M.move(state,id,action==="up"?-1:1);
 if(changed){if(["add","remove","up","down"].includes(action)){paperPreview=false;record(before);}const fromTray=!!b.closest("#flowerTray");persist();render({id,action,scope:fromTray?"flowerTray":"plants"});if(storageOK){if(action==="water")tell(copy.flowers[id].name+": "+copy.stages[state.plants[id].stage]);else if(action==="add")tell(copy.flowers[id].name+" added to your bouquet.");}}
}
function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function svgBlob(){return new Blob([M.bouquetSvg(state,copy.brand)],{type:"image/svg+xml;charset=utf-8"});}
function saveSvg(){if(state.bouquet.length)download(svgBlob(),"our-garden-bouquet.svg");}
async function savePng(){
 if(!state.bouquet.length||pngBusy)return;pngBusy=true;const b=el("png");b.disabled=true;const url=URL.createObjectURL(svgBlob());
 try{const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1320;const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");ctx.drawImage(img,0,0,1200,1320);const blob=await new Promise((ok,no)=>canvas.toBlob(v=>v?ok(v):no(Error("PNG unavailable")),"image/png"));download(blob,"our-garden-bouquet.png");tell("Your bouquet is ready to save.");}catch{tell("PNG export unavailable on this browser. Choose Save as SVG instead.");}finally{URL.revokeObjectURL(url);pngBusy=false;b.disabled=!state.bouquet.length;}
}
function fillOptions(id,options){for(const [value,label] of Object.entries(options)){const o=node("option","",label);o.value=value;el(id).append(o);}}
async function start(){
 try{copy=await loadCopy();for(const id of M.species)if(!copy.flowers?.[id]||typeof copy.flowers[id].name!=="string")throw Error("Incomplete flower text");
 document.title=copy.brand;document.querySelectorAll("[data-copy]").forEach(n=>{const v=copy[n.dataset.copy];if(typeof v==="string")n.textContent=v;});
 try{state=M.normalize(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{storageOK=false;}
 fillOptions("wrap",copy.wraps);fillOptions("ribbon",copy.ribbons);fillOptions("paperStyle",copy.paperStyles);fillOptions("ribbonStyle",copy.ribbonStyles);
 const hero=el("heroFlowers");hero.innerHTML=M.species.map((id,i)=>'<g transform="translate('+[54,105,139,232,270,311][i]+' '+[292,283,282,281,290,295][i]+') scale('+[.68,.58,.46,.48,.64,.72][i]+')">'+M.flowerMarkup({id,seed:M.seedFor(id),stage:4})+'</g>').join("");
 const room=el("workroomFlowers");room.innerHTML=M.species.map((id,i)=>'<g transform="translate('+[74,145,214,526,595,667][i]+' 159) scale(.66)">'+M.flowerMarkup({id,seed:M.seedFor(id),stage:4})+'</g>').join("");
 el("bouquetHelp").addEventListener("click",()=>{cancelDrag(true);const dialog=el("helpDialog");if(!dialog.open)dialog.showModal();});el("closeHelp").addEventListener("click",()=>el("helpDialog").close());
 el("plants").addEventListener("click",act);el("flowerTray").addEventListener("click",act);
 for(const key of ["paperStyle","ribbonStyle","wrap","ribbon","greenery"]){const control=el(key);const preview=()=>{if(key!=="greenery"&&state.bouquet.length&&!state.wrapped&&!editMode){paperPreview=true;updatePreview();}};control.addEventListener("focus",preview);control.addEventListener("change",()=>{if(key!=="greenery"&&!state.wrapped&&!editMode)paperPreview=true;const changed=bouquetChange(()=>{state[key]=key==="greenery"?control.checked:control.value;});if(!changed)updatePreview();});}
 el("wrapBouquet").addEventListener("click",()=>{paperPreview=false;bouquetChange(()=>M.setWrapped(state,!state.wrapped),{action:"wrap"});});
 el("editPosition").addEventListener("click",()=>{if(state.wrapped||!state.bouquet.length)return;cancelDrag();paperPreview=false;editMode=!editMode;updatePreview();});
 el("positionFlower").addEventListener("change",()=>{cancelDrag();selectedFlower=el("positionFlower").value;updatePreview();});
 for(const [id,angle,scale] of [["tiltLeft",-5,0],["tiltRight",5,0],["raiseFlower",0,.08],["lowerFlower",0,-.08]])el(id).addEventListener("click",()=>nudge(angle,scale));
 el("resetFlower").addEventListener("click",()=>bouquetChange(()=>M.clearPlacement(state,selectedFlower)));
 el("autoArrange").addEventListener("click",()=>bouquetChange(()=>M.autoArrange(state)));
 el("undoBouquet").addEventListener("click",()=>historyStep(undoStack,redoStack));el("redoBouquet").addEventListener("click",()=>historyStep(redoStack,undoStack));
 const art=el("bouquetArt");art.addEventListener("pointerdown",beginDrag);art.addEventListener("pointermove",moveDrag);art.addEventListener("pointerup",e=>finishDrag(e,true));art.addEventListener("pointercancel",e=>finishDrag(e,false));art.addEventListener("lostpointercapture",e=>finishDrag(e,false));
 window.addEventListener("blur",()=>cancelDrag(true));document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelDrag(true);});
 el("png").addEventListener("click",savePng);el("svg").addEventListener("click",saveSvg);
 el("reset").addEventListener("click",()=>{if(!confirm(copy.resetConfirm))return;cancelDrag();undoStack=[];redoStack=[];paperPreview=false;editMode=false;selectedFlower=null;state=M.fresh();persist();render();tell("A new garden is ready.");});
 if(window.GardenScenes)window.GardenScenes.init(copy);
 el("openLetter").addEventListener("click",clearNotice);
 render();el("loading").hidden=true;el("app").hidden=false;if(!storageOK)tell("Local storage is unavailable or could not be read.");
 }catch(err){el("loading").textContent="The garden text could not be loaded. Please refresh this page. If you edited garden-text.js, check its quotation marks and commas.";console.error(err);}
}
start();
})();
