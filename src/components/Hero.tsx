"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeroVideo } from "@/components/HeroVideo";
import { getUserLocale, getUserRegion } from "@/lib/locale";
import {
  backdropUrl,
  displayTitle,
  getTrailerForLanguage,
  MediaItem,
  resolveMediaType,
  Video,
} from "@/lib/tmdb";

export type HeroStrings = {
  brand: string;
  headline: string;
  headlineAccent: string;
  lede: string;
  openTitle: string;
  play: string;
};

type HeroProps = {
  featured: MediaItem;
  trailers: Video[];
  hasYouTubeSearch?: boolean;
  strings?: HeroStrings;
  trailerTitle?: string;
};

const DEFAULT_STRINGS: HeroStrings = {
  brand: "Movie Vault",
  headline: "Your personal vault for",
  headlineAccent: "films & television.",
  lede: "Browse through trending titles, dig into casts, ratings, and view trailers.",
  openTitle: "Open",
  play: "Play trailer",
};

export function Hero({
  featured,
  trailers,
  hasYouTubeSearch = false,
  strings = DEFAULT_STRINGS,
  trailerTitle,
}: HeroProps) {
  const type = resolveMediaType(featured) || "movie";
  const title = displayTitle(featured);
  const backdrop = backdropUrl(featured.backdrop_path || featured.poster_path, "original");
  const href = `/${type}/${featured.id}`;
  const searchTitle = trailerTitle || title;
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [textless, setTextless] = useState(false);
  const [trailerMode, setTrailerMode] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [videoKey, setVideoKey] = useState(() => {
    const locale = getUserLocale();
    return getTrailerForLanguage(trailers, locale.language)?.key ?? null;
  });
  const [language] = useState(() => getUserLocale().language);
  const initialKeyRef = useRef(videoKey);

  useEffect(() => {
    const initialKey = initialKeyRef.current;
    if (!hasYouTubeSearch || !initialKey) return;
    const locale = getUserLocale();
    const controller = new AbortController();

    getUserRegion().then((geo) => {
      const params = new URLSearchParams({
        key: initialKey,
        title: searchTitle,
        lang: locale.language,
        country: locale.country ?? "",
        region: geo?.region ?? "",
        id: String(featured.id),
        type,
      });
      fetch(`/api/trailer?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { key?: string }) => {
          if (data.key && data.key !== initialKey) {
            setVideoKey(data.key);
          }
        })
        .catch(() => {});
    });

    return () => controller.abort();
  }, [hasYouTubeSearch, searchTitle, featured.id, type]);

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
      {videoKey && (
        <HeroVideo videoKey={videoKey} soundOn={soundOn} language={language} />
      )}
      <div className="hero__veil" aria-hidden />
      <div className="hero__glow" aria-hidden />
      <div className="hero__grain" aria-hidden />

      <div className="hero__content">
        <p
          className="hero__brand rise-stagger"
          style={{ "--stagger": "0" } as CSSProperties}
        >
          {strings.brand}
        </p>
        <h1
          className="hero__headline rise-stagger"
          style={{ "--stagger": "1" } as CSSProperties}
        >
          {strings.headline}{" "}
          <span className="hero__headline-accent">{strings.headlineAccent}</span>
        </h1>
        <p
          className="hero__lede rise-stagger"
          style={{ "--stagger": "2" } as CSSProperties}
        >
          {strings.lede}
        </p>
        <div
          className="hero__actions rise-stagger"
          style={{ "--stagger": "3" } as CSSProperties}
        >
          <Link href={href} className="btn btn--primary">
            {strings.openTitle}
          </Link>
          {videoKey && (
            <div className="hero__play">
              <button type="button" className="btn btn--play" onClick={playTrailer}>
                {strings.play}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hero__fade" aria-hidden />
    </section>
  );
}
