import Image from "next/image";
import Link from "next/link";
import {
  backdropUrl,
  displayTitle,
  displayYear,
  MediaItem,
  resolveMediaType,
} from "@/lib/tmdb";

type HeroProps = {
  featured: MediaItem;
};

export function Hero({ featured }: HeroProps) {
  const type = resolveMediaType(featured) || "movie";
  const title = displayTitle(featured);
  const year = displayYear(featured);
  const backdrop = backdropUrl(featured.backdrop_path || featured.poster_path, "original");
  const rating = featured.vote_average ? featured.vote_average.toFixed(1) : null;

  return (
    <section className="hero">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          className="hero__image"
          sizes="100vw"
        />
      )}
      <div className="hero__veil" aria-hidden />
      <div className="hero__grain" aria-hidden />

      <div className="hero__content">
        <p className="hero__brand">MovieVault</p>
        <h1 className="hero__headline">Your personal vault for films &amp; television.</h1>
        <p className="hero__lede">
          Browse through trending titles, dig into casts, ratings, and view trailers.
        </p>
        <div className="hero__actions">
          <Link href={`/${type}/${featured.id}`} className="btn btn--primary">
            Open {title}
          </Link>
          <Link href="/search" className="btn btn--ghost">
            Search the vault
          </Link>
        </div>
        <p className="hero__feature">
          Featured · {type === "movie" ? "Film" : "Series"}
          {year ? ` · ${year}` : ""}
          {rating ? ` · ${rating}/10` : ""}
        </p>
      </div>
    </section>
  );
}
