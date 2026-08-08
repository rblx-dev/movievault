import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaCard } from "@/components/MediaCard";
import { Reveal } from "@/components/Reveal";
import {
  getPersonDetails,
  MediaType,
  profileUrl,
  resolveMediaType,
} from "@/lib/tmdb";

type PersonPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPersonDetails(id);
    return {
      title: person.name,
      description: person.biography
        ? person.biography.slice(0, 160)
        : `Profile for ${person.name} on MovieVault.`,
    };
  } catch {
    return { title: "Person" };
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  let person;
  try {
    person = await getPersonDetails(id);
  } catch {
    notFound();
  }

  if (!person?.id) notFound();

  const photo = profileUrl(person.profile_path, "h632");
  const birthday = formatDate(person.birthday);
  const deathday = formatDate(person.deathday);

  const knownFor = [...(person.combined_credits?.cast || [])]
    .filter((credit) => {
      const type = resolveMediaType(credit) || credit.media_type;
      return (type === "movie" || type === "tv") && (credit.poster_path || credit.backdrop_path);
    })
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .filter((credit, index, list) => {
      const type = (resolveMediaType(credit) || credit.media_type) as MediaType;
      const key = `${type}-${credit.id}`;
      return list.findIndex((item) => {
        const itemType = (resolveMediaType(item) || item.media_type) as MediaType;
        return `${itemType}-${item.id}` === key;
      }) === index;
    })
    .slice(0, 12);

  return (
    <article className="person page-wrap">
      <Reveal className="person__layout" as="div">
        <div className="person__portrait rise-stagger" style={{ "--stagger": "0" } as CSSProperties}>
          <div className="person__photo">
            {photo ? (
              <Image
                src={photo}
                alt={person.name}
                fill
                priority
                sizes="(max-width: 720px) 70vw, 280px"
                className="person__photo-img"
              />
            ) : (
              <div className="person__photo-fallback" aria-hidden>
                {person.name.slice(0, 1)}
              </div>
            )}
          </div>
        </div>

        <div className="person__copy">
          <p
            className="detail__eyebrow rise-stagger"
            style={{ "--stagger": "1" } as CSSProperties}
          >
            <Link href="/">MovieVault</Link>
            <span aria-hidden> / </span>
            Person
          </p>
          <h1
            className="person__name rise-stagger"
            style={{ "--stagger": "2" } as CSSProperties}
          >
            {person.name}
          </h1>
          {person.known_for_department && (
            <p
              className="person__department rise-stagger"
              style={{ "--stagger": "3" } as CSSProperties}
            >
              Known for {person.known_for_department}
            </p>
          )}

          <div
            className="detail__facts rise-stagger"
            style={{ "--stagger": "4" } as CSSProperties}
          >
            {birthday && <span>Born {birthday}</span>}
            {deathday && <span>Died {deathday}</span>}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>

          <p
            className="person__biography rise-stagger"
            style={{ "--stagger": "5" } as CSSProperties}
          >
            {person.biography?.trim() ||
              "No biography is available for this person on TMDB yet."}
          </p>

          {person.also_known_as?.length > 0 && (
            <p
              className="person__aka rise-stagger"
              style={{ "--stagger": "6" } as CSSProperties}
            >
              Also known as {person.also_known_as.slice(0, 4).join(" · ")}
            </p>
          )}
        </div>
      </Reveal>

      {knownFor.length > 0 && (
        <Reveal className="person__known-for" as="section">
          <div className="section-heading">
            <h2>Known for</h2>
            <p>Notable film and television credits drawn from TMDB.</p>
          </div>
          <div className="search-grid">
            {knownFor.map((credit, index) => {
              const type = (resolveMediaType(credit) || credit.media_type) as MediaType;
              return (
                <MediaCard
                  key={`${type}-${credit.id}`}
                  item={{ ...credit, media_type: type }}
                  mediaType={type}
                  priority={index < 4}
                />
              );
            })}
          </div>
        </Reveal>
      )}
    </article>
  );
}
