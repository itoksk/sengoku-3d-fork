# ライセンスと出典のまとめ

このリポジトリには「プログラム」「文章」「地形・地図データ」が入っていて、それぞれ扱いが違います。

| 何が | どのファイル | ライセンス・条件 |
|---|---|---|
| プログラム | `lib/`、各合戦の `scene.js`・`index.html`、`_geo/build.py`、トップの `index.html` | [MIT License](LICENSE) |
| 文章（場面の解説・諸説ノート・合戦の紹介文・ドキュメント） | `scene.js` の `PH` の文章、`setsu.md`、`battle.json` の紹介文、`*.md` | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.ja)（表示・継承） |
| 地形データ | 各合戦の `geo/terrain.bin`・`geo/relief.jpg`・`geo/cover.png` | 国土地理院 標高タイルを加工して作成（[国土地理院コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html)）。水系・水面の描画に © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors（ODbL）のデータを使用 |
| 日本地図の輪郭 | `lib/japan-map.json` | Natural Earth（パブリックドメイン）。world-atlas（ISC）の TopoJSON から作成 |
| 外部ライブラリ | three.js（CDN から読み込み） | MIT License |
| フォント | Shippori Mincho、Noto Sans JP（Google Fonts から読み込み） | SIL Open Font License |

## 文章が CC BY-SA 4.0 である理由

諸説ノートは Wikipedia のように、たくさんの人が書き足していく文章です。CC BY-SA 4.0 なら、学校の授業資料などに自由に使えて、書き足した人の名前（クレジット）も残り、改変したものも同じ条件で共有されます。

## 使うときにしてほしいこと

- このデモを授業や資料で使うときは、「戦国合戦 3D俯瞰デモ（sengoku-3d contributors）」と、地形・地図の出典（国土地理院・OpenStreetMap）を添えてください。画面下の出典表示を消さないでください
- 諸説ノートの文章を引用するときは、元の出典（書名など）も一緒に示してください

## 投稿（プルリクエスト）のライセンス

プルリクエストを送った時点で、プログラムの部分は MIT License、文章の部分は CC BY-SA 4.0 で公開することに同意したものとします。書籍や論文の文章をそのまま長く写すことはせず、自分の言葉で要約して出典を示してください（引用は必要な範囲の短いものに限ります）。
