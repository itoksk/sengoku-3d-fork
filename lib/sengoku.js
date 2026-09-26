/* 戦国合戦 3D俯瞰デモ 共通エンジン（three.js r128）
 * 実地形（地理院標高タイルから焼いた geo/terrain.bin）の上に、軍勢・矢印・ラベルを置いて場面ごとに動かす。
 * 各ページは Sengoku.start({...}) に場面（PH）・カメラ（CAM）・build(ctx) を渡す。
 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const wrapA=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;};
const reduceMotion=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const R_EARTH=6378137;

/* ---------------- 地形データ ---------------- */
function loadImageData(url){
  return new Promise((ok,ng)=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
    const x=c.getContext('2d');x.drawImage(im,0,0);ok(x.getImageData(0,0,im.width,im.height));};im.onerror=()=>ng(new Error(url));im.src=url;});
}
async function loadGeo(base,exag){
  const [meta,bin,cover]=await Promise.all([
    fetch(base+'meta.json').then(r=>{if(!r.ok)throw new Error('meta.json');return r.json();}),
    fetch(base+'terrain.bin').then(r=>{if(!r.ok)throw new Error('terrain.bin');return r.arrayBuffer();}),
    loadImageData(base+'cover.png'),
  ]);
  const N=meta.N,mpu=meta.m_per_unit,SIZE=meta.size_m/mpu,u16=new Uint16Array(bin);
  const hb=meta.hmin,Y=new Float32Array(N*N);
  for(let i=0;i<N*N;i++)Y[i]=((u16[i]/10-100)-hb)/mpu*exag;
  const step=SIZE/(N-1);
  function gy(x,z){
    const fx=clamp((x+SIZE/2)/step,0,N-1.001),fz=clamp((z+SIZE/2)/step,0,N-1.001);
    const i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,k=j*N+i;
    return (Y[k]*(1-tx)+Y[k+1]*tx)*(1-tz)+(Y[k+N]*(1-tx)+Y[k+N+1]*tx)*tz;
  }
  function coverAt(x,z){
    const i=clamp(Math.round((x+SIZE/2)/step),0,N-1),j=clamp(Math.round((z+SIZE/2)/step),0,N-1);
    return cover.data[(j*cover.width+i)*4];
  }
  const lat0=meta.origin.lat,lon0=meta.origin.lon,kLon=Math.PI/180*R_EARTH*Math.cos(lat0*Math.PI/180)/mpu,kLat=Math.PI/180*R_EARTH/mpu;
  const LL=(lat,lon)=>[(lon-lon0)*kLon,-(lat-lat0)*kLat];
  return {meta,N,SIZE,Y,gy,coverAt,LL,exag,mpu};
}

/* ---------------- ジオメトリの結合（頂点色つき） ---------------- */
function part(geo,color,m){
  const g=geo.toNonIndexed();if(m)g.applyMatrix4(m);
  const n=g.attributes.position.count,c=new Float32Array(n*3),col=new THREE.Color(color);
  for(let i=0;i<n;i++){c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;}
  g.setAttribute('color',new THREE.BufferAttribute(c,3));
  g.deleteAttribute('uv');return g;
}
function merge(parts){
  let n=0;for(const p of parts)n+=p.attributes.position.count;
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const p of parts){pos.set(p.attributes.position.array,o*3);nor.set(p.attributes.normal.array,o*3);col.set(p.attributes.color.array,o*3);o+=p.attributes.position.count;}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  return g;
}
const M4=(x,y,z,rx,ry,rz,sx,sy,sz)=>{const m=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0));
  m.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx||1,sy||1,sz||1));return m;};
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d);

