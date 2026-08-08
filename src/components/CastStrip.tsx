import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CastMember, profileUrl } from "@/lib/tmdb";

type CastStripProps = {
  cast: CastMember[];
};

export function CastStrip({ cast }: CastStripProps) {
  const top = cast.slice(0, 12);
  if (!top.length) return null;

  return (
    <Reveal as="section" className="cast-strip">
      <div className="section-heading">
        <h2>Cast</h2>
        <p>Principal performers billed for this title.</p>
      </div>
      <div className="cast-rail">
        {top.map((person, index) => {
          const photo = profileUrl(person.profile_path);
          return (
            <Link
              key={person.id}
              href={`/person/${person.id}`}
              className="cast-card rise-stagger"
              style={{ "--stagger": String(index) } as CSSProperties}
            >
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
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
