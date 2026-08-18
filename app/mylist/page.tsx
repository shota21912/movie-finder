"use client";

import MovieGrid from "@/components/MovieGrid";
import { useMovieList } from "@/hooks/useMovieList";

// /mylist に対応するページ。「後で見る」「観た映画」の2リストを表示する。
//
// このファイルはファイル冒頭に "use client" が付いている、App Router内では珍しい
// 「クライアントコンポーネントのページ」。他のページ(app/page.tsxなど)はほぼ全て
// async関数のServer Component(サーバー側でTMDbからデータ取得する)だったが、
// このページが表示したいデータ(localStorageの中身)はブラウザにしか無いので、
// サーバー側では取得しようがなく、クライアントコンポーネントにする必要がある。
//
// 代わりに失うもの: サーバー側で表示内容を作れないので、SEO(検索エンジンがこのページの
// 中身を認識すること)には向かない。ただしこのページは個人のリスト表示なので問題にならない。
export default function MyListPage() {
  const watchlist = useMovieList("watchlist");
  const watched = useMovieList("watched");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="mb-4 text-xl font-bold">🔖 後で見る</h1>
        {!watchlist.loaded ? (
          <p className="text-zinc-500">読み込み中...</p>
        ) : watchlist.movies.length === 0 ? (
          <p className="text-zinc-500">
            まだ登録がありません。映画詳細ページの「後で見る」ボタンから追加できます。
          </p>
        ) : (
          <MovieGrid movies={watchlist.movies} />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">✅ 観た映画</h2>
        {!watched.loaded ? (
          <p className="text-zinc-500">読み込み中...</p>
        ) : watched.movies.length === 0 ? (
          <p className="text-zinc-500">
            まだ登録がありません。映画詳細ページの「観た映画にする」ボタンから追加できます。
          </p>
        ) : (
          <MovieGrid movies={watched.movies} />
        )}
      </section>
    </div>
  );
}
