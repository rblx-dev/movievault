import type { Metadata } from "next";
import { DetailView } from "@/components/DetailView";
import { displayTitle, getTVDetails } from "@/lib/tmdb";

type TVPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const show = await getTVDetails(id);
    return {
      title: displayTitle(show),
      description: show.overview,
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const details = await getTVDetails(id);
  return <DetailView details={details} type="tv" />;
}
