import Link from "next/link";
import { SearchForm } from "./SearchForm";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand-mark" aria-label="MovieVault home">
          <span className="brand-mark__vault">Movie</span>
          <span className="brand-mark__name">Vault</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <Link href="/#trending">Trending</Link>
          <Link href="/#movies">Movies</Link>
          <Link href="/#tv">TV</Link>
          <Link href="/search">Search</Link>
        </nav>
        <div className="site-header__search">
          <SearchForm compact />
        </div>
      </div>
    </header>
  );
}
