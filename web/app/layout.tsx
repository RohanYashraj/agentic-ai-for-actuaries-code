import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  AUTHORS,
  BOOK_KEYWORDS,
  BOOK_SUBTITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
