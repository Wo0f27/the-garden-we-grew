/* Dependency-free garden model; botanical outlines adapted from BLOOM° (MIT). */
(function(root){
"use strict";
const species=["rose","peony","tulip","daisy","sunflower","gypsophila"];
const colors={rose:["#d998a5","#b7657b","#f0bdc4"],peony:["#e4aeb9","#c48198","#f7d0d7"],tulip:["#d88c9c","#a95876","#f3b5bc"],daisy:["#fffdf1","#d8d6bc","#fffef7"],sunflower:["#e5bd50","#c98e32","#f6d780"],gypsophila:["#fff9e9","#ddcfbc","#ffffff"]};
const wraps={ivory:"#e9d8bc",blush:"#e3b6bd",sage:"#aebda4"},ribbons={rose:"#b16c83",gold:"#c2a168",forest:"#55775c"};
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const num=n=>Number(n.toFixed(3));
function seedFor(id){let x=2166136261;for(const c of id){x=Math.imul(x^c.charCodeAt(0),16777619);}return x>>>0;}
function rng(seed){let t=seed>>>0;return ()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^(t>>>15),t|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;};}
function fresh(){return {version:1,plants:{},bouquet:[],wrap:"ivory",ribbon:"rose",greenery:true};}
function normalize(input){
 const s=fresh();if(!input||typeof input!=="object"||input.version!==1)return s;
 for(const id of species){const p=input.plants&&input.plants[id];if(p&&Number.isInteger(p.stage)&&p.stage>=0&&p.stage<=4)s.plants[id]={id,stage:p.stage,seed:seedFor(id)};}
 if(Array.isArray(input.bouquet))s.bouquet=[...new Set(input.bouquet.filter(id=>species.includes(id)&&s.plants[id]?.stage===4))];
 if(own(wraps,input.wrap))s.wrap=input.wrap;if(own(ribbons,input.ribbon))s.ribbon=input.ribbon;s.greenery=input.greenery!==false;return s;
}
function plant(s,id){if(!species.includes(id)||s.plants[id])return false;s.plants[id]={id,stage:0,seed:seedFor(id)};return true;}
function water(s,id){const p=s.plants[id];if(!p||p.stage>=4)return false;p.stage++;return true;}
function add(s,id){if(s.plants[id]?.stage!==4||s.bouquet.includes(id))return false;s.bouquet.push(id);return true;}
function remove(s,id){const i=s.bouquet.indexOf(id);if(i<0)return false;s.bouquet.splice(i,1);return true;}
function move(s,id,delta){if(delta!==1&&delta!==-1)return false;const i=s.bouquet.indexOf(id),j=i+delta;if(i<0||j<0||j>=s.bouquet.length)return false;[s.bouquet[i],s.bouquet[j]]=[s.bouquet[j],s.bouquet[i]];return true;}
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
function bloomShape(id,seed){
 const key=id+":"+seed;if(bloomCache.has(key))return bloomCache.get(key);
 const random=rng(seed),[mid,dark,light]=colors[id];
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
 }else{
  for(let i=0;i<10;i++){const a=i*2.399963,rr=10+random()*19,cx=Math.cos(a)*rr,cy=Math.sin(a)*rr; p+='<path d="M0 12 Q'+num(cx*.45)+' '+num(cy*.4)+' '+num(cx)+' '+num(cy)+'" stroke="#77916b" fill="none" stroke-width=".8"/>';for(let k=0;k<5;k++){const ang=k*Math.PI*2/5;p+=circle(cx+Math.cos(ang)*2.6,cy+Math.sin(ang)*2.6,2.8,k%2?mid:light,.96);}p+=circle(cx,cy,1.5,"#c6ad76");}
 }
 if(bloomCache.size>40)bloomCache.clear();bloomCache.set(key,p);return p;
}
function bloom(id,seed,x,y,opening=1){
 return '<g transform="translate('+num(x)+' '+num(y)+') scale('+num(opening)+')">'+bloomShape(id,seed)+'</g>';
}
function flowerMarkup(p){
 if(!p||!species.includes(p.id))return "";
 const id=p.id,stage=clamp(Number.isFinite(p.stage)?p.stage:0,0,4),random=rng(p.seed),lean=num((random()-.5)*25),heights=[0,32,78,112,120],low=Math.floor(stage),high=Math.min(4,low+1),height=heights[low]+(heights[high]-heights[low])*(stage-low);
 if(stage===0)return '<ellipse cx="0" cy="-3" rx="5" ry="3" fill="#92734f" transform="rotate(-25)"/>';
 const x=lean*height/120,y=-height;
 let s='<path d="M0 0 Q'+num(-x*.4)+' '+num(y*.5)+' '+num(x)+' '+num(y)+'" fill="none" stroke="#5e805d" stroke-width="'+num(1.3+2*Math.min(1,stage))+'" stroke-linecap="round"/>';
 function growingLeaf(lx,ly,side,size,amount){if(amount<=0)return "";return '<g transform="translate('+num(lx)+' '+num(ly)+') scale('+num(amount)+')">'+leaf(0,0,side,size)+'</g>';}
 s+=growingLeaf(0,-height*.23,-1,21,Math.min(1,stage*.58));
 s+=growingLeaf(x*.25,-height*.48,1,23,clamp(stage-1,0,1))+growingLeaf(x*.6,-height*.74,-1,14,clamp(stage-1.45,0,1));
 const bud=clamp(stage-2,0,1),opening=clamp(stage-3,0,1);
 if(bud>0&&opening<1)s+='<g transform="translate('+num(x)+' '+num(y)+') scale('+num(bud*(1-opening*.6))+')" opacity="'+num(1-opening)+'"><ellipse cx="0" cy="-5" rx="9" ry="14" fill="'+colors[id][0]+'"/><path d="M-9 1Q0 15 9 1L0 7Z" fill="#73916f"/></g>';
 if(opening>0)s+=bloom(id,p.seed,x,y,.28+.72*opening);
 return s;
}
function potSvg(p){
 const art=p?flowerMarkup(p):'<ellipse cx="0" cy="0" rx="2" ry="1" fill="#8d7657"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -22 180 227" aria-hidden="true"><ellipse cx="90" cy="190" rx="46" ry="7" fill="#b8a88d" opacity=".23"/><path d="M52 148H128L119 185Q90 194 61 185Z" fill="#b77f64" stroke="#98674f"/><path d="M61 155L68 181" stroke="#e2b49a" stroke-width="5" opacity=".5"/><rect x="47" y="143" width="86" height="11" rx="3" fill="#c79075" stroke="#a36c55"/><ellipse cx="90" cy="143" rx="38" ry="5" fill="#79614a"/><g transform="translate(90 142)">'+art+'</g></svg>';
}
function bouquetSvg(s,title){
 const n=s.bouquet.length;let plants="",extra="";
 if(s.greenery&&n){for(const a of [-48,-34,32,47])extra+='<g transform="translate(200 340) rotate('+a+') scale(1.35)"><path d="M0 0Q-3 -56 0 -115" fill="none" stroke="#6f8967" stroke-width="2"/>'+leaf(0,-40,-1,18)+leaf(0,-65,1,21)+leaf(0,-85,-1,15)+'</g>';}
 s.bouquet.forEach((id,i)=>{const a=n===1?0:(i/(n-1)-.5)*74;const scale=1.53+(i%2)*.12;plants+='<g transform="translate(200 335) rotate('+num(a)+') scale('+num(scale)+')">'+flowerMarkup(s.plants[id])+'</g>';});
 const paper=wraps[s.wrap],ribbon=ribbons[s.ribbon];
 const wrap=n?'<path d="M101 236L199 292L299 236L223 380Q200 393 177 380Z" fill="'+paper+'" stroke="#aa9279" stroke-width="1.1"/><path d="M101 236L199 292L177 380Z" fill="#fffaf0" opacity=".32"/><path d="M299 236L199 292L223 380Z" fill="#695a45" opacity=".09"/><path d="M170 332Q200 343 230 332L226 345Q200 354 174 345Z" fill="'+ribbon+'"/><path d="M199 340Q147 307 153 333Q157 353 199 340Q248 308 247 332Q243 355 199 340" fill="'+ribbon+'" stroke="#79565a" stroke-width="1"/><path d="M198 341L181 368L193 362L202 344L216 368L220 357L205 341Z" fill="'+ribbon+'"/><ellipse cx="201" cy="341" rx="7" ry="6" fill="'+ribbon+'"/>':'<path d="M133 237Q200 260 267 237L219 376Q200 385 181 376Z" fill="#ede0cb" stroke="#c3b199" stroke-dasharray="5 4"/><path d="M177 338Q200 345 223 338" stroke="#bfa184" stroke-width="5" fill="none"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 440" width="400" height="440" role="img" aria-label="'+escape(title)+'"><rect width="400" height="440" rx="12" fill="#fffaf0"/><path d="M24 406V137a176 112 0 0 1 352 0v269Z" fill="none" stroke="#c5a371" stroke-width="1.2"/><path d="M32 398V137a168 104 0 0 1 336 0v261Z" fill="none" stroke="#e2d3b6" stroke-width=".75"/>'+extra+plants+wrap+'<text x="200" y="420" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="#54705a">'+escape(title)+'</text></svg>';
}
root.GardenModel={species,wraps,ribbons,fresh,normalize,plant,water,add,remove,move,seedFor,flowerMarkup,potSvg,bouquetSvg};
})(typeof window!=="undefined"?window:globalThis);
