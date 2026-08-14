# Movie Finder 🎬

タイトル・俳優・ジャンルはもちろん、「今日の気分」や「契約しているサブスク」からも見たい映画を探せる映画情報サイトです。

## 主な機能

- 🎬 人気映画一覧
- 🔍 映画タイトル / 俳優名での検索
- 🎞️ ジャンルからの検索
- 😊 気分（泣きたい・笑いたい・怖い映画が見たい…）から映画を探す
- 📺 Netflix / Amazon Prime Video などサブスクごとに視聴可能な映画を検索
- 🎭 映画詳細ページ（あらすじ・キャスト・評価・配信状況）
- 🧑 俳優詳細ページ（プロフィール・出演作品）

## 技術スタック

- [Next.js](https://nextjs.org)（App Router）
- TypeScript
- Tailwind CSS
- データソース: [TMDb API](https://www.themoviedb.org/documentation/api)

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
app/            各ページ（トップ・検索・気分・サブスク・ジャンル・映画詳細・俳優詳細）
components/     UIコンポーネント（MovieCard, MovieGrid, SearchBar, Paginationなど）
lib/            TMDb APIクライアント (tmdb.ts) と気分→ジャンル対応表 (moodMap.ts)
types/          TMDbレスポンスの型定義
```

## クレジット

This product uses the TMDB API but is not endorsed or certified by TMDB.
