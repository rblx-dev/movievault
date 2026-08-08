import { Video } from "@/lib/tmdb";

type TrailerPlayerProps = {
  trailer: Video;
};

export function TrailerPlayer({ trailer }: TrailerPlayerProps) {
  return (
    <section className="trailer">
      <div className="section-heading">
        <h2>Trailer</h2>
        <p>{trailer.name}</p>
      </div>
      <div className="trailer__frame">
        <iframe
          src={`https://www.youtube.com/embed/${trailer.key}?vq=hd2160`}
          title={trailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}
