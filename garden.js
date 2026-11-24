/* UI controller; no third-party requests, analytics or personal data upload. */
(function(){
"use strict";
const M=window.GardenModel, el=id=>document.getElementById(id), KEY="the-garden-we-grew-prototype-v1";
let copy,state=M.fresh(),noticeTimer,storageOK=true;
function tell(message){el("notice").textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{el("notice").textContent="";},3500);}
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
function render(focus){
 const root=el("plants");root.replaceChildren();let grown=0;
 for(const id of M.species){
  const p=state.plants[id], c=copy.flowers[id], stage=p?.stage??-1; if(stage===4)grown++;
  const card=node("article","plant-card");const art=node("div","plant-art");art.innerHTML=M.potSvg(p);if(focus?.id===id&&focus.action==="plant")art.classList.add("growth-reveal");card.append(art,node("h3","",c.name),node("div","species-meaning",c.meaning),node("div","stage",stage<0?"Ready to plant":copy.stages[stage]));
  const meter=node("div","stage-meter");meter.setAttribute("aria-hidden","true");for(let i=0;i<5;i++)meter.append(node("i",i<=stage?"filled":""));card.append(meter);
  if(stage===4)card.append(node("p","plant-message",c.message));
  const action=stage<0?"plant":stage<4?"water":"add", added=state.bouquet.includes(id);
  const b=button(action==="plant"?copy.plant:action==="water"?copy.water:added?copy.added:copy.add,action,id,"action");
  b.setAttribute("aria-label",b.textContent+" — "+c.name);b.disabled=action==="add"&&added;card.append(b);root.append(card);if(focus?.id===id&&focus.action==="water"&&p)growPot(art,p);
 }
 if(window.GardenScenes)window.GardenScenes.update(state,copy,grown);
 el("progressText").textContent=grown+" of "+M.species.length+" flowers in bloom";el("progress").max=M.species.length;el("progress").value=grown;
 el("bouquetArt").innerHTML=M.bouquetSvg(state,copy.brand);
 el("bouquetCount").textContent=state.bouquet.length?state.bouquet.length+" flower"+(state.bouquet.length===1?"":"s")+" in your bouquet":copy.emptyBouquet;
 const rows=el("arrangement");rows.replaceChildren();
 if(!state.bouquet.length)rows.append(node("p","quiet",copy.emptyArrangement));
 state.bouquet.forEach((id,i)=>{const r=node("div","arrangement-row");r.append(node("span","",copy.flowers[id].name));for(const [action,label,disabled,aria] of [["up","↑",i===0,"Move earlier"],["down","↓",i===state.bouquet.length-1,"Move later"],["remove","×",false,"Remove"]]){const b=button(label,action,id);b.disabled=disabled;b.setAttribute("aria-label",aria+" — "+copy.flowers[id].name);r.append(b);}rows.append(r);});
 el("wrap").value=state.wrap;el("ribbon").value=state.ribbon;el("greenery").checked=state.greenery;el("png").disabled=el("svg").disabled=!state.bouquet.length;
 if(focus){const list=[...document.querySelectorAll("button[data-id]")],target=list.find(b=>b.dataset.id===focus.id&&b.dataset.action===focus.action&&!b.disabled)||list.find(b=>b.dataset.id===focus.id&&!b.disabled);target?.focus({preventScroll:true});}
}
function act(e){const b=e.target.closest("button[data-action]");if(!b||b.disabled)return;const {id,action}=b.dataset;let changed=false;
 if(action==="plant")changed=M.plant(state,id);
 if(action==="water")changed=M.water(state,id);
 if(action==="add")changed=M.add(state,id);
 if(action==="remove")changed=M.remove(state,id);
 if(action==="up"||action==="down")changed=M.move(state,id,action==="up"?-1:1);
 if(changed){persist();render({id,action});if(storageOK){if(action==="water")tell(copy.flowers[id].name+": "+copy.stages[state.plants[id].stage]);else if(action==="add")tell(copy.flowers[id].name+" added to your bouquet.");}}
}
function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function svgBlob(){return new Blob([M.bouquetSvg(state,copy.brand)],{type:"image/svg+xml;charset=utf-8"});}
function saveSvg(){if(state.bouquet.length)download(svgBlob(),"our-garden-bouquet.svg");}
async function savePng(){
 if(!state.bouquet.length)return;const b=el("png");b.disabled=true;const url=URL.createObjectURL(svgBlob());
 try{const img=new Image();await new Promise((ok,no)=>{img.onload=ok;img.onerror=no;img.src=url;});const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=1320;const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");ctx.drawImage(img,0,0,1200,1320);const blob=await new Promise((ok,no)=>canvas.toBlob(v=>v?ok(v):no(Error("PNG unavailable")),"image/png"));download(blob,"our-garden-bouquet.png");tell("Your bouquet is ready to save.");}catch{tell("PNG export unavailable on this browser. Choose Save as SVG instead.");}finally{URL.revokeObjectURL(url);b.disabled=!state.bouquet.length;}
}
function fillOptions(id,options){for(const [value,label] of Object.entries(options)){const o=node("option","",label);o.value=value;el(id).append(o);}}
async function start(){
 try{copy=await loadCopy();for(const id of M.species)if(!copy.flowers?.[id]||typeof copy.flowers[id].name!=="string")throw Error("Incomplete flower text");
 document.title=copy.brand;document.querySelectorAll("[data-copy]").forEach(n=>{const v=copy[n.dataset.copy];if(typeof v==="string")n.textContent=v;});
 try{state=M.normalize(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{storageOK=false;}
 fillOptions("wrap",copy.wraps);fillOptions("ribbon",copy.ribbons);
 const hero=el("heroFlowers");hero.innerHTML=M.species.map((id,i)=>'<g transform="translate('+[54,105,139,232,270,311][i]+' '+[292,283,282,281,290,295][i]+') scale('+[.68,.58,.46,.48,.64,.72][i]+')">'+M.flowerMarkup({id,seed:M.seedFor(id),stage:4})+'</g>').join("");
 el("plants").addEventListener("click",act);el("arrangement").addEventListener("click",act);
 el("wrap").addEventListener("change",()=>{state.wrap=el("wrap").value;persist();render();});el("ribbon").addEventListener("change",()=>{state.ribbon=el("ribbon").value;persist();render();});el("greenery").addEventListener("change",()=>{state.greenery=el("greenery").checked;persist();render();});
 el("png").addEventListener("click",savePng);el("svg").addEventListener("click",saveSvg);
 el("reset").addEventListener("click",()=>{if(!confirm(copy.resetConfirm))return;state=M.fresh();persist();render();tell("A new garden is ready.");});
 if(window.GardenScenes)window.GardenScenes.init(copy);
 render();el("loading").hidden=true;el("app").hidden=false;if(!storageOK)tell("Local storage is unavailable or could not be read.");
 }catch(err){el("loading").textContent="The garden text could not be loaded. Please refresh this page. If you edited garden-text.js, check its quotation marks and commas.";console.error(err);}
}
start();
})();
