import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { discoverMovies, getGenres } from "@/lib/tmdb";

interface GenrePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; page?: string }>;
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { id } = await params;
  const { name, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;

  const [movies, genres] = await Promise.all([
    discoverMovies({ withGenres: id, page: currentPage }),
    getGenres(),
  ]);

  const title = name ?? genres.find((g) => String(g.id) === id)?.name ?? "ジャンル";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{title}の映画</h1>
      <MovieGrid movies={movies.results} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/genre/${id}`}
        searchParams={{ name: title }}
      />
    </div>
  );
}
