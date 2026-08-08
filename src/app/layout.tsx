import type { Metadata } from "next";
import { Archivo_Black, Figtree, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
    "Personal movie and TV discovery — trending titles, search, cast, ratings, genres, and trailers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mark.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("mv-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}else if(window.matchMedia("(prefers-color-scheme: light)").matches){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="site-shell">
        <Header />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>© MovieVault 2026, All Rights Reserved.</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
