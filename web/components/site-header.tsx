"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpenText,
  Books,
  Bookmarks,
  Compass,
  GithubLogo,
  List,
  Notebook,
  Question,
  Terminal,
  Users,
  X,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  /** Shown in the mobile menu only; the bar has no room for it. */
  blurb: string;
  /** Kept out of the desktop bar, which carries only the primary routes. */
  mobileOnly?: boolean;
};

const NAV: NavItem[] = [
  {
    href: "/book",
    label: "The book",
    icon: BookOpenText,
    blurb: "Eighteen chapters, five parts",
  },
  {
    href: "/actuarial-ai",
    label: "Domains",
    icon: Compass,
    blurb: "Pricing, reserving, life, risk",
  },
  {
    href: "/glossary",
    label: "Glossary",
    icon: Bookmarks,
    blurb: "The vocabulary, defined",
  },
  {
    href: "/book/primer",
    label: "The primer",
    icon: Notebook,
    blurb: "The argument, abridged",
    mobileOnly: true,
  },
  {
    href: "/authors",
    label: "The authors",
    icon: Users,
    blurb: "Who wrote this, and why",
    mobileOnly: true,
  },
  {
    href: "/faq",
    label: "Questions",
    icon: Question,
    blurb: "What readers ask first",
    mobileOnly: true,
  },
  {
    href: "/resources",
    label: "Sources and standards",
    icon: Books,
    blurb: "What the book cites",
    mobileOnly: true,
  },
];

/** True for the page itself and anything beneath it, so a chapter page
 * still lights up "The book". `/` never matches by prefix. */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close on navigation: the panel outlives the click that follows a link.
  useEffect(() => setOpen(false), [pathname]);

  // The bar is transparent over the top of the page and only frosts once
  // content starts passing underneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const barLinks = NAV.filter((item) => !item.mobileOnly);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled || open
          ? "border-border bg-navy-900/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent"
      )}
    >
      <div className={cn(CONTAINER, "relative")}>
        <div className="flex h-16 items-center gap-1">
          <Link
            href="/"
            className="mr-auto whitespace-nowrap font-serif text-[15px] text-cream-100 sm:text-base"
          >
            Agentic AI <span className="text-gold-400">for Actuaries</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {barLinks.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-navy-800 text-cream-100"
                      : "text-foreground hover:bg-navy-800/70 hover:text-cream-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="hidden size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-navy-800 hover:text-cream-100 sm:inline-flex"
          >
            <GithubLogo size={18} aria-hidden="true" />
          </a>

          <Link
            href="/code"
            className={cn(
              "hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold-400/40 px-3.5 text-sm text-gold-300 transition-colors hover:border-gold-400/70 hover:bg-gold-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:inline-flex",
              isActive(pathname, "/code") && "border-gold-400/70 bg-gold-400/10"
            )}
          >
            <Terminal size={16} aria-hidden="true" />
            Run the code
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-cream-100 transition-colors hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 md:hidden"
          >
            {open ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <List size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            aria-label="Site"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-border bg-navy-900/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl md:hidden"
          >
            <Link
              href="/code"
              className="flex items-center gap-3 rounded-xl border border-gold-400/40 bg-gold-400/10 px-3 py-3 text-gold-300"
            >
              <Terminal size={20} weight="duotone" aria-hidden="true" />
              <span>
                <span className="block text-[15px] leading-tight">
                  Run the code
                </span>
                <span className="block text-xs text-gold-300/70">
                  Nine chapters, runnable in the browser
                </span>
              </span>
            </Link>

            <ul className="mt-1">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                        active ? "bg-navy-800" : "hover:bg-navy-800/70"
                      )}
                    >
                      <Icon
                        size={20}
                        weight="duotone"
                        aria-hidden="true"
                        className={cn(
                          "shrink-0",
                          active ? "text-gold-400" : "text-cream-400"
                        )}
                      />
                      <span>
                        <span className="block text-[15px] leading-tight text-cream-100">
                          {item.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {item.blurb}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-navy-800/70"
                >
                  <GithubLogo
                    size={20}
                    weight="duotone"
                    aria-hidden="true"
                    className="shrink-0 text-cream-400"
                  />
                  <span>
                    <span className="block text-[15px] leading-tight text-cream-100">
                      GitHub
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      The companion repository
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 -z-10 h-svh w-full cursor-default md:hidden"
        />
      )}
    </header>
  );
}
