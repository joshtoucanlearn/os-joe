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
}`,o=.32,s=.08;function c(e,t){return Math.hypot(Math.max(e.x,1-e.x)*t,Math.max(e.y,1-e.y))}function l(e,t,n){let r=(t-e.born)*o,i=Math.max(0,Math.min(1,(r-c(e,n))/s));return 1-i*i*(3-2*i)}var u=class{constructor(e=1){this.active=[],this.aspect=e}expire(e){this.active=this.active.filter(t=>(e-t.born)*o<c(t,this.aspect)+s)}add(e,t,n){this.expire(n),this.active.length<64&&this.active.push({x:e,y:t,born:n})}clear(){this.active=[]}};function d(e,t,n,r,i,a,o){if(!i.length&&!a.length){t.set(e);return}let s=n/r;for(let c=0;c<r;c++)for(let l=0;l<n;l++){let u=(l+.5)/n,d=(c+.5)/r,f=0,p=0,m=0,h=0,g=0;for(let e of i){let t=(u-e.x)*s,n=d-e.y,r=(Math.hypot(t,n)-e.radius)*60;if(Math.abs(r)>4)continue;let i=Math.exp(-r*r)*e.opacity,a=Math.hypot(t+1e-4,n+1e-4);f+=(t+1e-4)/a*i*.025,p+=(n+1e-4)/a*i*.025,g+=i*.38}for(let e of a){let t=(u-e.x)*s,n=d-e.y,r=Math.hypot(e.dx+1e-4,e.dy),i=(e.dx+1e-4)/r,a=e.dy/r,o=t*i+n*a,c=-t*a+n*i,l=Math.exp(-(o*o*55+c*c*340))*e.life,f=l*Math.min(Math.hypot(e.dx,e.dy)*2.5,.09);m-=i*f,h-=a*f,g+=l*.22}let _=Math.max(-.1,Math.min(.1,m))+Math.max(-.06,Math.min(.06,f)),v=Math.max(-.1,Math.min(.1,h))+Math.max(-.06,Math.min(.06,p)),y=Math.max(0,Math.min(n-1,Math.floor((u+_/s)*n))),b=(Math.max(0,Math.min(r-1,Math.floor((d+v)*r)))*n+y)*4,x=(c*n+l)*4,S=Math.min(.8,g),C=Math.max(e[b],e[b+1],e[b+2])/255;for(let n=0;n<3;n++){let r=e[b+n]/255,i=Math.round((o[n]*(.15+C*.85)+r*.55)*32)/32;t[x+n]=(r*(1-S)+i*S)*255}t[x+3]=255}}var f=n(),p=a.replace(/const vec3 PALETTE\[9\]=vec3\[\]\([\s\S]*?\);/,`const vec3 PALETTE[9]=vec3[](
 vec3(.025,.18,.25),vec3(.04,.27,.38),vec3(.065,.40,.49),
 vec3(.105,.53,.56),vec3(.28,.61,.52),vec3(.49,.69,.51),
 vec3(.69,.77,.55),vec3(.87,.84,.64),vec3(.99,.94,.79)
);`).replace(`vec3 colour=palette_colour(density,pixel);`,`density=clamp(density*.90+.12,0.0,1.0);
 vec3 colour=palette_colour(density,pixel);`).replace(`colour*=1.0-navigation*.40;`,`colour*=1.0-navigation*.18;`).replace(`uniform float home_view;`,`uniform float home_view;
