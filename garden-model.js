/* Dependency-free garden model; botanical outlines adapted from BLOOM° (MIT). */
(function(root){
"use strict";
const originalSpecies=Object.freeze(["rose","peony","tulip","daisy","sunflower","gypsophila"]),extendedSpecies=Object.freeze(["lily","carnation","lavender","orchid"]),species=Object.freeze([...originalSpecies,...extendedSpecies]),MAX_STEMS=12;
function stemSpecies(id){if(typeof id!=="string")return null;const match=/^([a-z]+)(?:~([2-9]|1[0-2]))?$/.exec(id);return match&&species.includes(match[1])?match[1]:null;}
function stemPlant(s,id){const kind=stemSpecies(id),plant=s.plants[kind];return plant?{...plant,color:validColor(kind,s.stemColors?.[id]),seed:id===kind?plant.seed:seedFor(id)}:null;}
function stemCount(s,kind){return s.bouquet.filter(id=>stemSpecies(id)===kind).length;}
function nextStem(s,kind){if(s.bouquet.length>=MAX_STEMS||s.plants[kind]?.stage!==4)return null;for(let n=1;n<=MAX_STEMS;n++){const id=n===1?kind:kind+"~"+n;if(!s.bouquet.includes(id))return id;}return null;}
const colors={rose:["#d998a5","#b7657b","#f0bdc4"],peony:["#e4aeb9","#c48198","#f7d0d7"],tulip:["#d88c9c","#a95876","#f3b5bc"],daisy:["#fffdf1","#d8d6bc","#fffef7"],sunflower:["#e5bd50","#c98e32","#f6d780"],gypsophila:["#fff9e9","#ddcfbc","#ffffff"],lily:["#e6a0b5","#b95d81","#ffe8ef"],carnation:["#e7a4b4","#b86483","#f9d2da"],lavender:["#a99acb","#756499","#d8cdea"],orchid:["#cb91c9","#995ba0","#f3d2ec"]};
// Original palettes remain byte-identical; all new palettes and geometry authored locally.
const variants={
 rose:{red:["#c95161","#8e273c","#f1848a"],ivory:["#fff4db","#d6bb97","#fffdf3"],yellow:["#e9c45e","#bf913c","#fff0a6"]},
 peony:{white:["#fff7eb","#dac8bb","#fffdf8"],coral:["#ed998b","#c26563","#ffd0b7"]},
 tulip:{purple:["#a58ac9","#74539a","#dcc7ee"],yellow:["#f0cc5d","#c39b35","#fff3a5"]},
 daisy:{pink:["#eaa4bc","#b77396","#ffe0ec"],lavender:["#b7a3d7","#8b74aa","#e9dafa"]},
 sunflower:{rust:["#cb7750","#923e31","#edab70"],lemon:["#f1da82","#c1a644","#fff4b9"]},
 gypsophila:{pink:["#e9b0c7","#c88da8","#ffe3ef"],lilac:["#c8b4e2","#a58fc2","#f1e5ff"]},
 lily:{white:["#fff7e7","#cfbfab","#fffef8"],orange:["#ed9a57","#bc603a","#ffd7a0"]},
 carnation:{red:["#d35c70","#963b51","#fa9fac"],white:["#fff6e9","#d5c6b4","#fffef6"]},
 lavender:{blue:["#8c9fce","#566caa","#c9d6f1"],pink:["#d9a7c0","#a777a0","#f5d7e8"]},
 orchid:{white:["#fff9ee","#d6b9cb","#fffdf9"],purple:["#a67abb","#75458e","#d8b4e3"]}
};
function validColor(kind,value){return species.includes(kind)&&typeof value==="string"&&Object.prototype.hasOwnProperty.call(variants[kind],value)?value:"default";}
function palette(kind,value){return validColor(kind,value)==="default"?colors[kind]:variants[kind][value];}
function colorOptions(kind){return species.includes(kind)?["default",...Object.keys(variants[kind])]:[];}
function setPlantColor(s,kind,value){const p=s.plants[kind];if(!p||!colorOptions(kind).includes(value)||p.color===value)return false;p.color=value;return true;}
function setStemColor(s,id,value){const kind=stemSpecies(id);if(!s.bouquet.includes(id)||!colorOptions(kind).includes(value)||validColor(kind,s.stemColors[id])===value)return false;s.stemColors[id]=value;return true;}
const wraps={ivory:"#e9d8bc",blush:"#e3b6bd",sage:"#aebda4"},ribbons={rose:"#b16c83",gold:"#c2a168",forest:"#55775c"};
const paperStyles=["plain","botanical","stripe"],ribbonStyles=["bow","long","knot"];
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=n=>Number(n.toFixed(3));
function seedFor(id){let x=2166136261;for(const c of id){x=Math.imul(x^c.charCodeAt(0),16777619);}return x>>>0;}
function rng(seed){let t=seed>>>0;return ()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^(t>>>15),t|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;};}
function fresh(){return {version:2,plants:{},bouquet:[],stemColors:{},wrap:"ivory",ribbon:"rose",greenery:true,paperStyle:"plain",ribbonStyle:"bow",wrapped:false,placements:{}};}
function normalize(input){
 const s=fresh();if(!input||typeof input!=="object"||(input.version!==1&&input.version!==2))return s;
 for(const id of species){const p=input.plants&&input.plants[id];if(p&&Number.isInteger(p.stage)&&p.stage>=0&&p.stage<=4)s.plants[id]={id,stage:p.stage,seed:seedFor(id),color:input.version===2?validColor(id,p.color):"default"};}
 if(Array.isArray(input.bouquet))s.bouquet=[...new Set(input.bouquet.filter(id=>stemSpecies(id)&&s.plants[stemSpecies(id)]?.stage===4))].slice(0,MAX_STEMS);
 if(own(wraps,input.wrap))s.wrap=input.wrap;if(own(ribbons,input.ribbon))s.ribbon=input.ribbon;s.greenery=input.greenery!==false;if(paperStyles.includes(input.paperStyle))s.paperStyle=input.paperStyle;if(ribbonStyles.includes(input.ribbonStyle))s.ribbonStyle=input.ribbonStyle;s.wrapped=s.bouquet.length>0&&(typeof input.wrapped==="boolean"?input.wrapped:true);for(const id of s.bouquet){s.stemColors[id]=input.version===2?validColor(stemSpecies(id),input.stemColors?.[id]):"default";const p=validPlacement(input.placements?.[id]);if(p)s.placements[id]=p;}return s;
}
function plant(s,id){if(!species.includes(id)||s.plants[id])return false;s.plants[id]={id,stage:0,seed:seedFor(id),color:"default"};return true;}
function water(s,id){const p=s.plants[id];if(!p||p.stage>=4)return false;p.stage++;return true;}
function add(s,kind){const id=nextStem(s,kind);if(!id)return false;s.bouquet.push(id);s.stemColors[id]=validColor(kind,s.plants[kind].color);s.wrapped=false;return true;}
function remove(s,id){const i=s.bouquet.indexOf(id);if(i<0)return false;s.bouquet.splice(i,1);delete s.placements[id];delete s.stemColors[id];s.wrapped=false;return true;}
function move(s,id,delta){if(delta!==1&&delta!==-1)return false;const i=s.bouquet.indexOf(id),j=i+delta;if(i<0||j<0||j>=s.bouquet.length)return false;[s.bouquet[i],s.bouquet[j]]=[s.bouquet[j],s.bouquet[i]];s.wrapped=false;return true;}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]));}
function leaf(x,y,side,size){return '<path d="M'+x+' '+y+' q'+(side*size)+' '+(-size*.95)+' '+(side*size*1.28)+' '+(-size*.7)+' q'+(-side*size*.1)+' '+size*.72+' '+(-side*size*1.28)+' '+size*.7+'" fill="#73916f" stroke="#547553" stroke-width=".65"/><path d="M'+x+' '+y+' l'+(side*size*.96)+' '+(-size*.58)+'" stroke="#d4dfb8" stroke-width=".65" opacity=".6"/>';}
/* petalPath and smoothClosed adapted from BLOOM° index.html at f052a78915c30ec3a1b22eab90fb508795bcadf0.
   Copyright (c) 2026 Alessio Sabatino; MIT; vendor/BLOOM/LICENSE.
   Bounded sample counts and project-seeded randomness are supplied by our renderer. */
