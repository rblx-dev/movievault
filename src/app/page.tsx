import Link from "next/link";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { t } from "@/lib/i18n";
import { getSiteLang } from "@/lib/site-lang";
import {
  displayTitle,
  getMovieDetails,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTVDetails,
  getTrending,
  originalTitle,
  resolveMediaType,
  Video,
} from "@/lib/tmdb";
import { hasYouTubeKey } from "@/lib/youtube";

export default async function HomePage() {
  const lang = await getSiteLang();
  const [trending, popularMovies, popularTV, topRated] = await Promise.all([
    getTrending("week", lang),
    getPopularMovies(lang),
    getPopularTV(lang),
    getTopRatedMovies(lang),
  ]);

  const featured =
    trending.results.find((item) => resolveMediaType(item) && item.backdrop_path) ||
    trending.results[0];

  let trailers: Video[] = [];
  if (featured) {
    const type = resolveMediaType(featured) || "movie";
    try {
      const details =
        type === "movie"
          ? await getMovieDetails(featured.id, lang)
          : await getTVDetails(featured.id, lang);
      trailers = details.videos?.results ?? [];
    } catch {
      trailers = [];
    }
  }

  const heroStrings = {
    brand: t(lang, "hero.brand"),
    headline: t(lang, "hero.headline"),
    headlineAccent: t(lang, "hero.headlineAccent"),
    lede: t(lang, "hero.lede"),
    openTitle: t(lang, "hero.open", {
      TITLE: featured ? displayTitle(featured) : "",
    }),
    play: t(lang, "hero.play"),
  };

  return (
    <>
      {featured && (
        <Hero
          featured={featured}
          trailers={trailers}
          hasYouTubeSearch={hasYouTubeKey()}
          strings={heroStrings}
          trailerTitle={originalTitle(featured)}
        />
      )}
      <div className="marquee">
        <div className="marquee__track">
          {[...trending.results, ...trending.results].map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/${resolveMediaType(item) || "movie"}/${item.id}`}
              className="marquee__item"
            >
              <span className="marquee__pop" aria-hidden>
                ✦
              </span>
              {displayTitle(item)}
            </Link>
          ))}
        </div>
      </div>
      <div className="page-wrap">
        <MediaRow
          id="trending"
          title={t(lang, "section.trending")}
          subtitle={t(lang, "section.trendingSub")}
          items={trending.results}
          lang={lang}
        />
        <MediaRow
          id="movies"
          title={t(lang, "section.popularMovies")}
          subtitle={t(lang, "section.popularMoviesSub")}
          items={popularMovies.results}
          mediaType="movie"
          lang={lang}
        />
        <MediaRow
          id="tv"
          title={t(lang, "section.popularTv")}
          subtitle={t(lang, "section.popularTvSub")}
          items={popularTV.results}
          mediaType="tv"
          lang={lang}
        />
        <MediaRow
          title={t(lang, "section.topRated")}
          subtitle={t(lang, "section.topRatedSub")}
          items={topRated.results}
          mediaType="movie"
          lang={lang}
        />
      </div>
    </>
  );
}
