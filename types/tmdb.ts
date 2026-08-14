export interface Genre {
  id: number;
  name: string;
}

export interface MovieSummary {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  overview: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderRegion {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string; // "YouTube" | "Vimeo" など
  type: string; // "Trailer" | "Teaser" | "Clip" など
  official: boolean;
  published_at: string;
}

export interface Review {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url: string;
}

export interface MovieDetail extends MovieSummary {
  runtime: number | null;
  genres: Genre[];
  credits?: { cast: CastMember[] };
  "watch/providers"?: { results: Record<string, WatchProviderRegion> };
  videos?: { results: Video[] };
  recommendations?: { results: MovieSummary[] };
}

export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface PersonDetail extends PersonSummary {
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
}

export interface PersonMovieCredit extends MovieSummary {
  character: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface ProviderListItem {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}
