(function(){
const TAU=Math.PI*2;

/* ---------------- 家紋（旗） ----------------
 * 上杉: 白地に「毘」の一字。武田: 赤地に武田菱（割菱）。
 * 「毘」は明朝体で描くので、フォントの読み込み後（build の中）にもう一度描きなおす。 */
function drawFlag(c,side){
  const x=c.getContext('2d');x.clearRect(0,0,64,200);
  if(side==='U'){
    x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);
    x.fillStyle='#1d1d1d';x.font='bold 40px "Shippori Mincho",serif';x.textAlign='center';x.textBaseline='middle';
    x.fillText('毘',32,50);
    x.fillStyle='#2848a0';x.fillRect(0,0,64,8);
  }else{
    x.fillStyle='#b8231b';x.fillRect(0,0,64,200);
    // 割菱: 大きな菱を十字に割った4つの菱
    const cx=32,cy=52,w=13,h=17,g=1.6;
    x.fillStyle='#f3efe4';
    for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]]){
      const px=cx+dx*(w+g),py=cy+dy*(h+g);
      x.beginPath();x.moveTo(px,py-h);x.lineTo(px+w,py);x.lineTo(px,py+h);x.lineTo(px-w,py);x.closePath();x.fill();
    }
  }
}
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;drawFlag(c,side);
  const t=new THREE.CanvasTexture(c);t.userData={c,side};return t;
}
const SIDES={
  U:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('U')},
  T:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('T')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'天文22年〜弘治3年（1553〜57）',title:'川中島をめぐる三度の対陣',text:'千曲川と犀川にはさまれた三角形の平地を、川中島と呼ぶ。北信濃の国衆に頼られた長尾景虎（のちの上杉謙信）は、天文22年（1553）から武田晴信（信玄）とこの地で対陣を重ね、弘治元年（1555）の第二次では犀川をはさんで約200日にらみ合った。両軍が奪い合ったのは、善光寺と越後への道を押さえるこの平地である。永禄3年（1560）ごろ、武田は千曲川の東に海津城を築いた。'},
  {act:'一',date:'永禄4年（1561）8月14日〜16日',title:'政虎、妻女山に陣取る',text:'永禄4年8月、関東から越後へ戻っていた上杉政虎（のちの謙信）は春日山城を発ち、善光寺に荷駄隊と兵5,000を残した。政虎は1万3,000（通説）を率いて犀川・千曲川を渡り、妻女山に陣を取ったと伝わる。ここからは、武田の前進拠点である海津城を見下ろすことができる。'},
  {act:'二',date:'8月24日〜29日',title:'信玄の着陣と海津城入城',text:'海津城の高坂昌信から知らせを受けた信玄は甲府を発ち、24日に2万（通説）を率いて着陣した。布陣したのは茶臼山とする説がよく知られるが、塩崎城とする説などもある。29日、武田軍は八幡原を横切り、広瀬で千曲川を渡って海津城に入った。両軍のにらみ合いは10日ほど続いた。'},
  {act:'三',date:'9月9日 夕方〜夜',title:'海津城の炊煙',text:'武田の軍議では、別働隊1万2,000が妻女山を襲い、山を下りた上杉軍を八幡原の本隊8,000が挟み撃ちにする作戦が採られたと伝わる。啄木鳥が木をつついて虫を追い出すのに似ることから、啄木鳥戦法と呼ばれる。9日の夜、海津城から上がる炊煙（飯をたく煙）はいつになく多く、政虎はそれを見て武田の動きを察したとされる。この作戦が実際にあったかどうかには諸説ある。'},
  {act:'四',date:'9月9日夜〜10日 午前4時頃',title:'二つの夜の移動',text:'政虎は物音を立てることを禁じ、夜のうちに妻女山を下りて、雨宮の渡しで千曲川を渡ったと伝わる。渡河点には甘粕長重らを残して武田の別働隊に備え、直江実綱は丹波島にとどまった。武田の別働隊が海津城を出たのは午前1時頃、信玄の本隊が海津城を出て八幡原へ向かったのは午前4時頃とされる。頼山陽の詩「鞭声粛々夜河を渡る」は、この夜を詠んだものである。'},
  {act:'五',date:'9月10日（新暦10月28日） 午前6時過ぎ〜8時頃',title:'霧が晴れる',text:'夜が明けても、八幡原は深い霧に包まれていた。霧が晴れたとき、いるはずのない上杉軍が武田本隊の目の前にいたと伝わる。政虎は柿崎景家を先鋒に、次々と新手を繰り出す車懸りで攻めかかった。武田軍は副将の武田信繁、山本勘助、諸角虎定らを失い、信玄の本陣も危うくなったと伝わる。'},
  {act:'六',date:'9月10日 昼〜午後4時',title:'挟撃と撤退',text:'乱戦のなかで政虎が信玄の本陣に斬り込んだという一騎討ちの話が伝わるが、確かな史料はない。渡河点で甘粕隊に足止めされていた武田の別働隊は昼前に八幡原へ着き、上杉軍は挟み撃ちの形になった。政虎は犀川を渡って善光寺へ退き、信玄は午後4時に追撃を止めた。『甲陽軍鑑』はこの戦いを「前半は上杉の勝ち、後半は武田の勝ち」とする。'},
  {act:'結',date:'9月10日夕〜永禄7年（1564）',title:'戦のあと',text:'信玄は八幡原で首実検（くびじっけん）をし、勝鬨（かちどき）をあげたと伝わる。戦いのあと、海津城の高坂昌信は敵味方の別なく遺体を集めて葬ったと伝わり、八幡原のあたりには首塚が残る。政虎は家臣に感状を与え、両軍とも勝利を主張した。永禄7年（1564）の第五次は塩崎でにらみ合ったまま終わり、川中島を含む北信濃は武田の勢力下に入った。'},
];

