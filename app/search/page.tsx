import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import PersonCard from "@/components/PersonCard";
import { getGenres, searchMovies, searchPeople } from "@/lib/tmdb";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;

  if (!q.trim()) {
    return (
      <p className="py-12 text-center text-zinc-500">
        検索キーワードを入力してください。
      </p>
    );
  }

  const [movies, people, genres] = await Promise.all([
    searchMovies(q, currentPage),
    searchPeople(q, 1),
    getGenres(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">「{q}」の検索結果</h1>

      {people.results.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">俳優</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {people.results.slice(0, 10).map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">映画</h2>
        <MovieGrid movies={movies.results} genres={genres} />
        <Pagination
          currentPage={currentPage}
          totalPages={movies.total_pages}
          basePath="/search"
          searchParams={{ q }}
        />
      </section>
    </div>
  );
}
