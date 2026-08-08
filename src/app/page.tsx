import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import {
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTrending,
  resolveMediaType,
} from "@/lib/tmdb";

export default async function HomePage() {
  const [trending, popularMovies, popularTV, topRated] = await Promise.all([
    getTrending("week"),
    getPopularMovies(),
    getPopularTV(),
    getTopRatedMovies(),
  ]);

  const featured =
    trending.results.find((item) => resolveMediaType(item) && item.backdrop_path) ||
    trending.results[0];

  return (
    <>
      {featured && <Hero featured={featured} />}
      <div className="page-wrap">
        <MediaRow
          id="trending"
          title="Trending this week"
          subtitle="What people are watching right now across film and television."
          items={trending.results}
        />
        <MediaRow
          id="movies"
          title="Popular movies"
          subtitle="Current crowd-pleasers from the TMDB movie charts."
          items={popularMovies.results}
          mediaType="movie"
        />
        <MediaRow
          id="tv"
          title="Popular TV"
          subtitle="Series climbing the charts this week."
          items={popularTV.results}
          mediaType="tv"
        />
        <MediaRow
          title="Top rated films"
          subtitle="Highly scored titles to stack in your vault."
          items={topRated.results}
          mediaType="movie"
        />
      </div>
    </>
  );
}
