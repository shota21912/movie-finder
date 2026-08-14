import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import { MOOD_OPTIONS } from "@/lib/moodMap";
import { CURATED_PROVIDER_NAMES } from "@/lib/providers";
import { getGenres, getPopularMovies, getWatchProviders } from "@/lib/tmdb";

export default async function Home() {
  const [popular, genres, providers] = await Promise.all([
    getPopularMovies(1),
    getGenres(),
    getWatchProviders(),
  ]);

  const curatedProviders = CURATED_PROVIDER_NAMES.map((name) =>
    providers.find((p) => p.provider_name === name)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-4 text-xl font-bold">🎬 人気映画</h2>
        <MovieGrid movies={popular.results.slice(0, 10)} genres={genres} />
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">😊 今日の気分から探す</h2>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <Link
              key={mood.key}
              href={`/mood?mood=${mood.key}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {mood.emoji} {mood.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">📺 サブスクから探す</h2>
        <div className="flex flex-wrap gap-2">
          {curatedProviders.map((provider) => (
            <Link
              key={provider.provider_id}
              href={`/provider/${provider.provider_id}?name=${encodeURIComponent(
                provider.provider_name
              )}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {provider.provider_name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">🎞️ ジャンルから探す</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
