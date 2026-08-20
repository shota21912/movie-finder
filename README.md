# Movie Finder 🎬

タイトル・俳優・ジャンルはもちろん、「今日の気分」「契約しているサブスク」「受賞歴」からも見たい映画を探せる映画情報サイトです。ランダムに1本を引く「映画ガチャ」もあります。

🔗 **公開URL**: https://movie-phi-taupe.vercel.app/

## 主な機能

- 🎬 人気映画一覧
- 🔍 映画タイトル / 俳優名での検索
- 🎞️ ジャンルからの検索（人気順・口コミ評価順・興行収入順で並び替え可）
- 😊 気分（泣きたい・笑いたい・怖い映画が見たい…）から映画を探す（ジャンル・上映時間・公開年・並び順の絞り込み付き）
- 📺 Netflix / Amazon Prime Video などサブスクごとに視聴可能な映画を検索（気分・ジャンル・並び順の絞り込み付き）
- 🎰 映画ガチャ（サブスク＋任意でジャンル/気分を選び、条件に合う映画をランダムに1本抽選）
- 🏆 受賞作品を探す（アカデミー賞・カンヌ・ベルリン・ヴェネツィア・BAFTA・日本アカデミー賞・トロント国際映画祭。部門別、受賞/ノミネート切り替え、年代絞り込み対応）
- 🎭 映画詳細ページ（あらすじ・予告編・キャスト・評価・配信状況・関連映画・口コミ）
- 💬 口コミの日本語訳（ボタン一つでページ内翻訳）
- 🔖 「後で見る」「観た映画」リスト（ブラウザに保存、マイリストページで一覧表示）
- 🧑 俳優詳細ページ（プロフィール・出演作品）

## 技術スタック

- [Next.js](https://nextjs.org)（App Router）
- TypeScript
- Tailwind CSS
- データソース:
  - [TMDb API](https://www.themoviedb.org/documentation/api) — 映画情報・配信サービス・口コミ・予告編など
  - [Wikidata](https://www.wikidata.org/) — 映画賞の受賞/ノミネートデータ（TMDbには無いため）

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. TMDb APIキーの取得

1. [TMDb](https://www.themoviedb.org/) でアカウントを作成
2. 設定 > API から「開発者」申請をしてAPIキー(v3 auth)を発行

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、取得したAPIキーを設定します。

```bash
cp .env.local.example .env.local
```

```
TMDB_API_KEY=取得したAPIキー
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開くと確認できます。

## ディレクトリ構成

```
app/            各ページ
  page.tsx              トップページ
  search/                タイトル・俳優検索
  genre/[id]/            ジャンル検索結果
  mood/                  気分から探す
  provider/[id]/         サブスクから探す
  gacha/                 映画ガチャ
  awards/                受賞作品を探す
  movie/[id]/            映画詳細
  person/[id]/           俳優詳細
  mylist/                後で見る/観た映画リスト
  api/translate/         口コミ翻訳用のAPI Route

components/     UIコンポーネント（MovieCard, MovieGrid, SearchBar, Pagination, ReviewCard, MovieListButtonsなど）
hooks/          「後で見る/観た映画」リスト用のReactフック (useMovieList.ts)
lib/            外部APIクライアントと各種対応表
  tmdb.ts               TMDb APIクライアント
  wikidata.ts           Wikidata(SPARQL)クライアント(受賞データ取得用)
  moodMap.ts            気分→ジャンルの対応表
  awards.ts             映画祭/部門の一覧(WikidataのQID)
  sortOptions.ts         並び替えの選択肢
  providers.ts           トップページ等に表示する主要サブスクの一覧
  movieList.ts            「後で見る/観た映画」のlocalStorage読み書き

types/          TMDbレスポンスの型定義
```

## クレジット

<img src="public/tmdb-logo.svg" alt="The Movie Database" width="120" />

This website uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.

配信サービス(視聴可能なサービス)のデータは [JustWatch](https://www.justwatch.com/) の提供によるものです。

受賞作品データの一部は [Wikidata](https://www.wikidata.org/) から取得しています。

上記のクレジット表記は、サイト本体のフッター(全ページ共通)にも同じ内容を掲載しています([components/Footer.tsx](components/Footer.tsx))。

## TMDB API利用規約への対応

- **アトリビューション**: 上記の通り、TMDBロゴ + 指定文言をサイト全ページのフッターに掲載
- **JustWatchのクレジット**: 配信サービスデータの提供元として明記
- **6ヶ月キャッシュ制限**: TMDbから取得したデータをlocalStorageに長期保存しない設計にしている。
  「後で見る/観た映画」リスト([lib/movieList.ts](lib/movieList.ts))は映画IDのみを保存し、
  タイトル・ポスターなどは表示のたびに [app/api/movies/route.ts](app/api/movies/route.ts) 経由で
  TMDbから毎回取得し直している(サーバー側のNext.jsキャッシュも1時間程度で、6ヶ月には遠く及ばない)
