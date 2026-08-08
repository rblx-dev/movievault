const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export type Genre = {
  id: number;
  name: string;
};

export type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  media_type?: MediaType | "person";
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  popularity?: number;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

export type Video = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type MediaDetails = MediaItem & {
  genres: Genre[];
  runtime?: number;
  episode_run_time?: number[];
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
};

type Paginated<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

function getToken() {
  const token = process.env.TMDB_ACCESS_TOKEN?.replace(/^\uFEFF/, "").trim();
  if (!token) {
    throw new Error("TMDB_ACCESS_TOKEN is not set");
  }
  return token;
}

async function tmdbFetch<T>(path: string, searchParams?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export function posterUrl(path: string | null | undefined, size: "w342" | "w500" | "w780" = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "w1280",
) {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path: string | null | undefined, size: "w185" | "h632" = "w185") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function displayTitle(item: Pick<MediaItem, "title" | "name">) {
  return item.title || item.name || "Untitled";
}

export function displayYear(item: Pick<MediaItem, "release_date" | "first_air_date">) {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : null;
}

export function resolveMediaType(item: MediaItem): MediaType | null {
  if (item.media_type === "movie" || item.media_type === "tv") return item.media_type;
  if (item.title && item.release_date !== undefined) return "movie";
  if (item.name && item.first_air_date !== undefined) return "tv";
  return null;
}

export function getTrailer(videos?: Video[]) {
  if (!videos?.length) return null;
  const youtube = videos.filter((v) => v.site === "YouTube");
  return (
    youtube.find((v) => v.type === "Trailer" && v.official) ||
    youtube.find((v) => v.type === "Trailer") ||
    youtube.find((v) => v.type === "Teaser") ||
    youtube[0] ||
    null
  );
}

export async function getTrending(timeWindow: "day" | "week" = "week") {
  return tmdbFetch<Paginated<MediaItem>>(`/trending/all/${timeWindow}`);
}

export async function getPopularMovies() {
  return tmdbFetch<Paginated<MediaItem>>("/movie/popular");
}

export async function getPopularTV() {
  return tmdbFetch<Paginated<MediaItem>>("/tv/popular");
}

export async function getTopRatedMovies() {
  return tmdbFetch<Paginated<MediaItem>>("/movie/top_rated");
}

export async function searchMulti(query: string, page = "1") {
  return tmdbFetch<Paginated<MediaItem>>("/search/multi", {
    query,
    include_adult: "false",
    language: "en-US",
    page,
  });
}

export async function getMovieDetails(id: string | number) {
  return tmdbFetch<MediaDetails>(`/movie/${id}`, {
    append_to_response: "credits,videos",
    language: "en-US",
  });
}

export async function getTVDetails(id: string | number) {
  return tmdbFetch<MediaDetails>(`/tv/${id}`, {
    append_to_response: "credits,videos",
    language: "en-US",
  });
}

export async function getAccount() {
  return tmdbFetch<{ id: number; username: string; name: string }>("/account");
}
