import type { Metadata } from "next";
import { Archivo_Black, Figtree, Permanent_Marker } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

const mark = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mark",
});

export const metadata: Metadata = {
  title: {
    default: "MovieVault",
    template: "%s · MovieVault",
  },
  description:
    "Personal movie and TV discovery — trending titles, search, cast, ratings, genres, and trailers via TMDB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mark.variable} h-full antialiased`}
    >
      <body className="site-shell">
        <Header />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>
              MovieVault for{" "}
              <strong>{process.env.TMDB_ACCOUNT || "patrickstarbutsmart"}</strong>
            </p>
            <p>
              Data from{" "}
              <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
                TMDB
              </a>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
