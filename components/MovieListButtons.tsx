"use client";

import { useMovieList } from "@/hooks/useMovieList";
import type { MovieSummary } from "@/types/tmdb";

// 映画詳細ページに置く「後で見るに追加」「観た映画にする」の2つのボタン。
// クリックするとその場でlocalStorageの中身が更新される(ページ遷移なし)ので、
// useState/onClickを使うクライアントコンポーネントとして作る必要がある。
export default function MovieListButtons({ movie }: { movie: MovieSummary }) {
  // 「後で見る」リストと「観た映画」リストは別々のuseMovieList呼び出しで管理する。
  // お互い独立していて、両方に同時に入れることもできる(あえて排他制御はしていない)。
  const watchlist = useMovieList("watchlist");
  const watched = useMovieList("watched");

  // localStorageの読み込みが終わるまでは、まだ正しい状態(入っている/いない)が分からないので、
  // ボタンを表示しない。ここで何か表示してしまうと、一瞬「未追加」の見た目が出た直後に
  // 「追加済み」に切り替わる、といったチラつきが起きてしまう。
  if (!watchlist.loaded || !watched.loaded) {
    return null;
  }

  const inWatchlist = watchlist.has(movie.id);
  const isWatched = watched.has(movie.id);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() =>
          inWatchlist ? watchlist.remove(movie.id) : watchlist.add(movie.id)
        }
        className={
          inWatchlist
            ? "rounded-full bg-black px-4 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            : "rounded-full border border-black/20 px-4 py-1.5 text-sm hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
        }
      >
        {inWatchlist ? "🔖 後で見るに追加済み" : "🔖 後で見る"}
      </button>
      <button
        type="button"
        onClick={() => (isWatched ? watched.remove(movie.id) : watched.add(movie.id))}
        className={
          isWatched
            ? "rounded-full bg-black px-4 py-1.5 text-sm text-white dark:bg-white dark:text-black"
            : "rounded-full border border-black/20 px-4 py-1.5 text-sm hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
        }
      >
        {isWatched ? "✅ 観た映画に追加済み" : "✅ 観た映画にする"}
      </button>
    </div>
  );
}
