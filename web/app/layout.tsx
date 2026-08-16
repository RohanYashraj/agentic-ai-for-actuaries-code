import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/site-footer";
import { GITHUB_REPO } from "@/lib/links";
import {
  AUTHORS,
  BOOK_KEYWORDS,
  BOOK_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { cn, CONTAINER } from "@/lib/utils";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: ${BOOK_SUBTITLE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: BOOK_KEYWORDS,
  authors: AUTHORS.map((a) => ({ name: a.name })),
  creator: AUTHORS.map((a) => a.name).join(", "),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: "/",
    title: `${SITE_NAME}: ${BOOK_SUBTITLE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/book-cover-photo.png",
        width: 1536,
        height: 1024,
        alt: "Cover of Agentic AI for Actuaries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: ${BOOK_SUBTITLE}`,
    description: SITE_DESCRIPTION,
  },
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-navy-900/90 backdrop-blur">
          <div
            className={cn(CONTAINER, "flex h-16 items-center justify-between gap-3")}
          >
            <Link
              href="/"
              className="whitespace-nowrap font-serif text-[15px] text-cream-100 sm:text-lg"
            >
              Agentic AI <span className="text-gold-400">for Actuaries</span>
            </Link>
            <nav className="flex shrink-0 items-center gap-3 text-sm sm:gap-4">
              <Link
                href="/book"
                className="hidden text-foreground transition-colors hover:text-cream-100 sm:inline"
              >
                The book
              </Link>
              <Link
                href="/actuarial-ai"
                className="hidden text-foreground transition-colors hover:text-cream-100 md:inline"
              >
                Domains
              </Link>
              <Link
                href="/glossary"
                className="hidden text-foreground transition-colors hover:text-cream-100 md:inline"
              >
                Glossary
              </Link>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
                className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-cream-100"
              >
                <GithubLogo size={18} aria-hidden="true" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <Link
                href="/code"
                className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-gold-400/40 px-3 text-xs text-gold-300 transition-colors hover:border-gold-400/70 hover:bg-gold-400/10 hover:text-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:h-8 sm:px-4 sm:text-sm"
              >
                Run the code
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
