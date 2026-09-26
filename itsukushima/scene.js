(function(){
const TAU=Math.PI*2;
const wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};

/* ---------------- 家紋（旗と帆に使う） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='M'){                       // 毛利: 一文字三星
    x.fillRect(cx-r*.95,cy-r*.9,r*1.9,r*.3);
    for(const [dx,dy] of[[-.48,.05],[.48,.05],[0,.62]]){x.beginPath();x.arc(cx+dx*r,cy+dy*r,r*.3,0,TAU);x.fill();}
  }else if(side==='S'){                 // 陶（大内家の一族）: 菱
    x.lineWidth=r*.2;x.beginPath();x.moveTo(cx,cy-r);x.lineTo(cx+r*.72,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r*.72,cy);x.closePath();x.stroke();
    x.beginPath();x.moveTo(cx,cy-r*.38);x.lineTo(cx+r*.27,cy);x.lineTo(cx,cy+r*.38);x.lineTo(cx-r*.27,cy);x.closePath();x.fill();
  }else{                                // 村上（来島）: 折敷に縮み三文字
    x.lineWidth=r*.16;x.beginPath();const q=r*.95,c_=r*.3;
    x.moveTo(cx-q+c_,cy-q);x.lineTo(cx+q-c_,cy-q);x.lineTo(cx+q,cy-q+c_);x.lineTo(cx+q,cy+q-c_);x.lineTo(cx+q-c_,cy+q);x.lineTo(cx-q+c_,cy+q);x.lineTo(cx-q,cy+q-c_);x.lineTo(cx-q,cy-q+c_);x.closePath();x.stroke();
    for(const [w,dy] of[[.7,-.42],[.5,0],[.7,.42]])x.fillRect(cx-r*w*.5,cy+r*dy-r*.09,r*w,r*.18);
  }
}
const CREST={M:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'},S:{bg:'#b8231b',fg:'#f3efe4'},V:{bg:'#e9e4d6',fg:'#17524a'}};
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle=k.bg;x.fillRect(0,0,64,200);crest(x,side,32,52,17,k.fg);
  if(k.band){x.fillStyle=k.band;x.fillRect(0,0,64,10);}
  x.fillStyle=k.fg;x.fillRect(29,86,6,90);
  return new THREE.CanvasTexture(c);
}
function sailTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=80;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle='#ece5d2';x.fillRect(0,0,64,80);
  x.strokeStyle='rgba(90,80,60,.35)';x.lineWidth=1;for(let i=1;i<4;i++){x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16,80);x.stroke();}
  crest(x,side,32,40,14,side==='S'?'#b8231b':side==='V'?'#17524a':'#1d1d1d');
  return new THREE.CanvasTexture(c);
}
const SIDES={
  M:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('M'),sail:sailTex('M')},
  S:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('S'),sail:sailTex('S')},
  V:{body:new THREE.Color(0x1e5e56),label:'rgba(24,96,86,.88)',tex:flagTex('V'),sail:sailTex('V')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'天文24年（1555）9月21日',title:'厳島をめぐる攻防',text:'主君の大内義隆を討って大内家の実権を握った陶晴賢と、それと決別した毛利元就は、前の年から安芸で戦っていた。海上交通の要である厳島には毛利方の宮尾城があり、己斐直之・新里宮内少輔ら約500が守っていた。9月21日、晴賢は周防・長門などの軍勢（通説では2万余、船500艘）を率いて岩国を出港し、その夜は島の沖に泊まった。'},
  {act:'一',date:'9月22日〜27日',title:'陶軍、上陸して宮尾城を囲む',text:'22日の早朝、陶軍は大元浦から上陸し、宮尾城を見おろす塔の岡に本陣を置いた。大軍は大聖院や弥山のふもとまで広がり、島の周りの海も警固船が固めたと伝わる。陶軍は尾根づたいに宮尾城へ攻め寄せ、堀を埋め、水の手を断った。元就は24日に草津城（画面の外、北東）まで出て村上水軍の来援を待ち、26日には熊谷信直の船団を宮尾城の救援に送った。'},
  {act:'二',date:'9月28日〜30日',title:'地御前に集結、村上水軍が来る',text:'28日、元就は全軍を対岸の地御前に進めた。毛利・小早川の船は合わせて110〜130艘ほどで、通説ではこの日、来島などの村上水軍200〜300艘が救援に駆けつけたとされる。元就は軍を三つに分けた。元就・隆元・吉川元春の本隊、宮尾城の兵と合流する小早川隆景の別働隊、そして村上水軍である。'},
  {act:'三',date:'9月30日 夜',title:'嵐の夜の渡海',text:'30日の夕方、雷をともなう暴風雨になった。元就は「風雨こそ天の加護」と言って出港を強行したと伝わる。本隊は敵に気づかれないよう島の東側へ回り込み、夜9時ごろ東岸の包ヶ浦に上陸すると、退路を断つため船をすべて対岸へ返した。小早川隊は大野瀬戸を西へ迂回して大鳥居の沖に近づき、「筑前からの加勢」と称して岸に上がったと伝わる。村上水軍は沖で夜明けを待った。'},
  {act:'四',date:'10月1日 明け方',title:'博奕尾からの奇襲',text:'夜明け前、包ヶ浦から山道を登った毛利本隊は、吉川勢を先頭に博奕尾の尾根を越え、鬨の声を上げて陶軍の背後（紅葉谷側）へ駆け下りた。これに合わせて小早川隊と宮尾城の兵が正面から塔の岡へ攻め上り、沖の村上水軍は陶軍の船に襲いかかって焼き払った。嵐で油断していたうえ、狭い島内に大軍がひしめいていた陶軍は身動きがとれず、総崩れになった。'},
  {act:'五',date:'10月1日 午前〜昼過ぎ',title:'陶軍の崩壊',text:'陶軍の将兵は島から逃れようと船を奪い合い、沈んだり溺れたりする者が続出した。西へ逃げる晴賢を吉川隊が追い、弘中隆兼の手勢が滝小路で立ちはだかったのち大聖院へ退いた。晴賢は最初に上陸した大元浦までたどり着いたが乗れる船はなく、三浦房清が殿（しんがり）となって討ち死にした。島での戦いは、弘中隊の抵抗を除いて昼過ぎまでにほぼ終わった。'},
  {act:'結',date:'10月1日〜5日',title:'陶晴賢の最期と、その後',text:'わずかな近習に守られた晴賢は、さらに西の大江浦まで逃れたが船はなく、そこで自刃した（35歳）。弘中隆兼は駒ヶ林の岩場に立てこもって抗戦し、3日に討ち死にした。元就は、神域である島を清めるため死者を対岸の大野へ運び出させ、社殿を潮水で洗わせたうえで、5日に桜尾城へ引き上げて首実検を行った。この勝利で大内氏は急速に衰え、毛利氏は2年後に周防・長門を手に入れて中国地方の大大名になる。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る
const CAM=[
  {t:[-10,null,0],d:300,yaw:1.1,pitch:0.9},
  {t:[12,null,10],d:100,yaw:-2.3,pitch:0.7},
  {t:[22,null,-118],d:170,yaw:1.35,pitch:0.85},
  {t:[20,null,-35],d:280,yaw:0.6,pitch:0.95},
  {t:[30,null,12],d:110,yaw:2.45,pitch:0.62},
  {t:[2,null,14],d:115,yaw:-2.4,pitch:0.7},
  {t:[-45,null,60],d:240,yaw:2.5,pitch:0.85},
];
const DAY={bg:0xc2d0d8,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  DAY,DAY,
  {bg:0xd6b9a0,fn:240,ff:760,sun:0.75,sunC:0xffc890,hemi:0.55},
  {bg:0x1b2333,fn:80,ff:460,sun:0.22,sunC:0x8fa3d0,hemi:0.36},
  {bg:0xb9c4cf,fn:160,ff:620,sun:0.55,sunC:0xffe0c0,hemi:0.6},
  DAY,
  {bg:0xd8c0a4,fn:260,ff:780,sun:0.8,sunC:0xffd0a0,hemi:0.55},
];

Sengoku.start({
  id:'itsukushima',
  title:'厳島の戦い',
  subtitle:'天文24年10月1日（1555年10月16日）　毛利元就と陶晴賢の、安芸国厳島（宮島）での決戦',
  legend:[{color:'#2c4fb0',label:'毛利軍'},{color:'#c0281f',label:'陶軍'},{color:'#1f7a6f',label:'村上水軍'},{arrow:'#2c4fb0',label:'進軍・渡海の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。海は標高データのない範囲を海面として描き、近代の埋立地は当時の海に戻しています。軍勢・船の数と配置は流れを理解するための概念的な再現です（兵力や経過の細部には諸説あり。「諸説」ボタンから読めます）。人・旗・船・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:16000,conifer:.6,seed:5,
  treeColors:{c1:'#2c4a2a',c2:'#436238',b1:'#566b34',b2:'#7b7a3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,makeLabel,rnd,smooth,lerp,ease,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const YOG=at(34.30050,132.32229);   // 宮尾城（要害山）
    const TOU=at(34.29725,132.32068);   // 塔の岡（五重塔）
    const SHR=[14.6,13.6];              // 厳島神社（海上の社殿）
    const TORII=[8.6,9.2];              // 大鳥居
    const OMO=[-3,17.5];                // 大元浦の浜
    const DAI=at(34.2925,132.3190);     // 大聖院
    const TAKI=[11,21];                 // 滝小路
    const TSU=[79,17];                  // 包ヶ浦の浜
    const BAKU=[50,31];                 // 博奕尾（尾根の鞍部）
    const MOMI=[30,19];                 // 紅葉谷
    const KOMA=at(34.28143,132.31439);  // 駒ヶ林
    const MISEN=at(34.27959,132.31961); // 弥山
    const JIG=at(34.33633,132.31913);   // 地御前神社
    const OE=[-95,106];                 // 大江浦（陶晴賢 自刃の地と伝わる。位置は概略）
    const TATARA=at(34.28835,132.29955);
    const ONO=[-113,36];
    // 海上の地点
    const OMO_SEA=[-9,11],ARI_SEA=[3,1],SUGI_SEA=[64,-26];
    const JIG_SEA=[24,-140],JIG_SEA2=[28,-128],JIG_SEA3=[40,-134];
    const MUR_WAIT=[-20,-2],TSU_SEA=[89,11],KOB_SEA=[5,5];
    const SEA_Y=gy(OMO_SEA[0],OMO_SEA[1]);
    // 経路
    const SUE_IN=[[-190,126],[-165,112],[-140,100],[-118,85],[-100,62],[-90,50],[-82,40],[-70,30],[-55,22],[-35,12],OMO_SEA];   // 岩国から大野瀬戸を抜けて大元浦沖へ
    const MAIN_X=[[45,-100],[62,-70],[70,-50],[75,-30],[80,-20],[86,-8],[92,2],TSU_SEA];                                        // 本隊: 島の東へ回り込み包ヶ浦へ
    const KOB_X=[[16,-100],[4,-70],[-15,-50],[-25,-30],[-45,-5],[-50,8],[-30,10],[-10,6],KOB_SEA];                                // 小早川: 大野瀬戸を西へ迂回し大鳥居の沖へ
    const MUR_IN=[[190,-92],[120,-110],[60,-122],JIG_SEA3];                                                                     // 村上水軍: 東（芸予諸島）から地御前沖へ
    const MUR_X=[[16,-100],[4,-70],[-15,-50],[-25,-30],[-45,-5],MUR_WAIT];
    const KUMA_IN=[[150,-120],[60,-70],[30,-30],[15,-9]];                                                                        // 熊谷信直の援軍船
    const RIDGE=[TSU,[73,22],[65,30],[57,25],BAKU,[44,24],[38,18],[32,19],[25,14],[21,12]];                                         // 包ヶ浦 → 博奕尾 → 紅葉谷 → 塔の岡
    const FLIGHT=[TOU,[16,16],[12,19],[6,19],[0,18],OMO];
    const COAST=[OMO,[-27,21],[-43,31],[-61,41],[-78,51],[-83,61],[-90,71],[-94,81],[-95,91],[-96,101],OE];

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.028},wt={bg:'rgba(34,78,104,.8)',size:0.026},tn={bg:'rgba(22,24,28,.7)',size:0.024};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.025,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('厳島（宮島）',40,58,{bg:'rgba(52,64,36,.72)',size:0.03},16);
    place('弥山',...MISEN,mt,9);
    place('駒ヶ林',...KOMA,mt,9);
    place('博奕尾',...BAKU,mt,6);
    place('紅葉谷',...MOMI,{bg:'rgba(52,64,36,.72)',size:0.024},4);
    place('塔の岡',...TOU,{bg:'rgba(52,64,36,.8)',size:0.026},9);
    place('大聖院',...DAI,tn,4);
    place('滝小路',...TAKI,tn,2);
    place('大元浦',-7,14,wt,2);
    place('有の浦',5,-2,wt,2);
    place('包ヶ浦',87,13,wt,2);
    place('杉之浦',64,-23,wt,2);
    place('聖崎',54,-45,tn,3);
    place('大野瀬戸',-83,45,wt,2);
    place('多々良',...TATARA,tn,3);
    place('大江浦',-100,104,wt,2);
    place('地御前',...JIG,tn,4);
    place('大野',...ONO,tn,4);
    place('廿日市',45,-192,tn,4);
    place('↑ 桜尾城・草津城方面',95,-186,dirStyle,4);
    place('← 岩国方面（陶軍の出発地）',-165,140,dirStyle,4);
    place('芸予諸島・来島方面 →',170,-96,dirStyle,4);

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
    town([25,-6],[19,4],8);            // 厳島の門前町
    town([10,-126],[8,-146],9);        // 地御前
    town([-116,32],[-110,39],6);       // 大野
    town([40,-195],[50,-190],6);       // 廿日市

    /* ---------------- 宮尾城（要害山の砦） ---------------- */
    (function(){
      const g=new THREE.Group();g.position.set(YOG[0],gy(YOG[0],YOG[1]),YOG[1]);scene.add(g);
      const pm=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9}),hm=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9});
      const em=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95});
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.6,3.6,1.0,24),em);mound.position.y=.3;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<28;i++){const a=i/28*TAU;const p=new THREE.Mesh(new THREE.BoxGeometry(.12,.8,.12),pm);p.position.set(Math.cos(a)*2.3,1.2,Math.sin(a)*2.3);p.castShadow=true;g.add(p);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.4,.8,1.0),hm);hut.position.set(0,1.2,0);hut.castShadow=true;g.add(hut);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(1.15,.55,4),roofM);roof.rotation.y=Math.PI/4;roof.position.set(0,1.87,0);roof.scale.set(1,1,.8);roof.castShadow=true;g.add(roof);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3),pm);pole.position.set(1.2,2.3,-.8);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5,1.5);fg.translate(.25,0,0);
      const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:SIDES.M.tex,side:THREE.DoubleSide,roughness:.8}));f.position.set(1.23,3.0,-.8);g.add(f);
      ctx.addClear(YOG[0],YOG[1],6);
      place('宮尾城',YOG[0],YOG[1],{bg:'rgba(34,62,140,.9)',stroke:'rgba(255,255,255,.55)',size:0.034},8);
    })();

    /* ---------------- 五重塔（塔の岡。応永14年（1407）建立） ---------------- */
    (function(){
      const g=new THREE.Group();g.position.set(TOU[0],gy(TOU[0],TOU[1]),TOU[1]);scene.add(g);
      const bm=new THREE.MeshStandardMaterial({color:0xb5442c,roughness:.8}),rm=new THREE.MeshStandardMaterial({color:0x3b3632,roughness:.8});
      const base=new THREE.Mesh(new THREE.BoxGeometry(1.6,.25,1.6),new THREE.MeshStandardMaterial({color:0x9a9a92,roughness:1}));base.position.y=.12;base.receiveShadow=true;g.add(base);
      let y=.25;
      for(let i=0;i<5;i++){const w=1.05-i*.13,h=.42;
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bm);b.position.y=y+h/2;b.castShadow=true;g.add(b);
        const r=new THREE.Mesh(new THREE.ConeGeometry((w+.55)*.72,.3,4),rm);r.rotation.y=Math.PI/4;r.position.y=y+h+.12;r.castShadow=true;g.add(r);
        y+=h+.2;}
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.9,6),new THREE.MeshStandardMaterial({color:0xc9a13b,metalness:.5,roughness:.4}));sp.position.y=y+.4;g.add(sp);
      ctx.addClear(TOU[0],TOU[1],4);
    })();

    /* ---------------- 厳島神社（海上の社殿）と大鳥居 ---------------- */
    const vermM=new THREE.MeshStandardMaterial({color:0xc24a2f,roughness:.8}),darkM=new THREE.MeshStandardMaterial({color:0x3b3632,roughness:.8});
    (function(){
      const g=new THREE.Group();g.position.set(SHR[0],SEA_Y,SHR[1]);g.rotation.y=Math.atan2(TORII[0]-SHR[0],TORII[1]-SHR[1]);scene.add(g);   // 局所 +z が大鳥居（海）の方
      const dm=new THREE.MeshStandardMaterial({color:0x8a5a3a,roughness:.9});
      for(let i=-2;i<=2;i++)for(let j=-1;j<=1;j++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.7,6),vermM);p.position.set(i*1.0,.35,j*.9);g.add(p);}
      const deck=new THREE.Mesh(new THREE.BoxGeometry(5.4,.1,2.6),dm);deck.position.y=.7;deck.receiveShadow=true;g.add(deck);
      const hon=new THREE.Mesh(new THREE.BoxGeometry(2.4,.7,1.2),vermM);hon.position.set(0,1.1,-.6);hon.castShadow=true;g.add(hon);
      const honR=new THREE.Mesh(new THREE.ConeGeometry(1.9,.55,4),darkM);honR.rotation.y=Math.PI/4;honR.scale.set(1,1,.7);honR.position.set(0,1.72,-.6);honR.castShadow=true;g.add(honR);
      for(const s of[-1,1]){const c=new THREE.Mesh(new THREE.BoxGeometry(1.0,.4,2.2),vermM);c.position.set(s*2.2,.95,0);c.castShadow=true;g.add(c);
        const cr=new THREE.Mesh(new THREE.BoxGeometry(1.2,.12,2.5),darkM);cr.position.set(s*2.2,1.2,0);g.add(cr);}
      const st=new THREE.Mesh(new THREE.BoxGeometry(1.0,.12,.9),vermM);st.position.set(0,.8,.7);g.add(st);
      place('厳島神社',SHR[0],SHR[1],{bg:'rgba(160,52,36,.85)',size:0.028},3.5);
    })();
    (function(){
      const g=new THREE.Group();g.position.set(TORII[0],SEA_Y,TORII[1]);g.rotation.y=Math.atan2(SHR[0]-TORII[0],SHR[1]-TORII[1]);scene.add(g);
      const bk=new THREE.MeshStandardMaterial({color:0x2b2622,roughness:.8});
      for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,1.7,10),vermM);p.position.set(s*.75,.85,0);p.castShadow=true;g.add(p);
        for(const t of[-1,1]){const q=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,1.2,8),vermM);q.position.set(s*.75,.6,t*.5);q.rotation.x=t*.35;g.add(q);}}
      const kasagi=new THREE.Mesh(new THREE.BoxGeometry(2.6,.16,.2),bk);kasagi.position.y=1.75;kasagi.castShadow=true;g.add(kasagi);
      const shimaki=new THREE.Mesh(new THREE.BoxGeometry(2.3,.12,.18),vermM);shimaki.position.y=1.6;g.add(shimaki);
      const nuki=new THREE.Mesh(new THREE.BoxGeometry(2.1,.1,.14),vermM);nuki.position.y=1.2;g.add(nuki);
    })();

    /* ---------------- 船（軍船の群れ。Unit と同じ keys の書き方で動かす） ---------------- */
    const M4=(x,y,z,rx,ry,rz)=>{const m=new THREE.Matrix4();m.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(1,1,1));return m;};
    function mergeParts(parts){
      const gs=[];let n=0;
      for(const p of parts){const g=p.g.index?p.g.toNonIndexed():p.g;if(p.m)g.applyMatrix4(p.m);const cnt=g.attributes.position.count,col=new Float32Array(cnt*3),c=new THREE.Color(p.c);
        for(let i=0;i<cnt;i++){col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}g.setAttribute('color',new THREE.BufferAttribute(col,3));gs.push(g);n+=cnt;}
      const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
      for(const g of gs){pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);col.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
    }
    const BOAT=(function(){
      const HULL=0x4a3524,DECK=0xb99b6a,CASTLE=0x8a6a42,WOOD=0x6b4f33,WALL=0xe6dfcc,ROOF=0x3a352f;
      const body=mergeParts([
        {g:new THREE.BoxGeometry(.7,.26,2.3),c:HULL,m:M4(0,.13,0)},
        {g:new THREE.BoxGeometry(.6,.05,2.1),c:DECK,m:M4(0,.28,0)},
        {g:new THREE.BoxGeometry(.5,.24,.5),c:HULL,m:M4(0,.14,1.3,0,Math.PI/4,0)},      // 舳先
        {g:new THREE.BoxGeometry(.55,.32,.6),c:CASTLE,m:M4(0,.46,-.75)},               // 艫の矢倉
        {g:new THREE.BoxGeometry(.46,.4,.55),c:WALL,m:M4(0,.5,.15)},                   // 総矢倉
        {g:new THREE.ConeGeometry(.42,.26,4),c:ROOF,m:M4(0,.83,.15,0,Math.PI/4,0)},
        {g:new THREE.CylinderGeometry(.025,.03,2,6),c:WOOD,m:M4(0,1.2,-.1)},           // 帆柱
        {g:new THREE.BoxGeometry(1.05,.035,.035),c:WOOD,m:M4(0,2.15,-.1)},             // 帆桁
      ]);
      const sail=new THREE.PlaneGeometry(.98,1.25);sail.translate(0,-.625,0);           // 帆桁から吊る（原点が帆桁）
      return {body,sail};
    })();
    const fleets=[];
    class Fleet{
      constructor(d){
        this.d=d;const side=SIDES[d.side];const n=d.n||12;
        this.g=new THREE.Group();scene.add(this.g);
        this.bodyM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,transparent:true,opacity:0});
        this.sailM=new THREE.MeshStandardMaterial({map:side.sail,side:THREE.DoubleSide,roughness:.9,transparent:true,opacity:0});
        this.body=new THREE.InstancedMesh(BOAT.body,this.bodyM,n);this.sail=new THREE.InstancedMesh(BOAT.sail,this.sailM,n);
        for(const m of[this.body,this.sail]){m.castShadow=true;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;this.g.add(m);}
        const cols=Math.max(2,Math.round(Math.sqrt(n*1.6))),sp=d.sp||2.4;
        this.boats=[];
        for(let i=0;i<n;i++){const c=i%cols,r=(i/cols)|0;
          this.boats.push({x:(c-(cols-1)/2)*sp+(r%2?sp*.4:0)+(rnd()-.5)*sp*.4,z:-r*sp*1.15+(rnd()-.5)*sp*.4,s:(d.size||.85)*(.8+rnd()*.4)*(i===0?1.3:1),ph:rnd()*TAU});}
        this.label=makeLabel(d.name,{bg:side.label,size:0.023});this.label.position.y=d.ly||3.4;this.g.add(this.label);
        this.polys=[];this.ends=[];this.fades=[];let last=null,hidden=false;this.first=null;
        d.keys.forEach(k=>{
          if(k==null){this.polys.push(null);this.ends.push(last);this.fades.push(false);hidden=true;return;}
          let fade=false;if(!Array.isArray(k)){fade=true;k=k.p;}
          const pts=Array.isArray(k[0])?k:[k];if(!this.first)this.first=pts[0];
          let poly=last&&!hidden?[last,...pts]:pts.slice();if(poly.length===1)poly=[poly[0],poly[0]];
          this.polys.push(poly);last=pts[pts.length-1];this.ends.push(last);this.fades.push(fade);hidden=false;
        });
        this.x=null;this.z=null;this.yaw=d.face||0;this.op=0;this.sailUp=0;this.D=new THREE.Object3D();this.m2=new THREE.Matrix4();this.mo=new THREE.Matrix4();
        fleets.push(this);
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
        const r=this.posAt(ph,p);
        if(this.x==null){this.x=r.x;this.z=r.z;}
        const dx=r.x-this.x,dz=r.z-this.z,dist=Math.hypot(dx,dz);
        let ty=this.yaw,moving=false;
        if(dist>8){}
        else if(dist/Math.max(dt,1e-3)>0.35){ty=Math.atan2(dx,dz);moving=true;}
        else if(this.d.faceTo){const f=this.d.faceTo;ty=Math.atan2(f[0]-r.x,f[1]-r.z);}
        this.x=r.x;this.z=r.z;
        this.yaw+=wrapA(ty-this.yaw)*Math.min(1,dt*2);
        this.op+=(r.a-this.op)*Math.min(1,dt*2.5);
        this.sailUp+=((moving?1:.22)-this.sailUp)*Math.min(1,dt*1.2);
        this.g.visible=this.op>0.02;if(!this.g.visible)return;
        this.bodyM.opacity=this.sailM.opacity=this.op;this.label.material.opacity=this.op;
        this.g.position.set(this.x,SEA_Y,this.z);this.g.rotation.y=this.yaw;
        const D=this.D;this.mo.makeScale(1,this.sailUp,1).setPosition(0,2.15,-.1);
        this.boats.forEach((b,i)=>{
          const bob=reduceMotion?0:Math.sin(time*1.7+b.ph)*.05;
          D.position.set(b.x,bob,b.z);D.rotation.set(reduceMotion?0:Math.sin(time*1.2+b.ph)*.03,0,reduceMotion?0:Math.sin(time*1.5+b.ph*1.3)*.05);D.scale.setScalar(b.s);D.updateMatrix();
          this.body.setMatrixAt(i,D.matrix);this.m2.multiplyMatrices(D.matrix,this.mo);this.sail.setMatrixAt(i,this.m2);});
        this.body.instanceMatrix.needsUpdate=this.sail.instanceMatrix.needsUpdate=true;
      }
    }
    new Fleet({side:'S',name:'陶水軍（屋代島衆）',n:26,faceTo:OMO,keys:[SUE_IN,OMO_SEA,OMO_SEA,OMO_SEA,OMO_SEA,{p:[[-14,8],[-24,4]]},null]});
    new Fleet({side:'S',name:'陶水軍・有の浦',n:9,ly:4.6,faceTo:[10,-3],keys:[[[-35,12],[-12,6],ARI_SEA],ARI_SEA,ARI_SEA,ARI_SEA,ARI_SEA,{p:[[-4,0],[-14,-4]]},null]});
    new Fleet({side:'S',name:'陶水軍・杉之浦',n:7,faceTo:[70,-22],keys:[null,[[-20,-10],[-10,-40],[20,-50],[62,-48],[64,-32],SUGI_SEA],SUGI_SEA,SUGI_SEA,SUGI_SEA,{p:[[70,-36],[82,-52]]},null]});
    new Fleet({side:'M',name:'毛利本隊の船（児玉就方）',n:16,faceTo:[60,-136],keys:[null,null,[[62,-150],[40,-142],JIG_SEA],MAIN_X,{p:[[92,0],[80,-30],[60,-80],[40,-120],[26,-138]]},null,null]});
    new Fleet({side:'M',name:'小早川隊の船（乃美宗勝）',n:11,ly:4.8,faceTo:[16,9],keys:[null,null,[[62,-146],[44,-136],JIG_SEA2],KOB_X,KOB_SEA,KOB_SEA,null]});
    new Fleet({side:'V',name:'村上水軍（来島など）',n:28,ly:6,faceTo:[-6,10],keys:[null,null,MUR_IN,MUR_X,[[-14,6]],[-14,6],[-16,4]]});
    new Fleet({side:'M',name:'熊谷信直の援軍船',n:6,ly:4.2,faceTo:YOG,keys:[null,KUMA_IN,[15,-9],[15,-9],[15,-9],[15,-9],null]});

    /* ---------------- 軍勢 ---------------- */
    const units=[
      new Unit({side:'M',name:'己斐直之・新里宮内少輔（城兵）',rows:3,cols:5,faceTo:TOU,ly:4.6,keys:[YOG,YOG,YOG,YOG,[[19,7]],[19,7],YOG]}),
      new Unit({side:'S',name:'陶晴賢（本陣）',rows:5,cols:8,faceTo:YOG,ly:6.4,keys:[null,[[-2,17],[6,19],[12,19],[16,15],TOU],TOU,TOU,TOU,{p:[[16,16],[12,19],[6,19],[0,18],OMO,[-27,21],[-43,31]]},null]}),
      new Unit({side:'S',name:'陶軍・宮尾城攻め手',rows:4,cols:7,faceTo:YOG,ly:3.2,keys:[null,[[-2,17],[6,19],[12,19],[16,15],[20,13],[23,4]],[23,4],[23,4],[23,4],{p:[[20,12],[16,16],[12,19],[6,19],[0,18],[-6,17]]},null]}),
      new Unit({side:'S',name:'三浦房清・大和興武（先陣）',rows:3,cols:6,faceTo:YOG,ly:5,keys:[null,[[-2,17],[6,19]],[6,19],[6,19],[6,19],{p:[[2,18],[-2,17],[-6,18]]},null]}),
      new Unit({side:'S',name:'弘中隆兼',rows:4,cols:6,faceTo:TOU,ly:5.6,keys:[null,[[-2,17],[6,19],[16,22]],[16,22],[16,22],[[15,16]],[TAKI,DAI],{p:[[8,40],[3,55],KOMA]}]}),
      new Unit({side:'M',name:'毛利元就・隆元（本隊）',rows:5,cols:8,faceTo:[40,-136],ly:7.2,keys:[null,null,[8,-136],null,RIDGE,[19,12],[19,12]]}),
      new Unit({side:'M',name:'吉川元春（先陣）',rows:4,cols:7,faceTo:[40,-148],ly:4.4,keys:[null,null,[10,-148],null,[[78,15],[71,20],[63,28],[55,24],[48,30],[42,23],[36,17],[30,18],[23,13],TOU],[[16,15],[12,19],[8,19]],[[8,40],[3,55],[0,64]]]}),
      new Unit({side:'M',name:'小早川隆景（別働隊）',rows:4,cols:7,faceTo:[30,-128],ly:4.4,keys:[null,null,[5,-128],null,[[17,7],[16,10]],[[12,19],[6,19],[0,18]],[0,18]]}),
    ];

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f,MID=0x1f9c8a;
    const arrows=[
      new Arrow(SUE_IN,SHU,3,0),
      new Arrow([OMO_SEA,[-2,17],[6,19],[12,19],[16,15],TOU],SHU,2.4,1),
      new Arrow([[18,12],[21,7],[23,3]],SHU,1.8,1),
      new Arrow(KUMA_IN,AI,1.6,1),
      new Arrow(MUR_IN,MID,2.6,2),
      new Arrow([[62,-150],[40,-142],[28,-137]],AI,2,2),
      new Arrow([JIG_SEA,...MAIN_X],AI,3.2,3),
      new Arrow([JIG_SEA2,...KOB_X],AI,2.2,3),
      new Arrow([JIG_SEA3,...MUR_X],MID,2.2,3),
      new Arrow(RIDGE,AI,3.2,4),
      new Arrow([KOB_SEA,[12,7],[16,9]],AI,2,4),
      new Arrow([YOG,[20,3],[19,7]],AI,1.4,4),
      new Arrow([MUR_WAIT,[-14,6],[-10,10]],MID,2.4,4),
      new Arrow([TSU_SEA,[92,0],[80,-30],[62,-78]],AI,1.3,4),
      new Arrow(FLIGHT,SHU,2.6,5),
      new Arrow([OMO,[-27,21],[-43,31],[-60,41]],SHU,2,5),
      new Arrow([[18,13],[12,19],[7,19]],AI,1.8,5),
      new Arrow([[15,16],TAKI,DAI],SHU,1.4,5),
      new Arrow(COAST,SHU,2.2,6),
      new Arrow([DAI,[8,40],[3,55],KOMA],SHU,1.6,6),
      new Arrow([[7,22],[8,40],[3,55],[0,63]],AI,1.6,6),
    ];

    /* ---------------- 結にだけ出る印 ---------------- */
    const lblOe=place('陶晴賢 自刃の地（伝）',OE[0],OE[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.03},7);lblOe.material.opacity=0;
    const lblKoma=place('弘中隆兼、討ち死に（10月3日）',KOMA[0],KOMA[1],{bg:'rgba(150,26,20,.9)',size:0.026},13);lblKoma.material.opacity=0;

    /* ---------------- 雨（第三幕の嵐） ---------------- */
    const rain=(function(){
      const n=2200,R=170,C=[25,-55],pos=new Float32Array(n*6);
      for(let i=0;i<n;i++){const x=C[0]+(rnd()-.5)*2*R,z=C[1]+(rnd()-.5)*2*R,y=rnd()*90;pos.set([x,y,z,x,y-2.4,z],i*6);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const m=new THREE.LineBasicMaterial({color:0xaab4c8,transparent:true,opacity:0});
      const l=new THREE.LineSegments(g,m);l.visible=false;l.frustumCulled=false;scene.add(l);
      return {l,m,pos,n};
    })();

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<90;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<24;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,dark){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.8,pz);p.life=p.max=(dark?4:3)+Math.random()*2.5;
      p.vx=.5+Math.random()*.6;p.vy=dark?1.8:1.3;p.vz=(Math.random()-.5)*.4;p.g=dark?1.1:.8;
      p.s.material.color.set(dark?0x4a443e:0xcfcac2);p.s.visible=true;}
    const z3=(p,dx,dz,s)=>[p[0]+dx,p[1]+dz,s];
    const FIRE={4:[z3(TOU,1,1,7),z3([19,7],0,0,5)],5:[z3(TAKI,0,0,5),z3([16,16],0,0,5),z3(OMO,1,0,5)]};        // 戦闘（火花と白い煙）
    const BURN={4:[z3(OMO_SEA,0,0,9),z3(ARI_SEA,0,0,5)],5:[z3(OMO_SEA,-4,-2,10),z3(ARI_SEA,-3,-1,6)],6:[z3(OMO_SEA,-6,-3,8)]};   // 焼かれる船（黒い煙）
    let emitAcc=0;
    function update(cur,tIn,dt,time){
      const p=Sengoku.clamp((tIn-0.8)/(14*0.72),0,1);
      for(const f of fleets)f.update(cur,p,dt,time);
      // 雨
      const rt=cur===3?.5:0;rain.m.opacity+=(rt-rain.m.opacity)*Math.min(1,dt*2);rain.l.visible=rain.m.opacity>.02;
      if(rain.l.visible&&!reduceMotion){const a=rain.pos,v=55*dt;for(let i=0;i<rain.n;i++){let y=a[i*6+1]-v;if(y<0)y+=90;a[i*6+1]=y;a[i*6+4]=y-2.4;}rain.l.geometry.attributes.position.needsUpdate=true;}
      // 結の印
      lblOe.material.opacity+=((cur===6&&tIn>1.5?1:0)-lblOe.material.opacity)*Math.min(1,dt*2);
      lblKoma.material.opacity+=((cur===6&&tIn>7?1:0)-lblKoma.material.opacity)*Math.min(1,dt*2);
      // 煙と火花
      const zones=tIn>1.2?FIRE[cur]:null,burn=tIn>(cur===4?4:0.5)?BURN[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
        if(burn&&Math.random()<.8){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],true);}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.6+a*6)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.55;if(q.life<=0)q.s.visible=false;}
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
