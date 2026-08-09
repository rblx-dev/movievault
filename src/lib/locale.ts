const REGION_CACHE_KEY = "mv.region";

export type GeoResult = {
  country?: string;
  region?: string;
} | null;

export function getUserLocale(): { language: string; country: string | null } {
  if (typeof navigator === "undefined") {
    return { language: "en", country: null };
  }
  const locales =
    navigator.languages?.length > 0 ? navigator.languages : [navigator.language];
  for (const locale of locales) {
    const [language, country] = locale.split("-");
    if (country) {
      return { language: language.toLowerCase(), country: country.toLowerCase() };
    }
  }
  const language = (locales[0] || "en").split("-")[0].toLowerCase();
  return { language, country: null };
}

let cachedGeo: GeoResult = null;
let geoPromise: Promise<GeoResult> | null = null;

export function getUserRegion(): Promise<GeoResult> {
  if (cachedGeo) return Promise.resolve(cachedGeo);
  if (typeof window === "undefined") return Promise.resolve(null);

  try {
    const cached = window.sessionStorage.getItem(REGION_CACHE_KEY);
    if (cached) {
      cachedGeo = JSON.parse(cached) as GeoResult;
      return Promise.resolve(cachedGeo);
    }
  } catch {
    // ignore storage failures
  }

  if (!geoPromise) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4000);
    geoPromise = fetch("https://ipinfo.io/json", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data: GeoResult) => {
        window.clearTimeout(timer);
        cachedGeo = data ?? null;
        if (cachedGeo) {
          try {
            window.sessionStorage.setItem(
              REGION_CACHE_KEY,
              JSON.stringify(cachedGeo),
            );
          } catch {
            // ignore storage failures
          }
        }
        return cachedGeo;
      });
  }

  return geoPromise;
}
