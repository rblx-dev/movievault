import Image from "next/image";
import { CastMember, profileUrl } from "@/lib/tmdb";

type CastStripProps = {
  cast: CastMember[];
};

export function CastStrip({ cast }: CastStripProps) {
  const top = cast.slice(0, 12);
  if (!top.length) return null;

  return (
    <section className="cast-strip">
      <div className="section-heading">
        <h2>Cast</h2>
        <p>Principal performers billed for this title.</p>
      </div>
      <div className="cast-rail">
        {top.map((person) => {
          const photo = profileUrl(person.profile_path);
          return (
            <article key={person.id} className="cast-card">
              <div className="cast-card__photo">
                {photo ? (
                  <Image src={photo} alt={person.name} fill sizes="120px" />
                ) : (
                  <div className="cast-card__fallback" aria-hidden>
                    {person.name.slice(0, 1)}
                  </div>
                )}
              </div>
              <h3>{person.name}</h3>
              <p>{person.character}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