function petalPath(o) {
  const len = o.len || 70;
  const wid = o.wid || 30;
  const fullAt = o.fullAt === undefined ? 0.46 : o.fullAt;
  const plump = o.plump === undefined ? 0.85 : o.plump;
  const curl = o.curl || 0;
  const lean = o.lean || 0;
  const ruffle = o.ruffle || 0;
  const ruffleFreq = o.ruffleFreq || 3;
  const tip = o.tip || 'round';
  const asym = o.asym || 0;
  // Sample in proportion to the petal's size: a 17px heart petal needs a
  // fraction of the curve segments a 92px guard petal does.
  const steps = o.steps || Math.max(7, Math.min(15, Math.round(len / 7)));
  const rnd = o.rnd || Math.random;

  // Tipped petals stop short of the apex so the blade still has width
  // there; the tip cap is then carved in explicitly.
  const blunt = (tip === 'cleft' || tip === 'notch' || tip === 'fringe');
  const tEnd = blunt ? 0.84 : 1;
  const L = len / tEnd;

  const e = Math.log(0.5) / Math.log(Math.max(0.08, Math.min(0.92, fullAt)));
  const phaseR = rnd() * Math.PI * 2;
  const phaseL = rnd() * Math.PI * 2;

  const profile = (t) => Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, e))), plump);
  // Centreline: bends sideways (curl) and tilts (lean) for a 3-D read.
  const axisX = (t) => curl * Math.sin(Math.PI * t) + lean * t * t;
  const axisY = (t) => -L * t;

  const right = [], left = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * tEnd;
    const base = wid * profile(t);
    const waveR = 1 + ruffle * Math.sin(ruffleFreq * Math.PI * t + phaseR) * t;
    const waveL = 1 + ruffle * Math.sin(ruffleFreq * Math.PI * t + phaseL) * t;
    right.push([axisX(t) + base * waveR * (1 + asym), axisY(t)]);
    left.push([axisX(t) - base * waveL * (1 - asym), axisY(t)]);
  }

  const pts = [[0, 0]];
  for (let i = 1; i <= steps; i++) pts.push(right[i]);

  const rx = right[steps][0], lx = left[steps][0];
  const ax = axisX(tEnd);
  const apex = -len;

  if (tip === 'notch') {
    pts.push([rx * 0.6 + ax * 0.4, apex]);
    pts.push([ax, apex * 0.90]);
    pts.push([lx * 0.6 + ax * 0.4, apex]);
  } else if (tip === 'cleft') {
    pts.push([rx * 0.72 + ax * 0.28, apex * 1.01]);
    pts.push([ax, apex * 0.86]);
    pts.push([lx * 0.72 + ax * 0.28, apex * 1.01]);
  } else if (tip === 'fringe') {
    // Three small teeth, the way a daisy ray or a cornflower is toothed.
    const teeth = 3;
    for (let k = 0; k <= teeth * 2; k++) {
      const f = k / (teeth * 2);
      const px = rx + (lx - rx) * f;
      const peak = (k % 2 === 0) ? apex * 1.02 : apex * 0.84;
      pts.push([px, peak]);
    }
  } else if (tip === 'point') {
    pts.push([ax, apex * 1.08]);
  }

  for (let i = steps; i >= 1; i--) pts.push(left[i]);
  return smoothClosed(pts);
}

