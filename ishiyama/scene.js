(function(){
const TAU=Math.PI*2;
const wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};

/* ---------------- 家紋（旗と帆に使う） ---------------- */
function crest(x,side,cx,cy,r,color,bg){
  x.fillStyle=x.strokeStyle=color;
  if(side==='H'){                       // 本願寺: 下がり藤の簡略（上に横棒、下に逆三角形に並べた丸い花。デモの表現）
    x.fillRect(cx-r*.95,cy-r*.95,r*1.9,r*.22);
    for(let row=0;row<4;row++)for(let i=0;i<4-row;i++){
      x.beginPath();x.arc(cx+(i-(3-row)/2)*r*.46,cy-r*.42+row*r*.42,r*.17,0,TAU);x.fill();}
  }else if(side==='O'){                 // 織田: 木瓜（円の中に5弁の花）
    x.lineWidth=r*.13;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<5;k++){const a=-Math.PI/2+k*TAU/5;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.38,a+Math.PI/2,0,TAU);x.fill();}
    x.fillStyle=bg;x.beginPath();x.arc(cx,cy,r*.15,0,TAU);x.fill();
  }else if(side==='K'){                 // 九鬼: 七曜（中央の丸と周りの6つの丸）
    x.beginPath();x.arc(cx,cy,r*.3,0,TAU);x.fill();
    for(let k=0;k<6;k++){const a=k*TAU/6;x.beginPath();x.arc(cx+Math.cos(a)*r*.66,cy+Math.sin(a)*r*.66,r*.26,0,TAU);x.fill();}
  }else if(side==='M'){                 // 毛利: 一文字三星
    x.fillRect(cx-r*.95,cy-r*.9,r*1.9,r*.3);
    for(const [dx,dy] of[[-.48,.05],[.48,.05],[0,.62]]){x.beginPath();x.arc(cx+dx*r,cy+dy*r,r*.3,0,TAU);x.fill();}
  }
  // C（勅使）・Y（三好三人衆。紋は未確認）は無地
}
const CREST={H:{bg:'#f3f0e6',fg:'#3e2f5c'},O:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'},K:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'},
  M:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#17524a'},C:{bg:'#efe9da',fg:'#efe9da'},Y:{bg:'#d8ccb4',fg:'#5a4a36'}};
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle=k.bg;x.fillRect(0,0,64,200);crest(x,side,32,52,17,k.fg,k.bg);
  if(k.band){x.fillStyle=k.band;x.fillRect(0,0,64,10);}
  if(side!=='C'){x.fillStyle=k.fg;x.fillRect(29,90,6,86);}
  return new THREE.CanvasTexture(c);
}
function sailTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=80;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle='#ece5d2';x.fillRect(0,0,64,80);
  x.strokeStyle='rgba(90,80,60,.35)';x.lineWidth=1;for(let i=1;i<4;i++){x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16,80);x.stroke();}
  crest(x,side,32,40,14,k.fg,'#ece5d2');
  return new THREE.CanvasTexture(c);
}
const SIDES={
  H:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('H'),sail:sailTex('H')},
  O:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('O'),sail:sailTex('O')},
  K:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('K'),sail:sailTex('K')},   // 九鬼水軍（織田方）
  M:{body:new THREE.Color(0x1e5e56),label:'rgba(24,96,86,.88)',tex:flagTex('M'),sail:sailTex('M')},
  C:{body:new THREE.Color(0xcfc8b8),label:'rgba(90,80,60,.85)',tex:flagTex('C'),uma:0xe8e2d2},
  Y:{body:new THREE.Color(0x6e4a2a),label:'rgba(110,70,40,.88)',tex:flagTex('Y')},                      // 三好三人衆
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'元亀元年（1570）9月まで',title:'大坂の丘と、本願寺',text:'本願寺は、上町台地の北端の小高い丘にあった。北では淀川と旧大和川が合流し、そばの渡辺津（わたなべのつ）は瀬戸内と京都を結ぶ水運の拠点だった。寺の周りには堀と土居で囲まれた寺内町が広がり、全体が城のような町だった（当時は「大坂本願寺」と呼ばれた）。1568年に上洛した信長は本願寺に矢銭（やせん）5,000貫を求め、顕如（けんにょ）はこれを支払ったが、1570年、挙兵した三好三人衆が7月に西の野田・福島に城を築くと、大坂は戦場になっていく。'},
  {act:'一',date:'元亀元年（1570）8月26日〜9月23日',title:'野田・福島の戦いと挙兵',text:'8月26日、信長は天王寺に本陣を置き、主力を天満が森に布陣して、海と川に囲まれた島のような野田・福島を攻めた。9月12日には織田方の雑賀（さいか）・根来衆が住吉・天王寺に陣取り、鉄砲の音が昼夜響いたと伝わる。その夜、顕如は「信長が本願寺の破却を命じた」と門徒に訴え、本願寺勢は鐘を合図に織田軍へ襲いかかったという。翌日には堤が切れて織田方の陣が水に浸かり、近江で浅井・朝倉が動いたこともあって、信長は23日に兵を引いた。'},
  {act:'二',date:'天正4年（1576）4月〜5月3日',title:'天王寺の戦い、原田直政の討死',text:'4月、信長は本願寺を囲む砦を築かせ、荒木村重は野田に3か所、原田（塙）直政は天王寺に1か所の砦を置いた。5月3日の早朝、三好康長・根来衆を先陣とする織田軍が木津（三津寺）を攻めたが、楼岸（ろうのきし）砦から出た本願寺勢（約1万とも）の鉄砲に囲まれ、直政は討ち死にした。本願寺勢はそのまま、佐久間信栄と明智光秀が守る天王寺砦を囲んだ。この日、戦火で四天王寺が焼けたと伝わる。'},
  {act:'三',date:'天正4年（1576）5月7日',title:'信長、三千で突撃する',text:'5月5日、信長は約100騎で京都を出て、河内の若江城に入った。兵が集まりきらないまま、7日、信長は約3,000で天王寺砦を囲む本願寺勢（1万5,000余と伝わる）に攻めかかった。信長は先手の足軽に混じって指揮し、鉄砲で足を撃たれて軽い傷を負ったが、砦の兵と合流して再び突撃し、本願寺勢を石山の木戸口まで追い返した。討ち取りは2,700余と伝わる。'},
  {act:'四',date:'天正4年（1576）7月13日〜14日',title:'第一次木津川口の戦い',text:'囲まれた本願寺へ兵糧（ひょうろう）を届けるため、毛利水軍は数百艘規模（諸説あり）の船団で大阪湾を北上し、13日に木津川口へ着いた。迎え撃った織田水軍は焙烙火矢（ほうろくひや）で船を焼かれ、真鍋貞友らが討ち死にした。毛利水軍は本願寺に兵糧を入れて西国へ帰った。これに合わせて本願寺勢も砦から打って出て、天王寺砦の佐久間信盛が応戦した。'},
  {act:'五',date:'天正6年（1578）11月6日',title:'第二次木津川口の戦い',text:'1578年、九鬼嘉隆は大砲を積んだ黒い大船6艘で伊勢から堺に入り、大坂への海路をふさぎにかかった。11月6日、約600艘の毛利水軍が木津川口に現れると、九鬼の船は大砲で敵の旗艦をねらい、これを退けた。『信長公記』は織田方の圧勝と伝えるが、毛利方の記録は勝ったという認識を示しており、補給は完全には止まらなかったとみられる。船に鉄板を張っていたかどうかには議論がある。'},
  {act:'六',date:'天正6年（1578）〜天正8年（1580）4月',title:'荒木の離反、孤立、勅命講和',text:'1578年、摂津を任されていた荒木村重が信長に背いた。翌1579年、毛利輝元は上洛を断念して将兵を大坂から引き揚げ、本願寺は孤立した。1580年閏3月5日、正親町天皇の勅使が仲立ちする形で講和が成り、顕如は4月9日に紀伊の鷺森へ移った。しかし嫡男の教如（きょうにょ）は講和に従わず、大坂に残って籠城を続けた。'},
  {act:'結',date:'天正8年（1580）8月2日〜天正11年（1583）',title:'炎上、そして大坂城',text:'8月2日、教如が大坂を出て雑賀へ移ると、まもなく本願寺は炎に包まれた。松明の火が風で燃え移ったとも、教如方が火を付けたという噂があったとも伝わり、原因ははっきりしない。3年後の1583年、羽柴秀吉が同じ丘に大坂城を築きはじめた。本願寺はのちに天満へ移り、やがて東と西に分かれる。'},
];
const LAT0=34.655,LON0=135.5,KLAT=Math.PI/180*6378137/30,KLON=KLAT*Math.cos(LAT0*Math.PI/180);
const XY=(la,lo)=>[(lo-LON0)*KLON,-(la-LAT0)*KLAT];
const CT=(la,lo,d,yaw,pitch)=>{const p=XY(la,lo);return {t:[p[0],null,p[1]],d,yaw,pitch};};
// カメラ: yaw 0 で南から北を見る（負で西側から、正で東側から）
const CAM=[
  CT(34.6835,135.5195,115,-0.9,0.62),   // 序: 台地の北端を南西から
  CT(34.6786,135.4903,365,-1.25,1.3),     // 一: 野田・福島と天王寺を一画面に（海の側から）
  CT(34.6662,135.5035,140,-0.6,0.78),    // 二: 三津寺と天王寺砦
  CT(34.6655,135.5155,88,1.3,0.5),      // 三: 天王寺砦に低く、東から
  CT(34.668,135.4633,150,-0.9,0.62),    // 四: 南西の海から木津川口を見る
  CT(34.6588,135.4525,135,-0.85,0.58),  // 五: 同じく海上
  CT(34.672,135.518,195,0.3,0.92),      // 六: 寺内町と南への道
  CT(34.6835,135.5225,140,-0.4,0.82),   // 結: 寺内町
];
const DAY={bg:0xc2d0d8,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  DAY,
  {bg:0x1d2536,fn:150,ff:620,sun:0.3,sunC:0x9fb0d8,hemi:0.4,slow:true},   // 夕方から夜へ
  DAY,
  {bg:0xc9d9e3,fn:300,ff:900,sun:1.05,sunC:0xfff4e0,hemi:0.66},          // 晴れ
  {bg:0xbcd2dc,fn:300,ff:880,sun:1.0,sunC:0xfff2d8,hemi:0.64},           // 夏
  {bg:0xb5bec4,fn:240,ff:760,sun:0.72,sunC:0xe6eef6,hemi:0.56},          // 晩秋
  {bg:0xcdd6d6,fn:280,ff:820,sun:0.92,sunC:0xfff2e6,hemi:0.62},          // 春
  {bg:0xd6ae92,fn:240,ff:740,sun:0.72,sunC:0xffb47c,hemi:0.5},           // 夕方
];

