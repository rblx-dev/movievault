import Link from "next/link";
import { SearchForm } from "./SearchForm";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
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
        <nav className="site-nav" aria-label="Primary">
          <Link href="/#trending">Trending</Link>
          <Link href="/#movies">Movies</Link>
          <Link href="/#tv">TV</Link>
        </nav>
        <div className="site-header__search">
          <SearchForm compact />
        </div>
      </div>
    </header>
  );
}
