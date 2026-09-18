"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Homepage hero entrance. Staggers [data-hero-item] elements, then
 * brings in [data-hero-cover], its glow, and [data-hero-seal]. Clears
 * inline properties on completion to avoid trapped states. */
export function HeroIntro({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const coverFirst = window.matchMedia("(max-width: 1023px)").matches;
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out", duration: 0.5 },
        });
        const items = () =>
          tl.from(
            "[data-hero-item]",
            { opacity: 0, y: 14, stagger: 0.06, clearProps: "transform,opacity" },
            coverFirst ? "-=0.3" : undefined
          );
        const cover = () => {
          tl.from(
            "[data-hero-cover]",
            { opacity: 0, y: 10, duration: 0.6, clearProps: "transform,opacity" },
            coverFirst ? undefined : "-=0.3"
          );
          tl.from(
            "[data-hero-cover] .book-glow",
            { opacity: 0, scale: 0.7, duration: 1.2, ease: "power2.out", clearProps: "transform,opacity" },
            "<"
          );
          tl.from(
            "[data-hero-seal]",
            {
              opacity: 0,
              scale: 0.3,
              rotate: -35,
              duration: 0.7,
              ease: "back.out(2.2)",
              clearProps: "transform,opacity",
            },
            "-=0.9"
          );
        };
        if (coverFirst) {
          cover();
          items();
        } else {
          items();
          cover();
        }
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
