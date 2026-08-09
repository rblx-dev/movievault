const REGION_CACHE_KEY = "mv.region";
const LANGUAGE_STORAGE_KEY = "mv.language";

export type GeoResult = {
  country?: string;
  region?: string;
} | null;

export function getSelectedLanguage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

export function getUserLocale(): { language: string; country: string | null } {
  if (typeof navigator === "undefined") {
    return { language: "en", country: null };
  }
  const selected = getSelectedLanguage();
  if (selected) {
    return { language: selected, country: null };
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
