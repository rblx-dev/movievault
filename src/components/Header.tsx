import Link from "next/link";
import { Clock } from "./Clock";
import { SearchForm } from "./SearchForm";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { t } from "@/lib/i18n";

type HeaderProps = {
  lang?: string;
};

export function Header({ lang = "en" }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <Clock />
          <Link href="/" className="brand-mark" aria-label="MovieVault home">
            <span className="brand-mark__m">M</span>
            <span className="brand-mark__slash" aria-hidden>
              <svg viewBox="0 0 18 36" width="0.42em" height="0.95em" focusable="false">
                <path
                  d="M14.2 2.2 L3.8 33.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="brand-mark__v">V</span>
          </Link>
        </div>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/#trending" className="site-nav__link">
            {t(lang, "nav.trending")}
          </Link>
          <Link href="/#movies" className="site-nav__link">
            {t(lang, "nav.films")}
          </Link>
          <Link href="/#tv" className="site-nav__link">
            {t(lang, "nav.tv")}
          </Link>
        </nav>
        <div className="site-header__actions">
          <ThemeToggle />
          <LanguageSelector
            lang={lang}
            ariaLabel={t(lang, "selector.aria")}
            autoLabel={t(lang, "selector.auto")}
          />
          <div className="site-header__search">
            <SearchForm
              compact
              placeholder={t(lang, "search.placeholder")}
              label={t(lang, "search.label")}
              submitLabel={t(lang, "search.button")}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