Sengoku.start({
  id:'ishiyama',
  title:'石山合戦',
  subtitle:'元亀元年〜天正8年（1570〜1580）　本願寺と織田信長が、大坂の石山本願寺を舞台に10年にわたって争った戦い',
  legend:[{color:'#c0281f',label:'本願寺方'},{color:'#2c4fb0',label:'織田方'},{color:'#1f7a6f',label:'毛利水軍'},{color:'#6e4a2a',label:'三好三人衆'},{arrow:'#2c4fb0',label:'進軍・航路の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。海岸線は概略で、台地の西の低地（現在の船場・難波の西側）と近代の埋立地を当時の海として描いています。本願寺跡の丘には現在の大阪城の石垣・盛土・堀が含まれ、寝屋川・平野川など現代の水路も描かれます（当時の旧大和川の流れは描いていません）。寺内町・砦・軍勢・船の位置と動きは流れを理解するための概念的な再現です（兵力・日付・位置には諸説あり。「諸説」ボタンから読めます）。人・旗・船・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:9000,conifer:.4,seed:7,
  treeColors:{c1:'#2e4a2a',c2:'#456238',b1:'#566b34',b2:'#73793a'},
  build(ctx){
    const {THREE,scene,gy,LL,G,place,Arrow,Unit,makeLabel,rnd,smooth,lerp,ease,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const HON=at(34.68456,135.52442);      // 石山本願寺（推定地。［石山本願寺］記事座標）
    // 寺内町（推定）: 東西約760m×南北約550m。現在の大阪城の堀（水面）を避けて中の位置を決めた
    const JX0=HON[0]-12.65,JX1=HON[0]+12.65,JZ0=HON[1]-9.15,JZ1=HON[1]+9.15;
    const WG=[JX0,-108],SG=[72,JZ1],NG=[74,JZ0];   // 西門・南門・北門
    const KEN=[78,-109.5];                 // 中央（顕如）
    const NW=[65,-111.5];                // 北西（下間）
    const SE=[84,-102.5];                  // 南東（雑賀衆）
    const KYO=[70.5,-104];                 // 教如
    const HALL=[78.5,-116.2];              // 御堂
    const S_OUT=[86,-92];                  // 寺内町の南の外（門徒勢、1576年以降）
    const KIZU_U=[-42,-34];                // 木津砦の守り（砦のすぐ東）
    const ROGAN=at(34.6905,135.5115);      // 楼岸砦（本願寺方。推定）
    const KIZU=at(34.6655,135.4845);       // 木津砦（推定。河口の岸に寄せた）
    const MITSU=at(34.6706,135.5007);      // 三津寺
    const MITSU_N=at(34.6725,135.4985);
    const TENF=at(34.6639,135.5126);       // 天王寺砦（推定。生玉寺町の台地上）
    const SHITEN=at(34.6539,135.51645);    // 四天王寺
    const IKU=at(34.66511,135.513);        // 生國魂神社
    const NODA=at(34.68861,135.47845);     // 野田城
    const FUKU=at(34.6947,135.489);        // 福島城（推定）
    const URAE=[-82,-176];                 // 浦江城（推定。野田・福島の西の対岸）
    const TENMORI=at(34.695,135.515);      // 天満が森（推定）
    const KAWA70=[-44,-112];               // 川口の砦（1570 織田方。推定）
    const ROGAN70=at(34.6935,135.505);     // 楼岸の砦（1570 織田方。推定）
    const SUMI=at(34.61239,135.49378);     // 住吉大社
    const SUMIF=at(34.615,135.4895);       // 住吉の浜手の砦（推定）
    const WATA=at(34.692,135.513);         // 渡辺津
    const TENMA=at(34.695,135.52);         // 天満
    const TENNOJI=at(34.657,135.516);      // 天王寺（1570 本陣）
    const KZG=at(34.668,135.465);          // 木津川口（海上）
    const NODA_F=[at(34.69,135.48),at(34.694,135.488),at(34.687,135.475)];   // 野田の3砦（1576 荒木）
    const NE=at(34.703,135.556),E_EDGE=at(34.655,135.558),S_EDGE=at(34.608,135.495);
    const FUKU_T=at(34.693,135.492);       // 福島の手前
    const KIZU_T=at(34.667,135.49);        // 木津の手前
    const SURR1=at(34.6645,135.507),SURR2=at(34.661,135.512),SURR3=at(34.667,135.517);   // 天王寺砦を囲む位置
    const T_EAST=at(34.664,135.521);       // 砦の東
    const SEA_Y=gy(KZG[0],KZG[1]);
    // 経路
    const ODA_IN_A=[NE,at(34.698,135.54),TENMORI];                                        // 1570 織田主力 → 天満が森
    const ODA_IN_B=[NE,at(34.698,135.54),at(34.69,135.53),at(34.675,135.525),TENNOJI];     // 1570 信長本陣 → 天王寺
    const ODA_OUT=[TENNOJI,at(34.68,135.53),at(34.698,135.545),NE];                        // 1570 撤退
    const MATSU_IN=[off(NE,0,4),at(34.70,135.49),[-70,-170]];                              // 三好義継・松永久秀 → 浦江城
    const SAIKA70=[at(34.608,135.50),at(34.615,135.495),at(34.635,135.505)];               // 雑賀・根来衆（織田方）
    const SORTIE=[WG,at(34.69,135.505),at(34.692,135.495),FUKU_T];                         // 1570 本願寺の夜襲
    const SORTIE2=[WG,at(34.689,135.513),[25,-134]];                                        // 楼岸の砦へ鉄砲を撃ちかける
    const ODA_KIZU=[TENF,at(34.667,135.503),MITSU,KIZU_T];                                // 1576 織田先陣 → 木津
    const HOUT_A=[ROGAN,at(34.683,135.505),at(34.675,135.5),MITSU_N];                     // 本願寺勢 → 三津寺の北
    const HOUT_B=[ROGAN,at(34.683,135.505),at(34.672,135.506)];
    const HOUT_C=[ROGAN,at(34.684,135.512),at(34.674,135.512),SURR3];
    const SURROUND=[MITSU,at(34.667,135.507),off(SURR1,1,-2)];
    const NOBUNAGA=[E_EDGE,at(34.657,135.54),at(34.66,135.528),T_EAST];                    // 1576 信長 若江 → 天王寺
    const CHASE=[T_EAST,at(34.669,135.515),at(34.676,135.518),at(34.681,135.523)];         // 木戸口まで追う
    const MORI_IN=[at(34.612,135.448),at(34.635,135.455),at(34.655,135.46),KZG];           // 毛利水軍（1576）
    const ODA_FL=at(34.672,135.458);
    const SUPPLY=[KZG,off(KIZU,-4,0),at(34.675,135.49),ROGAN,WG];                          // 兵糧
    const KUKI_IN=[at(34.612,135.452),at(34.64,135.458),at(34.664,135.46)];                // 九鬼水軍（1578）
    const KUKI_OKI=KUKI_IN[2];
    const MORI_IN2=[at(34.612,135.444),at(34.635,135.451),at(34.652,135.456),at(34.66,135.452)];
    const MORI_OUT2=[at(34.645,135.448),at(34.615,135.444)];
    const KENNYO_OUT=[SG,at(34.67,135.52),TENNOJI,at(34.615,135.495),S_EDGE];             // 顕如 → 鷺森
    const CHOKUSHI=[at(34.703,135.555),at(34.695,135.535),NG];                             // 勅使 京 → 寺内町
    const KYONYO_OUT=[[71,-101],SG,at(34.67,135.52),TENNOJI,at(34.615,135.495),S_EDGE];    // 教如 → 雑賀

    /* ---------------- ラベル（場面ごとに出し入れ） ---------------- */
    const LBL=[];
    function lab(text,p,o,dy,scenes,t0,t1){const s=place(text,p[0],p[1],o,dy);s.material.opacity=0;LBL.push({s,scenes,t0:t0||0,t1:t1||99});return s;}
    const mt={bg:'rgba(52,64,36,.8)',size:0.026},wt={bg:'rgba(34,78,104,.8)',size:0.025},tn={bg:'rgba(22,24,28,.7)',size:0.023};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.023,weight:500,family:'"Noto Sans JP",sans-serif'};
    const noteStyle={bg:'rgba(22,24,28,.82)',size:0.024,weight:500,family:'"Noto Sans JP",sans-serif'};
    const ALL=null;
    lab('上町台地',at(34.64,135.512),mt,6,ALL);
    lab('大阪湾',at(34.655,135.445),wt,3,ALL);
    lab('大川（旧淀川）',at(34.6955,135.50),wt,2,[0,2,6,7]);
    lab('木津川口',off(KZG,-2,10),wt,2,[2,4]);
    lab('船場（当時は低地）',at(34.683,135.503),tn,2,[0,7]);
    lab('渡辺津',WATA,tn,4,[0,7]);
    lab('天満が森（推定）',off(TENMORI,2,-14),tn,13,[1]);
    lab('天王寺',at(34.651,135.52),tn,4,[0,1]);
    lab('住吉',at(34.618,135.5),tn,3,[0,1,6]);
    lab('野田',off(NODA,-6,6),tn,2,[0]);
    lab('福島',off(FUKU,8,4),tn,2,[0]);
    lab('生國魂神社',IKU,{bg:'rgba(120,60,40,.85)',size:0.023},5,[0]);
    lab('住吉大社',SUMI,{bg:'rgba(120,60,40,.85)',size:0.023},4,[0,1,4,6]);
    lab('四天王寺',SHITEN,{bg:'rgba(120,60,40,.85)',size:0.024},7,[0,2]);
    lab('四天王寺（1576年に焼失）',SHITEN,{bg:'rgba(90,60,40,.85)',size:0.023},5,[3,4,6]);
    lab('三津寺（推定）',off(MITSU,-3,9),tn,2,[2,3,4]);
    lab('↗ 京都・枚方方面',off(NE,-8,4),dirStyle,4,[1,6]);
    lab('若江城方面 →（信長、5月5日に着陣）',off(E_EDGE,-22,8),dirStyle,4,[3]);
    lab('↗ 守口の砦',[150,-172],dirStyle,4,[2]);
    lab('森河内の砦 →',[160,-80],dirStyle,4,[2]);
    lab('↖ 尼崎・有岡・茨木・高槻（付城と、のちの荒木村重の離反）',[-80,-178],dirStyle,4,[3,4,5]);
    lab('↙ 堺・岩屋・淡輪方面（水軍の航路）',[-135,172],dirStyle,3,[4,5]);
    lab('↓ 遠里小野・堺方面',[10,178],dirStyle,4,[1]);
    lab('↓ 紀伊・鷺森、雑賀方面',[-10,178],dirStyle,4,[6,7]);
    lab('荒木村重、1578年に離反（有岡城・尼崎城）',[-90,-176],{bg:'rgba(34,58,138,.88)',size:0.024},4,[6]);
    lab('閏3月5日 勅命講和／4月9日 顕如、鷺森へ',at(34.676,135.49),noteStyle,3,[6],7.5);
    lab('信長、足を鉄砲で撃たれる（軽傷）',at(34.6695,135.5185),noteStyle,9,[3],7);
    lab('大安宅船6艘（鉄板の有無には議論がある）',off(KUKI_OKI,4,-12),noteStyle,5,[5],3);
    lab('焙烙火矢で織田方の船が焼かれる',off(ODA_FL,-8,-16),noteStyle,9.5,[4],5);
    lab('兵糧を本願寺へ',off(ROGAN,-12,14),{bg:'rgba(24,96,86,.88)',size:0.023},4,[4],7.5);
    lab('堤が切れて織田方の陣が水に浸かる',off(FUKU_T,22,-4),noteStyle,5,[1],10);
    lab('天満本願寺（1585〜）',TENMA,{bg:'rgba(150,26,20,.88)',size:0.026},6,[7],9.5);
    const honStyle={bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.032};
    lab('石山本願寺（推定地）',HON,honStyle,16,[0,1,2,3,4,5]);
    lab('石山本願寺（推定地）',HON,honStyle,24,[6]);        // 勅使の名札と重ならないよう高くする
    lab('石山本願寺（推定地）',HON,honStyle,24,[7],0,9);
    lab('石山本願寺の跡（1583年から秀吉の大坂城）',HON,{bg:'rgba(70,58,46,.9)',stroke:'rgba(255,255,255,.55)',size:0.03},24,[7],9.5);

    /* ---------------- 材質と小物 ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const earthM=new THREE.MeshStandardMaterial({color:0x8a955a,roughness:.95}),bankM=new THREE.MeshStandardMaterial({color:0x7a8450,roughness:.95});
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    const hallM=new THREE.MeshStandardMaterial({color:0x7a5a3c,roughness:.85}),vermM=new THREE.MeshStandardMaterial({color:0xb5442c,roughness:.8});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    const isWater=(x,z)=>G.coverAt(x,z)===255;
    function house(px,pz,ang){
      if(isWater(px,pz))return;
      const y=gy(px,pz);
      const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
      const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
      ctx.addClear(px,pz,1.6);
    }
    function town(a,b,n){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        house(x+nx/l*s,z+nz/l*s,Math.atan2(b[0]-a[0],b[1]-a[1]));}
    }
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
    function flagPole(g,x,y,z,side,s){
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.8*s),woodM);pole.position.set(x,y+1.4*s,z);g.add(pole);
      const fg=new THREE.PlaneGeometry(.45*s,1.3*s);fg.translate(.22*s,0,0);
      const fm=new THREE.MeshStandardMaterial({map:SIDES[side].tex,side:THREE.DoubleSide,roughness:.8});
      const f=new THREE.Mesh(fg,fm);f.position.set(x+.03,y+2.1*s,z);g.add(f);return fm;
    }

    /* ---------------- 石山本願寺の寺内町（推定） ---------------- */
    (function(){
      // 環濠（堀）: 土居の外側を回る
      const ring=[];const m=1.5,X0=JX0-m,X1=JX1+m,Z0=JZ0-m,Z1=JZ1+m;
      const edge=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let i=0;i<n;i++)ring.push([a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n]);};
      edge([X0,Z0],[X1,Z0]);edge([X1,Z0],[X1,Z1]);edge([X1,Z1],[X0,Z1]);edge([X0,Z1],[X0,Z0]);ring.push([X0,Z0]);
      const moat=ctx.ribbon(ring,1.3,.12,260);
      const mm=new THREE.Mesh(moat.g,new THREE.MeshStandardMaterial({color:0x34504e,roughness:.6,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));mm.receiveShadow=true;scene.add(mm);
      // 土居（土塁）: 門のところは空ける
      const gaps=[WG,SG,NG];
      const bankEdge=(a,b)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/1.2),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
          if(gaps.some(g=>Math.hypot(g[0]-x,g[1]-z)<1.4))continue;
          const bk=new THREE.Mesh(new THREE.BoxGeometry(.7,.55,L/n+.05),bankM);bk.position.set(x,gy(x,z)+.2,z);bk.rotation.y=ang;bk.castShadow=bk.receiveShadow=true;scene.add(bk);
          if(i%2===0){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.45,.08),woodM);p.position.set(x,gy(x,z)+.7,z);scene.add(p);}}};
      bankEdge([JX0,JZ0],[JX1,JZ0]);bankEdge([JX1,JZ0],[JX1,JZ1]);bankEdge([JX1,JZ1],[JX0,JZ1]);bankEdge([JX0,JZ1],[JX0,JZ0]);
      // 門と櫓
      gate(scene,WG[0],WG[1],gy(...WG),Math.PI/2,.75);
      gate(scene,SG[0],SG[1],gy(...SG),0,.75);
      gate(scene,NG[0],NG[1],gy(...NG),0,.75);
      for(const c of[[JX0,JZ0],[JX1,JZ0],[JX1,JZ1],[JX0,JZ1],[JX1,-110],[HON[0]-2,JZ0]])yagura(scene,c[0],c[1],gy(c[0],c[1]),.85);
      // 御堂（本堂）と鐘楼
      const g=new THREE.Group();g.position.set(HALL[0],gy(...HALL),HALL[1]);scene.add(g);
      const base=new THREE.Mesh(new THREE.BoxGeometry(4.6,.35,3.4),new THREE.MeshStandardMaterial({color:0x9a958a,roughness:1}));base.position.y=.17;base.receiveShadow=true;g.add(base);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(3.8,1.3,2.6),hallM);hall.position.y=1.0;hall.castShadow=true;g.add(hall);
      const hroof=new THREE.Mesh(new THREE.ConeGeometry(3.4,1.5,4),roofM);hroof.rotation.y=Math.PI/4;hroof.scale.set(1,1,.72);hroof.position.y=2.4;hroof.castShadow=true;g.add(hroof);
      const sub=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,1.6),hallM);sub.position.set(-4.4,.6,.6);sub.castShadow=true;g.add(sub);
      const sroof=new THREE.Mesh(new THREE.ConeGeometry(2.0,.9,4),roofM);sroof.rotation.y=Math.PI/4;sroof.scale.set(1,1,.72);sroof.position.set(-4.4,1.45,.6);sroof.castShadow=true;g.add(sroof);
      const BEL=[HALL[0]+5,HALL[1]+2.6],bg=new THREE.Group();bg.position.set(BEL[0],gy(...BEL),BEL[1]);scene.add(bg);
      for(const [dx,dz] of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]]){const p=new THREE.Mesh(new THREE.BoxGeometry(.1,1.1,.1),woodM);p.position.set(dx,.55,dz);bg.add(p);}
      const br=new THREE.Mesh(new THREE.ConeGeometry(.85,.5,4),roofM);br.rotation.y=Math.PI/4;br.position.y=1.35;br.castShadow=true;bg.add(br);
      const bell=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,.45,10),new THREE.MeshStandardMaterial({color:0x4a4a40,roughness:.6}));bell.position.y=.8;bg.add(bell);
      ctx.addClear(HON[0],HON[1],16);
      // 寺内町の家並み（推定。堀の水面にあたる所には置かない）
      const H=[[63.6,-117.4],[65.4,-117.6],[67.2,-117.3],[69,-117.6],[70.8,-117.4],
        [86,-117],[86,-115],[86.2,-113],[86,-111],[85.9,-109],[86.1,-107],
        [63.4,-109.5],[63.3,-107.4],[63.5,-105.3],[63.4,-103.2],[65.4,-101.6],[67.4,-101.5],
        [75.6,-101.8],[77.6,-101.6],[79.4,-101.9],[73.6,-106.5],[81.5,-105.6],[70.5,-110.4],[72.3,-112.2],[83.2,-117.6]];
      H.forEach((p,i)=>house(p[0],p[1],(i%3)*.08));
    })();

    /* ---------------- 砦・城 ---------------- */
    const FORTS=[];
    function fort(p,name,s,side,scenes,o){
      o=o||{};
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);g.visible=false;
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.2*s,3.0*s,.8*s,24),earthM);mound.position.y=.2*s;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<22;i++){const a=i/22*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.11,.7*s,.11),woodM);q.position.set(Math.cos(a)*1.95*s,.9*s,Math.sin(a)*1.95*s);q.castShadow=true;g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.2*s,.7*s,.9*s),wallM);hut.position.y=.95*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.y=1.53*s;r.scale.set(1,1,.8);r.castShadow=true;g.add(r);
      const fm=flagPole(g,1.0*s,.4*s,-.7*s,side,s);
      ctx.addClear(p[0],p[1],4.5*s);
      const bg=side==='H'?'rgba(150,26,20,.88)':side==='Y'?'rgba(110,70,40,.88)':'rgba(34,62,140,.9)';
      const lbl=name?lab(name,p,{bg,size:o.size||0.025},o.dy||7*s,o.lblScenes||scenes):null;
      const f={g,fm,scenes,side};FORTS.push(f);return f;
    }
    fort(NODA,'野田城',.8,'Y',[0,1],{lblScenes:[0]});   // 第一幕は三好三人衆の名札と重なるので名前を出さない
    fort(FUKU,'福島城（推定）',.75,'Y',[0,1]);
    const fUrae=fort(URAE,'浦江城（推定）',.6,'Y',[0,1],{dy:5});
    fort(KAWA70,'川口の砦（織田方・推定）',.6,'O',[1],{dy:5});
    fort(ROGAN70,'楼岸の砦（織田方・推定）',.6,'O',[1],{dy:5});
    fort(ROGAN,'楼岸砦（本願寺方・推定）',.8,'H',[2,3,4,5,6],{dy:6.5});
    fort(KIZU,'木津砦（本願寺方・推定）',.8,'H',[2,3,4,5,6],{dy:1.5});
    fort(TENF,'天王寺砦（織田方・推定）',1,'O',[2,3,4,5,6,7],{dy:11,size:0.027});
    fort(NODA_F[0],'野田の砦（3か所・推定）',.6,'O',[2,3,4,5],{dy:5,lblScenes:[2]});
    fort(NODA_F[1],null,.6,'O',[2,3,4,5]);
    fort(NODA_F[2],null,.6,'O',[2,3,4,5]);
    fort(SUMIF,'住吉の浜手の砦（織田方・推定）',.6,'O',[4,5,6],{dy:5});

    /* ---------------- 寺社 ---------------- */
    // 四天王寺（五重塔と金堂。1576年5月3日に焼けたと伝わるので、第三幕からは消す）
    const shitenG=new THREE.Group();shitenG.position.set(SHITEN[0],gy(...SHITEN),SHITEN[1]);scene.add(shitenG);
    (function(){
      const g=shitenG;let y=.2;
      const base=new THREE.Mesh(new THREE.BoxGeometry(5,.2,3.4),new THREE.MeshStandardMaterial({color:0x9a958a,roughness:1}));base.position.y=.1;base.receiveShadow=true;g.add(base);
      for(let i=0;i<5;i++){const w=1.05-i*.13,h=.42;
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),vermM);b.position.set(-1.2,y+h/2,0);b.castShadow=true;g.add(b);
        const r=new THREE.Mesh(new THREE.ConeGeometry((w+.55)*.72,.3,4),roofM);r.rotation.y=Math.PI/4;r.position.set(-1.2,y+h+.12,0);r.castShadow=true;g.add(r);y+=h+.2;}
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.9,6),new THREE.MeshStandardMaterial({color:0xc9a13b,metalness:.5,roughness:.4}));sp.position.set(-1.2,y+.4,0);g.add(sp);
      const k=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,1.3),vermM);k.position.set(1.2,.6,0);k.castShadow=true;g.add(k);
      const kr=new THREE.Mesh(new THREE.ConeGeometry(1.5,.6,4),roofM);kr.rotation.y=Math.PI/4;kr.scale.set(1,1,.75);kr.position.set(1.2,1.3,0);kr.castShadow=true;g.add(kr);
      ctx.addClear(SHITEN[0],SHITEN[1],5);
    })();
    function shrine(p,s){
      const g=new THREE.Group();g.position.set(p[0],gy(...p),p[1]);scene.add(g);
      const h=new THREE.Mesh(new THREE.BoxGeometry(1.6*s,.7*s,1.1*s),vermM);h.position.y=.35*s;h.castShadow=true;g.add(h);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.35*s,.55*s,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.72);r.position.y=.95*s;r.castShadow=true;g.add(r);
      const t=new THREE.Group();t.position.set(0,0,1.6*s);g.add(t);
      for(const k of[-1,1]){const q=new THREE.Mesh(new THREE.CylinderGeometry(.06,.07,.9*s,6),vermM);q.position.set(k*.45*s,.45*s,0);t.add(q);}
      const kas=new THREE.Mesh(new THREE.BoxGeometry(1.25*s,.1,.12),roofM);kas.position.y=.92*s;t.add(kas);
      ctx.addClear(p[0],p[1],3*s);
    }
    shrine(IKU,.9);shrine(SUMI,1);
    (function(){   // 三津寺（中洲の寺。推定）
      const g=new THREE.Group();g.position.set(MITSU[0]+2.5,gy(MITSU[0]+2.5,MITSU[1]+1.5),MITSU[1]+1.5);scene.add(g);
      const h=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,1.3),hallM);h.position.y=.4;h.castShadow=true;g.add(h);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.55,.7,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.72);r.position.y=1.15;r.castShadow=true;g.add(r);
    })();

    /* ---------------- 家並み（渡辺津・天王寺・住吉） ---------------- */
    town(off(WATA,-4,-2),off(WATA,4,1),6);
    town(at(34.6555,135.5205),at(34.651,135.5205),5);
    town(at(34.6165,135.497),at(34.6125,135.4975),4);

    /* ---------------- 船（Unit と同じ keys の書き方で動かす） ---------------- */
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
        {g:new THREE.BoxGeometry(.5,.24,.5),c:HULL,m:M4(0,.14,1.3,0,Math.PI/4,0)},
        {g:new THREE.BoxGeometry(.55,.32,.6),c:CASTLE,m:M4(0,.46,-.75)},
        {g:new THREE.BoxGeometry(.46,.4,.55),c:WALL,m:M4(0,.5,.15)},
        {g:new THREE.ConeGeometry(.42,.26,4),c:ROOF,m:M4(0,.83,.15,0,Math.PI/4,0)},
        {g:new THREE.CylinderGeometry(.025,.03,2,6),c:WOOD,m:M4(0,1.2,-.1)},
        {g:new THREE.BoxGeometry(1.05,.035,.035),c:WOOD,m:M4(0,2.15,-.1)},
      ]);
      const sail=new THREE.PlaneGeometry(.98,1.25);sail.translate(0,-.625,0);
      return {body,sail};
    })();
    // 九鬼の大安宅船: 黒っぽい木の船体に総矢倉と2層の櫓、舳先に大砲（鉄板の有無は議論があるので金属色にしない）
    const BIG=(function(){
      const HULL=0x2a231d,DECK=0x6e5a40,WALL=0x3a312a,ROOF=0x24201c,WOOD=0x4a3a2a,GUN=0x2b2b2b;
      const body=mergeParts([
        {g:new THREE.BoxGeometry(.9,.32,2.4),c:HULL,m:M4(0,.16,0)},
        {g:new THREE.BoxGeometry(.6,.3,.6),c:HULL,m:M4(0,.17,1.35,0,Math.PI/4,0)},
        {g:new THREE.BoxGeometry(.84,.05,2.3),c:DECK,m:M4(0,.34,0)},
        {g:new THREE.BoxGeometry(.86,.42,1.9),c:WALL,m:M4(0,.58,-.05)},
        {g:new THREE.BoxGeometry(.6,.36,.8),c:WALL,m:M4(0,.97,-.35)},
        {g:new THREE.ConeGeometry(.55,.3,4),c:ROOF,m:M4(0,1.3,-.35,0,Math.PI/4,0)},
        {g:new THREE.CylinderGeometry(.05,.06,.5,8),c:GUN,m:M4(-.2,.62,1.05,Math.PI/2,0,0)},
        {g:new THREE.CylinderGeometry(.05,.06,.5,8),c:GUN,m:M4(.2,.62,1.05,Math.PI/2,0,0)},
        {g:new THREE.CylinderGeometry(.025,.03,2,6),c:WOOD,m:M4(0,1.2,.35)},
        {g:new THREE.BoxGeometry(1.05,.035,.035),c:WOOD,m:M4(0,2.15,.35)},
      ]);
      const sail=new THREE.PlaneGeometry(.98,1.25);sail.translate(0,-.625,0);
      return {body,sail,mast:.35};
    })();
    // 時間の割り付け: tm=[[p, 経路の割合], …] で、場面の中で待つ・止まる・動くを決める
    function remap(tm,p){
      if(p<=tm[0][0])return tm[0][1];
      for(let i=1;i<tm.length;i++){if(p<=tm[i][0]){const a=tm[i-1],b=tm[i],t=smooth(0,1,(p-a[0])/((b[0]-a[0])||1));return a[1]+(b[1]-a[1])*t;}}
      return tm[tm.length-1][1];
    }
    const WAIT=d=>[[0,0],[d,0],[1,1]];
    function posOnPoly(poly,s){
      const L=[0];for(let i=1;i<poly.length;i++)L.push(L[i-1]+Math.hypot(poly[i][0]-poly[i-1][0],poly[i][1]-poly[i-1][1]));
      const tot=L[L.length-1];if(tot<1e-6)return[poly[0][0],poly[0][1]];
      const d=s*tot;let i=1;while(i<L.length-1&&L[i]<d)i++;
      const t=(d-L[i-1])/((L[i]-L[i-1])||1);
      return[lerp(poly[i-1][0],poly[i][0],t),lerp(poly[i-1][1],poly[i][1],t)];
    }
    const fleets=[];
    const plen=a=>{let l=0;for(let i=1;i<a.length;i++)l+=Math.hypot(a[i][0]-a[i-1][0],a[i][1]-a[i-1][1]);return l;};
    const MORI_HOLD=plen(MORI_IN2)/plen([...MORI_IN2,...MORI_OUT2]);   // 第五幕: 九鬼の船の前で止まる位置（経路の割合）
    class Fleet{
      constructor(d){
        this.d=d;const side=SIDES[d.side];const n=d.n||12;const B=d.big?BIG:BOAT;this.mast=B.mast||-.1;
        this.g=new THREE.Group();scene.add(this.g);
        this.bodyM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,transparent:true,opacity:0});
        this.sailM=new THREE.MeshStandardMaterial({map:side.sail,side:THREE.DoubleSide,roughness:.9,transparent:true,opacity:0});
        this.body=new THREE.InstancedMesh(B.body,this.bodyM,n);this.sail=new THREE.InstancedMesh(B.sail,this.sailM,n);
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
        const tm=this.d.tm&&this.d.tm[ph];
        const q=posOnPoly(poly,tm?remap(tm,p):ease(p));
        return{x:q[0],z:q[1],a};
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
        const D=this.D;this.mo.makeScale(1,this.sailUp,1).setPosition(0,2.15,this.mast);
        this.boats.forEach((b,i)=>{
          const bob=reduceMotion?0:Math.sin(time*1.7+b.ph)*.05;
          D.position.set(b.x,bob,b.z);D.rotation.set(reduceMotion?0:Math.sin(time*1.2+b.ph)*.03,0,reduceMotion?0:Math.sin(time*1.5+b.ph*1.3)*.05);D.scale.setScalar(b.s);D.updateMatrix();
          this.body.setMatrixAt(i,D.matrix);this.m2.multiplyMatrices(D.matrix,this.mo);this.sail.setMatrixAt(i,this.m2);});
        this.body.instanceMatrix.needsUpdate=this.sail.instanceMatrix.needsUpdate=true;
      }
    }
    new Fleet({side:'M',name:'毛利水軍（村上武吉・児玉就英ら）',n:26,ly:4.4,faceTo:KIZU,keys:[null,null,null,null,MORI_IN,null,null,null]});
    new Fleet({side:'M',name:'兵糧船（毛利）',n:10,size:.7,ly:3.2,faceTo:KIZU,tm:{4:WAIT(.25)},keys:[null,null,null,null,[...MORI_IN.slice(0,3).map(p=>off(p,8,6)),at(34.6665,135.472)],null,null,null]});
    new Fleet({side:'O',name:'織田水軍（真鍋貞友ら）',n:12,ly:6,faceTo:MORI_IN[2],keys:[null,null,null,null,{p:[ODA_FL,at(34.671,135.46)]},null,null,null]});
    new Fleet({side:'K',name:'九鬼嘉隆の大安宅船',n:6,big:true,size:1.8,sp:3.5,ly:6.2,faceTo:at(34.655,135.452),keys:[null,null,null,null,null,KUKI_IN,KUKI_OKI,KUKI_OKI]});
    new Fleet({side:'M',name:'毛利水軍（約600艘と伝わる）',n:28,ly:4.4,faceTo:KUKI_OKI,tm:{5:[[0,0],[.08,0],[.45,MORI_HOLD],[.8,MORI_HOLD],[1,1]]},keys:[null,null,null,null,null,{p:[...MORI_IN2,...MORI_OUT2]},null,null]});

    /* ---------------- 軍勢 ---------------- */
    class TUnit extends Unit{
      posAt(ph,p){
        const tm=this.d.tm&&this.d.tm[ph],poly=this.polys[ph];
        if(!tm||!poly)return super.posAt(ph,p);
        const a=this.fades[ph]?1-smooth(0.78,1,p):1;
        const q=posOnPoly(poly,remap(tm,p));return{x:q[0],z:q[1],a};
      }
    }
    const U=d=>new TUnit(d);
    const units=[
      // 本願寺方
      U({side:'H',name:'顕如（本願寺）',rows:4,cols:7,faceTo:off(KEN,0,20),ly:10,tm:{6:WAIT(.55)},keys:[KEN,KEN,KEN,KEN,KEN,KEN,{p:KENNYO_OUT},null]}),
      U({side:'H',name:'下間頼廉（坊官・門徒勢）',rows:5,cols:9,faceTo:WG,ly:3.5,tm:{1:WAIT(.3),3:WAIT(.7)},
        keys:[NW,SORTIE,[...HOUT_A,at(34.667,135.507),SURR1],[at(34.668,135.512),at(34.675,135.515)],NW,NW,NW,null]}),
      U({side:'H',name:'雑賀衆（鈴木孫一）',rows:6,cols:5,faceTo:SG,ly:7.5,hideLbl:(c,t)=>c===6||(c===3&&t>7.5),tm:{3:WAIT(.7)},
        keys:[null,null,[...HOUT_B,SURR2],{p:[at(34.667,135.514),at(34.676,135.52)]},KIZU_U,KIZU_U,SE,null]}),
      U({side:'H',name:'本願寺勢（門徒）',rows:5,cols:9,faceTo:TENF,ly:4.6,hideLbl:(c,t)=>c===1&&t<5.5,tm:{1:WAIT(.3),3:WAIT(.7)},
        keys:[null,SORTIE2,HOUT_C,[at(34.672,135.519),at(34.679,135.522)],S_OUT,S_OUT,S_OUT,null]}),
      U({side:'H',name:'教如',rows:3,cols:6,faceTo:off(KYO,0,20),ly:3.4,tm:{7:WAIT(.1)},keys:[null,null,null,null,null,KYO,KYO,{p:KYONYO_OUT}]}),
      U({side:'Y',name:'三好三人衆（野田・福島）',rows:3,cols:6,faceTo:TENNOJI,ly:2.8,keys:[[-62,-113],[-62,-113],null,null,null,null,null,null]}),
      // 織田方（1570）
      U({side:'O',name:'織田信長（本陣）',rows:4,cols:7,faceTo:FUKU,ly:5,keys:[null,ODA_IN_B,null,null,null,null,null,null]}),
      U({side:'O',name:'織田主力（天満が森）',rows:5,cols:8,faceTo:FUKU,ly:4.6,keys:[null,ODA_IN_A,null,null,null,null,null,null]}),
      U({side:'O',name:'三好義継・松永久秀',rows:3,cols:6,faceTo:URAE,ly:4,keys:[null,MATSU_IN,null,null,null,null,null,null]}),
      U({side:'O',name:'雑賀・根来衆（織田方）',rows:4,cols:7,faceTo:FUKU,ly:4.2,keys:[null,SAIKA70,null,null,null,null,null,null]}),
      // 織田方（1576〜）
      U({side:'O',name:'荒木村重（野田の砦）',rows:3,cols:6,faceTo:ROGAN,ly:3.8,keys:[null,null,off(NODA_F[0],7,4),off(NODA_F[0],7,4),off(NODA_F[0],7,4),off(NODA_F[0],7,4),null,null]}),
      U({side:'O',name:'佐久間信栄・明智光秀',rows:3,cols:6,faceTo:MITSU,ly:7,hideLbl:(c,t)=>c>=4||(c===3&&t>5),keys:[null,null,TENF,TENF,TENF,TENF,TENF,TENF]}),
      U({side:'O',name:'原田（塙）直政',rows:3,cols:6,faceTo:MITSU,ly:4,keys:[null,null,{p:[TENF,at(34.667,135.503),off(MITSU,1,1)]},null,null,null,null,null]}),
      U({side:'O',name:'三好康長・根来衆（先陣）',rows:3,cols:6,faceTo:MITSU,ly:2.4,hideLbl:(c,t)=>c>=4||(c===2&&t>7.5),keys:[null,null,[...ODA_KIZU,MITSU,[50,-30]],[50,-30],[22,-27],[22,-27],[22,-27],[22,-27]]}),
      U({side:'O',name:'織田信長（本隊・約3,000）',rows:4,cols:7,faceTo:SURR1,ly:5.6,keys:[null,null,null,[...NOBUNAGA,at(34.668,135.516)],null,null,null,null]}),
      U({side:'O',name:'滝川一益・羽柴秀吉・丹羽長秀ら',rows:3,cols:6,faceTo:SURR2,ly:4.2,tm:{3:WAIT(.08)},keys:[null,null,null,[...NOBUNAGA.slice(0,3).map(p=>off(p,0,6)),at(34.6625,135.518)],null,null,null,null]}),
      U({side:'O',name:'佐久間信盛（天王寺砦）',rows:4,cols:7,faceTo:MITSU,ly:5,keys:[null,null,null,null,[at(34.6615,135.512),at(34.645,135.505),at(34.6615,135.512)],at(34.6615,135.512),at(34.6615,135.512),at(34.6615,135.512)]}),
      // 朝廷
      U({side:'C',name:'勅使（近衛前久・勧修寺晴豊・庭田重保）',rows:2,cols:4,teppo:false,faceTo:HON,ly:4.2,tm:{6:WAIT(.15)},keys:[null,null,null,null,null,null,[...CHOKUSHI.slice(0,2),[72,-122]],[72,-122]]}),
    ];

    /* ---------------- 矢印（遅れて出すものは late で包む） ---------------- */
    const AI=0x3159c9,SHU=0xd0301f,MID=0x1f9c8a,GOLD=0xb8a06a;
    const late=(a,t0)=>({update:(c,t,dt)=>a.update(c,c===a.from?t-t0:t,dt)});
    const arrows=[
      new Arrow(ODA_IN_A,AI,2.8,1),
      new Arrow(ODA_IN_B,AI,2.8,1),
      new Arrow(MATSU_IN,AI,1.8,1),
      new Arrow(SAIKA70,AI,2,1),
      late(new Arrow(SORTIE,SHU,2.6,1),4.5),
      late(new Arrow(SORTIE2,SHU,2,1),4.5),
      late(new Arrow(ODA_OUT,AI,2.2,1),9),
      new Arrow(ODA_KIZU,AI,2.4,2),
      new Arrow(HOUT_A,SHU,2.8,2),
      new Arrow([...HOUT_B,off(SURR2,-3,-4)],SHU,2.4,2),
      late(new Arrow(SURROUND,SHU,2.2,2),5),
      new Arrow([...NOBUNAGA,at(34.668,135.516)],AI,3.6,3),
      late(new Arrow(CHASE,AI,2.6,3),7),
      new Arrow(MORI_IN,MID,3.4,4),
      late(new Arrow(SUPPLY,MID,2.2,4),7),
      late(new Arrow([off(KIZU,0,4),at(34.66,135.486),at(34.652,135.488)],SHU,1.6,4),5),
      late(new Arrow([at(34.66,135.511),at(34.652,135.507),at(34.646,135.505)],AI,1.6,4),5),
      new Arrow(KUKI_IN,AI,2.8,5),
      new Arrow(MORI_IN2,MID,2.8,5),
      late(new Arrow([MORI_IN2[3],...MORI_OUT2],MID,1.6,5),8),
      late(new Arrow(CHOKUSHI,GOLD,2,6),2.5),
      late(new Arrow(KENNYO_OUT,SHU,2.4,6),7),
      late(new Arrow(KYONYO_OUT,SHU,2.4,7),1.5),
    ];

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<130;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<26;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.8,pz);
      const dark=kind!=='fire';p.life=p.max=(kind==='big'?6:dark?4:3)+Math.random()*2.5;
      p.vx=.5+Math.random()*.6;p.vy=kind==='big'?2.4:dark?1.8:1.3;p.vz=(Math.random()-.5)*.4;p.g=kind==='big'?1.8:dark?1.15:.8;
      p.s.material.color.set(kind==='big'?0x3e3832:dark?0x4a443e:0xcfcac2);p.s.visible=true;}
    const z3=(p,s,dx,dz)=>[p[0]+(dx||0),p[1]+(dz||0),s];
    // 場面ごとの煙: k=fire（戦闘の火花と白い煙）/ burn（燃える黒い煙）/ big（大きな黒い煙）
    const FX={
      1:[{t0:5,k:'fire',z:[z3(FUKU_T,6),z3(TENMORI,6),z3(ROGAN70,4)]}],
      2:[{t0:3.5,k:'fire',z:[z3(MITSU,7,-2,-3)]},{t0:6,k:'fire',z:[z3(TENF,9)]},{t0:6,k:'burn',z:[z3(SHITEN,4)]}],
      3:[{t0:4,k:'fire',z:[z3(TENF,5,-10,-2),z3(TENF,5,2,11),z3(TENF,5,13,-9)]}],
      4:[{t0:2.5,t1:9,k:'fire',z:[z3(ODA_FL,10,4,4)]},{t0:4,k:'burn',z:[z3(ODA_FL,10,2,2)]}],
      5:[{t0:4,t1:10,k:'fire',z:[z3(KUKI_OKI,7,-2,4),z3(MORI_IN2[3],8,4,-2)]},{t0:5,k:'burn',z:[z3(MORI_IN2[3],12,-2,2)]}],
      7:[{t0:4,k:'big',z:[z3(HALL,4),z3(KEN,5),z3(NW,5),z3(SE,5),z3([67,-104],4)]}],
    };
    let emitAcc=0;
    function update(cur,tIn,dt,time){
      const p=Sengoku.clamp((tIn-0.8)/(14*0.72),0,1);
      for(const f of fleets)f.update(cur,p,dt,time);
      for(const l of LBL){const on=(l.scenes===null||l.scenes.includes(cur))&&tIn>=l.t0&&tIn<l.t1;l.s.material.opacity+=((on?1:0)-l.s.material.opacity)*Math.min(1,dt*2.5);l.s.visible=l.s.material.opacity>.01;}
      for(const f of FORTS)f.g.visible=f.scenes.includes(cur);
      for(const u of units)if(u.d.hideLbl)u.label.visible=!u.d.hideLbl(cur,tIn);   // 砦に戻った後は名札を隠す（重なり防止）
      fUrae.fm.map=cur>=1?SIDES.O.tex:SIDES.Y.tex;   // 9月8日、浦江城は織田方の手に
      shitenG.visible=cur<=2;
      // 煙と火花
      const list=(FX[cur]||[]).filter(e=>tIn>e.t0&&tIn<(e.t1||99));
      const fires=list.filter(e=>e.k==='fire').flatMap(e=>e.z),dark=list.filter(e=>e.k!=='fire');
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(fires.length){const z=fires[(Math.random()*fires.length)|0];emit(z[0],z[1],z[2],'fire');}
        for(const e of dark){for(let r=0;r<(e.k==='big'?2:1);r++)if(Math.random()<.8){const z=e.z[(Math.random()*e.z.length)|0];emit(z[0],z[1],z[2],e.k);}}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.6+a*6)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.55;if(q.life<=0)q.s.visible=false;}
      for(const f of flashes){
        if(!fires.length){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.2+Math.random()*1.2;const z=fires[(Math.random()*fires.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }

    return {units,arrows,update};
  }
});
})();
