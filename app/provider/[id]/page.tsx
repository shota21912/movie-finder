import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { getMoodOption, MOOD_OPTIONS } from "@/lib/moodMap";
import { discoverMovies, getGenres } from "@/lib/tmdb";

interface ProviderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    name?: string;
    mood?: string;
    genre?: string;
    page?: string;
  }>;
}

export default async function ProviderPage({
  params,
  searchParams,
}: ProviderPageProps) {
  const { id } = await params;
  const { name, mood, genre, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  const moodOption = mood ? getMoodOption(mood) : undefined;

  // ジャンル指定があればそちらを優先し、なければ選んだ気分に紐づくジャンルで絞り込む
  const withGenres = genre ? genre : moodOption?.genreIds.join(",");

  const [movies, genres] = await Promise.all([
    discoverMovies({
      withWatchProviders: id,
      withGenres,
      sortBy: moodOption?.sortBy,
      page: currentPage,
    }),
    getGenres(),
  ]);

  const title = name ?? "配信サービス";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{title}で見られる映画</h1>

      <form
        action={`/provider/${id}`}
        method="GET"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900"
      >
        {name && <input type="hidden" name="name" value={name} />}

        <label className="flex flex-col gap-1">
          気分
          <select
            name="mood"
            defaultValue={mood ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            <option value="">指定なし</option>
            {MOOD_OPTIONS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.emoji} {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          ジャンル
          <select
            name="genre"
            defaultValue={genre ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            <option value="">指定なし</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded bg-black px-4 py-1.5 text-white dark:bg-white dark:text-black"
        >
          絞り込む
        </button>
      </form>

      <MovieGrid movies={movies.results} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/provider/${id}`}
        searchParams={{ name: title, mood, genre }}
      />
    </div>
  );
}
