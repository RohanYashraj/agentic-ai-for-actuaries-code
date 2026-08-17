"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Homepage hero entrance. Staggers [data-hero-item] elements top to
 * bottom, then brings in [data-hero-cover]. Replaces the CSS hero-rise
 * animation. Reduced motion: everything stays static. */
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
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out", duration: 0.5 },
        });
        tl.from("[data-hero-item]", { opacity: 0, y: 14, stagger: 0.06 });
        tl.from(
          "[data-hero-cover]",
          { opacity: 0, y: 10, duration: 0.6 },
          "-=0.3"
        );
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
