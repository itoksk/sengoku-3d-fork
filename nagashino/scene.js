(function(){
const TAU=Math.PI*2;

/* ---------------- 家紋（旗） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='O'){                       // 織田: 織田木瓜（簡略。円の中に五弁の花）
    x.lineWidth=r*.12;x.beginPath();x.arc(cx,cy,r*.98,0,TAU);x.stroke();
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45,r*.3,r*.4,a+Math.PI/2,0,TAU);x.fill();}
    x.fillStyle='#f3f0e6';x.beginPath();x.arc(cx,cy,r*.16,0,TAU);x.fill();
  }else if(side==='K'){                 // 武田: 武田菱（四つの菱）
    const d=r*.5;
    for(const [ox,oy] of[[0,-1],[-1,0],[1,0],[0,1]]){const px=cx+ox*d*1.02,py=cy+oy*d*.98;
      x.beginPath();x.moveTo(px,py-d*.92);x.lineTo(px+d*.92,py);x.lineTo(px,py+d*.92);x.lineTo(px-d*.92,py);x.closePath();x.fill();}
  }else{                                // 徳川: 三つ葉葵（簡略）
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.46,a+Math.PI/2,0,TAU);x.fill();}
  }
}
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  if(side==='K'){x.fillStyle='#b8231b';x.fillRect(0,0,64,200);crest(x,'K',32,52,20,'#f3efe4');x.fillStyle='#f3efe4';x.fillRect(29,90,6,86);}
  else if(side==='O'){x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);crest(x,'O',32,52,18,'#1d1d1d');x.fillStyle='#2848a0';x.fillRect(0,0,64,10);x.fillStyle='#1d1d1d';x.fillRect(29,90,6,86);}
  else{x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);crest(x,'T',32,52,17,'#1d1d1d');x.fillStyle='#1e6e62';x.fillRect(0,0,64,10);x.fillStyle='#1d1d1d';x.fillRect(29,90,6,86);}
  return new THREE.CanvasTexture(c);
}
const SIDES={
  O:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('O')},
  T:{body:new THREE.Color(0x1e5e56),label:'rgba(24,96,86,.88)',tex:flagTex('T')},
  K:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('K')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'天正3年（1575）4月〜5月',title:'勝頼、長篠城へ',text:'武田信玄の跡を継いだ勝頼は、天正3年4月、三河へ兵を進めた。先に出た部隊が足助城など三河の城を落とし、勝頼の本隊は野田城を攻め、二連木城を奪ったのち、長篠城へ向かった。長篠城は、2年前に武田から徳川へ寝返った奥平貞昌が守る城で、寒狭川（かんさがわ、豊川）と宇連川（うれがわ）が合わさる崖の上にあった。'},
  {act:'一',date:'5月8日〜14日',title:'長篠城の包囲',text:'武田軍（通説で約15,000）は長篠城を囲み、5月8日に攻撃を始めたと伝わる。守る奥平貞昌の兵は約500で、谷川に囲まれた地形と鉄砲200丁ほどで持ちこたえた。しかし13日、火矢で城の北側の兵糧庫が焼け、城は長くはもたない状況になった。同じ13日、信長は岐阜を出陣している。'},
  {act:'二',date:'5月14日夜〜16日朝',title:'鳥居強右衛門',text:'14日の夜、城兵の鳥居強右衛門（とりいすねえもん）が城を抜け出し、寒狭川に潜って武田の囲みを抜けた。15日に岡崎城に着いた強右衛門は、信長と家康の援軍が翌日に出陣すると知り、すぐに引き返した。16日の早朝、城の対岸の有海（あるみ）で捕らえられた強右衛門は、「援軍は来ない」と叫べば助けると持ちかけられたが、城に向かって「あと二、三日で数万の援軍が着く」と叫び、磔（はりつけ）にされたと伝わる。この話は『信長公記』にはなく、江戸時代のはじめの記録から伝わるものである。'},
  {act:'三',date:'5月17日〜20日',title:'設楽原の柵',text:'18日、信長の軍勢（通説で約30,000）と家康の軍勢（約8,000）が、長篠城の西の設楽原に着いた。信長は南北に連なる丘を使って軍勢を敵から見えにくく配し、連吾川（れんごがわ）を堀に見立てて、その西側に土塁と三重の馬防柵を築いた。武田方では退くことを勧める重臣もいたが、勝頼は決戦を選び、長篠城の抑えを残して設楽原の東側に兵を進めたとされる。'},
  {act:'四',date:'5月20日夜〜21日夜明け',title:'鳶ヶ巣山の奇襲',text:'20日の夜、酒井忠次の率いる別働隊（通説で約4,000）が、武田軍の正面を避けて南へ回り、豊川を渡って尾根づたいに進んだ。21日の夜明け、長篠城を見張る鳶ヶ巣山（とびがすやま）砦と中山・久間山・姥ヶ懐・君ヶ伏床の砦を背後から襲い、すべて落とした。守将の河窪信実らが討死し、城から出た奥平勢も加わって有海の武田勢を追い払った。長篠城は囲みを解かれ、設楽原の武田軍は背後をおびやかされることになった。'},
  {act:'五',date:'5月21日 早朝〜昼過ぎ',title:'設楽原の決戦',text:'21日、武田軍は連吾川を越えて柵に攻めかかった。『信長公記』によれば、左翼の山県昌景隊が一番に攻めて鉄砲に撃たれて退き、その後も新手が次々に繰り出された。右翼では馬場信春が佐久間信盛の守る丸山を奪ったと伝わるが、後が続かなかった。戦いは早朝から昼過ぎまで続き、柵の内側から撃ちかける大量の鉄砲が武田軍を削っていった。'},
  {act:'六',date:'5月21日 午後2時頃〜',title:'崩壊と退却',text:'午後2時頃、武田軍は総崩れとなった。馬場信春や内藤昌秀は退く味方を守って踏みとどまり、討死した。山県昌景・土屋昌続・真田信綱と昌輝の兄弟など、多くの重臣がこの日に命を落とした。勝頼は数百の旗本に守られて戦場を離れ、武節城を経て信濃の高遠城へ退いた。'},
  {act:'結',date:'天正3年5月〜天正10年（1582）',title:'その後',text:'戦いののち、織田・徳川は奥三河の城を取り戻した。長篠城を守り抜いた奥平貞昌は、信長から一字を受けて信昌と名を改め、のちに家康の長女・亀姫を妻に迎えた。武田氏は多くの重臣を失い、天正10年（1582）、織田・徳川の甲州攻めで滅んだ。長篠城の攻防と設楽原の決戦は別の場所での戦いだったため、いまは「長篠・設楽原の戦い」とも呼ばれる。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る（負で西側から、正で東側から）
const CAM=[
  {t:[-5,null,-5],d:300,yaw:0.3,pitch:1.0},
  {t:[73,null,-27],d:72,yaw:1.9,pitch:0.62},
  {t:[40,null,-4],d:235,yaw:0.7,pitch:0.85},
  {t:[-26,null,-16],d:120,yaw:-0.7,pitch:0.7},
  {t:[78,null,48],d:175,yaw:1.2,pitch:0.78},
  {t:[-26,null,-16],d:85,yaw:1.1,pitch:0.45},
  {t:[-5,null,-38],d:225,yaw:0.35,pitch:0.9},
  {t:[20,null,-20],d:240,yaw:0.15,pitch:1.0},
];
const DAY={bg:0xbfd0d8,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  DAY,DAY,
  {bg:0x2b3550,fn:170,ff:620,sun:0.32,sunC:0xaab8ff,hemi:0.4},              // 夜
  {bg:0xa9b2b8,fn:200,ff:700,sun:0.55,sunC:0xe8ecf0,hemi:0.55},             // 曇り
  {bg:0xd9c9b6,fn:220,ff:760,sun:0.8,sunC:0xffd6a8,hemi:0.55,slow:true},   // 夜明け
  {bg:0xbcd3e3,fn:300,ff:860,sun:1.0,sunC:0xfff4dc,hemi:0.66},              // 晴れ
  DAY,
  {bg:0xd8c0a4,fn:260,ff:780,sun:0.8,sunC:0xffd0a0,hemi:0.55},              // 夕方
];

Sengoku.start({
  id:'nagashino',
  title:'長篠の戦い',
  subtitle:'天正3年5月21日（1575年7月9日）　織田信長・徳川家康の連合軍が、設楽原（したらがはら）に馬防柵を築いて武田勝頼の軍勢を迎え撃った戦い',
  legend:[{color:'#2c4fb0',label:'織田軍'},{color:'#1f7a6f',label:'徳川軍'},{color:'#c0281f',label:'武田軍'},{arrow:'#c0281f',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。長篠城の攻防と設楽原の決戦を同じ地形の上で続けて見せています。鳶ヶ巣山方面の五つの砦・各隊の陣・馬防柵の線の位置は概略で、軍勢の数・配置・経路は流れを理解するための概念的な再現です（兵力・鉄砲の数・戦い方には諸説あり。「諸説」ボタンから読めます）。人・旗・建物・柵の大きさは見やすさのため誇張しています。旗の紋は各家の代表的な家紋を簡略に描いたものです。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:15000,conifer:.55,seed:7,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#5f7034',b2:'#7a8a3a'},
  build(ctx){
    const {THREE,scene,gy,LL,G,place,Arrow,Unit,makeLabel,rnd,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const wet=(x,z)=>G.coverAt(x,z)===255;
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];
    // 経路の途中（長さの割合 f）から先だけを取り出す。隊列を街道に沿って縦に並べるのに使う
    function from(path,f){
      const L=[0];for(let i=1;i<path.length;i++)L.push(L[i-1]+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));
      const s=f*L[L.length-1];let i=1;while(i<L.length-1&&L[i]<s)i++;
      const t=(s-L[i-1])/((L[i]-L[i-1])||1);
      return [[path[i-1][0]+(path[i][0]-path[i-1][0])*t,path[i-1][1]+(path[i][1]-path[i-1][1])*t],...path.slice(i)];
    }
    function polyAt(path,f){return from(path,Math.max(0,Math.min(1,f)))[0];}

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const JO=at(34.92272,137.55945);        // 長篠城 本丸
    const JOC=[73.5,-25.5];                  // 城の模型の中心（川を避けて少し北へ）
    const HATTSUKE=at(34.92195,137.55837);  // 鳥居強右衛門 磔死の地
    const IOZAN=at(34.92998,137.55746);     // 医王寺山（勝頼の最初の本陣）
    const DAITSU=at(34.92514,137.56086);    // 大通寺（馬場信春の陣と伝わる）
    const ARUMI=at(34.91814,137.55148);     // 有海
    const SAINOKAMI=at(34.92257,137.53039); // 才ノ神（決戦時の勝頼本陣）
    const SEIDA=at(34.919,137.53552);       // 清井田
    const CHAUSU=at(34.925,137.51427);      // 茶臼山
    const GOKURAKU=off(at(34.9136,137.50352),-.5,-5);   // 極楽寺山（小川を避けて北へ少しずらす）
    const DANJO=at(34.91659,137.52094);     // 弾正山（家康本陣）
    const MONOMI=at(34.91651,137.52327);    // 家康物見塚
    const MARUYAMA=at(34.92511,137.52495);  // 丸山
    const MARU_U=[-29.1,-30.1];              // 丸山の陣（小川を避けた位置）
    const TOBI=at(34.9170,137.5700),NAKA=at(34.9200,137.5675),KUMA=at(34.9140,137.5650),UBA=at(34.9185,137.5725),KIMI=at(34.9170,137.5775);
    const MATSU=at(34.88604,137.55387);     // 松山越
    const DEZAWA=at(34.94436,137.5443);     // 出沢
    const SW=at(34.873,137.485),SHINSHIRO=at(34.899,137.497);
    // 馬防柵（連吾川の西岸。川の位置から約75m西に沿わせる）
    const FENCE=[[-31,-44],[-34.5,-38],[-34,-35],[-35.5,-30],[-35.5,-27],[-33.5,-24],[-31.5,-21],[-30.5,-17],[-29.5,-12],[-29.5,-9],[-30.5,-7],[-32,-4],[-33.5,-1],[-34.5,2],[-35.5,5],[-36.5,9],[-37,11]];
    const fenceX=z=>{for(let i=1;i<FENCE.length;i++)if(z<=FENCE[i][1]){const a=FENCE[i-1],b=FENCE[i],t=(z-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*Math.max(0,Math.min(1,t));}return FENCE[FENCE.length-1][0];};

    // 経路
    const TAKEDA_IN=[SW,at(34.885,137.498),at(34.897,137.512),at(34.906,137.525),at(34.912,137.54),ARUMI,at(34.9235,137.5555),IOZAN];
    const TIN=TAKEDA_IN.slice(0,-1);         // 医王寺山の手前まで（各隊はここから包囲位置へ分かれる）
    const TORII_OUT=[JO,at(34.921,137.558),at(34.914,137.548),at(34.909,137.535),at(34.905,137.52),at(34.9,137.505),at(34.88,137.49)];
    const TORII_BACK=[...TORII_OUT.slice(2).reverse(),at(34.9195,137.5525),HATTSUKE];
    const ODA_A=[SW,SHINSHIRO,at(34.906,137.503)];
    const ODA_GOKURAKU=[...ODA_A,GOKURAKU];
    const ODA_DANJO=[...ODA_A,at(34.912,137.512),DANJO];
    const ODA_CHAUSU=[...ODA_A,at(34.918,137.51),CHAUSU];
    const OUT_SHITARA=[at(34.926,137.552),at(34.921,137.548),at(34.92,137.54),SEIDA];
    // 松山越から北は、標高データで尾根の高みをたどった道筋
    const SAKAI=[at(34.909,137.521),at(34.904,137.521),at(34.900,137.527),at(34.895,137.537),at(34.889,137.548),MATSU,
      [68,108],[74,101],[76,94],[75,87],[79,80],[85,73],[89,66],[87,59],[94,52],[104,45],[106,38],[107,31],[107,24],[101,17],KUMA,TOBI,NAKA];
    const ROUT=[at(34.922,137.54),at(34.926,137.55),at(34.932,137.552),at(34.94,137.546),DEZAWA,at(34.962,137.54)];
    const KATSU_OUT=[at(34.927,137.535),at(34.935,137.54),at(34.945,137.54),at(34.962,137.54)];
    // 武田各隊の位置
    const K={
      katsu0:IOZAN,yama0:at(34.9185,137.552),nai0:at(34.9265,137.559),hara0:at(34.926,137.5555),baba0:DAITSU,
      sana0:at(34.928,137.556),tsuchi0:at(34.926,137.5625),ana0:at(34.9278,137.5618),kosaka0:at(34.9165,137.5505),
      yama:at(34.9165,137.5305),nai:at(34.9195,137.531),hara:[-8.1,-3.7],baba:[-9.6,-34.1],
      sana:[-11.1,-46],tsuchi:[-14.5,-28.5],ana:[-2.5,-22],
      danjo:off(DANJO,0,-2),
    };
    // 突撃の経路（終点は柵の手前、連吾川のきわ）
    const CHARGE_L=[K.yama,at(34.9168,137.527),[-29,1]];
    const CHARGE_C=[at(34.9205,137.531),at(34.921,137.527),[-26,-14.5]];
    const CHARGE_CN=[K.tsuchi,[-22,-25],[-28,-23]];
    const CHARGE_R=[K.baba,at(34.9258,137.528),MARU_U];
    const CHARGE_S=[K.sana,at(34.929,137.528),[-28,-44]];
    // 織田・徳川の陣
    const W={
      nobutada:[-84,22],teppo:[-36.5,-15],shibata:[-50.2,-27.8],hashiba:at(34.919,137.518),
      takigawa:[-39.5,-39],honda:[-37.5,-4],okubo:[-39.5,10],sakai:[-44.5,14],sakuma2:at(34.9253,137.5225),
    };

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.026},wt={bg:'rgba(34,78,104,.8)',size:0.024},tn={bg:'rgba(22,24,28,.7)',size:0.022};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.024,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('茶臼山',...CHAUSU,mt,6);
    place('極楽寺山',...GOKURAKU,mt,6);
    const lblDanjo=place('弾正山',...DANJO,mt,8.5);
    const lblMaru=place('丸山',...MARUYAMA,{bg:'rgba(52,64,36,.8)',size:0.022},3);
    const lblSai=place('才ノ神',...off(SAINOKAMI,3,4),{bg:'rgba(52,64,36,.8)',size:0.022},1.2);
    place('寒狭川（豊川）',...at(34.925,137.552),wt,2);
    place('寒狭川（豊川）',...at(34.905,137.515),wt,2);
    place('宇連川',...at(34.925,137.566),wt,2);
    place('豊川',...at(34.895,137.50),wt,2);
    const lblRengo=place('連吾川',...at(34.918,137.5255),wt,1.5);
    const lblTaki=place('滝沢川',...at(34.922,137.533),wt,1.5);
    const lblSeida=place('清井田',...SEIDA,tn,3);
    place('有海',...ARUMI,tn,3);
    const lblTake=place('竹広',...at(34.91775,137.53039),tn,2.5);
    const lblKawaji=place('川路',...at(34.9111,137.52873),tn,3);
    place('乗本',...at(34.92238,137.5687),tn,3);
    place('大海',...at(34.93246,137.54765),tn,3);
    place('新城',...SHINSHIRO,tn,3);
    place('松山越',...MATSU,mt,4);
    place('出沢',...DEZAWA,tn,3);
    place('↙ 野田城・吉田城・岡崎方面（両軍の進入路）',-120,150,dirStyle,4);
    place('↑ 信濃方面（勝頼の退路）',15,-160,dirStyle,4);
    place('作手方面 ↖',-120,-130,dirStyle,4);
    place('← 雁峰山（強右衛門の狼煙）',-150,-10,dirStyle,4);

    /* ---------------- 家並み・寺 ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function village(p,n,r){
      let k=0;
      for(let tries=0;k<n&&tries<n*12;tries++){
        const a=rnd()*TAU,d=r*(.25+rnd()*.75),px=p[0]+Math.cos(a)*d,pz=p[1]+Math.sin(a)*d;
        if(wet(px,pz)||wet(px+.6,pz)||wet(px-.6,pz)||wet(px,pz+.6)||wet(px,pz-.6))continue;
        const y=gy(px,pz),ang=rnd()*Math.PI;
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const rf=new THREE.Mesh(hr,roofM);rf.position.set(px,y+.71,pz);rf.rotation.y=ang+Math.PI/4;rf.scale.set(1,1,.75);rf.castShadow=true;scene.add(rf);
        ctx.addClear(px,pz,1.6);k++;
      }
    }
    village(ARUMI,6,3.2);
    village(SEIDA,4,2.6);
    village(at(34.91775,137.53039),5,2.8);   // 竹広
    village(at(34.9111,137.52873),4,2.6);    // 川路
    village(at(34.92238,137.5687),5,2.8);    // 乗本
    village(at(34.93246,137.54765),4,2.6);   // 大海
    village(SHINSHIRO,6,3.4);
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95}),bankM=new THREE.MeshStandardMaterial({color:0x76864a,roughness:.95});
    const moatM=new THREE.MeshStandardMaterial({color:0x3c4a3a,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    function temple(p,name,s,lbl){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(1.8*s,.8*s,1.3*s),wallM);hall.position.y=.4*s;hall.castShadow=true;g.add(hall);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.6*s,.75*s,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.75);r.position.y=1.15*s;r.castShadow=true;g.add(r);
      ctx.addClear(p[0],p[1],3*s);
      return place(name,p[0],p[1],lbl||{bg:'rgba(120,80,40,.85)',size:0.022},3.5*s);
    }
    temple(off(IOZAN,-2.5,-1.5),'医王寺',.8);
    temple(off(DAITSU,2.5,-1),'大通寺',.7);

    /* ---------------- 長篠城（二つの川の合流点の崖の上） ---------------- */
    function yagura(g,x,z,y,s){
      const b=new THREE.Mesh(new THREE.BoxGeometry(1.1*s,.9*s,1.1*s),wallM);b.position.set(x,y+.45*s,z);b.castShadow=true;g.add(b);
      const r=new THREE.Mesh(new THREE.ConeGeometry(.95*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.set(x,y+1.12*s,z);r.castShadow=true;g.add(r);
    }
    let lblJo,lblJoshi;
    (function(){
      const g=new THREE.Group();g.position.set(JOC[0],gy(JOC[0],JOC[1]),JOC[1]);scene.add(g);
      // 本丸・二の丸（低い土の段）
      const hon=new THREE.Mesh(new THREE.BoxGeometry(6,.35,4),earthM);hon.position.set(1.2,.12,1.2);hon.castShadow=hon.receiveShadow=true;g.add(hon);
      const nino=new THREE.Mesh(new THREE.BoxGeometry(5,.25,3.4),earthM);nino.position.set(-3.6,.08,.4);nino.receiveShadow=true;g.add(nino);
      for(let i=0;i<36;i++){const t=i/36;let x,z;if(t<.5){x=-1.8+t*2*6;z=i%2?-.8:3.2;}else{x=i%2?-1.8:4.2;z=-.8+(t-.5)*2*4;}
        const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.45,.1),woodM);p.position.set(x,.5,z);g.add(p);}
      yagura(g,3.4,0,.3,.8);yagura(g,-1.0,0,.3,.7);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(1.8,.7,1.2),wallM);hall.position.set(1.4,.65,1.6);hall.castShadow=true;g.add(hall);
      const hr2=new THREE.Mesh(new THREE.ConeGeometry(1.5,.6,4),roofM);hr2.rotation.y=Math.PI/4;hr2.scale.set(1,1,.7);hr2.position.set(1.4,1.3,1.6);hr2.castShadow=true;g.add(hr2);
      // 北側の土塁と堀（平坦地に面した側）
      const bank=new THREE.Mesh(new THREE.BoxGeometry(12,.55,.8),bankM);bank.position.set(-1,.25,-2.4);bank.castShadow=bank.receiveShadow=true;g.add(bank);
      const moat=new THREE.Mesh(new THREE.BoxGeometry(12.5,.06,1.1),moatM);moat.position.set(-1,.03,-3.5);moat.receiveShadow=true;g.add(moat);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.4),woodM);pole.position.set(2.2,2.0,.6);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5,1.5);fg.translate(.25,0,0);
      const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:SIDES.T.tex,side:THREE.DoubleSide,roughness:.8}));f.position.set(2.23,2.9,.6);g.add(f);
      ctx.addClear(JOC[0],JOC[1],8);
      lblJo=place('長篠城',JOC[0],JOC[1],{bg:'rgba(24,96,86,.92)',stroke:'rgba(255,255,255,.55)',size:0.034},9);
      lblJoshi=place('長篠城址',JOC[0],JOC[1],{bg:'rgba(24,96,86,.92)',stroke:'rgba(255,255,255,.55)',size:0.03},9);lblJoshi.material.opacity=0;
    })();

    /* ---------------- 鳶ヶ巣山方面の五つの砦 ---------------- */
    function fort(p,name,s,side){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(1.6*s,2.2*s,.7*s,20),earthM);mound.position.y=.15*s;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<20;i++){const a=i/20*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.1,.6*s,.1),woodM);q.position.set(Math.cos(a)*1.45*s,.75*s,Math.sin(a)*1.45*s);q.castShadow=true;g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.0*s,.6*s,.8*s),wallM);hut.position.y=.8*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(.85*s,.45*s,4),roofM);r.rotation.y=Math.PI/4;r.position.y=1.32*s;r.scale.set(1,1,.8);r.castShadow=true;g.add(r);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.6*s),woodM);pole.position.set(.8*s,1.6*s,-.6*s);g.add(pole);
      const fg=new THREE.PlaneGeometry(.45*s,1.3*s);fg.translate(.22*s,0,0);
      const fm=new THREE.MeshStandardMaterial({map:SIDES[side].tex,side:THREE.DoubleSide,roughness:.8});
      const f=new THREE.Mesh(fg,fm);f.position.set(.83*s,2.3*s,-.6*s);g.add(f);
      ctx.addClear(p[0],p[1],3.5*s);
      const lbl=place(name,p[0],p[1],{bg:'rgba(150,26,20,.85)',size:0.022},5.5*s);
      return {g,fm,lbl,p};
    }
    const forts=[fort(TOBI,'鳶ヶ巣山砦',1.0,'K'),fort(NAKA,'中山砦',.75,'K'),fort(KUMA,'久間山砦',.75,'K'),fort(UBA,'姥ヶ懐砦',.75,'K'),fort(KIMI,'君ヶ伏床砦',.75,'K')];

    /* ---------------- 馬防柵（3列。第三幕から） ---------------- */
    const fenceM=new THREE.MeshStandardMaterial({color:0x7a5a35,roughness:.9,transparent:true,opacity:0});
    const fencePts=[];   // [x,z,向き]
    for(let i=1;i<FENCE.length;i++){
      const a=FENCE[i-1],b=FENCE[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/0.7));
      for(let k=0;k<n;k++){const t=k/n;fencePts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,Math.atan2(b[0]-a[0],b[1]-a[1])]);}
    }
    const ROWS=[0,-0.9,-1.8];
    const stakes=[],rails=[];
    for(const [x,z,ang] of fencePts)for(const o of ROWS){
      const px=x+o*Math.cos(ang),pz=z-o*Math.sin(ang);   // 西（川と反対側）へずらす
      if(wet(px,pz))continue;
      stakes.push([px,pz,ang]);
    }
    for(let i=1;i<fencePts.length;i++)for(const o of ROWS){
      const a=fencePts[i-1],b=fencePts[i];
      const ax=a[0]+o*Math.cos(a[2]),az=a[1]-o*Math.sin(a[2]),bx=b[0]+o*Math.cos(b[2]),bz=b[1]-o*Math.sin(b[2]);
      if(wet(ax,az)||wet(bx,bz))continue;
      rails.push([ax,az,bx,bz]);
    }
    const stakeIM=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.7,.12),fenceM,stakes.length);
    const railIM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.05,.05),fenceM,rails.length*2);
    {const D=new THREE.Object3D();
      stakes.forEach(([x,z],i)=>{D.position.set(x,gy(x,z)+.35,z);D.rotation.set(0,0,0);D.scale.set(1,1,1);D.updateMatrix();stakeIM.setMatrixAt(i,D.matrix);});
      rails.forEach(([ax,az,bx,bz],i)=>{const l=Math.hypot(bx-ax,bz-az),ang=Math.atan2(-(bz-az),bx-ax);
        for(let k=0;k<2;k++){const y=(gy(ax,az)+gy(bx,bz))/2+(k?.55:.3);D.position.set((ax+bx)/2,y,(az+bz)/2);D.rotation.set(0,ang,0);D.scale.set(l,1,1);D.updateMatrix();railIM.setMatrixAt(i*2+k,D.matrix);}});
    }
    for(const m of[stakeIM,railIM]){m.castShadow=true;m.visible=false;scene.add(m);}
    const lblFence=place('馬防柵（三重）',...off(FENCE[5],-2,0),{bg:'rgba(22,24,28,.75)',size:0.024},1.2);lblFence.material.opacity=0;
    const lblFence2=place('馬防柵（復元）',...off(FENCE[16],-2,0),{bg:'rgba(22,24,28,.75)',size:0.022},2);lblFence2.material.opacity=0;

    /* ---------------- 軍勢 ---------------- */
    const units=[
      // 武田
      new Unit({side:'K',name:'武田勝頼（本陣）',rows:5,cols:8,ly:4.4,keys:[[...from(TIN,0),K.katsu0],K.katsu0,K.katsu0,[...OUT_SHITARA.slice(1),SAINOKAMI],SAINOKAMI,SAINOKAMI,{p:KATSU_OUT},null]}),
      new Unit({side:'K',name:'山県昌景',rows:4,cols:7,ly:4.0,keys:[[...from(TIN,.42).slice(0,-1),K.yama0],K.yama0,K.yama0,[OUT_SHITARA[2],SEIDA,K.yama],K.yama,{p:CHARGE_L},null,null]}),
      new Unit({side:'K',name:'内藤昌秀',rows:4,cols:6,ly:4.6,keys:[[...from(TIN,.12),K.nai0],K.nai0,K.nai0,[...OUT_SHITARA,K.nai],K.nai,CHARGE_C,{p:[at(34.921,137.528)]},null]}),
      new Unit({side:'K',name:'原昌胤',rows:3,cols:6,ly:2.8,keys:[[...from(TIN,.2),K.hara0],K.hara0,K.hara0,[...OUT_SHITARA,K.hara],K.hara,[at(34.9185,137.528)],{p:ROUT},null]}),
      new Unit({side:'K',name:'馬場信春',rows:4,cols:6,ly:5.4,keys:[[...from(TIN,.28),K.baba0],K.baba0,K.baba0,[...OUT_SHITARA,K.baba],K.baba,CHARGE_R,{p:[...ROUT.slice(0,4),at(34.942,137.545)]},null]}),
      new Unit({side:'K',name:'真田信綱・昌輝',rows:3,cols:6,ly:3.6,keys:[[...from(TIN,.34),K.sana0],K.sana0,K.sana0,[...OUT_SHITARA,K.sana],K.sana,{p:CHARGE_S},null,null]}),
      new Unit({side:'K',name:'土屋昌続',rows:3,cols:5,ly:3.6,keys:[[...from(TIN,.05),K.tsuchi0],K.tsuchi0,K.tsuchi0,[...OUT_SHITARA,K.tsuchi],K.tsuchi,{p:CHARGE_CN},null,null]}),
      new Unit({side:'K',name:'穴山信君ら親類衆',rows:4,cols:7,ly:5.2,keys:[[...from(TIN,.5),K.ana0],K.ana0,K.ana0,[...OUT_SHITARA,K.ana],K.ana,{p:[at(34.922,137.54),at(34.926,137.55)]},null,null]}),
      new Unit({side:'K',name:'高坂昌澄（有海）',rows:2,cols:5,ly:3.2,keys:[[...from(TIN,.6).slice(0,-2),K.kosaka0],K.kosaka0,K.kosaka0,K.kosaka0,{p:[at(34.915,137.548)]},null,null,null]}),
      new Unit({side:'K',name:'河窪信実（鳶ヶ巣山砦）',rows:2,cols:5,ly:3.6,keys:[off(TOBI,-2,-3.5),off(TOBI,-2,-3.5),off(TOBI,-2,-3.5),off(TOBI,-2,-3.5),{p:[off(TOBI,-2,-3.5)]},null,null,null]}),
      new Unit({side:'K',name:'五味高重ら（中山砦）',rows:2,cols:4,ly:5.0,keys:[off(NAKA,-3,-2),off(NAKA,-3,-2),off(NAKA,-3,-2),off(NAKA,-3,-2),{p:[off(NAKA,-3,-2)]},null,null,null]}),
      new Unit({side:'K',name:'和気善兵衛ら（久間山砦）',rows:2,cols:4,ly:3.0,keys:[off(KUMA,-3,-2),off(KUMA,-3,-2),off(KUMA,-3,-2),off(KUMA,-3,-2),{p:[off(KUMA,-3,-2)]},null,null,null]}),
      new Unit({side:'K',name:'三枝昌貞（姥ヶ懐砦）',rows:2,cols:4,ly:4.4,keys:[off(UBA,-1,-3),off(UBA,-1,-3),off(UBA,-1,-3),off(UBA,-1,-3),{p:[off(UBA,-1,-3)]},null,null,null]}),
      new Unit({side:'K',name:'和田業繁（君ヶ伏床砦）',rows:2,cols:4,ly:3.0,keys:[off(KIMI,-1,-3),off(KIMI,-1,-3),off(KIMI,-1,-3),off(KIMI,-1,-3),{p:[off(KIMI,-1,-3)]},null,null,null]}),
      // 徳川
      new Unit({side:'T',name:'奥平貞昌（長篠城）',rows:3,cols:5,ly:3.6,keys:[off(JOC,-3,.5),off(JOC,-3,.5),off(JOC,-3,.5),off(JOC,-3,.5),[at(34.9235,137.5555),at(34.9195,137.552)],off(JOC,-3,.5),off(JOC,-3,.5),off(JOC,-3,.5)]}),
      new Unit({side:'T',name:'徳川家康（本陣）',rows:5,cols:8,ly:6.4,keys:[null,null,null,[...from(ODA_DANJO,.3),K.danjo],K.danjo,K.danjo,K.danjo,K.danjo]}),
      new Unit({side:'T',name:'本多忠勝・榊原康政',rows:3,cols:6,ly:3.6,keys:[null,null,null,[...from(ODA_DANJO,.38),W.honda],W.honda,W.honda,[at(34.9185,137.5285)],at(34.9185,137.5285)]}),
      new Unit({side:'T',name:'大久保忠世',rows:3,cols:6,ly:3.2,keys:[null,null,null,[...from(ODA_DANJO,.22),W.okubo],W.okubo,W.okubo,W.okubo,W.okubo]}),
      new Unit({side:'T',name:'酒井忠次（別働隊）',rows:4,cols:7,ly:4.6,keys:[null,null,null,[...from(ODA_DANJO,.14).slice(0,-1),W.sakai],[W.sakai,...SAKAI],NAKA,[at(34.9195,137.555)],at(34.9195,137.555)]}),
      // 織田
      new Unit({side:'O',name:'織田信長（本陣）',rows:5,cols:8,ly:6.4,keys:[null,null,null,from(ODA_GOKURAKU,.2),[GOKURAKU,CHAUSU],CHAUSU,CHAUSU,CHAUSU]}),
      new Unit({side:'O',name:'織田信忠',rows:4,cols:7,ly:4.6,keys:[null,null,null,[...from(ODA_A,.1),W.nobutada],W.nobutada,W.nobutada,W.nobutada,W.nobutada]}),
      new Unit({side:'O',name:'鉄砲奉行衆（佐々成政・前田利家ら）',rows:6,cols:6,ly:3.0,keys:[null,null,null,[...from(ODA_CHAUSU,.45).slice(0,-1),W.teppo],W.teppo,W.teppo,W.teppo,W.teppo]}),
      new Unit({side:'O',name:'佐久間信盛',rows:4,cols:7,ly:5.0,keys:[null,null,null,[...from(ODA_CHAUSU,.4),MARU_U],MARU_U,[W.sakuma2],W.sakuma2,W.sakuma2]}),
      new Unit({side:'O',name:'柴田勝家',rows:3,cols:6,ly:3.6,keys:[null,null,null,[...from(ODA_CHAUSU,.35),W.shibata],W.shibata,W.shibata,W.shibata,W.shibata]}),
      new Unit({side:'O',name:'羽柴秀吉',rows:3,cols:6,ly:6.0,keys:[null,null,null,[...from(ODA_CHAUSU,.5).slice(0,-1),W.hashiba],W.hashiba,W.hashiba,W.hashiba,W.hashiba]}),
      new Unit({side:'O',name:'滝川一益',rows:3,cols:6,ly:3.6,keys:[null,null,null,[...from(ODA_CHAUSU,.3),W.takigawa],W.takigawa,W.takigawa,[at(34.927,137.53)],at(34.927,137.53)]}),
    ];
    // 向き: 武田は長篠城を囲むあいだは城へ、設楽原では西へ。織田・徳川は東へ
    const WEST=[-90,-15],EAST=[40,-15];
    for(const u of units){
      if(u.d.side==='K'){u._k=true;if(u.d.name.indexOf('砦）')>0)u._fort=true;}
      else if(u.d.name.indexOf('奥平')===0)u.d.faceTo=[73,-40];
      else if(u.d.name.indexOf('酒井')===0)u.d.faceTo=EAST;
      else u.d.faceTo=EAST;
    }

    /* ---------------- 矢印 ---------------- */
    const AO=0x3159c9,MIDORI=0x1f8a7a,SHU=0xd0301f;
    const arrows=[
      new Arrow(TAKEDA_IN,SHU,3,0),
      new Arrow([K.nai0,[73.5,-30]],SHU,1.6,1),
      new Arrow([K.hara0,[69,-28.5]],SHU,1.6,1),
      new Arrow(TORII_OUT,MIDORI,1.2,2),
      new Arrow(ODA_GOKURAKU,AO,2.6,3),
      new Arrow(ODA_DANJO,MIDORI,2.6,3),
      new Arrow([IOZAN,...OUT_SHITARA,SAINOKAMI],SHU,2.6,3),
      new Arrow([W.sakai,...SAKAI],MIDORI,3,4),
      new Arrow([at(34.9235,137.5555),at(34.9195,137.552)],MIDORI,1.4,4),
      new Arrow(CHARGE_L,SHU,2.2,5),
      new Arrow(CHARGE_C,SHU,2.2,5),
      new Arrow(CHARGE_R,SHU,2.2,5),
      new Arrow(CHARGE_S,SHU,2.2,5),
      new Arrow([SAINOKAMI,...KATSU_OUT],SHU,2.6,6),
      new Arrow([at(34.9185,137.528),...ROUT],SHU,2.2,6),
      new Arrow([W.takigawa,at(34.927,137.53)],AO,1.6,6),
      new Arrow([W.honda,at(34.9185,137.5285)],MIDORI,1.6,6),
    ];

    /* ---------------- 場面ごとのラベル ---------------- */
    const deathStyle={bg:'rgba(70,30,26,.86)',size:0.021};
    const mk=(t,p,o,dy)=>{const s=place(t,p[0],p[1],o,dy);s.material.opacity=0;return s;};
    const lblHattsuke=mk('鳥居強右衛門、磔にされる（と伝わる）',HATTSUKE,{bg:'rgba(24,96,86,.9)',size:0.022},9);
    const deaths=[
      mk('山県昌景の墓',off(at(34.91681,137.52642),-3,0),deathStyle,1.0),
      mk('内藤昌豊（昌秀）の碑',at(34.92069,137.52778),deathStyle,6.8),
      mk('土屋昌次（昌続）戦死の地',at(34.9221,137.52504),deathStyle,9.5),
      mk('真田信綱の墓',at(34.92923,137.5317),deathStyle,2.6),
      mk('馬場信春 戦死の地（出沢）',DEZAWA,deathStyle,5.5),
    ];
    const endLbls=[
      mk('設楽原歴史資料館',at(34.91879,137.52823),{bg:'rgba(22,24,28,.78)',size:0.022},7.5),
      mk('信玄塚（武田軍戦死者の塚）',off(at(34.91816,137.52869),6,0),{bg:'rgba(22,24,28,.78)',size:0.02},0.8),
    ];

    /* ---------------- 鳥居強右衛門（一人の走者） ---------------- */
    const runner=new THREE.Group();scene.add(runner);
    const dotM=new THREE.MeshBasicMaterial({color:0x7fe0c8,transparent:true,opacity:0,fog:false});
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.45,12,10),dotM);dot.position.y=.5;runner.add(dot);
    const rLbl=makeLabel('鳥居強右衛門',{bg:'rgba(24,96,86,.92)',size:0.02});rLbl.position.y=2.2;rLbl.material.opacity=0;runner.add(rLbl);
    runner.visible=false;

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<120;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<28;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      p.life=p.max=(kind==='fire'?4:3)+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=kind==='fire'?1.8:1.1;p.vz=(Math.random()-.5)*.4;p.g=kind==='fire'?1.1:.8;
      p.s.material.color.set(kind==='fire'?0x4a423c:0xdedad2);p.s.visible=true;}
    const fz=(z,dx)=>[fenceX(z)-(dx||1.2),z,4];
    const FIRE={1:[[73,-31,5],[68,-30,4]],5:[fz(-40),fz(-29),fz(-19),fz(-10),fz(0),[-29,-30,4]]};
    const BURN={1:[[72,-27.5,2.5]],4:forts.map(f=>[f.p[0],f.p[1],2.5])};
    let emitAcc=0;
    const fade=(m,on,dt)=>{m.opacity+=((on?1:0)-m.opacity)*Math.min(1,dt*2);};
    function update(cur,tIn,dt,time){
      // 武田の向き
      for(const u of units)if(u._k)u.d.faceTo=cur<3?JOC:WEST;
      // 馬防柵
      const fOn=cur>=3;fenceM.opacity+=((fOn?1:0)-fenceM.opacity)*Math.min(1,dt*2);stakeIM.visible=railIM.visible=fenceM.opacity>.02;
      fade(lblFence.material,(cur===3||cur===4||cur===6)&&tIn>1.5,dt);fade(lblFence2.material,cur===7&&tIn>1.5,dt);
      // 長篠城の名札
      fade(lblJo.material,cur<7,dt);fade(lblJoshi.material,cur===7,dt);
      // 砦: 第四幕の後半から徳川方の旗に
      const taken=cur>4||(cur===4&&tIn>8);
      for(const f of forts){f.fm.map=taken?SIDES.T.tex:SIDES.K.tex;fade(f.lbl.material,cur!==4||tIn>12.5,dt);}
      // 名札の整理: 砦の守備隊は第四幕だけ名札を出す（他の場面は砦の名前を出す）。第二幕は強右衛門だけを追えるよう軍勢の名札を消す。序では武田の名札を勝頼の本陣だけにする。第六幕の後半と結では、織田・徳川の名札を消して戦死地・史跡の名前を見せる
      for(const u of units){if(u._fort&&cur!==4)u.label.material.opacity=0;if(cur===2||cur===7||(cur===6&&tIn>5&&!u._k))u.label.material.opacity=0;
        if(cur===0&&u._k&&u.d.name.indexOf('武田勝頼')!==0)u.label.material.opacity=0;}
      // 強右衛門
      if(cur===2&&tIn<9){
        runner.visible=true;
        const p=tIn<5?polyAt(TORII_OUT,tIn/5):polyAt(TORII_BACK,(tIn-5)/4);
        runner.position.set(p[0],gy(p[0],p[1]),p[1]);
        const a=Math.min(1,tIn/.5,(9-tIn)/.4);dotM.opacity=a;rLbl.material.opacity=a;
      }else runner.visible=false;
      fade(lblHattsuke.material,cur===2&&tIn>9,dt);
      // 戦死地・史跡
      for(const l of deaths)fade(l.material,(cur===6&&tIn>5)||cur===7,dt);
      for(const l of endLbls)fade(l.material,cur===7&&tIn>1.5,dt);
      // 第五幕・第六幕の後半・結では設楽原の地名を消して、軍勢や史跡の名前を読みやすくする
      for(const l of[lblDanjo,lblMaru,lblRengo,lblTaki,lblSeida,lblTake,lblKawaji,lblSai])fade(l.material,!(cur===7||(cur===6&&tIn>5)||(cur===5&&l!==lblRengo&&l!==lblMaru)),dt);
      // 煙と火花
      const zones=tIn>1.5?FIRE[cur]:null,burn=(cur===1?tIn>4:tIn>6)?BURN[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.07){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);if(cur===5){const z2=zones[(Math.random()*zones.length)|0];emit(z2[0],z2[1],z2[2]);}}
        if(burn&&Math.random()<.7){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],'fire');}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.55;if(q.life<=0)q.s.visible=false;}
      for(const f of flashes){
        if(!zones){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.15+Math.random()*(cur===5?.6:1.2);const z=zones[(Math.random()*zones.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }
    return {units,arrows,update};
  }
});
})();
