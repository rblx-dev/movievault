const YT_BASE = "https://www.googleapis.com/youtube/v3";

export function hasYouTubeKey() {
  return Boolean(process.env.YOUTUBE_API_KEY?.replace(/^\uFEFF/, "").trim());
}

function ytKey() {
  const key = process.env.YOUTUBE_API_KEY?.replace(/^\uFEFF/, "").trim();
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

async function ytFetch<T>(path: string, params: Record<string, string>) {
  const url = new URL(`${YT_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }
  url.searchParams.set("key", ytKey());

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`YouTube request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

type SearchItem = {
  id?: { videoId?: string };
  snippet?: { title: string; channelTitle: string };
};

type ChannelItem = {
  id?: { channelId?: string };
  snippet?: { title: string };
};

type VideoItem = {
  snippet?: { channelId: string; channelTitle: string };
};

type SearchResponse = { items?: SearchItem[] };
type ChannelSearchResponse = { items?: ChannelItem[] };
type VideoResponse = { items?: VideoItem[] };

type FoundVideo = { key: string; title: string; channelTitle: string };
type FoundChannel = { id: string; title: string };

async function searchVideos(query: string, extra: Record<string, string> = {}) {
  const data = await ytFetch<SearchResponse>("/search", {
    part: "snippet",
    type: "video",
    maxResults: "20",
    q: query,
    ...extra,
  });
  return (data.items ?? [])
    .map(
      (item): FoundVideo | null =>
        item.id?.videoId
          ? {
              key: item.id.videoId,
              title: item.snippet?.title ?? "",
              channelTitle: item.snippet?.channelTitle ?? "",
            }
          : null,
    )
    .filter((v): v is FoundVideo => v !== null);
}

async function searchChannels(query: string) {
  const data = await ytFetch<ChannelSearchResponse>("/search", {
    part: "snippet",
    type: "channel",
    maxResults: "10",
    q: query,
  });
  return (data.items ?? [])
    .map(
      (item): FoundChannel | null =>
        item.id?.channelId
          ? { id: item.id.channelId, title: item.snippet?.title ?? "" }
          : null,
    )
    .filter((c): c is FoundChannel => c !== null);
}

async function getVideoChannel(videoId: string) {
  const data = await ytFetch<VideoResponse>("/videos", {
    part: "snippet",
    id: videoId,
  });
  const snippet = data.items?.[0]?.snippet;
  return snippet
    ? { channelId: snippet.channelId, channelTitle: snippet.channelTitle }
    : null;
}

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi",
  bn: "Bengali",
  te: "Telugu",
  ta: "Tamil",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
  gu: "Gujarati",
  pa: "Punjabi",
  ur: "Urdu",
  fr: "French",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "Portuguese",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
  ru: "Russian",
  ar: "Arabic",
  tr: "Turkish",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  id: "Indonesian",
  th: "Thai",
  vi: "Vietnamese",
};

const INDIA_REGION_LANGUAGES: Record<string, string> = {
  "Andhra Pradesh": "te",
  Telangana: "te",
  Karnataka: "kn",
  "Tamil Nadu": "ta",
  Kerala: "ml",
  Maharashtra: "mr",
  Goa: "mr",
  Gujarat: "gu",
  Punjab: "pa",
  "West Bengal": "bn",
  "Uttar Pradesh": "hi",
  Bihar: "hi",
  "Madhya Pradesh": "hi",
  Rajasthan: "hi",
  Delhi: "hi",
  Haryana: "hi",
  Jharkhand: "hi",
  Chhattisgarh: "hi",
  Uttarakhand: "hi",
  "Himachal Pradesh": "hi",
  "Jammu and Kashmir": "hi",
};

function regionalLanguage(country: string | null, region: string | null) {
  if (country !== "in" || !region) return null;
  const needle = region.toLowerCase();
  const match = Object.keys(INDIA_REGION_LANGUAGES).find(
    (state) => state.toLowerCase() === needle,
  );
  return match ? INDIA_REGION_LANGUAGES[match] : null;
}

const LOCALIZED_MARKERS = Object.values(LANGUAGE_NAMES).map((name) =>
  name.toLowerCase(),
);

function hasLanguageName(title: string) {
  const lower = title.toLowerCase();
  return LOCALIZED_MARKERS.some((marker) => lower.includes(marker));
}

function pickMatch(
  videos: FoundVideo[],
  movieTitle: string,
  langName: string | null,
  countryNeedle: string | null,
  preferPlainTitle = false,
): LocalizedTrailer | null {
  const movie = movieTitle.toLowerCase();
  const lang = langName?.toLowerCase();
  const country = countryNeedle?.toLowerCase();

  const score = (video: FoundVideo, excludeNew: boolean): number => {
    const title = video.title.toLowerCase();
    const channel = video.channelTitle.toLowerCase();

    if (!title.includes(movie)) return -1;
    if (lang && !title.includes(lang)) return -1;
    if (preferPlainTitle && hasLanguageName(video.title)) return -1;
    if (excludeNew && title.includes("new trailer")) return -1;

    let s = 0;
    if (title.includes("official trailer")) s += 100;
    if (title.includes("exclusively in cinemas 30 july")) s += 50;
    else if (title.includes("exclusively in cinemas")) s += 20;
    if (country && channel.includes(country)) s += 30;
    if (title.includes("final trailer")) s -= 40;
    if (title.includes("teaser")) s -= 20;
    return s;
  };

  const best = (excludeNew: boolean) => {
    let top: FoundVideo | null = null;
    let topScore = -1;
    for (const video of videos) {
      const s = score(video, excludeNew);
      if (s > topScore) {
        top = video;
        topScore = s;
      }
    }
    return top;
  };

  const top = best(true) ?? best(false);
  return top ? { key: top.key, channel: top.channelTitle } : null;
}

export type LocalizedTrailer = { key: string; channel: string };

export async function findLocalizedTrailer({
  videoId,
  movieTitle,
  language,
  country,
  region,
}: {
  videoId: string;
  movieTitle: string;
  language: string;
  country: string | null;
  region?: string | null;
}): Promise<LocalizedTrailer | null> {
  if (!hasYouTubeKey()) return null;

  const effectiveLanguage = regionalLanguage(country, region ?? null) ?? language;

  if (effectiveLanguage === "en" && country !== "in") return null;

  if (effectiveLanguage === "en" && country === "in") {
    const orig = await getVideoChannel(videoId);
    const channels = orig
      ? await searchChannels(`${orig.channelTitle} India`)
      : [];
    const indiaChannel = channels.find((c) => /india/i.test(c.title));
    const onChannel = indiaChannel
      ? await searchVideos(`${movieTitle} trailer`, {
          channelId: indiaChannel.id,
        })
      : [];
    const match = pickMatch(onChannel, movieTitle, null, "india", true);
    if (match) return match;
    const global = await searchVideos(`${movieTitle} trailer`);
    return pickMatch(global, movieTitle, null, "india", true);
  }

  const langName = LANGUAGE_NAMES[effectiveLanguage];
  if (!langName) return null;

  const candidates = await searchVideos(`${movieTitle} ${langName} trailer`);
  return pickMatch(candidates, movieTitle, langName, null);
}
