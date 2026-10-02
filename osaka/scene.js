(function(){
const TAU=Math.PI*2;
const wrapA=a=>{while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;};

/* ---------------- 家紋（旗と帆） ---------------- */
function crest(x,side,cx,cy,r,color){
  x.fillStyle=x.strokeStyle=color;
  if(side==='Y'){                       // 豊臣: 五七桐（簡略。3枚の葉の上に3本の花穂、中央を長く）
    for(const k of[-1,0,1]){x.beginPath();x.ellipse(cx+k*r*.5,cy+r*.45,r*.26,r*.44,k*.6,0,TAU);x.fill();}
    for(const [k,n] of[[-1,5],[0,7],[1,5]]){for(let i=0;i<n;i++){x.beginPath();x.arc(cx+k*r*.55,cy+r*.05-i*r*.17-(k?0:r*.02),r*.1,0,TAU);x.fill();}}
  }else if(side==='N'){                 // 真田: 六文銭
    for(let i=0;i<6;i++){const col=i%3,row=(i/3)|0;const px=cx+(col-1)*r*.66,py=cy+(row-.5)*r*.7;
      x.beginPath();x.arc(px,py,r*.27,0,TAU);x.fill();}
  }else{                                // 徳川: 三つ葉葵（簡略）
    x.lineWidth=r*.14;x.beginPath();x.arc(cx,cy,r*.95,0,TAU);x.stroke();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*TAU/3;x.beginPath();x.ellipse(cx+Math.cos(a)*r*.42,cy+Math.sin(a)*r*.42,r*.3,r*.46,a+Math.PI/2,0,TAU);x.fill();}
  }
}
const CREST={Y:{bg:'#f3efe4',fg:'#1d1d1d',band:'#b8231b'},N:{bg:'#b8231b',fg:'#f3efe4'},T:{bg:'#f3f0e6',fg:'#1d1d1d',band:'#2848a0'}};
function flagTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d'),k=CREST[side];
  x.fillStyle=k.bg;x.fillRect(0,0,64,200);crest(x,side,32,52,17,k.fg);
  if(k.band){x.fillStyle=k.band;x.fillRect(0,0,64,10);}
  x.fillStyle=k.fg;x.fillRect(29,90,6,86);
  return new THREE.CanvasTexture(c);
}
function sailTex(side){
  const c=document.createElement('canvas');c.width=64;c.height=80;const x=c.getContext('2d');
  x.fillStyle='#ece5d2';x.fillRect(0,0,64,80);
  x.strokeStyle='rgba(90,80,60,.35)';x.lineWidth=1;for(let i=1;i<4;i++){x.beginPath();x.moveTo(i*16,0);x.lineTo(i*16,80);x.stroke();}
  crest(x,side,32,40,14,'#1d1d1d');
  return new THREE.CanvasTexture(c);
}
const SIDES={
  Y:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('Y')},
  N:{body:new THREE.Color(0x9a2a1a),label:'rgba(150,26,20,.88)',tex:flagTex('N')},
  T:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('T'),sail:sailTex('T')},
};

/* ---------------- 場面 ---------------- */
const PH=[
  {act:'序',date:'慶長19年（1614）7月〜10月',title:'鐘銘から、籠城の支度へ',text:'豊臣秀頼が再建した京都・方広寺の大仏殿で、梵鐘（ぼんしょう）の銘文の「国家安康」「君臣豊楽」が問題とされ、7月、徳川家康は大仏殿の供養の延期を命じた。弁明にあたった家老の片桐且元は、城内で家康と通じていると疑われ、10月1日に大坂を去る。家康は同じ日に諸大名へ出兵を命じた。豊臣方は浪人を集め、兵糧を買い入れ、上町台地の北端に立つ大坂城の惣構（そうがまえ）を修理して、籠城の支度を始めた。'},
  {act:'一',date:'11月19日〜12月6日',title:'砦が落ち、城が囲まれる',text:'11月19日、徳川方は海に近い木津川口の砦を水陸から攻め落とし、城と大坂湾を結ぶ水上の補給路を断った（9日とする記事もある）。26日には城の東北の鴫野（しぎの）・今福で、堤の上しか進めない低湿地で、上杉景勝勢と佐竹義宣勢が柵を攻め、木村重成と後藤基次が今福へ救援に出た。野田・福島と博労淵（ばくろうぶち）の砦も落ち、30日に豊臣方は残る砦を捨てて城に入る。家康は住吉から茶臼山へ、秀忠は岡山へ本陣を置き、約20万（通説）の徳川軍が城を囲んだ。'},
  {act:'二',date:'12月4日',title:'真田丸の戦い',text:'城の南だけは台地続きで空堀しかなく、真田信繁（幸村）はその外に出丸「真田丸」を築いて守った。12月4日、篠山の真田勢に塹壕（ざんごう）掘りを妨げられていた前田利常勢は、真田勢の挑発に乗って真田丸に攻めかかり、火縄銃の射撃を浴びて大きな損害を出した。井伊直孝・松平忠直勢も八丁目口・谷町口に攻め寄せ、城内の火薬庫の爆発事故を内応（ないおう）の合図と誤って攻めかかり、損害を重ねたと伝わる。真田丸の位置と形は、いまも研究が続いている。'},
  {act:'三',date:'12月16日〜慶長20年1月',title:'砲撃、講和、埋め立て',text:'16日から徳川方は全軍で砲撃を始め、北の備前島からは大筒が本丸北側の奥御殿を、南の天王寺口からは本丸南の表御殿を狙ったとされる。淀殿の居間が崩れて侍女が下敷きになったとも伝わり（『徳川実紀』）、豊臣方は和睦に傾いた。12月19日に講和の条件がまとまり、二の丸・三の丸を壊し、惣構の南・西・東の堀を埋めることになる。翌年1月には埋め立てが進み、真田丸も取り壊されて、大坂城は本丸と内堀だけの「裸城」になった。'},
  {act:'四',date:'慶長20年（1615）3月〜5月6日',title:'裸城、そして河内へ',text:'講和の後、徳川方は浪人の追放か豊臣家の移封（いほう）を求めたが、豊臣方は応じず、埋められた堀を掘り返しはじめた。家康は4月18日、秀忠は21日に二条城へ入り、約15万5千（通説）の軍勢を河内路と大和路に分けて大坂へ向かわせる。堀を失った豊臣方は城を出て戦う道を選び、後藤基次は道明寺へ、木村重成は若江へ、長宗我部盛親は八尾へ向かった。5月6日、後藤基次と木村重成は地図の外の戦いで戦死し、真田信繁・毛利勝永らは天王寺へ引き返した。'},
  {act:'五',date:'5月7日',title:'天王寺・岡山の決戦',text:'冬に家康の本陣だった茶臼山には真田信繁、四天王寺の南門前には毛利勝永、岡山口には大野治房が陣を取った（この日の天候は、晴れとする記録と大雨とする記録がある）。正午ごろ毛利隊が本多忠朝を討って徳川の先鋒を崩し、真田隊は家康の本陣へ3度突入し、馬印が倒れたと伝わる。岡山口でも大野治房勢が前田勢を崩し、秀忠の本陣に迫った。しかし数に勝る徳川方が立て直し、午後3時ごろ豊臣軍は城へ総退却、信繁もこの日に討たれた。'},
  {act:'六',date:'5月7日 夕方〜8日',title:'落城',text:'7日、城に火の手が上がり、二の丸から本丸まで焼けた（火元には諸説ある）。大野治長は千姫を城から出して岡山の秀忠の陣へ送り、秀頼と淀殿の助命を願ったが、聞き入れられなかった。8日、山里丸（やまざとまる）の焼け残った蔵に籠もった秀頼・淀殿らは自害したと伝わる。秀頼が生き延びたとする話も残るが、どれも伝説の域を出ない。'},
  {act:'結',date:'元和元年（1615）7月以降',title:'元和偃武',text:'7月、元号が元和に改まり、天下の平定が宣言された。応仁の乱から約150年続いた大きな戦乱の時代はここで終わり、のちに「元和偃武（げんなえんぶ）」と呼ばれる。徳川は大坂城を新しく築き直し、豊臣の石垣と堀は盛り土の下に埋められた。いま見られる大阪城の石垣と堀は、徳川時代のものである。'},
];
// カメラ: t=[x,(y自動),z] / yaw 0 で南から北を見る（正で東側から、負で西側から）
const CAM=[
  {t:[66,null,-92],d:125,yaw:-0.7,pitch:0.62},
  {t:[30,null,12],d:480,yaw:0.1,pitch:1.3},
  {t:[66,null,-38],d:100,yaw:0.2,pitch:0.72},
  {t:[60,null,-124],d:105,yaw:2.6,pitch:0.65},
  {t:[100,null,15],d:320,yaw:-0.2,pitch:1.15},
  {t:[66,null,64],d:250,yaw:0.0,pitch:0.9},
  {t:[82,null,-60],d:220,yaw:0.4,pitch:0.95},
  {t:[55,null,-5],d:330,yaw:0.4,pitch:1.1},
];
const DAY={bg:0xc8d3d8,fn:320,ff:950,sun:0.95,sunC:0xfff0d8,hemi:0.62};
const WINTER={bg:0xb7bec2,fn:280,ff:900,sun:0.72,sunC:0xeef0f2,hemi:0.6};
const ENV=[
  DAY,
  WINTER,WINTER,
  {bg:0xb39c88,fn:220,ff:760,sun:0.6,sunC:0xffc68e,hemi:0.5},
  {bg:0xc6d9e2,fn:320,ff:950,sun:1.0,sunC:0xfff5e2,hemi:0.66},
  {bg:0xd0e2ea,fn:340,ff:1000,sun:1.08,sunC:0xfff7e8,hemi:0.7},
  {bg:0x34221e,fn:170,ff:640,sun:0.38,sunC:0xff9a5c,hemi:0.34},
  DAY,
];

