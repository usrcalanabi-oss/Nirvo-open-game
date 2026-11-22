import * as THREE from 'three';
import './style.css';
const typing=e=>/^(INPUT|SELECT|TEXTAREA)$/.test(e.target?.tagName);
let startupFailed=false;
function showStartupError(message){startupFailed=true;const panel=document.querySelector('#loading');if(!panel)return;panel.classList.remove('hide');panel.innerHTML='<div class="loading-mark">N</div><strong>3D WORLD COULD NOT START</strong><span id="startupErrorText"></span>';const line=panel.querySelector('#startupErrorText');if(line)line.textContent=String(message||'Unknown startup error').slice(0,180)}
addEventListener('error',event=>showStartupError(event.message||'JavaScript error'));
addEventListener('unhandledrejection',event=>showStartupError(event.reason?.message||event.reason||'Module loading error'));
const scene=new THREE.Scene();scene.background=new THREE.Color('#9bbfc0');scene.fog=new THREE.FogExp2('#9bbfc0',.0019);
const sky=new THREE.Mesh(new THREE.SphereGeometry(850,40,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,toneMapped:false,vertexShader:`varying vec3 vDirection;void main(){vec4 wp=modelMatrix*vec4(position,1.0);vDirection=normalize(wp.xyz-cameraPosition);gl_Position=projectionMatrix*viewMatrix*wp;}`,fragmentShader:`varying vec3 vDirection;void main(){float h=max(normalize(vDirection).y,0.0);vec3 horizon=vec3(0.77,0.84,0.82);vec3 zenith=vec3(0.20,0.43,0.64);vec3 col=mix(horizon,zenith,pow(h,0.62));float glow=pow(max(dot(normalize(vDirection),normalize(vec3(-0.45,0.55,0.7))),0.0),20.0);col+=vec3(0.24,0.19,0.11)*glow;gl_FragColor=vec4(col,1.0);}`}));sky.renderOrder=-10;scene.add(sky);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,900);camera.position.set(0,7,10);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;document.querySelector('#world').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdaf0f1,0x536b46,2.15));const sun=new THREE.DirectionalLight(0xffe3bd,3);sun.position.set(-90,145,65);sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);sun.shadow.bias=-0.00018;sun.shadow.normalBias=0.025;sun.shadow.radius=3;Object.assign(sun.shadow.camera,{left:-180,right:180,top:180,bottom:-180,near:1,far:400});scene.add(sun);
const M=(c,r=.88,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const m={grass:M('#638e52'),earth:M('#9a7958'),road:M('#343b3a'),concrete:M('#b7b5a6'),white:M('#e8e2d2'),plaster:M('#e6dcc6'),plaster2:M('#d7dfd0'),roof:M('#914b37'),roofDark:M('#693b31'),wood:M('#5a3828'),wood2:M('#8c5c3b'),glass:M('#78aeb0',.22,.16),brass:M('#b58b45',.35,.55),leaf:M('#356b43'),leaf2:M('#4f8750'),trunk:M('#684b32'),water:M('#3f9ea5',.2,.15),dark:M('#242b28'),red:M('#c64d3d'),asphalt:M('#444a46')};
const world=new THREE.Group();scene.add(world);
// Procedural PBR-style surface maps: keep the island richly textured without large downloads.
function surfaceTexture(base,kind='noise'){
 const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');
 x.fillStyle=base;x.fillRect(0,0,512,512);
 let seed=kind.length*971+base.length*37;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 if(kind==='tiles'){
  for(let y=0;y<512;y+=24){x.fillStyle='rgba(40,18,12,.28)';x.fillRect(0,y,512,3);for(let xx=(y/24%2)*24;xx<512;xx+=48){x.fillStyle='rgba(255,210,170,.13)';x.fillRect(xx+2,y+3,43,17);x.fillStyle='rgba(35,15,10,.18)';x.fillRect(xx,y+20,45,2)}}
 }else{
  for(let i=0;i<9000;i++){const v=rnd();x.fillStyle=v>.5?'rgba(255,255,255,.055)':'rgba(0,0,0,.045)';const size=kind==='stone'?1+rnd()*3:1+rnd()*2;x.fillRect(rnd()*512,rnd()*512,size,size)}
  if(kind==='plaster'){for(let i=0;i<90;i++){x.strokeStyle='rgba(80,65,48,.08)';x.beginPath();const px=rnd()*512,py=rnd()*512;x.moveTo(px,py);x.lineTo(px+5+rnd()*28,py+rnd()*3);x.stroke()}}
  if(kind==='grass'){for(let i=0;i<1400;i++){x.strokeStyle=rnd()>.5?'rgba(35,75,28,.16)':'rgba(220,225,145,.13)';x.beginPath();const px=rnd()*512,py=rnd()*512;x.moveTo(px,py);x.lineTo(px+(rnd()-.5)*4,py-2-rnd()*8);x.stroke()}}
 }
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t
}
m.grass.map=surfaceTexture('#638e52','grass');m.grass.color.set('#d5e0ce');m.grass.map.repeat.set(7,7);
m.earth.map=surfaceTexture('#9a7958','stone');m.earth.map.repeat.set(4,4);
m.road.map=surfaceTexture('#343b3a','stone');m.road.map.repeat.set(5,2);
m.asphalt.map=surfaceTexture('#444a46','stone');m.asphalt.map.repeat.set(5,2);
m.plaster.map=surfaceTexture('#e6dcc6','plaster');m.plaster.map.repeat.set(1.5,1.5);
m.roof.map=surfaceTexture('#914b37','tiles');m.roof.map.repeat.set(1,1);
m.water.map=surfaceTexture('#3f9ea5','noise');m.water.map.repeat.set(3,3);
m.grass.bumpMap=m.grass.map;m.grass.bumpScale=.11;m.earth.bumpMap=m.earth.map;m.earth.bumpScale=.09;m.roof.bumpMap=m.roof.map;m.roof.bumpScale=.12;m.road.bumpMap=m.road.map;m.road.bumpScale=.055;m.plaster.bumpMap=m.plaster.map;m.plaster.bumpScale=.035;
for(const material of [m.grass,m.earth,m.road,m.asphalt,m.plaster,m.roof,m.water])material.needsUpdate=true;

function box(p,x,y,z,w,h,d,ma,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;p.add(o);return o}
function cyl(p,x,y,z,rt,rb,h,ma,n=10){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),ma);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
function label(t,x,y,z,w=13,h=2){const c=document.createElement('canvas');c.width=640;c.height=128;const q=c.getContext('2d');q.fillStyle='#173b32';q.fillRect(0,0,640,128);q.strokeStyle='#d8c38d';q.lineWidth=5;q.strokeRect(4,4,632,120);q.fillStyle='#f4e9cf';q.font='bold 43px Arial';q.textAlign='center';q.textBaseline='middle';q.fillText(t,320,66);const tx=new THREE.CanvasTexture(c);const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}));s.position.set(x,y,z);world.add(s);return s}
function terrain(){
 const ocean=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),M('#176f89',.22,.18));
 ocean.rotation.x=-Math.PI/2;ocean.position.y=-5.5;ocean.receiveShadow=true;world.add(ocean);
 const sand=new THREE.Mesh(new THREE.RingGeometry(213,237,160),M('#c9b58a',.94));
 sand.rotation.x=-Math.PI/2;sand.position.y=-3.7;world.add(sand);
 const geo=new THREE.PlaneGeometry(560,560,180,180),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getY(i),angle=Math.atan2(z,x);
  const coast=224+12*Math.sin(angle*3+0.7)+8*Math.sin(angle*7-1.1)+5*Math.cos(angle*11);
  const r=Math.hypot(x,z);
  let h=1.4*Math.sin(x*.027)*Math.cos(z*.024)+.65*Math.sin((x+z)*.055);
  h*=.3;
  const edge=THREE.MathUtils.clamp((coast-r)/35,0,1);
  h=h*edge-5.1*(1-edge);
  p.setZ(i,h);
 }
 geo.computeVertexNormals();
 const ground=new THREE.Mesh(geo,m.grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;world.add(ground);
 for(let r=0;r<2;r++)for(let i=0;i<18;i++){
  const a=i*Math.PI*2/18,rad=r?178:205,h=30+(i%5)*9+r*8;
  const hill=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),M(r?'#52795a':'#64876a'));
  hill.position.set(Math.cos(a)*rad,h*.16-1,Math.sin(a)*rad);hill.scale.set(27+r*8,h*.58,35+r*9);world.add(hill)
 }
}
terrain();
function road(pts,width,ma=m.road){
 const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],.15,p[1]))),v=[],ix=[],steps=220;
 for(let i=0;i<=steps;i++){const t=i/steps,p=curve.getPoint(t),d=curve.getTangent(t),nx=-d.z,nz=d.x;v.push(p.x+nx*width/2,p.y,p.z+nz*width/2,p.x-nx*width/2,p.y,p.z-nz*width/2);if(i<steps){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const mesh=new THREE.Mesh(g,ma);mesh.receiveShadow=true;world.add(mesh);
 const edgeMat=new THREE.MeshStandardMaterial({color:'#d8d0b5',roughness:.8});
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=100;i++){const p=curve.getPointAt(i/100),d=curve.getTangentAt(i/100);pts.push(new THREE.Vector3(p.x-d.z*width*.46,.19,p.z+d.x*width*.46))}world.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),180,.055,5,false),edgeMat))}
 if(width>=7){const dashMat=new THREE.MeshStandardMaterial({color:'#e6d7a6',roughness:.8}),length=curve.getLength();for(let t=5;t<length;t+=13){const p=curve.getPointAt(t/length),d=curve.getTangentAt(t/length),dash=new THREE.Mesh(new THREE.BoxGeometry(.13,.035,4.2),dashMat);dash.position.set(p.x,.205,p.z);dash.rotation.y=Math.atan2(d.x,d.z);world.add(dash)}}
 return curve
}
const mainRoad=road([[-175,18],[-125,13],[-90,0],[-55,-2],[-20,0],[15,2],[48,5],[83,12],[118,23],[160,35]],10);
road([[-55,-2],[-65,-28],[-72,-57],[-82,-95],[-110,-135]],7);road([[48,5],[62,-25],[82,-48],[112,-72],[150,-98]],7);road([[-20,0],[-12,27],[-8,58],[-18,92],[-38,125]],7);road([[83,12],[100,0],[124,-8],[150,-12]],6,m.asphalt);
for(let x=-120;x<130;x+=24){box(world,x,.12,-7.2,8,.08,.55,m.concrete,false);box(world,x,.12,7.2,8,.08,.55,m.concrete,false)}
function roof(g,w,d,y,ma=m.roof){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(0,2.5);s.lineTo(w/2,0);s.lineTo(-w/2,0);
 const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:d+.9,bevelEnabled:true,bevelSegments:2,bevelSize:.06,bevelThickness:.06}),ma);o.position.set(0,y,-d/2-.45);o.castShadow=true;o.receiveShadow=true;g.add(o);
 // Layered terracotta eaves, ridge cap and visible tile courses.
 for(let row=0;row<9;row++){const zz=-d/2-.38+row*(d+.72)/8;const yy=y+2.42;
  for(const side of [-1,1]){const x=Math.max(.1,w/2-row*.025);const rib=box(g,side*x*.48,yy-x*.43,zz,w*.69,.055,.07,m.roofDark,false);rib.rotation.z=side*.48}
 }
 box(g,0,y+2.53,0,w+.5,.2,.28,m.roofDark);
 for(const side of [-1,1]){const fascia=box(g,side*w*.25,y+.08,0,.13,.16,d+.9,m.wood2);fascia.rotation.z=side*.48}
}
function house(x,z,i){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);const w=8.5+i%3*.5,d=7.2+i%2*.5,h=3.25,wall=[m.plaster,m.plaster2,M('#e7d2b9'),M('#d6d8c9')][i%4];box(g,0,h/2,0,w,h,d,wall);roof(g,w+1,d+1,h);box(g,0,.18,d/2+1.1,w+.8,.3,2.5,m.wood);for(const px of [-w*.38,w*.38]){cyl(g,px,1.65,d/2+2.1,.13,.18,3,m.wood2,8);cyl(g,px,3.12,d/2+2.1,.24,.15,.22,m.brass,8)}box(g,-.25,1.15,d/2+.08,1.05,2.25,.14,m.wood);for(const wx of [-2.7,2.65]){box(g,wx,2,d/2+.1,1.28,1.15,.16,m.glass);for(let b=-.42;b<=.42;b+=.28)box(g,wx+b,2,d/2+.23,.045,1.04,.08,m.wood)}box(g,0,.12,d/2+2.25,2.4,.22,.9,m.concrete);for(let a=0;a<3;a++)box(g,0,.12+a*.13,d/2+2.55+a*.28,2.5,.16,.55,m.concrete);box(g,0,.42,-d/2-3,w+5,.8,.22,m.concrete);for(const px of [-w/2-2.4,w/2+2.4]){box(g,px,.85,d/2+4,.6,1.7,.6,m.concrete);box(g,px,1.75,d/2+4,.9,.2,.9,m.brass)}for(const px of [-4.8,4.8]){cyl(g,px,.35,d/2+3,.35,.45,.55,M('#9a6848'));cyl(g,px,1.1,d/2+3,.05,.5,1.2,m.leaf,6)}cyl(g,2,.95,d/2+2.65,.08,.08,1.4,m.brass);cyl(g,2,1.7,d/2+2.65,.28,.08,.24,m.brass)}
[[-37,-27],[-55,-27],[-73,-27],[-91,-27],[-37,-48],[-55,-48],[-73,-48],[-91,-48],[25,-28],[43,-28],[61,-28],[79,-28],[25,-49],[43,-49],[61,-49],[79,-49],[-35,34],[-54,34],[24,34],[43,34]].forEach((p,i)=>house(...p,i));
function palm(x,z,s=1){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);world.add(g);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.17,.34,7.6,20,6),m.trunk);trunk.position.y=3.8;trunk.rotation.z=.045;trunk.castShadow=true;g.add(trunk);
 for(let i=0;i<11;i++){const a=i*Math.PI*2/11,dir=new THREE.Vector3(Math.cos(a),.2,Math.sin(a));
  const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,7.05,0),new THREE.Vector3(dir.x*2.4,8.2,dir.z*2.4),new THREE.Vector3(dir.x*4.4,5.5,dir.z*4.4));
  const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,14,.045,5,false),m.wood2);g.add(stem);
  for(let j=0;j<13;j++){const t=.16+j*.061,p=curve.getPoint(t),tangent=curve.getTangent(t),leafGeo=new THREE.ConeGeometry(.105,1.2,5);const leaf=new THREE.Mesh(leafGeo,i%2?m.leaf:m.leaf2);leaf.position.copy(p).add(new THREE.Vector3(Math.cos(a)*.24,-.1,Math.sin(a)*.24));leaf.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.cos(a)*.85,-.48,Math.sin(a)*.85));leaf.scale.set(.85,1.15,.72);leaf.castShadow=true;g.add(leaf)}
 }
 const coconuts=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),M('#47713a'));coconuts.position.set(0,6.9,0);g.add(coconuts);
}
function tree(x,z,s=1){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.42,5.2,18,4),m.trunk);trunk.position.y=2.6;trunk.castShadow=true;g.add(trunk);
 for(let i=0;i<7;i++){const a=i*Math.PI*2/7,branch=new THREE.Mesh(new THREE.CylinderGeometry(.045,.14,2.4,7),m.trunk);branch.position.set(Math.cos(a)*.75,4.25,Math.sin(a)*.75);branch.rotation.z=Math.cos(a)*-.38;branch.rotation.x=Math.sin(a)*.38;g.add(branch)}
 for(let i=0;i<8;i++){const crown=new THREE.Mesh(new THREE.SphereGeometry(1.8*s,24,18),i%2?m.leaf:m.leaf2);const a=i*Math.PI*2/8;crown.position.set(Math.cos(a)*1.35,5.15+(i%3)*.45,Math.sin(a)*1.35);crown.scale.set(1.15,.86,1.05);crown.castShadow=true;g.add(crown)}
}
for(let i=0;i<70;i++){const x=(i*47)%340-170,z=(i*73)%340-170;if(Math.abs(x)<105&&Math.abs(z)<100)continue;i%3===0?palm(x,z,.8+i%4*.12):tree(x,z,.8+i%3*.15)}
for(let x=-110;x<120;x+=17){palm(x,-13,.68);palm(x,13,.68)}for(let z=-95;z<100;z+=20){tree(-15,z,.7);tree(15,z,.7)}
function publicBuilding(x,z,w,d,h,title,wall,roofMat){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);box(g,0,h/2,0,w,h,d,M(wall));roof(g,w+1,d+1,h,M(roofMat));box(g,0,.2,d/2+1,w+.8,.35,2.2,m.wood);for(const px of [-w*.34,w*.34]){cyl(g,px,1.65,d/2+1.8,.15,.2,3.1,m.white,8);cyl(g,px,3.2,d/2+1.8,.24,.15,.2,m.brass,8)}box(g,0,1.15,d/2+.08,1.3,2.25,.16,m.wood);for(const px of [-w*.27,w*.27])box(g,px,2.1,d/2+.09,1.45,1.1,.12,m.glass);label(title,x,h+4,z,w*.95,2)}
publicBuilding(-15,2,19,14,5.2,'MUTHANGA POLICE STATION','#e2d9c3','#8e4d38');publicBuilding(-73,4,23,17,6,'ST JUDE MEDICAL CENTRE','#e7e5d9','#7c5545');publicBuilding(28,78,22,17,5,'MUTHANGA BUS STAND','#e2d9c2','#92533e');publicBuilding(77,4,16,13,4.5,'PANCHAYAT OFFICE','#e4d8c1','#86543f');publicBuilding(78,44,16,13,4.5,'GOVT. SCHOOL','#d9e2d5','#76513d');publicBuilding(-105,4,15,12,4,'POST OFFICE','#e6d8c2','#89513b');
// Hospital tower and ambulance plaza
const tower=new THREE.Group();tower.position.set(-73,0,-11);world.add(tower);box(tower,0,15,0,15,30,13,M('#c9d7d5',.35));for(let y=2;y<29;y+=3.2)for(let x=-5;x<=5;x+=3.3)box(tower,x,y,6.58,2.25,2.1,.1,m.glass,false);box(tower,0,30.2,0,15.7,.5,13.7,m.concrete);box(tower,0,8,7.2,23,7,5,M('#e9e7dc'));label('ST JUDE MEDICAL CENTRE',-73,13.8,9.7,20,1.8);box(tower,9,18,6.7,1.2,5,.3,M('#4a9c66'));box(tower,9,18,6.7,5,1.2,.3,M('#4a9c66'));
for(let i=0;i<3;i++){const x=-86+i*8;box(world,x,.8,15,5,1.6,8,M('#f2f0e8'));box(world,x,1.65,15,4.2,.7,7,m.glass);for(const wx of [-1.5,1.5])cyl(world,x+wx,.45,11.8,.48,.48,.5,m.dark,10);label('AMBULANCE',x,2.9,15,4,.7)}
// Police jeep and flagpole
const jeep=new THREE.Group();jeep.position.set(-13,0,20);world.add(jeep);box(jeep,0,1,0,5,1.5,2.5,M('#47764c'));box(jeep,0,2.05,-.1,2.9,1.1,2.1,m.glass);for(const x of [-1.65,1.65])for(const z of [-.85,.85])cyl(jeep,x,.55,z,.55,.55,.38,m.dark,12);box(jeep,0,2.75,0,1.8,.14,.3,m.red);cyl(world,-25,4,1,.08,.08,8,m.dark,8);box(world,-25,7.9,0,1.6,.8,.05,M('#e8e4d5'));
// Bus bays and buses
for(let i=0;i<3;i++){const x=16+i*9,z=91;box(world,x,.16,z,7,.28,14,m.concrete,false);const bus=new THREE.Group();bus.position.set(x,0,z-1);world.add(bus);box(bus,0,1.8,0,6.8,3.2,11,M(i===1?'#d5a84d':'#e4e0c8'));box(bus,0,2.25,-5.52,5.9,1.05,.12,m.glass);for(const a of [-2,2])box(bus,a,2.25,5.52,1.05,1.05,.12,m.glass);for(const wx of [-2.4,2.4])for(const wz of [-3.8,3.8])cyl(bus,wx,.65,wz,.58,.58,.42,m.dark,12)}
function tea(x,z){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);box(g,0,1.7,0,9,3.4,6,M('#cbb997'));roof(g,10,7,3.4);box(g,0,2.5,3.15,8,.8,.18,m.wood);label('CHAAYA KADA',x,4.8,z,8,1.4);for(let i=0;i<3;i++){cyl(g,-2+i*2,.7,4.8,.55,.55,.8,m.wood,10);cyl(g,-2+i*2,1.25,4.8,.65,.65,.16,m.wood2,10)}}tea(2,-34);tea(53,-28);tea(-104,-25);
// Muthanga Nature Park gate, stream and twin waterfall
const gate=new THREE.Group();gate.position.set(130,0,105);world.add(gate);box(gate,0,3,0,17,1,1,m.wood);for(const x of [-8,8])box(gate,x,2,0,.9,4,.9,m.wood);label('MUTHANGA NATURE PARK',130,5.5,105,17,2.2);box(world,130,.12,120,5,.12,40,m.earth,false);for(let i=0;i<16;i++)tree(105+i%4*15,130+Math.floor(i/4)*12,.9);const stream=new THREE.Mesh(new THREE.PlaneGeometry(24,70),m.water);stream.rotation.x=-Math.PI/2;stream.position.set(148,.1,164);world.add(stream);for(let i=0;i<2;i++){const f=new THREE.Mesh(new THREE.PlaneGeometry(9,13),new THREE.MeshStandardMaterial({color:'#b8e2df',transparent:true,opacity:.78,side:THREE.DoubleSide}));f.position.set(145+i*5,7-i*1.7,145);world.add(f)}box(world,148,1,151,17,.3,5,m.wood);label('WATERFALL VIEW',148,4,151,11,1.5);
// Tea estate terraces and mountain road
for(let r=0;r<9;r++)for(let c=0;c<12;c++){const shrub=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,6),m.leaf2);shrub.position.set(45+c*8,1+r*.65,-135+r*9);shrub.scale.set(1.4,.45,.7);shrub.castShadow=true;world.add(shrub)}label('WAYANAD TEA ESTATE',91,15,-143,18,2.4);road([[25,-120],[38,-137],[64,-153],[92,-167],[128,-180]],6,m.asphalt);
// Reservoir and fishing jetty
const lake=new THREE.Mesh(new THREE.CircleGeometry(24,48),m.water);lake.rotation.x=-Math.PI/2;lake.scale.set(1.35,1,.8);lake.position.set(-140,.12,145);world.add(lake);box(world,-140,.35,120,14,.35,3,m.wood);label('KABINI RIVERSIDE',-140,5,120,15,1.8);
for(let i=0;i<13;i++){const x=-120+i*20; cyl(world,x,4,-9,.12,.15,8,m.wood,8);box(world,x,7.8,-9,2.8,.12,.12,m.wood)}const wireMat=new THREE.LineBasicMaterial({color:'#343b37'});for(const z of [-9,-7.8]){const pts=[];for(let i=0;i<13;i++)pts.push(new THREE.Vector3(-120+i*20,8+Math.sin(i*.5)*.4,z));world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireMat))}