/* 足軽 1 人（身長 ≒ 1、+z が前）。fixed = 固定色、clan = 家の色（胴・袖・指物）で塗る部分 */
function soldierGeos(opt){
  const kind=opt.kind||'yari';
  const HAKAMA=0x39342d,SKIN=0xc39a74,HAT=0x2a2621,WOOD=0x6e5234,STEEL=0xc9ccd0;
  const f=[
    part(box(.1,.4,.12),HAKAMA,M4(-.07,.2,0)),part(box(.1,.4,.12),HAKAMA,M4(.07,.2,.02)),
    part(box(.08,.28,.08),HAKAMA,M4(-.19,.52,.02,0,0,.12)),part(box(.08,.28,.08),HAKAMA,M4(.19,.52,.06,-.5,0,-.1)),
    part(box(.12,.12,.12),SKIN,M4(0,.84,.01)),
    part(new THREE.ConeGeometry(.19,.1,10,1),HAT,M4(0,.93,.01)),
  ];
  if(kind==='yari'){f.push(part(box(.03,1.9,.03),WOOD,M4(.21,.95,.1)),part(new THREE.ConeGeometry(.035,.16,4),STEEL,M4(.21,1.98,.1)));}
  else if(kind==='teppo'){f.push(part(box(.035,.035,.62),0x3b2e22,M4(.16,.66,.28,-.25,0,0)));}
  else if(kind==='yumi'){f.push(part(new THREE.TorusGeometry(.5,.012,4,16,Math.PI),WOOD,M4(.2,.7,.12,0,Math.PI/2,Math.PI/2,1,1.4,1)));}
  const c=[
    // 頂点色は家の色に掛ける明るさ（胴・草摺は漆塗りらしく暗く、指物は鮮やかに）
    part(box(.3,.3,.2),0x6a6a6a,M4(0,.6,0)),                 // 胴
    part(box(.34,.12,.24),0x3c3c3c,M4(0,.44,0)),             // 草摺
    part(box(.1,.1,.2),0x5a5a5a,M4(-.2,.7,0,0,0,.25)),part(box(.1,.1,.2),0x5a5a5a,M4(.2,.7,0,0,0,-.25)), // 袖
    part(box(.18,.32,.012),0xffffff,M4(0,1.28,-.14)),        // 指物
  ];
  f.push(part(box(.018,.72,.018),WOOD,M4(0,1.08,-.13)));   // 指物の竿
  return {fixed:merge(f),clan:merge(c)};
}
/* 騎馬武者（馬＋武者）。+z が前 */
function riderGeos(){
  const HORSE=0x5b3f2a,DARK=0x2b221b,GOLD=0xc9a13b,HAKAMA=0x39342d,SKIN=0xc39a74,LEATHER=0x3a2a1e;
  const f=[
    part(box(.34,.34,.9),HORSE,M4(0,.78,0)),
    part(box(.18,.42,.2),HORSE,M4(0,1.05,.46,-.55,0,0)),part(box(.14,.16,.36),HORSE,M4(0,1.26,.66,.2,0,0)),
    part(box(.06,.2,.1),DARK,M4(0,1.16,.4,-.6,0,0)),part(box(.06,.4,.06),DARK,M4(0,.7,-.5,.5,0,0)),
    ...[[-.12,.33],[.12,.33],[-.12,-.33],[.12,-.33]].map(([x,z],i)=>part(box(.08,.62,.08),HORSE,M4(x,.31,z,(i%2?.18:-.18),0,0))),
    part(box(.38,.08,.36),LEATHER,M4(0,.98,-.02)),
    part(box(.1,.3,.12),HAKAMA,M4(-.16,1.02,.04,.3,0,.2)),part(box(.1,.3,.12),HAKAMA,M4(.16,1.02,.04,.3,0,-.2)),
    part(box(.12,.12,.12),SKIN,M4(0,1.62,.02)),
    part(new THREE.SphereGeometry(.1,10,6,0,Math.PI*2,0,Math.PI/2),DARK,M4(0,1.66,.02)),     // 兜鉢
    part(box(.32,.03,.2),DARK,M4(0,1.62,-.02,.15,0,0)),                                       // 錣
    part(box(.2,.1,.01),GOLD,M4(0,1.8,.08,-.25,0,0)),                                        // 前立
    part(box(.02,1.1,.02),0x6e5234,M4(0,1.9,-.18)),                                          // 旗指物の竿
  ];
  const c=[
    part(box(.3,.32,.22),0x8a8a8a,M4(0,1.34,0)),part(box(.36,.14,.26),0x4a4a4a,M4(0,1.16,0)),
    part(box(.11,.12,.22),0x7a7a7a,M4(-.21,1.44,0,0,0,.3)),part(box(.11,.12,.22),0x7a7a7a,M4(.21,1.44,0,0,0,-.3)),
    part(box(.24,.44,.012),0xffffff,M4(0,2.2,-.18)),
  ];
  return {fixed:merge(f),clan:merge(c)};
}

/* ---------------- ページの見出し・凡例 ---------------- */
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fillPage(cfg){
  if(cfg.title){document.title=cfg.title+' 3D俯瞰デモ';const h=$('btitle');if(h)h.textContent=cfg.title;}
  if(cfg.subtitle&&$('bsub'))$('bsub').textContent=cfg.subtitle;
  if(cfg.note&&$('bnote'))$('bnote').textContent=cfg.note;
  if(cfg.attribution&&$('battr'))$('battr').textContent=cfg.attribution;
  const lg=$('blegend');
  if(lg&&cfg.legend)lg.innerHTML=cfg.legend.map(l=>`<div class="row"><span class="sw${l.arrow?' arr':''}" style="--c:${esc(l.arrow||l.color)}"></span>${esc(l.label)}</div>`).join('');
}

/* ---------------- 諸説ノート（setsu.md） ----------------
 * 書式:  ## 全体 / ## 序 / ## 第一幕 …（場面の見出し）
 *        ### 説の見出し
 *        本文（段落）
 *        - 出典: 書名や URL
 *        - 追記: @GitHubのID（年月）
 */
