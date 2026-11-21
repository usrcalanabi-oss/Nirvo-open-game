import * as THREE from 'three';
import './style.css';

const mount = document.querySelector('#world');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc4cf);
scene.fog = new THREE.Fog(0x9bc4cf, 105, 285);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 650);
camera.position.set(0, 9, 15);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
mount.appendChild(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xdaf3ff, 0x536b45, 2.05);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d7, 3.1);
sun.position.set(-65, 95, 55);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -130; sun.shadow.camera.right = 130;
sun.shadow.camera.top = 130; sun.shadow.camera.bottom = -130;
sun.shadow.bias = -0.00018;
scene.add(sun);

const mat = (color, roughness=0.9) => new THREE.MeshStandardMaterial({color, roughness});
const materials = {
 grass:mat(0x6e9a58), grass2:mat(0x85a968), road:mat(0x303b3c), roadEdge:mat(0x777e73),
 line:mat(0xe9dfb7), wall:mat(0xe8d7b7), white:mat(0xe9e9dc), red:mat(0xa94e3d),
 roof:mat(0x914f3b), roof2:mat(0x5b6257), glass: new THREE.MeshStandardMaterial({color:0x8fc5ce,roughness:.25,metalness:.1}),
 wood:mat(0x79513a), dark:mat(0x28312d), water: new THREE.MeshStandardMaterial({color:0x3b9eaa,roughness:.28,metalness:.18}),
 leaf:mat(0x39734b), trunk:mat(0x79593a), sand:mat(0xcab98b), concrete:mat(0xb5b4a5)
};
const ground = new THREE.Mesh(new THREE.PlaneGeometry(360,360), materials.grass);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
const world = new THREE.Group(); scene.add(world);

