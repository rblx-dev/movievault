"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getSelectedLanguage } from "@/lib/locale";
import { LANGUAGE_CODES, LANGUAGE_COOKIE } from "@/lib/language-codes";

type LanguageSelectorProps = {
  lang?: string;
  ariaLabel?: string;
  autoLabel?: string;
};

function englishName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;
  } catch {
    return code;
  }
}

function nativeName(code: string): string {
  try {
    return (
      new Intl.DisplayNames([code], { type: "language" }).of(code) ||
      englishName(code)
    );
  } catch {
    return englishName(code);
  }
}

const OPTIONS = LANGUAGE_CODES.map((code) => ({
  code,
  label: nativeName(code),
  sort: englishName(code),
})).sort((a, b) => a.sort.localeCompare(b.sort, "en"));

const storageSubscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};

const storageSnapshot = () => getSelectedLanguage() ?? "";
const serverSnapshot = () => "";
const detectedSnapshot = () => navigator.languages?.[0]?.split("-")[0] ?? null;
const detectedServerSnapshot = () => null;
const noopSubscribe = () => () => {};

export function LanguageSelector({
  ariaLabel = "Site language",
  autoLabel = "Auto",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const value = useSyncExternalStore(
    storageSubscribe,
    storageSnapshot,
    serverSnapshot,
  );
  const detected = useSyncExternalStore(
    noopSubscribe,
    detectedSnapshot,
    detectedServerSnapshot,
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const autoLabelText = detected
    ? `${autoLabel} (${nativeName(detected)})`
    : autoLabel;

  const current = value ? OPTIONS.find((option) => option.code === value) : null;
  const currentLabel = current ? current.label : autoLabelText;

  function choose(next: string) {
    try {
      if (next) {
        window.localStorage.setItem("mv.language", next);
      } else {
        window.localStorage.removeItem("mv.language");
      }
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=${
        next ? 31536000 : 0
      }; samesite=lax`;
    } catch {
      // ignore storage failures
    }
    window.location.reload();
  }

  return (
    <div className="lang-select" ref={rootRef}>
      <button
        type="button"
        className="lang-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span className="lang-select__globe" aria-hidden>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
          </svg>
        </span>
        <span className="lang-select__value">{currentLabel}</span>
        <span className="lang-select__caret" aria-hidden />
      </button>
      <div
        className={`lang-select__menu${open ? " is-open" : ""}`}
        role="listbox"
        aria-label={ariaLabel}
      >
        <button
          type="button"
          role="option"
          aria-selected={!value}
          className={`lang-select__item${!value ? " is-active" : ""}`}
          onClick={() => choose("")}
        >
          <span className="lang-select__check" aria-hidden>
            {!value ? "✓" : ""}
          </span>
          {autoLabelText}
        </button>
        <div className="lang-select__divider" aria-hidden />
        {OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            role="option"
            aria-selected={option.code === value}
            className={`lang-select__item${option.code === value ? " is-active" : ""}`}
            onClick={() => choose(option.code)}
          >
            <span className="lang-select__check" aria-hidden>
              {option.code === value ? "✓" : ""}
            </span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
