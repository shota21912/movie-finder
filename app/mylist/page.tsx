"use client";

import { useEffect, useState } from "react";
import MovieGrid from "@/components/MovieGrid";
import { useMovieList } from "@/hooks/useMovieList";
import type { MovieSummary } from "@/types/tmdb";

// /mylist に対応するページ。「後で見る」「観た映画」の2リストを表示する。
//
// このファイルはファイル冒頭に "use client" が付いている、App Router内では珍しい
// 「クライアントコンポーネントのページ」。他のページ(app/page.tsxなど)はほぼ全て
// async関数のServer Component(サーバー側でTMDbからデータ取得する)だったが、
// このページが表示したいリストの中身(localStorageの映画ID)はブラウザにしか無いので、
// サーバー側では取得しようがなく、クライアントコンポーネントにする必要がある。
//
// 代わりに失うもの: サーバー側で表示内容を作れないので、SEO(検索エンジンがこのページの
// 中身を認識すること)には向かない。ただしこのページは個人のリスト表示なので問題にならない。

// useMovieListが返す「保存済みの映画ID配列」を受け取り、/api/movies経由で
// 実際にグリッド表示するためのタイトル・ポスターなどを取りに行くための補助フック。
// localStorageにはID以外を保存していない(lib/movieList.tsのコメント参照)ため、
// このページを開くたびに必ずこの取得処理が走る。
function useMovieSummaries(ids: number[], ready: boolean) {
  const [movies, setMovies] = useState<MovieSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // useMovieList側の読み込みがまだなら、何もせず待つ。
    if (!ready) return;

    if (ids.length === 0) {
      // このリストが0件だと確定した時点で即座に反映したいので、意図的に同期的にsetStateしている
      // (fetchで/api/moviesに問い合わせても結局0件が返ってくるだけの無駄なリクエストになるため)。
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 上のコメント参照
      setMovies([]);
      setLoading(false);
      return;
    }

    let cancelled = false; // ページを離れた後にsetStateしてしまう(意味の無い更新)のを防ぐフラグ
    setLoading(true);

    fetch(`/api/movies?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data: { movies: MovieSummary[] }) => {
        if (cancelled) return;
        // /api/moviesの返り値はids配列と同じ順番とは限らないので、
        // 「後で見る/観た映画に追加した順」を保つためにidsの順番へ並べ直す。
        const byId = new Map(data.movies.map((m) => [m.id, m]));
        const ordered = ids
          .map((id) => byId.get(id))
          .filter((m): m is MovieSummary => m !== undefined);
        setMovies(ordered);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  return { movies, loading };
}

export default function MyListPage() {
  const watchlist = useMovieList("watchlist");
  const watched = useMovieList("watched");
  const watchlistMovies = useMovieSummaries(watchlist.ids, watchlist.loaded);
  const watchedMovies = useMovieSummaries(watched.ids, watched.loaded);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-xl font-bold">🔖 後で見る</h1>
        {!watchlist.loaded || watchlistMovies.loading ? (
          <p className="text-zinc-500">読み込み中...</p>
        ) : watchlistMovies.movies.length === 0 ? (
          <p className="text-zinc-500">
            まだ登録がありません。映画詳細ページの「後で見る」ボタンから追加できます。
          </p>
        ) : (
          <MovieGrid movies={watchlistMovies.movies} />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">✅ 観た映画</h2>
        {!watched.loaded || watchedMovies.loading ? (
          <p className="text-zinc-500">読み込み中...</p>
        ) : watchedMovies.movies.length === 0 ? (
          <p className="text-zinc-500">
            まだ登録がありません。映画詳細ページの「観た映画にする」ボタンから追加できます。
          </p>
        ) : (
          <MovieGrid movies={watchedMovies.movies} />
        )}
      </section>
    </div>
  );
}
