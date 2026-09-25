(function(){
const TAU=Math.PI*2;
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  if(side==='T'){x.fillStyle='#b8231b';x.fillRect(0,0,64,200);x.fillStyle='#f3efe4';const cx=32,cy=50,s=8.5;
    [[0,-1],[-1,0],[1,0],[0,1]].forEach(([dx,dy])=>{const px=cx+dx*s*1.05,py=cy+dy*s*1.05;x.beginPath();x.moveTo(px,py-s);x.lineTo(px+s*.78,py);x.lineTo(px,py+s);x.lineTo(px-s*.78,py);x.closePath();x.fill();});}
  else{x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);x.strokeStyle='#1d1d1d';x.lineWidth=4;x.beginPath();x.arc(32,50,19,0,TAU);x.stroke();
    x.fillStyle='#1d1d1d';for(let k=0;k<3;k++){const a=-Math.PI/2+k*2*Math.PI/3;x.beginPath();x.ellipse(32+Math.cos(a)*8,50+Math.sin(a)*8,5.5,8,a+Math.PI/2,0,TAU);x.fill();}
    x.fillStyle='#2848a0';x.fillRect(0,0,64,10);}
  return new THREE.CanvasTexture(c);
}
const SIDES={
  T:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.86)',tex:flagTex('T')},
  K:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.86)',tex:flagTex('K')},
};
const PH=[
  {act:'序',date:'天正元年（1573）',title:'牧之原台地の城',text:'武田勝頼が大井川の西岸、牧之原台地の北端に築いたとされる城。東と北は金谷の低地へ落ちる急崖、西は菊川の谷で、城へは台地側からしか近づけない。台地側には武田流築城の特徴とされる丸馬出と三日月堀が構えられた（縄張りは馬場信春と伝わる）。'},
  {act:'一',date:'天正2〜3年（1574〜75）',title:'遠江への楔',text:'城は駿河から大井川を越えて遠江へ入る東海道を押さえ、武田方の高天神城へ通じる補給・連絡の要となった。だが天正3年5月、長篠の戦いで武田軍が大敗し、遠江の武田方拠点は孤立へ向かう。'},
  {act:'二',date:'天正3年（1575）夏',title:'徳川軍の東進',text:'長篠の勝利を機に、徳川家康は遠江の失地回復に動く。掛川方面から東海道を東へ、小夜の中山を越えて菊川の谷へ下り、牧之原台地へ軍勢を進めた。'},
  {act:'三',date:'天正3年 夏',title:'包囲と付城',text:'徳川軍は台地側から城を囲み、付城（陣城）を築いて腰を据えた攻囲に入る。城の北の金谷を通る東海道も押さえられ、城は外との連絡を断たれていく。'},
  {act:'四',date:'攻囲戦',title:'丸馬出をめぐる攻防',text:'丸馬出は、堀の外へ半円形に張り出した出撃拠点。城兵はここから打って出て寄せ手を叩き、すぐに堀の内へ退くことができる。寄せ手にとっては、堀と馬出からの側面攻撃が大きな障害となった。'},
  {act:'五',date:'天正3年8月',title:'落城、小山城へ',text:'長い攻囲の末、城兵は城を明け渡し、南東の小山城方面へ退いたとされる。落城に至る細かな経緯には諸説がある。'},
  {act:'結',date:'天正3年以降',title:'牧野城として',text:'家康は城を牧野城と改めて改修し、高天神城攻めの前線拠点とした。補給路を断たれた武田方の高天神城は、天正9年（1581）に落城する。'},
];
const CAM=[
  {t:[-10,null,-2],d:175,yaw:-0.4,pitch:0.95},
  {t:[-4,null,8],d:220,yaw:0.3,pitch:1.05},
  {t:[-62,null,-4],d:130,yaw:-0.5,pitch:0.64},
  {t:[-10,null,4],d:84,yaw:0.25,pitch:0.78},
  {t:[-15,null,2],d:46,yaw:-0.55,pitch:0.52},
  {t:[30,null,16],d:150,yaw:0.55,pitch:0.82},
  {t:[-14,null,-6],d:72,yaw:0.85,pitch:0.72},
];
const ENV={bg:0xc5d3da,fn:230,ff:640,sun:0.95,sunC:0xfff0d8,hemi:0.62};

