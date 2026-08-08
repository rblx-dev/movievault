import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  backdropUrl,
  displayTitle,
  MediaItem,
  resolveMediaType,
} from "@/lib/tmdb";

type HeroProps = {
  featured: MediaItem;
  trailerKey?: string | null;
};

export function Hero({ featured, trailerKey }: HeroProps) {
  const type = resolveMediaType(featured) || "movie";
  const title = displayTitle(featured);
  const backdrop = backdropUrl(featured.backdrop_path || featured.poster_path, "original");
  const href = `/${type}/${featured.id}`;

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
      {trailerKey && (
        <div className="hero__video" aria-hidden>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&vq=hd2160`}
            title=""
            loading="eager"
            allow="autoplay; encrypted-media; picture-in-picture"
            tabIndex={-1}
          />
        </div>
      )}
      <div className="hero__veil" aria-hidden />
      <div className="hero__glow" aria-hidden />
      <div className="hero__grain" aria-hidden />

      <div className="hero__content">
        <p
          className="hero__brand rise-stagger"
          style={{ "--stagger": "0" } as CSSProperties}
        >
          Movie Vault
        </p>
        <h1
          className="hero__headline rise-stagger"
          style={{ "--stagger": "1" } as CSSProperties}
        >
          Your personal vault for{" "}
          <span className="hero__headline-accent">films &amp; television.</span>
        </h1>
        <p
          className="hero__lede rise-stagger"
          style={{ "--stagger": "2" } as CSSProperties}
        >
          Browse through trending titles, dig into casts, ratings, and view trailers.
        </p>
        <div
          className="hero__actions rise-stagger"
          style={{ "--stagger": "3" } as CSSProperties}
        >
          <Link href={href} className="btn btn--primary">
            Open {title}
          </Link>
          <Link href="/search" className="btn btn--ghost">
            Search the vault
          </Link>
        </div>
      </div>

      <div className="hero__fade" aria-hidden />
      <div className="hero__scroll" aria-hidden>
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
