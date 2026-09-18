"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Homepage hero entrance. Staggers [data-hero-item] elements top to
 * bottom, then brings in [data-hero-cover]. Reduced motion: everything stays static. */
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
      // Below lg the cover sits above the words, so it enters first;
      // from lg the words lead and the cover on the right follows.
      const coverFirst = window.matchMedia("(max-width: 1023px)").matches;
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out", duration: 0.5 },
        });
        const items = () =>
          tl.from("[data-hero-item]", { opacity: 0, y: 14, stagger: 0.06 }, coverFirst ? "-=0.3" : undefined);
        const cover = () => {
          tl.from(
            "[data-hero-cover]",
            { opacity: 0, y: 10, duration: 0.6 },
            coverFirst ? undefined : "-=0.3"
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
