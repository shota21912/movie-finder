import type { Genre, MovieSummary } from "@/types/tmdb";
import MovieCard from "./MovieCard";

interface MovieGridProps {
  movies: MovieSummary[];
  genres?: Genre[];
}

export default function MovieGrid({ movies, genres }: MovieGridProps) {
  const genreMap = new Map(genres?.map((g) => [g.id, g.name]) ?? []);

  if (movies.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        該当する映画が見つかりませんでした。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          genreNames={movie.genre_ids
            .map((id) => genreMap.get(id))
            .filter((name): name is string => Boolean(name))}
        />
      ))}
    </div>
  );
}