// ===== KERALA WORLD EXPANSION: HERITAGE, CAMPUS, HISTORY & COAST =====
function tiledWing(x,z,w,d,h,title){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);box(g,0,h/2,0,w,h,d,M('#e3d9c7'));roof(g,w+1,d+1,h,M('#914b36'));for(let xx=-w*.32;xx<=w*.32;xx+=w*.32){box(g,xx,1.8,d/2+.08,1.35,1.55,.12,m.wood);box(g,xx,1.8,d/2+.16,.12,1.5,.1,m.brass)}label(title,x,h+3,z,w,1.5);return g}
function solarPanels(g,x,z,y,w=1.4){for(let i=0;i<5;i++){const p=box(g,x+(i-2)*w,y,z,1.25,.1,1.7,M('#31546a',.25,.3));p.rotation.x=-.18}}
function banyan(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);world.add(g);cyl(g,0,3.8,0,.8,1.15,7.6,m.trunk,12);for(let i=0;i<8;i++){const a=i*Math.PI/4;const limb=cyl(g,Math.cos(a)*2,6,Math.sin(a)*2,.25,.55,4,m.trunk,8);limb.rotation.z=Math.cos(a)*-.65;limb.rotation.x=Math.sin(a)*.65;const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.1,1),i%2?m.leaf:m.leaf2);crown.position.set(Math.cos(a)*3.1,8,Math.sin(a)*3.1);crown.scale.set(1,.65,1);g.add(crown);const root=cyl(g,Math.cos(a)*2.8,2.5,Math.sin(a)*2.8,.055,.09,5,m.trunk,6);root.position.y=2.5} }
function fenceLine(x,z,len,axis='x',mat=m.dark){for(let i=0;i<=len;i++){const xx=x+(axis==='x'?i*1.5:0),zz=z+(axis==='z'?i*1.5:0);box(world,xx,1,zz,.12,2,.12,mat)}for(const y of [.45,1.65])box(world,x+(axis==='x'?len*.75:0),y,z+(axis==='z'?len*.75:0),axis==='x'?len*1.5:.12,.1,axis==='z'?len*1.5:.12,mat)}
// Hospital heritage campus: red-roof side wing, solar roof, lily pond and gazebo
const hospitalWing=tiledWing(-101,-18,19,13,5,'HERITAGE & SPECIALITY WING');solarPanels(hospitalWing,0,0,5.45,2.6);
const pond=new THREE.Mesh(new THREE.BoxGeometry(22,.18,13),m.water);pond.position.set(-102,.18,-42);world.add(pond);for(const x of [-113,-91])for(const z of [-48,-36])box(world,x,.35,z,.45,.5,.45,m.concrete);
const gazebo=new THREE.Group();gazebo.position.set(-102,0,-42);world.add(gazebo);for(const x of [-3,3])for(const z of [-2,2])box(gazebo,x,2,z,.22,4,.22,m.wood);box(gazebo,0,4.05,0,7,.2,5,m.wood);roof(gazebo,7.5,5.5,4.2,m.roof);
for(let i=0;i<7;i++){const flower=cyl(world,-119+i*5,.3,-53,.28,.28,.45,i%2?M('#e3b65b'):M('#bd6f76'),8);cyl(world,-119+i*5,.62,-53,.1,.1,.35,m.leaf,6)}
// White church and fenced cemetery behind the hospital campus
const church=new THREE.Group();church.position.set(-130,0,-48);world.add(church);box(church,0,3.5,0,14,7,19,m.white);const churchRoof=new THREE.Mesh(new THREE.ConeGeometry(10,3,4),m.roof);churchRoof.position.set(0,8.5,0);churchRoof.rotation.y=Math.PI/4;church.add(churchRoof);box(church,0,10,-7,4,7,4,m.white);const spire=new THREE.Mesh(new THREE.ConeGeometry(1.5,4,4),m.roofDark);spire.position.set(0,15.5,-7);church.add(spire);box(church,0,4,9,3,5,.25,m.wood);label('ST JUDE CHURCH',-130,12,-48,13,1.8);
for(let i=0;i<10;i++){const x=-145+(i%5)*6,z=-75+Math.floor(i/5)*6;box(world,x,.5,z,1.2,1,.35,m.white);box(world,x,.95,z,1.15,.12,.35,m.white);box(world,x,.95,z,.12,1,.35,m.white)}fenceLine(-149,-81,12,'x');fenceLine(-149,-81,8,'z');fenceLine(-131,-81,8,'z');
// Kerala temple with tiered roof and stepped temple tank
const temple=new THREE.Group();temple.position.set(-34,0,-65);world.add(temple);box(temple,0,2.5,0,13,5,13,M('#d4b88a'));roof(temple,14,14,5,m.roofDark);for(let i=0;i<4;i++){const y=5+i*1.45,w=8-i*1.45;box(temple,0,y+.65,0,w,1.25,w,M('#a96c3d'));const cap=new THREE.Mesh(new THREE.ConeGeometry(w*.75,.8,4),m.roof);cap.position.set(0,y+1.5,0);cap.rotation.y=Math.PI/4;temple.add(cap)}box(temple,0,1.7,7,4,3,.35,m.wood);label('KERALAM TEMPLE',-34,13,-65,14,1.6);
const tank=new THREE.Mesh(new THREE.BoxGeometry(19,.25,14),m.water);tank.position.set(-34,.18,-88);world.add(tank);for(let i=0;i<5;i++)box(world,-43+i*4,.3,-96,.55,.35,4,m.concrete);for(let i=0;i<3;i++)box(world,-45,.3+i*.28,-91+i*2,3,.18,1.2,m.concrete);
// Pazhassi Raja Museum gate, ticket booth and forest path
const museum=new THREE.Group();museum.position.set(123,0,139);world.add(museum);for(const x of [-9,9]){box(museum,x,2.6,0,1,5,1,m.wood);box(museum,x,5.3,0,2,.45,1.4,m.brass)}box(museum,0,5.3,0,19,.8,1.2,m.wood);roof(museum,19,3,5.8,m.roofDark);label('PAZHASSI RAJA MUSEUM',123,7.2,139,19,1.7);tiledWing(145,139,8,7,3.2,'TICKET');road([[123,142],[122,157],[115,170],[104,181]],4,m.earth);
for(let i=0;i<8;i++)tree(104+i*6,158+(i%2)*7,.8);
const eco=tiledWing(155,111,15,11,4.5,'MUTHANGA ECO STUDY CENTRE');solarPanels(eco,0,0,4.9,2.2);box(eco,0,1.8,5.65,8,2.8,.12,m.glass);for(let i=0;i<3;i++){cyl(eco,-2+i*2,1.1,5.9,.35,.35,.5,m.brass);box(eco,-2+i*2,2,5.9,.8,.12,.8,m.white)}
// Canopy walk and football ground
for(let i=0;i<8;i++){const x=82+i*6;box(world,x,9,127,.45,18,.45,m.wood);box(world,x,18,127,6,.35,2,m.wood);box(world,x,19,126,6,.12,.12,m.brass);box(world,x,19,128,6,.12,.12,m.brass)}
box(world,111,.18,105,54,.25,32,M('#548b49'));for(const x of [86,136]){box(world,x,.8,105,.3,1.6,.3,m.white);box(world,x,.8,105+(x===86?8:-8),.3,1.6,.3,m.white)}label('MUTHANGA FOOTBALL GROUND',111,4,89,24,1.7);
// Ayurvedic campus with courtyard and herb beds
const ayur=tiledWing(42,132,22,14,4.2,'AYURVEDA CHIKITSA VEEDU');const herb=new THREE.Mesh(new THREE.BoxGeometry(24,.18,15),M('#527c45'));herb.position.set(42,.15,151);world.add(herb);for(let i=0;i<20;i++){const x=32+(i%5)*4,z=145+Math.floor(i/5)*3;const plant=new THREE.Mesh(new THREE.SphereGeometry(.65,8,6),m.leaf2);plant.position.set(x,1,z);plant.scale.y=.6;world.add(plant)}box(world,42,.2,120,8,.15,5,m.water);label('OUSHADHALAYA',42,5,132,12,1.3);
// Wayanad megalithic site and Edakkal-style cave
const hill=new THREE.Mesh(new THREE.ConeGeometry(25,18,8),M('#617d54'));hill.position.set(167,8,68);world.add(hill);for(let i=0;i<8;i++){const x=153+(i%4)*8,z=61+Math.floor(i/4)*9;box(world,x,1.6,z,3,.35,3,M('#77776b'));box(world,x,3.2,z-1.2,.35,3,.35,M('#77776b'));box(world,x,3.2,z+1.2,.35,3,.35,M('#77776b'));box(world,x,4.8,z,3.2,.35,3.2,M('#77776b'))}label('WAYANAD MEGALITHS',167,20,68,19,1.8);
const cave=new THREE.Group();cave.position.set(160,0,24);world.add(cave);const rock=M('#4c5149');const caveArch=new THREE.Mesh(new THREE.TorusGeometry(6,2.2,8,16,Math.PI),rock);caveArch.position.set(0,5,0);cave.add(caveArch);box(cave,0,2,0,11,4,2,rock);box(cave,0,1.5,1.1,7,2.8,.2,M('#222b27'));for(let i=0;i<5;i++)box(cave,-2+i,2.4,1.25,.12,.9,.06,M('#c9a66a'));label('EDAKKAL CAVE',160,11,24,13,1.6);
// Malabar harbour, lighthouse, fish auction sheds, boats and fishing piers
const harbor=new THREE.Group();harbor.position.set(155,0,-65);world.add(harbor);const sea=new THREE.Mesh(new THREE.PlaneGeometry(65,52),m.water);sea.rotation.x=-Math.PI/2;sea.position.set(12,.08,-5);harbor.add(sea);
const lightHouse=cyl(harbor,-18,10,-8,2.1,3.4,20,M('#f0e9d9'),16);for(let y=3;y<19;y+=4)box(harbor,-18,y,-8,4.35,.85,4.35,y%8?M('#c74f42'):m.white);cyl(harbor,-18,21,-8,2.7,2.7,1.4,m.brass,12);label('MALABAR LIGHTHOUSE',-3,25,-8,15,1.4);
for(let i=0;i<3;i++){const x=2+i*13;box(harbor,x,.4,-8,2,.6,27,m.wood);for(let z=-18;z<4;z+=5)box(harbor,x,.85,z,.3,.25,.3,m.brass)}
function fishingBoat(parent,x,z,s=1,paint='#c75a43'){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.5,8,10),M(paint));hull.rotation.x=Math.PI/2;hull.rotation.z=Math.PI/2;hull.position.y=.8;g.add(hull);box(g,0,1.5,0,3,.6,4,m.wood);box(g,0,2.5,-.5,.25,2,.25,m.wood);box(g,1.2,2.2,-.5,2.5,.15,.15,m.wood);box(g,-1.1,2.1,.4,.7,.5,.8,M('#e6d4a8'))}
fishingBoat(harbor,-2,-18,1.15);fishingBoat(harbor,17,-20,.9,'#e0a943');fishingBoat(harbor,29,-8,.85,'#477b79');
tiledWing(21,13,16,10,4,'FISH AUCTION HALL');tiledWing(42,13,13,9,3.5,'COIR ROPE STORE');tiledWing(0,20,10,8,3.2,'THATTUKADA');for(let i=0;i<6;i++){box(harbor,5+i*3,.55,8,1.5,1,1.5,M('#b58b58'));box(harbor,5+i*3,1.2,8,1.2,.15,1.2,m.wood)}
// Coastal street vehicles
for(let i=0;i<4;i++){const x=50+i*7;box(harbor,x,1.5,26,4.5,2.8,7,M(i%2?'#d5b75f':'#477d78'));box(harbor,x,2.1,22.45,3.8,1,.12,m.glass);for(const wx of [-1.5,1.5])for(const wz of [-2.3,2.3])cyl(harbor,x+wx,.65,26+wz,.55,.55,.35,m.dark,10)}
// West-side Kuttanad paddy blocks and backwater lanes
const paddyMat=M('#6c9c54');for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=-167+c*10,z=75+r*10;box(world,x,.08,z,9,.12,9,r%2?M('#4e8b55'):paddyMat,false);for(let a=0;a<3;a++)box(world,x-3+a*3,.17,z, .1,.08,9,m.water,false)}
const backwater=new THREE.Mesh(new THREE.PlaneGeometry(44,35),m.water);backwater.rotation.x=-Math.PI/2;backwater.position.set(-140,.12,125);world.add(backwater);for(let i=0;i<3;i++){const boat=new THREE.Group();boat.position.set(-153+i*12,0,122+i*5);world.add(boat);box(boat,0,.55,0,3,.45,9,M('#7b4a2d'));box(boat,0,1.5,0,2.6,1.5,6,M('#d6c4a0'));roof(boat,3,6,2.4,m.roofDark)}label('KUTTANAD BACKWATERS',-140,7,125,18,1.7);
banyan(108,60,1.35);banyan(-5,145,1.1);for(const [x,z] of [[-160,45],[-115,90],[65,165],[178,112]])palm(x,z,1.1);
// Small local street furniture, lamps and wayfinding boards
for(const [x,z] of [[-50,12],[-95,-8],[55,18],[92,68],[130,120],[150,-45]]){cyl(world,x,3,z,.12,.14,6,m.dark,8);box(world,x,6.1,z,.8,.18,.8,m.brass);box(world,x,6.4,z,.35,.15,.35,M('#f4d99a'))}
label('LMHS · L.M. HIGH SCHOOL',78,11,54,17,1.4);label('MUTHANGA HERITAGE CAMPUS',-75,36,-30,24,1.7);