function box(parent,x,y,z,w,h,d,material,cast=true){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;
}
function cylinder(parent,x,y,z,r1,r2,h,material,segments=8){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function label(text,x,z,color='#f6f4e9',size=24){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
 ctx.fillStyle='rgba(5,16,17,.72)';ctx.fillRect(0,0,512,128);ctx.strokeStyle='rgba(220,240,220,.45)';ctx.strokeRect(3,3,506,122);
 ctx.font='700 '+size+'px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,256,65);
 const tex=new THREE.CanvasTexture(c);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(12,3),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
 mesh.position.set(x,5.1,z);mesh.rotation.x=-.18;world.add(mesh);
}
function road(x,z,w,d,rotation=0){
 const g=new THREE.Group();g.position.set(x,.035,z);g.rotation.y=rotation;world.add(g);
 box(g,0,0,0,w,.12,d,materials.road,false);
 if(w>d){for(let a=-w/2+4;a<w/2-2;a+=9)box(g,a,.07,0,3,.018,.13,materials.line,false);}
 else{for(let a=-d/2+4;a<d/2-2;a+=9)box(g,0,.07,a,.13,.018,3,materials.line,false);}
 return g;
}
// Main town roads and junctions
road(0,0,250,13);road(0,0,13,250);road(-65,0,11,178);road(65,0,11,178);road(0,-65,178,11);road(0,65,178,11);
road(-105,0,9,135);road(105,0,9,135);road(0,-105,135,9);road(0,105,135,9);
// Sidewalk strips beside main roads
for(const z of [-8.2,8.2])box(world,0,.025,z,250,.08,.75,materials.concrete,false);
for(const x of [-8.2,8.2])box(world,x,.025,0,.75,.08,250,materials.concrete,false);

// Kerala-style houses: 20 distinct homes, intentionally unnamed
const houseColors=[0xe8d7b7,0xd8e5d8,0xe5c9a7,0xd9d5c6,0xe4d2cf,0xc9d9dc,0xe7e0c6];
function makeHouse(x,z,index){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 const w=8.2+(index%3)*.55,d=7.2+(index%2)*.6,h=3.3+(index%4)*.12;
 box(g,0,h/2,0,w,h,d,mat(houseColors[index%houseColors.length]));
 // sloping tiled roof
 const roofMat=index%3===0?materials.roof:materials.roof2;
 const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.76,2.5,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=h+1.05;roof.scale.z=d/w;roof.castShadow=true;g.add(roof);
 box(g,0,.13,d/2+.28,w+.55,.22,.65,materials.concrete);
 // front door and windows
 box(g,-.25,1.05,d/2+.055,1.05,2.1,.12,materials.wood);
 for(const wx of [-2.7,2.25]){
  box(g,wx,2.05,d/2+.07,1.15,1.05,.12,materials.glass);
  box(g,wx,2.05,d/2+.15,.09,1.13,.08,materials.white,false);
  box(g,wx,2.05,d/2+.15,1.2,.08,.08,materials.white,false);
 }
 // small veranda pillars
 for(const px of [-3.1,3.1])cylinder(g,px,1.45,d/2+.48,.12,.12,2.8,materials.white,8);
 // little yard / compound boundary
 box(g,0,.18,-d/2-1,w+3,.35,.22,materials.white,false);
 return g;
}
const houseSpots=[
 [-28,-28],[-48,-28],[-68,-28],[-88,-28],[-28,-49],[-48,-49],[-68,-49],[-88,-49],
 [28,-28],[48,-28],[68,-28],[88,-28],[28,-49],[48,-49],[68,-49],[88,-49],
 [-28,28],[-48,28],[28,28],[48,28]
];
houseSpots.forEach(([x,z],i)=>makeHouse(x,z,i));

// Coconut palms and lush tropical foliage
function palm(x,z,scale=1){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 const trunk=cylinder(g,0,3.1*scale,0,.24*scale,.34*scale,6.2*scale,materials.trunk,7);trunk.rotation.z=-.08;
 const crownY=6.2*scale;
 for(let i=0;i<9;i++){
  const a=i*Math.PI*2/9;
  const leaf=new THREE.Mesh(new THREE.ConeGeometry(.48*scale,4.7*scale,5),materials.leaf);
  leaf.position.set(Math.cos(a)*1.55*scale,crownY-.45*scale,Math.sin(a)*1.55*scale);
  leaf.rotation.z=-Math.cos(a)*.72;leaf.rotation.x=Math.sin(a)*.72;leaf.rotation.y=-a;leaf.castShadow=true;g.add(leaf);
 }
 cylinder(g,0,crownY-.2*scale,0,.4*scale,.4*scale,.8*scale,mat(0x5e8a45),8);
}
for(let i=0;i<70;i++){
 const x=((i*37)%300)-150,z=((i*61)%300)-150;
 if(Math.abs(x)<105&&Math.abs(z)<105)continue;
 palm(x,z,.72+(i%4)*.13);
}
// Trees lining residential roads
for(let x=-118;x<=118;x+=18){palm(x,-15,.72);palm(x,15,.72);}
for(let z=-118;z<=118;z+=18){palm(-15,z,.72);palm(15,z,.72);}

// Town buildings and public spaces
function civicBuilding(x,z,w,d,h,wall,roof,labelText,accent=0x9c493a){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 box(g,0,h/2,0,w,h,d,mat(wall));
 box(g,0,h+.12,0,w+1,.35,d+1,mat(accent));
 const roofMesh=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.75,2.7,4),mat(roof));roofMesh.rotation.y=Math.PI/4;roofMesh.position.y=h+1.6;roofMesh.scale.z=d/w;roofMesh.castShadow=true;g.add(roofMesh);
 box(g,0,1.25,d/2+.08,1.5,2.5,.15,materials.wood);
 for(let px of [-w*.28,w*.28])box(g,px,2.4,d/2+.09,1.3,1.15,.13,materials.glass);
 // covered front porch
 box(g,0,3.1,d/2+1.1,w*.7,.2,2,mat(0xe6dfce));
 for(let px of [-w*.3,w*.3])cylinder(g,px,1.55,d/2+1.7,.12,.12,3.1,materials.white,8);
 label(labelText,x,z, '#ffffff',22);
 return g;
}
civicBuilding(-34,5,19,15,6,0xe4e1d4,0x9a5141,'GOVT. HOSPITAL',0x3c7775);
civicBuilding(34,5,18,15,6,0xe0d9c5,0x6e5141,'POLICE STATION',0x354f66);
civicBuilding(-34,91,22,17,6,0xe7d7b7,0x9b5d3f,'BUS STAND',0x3c6870);
civicBuilding(35,91,21,16,5,0xe9dfc7,0x765a48,'LOCAL MARKET',0x8d583b);
civicBuilding(-92,35,19,16,5,0xe8dfc9,0x8e5843,'GOVT. SCHOOL',0x497b75);
civicBuilding(92,35,17,15,5,0xe8e0ce,0x79563d,'FISH MARKET',0x397c86);
civicBuilding(-92,-82,17,15,5,0xe4d6bb,0x9a5b3f,'COMMUNITY HALL',0x80694a);

