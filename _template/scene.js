/* ============================================================
 * 新しい合戦の雛形（scene.js）
 * 1. _template フォルダを丸ごとコピーして、フォルダ名を英小文字の合戦名にする（例: okehazama）
 * 2. battle.json の build.origin を戦場の中心の緯度経度にして  python3 _geo/build.py okehazama
 * 3. このファイルの「ここを書きかえる」を順に埋める
 * 座標は LL(緯度, 経度) で書けます（地理院地図で場所を右クリックすると緯度経度が出ます）。
 * 画面の座標は 1単位 = 30m、+x が東、+z が南です。
 * ============================================================ */
(function(){
const TAU=Math.PI*2;

/* 旗（のぼり）の絵。canvas に描きます。家紋を描き込んでも OK */
function flagTex(bg,fg){
  const c=document.createElement('canvas');c.width=64;c.height=200;const x=c.getContext('2d');
  x.fillStyle=bg;x.fillRect(0,0,64,200);
  x.strokeStyle=fg;x.lineWidth=5;x.beginPath();x.arc(32,50,17,0,TAU);x.stroke();
  return new THREE.CanvasTexture(c);
}

/* ここを書きかえる①: 陣営（色・名札の色・旗） */
const SIDES={
  A:{body:new THREE.Color(0x2b3f78),label:'rgba(34,58,138,.88)',tex:flagTex('#f3f0e6','#1d1d1d')},
  B:{body:new THREE.Color(0x8a2219),label:'rgba(150,26,20,.88)',tex:flagTex('#b8231b','#f3efe4')},
};

/* ここを書きかえる②: 場面。act は 序・一・二…・結。text は 2〜4 文くらいが読みやすい */
const PH=[
  {act:'序',date:'〇〇年（西暦）',title:'戦いの前',text:'両軍がどこにいて、なぜ戦うことになったのかを書きます。'},
  {act:'一',date:'〇月〇日',title:'ぶつかる',text:'どちらがどこへ動いたかを書きます。'},
  {act:'結',date:'その後',title:'決着',text:'結果と、その後の影響を書きます。諸説がある所は setsu.md へ。'},
];

/* ここを書きかえる③: カメラ。t=[x, null, z] が見る場所（高さは自動）、d=距離、yaw=向き（0で南から北を見る）、pitch=見下ろす角度 */
const CAM=[
  {t:[0,null,0],d:220,yaw:0.3,pitch:1.0},
  {t:[0,null,0],d:120,yaw:0.6,pitch:0.7},
  {t:[0,null,0],d:260,yaw:-0.3,pitch:1.05},
];

Sengoku.start({
  /* ここを書きかえる④: ページの見出し */
  id:'template',
  title:'〇〇の戦い',
  subtitle:'〇〇年（西暦）　だれとだれの戦いか',
  legend:[{color:'#2c4fb0',label:'A軍'},{color:'#c0281f',label:'B軍'},{arrow:'#2c4fb0',label:'進軍の方向'}],
  note:'地形は国土地理院の標高データを高さ2倍に強調して表示。軍勢の数と配置は流れを理解するための概念的な再現です。',
  geo:'geo/',exaggeration:2,SIDES,PH,CAM,
  env:{bg:0xc5d3da,fn:230,ff:640,sun:0.95,sunC:0xfff0d8,hemi:0.62},   // 空の色・霧・日差し（場面ごとに変えるなら ENV:[…] を場面数ぶん）
  DUR:13,trees:12000,

  build(ctx){
    const {LL,place,Arrow,Unit}=ctx;

    /* ここを書きかえる⑤: 地名ラベル  place(文字, x, z, 見た目, 地面からの高さ) */
    place('〇〇山',...LL(35.000,136.000),{bg:'rgba(52,64,36,.8)',size:0.028},6);

    /* ここを書きかえる⑥: 軍勢
       keys は場面ごとの位置。[x,z] ならそこに立つ、[[x,z],[x,z]] ならその道順で動く、
       null なら画面にいない（null の次の場面では、前の位置からではなく新しい経路の先頭に現れる）、
       {p:[[x,z],…]} なら動きながら消える（退却など） */
    const home=[0,0];
    const units=[
      new Unit({side:'A',name:'A軍 本隊',rows:4,cols:7,faceTo:[20,0],keys:[[-20,0],[[-20,0],[-6,0]],[-6,0]]}),
      new Unit({side:'B',name:'B軍',rows:4,cols:7,faceTo:[-20,0],keys:[[20,0],[20,0],{p:[[40,10],[80,30]]}]}),
    ];

    /* ここを書きかえる⑦: 矢印  new Arrow(道順, 色, 太さ, 出す場面[, 消す場面]) */
    const arrows=[
      new Arrow([[-20,0],[-12,0],[-6,0]],0x3159c9,2,1),
    ];

    return {units,arrows};
  }
});
})();
