import Image from "next/image";
import Link from "next/link";
import {
  displayTitle,
  displayYear,
  MediaItem,
  posterUrl,
  resolveMediaType,
} from "@/lib/tmdb";

type MediaCardProps = {
  item: MediaItem;
  mediaType?: "movie" | "tv";
  priority?: boolean;
};

export function MediaCard({ item, mediaType, priority = false }: MediaCardProps) {
  const type = mediaType || resolveMediaType(item);
  if (!type) return null;

  const title = displayTitle(item);
  const year = displayYear(item);
  const poster = posterUrl(item.poster_path, "w500");
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <article className="media-card">
      <Link href={`/${type}/${item.id}`} className="media-card__link">
        <div className="media-card__poster">
          {poster ? (
            <Image
              src={poster}
              alt={`${title} poster`}
              fill
              sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 180px"
              priority={priority}
            />
          ) : (
            <div className="media-card__fallback" aria-hidden>
              {title.slice(0, 1)}
            </div>
          )}
          {rating && <span className="media-card__rating">{rating}</span>}
        </div>
        <div className="media-card__meta">
          <h3>{title}</h3>
          <p>
            <span className="media-card__type">{type === "movie" ? "Film" : "Series"}</span>
            {year && <span> · {year}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}