// Bus bays, buses and stops
for(let i=0;i<3;i++){
 box(world,-43+i*9,.16,104,7,.32,13,materials.concrete,false);
 box(world,-43+i*9,1.65,104,5.8,2.7,8,mat(i===1?0x3d7881:0xd6a94f));
 box(world,-43+i*9,2.15,99.9,4.3,.95,.1,materials.glass,false);
 for(let wx of [-2,2])cylinder(world,-43+i*9+wx,.55,100,.48,.48,.65,materials.dark,10);
}
for(const [x,z] of [[-15,40],[15,-40],[-105,0],[105,0]]){
 box(world,x,1.5,z,2.8,3,.28,materials.dark);
 box(world,x,3.2,z,3.3,.22,.45,materials.roof);
}

// Places of worship (distinct silhouettes, modest and respectful)
function temple(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 box(g,0,2,0,15,4,13,mat(0xe2c99a));
 const roof=new THREE.Mesh(new THREE.ConeGeometry(10,5,4),mat(0x9c5939));roof.rotation.y=Math.PI/4;roof.position.y=6.2;g.add(roof);
 const tower=cylinder(g,0,9,0,2.6,1.5,6,mat(0xb98a52),8);
 for(let y=7;y<12;y+=1.2)cylinder(g,0,y,0,2.8-(y-7)*.18,2.8-(y-7)*.18,.18,mat(0xc79b5e),8);
 label('TEMPLE',x,z,'#fff4dc',20);
}
function church(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 box(g,0,2.1,0,15,4.2,12,mat(0xf0e8d9));
 const roof=new THREE.Mesh(new THREE.ConeGeometry(10,4,4),mat(0x7e5544));roof.rotation.y=Math.PI/4;roof.position.y=5.5;g.add(roof);
 box(g,0,7.5,5.7,2.1,8,.9,mat(0xe8dfcf));cylinder(g,0,12,5.7,.18,.18,2.8,mat(0xb48d4c),6);
 label('CHURCH',x,z,'#fff4dc',20);
}
function mosque(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 box(g,0,2,0,15,4,12,mat(0xe4e5d9));
 const dome=new THREE.Mesh(new THREE.SphereGeometry(4,16,10,0,Math.PI*2,0,Math.PI/2),mat(0x5c9b83));dome.position.y=4;g.add(dome);
 for(const px of [-6,6]){cylinder(g,px,5,0,.55,.8,10,mat(0xe6e2d4),10);cylinder(g,px,10.4,0,.85,.35,1.1,mat(0x5c9b83),10);}
 label('MOSQUE',x,z,'#fff4dc',20);
}
temple(-112,-35);church(112,-35);mosque(112,-88);

// River and bridge on the eastern edge
const river=new THREE.Mesh(new THREE.PlaneGeometry(23,260),materials.water);river.rotation.x=-Math.PI/2;river.position.set(145,.045,0);river.receiveShadow=true;world.add(river);
for(let z=-125;z<125;z+=13){const ripple=box(world,145,.07,z,10,.015,.12,mat(0x8ad0cf),false);ripple.rotation.y=.08;}
box(world,145,1,0,29,.65,12,materials.concrete);
for(let x of [133,157])for(let z of [-5,5])box(world,x,1.6,z,.65,1.2,.65,materials.dark);

// Fishing jetty and small boats
box(world,127,.22,70,17,.4,5,materials.wood);
for(let i=0;i<2;i++){
 const boat=new THREE.Group();boat.position.set(133+i*7,.3,78+i*5);world.add(boat);
 const hull=new THREE.Mesh(new THREE.ConeGeometry(2.2,8,5),mat(0x80533b));hull.rotation.z=Math.PI/2;hull.scale.y=.55;boat.add(hull);
 box(boat,0,1,0,2,.18,2,materials.white);
}
label('FISHING JETTY',128,70,'#ffffff',18);

