/* Original, dependency-free prototype model and botanical SVG renderer. */
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
function bloom(id,seed,x,y){
 const random=rng(seed),[mid,dark,light]=colors[id];let p="";
 const ellipse=(cx,cy,rx,ry,fill,rot=0,opacity=1)=>'<ellipse cx="'+num(cx)+'" cy="'+num(cy)+'" rx="'+num(rx)+'" ry="'+num(ry)+'" fill="'+fill+'" opacity="'+opacity+'" transform="rotate('+num(rot)+' '+num(cx)+' '+num(cy)+')"/>';
 const circle=(cx,cy,r,fill)=>'<circle cx="'+num(cx)+'" cy="'+num(cy)+'" r="'+num(r)+'" fill="'+fill+'"/>';
 function ring(n,r,rx,ry,fill,offset=0){let a="";for(let i=0;i<n;i++){let t=i*360/n+offset+(random()-.5)*8;const rad=t*Math.PI/180;let cx=Math.sin(rad)*r,cy=-Math.cos(rad)*r;a+=ellipse(cx,cy,rx*(.9+random()*.2),ry*(.88+random()*.24),fill,t,.93);}return a;}
 if(id==="rose"){p=ring(9,15,10,15,dark)+ring(8,12,9,13,mid,18)+ring(6,7,7,9,light,42)+ring(5,3,4,6,dark,21)+circle(0,0,3,mid);}
 else if(id==="peony"){p=ring(12,17,9,15,dark)+ring(11,14,9,15,mid,15)+ring(9,9,7,11,light,30)+ring(7,5,5,8,mid,42)+circle(0,0,5,"#d7ad70");}
 else if(id==="tulip"){p='<path d="M-23 -25 Q-14 -38 0 -20 Q14 -38 23 -25 Q26 8 0 13 Q-26 8 -23 -25Z" fill="'+dark+'"/><path d="M-23 -25 Q-6 -28 3 11 Q-24 12 -23 -25Z" fill="'+mid+'"/><path d="M23 -25 Q7 -30 -3 11 Q24 12 23 -25Z" fill="'+light+'"/><path d="M0 -32 Q-14 -13 0 12 Q14 -13 0 -32Z" fill="'+mid+'"/>';}
 else if(id==="daisy"||id==="sunflower"){const sunflower=id==="sunflower";p=ring(sunflower?18:13,18,sunflower?6:5,15,dark)+ring(sunflower?18:13,15,sunflower?5:4.8,14,mid,11)+circle(0,0,sunflower?13:8,sunflower?"#775536":"#d7b35c");for(let i=0;i<(sunflower?25:9);i++){const a=random()*Math.PI*2,r=Math.sqrt(random())*(sunflower?11:6);p+=circle(Math.cos(a)*r,Math.sin(a)*r,.85,sunflower?"#b2884b":"#9b763a");}}
 else {for(let i=0;i<9;i++){const a=i*2.4,rr=8+random()*21,cx=Math.cos(a)*rr,cy=Math.sin(a)*rr;p+='<path d="M0 9 Q'+num(cx*.5)+' '+num(cy*.5)+' '+num(cx)+' '+num(cy)+'" stroke="#77916b" fill="none" stroke-width="1"/>';for(let j=0;j<5;j++){let ang=j*Math.PI*2/5;p+=circle(cx+Math.cos(ang)*3,cy+Math.sin(ang)*3,3.7,mid);}p+=circle(cx,cy,2,"#c6ad76");}}
 return '<g transform="translate('+num(x)+' '+num(y)+')">'+p+'</g>';
}
function flowerMarkup(p){
 if(!p||!species.includes(p.id))return "";const id=p.id,stage=clamp(p.stage,0,4),random=rng(p.seed),lean=num((random()-.5)*25),height=[0,32,78,112,120][stage];
 if(stage===0)return '<ellipse cx="0" cy="-3" rx="5" ry="3" fill="#92734f" transform="rotate(-25)"/>';
 const x=lean*height/120,y=-height;let s='<path d="M0 0 Q'+num(-x*.4)+' '+num(y*.5)+' '+num(x)+' '+y+'" fill="none" stroke="#5e805d" stroke-width="3.3" stroke-linecap="round"/>';
 s+=leaf(0,num(-height*.23),-1,stage===1?12:21);
 if(stage>=2)s+=leaf(num(x*.25),num(-height*.48),1,23)+leaf(num(x*.6),num(-height*.74),-1,14);
 if(stage===3)s+='<g transform="translate('+num(x)+' '+y+')"><ellipse cx="0" cy="-5" rx="9" ry="14" fill="'+colors[id][0]+'"/><path d="M-9 1Q0 15 9 1L0 7Z" fill="#73916f"/></g>';
 if(stage===4)s+=bloom(id,p.seed,x,y);
 return s;
}
function potSvg(p){
 const art=p?flowerMarkup(p):'<ellipse cx="0" cy="0" rx="2" ry="1" fill="#8d7657"/>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 205" aria-hidden="true"><ellipse cx="90" cy="190" rx="46" ry="7" fill="#b8a88d" opacity=".23"/><path d="M52 148H128L119 185Q90 194 61 185Z" fill="#b77f64" stroke="#98674f"/><path d="M61 155L68 181" stroke="#e2b49a" stroke-width="5" opacity=".5"/><rect x="47" y="143" width="86" height="11" rx="3" fill="#c79075" stroke="#a36c55"/><ellipse cx="90" cy="143" rx="38" ry="5" fill="#79614a"/><g transform="translate(90 142)">'+art+'</g></svg>';
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
