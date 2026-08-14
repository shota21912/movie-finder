import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { MovieSummary } from "@/types/tmdb";

interface MovieCardProps {
  movie: MovieSummary;
  genreNames?: string[];
}

export default function MovieCard({ movie, genreNames }: MovieCardProps) {
  const posterUrl = tmdbImageUrl(movie.poster_path, "w342");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "----";

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="relative aspect-2/3 w-full bg-zinc-200 dark:bg-zinc-800">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No Image
          </div>
        )}
        <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">
          ★ {movie.vote_average.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{movie.title}</h3>
        <p className="text-xs text-zinc-500">{year}</p>
        {genreNames && genreNames.length > 0 && (
          <p className="line-clamp-1 text-xs text-zinc-500">
            {genreNames.join(" / ")}
          </p>
        )}
        <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
          {movie.overview || "あらすじ情報がありません"}
        </p>
      </div>
    </Link>
  );
}
