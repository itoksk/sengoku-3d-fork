(function(){
const TAU=Math.PI*2;

/* ---------------- 家紋（旗） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='S'){                       // 真田: 六文銭
    for(let i=0;i<6;i++){const col=i%3,row=(i/3)|0;const px=cx+(col-1)*r*.66,py=cy+(row-.5)*r*.7;
      x.beginPath();x.arc(px,py,r*.27,0,TAU);x.fill();}
  }else{                                // 徳川: 三つ葉葵（簡略）
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.46,a+Math.PI/2,0,TAU);x.fill();}
  }
}
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  if(side==='S'){x.fillStyle='#b8231b';x.fillRect(0,0,64,200);crest(x,'S',32,52,18,'#f3efe4');x.fillStyle='#f3efe4';x.fillRect(29,90,6,86);}
  else{x.fillStyle='#f3f0e6';x.fillRect(0,0,64,200);crest(x,'T',32,52,17,'#1d1d1d');x.fillStyle='#2848a0';x.fillRect(0,0,64,10);x.fillStyle='#1d1d1d';x.fillRect(29,90,6,86);}
  return new THREE.CanvasTexture(c);
}
const SIDES={
  S:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('S')},
  T:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('T')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'天正11〜13年（1583〜85）',title:'千曲川ぞいの新しい城',text:'武田氏が滅び、旧武田領をめぐる争いのなかで、真田昌幸は徳川家康の後ろだてを得て、千曲川に面した崖（尼ヶ淵）の上に上田城を築きはじめた。北に太郎山、南に千曲川、西と北には矢出沢川があり、攻め口は東側だけである。ところが家康が、昌幸の領地である上野の沼田を北条氏へ渡すよう求めると、昌幸はこれを拒み、それまで敵だった上杉景勝と結んだ。'},
  {act:'一',date:'天正13年（1585）閏8月',title:'徳川軍、神川を渡って国分寺に陣取る',text:'家康は鳥居元忠・大久保忠世・平岩親吉らに約7,000（通説）の軍勢を預けて上田へ送った。徳川軍は小諸から北国街道を西へ進み、神川を渡って信濃国分寺のあたりに陣を敷いた。真田方は1,200〜2,000ほど（通説）。昌幸は上田城に、長男の信幸は北東の戸石城に入り、矢沢城には矢沢頼康が上杉の援兵とともに籠もった。上田城はまだ完成していなかったと伝わる。'},
  {act:'二',date:'閏8月2日',title:'城下へ引き込む',text:'2日、徳川軍は上田城へ攻め寄せた。真田勢は大手から二の丸の門まで攻め込ませておいて反撃に転じ、城下の家々や寺に伏せていた兵が鉄砲を浴びせたと伝わる。狭い城下には千鳥掛けの柵が仕掛けられ、徳川軍は思うように動けない。そこへ戸石城を下りた信幸の隊が横合いから襲いかかった。'},
  {act:'三',date:'閏8月2日',title:'神川の潰走',text:'崩れた徳川軍は東へ退いた。真田勢は城から打って出て追い、矢沢勢も加わって神川まで追撃した。折からの増水で神川は渡りにくく、先を争って川へ入った将兵に多くの溺死者が出た。徳川方の戦死者は1,300人（通説）とも2,000人ともいわれ、真田方の犠牲は40人ほどと伝わる。'},
  {act:'四',date:'閏8月3日〜28日',title:'丸子表の対陣',text:'徳川軍は目標を南の丸子城に変え、諏訪頼忠・岡部長盛らが攻めたが、丸子三左衛門の守りは固く落とせなかった。20日ほどのにらみ合いのあいだ、上杉の援軍との小競り合いも起きた。家康は井伊直政らの援軍を出す一方で撤退を命じ、徳川軍は28日に上田を離れて小諸へ退いた。11月、重臣の石川数正が秀吉のもとへ出奔したこともあり、徳川軍は信濃から完全に引き上げた。'},
  {act:'五',date:'慶長5年（1600）9月2日〜5日',title:'15年後、秀忠の大軍',text:'関ヶ原の戦いを前に、徳川秀忠は約38,000（通説）の軍勢で中山道を西へ向かい、9月2日に小諸へ着いた。昌幸は次男の信繁とともに西軍につき、長男の信之は東軍に従っている。昌幸はいったん降伏をほのめかしてから態度を変え、秀忠軍は上田へ進んだ。5日、信之の軍勢が戸石城へ向かうと、城を守っていた信繁は戦わずに上田城へ退いた。秀忠の本陣は小諸城に置かれ、軍勢は染屋台のあたりに陣を構えたとされる。'},
  {act:'六',date:'9月6日',title:'刈田をめぐる小競り合い',text:'6日、牧野康成の手勢が城下の稲を刈りはじめた。これを阻もうと真田方の数百人が城から出てきたが押し返され、上田城へ逃げ込む。追った徳川勢は大手門の前まで迫ったが、ここで秀忠から退けとの命令が下った。江戸時代の記録には「我が軍大いに敗れ」と書かれ、大合戦として語られてきたが、当時の史料で確かめられるのはこの小競り合いまでである。'},
  {act:'結',date:'9月8日〜',title:'関ヶ原に間に合わず',text:'8日、家康から上洛を急げとの命令が届き、秀忠は上田に抑えの兵を残して美濃へ向かった。しかし道中の悪天候もあり、15日の関ヶ原の本戦に間に合わなかった。西軍が敗れたため、昌幸と信繁は紀伊の九度山へ流され、上田城は翌年に徳川方の手で壊された。上田の領地は信之が受け継ぎ、いま見られる城は江戸時代に仙石氏が建て直したものである。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る
const CAM=[
  {t:[-10,null,-100],d:320,yaw:0.3,pitch:0.95},
  {t:[45,null,-30],d:210,yaw:0.8,pitch:0.85},
  {t:[-45,null,-104],d:100,yaw:0.7,pitch:0.62},
  {t:[5,null,-60],d:160,yaw:0.9,pitch:0.75},
  {t:[0,null,150],d:210,yaw:-0.4,pitch:0.9},
  {t:[30,null,-120],d:240,yaw:0.6,pitch:0.9},
  {t:[-40,null,-100],d:95,yaw:0.9,pitch:0.6},
  {t:[40,null,-80],d:310,yaw:0.4,pitch:1.0},
];
const DAY={bg:0xc5d3da,fn:280,ff:820,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const ENV=[
  DAY,DAY,
  {bg:0xc9cfd2,fn:200,ff:700,sun:0.8,sunC:0xfff0d8,hemi:0.6},
  {bg:0x8f9aa6,fn:120,ff:520,sun:0.45,sunC:0xdde6f0,hemi:0.5},
  DAY,DAY,DAY,
  {bg:0xd8c0a4,fn:260,ff:780,sun:0.8,sunC:0xffd0a0,hemi:0.55},
];

Sengoku.start({
  id:'ueda',
  title:'上田合戦',
  subtitle:'天正13年（1585）と慶長5年（1600）　真田昌幸が上田城で徳川軍を二度にわたって防いだ「上田城の戦い」',
  legend:[{color:'#c0281f',label:'真田軍'},{color:'#2c4fb0',label:'徳川軍'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データ（5mメッシュ）を高さ2倍に強調して表示。第一次（1585）と第二次（1600）を同じ地形の上で続けて見せています。城・町・軍勢の位置と経路は流れを理解するための概念的な再現です（兵力や経過の細部には諸説あり。「諸説」ボタンから読めます）。人・旗・建物の大きさは見やすさのため誇張しています。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:15000,conifer:.55,seed:9,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#6f6a34',b2:'#8a7a3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,makeLabel,rnd,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    const UEDA=[-69,-106];      // 上田城 本丸
    const NINO=[-62,-106];      // 二の丸の門（東）
    const OTE=[-55,-104];       // 大手（三の丸の東）
    const AMB1=[-41,-115],AMB2=[-38,-99];   // 城下の伏兵
    const SOMEYA=[0,-96];       // 染屋台
    const TOKIDA=[-12,-89];     // 常田
    const KOKU=at(36.3787,138.2732);        // 信濃国分寺
    const CAMP1=[18,-24],CAMP2=[20,-12],CAMP3=[8,-34];   // 国分寺付近の徳川陣
    const FORD=[34,-23];        // 北国街道の神川渡河点
    const EAST1=[55,-5];
    const OYA=[76,11];          // 大屋
    const UNNO=[155,48];        // 海野（のちの海野宿）
    const EEDGE=[222,70];       // 小諸方面（東の端）
    const TOISHI=[70,-196];     // 戸石城（本城）
    const KOME=[63,-176];       // 米山城（本城の南西の峰）
    const YAZAWA=at(36.4125,138.3103);      // 矢沢城
    const MARUKO=at(36.3174,138.2637);      // 丸子城
    const MARUKO_T=[8,165];     // 丸子の町（上丸子）
    const TARO=at(36.43317,138.24871);      // 太郎山
    const KOKUZO=at(36.4301,138.2215);      // 虚空蔵山
    // 経路
    const TOKU_IN=[EEDGE,[190,50],UNNO,[110,30],OYA,EAST1,FORD];                     // 小諸から北国街道を西へ、神川を渡る
    const ATTACK=[[0,-50],TOKIDA,[-30,-104],OTE];                                    // 国分寺の陣から城下へ
    const ROUT=[[-30,-104],TOKIDA,[0,-55],[20,-35],FORD,[45,-15],EAST1];              // 城下から神川へ潰走
    const TO_MARUKO=[OYA,[60,60],[30,110],MARUKO_T];                                 // 千曲川を渡って丸子へ
    const NOBUYUKI_DOWN=[[50,-170],[20,-140],[-10,-118]];                            // 戸石城から城下の北へ
    const YAZAWA_DOWN=[[95,-100],[65,-55],[48,-30]];                                 // 矢沢城から神川へ
    const PURSUIT=[[-30,-104],[-5,-85],[15,-55],[28,-35]];                           // 昌幸の追撃
    const HIDETADA_IN=[EEDGE,[190,50],UNNO,[110,30],OYA,EAST1,FORD,[15,-50],SOMEYA];  // 1600: 秀忠軍
    const NOBUYUKI2_IN=[EEDGE,[190,50],UNNO,[110,30],OYA,[95,-100],[100,-165],[85,-185],TOISHI];   // 1600: 信之、神川ぞいに戸石城へ
    const NOBUSHIGE_OUT=[TOISHI,[40,-165],[0,-135],[-40,-106],[-66,-104]];           // 1600: 信繁、上田城へ退く
    const OUT_1600=[[20,-50],FORD,EAST1,OYA,[110,30],UNNO,[190,50],EEDGE];           // 秀忠軍、美濃へ

    /* ---------------- 地名 ---------------- */
    const mt={bg:'rgba(52,64,36,.8)',size:0.028},wt={bg:'rgba(34,78,104,.8)',size:0.026},tn={bg:'rgba(22,24,28,.7)',size:0.024};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.025,weight:500,family:'"Noto Sans JP",sans-serif'};
    place('太郎山',...TARO,mt,9);
    place('虚空蔵山',...KOKUZO,mt,8);
    place('染屋台',...SOMEYA,{bg:'rgba(52,64,36,.72)',size:0.026},4);
    place('神川',44,-45,wt,2);
    place('千曲川',-30,-45,wt,2);
    place('矢出沢川',-88,-124,wt,2);
    place('信濃国分寺',...KOKU,{bg:'rgba(120,80,40,.85)',size:0.026},5);
    place('常田',-32,-87,tn,3);
    place('大屋',...OYA,tn,3);
    place('海野',...UNNO,tn,3);
    place('丸子',...MARUKO_T,tn,3);
    place('尼ヶ淵',-71,-100,{bg:'rgba(34,78,104,.75)',size:0.024},2);
    place('小諸・佐久方面 →',196,90,dirStyle,4);
    place('↑ 真田郷・沼田方面',100,-215,dirStyle,4);
    place('← 坂木・善光寺方面',-190,-70,dirStyle,4);
    place('↓ 大門峠・諏訪方面',-40,210,dirStyle,4);

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
    town([-50,-109],[-24,-101],12);    // 城下（海野町・原町）
    town([-48,-117],[-30,-119],6);     // 柳町
    town([148,44],[162,52],8);         // 海野宿
    town([72,8],[80,14],5);            // 大屋
    town([4,161],[14,169],6);          // 丸子

    /* ---------------- 上田城（本丸・二の丸・大手） ---------------- */
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
      const g=new THREE.Group();const y0=gy(UEDA[0],UEDA[1]);g.position.set(UEDA[0],y0,UEDA[1]);scene.add(g);
      // 堀と本丸
      const moat=new THREE.Mesh(new THREE.BoxGeometry(11,.06,7.6),moatM);moat.position.y=.03;moat.receiveShadow=true;g.add(moat);
      const hon=new THREE.Mesh(new THREE.BoxGeometry(8,.7,4.8),earthM);hon.position.y=.35;hon.castShadow=hon.receiveShadow=true;g.add(hon);
      for(let i=0;i<40;i++){const t=i/40;let x,z;if(t<.5){x=-3.9+t*2*7.8;z=i%2?-2.3:2.3;}else{x=i%2?-3.9:3.9;z=-2.3+(t-.5)*2*4.6;}
        const p=new THREE.Mesh(new THREE.BoxGeometry(.1,.5,.1),woodM);p.position.set(x,.95,z);g.add(p);}
      yagura(g,-3.2,-1.7,.7,.9);yagura(g,3.2,1.7,.7,.9);yagura(g,-3.2,1.7,.7,.8);
      gate(g,4.0,0,.7,Math.PI/2,.7);                        // 本丸の東の櫓門
      // 二の丸（土塁の輪）
      for(const [w,d,x,z] of[[17,.6,0,-5.4],[17,.6,0,5.4],[.6,11.4,-8.5,0],[.6,11.4,8.5,0]]){
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,.45,d),bankM);b.position.set(x,.22,z);b.castShadow=b.receiveShadow=true;g.add(b);}
      gate(g,8.6,0,0,Math.PI/2,.65);                        // 二の丸の門
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.4),woodM);pole.position.set(0,2.4,0);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5,1.5);fg.translate(.25,0,0);
      const f=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:SIDES.S.tex,side:THREE.DoubleSide,roughness:.8}));f.position.set(.03,3.2,0);g.add(f);
      ctx.addClear(UEDA[0],UEDA[1],11);
      place('上田城',UEDA[0],UEDA[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.036},12);
    })();
    // 大手門と千鳥掛けの柵（城下）
    gate(scene,OTE[0],OTE[1],gy(OTE[0],OTE[1]),Math.PI/2,.8);ctx.addClear(OTE[0],OTE[1],2.5);
    place('大手',OTE[0],OTE[1],tn,3.5);
    const fenceM=new THREE.MeshStandardMaterial({color:0x7a5a35,roughness:.9});
    const fences=[];
    for(let i=0;i<9;i++){const x=-50+i*3,z=(i%2?-103.6:-109.8);const f=new THREE.Mesh(new THREE.BoxGeometry(2.2,.5,.12),fenceM);f.position.set(x,gy(x,z)+.25,z);f.rotation.y=(i%2?.5:-.5);f.castShadow=true;f.material=fenceM.clone();f.material.transparent=true;f.material.opacity=0;scene.add(f);fences.push(f);}
    const lblFence=place('千鳥掛けの柵',-37,-112,{bg:'rgba(22,24,28,.72)',size:0.024},3);lblFence.material.opacity=0;

    /* ---------------- 山城（戸石・矢沢・丸子）と国分寺 ---------------- */
    function fort(p,name,s,side){
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
      const lbl=place(name,p[0],p[1],{bg:side==='S'?'rgba(150,26,20,.88)':'rgba(34,62,140,.9)',size:0.03},9*s);
      return {g,fm,lbl};
    }
    const fToishi=fort(TOISHI,'戸石城（砥石城）',1,'S');
    const lblToishiT=place('戸石城（砥石城）',TOISHI[0],TOISHI[1],{bg:'rgba(34,62,140,.9)',size:0.03},9);lblToishiT.material.opacity=0;
    fort(KOME,'米山城',.6,'S');
    fort(YAZAWA,'矢沢城',.8,'S');
    fort(MARUKO,'丸子城',.9,'S');
    (function(){   // 信濃国分寺（本堂と三重塔）
      const g=new THREE.Group();g.position.set(KOKU[0],gy(KOKU[0],KOKU[1]),KOKU[1]);scene.add(g);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,1.6),wallM);hall.position.set(-1.2,.45,0);hall.castShadow=true;g.add(hall);
      const hr=new THREE.Mesh(new THREE.ConeGeometry(2.0,.7,4),roofM);hr.rotation.y=Math.PI/4;hr.scale.set(1,1,.7);hr.position.set(-1.2,1.25,0);hr.castShadow=true;g.add(hr);
      const bm=new THREE.MeshStandardMaterial({color:0x8a5a3a,roughness:.8});let y=0;
      for(let i=0;i<3;i++){const w=1.0-i*.15,h=.42;const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bm);b.position.set(1.6,y+h/2,0);b.castShadow=true;g.add(b);
        const r=new THREE.Mesh(new THREE.ConeGeometry((w+.55)*.72,.3,4),roofM);r.rotation.y=Math.PI/4;r.position.set(1.6,y+h+.12,0);r.castShadow=true;g.add(r);y+=h+.2;}
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.7,6),new THREE.MeshStandardMaterial({color:0xc9a13b,metalness:.5,roughness:.4}));sp.position.set(1.6,y+.3,0);g.add(sp);
      ctx.addClear(KOKU[0],KOKU[1],4);
    })();

    /* ---------------- 軍勢 ---------------- */
    const S8=(v)=>[v,v,v,v,v,v,v,v];
    const units=[
      // 真田（1585）
      new Unit({side:'S',name:'真田昌幸（上田城）',rows:4,cols:7,faceTo:OTE,ly:6,keys:[UEDA,UEDA,[NINO],PURSUIT,[UEDA],UEDA,UEDA,UEDA]}),
      new Unit({side:'S',name:'真田信幸（戸石城）',rows:3,cols:6,faceTo:KOKU,ly:3.8,keys:[TOISHI,TOISHI,NOBUYUKI_DOWN,[[15,-80],[30,-45]],[TOISHI],null,null,null]}),
      new Unit({side:'S',name:'矢沢頼康・上杉の援兵（矢沢城）',rows:3,cols:5,faceTo:FORD,ly:3.6,keys:[YAZAWA,YAZAWA,YAZAWA,YAZAWA_DOWN,[YAZAWA],null,null,null]}),
      new Unit({side:'S',name:'城下の伏兵',rows:2,cols:5,faceTo:OTE,ly:3.2,keys:[null,null,AMB1,null,null,null,null,null]}),
      new Unit({side:'S',name:'城下の伏兵',rows:2,cols:5,faceTo:OTE,ly:3.2,keys:[null,null,AMB2,null,null,null,null,null]}),
      new Unit({side:'S',name:'丸子三左衛門（丸子城）',rows:2,cols:5,faceTo:[0,190],ly:3.4,keys:[MARUKO,MARUKO,MARUKO,MARUKO,MARUKO,null,null,null]}),
      // 徳川（1585）
      new Unit({side:'T',name:'鳥居元忠',rows:4,cols:7,faceTo:UEDA,ly:5.4,keys:[null,[...TOKU_IN,CAMP1],[...ATTACK,[-58,-104]],ROUT,[...TO_MARUKO,[-2,195]],null,null,null]}),
      new Unit({side:'T',name:'大久保忠世',rows:4,cols:7,faceTo:UEDA,ly:4.6,keys:[null,[...TOKU_IN.map(p=>[p[0]+3,p[1]+4]),CAMP2],[[6,-46],[-8,-84],[-26,-100],[-46,-101]],[[-26,-100],[-8,-84],[4,-50],[24,-30],[40,-20],[50,-2]],[[78,14],[64,62],[33,112],[10,132],[12,205]],null,null,null]}),
      new Unit({side:'T',name:'平岩親吉',rows:4,cols:6,faceTo:UEDA,ly:4.2,keys:[null,[...TOKU_IN.map(p=>[p[0]-3,p[1]-4]),CAMP3],[[-4,-56],[-16,-94],[-34,-110],[-42,-108]],[[-34,-110],[-16,-94],[-4,-60],[16,-40],[30,-27],[46,-12],[58,-8]],[[74,8],[58,58],[27,108],[2,128],[-28,200]],null,null,null]}),
      // 1600年
      new Unit({side:'T',name:'徳川秀忠（本隊）',rows:6,cols:8,faceTo:UEDA,ly:6.4,keys:[null,null,null,null,null,HIDETADA_IN,SOMEYA,{p:OUT_1600}]}),
      new Unit({side:'T',name:'牧野康成',rows:3,cols:6,faceTo:UEDA,ly:4.2,keys:[null,null,null,null,null,[...HIDETADA_IN.slice(0,7).map(p=>[p[0]+3,p[1]+3]),[12,-56],[-14,-80]],[[-25,-96],[-50,-104]],{p:[[-10,-80],[20,-40],FORD,EAST1,OYA,[110,30]]}]}),
      new Unit({side:'T',name:'真田信之（徳川方）',rows:4,cols:7,faceTo:UEDA,ly:3.8,keys:[null,null,null,null,null,NOBUYUKI2_IN,TOISHI,TOISHI]}),
      new Unit({side:'S',name:'真田信繁',rows:3,cols:6,faceTo:SOMEYA,ly:4.4,keys:[null,null,null,null,null,NOBUSHIGE_OUT,[-66,-104],[-66,-104]]}),
      new Unit({side:'S',name:'真田勢（刈田を阻む）',rows:2,cols:5,faceTo:SOMEYA,ly:3.4,keys:[null,null,null,null,null,null,[[-60,-106],[-36,-98],[-58,-105]],null]}),
    ];

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f;
    const arrows=[
      new Arrow([...TOKU_IN,CAMP1],AI,3,1),
      new Arrow([CAMP1,...ATTACK,[-60,-105]],AI,2.4,2),
      new Arrow([TOISHI,...NOBUYUKI_DOWN],SHU,2.2,2),
      new Arrow([UEDA,NINO,[-52,-104]],SHU,1.8,2),
      new Arrow([[-60,-105],...ROUT],AI,2.6,3),
      new Arrow([NINO,...PURSUIT],SHU,2.4,3),
      new Arrow([[-10,-118],[15,-80],[30,-45]],SHU,1.8,3),
      new Arrow([YAZAWA,...YAZAWA_DOWN],SHU,2,3),
      new Arrow([EAST1,...TO_MARUKO,[0,185]],AI,2.4,4),
      new Arrow([[-2,195],[-8,207]],AI,1.4,4),
      new Arrow([[0,185],[20,150],[60,60],OYA,UNNO,[190,50],EEDGE],AI,1.4,4),
      new Arrow(HIDETADA_IN,AI,3.2,5),
      new Arrow(NOBUYUKI2_IN,AI,2,5),
      new Arrow(NOBUSHIGE_OUT,SHU,2,5),
      new Arrow([[-14,-80],[-25,-96],[-50,-104]],AI,2,6),
      new Arrow([[-60,-106],[-36,-98]],SHU,1.6,6),
      new Arrow([SOMEYA,...OUT_1600],AI,2.6,7),
    ];

    /* ---------------- 結にだけ出す印など ---------------- */
    const lblDrown=place('神川の増水で多くが溺れたと伝わる',FORD[0],FORD[1],{bg:'rgba(34,78,104,.88)',size:0.026},7);lblDrown.material.opacity=0;

    /* ---------------- 雨（第三幕）・煙・火花・水しぶき ---------------- */
    const rain=(function(){
      const n=1600,R=150,C=[5,-60],pos=new Float32Array(n*6);
      for(let i=0;i<n;i++){const x=C[0]+(rnd()-.5)*2*R,z=C[1]+(rnd()-.5)*2*R,y=rnd()*80;pos.set([x,y,z,x,y-2.0,z],i*6);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const m=new THREE.LineBasicMaterial({color:0xaab4c8,transparent:true,opacity:0});
      const l=new THREE.LineSegments(g,m);l.visible=false;l.frustumCulled=false;scene.add(l);return {l,m,pos,n};
    })();
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<80;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<20;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.3);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      if(kind==='splash'){p.life=p.max=.9+Math.random()*.6;p.vx=(Math.random()-.5)*.3;p.vy=1.6;p.vz=(Math.random()-.5)*.3;p.g=.45;p.s.material.color.set(0xeaf2f8);}
      else{p.life=p.max=(kind==='fire'?4:3)+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=kind==='fire'?1.8:1.3;p.vz=(Math.random()-.5)*.4;p.g=kind==='fire'?1.1:.8;p.s.material.color.set(kind==='fire'?0x5a4e44:0xcfcac2);}
      p.s.visible=true;}
    const FIRE={2:[[-58,-105,6],[-44,-111,6],[-38,-100,5]],6:[[-40,-99,5],[-52,-104,4]]};
    const BURN={2:[[-42,-106,10]]};
    const SPLASH={3:[[34,-23,8],[40,-18,6]]};
    let emitAcc=0;
    function update(cur,tIn,dt,time){
      const rt=cur===3?.35:0;rain.m.opacity+=(rt-rain.m.opacity)*Math.min(1,dt*2);rain.l.visible=rain.m.opacity>.02;
      if(rain.l.visible&&!reduceMotion){const a=rain.pos,v=50*dt;for(let i=0;i<rain.n;i++){let y=a[i*6+1]-v;if(y<0)y+=80;a[i*6+1]=y;a[i*6+4]=y-2.0;}rain.l.geometry.attributes.position.needsUpdate=true;}
      const fenceOn=(cur===2||cur===3)?1:0;for(const f of fences)f.material.opacity+=(fenceOn-f.material.opacity)*Math.min(1,dt*2);
      lblFence.material.opacity+=((((cur===2||cur===3)&&tIn>1)?1:0)-lblFence.material.opacity)*Math.min(1,dt*2);
      lblDrown.material.opacity+=(((cur===3&&tIn>6)?1:0)-lblDrown.material.opacity)*Math.min(1,dt*2);
      fToishi.fm.map=(cur>=6)?SIDES.T.tex:SIDES.S.tex;   // 1600年、信之が戸石城に入る
      const tT=cur>=6?1:0;fToishi.lbl.material.opacity+=((1-tT)-fToishi.lbl.material.opacity)*Math.min(1,dt*2);lblToishiT.material.opacity+=(tT-lblToishiT.material.opacity)*Math.min(1,dt*2);
      const zones=tIn>1.5?FIRE[cur]:null,burn=tIn>4?BURN[cur]:null,spl=tIn>3?SPLASH[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.08){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
        if(burn&&Math.random()<.7){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],'fire');}
        if(spl){const z=spl[(Math.random()*spl.length)|0];emit(z[0],z[1],z[2],'splash');emit(z[0],z[1],z[2],'splash');}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.2+a*5)*q.g);
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