const phaseKey=t=>String(t).replace(/[第幕\s　]/g,'');
function inline(t){
  return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s（(])(https?:\/\/[^\s<）)]+)/g,'$1<a href="$2" target="_blank" rel="noopener">$2</a>');
}
function parseSetsu(md){
  const out={};let sec=null,it=null;
  for(const raw of md.replace(/\r/g,'').split('\n')){
    const line=raw.trim();
    if(line.startsWith('<!--')||line.startsWith('# ')||line==='---')continue;
    let m;
    if((m=line.match(/^##\s+(.+)$/))&&!line.startsWith('###')){sec=phaseKey(m[1]);out[sec]=out[sec]||[];it=null;continue;}
    if(!sec)continue;
    if((m=line.match(/^###\s+(.+)$/))){it={title:m[1],body:[],src:[],by:[]};out[sec].push(it);continue;}
    if(!it||!line)continue;
    if((m=line.match(/^[-*]\s*(出典|参考)\s*[:：]\s*(.+)$/))){it.src.push(m[2]);continue;}
    if((m=line.match(/^[-*]\s*(追記|追記者|記入)\s*[:：]\s*(.+)$/))){it.by.push(m[2]);continue;}
    it.body.push(line.replace(/^[-*]\s+/,'・'));
  }
  return out;
}
function repoInfo(cfg){
  const seg=location.pathname.split('/').filter(Boolean);
  let repo=cfg.repo||'k-ito-schoolagent/sengoku-3d',dir=seg[seg.length-1]==='index.html'?seg[seg.length-2]:seg[seg.length-1];
  if(/\.github\.io$/.test(location.hostname)&&seg.length>=2)repo=location.hostname.split('.')[0]+'/'+seg[0];
  return {repo,dir:cfg.id||dir};
}
function setupSetsu(cfg){
  const panel=$('setsu');if(!panel)return {show(){},};
  let data={},cur=0;
  const {repo,dir}=repoInfo(cfg);
  $('setsuEdit').href=`https://github.com/${repo}/edit/main/${dir}/setsu.md`;
  $('setsuHow').href=`https://github.com/${repo}/blob/main/CONTRIBUTING.md#諸説ノートに追記する`;
  const art=it=>`<article><h4>${inline(it.title)}</h4>${it.body.map(b=>`<p>${inline(b)}</p>`).join('')}`+
    it.src.map(x=>`<p class="src"><b>出典</b>　${inline(x)}</p>`).join('')+it.by.map(x=>`<p class="by"><b>追記</b>　${inline(x)}</p>`).join('')+`</article>`;
  function render(){
    const p=cfg.PH[cur],k=phaseKey(p.act),a=data[k]||[],g=data['全体']||[];
    $('setsuSub').textContent=(p.act==='序'||p.act==='結'?p.act:'第'+p.act+'幕')+'　'+p.title;
    $('setsuBody').innerHTML=`<div class="grp">この場面の諸説</div>`+(a.length?a.map(art).join(''):`<p class="empty">この場面にはまだ追記がありません。別の説や、通説の根拠になった史料をご存じでしたら、ぜひ追記してください。</p>`)+
      (g.length?`<div class="grp">戦い全体の諸説</div>`+g.map(art).join(''):'');
    const n=a.length+g.length,b=$('setsuBtn').querySelector('.n');b.textContent=n;b.classList.toggle('zero',!n);
  }
  const open=v=>{panel.classList.toggle('open',v);panel.setAttribute('aria-hidden',String(!v));$('setsuBtn').setAttribute('aria-expanded',String(v));if(v)$('setsuClose').focus();};
  $('setsuBtn').onclick=()=>open(!panel.classList.contains('open'));
  $('setsuClose').onclick=()=>{open(false);$('setsuBtn').focus();};
  addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;
    if(e.code==='KeyS')open(!panel.classList.contains('open'));else if(e.code==='Escape')open(false);});
  fetch(cfg.setsu||'setsu.md').then(r=>r.ok?r.text():'').then(t=>{data=parseSetsu(t);render();}).catch(()=>{});
  render();
  return {show(i){cur=i;render();}};
}

/* ---------------- 起動 ---------------- */
function start(cfg){
  fillPage(cfg);
  cfg._setsu=setupSetsu(cfg);
  let started=false;
  const go=()=>{if(started)return;started=true;
    loadGeo(cfg.geo||'geo/',cfg.exaggeration||2).then(G=>init(cfg,G)).catch(e=>{
      const ld=$('loading');if(ld){ld.textContent='表示に失敗しました：'+e.message+(location.protocol==='file:'?'（ローカルでは python3 -m http.server で開いてください）':'');}
      console.error(e);});};
  if(document.fonts&&document.fonts.load){Promise.all([document.fonts.load('700 46px "Shippori Mincho"'),document.fonts.load('500 46px "Noto Sans JP"')]).then(go,go);}
  setTimeout(go,2500);
  if(!document.fonts)go();
}

function init(cfg,G){
const {gy,SIZE,LL}=G;
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const ENV=cfg.ENV||cfg.PH.map(()=>cfg.env);
scene.background=new THREE.Color(ENV[0].bg);
scene.fog=new THREE.Fog(ENV[0].bg,ENV[0].fn,ENV[0].ff);
const camera=new THREE.PerspectiveCamera(42,1,0.5,2400);
const hemi=new THREE.HemisphereLight(0xe2ebf3,0x5d4f38,ENV[0].hemi);scene.add(hemi);
const sun=new THREE.DirectionalLight(ENV[0].sunC,ENV[0].sun);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc=sun.shadow.camera;sc.left=-110;sc.right=110;sc.top=110;sc.bottom=-110;sc.near=10;sc.far=520;
sun.shadow.bias=-0.0008;sun.shadow.normalBias=0.4;scene.add(sun);scene.add(sun.target);

/* 地形メッシュ（実標高） */
const N=G.N;
const tg=new THREE.PlaneGeometry(SIZE,SIZE,N-1,N-1);tg.rotateX(-Math.PI/2);
const tp=tg.attributes.position;
for(let i=0;i<tp.count;i++)tp.setY(i,G.Y[i]);
tg.computeVertexNormals();
const tex=new THREE.TextureLoader().load((cfg.geo||'geo/')+'relief.jpg');
tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
const terrain=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({map:tex,roughness:1,metalness:0}));
terrain.receiveShadow=true;scene.add(terrain);
// 地図の縁（断面）
(function(){const pos=[],h=SIZE/2,bot=-4,E=[];
  for(let i=0;i<N;i++)E.push([-h+i*(SIZE/(N-1)),-h]);for(let i=0;i<N;i++)E.push([h,-h+i*(SIZE/(N-1))]);
  for(let i=N-1;i>=0;i--)E.push([-h+i*(SIZE/(N-1)),h]);for(let i=N-1;i>=0;i--)E.push([-h,-h+i*(SIZE/(N-1))]);
  for(let i=0;i<E.length-1;i++){const [ax,az]=E[i],[bx,bz]=E[i+1],ay=gy(ax,az),by=gy(bx,bz);
    pos.push(ax,ay,az,ax,bot,az,bx,by,bz,bx,by,bz,ax,bot,az,bx,bot,bz);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  scene.add(new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x6a5a44,roughness:1,side:THREE.DoubleSide})));})();

/* リボン（街道・矢印） */
function ribbon(pts,width,lift,NS){
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],0,p[1])),false,'centripetal');
  const P=[];for(let i=0;i<=NS;i++)P.push(curve.getPointAt(i/NS));
  const acc=[0];for(let i=1;i<=NS;i++)acc.push(acc[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));
  const pos=[],uv=[],idx=[];
  for(let i=0;i<=NS;i++){
    const a=P[Math.max(i-1,0)],b=P[Math.min(i+1,NS)];
    let tx=b.x-a.x,tz=b.z-a.z;const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
    const cy=gy(P[i].x,P[i].z);P[i].y=cy+lift;
    for(const sg of[-1,1]){const x=P[i].x-tz*width/2*sg,z=P[i].z+tx*width/2*sg;
      pos.push(x,Math.max(gy(x,z),cy)+lift,z);uv.push(acc[i]/(width*2),sg<0?0:1);}
  }
  for(let i=0;i<NS;i++){const a=2*i,b=a+1,c=a+2,d=a+3;idx.push(a,c,b,b,c,d);}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();
  return {g,P,N:NS};
}

