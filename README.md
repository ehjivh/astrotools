# AstroTools (Japanese/Refined Edition)

JavaScriptで動作する天文計算・表示ツール集の日本語版です。
太陽・月・惑星・彗星・恒星などの位置計算と可視性判定をブラウザ上で実行できます。

このリポジトリは、Ole Nielsen さんの **JavaScript AstroTools** をベースに、
日本語化・構成整理・技術モダン化を加えた派生プロジェクトです。

## プロジェクト概要

**AstroTools** は、天文学者・愛好家向けの包括的な天体計算ツールです。
複数の独立したツールから構成され、グラフィカルおよびテキスト形式で計算結果を表示します。

### 主要なツール

1. **天体暦ツール（Ephemeris Tool）**
   - 太陽・月・惑星・彗星・恒星の位置と可視性を計算
   - 日別イベント：出没時刻、南中、薄明情報
   - 天体データ：距離、視直径、光度、等級
   - 位置情報：赤経赤緯、黄道座標、天体間角距離
   - 高度・方位の時間推移をグラフ表示
   - 観測条件下で可見な恒星・深宇宙天体の一覧表示

2. **イベントツール（Event Tool）**
   - 太陽・月・惑星のイベント検索（合、衝、最大離角など）
   - 日付範囲指定でのイベント一括検出

3. **木星衛星シミュレータ（Jupiter Satellite Tool）**
   - ガリレオ衛星（Io、Europa、Ganymede、Callisto）の位置計算
   - 木星ディスク上の衛星配置をリアルタイムで視覚化
   - 衛星のイベント計算（トランジット、シャドウなど）

4. **木星クイックビュー（Jupiter Now - Mobile）**
   - スマートフォン向けシンプルインターフェース
   - 現在の木星と衛星の見え方をリアルタイム表示

## 技術仕様

### 計算アルゴリズム

- **太陽・月位置計算：** Schlyter のアルゴリズムに基づく
- **惑星位置計算：** 高速計算に最適化された近似アルゴリズム
- **位置精度：** 概ね数分角レベル（観測計画には高精度暦との照合を推奨）
- **時間体系：** グレゴリオ暦 / ユリウス日 / タイムゾーン対応

### 技術スタック

- **言語：** JavaScript (ES6 モダン化済)
- **マークアップ：** HTML5
- **スタイル：** CSS3（レスポンシブ対応）
- **データ永続化：** ブラウザ Cookie（設定の保存）
- **グラフ化：** キャンバスベース描画

### 対応ブラウザ

- Chromium 系（Chrome, Edge）
- Firefox
- Safari
- その他の ES6 対応モダンブラウザ

## プロジェクト構成

```
astrotools/
├── assets/
│   └── css/
│       └── calc.css           # メインスタイルシート
├── src/
│   └── js/                    # JavaScript モジュール
│       ├── comet.js           # 彗星計算
│       ├── datetime.js        # 日時処理
│       ├── eventhandlers.js   # UI イベントハンドラ
│       ├── events.js          # イベント検索
│       ├── handlers.js        # 汎用ハンドラ
│       ├── jupdraw.js         # 木星衛星描画
│       ├── juphandlers.js     # 木星ツール専用ハンドラ
│       ├── jupiter.js         # ガリレオ衛星計算
│       ├── makeevent.js       # イベント出力生成
│       ├── makelist.js        # コンテンツリスト生成
│       ├── makepage.js        # ページコンテンツ生成
│       ├── math.js            # 数学ユーティリティ
│       ├── observer.js        # 地点観測者データ
│       ├── planets.js         # 惑星計算
│       ├── stars.js           # 恒星カタログ・計算
│       ├── sunmoon.js         # 太陽・月計算
│       ├── util.js            # 一般ユーティリティ
│       └── entries/           # エントリーポイント
│           ├── ephemtool-entry.js
│           ├── eventtool-entry.js
│           ├── juptool-entry.js
│           └── legacy-loader.js
├── astrotools.html            # メインリダイレクト
├── astrotools2.html           # ツール選択ページ
├── ephemtool.html             # 天体暦ツール
├── eventtool.html             # イベントツール
├── juptool.html               # 木星衛星ツール
├── jupnow.html                # 木星クイックビュー
├── counter.html               # 補助ツール
├── toolsmanual.html           # ユーザーマニュアル（日本語）
├── eventmanual.html           # イベントツール説明
├── history.html               # 更新履歴
├── glossary.html              # 用語集
└── README.md                  # このファイル
```

