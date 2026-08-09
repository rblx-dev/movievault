import { t } from "@/lib/i18n";
import { Video } from "@/lib/tmdb";

type TrailerPlayerProps = {
  trailer: Video;
  lang?: string;
};

export function TrailerPlayer({ trailer, lang = "en" }: TrailerPlayerProps) {
  return (
    <section className="trailer">
      <div className="section-heading">
        <h2>{t(lang, "detail.trailer")}</h2>
        <p>{trailer.name}</p>
      </div>
      <div className="trailer__frame">
        <iframe
          src={`https://www.youtube.com/embed/${trailer.key}?vq=hd2160&cc_load_policy=0`}
          title={trailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
