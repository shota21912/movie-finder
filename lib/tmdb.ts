import type {
  Genre,
  MovieDetail,
  MovieSummary,
  PaginatedResponse,
  PersonDetail,
  PersonMovieCredit,
  PersonSummary,
  ProviderListItem,
  Review,
} from "@/types/tmdb";

// このファイルは「TMDb (The Movie Database) API を呼び出す処理」を1箇所にまとめたもの。
// ページ側(app/以下)は直接fetchせず、必ずこのファイルの関数を経由してデータを取得する。
// こうしておくと、TMDbの呼び方が変わってもここだけ直せばよくなる。

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
// TMDbには「日本で今契約できる動画配信サービス」を調べるための地域コードが必要。
// 日本のサービス(Netflix, U-NEXTなど)を対象にしたいのでJPで固定している。
const WATCH_REGION = "JP";

// TMDbのAPIキーを環境変数から取り出す関数。
// process.env.TMDB_API_KEY は .env.local に書いた TMDB_API_KEY=xxxx の値が入る。
// もし設定されていなければ、原因が分かるようにエラーメッセージを出して処理を止める。
function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY が設定されていません。.env.local.example を参考に .env.local を作成してください。"
    );
  }
  return key;
}

// TMDbへのリクエストをまとめて行う共通関数。
// <T> は「呼び出し側が指定した型でレスポンスを受け取れるようにする」ためのジェネリクス。
// 例えば tmdbFetch<Genre[]>(...) と書けば、戻り値の型がGenre[]になる。
//
// 重要: この関数はNext.jsの「Server Component」からしか呼ばれない前提で作っている。
// Server Componentはブラウザではなくサーバー側で実行されるコードなので、
// ここでAPIキーをURLに埋め込んでも、ブラウザの開発者ツールなどでは見えない。
// もしクライアント側(ブラウザで動くコード)からこの関数を呼んでしまうと、
// APIキーが漏れてしまうので絶対にやってはいけない。
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 3600
): Promise<T> {
  // URLオブジェクトを使うと、クエリパラメータ(?key=value&...)を安全に組み立てられる
  // (日本語や記号を自動でURLエンコードしてくれる)。
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());
  // language=ja-JPを指定すると、タイトルやあらすじなどを日本語で返してもらえる。
  url.searchParams.set("language", "ja-JP");

  // paramsオブジェクトの中身を1つずつURLのクエリパラメータとして追加していく。
  // 値がundefinedや空文字のものは「指定しない」という意味なのでスキップする。
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  // fetchのnext.revalidateはNext.js独自のキャッシュ機能。
  // 「このリクエスト結果をrevalidateSeconds秒間キャッシュして使い回す」という意味。
  // 例えばジャンル一覧のようにほとんど変わらないデータは86400秒(=24時間)キャッシュし、
  // TMDbへのリクエスト回数を減らしている。
  const res = await fetch(url.toString(), {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    // res.okはHTTPステータスが200番台以外(エラー)のときfalseになる。
    // ここでエラーを投げると、呼び出し元のページはNext.jsのerror.tsx(エラー画面)に
    // 自動的に切り替わる仕組みになっている。
    throw new Error(`TMDb APIエラー: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

// TMDbのポスター画像・プロフィール画像などのURLを組み立てるヘルパー関数。
// TMDbは画像そのものではなく「画像のファイル名(path)」だけをAPIレスポンスで返してくるので、
// 表示するときはこの関数で完全なURLに変換してあげる必要がある。
// sizeは画像の解像度(w200=幅200px, w500=幅500px, original=元サイズ)。
// 一覧表示のような小さいサムネイルはw200、詳細ページのメイン画像はw500、というように
// 用途に応じて使い分けることで、無駄に大きい画像を読み込まずに済む。
export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w200" | "w342" | "w500" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ジャンル一覧(アクション、コメディ、ホラー…)を取得する。
// トップページのジャンル一覧や、映画一覧でジャンルIDを名前に変換するのに使う。
// ジャンルはめったに追加・変更されないので、24時間(86400秒)キャッシュしている。
export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(
    "/genre/movie/list",
    {},
    86400
  );
  return data.genres;
}

// 「日本で使える動画配信サービス一覧」を取得する(Netflix, U-NEXTなど)。
// トップページのサブスクボタンを作るのに使っている。
export async function getWatchProviders(): Promise<ProviderListItem[]> {
  const data = await tmdbFetch<{ results: ProviderListItem[] }>(
    "/watch/providers/movie",
    { watch_region: WATCH_REGION },
    86400
  );
  return data.results;
}

// 今人気の映画一覧を取得する(トップページに表示している)。
// pageは何ページ目を取得するか(TMDbは1ページ20件ずつ返す仕様)。
export async function getPopularMovies(
  page = 1
): Promise<PaginatedResponse<MovieSummary>> {
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/movie/popular", {
    page,
    region: WATCH_REGION,
  });
}

// 映画タイトルでキーワード検索する。
export async function searchMovies(
  query: string,
  page = 1
): Promise<PaginatedResponse<MovieSummary>> {
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/search/movie", {
    query,
    page,
  });
}

// 俳優名でキーワード検索する。
export async function searchPeople(
  query: string,
  page = 1
): Promise<PaginatedResponse<PersonSummary>> {
  return tmdbFetch<PaginatedResponse<PersonSummary>>("/search/person", {
    query,
    page,
  });
}

// discoverMovies関数に渡す検索条件をまとめた型。
// TMDbのdiscover APIは「ジャンルで絞り込む」「配信サービスで絞り込む」「公開年で絞り込む」など
// 複数の条件を組み合わせて映画を検索できる、このサイトで一番よく使う汎用検索機能。
export interface DiscoverMovieParams {
  page?: number;
  withGenres?: string; // カンマ区切りのジャンルID (例: "27,18" = ホラー かつ/または ドラマ)
  withKeywords?: string; // カンマ区切りのキーワードID
  withWatchProviders?: string; // カンマ区切りの配信サービスID (例: "8" = Netflix)
  primaryReleaseDateGte?: string; // この日付以降に公開された映画に絞る (YYYY-MM-DD形式)
  withRuntimeLte?: number; // 上映時間がこの分数以下の映画に絞る
  sortBy?: string; // 並び順 (例: "popularity.desc" = 人気順、"vote_average.desc" = 評価が高い順)
}

// ジャンル検索・気分検索・サブスク検索など、条件を組み合わせた映画検索はすべてこの関数を使う。
// TMDbのクエリパラメータ名(with_genres など)はキャメルケースではなくスネークケース＋ドットなので、
// ここで呼び出しやすい名前(withGenresなど)から変換している。
export async function discoverMovies(
  params: DiscoverMovieParams
): Promise<PaginatedResponse<MovieSummary>> {
  const sortBy = params.sortBy ?? "popularity.desc";
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/discover/movie", {
    page: params.page ?? 1,
    with_genres: params.withGenres,
    with_keywords: params.withKeywords,
    with_watch_providers: params.withWatchProviders,
    // 配信サービスで絞り込むときだけ地域(watch_region)を指定する。
    // 指定しないと「世界中のどこかで配信されている」扱いになってしまい、
    // 日本で見られない作品まで混ざってしまう。
    watch_region: params.withWatchProviders ? WATCH_REGION : undefined,
    "primary_release_date.gte": params.primaryReleaseDateGte,
    "with_runtime.lte": params.withRuntimeLte,
    sort_by: sortBy,
    // 「口コミ評価が高い順」で並べる時、投票数が少ない作品(例: 1人だけが10点を付けた作品)が
    // 統計的にたまたま上位に来てしまうことがある。それを防ぐため、評価順ソートの時だけ
    // 「最低100票以上入っている作品」という下限を設ける(TMDb公式でも推奨されているやり方)。
    "vote_count.gte": sortBy.startsWith("vote_average") ? 100 : undefined,
  });
}

// 映画1本の詳細情報をまとめて取得する。
// append_to_response を使うと、本来は別々のAPIリクエストが必要な
// 「キャスト情報」「配信サービス情報」「予告編動画」「関連映画」を1回のリクエストで
// まとめて取得できる(TMDb APIの便利機能)。リクエスト回数を減らせるので基本的にはこれを使う。
export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,watch/providers,videos,recommendations",
    // 予告編動画(videos)は、language=ja-JPのままだと「日本語の動画」しか対象にならず
    // ほとんどの映画で0件になってしまう。include_video_languageで日本語+英語の動画も
    // 対象に含めるよう明示的に指定している。
    include_video_language: "ja,en",
  });
}

// 映画の口コミ(レビュー)一覧を取得する。
// append_to_responseで一緒に取得しないのは、reviewsだけ特別な事情があるため:
// TMDbのreviewsは投稿者の言語に関わらず保存されているが、language=ja-JPを指定すると
// なぜか日本語以外のレビューが除外されてしまい、日本語レビューはほぼ存在しないので
// 結果的にいつも0件になってしまう。そのため、この関数だけ別リクエストにして
// language=en-USを明示的に指定し、英語レビューを取得できるようにしている。
export async function getMovieReviews(
  id: number
): Promise<PaginatedResponse<Review>> {
  return tmdbFetch<PaginatedResponse<Review>>(`/movie/${id}/reviews`, {
    language: "en-US",
  });
}

// 俳優のプロフィール(生年月日、経歴など)を取得する。
export async function getPersonDetail(id: number): Promise<PersonDetail> {
  return tmdbFetch<PersonDetail>(`/person/${id}`);
}

// ある俳優が出演した映画の一覧を取得する。俳優詳細ページの「出演作品」欄に使う。
export async function getPersonMovieCredits(
  id: number
): Promise<{ cast: PersonMovieCredit[] }> {
  return tmdbFetch<{ cast: PersonMovieCredit[] }>(
    `/person/${id}/movie_credits`
  );
}