// Paddy fields and paths beyond the town
for(let i=0;i<7;i++){
 const x=-145+(i%3)*23,z=115+Math.floor(i/3)*23;
 const field=new THREE.Mesh(new THREE.PlaneGeometry(19,17),mat(i%2?0x8eaa55:0x9bb85d));field.rotation.x=-Math.PI/2;field.position.set(x,.055,z);world.add(field);
 for(let k=0;k<6;k++)box(world,x-8+k*3,.15,z, .07,.2,16,mat(0x6c8c48),false);
}
label('PADDY FIELDS',-135,115,'#fffbdc',18);

// Streetlights around the central streets
for(let x=-110;x<=110;x+=22){
 for(let z of [-10,10]){
  cylinder(world,x,2.3,z,.1,.1,4.6,materials.dark,7);
  const arm=box(world,x+0.6,4.5,z,1.3,.1,.1,materials.dark);arm.rotation.z=-.12;
  const lamp=new THREE.PointLight(0xffdf9a,.25,12);lamp.position.set(x+1.1,4.3,z);world.add(lamp);
 }
}

// Player character placeholder: detailed human-like body silhouette for free walking
const player=new THREE.Group();scene.add(player);
const skin=mat(0xb97f5c),shirt=mat(0x315f54),pants=mat(0x283747),shoe=mat(0x20272a);
const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.85,5,8),shirt);torso.position.y=1.45;torso.castShadow=true;player.add(torso);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,14,12),skin);head.position.y=2.42;head.castShadow=true;player.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8,0,Math.PI*2,0,Math.PI*.58),mat(0x201b18));hair.position.y=2.55;player.add(hair);
for(const side of [-1,1]){
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.72,4,7),pants);leg.position.set(side*.24,.55,0);leg.castShadow=true;player.add(leg);
 const foot=box(player,side*.24,.13,.13,.36,.2,.58,shoe);
 const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.68,4,7),skin);arm.position.set(side*.62,1.48,0);arm.rotation.z=side*-.12;player.add(arm);
}
player.position.set(0,0,25);

// Simple town props and roadside greenery
for(let i=0;i<24;i++){
 const x=-115+(i*19)%230,z=-115+((i*47)%230);
 if(Math.abs(x)<17||Math.abs(z)<17)continue;
 if(i%2===0)palm(x,z,.45);
}
for(let i=0;i<12;i++){
 const x=-85+i*15;
 box(world,x,.45,-12,2.4,.9,1.3,mat(0x8e6747));
}

// Controls: keyboard, mouse drag camera orbit, touch pad
const keys={};let yaw=0,pitch=.24,dragging=false,lastX=0,lastY=0;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch+dy*.002,-.1,.75);});
document.querySelectorAll('#mobileControls button').forEach(btn=>{
 const k=btn.dataset.move;const map={forward:'w',back:'s',left:'a',right:'d'};
 const down=e=>{e.preventDefault();keys[map[k]]=true;};const up=e=>{e.preventDefault();keys[map[k]]=false;};
 btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up);
});

const clock=new THREE.Clock();
const cameraTarget=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 let forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0);
 let side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);
 const moving=forward!==0||side!==0;
 if(moving){
  const speed=(keys.shift?13:7)*dt;
  const dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  player.position.addScaledVector(dir,forward*speed);
  player.position.addScaledVector(right,side*speed);
  player.position.x=THREE.MathUtils.clamp(player.position.x,-158,158);
  player.position.z=THREE.MathUtils.clamp(player.position.z,-158,158);
  player.rotation.y=Math.atan2(dir.x*forward+right.x*side,dir.z*forward+right.z*side);
 }
 const distance=11.5;
 const desired=new THREE.Vector3(
  player.position.x+Math.sin(yaw)*distance,
  player.position.y+5.1+pitch*7,
  player.position.z+Math.cos(yaw)*distance
 );
 camera.position.lerp(desired,1-Math.pow(.001,dt));
 cameraTarget.set(player.position.x,1.4,player.position.z);
 camera.lookAt(cameraTarget);
 renderer.render(scene,camera);
}
animate();
setTimeout(()=>document.querySelector('#loading').classList.add('hide'),1550);
addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
});
