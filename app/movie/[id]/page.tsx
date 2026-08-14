import Image from "next/image";
import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import { CURATED_PROVIDER_NAMES } from "@/lib/providers";
import { getGenres, getMovieDetail, tmdbImageUrl } from "@/lib/tmdb";
import type { Video } from "@/types/tmdb";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

function pickTrailer(videos?: Video[]): Video | undefined {
  const youtubeVideos = (videos ?? []).filter((v) => v.site === "YouTube");
  return (
    youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
    youtubeVideos.find((v) => v.type === "Trailer") ??
    youtubeVideos.find((v) => v.type === "Teaser") ??
    youtubeVideos[0]
  );
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const [movie, genres] = await Promise.all([
    getMovieDetail(Number(id)),
    getGenres(),
  ]);

  const posterUrl = tmdbImageUrl(movie.poster_path, "w500");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "----";
  const cast = movie.credits?.cast.slice(0, 10) ?? [];
  const jpProviders = movie["watch/providers"]?.results?.JP;
  const flatrateNames = new Set(
    (jpProviders?.flatrate ?? []).map((p) => p.provider_name)
  );
  const trailer = pickTrailer(movie.videos?.results);
  const recommendations = movie.recommendations?.results ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 md:w-64">
          <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="256px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>公開年: {year}</span>
            <span>上映時間: {movie.runtime ? `${movie.runtime}分` : "不明"}</span>
            <span>評価: ★ {movie.vote_average.toFixed(1)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Link
                key={g.id}
                href={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
                className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                {g.name}
              </Link>
            ))}
          </div>

          <section>
            <h2 className="mb-2 text-lg font-semibold">あらすじ</h2>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {movie.overview || "あらすじ情報がありません"}
            </p>
          </section>

          {trailer && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">予告編</h2>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </section>
          )}

          {cast.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">出演者</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cast.map((c) => {
                  const photoUrl = tmdbImageUrl(c.profile_path, "w200");
                  return (
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="w-24 shrink-0 text-center text-xs"
                    >
                      <div className="relative mb-1 h-24 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        {photoUrl && (
                          <Image
                            src={photoUrl}
                            alt={c.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="line-clamp-1 font-medium">{c.name}</p>
                      <p className="line-clamp-1 text-zinc-500">{c.character}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold">視聴可能なサービス</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {CURATED_PROVIDER_NAMES.map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between border-b border-black/5 py-1 dark:border-white/10"
                >
                  <span>{name}</span>
                  <span>{flatrateNames.has(name) ? "○" : "×"}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            この映画を観た人はこんな映画も観ています
          </h2>
          <MovieGrid movies={recommendations.slice(0, 10)} genres={genres} />
        </section>
      )}
    </div>
  );
}
