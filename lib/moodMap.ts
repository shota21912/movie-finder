// このサイトの目玉機能「気分から映画を探す」の中身は、実はとてもシンプル。
// TMDbには「気分」で検索する機能は無いので、「泣きたい→ドラマジャンル」のように
// 自分たちで気分とジャンルの対応表(このファイル)を作り、選ばれた気分をジャンルIDに変換してから
// lib/tmdb.tsのdiscoverMovies()に渡す、という仕組みになっている。
// 新しい気分を増やしたい時は、この配列に1項目追加するだけでよい。

// 1つの気分ボタンを表す型。
export interface MoodOption {
  key: string; // URLの?mood=xxxに使う内部的な識別子(英語)
  label: string; // 画面に表示する日本語ラベル
  emoji: string; // ボタンに添える絵文字
  genreIds: number[]; // この気分に対応するTMDbジャンルID(複数指定するとOR条件になる)
  sortBy?: string; // 指定すると検索結果の並び順を変える(例: 評価が高い順にしたい気分など)
}

// 気分 → TMDbジャンルIDの対応表。
// ジャンルID一覧: https://developer.themoviedb.org/reference/genre-movie-list
// (例: 18=ドラマ, 35=コメディ, 27=ホラー, 10749=恋愛, 28=アクション, 12=アドベンチャー,
//      9648=ミステリー, 53=サスペンス, 10751=ファミリー, 16=アニメ)
export const MOOD_OPTIONS: MoodOption[] = [
  { key: "cry", label: "泣きたい", emoji: "😢", genreIds: [18], sortBy: "vote_average.desc" }, // ドラマ
  { key: "laugh", label: "笑いたい", emoji: "😂", genreIds: [35] }, // コメディ
  { key: "scary", label: "怖い映画が見たい", emoji: "😱", genreIds: [27] }, // ホラー
  { key: "romance", label: "恋愛映画が見たい", emoji: "❤️", genreIds: [10749] }, // 恋愛
  { key: "thrill", label: "スカッとしたい", emoji: "🔥", genreIds: [28, 12] }, // アクション・アドベンチャー
  { key: "think", label: "頭を使いたい", emoji: "🧠", genreIds: [9648, 53] }, // ミステリー・サスペンス
  { key: "heal", label: "癒されたい", emoji: "😌", genreIds: [10751, 16] }, // ファミリー・アニメ
  { key: "shock", label: "衝撃的な映画が見たい", emoji: "🤯", genreIds: [53, 27], sortBy: "vote_average.desc" }, // サスペンス・ホラー
];

// URLの?mood=xxxパラメータ(key)から、対応するMoodOptionを1件探す関数。
// 見つからなければ(不正なmood値が渡された場合など) undefined を返す。
// Array.prototype.find() は配列の中から条件に合う最初の1件を返す標準のJS関数。
export function getMoodOption(key: string): MoodOption | undefined {
  return MOOD_OPTIONS.find((m) => m.key === key);
}
