(function(){
const TAU=Math.PI*2;

/* ---------------- 家紋（旗） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='O'){                       // 織田: 織田木瓜（円の中に5弁の花・簡略）
    x.lineWidth=r*.13;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.26,r*.36,a+Math.PI/2,0,TAU);x.fill();}
    x.beginPath();x.arc(cx,cy,r*.14,0,TAU);x.fill();
  }else if(side==='T'){                 // 徳川: 三つ葉葵（簡略）
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.46,a+Math.PI/2,0,TAU);x.fill();}
  }else if(side==='A'){                 // 浅井: 亀甲に花菱（六角形の枠の中に菱形の花）
    x.lineWidth=r*.15;x.beginPath();
    for(let k=0;k<6;k++){const a=k*TAU/6;const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;k?x.lineTo(px,py):x.moveTo(px,py);}
    x.closePath();x.stroke();
    for(let k=0;k<4;k++){const a=k*TAU/4,d=r*.3;const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d;
      x.beginPath();x.moveTo(px-r*.22,py);x.lineTo(px,py-r*.22);x.lineTo(px+r*.22,py);x.lineTo(px,py+r*.22);x.closePath();x.fill();}
  }else{                                // 朝倉: 三つ盛木瓜（小さな木瓜を3つ、品字形に・簡略）
    x.lineWidth=r*.12;
    for(const [dx,dy] of [[0,-.48],[-.5,.38],[.5,.38]]){const px=cx+dx*r,py=cy+dy*r;
      x.beginPath();x.arc(px,py,r*.4,0,TAU);x.stroke();x.beginPath();x.arc(px,py,r*.16,0,TAU);x.fill();}
  }
}
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  const K={O:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'},T:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#1f7a6f'},
    A:{bg:'#b8231b',fg:'#f3efe4'},S:{bg:'#d6ad62',fg:'#2a1d10'}}[side];
  x.fillStyle=K.bg;x.fillRect(0,0,64,200);crest(x,side,32,52,17,K.fg);
  if(K.band){x.fillStyle=K.band;x.fillRect(0,0,64,10);}
  x.fillStyle=K.fg;x.fillRect(29,90,6,86);
  return new THREE.CanvasTexture(c);
}
const SIDES={
  O:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('O')},
  T:{body:new THREE.Color(0x1e5e56),label:'rgba(24,96,86,.88)',tex:flagTex('T')},
  A:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('A')},
  S:{body:new THREE.Color(0x8a5a1e),label:'rgba(140,92,30,.88)',tex:flagTex('S')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'元亀元年（1570）4月〜6月',title:'小谷城と、浅井の離反',text:'元亀元年4月、織田信長は徳川家康とともに越前の朝倉領へ攻め入った。ところが妹のお市の方を嫁がせていた浅井長政が朝倉方についたと知り、挟み撃ちを避けて朽木越え（くつきごえ）で京へ退いた（お市の方が小豆の袋で危険を知らせたという話は、後世の創作と指摘されている）。浅井氏の居城は、小谷山の尾根に築かれた小谷城である。姉川をはさんだ南の横山城も、浅井方の支城だった。'},
  {act:'一',date:'6月19日〜22日',title:'小谷城下の焼き討ち',text:'6月19日、信長は岐阜を出て、寝返りで手に入った国境の長比城（たけくらべじょう）に入った。21日には小谷城と向かい合う虎御前山（とらごぜやま）に陣を取り、森可成・柴田勝家・木下秀吉らに命じて、小谷城の城下町を広い範囲で焼き払わせた。信長は城そのものは攻めず、22日、鉄砲500・弓30の殿軍（しんがり）を付けていったん兵を引いた。'},
  {act:'二',date:'6月24日',title:'横山城の包囲と龍ヶ鼻',text:'24日、信長は姉川を隔てて小谷城の南にある横山城を囲んだ。横山城は街道のすぐ脇にあり、小谷城から6〜7kmしか離れていない浅井方の前線の城である。信長は横山丘陵の北の端、龍ヶ鼻（たつがはな）に本陣を置いた。同じころ徳川家康の軍勢が合流し、同じく龍ヶ鼻に陣を取ったと伝わる。'},
  {act:'三',date:'6月24日〜27日',title:'大依山の浅井・朝倉',text:'同じころ、朝倉景健（あさくらかげたけ）の率いる援軍が着き、小谷城の東の大依山（おおよりやま）に陣を敷いた。浅井長政の軍勢も加わり、通説（『信長公記』）では朝倉8,000・浅井5,000、あわせて13,000とされる（2万〜3万とする史料もある）。朝倉義景自身は出陣していない。27日の明け方、浅井・朝倉は陣を払って退いたものと見えた、と『信長公記』は記す（通説の読み）。'},
  {act:'四',date:'6月28日 未明〜午前6時ごろ',title:'姉川の河原で',text:'28日の未明、浅井・朝倉の軍勢は再び姉川の北岸に現れ、二手に分かれて東の野村に浅井、西の三田村に朝倉が陣を敷いた。南岸では、徳川勢が西の朝倉勢へ、信長の馬廻（うままわり）などが東の浅井勢へ向かったとされる。午前6時ごろ、姉川の河原で戦いが始まった。『甫庵信長記』は、息をつぐ間もないほどの激しい戦いだったと描いている。'},
  {act:'五',date:'6月28日 午前',title:'磯野の突進、稲葉と榊原',text:'浅井方の先鋒・磯野員昌（いそのかずまさ）の隊は、坂井政尚・池田恒興・木下秀吉・柴田勝家の陣を次々に破り、信長の本陣近くまで迫ったと伝わる（「十三段崩し」。『浅井三代記』が初出で、後世の創作とみる見方が強い）。別の方面では、稲葉一鉄の隊が駆けつけて浅井勢の右翼を崩したとされる。西では徳川勢が朝倉勢を押し、通説では家康が榊原康政に朝倉勢の側面を突かせたとされる。朝倉勢が崩れ、続いて浅井勢も崩れた。'},
  {act:'六',date:'6月28日（戦いのあと）',title:'追撃と退却',text:'信長は退く浅井勢を50町（約5.5km）ほど追い討ちし、小谷城の麓の家々に火を放ったと『信長公記』は記す。しかし山城の小谷城を一気に落とすのは難しいと見て、横山城のもとへ兵を戻した。『信長公記』は討ち取った数を1,100余りとする（数千とする史料もある）。浅井方では遠藤直経・浅井政之、朝倉方では真柄直隆らが討ち死にしたと伝わる。'},
  {act:'結',date:'元亀元年6月〜天正元年（1573）',title:'横山城の開城と、その後',text:'戦いのあと、まもなく横山城は降伏し、信長は木下秀吉を城番に入れた。しかし姉川の戦いは決定打にはならなかった。浅井・朝倉には余力があり、比叡山や石山本願寺と結んで志賀の陣で戦い続け、織田方も森可成・坂井政尚らを失った。浅井氏が小谷城で滅んだのは、3年後の天正元年（1573）9月である。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る
const CAM=[
  {t:[-15,null,-20],d:295,yaw:0.2,pitch:0.72},
  {t:[-62,null,-111],d:135,yaw:0.6,pitch:0.7},
  {t:[111,null,100],d:160,yaw:0.1,pitch:0.75},
  {t:[14,null,-88],d:180,yaw:-0.5,pitch:0.85},
  {t:[62,null,38],d:160,yaw:0.0,pitch:1.2},
  {t:[60,null,45],d:150,yaw:0.2,pitch:1.0},
  {t:[35,null,35],d:320,yaw:0.3,pitch:0.6},
  {t:[50,null,75],d:370,yaw:0.45,pitch:0.58},
];
const DAY={bg:0xc5d3da,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  DAY,DAY,DAY,
  {bg:0x737c96,fn:220,ff:720,sun:0.45,sunC:0xffa878,hemi:0.46},           // 夕方（暮れて青む）
  {bg:0xd2d8d6,fn:260,ff:800,sun:0.9,sunC:0xffe6c0,hemi:0.6,slow:true},  // 夜明け→朝
  {bg:0xcfd8dc,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62},
  DAY,
  {bg:0xd8c0a4,fn:260,ff:780,sun:0.8,sunC:0xffd0a0,hemi:0.55},
];

Sengoku.start({
  id:'anegawa',
  title:'姉川の戦い',
  subtitle:'元亀元年（1570）6月28日　織田信長・徳川家康の連合軍と、浅井長政・朝倉景健の連合軍が姉川の河原で戦う',
  legend:[{color:'#2c4fb0',label:'織田軍'},{color:'#1f7a6f',label:'徳川軍'},{color:'#c0281f',label:'浅井軍'},{color:'#c98a2e',label:'朝倉軍'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データを高さ2倍に強調して表示。龍ヶ鼻・大依山・家康の陣・血原・遠藤塚などの位置は概略です。城・村・軍勢の位置と経路は流れを理解するための概念的な再現です（兵力や経過の細部には諸説あり。「諸説」ボタンから読めます）。当日の天候は参照した資料に記述がなく、晴れとして描いています。人・旗・建物の大きさは見やすさのため誇張しています。旗の家紋は見分けのための簡略な表現です（朝倉の紋は参照した資料で確定できていません）。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:15000,conifer:.5,seed:13,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#4f6a34',b2:'#6f7f3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,rnd,reduceMotion}=ctx;
    const water=(x,z)=>ctx.G.coverAt(x,z)===255;

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const ODANI=LL(35.45936,136.27707);     // 小谷城 本丸
    const ODANI_N=[-46,-160],ODANI_S=[-30,-133],ODANI_E=[-25,-150],ODANI_W=[-53,-138];   // 小谷城の尾根の曲輪
    const IBE=LL(35.4527,136.2735),GUJO=LL(35.4568,136.2687);   // 小谷の城下
    const TORA=LL(35.44336,136.26219);      // 虎御前山
    const OYORI=LL(35.4400,136.3125);       // 大依山（概略）
    const YOKO=LL(35.39269,136.33419);      // 横山城
    const TATSU=LL(35.4065,136.3320);       // 龍ヶ鼻（概略）
    const OKAYAMA=LL(35.4109,136.3170);     // 岡山（勝山）
    const NOMURA=LL(35.41925,136.3234),MITA=LL(35.41767,136.3002);
    const HI=LL(35.41607,136.32199);        // 姉川古戦場碑（旧野村橋）
    const CHIHARA=LL(35.4160,136.3060);     // 血原（概略）
    const ENDO_T=[111,46];                  // 遠藤塚（東上坂のあたり）
    const IMAHAMA=LL(35.3775,136.2611);
    const HAJIKA=LL(35.445,136.295);        // 追撃で火を放った小谷の麓（概略）
    // 経路
    const E_ODA=LL(35.408,136.352),FORD=LL(35.4155,136.3195),YASHIMA=LL(35.43874,136.29912);
    const ODA_IN=[E_ODA,LL(35.4076,136.3253),FORD,YASHIMA];               // 長比城から西へ、姉川を渡って虎御前山へ
    const BURN=[GUJO,IBE];                                                  // 城下の焼き討ち
    const BACK22=[YASHIMA,FORD];                                            // 22日、虎御前山から姉川の南へ
    const SIEGE_NW=LL(35.3965,136.328),SIEGE_E=LL(35.3935,136.340),SIEGE_SW=LL(35.3885,136.330);
    const TOKU_IN=[LL(35.398,136.352),LL(35.4034,136.328)];                 // 家康、東から合流
    const ASA_IN=[LL(35.472,136.30),LL(35.46,136.305),LL(35.45,136.31)];    // 朝倉、北から大依山へ
    const AZAI_OUT=[LL(35.452,136.29),LL(35.445,136.305)];                  // 浅井、小谷城から大依山の西へ
    const NIGHT_AZ=LL(35.43,136.315),NIGHT_AS=LL(35.43,136.305);            // 28日未明の移動の中継
    const ISONO=[[97,17],[105,27],[113,36],[95,11]];                        // 磯野の突進（伝承）
    const INABA=[[91,56],[79,30],[72,10]];                                  // 稲葉、横山の包囲から浅井の右翼へ
    const SAKAKI=[[12,22],[15,13],[21,9]];                                  // 榊原、朝倉の側面へ（通説）
    const ROUT_AZ=[[66,-37],[9,-100],[-21,-130]];                           // 浅井の退却（小谷城へ）
    const ROUT_AS=[[6,-44],[-15,-111],[-36,-193]];                          // 朝倉の退却（北へ）
    const PURSUIT=[NOMURA,[60,-37],HAJIKA,[91,0]];                          // 信長の追撃
    const T1=k=>[TORA[0]+k*10*.8+(k%2?4:0),TORA[1]-k*10*.6+(k%2?7:0)];
    const off=(path,dx,dz)=>path.map(p=>[p[0]+dx,p[1]+dz]);

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.028},wt={bg:'rgba(34,78,104,.8)',size:0.026},tn={bg:'rgba(22,24,28,.7)',size:0.023};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.025,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('小谷山',...LL(35.46574,136.27353),mt,26);
    const lblTora=place('虎御前山（信長の陣・6月21日）',TORA[0]-14,TORA[1]+7,mt,5);
    place('大依山',OYORI[0]+4,OYORI[1]-8,mt,22);
    const lblTatsu=place('龍ヶ鼻',TATSU[0]+16,TATSU[1],mt,2);
    const lblOka=place('岡山（勝山）',...OKAYAMA,{bg:'rgba(52,64,36,.72)',size:0.022},2);
    place('姉川',...LL(35.4155,136.343),wt,2);
    place('姉川',...LL(35.412,136.27),wt,2);
    place('高時川',...LL(35.426,136.243),wt,2);
    place('草野川',...LL(35.428,136.29),wt,2);
    place('琵琶湖',...LL(35.38,136.235),wt,2);
    const lblNomura=place('野村',NOMURA[0]+3,NOMURA[1]-13,tn,3);
    const lblMita=place('三田村',MITA[0]-1,MITA[1]-18,tn,3);
    const lblIbe=place('伊部',IBE[0]+9,IBE[1]+4,tn,2);
    const lblGujo=place('郡上',GUJO[0]-10,GUJO[1]+3,tn,2);
    place('今浜（のちの長浜）',...IMAHAMA,tn,3);
    for(const [n,la,lo] of [['宮部',35.41967,136.27968],['湯次',35.42588,136.28258],['八島',35.43874,136.29912],['中野',35.4368,136.25936],['石田村',35.38651,136.32794]])
      place(n,...LL(la,lo),tn,3);
    place('長比城・岐阜方面 →',...LL(35.405,136.352),dirStyle,4);
    place('↑ 木之本・越前方面（朝倉の進路）',...LL(35.474,136.312),dirStyle,4);
    place('↓ 佐和山・京方面',...LL(35.368,136.30),dirStyle,4);
    place('← 琵琶湖',...LL(35.40,136.232),dirStyle,3);

    /* ---------------- 家並み ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(a,b,n){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s;if(water(px,pz))continue;
        const y=gy(px,pz),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    const tw=(p,dx,n)=>town([p[0]-dx,p[1]],[p[0]+dx,p[1]+1],n);
    tw(IBE,4,5);tw(GUJO,4,5);
    town([96,-6],[108,-3],6);          // 野村
    town([25,-4],[37,-3],6);           // 三田村
    tw(IMAHAMA,5,6);
    for(const [la,lo,n] of [[35.41967,136.27968,4],[35.42588,136.28258,4],[35.43874,136.29912,5],[35.4368,136.25936,4],[35.44515,136.25421,4],[35.40764,136.32531,4],[35.40339,136.32803,3],[35.38651,136.32794,5]]){
      const p=LL(la,lo);tw([p[0],p[1]-3],3,n);}

    /* ---------------- 城（小谷城・横山城）と土塁 ---------------- */
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95});
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    function fort(p,s,side,flag){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.2*s,3.0*s,.9*s,24),earthM);mound.position.y=.25*s;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<24;i++){const a=i/24*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.11,.7*s,.11),woodM);q.position.set(Math.cos(a)*1.95*s,1.0*s,Math.sin(a)*1.95*s);q.castShadow=true;g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.2*s,.7*s,.9*s),wallM);hut.position.y=1.05*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.y=1.63*s;r.scale.set(1,1,.8);r.castShadow=true;g.add(r);
      let fm=null;
      if(flag!==false){
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.8*s),woodM);pole.position.set(1.0*s,2.0*s,-.7*s);g.add(pole);
        const fg=new THREE.PlaneGeometry(.45*s,1.3*s);fg.translate(.22*s,0,0);
        fm=new THREE.MeshStandardMaterial({map:SIDES[side].tex,side:THREE.DoubleSide,roughness:.8});
        const f=new THREE.Mesh(fg,fm);f.position.set(1.03*s,2.7*s,-.7*s);g.add(f);}
      ctx.addClear(p[0],p[1],4.5*s);
      return {g,fm};
    }
    // 小谷城: 尾根に曲輪を3段
    fort(ODANI,1.1,'A');fort(ODANI_N,.7,'A',false);fort(ODANI_S,.7,'A',false);
    place('小谷城',ODANI[0],ODANI[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.034},17);
    // 横山城（結で織田の城に替わる）
    const fYoko=fort(YOKO,1,'A');
    const lblYokoA=place('横山城',YOKO[0],YOKO[1],{bg:'rgba(150,26,20,.88)',size:0.03},10);
    const lblYokoO=place('横山城（木下秀吉が城番に）',YOKO[0],YOKO[1],{bg:'rgba(34,58,138,.9)',size:0.03},10);lblYokoO.material.opacity=0;
    // 野村城・三田村氏館の土塁（概略）
    function yashiki(p,w){
      const bankM=new THREE.MeshStandardMaterial({color:0x76864a,roughness:.95});
      for(const [bw,bd,x,z] of [[w,.5,0,-w/2],[w,.5,0,w/2],[.5,w,-w/2,0],[.5,w,w/2,0]]){
        const b=new THREE.Mesh(new THREE.BoxGeometry(bw,.4,bd),bankM);b.position.set(p[0]+x,gy(p[0]+x,p[1]+z)+.2,p[1]+z);b.castShadow=b.receiveShadow=true;scene.add(b);}
      ctx.addClear(p[0],p[1],w);
    }
    yashiki([104,-9],3.2);yashiki([31,-9],3.2);

    /* ---------------- 軍勢 ---------------- */
    const S8=v=>[v,v,v,v,v,v,v,v];
    const O_NOBU=[119,40],O_SAKAI=[94,19],O_IKEDA=[105,25];
    const units=[
      // 浅井
      new Unit({side:'A',name:'浅井長政（本陣）',rows:5,cols:8,faceTo:TATSU,ly:6.4,keys:[ODANI,ODANI,ODANI,[...AZAI_OUT,[54,-72]],[NIGHT_AZ,[101,2]],[[101,6]],[...ROUT_AZ,ODANI],ODANI]}),
      new Unit({side:'A',name:'磯野員昌（先鋒）',rows:4,cols:7,faceTo:TATSU,ly:5.2,keys:[IBE,ODANI_S,ODANI_S,[...off(AZAI_OUT,-4,6),[46,-62]],[off([NIGHT_AZ],-4,4)[0],[95,12]],ISONO,{p:off(ROUT_AZ,-3,3)},null]}),
      new Unit({side:'A',name:'遠藤直経',rows:3,cols:6,faceTo:TATSU,ly:4.4,keys:[ODANI_E,ODANI_E,ODANI_E,[...off(AZAI_OUT,4,6),[60,-62]],[off([NIGHT_AZ],5,2)[0],[111,8]],{p:[[104,24],ENDO_T]},null,null]}),
      new Unit({side:'A',name:'浅井政澄・阿閉貞征',rows:4,cols:7,faceTo:TATSU,ly:4.8,keys:[ODANI_W,ODANI_W,ODANI_W,[...off(AZAI_OUT,-6,-4),[44,-78]],[off([NIGHT_AZ],-6,0)[0],[89,-6]],[[87,-2]],{p:off(ROUT_AZ,4,-3)},null]}),
      new Unit({side:'A',name:'小谷城の守兵',rows:2,cols:5,faceTo:TORA,ly:3.6,teppo:false,keys:S8(ODANI_N)}),
      new Unit({side:'A',name:'横山城の守兵（三田村国定・野村直隆ら）',rows:2,cols:5,faceTo:TATSU,ly:4.6,teppo:false,keys:[YOKO,YOKO,YOKO,YOKO,YOKO,YOKO,YOKO,null]}),
      // 朝倉
      new Unit({side:'S',name:'朝倉景健（本陣）',rows:5,cols:8,faceTo:[44,36],ly:6.2,keys:[null,null,null,[...ASA_IN,[70,-76]],[NIGHT_AS,[30,5]],{p:ROUT_AS},null,null]}),
      new Unit({side:'S',name:'真柄直隆・直澄',rows:3,cols:6,faceTo:[44,36],ly:4.4,keys:[null,null,null,[...off(ASA_IN,5,4),[76,-64]],[off([NIGHT_AS],3,4)[0],[42,11]],{p:[[45,20]]},null,null]}),
      new Unit({side:'S',name:'前波新八郎',rows:3,cols:6,faceTo:[44,36],ly:4.6,keys:[null,null,null,[...off(ASA_IN,6,-4),[80,-80]],[off([NIGHT_AS],-4,0)[0],[19,1]],{p:off(ROUT_AS,-3,0)},null,null]}),
      new Unit({side:'S',name:'黒坂景久',rows:3,cols:5,faceTo:[44,36],ly:4,keys:[null,null,null,[...off(ASA_IN,-4,-6),[66,-88]],[off([NIGHT_AS],5,-2)[0],[51,4]],{p:off(ROUT_AS,3,2)},null,null]}),
      // 織田
      new Unit({side:'O',name:'織田信長（本陣）',rows:5,cols:8,faceTo:NOMURA,ly:6.6,keys:[null,[...ODA_IN,TORA],[...BACK22,TATSU],TATSU,[O_NOBU],O_NOBU,[...PURSUIT,TATSU],TATSU]}),
      new Unit({side:'O',name:'坂井政尚（先鋒）',rows:3,cols:6,faceTo:NOMURA,ly:4.2,keys:[null,[...off(ODA_IN,3,-3),T1(3)],[...off(BACK22,3,-3),[106,30]],[106,30],[[94,26],O_SAKAI],O_SAKAI,[...off(PURSUIT,-3,3),[97,22]],[97,22]]}),
      new Unit({side:'O',name:'池田恒興',rows:3,cols:6,faceTo:NOMURA,ly:4.4,keys:[null,[...off(ODA_IN,-3,3),T1(-2)],[...off(BACK22,-3,3),[116,32]],[116,32],[[105,30],O_IKEDA],O_IKEDA,[...off(PURSUIT,3,-3),[106,22]],[106,22]]}),
      new Unit({side:'O',name:'木下秀吉',rows:3,cols:6,faceTo:NOMURA,ly:4.6,keys:[null,[...off(ODA_IN,6,0),...BURN,T1(1)],[...off(BACK22,6,0),[126,38]],[126,38],[[99,33]],[99,33],[99,33],[[124,92]]]}),
      new Unit({side:'O',name:'柴田勝家',rows:3,cols:6,faceTo:NOMURA,ly:4.4,keys:[null,[...off(ODA_IN,-6,0),...off(BURN,-3,3),T1(4)],[...off(BACK22,-6,0),[138,40]],[138,40],[[111,31]],[111,31],[111,31],[111,31]]}),
      new Unit({side:'O',name:'森可成',rows:3,cols:6,faceTo:NOMURA,ly:4.2,keys:[null,[...off(ODA_IN,0,6),...off(BURN,3,-3),T1(2)],[...off(BACK22,0,6),[143,52]],[143,52],[[123,26]],[123,26],[123,26],[123,26]]}),
      new Unit({side:'O',name:'稲葉一鉄ら西美濃三人衆',rows:4,cols:7,faceTo:NOMURA,ly:5,keys:[null,[...off(ODA_IN,0,-6),T1(-3)],[...off(BACK22,0,-6),SIEGE_NW],SIEGE_NW,SIEGE_NW,INABA,[72,10],[72,10]]}),
      new Unit({side:'O',name:'丹羽長秀',rows:3,cols:6,faceTo:YOKO,ly:4.4,keys:[null,null,[LL(35.40,136.352),SIEGE_E],SIEGE_E,SIEGE_E,SIEGE_E,SIEGE_E,SIEGE_E]}),
      new Unit({side:'O',name:'佐久間信盛',rows:3,cols:6,faceTo:YOKO,ly:4.4,keys:[null,null,[LL(35.395,136.352),SIEGE_SW],SIEGE_SW,SIEGE_SW,SIEGE_SW,SIEGE_SW,SIEGE_SW]}),
      // 徳川
      new Unit({side:'T',name:'徳川家康（本陣）',rows:5,cols:8,faceTo:MITA,ly:6.2,keys:[null,null,[...TOKU_IN,[98,46]],[98,46],[[44,36]],[44,36],[44,36],[44,36]]}),
      new Unit({side:'T',name:'酒井忠次（先鋒）',rows:3,cols:6,faceTo:MITA,ly:4.4,keys:[null,null,[...off(TOKU_IN,3,-4),[86,36]],[86,36],[[38,26],[39,20]],[[38,17]],[38,17],[38,17]]}),
      new Unit({side:'T',name:'榊原康政',rows:3,cols:6,faceTo:MITA,ly:4.6,keys:[null,null,[...off(TOKU_IN,0,4),[82,50]],[82,50],[[26,28]],SAKAKI,[21,9],[21,9]]}),
      new Unit({side:'T',name:'本多忠勝・石川数正',rows:3,cols:6,faceTo:MITA,ly:4.2,keys:[null,null,[...off(TOKU_IN,4,6),[94,58]],[94,58],[[52,27]],[52,27],[52,27],[52,27]]}),
    ];
    // 書式の自己点検（場面数と keys の長さ、止まる地点が水面でないこと）
    if(PH.length!==CAM.length||PH.length!==ENV.length)console.error('PH/CAM/ENV length mismatch');
    for(const u of units){
      if(u.d.keys.length!==PH.length)console.error('keys length',u.d.name);
      u.d.keys.forEach((k,i)=>{if(!k)return;const a=Array.isArray(k)?k:k.p;const e=Array.isArray(a[0])?a[a.length-1]:a;
        if(water(e[0],e[1]))console.error('unit on water',u.d.name,i);});
    }

    // 引きの場面では主な隊だけ名札を出す（名札の重なりを避ける）
    const QUIET={"0":["小谷城の守兵","遠藤直経","浅井政澄・阿閉貞征"],"1":["小谷城の守兵"],"2":["坂井政尚（先鋒）","池田恒興","木下秀吉","柴田勝家","森可成","酒井忠次（先鋒）","榊原康政","本多忠勝・石川数正","小谷城の守兵"],"3":["小谷城の守兵"],"5":["池田恒興"],"6":["坂井政尚（先鋒）","磯野員昌（先鋒）","浅井政澄・阿閉貞征","池田恒興","木下秀吉","柴田勝家","森可成","稲葉一鉄ら西美濃三人衆","丹羽長秀","佐久間信盛","酒井忠次（先鋒）","榊原康政","本多忠勝・石川数正","小谷城の守兵","横山城の守兵（三田村国定・野村直隆ら）"],"7":["木下秀吉","徳川家康（本陣）","坂井政尚（先鋒）","池田恒興","柴田勝家","森可成","稲葉一鉄ら西美濃三人衆","丹羽長秀","佐久間信盛","酒井忠次（先鋒）","榊原康政","本多忠勝・石川数正","小谷城の守兵"]};
    // 場面を限って出す地名
    const ONLY={"伊部":[1],"郡上":[1],"岡山（勝山）":[2,3,4,5]};
    const lblBy={'伊部':lblIbe,'郡上':lblGujo,'岡山（勝山）':lblOka};

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,MIDORI=0x1f8a7c,SHU=0xd0301f,KI=0xc98a2e;
    const arrows=[
      new Arrow([...ODA_IN,TORA],AI,3,1),
      new Arrow([TORA,[-72,-110],...BURN,[-80,-100]],AI,1.6,1),
      new Arrow([TORA,...BACK22,TATSU],AI,2.6,2),
      new Arrow([...TOKU_IN,[98,46]],MIDORI,2.4,2),
      new Arrow([...ASA_IN,OYORI],KI,2.6,3),
      new Arrow([ODANI,...AZAI_OUT,[54,-72]],SHU,2.2,3),
      new Arrow([[54,-72],NIGHT_AZ,[99,-2]],SHU,2.2,4),
      new Arrow([OYORI,NIGHT_AS,[33,0]],KI,2.2,4),
      new Arrow([[106,30],[96,25]],AI,1.6,4),
      new Arrow([[126,38],[110,33]],AI,1.6,4),
      new Arrow([[86,36],[42,28]],MIDORI,1.8,4),
      new Arrow([[98,46],[48,38]],MIDORI,1.8,4),
      new Arrow([[95,12],...ISONO.slice(0,3)],SHU,1.8,5),
      new Arrow([[115,85],...INABA],AI,1.8,5),
      new Arrow([[26,28],...SAKAKI],MIDORI,1.8,5),
      new Arrow([[30,3],...ROUT_AS],KI,2.2,5,6),
      new Arrow([[101,2],...ROUT_AZ,ODANI],SHU,2.2,6),
      new Arrow([O_NOBU,...PURSUIT,[110,30]],AI,1.8,6),
    ];

    /* ---------------- 場面の途中で出す印 ---------------- */
    const note=(t,x,z,bg,dy)=>{const s=place(t,x,z,{bg,size:0.025},dy);s.material.opacity=0;return s;};
    const NB='rgba(22,24,28,.82)',NR='rgba(150,26,20,.85)';
    const marks=[
      {s:note('27日、陣を払う（と『信長公記』）',30,-108,NB,6),on:(c,t)=>c===3&&t>8},
      {s:note('磯野員昌の突進（『浅井三代記』の伝承）',108,30,NR,9),on:(c,t)=>c===5&&t>3},
      {s:note('榊原康政の側面攻撃（通説）',12,22,'rgba(24,96,86,.85)',8),on:(c,t)=>c===5&&t>3},
      {s:note('遠藤直経 戦死（遠藤塚）',...ENDO_T,NB,20),on:(c,t)=>c===6&&t>6},
      {s:note('真柄直隆 戦死（軍記物の伝え）',45,20,NB,6),on:(c,t)=>c===6&&t>6},
      {s:note('浅井政之 戦死',92,8,NB,6),on:(c,t)=>c===6&&t>6},
      {s:note('姉川古戦場碑（旧野村橋）',...HI,NB,5),on:c=>c===7},
      {s:note('血原',...CHIHARA,NB,5),on:c=>c===7},
    ];

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<160;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<20;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(2.2);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      p.life=p.max=(kind==='fire'?4:3)+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=kind==='fire'?2.0:1.3;p.vz=(Math.random()-.5)*.4;p.g=kind==='fire'?1.8:1.2;p.s.material.color.set(kind==='fire'?0x6e655c:0xcfcac2);
      p.s.visible=true;}
    // 戦いの火花と煙（場面ごと、出はじめる時刻つき）
    const FIRE={4:{t:7,z:[[95,15,6],[40,15,6]]},5:{t:1.5,z:[[97,18,7],[106,28,6],[40,16,6],[20,8,5]]}};
    // 焼き討ちの黒い煙
    const BURNZ={1:{t:3,z:[[GUJO[0],GUJO[1],6],[IBE[0],IBE[1],6]]},6:{t:4,z:[[HAJIKA[0],HAJIKA[1],7]]}};
    let emitAcc=0;
    function update(cur,tIn,dt){
      const k=Math.min(1,dt*2);
      for(const m of marks)m.s.material.opacity+=((m.on(cur,tIn)?1:0)-m.s.material.opacity)*k;
      const qs=QUIET[cur]||[];for(const u of units)if(qs.includes(u.d.name))u.label.material.opacity=0;
      for(const t in ONLY){const l=lblBy[t];l.material.opacity+=((ONLY[t].includes(cur)?1:0)-l.material.opacity)*k;}
      const yo=cur>=7?1:0;
      fYoko.fm.map=yo?SIDES.O.tex:SIDES.A.tex;
      lblYokoA.material.opacity+=((1-yo)-lblYokoA.material.opacity)*k;lblYokoO.material.opacity+=(yo-lblYokoO.material.opacity)*k;
      const F=FIRE[cur],B=BURNZ[cur];
      const zones=F&&tIn>F.t?F.z:null,burn=B&&tIn>B.t?B.z:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        for(let n=0;n<2;n++){
          if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
          if(burn){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],'fire');}}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.65;if(q.life<=0)q.s.visible=false;}
      const fz=zones||burn;
      for(const f of flashes){
        if(!fz){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.2+Math.random()*1.2;const z=fz[(Math.random()*fz.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }
    return {units,arrows,update};
  }
});
})();
