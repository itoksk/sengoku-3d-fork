(function(){
const TAU=Math.PI*2;
// 緯度経度 → 画面座標（1単位=30m、+x 東、+z 南）。原点と係数は geo/meta.json と共通エンジンに合わせる
const LL=(la,lo)=>[(lo-135.695)*3043.296,-(la-34.9)*3710.65];

/* ---------------- 家紋（旗） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='A'){                       // 明智: 桔梗（5弁の星形の花と、中心の小さな円）
    x.beginPath();
    for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.5:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}
    x.closePath();x.fill();
    x.fillStyle='#f3f0e6';x.beginPath();x.arc(cx,cy,r*.2,0,TAU);x.fill();
  }else{                                // 羽柴方: 紋は描かず、黒の丸だけ
    x.beginPath();x.arc(cx,cy,r*.8,0,TAU);x.fill();
  }
}
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);
  crest(x,side,32,52,18,'#1d1d1d');
  x.fillStyle=side==='A'?'#b8231b':'#2848a0';x.fillRect(0,0,64,10);
  x.fillStyle='#1d1d1d';x.fillRect(29,90,6,86);
  return new THREE.CanvasTexture(c);
}
const SIDES={
  H:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('H')},
  A:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('A')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'天正10年（1582）6月2日〜9日',title:'本能寺の変のあと',text:'6月2日早朝、明智光秀は京の本能寺に織田信長を討った。光秀は坂本に入って4日のうちに近江の大半を押さえ、5日には安土城に入り、9日には上洛して朝廷に銀を献じた。しかし縁戚の細川藤孝・忠興は剃髪して中立を保ち、筒井順慶も味方に加わらなかった。京の南西では、西国街道と久我畷が交わる勝龍寺（しょうりゅうじ）城と、三つの川の合流点に近い淀古城が、のちに明智方の拠点になる。'},
  {act:'一',date:'6月4日〜11日',title:'中国大返し',text:'備中高松城で毛利方と対陣していた羽柴秀吉は、3日夜から4日未明に変報を受け、毛利氏と講和した。秀吉の軍勢は高松から姫路、尼崎へと、山崎まで約230kmを約10日で引き返した（出発日や到着日は史料によって違う）。道中は暴風雨で川が増水したとも伝わる。光秀は10日に男山に伏せていた兵を引き上げて下鳥羽に陣を移し、淀古城を修築して勝龍寺城にも兵を入れた。'},
  {act:'二',date:'6月12日',title:'山崎の町と円明寺川',text:'12日、秀吉は西国街道の富田に着いて軍議を開き、摂津の池田恒興・中川清秀・高山右近や、大坂から来た織田信孝・丹羽長秀と合流した。決戦の前夜までに、中川・高山の隊が先に進んで山崎の町を押さえた。明智軍は勝龍寺城を前線に、円明寺川（えんみょうじがわ。いまの小泉川）に沿って陣を並べ、両軍はこの頃から川をはさんでにらみ合ったとされる。光秀の本陣はまだ下鳥羽にあった。'},
  {act:'三',date:'6月13日 朝〜昼',title:'隘路（あいろ）の対陣',text:'13日は雨だったと伝わる。山崎は天王山の麓と沼地にはさまれた狭い土地で、ここでどちらの軍も一度に動かせたのは3000人ほどだったとする見方もある。秀吉は昼頃に山崎に着いて宝積寺（ほうしゃくじ）に本陣を置いたとされ、光秀は本陣を下鳥羽から御坊塚（位置には諸説ある）へ移した。兵力は通説では羽柴軍約4万・明智軍約1万6千だが、羽柴軍を2万余とする同時代の記録もある。'},
  {act:'四',date:'6月13日 午後4時頃',title:'開戦',text:'申の刻（午後4時頃）、戦いが始まった。天王山の山裾を進む中川清秀の隊を伊勢貞興の隊が襲い、斎藤利三の隊が高山右近の隊に攻めかかったと伝わる。堀秀政が後詰に入って持ちこたえ、天王山の中腹では羽柴秀長・黒田孝高の隊が松田政近・並河易家の隊と戦った。どの隊が最初に動いたかは、記録によって食い違いがある。'},
  {act:'五',date:'6月13日 夕方',title:'右翼の渡河と総崩れ',text:'開戦から約2時間後、池田恒興・元助父子と加藤光泰の隊が淀川ぞいを北上し、円明寺川をひそかに渡って津田信春の隊を襲った。丹羽長秀・織田信孝の隊も右翼から押し寄せ、光秀本隊の側面をつく形になった。中川・高山の隊も斎藤・伊勢の隊を押し返し、明智軍は総崩れになって、松田政近・伊勢貞興らが討死した。日没前後、光秀は本陣を払って勝龍寺城へ退いた。'},
  {act:'六',date:'6月13日 夜〜14日 未明',title:'勝龍寺城から小栗栖へ',text:'勝龍寺城は大軍を入れられない平城で、逃げ出す兵が相次ぎ、700余りに減ったという。羽柴方も消耗が激しく、追撃は散発的だった。夜、光秀は城の北門から抜け出して坂本城を目指したが、小栗栖（おぐるす）の藪で落ち武者狩りの百姓に討たれたとも、深手を負って家臣の介錯で自害したとも伝わる。秀吉は城の包囲を配下に任せ、淀（当時の淀古城と考えられる）に宿営した。'},
  {act:'結',date:'6月14日〜27日',title:'戦のあと',text:'14日、勝龍寺城は降伏を申し入れ、光秀の首が見つかって届けられた（秀吉が三井寺で確かめたとも、信孝のもとに届いたとも伝わる）。堀秀政が打出浜で明智秀満を破り、秀満は坂本城で自刃し、15日には安土城が焼け落ちた。27日の清洲会議で秀吉は織田家の跡継ぎをめぐる主導権をにぎった。戦後、秀吉は天王山に山崎城を築いて本拠とした。「天王山」は勝負の分かれ目を表す言葉になったが、天王山を奪い合う戦いがあったことは、よい史料では確かめられていない。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る（負で西側から、正で東側から）
const C=(la,lo,d,yaw,pitch)=>{const p=LL(la,lo);return {t:[p[0],null,p[1]],d,yaw,pitch};};
const CAM=[
  C(34.905,135.700,280,0.6,1.0),
  C(34.87036,135.67200,260,-0.2,0.95),
  C(34.9015,135.688,140,-0.9,0.65),
  C(34.89730,135.68909,230,-0.3,1.25),
  C(34.9045,135.6865,75,0.9,0.45),
  C(34.90054,135.69763,125,1.4,0.6),
  C(34.91752,135.70814,210,-0.6,0.9),
  C(34.90404,135.69171,230,0.3,1.05),
];
const DAY={bg:0xc5d3da,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const RAIN={bg:0x8f9aa6,fn:130,ff:560,sun:0.45,sunC:0xdde6f0,hemi:0.5};
const ENV=[
  DAY,
  RAIN,
  {bg:0xb4bcc2,fn:200,ff:700,sun:0.7,sunC:0xf4f0e6,hemi:0.58},
  {bg:0x88929c,fn:100,ff:480,sun:0.4,sunC:0xdde6f0,hemi:0.5},
  RAIN,
  {bg:0xb98a62,fn:180,ff:640,sun:0.7,sunC:0xffb070,hemi:0.5},
  {bg:0x1c2333,fn:110,ff:520,sun:0.24,sunC:0x9fb0d8,hemi:0.32},
  DAY,
];

Sengoku.start({
  id:'yamazaki',
  title:'山崎の戦い',
  subtitle:'天正10年（1582）6月13日　本能寺の変から11日後、中国大返しで戻った羽柴秀吉が明智光秀を破った戦い',
  legend:[{color:'#2c4fb0',label:'羽柴軍'},{color:'#c0281f',label:'明智軍'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。川筋は現在のもので、合戦当時は宇治川が巨椋池に注ぎ、山崎の東には沼地が広がっていたと伝わります。城・町・軍勢の位置と経路は流れを理解するための概念的な再現です（兵力や経過の細部には諸説あり。「諸説」ボタンから読めます）。人・旗・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:15000,conifer:.5,seed:13,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#4f6a34',b2:'#6f7f3a'},
  build(ctx){
    const {THREE,scene,gy,place,Arrow,Unit,rnd,reduceMotion}=ctx;

    /* ---------------- 地点 ---------------- */
    const TENNO=LL(34.9018,135.6767);       // 天王山 山頂
    const HOSHAKU=LL(34.8958,135.6787);     // 宝積寺
    const HATATATE=LL(34.8994,135.6804);    // 旗立松
    const RIKYU=LL(34.8918,135.6795);       // 離宮八幡宮（山崎の町の中心）
    const MYOKI=LL(34.8923,135.6803);       // 妙喜庵
    const HI=LL(34.9064,135.6918);          // 山崎合戦古戦場碑
    const IGE=LL(34.9145,135.6976);         // 恵解山古墳（光秀本陣の候補A）
    const GOBO=LL(34.9075,135.6900);        // 御坊塚＝境野1号墳説（候補B・概略）
    const SHORYU=LL(34.9182,135.7005);      // 勝龍寺城
    const YODOKO=LL(34.9101,135.7191);      // 淀古城
    const OTOKO=LL(34.8797,135.7001);       // 石清水八幡宮（男山）
    const NE_END=LL(34.947,135.752),SW_END=LL(34.858,135.645);
    const KOGA=LL(34.938,135.728),YODO=LL(34.905,135.717),MINASE=LL(34.879,135.667),YAMAZAKI=LL(34.891,135.679);
    // 城の中は堀（水面）なので、軍勢は城のまわりの陸地に置く
    const S_GAR=[17,-61.5],S_IN=[17,-75],S_W=[9,-78],S_E=[22,-83];
    const NAWATE=[LL(34.928,135.722),[27,-80]];   // 久我畷（勝龍寺城の北東）

    // 経路
    const AKECHI_IN=[NE_END,KOGA,...NAWATE];
    const OTOKO_U=[15.5,70];
    const OTOKOYAMA_OUT=[OTOKO_U,LL(34.886,135.706),YODO,LL(34.925,135.735),NE_END];
    const ROAD=[SW_END,MINASE,YAMAZAKI];                      // 西国街道（富田・高槻方面から）
    const KAWATE=[LL(34.862,135.66),LL(34.878,135.675),[-52,55],[-42,34]];   // 川手（淀川ぞい）
    const IKEDA_CROSS=[LL(34.8975,135.6965),LL(34.899,135.6985),LL(34.9025,135.700)];
    const ROUT=[LL(34.912,135.698),S_GAR];
    const MITSUHIDE_OUT=[S_IN,LL(34.922,135.704),LL(34.93,135.715),KOGA,NE_END];
    const HIDE_YODO=[LL(34.899,135.69),LL(34.9,135.705),[72,-12]];

    // 布陣
    const P={
      // 明智（12〜13日）
      saito:[-4,-21],ise:[-8,-32],atsuji:[2,-45],matsuda:[-28,-33],tsudaM:[8,-11],tsudaN:[18,-2],fujita:[16,-26],
      mitsuSB:[148,-145],
      // 羽柴（12〜13日）
      takayama:[-36,10],nakagawa:[-32,-13],hori:[-26,-1],hidenaga:[-46,-5],hideyoshi:[-44,21],
      ikeda:[-8,11],niwa:[-24,22],nobutaka:[-62,52],
      // 開戦（四）
      takayama4:[-20,-1],hori4:[-27,-7],hidenaga4:[-43,-14],
      saito4:[-14,-9],ise4:[-28,-20],matsuda4:[-41,-21],
      // 総崩れ（五）
      takayama5:[-14,-17],nakagawa5:[-24,-25],hidenaga5:[-30,-31],
      ikeda5:LL(34.9025,135.700),niwa5:LL(34.9015,135.7025),nobutaka5:[4,8],
      // 勝龍寺城の囲み（六）
      ikeda6:[40,-65],niwa6:[34,-78],nobutaka6:[-4,-62],
    };

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.028},wt={bg:'rgba(34,78,104,.8)',size:0.025},tn={bg:'rgba(22,24,28,.7)',size:0.022};
    const site={bg:'rgba(120,80,40,.82)',size:0.022};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.024,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('天王山',TENNO[0]-10,TENNO[1]+2,mt,10);
    place('男山',OTOKO[0]-6,OTOKO[1]+4,mt,8);
    const siteLbl=[];
    siteLbl.push([place('旗立松',...HATATATE,site,4),[2,4,5]]);
    place('桂川',83,-60,wt,2);
    place('宇治川',100,-18,wt,2);
    place('木津川',66,72,wt,2);
    place('淀川',-58,98,wt,2);
    place('円明寺川（小泉川）',-29,-54,wt,2);
    place('山崎の町',RIKYU[0]-6,RIKYU[1]+4,tn,3);
    siteLbl.push([place('妙喜庵',...MYOKI,{bg:'rgba(22,24,28,.6)',size:0.019},2.5),[2,3,4,5]]);
    siteLbl.push([place('山崎合戦古戦場碑',...HI,{bg:'rgba(120,80,40,.75)',size:0.019},2),[2,4]]);
    place('水無瀬',...MINASE,tn,3);
    siteLbl.push([place('調子',-9,-46,tn,3),[0,1,4,5,6,7]]);
    place('久我',93,-141,tn,3);
    place('淀',67,-24,tn,3);
    place('橋本',...LL(34.876,135.69),tn,3);
    place('↙ 富田・高槻・尼崎方面（秀吉の進路）',-120,150,dirStyle,4);
    place('京・下鳥羽方面 ↗',150,-160,dirStyle,4);
    place('小栗栖・坂本方面 →',...LL(34.93,135.75),dirStyle,4);
    place('↓ 洞ヶ峠・大和方面',30,160,dirStyle,4);
    place('巨椋池（当時）→',...LL(34.91,135.75),dirStyle,4);

    /* ---------------- 家並み ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(a,b,n){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s,y=gy(px,pz),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        if(ctx.G.coverAt(px,pz)===255)continue;   // 水面には建てない
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    town([-57,41],[-43,26],12);        // 山崎の町（西国街道ぞい）
    town([-90,82],[-80,73],5);         // 水無瀬
    town([-5,-45],[-1,-51],4);         // 調子
    town([91,-145],[95,-136],5);       // 久我
    town([64,-16],[71,-21],5);         // 淀
    town([-17,86],[-12,92],4);         // 橋本（対岸）

    /* ---------------- 勝龍寺城（平城。堀と土塁） ---------------- */
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
    const shoryuFlagM=new THREE.MeshStandardMaterial({map:SIDES.A.tex,side:THREE.DoubleSide,roughness:.8});
    (function(){
      const g=new THREE.Group();g.position.set(SHORYU[0],gy(SHORYU[0],SHORYU[1]),SHORYU[1]);scene.add(g);
      const moat=new THREE.Mesh(new THREE.BoxGeometry(7.4,.06,5.4),moatM);moat.position.y=.03;moat.receiveShadow=true;g.add(moat);
      const hon=new THREE.Mesh(new THREE.BoxGeometry(5.2,.6,3.4),earthM);hon.position.y=.3;hon.castShadow=hon.receiveShadow=true;g.add(hon);
      for(let i=0;i<30;i++){const t=i/30;let x,z;if(t<.5){x=-2.5+t*2*5;z=i%2?-1.6:1.6;}else{x=i%2?-2.5:2.5;z=-1.6+(t-.5)*2*3.2;}
        const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.45,.1),woodM);p.position.set(x,.82,z);g.add(p);}
      yagura(g,-1.9,-1.0,.6,.75);yagura(g,1.9,1.0,.6,.7);
      // 土塁の輪
      for(const [w,d,x,z] of[[10.6,.5,0,-3.7],[10.6,.5,0,3.7],[.5,7.9,-5.3,0],[.5,7.9,5.3,0]]){
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,.4,d),bankM);b.position.set(x,.2,z);b.castShadow=b.receiveShadow=true;g.add(b);}
      gate(g,0,-3.8,0,0,.6);                                 // 北門
      gate(g,0,3.8,0,0,.55);                                 // 南の門
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.2),woodM);pole.position.set(0,2.2,0);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5,1.5);fg.translate(.25,0,0);
      const f=new THREE.Mesh(fg,shoryuFlagM);f.position.set(.03,3.0,0);g.add(f);
      ctx.addClear(SHORYU[0],SHORYU[1],8);
    })();
    const lblShoryuA=place('勝龍寺城',SHORYU[0],SHORYU[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.03},14);
    const lblShoryuH=place('勝龍寺城（降伏）',SHORYU[0],SHORYU[1],{bg:'rgba(34,62,140,.9)',stroke:'rgba(255,255,255,.55)',size:0.03},14);lblShoryuH.material.opacity=0;

    /* ---------------- 淀古城（小さな城） ---------------- */
    (function(){
      const s=.7,p=YODOKO,g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.2*s,3.0*s,.9*s,24),earthM);mound.position.y=.25*s;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<24;i++){const a=i/24*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.11,.7*s,.11),woodM);q.position.set(Math.cos(a)*1.95*s,1.0*s,Math.sin(a)*1.95*s);q.castShadow=true;g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.2*s,.7*s,.9*s),wallM);hut.position.y=1.05*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(1.0*s,.5*s,4),roofM);r.rotation.y=Math.PI/4;r.position.y=1.63*s;r.scale.set(1,1,.8);r.castShadow=true;g.add(r);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.8*s),woodM);pole.position.set(1.0*s,2.0*s,-.7*s);g.add(pole);
      const fg=new THREE.PlaneGeometry(.45*s,1.3*s);fg.translate(.22*s,0,0);
      const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:SIDES.A.tex,side:THREE.DoubleSide,roughness:.8}));f.position.set(1.03*s,2.7*s,-.7*s);g.add(f);
      ctx.addClear(p[0],p[1],4);
    })();
    place('淀古城',YODOKO[0],YODOKO[1],{bg:'rgba(150,26,20,.88)',size:0.026},6);

    /* ---------------- 宝積寺・石清水八幡宮・古墳 ---------------- */
    function temple(p,s,col){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const base=new THREE.Mesh(new THREE.BoxGeometry(2.6*s,.2,2.0*s),new THREE.MeshStandardMaterial({color:0x9a9a92,roughness:1}));base.position.y=.1;base.receiveShadow=true;g.add(base);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(2.0*s,.8*s,1.4*s),new THREE.MeshStandardMaterial({color:col,roughness:.8}));hall.position.y=.2+.4*s;hall.castShadow=true;g.add(hall);
      const roof=new THREE.Mesh(new THREE.ConeGeometry(1.7*s,.7*s,4),roofM);roof.rotation.y=Math.PI/4;roof.scale.set(1,1,.75);roof.position.y=.2+.8*s+.3*s;roof.castShadow=true;g.add(roof);
      ctx.addClear(p[0],p[1],3*s);return g;
    }
    temple(HOSHAKU,.9,0xb9a27c);
    place('宝積寺',HOSHAKU[0]-5,HOSHAKU[1]-2,site,3);
    (function(){   // 石清水八幡宮（朱の社殿）
      const g=temple(OTOKO,.9,0xc24a2f);
      const vm=new THREE.MeshStandardMaterial({color:0xc24a2f,roughness:.8});
      for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,1.3,8),vm);p.position.set(s*.6,.65,2.4);p.castShadow=true;g.add(p);}
      const k=new THREE.Mesh(new THREE.BoxGeometry(1.8,.14,.18),roofM);k.position.set(0,1.32,2.4);g.add(k);
      const n=new THREE.Mesh(new THREE.BoxGeometry(1.5,.1,.12),vm);n.position.set(0,1.05,2.4);g.add(n);
    })();
    place('石清水八幡宮',OTOKO[0]+4,OTOKO[1]-3,{bg:'rgba(160,52,36,.82)',size:0.021},3);
    function kofun(p,len,ang){   // 前方後円墳（低い塚）
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);g.rotation.y=ang;scene.add(g);
      const m=new THREE.MeshStandardMaterial({color:0x7d8a52,roughness:.95});
      const c=new THREE.Mesh(new THREE.CylinderGeometry(len*.28,len*.34,.6,20),m);c.position.set(0,.3,-len*.18);c.castShadow=c.receiveShadow=true;g.add(c);
      const f=new THREE.Mesh(new THREE.BoxGeometry(len*.5,.5,len*.4),m);f.position.set(0,.25,len*.22);f.castShadow=f.receiveShadow=true;g.add(f);
      ctx.addClear(p[0],p[1],len*.6);
    }
    kofun(IGE,4.3,.6);
    siteLbl.push([place('恵解山古墳（光秀本陣の候補）',IGE[0]+5,IGE[1]+4,site,2),[0,3,4,7]]);
    kofun(GOBO,2.2,.2);
    siteLbl.push([place('御坊塚の候補（境野1号墳・概略）',GOBO[0]-3,GOBO[1]+4,{bg:'rgba(120,80,40,.7)',size:0.019},1),[2,3,4]]);

    /* ---------------- 軍勢 ---------------- */
    const R5=v=>[v,v,v,v,v];
    const NE=[0,-40],SW=[-35,0];   // 向き（明智は南西、羽柴は北東を向く）
    const units=[
      // 明智
      new Unit({side:'A',name:'明智光秀（本隊）',rows:5,cols:8,faceTo:SW,ly:6.4,keys:[
        [...AKECHI_IN,S_IN],[S_IN,LL(34.93,135.72),P.mitsuSB],P.mitsuSB,[KOGA,...NAWATE,[18,-62],IGE],IGE,[IGE,[16,-64],S_IN],{p:MITSUHIDE_OUT},null]}),
      new Unit({side:'A',name:'斎藤利三（美濃衆）',rows:4,cols:7,faceTo:SW,ly:5.2,keys:[
        [...AKECHI_IN.map(p=>[p[0]-3,p[1]+2]),S_W],S_W,[[10,-62],[2,-46],[0,-30],P.saito],P.saito,[P.saito4],{p:[[-8,-24],[-6,-33]]},null,null]}),
      new Unit({side:'A',name:'阿閉貞征（近江衆）',rows:3,cols:6,faceTo:SW,ly:4.6,keys:[
        [...AKECHI_IN.map(p=>[p[0]+3,p[1]-2]),S_E],S_E,[[24,-62],[10,-46],P.atsuji],P.atsuji,P.atsuji,{p:[P.atsuji,...ROUT]},null,null]}),
      new Unit({side:'A',name:'伊勢貞興ら',rows:3,cols:6,faceTo:SW,ly:4.4,keys:[
        null,null,[...AKECHI_IN,[18,-58],[0,-44],P.ise],P.ise,[P.ise4],{p:[[-18,-24],[-14,-30]]},null,null]}),
      new Unit({side:'A',name:'松田・並河',rows:3,cols:5,faceTo:SW,ly:4.6,keys:[
        null,null,[...AKECHI_IN,[18,-58],[-10,-44],P.matsuda],P.matsuda,[P.matsuda4],{p:[[-36,-28]]},null,null]}),
      new Unit({side:'A',name:'津田正時（河内衆）',rows:3,cols:5,faceTo:SW,ly:4.2,keys:[
        null,null,[...AKECHI_IN,[18,-58],[12,-30],P.tsudaM],P.tsudaM,P.tsudaM,{p:[P.tsudaM,[8,-30],...ROUT]},null,null]}),
      new Unit({side:'A',name:'津田信春',rows:2,cols:5,faceTo:SW,ly:3.6,keys:[
        null,null,[[22,-58],[16,-30],P.tsudaN],P.tsudaN,P.tsudaN,{p:[P.tsudaN,LL(34.905,135.701)]},null,null]}),
      new Unit({side:'A',name:'藤田行政',rows:3,cols:5,faceTo:SW,ly:4.2,keys:[
        null,null,[[22,-58],P.fujita],P.fujita,P.fujita,{p:[P.fujita,...ROUT]},null,null]}),
      new Unit({side:'A',name:'淀古城の守り',rows:2,cols:4,faceTo:[40,0],ly:3.6,keys:[
        [...AKECHI_IN.slice(0,3),[60,-60],[73,-31]],...R5([73,-31]),[73,-31],null]}),
      new Unit({side:'A',name:'男山の伏せ勢',rows:2,cols:4,faceTo:[-20,40],ly:3.6,keys:[
        OTOKO_U,{p:OTOKOYAMA_OUT},null,null,null,null,null,null]}),
      new Unit({side:'A',name:'城の守兵',rows:2,cols:4,faceTo:[0,-30],ly:3.4,keys:[
        null,S_GAR,S_GAR,S_GAR,S_GAR,S_GAR,S_GAR,null]}),
      // 羽柴
      new Unit({side:'H',name:'高山右近',rows:3,cols:6,faceTo:NE,ly:4.4,keys:[
        null,null,[...ROAD,P.takayama],P.takayama,[P.takayama4],[P.takayama5],P.takayama5,P.takayama5]}),
      new Unit({side:'H',name:'中川清秀',rows:3,cols:6,faceTo:NE,ly:4.6,keys:[
        null,null,[...ROAD,[-38,4],P.nakagawa],P.nakagawa,P.nakagawa,[P.nakagawa5],P.nakagawa5,P.nakagawa5]}),
      new Unit({side:'H',name:'堀秀政',rows:3,cols:6,faceTo:NE,ly:4.2,keys:[
        null,null,null,[...ROAD,[-36,16],P.hori],[P.hori4],P.hori4,P.hori4,P.hori4]}),
      new Unit({side:'H',name:'羽柴秀長・黒田孝高',rows:4,cols:6,faceTo:NE,ly:5,keys:[
        null,null,null,[...ROAD,[-44,4],P.hidenaga],[P.hidenaga4],[P.hidenaga5],P.hidenaga5,P.hidenaga5]}),
      new Unit({side:'H',name:'羽柴秀吉（本陣）',rows:5,cols:8,faceTo:NE,ly:6.4,keys:[
        null,null,null,[...ROAD,P.hideyoshi],P.hideyoshi,P.hideyoshi,[P.hideyoshi,...HIDE_YODO],[72,-12]]}),
      new Unit({side:'H',name:'池田恒興・加藤光泰',rows:4,cols:7,faceTo:NE,ly:5,keys:[
        null,null,null,[...KAWATE,P.ikeda],P.ikeda,[P.ikeda,...IKEDA_CROSS],[P.ikeda6],P.ikeda6]}),
      new Unit({side:'H',name:'丹羽長秀',rows:3,cols:6,faceTo:NE,ly:4.4,keys:[
        null,null,null,[...KAWATE.map(p=>[p[0]+2,p[1]+3]),P.niwa],P.niwa,[[-6,14],...IKEDA_CROSS.map(p=>[p[0]+6,p[1]+3]),P.niwa5],[P.niwa6],P.niwa6]}),
      new Unit({side:'H',name:'織田信孝・蜂屋頼隆',rows:4,cols:7,faceTo:NE,ly:5,keys:[
        null,null,null,[...KAWATE.slice(0,2).map(p=>[p[0]-3,p[1]+5]),P.nobutaka],P.nobutaka,[[-42,34],[-20,18],P.nobutaka5],[[10,-20],P.nobutaka6],P.nobutaka6]}),
    ];

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f;
    const arrows=[
      new Arrow([...AKECHI_IN,S_IN],SHU,2.6,0),
      new Arrow([AKECHI_IN[2],[60,-60],[73,-34]],SHU,1.6,0),
      new Arrow(OTOKOYAMA_OUT,SHU,1.8,1),
      new Arrow([SW_END,LL(34.868,135.655),[-100,96]],AI,3.4,1),
      new Arrow([...ROAD,[-36,6]],AI,2.6,2),
      new Arrow([[18,-58],[-10,-44],[-22,-33]],SHU,1.6,2),
      new Arrow([[10,-62],[2,-46],[0,-30],[-2,-25]],SHU,1.6,2),
      new Arrow([[18,-58],[0,-44],[-7,-34]],SHU,1.6,2),
      new Arrow([[22,-58],[16,-30],LL(34.902,135.6985)],SHU,1.6,2),
      new Arrow([...ROAD,[-40,10],[-34,0]],AI,2.8,3),
      new Arrow([...KAWATE,[-16,14]],AI,2.4,3),
      new Arrow([LL(34.928,135.722),[27,-80],[18,-62],[9,-56]],SHU,2,3),
      new Arrow([P.ise,[-24,-20]],SHU,1.8,4),
      new Arrow([P.saito,[-12,-12]],SHU,1.8,4),
      new Arrow([P.matsuda,[-38,-22]],SHU,1.8,4),
      new Arrow([[-24,3],[-27,-6]],AI,1.6,4),
      new Arrow([P.ikeda,...IKEDA_CROSS],AI,3.2,5),
      new Arrow([[-6,14],...IKEDA_CROSS.map(p=>[p[0]+6,p[1]+3])],AI,1.8,5),
      new Arrow([P.saito,[8,-44],[16,-62]],SHU,2,5),
      new Arrow([IGE,[16,-64]],SHU,1.6,5),
      new Arrow(MITSUHIDE_OUT,SHU,2.2,6),
      new Arrow([P.hideyoshi,...HIDE_YODO],AI,2.2,6),
    ];

    /* ---------------- 場面ごとに出す印 ---------------- */
    const note={bg:'rgba(22,24,28,.8)',size:0.022};
    const lblRepS=place('修築・兵を入れる（10〜11日）',SHORYU[0],SHORYU[1],note,4.5);
    const lblRepY=place('修築（10〜11日）',YODOKO[0],YODOKO[1],note,3);
    const lblOgaeshi=place('秀吉、備中高松から約230kmを引き返す（6月4日〜11日）',-128,108,{bg:'rgba(34,58,138,.9)',size:0.03},6);
    const lblOguri=place('光秀、小栗栖で死す（13日深夜〜14日未明）',110,-104,{bg:'rgba(150,26,20,.9)',size:0.028},8);
    const lblYamazakiJo=place('山崎城（戦後に秀吉が築く）',TENNO[0]-4,TENNO[1]-7,{bg:'rgba(34,62,140,.9)',size:0.026},16);
    const toggles=[
      [lblRepS,(c)=>c===1],[lblRepY,(c)=>c===1],[lblOgaeshi,(c)=>c===1],
      [lblOguri,(c,t)=>c===6&&t>6],[lblYamazakiJo,(c)=>c===7],
      [lblShoryuA,(c)=>c<7],[lblShoryuH,(c)=>c===7],
      ...siteLbl.map(([s,ph])=>[s,(c)=>ph.includes(c)]),
    ];
    for(const [s] of toggles)s.material.opacity=0;

    /* ---------------- 雨・煙・火花 ---------------- */
    const rain=(function(){
      const n=2600,R=180,C0=[-10,-10],pos=new Float32Array(n*6);
      for(let i=0;i<n;i++){const x=C0[0]+(rnd()-.5)*2*R,z=C0[1]+(rnd()-.5)*2*R,y=rnd()*80;pos.set([x,y,z,x,y-2.0,z],i*6);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const m=new THREE.LineBasicMaterial({color:0xaab4c8,transparent:true,opacity:0});
      const l=new THREE.LineSegments(g,m);l.visible=false;l.frustumCulled=false;scene.add(l);return {l,m,pos,n};
    })();
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<80;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0});}
    const flashes=[];for(let i=0;i<20;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);p.life=p.max=3+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=1.2;p.vz=(Math.random()-.5)*.4;p.s.visible=true;}
    // 火花と煙（四: 天王山の麓と街道ぞい、五: 円明寺川の渡河点と麓）
    const FIRE={4:[[-34,-17,8],[-20,-5,7],[-42,-18,5]],5:[[12,-6,8],[-18,-20,8],[-28,-27,6]]};
    const RAINY={1:1,3:1,4:1};
    const ALL=toggles;
    let emitAcc=0;
    function update(cur,tIn,dt,time){
      const rt=RAINY[cur]?.35:0;rain.m.opacity+=(rt-rain.m.opacity)*Math.min(1,dt*2);rain.l.visible=rain.m.opacity>.02;
      if(rain.l.visible&&!reduceMotion){const a=rain.pos,v=50*dt;for(let i=0;i<rain.n;i++){let y=a[i*6+1]-v;if(y<0)y+=80;a[i*6+1]=y;a[i*6+4]=y-2.0;}rain.l.geometry.attributes.position.needsUpdate=true;}
      for(const [s,f] of ALL){const on=f(cur,tIn)?1:0;s.material.opacity+=(on-s.material.opacity)*Math.min(1,dt*2);}
      shoryuFlagM.map=cur>=7?SIDES.H.tex:SIDES.A.tex;      // 14日、勝龍寺城が降伏
      const zones=tIn>1.5?FIRE[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*.8);
        q.s.material.opacity=Math.sin(Math.PI*a)*.5;if(q.life<=0)q.s.visible=false;}
      for(const f of flashes){
        if(!zones){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.2+Math.random()*1.2;const z=zones[(Math.random()*zones.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }

    // 長さの点検（PH・CAM・ENV は8場面、各軍勢の keys も8つ）
    if(PH.length!==8||CAM.length!==8||ENV.length!==8)console.error('PH/CAM/ENV の長さが8ではありません');
    for(const u of units)if(u.d.keys.length!==8)console.error('keys の長さが8ではありません: '+u.d.name);
    return {units,arrows,update};
  }
});
})();
