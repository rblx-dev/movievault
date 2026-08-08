import type { Metadata } from "next";
import { DetailView } from "@/components/DetailView";
import { displayTitle, getMovieDetails } from "@/lib/tmdb";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
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
  const details = await getMovieDetails(id);
  return <DetailView details={details} type="movie" />;
}
