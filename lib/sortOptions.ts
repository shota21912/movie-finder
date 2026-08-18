// ジャンル検索・サブスク検索・気分検索の各結果ページで共通して使う「並び替え」の選択肢。
// valueはTMDbのdiscover API(lib/tmdb.tsのdiscoverMovies)にそのまま渡すsort_by値。
//
// TMDbのタイトル検索(/search/movie)はこのsort_byパラメータに対応しておらず、
// 常に関連度順で返ってくる仕様のため、検索結果ページ(app/search)にはこの並び替えを
// 付けられない(TMDb側の制約なので回避策が無い)。
export interface SortOption {
  value: string;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "popularity.desc", label: "人気順" },
  { value: "vote_average.desc", label: "口コミ評価が高い順" },
  { value: "revenue.desc", label: "興行収入が高い順" },
];

export const DEFAULT_SORT = SORT_OPTIONS[0].value;
