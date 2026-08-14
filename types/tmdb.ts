// このファイルはTMDb APIが返してくるJSONの「形」をTypeScriptの型として定義したもの。
// TMDbから受け取るデータのプロパティ名は、TMDb側の仕様(スネークケース)に合わせている。
// こうして型を用意しておくと、コード補完が効いたり、
// 存在しないプロパティを使おうとした時にエディタが教えてくれたりして便利。

// 映画のジャンル1件分(例: { id: 27, name: "ホラー" })。
export interface Genre {
  id: number;
  name: string;
}

// 映画一覧・検索結果などで使う「映画の簡易情報」。
// 詳細ページではなく一覧表示に必要な最低限の項目だけが入っている。
export interface MovieSummary {
  id: number;
  title: string;
  poster_path: string | null; // ポスター画像のファイル名。nullなら画像なし
  release_date: string; // "2024-05-01" のような文字列
  genre_ids: number[]; // ジャンルのID一覧。名前はGenre[]と突き合わせて調べる必要がある
  vote_average: number; // 平均評価(10点満点)
  overview: string; // あらすじ
}

// 映画の出演者1人分(俳優名と役名のセット)。
export interface CastMember {
  id: number;
  name: string; // 俳優の実名
  character: string; // 劇中での役名
  profile_path: string | null;
}

// 1つの配信サービス(Netflixなど)の情報。
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// ある地域(例: 日本)における「この映画がどこで見られるか」の情報。
// flatrate = 見放題で視聴できるサービス、rent = レンタル、buy = 購入、で分かれている。
// このサイトでは主にflatrate(見放題)だけを使っている。
export interface WatchProviderRegion {
  link?: string; // TMDb(JustWatch)上のこの映画の視聴ページへのリンク
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

// 予告編などの動画情報(基本的にYouTubeへのリンク)。
export interface Video {
  id: string;
  key: string; // YouTubeの動画ID。https://www.youtube.com/embed/{key} で埋め込める
  name: string;
  site: string; // "YouTube" | "Vimeo" など、どの動画サイトの動画か
  type: string; // "Trailer"(本予告) | "Teaser"(ティザー) | "Clip"(場面映像) など
  official: boolean; // 公式配信の動画かどうか
  published_at: string;
}

// 口コミ(レビュー)1件分。
export interface Review {
  id: string;
  author: string; // 投稿者の表示名
  author_details: {
    name: string;
    username: string;
    rating: number | null; // 投稿者がつけた点数(10点満点、未評価ならnull)
  };
  content: string; // レビュー本文(TMDbのレビューはほぼ英語)
  created_at: string;
  url: string;
}

// 映画詳細ページで使う「映画の全部入り情報」。
// MovieSummaryを継承(extends)しているので、id・title・overviewなどはそのまま使える上に、
// 詳細ページだけで必要な項目(上映時間・キャスト・配信状況など)が追加されている。
//
// credits・"watch/providers"・videos・recommendations は、それぞれの末尾に ? が付いている
// (オプショナルプロパティ)。これはlib/tmdb.tsのgetMovieDetail()で
// append_to_response=credits,watch/providers,videos,recommendations と指定した時だけ
// レスポンスに含まれる、「おまけで付いてくる情報」だから。指定を忘れるとundefinedになる。
export interface MovieDetail extends MovieSummary {
  runtime: number | null; // 上映時間(分)
  genres: Genre[]; // ジャンルの名前付きリスト(MovieSummaryのgenre_idsと違い、名前も入っている)
  credits?: { cast: CastMember[] }; // 出演者情報
  // TMDbのAPIレスポンスでは "watch/providers" というスラッシュ入りのキー名で返ってくるため、
  // 通常のプロパティ名(watchProvidersのような書き方)ではアクセスできない。
  // そのため ["watch/providers"] のようにブラケット記法でアクセスする必要がある。
  "watch/providers"?: { results: Record<string, WatchProviderRegion> };
  videos?: { results: Video[] }; // 予告編などの動画一覧
  recommendations?: { results: MovieSummary[] }; // 「この映画を観た人はこんな映画も」用のおすすめ
}

// 俳優一覧・検索結果で使う「俳優の簡易情報」。
export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string; // "Acting"(俳優業)など、主にどんな仕事をしている人か
}

// 俳優詳細ページで使う「俳優の全部入り情報」。
export interface PersonDetail extends PersonSummary {
  biography: string; // 経歴・紹介文
  birthday: string | null;
  place_of_birth: string | null;
}

// 「ある俳優の出演映画」を取得した時の1件分。
// MovieSummaryに「その映画で演じた役名(character)」が追加されたもの。
export interface PersonMovieCredit extends MovieSummary {
  character: string;
}

// TMDbの一覧系API(検索・discoverなど)は、結果を1ページ20件ずつに分けて返してくる。
// <T> の部分に MovieSummary や PersonSummary など「何の一覧か」を指定して使う。
// 例: PaginatedResponse<MovieSummary> なら「映画一覧のページ情報」を表す型になる。
export interface PaginatedResponse<T> {
  page: number; // 今何ページ目か
  results: T[]; // このページの中身
  total_pages: number; // 全部で何ページあるか(ページングのボタン表示に使う)
  total_results: number; // 全部で何件ヒットしたか
}

// 動画配信サービス一覧(/watch/providers/movie)で使う、サービス1件分の情報。
export interface ProviderListItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}
