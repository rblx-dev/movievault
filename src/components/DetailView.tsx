import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CastStrip } from "@/components/CastStrip";
import { TrailerPlayer } from "@/components/TrailerPlayer";
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
};

export function DetailView({ details, type }: DetailViewProps) {
  if (!details?.id) notFound();

  const title = displayTitle(details);
  const year = displayYear(details);
  const poster = posterUrl(details.poster_path, "w780");
  const backdrop = backdropUrl(details.backdrop_path, "original");
  const trailer = getTrailer(details.videos?.results);
  const cast = details.credits?.cast || [];
  const runtime =
    type === "movie"
      ? details.runtime
        ? `${details.runtime} min`
        : null
      : details.number_of_seasons
        ? `${details.number_of_seasons} season${details.number_of_seasons === 1 ? "" : "s"}`
        : null;

  return (
    <article className="detail">
      <div className="detail__hero">
        {backdrop && (
          <Image src={backdrop} alt="" fill priority className="detail__backdrop" sizes="100vw" />
        )}
        <div className="detail__veil" aria-hidden />
      </div>

      <div className="detail__body">
        <div className="detail__poster-wrap">
          {poster ? (
            <Image
              src={poster}
              alt={`${title} poster`}
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
          <p className="detail__eyebrow">
            <Link href="/">MovieVault</Link>
            <span aria-hidden> / </span>
            {type === "movie" ? "Film" : "Series"}
          </p>
          <h1>{title}</h1>
          {details.tagline && <p className="detail__tagline">{details.tagline}</p>}

          <div className="detail__facts">
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            {details.vote_average > 0 && (
              <span className="detail__score">{details.vote_average.toFixed(1)} / 10</span>
            )}
            {details.vote_count > 0 && (
              <span>{details.vote_count.toLocaleString()} votes</span>
            )}
          </div>

          {details.genres?.length > 0 && (
            <ul className="detail__genres">
              {details.genres.map((genre) => (
                <li key={genre.id}>{genre.name}</li>
              ))}
            </ul>
          )}

          <p className="detail__overview">{details.overview || "No synopsis available."}</p>
        </div>
      </div>

      {trailer && <TrailerPlayer trailer={trailer} />}
      <CastStrip cast={cast} />
    </article>
  );
}
