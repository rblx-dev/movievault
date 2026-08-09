"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { getSelectedLanguage } from "@/lib/locale";

const LANGUAGE_CODES = [
  "af", "sq", "am", "ar", "hy", "az", "eu", "be", "bn", "bs",
  "bg", "my", "ca", "zh", "hr", "cs", "da", "nl", "en", "et",
  "fi", "fr", "gl", "ka", "de", "el", "gu", "ht", "he", "hi",
  "hu", "is", "id", "ga", "it", "ja", "kn", "kk", "km", "ko",
  "ku", "ky", "lo", "lv", "lt", "lb", "mk", "ms", "ml", "mt",
  "mr", "mn", "ne", "no", "or", "ps", "fa", "pl", "pt", "pa",
  "ro", "ru", "sr", "si", "sk", "sl", "es", "sw", "sv", "ta",
  "te", "th", "tr", "uk", "ur", "uz", "vi", "cy", "zu",
];

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

export function LanguageSelector() {
  const [value, setValue] = useState("");
  const [detected, setDetected] = useState<string | null>(null);

  useEffect(() => {
    setValue(getSelectedLanguage() ?? "");
    const first = navigator.languages?.[0]?.split("-")[0];
    if (first) setDetected(first);
  }, []);

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    try {
      if (next) {
        window.localStorage.setItem("mv.language", next);
      } else {
        window.localStorage.removeItem("mv.language");
      }
    } catch {
      void 0;
    }
    window.location.reload();
  }

  const autoLabel = detected ? `Auto (${nativeName(detected)})` : "Auto";

  return (
    <label className="lang-select">
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
      <select value={value} onChange={onChange} aria-label="Trailer language">
        <option value="">{autoLabel}</option>
        {OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
