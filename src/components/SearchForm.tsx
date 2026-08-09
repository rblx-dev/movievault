"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SearchFormProps = {
  compact?: boolean;
  initialQuery?: string;
  autofocus?: boolean;
  placeholder?: string;
  label?: string;
  submitLabel?: string;
};

export function SearchForm({
  compact = false,
  initialQuery = "",
  autofocus = false,
  placeholder,
  label = "Search movies and TV shows",
  submitLabel = "Search",
}: SearchFormProps) {
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
        {label}
      </label>
      <input
        id={compact ? "header-search" : "page-search"}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? (compact ? "Search titles…" : "Search movies, shows, people…")}
        autoFocus={autofocus}
        autoComplete="off"
      />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