Sengoku.start({
  id:'suwahara',
  title:'諏訪原城の戦い',
  subtitle:'天正3年（1575）　徳川家康による武田方・諏訪原城の攻略',
  legend:[{color:'#2c4fb0',label:'徳川軍'},{color:'#c0281f',label:'武田軍'},{arrow:'#2c4fb0',label:'進軍・攻撃の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ1.8倍に強調して表示。地表の色分けは当時を想定したもので、軍勢の数と配置は流れを理解するための概念的な再現です（諸説は「諸説」ボタンから）。城・人・旗の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:1.8,SIDES,PH,CAM,env:ENV,DUR:13,trees:15000,conifer:.45,seed:7,
  treeColors:{c1:'#2c4a2a',c2:'#436238',b1:'#4f6f33',b2:'#6e8a3e'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];
    // 城の基準: 本曲輪と正面（大手・丸馬出が向く南南西）
    const HON=[-14,-10],F=[-0.29,0.96],R_=[F[1],-F[0]];
    const fwd=(d,s=0)=>[HON[0]+F[0]*d+R_[0]*s,HON[1]+F[1]*d+R_[1]*s];

    // 地名
    const dirStyle={bg:'rgba(245,244,238,.82)',fg:'#20242a',size:0.026,weight:500,family:'"Noto Sans JP",sans-serif'};
    const waterStyle={bg:'rgba(34,78,104,.78)',size:0.03},landStyle={bg:'rgba(62,70,40,.72)',size:0.03};
    place('大井川',...at(34.8262,138.1455),waterStyle,2);
    place('菊川',-31,16,waterStyle,2);
    place('牧之原台地',18,26,landStyle,3);
    place('小夜の中山',...at(34.8163,138.0971),landStyle,4);
    place('東海道',...at(34.8186,138.1002),{bg:'rgba(120,98,54,.8)',size:0.026},2);
    place('金谷',...at(34.8228,138.1310),{bg:'rgba(22,24,28,.7)',size:0.026},4);
    place('日坂',...at(34.8038,138.0752),{bg:'rgba(22,24,28,.7)',size:0.026},4);
    place('← 掛川・浜松方面',-138,32,dirStyle,4);
    place('駿河方面 →',132,-66,dirStyle,4);
    place('↘ 小山城方面',128,70,dirStyle,4);
    place('↙ 高天神城方面',-118,128,dirStyle,4);

    // 宿場の家並み
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(a,b,n){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s,y=gy(px,pz),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    town(at(34.8205,138.1282),at(34.8262,138.1385),18);   // 金谷宿
    town(at(34.8192,138.1082),at(34.8184,138.1118),6);    // 菊川の里
    town(at(34.8040,138.0740),at(34.8036,138.0775),6);    // 日坂宿

    /* ---------------- 城（本曲輪・二の曲輪・三日月堀・丸馬出） ---------------- */
    const castle=new THREE.Group();scene.add(castle);
    const y0=gy(HON[0],HON[1])+0.2;
    castle.position.set(HON[0],y0,HON[1]);castle.rotation.y=Math.atan2(F[1],-F[0]);  // 局所 -x を正面（F）へ向ける
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95});
    const bankM=new THREE.MeshStandardMaterial({color:0x76864a,roughness:.95});
    const moatM=new THREE.MeshStandardMaterial({color:0x463e2f,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const K=0.55;
    function disc(x,z,r,top,m){const H=8;const g=new THREE.CylinderGeometry(r,r*1.18,H,48);const me=new THREE.Mesh(g,m);me.position.set(x,top-H/2,z);me.castShadow=me.receiveShadow=true;castle.add(me);return me;}
    function crescent(x,z,r,w,y){
      const g=new THREE.RingGeometry(r-w/2,r+w/2,56,1,Math.PI/2,Math.PI);g.rotateX(-Math.PI/2);
      const m=new THREE.Mesh(g,moatM);m.position.set(x,y+0.03,z);m.receiveShadow=true;castle.add(m);
      const tg=new THREE.TorusGeometry(r-w/2-0.25,0.24,6,48,Math.PI);tg.rotateZ(Math.PI/2);tg.rotateX(-Math.PI/2);tg.scale(1,0.8,1);
      const t=new THREE.Mesh(tg,bankM);t.position.set(x,y+0.08,z);t.castShadow=true;castle.add(t);
    }
    disc(0,0,11*K,0.4,earthM);
    disc(0,0,5.5*K,0.8,earthM);
    crescent(0,0,6.3*K,1.4*K,0.8);
    crescent(0,0,11.9*K,1.6*K,0.4);
    const UMA=[];
    for(const a of[-0.5,0,0.5]){
      const r=14.6*K,x=-r*Math.cos(a),z=r*Math.sin(a);
      const g=new THREE.CylinderGeometry(2.5*K,2.9*K,6,32,1,false,Math.PI,Math.PI);
      const m=new THREE.Mesh(g,earthM);m.position.set(x+.35,0.45-3,z);m.castShadow=m.receiveShadow=true;castle.add(m);
      crescent(x+.35,z,3.6*K,1.2*K,0);
      const w=new THREE.Vector3(x,0,z).applyAxisAngle(new THREE.Vector3(0,1,0),castle.rotation.y);UMA.push([HON[0]+w.x,HON[1]+w.z]);
    }
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    const yag=new THREE.Mesh(new THREE.BoxGeometry(1.3,1,1.3),wallM);yag.position.set(.8,1.3,0);yag.castShadow=true;castle.add(yag);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.25,.7,4),roofM);roof.rotation.y=Math.PI/4;roof.position.set(.8,2.15,0);roof.castShadow=true;castle.add(roof);
    for(let i=0;i<30;i++){const a=Math.PI/2+i/29*Math.PI;const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1),woodM);
      p.position.set(Math.cos(a)*2.85,1.05,-Math.sin(a)*2.85);p.castShadow=true;castle.add(p);}
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.6),woodM);pole.position.set(.8,3.6,0);castle.add(pole);
    const cflagG=new THREE.PlaneGeometry(.65,1.6);cflagG.translate(.33,0,0);
    const cflagM=new THREE.MeshStandardMaterial({map:SIDES.T.tex,side:THREE.DoubleSide,roughness:.8});
    const cflag=new THREE.Mesh(cflagG,cflagM);cflag.position.set(.83,4.1,0);cflag.castShadow=true;castle.add(cflag);
    ctx.addClear(HON[0],HON[1],10);for(const u of UMA)ctx.addClear(u[0],u[1],4);
    const lblSuwa=place('諏訪原城',HON[0],HON[1],{bg:'rgba(150,26,20,.88)',stroke:'rgba(255,255,255,.55)',size:0.038},9);
    const lblMaki=place('牧野城（旧 諏訪原城）',HON[0],HON[1],{bg:'rgba(34,62,140,.9)',stroke:'rgba(255,255,255,.55)',size:0.038},9);
    lblMaki.material.opacity=0;
    const lblUma=place('丸馬出',...UMA[1],{bg:'rgba(22,24,28,.72)',size:0.024},2);
    lblUma.material.opacity=0;

    /* 付城（徳川方の陣城） */
    const forts=[];
    for(const [fx,fz] of [[-8,15],[6,11],[14,23]]){
      const g=new THREE.Group();g.position.set(fx,gy(fx,fz),fz);scene.add(g);ctx.addClear(fx,fz,4);
      const mats=[];
      const pm=new THREE.MeshStandardMaterial({color:0x6b4f33,transparent:true,opacity:0});mats.push(pm);
      for(let i=0;i<20;i++){const s=Math.floor(i/5),k=i%5;const t=(k/4-.5)*3.6;const pos=[[t,-1.8],[1.8,t],[-t,1.8],[-1.8,-t]][s];
        const p=new THREE.Mesh(new THREE.BoxGeometry(.12,.7,.12),pm);p.position.set(pos[0],.35,pos[1]);p.castShadow=true;g.add(p);}
      const hm=new THREE.MeshStandardMaterial({color:0xd9ceb4,transparent:true,opacity:0});mats.push(hm);
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.2,.7,.85),hm);hut.position.y=.35;hut.castShadow=true;g.add(hut);
      const fm=new THREE.MeshStandardMaterial({map:SIDES.K.tex,side:THREE.DoubleSide,transparent:true,opacity:0});mats.push(fm);
      const fg=new THREE.PlaneGeometry(.45,1.2);fg.translate(.22,0,0);const f=new THREE.Mesh(fg,fm);f.position.set(1.1,1.8,-1.1);g.add(f);
      const pp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.4),pm);pp.position.set(1.1,1.2,-1.1);g.add(pp);
      const l=ctx.makeLabel('付城',{bg:'rgba(34,62,140,.85)',size:0.024});l.position.y=3;l.material.opacity=0;g.add(l);mats.push(l.material);
      forts.push({g,mats,op:0});
    }

    /* 軍勢 */
    const TKD=[[-150,38],[-118,26],at(34.8144,138.0945),at(34.8163,138.0971),at(34.8193,138.1076),at(34.8182,138.1110),at(34.8172,138.1147)];
    const units=[
      new Unit({side:'T',name:'武田・本曲輪の城兵',rows:3,cols:6,face:Math.atan2(F[0],F[1]),flags:[0],ly:5.8,
        keys:[HON,HON,HON,HON,HON,[[-4,-4],[14,4],[40,20],[80,40],[124,62]],null]}),
      new Unit({side:'T',name:'武田・二の曲輪',rows:3,cols:6,face:Math.atan2(F[0],F[1]),flags:[-1,1],
        keys:[fwd(4),fwd(4),fwd(4),fwd(4),[fwd(9,-2),fwd(4)],[[-2,-2],[16,6],[42,22],[82,42],[126,64]],null]}),
      new Unit({side:'T',name:'武田・馬出',rows:3,cols:5,face:Math.atan2(F[0],F[1]),flags:[0],ly:2.6,
        keys:[fwd(8.2),fwd(8.2),fwd(8.2),fwd(8.2),[fwd(14,-1),fwd(8.2)],[[0,0],[18,8],[44,24],[84,44],[128,66]],null]}),
      new Unit({side:'K',name:'徳川本隊（家康）',rows:5,cols:8,faceTo:HON,ly:5,
        keys:[null,null,[...TKD,[-20,4]],[[4,18]],[4,18],[4,17],[[-2,8],fwd(2)]]}),
      new Unit({side:'K',name:'徳川勢・北（金谷）',rows:4,cols:7,faceTo:HON,
        keys:[null,null,[[-150,-40],[-100,-44],[-60,-36],[-40,-24],at(34.8208,138.1195)],[[14,-22]],[14,-22],[12,-20],[[2,-16]]]}),
      new Unit({side:'K',name:'徳川勢・南',rows:4,cols:7,faceTo:HON,
        keys:[null,null,[[-150,70],[-100,56],[-60,40],[-34,30],[-16,24]],[[-6,20]],[-6,20],[-5,19],[[-10,10]]]}),
      new Unit({side:'K',name:'徳川勢・攻め手',rows:4,cols:7,faceTo:HON,
        keys:[null,null,[[-150,54],[-116,40],[-80,20],[-50,8],[-28,6]],[fwd(19,-3)],[[fwd(16,-2)],fwd(19,-3)],fwd(19,-3),[fwd(10,-1)]]}),
    ];

    const AI=0x3159c9,SHU=0xd0301f;
    const arrows=[
      new Arrow([[140,-66],[100,-56],at(34.8300,138.1480),at(34.8272,138.1411),at(34.8235,138.1320),at(34.8200,138.1275),[0,-4],fwd(1)],SHU,2.2,1),
      new Arrow([fwd(9),[-24,22],[-54,54],[-86,88],[-116,122]],SHU,2.2,1),
      new Arrow([...TKD,[-22,3]],AI,2.6,2),
      new Arrow([[-150,-40],[-100,-44],[-60,-36],[-40,-24],at(34.8208,138.1195)],AI,2.4,2),
      new Arrow([[-150,70],[-100,56],[-60,40],[-34,30],[-18,24]],AI,2.4,2),
      new Arrow([[4,20],[-2,12],fwd(12,1)],AI,1.8,3),
      new Arrow([[-6,22],[-12,18],fwd(13,-4)],AI,1.8,3),
      new Arrow([[14,-22],[4,-18],[-6,-14]],AI,1.6,3),
      new Arrow([fwd(8.2),fwd(12,-1),fwd(15,-1)],SHU,1.3,4),
      new Arrow([fwd(21,-4),fwd(17,-3),fwd(13.5,-2)],AI,1.4,4),
      new Arrow([HON,[-2,-2],[16,6],[42,22],[82,42],[124,62]],SHU,3,5),
      new Arrow([fwd(15,-1),fwd(9),fwd(3)],AI,2,6),
    ];

    /* 煙・火花 */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<50;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vz:0});}
    const flashes=[];for(let i=0;i<18;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const s=new THREE.Sprite(m);s.scale.setScalar(1.1);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.8,pz);p.life=p.max=3+Math.random()*2.5;p.vx=.4+Math.random()*.5;p.vz=(Math.random()-.5)*.4;p.s.visible=true;}
    let emitAcc=0;
    const fireC=fwd(14,-1);
    function update(cur,tIn,dt,time){
      for(const f of forts){const tgt=cur>=3?1:0;f.op+=(tgt-f.op)*Math.min(1,dt*2);for(const m of f.mats)m.opacity=f.op;f.g.visible=f.op>0.02;}
      const isMaki=cur===6&&tIn>2.5;
      cflagM.map=isMaki?SIDES.K.tex:SIDES.T.tex;
      lblSuwa.material.opacity+=((isMaki?0:1)-lblSuwa.material.opacity)*Math.min(1,dt*3);
      lblMaki.material.opacity+=((isMaki?1:0)-lblMaki.material.opacity)*Math.min(1,dt*3);
      lblUma.material.opacity+=(((cur===0||cur===4)?1:0)-lblUma.material.opacity)*Math.min(1,dt*3);
      cflag.rotation.y=Math.sin(time*1.8)*.3;
      const firing=cur===4&&tIn>1.2,retreat=cur===5&&tIn<7;
      emitAcc+=dt;
      if(emitAcc>0.09){emitAcc=0;
        if(firing){const u=UMA[(Math.random()*3)|0];emit(u[0]+F[0]*3,u[1]+F[1]*3,3);if(Math.random()<.5)emit(fireC[0],fireC[1],5);}
        if(retreat&&Math.random()<.6)emit(HON[0],HON[1],4);}
      for(const p of smoke){if(p.life<=0)continue;p.life-=dt;const a=1-p.life/p.max;
        p.s.position.x+=p.vx*dt;p.s.position.z+=p.vz*dt;p.s.position.y+=dt*1.3;p.s.scale.setScalar(1.1+a*4.5);
        p.s.material.opacity=Math.sin(Math.PI*a)*.55;if(p.life<=0)p.s.visible=false;}
      for(const f of flashes){
        if(!firing){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.25+Math.random()*1.3;const x=fireC[0]+(Math.random()-.5)*6,z=fireC[1]+(Math.random()-.5)*6;f.s.position.set(x,gy(x,z)+.8,z);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }
    return {units,arrows,update};
  }
});
})();
