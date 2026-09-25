(function(){
const TAU=Math.PI*2,W_=-Math.PI/2,E_=Math.PI/2;
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  if(side==='W'){x.fillStyle='#b8231b';x.fillRect(0,0,64,200);x.strokeStyle='#f3efe4';x.lineWidth=5;x.beginPath();x.arc(32,50,17,0,TAU);x.stroke();x.fillStyle='#f3efe4';x.fillRect(29,78,6,96);}
  else{x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);x.strokeStyle='#1d1d1d';x.lineWidth=4;x.beginPath();x.arc(32,50,19,0,TAU);x.stroke();
    x.fillStyle='#1d1d1d';for(let k=0;k<3;k++){const a=-Math.PI/2+k*2*Math.PI/3;x.beginPath();x.ellipse(32+Math.cos(a)*8,50+Math.sin(a)*8,5.5,8,a+Math.PI/2,0,TAU);x.fill();}
    x.fillStyle='#2848a0';x.fillRect(0,0,64,10);}
  return new THREE.CanvasTexture(c);
}
const SIDES={
  W:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('W')},
  E:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('E')},
};
const PH=[
  {act:'序',date:'慶長5年9月14日 夜',title:'決戦前夜',text:'石田三成ら西軍の主力は大垣城を出て、雨の夜道を南へ回り込み、牧田から伊勢街道を北上して関ヶ原の西側の山すそに布陣した。松尾山には小早川秀秋、東の南宮山には毛利秀元・吉川広家らがすでに陣取っていた。'},
  {act:'一',date:'9月15日 早朝',title:'東軍、霧の中を進む',text:'西軍の動きを知った徳川家康も、赤坂から中山道を西へ進んで関ヶ原の盆地に入った。この朝は深い霧が立ちこめ、両軍は互いの姿がよく見えないまま向き合ったとされる。家康は東の桃配山に本陣を置いた。'},
  {act:'二',date:'午前8時頃（通説）',title:'開戦',text:'霧が晴れはじめたころ、井伊直政と松平忠吉の隊が福島正則隊の脇を抜けて前に出て、西軍へ攻めかかったのが開戦のきっかけと伝わる（開戦地）。福島隊も天満山の宇喜多隊へ突入した。'},
  {act:'三',date:'午前',title:'一進一退',text:'笹尾山の石田隊には黒田長政・細川忠興らが押し寄せ、大谷吉継隊は藤堂高虎・京極高知らと激しく戦った。宇喜多隊は福島隊を押し返す。三成は狼煙を上げて味方の参戦を促したが、南宮山の毛利勢は前に陣取る吉川広家が動かず、山を下りなかった。家康は本陣を陣場野まで前へ進めた。'},
  {act:'四',date:'正午頃（通説）',title:'小早川秀秋の寝返り',text:'松尾山の小早川秀秋が東軍に付き、山を下って大谷隊の側面を突いた。家康が松尾山へ鉄砲を撃ちかけて決断を迫ったという「問鉄砲」の話は有名だが、史実かどうかは疑問視されている。'},
  {act:'五',date:'午後',title:'西軍の崩壊',text:'小早川に備えていた脇坂安治・朽木元綱・小川祐忠・赤座直保の4隊も寝返り、大谷隊は壊滅した。これをきっかけに小西隊・宇喜多隊が崩れ、石田隊も伊吹山の方へ退いた。'},
  {act:'六',date:'午後',title:'島津の退き口',text:'戦場に取り残された島津義弘の隊は、退路を後方ではなく前方に求めた。家康本陣の近くをかすめて東軍の中を突き抜け、伊勢街道を南へ退く。追撃した井伊直政は負傷し、島津方も多くの犠牲を出した。'},
  {act:'結',date:'慶長5年9月15日 夕',title:'天下分け目の決着',text:'戦いは一日で決着した。南宮山の毛利勢などは戦わないまま撤退した。この後、三成は捕らえられ、家康は天下の実権を握っていく。なお、布陣や経過の細部については、近年の研究で通説とは異なる見方も出ている。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る
const CAM=[
  {t:[-20,null,40],d:270,yaw:0.5,pitch:1.0},
  {t:[8,null,-6],d:210,yaw:0.28,pitch:0.72},
  {t:[-66,null,0],d:72,yaw:0.95,pitch:0.55},
  {t:[-62,null,-2],d:125,yaw:0.45,pitch:0.85},
  {t:[-80,null,40],d:100,yaw:1.3,pitch:0.58},
  {t:[-80,null,0],d:155,yaw:0.25,pitch:0.95},
  {t:[-32,null,42],d:175,yaw:0.8,pitch:0.9},
  {t:[-10,null,20],d:320,yaw:-0.3,pitch:1.05},
];
const DAY={bg:0xb4cadb,fn:260,ff:760,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  {bg:0x1d2740,fn:150,ff:560,sun:0.22,sunC:0x9fb4ff,hemi:0.32},
  {bg:0xd9dcdc,fn:60,ff:340,sun:0.5,sunC:0xfff4e0,hemi:0.78},
  {bg:0xcdd6da,fn:70,ff:400,sun:0.75,sunC:0xfff0d8,hemi:0.68,slow:true},
  DAY,DAY,DAY,DAY,
  {bg:0xd8b894,fn:260,ff:700,sun:0.8,sunC:0xffc890,hemi:0.55},
];

Sengoku.start({
  id:'sekigahara',
  title:'関ヶ原の戦い',
  subtitle:'慶長5年9月15日（1600年10月21日）　徳川家康の東軍と石田三成らの西軍による決戦',
  legend:[{color:'#2c4fb0',label:'東軍'},{color:'#c0281f',label:'西軍'},{color:'#8b3fc4',label:'寝返り'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。地表の色分けは当時を想定したもので、布陣は陣跡の位置をもとにした概念的な再現です（細部には諸説あり。「諸説」ボタンから読めます）。人や旗の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:16000,conifer:.5,seed:11,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#566b34',b2:'#7b7a3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit}=ctx;
    const mt={bg:'rgba(52,64,36,.8)',size:0.028};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.025,weight:500,family:'"Noto Sans JP",sans-serif'};
    const rdStyle={bg:'rgba(120,98,54,.82)',size:0.024};
    const at=(la,lo)=>LL(la,lo);
    // 地名（位置は実座標）
    place('笹尾山',...at(35.3735,136.4575),mt,8);
    place('天満山',...at(35.3645,136.4515),mt,5);
    place('松尾山',...at(35.3455,136.4530),mt,8);
    place('南宮山',...at(35.34683,136.50978),mt,7);
    place('桃配山',...at(35.36545,136.48789),mt,4);
    place('藤古川',...at(35.3560,136.4568),{bg:'rgba(34,78,104,.8)',size:0.024},1.5);
    place('中山道',...at(35.3683,136.4995),rdStyle,2);
    place('北国脇往還',...at(35.3745,136.4468),rdStyle,2);
    place('伊勢街道',...at(35.3445,136.4800),rdStyle,2);
    place('関ケ原',...at(35.3634,136.4700),{bg:'rgba(22,24,28,.7)',size:0.024},4);
    place('垂井',...at(35.3700,136.5130),{bg:'rgba(22,24,28,.7)',size:0.024},4);
    place('↑ 伊吹山方面',-70,-160,dirStyle,4);
    place('大垣・赤坂方面 →',160,-30,dirStyle,4);
    place('↓ 牧田・伊勢方面',60,158,dirStyle,4);

    // 宿場の家並み（中山道沿い）
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(a,b,n,side){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s,y=gy(px,pz),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    town(at(35.3642,136.4760),at(35.3628,136.4665),16);   // 関ヶ原宿
    town(at(35.3712,136.5185),at(35.3702,136.5080),10);   // 垂井宿
    town(at(35.3593,136.4600),at(35.3588,136.4560),4);    // 不破関あたり

    // 陣跡（シーン座標）
    const P={
      ishida:at(35.37177,136.45883),shimazu:at(35.3671,136.4592),konishi:at(35.3668,136.4552),ukita:at(35.3635,136.4540),
      otani:at(35.35852,136.45037),wakisaka:at(35.3555,136.4555),kobaya:at(35.34716,136.45431),
      mouri:at(35.3515,136.503),chosokabe:at(35.3470,136.4915),
      fukushima:at(35.35925,136.46112),todo:at(35.3594,136.46414),kuroda:at(35.3688,136.4690),
      ieyasu1:at(35.36545,136.48789),ieyasu2:at(35.3655,136.4655),honda:at(35.3640,136.4680),
      ikeda:at(35.3665,136.4985),ii:at(35.3642,136.4640),kaisen:at(35.36554,136.45839),kessen:at(35.37054,136.46156),
    };
    // 伊勢街道（牧田 → 関ヶ原）と中山道（東 → 関ヶ原）
    const ISE=[[150,152],[100,128],at(35.332,136.503),at(35.3350,136.4920),at(35.3430,136.4810),at(35.3500,136.4760),at(35.3570,136.4710)];
    const NAKA=[[176,-31],[130,-29],at(35.3708,136.5117),at(35.3690,136.5000),at(35.3662,136.4898),at(35.3646,136.4780)];
    const sh=(pts,o)=>pts.map(([x,z],i)=>[x+o*.5,z+o]);
    const wr=(o,rest)=>[...sh(ISE,o*.35),...rest];
    const re=(o,rest)=>[...sh(NAKA,o*.3),...rest];
    const S=(v,n)=>Array(n).fill(v);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];

    const units=[
      // 西軍
      new Unit({side:'W',name:'石田三成',rows:4,cols:7,face:2.2,keys:[wr(0,[[-40,-6],[-56,-20],P.ishida]),...S(P.ishida,4),{p:[[-72,-40],[-88,-70],[-96,-110]]},null,null]}),
      new Unit({side:'W',name:'島津義弘',rows:3,cols:6,face:1.9,keys:[wr(3,[[-42,-2],P.shimazu]),...S(P.shimazu,5),{p:[[-50,-4],[-40,2],[-33,9],off(ISE[6],0,0),ISE[5],ISE[4],ISE[3],ISE[2],[100,128]]},null]}),
      new Unit({side:'W',name:'小西行長',rows:4,cols:6,face:1.9,keys:[wr(6,[[-46,4],P.konishi]),...S(P.konishi,4),{p:[[-92,-28],[-112,-55]]},null,null]}),
      new Unit({side:'W',name:'宇喜多秀家',rows:5,cols:8,face:1.7,keys:[wr(9,[[-52,12],P.ukita]),P.ukita,P.ukita,[off(P.ukita,6,2)],off(P.ukita,5,2),{p:[[-100,-10],[-128,-28]]},null,null]}),
      new Unit({side:'W',name:'大谷吉継',rows:4,cols:6,face:1.6,keys:[wr(12,[[-56,24],P.otani]),...S(P.otani,3),off(P.otani,1,1),{p:[[-95,18],[-101,16]]},null,null]}),
      new Unit({side:'W',name:'脇坂ら四将',rows:3,cols:7,face:-0.1,turn:5,turnSide:'E',turnLabel:'rgba(118,48,170,.9)',ly:3.2,keys:[wr(15,[[-50,32],P.wakisaka]),...S(P.wakisaka,4),[off(P.wakisaka,-5,-2),off(P.otani,9,6)],off(P.otani,9,6),off(P.otani,9,6)]}),
      new Unit({side:'W',name:'小早川秀秋',rows:5,cols:8,face:Math.PI*.92,turn:4,turnSide:'E',turnLabel:'rgba(118,48,170,.9)',ly:6.5,keys:[...S(P.kobaya,4),[[-73,50],[-82,38],off(P.otani,1,10)],off(P.otani,1,9),off(P.otani,1,9),off(P.otani,1,9)]}),
      new Unit({side:'W',name:'毛利秀元・吉川広家',rows:5,cols:8,face:-2.3,ly:5,keys:[...S(P.mouri,7),{p:[[90,78],[118,112],[150,145]]}]}),
      new Unit({side:'W',name:'長宗我部・長束ら',rows:4,cols:7,face:-2.4,keys:[...S(P.chosokabe,7),{p:[[58,92],[86,128],[112,160]]}]}),
      // 東軍
      new Unit({side:'E',name:'福島正則',rows:4,cols:7,face:W_,keys:[null,re(-3,[[-40,8],P.fukushima]),[off(P.ukita,9,6)],[off(P.ukita,14,9)],off(P.ukita,13,9),[off(P.ukita,6,4)],off(P.ukita,6,4),off(P.ukita,6,4)]}),
      new Unit({side:'E',name:'井伊直政・松平忠吉',rows:3,cols:6,face:W_,keys:[null,re(-6,[P.ii]),[off(P.kaisen,4,0)],off(P.kaisen,4,0),off(P.kaisen,3,0),[off(P.kaisen,-4,-3)],[[-52,-4],[-40,3],[-33,11],off(ISE[6],3,6)],off(ISE[6],3,6)]}),
      new Unit({side:'E',name:'黒田長政・細川忠興',rows:4,cols:7,face:W_,keys:[null,re(0,[P.kuroda]),P.kuroda,[off(P.kessen,4,0)],off(P.kessen,3,0),[off(P.ishida,7,3)],off(P.ishida,7,3),off(P.ishida,7,3)]}),
      new Unit({side:'E',name:'藤堂高虎・京極高知',rows:4,cols:6,face:W_,ly:5.6,keys:[null,re(3,[[-40,12],P.todo]),P.todo,[off(P.otani,12,1)],off(P.otani,11,1),[off(P.otani,6,0)],off(P.otani,6,0),off(P.otani,6,0)]}),
      new Unit({side:'E',name:'本多忠勝',rows:3,cols:5,face:W_,keys:[null,re(-9,[P.honda]),P.honda,[[-46,-8]],[-48,-8],[[-58,-12]],[[-50,-6]],[-50,-6]]}),
      new Unit({side:'E',name:'徳川家康（本陣）',rows:6,cols:8,face:W_,ly:5,keys:[null,re(-12,[P.ieyasu1]),P.ieyasu1,[[0,-4],P.ieyasu2],...S(P.ieyasu2,4)]}),
      new Unit({side:'E',name:'池田・浅野ら（南宮山の抑え）',rows:4,cols:7,face:0.35,keys:[null,re(6,[P.ikeda]),...S(P.ikeda,6)]}),
    ];

    const AI=0x3159c9,SHU=0xd0301f,MURA=0x9444d6;
    const arrows=[
      new Arrow([...ISE,[-40,4],[-54,-8]],SHU,3,0),
      new Arrow([...NAKA,[-20,0],[-34,-2]],AI,3.2,1),
      new Arrow([P.ii,off(P.kaisen,8,1),off(P.kaisen,1,-1)],AI,2,2),
      new Arrow([P.fukushima,off(P.ukita,14,8),off(P.ukita,6,4)],AI,2,2),
      new Arrow([P.kuroda,[-45,-22],off(P.ishida,6,3)],AI,2,3),
      new Arrow([P.todo,[-64,19],off(P.otani,6,1)],AI,2,3),
      new Arrow([off(P.ukita,4,2),off(P.ukita,10,6),off(P.ukita,15,10)],SHU,1.6,3),
      new Arrow([P.ieyasu1,[0,-4],[-22,-5],P.ieyasu2],AI,1.8,3),
      new Arrow([P.kobaya,[-73,50],[-82,38],off(P.otani,1,10)],MURA,2.8,4,5),
      new Arrow([P.wakisaka,off(P.wakisaka,-5,-2),off(P.otani,9,6)],MURA,2.2,5),
      new Arrow([P.ishida,[-72,-40],[-88,-70],[-96,-108]],SHU,2,5),
      new Arrow([P.konishi,[-92,-28],[-110,-52]],SHU,2,5),
      new Arrow([P.ukita,[-100,-10],[-126,-27]],SHU,2,5),
      new Arrow([P.shimazu,[-50,-4],[-40,2],[-33,9],ISE[6],ISE[5],ISE[4],ISE[3],ISE[2]],SHU,3.2,6),
      new Arrow([[-58,-6],[-45,1],[-35,10],off(ISE[6],3,6)],AI,1.6,6),
      new Arrow([P.mouri,[90,78],[116,110]],SHU,2.2,7),
      new Arrow([P.chosokabe,[58,92],[84,125]],SHU,2,7),
    ];

    // 煙・火花・狼煙
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<80;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<30;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.4);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,noroshi){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.8,pz);p.life=p.max=noroshi?6:3+Math.random()*2.5;
      p.vx=noroshi?.3:.6+Math.random()*.6;p.vy=noroshi?4.5:1.4;p.vz=(Math.random()-.5)*.4;p.g=noroshi?.5:.8;
      p.s.material.color.set(noroshi?0xe8e4dc:0xcfcac2);p.s.visible=true;}
    const z3=(p,dx,dz,s)=>[p[0]+dx,p[1]+dz,s];
    const FIRE={2:[z3(P.kaisen,3,-1,6),z3(P.ukita,10,5,7)],3:[z3(P.ishida,6,3,7),z3(P.otani,9,1,7),z3(P.ukita,9,5,7)],
      4:[z3(P.otani,2,7,8),z3(P.ukita,8,4,7),z3(P.ishida,6,3,7)],5:[z3(P.otani,3,2,8),z3(P.konishi,4,0,9),z3(P.ukita,4,2,9)],6:[[-44,0,9],[-33,12,8]]};
    let emitAcc=0;
    function update(cur,tIn,dt){
      const zones=tIn>1.2?FIRE[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
        if(cur===3&&tIn>2)emit(P.ishida[0]-1,P.ishida[1]-2,1.2,true);}
      for(const p of smoke){if(p.life<=0)continue;p.life-=dt;const a=1-p.life/p.max;
        p.s.position.x+=p.vx*dt;p.s.position.z+=p.vz*dt;p.s.position.y+=dt*p.vy;p.s.scale.setScalar((1.6+a*6)*p.g);
        p.s.material.opacity=Math.sin(Math.PI*a)*.55;if(p.life<=0)p.s.visible=false;}
      for(const f of flashes){
        if(!zones){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.2+Math.random()*1.2;const z=zones[(Math.random()*zones.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }
    return {units,arrows,update};
  }
});
})();
