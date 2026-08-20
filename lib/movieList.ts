// このサイトはDB(データベース)を持たない構成なので、「観た映画」「後で見る」リストは
// サーバーではなく、ユーザーのブラウザの中(localStorage)に保存する。
// メリット: サーバー側の実装が不要でシンプル。デメリット: 他の端末・ブラウザとは同期されず、
// ブラウザのデータを消すと一緒に消えてしまう。個人学習用サイトとしては十分な割り切り。
//
// 保存するのは映画IDの配列だけ(タイトルやポスター画像などは保存しない)。
// TMDb APIの利用規約には「APIから取得したデータを6ヶ月を超えてキャッシュしてはいけない」という
// 制限があり、ブラウザのlocalStorageは(ユーザーが消さない限り)無期限に残ってしまうため、
// タイトル・ポスター・あらすじなどのTMDb由来のデータをそのまま長期保存するのは規約違反になりうる。
// そこで、識別子であるID番号だけを保存しておき、一覧画面を表示する瞬間に毎回
// 最新のデータをTMDbから取り直す(app/api/movies/route.ts経由)ことで、この制限を守っている。

// 2種類のリストを扱えるようにしている。
// "watchlist" = 後で見る、 "watched" = 観た映画。
export type MovieListKind = "watchlist" | "watched";

// localStorageは1つの巨大な「キー→文字列」の入れ物なので、
// 2つのリストを混同しないように別々のキー名を用意する。
const STORAGE_KEYS: Record<MovieListKind, string> = {
  watchlist: "movie-finder:watchlist",
  watched: "movie-finder:watched",
};

// localStorageから指定したリストの映画ID配列を読み込む。
// typeof window === "undefined" のチェックが必要な理由:
// Next.jsのコードは(クライアントコンポーネントでも)最初にサーバー側で一度実行されるため、
// その時点では"window"や"localStorage"というブラウザ専用のオブジェクトが存在せず、
// アクセスするとエラーになってしまう。ブラウザで実行されている時だけ処理を進めるためのガード。
export function loadMovieList(kind: MovieListKind): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[kind]);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    // 万が一保存されている中身が壊れたJSONだった場合も、サイトが落ちないように空配列を返す
    return [];
  }
}

// 指定したリストの映画ID配列をまるごとlocalStorageに保存し直す。
export function saveMovieList(kind: MovieListKind, ids: number[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS[kind], JSON.stringify(ids));
}
