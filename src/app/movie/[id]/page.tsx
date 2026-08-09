import type { Metadata } from "next";
import { DetailView } from "@/components/DetailView";
import { getSiteLang } from "@/lib/site-lang";
import { displayTitle, getMovieDetails } from "@/lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const lang = await getSiteLang();
  try {
    const movie = await getMovieDetails(id, lang);
    return {
      title: displayTitle(movie),
      description: movie.overview,
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const lang = await getSiteLang();
  const details = await getMovieDetails(id, lang);
  return <DetailView details={details} type="movie" lang={lang} />;
}
