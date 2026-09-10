import{r as e}from"./rolldown-runtime-S-ySWqyJ.js";import{i as t,r as n}from"./framework-CXnKph_e.js";var r=e(t(),1),i=`#version 300 es
in vec2 position;
void main(){ gl_Position=vec4(position,0.0,1.0); }`,a=`#version 300 es
precision highp float;
uniform vec2 resolution;
uniform float clock;
uniform float home_view;
uniform sampler2D nebula_noise;
out vec4 outputColour;
const int BAYER[16]=int[](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);
// Base midnight/slate palette with ordered dither and pixel geometry.
const vec3 PALETTE[9]=vec3[](
 vec3(.024,.035,.051),vec3(.036,.057,.082),vec3(.055,.084,.116),
 vec3(.082,.122,.161),vec3(.122,.176,.216),vec3(.184,.251,.290),
 vec3(.267,.337,.365),vec3(.376,.439,.459),vec3(.537,.584,.592)
);
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 palette_colour(float value,vec2 pixel){
 ivec2 cell=ivec2(mod(pixel,4.0));
 float threshold=(float(BAYER[cell.x+cell.y*4])+0.5)/16.0;
 float level=clamp(value,0.0,1.0)*8.0;
 int index=int(floor(level));
 if(fract(level)>threshold){index=min(index+1,8);}
 return PALETTE[index];
}
vec3 stars(vec2 pixel,float cell_size,float salt,float t,float speed){
 vec2 point=pixel+floor(vec2(t*speed,-t*speed*.35));
 vec2 cell=floor(point/cell_size);
 vec2 local=mod(point,cell_size);
 float seed=hash(cell+salt);
 vec2 position=floor(vec2(hash(cell+salt+31.0),hash(cell+salt+77.0))*(cell_size-6.0))+3.0;
 vec2 distance_to_star=abs(local-position);
 float centre=float(max(distance_to_star.x,distance_to_star.y)<.5);
 float cross_shape=float(min(distance_to_star.x,distance_to_star.y)<.5&&max(distance_to_star.x,distance_to_star.y)<1.5);
 float shape=mix(centre,max(centre,cross_shape*.5),step(.965,seed));
 float twinkle=.76+.24*sin(t*(.30+seed*.35)+seed*45.0);
 vec3 colour=mix(vec3(.40,.53,.65),vec3(.85,.87,.81),seed);
 return colour*shape*twinkle*step(.30,seed);
}
// One brief meteor every fourteen seconds, away from the central wordmark.
vec3 shooting_star(vec2 pixel,vec2 grid,float t){
 float cycle=floor(t/14.0);
 float phase=mod(t,14.0)-6.0;
 if(phase<0.0||phase>1.15){return vec3(0.0);}
 vec2 start=grid*vec2(.62+hash(vec2(cycle,13.0))*.25,.07+hash(vec2(cycle,29.0))*.12);
 vec2 direction=normalize(vec2(-1.0,.42));
 vec2 head=floor(start+direction*phase*grid.x*.25);
 vec2 delta=pixel-head;
 float behind=-dot(delta,direction);
 float across=abs(dot(delta,vec2(-direction.y,direction.x)));
 float tail_length=clamp(grid.x*.10,12.0,30.0);
 float trail=step(0.0,behind)*step(behind,tail_length)*(1.0-smoothstep(.3,1.1,across))*pow(max(0.0,1.0-behind/tail_length),1.6);
 float point=1.0-smoothstep(.3,1.4,length(delta));
 float fade=smoothstep(0.0,.16,phase)*(1.0-smoothstep(.72,1.15,phase));
 return vec3(.62,.78,.86)*max(trail*.58,point*.78)*fade;
}
void main(){
 float t=clock;
 vec2 grid=resolution;
 vec2 pixel=vec2(floor(gl_FragCoord.x),floor(resolution.y-gl_FragCoord.y));
 vec2 uv=(pixel+.5)/grid;
 vec2 noise_uv=uv*vec2(grid.x/grid.y,1.0);
 vec2 drift=vec2(t*.0007,-t*.00028);
 float broad=texture(nebula_noise,noise_uv*.61+drift).r;
 float detail=texture(nebula_noise,noise_uv*1.55-drift*.6+vec2(.34,.67)).r;
 float dust=texture(nebula_noise,noise_uv*3.2+drift*.4+vec2(.71,.13)).r;
 float band_axis=uv.y+uv.x*.70-.91;
 float band=exp(-pow(band_axis*3.6,2.0));
 float density=max(0.0,broad*1.05+detail*.43-.47);
 density*=.35+band*1.25;
 density-=smoothstep(.52,.77,dust)*band*.20;
 density+=sin(t*.065)*band*.012;
 vec3 colour=palette_colour(density,pixel);
 colour+=stars(pixel,21.0,4.0,t,.12)*.45;
 colour+=stars(pixel,37.0,91.0,t,.27)*.70;
 float navigation=(1.0-smoothstep(.24,.42,uv.x))*(1.0-smoothstep(.46,.63,uv.y));
 colour*=1.0-navigation*.40;
 if(home_view>.5){
   float shadow=1.0-smoothstep(.09,.24,max(colour.r,max(colour.g,colour.b)));
   float blue=exp(-dot((uv-vec2(.25,.28))*2.0,(uv-vec2(.25,.28))*2.0));
   float teal=exp(-dot((uv-vec2(.8,.72))*2.2,(uv-vec2(.8,.72))*2.2));
   float breathe=.82+.18*sin(t*.045);
   colour+=shadow*breathe*(vec3(.012,.020,.043)*blue+vec3(.004,.027,.023)*teal);
   colour+=shooting_star(pixel,grid,t);
 }
 outputColour=vec4(colour,1.0);
}`,o=.32,s=.08;function c(e,t){return Math.hypot(Math.max(e.x,1-e.x)*t,Math.max(e.y,1-e.y))}function l(e,t,n){let r=(t-e.born)*o,i=Math.max(0,Math.min(1,(r-c(e,n))/s));return 1-i*i*(3-2*i)}var u=class{constructor(e=1){this.active=[],this.aspect=e}expire(e){this.active=this.active.filter(t=>(e-t.born)*o<c(t,this.aspect)+s)}add(e,t,n){this.expire(n),this.active.length<64&&this.active.push({x:e,y:t,born:n})}clear(){this.active=[]}},d=n(),f=a.replace(/const vec3 PALETTE\[9\]=vec3\[\]\([\s\S]*?\);/,`const vec3 PALETTE[9]=vec3[](
 vec3(.025,.18,.25),vec3(.04,.27,.38),vec3(.065,.40,.49),
 vec3(.105,.53,.56),vec3(.28,.61,.52),vec3(.49,.69,.51),
 vec3(.69,.77,.55),vec3(.87,.84,.64),vec3(.99,.94,.79)
);`).replace(`vec3 colour=palette_colour(density,pixel);`,`density=clamp(density*.90+.12,0.0,1.0);
 vec3 colour=palette_colour(density,pixel);`).replace(`colour*=1.0-navigation*.40;`,`colour*=1.0-navigation*.18;`).replace(`uniform float home_view;`,`uniform float home_view;
uniform vec4 brush[12];
uniform vec2 swash[12];
uniform vec3 ink;
uniform vec3 ripples[64];
uniform int rippleCount;`).replace(`vec2 drift=vec2(t*.0007,-t*.00028);`,`
 float brushLight=0.0;
 vec2 warp=vec2(0.0);
 for(int i=0;i<12;i++){
  vec2 delta=(uv-brush[i].xy)*vec2(grid.x/grid.y,1.0);
  float age=brush[i].z;
  float life=max(0.0,1.0-age/1.5)*brush[i].w;
  vec2 direction=normalize(swash[i]+vec2(.0001,0.0));
  float along=dot(delta,direction);
  float across=dot(delta,vec2(-direction.y,direction.x));
  float halo=exp(-(along*along*55.0+across*across*340.0))*life;
  brushLight+=halo*.22;
  warp-=direction*halo*min(length(swash[i])*2.5,.09);
 }
 float ring=0.0;
 vec2 rippleWarp=vec2(0.0);
 for(int i=0;i<64;i++){
  if(i>=rippleCount){break;}
  vec2 delta=(uv-ripples[i].xy)*vec2(grid.x/grid.y,1.0);
  float age=ripples[i].z;
  vec2 farEdge=max(ripples[i].xy,vec2(1.0)-ripples[i].xy)*vec2(grid.x/grid.y,1.0);
  float reach=length(farEdge);
  float radius=age*${o};
  float fade=1.0-smoothstep(reach,reach+${s},radius);
  float wave=exp(-pow((length(delta)-radius)*60.0,2.0))*fade;
  ring+=wave;
  rippleWarp+=normalize(delta+vec2(.0001))*wave*.025;
 }
 noise_uv+=clamp(warp,vec2(-.10),vec2(.10))+clamp(rippleWarp,vec2(-.06),vec2(.06));
 vec2 drift=vec2(t*.0007,-t*.00028);`).replace(`outputColour=vec4(colour,1.0);`,`
 float glow=clamp(brushLight+ring*.38,0.0,.8);
 vec3 painted=floor((ink*(.15+density*.85)+colour*.55)*32.0+.5)/32.0;
 colour=mix(colour,painted,glow);
 outputColour=vec4(colour,1.0);`),p=[[.23,1,.78],[.73,.46,1],[1,.66,.28]];function m({calm:e,colour:t,burst:n,preset:a,assetPrefix:s=``}){let c=(0,r.useRef)(null),m=(0,r.useRef)(null),h=(0,r.useRef)({calm:e,colour:t,burst:n,preset:a});h.current={calm:e,colour:t,burst:n,preset:a};let g=(0,r.useRef)(null),[_,v]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{g.current?.()},[e,t,n,a]),(0,r.useEffect)(()=>{let e=c.current,t=m.current,n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,powerPreference:`low-power`}),r=null,a=null,d=0,_=0,v=0,y=!1,b=!1,x=h.current.burst,S=new u,C=new Float32Array(192),w=[],T=0,E=null,D={x:.55,y:.5},O=null,k=null,A=null,j=[],M={},N=!1;function P(){r||(r=document.createElement(`canvas`),r.className=`galaxy-sky`,r.style.cssText=`position:absolute;inset:0;opacity:1`,r.width=e.width,r.height=e.height,e.after(r),a=r.getContext(`2d`))}function F(){return N&&b&&h.current.preset===`earth`}if(n)try{if(O=n.createProgram(),!O)throw Error(`No program`);for(let[e,t]of[[n.VERTEX_SHADER,i],[n.FRAGMENT_SHADER,f]]){let r=n.createShader(e);if(!r)throw Error(`No shader`);if(j.push(r),n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS))throw Error(`Shader could not compile`);n.attachShader(O,r)}if(n.linkProgram(O),!n.getProgramParameter(O,n.LINK_STATUS))throw Error(`Link failed`);n.useProgram(O),k=n.createBuffer(),n.bindBuffer(n.ARRAY_BUFFER,k),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n.STATIC_DRAW);let e=n.getAttribLocation(O,`position`);n.enableVertexAttribArray(e),n.vertexAttribPointer(e,2,n.FLOAT,!1,0,0),A=n.createTexture(),n.bindTexture(n.TEXTURE_2D,A),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR);for(let e of[`resolution`,`clock`,`home_view`,`brush[0]`,`swash[0]`,`ink`,`ripples[0]`,`rippleCount`])M[e]=n.getUniformLocation(O,e);N=!0}catch{P()}else P();let I=new Image;N&&(I.onload=()=>{y||!N||(n.bindTexture(n.TEXTURE_2D,A),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,I),b=!0,B(),z())},I.onerror=()=>{y||(N=!1,P(),B(),z())},I.src=`${s}/galaxy-noise.png`);function L(){if(y||document.hidden)return;let t=p[h.current.colour],i=F();if(e.style.opacity=i?`1`:`0`,i&&n){r&&(r.style.opacity=`0`);let i=new Float32Array(48),a=new Float32Array(24);w.slice(-12).forEach((e,t)=>{i.set([e.x,e.y,v-e.born,1],t*4),a.set([e.dx,e.dy],t*2)}),n.viewport(0,0,e.width,e.height),n.uniform2f(M.resolution,e.width,e.height),n.uniform1f(M.clock,v),n.uniform1f(M.home_view,1),n.uniform4fv(M[`brush[0]`],i),n.uniform2fv(M[`swash[0]`],a),n.uniform3fv(M.ink,t),S.active.forEach((e,t)=>{C.set([e.x,e.y,v-e.born],t*3)}),n.uniform3fv(M[`ripples[0]`],C),n.uniform1i(M.rippleCount,S.active.length),n.drawArrays(n.TRIANGLES,0,6)}else{if(P(),!a||!r)return;r.style.opacity=`1`,a.clearRect(0,0,r.width,r.height);for(let e of w){let n=Math.max(0,1-(v-e.born)/1.5),i=Math.hypot(e.dx,e.dy),o=i?e.dx/i:1,s=i?e.dy/i:0;for(let i=0;i<28;i++){let c=i%7*3-9+(v-e.born)*7,l=Math.floor(i/7)*2-3;a.fillStyle=`rgba(${t.map(e=>Math.round(e*255)).join(`,`)},${n*.65})`,a.fillRect(Math.floor(e.x*r.width+o*c-s*l),Math.floor(e.y*r.height+s*c+o*l),2,2)}}for(let e of S.active){let n=(v-e.born)*o*r.height,i=Math.max(40,Math.ceil(Math.PI*n));a.fillStyle=`rgba(${t.map(e=>Math.round(e*255)).join(`,`)},${l(e,v,S.aspect)*.8})`;for(let t=0;t<i;t++){let o=t*Math.PI*2/i;a.fillRect(Math.floor(e.x*r.width+Math.cos(o)*n),Math.floor(e.y*r.height+Math.sin(o)*n),2,2)}}}}function R(e){d=0,!(y||document.hidden||h.current.calm)&&(_||=e,e-_>=1e3/30&&(v+=Math.min((e-_)/1e3,.08),_=e,w=w.filter(e=>v-e.born<1.5),S.expire(v),L()),(F()||w.length||S.active.length)&&(d=requestAnimationFrame(R)))}function z(){for(;x<h.current.burst;)x++,S.add(.63,.5,v);h.current.calm&&(w=[],S.clear(),E=null),(y||document.hidden||h.current.calm)&&(cancelAnimationFrame(d),d=0,_=0),L(),!y&&!document.hidden&&!h.current.calm&&!d&&(F()||w.length||S.active.length)&&(_=0,d=requestAnimationFrame(R))}function B(){let n=t.getBoundingClientRect(),i=Math.max(4,n.width/560);e.width=Math.max(1,Math.floor(n.width/i)),e.height=Math.max(1,Math.floor(n.height/i)),S.aspect=e.width/e.height,r&&(r.width=e.width,r.height=e.height),L()}function V(e){if(h.current.calm)return;let n=performance.now();if(e.type===`pointermove`&&n-T<24)return;T=n;let r=t.getBoundingClientRect(),i=(e.clientX-r.left)/r.width,a=(e.clientY-r.top)/r.height,o=E&&n-E.time<180&&e.type!==`pointerdown`,s=o?(i-E.x)*r.width/r.height:.025,c=o?a-E.y:0;w.push({x:i,y:a,dx:s,dy:c,born:v}),E={x:i,y:a,time:n},w=w.slice(-12),e.type===`pointerdown`&&S.add(i,a,v),d||z()}function H(t){if(![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,` `,`Enter`].includes(t.key)||(t.preventDefault(),h.current.calm))return;let n={...D};D.x=Math.max(.05,Math.min(.95,D.x+(t.key===`ArrowRight`?.035:t.key===`ArrowLeft`?-.035:0))),D.y=Math.max(.05,Math.min(.95,D.y+(t.key===`ArrowDown`?.035:t.key===`ArrowUp`?-.035:0))),w.push({...D,dx:(D.x-n.x)*e.width/e.height,dy:D.y-n.y,born:v}),w=w.slice(-12),(t.key===` `||t.key===`Enter`)&&S.add(D.x,D.y,v),d||z()}function U(e){e.preventDefault(),N=!1,P(),B(),z()}g.current=z,B(),z(),window.addEventListener(`pointermove`,V,{passive:!0}),window.addEventListener(`pointerdown`,V,{passive:!0}),t.addEventListener(`keydown`,H);let W=new ResizeObserver(B);return W.observe(t),window.addEventListener(`resize`,B),document.addEventListener(`visibilitychange`,z),e.addEventListener(`webglcontextlost`,U),()=>{y=!0,cancelAnimationFrame(d),I.onload=null,I.onerror=null,g.current=null,window.removeEventListener(`pointermove`,V),window.removeEventListener(`pointerdown`,V),t.removeEventListener(`keydown`,H),W.disconnect(),window.removeEventListener(`resize`,B),document.removeEventListener(`visibilitychange`,z),e.removeEventListener(`webglcontextlost`,U),r?.remove(),n&&(j.forEach(e=>n.deleteShader(e)),n.deleteBuffer(k),n.deleteTexture(A),n.deleteProgram(O))}},[s]),(0,d.jsxs)(d.Fragment,{children:[(0,d.jsxs)(`div`,{className:`galaxy-backdrop`,"aria-hidden":`true`,children:[(0,d.jsx)(`canvas`,{ref:c,className:`galaxy-sky`}),(0,d.jsx)(`div`,{className:`sky-shade`})]}),(0,d.jsx)(`div`,{ref:m,className:`galaxy-touch`,tabIndex:0,role:`application`,"aria-label":`Interactive galaxy. Use arrow keys to paint, and space for a star burst.`,onFocus:()=>v(!0),onBlur:()=>v(!1)}),_&&(0,d.jsx)(`p`,{className:`keyboard-hint`,children:`Arrow keys to paint · Space to burst`})]})}var h=[{id:`earth`,label:`Earth sky`},{id:`pixel`,label:`Pixel sky`}];function g({owner:e,storageKey:t,assetPrefix:n=``,placement:i=`site`}){let[a,o]=(0,r.useState)(!1),[s,c]=(0,r.useState)(0),[l,u]=(0,r.useState)(0),[f,p]=(0,r.useState)(`earth`);(0,r.useEffect)(()=>{let e=window.matchMedia(`(prefers-reduced-motion: reduce)`);e.matches&&o(!0);let n=()=>{e.matches&&o(!0)};e.addEventListener(`change`,n);try{let e=window.localStorage.getItem(t);(e===`earth`||e===`pixel`)&&p(e)}catch{}return()=>e.removeEventListener(`change`,n)},[t]);let g=e=>{p(e);try{window.localStorage.setItem(t,e)}catch{}},_={"--sky-fallback-image":`url("${n}/loading-pixel-sky.png")`};return(0,d.jsxs)(`div`,{className:`sky-experience ${i}-sky`,style:_,children:[(0,d.jsx)(m,{calm:a,colour:s,burst:l,preset:f,assetPrefix:n}),(0,d.jsxs)(`div`,{className:`sky-dock`,"aria-label":`${e} interactive sky controls`,children:[(0,d.jsxs)(`label`,{className:`sky-select`,children:[(0,d.jsx)(`span`,{children:`SKY`}),(0,d.jsx)(`select`,{"aria-label":`Background preset`,value:f,onChange:e=>g(e.target.value),children:h.map(e=>(0,d.jsx)(`option`,{value:e.id,children:e.label},e.id))})]}),(0,d.jsxs)(`button`,{type:`button`,onClick:()=>c(e=>(e+1)%3),"aria-label":`Change trail colour`,children:[`COLOUR `,(0,d.jsx)(`i`,{className:`sky-swatch sky-swatch-${s}`,"aria-hidden":`true`})]}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>{o(!1),u(e=>e+1)},children:`✦ BURST`}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>o(e=>!e),"aria-pressed":a,children:a?`WAKE SKY`:`CALM`})]})]})}export{g as t};