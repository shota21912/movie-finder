import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { getMoodOption, MOOD_OPTIONS } from "@/lib/moodMap";
import { discoverMovies, getGenres } from "@/lib/tmdb";

interface MoodPageProps {
  searchParams: Promise<{
    mood?: string;
    genre?: string;
    runtime?: string;
    year?: string;
    page?: string;
  }>;
}

const RUNTIME_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "90", label: "90分以内" },
  { value: "120", label: "120分以内" },
  { value: "150", label: "150分以内" },
];

const YEAR_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "2020", label: "2020年以降" },
  { value: "2015", label: "2015年以降" },
  { value: "2000", label: "2000年以降" },
];

export default async function MoodPage({ searchParams }: MoodPageProps) {
  const { mood, genre, runtime, year, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  const moodOption = mood ? getMoodOption(mood) : undefined;

  const genres = await getGenres();

  if (!moodOption) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">今日はどんな気分？</h1>
        <div className="flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((m) => (
            <Link
              key={m.key}
              href={`/mood?mood=${m.key}`}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-base hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {m.emoji} {m.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const withGenres = genre ? genre : moodOption.genreIds.join(",");

  const movies = await discoverMovies({
    withGenres,
    withRuntimeLte: runtime ? Number(runtime) : undefined,
    primaryReleaseDateGte: year ? `${year}-01-01` : undefined,
    sortBy: moodOption.sortBy,
    page: currentPage,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">
          {moodOption.emoji} {moodOption.label}
        </h1>
        <Link href="/mood" className="text-sm text-zinc-500 hover:underline">
          気分を選び直す
        </Link>
      </div>

      <form
        action="/mood"
        method="GET"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900"
      >
        <input type="hidden" name="mood" value={moodOption.key} />

        <label className="flex flex-col gap-1">
          ジャンル
          <select
            name="genre"
            defaultValue={genre ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            <option value="">おすすめ（{moodOption.label}に合うジャンル）</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          上映時間
          <select
            name="runtime"
            defaultValue={runtime ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            {RUNTIME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          公開年
          <select
            name="year"
            defaultValue={year ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            {YEAR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
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
        basePath="/mood"
        searchParams={{ mood, genre, runtime, year }}
      />
    </div>
  );
}