/* ラベル */
function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath();}
function makeLabel(text,o={}){
  const fs=o.fs||46,font=`${o.weight||700} ${fs}px ${o.family||'"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho",serif'}`;
  const c=document.createElement('canvas'),x=c.getContext('2d');x.font=font;
  const w=Math.ceil(x.measureText(text).width+fs*1.0),h=Math.ceil(fs*1.6);
  c.width=w;c.height=h;x.font=font;
  x.fillStyle=o.bg||'rgba(22,24,28,.74)';rr(x,2,2,w-4,h-4,o.round==null?6:o.round);x.fill();
  if(o.stroke){x.strokeStyle=o.stroke;x.lineWidth=4;x.stroke();}
  x.fillStyle=o.fg||'#fff';x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+fs*0.05);
  const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;
  const m=new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false,depthWrite:false,sizeAttenuation:false,fog:false});
  const s=new THREE.Sprite(m);const sz=o.size||0.03;s.scale.set(sz*w/h,sz,1);s.center.set(0.5,0);s.renderOrder=20;return s;
}
function place(text,x,z,o={},dy=5){const s=makeLabel(text,o);s.position.set(x,gy(x,z)+dy,z);scene.add(s);return s;}

/* 矢印 */
const chev=(function(){const c=document.createElement('canvas');c.width=128;c.height=64;const x=c.getContext('2d');
  x.fillStyle='rgba(255,255,255,.5)';x.fillRect(0,0,128,64);x.fillStyle='#fff';x.beginPath();
  x.moveTo(26,6);x.lineTo(52,6);x.lineTo(86,32);x.lineTo(52,58);x.lineTo(26,58);x.lineTo(60,32);x.closePath();x.fill();
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;})();
class Arrow{
  constructor(pts,color,width,from,until){
    this.from=from;this.until=until==null?from:until;this.op=0;this.prog=0;
    const r=ribbon(pts,width,1.1,200);this.P=r.P;this.N=r.N;
    this.mat=new THREE.MeshBasicMaterial({map:chev,color,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
    this.mesh=new THREE.Mesh(r.g,this.mat);this.mesh.renderOrder=4;scene.add(this.mesh);
    const r2=ribbon(pts,width*1.45,1.0,200);
    this.smat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
    this.shadow=new THREE.Mesh(r2.g,this.smat);this.shadow.renderOrder=3;scene.add(this.shadow);
    const hg=new THREE.BufferGeometry();const L=width*1.9,W=width*1.15;
    hg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-W,L,0,0,0,0,W],3));
    this.hmat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false});
    this.head=new THREE.Mesh(hg,this.hmat);this.head.renderOrder=5;scene.add(this.head);
  }
  update(cur,tIn,dt){
    const on=cur>=this.from&&cur<=this.until;
    if(on)this.prog=cur>this.from?1:ease(clamp((tIn-0.5)/3.4,0,1));
    else if(cur<this.from)this.prog=0;
    this.op+=((on?1:0)-this.op)*Math.min(1,dt*3);
    const vis=this.op>0.01&&this.prog>0.005;
    this.mesh.visible=this.shadow.visible=this.head.visible=vis;
    if(!vis)return;
    this.mat.opacity=0.95*this.op;this.smat.opacity=0.22*this.op;this.hmat.opacity=this.op;
    const k=Math.max(1,Math.floor(this.prog*this.N));
    this.mesh.geometry.setDrawRange(0,k*6);this.shadow.geometry.setDrawRange(0,k*6);
    const p=this.P[k],q=this.P[k-1];
    this.head.position.set(p.x,p.y+0.05,p.z);this.head.rotation.y=Math.atan2(-(p.z-q.z),p.x-q.x);
  }
}

