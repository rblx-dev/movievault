import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CastStrip } from "@/components/CastStrip";
import { Reveal } from "@/components/Reveal";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import { WatchProviders } from "@/components/WatchProviders";
import { t } from "@/lib/i18n";
import {
  backdropUrl,
  displayTitle,
  displayYear,
  getTrailer,
  MediaDetails,
  MediaType,
  posterUrl,
} from "@/lib/tmdb";

type DetailViewProps = {
  details: MediaDetails;
  type: MediaType;
  lang?: string;
};

export function DetailView({ details, type, lang = "en" }: DetailViewProps) {
  if (!details?.id) notFound();

  const title = displayTitle(details);
  const year = displayYear(details);
  const poster = posterUrl(details.poster_path, "w780");
  const backdrop = backdropUrl(details.backdrop_path, "original");
  const trailer = getTrailer(details.videos?.results);
  const cast = details.credits?.cast || [];
  const typeLabel = type === "movie" ? t(lang, "detail.film") : t(lang, "detail.series");
  const runtime =
    type === "movie"
      ? details.runtime
        ? `${details.runtime} ${t(lang, "detail.min")}`
        : null
      : details.number_of_seasons
        ? `${details.number_of_seasons} ${
            details.number_of_seasons === 1
              ? t(lang, "detail.seasonOne")
              : t(lang, "detail.seasonMany")
          }`
        : null;

  return (
    <article className="detail">
      <div className="detail__hero">
        {backdrop && (
          <Image
            src={backdrop}
            alt=""
            fill
            priority
            className="detail__backdrop"
            sizes="100vw"
          />
        )}
        <div className="detail__veil" aria-hidden />
      </div>

      <Reveal className="detail__body" as="div">
        <div
          className="detail__poster-wrap rise-stagger"
          style={{ "--stagger": "0" } as CSSProperties}
        >
          {poster ? (
            <Image
              src={poster}
              alt={t(lang, "poster.alt", { TITLE: title })}
              width={420}
              height={630}
              className="detail__poster"
              priority
            />
          ) : (
            <div className="detail__poster detail__poster--empty">{title.slice(0, 1)}</div>
          )}
        </div>

        <div className="detail__copy">
          <p
            className="detail__eyebrow rise-stagger"
            style={{ "--stagger": "1" } as CSSProperties}
          >
            <Link href="/">MovieVault</Link>
            <span aria-hidden> / </span>
            {typeLabel}
          </p>
          <h1 className="rise-stagger" style={{ "--stagger": "2" } as CSSProperties}>
            {title}
          </h1>
          {details.tagline && (
            <p
              className="detail__tagline rise-stagger"
              style={{ "--stagger": "3" } as CSSProperties}
            >
              {details.tagline}
            </p>
          )}

          <div
            className="detail__facts rise-stagger"
            style={{ "--stagger": "4" } as CSSProperties}
          >
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            {details.vote_average > 0 && (
              <span className="detail__score">{details.vote_average.toFixed(1)} / 10</span>
            )}
            {details.vote_count > 0 && (
              <span>
                {details.vote_count.toLocaleString()} {t(lang, "detail.votes")}
              </span>
            )}
          </div>

          {details.genres?.length > 0 && (
            <ul
              className="detail__genres rise-stagger"
              style={{ "--stagger": "5" } as CSSProperties}
            >
              {details.genres.map((genre) => (
                <li key={genre.id}>{genre.name}</li>
              ))}
            </ul>
          )}

          <p
            className="detail__overview rise-stagger"
            style={{ "--stagger": "6" } as CSSProperties}
          >
            {details.overview || t(lang, "detail.noSynopsis")}
          </p>
        </div>
      </Reveal>

      {trailer && (
        <Reveal as="div">
          <TrailerPlayer trailer={trailer} lang={lang} />
        </Reveal>
      )}
      <WatchProviders id={details.id} type={type} lang={lang} />
      <CastStrip cast={cast} lang={lang} />
    </article>
  );
}
