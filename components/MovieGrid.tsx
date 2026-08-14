import type { Genre, MovieSummary } from "@/types/tmdb";
import MovieCard from "./MovieCard";

interface MovieGridProps {
  movies: MovieSummary[];
  genres?: Genre[]; // ジャンルの名前を調べるための「全ジャンル一覧」(任意)
}

// MovieCardを格子状(グリッド)に並べて表示するコンポーネント。
// 「映画一覧を表示する」場面(トップページ、検索結果、ジャンル検索結果など)は
// すべてこのコンポーネント1つに movies配列を渡すだけで済むようにしている。
export default function MovieGrid({ movies, genres }: MovieGridProps) {
  // 映画データ(movie.genre_ids)にはジャンルの「ID」しか入っていないので、
  // 画面に表示するには「IDから名前を調べる」必要がある。
  // Mapを使うと、genres配列を毎回ループで検索するより速くID→名前の変換ができる。
  // 例: genres = [{id:27, name:"ホラー"}] なら genreMap.get(27) === "ホラー" になる。
  const genreMap = new Map(genres?.map((g) => [g.id, g.name]) ?? []);

  // 検索結果が0件だった場合は、空のグリッドを表示する代わりにメッセージを出す。
  if (movies.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        該当する映画が見つかりませんでした。
      </p>
    );
  }

  return (
    // grid-cols-2 sm:grid-cols-3 ... のように、画面幅に応じて1行に並べる列数を
    // 増やしていくレスポンシブなレイアウト(スマホでは2列、PCでは5列、など)。
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          // movie.genre_ids (数値の配列) を、genreMapを使って
          // 名前の配列に変換してからMovieCardに渡している。
          // .filter(Boolean相当) で「genreMapに無かった(undefinedになった)もの」を取り除く。
          genreNames={movie.genre_ids
            .map((id) => genreMap.get(id))
            .filter((name): name is string => Boolean(name))}
        />
      ))}
    </div>
  );
}
