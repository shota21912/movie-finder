export interface MoodOption {
  key: string;
  label: string;
  emoji: string;
  genreIds: number[]; // TMDbのジャンルID
  sortBy?: string;
}

// 気分 → TMDbジャンルIDの対応表。
// ジャンルID一覧: https://developer.themoviedb.org/reference/genre-movie-list
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

export function getMoodOption(key: string): MoodOption | undefined {
  return MOOD_OPTIONS.find((m) => m.key === key);
}
