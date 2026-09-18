"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  GithubLogo,
  List,
  Sparkle,
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

/** Every route the site has, all visible from lg up. Nothing hides in a
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

  // Frost header on scroll
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled || open
          ? "border-b border-white/10 bg-[#0b1120]/85 text-white backdrop-blur-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]"
          : "border-b border-white/5 bg-[#0b1120]/50 text-white backdrop-blur-md"
      )}
    >
      <div className={cn(CONTAINER, "relative")}>
        <div className="flex h-16 items-center gap-2">
          <Link
            href="/"
            className="group mr-auto flex items-center gap-2.5 whitespace-nowrap font-serif text-[15px] sm:text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-amber-600 text-navy-950 shadow-sm shadow-amber-500/20">
              <BookOpenText size={16} weight="bold" />
            </span>
            <span>
              Agentic AI{" "}
              <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                for Actuaries
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white/10 text-white border border-white/15 shadow-sm shadow-black/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
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
            className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-white/5 text-slate-400 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white sm:inline-flex"
          >
            <GithubLogo size={18} aria-hidden="true" />
          </a>

          {/* Unified Poppy Book Launch CTA in Header */}
          <a
            href={ACTEX_BOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff451a] via-[#ff8a00] to-[#f59e0b] px-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,87,34,0.35)] transition-all hover:shadow-[0_0_28px_rgba(255,87,34,0.6)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5722] sm:inline-flex"
          >
            <Sparkle size={13} weight="fill" className="animate-spin text-amber-200 [animation-duration:6s]" />
            <span>Get the book</span>
            <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/10 lg:hidden"
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
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto border-b border-white/10 bg-[#060913]/95 p-3 shadow-2xl backdrop-blur-2xl lg:hidden"
          >
            <a
              href={ACTEX_BOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#ff451a] via-[#ff8a00] to-[#f59e0b] p-3.5 text-white shadow-lg shadow-orange-500/20"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/20 text-white">
                <BookOpenText size={20} weight="duotone" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[15px] leading-tight font-bold">
                  Get the book, free
                </span>
                <span className="block text-xs text-white/80">
                  From ACTEX Learning
                </span>
              </span>
              <ArrowUpRight
                size={18}
                weight="bold"
                aria-hidden="true"
                className="ml-auto"
              />
            </a>

            <ul className="mt-2 space-y-1">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                        active ? "bg-white/10 text-white border border-white/10" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon
                        size={20}
                        weight="duotone"
                        aria-hidden="true"
                        className={cn(
                          "shrink-0",
                          active ? "text-gold-400" : "text-slate-400"
                        )}
                      />
                      <span>
                        <span className="block text-[14px] leading-tight font-medium">
                          {item.label}
                        </span>
                        <span className="block text-xs text-slate-400">
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
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <GithubLogo
                    size={20}
                    weight="duotone"
                    aria-hidden="true"
                    className="shrink-0 text-slate-400"
                  />
                  <span>
                    <span className="block text-[14px] leading-tight font-medium">
                      GitHub
                    </span>
                    <span className="block text-xs text-slate-400">
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
          className="fixed inset-0 -z-10 h-svh w-full cursor-default lg:hidden"
        />
      )}
    </header>
  );
}
