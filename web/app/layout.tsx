import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
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
  title: {
    default: "Agentic AI for Actuaries",
    template: "%s · Agentic AI for Actuaries",
  },
  description:
    "Companion site for the book Agentic AI for Actuaries: run the actuarial tools in your browser, watch the agents work, and open every chapter in Colab.",
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
          <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="font-serif text-base text-cream-100 sm:text-lg"
            >
              Agentic AI <span className="text-gold-400">for Actuaries</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link
                href="/code"
                className="text-foreground transition-colors hover:text-cream-100"
              >
                Run the code
              </Link>
              <a
                href="https://github.com/rohanyashraj/agentic-ai-for-actuaries-code"
                target="_blank"
                rel="noreferrer"
                className="hidden text-foreground transition-colors hover:text-cream-100 sm:block"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>
              Companion code for{" "}
              <span className="text-cream-200">Agentic AI for Actuaries</span>
            </p>
            <p>
              All data is synthetic. Agent runs use Gemini; browser demos run
              locally via Python in WebAssembly.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
