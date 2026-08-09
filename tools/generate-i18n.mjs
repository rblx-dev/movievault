// One-time generator: translates the UI string dictionary into every supported
// language using the free Google "gtx" endpoint, and writes
// src/lib/i18n.translations.ts. No runtime dependency.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "lib", "i18n.translations.ts");

const EN = {
  "nav.trending": "Trending",
  "nav.films": "Films",
  "nav.tv": "TV",
  "search.label": "Search movies and TV shows",
  "search.placeholder": "Search titles…",
  "search.placeholderFull": "Search movies, shows, people…",
  "search.button": "Search",
  "search.title": "Search the vault",
  "search.resultFor": "{{COUNT}} result for “{{QUERY}}”",
  "search.resultsFor": "{{COUNT}} results for “{{QUERY}}”",
  "search.emptyHint": "Find movies and TV shows by title.",
  "search.emptyState": "No titles matched that search. Try another name.",
  "selector.aria": "Site language",
  "selector.auto": "Auto",
  "hero.brand": "Movie Vault",
  "hero.headline": "Your personal vault for",
  "hero.headlineAccent": "films & television.",
  "hero.lede": "Browse through trending titles, dig into casts, ratings, and view trailers.",
  "hero.open": "Open {{TITLE}}",
  "hero.play": "Play trailer",
  "section.trending": "Trending this week",
  "section.trendingSub": "What people are watching right now across film and television.",
  "section.popularMovies": "Popular movies",
  "section.popularMoviesSub": "Current crowd-pleasers from the movie charts.",
  "section.popularTv": "Popular TV",
  "section.popularTvSub": "Series climbing the charts this week.",
  "section.topRated": "Top rated films",
  "section.topRatedSub": "Highly scored titles to stack in your vault.",
  "footer.rights": "All Rights Reserved.",
  "detail.film": "Film",
  "detail.series": "Series",
  "detail.votes": "votes",
  "detail.noSynopsis": "No synopsis available.",
  "detail.min": "min",
  "detail.seasonOne": "season",
  "detail.seasonMany": "seasons",
  "detail.trailer": "Trailer",
  "detail.cast": "Cast",
  "detail.castSub": "Principal performers billed for this title.",
  "detail.watchWhere": "Where to Watch",
  "detail.watchSub": "Everywhere this title is currently available to stream, rent, or buy.",
  "detail.stream": "Stream",
  "detail.free": "Free",
  "detail.ads": "With Ads",
  "detail.rent": "Rent",
  "detail.buy": "Buy",
  "poster.alt": "{{TITLE}} poster",
  "person.person": "Person",
  "person.knownForDept": "Known for {{DEPARTMENT}}",
  "person.born": "Born {{DATE}}",
  "person.died": "Died {{DATE}}",
  "person.noBio": "No biography is available for this person yet.",
  "person.aka": "Also known as {{NAMES}}",
  "person.knownFor": "Known for",
  "person.knownForSub": "Notable film and television credits.",
};

const LANG_CODES = [
  "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs",
  "bg", "my", "ca", "zh", "hr", "cs", "da", "nl", "en", "et",
  "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "he", "hi",
  "hu", "is", "id", "ga", "it", "ja", "kn", "kk", "km", "ko",
  "ku", "ky", "lo", "lv", "lt", "lb", "mk", "ms", "ml", "mt",
  "mr", "mn", "ne", "no", "or", "ps", "fa", "pl", "pt", "pa",
  "ro", "ru", "sr", "si", "sk", "sl", "es", "sw", "sv", "ta",
  "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "zu",
];

const KEYS = Object.keys(EN);
const VALUES = Object.values(EN);
const BATCH = VALUES.join("\n");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateText(text, lang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(text)}`;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parts = data[0].map((seg) => seg[0]).join("");
      if (parts && parts.trim()) return parts;
    } catch {
      // retry below
    }
    await sleep(1500 * (attempt + 1));
  }
  return null;
}

function quote(s) {
  return JSON.stringify(s).replace(/</g, "\\u003c");
}

async function translateLang(lang) {
  const batched = await translateText(BATCH, lang);
  if (batched) {
    const lines = batched.split("\n");
    if (lines.length === KEYS.length) {
      const out = {};
      KEYS.forEach((key, i) => {
        const value = lines[i].trim();
        out[key] = value ? value : EN[key];
      });
      return out;
    }
  }
  // fall back: translate each string individually
  const out = {};
  for (let i = 0; i < KEYS.length; i += 1) {
    const text = await translateText(VALUES[i], lang);
    out[KEYS[i]] = text || EN[KEYS[i]];
    if (i % 6 === 5) await sleep(60);
  }
  return out;
}

async function main() {
  const result = { en: EN };
  for (const lang of LANG_CODES) {
    if (lang === "en") continue;
    result[lang] = await translateLang(lang);
    const filled = Object.values(result[lang]).filter((v) => v).length;
    console.error(`done ${lang} (${filled}/${KEYS.length})`);
    await sleep(250);
  }

  const body = [
    "// AUTO-GENERATED by tools/generate-i18n.mjs — do not edit by hand.",
    "export const uiLanguageCodes = " + JSON.stringify(LANG_CODES) + ";",
    "",
    "export const uiStrings: Record<string, Record<string, string>> = {",
  ];
  for (const [lang, dict] of Object.entries(result)) {
    body.push(`  ${JSON.stringify(lang)}: {`);
    for (const [key, value] of Object.entries(dict)) {
      body.push(`    ${JSON.stringify(key)}: ${quote(value)},`);
    }
    body.push(`  },`);
  }
  body.push("};");
  body.push("");

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, body.join("\n"), "utf8");
  console.log(`wrote ${OUT} (${Object.keys(result).length} languages)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