Sengoku.start({
  id:'osaka',
  title:'大坂の陣',
  subtitle:'慶長19年（1614）冬の陣・慶長20年（1615）夏の陣　徳川家康が豊臣秀頼の大坂城を攻め、豊臣家が滅んだ戦い',
  legend:[{color:'#c0281f',label:'豊臣方'},{color:'#a83020',label:'真田隊（豊臣方）'},{color:'#2c4fb0',label:'徳川方'},{arrow:'#2c4fb0',label:'進軍・退却の方向'}],
  note:'地形は国土地理院の標高データを高さ2倍に強調して表示。台地の西の海岸線は当時の海を概略で描いたもので、正確ではありません。大坂城の高まりには現在の大阪城の石垣・盛土が含まれ、現代の堀と水路も描かれています（旧大和川は描いていません）。惣構・真田丸・砦の位置と形は推定です。城・町・軍勢の位置と経路は流れを理解するための概念的な再現で、兵力や経過の細部には諸説あります（「諸説」ボタンから読めます）。人・旗・建物の大きさは見やすさのため誇張しています。旗の家紋は、豊臣方を五七桐、真田隊を六文銭、徳川方を三つ葉葵で統一したデモ上の表現で、各大名の実際の旗印ではありません。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,ENV,DUR:14,trees:9000,conifer:.45,seed:15,
  treeColors:{c1:'#2d4629',c2:'#44603a',b1:'#6f6a34',b2:'#8a7a3a'},
  build(ctx){
    const {THREE,scene,gy,LL,place,Arrow,Unit,makeLabel,rnd,smooth,ease,lerp,reduceMotion}=ctx;
    const at=(la,lo)=>LL(la,lo);
    const off=(p,dx,dz)=>[p[0]+dx,p[1]+dz];

    /* ---------------- 地点（画面座標。1単位=30m、+x 東、+z 南） ---------------- */
    // 大坂城（現在の堀が水面として描かれるため、軍勢は陸の上に置く）
    const HON=at(34.6872,135.5258);          // 本丸
    const YAMA=[67,-119];                    // 山里丸（本丸の北。34.689,135.525 は現在の堀の上になるため少し南西へ）
    const NINO=[62,-94];                     // 二の丸（南）
    const NISHI=at(34.6865,135.52);          // 西の丸
    const MINAMI=at(34.68,135.527);          // 城の南
    const SGATE=at(34.675,135.524);          // 城の南門（総退却の行き先）
    const EGATE=at(34.686,135.535);          // 城の東門
    const SANADA=at(34.672056,135.525667);   // 真田丸（推定地）
    const SASA=at(34.669,135.526);           // 篠山（推定）
    // 惣構（推定）: 北は大川、西は東横堀川、南は空堀、東は猫間川
    const SK_W=30,SK_E=at(34.6735,135.536)[0],SK_S=at(34.6735,135.536)[1],SK_N=-127;
    // 南の台地
    const CHAUSU=at(34.65168,135.51234);     // 茶臼山
    const OKA=at(34.65423,135.53546);        // 岡山（御勝山古墳）
    const TENNOJI=at(34.6539,135.51645);     // 四天王寺
    const MORI0=at(34.651,135.516);          // 四天王寺の南門前
    const YASUI=at(34.65448,135.51093);      // 安居神社
    const Y2013=at(34.661,135.5125);         // 2013年の文書による地点（生玉と勝鬘の間）
    const SHOMAN=at(34.65711,135.51292),IKUTAMA=at(34.66511,135.513);
    const SUMI=at(34.61239,135.49378);       // 住吉大社
    // 西の砦（推定）・北東の村（推定）
    const KIZU=[-67,-35];                    // 木津川口の砦（34.668,135.470 は海の上になるため岸へ寄せる）
    const BAKURO=at(34.6725,135.487);        // 博労淵の砦
    const NODA=at(34.690,135.482);           // 野田・福島の砦
    const DENPO=at(34.695,135.47);           // 伝法川口の新家
    const SHIGI=at(34.6945,135.541);         // 鴫野
    const IMA=at(34.700,135.552);            // 今福
    const BIZEN=[47,-136];                   // 備前島（推定。大川の北岸に置く）
    const TNJ_GUCHI=at(34.657,135.514);      // 天王寺口の砲撃
    const HIRANO=at(34.6212,135.546);        // 平野郷
    const NE=at(34.705,135.557);             // 北東の端（京・伏見方面）

    /* ---------------- 経路 ---------------- */
    const TOKUGAWA_IN_N=[NE,at(34.69,135.55),at(34.665,135.545),at(34.64,135.52),SUMI];
    const IEYASU_CHAUSU=[SUMI,at(34.635,135.505),CHAUSU];
    const HIDETADA_IN=[off(NE,-3,4),at(34.685,135.552),at(34.66,135.545),OKA];
    const NAVY_END=[-96,-118];               // 野田・福島の沖
    const NAVY_IN=[at(34.62,135.45),at(34.65,135.458),at(34.667,135.462),at(34.685,135.465),NAVY_END];
    const UESUGI_IN=[at(34.7,135.56),at(34.697,135.55),at(34.6945,135.545)];
    const SATAKE_IN=[at(34.705,135.56),at(34.701,135.556)];
    const SATAKE_BACK=at(34.7005,135.555);
    const KIMURA_OUT=[EGATE,at(34.695,135.545),at(34.699,135.548)];
    const MAEDA_IN=[at(34.66,135.53),SASA,at(34.6705,135.5257)];
    const MAEDA_BACK=at(34.6665,135.527);
    const II_IN=[at(34.662,135.515),at(34.669,135.515)];          // 八丁目口へ
    const TADANAO_IN=[at(34.665,135.51),at(34.6695,135.512)];     // 谷町口へ
    const EAST_MID=at(34.67,135.545);
    const TOYO_BACK=[at(34.645,135.56),at(34.65,135.54)];
    const IEYASU5=at(34.636,135.512),IEYASU5B=at(34.633,135.512);
    const IEYASU_IN_S=[HIRANO,at(34.628,135.525),IEYASU5];
    const HIDETADA5=at(34.642,135.537);
    const HIDETADA_IN_S=[at(34.63,135.55),at(34.638,135.54),HIDETADA5];
    const MORI_CHARGE=[MORI0,at(34.646,135.515),at(34.641,135.514)];
    const RETREAT=[at(34.66,135.52),SGATE];
    const SANADA_CHARGE=[CHAUSU,at(34.646,135.509),at(34.64,135.511),at(34.6375,135.512),at(34.645,135.51),at(34.639,135.511),at(34.648,135.51),YASUI];
    const OKA_S=at(34.65,135.536);
    const JIBO_CHARGE=[OKA_S,at(34.648,135.537),at(34.6435,135.537)];
    const MIZUNO_IN=[at(34.61,135.51),at(34.625,135.51),at(34.635,135.509)];
    const SENHIME_OUT=[SGATE,at(34.665,135.53),OKA];

    /* ---------------- 地名 ---------------- */
    const fadeTo=(m,v,dt,k)=>{m.opacity+=(v-m.opacity)*Math.min(1,dt*(k||2));};
    const gated=[];
    const gl=(text,p,o,dy,on)=>{const s=place(text,p[0],p[1],o,dy);s.material.opacity=0;gated.push({s,on});return s;};
    const mt={bg:'rgba(52,64,36,.8)',size:0.025},wt={bg:'rgba(34,78,104,.8)',size:0.022},tn={bg:'rgba(22,24,28,.7)',size:0.022};
    const sh={bg:'rgba(120,80,40,.85)',size:0.022},est={bg:'rgba(70,70,70,.82)',size:0.022};
    const dirStyle={bg:'rgba(245,244,238,.85)',fg:'#20242a',size:0.024,weight:500,family:'"Noto Sans JP",sans-serif'};
    const always=()=>true;
    // 茶臼山（冬は家康、夏は真田の陣）
    gl('茶臼山',CHAUSU,mt,6,c=>c===0||c>=6);
    gl('茶臼山（冬は家康の本陣）',CHAUSU,mt,6,c=>c===2||c===3);
    gl('茶臼山',off(CHAUSU,0,-10),mt,3,c=>c===1);
    gl('茶臼山（夏は真田信繁の陣）',off(CHAUSU,-14,0),mt,10,(c,t)=>c===5&&t<9);
    gl('岡山（御勝山古墳）',OKA,mt,6,c=>c!==1);
    gl('岡山',off(OKA,0,-10),mt,3,c=>c===1);
    gl('四天王寺',TENNOJI,sh,8,c=>c!==1&&c!==5&&c!==7);
    gl('四天王寺',off(TENNOJI,7,2),sh,1,c=>c===5);
    gl('住吉大社',SUMI,sh,5,always);
    gl('篠山（推定）',SASA,est,3.5,c=>c===1||c===2);
    gl('真田丸（推定）',SANADA,{bg:'rgba(150,26,20,.88)',size:0.026},9,(c,t)=>(c===0&&t>4)||(c>=1&&c<=2)||(c===3&&t<7));
    gl('惣構（南・西・東の堀は冬の陣後に埋められた）',[44,SK_S],est,4,(c,t)=>c===0||c===1||(c===3&&t<6)||c===4);
    gl('木津川口の砦（明石全登の隊・推定）',KIZU,est,2.4,c=>c<=1);
    gl('博労淵の砦（薄田兼相・推定）',BAKURO,est,2.4,c=>c<=1);
    gl('野田・福島の砦（大野治胤・推定）',NODA,est,2.4,c=>c<=1);
    gl('伝法川口の新家（推定）',DENPO,est,3.5,c=>c<=1);
    gl('鴫野（井上頼次・推定）',SHIGI,est,5.5,c=>c<=1);
    gl('今福（矢野正倫・飯田家貞・推定）',off(IMA,-12,0),est,5.5,c=>c<=1);
    gl('備前島（推定）',BIZEN,est,5,c=>c===3);
    gl('安居神社',YASUI,sh,3,c=>c===7);
    gl('勝鬘院',SHOMAN,sh,2.5,(c,t)=>(c===5&&t>9)||c===7);
    gl('生國魂神社',IKUTAMA,sh,2.5,(c,t)=>(c===5&&t>9)||c===7);
    gl('船場',at(34.683,135.503),tn,3,c=>c!==7);
    place('天満',36,-148,tn,3);
    place('平野郷',...HIRANO,tn,3);
    gl('玉造',at(34.676,135.532),tn,3,c=>c!==7);
    place('大川（旧淀川）',...at(34.693,135.50),wt,1.5);
    place('東横堀川',28,-80,wt,1.5);
    place('猫間川',...at(34.675,135.537),wt,1.5);
    place('平野川',...at(34.665,135.545),wt,1.5);
    place('木津川',...at(34.672,135.478),wt,1.5);
    place('↑ 京・伏見方面',150,-176,dirStyle,4);
    place('道明寺・八尾・若江方面 →',160,58,dirStyle,4);
    place('↓ 堺・樫井方面',-12,176,dirStyle,4);
    place('← 大阪湾',-150,-30,dirStyle,3);
    place('↙ 木津川・堺の港',-118,110,dirStyle,3);

    /* ---------------- 家並み ---------------- */
    const houseM=new THREE.MeshStandardMaterial({color:0xd9ceb4,roughness:.9}),roofM=new THREE.MeshStandardMaterial({color:0x3a352f,roughness:.7});
    const hb=new THREE.BoxGeometry(.9,.5,.65),hr=new THREE.ConeGeometry(.7,.42,4);
    function town(a,b,n){
      for(let i=0;i<n;i++){const t=i/(n-1),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        const nx=-(b[1]-a[1]),nz=b[0]-a[0],l=Math.hypot(nx,nz),s=(i%2?1:-1)*(1.1+(i*7%3)*.2);
        const px=x+nx/l*s,pz=z+nz/l*s;if(ctx.G.coverAt(px,pz)===255)continue;
        const y=gy(px,pz),ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
        const h=new THREE.Mesh(hb,houseM);h.position.set(px,y+.25,pz);h.rotation.y=ang;h.castShadow=h.receiveShadow=true;scene.add(h);
        const r=new THREE.Mesh(hr,roofM);r.position.set(px,y+.71,pz);r.rotation.y=ang+Math.PI/4;r.scale.set(1,1,.75);r.castShadow=true;scene.add(r);
        ctx.addClear(px,pz,1.6);}
    }
    town(off(at(34.683,135.503),-6,-4),off(at(34.683,135.503),6,4),10);   // 船場
    town([30,-145],[46,-151],6);                                            // 天満
    town(off(HIRANO,-5,-2),off(HIRANO,5,2),6);                              // 平野郷
    town(off(at(34.655,135.519),-4,-3),off(at(34.655,135.519),4,3),6);      // 天王寺の門前
    town(off(at(34.676,135.532),-3,-2),off(at(34.676,135.532),3,2),4);      // 玉造

    /* ---------------- 材質と小物 ---------------- */
    const earthM=new THREE.MeshStandardMaterial({color:0x8a8a5a,roughness:.95});
    const stoneM=new THREE.MeshStandardMaterial({color:0x8e8a80,roughness:.9});
    const wallM=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8}),woodM=new THREE.MeshStandardMaterial({color:0x6b4f33,roughness:.9});
    const blackM=new THREE.MeshStandardMaterial({color:0x26231f,roughness:.6}),goldM=new THREE.MeshStandardMaterial({color:0xc9a13b,metalness:.5,roughness:.4});
    const fadeMat=m=>{const c=m.clone();c.transparent=true;return c;};
    function yagura(g,x,z,y,s,wm,rm){
      const b=new THREE.Mesh(new THREE.BoxGeometry(1.1*s,.9*s,1.1*s),wm||wallM);b.position.set(x,y+.45*s,z);b.castShadow=true;g.add(b);
      const r=new THREE.Mesh(new THREE.ConeGeometry(.95*s,.5*s,4),rm||roofM);r.rotation.y=Math.PI/4;r.position.set(x,y+1.12*s,z);r.castShadow=true;g.add(r);
    }
    function flag(g,x,y,z,side,s){
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,3.2*s),woodM);pole.position.set(x,y+1.6*s,z);g.add(pole);
      const fg=new THREE.PlaneGeometry(.5*s,1.5*s);fg.translate(.25*s,0,0);
      const fm=new THREE.MeshStandardMaterial({map:SIDES[side].tex,side:THREE.DoubleSide,roughness:.8,transparent:true});
      const f=new THREE.Mesh(fg,fm);f.position.set(x+.03,y+2.5*s,z);g.add(f);return fm;
    }

    /* ---------------- 大坂城（本丸の石垣と天守、二の丸の土塁と塀） ---------------- */
    const castleFlags=[];
    const ninoMats=[fadeMat(earthM),fadeMat(wallM),fadeMat(roofM)];
    (function(){
      const g=new THREE.Group();const y0=gy(HON[0],HON[1]);g.position.set(HON[0],y0,HON[1]);scene.add(g);
      // 本丸の石垣（下は低い堀まで伸ばす）
      const base=new THREE.Mesh(new THREE.BoxGeometry(9,3.4,12),stoneM);base.position.set(-1,-1.2,-1);base.castShadow=base.receiveShadow=true;g.add(base);
      const top=new THREE.Mesh(new THREE.BoxGeometry(8.6,.08,11.6),earthM);top.position.set(-1,.52,-1);top.receiveShadow=true;g.add(top);
      // 天守（黒い壁と金の飾り）
      let y=.5;
      for(let i=0;i<5;i++){const w=3.4-i*.5,h=.85;
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.85),blackM);b.position.set(-1,y+h/2,-3);b.castShadow=true;g.add(b);
        const r=new THREE.Mesh(new THREE.ConeGeometry((w+.7)*.74,.42,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.85);r.position.set(-1,y+h+.16,-3);r.castShadow=true;g.add(r);
        y+=h+.24;}
      const sp=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,.12),goldM);sp.position.set(-1,y+.2,-3);g.add(sp);
      yagura(g,2.6,3.8,.5,.9);yagura(g,-4.4,3.8,.5,.9);yagura(g,2.6,-6.2,.5,.8);
      castleFlags.push(flag(g,1.6,.5,0,'Y',1.1));
      // 二の丸（土塁と白い塀。冬の陣の後に壊され、結で徳川の城として描き直す）
      const ng=new THREE.Group();g.add(ng);
      const X0=-16,X1=14,Z0=-12,Z1=20;
      for(const [w,d,x,z] of[[X1-X0,.9,(X0+X1)/2,Z0],[X1-X0,.9,(X0+X1)/2,Z1],[.9,Z1-Z0,X0,(Z0+Z1)/2],[.9,Z1-Z0,X1,(Z0+Z1)/2]]){
        const cx=HON[0]+x,cz=HON[1]+z;
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,1.6,d),ninoMats[0]);b.position.set(x,-.4,z);b.castShadow=b.receiveShadow=true;ng.add(b);
        const wl=new THREE.Mesh(new THREE.BoxGeometry(w>1?w:.25,.35,w>1?.25:d),ninoMats[1]);wl.position.set(x,.55,z);ng.add(wl);}
      for(const [x,z] of[[X0,Z0],[X1,Z0],[X0,Z1],[X1,Z1]])yagura(ng,x,z,.4,1.0,ninoMats[1],ninoMats[2]);
      ctx.addClear(HON[0]-1,HON[1]+4,22);
    })();
    const lblCastle=place('大坂城',HON[0],HON[1],{bg:'rgba(150,26,20,.9)',stroke:'rgba(255,255,255,.55)',size:0.034},10);

    /* ---------------- 惣構（推定。土塁と堀の線） ---------------- */
    const bankStay=fadeMat(earthM),bankGone=fadeMat(earthM);
    const moatM=new THREE.MeshStandardMaterial({color:0x3e4c48,roughness:1,transparent:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const bankG=new THREE.BoxGeometry(2.1,.55,.9),moatG=new THREE.BoxGeometry(2.1,.06,1.3);
    function wallLine(a,b,out,bm,withMoat){
      const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/2),ang=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
      for(let i=0;i<=n;i++){const t=i/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);
        if(ctx.G.coverAt(x,z)===255)continue;
        const m=new THREE.Mesh(bankG,bm);m.position.set(x,gy(x,z)+.2,z);m.rotation.y=ang;m.castShadow=m.receiveShadow=true;scene.add(m);
        if(withMoat){const mx=x+out[0]*1.3,mz=z+out[1]*1.3;if(ctx.G.coverAt(mx,mz)===255)continue;
          const w=new THREE.Mesh(moatG,moatM);w.position.set(mx,gy(mx,mz)+.04,mz);w.rotation.y=ang;scene.add(w);}}
    }
    wallLine([SK_W,SK_S],[SK_E,SK_S],[0,1],bankGone,true);       // 南（空堀）
    wallLine([SK_W,SK_N+3],[SK_W,SK_S],[-1,0],bankGone,true);    // 西（東横堀川）
    wallLine([SK_E,SK_N+6],[SK_E,SK_S],[1,0],bankGone,true);     // 東（猫間川）
    wallLine([SK_W+4,SK_N+1],[54,SK_N+1],[0,-1],bankStay,false); // 北（大川ぞい）

    /* ---------------- 真田丸（推定。半円形の出丸、土塁・柵・櫓） ---------------- */
    const smMoat=moatM.clone();
    const smMats=[fadeMat(earthM),fadeMat(woodM),fadeMat(wallM),fadeMat(roofM),smMoat];
    const smFlag=[];
    (function(){
      const g=new THREE.Group();g.position.set(SANADA[0],gy(SANADA[0],SANADA[1]),SANADA[1]);scene.add(g);
      const R=4.6;
      for(let i=0;i<=18;i++){const th=i/18*Math.PI,x=Math.cos(th)*R,z=Math.sin(th)*R*.8;
        const b=new THREE.Mesh(new THREE.BoxGeometry(1.0,.7,.9),smMats[0]);b.position.set(x,.2,z);b.rotation.y=-th;b.castShadow=b.receiveShadow=true;g.add(b);
        const m=new THREE.Mesh(new THREE.BoxGeometry(1.0,.05,1.0),smMoat);m.position.set(Math.cos(th)*(R+1.2),.03,Math.sin(th)*(R+1.2)*.8);m.rotation.y=-th;g.add(m);
        for(const k of[-.3,.3]){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,.55,.08),smMats[1]);p.position.set(x+Math.cos(th)*.1+Math.sin(th)*k,.8,z+Math.sin(th)*.1-Math.cos(th)*k);g.add(p);}}
      const b2=new THREE.Mesh(new THREE.BoxGeometry(2*R+1,.6,.8),smMats[0]);b2.position.set(0,.2,-.6);g.add(b2);   // 北側（惣構の側）
      yagura(g,0,1.6,.1,.9,smMats[2],smMats[3]);
      smFlag.push(flag(g,-1.8,.1,1.2,'N',.9));
      ctx.addClear(SANADA[0],SANADA[1],8);
    })();
    const smAll=smMats.concat(smFlag);
    for(const m of smAll){m.opacity=0;m.visible=false;}   // 序の途中で現れる

    /* ---------------- 西の砦（木津川口・博労淵・野田福島）と伝法川口 ---------------- */
    const fortMats=[fadeMat(earthM),fadeMat(woodM),fadeMat(wallM),fadeMat(roofM)];
    const fortFlags=[];
    function fort(p,s){
      const g=new THREE.Group();g.position.set(p[0],gy(p[0],p[1]),p[1]);scene.add(g);
      const mound=new THREE.Mesh(new THREE.CylinderGeometry(2.0*s,2.5*s,.6*s,20),fortMats[0]);mound.position.y=.1;mound.castShadow=mound.receiveShadow=true;g.add(mound);
      for(let i=0;i<20;i++){const a=i/20*TAU;const q=new THREE.Mesh(new THREE.BoxGeometry(.1,.6*s,.1),fortMats[1]);q.position.set(Math.cos(a)*1.8*s,.7*s,Math.sin(a)*1.8*s);g.add(q);}
      const hut=new THREE.Mesh(new THREE.BoxGeometry(1.1*s,.6*s,.8*s),fortMats[2]);hut.position.y=.7*s;hut.castShadow=true;g.add(hut);
      const r=new THREE.Mesh(new THREE.ConeGeometry(.9*s,.45*s,4),fortMats[3]);r.rotation.y=Math.PI/4;r.position.y=1.22*s;r.scale.set(1,1,.8);g.add(r);
      fortFlags.push(flag(g,.9*s,.3,-.6*s,'Y',.8*s));
      ctx.addClear(p[0],p[1],3.5*s);
    }
    fort(KIZU,1);fort(BAKURO,1);fort(NODA,1);
    (function(){const g=new THREE.Group();g.position.set(DENPO[0],gy(DENPO[0],DENPO[1]),DENPO[1]);scene.add(g);
      for(const [x,z] of[[-1,0],[1,.3],[0,1.4]]){const h=new THREE.Mesh(new THREE.BoxGeometry(1.4,.7,.9),fortMats[2]);h.position.set(x,.35,z);g.add(h);
        const r=new THREE.Mesh(new THREE.ConeGeometry(1.0,.4,4),fortMats[3]);r.rotation.y=Math.PI/4;r.scale.set(1.2,1,.7);r.position.set(x,.9,z);g.add(r);}})();
    const fortAll=fortMats.concat(fortFlags);

    /* ---------------- 鴫野・今福の柵（堤の上に何重にも） ---------------- */
    const sakuM=fadeMat(woodM);
    function saku(p,ang,rows){
      for(let r=0;r<rows;r++)for(let i=-4;i<=4;i++){
        const d=r*1.0-(rows-1)*.5,x=p[0]+Math.cos(ang)*i*.5+Math.sin(ang)*d,z=p[1]-Math.sin(ang)*i*.5+Math.cos(ang)*d;
        const q=new THREE.Mesh(new THREE.BoxGeometry(.08,.6,.08),sakuM);q.position.set(x,gy(x,z)+.3,z);scene.add(q);}
      ctx.addClear(p[0],p[1],3);
    }
    saku(off(SHIGI,4,0),Math.PI/2,2);saku(off(SHIGI,7,0),Math.PI/2,2);
    saku(off(IMA,4,0),Math.PI/2,2);saku(off(IMA,7,0),Math.PI/2,2);

    /* ---------------- 備前島の大筒 ---------------- */
    const gunM=new THREE.MeshStandardMaterial({color:0x1d1b19,roughness:.5,metalness:.3,transparent:true,opacity:0});
    (function(){
      const g=new THREE.Group();g.position.set(BIZEN[0],gy(BIZEN[0],BIZEN[1]),BIZEN[1]);scene.add(g);
      g.rotation.y=Math.atan2(HON[0]-BIZEN[0],HON[1]-BIZEN[1]);
      for(let i=0;i<10;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,1.4,8),gunM);c.rotation.x=Math.PI/2-.12;c.position.set((i-4.5)*.7,.3,(i%2)*.6);c.castShadow=true;g.add(c);}
      ctx.addClear(BIZEN[0],BIZEN[1],4);
    })();

    /* ---------------- 四天王寺（五重塔と金堂）・住吉大社 ---------------- */
    (function(){
      const g=new THREE.Group();g.position.set(TENNOJI[0],gy(TENNOJI[0],TENNOJI[1]),TENNOJI[1]);scene.add(g);
      const bm=new THREE.MeshStandardMaterial({color:0xb5442c,roughness:.8});
      let y=0;
      for(let i=0;i<5;i++){const w=1.05-i*.13,h=.42;
        const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bm);b.position.set(0,y+h/2,1.2);b.castShadow=true;g.add(b);
        const r=new THREE.Mesh(new THREE.ConeGeometry((w+.55)*.72,.3,4),roofM);r.rotation.y=Math.PI/4;r.position.set(0,y+h+.12,1.2);r.castShadow=true;g.add(r);
        y+=h+.2;}
      const sp=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.9,6),goldM);sp.position.set(0,y+.4,1.2);g.add(sp);
      const hall=new THREE.Mesh(new THREE.BoxGeometry(2.2,.9,1.5),bm);hall.position.set(0,.45,-1.4);hall.castShadow=true;g.add(hall);
      const hr=new THREE.Mesh(new THREE.ConeGeometry(1.8,.7,4),roofM);hr.rotation.y=Math.PI/4;hr.scale.set(1,1,.7);hr.position.set(0,1.25,-1.4);hr.castShadow=true;g.add(hr);
      ctx.addClear(TENNOJI[0],TENNOJI[1],4);
    })();
    (function(){
      const g=new THREE.Group();g.position.set(SUMI[0],gy(SUMI[0],SUMI[1]),SUMI[1]);scene.add(g);
      const vm=new THREE.MeshStandardMaterial({color:0xc24a2f,roughness:.8});
      for(const x of[-1.2,1.2]){const h=new THREE.Mesh(new THREE.BoxGeometry(1.6,.7,1.1),vm);h.position.set(x,.35,0);h.castShadow=true;g.add(h);
        const r=new THREE.Mesh(new THREE.ConeGeometry(1.2,.5,4),roofM);r.rotation.y=Math.PI/4;r.scale.set(1,1,.75);r.position.set(x,.95,0);g.add(r);}
      ctx.addClear(SUMI[0],SUMI[1],3);
    })();

    /* ---------------- 船（徳川水軍） ---------------- */
    const SEA_Y=gy(-150,0);
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
    new Fleet({side:'T',name:'徳川水軍（九鬼守隆・向井忠勝）',n:14,ly:4,faceTo:NODA,keys:[null,NAVY_IN,NAVY_END,NAVY_END,null,null,null,null]});

    /* ---------------- 軍勢 ---------------- */
    const units=[
      // 豊臣方
      new Unit({side:'Y',name:'豊臣秀頼・淀殿（本丸）',rows:4,cols:7,face:0,ly:7,keys:[HON,HON,HON,HON,HON,HON,{p:[HON,YAMA]},null]}),
      new Unit({side:'Y',name:'大野治長・七手組',rows:5,cols:8,face:0,ly:5,keys:[NINO,NINO,NINO,NINO,[NINO,at(34.66,135.538),at(34.658,135.52)],RETREAT,{p:[SGATE,YAMA]},null]}),
      new Unit({side:'N',name:'真田信繁',rows:4,cols:7,face:0,ly:5.5,keys:[MINAMI,SANADA,SANADA,SANADA,[EAST_MID,...TOYO_BACK,CHAUSU],{p:SANADA_CHARGE},null,null]}),
      new Unit({side:'Y',name:'毛利勝永',rows:4,cols:7,face:0,ly:4.4,keys:[NISHI,NISHI,NISHI,NISHI,[off(EAST_MID,0,4),...TOYO_BACK.map(p=>off(p,0,3)),MORI0],[...MORI_CHARGE,...RETREAT],{p:[SGATE,off(YAMA,-3,4)]},null]}),
      new Unit({side:'Y',name:'後藤基次',rows:4,cols:7,face:0,ly:4.2,keys:[at(34.683,135.53),[...KIMURA_OUT.map(p=>off(p,2,3)),off(EGATE,0,3),at(34.683,135.53)],at(34.683,135.53),at(34.683,135.53),{p:[EAST_MID,HIRANO,at(34.615,135.56)]},null,null,null]}),
      new Unit({side:'Y',name:'木村重成',rows:3,cols:6,face:0,ly:5.4,keys:[at(34.681,135.532),[...KIMURA_OUT,EGATE,at(34.681,135.532)],at(34.681,135.532),at(34.681,135.532),{p:[off(EAST_MID,0,-4),at(34.665,135.56)]},null,null,null]}),
      new Unit({side:'Y',name:'長宗我部盛親',rows:3,cols:6,face:0,ly:4.2,keys:[at(34.679,135.515),at(34.679,135.515),at(34.679,135.515),at(34.679,135.515),{p:[off(EAST_MID,0,6),at(34.655,135.56)]},null,null,null]}),
      new Unit({side:'Y',name:'大野治房',rows:4,cols:7,face:0,ly:6.2,keys:[at(34.682,135.52),at(34.682,135.52),at(34.682,135.52),at(34.682,135.52),[at(34.63,135.55),OKA_S],[...JIBO_CHARGE,off(RETREAT[0],6,0),off(SGATE,5,0)],null,null]}),
      new Unit({side:'Y',name:'明石全登',rows:3,cols:5,face:Math.PI*1.5,ly:5,keys:[KIZU,{p:[at(34.675,135.5),at(34.684,135.514)]},at(34.684,135.514),at(34.684,135.514),at(34.684,135.514),[at(34.655,135.49)],null,null]}),
      new Unit({side:'Y',name:'薄田兼相（博労淵）',rows:2,cols:5,face:Math.PI*1.5,ly:5,keys:[BAKURO,{p:[BAKURO,at(34.678,135.505)]},null,null,null,null,null,null]}),
      new Unit({side:'Y',name:'大野治胤（野田・福島）',rows:2,cols:5,face:Math.PI*1.5,ly:5,keys:[NODA,{p:[NODA,[36,-146]]},null,null,null,null,null,null]}),
      new Unit({side:'Y',name:'井上頼次（鴫野）',rows:2,cols:5,face:Math.PI/2,ly:3.4,keys:[SHIGI,{p:[SHIGI]},null,null,null,null,null,null]}),
      new Unit({side:'Y',name:'矢野正倫・飯田家貞（今福）',rows:2,cols:4,face:Math.PI/2,ly:3.4,keys:[IMA,{p:[IMA,at(34.698,135.546)]},null,null,null,null,null,null]}),
      // 徳川方
      new Unit({side:'T',name:'徳川家康（本陣）',rows:5,cols:8,faceTo:HON,ly:6.4,keys:[null,[...TOKUGAWA_IN_N,...IEYASU_CHAUSU.slice(1)],CHAUSU,CHAUSU,null,[...IEYASU_IN_S,IEYASU5B],at(34.66,135.515),CHAUSU]}),
      new Unit({side:'T',name:'徳川秀忠（本陣）',rows:5,cols:8,faceTo:HON,ly:5.6,keys:[null,HIDETADA_IN,OKA,OKA,null,HIDETADA_IN_S,OKA,OKA]}),
      new Unit({side:'T',name:'前田利常',rows:4,cols:7,faceTo:HON,ly:5,keys:[null,at(34.662,135.53),[...MAEDA_IN,MAEDA_BACK],at(34.662,135.53),null,[at(34.648,135.537),at(34.642,135.54)],at(34.66,135.53),at(34.66,135.53)]}),
      new Unit({side:'T',name:'井伊直孝',rows:3,cols:6,faceTo:HON,ly:4.2,keys:[null,at(34.662,135.517),II_IN,at(34.662,135.517),null,at(34.645,135.53),at(34.662,135.52),at(34.662,135.52)]}),
      new Unit({side:'T',name:'松平忠直',rows:4,cols:7,faceTo:HON,ly:6.2,keys:[null,at(34.664,135.512),TADANAO_IN,at(34.664,135.512),null,[at(34.645,135.507),at(34.642,135.506),at(34.65,135.51)],at(34.664,135.515),at(34.664,135.515)]}),
      new Unit({side:'T',name:'藤堂高虎',rows:3,cols:6,faceTo:HON,ly:3.6,keys:[null,at(34.664,135.508),at(34.664,135.508),at(34.664,135.508),null,at(34.646,135.533),at(34.662,135.51),at(34.662,135.51)]}),
      new Unit({side:'T',name:'伊達政宗',rows:3,cols:6,faceTo:HON,ly:4.6,keys:[null,at(34.667,135.503),at(34.667,135.503),at(34.667,135.503),null,null,null,null]}),
      new Unit({side:'T',name:'上杉景勝',rows:3,cols:6,faceTo:SHIGI,ly:4.4,keys:[null,[...UESUGI_IN,off(SHIGI,3,0)],off(SHIGI,3,0),off(SHIGI,3,0),null,null,null,null]}),
      new Unit({side:'T',name:'佐竹義宣',rows:2,cols:5,faceTo:IMA,ly:4.4,keys:[null,[...SATAKE_IN,off(IMA,3,0),SATAKE_BACK],SATAKE_BACK,SATAKE_BACK,null,null,null,null]}),
      new Unit({side:'T',name:'本多忠朝',rows:3,cols:6,face:Math.PI,ly:4.4,keys:[null,null,null,null,null,{p:[at(34.646,135.515),at(34.6465,135.5155)]},null,null]}),
      new Unit({side:'T',name:'榊原康勝・酒井家次',rows:3,cols:6,face:Math.PI,ly:3.6,keys:[null,null,null,null,null,[at(34.642,135.516),at(34.636,135.518)],at(34.66,135.518),at(34.66,135.518)]}),
      new Unit({side:'T',name:'水野勝成',rows:3,cols:6,face:Math.PI,ly:4.8,keys:[null,null,null,null,null,MIZUNO_IN,at(34.658,135.512),at(34.658,135.512)]}),
    ];
    // 名札の高さを場面ごとに変える（重なり対策）と、場面ごとに名札を隠す
    const LY={
      '後藤基次':[3.4,1.6,4.2,4.2,4.2],
      '木村重成':[6.6,9,6.4,6.4,5.4],
      '毛利勝永':[4.4,4.4,4.4,4.4,1.5,1.2,3.4],
      '大野治長・七手組':[3.6,5,5,5,5,5,6],
      '真田信繁':[5.2,6.6,3.4,6.6,9,7.4],
      '井伊直孝':[,3.8,4.6,3.8,,2,3.4,3.4],
      '藤堂高虎':[,1.6,5.2,1.6,,9,5.6,5.6],
      '前田利常':[,4.2,7,4.2,,3,4.6,4.6],
      '松平忠直':[,9,4.4,9,,4.6,7,7],
      '大野治房':[,,,,,9],
      '徳川秀忠（本陣）':[,1.2,,,,8.6],
      '水野勝成':[,,,,,4.8,6.4,6.4],
      '榊原康勝・酒井家次':[,,,,,8,4.2,4.2],
      '徳川家康（本陣）':[,1.2,6.4,6.4,,2.4,6.4,8.6],
    };
    // 場面ごとに名札を隠す軍勢（城の中に集まる場面は城の名札で足りる）。結では軍勢の名札を消して史跡の名前を見せる
    const HIDE_PH={
      0:['薄田兼相（博労淵）','大野治胤（野田・福島）','井上頼次（鴫野）','矢野正倫・飯田家貞（今福）','長宗我部盛親','大野治房'],
      1:['豊臣秀頼・淀殿（本丸）','大野治長・七手組','毛利勝永','長宗我部盛親','大野治房','薄田兼相（博労淵）','大野治胤（野田・福島）','明石全登','井上頼次（鴫野）','矢野正倫・飯田家貞（今福）'],
      2:['豊臣秀頼・淀殿（本丸）','大野治長・七手組','毛利勝永','長宗我部盛親','大野治房','後藤基次','木村重成','明石全登'],
      3:['大野治長・七手組','毛利勝永','長宗我部盛親','大野治房','後藤基次','木村重成','明石全登'],
      4:['豊臣秀頼・淀殿（本丸）'],
      6:['大野治長・七手組','毛利勝永','水野勝成','榊原康勝・酒井家次','藤堂高虎','前田利常'],
    };

    /* ---------------- 矢印 ---------------- */
    const AI=0x3159c9,SHU=0xd0301f;
    const arrows=[
      new Arrow(NAVY_IN,AI,2.6,1),
      new Arrow(UESUGI_IN.concat([off(SHIGI,3,0)]),AI,2,1),
      new Arrow(SATAKE_IN.concat([off(IMA,3,0)]),AI,1.6,1),
      new Arrow(KIMURA_OUT,SHU,1.8,1),
      new Arrow(TOKUGAWA_IN_N,AI,3,1),
      new Arrow(HIDETADA_IN,AI,2.6,1),
      new Arrow(IEYASU_CHAUSU,AI,2.2,1),
      new Arrow([off(MAEDA_IN[0],0,3),...MAEDA_IN.slice(1)],AI,2.4,2),
      new Arrow(II_IN,AI,1.6,2),
      new Arrow(TADANAO_IN,AI,1.6,2),
      new Arrow([off(SANADA,0,2),off(SANADA,0,7)],SHU,1.4,2),
      new Arrow([BIZEN,off(YAMA,-1,0)],AI,1.2,3),
      new Arrow([EGATE,EAST_MID,HIRANO],SHU,2,4),
      new Arrow([off(EAST_MID,4,0),at(34.665,135.56)],SHU,1.6,4),
      new Arrow([at(34.645,135.556),at(34.65,135.54),CHAUSU],SHU,2,4),
      new Arrow(IEYASU_IN_S,AI,2.4,5),
      new Arrow(HIDETADA_IN_S,AI,2.4,5),
      new Arrow(MIZUNO_IN,AI,1.6,5),
      new Arrow(MORI_CHARGE,SHU,2.2,5),
      new Arrow(SANADA_CHARGE.slice(0,4),SHU,3,5),
      new Arrow(JIBO_CHARGE,SHU,2,5),
    ];

    /* ---------------- 場面ごとに出すラベル ---------------- */
    const big={size:0.024};
    gl('城内の火薬庫の爆発（事故）',[46,-79],Object.assign({bg:'rgba(70,40,30,.88)'},big),5,(c,t)=>c===2&&t>7);
    gl('12月19日 講和／二の丸・三の丸と惣構の堀を埋める',[78,-128],Object.assign({bg:'rgba(70,70,70,.9)'},big),6,(c,t)=>c===3&&t>6);
    gl('5月6日 道明寺・八尾・若江の戦い（地図の外）。後藤基次・木村重成が戦死',[150,-20],Object.assign({bg:'rgba(70,40,30,.9)'},big),6,(c,t)=>c===4&&t>7);
    gl('真田信繁 戦死地（通説・安居神社）',YASUI,Object.assign({bg:'rgba(150,26,20,.92)'},big),3.5,(c,t)=>c===5&&t>9);
    gl('2013年発見の文書による地点',Y2013,Object.assign({bg:'rgba(70,40,30,.9)'},big),5,(c,t)=>c===5&&t>9);
    gl('5月8日 秀頼・淀殿ら自害（と伝わる）',YAMA,Object.assign({bg:'rgba(70,40,30,.92)'},big),14,(c,t)=>c===6&&t>8);
    gl('徳川の大坂城（1620〜。豊臣の石垣と堀は盛り土の下に）',HON,Object.assign({bg:'rgba(34,62,140,.9)'},big),15,c=>c===7);
    gl('三光神社・心眼寺（真田丸の推定地）',SANADA,Object.assign({bg:'rgba(120,80,40,.88)'},big),7,c=>c===7);

    /* ---------------- 千姫（一人の脱出） ---------------- */
    const runner=new THREE.Group();scene.add(runner);
    const dotM=new THREE.MeshBasicMaterial({color:0xf2c4d4,transparent:true,opacity:0,fog:false});
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.7,12,10),dotM);dot.position.y=.8;runner.add(dot);
    const rLbl=makeLabel('千姫',{bg:'rgba(140,60,96,.92)',size:0.022});rLbl.position.y=2.6;rLbl.material.opacity=0;runner.add(rLbl);
    runner.visible=false;
    function polyAt(P,t){t=Math.max(0,Math.min(1,t));const L=[0];for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
      const s=ease(t)*L[L.length-1];let i=1;while(i<L.length-1&&L[i]<s)i++;const u=(s-L[i-1])/((L[i]-L[i-1])||1);
      return [lerp(P[i-1][0],P[i][0],u),lerp(P[i-1][1],P[i][1],u)];}

    /* ---------------- 煙・火花 ---------------- */
    const puffTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
      const g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
    const smoke=[];for(let i=0;i<150;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xcfcac2,transparent:true,opacity:0,depthWrite:false});const s=new THREE.Sprite(m);s.visible=false;scene.add(s);smoke.push({s,life:0,max:1,vx:0,vy:0,vz:0,g:1});}
    const flashes=[];for(let i=0;i<28;i++){const m=new THREE.SpriteMaterial({map:puffTex,color:0xffb347,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});const s=new THREE.Sprite(m);s.scale.setScalar(1.6);scene.add(s);flashes.push({s,t:Math.random()});}
    function emit(x,z,spread,kind){const p=smoke.find(q=>q.life<=0);if(!p)return;const px=x+(Math.random()-.5)*spread,pz=z+(Math.random()-.5)*spread;
      p.s.position.set(px,gy(px,pz)+.6,pz);
      const big=kind==='blaze';
      p.life=p.max=(kind?5:3)+Math.random()*2.5;p.vx=.5+Math.random()*.6;p.vy=kind?(big?2.6:1.8):1.3;p.vz=(Math.random()-.5)*.4;p.g=big?2.2:kind?1.2:.8;
      p.s.material.color.set(big?0x8a6a5a:kind?0x4a423c:0xcfcac2);p.s.visible=true;}
    const z3=(p,s,dx,dz)=>[p[0]+(dx||0),p[1]+(dz||0),s];
    const FIRE={
      1:[z3(KIZU,4),z3(off(SHIGI,3,0),5),z3(IMA,5),z3(BAKURO,3),z3(NODA,3)],
      2:[z3(SANADA,5,0,5),z3(at(34.669,135.515),4),z3(at(34.6695,135.512),4)],
      3:[z3(BIZEN,4),z3(TNJ_GUCHI,4)],
      5:[z3(CHAUSU,7,0,12),z3(MORI0,7,0,12),z3(OKA,7,2,24),z3(IEYASU5,5,0,-4)],
      6:[z3(HON,5,-1,-2),z3(NINO,6,4,-4),z3(HON,5,-8,6)],
    };
    const BURN={2:[z3(at(34.678,135.515),3)],3:[z3(HON,3,-1,-7),z3(HON,3,0,4)],6:[z3(HON,6,-1,-2),z3(NINO,8,4,-4),z3(HON,6,-8,6)]};
    const FIRE_T={1:1.5,2:2,3:1,5:2,6:0.5};
    const BURN_T={2:7,3:3,6:0.5};
    // 落城の炎の照り返し
    const glowM=new THREE.SpriteMaterial({map:puffTex,color:0xff7a30,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});
    const glow=new THREE.Sprite(glowM);glow.scale.setScalar(34);glow.position.set(HON[0]-2,gy(HON[0],HON[1])+3,HON[1]+4);glow.visible=false;scene.add(glow);
    let emitAcc=0;

    function update(cur,tIn,dt,time){
      const p=Sengoku.clamp((tIn-0.8)/(14*0.72),0,1);
      for(const f of fleets)f.update(cur,p,dt,time);
      for(const u of units){const n=u.d.name;
        const l=LY[n]&&LY[n][cur];u.label.position.y=l!=null?l:u.d.ly;
        if(cur===7||(HIDE_PH[cur]&&HIDE_PH[cur].includes(n)))u.label.material.opacity=0;}
      for(const g of gated)fadeTo(g.s.material,g.on(cur,tIn)?1:0,dt);
      // 城の旗と名札（結で徳川に）
      const tk=cur===7;
      for(const m of castleFlags)m.map=tk?SIDES.T.tex:SIDES.Y.tex;
      fadeTo(lblCastle.material,cur>=6?0:1,dt);
      // 惣構の南・西・東と二の丸は第三幕の途中で消える（結で徳川の城として描き直す）
      const sokamae=cur<=2||(cur===3&&tIn<6)?1:0;
      fadeTo(bankGone,sokamae,dt,1.2);moatM.opacity=bankGone.opacity;
      const nino=(sokamae||cur===7)?1:0;for(const m of ninoMats)fadeTo(m,nino,dt,1.2);
      // 真田丸
      const sm=(cur===0&&tIn>4)||cur===1||cur===2||(cur===3&&tIn<6)?1:0;
      for(const m of smAll)fadeTo(m,sm,dt,1.2);
      // 西の砦は第一幕で落ちる
      const ft=cur===0||(cur===1&&tIn<9)?1:0;for(const m of fortAll)fadeTo(m,ft,dt,1.2);
      fadeTo(sakuM,cur<=1?1:0,dt);
      fadeTo(gunM,cur===3?1:0,dt);
      for(const m of[bankGone,...ninoMats,...smAll,...fortAll,sakuM,gunM])m.visible=m.opacity>.02;
      moatM.visible=bankGone.visible;
      fadeTo(glowM,cur===6?.55+(reduceMotion?0:Math.sin(time*3)*.08):0,dt,1);glow.visible=glowM.opacity>.02;
      // 千姫
      if(cur===6&&tIn>1&&tIn<10.5){
        runner.visible=true;const q=polyAt(SENHIME_OUT,(tIn-1)/8);
        runner.position.set(q[0],gy(q[0],q[1]),q[1]);
        const a=Math.min(1,(tIn-1)/.5,(10.5-tIn)/.5);dotM.opacity=a;rLbl.material.opacity=a;
      }else runner.visible=false;
      // 煙と火花
      const zones=FIRE[cur]&&tIn>FIRE_T[cur]?FIRE[cur]:null,burn=BURN[cur]&&tIn>BURN_T[cur]?BURN[cur]:null;
      emitAcc+=dt;
      if(emitAcc>0.07){emitAcc=0;
        if(zones){const z=zones[(Math.random()*zones.length)|0];emit(z[0],z[1],z[2]);}
        if(burn){const z=burn[(Math.random()*burn.length)|0];emit(z[0],z[1],z[2],cur===6?'blaze':'fire');if(cur===6){const z2=burn[(Math.random()*burn.length)|0];emit(z2[0],z2[1],z2[2],'blaze');}}}
      for(const q of smoke){if(q.life<=0)continue;q.life-=dt;const a=1-q.life/q.max;
        q.s.position.x+=q.vx*dt;q.s.position.z+=q.vz*dt;q.s.position.y+=dt*q.vy;q.s.scale.setScalar((1.4+a*5)*q.g);
        q.s.material.opacity=Math.sin(Math.PI*a)*.6;if(q.life<=0)q.s.visible=false;}
      for(const f of flashes){
        if(!zones){f.s.material.opacity*=.8;continue;}
        f.t-=dt;if(f.t<=0){f.t=.15+Math.random()*1.0;const z=zones[(Math.random()*zones.length)|0];const x=z[0]+(Math.random()-.5)*z[2],zz=z[1]+(Math.random()-.5)*z[2];
          f.s.position.set(x,gy(x,zz)+.9,zz);f.s.material.opacity=1;}
        else f.s.material.opacity*=Math.pow(.004,dt);}
    }
    return {units,arrows,update};
  }
});
})();