## インストール・使用方法

### オンライン使用

GitHubのこのリポジトリから直接アクセス可能です。

### ローカル実行

1. リポジトリをクローン：
   ```bash
   git clone https://github.com/ehjivh/astrotools.git
   cd astrotools
   ```

2. ローカルサーバーで起動（例：PHP）：
   ```bash
   php -S localhost:8000
   ```

3. ブラウザで開く：
   ```
   http://localhost:8000/astrotools2.html
   ```

## 主な改良内容（Version 4.0）

元のプロジェクト（Version 3.4）からの改良：

- **日本語化：** UI文言・ドキュメント・メニュー完全日本語化
- **HTML5 モダン化：** レガシーマークアップを削除、標準化
- **ファイル構成整理：** assets/ と src/ に体系的に再編成
- **既定観測地変更：** みさと天文台（日本）を既定値に
- **ES6 化：** var→let、古い記法の現代化
- **モジュール化：** スクリプト分割、エントリーポイント作成
- **機能拡張：** 太陽・月の詳細計算、日本語マニュアル追加
- **検索機能：** BM25アルゴリズム導入
- **スタイル改善：** CSSレスポンシブ対応、アクセシビリティ向上
- **日本の観測地データ：** 複数地点の初期登録

## Original Project / Attribution

本プロジェクトは以下のオリジナル作品を改良したものです。

- Original author: **Ole Nielsen**
- Original project: **JavaScript AstroTools**

また、コードの一部には Peter Hayes さん由来の要素が含まれる旨が、
元プロジェクト内の著作権表示に記載されています。


## ライセンス

本リポジトリは **GNU General Public License v2.0**（GPL-2.0）で公開します。

- ライセンス本文：[LICENSE](LICENSE)
- 参考ファイル：[gpl.txt](gpl.txt)

元プロジェクトに含まれる著作権表示・ライセンス条件を尊重し、
本改良版も同ライセンス体系で公開しています。

詳細は [NOTICE.md](NOTICE.md) / [AUTHORS.md](AUTHORS.md) を参照してください。

## 精度と免責事項

### 計算精度に関する注記

- このツールは **高速表示を重視** した実装のため、位置精度は概ね **数分角レベル**です
- 恒星・深宇宙天体の表示については、高度制限設定があります
- 惑星の細かなイベント判定には、専門の天文暦（例：NASA ホライズンズ）との照合を推奨します

### 免責事項

1. **非公式プロジェクト**  
   このリポジトリは Ole Nielsen さんご本人・オリジナルサイト運営との公式な提携ではありません。

2. **精度保証なし**  
   計算結果は参考値であり、気象・観測計画・学術目的での使用には個別の精度検証が必要です。

3. **ご利用は自己責任で**  
   本ツール使用による損害等について、著作権者・改良者は責任を負いません。

## クレジット・謝辞

- **Ole Nielsen** — AstroTools 原作者、アルゴリズム設計
- **Peter Hayes** — 元コード一部由来の貢献
- **日本語化・改良チーム** — このリポジトリの改良版を実装

## 関連リンク

- [History / 更新履歴](history.html)
- [Glossary / 用語集](glossary.html)
- [Manual / ユーザーマニュアル](toolsmanual.html)
- [License / ライセンス](LICENSE)

---

**最終更新：** 2026年3月22日（Version 4.0）

