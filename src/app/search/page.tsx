import type { Metadata } from "next";
import { MediaCard } from "@/components/MediaCard";
import { SearchForm } from "@/components/SearchForm";
import { t } from "@/lib/i18n";
import { getSiteLang } from "@/lib/site-lang";
import { resolveMediaType, searchMulti } from "@/lib/tmdb";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const lang = await getSiteLang();
  return {
    title: q ? `${q} — ${t(lang, "search.title")}` : t(lang, "search.title"),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const lang = await getSiteLang();
  const { q = "" } = await searchParams;
  const query = q.trim();
  const data = query ? await searchMulti(query, "1", lang) : null;
  const results =
    data?.results.filter((item) => {
      const type = resolveMediaType(item);
      return type === "movie" || type === "tv";
    }) || [];

  const count = results.length;
  const resultLine = count === 1
    ? t(lang, "search.resultFor", { COUNT: String(count), QUERY: query })
    : t(lang, "search.resultsFor", { COUNT: String(count), QUERY: query });

  return (
    <div className="page-wrap">
      <div className="search-page__intro">
        <h1>{t(lang, "search.title")}</h1>
        <SearchForm
          initialQuery={query}
          autofocus
          placeholder={t(lang, "search.placeholderFull")}
          label={t(lang, "search.label")}
          submitLabel={t(lang, "search.button")}
        />
        {query ? <p>{resultLine}</p> : <p>{t(lang, "search.emptyHint")}</p>}
      </div>

      {query && results.length === 0 && (
        <p className="empty-state">{t(lang, "search.emptyState")}</p>
      )}

      {results.length > 0 && (
        <div className="search-grid">
          {results.map((item) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              mediaType={resolveMediaType(item) || undefined}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
