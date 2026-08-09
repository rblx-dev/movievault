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
  original_title?: string;
  original_name?: string;
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
  iso_639_1?: string;
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

export type PersonCredit = MediaItem & {
  character?: string;
  media_type?: MediaType;
};

export type WatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type WatchProviders = {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
  ads?: WatchProvider[];
};

type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProviders>;
};

export type PersonDetails = {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
  profile_path: string | null;
  also_known_as: string[];
  popularity?: number;
  combined_credits?: {
    cast: PersonCredit[];
    crew: PersonCredit[];
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

  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        return res.json() as Promise<T>;
      }
      lastError = new Error(`TMDB request failed: ${res.status} ${path}`);
      if (res.status < 500 && res.status !== 429) {
        throw lastError;
      }
    } catch (err) {
      lastError = err;
    }
    if (attempt < 3) {
      await new Promise((resolve) =>
        setTimeout(resolve, 300 * 2 ** attempt + Math.random() * 150),
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`TMDB request failed: ${path}`);
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

export function providerLogoUrl(
  path: string | null | undefined,
  size: "w45" | "w92" | "w154" | "w185" = "w92",
) {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function displayTitle(item: Pick<MediaItem, "title" | "name">) {
  return item.title || item.name || "Untitled";
}

export function originalTitle(item: Pick<MediaItem, "original_title" | "original_name" | "title" | "name">) {
  return (
    item.original_title ||
    item.original_name ||
    item.title ||
    item.name ||
    "Untitled"
  );
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

function pickTrailer(videos: Video[], language?: string): Video | null {
  if (!videos.length) return null;
  const youtube = videos.filter((v) => v.site === "YouTube");
  if (!youtube.length) return null;
  const trailers = youtube.filter((v) => v.type === "Trailer");

  const best = (list: Video[]) =>
    list.find((v) => v.official && /official/i.test(v.name)) ||
    list.find((v) => v.official) ||
    list.find((v) => !v.official);

  const langPrefix = language?.split("-")[0].toLowerCase();
  if (langPrefix) {
    const localized = trailers.filter(
      (v) => v.iso_639_1?.toLowerCase() === langPrefix,
    );
    if (localized.length) {
      const picked = best(localized);
      if (picked) return picked;
    }
  }

  return (
    best(trailers) ||
    youtube.find((v) => v.type === "Teaser") ||
    youtube[0] ||
    null
  );
}

export function getTrailer(videos?: Video[]) {
  return pickTrailer(videos ?? [], undefined);
}

export function getTrailerForLanguage(videos: Video[], language?: string) {
  return pickTrailer(videos, language);
}

export async function getTrending(timeWindow: "day" | "week" = "week", lang = "en-US") {
  return tmdbFetch<Paginated<MediaItem>>(`/trending/all/${timeWindow}`, {
    language: lang,
  });
}

export async function getPopularMovies(lang = "en-US") {
  return tmdbFetch<Paginated<MediaItem>>("/movie/popular", { language: lang });
}

export async function getPopularTV(lang = "en-US") {
  return tmdbFetch<Paginated<MediaItem>>("/tv/popular", { language: lang });
}

export async function getTopRatedMovies(lang = "en-US") {
  return tmdbFetch<Paginated<MediaItem>>("/movie/top_rated", {
    language: lang,
  });
}

export async function searchMulti(query: string, page = "1", lang = "en-US") {
  return tmdbFetch<Paginated<MediaItem>>("/search/multi", {
    query,
    include_adult: "false",
    language: lang,
    page,
  });
}

export async function getMovieDetails(id: string | number, lang = "en-US") {
  return tmdbFetch<MediaDetails>(`/movie/${id}`, {
    append_to_response: "credits,videos",
    language: lang,
  });
}

export async function getTVDetails(id: string | number, lang = "en-US") {
  return tmdbFetch<MediaDetails>(`/tv/${id}`, {
    append_to_response: "credits,videos",
    language: lang,
  });
}

export async function getPersonDetails(id: string | number, lang = "en-US") {
  return tmdbFetch<PersonDetails>(`/person/${id}`, {
    append_to_response: "combined_credits",
    language: lang,
  });
}

export async function getWatchProviders(id: string | number, type: MediaType) {
  const data = await tmdbFetch<WatchProvidersResponse>(`/${type}/${id}/watch/providers`);
  const region = data.results?.["US"] ?? Object.values(data.results ?? {})[0];
  return region ?? null;
}

export type TranslationData = {
  iso_639_1: string;
  data: { title?: string; name?: string; overview?: string };
};

type TranslationsResponse = {
  translations: TranslationData[];
};

export async function getTranslations(id: string | number, type: MediaType) {
  return tmdbFetch<TranslationsResponse>(`/${type}/${id}/translations`);
}

export async function getAccount() {
  return tmdbFetch<{ id: number; username: string; name: string }>("/account");
}
