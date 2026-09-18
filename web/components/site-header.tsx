"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  GithubLogo,
  List,
  Table,
  Terminal,
  Wrench,
  X,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { ACTEX_BOOK_URL, GITHUB_REPO } from "@/lib/links";
import { cn, CONTAINER } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  /** Shown in the mobile menu only; the bar has no room for it. */
  blurb: string;
};

/** Every route the site has, all visible from md up. Nothing hides in a
 * mobile-only list. */
const NAV: NavItem[] = [
  {
    href: "/code",
    label: "Run the code",
    icon: Terminal,
    blurb: "Nine chapters, three ways to run",
  },
  {
    href: "/setup",
    label: "Setup",
    icon: Wrench,
    blurb: "Colab, local install, limits",
  },
  {
    href: "/data",
    label: "Data",
    icon: Table,
    blurb: "The synthetic datasets",
  },
  {
    href: "/book",
    label: "The book",
    icon: BookOpenText,
    blurb: "Free from ACTEX Learning",
  },
];

/** True for the page itself and anything beneath it, so a chapter page
 * still lights up "Run the code". `/` never matches by prefix. */
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

  const onDark = !scrolled && !open;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        onDark
          ? "border-transparent bg-transparent text-cream-100"
          : "border-border bg-navy-900/70 text-cream-100 backdrop-blur-xl backdrop-saturate-150"
      )}
    >
      <div className={cn(CONTAINER, "relative")}>
        <div className="flex h-16 items-center gap-1">
          <Link
            href="/"
            className="mr-auto whitespace-nowrap font-serif text-[15px] sm:text-base"
          >
            Agentic AI{" "}
            <span className="text-gold-400">
              for Actuaries
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    onDark
                      ? active
                        ? "bg-cream-100/15 text-cream-100"
                        : "text-cream-400 hover:bg-cream-100/10 hover:text-cream-100"
                      : active
                        ? "bg-gold-400/10 text-cream-100"
                        : "text-muted-foreground hover:bg-navy-800 hover:text-cream-100"
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
            className={cn(
              "hidden size-9 shrink-0 items-center justify-center rounded-full transition-colors sm:inline-flex",
              onDark
                ? "text-cream-400 hover:bg-cream-100/10 hover:text-cream-100"
                : "text-muted-foreground hover:bg-navy-800 hover:text-cream-100"
            )}
          >
            <GithubLogo size={18} aria-hidden="true" />
          </a>

          <a
            href={ACTEX_BOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gold-400 px-3.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 sm:inline-flex"
          >
            <BookOpenText size={16} weight="bold" aria-hidden="true" />
            Get the book
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 md:hidden",
              onDark ? "text-cream-100 hover:bg-cream-100/10" : "text-cream-100 hover:bg-navy-800"
            )}
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
            <a
              href={ACTEX_BOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-gold-400 px-3 py-3 text-navy-950"
            >
              <BookOpenText size={20} weight="duotone" aria-hidden="true" />
              <span>
                <span className="block text-[15px] leading-tight font-medium">
                  Get the book, free
                </span>
                <span className="block text-xs text-navy-950/70">
                  Published by ACTEX Learning
                </span>
              </span>
              <ArrowUpRight
                size={16}
                weight="bold"
                aria-hidden="true"
                className="ml-auto"
              />
            </a>

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
                        active ? "bg-gold-400/10" : "hover:bg-navy-800"
                      )}
                    >
                      <Icon
                        size={20}
                        weight="duotone"
                        aria-hidden="true"
                        className={cn(
                          "shrink-0",
                          active ? "text-gold-300" : "text-muted-foreground"
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
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-navy-800"
                >
                  <GithubLogo
                    size={20}
                    weight="duotone"
                    aria-hidden="true"
                    className="shrink-0 text-muted-foreground"
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