/* ---------------- 軍勢 ---------------- */
const SIDES=cfg.SIDES;
const GEO={yari:soldierGeos({kind:'yari'}),teppo:soldierGeos({kind:'teppo'}),yumi:soldierGeos({kind:'yumi'}),rider:riderGeos()};
const FIG=cfg.figure||0.78;           // 足軽の身長（単位）
let seed=cfg.seed||11;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const clearZones=[].concat(cfg.clear||[]);
let tInG=0;
class Unit{
  constructor(d){
    this.d=d;const side=SIDES[d.side];
    this.g=new THREE.Group();scene.add(this.g);
    // 隊形: 前列に鉄砲・弓、後ろに長柄（槍）。少しずつ乱して人の集団らしくする
    const cols=Math.round(d.cols*2.1),rows=Math.round(d.rows*2),sp=(d.sp||0.5)*FIG/0.78;
    this.men=[];
    const nFront=d.teppo===false?0:Math.min(2,Math.max(1,rows>>2));
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const kind=r<nFront?(c%3===1?'yumi':'teppo'):'yari';
      this.men.push({kind,x:(c-(cols-1)/2)*sp+(r%2?sp*.35:0)+(rnd()-.5)*sp*.4,z:((rows-1)/2-r)*sp+(rnd()-.5)*sp*.35,ph:rnd()*6.28,s:FIG*(.92+rnd()*.14)});
    }
    const count={yari:0,teppo:0,yumi:0};for(const m of this.men)count[m.kind]++;
    this.mats=[];
    const M=o=>{const m=new THREE.MeshStandardMaterial(Object.assign({transparent:true,roughness:.72},o));this.mats.push(m);return m;};
    this.fixedM=M({vertexColors:true});this.clanM=M({vertexColors:true,color:side.body.clone()});
    this.im={};
    for(const k of ['yari','teppo','yumi']){if(!count[k])continue;
      const a=new THREE.InstancedMesh(GEO[k].fixed,this.fixedM,count[k]),b=new THREE.InstancedMesh(GEO[k].clan,this.clanM,count[k]);
      for(const m of[a,b]){m.castShadow=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;this.g.add(m);}
      this.im[k]=[a,b,0];}
    for(const m of this.men){const s=this.im[m.kind];m.i=s[2]++;}
    // 大将（騎馬）と馬印
    const back=-(rows-1)/2*sp-sp*1.6;
    this.rider=new THREE.Group();this.rider.position.set(0,0,back+sp*.4);this.g.add(this.rider);
    const rf=new THREE.Mesh(GEO.rider.fixed,this.fixedM),rc=new THREE.Mesh(GEO.rider.clan,this.clanM);
    rf.scale.setScalar(FIG*1.15);rc.scale.setScalar(FIG*1.15);rf.castShadow=rc.castShadow=true;this.rider.add(rf,rc);
    const pm=M({color:0x6b4f33});
    this.fm=M({map:side.tex,side:THREE.DoubleSide,roughness:.85});
    const um=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,3.2*FIG),pm);um.position.set(sp*1.2,1.6*FIG,back);this.g.add(um);
    const ug=new THREE.Mesh(new THREE.SphereGeometry(.22*FIG/0.78,10,8),M({color:side.uma||0xc9a13b,metalness:.4,roughness:.4}));ug.position.set(sp*1.2,3.25*FIG,back);ug.scale.set(1,1.3,1);this.g.add(ug);
    // 幟（のぼり）
    this.flags=[];
    const fx=d.flags||[-1,-.33,.33,1];
    for(const k of fx){
      const x=k*(cols-1)/2*sp*.9;
      const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.6*FIG),pm);p.position.set(x,1.8*FIG,back+sp*.6);p.castShadow=true;this.g.add(p);
      const fg=new THREE.PlaneGeometry(.5*FIG,1.7*FIG);fg.translate(.25*FIG,0,0);
      const f=new THREE.Mesh(fg,this.fm);f.position.set(x+.03,2.65*FIG,back+sp*.6);f.castShadow=true;this.g.add(f);this.flags.push(f);
    }
    this.label=makeLabel(d.name,{bg:side.label,size:0.023});this.label.position.y=d.ly||4.2;this.g.add(this.label);
    if(d.turn!=null){const ts=SIDES[d.turnSide];this.label2=makeLabel(d.name+(d.turnText||'（寝返り）'),{bg:d.turnLabel||ts.label,size:0.023});this.label2.position.y=d.ly||4.2;this.label2.material.opacity=0;this.g.add(this.label2);}
    // 場面ごとの経路
    this.polys=[];this.ends=[];this.fades=[];let last=null,hidden=false;this.first=null;
    d.keys.forEach(k=>{
      if(k==null){this.polys.push(null);this.ends.push(last);this.fades.push(false);hidden=true;return;}
      let fade=false;if(!Array.isArray(k)){fade=true;k=k.p;}
      const pts=Array.isArray(k[0])?k:[k];if(!this.first)this.first=pts[0];
      // 前の場面から続けて動く。直前が null（画面にいない）だった場合は、前の終点からではなく新しい経路の先頭に現れる
      let poly=last&&!hidden?[last,...pts]:pts.slice();if(poly.length===1)poly=[poly[0],poly[0]];
      this.polys.push(poly);last=pts[pts.length-1];this.ends.push(last);this.fades.push(fade);hidden=false;
      for(const q of pts)clearZones.push([q[0],q[1],Math.max(cols,rows)*sp*.75]);
    });
    this.x=null;this.yaw=d.face||0;this.op=0;this.tf=0;this.dummy=new THREE.Object3D();this.lastMove=0;
  }
  posAt(ph,p){
    const poly=this.polys[ph];
    if(!poly){const e=this.ends[ph]||this.first;return{x:e[0],z:e[1],a:0};}
    const a=this.fades[ph]?1-smooth(0.78,1,p):1;
    const L=[0];for(let i=1;i<poly.length;i++)L.push(L[i-1]+Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]));
    const tot=L[L.length-1];if(tot<1e-6)return{x:poly[0][0],z:poly[0][1],a};
    const s=ease(p)*tot;let i=1;while(i<L.length-1&&L[i]<s)i++;
    const t=(s-L[i-1])/((L[i]-L[i-1])||1);
    return{x:lerp(poly[i-1][0],poly[i][0],t),z:lerp(poly[i-1][1],poly[i][1],t),a};
  }
  update(ph,p,dt,time){
    const r=this.posAt(ph,p);let moving=false;
    if(this.x==null){this.x=r.x;this.z=r.z;}
    const dx=r.x-this.x,dz=r.z-this.z,dist=Math.hypot(dx,dz);
    let ty=this.yaw;
    if(dist>8){}
    else if(dist/Math.max(dt,1e-3)>0.35){ty=Math.atan2(dx,dz);moving=true;}
    else if(this.d.faceTo){const f=this.d.faceTo;if(Math.hypot(f[0]-r.x,f[1]-r.z)>3)ty=Math.atan2(f[0]-r.x,f[1]-r.z);}
    else if(this.d.face!=null)ty=this.d.face;
    this.x=r.x;this.z=r.z;
    this.yaw+=wrapA(ty-this.yaw)*Math.min(1,dt*3);
    this.op+=(r.a-this.op)*Math.min(1,dt*2.5);
    const turned=this.d.turn!=null&&(ph>this.d.turn||(ph===this.d.turn&&tInG>1.5));
    this.tf+=((turned?1:0)-this.tf)*Math.min(1,dt*1.5);
    this.g.visible=this.op>0.02;if(!this.g.visible)return;
    for(const m of this.mats)m.opacity=this.op;
    const side=SIDES[this.d.side];
    if(this.d.turn!=null){
      const ts=SIDES[this.d.turnSide];
      this.clanM.color.copy(side.body).lerp(ts.body,this.tf);
      this.fm.map=this.tf>.5?ts.tex:side.tex;
      this.label.material.opacity=this.op*(1-this.tf);this.label2.material.opacity=this.op*this.tf;
    }else this.label.material.opacity=this.op;
    const by=gy(this.x,this.z);this.g.position.set(this.x,by,this.z);this.g.rotation.y=this.yaw;
    const cs=Math.cos(this.yaw),sn=Math.sin(this.yaw),D=this.dummy;
    const walk=moving&&!reduceMotion;
    for(const m of this.men){
      const wx=this.x+m.x*cs+m.z*sn,wz=this.z-m.x*sn+m.z*cs;
      const ly=gy(wx,wz)-by+(walk?Math.abs(Math.sin(time*8+m.ph))*.07:0);
      D.position.set(m.x,ly,m.z);D.rotation.set(walk?Math.sin(time*8+m.ph)*.06:0,0,0);D.scale.setScalar(m.s);D.updateMatrix();
      const s=this.im[m.kind];s[0].setMatrixAt(m.i,D.matrix);s[1].setMatrixAt(m.i,D.matrix);
    }
    for(const k in this.im){this.im[k][0].instanceMatrix.needsUpdate=this.im[k][1].instanceMatrix.needsUpdate=true;}
    const rz=this.rider.position.z,rwx=this.x+0*cs+rz*sn,rwz=this.z+rz*cs;
    this.rider.position.y=gy(rwx,rwz)-by+(walk?Math.abs(Math.sin(time*6))*.05:0);
    this.flags.forEach((f,i)=>{f.rotation.y=Math.sin(time*2.2+i)*.25;});
  }
}

