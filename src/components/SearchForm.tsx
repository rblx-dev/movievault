"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SearchFormProps = {
  compact?: boolean;
  initialQuery?: string;
  autofocus?: boolean;
};

export function SearchForm({ compact = false, initialQuery = "", autofocus = false }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={compact ? "search-form search-form--compact" : "search-form"} onSubmit={onSubmit}>
      <label className="sr-only" htmlFor={compact ? "header-search" : "page-search"}>
        Search movies and TV shows
      </label>
      <input
        id={compact ? "header-search" : "page-search"}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={compact ? "Search titles…" : "Search movies, shows, people…"}
        autoFocus={autofocus}
        autoComplete="off"
      />
      <button type="submit">Search</button>
    </form>
  );
}
