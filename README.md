# 戦国合戦 3D俯瞰デモ

**https://k-ito-schoolagent.github.io/sengoku-3d/**

国土地理院の標高データから作った**実際の地形**の上で、戦国時代の合戦を場面ごとに3Dで俯瞰する教材です。陣の位置は陣跡・城跡の緯度経度に合わせてあり、「なぜここに陣を置いたのか」「どの谷を通って攻めたのか」を地形と一緒に見られます。説が分かれるところは、各ページの **「諸説」ボタン** から、みんなで書き足した別の説を読めます。

**だれでも合戦や諸説を追加できる、オープンなプロジェクトです。** 地元の城、好きな合戦、「通説とはちがう説がある」という話を、ぜひ足してください。GitHub がはじめての方の、issue やプルリクエストの練習にも使ってください。→ [参加のしかた](CONTRIBUTING.md)

## 収録している合戦

| 合戦 | 年 | 場所 | 見どころ |
|---|---|---|---|
| [厳島の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/itsukushima/) | 天文24年（1555） | 広島県廿日市市宮島町 | 海と島の地形、嵐の夜の渡海、博奕尾の尾根越えの奇襲、村上水軍の働き |
| [桶狭間の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/okehazama/) | 永禄3年（1560） | 愛知県名古屋市緑区・豊明市 | 当時の入り江（鳴海潟）に近い大高城・鳴海城と砦の配置、熱田からの進軍路、義元の本陣への突入 |
| [川中島の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/kawanakajima/) | 永禄4年（1561）ほか | 長野県長野市 | 千曲川と犀川にはさまれた川中島、妻女山と海津城のにらみ合い、霧の八幡原、別働隊の到着 |
| [姉川の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/anegawa/) | 元亀元年（1570） | 滋賀県長浜市 | 小谷城と横山城の位置関係、姉川の河原での激突、横山丘陵の信長本陣 |
| [諏訪原城の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/suwahara/) | 天正3年（1575） | 静岡県島田市 | 牧之原台地の北端の城、丸馬出と三日月堀、大井川と東海道 |
| [長篠の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/nagashino/) | 天正3年（1575） | 愛知県新城市 | 長篠城の包囲、連吾川と馬防柵の線、鳶ヶ巣山砦への奇襲、武田軍の突撃と崩壊 |
| [山崎の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/yamazaki/) | 天正10年（1582） | 京都府大山崎町・長岡京市 | 天王山と淀川にはさまれた隘路、円明寺川をはさんだ布陣、勝龍寺城への敗走 |
| [上田合戦](https://k-ito-schoolagent.github.io/sengoku-3d/ueda/) | 天正13年（1585）・慶長5年（1600） | 長野県上田市 | 神川と城下町を使った真田昌幸の迎え撃ち、丸子表の対陣、関ヶ原へ急ぐ秀忠の足止め |
| [関ヶ原の戦い](https://k-ito-schoolagent.github.io/sengoku-3d/sekigahara/) | 慶長5年（1600） | 岐阜県関ケ原町 | 陣跡の実座標にもとづく布陣、霧の開戦、小早川の寝返り、島津の退き口 |

「この合戦も入れてほしい」は [issue](https://github.com/k-ito-schoolagent/sengoku-3d/issues/new/choose) でリクエストしてください。

## 遊び方

- 場面ボタン（序・一・二…・結）で行き来する。▶ で自動再生
- 左ドラッグで視点を回す、右ドラッグ（スマホは2本指）で見る場所を動かす、ホイール・ピンチでカーソルの場所へ拡大縮小、ダブルクリックで視点を戻す
- キー操作：Space 再生／停止、← → 場面移動、Shift＋矢印 見る場所を動かす、H 説明の表示・非表示、S 諸説ノート

授業ではプロジェクターに映して、場面ごとに止めながら「なぜこの位置なのか」を地形から考えるのがおすすめです。

## 参加のしかた（くわしくは [CONTRIBUTING.md](CONTRIBUTING.md)）

| やること | 方法 |
|---|---|
| 話してみる | [issue](https://github.com/k-ito-schoolagent/sengoku-3d/issues/new/choose) に「この合戦を入れてほしい」「ここは別の説がある」「表示がおかしい」を書く |
| 諸説を足す | 合戦ページの「諸説」→「諸説を追記する」から、ブラウザだけでプルリクエストを送れる |
| 合戦をつくる | `_template/` をコピーして、場所の緯度経度と場面の文章を書く |
| GitHub の練習 | 「練習：はじめての issue」を書く、[CONTRIBUTORS.md](CONTRIBUTORS.md) に名前を足すプルリクエストを送る |

## しくみ

```
lib/sengoku.js      共通エンジン（実地形・樹木・足軽と騎馬武者・矢印・場面送り・カメラ・諸説ノート）
lib/sengoku.css     合戦ページの共通スタイル
<合戦>/index.html   すべての合戦で共通のページ（コピーして使う）
<合戦>/scene.js     場面の文章・カメラ・陣営・軍勢の位置と道順・城など
<合戦>/setsu.md     諸説ノート（みんなで追記する Markdown）
<合戦>/battle.json  一覧に出る紹介文と、地形データを作る設定
<合戦>/geo/         地形データ（_geo/build.py が作る）
_geo/build.py       地形データを作るスクリプト
_template/          新しい合戦の雛形
battles.json        一覧ページに出す合戦のリスト（トップの日本地図の印も battle.json の緯度経度から自動で置かれる）
lib/japan-map.json  トップの日本地図の輪郭（_geo/japan_map.py が作る）
```

### 使っている技術

- [three.js](https://threejs.org/) r128（CDN から読み込み。ビルド不要の静的サイト）
- Python 3 + numpy + Pillow + requests（地形データの作成）
- GitHub Pages（公開）

### 使っているデータ

| データ | 何に使うか |
|---|---|
| [国土地理院 標高タイル](https://maps.gsi.go.jp/development/demtile.html)（`dem5a_png` 5m メッシュ、欠けは `dem_png` 10m メッシュで補う） | 地形の起伏、陰影、林・田畑・原野の塗り分け |
| [OpenStreetMap](https://www.openstreetmap.org/)（[Overpass API](https://overpass-api.de/)） | 川・水面の位置 |
| 標高タイルにデータがない範囲 | 海に面した合戦（厳島など）では、これを海面として描く。近代の埋立地は `battle.json` で多角形を指定して当時の海に戻す |
| 地理院地図・OpenStreetMap | 陣跡・城跡・宿場・一里塚などの緯度経度 |

縮尺は 1単位 = 30m で、高さは見やすさのため 1.8〜2 倍に強調しています。地表の色は標高と傾斜から当時のようすを想定して作ったもので、現代の土地利用ではありません（新幹線や高速道路が写り込む航空写真は使っていません）。旧街道は、史跡の位置をつないだ概略の線です。

### ローカルで動かす

```bash
git clone https://github.com/k-ito-schoolagent/sengoku-3d.git
cd sengoku-3d
python3 -m http.server 8000
# → http://localhost:8000
```

地形データを作り直すとき：

```bash
pip install numpy pillow requests
python3 _geo/build.py            # すべての合戦
python3 _geo/build.py sekigahara # 1つだけ
```

## 注意

軍勢の数・配置・進路は、通説にもとづいて流れを理解するための**概念的な再現**です。人・旗・城は実際よりずっと大きく描いています。細部に諸説があるところは「諸説」ボタンから読めます。

## ライセンスと出典

- プログラム：[MIT License](LICENSE)
- 文章（場面の解説・諸説ノート・紹介文）：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ja)
- 地形：国土地理院 標高タイルを加工して作成
- 水系：© OpenStreetMap contributors（ODbL）
- トップの日本地図：Natural Earth（パブリックドメイン。world-atlas 経由）

くわしくは [LICENSE-CONTENT.md](LICENSE-CONTENT.md) を読んでください。参加する人は [行動規範](CODE_OF_CONDUCT.md) を守ってください。
