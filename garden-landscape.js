/* Original SVG scene composition.
 Grass, fern and bush geometry adapted from Garten src/plants/renderers.ts
 at 1bc6720bf249c94957c3c3afd1f787b163dd601d, MIT, copyright (c) 2024.
 Organic Flow SVG filter adaptation is in index.html, MIT, copyright (c) 2026 pxnz3r.
 Retained notices: vendor/Garten/LICENSE and vendor/OrganicFlow/LICENSE. */
(function(root){
"use strict";
const round=v=>Math.round(v*10)/10;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const greens=["#557652","#7b9870","#a0b487","#45664e","#93a77e"];
function rand(seed){let x=(seed>>>0)||1;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;}
function path(d,color,w=1,opacity=1){return '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+round(w)+'" opacity="'+opacity+'" stroke-linecap="round" stroke-linejoin="round"/>';}
function leaf(x,y,angle,length,color,opacity=.85){return '<g transform="translate('+round(x)+' '+round(y)+') rotate('+round(angle)+')"><path d="M0 0 Q'+round(-length*.42)+' '+round(-length*.45)+' 0 '+round(-length)+' Q'+round(length*.45)+' '+round(-length*.46)+' 0 0Z" fill="'+color+'" opacity="'+opacity+'"/>'+path('M0 -1L0 '+round(-length*.83),'#d9e3bf',.42,.45)+'</g>';}
function grass(x,y,height,seed,growth=1){
 const h=height*clamp(growth,0,1),blades=3+Math.floor(rand(seed)*3);if(!h)return "";let out="";
 for(let i=0;i<blades;i++){const r=rand(seed+i*10),lean=(r-.5)*.4,bladeH=h*(.6+r*.4),bx=x+(i-blades/2)*3;
 out+=path("M"+round(bx)+" "+round(y)+"Q"+round(bx+lean*bladeH)+" "+round(y-bladeH*.6)+" "+round(bx+lean*bladeH*1.5)+" "+round(y-bladeH),greens[i%greens.length],.8+height*.025,.84);}
 return out;
}
function fern(x,y,height,seed,growth=1){
 const h=height*clamp(growth,0,1),lean=(rand(seed)-.5)*.3;if(!h)return "";let out=path("M"+x+" "+y+"Q"+round(x+lean*h*.5)+" "+round(y-h*.5)+" "+round(x+lean*h)+" "+round(y-h),"#537651",1.4);
 const count=8;for(let i=0;i<count;i++){const t=(i+1)/(count+1),fx=x+lean*h*t,fy=y-h*t,len=h*.28*(1-t*.5);
 for(const side of [-1,1]){const ex=fx+side*len,ey=fy-len*.2;out+=path("M"+round(fx)+" "+round(fy)+"Q"+round(fx+side*len*.7)+" "+round(fy-len*.5)+" "+round(ex)+" "+round(ey),"#63855c",.8);out+=leaf(fx,fy,side*68,len,greens[(i+1)%greens.length]);}}
 return out;
}
function bush(x,y,size,seed,growth=1){
 const s=size*clamp(growth,0,1);if(!s)return "";let out='<ellipse cx="'+x+'" cy="'+round(y-s*.24)+'" rx="'+round(s*.65)+'" ry="'+round(s*.38)+'" fill="#829b75" opacity=".52"/>';
 for(let i=0;i<12;i++){const r=rand(seed+i*7),a=i/12*Math.PI*2+r*.5,d=s*(.3+r*.4),lx=x+Math.cos(a)*d,ly=y-s*.3+Math.sin(a)*d*.5;out+=leaf(lx,ly,a*180/Math.PI+90,s*.4,greens[i%greens.length],.82);}
 if(growth>.7){const g=(growth-.7)/.3;for(let i=0;i<3;i++){const r=rand(seed+i*13),fx=x+(r-.5)*s*.6,fy=y-s*.3-r*s*.3;out+='<circle cx="'+round(fx)+'" cy="'+round(fy)+'" r="'+round(s*.075*g)+'" fill="'+["#e4b5ba","#f2d8bf","#d29aa6"][i]+'" opacity=".87"/>';}}
 return out;
}
function vine(x,y,w,height,side=1,seed=27){
 let out=path("M"+x+" "+y+"Q"+round(x+side*w*.5)+" "+round(y-height*.55)+" "+round(x+side*w)+" "+round(y-height),"#537651",1.8);
 for(let i=0;i<11;i++){const t=i/10,xx=x+side*w*t,yy=y-height*t,offset=Math.sin(t*9)*5;out+=leaf(xx+offset,yy,(i%2===0?1:-1)*52,12+rand(seed+i)*7,greens[i%greens.length]);if(i%3===1){out+='<g transform="translate('+round(xx+offset)+' '+round(yy-5)+')">';for(let k=0;k<5;k++){let a=k*2*Math.PI/5;out+='<circle cx="'+round(Math.cos(a)*3)+'" cy="'+round(Math.sin(a)*3)+'" r="3.4" fill="'+(k%2?"#e6b4be":"#f0c9cd")+'"/>';}out+='<circle r="1.6" fill="#c6a56b"/></g>';}}
 return out;
}
function bed(side,width,y,seed,growth,scale=1){
 let out="";for(let i=0;i<7;i++){const x=side===0?12+i*width/7:600-12-i*width/7,yy=y-(i%3)*9;out+=bush(round(x),yy,(19+(i%3)*8)*scale,seed+i*47,growth);}
 for(let i=0;i<9;i++){const x=side===0?12+i*width/9:600-12-i*width/9,yy=y+6-(i%3)*5;out+=i%3===0?fern(round(x),yy,(28+i%4*7)*scale,seed+i*73,growth):grass(round(x),yy,(17+i%4*5)*scale,seed+i*31,growth);}
 return out;
}
function wash(id,seed){
 let out='<g filter="url(#'+id+')" opacity=".17">';for(let i=0;i<16;i++){const x=rand(seed+i*83)*600,y=178+rand(seed+i*157)*142,rx=13+rand(seed+i*223)*31;if(x>225&&x<420)continue;out+='<ellipse cx="'+round(x)+'" cy="'+round(y)+'" rx="'+round(rx)+'" ry="'+round(rx*.35)+'" fill="'+greens[i%greens.length]+'"/>';}return out+'</g>';
}
function treeCanopy(grown){
 let out="";const clusters=[[93,87,24],[121,65,28],[153,65,35],[189,55,27],[220,68,31],[251,91,28],[144,99,37],[183,95,38],[215,113,32],[105,122,24],[269,125,23],[161,131,29]];
 clusters.forEach(([x,y,r],i)=>{const pink=i<grown*2;for(let k=0;k<5;k++){const a=k*2.4,dist=r*(.15+rand(211+i*31+k*17)*.55);out+='<ellipse cx="'+round(x+Math.cos(a)*dist)+'" cy="'+round(y+Math.sin(a)*dist*.7)+'" rx="'+round(r*(.46+rand(72+i*19+k)*.25))+'" ry="'+round(r*.52)+'" fill="'+(pink?["#dca9b1","#e8bfc2","#efc9c4","#d79ba9","#f1d3ce"]:greens)[k]+'" opacity=".88"/>';}if(pink){for(let k=0;k<5;k++){const a=k*2.4,rr=r*.65;out+='<circle cx="'+round(x+Math.cos(a)*rr)+'" cy="'+round(y+Math.sin(a)*rr*.6)+'" r="2.4" fill="#fff0d9"/>';}}});
 return out;
}
root.GardenLandscape={grass,fern,bush,vine,bed,wash,treeCanopy};
})(typeof window!=="undefined"?window:globalThis);
