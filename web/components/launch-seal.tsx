import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { ACTEX_BOOK_URL } from "@/lib/links";

/** The bookseller's sticker on the hero cover: a tangerine seal whose ring of
 * text turns slowly, announcing that the book is published and free. It
 * is a link to the ACTEX page, so the flashiest thing in the hero is also
 * the most useful one. Reduced motion stops the ring. */
export function LaunchSeal() {
  return (
    <a
      href={ACTEX_BOOK_URL}
      target="_blank"
      rel="noreferrer"
      data-hero-seal
      className="launch-seal"
      aria-label="Out now, free from ACTEX Learning. Get the book"
    >
      <span className="launch-seal-body">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <defs>
            <path
              id="launch-seal-ring"
              d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
            />
          </defs>
          <circle cx="60" cy="60" r="58" className="launch-seal-disc" />
          <circle cx="60" cy="60" r="33" className="launch-seal-inner" />
          <text className="launch-seal-text" textLength="282" lengthAdjust="spacing">
            <textPath href="#launch-seal-ring" textLength="282" lengthAdjust="spacing">
              OUT NOW · FREE · OUT NOW · FREE ·
            </textPath>
          </text>
        </svg>
        <span className="launch-seal-core">
          <span>Get it</span>
          <ArrowUpRight size={20} weight="bold" aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}