/** Closed Catmull-Rom → cubic Bézier, rounded to keep the markup light. */
function smoothClosed(pts) {
  const n = pts.length;
  const f = (v) => Math.round(v * 10) / 10;
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}
const bloomCache=new Map();
function bloomShape(id,seed,color="default"){
 const key=id+":"+seed+":"+validColor(id,color);if(bloomCache.has(key)){const v=bloomCache.get(key);bloomCache.delete(key);bloomCache.set(key,v);return v;}
 const random=rng(seed),[mid,dark,light]=palette(id,color);
 const circle=(cx,cy,r,fill,opacity=1)=>'<circle cx="'+num(cx)+'" cy="'+num(cy)+'" r="'+num(r)+'" fill="'+fill+'" opacity="'+opacity+'"/>';
 let p="";
 function petals(n,length,width,fill,{offset=0,base=0,ruffle=.06,tip="round",curl=0,fullAt=.57,lean=0,stroke=dark}={}){
  let s="";
  for(let i=0;i<n;i++){
   const a=i*360/n+offset+(random()-.5)*9;
   const len=length*(.90+random()*.19),wid=width*(.89+random()*.20);
   const d=petalPath({len,wid,fullAt,plump:.74,curl:curl+(random()-.5)*1.7,lean:lean+(random()-.5)*2,ruffle,ruffleFreq:3,tip,asym:(random()-.5)*.19,steps:5,rnd:random});
   s+='<g transform="rotate('+num(a)+') translate(0 '+num(-base)+')"><path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".48" stroke-opacity=".32" stroke-linejoin="round" opacity=".94"/><path d="M0 -2 Q'+num(curl*.3)+' '+num(-len*.55)+' '+num(lean*.6)+' '+num(-len*.82)+'" fill="none" stroke="'+light+'" stroke-width=".7" opacity=".30"/></g>';
  }return s;
 }
 if(id==="rose"){
  p=petals(7,23,10,dark,{base:7,offset:10,curl:3,ruffle:.08,fullAt:.67})+petals(7,21,9,mid,{base:4,offset:31,curl:4,ruffle:.12,fullAt:.65})+petals(6,15,7,light,{base:2,offset:14,curl:3,fullAt:.65})+petals(5,9,4,dark,{offset:35,curl:2})+petals(4,6,2.8,mid,{offset:13,curl:1.5});
 }else if(id==="peony"){
  p=petals(9,24,10,dark,{base:7,ruffle:.17,tip:"cleft",fullAt:.72})+petals(9,23,10,mid,{base:4,offset:22,ruffle:.22,tip:"cleft",fullAt:.72})+petals(7,18,8,light,{base:2,offset:9,ruffle:.22,tip:"notch",fullAt:.68})+petals(5,10,5,mid,{offset:32,ruffle:.18})+circle(0,0,4,"#d4ac70");
  for(let i=0;i<10;i++){const a=random()*Math.PI*2,rr=2+random()*3;p+=circle(Math.cos(a)*rr,Math.sin(a)*rr,.9,"#e8c98a");}
 }else if(id==="tulip"){
  const tulip=(angle,fill,len,wid,lean)=>'<path transform="rotate('+angle+')" d="'+petalPath({len,wid,fullAt:.69,plump:.65,curl:lean*.65,lean,ruffle:.025,steps:7,rnd:random})+'" fill="'+fill+'" stroke="'+dark+'" stroke-width=".55" stroke-opacity=".48"/>';
  p='<g transform="translate(0 12)">'+tulip(-29,dark,42,11,-5)+tulip(29,dark,42,11,5)+tulip(0,light,44,12,0)+tulip(-17,mid,38,13,-2)+tulip(18,light,38,13,2)+'<path d="M0 -34 Q-4 -16 0 -2 M-16 -26 Q-8 -12 -3 -2 M15 -27 Q8 -12 3 -2" stroke="'+dark+'" opacity=".24" fill="none" stroke-width=".7"/></g>';
 }else if(id==="daisy"||id==="sunflower"){
  const sun=id==="sunflower",rad=sun?12:7;
  p=petals(sun?19:13,sun?21:23,sun?4.9:3.8,dark,{base:rad-2,tip:sun?"point":"fringe",ruffle:.035,fullAt:.62})+petals(sun?16:12,sun?20:22,sun?4.4:3.5,mid,{base:rad-2,offset:13,tip:sun?"point":"fringe",ruffle:.04,fullAt:.62})+circle(0,0,rad,sun?"#775536":"#d6ad57");
  const dots=sun?40:19;for(let i=0;i<dots;i++){const a=i*2.399963229728653,rr=Math.sqrt((i+.5)/dots)*(rad-1.4);p+=circle(Math.cos(a)*rr,Math.sin(a)*rr,sun?1.05:.8,sun?["#a57b48","#d3a563","#5a412d"][i%3]:["#f3d689","#ad833f"][i%2]);}
 }else if(id==="lily"){
  p=petals(3,34,9,dark,{offset:60,tip:"point",curl:2,fullAt:.57})+petals(3,37,12,mid,{tip:"point",curl:-2,fullAt:.53})+circle(0,0,5,light);
  for(let i=0;i<6;i++){const a=i*Math.PI/3,x=Math.sin(a)*17,y=-Math.cos(a)*17;p+='<path d="M0 0 Q'+num(x*.5)+' '+num(y*.28)+' '+num(x)+' '+num(y)+'" stroke="#d6b36c" stroke-width="1.5" fill="none"/>'+circle(x,y,2.3,"#a96a3c");for(let k=0;k<3;k++)p+=circle(Math.sin(a+.18)* (8+k*4),-Math.cos(a+.18)*(8+k*4),.9,dark,.68);}
  p+=circle(0,0,2.2,"#7a9769");
 }else if(id==="carnation"){
  p=petals(9,24,10,dark,{base:5,ruffle:.25,tip:"fringe",fullAt:.74})+petals(10,21,9,mid,{base:4,offset:15,ruffle:.28,tip:"fringe",fullAt:.72})+petals(8,17,7,light,{offset:31,ruffle:.24,tip:"cleft",fullAt:.72})+petals(7,10,5,mid,{offset:11,ruffle:.25,tip:"fringe"});
 }else if(id==="lavender"){
  p='<path d="M0 28Q-2 0 0 -32" stroke="#718560" stroke-width="1.5" fill="none"/>';
  for(let k=0;k<8;k++){const y=24-k*7,w=7*(1-k*.067);for(const side of [-1,1]){const x=side*w;p+='<g transform="translate('+num(x)+' '+y+') rotate('+side*35+')"><ellipse rx="3.3" ry="6.5" fill="'+dark+'"/><ellipse cy="-2" rx="3.2" ry="4.1" fill="'+mid+'"/><ellipse cx="-1" cy="-4" rx="1.4" ry="2" fill="'+light+'"/></g>';}}
  p+=circle(0,-32,2.6,light);
 }else if(id==="orchid"){
  p='<path d="M0 2C-8 -8 -19 -26 -6 -34C7 -42 13 -26 3 -5C14 -24 37 -25 35 -7C34 9 17 12 5 5C21 17 17 32 3 23C-9 34 -23 18 -7 6C-22 15 -39 5 -35 -10C-31 -26 -12 -22 0 2Z" fill="'+dark+'" stroke="'+dark+'" stroke-width=".7"/><path d="M0 -1C-12 -25 -36 -29 -37 -10C-39 7 -18 14 0 3C18 14 39 7 37 -10C36 -29 12 -25 0 -1Z" fill="'+mid+'" stroke="'+dark+'" stroke-width=".6"/><path d="M0 2C-6 -9 -13 -3 -10 6C-23 14 -12 23 0 17C12 23 23 14 10 6C13 -3 6 -9 0 2Z" fill="'+light+'" stroke="'+dark+'" stroke-width="1"/><path d="M-5 6Q0 15 5 6L3 14Q0 19 -3 14Z" fill="'+dark+'"/>'+circle(0,1,3.1,"#efd48e");
 }else{
  for(let i=0;i<10;i++){const a=i*2.399963,rr=10+random()*19,cx=Math.cos(a)*rr,cy=Math.sin(a)*rr; p+='<path d="M0 12 Q'+num(cx*.45)+' '+num(cy*.4)+' '+num(cx)+' '+num(cy)+'" stroke="#77916b" fill="none" stroke-width=".8"/>';for(let k=0;k<5;k++){const ang=k*Math.PI*2/5;p+=circle(cx+Math.cos(ang)*2.6,cy+Math.sin(ang)*2.6,2.8,k%2?mid:light,.96);}p+=circle(cx,cy,1.5,"#c6ad76");}
 }
 if(bloomCache.size>=64)bloomCache.delete(bloomCache.keys().next().value);bloomCache.set(key,p);return p;
}
function bloom(id,seed,x,y,opening=1,color="default"){
 return '<g transform="translate('+num(x)+' '+num(y)+') scale('+num(opening)+')">'+bloomShape(id,seed,color)+'</g>';
}
function flowerMarkup(p){
 if(!p||!species.includes(p.id))return "";
 const id=p.id,color=validColor(id,p.color),stage=clamp(Number.isFinite(p.stage)?p.stage:0,0,4),random=rng(p.seed),lean=num((random()-.5)*25),heights=[0,32,78,112,120],low=Math.floor(stage),high=Math.min(4,low+1),height=heights[low]+(heights[high]-heights[low])*(stage-low);
 if(stage===0)return '<ellipse cx="0" cy="-3" rx="5" ry="3" fill="#92734f" transform="rotate(-25)"/>';
 const x=lean*height/120,y=-height;
 let s='<path d="M0 0 Q'+num(-x*.4)+' '+num(y*.5)+' '+num(x)+' '+num(y)+'" fill="none" stroke="#5e805d" stroke-width="'+num(1.3+2*Math.min(1,stage))+'" stroke-linecap="round"/>';
 function growingLeaf(lx,ly,side,size,amount){if(amount<=0)return "";return '<g transform="translate('+num(lx)+' '+num(ly)+') scale('+num(amount)+')">'+leaf(0,0,side,size)+'</g>';}
 if(id==="orchid"){
  s+=growingLeaf(0,-height*.07,-1,27,Math.min(1,stage*.58))+growingLeaf(0,-height*.12,1,27,clamp(stage-1,0,1));
 }else if(id==="lavender"||id==="carnation"||id==="lily"){
  for(let i=0;i<4;i++){const a=clamp(stage-i*.55,0,1);if(a>0){const yy=-height*(.15+i*.16),xx=x*(.12+i*.13),side=i%2?1:-1;s+='<g transform="translate('+num(xx)+' '+num(yy)+') scale('+num(a)+')"><path d="M0 0Q'+side*9+' -21 '+side*(id==="lily"?24:13)+' -26Q'+side*12+' -6 0 0Z" fill="#73916f" stroke="#547553" stroke-width=".55"/></g>';}}
 }else{
  s+=growingLeaf(0,-height*.23,-1,21,Math.min(1,stage*.58));
  s+=growingLeaf(x*.25,-height*.48,1,23,clamp(stage-1,0,1))+growingLeaf(x*.6,-height*.74,-1,14,clamp(stage-1.45,0,1));
 }
 const bud=clamp(stage-2,0,1),opening=clamp(stage-3,0,1);
 if(bud>0&&opening<1)s+='<g transform="translate('+num(x)+' '+num(y)+') scale('+num(bud*(1-opening*.6))+')" opacity="'+num(1-opening)+'"><ellipse cx="0" cy="-5" rx="9" ry="14" fill="'+palette(id,color)[0]+'"/><path d="M-9 1Q0 15 9 1L0 7Z" fill="#73916f"/></g>';
 if(opening>0)s+=bloom(id,p.seed,x,y,.28+.72*opening,color);
 return s;
}
function potSvg(p){
 const art=p?flowerMarkup(p):'<ellipse cx="0" cy="0" rx="2" ry="1" fill="#8d7657"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -22 180 227" aria-hidden="true"><ellipse cx="90" cy="190" rx="46" ry="7" fill="#b8a88d" opacity=".23"/><path d="M52 148H128L119 185Q90 194 61 185Z" fill="#b77f64" stroke="#98674f"/><path d="M61 155L68 181" stroke="#e2b49a" stroke-width="5" opacity=".5"/><rect x="47" y="143" width="86" height="11" rx="3" fill="#c79075" stroke="#a36c55"/><ellipse cx="90" cy="143" rx="38" ry="5" fill="#79614a"/><g transform="translate(90 142)">'+art+'</g></svg>';
}
function setWrapped(s,value){if(!s.bouquet.length||typeof value!=="boolean"||s.wrapped===value)return false;s.wrapped=value;return true;}
function validPlacement(p){
 if(!p||!Number.isFinite(p.angle)||!Number.isFinite(p.scale))return null;
 return {angle:num(clamp(p.angle,-40,40)),scale:num(clamp(p.scale,1.10,1.68))};
}
function setPlacement(s,id,p){
 if(!s.bouquet.includes(id))return false;const value=validPlacement(p);if(!value)return false;
 const current=bouquetLayout(s.bouquet,s.placements).find(x=>x.id===id);
 if(current.angle===value.angle&&current.scale===value.scale)return false;
 s.placements[id]=value;s.wrapped=false;return true;
}
function clearPlacement(s,id){if(!own(s.placements,id))return false;delete s.placements[id];s.wrapped=false;return true;}
function autoArrange(s){if(!Object.keys(s.placements).length)return false;s.placements={};s.wrapped=false;return true;}
const bouquetFields=["bouquet","stemColors","wrap","ribbon","greenery","paperStyle","ribbonStyle","wrapped","placements"];
function bouquetSnapshot(s){return JSON.parse(JSON.stringify(Object.fromEntries(bouquetFields.map(k=>[k,s[k]]))));}
function restoreBouquet(s,snapshot){const n=normalize({...s,...snapshot});for(const k of bouquetFields)s[k]=n[k];return s;}
function bouquetLayout(ids,placements={}){
 const n=ids.length;
 // Asymmetrical, tiered fan: preserve sequence from left to right, vary height.
 return ids.map((id,i)=>{const u=n===1?0:2*i/(n-1)-1;return {id,x:num(200+u*13),y:332,angle:num(u*34),scale:num(clamp(1.43+(1-Math.abs(u))*.20+(i%2)*.09,1.10,1.68)),...validPlacement(placements[id])};});
}
// The same transform is used in preview, pointer editing and standalone export.
function placementTransform(item){return "translate("+item.x+" "+item.y+") rotate("+item.angle+") scale("+item.scale+")";}
function flowerHead(plant,item){
 const lean=num((rng(plant.seed)()-.5)*25),a=item.angle*Math.PI/180;
 return {x:item.x+item.scale*(lean*Math.cos(a)+120*Math.sin(a)),y:item.y+item.scale*(lean*Math.sin(a)-120*Math.cos(a))};
}
function placementFromHead(plant,item,x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 const lean=num((rng(plant.seed)()-.5)*25),dx=x-item.x,dy=Math.min(-1,y-item.y);
 return validPlacement({angle:(Math.atan2(dx,-dy)-Math.atan2(lean,120))*180/Math.PI,scale:Math.hypot(dx,dy)/Math.hypot(lean,120)});
}
function bouquetSvg(s,title,{workbench=false,previewWrap=false}={}){
 const n=s.bouquet.length,wrapped=n>0&&(s.wrapped||(workbench&&previewWrap));let plants="",extra="";
 const paper=wraps[s.wrap]||wraps.ivory,ribbon=ribbons[s.ribbon]||ribbons.rose;
 const pattern=s.paperStyle==="botanical"?'<pattern id="paperPattern" width="23" height="28" patternUnits="userSpaceOnUse"><path d="M5 26Q14 15 17 2M10 19Q2 17 3 10Q11 10 10 19M14 11Q21 11 21 5Q14 4 14 11" fill="none" stroke="#756a55" stroke-width=".9" opacity=".27"/></pattern>':s.paperStyle==="stripe"?'<pattern id="paperPattern" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(23)"><path d="M0 0V13" stroke="#fffaf1" stroke-width="3" opacity=".5"/></pattern>':"";
 const defs='<defs><linearGradient id="paperShade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf0" stop-opacity=".55"/><stop offset=".48" stop-color="#fffaf0" stop-opacity=".06"/><stop offset="1" stop-color="#6e5c44" stop-opacity=".22"/></linearGradient><linearGradient id="ribbonShine" x2="0" y2="1"><stop stop-color="#fff8e8" stop-opacity=".45"/><stop offset="1" stop-color="#493c37" stop-opacity=".18"/></linearGradient>'+pattern+'</defs>';
 const backD="M94 246L55 180Q109 192 158 216L200 184L242 216Q291 192 345 180L306 246L220 387H180Z";
 const leftD="M74 210Q133 229 202 299L183 388L151 355Z",rightD="M326 210Q267 229 198 299L217 388L249 355Z";
 const paperShape=(d,fill)=>'<path d="'+d+'" fill="'+fill+'" stroke="#ad9579" stroke-width="1.1" stroke-linejoin="round"/><path d="'+d+'" fill="url(#paperShade)"/>'+ (pattern?'<path d="'+d+'" fill="url(#paperPattern)"/>':"");
 if(s.greenery&&n){for(const a of [-49,-37,33,47])extra+='<g transform="translate(200 338) rotate('+a+') scale(1.37)"><path d="M0 0Q-3 -56 0 -115" fill="none" stroke="#6f8967" stroke-width="2"/>'+leaf(0,-40,-1,18)+leaf(0,-65,1,21)+leaf(0,-85,-1,15)+'</g>';}
 for(const item of bouquetLayout(s.bouquet,s.placements)){plants+='<g data-flower="'+item.id+'" transform="'+placementTransform(item)+'">'+flowerMarkup(stemPlant(s,item.id))+'</g>';}
 const back=wrapped?'<g class="wrap-back">'+paperShape(backD,paper)+'</g>':"";
 let front="";
 if(wrapped){
 const loops=s.ribbonStyle==="knot"?'M200 340Q177 325 174 337Q176 350 200 340Q223 325 226 337Q224 349 200 340':"M200 340Q146 303 145 331Q148 356 200 340Q254 303 255 331Q252 356 200 340";
 const tails=s.ribbonStyle==="long"?'M198 342Q182 369 153 401L177 393L183 404Q201 377 204 344Q219 380 242 400L239 384L250 382Q221 356 205 342Z':'M198 342L177 371L191 364L202 345L216 373L222 362L205 342Z';
 front='<g class="wrap-left">'+paperShape(leftD,paper)+'</g><g class="wrap-right">'+paperShape(rightD,paper)+'</g><g class="wrap-tie"><path d="M169 331Q200 342 231 331L227 345Q200 355 173 345Z" fill="'+ribbon+'"/><path d="'+tails+'" fill="'+ribbon+'" stroke="#79565a" stroke-width=".7"/><path d="'+loops+'" fill="'+ribbon+'" stroke="#79565a" stroke-width="1"/><path d="'+loops+'" fill="url(#ribbonShine)"/><ellipse cx="201" cy="341" rx="8" ry="6" fill="'+ribbon+'" stroke="#79565a" stroke-width=".7"/></g>';
 }else if(n){front='<path d="M185 330Q200 336 215 330M185 334Q200 340 215 334" stroke="#af946b" stroke-width="2.8" fill="none"/>';}
 else front='<path d="M133 237Q200 260 267 237L219 376Q200 385 181 376Z" fill="#ede0cb" stroke="#c3b199" stroke-dasharray="5 4"/><path d="M177 338Q200 345 223 338" stroke="#bfa184" stroke-width="5" fill="none"/>';
 if(workbench)return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="400" height="440" role="img" aria-label="'+escape(title)+'">'+defs+(n?back+extra+plants+front:"")+'</svg>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="400" height="440" role="img" aria-label="'+escape(title)+'">'+defs+'<rect width="400" height="440" rx="12" fill="#fffaf0"/><path d="M24 406V137a176 112 0 0 1 352 0v269Z" fill="none" stroke="#c5a371" stroke-width="1.2"/><path d="M32 398V137a168 104 0 0 1 336 0v261Z" fill="none" stroke="#e2d3b6" stroke-width=".75"/>'+back+extra+plants+front+'<text x="200" y="420" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#54705a">'+escape(title)+'</text></svg>';
}
root.GardenModel={species,originalSpecies,extendedSpecies,colorOptions,palette,setPlantColor,setStemColor,MAX_STEMS,stemSpecies,stemPlant,stemCount,nextStem,wraps,ribbons,fresh,normalize,plant,water,add,remove,move,seedFor,flowerMarkup,potSvg,bouquetSvg,paperStyles,ribbonStyles,setWrapped,bouquetLayout,setPlacement,clearPlacement,autoArrange,bouquetSnapshot,restoreBouquet,placementTransform,flowerHead,placementFromHead};
})(typeof window!=="undefined"?window:globalThis);