/* 地図座標（1単位=30m、+x 東、+z 南。原点 36.585,138.175） */
const LAT0=36.585,LON0=138.175,KLAT=Math.PI/180*6378137/30,KLON=KLAT*Math.cos(LAT0*Math.PI/180);
const L=(la,lo)=>[(lo-LON0)*KLON,-(la-LAT0)*KLAT];

// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る（負で西側から、正で東側から）
const cam=(la,lo,d,yaw,pitch)=>{const p=L(la,lo);return {t:[p[0],null,p[1]],d,yaw,pitch};};
const xz=(x,z,d,yaw,pitch)=>({t:[x,null,z],d,yaw,pitch});
const CAM=[
  cam(36.603,138.172,330,0.25,1.1),
  xz(5,80,160,-1.3,0.5),          // 妻女山の西から、山上の上杉軍と奥の海津城
  xz(-60,22,330,-0.2,0.92),       // 茶臼山から海津城までの武田の道筋
  xz(2,82,140,-1.32,0.42),        // 妻女山越しに炊煙の海津城
  xz(15,63,265,0.85,1.05),        // 夜の三つの動き（南東から）
  cam(36.589,138.183,100,0.6,0.45),
  xz(5,-30,310,-1.4,0.85),       // 西から: 左が犀川（北）、右手前が雨宮の渡し
  xz(30,4,175,0.4,1.0),
];
const DAY={bg:0xc5d3da,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const FOG={bg:0xd9dcdc,fn:18,ff:140,sun:0.55,sunC:0xf4f0e6,hemi:0.72};
const ENV=[
  DAY,
  {bg:0xc8d2d6,fn:280,ff:820,sun:0.9,sunC:0xfff0d8,hemi:0.6},
  DAY,
  {bg:0x7a6656,fn:160,ff:620,sun:0.45,sunC:0xff9a50,hemi:0.42,slow:true},        // 夕方（橙）からしだいに暗く
  {bg:0x2a3548,fn:130,ff:540,sun:0.28,sunC:0x9fb4d8,hemi:0.36},                   // 夜。霧が出はじめる
  Object.assign({},FOG),                                                         // 濃い霧から晴れていく（update で値を動かす）
  DAY,
  {bg:0xd8c0a4,fn:260,ff:780,sun:0.8,sunC:0xffd0a0,hemi:0.55},
];

Sengoku.start({
  id:'kawanakajima',
  title:'川中島の戦い',
  subtitle:'天文22年〜永禄7年（1553〜64）　武田信玄と上杉謙信（政虎）が北信濃をめぐって対陣した戦い。最大の激戦となった第四次（永禄4年・1561）を中心に見る',
  legend:[{color:'#2c4fb0',label:'上杉軍'},{color:'#c0281f',label:'武田軍'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。第四次の経過は『甲陽軍鑑』などの軍記物語による通説で、細かな経過を伝える確かな史料はありません。川筋は現在のもので、当時の千曲川・犀川の流れとは異なります（雨宮の渡しは今の川から約800m離れています）。城・陣・軍勢・渡し場・史跡の位置と経路は流れを理解するための概念的な再現です（諸説は「諸説」ボタンから読めます）。人・旗・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:15000,conifer:.55,seed:13,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#7a6a34',b2:'#8f7438'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,rnd,smooth,lerp,reduceMotion}=ctx;
    const P=(la,lo)=>LL(la,lo);
    const off=(path,dx,dz)=>path.map(p=>[p[0]+dx,p[1]+dz]);
    // フォントが読めたので「毘」の旗を描きなおす
    for(const k in SIDES){const t=SIDES[k].tex;drawFlag(t.userData.c,t.userData.side);t.needsUpdate=true;}

    /* ---------------- 地点 ---------------- */
    const SAIJO=P(36.5613,138.1714);      // 妻女山（斎場山）
    const KAIZU=P(36.56611,138.19601);    // 海津城（松代城）
    const HACHI=P(36.5907,138.1867);      // 八幡原（八幡社）
    const TENKYU=P(36.5808,138.1889);     // 典厩寺
    const AMENO=P(36.5494,138.1476);      // 雨宮の渡し
    const AMENO_N=P(36.553,138.150);      // 雨宮の渡しの対岸
    const TANBA=P(36.617,138.171);        // 丹波島（集落）
    const TANBA_F=P(36.622,138.178);      // 丹波島の渡し（概略）
    const ICHI_F=P(36.6235,138.190);      // 市村の渡し（概略）
    const HIROSE=P(36.578,138.195);       // 広瀬の渡し（概略）
    const CHAUSU=P(36.5953,138.109);      // 茶臼山
    const KANSUKE_H=P(36.5916,138.1962);  // 山本勘助の墓
    const ZOZAN=P(36.556,138.195),KURABONE=P(36.5429,138.181);
    const OHORI=P(36.61,138.168),SAI_N=P(36.632,138.183);
    const NAOE=P(36.619,138.173);

    // 経路
    const UESUGI_IN=[P(36.645,138.182),P(36.618,138.172),P(36.602,138.166),P(36.586,138.161),P(36.566,138.158),P(36.562,138.165),SAIJO];
    const TAKEDA_IN=[P(36.527,138.106),P(36.548,138.110),P(36.572,138.112),P(36.5935,138.113)];
    const TAKEDA_KAIZU=[P(36.5935,138.113),P(36.592,138.14),P(36.591,138.165),HACHI,HIROSE,KAIZU];
    const TK=[...TAKEDA_IN,...TAKEDA_KAIZU.slice(1,-1)];   // 茶臼山を経て広瀬まで（終点は各隊の持ち場）
    const UESUGI_NIGHT=[SAIJO,P(36.558,138.163),P(36.553,138.153),AMENO,AMENO_N,P(36.565,138.160),P(36.578,138.170),P(36.586,138.177)];
    const BETSUDO=[KAIZU,P(36.5625,138.188),P(36.5605,138.179),SAIJO];
    const HONTAI_NIGHT=[KAIZU,HIROSE,P(36.585,138.19),HACHI];
    const BETSUDO_BACK=[SAIJO,P(36.556,138.16),AMENO,P(36.556,138.152),P(36.572,138.165),P(36.583,138.174)];
    const UESUGI_OUT=[P(36.588,138.178),P(36.600,138.174),TANBA,TANBA_F,P(36.644,138.1825)];
    const UESUGI_OUT2=[P(36.59,138.183),P(36.608,138.185),ICHI_F,P(36.645,138.19)];

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.026},wt={bg:'rgba(34,78,104,.8)',size:0.026},tn={bg:'rgba(22,24,28,.7)',size:0.023};
    const site={bg:'rgba(120,80,40,.85)',size:0.025};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.024,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('川中島',...P(36.603,138.17),{bg:'rgba(52,64,36,.72)',size:0.036},4);
    place('千曲川',...P(36.57,138.165),wt,2);
    place('千曲川',...P(36.60,138.23),wt,2);
    place('犀川',...P(36.625,138.16),wt,2);
    place('妻女山（斎場山）',...SAIJO,mt,13);
    place('象山',...ZOZAN,mt,7);
    place('鞍骨山',...KURABONE,mt,8);
    place('茶臼山',...CHAUSU,mt,9);
    const lblHachi=place('八幡原',...HACHI,site,2.5);
    const lblTenkyu=place('鶴巣寺（現・典厩寺）',...TENKYU,site,4);
    place('雨宮の渡し',...AMENO,wt,1.5);
    place('丹波島の渡し',...TANBA_F,wt,3);
    place('市村の渡し',...ICHI_F,wt,3);
    place('広瀬の渡し',...HIROSE,wt,3);
    place('海津（のちの松代）',...P(36.5600,138.2010),tn,3);
    place('篠ノ井',...P(36.573,138.139),tn,3);
    place('丹波島',...P(36.6155,138.166),tn,3);
    place('↑ 善光寺・横山城方面（約8km）',...P(36.640,138.192),dirStyle,4);
    place('↓ 塩崎城・甲府方面',...P(36.532,138.112),dirStyle,4);
    place('犀川と千曲川の合流点 →',...P(36.633,138.235),dirStyle,4);
    place('← 旭山城方面',...P(36.640,138.125),dirStyle,4);

    /* ---------------- 家並み ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(c,n,ang){
      const len=n*1.1,ca=Math.cos(ang||0),sa=Math.sin(ang||0);
      const a=[c[0]-ca*len/2,c[1]-sa*len/2],b=[c[0]+ca*len/2,c[1]+sa*len/2];
      for(let i=0;i<n;i++){const t=n>1?i/(n-1):.5,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz)||1,s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s,y=gy(px,pz),ry=Math.atan2(b[0]-a[0],b[1]-a[1]);
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ry;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ry+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    town(P(36.5625,138.198),10,0.3);   // 松代
    town(P(36.6170,138.1690),6,0.9);   // 丹波島
    town(P(36.555,138.183),5,0.2);     // 清野
    town(P(36.5617,138.1623),5,-0.4);  // 岩野
    town(P(36.547,138.148),5,0.6);     // 雨宮
    town(P(36.573,138.139),6,1.2);     // 篠ノ井

    /* ---------------- 海津城 ---------------- */
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95}),bankM=new THREE.MeshStandardMaterial({color:0x76864a,roughness:.95});
    const moatM=new THREE.MeshStandardMaterial({color:0x3c4a3a,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    function yagura(g,x,z,y,s){
      const b=new THREE.Mesh(new THREE.BoxGeometry(1.1*s,.9*s,1.1*s),wallM);b.position.set(x,y+.45*s,z);b.castShadow=true;g.add(b);
      const r=new THREE.Mesh(new THREE.ConeGeometry(.95*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.set(x,y+1.12*s,z);r.castShadow=true;g.add(r);
    }
    function gate(g,x,z,y,ang,s){
      const gg=new THREE.Group();gg.position.set(x,y,z);gg.rotation.y=ang;g.add(gg);
      for(const k of[-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.25*s,1.1*s,.25*s),woodM);p.position.set(k*.6*s,.55*s,0);p.castShadow=true;gg.add(p);}
      const top=new THREE.Mesh(new THREE.BoxGeometry(1.7*s,.5*s,.8*s),wallM);top.position.y=1.35*s;top.castShadow=true;gg.add(top);
      const r=new THREE.Mesh(new THREE.BoxGeometry(2.0*s,.14*s,1.1*s),roofM);r.position.y=1.68*s;gg.add(r);
    }
    (function(){
      const g=new THREE.Group();g.position.set(KAIZU[0],gy(KAIZU[0],KAIZU[1]),KAIZU[1]);scene.add(g);
      const moat=new THREE.Mesh(new THREE.BoxGeometry(10,.06,8),moatM);moat.position.y=.03;moat.receiveShadow=true;g.add(moat);
      const hon=new THREE.Mesh(new THREE.BoxGeometry(7.2,.7,5.4),earthM);hon.position.y=.35;hon.castShadow=hon.receiveShadow=true;g.add(hon);
      for(let i=0;i<40;i++){const t=i/40;let x,z;if(t<.5){x=-3.5+t*2*7;z=i%2?-2.6:2.6;}else{x=i%2?-3.5:3.5;z=-2.6+(t-.5)*2*5.2;}
        const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1),woodM);p.position.set(x,.95,z);g.add(p);}
      yagura(g,-2.8,-2,.7,.9);yagura(g,2.8,2,.7,.9);yagura(g,2.8,-2,.7,.8);
      gate(g,-3.6,0,.7,Math.PI/2,.7);
      // 外側の曲輪（土塁の輪）
      for(const [w,d,x,z] of[[15,.6,0,-5.6],[15,.6,0,5.6],[.6,11.8,-7.5,0],[.6,11.8,7.5,0]]){
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,.45,d),bankM);b.position.set(x,.22,z);b.castShadow=b.receiveShadow=true;g.add(b);}
      gate(g,-7.6,0,0,Math.PI/2,.65);gate(g,0,5.7,0,0,.6);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.4),woodM);pole.position.set(0,2.4,0);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5,1.5);fg.translate(.25,0,0);
      const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:SIDES.T.tex,side:THREE.DoubleSide,roughness:.8}));f.position.set(.03,3.2,0);g.add(f);
      ctx.addClear(KAIZU[0],KAIZU[1],11);
      place('海津城',KAIZU[0],KAIZU[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.032},13);
    })();

    /* ---------------- 八幡社と典厩寺 ---------------- */
    const vermM=new THREE.MeshStandardMaterial({color:0xb8452e,roughness:.7});
    (function(){   // 八幡社（小さな社と鳥居）
      const g=new THREE.Group();g.position.set(HACHI[0],gy(HACHI[0],HACHI[1]),HACHI[1]);g.rotation.y=0.6;scene.add(g);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(1.4,.7,1.0),wallM);hall.position.set(0,.35,-.6);hall.castShadow=true;g.add(hall);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.15,.55,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.75);r.position.set(0,.98,-.6);r.castShadow=true;g.add(r);
      for(const k of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.1,6),vermM);p.position.set(k*.45,.55,1.3);p.castShadow=true;g.add(p);}
      const kasa=new THREE.Mesh(new THREE.BoxGeometry(1.4,.1,.14),vermM);kasa.position.set(0,1.12,1.3);g.add(kasa);
      const nuki=new THREE.Mesh(new THREE.BoxGeometry(1.1,.07,.1),vermM);nuki.position.set(0,.9,1.3);g.add(nuki);
      ctx.addClear(HACHI[0],HACHI[1],4);
    })();
    (function(){   // 典厩寺（本堂）
      const g=new THREE.Group();g.position.set(TENKYU[0],gy(TENKYU[0],TENKYU[1]),TENKYU[1]);scene.add(g);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,1.3),wallM);hall.position.y=.4;hall.castShadow=true;g.add(hall);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.5,.65,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.72);r.position.y=1.12;r.castShadow=true;g.add(r);
      ctx.addClear(TENKYU[0],TENKYU[1],3);
    })();

    /* ---------------- 軍勢 ---------------- */
    const units=[];
    const U=d=>{const u=new Unit(d);units.push(u);return u;};
    // 上杉
    const OUT_K=off(UESUGI_OUT,-3,3);
    U({side:'U',name:'長尾景虎（犀川の北・1555）',rows:3,cols:6,face:0,ly:4.2,keys:[SAI_N,null,null,null,null,null,null,null]});
    U({side:'U',tag:'masatora',name:'上杉政虎（本陣）',rows:5,cols:8,faceTo:HACHI,ly:8.4,
      keys:[null,UESUGI_IN,SAIJO,SAIJO,[...UESUGI_NIGHT.slice(1),P(36.5855,138.1725)],[P(36.5885,138.1810)],{p:UESUGI_OUT},null]});
    U({side:'U',tag:'kakizaki',name:'柿崎景家（先鋒）',rows:4,cols:7,faceTo:HACHI,ly:5.2,
      keys:[null,off(UESUGI_IN,4,-3).concat([P(36.5600,138.1660)]),P(36.5600,138.1660),P(36.5600,138.1660),
        [...off(UESUGI_NIGHT.slice(1),3,-3),P(36.5875,138.1755)],[P(36.5885,138.1835)],{p:OUT_K},null]});
    U({side:'U',tag:'amakasu',name:'甘粕長重・村上義清ら（渡河点の備え）',rows:3,cols:6,faceTo:SAIJO,ly:9,
      keys:[null,off(UESUGI_IN,-4,3).concat([P(36.5625,138.1760)]),P(36.5625,138.1760),P(36.5625,138.1760),
        [...UESUGI_NIGHT.slice(1,4),AMENO_N],AMENO_N,{p:[P(36.558,138.146),P(36.566,138.142)]},null]});
    U({side:'U',tag:'irobe',name:'色部勝長・本庄繁長',rows:3,cols:6,faceTo:HACHI,ly:6,
      keys:[null,off(UESUGI_IN,-3,-4).concat([P(36.5590,138.1700)]),P(36.5590,138.1700),P(36.5590,138.1700),
        [...off(UESUGI_NIGHT.slice(1),-3,3),P(36.5825,138.1700)],[P(36.585,138.180)],{p:UESUGI_OUT2},null]});
    U({side:'U',tag:'naoe',name:'直江実綱（小荷駄）',rows:2,cols:5,face:Math.PI,ly:3.6,
      keys:[null,null,null,null,NAOE,NAOE,{p:[NAOE,TANBA_F,P(36.644,138.1835)]},null]});
    // 武田
    U({side:'T',name:'武田晴信（大堀館・1555）',rows:3,cols:6,face:Math.PI,ly:4.2,keys:[OHORI,null,null,null,null,null,null,null]});
    // 海津城のまわりの持ち場（第二〜三幕）
    const KZ={   // 細い流れを避けた持ち場（画面座標）
      shingen:[53,57],nobushige:[46,78],kansuke:[56,48],morozumi:[49,87],masakage:[73,49],naito:[76,58],yoshinobu:[83,64],
      kosaka:[74,67],baba:[66,93],obu:[81,73],sanada:[80,82]};
    const KZ_GUARD=[67,60];
    const march=(dx,dz,spot)=>[...off(TK,dx,dz),spot];
    const T7={   // 第四幕の鶴翼の位置
      shingen:P(36.5912,138.1886),nobushige:P(36.5835,138.1878),kansuke:P(36.5865,138.1810),morozumi:P(36.5895,138.1790),
      masakage:P(36.5955,138.1810),naito:P(36.5935,138.1915),yoshinobu:P(36.5962,138.1872)};
    const SH_BACK=P(36.5930,138.1905);
    U({side:'T',tag:'shingen',name:'武田信玄（本陣）',rows:5,cols:8,faceTo:SAIJO,ly:7.6,
      keys:[null,null,march(0,0,KZ.shingen),KZ.shingen,[...HONTAI_NIGHT.slice(1,-1),T7.shingen],[SH_BACK],SH_BACK,SH_BACK]});
    U({side:'T',tag:'nobushige',name:'武田信繁（典厩）',rows:3,cols:6,faceTo:SAIJO,ly:3.6,
      keys:[null,null,march(4,4,KZ.nobushige),KZ.nobushige,[...off(HONTAI_NIGHT.slice(1,-1),2,4),T7.nobushige],{p:[P(36.585,138.184)]},null,null]});
    U({side:'T',tag:'kansuke',name:'山本勘助',rows:2,cols:5,faceTo:SAIJO,ly:2.2,
      keys:[null,null,march(-4,-4,KZ.kansuke),KZ.kansuke,[...off(HONTAI_NIGHT.slice(1,-1),-3,2),T7.kansuke],{p:[P(36.588,138.182)]},null,null]});
    U({side:'T',tag:'morozumi',name:'諸角虎定',rows:2,cols:5,faceTo:SAIJO,ly:3.2,
      keys:[null,null,march(4,-4,KZ.morozumi),KZ.morozumi,[...off(HONTAI_NIGHT.slice(1,-1),-4,-2),T7.morozumi],{p:[P(36.590,138.180)]},null,null]});
    U({side:'T',tag:'masakage',name:'飯富昌景',rows:3,cols:6,faceTo:SAIJO,ly:4.4,
      keys:[null,null,march(-4,4,KZ.masakage),KZ.masakage,[...off(HONTAI_NIGHT.slice(1,-1),-2,-4),T7.masakage],[P(36.5950,138.1830)],P(36.5950,138.1830),P(36.5950,138.1830)]});
    U({side:'T',tag:'naito',name:'工藤祐長（内藤昌豊）',rows:3,cols:6,faceTo:SAIJO,ly:3.4,
      keys:[null,null,march(0,6,KZ.naito),KZ.naito,[...off(HONTAI_NIGHT.slice(1,-1),3,-2),T7.naito],T7.naito,T7.naito,T7.naito]});
    U({side:'T',tag:'yoshinobu',name:'武田義信',rows:3,cols:6,faceTo:SAIJO,ly:6.2,
      keys:[null,null,march(0,-6,KZ.yoshinobu),KZ.yoshinobu,[...off(HONTAI_NIGHT.slice(1,-1),1,-5),T7.yoshinobu],T7.yoshinobu,T7.yoshinobu,T7.yoshinobu]});
    // 別働隊（海津城→妻女山→雨宮の渡し→八幡原）
    const SJ={kosaka:SAIJO,baba:off([SAIJO],-5,3)[0],obu:off([SAIJO],5,-3)[0],sanada:off([SAIJO],-2,-6)[0]};
    const B6={kosaka:P(36.5830,138.1740),baba:P(36.5812,138.1762),obu:P(36.5848,138.1712),sanada:P(36.5800,138.1720)};
    const B7={kosaka:P(36.5860,138.1800),baba:P(36.5840,138.1820),obu:P(36.5878,138.1838),sanada:P(36.5852,138.1862)};
    const betsudo=(name,k,dx,dz,rows,cols,start,ly)=>U({side:'T',tag:k,name,rows,cols,faceTo:HACHI,ly,
      keys:[null,start,start?KZ[k]:march(dx,dz,KZ[k]),KZ[k],[...off(BETSUDO.slice(1,-1),dx*.6,dz*.6),SJ[k]],SJ[k],[...off(BETSUDO_BACK.slice(1,-1),dx*.6,dz*.6),B6[k]],[B7[k]]]});
    betsudo('高坂昌信（別働隊）','kosaka',2,2,3,6,KZ.kosaka,4.6);
    betsudo('馬場信房（別働隊）','baba',-2,5,3,6,null,4.0);
    betsudo('飯富虎昌（別働隊）','obu',5,-2,3,6,null,4.4);
    betsudo('真田幸綱（別働隊）','sanada',-5,-2,2,5,null,3.6);
    U({side:'T',tag:'guard',name:'海津城の守兵',rows:2,cols:4,faceTo:SAIJO,ly:3.4,
      keys:[null,KZ_GUARD,KZ_GUARD,KZ_GUARD,KZ_GUARD,KZ_GUARD,KZ_GUARD,KZ_GUARD]});

    // 場面ごとに名札を出す部隊（ここにない場面はすべて出す）。部隊が密集する場面で名札が重ならないようにする
    const SHOW={
      1:['masatora','kosaka'],
      2:['masatora','shingen'],
      3:['masatora','shingen'],
      4:['masatora','amakasu','naoe','shingen','kosaka','nobushige'],
      5:['masatora','kakizaki','irobe','shingen','nobushige','kansuke','morozumi','masakage','naito','yoshinobu'],
      6:['masatora','naoe','amakasu','shingen','kosaka'],
      7:['shingen'],
    };

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f;
    const arrows=[
      new Arrow([P(36.646,138.186),P(36.638,138.185),SAI_N],AI,1.6,0),
      new Arrow([P(36.527,138.106),P(36.548,138.110),P(36.575,138.125),P(36.598,138.155),P(36.607,138.166)],SHU,1.6,0),
      new Arrow(UESUGI_IN,AI,3,1),
      new Arrow(TAKEDA_IN,SHU,2.6,2),
      new Arrow(TAKEDA_KAIZU,SHU,2.6,2),
      new Arrow(UESUGI_NIGHT,AI,3.4,4),
      new Arrow(BETSUDO,SHU,2.2,4),
      new Arrow(HONTAI_NIGHT,SHU,2.4,4),
      new Arrow([P(36.5872,138.1750),P(36.5880,138.1790),P(36.5886,138.1830)],AI,2.8,5),
      new Arrow([P(36.5852,138.1720),P(36.5868,138.1765),P(36.5884,138.1805)],AI,2.2,5),
      new Arrow([P(36.5825,138.1700),P(36.5838,138.1750),P(36.5850,138.1795)],AI,2,5),
      new Arrow(BETSUDO_BACK,SHU,2.4,6),
      new Arrow(UESUGI_OUT,AI,2.6,6),
      new Arrow(UESUGI_OUT2,AI,1.8,6),
    ];

    /* ---------------- 場面ごとに出す説明ラベル ---------------- */
    const note={bg:'rgba(22,24,28,.8)',size:0.024};
    const L1=(text,p,o,dy,on)=>{const s=place(text,p[0],p[1],o,dy);s.material.opacity=0;return {s,on};};
    const tips=[
      L1('政虎、炊煙の多さを見て動きを察したと伝わる',SAIJO,note,19,(c,t)=>c===3&&t>3),
      L1('軍議：啄木鳥戦法（と伝わる）',KAIZU,{bg:'rgba(150,26,20,.85)',size:0.025},21,(c,t)=>c===3&&t>1),
      L1('上杉の陣はもぬけの殻だったと伝わる',SAIJO,note,24,(c,t)=>c===4&&t>8.5),
      L1('信繁・勘助・諸角、討死と伝わる',P(36.5880,138.1850),note,18,(c,t)=>c===5&&t>7),
      L1('一騎討ちの地と伝わる（三太刀七太刀之跡）',HACHI,{bg:'rgba(120,80,40,.9)',size:0.024},10,(c,t)=>c===6&&t>2),
      L1('典厩寺（信繁の墓）',TENKYU,site,4,(c)=>c===7),
      L1('山本勘助の墓',KANSUKE_H,site,4,(c)=>c===7),
      L1('八幡原（首塚）',HACHI,site,2.5,(c)=>c===7),
    ];

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<110;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1,o:.55});}
    const flashes=[];for(let i=0;i<20;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      if(kind==='cook'){p.life=p.max=6+Math.random()*3;p.vx=.3+Math.random()*.2;p.vy=2.6;p.vz=(Math.random()-.5)*.2;p.g=1.25;p.o=.7;p.s.material.color.set(0xf2efe8);}
      else{p.life=p.max=3+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=1.3;p.vz=(Math.random()-.5)*.4;p.g=.8;p.o=.55;p.s.material.color.set(0xcfcac2);}
      p.s.visible=true;}
    const COOK=[[-3,-2],[2,-1.5],[-1,2],[3,2.2],[-4.5,3.5],[5,-4],[0,-4.6],[-5.5,-3.5],[4.6,4.4]].map(([dx,dz])=>[KAIZU[0]+dx,KAIZU[1]+dz,1.2]);
    const FIRE={5:[[...P(36.5885,138.1815),9],[...P(36.5862,138.1830),8],[...P(36.5850,138.1840),7]],
      6:[[...AMENO_N,7],[...P(36.5895,138.1830),9]]};
    let emitAcc=0;
    function update(cur,tIn,dt,time){
      const sh=SHOW[cur];if(sh)for(const u of units)if(!sh.includes(u.d.tag))u.label.material.opacity=0;
      // 第五幕: 濃い霧から晴れていく（場面の環境の値をその場で書きかえる）
      if(cur===5){const k=smooth(3.2,10.5,tIn),E=ENV[5];
        E.fn=lerp(FOG.fn,DAY.fn,k);E.ff=lerp(FOG.ff,DAY.ff,k);E.sun=lerp(FOG.sun,DAY.sun,k);E.hemi=lerp(FOG.hemi,DAY.hemi,k);
        const a=new THREE.Color(FOG.bg).lerp(new THREE.Color(DAY.bg),k);E.bg=a.getHex();}
      for(const tp of tips){const v=tp.on(cur,tIn)?1:0;tp.s.material.opacity+=(v-tp.s.material.opacity)*Math.min(1,dt*2);}
      const r7=cur===7?0:1;
      lblTenkyu.material.opacity+=(r7-lblTenkyu.material.opacity)*Math.min(1,dt*2);
      lblHachi.material.opacity+=(r7-lblHachi.material.opacity)*Math.min(1,dt*2);
      const cook=cur===3&&tIn>0.8,zones=tIn>2?FIRE[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(cook){for(let i=0;i<2;i++){const z=COOK[(Math.random()*COOK.length)|0];emit(z[0],z[1],z[2],'cook');}}
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*q.o;if(q.life<=0)q.s.visible=false;}
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
