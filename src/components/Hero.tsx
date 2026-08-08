"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
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
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [textless, setTextless] = useState(false);
  const [trailerMode, setTrailerMode] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = sectionRef.current;
      if (!hero) return;
      setTrailerMode(started && window.scrollY <= hero.offsetHeight / 2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [started]);

  useEffect(() => {
    const body = document.body;
    body.classList.toggle("is-trailer", trailerMode);
    return () => body.classList.remove("is-trailer");
  }, [trailerMode]);

  const playTrailer = () => {
    setStarted(true);
    setTextless(true);
    setTrailerMode(true);
    setSoundOn(true);
  };

  const sectionClass = [
    "hero",
    textless && "hero--textless",
    trailerMode && "hero--clean",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={sectionRef} className={sectionClass}>
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
      {trailerKey && <HeroVideo videoKey={trailerKey} soundOn={soundOn} />}
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
          {trailerKey && (
            <button type="button" className="btn btn--ghost" onClick={playTrailer}>
              Play trailer
            </button>
          )}
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
