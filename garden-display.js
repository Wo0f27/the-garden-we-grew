/* Mobile raster display. Detached SVG geometry remains the source of truth.
   One bounded, sequential conversion queue; no live scene canvas on the page. */
(function(){
"use strict";
const sources=new Map(),scenes=new Map(),cache=new Map();let queue=Promise.resolve();
function paint(img,markup,width,height){
 const version=(img._paintVersion||0)+1;img._paintVersion=version;
 const key=width+"x"+height+":"+markup;
 const apply=src=>{if(img._paintVersion===version)img.src=src;};
 if(cache.has(key)){apply(cache.get(key));return;}
 queue=queue.catch(()=>{}).then(async()=>{
  if(img._paintVersion!==version||!img.isConnected)return;
  if(cache.has(key)){apply(cache.get(key));return;}
  const svg="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(markup);
  try{
   const input=new Image();await new Promise((ok,no)=>{input.onload=ok;input.onerror=no;input.src=svg;});
   if(img._paintVersion!==version||!img.isConnected)return;
   const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
   ctx.drawImage(input,0,0,width,height);const png=canvas.toDataURL("image/png");
   canvas.width=canvas.height=1;
   if(!png.startsWith("data:image/png"))throw Error("PNG unavailable");
   if(cache.size>=48)cache.delete(cache.keys().next().value);cache.set(key,png);apply(png);
  }catch{apply(svg);}
 });
}
function image(markup,width,height,alt=""){
 const img=document.createElement("img");img.width=width;img.height=height;img.alt=alt;img.className="raster-art";img.decoding="async";paint(img,markup,width,height);return img;
}
function flatten(container){
 const svg=container.querySelector(":scope > svg");if(!svg)return;
 const box=svg.viewBox.baseVal,w=Math.min(800,Math.round(box.width*1.5)),h=Math.round(w*box.height/box.width);
 const img=document.createElement("img");img.width=w;img.height=h;img.alt=svg.getAttribute("aria-label")||"";img.className="raster-art";img.decoding="async";
 for(const node of svg.querySelectorAll("[id]"))sources.set(node.id,node);
 svg.replaceWith(img);scenes.set(container,{svg,img,w,h,last:""});refresh(container);
}
function refresh(container){
 const item=scenes.get(container);if(!item)return;
 const markup=new XMLSerializer().serializeToString(item.svg);if(item.last===markup)return;item.last=markup;paint(item.img,markup,item.w,item.h);
}
function refreshAll(){for(const container of scenes.keys())refresh(container);}
function get(id){return sources.get(id);}
window.GardenDisplay={image,flatten,refreshAll,get};
})();