const driveBus=new THREE.Group();driveBus.position.set(5,0,23);world.add(driveBus);
const busBody=M('#d9e2d8',.48),busStripe=M('#c94d3d'),busGlass=M('#477f87',.2,.12);
box(driveBus,0,1.85,0,4.1,3.25,10.8,busBody);box(driveBus,0,2.18,-5.47,3.8,1.35,.12,busGlass);box(driveBus,0,2.15,5.47,3.8,1.25,.12,busGlass);
for(const z of [-3.7,-1.25,1.25,3.7])for(const x of [-2.08,2.08]){box(driveBus,x,2.25,z,.12,1.25,1.75,busGlass);box(driveBus,x,1.15,z,.13,.12,1.8,busStripe)}
box(driveBus,0,3.35,0,4.15,.18,10.9,busStripe);for(const x of [-1.5,1.5])for(const z of [-3.65,3.65]){const w=cyl(driveBus,x,.75,z,.68,.68,.42,m.dark,16);w.rotation.z=Math.PI/2}
for(const x of [-1.35,1.35]){box(driveBus,x,1.05,-5.58,.55,.35,.16,M('#fff0c2'));box(driveBus,x,1.05,5.58,.55,.35,.16,m.red)}
label('NIRVO MALABAR EXPRESS',5,4.2,23,12,1.15);
let driving=false,busSpeed=0,busSteer=0,busYaw=0,busDistance=0,busPassengers=0,nextStopIndex=1,stopWait=0;
const busStops=[{name:'MUTHANGA BUS STAND',x:5,z:23},{name:'MUTHANGA TOWN',x:-15,z:2},{name:'ST JUDE HOSPITAL',x:-73,z:4},{name:'WAYANAD SCHOOL',x:78,z:44},{name:'NATURE PARK',x:130,z:105}];
for(const st of busStops.slice(1)){const marker=new THREE.Group();marker.position.set(st.x,0,st.z);world.add(marker);cyl(marker,0,1.6,0,.12,.12,3.2,m.brass,8);box(marker,0,3.35,0,2.8,.9,.16,m.dark);label('BUS STOP',st.x,4.3,st.z,4.5,.8)}
const busHud=document.createElement('div');busHud.id='busHud';busHud.innerHTML='<div class="bus-head"><b>NIRVO TRANSIT</b><span>LINE 01 · MALABAR</span></div><div class="bus-speed"><strong id="busSpeed">0</strong><small>KM/H</small><em id="busGear">N</em></div><div class="bus-route" id="busRoute">NEXT: MUTHANGA TOWN</div><div class="bus-passengers" id="busPassengers">PASSENGERS 0 / 24</div><div class="bus-help">W / ▲ ACCELERATE · S / ▼ BRAKE / REVERSE · A D STEER · SPACE HANDBRAKE · E EXIT</div><div class="bus-progress"><i id="busProgress"></i></div>';document.querySelector('#app').appendChild(busHud);
const busEnter=document.createElement('button');busEnter.id='busEnter';busEnter.textContent='E  DRIVE BUS';document.querySelector('#app').appendChild(busEnter);
function toggleBus(){if(!driving){if(player.position.distanceTo(driveBus.position)>12)return;driving=true;busSpeed=0;busYaw=driveBus.rotation.y;player.visible=false;busEnter.style.display='none';busHud.classList.add('active');document.querySelector('#driveControls')?.classList.add('active')}else{driving=false;player.visible=true;player.position.set(driveBus.position.x+4,0,driveBus.position.z+2);busHud.classList.remove('active');document.querySelector('#driveControls')?.classList.remove('active')}}
busEnter.addEventListener('click',toggleBus);
function updateBus(dt){
 const throttle=keys.w||keys.arrowup,brake=keys.s||keys.arrowdown,steer=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 if(throttle)busSpeed=Math.min(24,busSpeed+7.5*dt);else if(brake){if(busSpeed>0)busSpeed=Math.max(0,busSpeed-14*dt);else busSpeed=Math.max(-7,busSpeed-4.5*dt)}else busSpeed*=Math.exp(-.72*dt);
 if(keys[' '])busSpeed*=Math.exp(-5*dt);
 busSteer=THREE.MathUtils.damp(busSteer,steer,5,dt);busYaw+=busSteer*.82*Math.min(1,Math.abs(busSpeed)/4)*dt*Math.sign(busSpeed||1);driveBus.rotation.y=busYaw;
 driveBus.position.x-=Math.sin(busYaw)*busSpeed*dt;driveBus.position.z-=Math.cos(busYaw)*busSpeed*dt;
 driveBus.position.x=THREE.MathUtils.clamp(driveBus.position.x,-205,205);driveBus.position.z=THREE.MathUtils.clamp(driveBus.position.z,-205,205);busDistance+=Math.abs(busSpeed)*dt;
 const kmh=Math.round(Math.abs(busSpeed)*3.6);document.querySelector('#busSpeed').textContent=kmh;document.querySelector('#busGear').textContent=busSpeed<-.1?'R':busSpeed>.1?'D':'N';
 const stop=busStops[nextStopIndex%busStops.length],distance=Math.hypot(stop.x-driveBus.position.x,stop.z-driveBus.position.z);
 if(distance<10&&Math.abs(busSpeed)<1){stopWait+=dt;if(stopWait>2.5){busPassengers=nextStopIndex===busStops.length-1?0:Math.min(24,busPassengers+4);nextStopIndex=(nextStopIndex+1)%busStops.length;stopWait=0}}
 else stopWait=0;
 document.querySelector('#busRoute').textContent='NEXT STOP: '+stop.name+' · '+Math.round(distance)+' M';
 document.querySelector('#busPassengers').textContent='PASSENGERS '+busPassengers+' / 24';
 document.querySelector('#busProgress').style.width=Math.min(100,busDistance/18)+'%';
}
addEventListener('keydown',e=>{if(typing(e))return;if(e.key.toLowerCase()==='e'&&!e.repeat&&(driving||player.position.distanceTo(driveBus.position)<12))toggleBus()});
document.querySelectorAll('[data-drive]').forEach(b=>{const k=b.dataset.drive,down=e=>{e.preventDefault();keys[k]=true},up=e=>{e.preventDefault();keys[k]=false};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up)});