/* ---------------- ページ固有の構築 ---------------- */
const ctx={THREE,scene,gy,LL,SIZE,G,place,makeLabel,ribbon,Arrow,Unit,rnd,clamp,smooth,lerp,ease,reduceMotion,clearZones,
  addClear:(x,z,r)=>clearZones.push([x,z,r])};
const built=cfg.build(ctx);
const units=built.units||[],arrows=built.arrows||[];

/* 樹木（林の被覆に沿って配置。軍勢・城などの周りは空ける） */
(function(){
  const lite=innerWidth<700||(navigator.hardwareConcurrency||8)<=4;
  const want=Math.round((cfg.trees||14000)*(lite?0.5:1)),list1=[],list2=[];
  const isClear=(x,z)=>{for(const c of clearZones){const dx=x-c[0],dz=z-c[1];if(dx*dx+dz*dz<c[2]*c[2])return true;}return false;};
  for(let n=0;n<want*6&&list1.length+list2.length<want;n++){
    const x=(rnd()-.5)*SIZE*.985,z=(rnd()-.5)*SIZE*.985;
    const cv=G.coverAt(x,z);
    if(cv!==128){if(cv!==0||rnd()>.012)continue;}   // 田畑にもまれに屋敷林
    if(isClear(x,z))continue;
    const h=gy(x,z);
    (rnd()<(cfg.conifer||.55)?list1:list2).push([x,h,z,(cfg.treeSize||1)*(.8+rnd()*.55),rnd()]);
  }
  function scatter(list,geo,base,alt,yOff){
    if(!list.length)return;
    const im=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({roughness:.95,vertexColors:true}),list.length);
    const d=new THREE.Object3D(),c=new THREE.Color(),c1=new THREE.Color(base),c2=new THREE.Color(alt);
    list.forEach((t,i)=>{d.position.set(t[0],t[1]-.05,t[2]);d.scale.set(t[3],t[3]*(.85+t[4]*.45),t[3]);d.rotation.y=t[4]*6;d.updateMatrix();im.setMatrixAt(i,d.matrix);c.copy(c1).lerp(c2,t[4]);im.setColorAt(i,c);});
    im.castShadow=true;im.receiveShadow=true;scene.add(im);
  }
  const T=cfg.treeColors||{c1:'#2f4a2a',c2:'#46613a',b1:'#4f6a34',b2:'#6f7f3a'};
  // 杉・檜（細い円錐を重ねる）と広葉樹（小さな球の房）。原点は根元
  const W=0xffffff,TR=0x4a3a2a;
  const conifer=merge([part(new THREE.CylinderGeometry(.035,.05,.3,5),TR,M4(0,.15,0)),
    part(new THREE.ConeGeometry(.3,.62,7),W,M4(0,.5,0)),part(new THREE.ConeGeometry(.24,.52,7),W,M4(0,.8,0)),part(new THREE.ConeGeometry(.15,.42,7),W,M4(0,1.07,0))]);
  const broad=merge([part(new THREE.CylinderGeometry(.04,.06,.3,5),TR,M4(0,.15,0)),
    part(new THREE.IcosahedronGeometry(.3,0),W,M4(0,.52,0,0,0,0,1,.85,1)),part(new THREE.IcosahedronGeometry(.23,0),W,M4(.2,.44,.08)),
    part(new THREE.IcosahedronGeometry(.22,0),W,M4(-.16,.46,-.12)),part(new THREE.IcosahedronGeometry(.2,0),W,M4(.02,.7,-.02))]);
  scatter(list1,conifer,T.c1,T.c2,0);
  scatter(list2,broad,T.b1,T.b2,0);
})();

