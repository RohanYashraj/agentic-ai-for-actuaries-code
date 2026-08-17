"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Counts a stat up on first reveal. Renders the final number statically;
 * the animation only rewinds it when motion is allowed. */
export function StatValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const target = Number(value);
      if (!Number.isFinite(target) || !ref.current) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 0.8,
          ease: "power1.out",
          snap: { n: 1 },
          scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
          onUpdate: () => {
            if (ref.current) ref.current.textContent = String(obj.n);
          },
        });
      });
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className="font-serif text-4xl text-cream-100">
      {value}
    </span>
  );
}
