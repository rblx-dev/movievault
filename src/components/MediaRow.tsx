import type { CSSProperties } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { Reveal } from "./Reveal";

type MediaRowProps = {
  id?: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
  mediaType?: "movie" | "tv";
  lang?: string;
};

export function MediaRow({ id, title, subtitle, items, mediaType, lang = "en" }: MediaRowProps) {
  const filtered = items.filter((item) => {
    if (mediaType) return true;
    return item.media_type === "movie" || item.media_type === "tv";
  });

  if (!filtered.length) return null;

  return (
    <Reveal as="section" className="media-row">
      <div id={id}>
        <div className="section-heading">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="media-rail" role="list">
          {filtered.map((item, index) => (
            <div
              key={`${item.media_type || mediaType}-${item.id}`}
              role="listitem"
              className="rise-stagger"
              style={{ "--stagger": String(Math.min(index, 8)) } as CSSProperties}
            >
              <MediaCard item={item} mediaType={mediaType} priority={index < 4} lang={lang} />
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