/* ---------------- 場面・環境・カメラ ---------------- */
const PH=cfg.PH,CAM=cfg.CAM,DUR=cfg.DUR||14;
for(const k of CAM.concat(cfg.camStart||[]))if(k.t[1]==null)k.t[1]=gy(k.t[0],k.t[2])+(k.lift||1);
const envNow={bg:new THREE.Color(ENV[0].bg),fn:ENV[0].fn,ff:ENV[0].ff,sun:ENV[0].sun,sunC:new THREE.Color(ENV[0].sunC),hemi:ENV[0].hemi};
let envFrom={bg:envNow.bg.clone(),fn:envNow.fn,ff:envNow.ff,sun:envNow.sun,sunC:envNow.sunC.clone(),hemi:envNow.hemi};
const tc1=new THREE.Color(),tc2=new THREE.Color();
let cur=0,tIn=0,playing=true,speed=1,time=0;
const c0=cfg.camStart||Object.assign({},CAM[0],{d:CAM[0].d*1.7,pitch:Math.min(1.35,CAM[0].pitch+.3)});
let camNow={t:c0.t.slice(),d:c0.d,yaw:c0.yaw,pitch:c0.pitch},camFrom={t:camNow.t.slice(),d:camNow.d,yaw:camNow.yaw,pitch:camNow.pitch};
let uYaw=0,uPitch=0,uZoom=1,tYaw=0,tPitch=0,tZoom=1,camFix=null;
window.Sengoku.debug={cam:(x,z,d,yaw,pitch)=>{camFix=x==null?null:{t:[x,gy(x,z)+1,z],d,yaw,pitch};},go:i=>go(i),pause:()=>setPlaying(false)};

const dots=$('dots');
PH.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p.act;b.setAttribute('aria-label',p.title);b.onclick=()=>go(i);dots.appendChild(b);});
function setPlaying(v){playing=v;$('play').textContent=v?'❚❚':'▶︎';}
function go(i){
  cur=clamp(i,0,PH.length-1);tIn=0;
  camFrom={t:camNow.t.slice(),d:camNow.d,yaw:camNow.yaw,pitch:camNow.pitch};
  envFrom={bg:envNow.bg.clone(),fn:envNow.fn,ff:envNow.ff,sun:envNow.sun,sunC:envNow.sunC.clone(),hemi:envNow.hemi};
  const p=PH[cur];$('pact').textContent=p.act==='序'||p.act==='結'?p.act:'第'+p.act+'幕';
  $('pdate').textContent=p.date;$('ptitle').textContent=p.title;$('ptext').textContent=p.text;
  [...dots.children].forEach((b,k)=>{b.classList.toggle('on',k===cur);b.classList.toggle('done',k<cur);});
  if(cfg._setsu)cfg._setsu.show(cur);
  setPlaying(true);
}
$('prev').onclick=()=>go(cur-1);
$('next').onclick=()=>go(cur+1);
$('play').onclick=()=>{if(!playing&&cur===PH.length-1&&tIn>=DUR){go(0);return;}setPlaying(!playing);};
$('speed').onclick=()=>{speed=speed===1?2:speed===2?0.5:1;$('speed').textContent=(speed===0.5?'0.5':speed)+'×';};

// 説明の折りたたみ（本文を畳んで裏の俯瞰を見せる）
const card=document.querySelector('.card'),foldBtn=$('fold');
function setFold(min){card.classList.toggle('min',min);foldBtn.textContent=min?'説明を表示':'説明を隠す';
  foldBtn.setAttribute('aria-expanded',String(!min));try{localStorage.setItem('sg3d-fold',min?'1':'0');}catch(e){}}
foldBtn.onclick=()=>setFold(!card.classList.contains('min'));
try{if(localStorage.getItem('sg3d-fold')==='1')setFold(true);}catch(e){}

addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();$('play').click();}
  else if(e.code==='KeyH')foldBtn.click();
  else if(e.code==='ArrowRight')go(cur+1);else if(e.code==='ArrowLeft')go(cur-1);
});
const ptrs=new Map();let pinch0=0,zoom0=1;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch0=Math.hypot(a.x-b.x,a.y-b.y);zoom0=tZoom;}});
canvas.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;
  if(ptrs.size===1){tYaw-=(e.clientX-p.x)*0.005;tPitch+=(e.clientY-p.y)*0.004;tPitch=clamp(tPitch,-1.2,1.2);}
  p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinch0>0)tZoom=clamp(zoom0*pinch0/d,0.25,2.4);}});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=0;};
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('wheel',e=>{e.preventDefault();tZoom=clamp(tZoom*Math.exp(e.deltaY*0.001),0.25,2.4);},{passive:false});
canvas.addEventListener('dblclick',()=>{tYaw=0;tPitch=0;tZoom=1;});

