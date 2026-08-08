import type { Metadata } from "next";
import { MediaCard } from "@/components/MediaCard";
import { SearchForm } from "@/components/SearchForm";
import { resolveMediaType, searchMulti } from "@/lib/tmdb";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search “${q}”` : "Search",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const data = query ? await searchMulti(query) : null;
  const results =
    data?.results.filter((item) => {
      const type = resolveMediaType(item);
      return type === "movie" || type === "tv";
    }) || [];

  return (
    <div className="page-wrap">
      <div className="search-page__intro">
        <h1>Search the vault</h1>
        <SearchForm initialQuery={query} autofocus />
        {query ? (
          <p>
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </p>
        ) : (
          <p>Find movies and TV shows by title.</p>
        )}
      </div>

      {query && results.length === 0 && (
        <p className="empty-state">No titles matched that search. Try another name.</p>
      )}

      {results.length > 0 && (
        <div className="search-grid">
          {results.map((item) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              mediaType={resolveMediaType(item) || undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