uniform sampler2D pixel_sky;
uniform vec2 pixel_size;
uniform float pixel_view;
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
 vec2 displacement=clamp(warp,vec2(-.10),vec2(.10))+clamp(rippleWarp,vec2(-.06),vec2(.06));
 if(pixel_view>.5){
  // Match the original image's centred cover framing, then refract its pixels
  // with exactly the same brush and radial displacement as the Earth sky.
  vec2 sample_uv=clamp(uv+displacement/vec2(grid.x/grid.y,1.0),0.0,1.0);
  float cover_scale=max(grid.x/pixel_size.x,grid.y/pixel_size.y);
  vec2 visible=grid/(pixel_size*cover_scale);
  sample_uv=(sample_uv-.5)*visible+.5;
  vec3 original=texture(pixel_sky,sample_uv).rgb;
  float brightness=max(original.r,max(original.g,original.b));
  vec3 painted=floor((ink*(.15+brightness*.85)+original*.55)*32.0+.5)/32.0;
  outputColour=vec4(mix(original,painted,clamp(brushLight+ring*.38,0.0,.8)),1.0);
  return;
 }
 noise_uv+=displacement;
 vec2 drift=vec2(t*.0007,-t*.00028);`).replace(`outputColour=vec4(colour,1.0);`,`
 float glow=clamp(brushLight+ring*.38,0.0,.8);
 vec3 painted=floor((ink*(.15+density*.85)+colour*.55)*32.0+.5)/32.0;
 colour=mix(colour,painted,glow);
 outputColour=vec4(colour,1.0);`),m=[[.23,1,.78],[.73,.46,1],[1,.66,.28]];function h({calm:e,colour:t,burst:n,preset:a,assetPrefix:s=``}){let c=(0,r.useRef)(null),h=(0,r.useRef)(null),g=(0,r.useRef)({calm:e,colour:t,burst:n,preset:a});g.current={calm:e,colour:t,burst:n,preset:a};let _=(0,r.useRef)(null),[v,y]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{_.current?.()},[e,t,n,a]),(0,r.useEffect)(()=>{let e=c.current,t=h.current,n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,powerPreference:`low-power`}),r=null,a=null,f=0,v=0,y=0,b=!1,x=!1,S=!1,C=g.current.burst,w=new Image,T=document.createElement(`canvas`),E=T.getContext(`2d`,{willReadFrequently:!0}),D=null,O=null,k=new u,A=new Float32Array(192),j=[],M=0,N=null,P={x:.55,y:.5},F=null,I=null,L=null,R=null,z=[],B={},V=!1;function H(){r||(r=document.createElement(`canvas`),r.className=`galaxy-sky`,r.style.cssText=`position:absolute;inset:0;opacity:1`,r.width=Math.min(e.width,320),r.height=Math.max(1,Math.round(e.height*r.width/e.width)),e.parentNode?.insertBefore(r,e.nextSibling),a=r.getContext(`2d`),G())}function U(){return V&&x&&(g.current.preset===`earth`||g.current.preset===`pixel`&&S)}function W(){return U()&&g.current.preset===`earth`||j.length||k.active.length}function G(){if(!r||!E||!S)return;T.width=r.width,T.height=r.height,E.imageSmoothingEnabled=!1;let e=Math.max(r.width/w.naturalWidth,r.height/w.naturalHeight),t=w.naturalWidth*e,n=w.naturalHeight*e;E.drawImage(w,(r.width-t)/2,(r.height-n)/2,t,n),D=E.getImageData(0,0,r.width,r.height),O=E.createImageData(r.width,r.height)}if(n)try{if(F=n.createProgram(),!F)throw Error(`No program`);for(let[e,t]of[[n.VERTEX_SHADER,i],[n.FRAGMENT_SHADER,p]]){let r=n.createShader(e);if(!r)throw Error(`No shader`);if(z.push(r),n.shaderSource(r,t),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS))throw Error(`Shader could not compile`);n.attachShader(F,r)}if(n.linkProgram(F),!n.getProgramParameter(F,n.LINK_STATUS))throw Error(`Link failed`);n.useProgram(F),I=n.createBuffer(),n.bindBuffer(n.ARRAY_BUFFER,I),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),n.STATIC_DRAW);let e=n.getAttribLocation(F,`position`);n.enableVertexAttribArray(e),n.vertexAttribPointer(e,2,n.FLOAT,!1,0,0),L=n.createTexture(),n.bindTexture(n.TEXTURE_2D,L),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.LINEAR),n.uniform1i(n.getUniformLocation(F,`nebula_noise`),0),R=n.createTexture(),n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,R),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,new Uint8Array([11,19,30,255])),n.uniform1i(n.getUniformLocation(F,`pixel_sky`),1);for(let e of[`resolution`,`clock`,`home_view`,`pixel_view`,`pixel_size`,`brush[0]`,`swash[0]`,`ink`,`ripples[0]`,`rippleCount`])B[e]=n.getUniformLocation(F,e);V=!0}catch{H()}else H();let K=new Image;V&&(K.onload=()=>{b||!V||(n.activeTexture(n.TEXTURE0),n.bindTexture(n.TEXTURE_2D,L),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,K),x=!0,X(),Y())},K.onerror=()=>{b||(V=!1,H(),X(),Y())},K.src=`${s}/galaxy-noise.png`),w.onload=()=>{b||(S=!0,V&&n&&(n.activeTexture(n.TEXTURE1),n.bindTexture(n.TEXTURE_2D,R),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,w)),G(),Y())},w.src=`${s}/loading-pixel-sky.png`;function q(){if(b||document.hidden)return;let t=m[g.current.colour],i=U();if(e.parentElement.dataset.skyPreset=g.current.preset,e.parentElement.dataset.rippleRenderer=i?`pixel-warp-webgl`:S?`pixel-warp-2d`:`loading`,e.style.opacity=i?`1`:`0`,i&&n){r&&(r.style.opacity=`0`);let i=new Float32Array(48),a=new Float32Array(24);j.slice(-12).forEach((e,t)=>{i.set([e.x,e.y,y-e.born,1],t*4),a.set([e.dx,e.dy],t*2)}),n.viewport(0,0,e.width,e.height),n.uniform2f(B.resolution,e.width,e.height),n.uniform1f(B.clock,y),n.uniform1f(B.home_view,1),n.uniform1f(B.pixel_view,+(g.current.preset===`pixel`)),n.uniform2f(B.pixel_size,w.naturalWidth||1,w.naturalHeight||1),n.uniform4fv(B[`brush[0]`],i),n.uniform2fv(B[`swash[0]`],a),n.uniform3fv(B.ink,t),k.active.forEach((e,t)=>{A.set([e.x,e.y,y-e.born],t*3)}),n.uniform3fv(B[`ripples[0]`],A),n.uniform1i(B.rippleCount,k.active.length),n.drawArrays(n.TRIANGLES,0,6)}else{if(H(),!a||!r)return;r.style.opacity=`1`,a.clearRect(0,0,r.width,r.height),D&&O&&(d(D.data,O.data,r.width,r.height,k.active.map(e=>({x:e.x,y:e.y,radius:(y-e.born)*o,opacity:l(e,y,k.aspect)})),j.map(e=>({...e,life:Math.max(0,1-(y-e.born)/1.5)})),t),a.putImageData(O,0,0))}}function J(e){f=0,!(b||document.hidden||g.current.calm)&&(v||=e,e-v>=1e3/30&&(y+=Math.min((e-v)/1e3,.08),v=e,j=j.filter(e=>y-e.born<1.5),k.expire(y),q()),W()&&(f=requestAnimationFrame(J)))}function Y(){for(;C<g.current.burst;)C++,k.add(.63,.5,y);g.current.calm&&(j=[],k.clear(),N=null),(b||document.hidden||g.current.calm)&&(cancelAnimationFrame(f),f=0,v=0),q(),!b&&!document.hidden&&!g.current.calm&&!f&&W()&&(v=0,f=requestAnimationFrame(J))}function X(){let n=t.getBoundingClientRect(),i=Math.max(4,n.width/560);e.width=Math.max(1,Math.floor(n.width/i)),e.height=Math.max(1,Math.floor(n.height/i)),k.aspect=e.width/e.height,r&&(r.width=Math.min(e.width,320),r.height=Math.max(1,Math.round(e.height*r.width/e.width)),G()),q()}function Z(e){if(g.current.calm)return;let n=performance.now();if(e.type===`pointermove`&&n-M<24)return;M=n;let r=t.getBoundingClientRect(),i=(e.clientX-r.left)/r.width,a=(e.clientY-r.top)/r.height,o=N&&n-N.time<180&&e.type!==`pointerdown`,s=o?(i-N.x)*r.width/r.height:.025,c=o?a-N.y:0;j.push({x:i,y:a,dx:s,dy:c,born:y}),N={x:i,y:a,time:n},j=j.slice(-12),e.type===`pointerdown`&&k.add(i,a,y),f||Y()}function Q(t){if(![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,` `,`Enter`].includes(t.key)||(t.preventDefault(),g.current.calm))return;let n={...P};P.x=Math.max(.05,Math.min(.95,P.x+(t.key===`ArrowRight`?.035:t.key===`ArrowLeft`?-.035:0))),P.y=Math.max(.05,Math.min(.95,P.y+(t.key===`ArrowDown`?.035:t.key===`ArrowUp`?-.035:0))),j.push({...P,dx:(P.x-n.x)*e.width/e.height,dy:P.y-n.y,born:y}),j=j.slice(-12),(t.key===` `||t.key===`Enter`)&&k.add(P.x,P.y,y),f||Y()}function $(e){e.preventDefault(),V=!1,H(),X(),Y()}_.current=Y,X(),Y(),window.addEventListener(`pointermove`,Z,{passive:!0}),window.addEventListener(`pointerdown`,Z,{passive:!0}),t.addEventListener(`keydown`,Q);let ee=new ResizeObserver(X);return ee.observe(t),window.addEventListener(`resize`,X),document.addEventListener(`visibilitychange`,Y),e.addEventListener(`webglcontextlost`,$),()=>{b=!0,cancelAnimationFrame(f),K.onload=null,K.onerror=null,w.onload=null,_.current=null,window.removeEventListener(`pointermove`,Z),window.removeEventListener(`pointerdown`,Z),t.removeEventListener(`keydown`,Q),ee.disconnect(),window.removeEventListener(`resize`,X),document.removeEventListener(`visibilitychange`,Y),e.removeEventListener(`webglcontextlost`,$),r?.remove(),n&&(z.forEach(e=>n.deleteShader(e)),n.deleteBuffer(I),n.deleteTexture(L),n.deleteTexture(R),n.deleteProgram(F))}},[s]),(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`div`,{className:`galaxy-backdrop`,"aria-hidden":`true`,children:[(0,f.jsx)(`canvas`,{ref:c,className:`galaxy-sky`}),(0,f.jsx)(`div`,{className:`sky-shade`})]}),(0,f.jsx)(`div`,{ref:h,className:`galaxy-touch`,tabIndex:0,role:`application`,"aria-label":`Interactive galaxy. Use arrow keys to paint, and space for a star burst.`,onFocus:()=>y(!0),onBlur:()=>y(!1)}),v&&(0,f.jsx)(`p`,{className:`keyboard-hint`,children:`Arrow keys to paint · Space to burst`})]})}var g=[{id:`earth`,label:`Earth sky`},{id:`pixel`,label:`Pixel sky`}];function _({owner:e,storageKey:t,assetPrefix:n=``,placement:i=`site`}){let[a,o]=(0,r.useState)(!1),[s,c]=(0,r.useState)(0),[l,u]=(0,r.useState)(0),[d,p]=(0,r.useState)(`earth`);(0,r.useEffect)(()=>{let e=window.matchMedia(`(prefers-reduced-motion: reduce)`);e.matches&&o(!0);let n=()=>{e.matches&&o(!0)};e.addEventListener(`change`,n);try{let e=window.localStorage.getItem(t);(e===`earth`||e===`pixel`)&&p(e)}catch{}return()=>e.removeEventListener(`change`,n)},[t]);let m=e=>{p(e);try{window.localStorage.setItem(t,e)}catch{}},_={"--sky-fallback-image":`url("${n}/loading-pixel-sky.png")`};return(0,f.jsxs)(`div`,{className:`sky-experience ${i}-sky`,style:_,children:[(0,f.jsx)(h,{calm:a,colour:s,burst:l,preset:d,assetPrefix:n}),(0,f.jsxs)(`div`,{className:`sky-dock`,"aria-label":`${e} interactive sky controls`,children:[(0,f.jsxs)(`label`,{className:`sky-select`,children:[(0,f.jsx)(`span`,{children:`SKY`}),(0,f.jsx)(`select`,{"aria-label":`Background preset`,value:d,onChange:e=>m(e.target.value),children:g.map(e=>(0,f.jsx)(`option`,{value:e.id,children:e.label},e.id))})]}),(0,f.jsxs)(`button`,{type:`button`,onClick:()=>c(e=>(e+1)%3),"aria-label":`Change trail colour`,children:[`COLOUR `,(0,f.jsx)(`i`,{className:`sky-swatch sky-swatch-${s}`,"aria-hidden":`true`})]}),(0,f.jsx)(`button`,{type:`button`,onClick:()=>{o(!1),u(e=>e+1)},children:`✦ BURST`}),(0,f.jsx)(`button`,{type:`button`,onClick:()=>o(e=>!e),"aria-pressed":a,children:a?`WAKE SKY`:`CALM`})]})]})}export{_ as t};