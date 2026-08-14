import type {
  Genre,
  MovieDetail,
  MovieSummary,
  PaginatedResponse,
  PersonDetail,
  PersonMovieCredit,
  PersonSummary,
  ProviderListItem,
} from "@/types/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const WATCH_REGION = "JP";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY が設定されていません。.env.local.example を参考に .env.local を作成してください。"
    );
  }
  return key;
}

// Server Componentからのみ呼ばれる想定。APIキーはここで完結させ、クライアントに渡さない。
async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds = 3600
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("language", "ja-JP");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`TMDb APIエラー: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w200" | "w342" | "w500" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function getGenres(): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(
    "/genre/movie/list",
    {},
    86400
  );
  return data.genres;
}

export async function getWatchProviders(): Promise<ProviderListItem[]> {
  const data = await tmdbFetch<{ results: ProviderListItem[] }>(
    "/watch/providers/movie",
    { watch_region: WATCH_REGION },
    86400
  );
  return data.results;
}

export async function getPopularMovies(
  page = 1
): Promise<PaginatedResponse<MovieSummary>> {
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/movie/popular", {
    page,
    region: WATCH_REGION,
  });
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<PaginatedResponse<MovieSummary>> {
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/search/movie", {
    query,
    page,
  });
}

export async function searchPeople(
  query: string,
  page = 1
): Promise<PaginatedResponse<PersonSummary>> {
  return tmdbFetch<PaginatedResponse<PersonSummary>>("/search/person", {
    query,
    page,
  });
}

export interface DiscoverMovieParams {
  page?: number;
  withGenres?: string; // カンマ区切りのジャンルID
  withKeywords?: string; // カンマ区切りのキーワードID
  withWatchProviders?: string; // カンマ区切りの配信サービスID
  primaryReleaseDateGte?: string; // YYYY-MM-DD
  withRuntimeLte?: number;
  sortBy?: string;
}

export async function discoverMovies(
  params: DiscoverMovieParams
): Promise<PaginatedResponse<MovieSummary>> {
  return tmdbFetch<PaginatedResponse<MovieSummary>>("/discover/movie", {
    page: params.page ?? 1,
    with_genres: params.withGenres,
    with_keywords: params.withKeywords,
    with_watch_providers: params.withWatchProviders,
    watch_region: params.withWatchProviders ? WATCH_REGION : undefined,
    "primary_release_date.gte": params.primaryReleaseDateGte,
    "with_runtime.lte": params.withRuntimeLte,
    sort_by: params.sortBy ?? "popularity.desc",
  });
}

export async function getMovieDetail(id: number): Promise<MovieDetail> {
  return tmdbFetch<MovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,watch/providers,videos,recommendations",
    // videosはlanguage=ja-JPだけだと空になりがちなので、日本語+英語の動画も対象にする
    include_video_language: "ja,en",
  });
}

export async function getPersonDetail(id: number): Promise<PersonDetail> {
  return tmdbFetch<PersonDetail>(`/person/${id}`);
}

export async function getPersonMovieCredits(
  id: number
): Promise<{ cast: PersonMovieCredit[] }> {
  return tmdbFetch<{ cast: PersonMovieCredit[] }>(
    `/person/${id}/movie_credits`
  );
}