// 注視点を「上部パネルと説明カードの間の見えている帯」の中央に映す
let viewShift=0,viewShiftT=0,baseFov=42;
function measureView(){const h=innerHeight,top=document.querySelector('.top');
  let tb=0;for(const el of top.children){const r=el.getBoundingClientRect();if(r.height>0)tb=Math.max(tb,r.bottom);}
  const cb=card.getBoundingClientRect().top;
  viewShiftT=clamp(h/2-(tb+cb)/2,0,h*0.3);}
function applyView(){const w=innerWidth,h=innerHeight,s=viewShift,fh=h+2*s;
  camera.aspect=w/fh;camera.fov=2*Math.atan(Math.tan(baseFov*Math.PI/360)*fh/h)*180/Math.PI;
  camera.setViewOffset(w,fh,0,2*s,w,h);}
new ResizeObserver(measureView).observe(card);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);
  baseFov=w<h?58:42;measureView();viewShift=viewShiftT;applyView();}
addEventListener('resize',resize);resize();

go(0);
let lastT=performance.now();
function frame(now){
  const dt=Math.min(0.05,(now-lastT)/1000);lastT=now;
  step(dt);
  renderer.render(scene,camera);
  requestAnimationFrame(frame);
}
function step(dt){
  time+=dt;
  if(playing){tIn+=dt*speed;if(tIn>=DUR){if(cur<PH.length-1)go(cur+1);else{tIn=DUR;setPlaying(false);}}}
  tInG=tIn;
  const p=clamp((tIn-0.8)/(DUR*0.72),0,1);
  for(const u of units)u.update(cur,p,dt,time);
  for(const a of arrows)a.update(cur,tIn,dt);
  chev.offset.x-=dt*0.9;
  if(built.update)built.update(cur,tIn,dt,time);

  const E=ENV[cur],et=ease(clamp(tIn/(E.slow?DUR*0.6:3.2),0,1));
  envNow.bg.copy(envFrom.bg).lerp(tc1.set(E.bg),et);
  envNow.sunC.copy(envFrom.sunC).lerp(tc2.set(E.sunC),et);
  envNow.fn=lerp(envFrom.fn,E.fn,et);envNow.ff=lerp(envFrom.ff,E.ff,et);
  envNow.sun=lerp(envFrom.sun,E.sun,et);envNow.hemi=lerp(envFrom.hemi,E.hemi,et);
  scene.background.copy(envNow.bg);scene.fog.color.copy(envNow.bg);scene.fog.near=envNow.fn;scene.fog.far=envNow.ff;
  sun.intensity=envNow.sun;sun.color.copy(envNow.sunC);hemi.intensity=envNow.hemi;
  document.body.style.background='#'+envNow.bg.getHexString();

  const k=camFix||CAM[cur],ct=camFix?1:ease(clamp(tIn/(reduceMotion?0.01:3.8),0,1));
  camNow.t=[0,1,2].map(i=>lerp(camFrom.t[i],k.t[i],ct));
  camNow.d=lerp(camFrom.d,k.d,ct);
  camNow.yaw=camFrom.yaw+wrapA(k.yaw-camFrom.yaw)*ct+(reduceMotion?0:tIn*0.01*ct);
  camNow.pitch=lerp(camFrom.pitch,k.pitch,ct);
  const f=Math.min(1,dt*6);uYaw+=(tYaw-uYaw)*f;uPitch+=(tPitch-uPitch)*f;uZoom+=(tZoom-uZoom)*f;
  const yaw=camNow.yaw+uYaw,pitch=clamp(camNow.pitch+uPitch,0.12,1.45),d=camNow.d*uZoom,T=camNow.t;
  const cx=T[0]+Math.sin(yaw)*Math.cos(pitch)*d,cz=T[2]+Math.cos(yaw)*Math.cos(pitch)*d;
  const cyy=Math.max(T[1]+Math.sin(pitch)*d,gy(cx,cz)+5);
  camera.position.set(cx,cyy,cz);camera.lookAt(T[0],T[1],T[2]);
  sun.target.position.set(T[0],T[1],T[2]);sun.position.set(T[0]-110,T[1]+170,T[2]+80);
  const sh=clamp(d*0.75,50,160);sc.left=-sh;sc.right=sh;sc.top=sh;sc.bottom=-sh;sc.updateProjectionMatrix();

  $('prog').style.width=(clamp(tIn/DUR,0,1)*100)+'%';
  if(Math.abs(viewShiftT-viewShift)>0.5){viewShift+=(viewShiftT-viewShift)*Math.min(1,dt*(reduceMotion?60:8));applyView();}
}
window.Sengoku.debug.run=(sec)=>{for(let i=0;i<sec*20;i++)step(0.05);renderer.render(scene,camera);};
window.Sengoku.debug.bench=(n=10)=>{const gl=renderer.getContext(),px=new Uint8Array(4);renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const t=performance.now();for(let i=0;i<n;i++){step(0.016);renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);}return +((performance.now()-t)/n).toFixed(1);};
requestAnimationFrame(frame);
const ld=$('loading');if(ld){ld.style.opacity=0;setTimeout(()=>ld.remove(),900);}
}

window.Sengoku={start,clamp,smooth,lerp,ease,parseSetsu};
})();