/* ===== WORLD LIFE EXPANSION: enterable buildings, seating, beach & bus terminal ===== */
const extraHomes=[
 [-125,-35],[-145,-20],[-125,28],[-103,42],[-82,42],[-60,42],[-38,55],[-15,48],
 [5,-48],[24,-66],[45,-67],[66,-62],[88,-55],[108,-35],[118,-10],[112,28],
 [-155,5],[-150,42],[-128,62],[-105,68],[-80,70],[-55,70],[0,70],[18,100],
 [40,105],[65,112],[88,130],[105,150],[-5,165],[-35,150]
];
extraHomes.forEach((p,i)=>house(p[0],p[1],i+24));
// A proper coastal promenade and sandy recreation beach on the island's southern shore.
const beachSand=M('#d9c69b'),beachWood=M('#8b6241');
for(let i=0;i<7;i++){
 const x=-105+i*34,z=190+Math.sin(i*.8)*5;
 const umbrella=new THREE.Group();umbrella.position.set(x,0,z);world.add(umbrella);
 cyl(umbrella,0,1.35,0,.09,.09,2.7,beachWood,8);
 const canopy=new THREE.Mesh(new THREE.ConeGeometry(2.25,.75,12),M(i%2?'#e9eee1':'#d16b4f'));canopy.position.y=2.65;umbrella.add(canopy);
 const lounger=new THREE.Group();lounger.position.set(x+4,.15,z+3);world.add(lounger);
 box(lounger,0,.45,0,1.1,.18,2.5,M('#e8e1cf'));for(const sx of [-.42,.42])cyl(lounger,sx,.22,.0,.06,.06,.9,beachWood,6);
}
for(let i=0;i<12;i++){const x=-165+i*29,z=205+Math.sin(i*.7)*7;const palmGroup=new THREE.Group();palmGroup.position.set(x,0,z);world.add(palmGroup);cyl(palmGroup,0,3.2,0,.25,.3,6.4,m.trunk,8);for(let a=0;a<7;a++){const q=a*Math.PI*2/7;const leaf=new THREE.Mesh(new THREE.ConeGeometry(.45,4.8,5),m.leaf2);leaf.position.set(Math.cos(q)*1.5,6.2,Math.sin(q)*1.5);leaf.rotation.z=-Math.cos(q)*.7;leaf.rotation.x=Math.sin(q)*.7;palmGroup.add(leaf)}}
const beachCafe=new THREE.Group();beachCafe.position.set(135,0,185);world.add(beachCafe);box(beachCafe,0,1.6,0,12,3.2,7,M('#e4d5b8'));roof(beachCafe,13,8,3.2,M('#8e4c38'));label('BEACH CAFE',135,6,185,10,1.4);
label('MALABAR BEACH & PROMENADE',0,8,213,26,2);
// Bus stand improvements: bays, route board, sheltered waiting area and benches.
for(let i=0;i<5;i++){
 const x=10+i*9,z=78;
 box(world,x,.08,z,7,.12,24,M('#a6a49b'),false);
 for(const side of [-3.3,3.3]){cyl(world,x+side,1.8,z-6,.12,.12,3.6,m.wood,8);cyl(world,x+side,1.8,z+6,.12,.12,3.6,m.wood,8)}
 box(world,x,3.65,z,7.2,.28,25,M('#7e5540'));
 box(world,x,1.1,z-10,4,.22,1.2,beachWood);for(const sx of [-1.5,1.5])box(world,x+sx,1.45,z-10,.15,.65,.15,m.dark);
}
const routeBoard=new THREE.Group();routeBoard.position.set(28,0,65);world.add(routeBoard);box(routeBoard,0,3,0,8,5,.45,M('#1e493b'));box(routeBoard,0,3,.27,7.4,4.4,.08,M('#e5d8b8'));label('MALABAR BUS ROUTES',28,6.2,65,8,1.2);
for(let i=0;i<4;i++)box(world,8+i*8,.15,66,5,.3,1.4,beachWood);
// Add walkable interaction points for every residential and public building.
const buildingDoors=[];
const homeDoorPoints=extraHomes.concat([[-37,-27],[-55,-27],[-73,-27],[-91,-27],[-37,-48],[-55,-48],[-73,-48],[-91,-48],[25,-28],[43,-28],[61,-28],[79,-28],[25,-49],[43,-49],[61,-49],[79,-49],[-35,34],[-54,34],[24,34],[43,34]]);
homeDoorPoints.forEach((p,i)=>buildingDoors.push({name:'Kerala Home '+(i+1),x:p[0],z:p[1]+5.5,type:'home'}));
[
 ['Muthanga Police Station',-15,10,'police'],['St Jude Medical Centre',-73,14,'hospital'],
 ['Muthanga Bus Stand',28,88,'terminal'],['Panchayat Office',77,12,'office'],
 ['Government School',78,52,'school'],['Post Office',-105,11,'office'],
 ['St Jude Church',-130,-36,'church'],['Juma Masjid',35,25,'mosque'],
 ['Devi Temple',-34,-57,'temple'],['Ayurveda Campus',42,141,'clinic'],
 ['Fish Auction Hall',176,-52,'market'],['Coir Rope Store',197,-52,'shop'],
 ['Beach Cafe',135,190,'shop'],['Eco Study Centre',155,117,'office']
].forEach(([name,x,z,type])=>buildingDoors.push({name,x,z,type}));
const interior=new THREE.Group();interior.position.set(1000,0,0);scene.add(interior);let insideBuilding=null,sitting=false;
function makeInterior(type,name){
 while(interior.children.length)interior.remove(interior.children[0]);
 const wall=M('#e5dac3'),floor=M('#a87958'),wood=M('#714a32'),glass=M('#76aeb6',.2),green=M('#386d50');
 box(interior,0,-.15,0,22,.3,18,floor);box(interior,0,2.2,-9,22,4.4,.3,wall);box(interior,-11,2.2,0,.3,4.4,18,wall);box(interior,11,2.2,0,.3,4.4,18,wall);
 box(interior,0,4.4,0,22,.25,18,M('#5d4434'));
 // Windows, ceiling lights and an entrance portal.
 for(const x of [-7,0,7]){box(interior,x,2.7,-8.78,2.5,1.5,.08,glass);box(interior,x,2.7,-8.68,.08,1.6,.08,wood)}
 for(const x of [-6,0,6]){const light=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),M('#f6d994',.3));light.position.set(x,4,0);interior.add(light)}
 box(interior,0,1.25,8.8,2.5,2.5,.15,wood);label('EXIT  [F]',0,3.3,8.55,3,0.65);
 const furn=(x,z,w,h,d,material=wood)=>box(interior,x,h/2,z,w,h,d,material);
 if(type==='home'){
  furn(-5,-5,5,1,1.4);furn(-5,-5.8,5,1.8,.3);furn(5,-5,4,1,5);furn(5,-5,3.4,.3,4,M('#bd5360'));
  furn(-5,0,2.8,.7,1.5);furn(0,3,3,.9,2);furn(7,2,1.5,2,1.5,wall);
  furn(-8,3,1.2,2.5,2,wood);label('POOJA ROOM',-7,3.4,3,3,0.6);
  label('LIVING · DINING · BEDROOM · KITCHEN',0,4.9,-8,13,.7);
 }else if(type==='police'){
  furn(-5,-5,5,1.1,2);furn(-5,-6,5,1.5,.25);furn(5,-4,5,.3,5,M('#92938a'));
  for(let i=0;i<7;i++)cyl(interior,3+i*.55,1.5,-6,.055,.055,3,M('#555b56'),6);
  label('SUB INSPECTOR OFFICE',-5,3,-4,6,.7);label('LOCK-UP',5,3,-4,3,.7);
 }else if(type==='hospital'||type==='clinic'){
  furn(-6,-5,4,.8,2,wall);furn(0,-5,4,.8,2,wall);furn(6,-5,4,.8,2,wall);
  for(let x of [-6,0,6]){furn(x,-5,2,.18,1.4,glass);furn(x,1,2,1.2,2,green)}
  furn(0,4,8,1.2,1.5,green);label('RECEPTION · PATIENT WARDS',0,3.8,4,10,.8);
 }else if(type==='school'){
  furn(0,-6,10,2,.25,green);label('CLASSROOM · BLACKBOARD',0,3,-5,8,.8);
  for(let z of [-2,1,4])for(let x of [-5,5]){furn(x,z,3,.7,1.2);furn(x,z+.65,3,.7,.2,wall)}
 }else if(type==='terminal'){
  furn(-6,-4,5,.8,1.4);furn(0,-4,5,.8,1.4);furn(6,-4,5,.8,1.4);label('TICKET COUNTER',0,3,-7,6,.8);
  for(let x of [-7,0,7])furn(x,3,5,.35,1.1,green);
 }else if(type==='church'||type==='mosque'||type==='temple'){
  for(let x of [-6,-3,0,3,6])furn(x,1,1.2,.65,4,wood);
  furn(0,-6,5,1,1.2,M('#c5a66c'));label('PRAYER HALL',0,3,-6,7,.8);
 }else if(type==='market'||type==='shop'){
  for(let x of [-7,-2,3,7]){furn(x,-3,2.8,1.2,2,wood);furn(x,-3,1.1,1.7,1.1,M('#d4b36b'))}
  label('COUNTER · LOCAL GOODS',0,3,-7,9,.8);
 }else{
  furn(-5,-4,4,1,2);furn(4,-4,4,1,2);furn(0,3,8,1.1,1.5,green);label('PUBLIC SERVICE COUNTER',0,3,3,9,.8);
 }
}
function interactWorld(){
 if(driving){toggleBus();return}
 if(insideBuilding){insideBuilding=null;world.visible=true;interior.visible=false;player.position.set(insideBuildingExit.x,0,insideBuildingExit.z);return}
 const pos=player.position;
 let best=null,bd=8;
 for(const d of buildingDoors){const dist=Math.hypot(pos.x-d.x,pos.z-d.z);if(dist<bd){bd=dist;best=d}}
 if(best){insideBuilding=best;insideBuildingExit={x:pos.x,z:pos.z+3};makeInterior(best.type,best.name);world.visible=false;interior.visible=true;player.position.set(1000,0,4);toastWorld('Entered '+best.name);return}
 if(Math.hypot(pos.x-28,pos.z-65)<5){sitting=!sitting;toastWorld(sitting?'Taking a seat':'Standing up');return}
}
let insideBuildingExit={x:0,z:0};
function toastWorld(message){const el=document.querySelector('#worldToast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
const actionHint=document.createElement('div');actionHint.id='worldToast';actionHint.className='world-toast';document.querySelector('#app').appendChild(actionHint);
const actionButton=document.createElement('button');actionButton.id='worldAction';actionButton.textContent='F  INTERACT';document.querySelector('#app').appendChild(actionButton);actionButton.addEventListener('click',interactWorld);
addEventListener('keydown',e=>{if(typing(e))return;if(e.key.toLowerCase()==='f'&&!e.repeat){interactWorld()}});

// Detailed articulated player model — role outfit, face, hair, footwear and accessories.
const player=new THREE.Group();scene.add(player);
let skin,shirt,pants,activeRole='Explorer',activeGender='Male';
const avatarParts=new THREE.Group();player.add(avatarParts);
const mat=(c,r=.82,metal=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:metal});
function part(parent,geo,material,x,y,z,sx=1,sy=1,sz=1){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function buildAvatar(role='Explorer',gender='Male'){
 while(avatarParts.children.length)avatarParts.remove(avatarParts.children[0]);
 activeRole=role;activeGender=gender;
 const looks={
  Explorer:{top:'#315d4d',bottom:'#303b49',shoe:'#242a29',accent:'#c8a45e',outer:null},
  Driver:{top:'#c5a36b',bottom:'#544b38',shoe:'#272b29',accent:'#344d3f',outer:null},
  Doctor:{top:'#e9eee8',bottom:'#315b60',shoe:'#f0eee5',accent:'#4d9a9a',outer:'#4d9a9a'},
  Police:{top:'#b9a16f',bottom:'#494538',shoe:'#252824',accent:'#263f35',outer:null},
  Student:{top:'#e8e4d7',bottom:'#344b63',shoe:'#282b2d',accent:'#a84a3b',outer:null},
  Farmer:{top:'#6d8b4d',bottom:'#574537',shoe:'#3a3028',accent:'#c6a45f',outer:null},
  Shopkeeper:{top:'#8a6548',bottom:'#303b49',shoe:'#272b29',accent:'#c69b56',outer:null}
 }[role]||{top:'#315d4d',bottom:'#303b49',shoe:'#242a29',accent:'#c8a45e'};
 const skinMat=mat('#a96f51'),hairMat=mat(gender==='Female'?'#171615':'#24201c'),topMat=mat(looks.top),bottomMat=mat(looks.bottom),shoeMat=mat(looks.shoe),accentMat=mat(looks.accent,.45,.2);
 const bodyGeo=new THREE.CapsuleGeometry(.31,.72,8,14);
 part(avatarParts,bodyGeo,topMat,0,1.42,0,1.13,1.05,.72);
 part(avatarParts,new THREE.CylinderGeometry(.29,.36,.27,16),topMat,0,1.03,0,1,1,.78);
 part(avatarParts,new THREE.SphereGeometry(.25,16,12),skinMat,0,2.27,0,1,1.1,.94);
 // ears, nose, eyes and brows give the face a readable human silhouette.
 for(const side of [-1,1]){
  part(avatarParts,new THREE.SphereGeometry(.07,10,8),skinMat,side*.245,2.27,0,1,.9,.75);
  part(avatarParts,new THREE.SphereGeometry(.035,10,8),mat('#241f1d'),side*.092,2.31,-.218,1,1,.55);
  part(avatarParts,new THREE.CapsuleGeometry(.018,.075,3,6),hairMat,side*.09,2.39,-.218,1,1,.7);
 }
 part(avatarParts,new THREE.ConeGeometry(.055,.13,8),skinMat,0,2.24,-.25,1,1,1).rotation.x=-Math.PI/2;
 part(avatarParts,new THREE.SphereGeometry(.265,16,10,0,Math.PI*2,0,Math.PI*.56),hairMat,0,2.42,.015,1,1,.98);
 if(gender==='Female'){
  part(avatarParts,new THREE.SphereGeometry(.22,12,10),hairMat,0,2.22,.13,1,1.4,1);
  part(avatarParts,new THREE.SphereGeometry(.09,10,8),hairMat,-.24,2.22,.08,1,1.5,1);
  part(avatarParts,new THREE.SphereGeometry(.09,10,8),hairMat,.24,2.22,.08,1,1.5,1);
 }
 // Shirt collar, placket and buttons.
 part(avatarParts,new THREE.CylinderGeometry(.09,.13,.14,10),mat('#e7ddc7'),0,1.91,-.015,1,1,.8);
 for(let y=1.63;y>1.18;y-=.13)part(avatarParts,new THREE.SphereGeometry(.025,8,6),accentMat,0,y,-.226);
 // Legs, knees, arms, hands and shoes are separate pieces for a less blocky silhouette.
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.145,.99,0);avatarParts.add(leg);
  part(leg,new THREE.CapsuleGeometry(.105,.48,6,10),bottomMat,0,-.27,0,1,1,.92);
  part(leg,new THREE.SphereGeometry(.105,10,8),bottomMat,0,-.48,-.005,1,1,.95);
  part(leg,new THREE.CapsuleGeometry(.105,.15,4,8),shoeMat,0,-.61,-.075,1,.55,1.45);
  limbs.push(leg);
  const arm=new THREE.Group();arm.position.set(side*.34,1.72,0);avatarParts.add(arm);
  part(arm,new THREE.CapsuleGeometry(.105,.38,6,10),topMat,0,-.2,0,1,1,.95);
  part(arm,new THREE.CapsuleGeometry(.075,.25,5,8),skinMat,0,-.52,-.005);
  part(arm,new THREE.SphereGeometry(.09,10,8),skinMat,0,-.67,-.005);
  limbs.push(arm);
 }
 // Role-specific accessories.
 if(role==='Doctor'){
  part(avatarParts,new THREE.CapsuleGeometry(.33,.72,5,10),mat('#f7f7f0'),0,1.43,.13,1.02,1.02,.25);
  part(avatarParts,new THREE.CylinderGeometry(.018,.018,.5,8),accentMat,0,1.45,-.245);
  part(avatarParts,new THREE.BoxGeometry(.18,.22,.035),mat('#3b9a9a'),.21,1.63,-.245);
  const scope=part(avatarParts,new THREE.TorusGeometry(.13,.025,8,18,Math.PI),mat('#b8c7c5',.3,.65),.25,1.83,-.16);scope.rotation.z=Math.PI;
 }else if(role==='Police'){
  part(avatarParts,new THREE.CylinderGeometry(.24,.24,.09,16),mat('#263d33'),0,2.62,0);
  part(avatarParts,new THREE.CylinderGeometry(.18,.22,.18,16),mat('#263d33'),0,2.72,0);
  part(avatarParts,new THREE.BoxGeometry(.22,.1,.035),accentMat,0,2.7,-.21);
  part(avatarParts,new THREE.BoxGeometry(.14,.16,.035),accentMat,.2,1.63,-.245);
 }else if(role==='Driver'){
  part(avatarParts,new THREE.CylinderGeometry(.25,.27,.08,16),mat('#c3a36b'),0,2.62,0);
  part(avatarParts,new THREE.CylinderGeometry(.2,.23,.16,16),mat('#c3a36b'),0,2.72,0);
  part(avatarParts,new THREE.BoxGeometry(.18,.18,.035),accentMat,.2,1.62,-.245);
 }else if(role==='Student'){
  part(avatarParts,new THREE.BoxGeometry(.37,.23,.09),mat('#263e62'),0,1.43,.25);
  part(avatarParts,new THREE.BoxGeometry(.27,.3,.12),mat('#8b563b'),0,1.45,.32);
 }else if(role==='Farmer'){
  part(avatarParts,new THREE.CylinderGeometry(.31,.31,.07,16),mat('#9c7541'),0,2.59,0);
  part(avatarParts,new THREE.CylinderGeometry(.2,.23,.12,16),mat('#9c7541'),0,2.65,0);
  part(avatarParts,new THREE.CylinderGeometry(.055,.055,.36,8),mat('#b98b55'),-.4,1.15,-.08);
 }else if(role==='Shopkeeper'){
  part(avatarParts,new THREE.BoxGeometry(.2,.2,.04),accentMat,.21,1.63,-.245);
 }
 // A subtle belt and cuff details finish the uniform.
 part(avatarParts,new THREE.CylinderGeometry(.32,.32,.075,16),accentMat,0,1.08,0,1,1,.78);
 for(const side of [-1,1])part(avatarParts,new THREE.TorusGeometry(.105,.018,6,12),accentMat,side*.145,.92,0);
 avatarParts.userData.limbs=limbs;
 avatarParts.userData.walkPhase=0;
}
buildAvatar();
player.position.set(0,0,24);
const keys={};
let yaw=0,pitch=.16,drag=false,px=0,py=0;
const setKey=(key,value)=>{keys[key.toLowerCase()]=value};
addEventListener('keydown',e=>{if(typing(e))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(k)){setKey(k,true);e.preventDefault()}});
addEventListener('keyup',e=>setKey(e.key,false));
addEventListener('blur',()=>{for(const k of Object.keys(keys))keys[k]=false;drag=false});
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag=true;px=e.clientX;py=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointerup',()=>drag=false);
renderer.domElement.addEventListener('pointercancel',()=>drag=false);
renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-px,dy=e.clientY-py;yaw-=dx*.0032;pitch=THREE.MathUtils.clamp(pitch+dy*.0017,-.12,.48);px=e.clientX;py=e.clientY});
const mobileKeyMap={up:'w',down:'s',left:'a',right:'d'};
document.querySelectorAll('[data-key]').forEach(b=>{
 const k=mobileKeyMap[b.dataset.key];if(!k)return;
 const press=e=>{e.preventDefault();setKey(k,true);b.setPointerCapture?.(e.pointerId)};
 const release=e=>{e.preventDefault();setKey(k,false)};
 b.addEventListener('pointerdown',press);b.addEventListener('pointerup',release);
 b.addEventListener('pointerleave',release);b.addEventListener('pointercancel',release);
});

