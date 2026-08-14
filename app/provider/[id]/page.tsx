import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { discoverMovies, getGenres } from "@/lib/tmdb";

interface ProviderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; page?: string }>;
}

export default async function ProviderPage({
  params,
  searchParams,
}: ProviderPageProps) {
  const { id } = await params;
  const { name, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;

  const [movies, genres] = await Promise.all([
    discoverMovies({ withWatchProviders: id, page: currentPage }),
    getGenres(),
  ]);

  const title = name ?? "配信サービス";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{title}で見られる映画</h1>
      <MovieGrid movies={movies.results} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/provider/${id}`}
        searchParams={{ name: title }}
      />
    </div>
  );
}
