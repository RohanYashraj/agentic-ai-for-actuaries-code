import { cn, CONTAINER } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div
        className={cn(
          CONTAINER,
          "flex flex-col gap-2 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <p>
          Companion code for{" "}
          <span className="font-serif text-cream-100">
            Agentic AI <span className="text-gold-400">for Actuaries</span>
          </span>
        </p>
        <p className="text-xs">
          © 2026 Satya Sai Mudigonda &amp; Rohan Yashraj Gupta
        </p>
      </div>
    </footer>
  );
}