// ===== PHASE 4: LIVING MALABAR STREETS =====
// Lightweight animated pedestrians add scale and life without heavy external assets.
const pedestrians=[];
function createPedestrian(x,z,shirtColor,trouserColor,route){
 const root=new THREE.Group();root.position.set(x,0,z);world.add(root);
 const shirtMat=mat(shirtColor),trouserMat=mat(trouserColor),skinMat=mat('#a96f51'),hairMat=mat('#24201c'),shoeMat=mat('#292b2a');
 const torso=part(root,new THREE.CapsuleGeometry(.25,.58,6,10),shirtMat,0,1.28,0,1,.98,.78);
 part(root,new THREE.SphereGeometry(.19,14,12),skinMat,0,2.02,0,1,1.08,.92);
 part(root,new THREE.SphereGeometry(.195,14,10,0,Math.PI*2,0,Math.PI*.55),hairMat,0,2.14,.025);
 const limbs=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.position.set(side*.12,.91,0);root.add(leg);
  part(leg,new THREE.CapsuleGeometry(.075,.39,5,8),trouserMat,0,-.25,0,1,1,.95);
  part(leg,new THREE.CapsuleGeometry(.075,.13,4,8),shoeMat,0,-.5,-.045,1,.55,1.35);
  limbs.push(leg);
  const arm=new THREE.Group();arm.position.set(side*.27,1.55,0);root.add(arm);
  part(arm,new THREE.CapsuleGeometry(.075,.34,5,8),shirtMat,0,-.19,0,1,1,.9);
  part(arm,new THREE.SphereGeometry(.065,8,6),skinMat,0,-.43,-.01);
  limbs.push(arm);
 }
 pedestrians.push({root,limbs,route,index:1,phase:Math.random()*6.28,speed:1.05+Math.random()*.35});
}
createPedestrian(-27,-14,'#b94e3f','#35465a',[[-27,-14],[-14,-14],[-14,-9],[-27,-9]]);
createPedestrian(-4,-16,'#e2c47d','#4d493d',[[-4,-16],[9,-16],[9,-10],[-4,-10]]);
createPedestrian(20,-14,'#477d69','#333d4a',[[20,-14],[34,-14],[34,-8],[20,-8]]);
createPedestrian(42,-14,'#5477a1','#55473b',[[42,-14],[56,-14],[56,-8],[42,-8]]);
createPedestrian(8,66,'#c66d48','#394c63',[[8,66],[19,66],[19,72],[8,72]]);
createPedestrian(-89,18,'#e0d7c4','#3d5149',[[-89,18],[-79,18],[-79,23],[-89,23]]);
function updatePedestrians(dt){
 if(!world.visible)return;
 for(const npc of pedestrians){
  const targetPoint=npc.route[npc.index],dx=targetPoint[0]-npc.root.position.x,dz=targetPoint[1]-npc.root.position.z;
  const distance=Math.hypot(dx,dz);
  if(distance<.45){npc.index=(npc.index+1)%npc.route.length;continue}
  const step=Math.min(distance,npc.speed*dt);
  npc.root.position.x+=dx/distance*step;npc.root.position.z+=dz/distance*step;
  npc.root.rotation.y=Math.atan2(-dx,-dz);
  npc.phase+=dt*8;
  const swing=Math.sin(npc.phase)*.48;
  npc.limbs[0].rotation.x=swing;npc.limbs[2].rotation.x=-swing;
  npc.limbs[1].rotation.x=-swing*.7;npc.limbs[3].rotation.x=swing*.7;
  npc.root.position.y=Math.abs(Math.sin(npc.phase*2))*.025;
 }
}

