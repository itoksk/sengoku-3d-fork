(function(){
const TAU=Math.PI*2;
// 緯度経度 → 画面座標（CAM 用。原点 35.085,136.965、1単位=30m、+x 東、+z 南。エンジンの LL と同じ式）
const K_LAT=Math.PI/180*6378137/30,K_LON=K_LAT*Math.cos(35.085*Math.PI/180);
const ll=(la,lo)=>[(lo-136.965)*K_LON,-(la-35.085)*K_LAT];
const camAt=(la,lo,d,yaw,pitch)=>{const p=ll(la,lo);return {t:[p[0],null,p[1]],d,yaw,pitch};};

/* ---------------- 家紋（旗） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='O'){                       // 織田: 織田木瓜（簡略）
    x.lineWidth=r*.13;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45,r*.24,r*.36,a+Math.PI/2,0,TAU);x.fill();}
    x.beginPath();x.arc(cx,cy,r*.16,0,TAU);x.fill();
  }else if(side==='I'){                 // 今川: 足利二つ引両
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    x.save();x.beginPath();x.arc(cx,cy,r*.82,0,TAU);x.clip();
    x.fillRect(cx-r,cy-r*.5,r*2,r*.3);x.fillRect(cx-r,cy+r*.2,r*2,r*.3);x.restore();
  }else{                                // 松平: 三つ葉葵（簡略）
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.46,a+Math.PI/2,0,TAU);x.fill();}
  }
}
const CREST={O:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'},I:{bg:'#b8231b',fg:'#f3efe4'},T:{bg:'#e9e4d6',fg:'#17524a'}};
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle=k.bg;x.fillRect(0,0,64,200);crest(x,side,32,52,17,k.fg);
  if(k.band){x.fillStyle=k.band;x.fillRect(0,0,64,10);}
  x.fillStyle=k.fg;x.fillRect(29,90,6,86);
  return new THREE.CanvasTexture(c);
}
const SIDES={
  O:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('O')},
  I:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('I')},
  T:{body:new THREE.Color(0x1e5e56),label:'rgba(24,96,86,.88)',tex:flagTex('T')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'永禄3年（1560）5月12日〜18日',title:'尾張へ、今川の大軍',text:'5月12日、今川義元は大軍を率いて駿府を出陣し、18日に沓掛（くつかけ）城へ入った。軍勢は通説では25,000とされるが、史料によって2万余から5万余まで大きな幅がある。今川方の鳴海城・大高城・沓掛城は尾張の中心部と知多半島を分ける位置にあり、信長は鳴海城と大高城を囲むように5つの砦を築いていた。18日の夜、松平元康の率いる三河勢が大高城へ兵糧（ひょうろう）を運び入れ、元康がそのまま城の守りについた。'},
  {act:'一',date:'5月19日 午前3時ごろ〜10時ごろ',title:'丸根・鷲津への攻撃',text:'19日の午前3時ごろ、大高城から出た松平元康の隊が丸根砦へ、朝比奈泰朝の隊が鷲津（わしづ）砦へ攻めかかった。丸根砦では佐久間盛重が外へ討って出て戦い、討死した。鷲津砦では籠城した飯尾定宗・織田秀敏が討死し、飯尾尚清は敗走した。両砦は午前10時ごろまでに落ち、大高城のまわりは今川軍が押さえた。'},
  {act:'二',date:'5月19日 午前4時ごろ〜10時ごろ',title:'信長、熱田から善照寺砦へ',text:'砦が攻められたとの報せを受けた信長は幸若舞『敦盛』を舞い、午前4時ごろ、小姓衆5騎だけを連れて清洲城を出たと『信長公記』は伝える。8時ごろ熱田神宮に着き、鷲津・丸根の方角に黒煙が上がるのを見た。熱田で軍勢を集めたと考えられ、10時ごろには鳴海城を囲む砦のひとつ、善照寺砦に入った。ここで整えた軍勢は2,000〜3,000ほどだったといわれる。'},
  {act:'三',date:'5月19日 10時ごろ〜正午ごろ',title:'おけはざま山の義元と、深田の細道',text:'義元の本隊は沓掛城を出て大高城の方へ西に進み、のちに南へ向きを変えて、おけはざま山で休んだ。丸根・鷲津の勝報を喜び、謡（うたい）をうたわせたと『信長公記』は伝える。信長は家老衆が止めるのを振り切り、両脇が深田で一騎ずつしか通れない道を、敵から丸見えのまま中嶋砦へ進んだとされる。正午ごろ、中嶋砦の前に出ていた佐々政次・千秋四郎らが今川軍の前衛に攻めかかり、討死した。'},
  {act:'四',date:'5月19日 午後1時ごろ（午後2時ごろとも）',title:'豪雨、そして突撃',text:'昼すぎ、視界をさえぎるほどの豪雨が降った。『信長公記』は「石水混じり」と書き、雹だった可能性もある。織田軍は兵を進め（雨が止んでから攻めたとする解釈もある）、今川軍の前衛は戦わずに崩れ、織田軍は混乱のなかで本陣をめざして突き進んだ。義元は輿（こし）を捨て、300騎の旗本に囲まれて馬で退いたと『信長公記』は伝える。'},
  {act:'五',date:'5月19日 午後',title:'義元の最期',text:'義元は5度にわたる攻撃で周りの兵を失い、織田の馬廻（うままわり）に追いつかれた。自ら太刀を抜いて戦い、一番槍の服部一忠の膝を斬ったが、毛利良勝に組み伏せられて首を討たれた。享年42。深田のぬかるみに足を取られた今川方の兵も、次々に討たれたという。義元が討たれた場所は、豊明市の伝説地と名古屋市緑区の田楽坪の2か所が伝わり、どちらも確定していない。'},
  {act:'六',date:'5月19日 夕方〜夜',title:'今川軍の崩壊',text:'義元の死で今川軍は総崩れとなり、駿河の方へ退いていった。夕方、大高城の元康のもとへ水野信元の使者が来て、義元の戦死を伝えた。元康はいったん物見を出して確かめ、その夜半に大高城を退いた。鳴海城の岡部元信は城にとどまり、なお抵抗を続けた。'},
  {act:'結',date:'5月20日〜永禄5年（1562）',title:'鳴海城の開城と、その後',text:'元康は今川の残兵がいた岡崎城を避けて大樹寺に入り、23日に「捨城ならば拾はん」（捨てた城なら拾おう）と岡崎城へ入った。鳴海城の岡部元信は、義元の首と引き換えに城を明け渡し、駿河へ帰った。沓掛城も織田方に攻め落とされ、城主の近藤景春は討死した（落城は5月21日とも6月21日ともいう）。永禄5年、元康は信長と講和した（清洲同盟）。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る（yaw を増やすとカメラは東へ回る）
const CAM=[
  camAt(35.0700,136.9850,340,-0.2,1.05),
  camAt(35.0670,136.9420,100,-1.25,0.62),
  camAt(35.1000,136.9390,260,-0.8,1.0),
  camAt(35.0660,136.9660,155,-0.75,0.82),
  camAt(35.0595,136.9725,95,-0.8,0.55),
  camAt(35.0575,136.9760,110,0.3,0.82),
  camAt(35.0630,136.9585,230,-0.4,1.1),
  camAt(35.0750,136.9680,430,-0.1,1.2),
];
const DAY={bg:0xc5d3da,fn:320,ff:980,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  {bg:0x8e96a8,fn:320,ff:980,sun:0.5,sunC:0xffc890,hemi:0.42},              // 日暮れ（18日。夜に兵糧入れ）
  {bg:0xc6cfd6,fn:200,ff:760,sun:0.85,sunC:0xffdcb8,hemi:0.58,slow:true},   // 夜明け（暗い青から明るく）
  {bg:0xcbd6dc,fn:320,ff:980,sun:0.9,sunC:0xfff2dc,hemi:0.62},              // 朝
  {bg:0xb3bbc1,fn:240,ff:820,sun:0.62,sunC:0xe8e8e4,hemi:0.55,slow:true},   // 雲が出る
  {bg:0x7d8894,fn:70,ff:400,sun:0.32,sunC:0xc8d2dc,hemi:0.45},              // 豪雨
  {bg:0xc4d0d6,fn:200,ff:760,sun:0.88,sunC:0xfff0d8,hemi:0.6,slow:true},    // 雨上がり
  {bg:0xd6b08a,fn:260,ff:900,sun:0.7,sunC:0xffb878,hemi:0.5},               // 夕方
  DAY,
];

Sengoku.start({
  id:'okehazama',
  title:'桶狭間の戦い',
  subtitle:'永禄3年（1560）5月19日　尾張に攻め入った今川義元を、織田信長が桶狭間で討ち取った戦い',
  legend:[{color:'#2c4fb0',label:'織田軍'},{color:'#c0281f',label:'今川軍'},{color:'#1f7a6f',label:'松平元康の三河勢（今川方）'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。当時の海（伊勢湾・鳴海潟・年魚市潟〔あゆちがた〕）は、埋め立て前のようすを標高データから推定して描いた概略です。城・砦・軍勢の位置と経路は流れを理解するための概念的な再現で、兵力・信長の進路・義元の本陣と最期の地には諸説あります（「諸説」ボタンから読めます）。人・旗・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:14000,conifer:.45,seed:7,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#4f6a34',b2:'#6f7f3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,rnd,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const ATSUTA=at(35.12736,136.90867);     // 熱田神宮
    const KASADERA=at(35.10156,136.93669);   // 笠寺観音
    const TANGE=at(35.08653,136.9505);       // 丹下砦
    const ZENSHO=at(35.08158,136.9575);      // 善照寺砦
    const NAKAJIMA=at(35.07694,136.95397);   // 中嶋砦
    const NARUMI=at(35.08158,136.95036);     // 鳴海城
    const WASHIZU=at(35.06956,136.94229);    // 鷲津砦
    const MARUNE=at(35.06439,136.94533);     // 丸根砦
    const ODAKA=at(35.06439,136.93617);      // 大高城
    const KUTSU=at(35.06903,137.02179);      // 沓掛城
    const OKEYAMA=at(35.05514,136.97733);    // おけはざま山（推定。三角点）
    const DENSETSU=at(35.05997,136.98078);   // 桶狭間古戦場伝説地（豊明市）
    const DENGAKU=at(35.05517,136.97125);    // 桶狭間古戦場公園（田楽坪。名古屋市緑区）
    const MAKUYAMA=at(35.06036,136.96854);   // 幕山
    const TAKANE=at(35.0575,136.9650);       // 高根山（概略）
    const CHOFUKU=at(35.05276,136.96959);    // 長福寺
    const NW=at(35.1455,136.9000),EAST=at(35.066,137.040);

    // 軍勢の待機位置（城・砦の上に立たせない）
    const KUTSU_W=off(KUTSU,-9,2),KUTSU_W2=off(KUTSU,-8,9),KUTSU_G=off(KUTSU,2,7);
    const ODAKA_E=off(ODAKA,7,1),ODAKA_G=off(ODAKA,-3,6);
    const NARUMI_G=off(NARUMI,-6,3);
    const TANGE_G=off(TANGE,0,4.5),ZENSHO_G=off(ZENSHO,4,3.5),NAKAJIMA_G=off(NAKAJIMA,-4.5,-3);
    const MARUNE_G=off(MARUNE,-3.6,0),WASHIZU_G=off(WASHIZU,-3,3.5);
    const MARUNE_HOLD=off(MARUNE,-1,6),WASHIZU_HOLD=off(WASHIZU,3,5);
    const NAKAJIMA_N=off(NAKAJIMA,4,4);      // 信長が中嶋砦の前に出たところ

    // 経路
    const IMAGAWA_IN=[EAST,at(35.067,137.032),KUTSU_W];
    const OKAMI_W=[at(35.066,137.010),at(35.0625,136.998),at(35.060,136.988),at(35.0585,136.980),at(35.0575,136.9775)];   // 沓掛→おけはざま山の北東
    const OKAMI_E=[at(35.057,136.968),at(35.058,136.958),at(35.061,136.948),at(35.0635,136.941)];                         // おけはざま山の西→大高
    const YOSHIMOTO_IN=[KUTSU_W,...OKAMI_W,OKEYAMA];
    const MOTOYASU_IN=[KUTSU_W,...OKAMI_W,...OKAMI_E,ODAKA_E];
    const MOTOYASU_OUT=[ODAKA_E,...OKAMI_E.slice().reverse(),...OKAMI_W.slice().reverse(),at(35.067,137.032),EAST];
    const NOBU_IN=[NW,at(35.137,136.905),off(ATSUTA,4,2),at(35.120,136.915),at(35.115,136.9235),at(35.110,136.929),off(KASADERA,3,2),at(35.097,136.945),at(35.092,136.9495),off(TANGE,3,3),at(35.0845,136.9545),off(ZENSHO,3,6)];
    const NOBU_NAKA=[off(ZENSHO,3,6),at(35.0795,136.956),NAKAJIMA_N];
    const CHARGE=[NAKAJIMA_N,at(35.0725,136.960),at(35.067,136.965),at(35.0625,136.971),at(35.0565,136.9755)];
    const UKAI=[ZENSHO,at(35.079,136.967),at(35.072,136.977),at(35.065,136.983),at(35.061,136.981)];
    const FLIGHT=[OKEYAMA,at(35.0575,136.979),DENSETSU];
    const NOBU_STOP=at(35.0578,136.9748);
    const NOBU_BACK=[NOBU_STOP,...CHARGE.slice(0,-1).reverse(),off(ZENSHO,3,6),at(35.0845,136.9545),off(TANGE,3,3),at(35.092,136.9495),at(35.097,136.945),off(KASADERA,3,2),at(35.110,136.929),at(35.115,136.9235),at(35.120,136.915),off(ATSUTA,4,2),at(35.137,136.905),NW];
    const OKABE_OUT=[NARUMI_G,at(35.078,136.958),at(35.072,136.968),at(35.066,136.985),at(35.0625,136.998),at(35.066,137.010),at(35.067,137.032),EAST];
    const TO_MARUNE=[ODAKA_E,at(35.0645,136.9430)];
    const TO_WASHIZU=[ODAKA_E,at(35.0650,136.9410),at(35.0675,136.9408),at(35.0690,136.9410)];
    const VAN_IN=[KUTSU_W2,...OKAMI_W.slice(0,4),at(35.0595,136.973),MAKUYAMA];
    const VAN_OUT=[MAKUYAMA,at(35.064,136.975),at(35.067,136.985)];
    const SASSA=at(35.0745,136.9585),SASSA_TO=at(35.069,136.964);
    const ZAN=[at(35.062,136.985),at(35.0625,136.998),at(35.066,137.010),at(35.067,137.032),EAST];
    const ASAHINA_OUT=[WASHIZU_HOLD,at(35.0675,136.9408),at(35.0650,136.9410),ODAKA_E,...OKAMI_E.slice().reverse()];

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.026},wt={bg:'rgba(34,78,104,.8)',size:0.026},tn={bg:'rgba(22,24,28,.7)',size:0.023};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.025,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('おけはざま山（推定）',...off(OKEYAMA,1,5),mt,2.5);
    place('幕山（概略）',...off(MAKUYAMA,0,4),mt,2.5);
    place('高根山（概略）',...TAKANE,mt,3);
    place('長福寺',...CHOFUKU,tn,3);
    place('扇川',...at(35.0790,136.9670),wt,2);
    place('天白川',...at(35.10,136.96),wt,2);
    place('鳴海潟',...at(35.0830,136.9330),wt,2);
    place('伊勢湾',...at(35.10,136.905),{bg:'rgba(34,78,104,.8)',size:0.03},2);
    place('年魚市潟',...at(35.113,136.918),{bg:'rgba(34,78,104,.75)',size:0.022},2);
    place('↖ 清洲城方面（信長の出発地）',...at(35.140,136.912),dirStyle,4);
    place('岡崎・池鯉鮒方面 →',...at(35.060,137.034),dirStyle,4);
    place('↓ 知多半島',...at(35.030,136.950),dirStyle,4);
    place('← 伊勢湾',...at(35.075,136.902),dirStyle,4);

    /* ---------------- 家並み ---------------- */
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
    town(at(35.0838,136.9532),at(35.0805,136.9540),10);   // 鳴海（城の東の台地）
    town(off(ATSUTA,5,6),off(ATSUTA,9,15),8);             // 熱田の門前
    town(off(ODAKA,1,8),off(ODAKA,8,10),6);               // 大高
    town(off(KUTSU,-4,-7),off(KUTSU,5,-8),6);             // 沓掛
    town(off(KASADERA,4,1),off(KASADERA,9,5),5);          // 笠寺

    /* ---------------- 城・砦 ---------------- */
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95});
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    const LBG={O:'rgba(34,62,140,.9)',I:'rgba(150,26,20,.9)',T:'rgba(24,96,86,.9)'};
    function fort(p,name,s,side,dy){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.2*s,3.0*s,.9*s,24),earthM);mound.position.y=.25*s;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<24;i++){const a=i/24*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.11,.7*s,.11),woodM);q.position.set(Math.cos(a)*1.95*s,1.0*s,Math.sin(a)*1.95*s);q.castShadow=true;g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.2*s,.7*s,.9*s),wallM);hut.position.y=1.05*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.y=1.63*s;r.scale.set(1,1,.8);r.castShadow=true;g.add(r);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.8*s),woodM);pole.position.set(1.0*s,2.0*s,-.7*s);g.add(pole);
      const fg=new THREE.PlaneGeometry(.45*s,1.3*s);fg.translate(.22*s,0,0);
      const fm=new THREE.MeshStandardMaterial({map:SIDES[side].tex,side:THREE.DoubleSide,roughness:.8});
      const f=new THREE.Mesh(fg,fm);f.position.set(1.03*s,2.7*s,-.7*s);g.add(f);
      ctx.addClear(p[0],p[1],4.5*s);
      const lbl=place(name,p[0],p[1],{bg:LBG[side],size:s>1?0.029:0.025},dy);
      return {g,fm,lbl};
    }
    const fNarumi=fort(NARUMI,'鳴海城',1.15,'I',12);
    const fOdaka=fort(ODAKA,'大高城',1.15,'I',11);
    const fKutsu=fort(KUTSU,'沓掛城',1.15,'I',11);
    const fTange=fort(TANGE,'丹下砦',.75,'O',8);
    const fZensho=fort(ZENSHO,'善照寺砦',.75,'O',11);
    const fNakajima=fort(NAKAJIMA,'中嶋砦',.75,'O',2.6);
    const fWashizu=fort(WASHIZU,'鷲津砦',.75,'O',8);
    const fMarune=fort(MARUNE,'丸根砦',.75,'O',8);
    // 結で旗とラベルを替える
    const lblNarumiO=place('鳴海城（織田方）',NARUMI[0],NARUMI[1],{bg:LBG.O,size:0.029},12);lblNarumiO.material.opacity=0;
    const lblKutsuO=place('沓掛城（織田方）',KUTSU[0],KUTSU[1],{bg:LBG.O,size:0.029},11);lblKutsuO.material.opacity=0;
    const lblWashizuI=place('鷲津砦（落城）',WASHIZU[0],WASHIZU[1],{bg:'rgba(70,70,70,.88)',size:0.025},8);lblWashizuI.material.opacity=0;
    const lblMaruneI=place('丸根砦（落城）',MARUNE[0],MARUNE[1],{bg:'rgba(70,70,70,.88)',size:0.025},8);lblMaruneI.material.opacity=0;

    /* ---------------- 熱田神宮と笠寺 ---------------- */
    (function(){
      const g=new THREE.Group();g.position.set(ATSUTA[0],gy(ATSUTA[0],ATSUTA[1]),ATSUTA[1]);scene.add(g);
      const woodN=new THREE.MeshStandardMaterial({color:0xb08e62,roughness:.85});
      const base=new THREE.Mesh(new THREE.BoxGeometry(4.2,.2,3.2),new THREE.MeshStandardMaterial({color:0xcfc6b0,roughness:1}));base.position.y=.1;base.receiveShadow=true;g.add(base);
      const hon=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,1.3),woodN);hon.position.set(0,.65,-.6);hon.castShadow=true;g.add(hon);
      const hr2=new THREE.Mesh(new THREE.ConeGeometry(1.8,.7,4),roofM);hr2.rotation.y=Math.PI/4;hr2.scale.set(1,1,.62);hr2.position.set(0,1.45,-.6);hr2.castShadow=true;g.add(hr2);
      // 鳥居（南）
      const tg=new THREE.Group();tg.position.set(0,0,3.6);g.add(tg);
      for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,1.5,8),woodN);p.position.set(s*.65,.75,0);p.castShadow=true;tg.add(p);}
      const kasagi=new THREE.Mesh(new THREE.BoxGeometry(2.1,.14,.18),roofM);kasagi.position.y=1.55;tg.add(kasagi);
      const nuki=new THREE.Mesh(new THREE.BoxGeometry(1.7,.1,.12),woodN);nuki.position.y=1.2;tg.add(nuki);
      ctx.addClear(ATSUTA[0],ATSUTA[1],5);
      place('熱田神宮',ATSUTA[0],ATSUTA[1],{bg:'rgba(120,80,40,.88)',size:0.027},4.5);
    })();
    (function(){
      const g=new THREE.Group();g.position.set(KASADERA[0],gy(KASADERA[0],KASADERA[1]),KASADERA[1]);scene.add(g);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,1.5),wallM);hall.position.y=.45;hall.castShadow=true;g.add(hall);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.85,.7,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.7);r.position.y=1.25;r.castShadow=true;g.add(r);
      ctx.addClear(KASADERA[0],KASADERA[1],3.5);
      place('笠寺観音',KASADERA[0],KASADERA[1],{bg:'rgba(120,80,40,.85)',size:0.025},4);
    })();

    /* ---------------- 軍勢 ---------------- */
    const S8=v=>[v,v,v,v,v,v,v,v];
    const units=[
      // 今川方
      new Unit({side:'I',name:'今川義元（本隊）',rows:5,cols:8,faceTo:NAKAJIMA,ly:7.6,keys:[IMAGAWA_IN,KUTSU_W,KUTSU_W,YOSHIMOTO_IN,[at(35.0575,136.979)],{p:[DENSETSU]},null,null]}),
      new Unit({side:'I',name:'今川前衛（松井宗信ら）',rows:4,cols:7,faceTo:NAKAJIMA,ly:6,keys:[IMAGAWA_IN.map((p,i)=>i===2?KUTSU_W2:off(p,2,7)),KUTSU_W2,KUTSU_W2,VAN_IN,{p:VAN_OUT},null,null,null]}),
      new Unit({side:'I',name:'瀬名氏俊',rows:3,cols:5,faceTo:NAKAJIMA,ly:4,keys:[null,null,null,at(35.0585,136.9735),{p:[at(35.062,136.985)]},null,null,null]}),
      new Unit({side:'I',name:'朝比奈泰朝',rows:4,cols:6,faceTo:WASHIZU,ly:6.4,keys:[null,TO_WASHIZU,WASHIZU_HOLD,WASHIZU_HOLD,WASHIZU_HOLD,WASHIZU_HOLD,{p:ASAHINA_OUT},null]}),
      new Unit({side:'T',name:'松平元康',rows:4,cols:7,faceTo:MARUNE,ly:6.4,keys:[MOTOYASU_IN,TO_MARUNE,MARUNE_HOLD,[ODAKA_E],ODAKA_E,ODAKA_E,{p:MOTOYASU_OUT},null]}),
      new Unit({side:'I',name:'岡部元信',rows:3,cols:6,faceTo:NAKAJIMA,ly:4.2,keys:[NARUMI_G,NARUMI_G,NARUMI_G,NARUMI_G,NARUMI_G,NARUMI_G,NARUMI_G,{p:OKABE_OUT}]}),
      new Unit({side:'I',name:'鵜殿長照',rows:2,cols:5,faceTo:WASHIZU,ly:3.4,keys:[ODAKA_G,null,null,null,null,null,null,null]}),
      new Unit({side:'I',name:'近藤景春',rows:2,cols:5,faceTo:OKEYAMA,ly:3.4,keys:[KUTSU_G,KUTSU_G,KUTSU_G,KUTSU_G,KUTSU_G,KUTSU_G,KUTSU_G,null]}),
      new Unit({side:'I',name:'今川の残兵',rows:3,cols:6,faceTo:EAST,ly:3.8,keys:[null,null,null,null,null,null,{p:ZAN},null]}),
      // 織田方
      new Unit({side:'O',name:'佐久間盛重',rows:2,cols:5,faceTo:ODAKA,ly:2.6,keys:[MARUNE_G,{p:[off(MARUNE_G,-2.5,0)]},null,null,null,null,null,null]}),
      new Unit({side:'O',name:'織田秀敏・飯尾定宗',rows:2,cols:5,faceTo:ODAKA,ly:2.6,keys:[WASHIZU_G,{p:[WASHIZU_G]},null,null,null,null,null,null]}),
      new Unit({side:'O',name:'水野忠光',rows:2,cols:5,faceTo:NARUMI,ly:3.2,keys:S8(TANGE_G)}),
      new Unit({side:'O',name:'佐久間信盛',rows:3,cols:6,faceTo:NARUMI,ly:3.6,keys:S8(ZENSHO_G)}),
      new Unit({side:'O',name:'梶川高秀',rows:2,cols:5,faceTo:NARUMI,ly:3.2,keys:S8(NAKAJIMA_G)}),
      new Unit({side:'O',name:'佐々政次・千秋四郎',rows:2,cols:5,faceTo:OKEYAMA,ly:3.6,keys:[null,null,SASSA,{p:[SASSA_TO]},null,null,null,null]}),
      new Unit({side:'O',name:'織田信長（本隊）',rows:5,cols:8,faceTo:OKEYAMA,ly:5.6,keys:[null,null,NOBU_IN,NOBU_NAKA,CHARGE,[NOBU_STOP],NOBU_STOP,{p:NOBU_BACK}]}),
    ];

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f,MIDORI=0x1f9c8a,AWA=0x9db4e8;
    const arrows=[
      new Arrow(IMAGAWA_IN,SHU,3,0),
      new Arrow(MOTOYASU_IN,MIDORI,1.8,0),
      new Arrow(TO_MARUNE,MIDORI,2,1),
      new Arrow(TO_WASHIZU,SHU,2,1),
      new Arrow(NOBU_IN,AI,3,2),
      new Arrow(YOSHIMOTO_IN,SHU,2.6,3),
      new Arrow(NOBU_NAKA,AI,2,3),
      new Arrow(UKAI,AWA,1.2,3),
      new Arrow([SASSA,SASSA_TO],AI,1.4,3),
      new Arrow(CHARGE,AI,3.4,4),
      new Arrow(VAN_OUT,SHU,1.4,4),
      new Arrow(MOTOYASU_OUT,MIDORI,2.2,6),
      new Arrow(ZAN,SHU,1.4,6),
      new Arrow(OKABE_OUT,SHU,2,7),
      new Arrow(NOBU_BACK,AI,2.4,7),
    ];

    /* ---------------- 場面ごとに出すラベル ---------------- */
    const fadeLbl=(text,p,o,dy)=>{const s=place(text,p[0],p[1],o,dy);s.material.opacity=0;return s;};
    const gated=[
      {s:fadeLbl('迂回説の経路（旧説）',at(35.072,136.977),{bg:'rgba(70,90,140,.85)',size:0.023},4),on:(c,t)=>c===3&&t>3},
      {s:fadeLbl('義元 戦死の推定地（豊明市・伝説地）',DENSETSU,{bg:'rgba(70,40,30,.88)',size:0.025},12),on:(c,t)=>c===5&&t>1.5},
      {s:fadeLbl('義元 戦死の推定地（名古屋市緑区・田楽坪）',DENGAKU,{bg:'rgba(70,40,30,.88)',size:0.025},5),on:(c,t)=>c===5&&t>1.5},
      {s:fadeLbl('岡部元信、なお籠城',off(NARUMI_G,-7,5),{bg:'rgba(150,26,20,.9)',size:0.026},5),on:(c,t)=>c===6&&t>2},
      {s:fadeLbl('丸根・鷲津の黒煙',at(35.0675,136.9445),{bg:'rgba(40,40,40,.8)',size:0.024},14),on:(c,t)=>c===2&&t>2},
    ];

    /* ---------------- 雨（第四幕）・煙・火花 ---------------- */
    const rain=(function(){
      const n=2200,R=110,C=[28,98],pos=new Float32Array(n*6);
      for(let i=0;i<n;i++){const x=C[0]+(rnd()-.5)*2*R,z=C[1]+(rnd()-.5)*2*R,y=rnd()*80;pos.set([x,y,z,x,y-2.4,z],i*6);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const m=new THREE.LineBasicMaterial({color:0xb4bdd0,transparent:true,opacity:0});
      const l=new THREE.LineSegments(g,m);l.visible=false;l.frustumCulled=false;scene.add(l);return {l,m,pos,n};
    })();
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<110;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<20;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      p.life=p.max=(kind==='fire'?5:3)+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=kind==='fire'?2.0:1.3;p.vz=(Math.random()-.5)*.4;p.g=kind==='fire'?1.4:.8;
      p.s.material.color.set(kind==='fire'?0x4a423c:0xcfcac2);p.s.visible=true;}
    const MW=[[...off(MARUNE,-2,0),6],[...off(WASHIZU,1,2),6]];
    const FIRE={1:MW,4:[[...at(35.0565,136.9755),8],[...at(35.0575,136.979),7],[...MAKUYAMA,6]],5:[[...at(35.0590,136.9805),6],[...DENGAKU,6]]};
    const BURN={1:[[...MARUNE,4],[...WASHIZU,4]],2:[[...MARUNE,4],[...WASHIZU,4]],3:[[...MARUNE,3],[...WASHIZU,3]]};
    let emitAcc=0;
    const fadeTo=(m,v,dt,k)=>{m.opacity+=(v-m.opacity)*Math.min(1,dt*(k||2));};
    // 遠景の場面では、砦の守将の名札を隠す（砦の名で足りる）
    const HIDE={'佐久間盛重':[0,6,7],'織田秀敏・飯尾定宗':[0,6,7],'水野忠光':[0,2,6,7],'佐久間信盛':[0,2,6,7],'梶川高秀':[0,2,3,6,7],'岡部元信':[0,2,6],'鵜殿長照':[0],'近藤景春':[0,6,7]};
    const GARRISON=units.filter(u=>HIDE[u.d.name]).map(u=>[u,HIDE[u.d.name]]);
    function update(cur,tIn,dt,time){
      for(const [u,h] of GARRISON)u.label.visible=!h.includes(cur);
      fTange.lbl.visible=fZensho.lbl.visible=cur!==7;   // 結の全景では鳴海城の名札と重なるため隠す
      // 信長の本隊が砦のそばにいる場面では、砦の名札を上へ逃がす
      fZensho.lbl.position.y=gy(ZENSHO[0],ZENSHO[1])+(cur===2?16:11);
      fNakajima.lbl.position.y=gy(NAKAJIMA[0],NAKAJIMA[1])+(cur===3?11:2.6);
      const rt=cur===4?(tIn<9?.6:.6*Math.max(0,1-(tIn-9)/4)):0;fadeTo(rain.m,rt,dt);rain.l.visible=rain.m.opacity>.02;
      if(rain.l.visible&&!reduceMotion){const a=rain.pos,v=60*dt;for(let i=0;i<rain.n;i++){let y=a[i*6+1]-v;if(y<0)y+=80;a[i*6+1]=y;a[i*6+4]=y-2.4;}rain.l.geometry.attributes.position.needsUpdate=true;}
      for(const g of gated)fadeTo(g.s.material,g.on(cur,tIn)?1:0,dt);
      // 落ちた砦
      const fell=cur>=2||(cur===1&&tIn>9);
      fWashizu.fm.map=fMarune.fm.map=fell?SIDES.I.tex:SIDES.O.tex;
      fadeTo(fWashizu.lbl.material,fell?0:1,dt);fadeTo(fMarune.lbl.material,fell?0:1,dt);
      fadeTo(lblWashizuI.material,fell?1:0,dt);fadeTo(lblMaruneI.material,fell?1:0,dt);
      // 結: 鳴海城（岡部が出たあと）と沓掛城が織田方に
      const nOk=cur===7&&tIn>6,kOk=cur===7&&tIn>3;
      fNarumi.fm.map=nOk?SIDES.O.tex:SIDES.I.tex;fadeTo(fNarumi.lbl.material,nOk?0:1,dt);fadeTo(lblNarumiO.material,nOk?1:0,dt);
      fKutsu.fm.map=kOk?SIDES.O.tex:SIDES.I.tex;fadeTo(fKutsu.lbl.material,kOk?0:1,dt);fadeTo(lblKutsuO.material,kOk?1:0,dt);
      const zones=tIn>1.5?FIRE[cur]:null,burn=tIn>(cur===1?5:0.5)?BURN[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
        if(burn&&Math.random()<.7){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],'fire');}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.55;if(q.life<=0)q.s.visible=false;}
      for(const f of flashes){
        if(!zones||cur===5){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.2+Math.random()*1.2;const z=zones[(Math.random()*zones.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }

    return {units,arrows,update};
  }
});
})();
