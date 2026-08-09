import type { Metadata } from "next";
import Script from "next/script";
import { Archivo_Black, Figtree, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { t } from "@/lib/i18n";
import { getSiteLang } from "@/lib/site-lang";
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
    "Personal movie and TV discovery — trending titles, search, cast, ratings, genres, and trailers.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getSiteLang();
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mark.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mv-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}else if(window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="site-shell">
        <Header lang={lang} />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>
              © MovieVault 2026, {t(lang, "footer.rights")}
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