const clock=new THREE.Clock(),target=new THREE.Vector3(),velocity=new THREE.Vector3(),moveDir=new THREE.Vector3(),rightDir=new THREE.Vector3(),desired=new THREE.Vector3();
let facing=Math.PI;
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);
 if(driving){updateBus(dt);desired.set(driveBus.position.x+Math.sin(busYaw)*15,7.2+pitch*8,driveBus.position.z+Math.cos(busYaw)*15);camera.position.lerp(desired,1-Math.exp(3.2*dt));target.set(driveBus.position.x,2.1,driveBus.position.z);camera.lookAt(target)}
 else if(insideBuilding){
  const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
  moveDir.set(-Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward-Math.sin(yaw)*side);
  if(moveDir.lengthSq()>1)moveDir.normalize();
  const roomSpeed=keys.shift?6.2:3.8,roomVelocity=moveDir.multiplyScalar(roomSpeed);
  velocity.lerp(roomVelocity,1-Math.exp(((forward||side)?12:15)*dt));
  player.position.addScaledVector(velocity,dt);
  player.position.x=THREE.MathUtils.clamp(player.position.x,991.7,1008.3);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-7.2,7.4);
  player.position.y=0;
  if(velocity.lengthSq()>.04){const wanted=Math.atan2(-velocity.x,-velocity.z);let diff=((wanted-facing+Math.PI*3)%(Math.PI*2))-Math.PI;facing+=diff*(1-Math.exp(14*dt));player.rotation.y=facing}
  desired.set(player.position.x+Math.sin(yaw)*8,3.7+pitch*6,player.position.z+Math.cos(yaw)*8);
  camera.position.lerp(desired,1-Math.exp(6*dt));target.set(player.position.x,1.35,player.position.z);camera.lookAt(target);
 }
 else if(sitting){velocity.multiplyScalar(Math.exp(-12*dt));player.position.y=0;desired.set(player.position.x+Math.sin(yaw)*8,3.3+pitch*5,player.position.z+Math.cos(yaw)*8);camera.position.lerp(desired,1-Math.exp(5.5*dt));target.set(player.position.x,1,player.position.z);camera.lookAt(target)}
 else if(!insideBuilding&&!sitting){let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0),side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);moveDir.set(-Math.sin(yaw)*forward+Math.cos(yaw)*side,0,-Math.cos(yaw)*forward-Math.sin(yaw)*side);if(moveDir.lengthSq()>1)moveDir.normalize();const desiredVelocity=moveDir.multiplyScalar(keys.shift?10.5:5.8);velocity.lerp(desiredVelocity,1-Math.exp(((forward||side)?10:13)*dt));player.position.addScaledVector(velocity,dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-205,205);player.position.z=THREE.MathUtils.clamp(player.position.z,-205,205);if(velocity.lengthSq()>.06){const wanted=Math.atan2(-velocity.x,-velocity.z);let diff=((wanted-facing+Math.PI*3)%(Math.PI*2))-Math.PI;facing+=diff*(1-Math.exp(14*dt));player.rotation.y=facing}desired.set(player.position.x+Math.sin(yaw)*10,4.1+pitch*7,player.position.z+Math.cos(yaw)*10);camera.position.lerp(desired,1-Math.exp(5.5*dt));target.set(player.position.x,1.35,player.position.z);camera.lookAt(target);busEnter.style.display=player.position.distanceTo(driveBus.position)<12?'block':'none'}
 const gaitSpeed=THREE.MathUtils.clamp(velocity.length()/7,0,1);
 avatarParts.userData.walkPhase=(avatarParts.userData.walkPhase||0)+dt*(5+gaitSpeed*10);
 const phase=avatarParts.userData.walkPhase,limbs=avatarParts.userData.limbs||[],swing=Math.sin(phase)*.62*gaitSpeed;
 if(limbs.length>=4){
  limbs[0].rotation.x=swing;limbs[2].rotation.x=-swing;
  limbs[1].rotation.x=-swing*.72;limbs[3].rotation.x=swing*.72;
 }
 avatarParts.position.y=gaitSpeed>.05?Math.abs(Math.sin(phase*2))*.045*gaitSpeed:THREE.MathUtils.damp(avatarParts.position.y,0,12,dt);
 updatePedestrians(dt);
 renderer.render(scene,camera);
}
animate();
setTimeout(()=>{if(!startupFailed){document.querySelector('#loading')?.classList.add('hide');document.querySelector('#characterSetup')?.classList.add('show')}},1800);
const roleStarts={Explorer:{x:0,z:24,area:'Muthanga Village'},Driver:{x:28,z:83,area:'Muthanga Bus Stand'},Doctor:{x:-73,z:18,area:'St Jude Medical Centre'},Police:{x:-15,z:14,area:'Muthanga Police Station'},Student:{x:78,z:57,area:'Government School'},Farmer:{x:-145,z:92,area:'Kuttanad Farm Fields'},Shopkeeper:{x:53,z:-28,area:'Malabar Market Street'}};
function refreshCharacterChoice(){const role=document.querySelector('#playerRole')?.value||'Explorer';const gender=document.querySelector('#playerGender')?.value||'Male';buildAvatar(role,gender);const start=roleStarts[role]||roleStarts.Explorer;const area=document.querySelector('#roleStartArea');if(area)area.textContent='STARTING AREA  ·  '+start.area;const detail=document.querySelector('#roleDescription');if(detail)detail.textContent=({Explorer:'Explore the island and discover hidden places.',Driver:'Begin at the bus depot with the Malabar Express nearby.',Doctor:'Start outside the hospital campus in your medical uniform.',Police:'Start at the police station and patrol the village.',Student:'Begin at the school campus in student uniform.',Farmer:'Start beside the paddy fields and farm lanes.',Shopkeeper:'Begin on the market street among local shops.'})[role]||''}
document.querySelector('#playerRole')?.addEventListener('change',refreshCharacterChoice);
document.querySelector('#playerGender')?.addEventListener('change',refreshCharacterChoice);
document.querySelector('#startGame')?.addEventListener('click',()=>{const nickname=(document.querySelector('#playerNickname')?.value||'').trim()||'Traveller';const role=document.querySelector('#playerRole')?.value||'Explorer';const gender=document.querySelector('#playerGender')?.value||'Male';const start=roleStarts[role]||roleStarts.Explorer;buildAvatar(role,gender);player.position.set(start.x,0,start.z);player.visible=true;facing=Math.PI;camera.position.set(start.x,5.2,start.z+10);yaw=0;pitch=.16;document.querySelector('#characterSetup')?.classList.remove('show');toastWorld(nickname+' · '+role+' · '+start.area);if(role==='Driver')toastWorld('Driver shift starts at Muthanga Bus Stand');});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.25))});
