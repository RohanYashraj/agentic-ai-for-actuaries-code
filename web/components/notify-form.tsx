"use client";

import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function NotifyForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, setState] = useState<
    "idle" | "sending" | "done" | "already" | "error"
  >("idle");
  const [error, setError] = useState<string>("");

  if (state === "done") {
    return (
      <p className="text-sm text-run-ok">
        Thank you. We will email you when the book is released.
      </p>
    );
  }

  if (state === "already") {
    return (
      <p className="text-sm text-cream-200">
        You are already on the list. We will email you when the book is
        released.
      </p>
    );
  }

  return (
    // Stacked on a phone: the input and the button together need more
    // than 320px, and a row here pushed the button off the screen.
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        const email = new FormData(e.currentTarget).get("email");
        try {
          const res = await fetch("/api/py/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (res.ok) {
            const body = await res.json().catch(() => null);
            setState(body?.already ? "already" : "done");
            onSuccess?.();
          } else {
            const body = await res.json().catch(() => null);
            setError(body?.detail ?? "That did not go through. Try again.");
            setState("error");
          }
        } catch {
          setError("That did not go through. Try again.");
          setState("error");
        }
      }}
    >
      <label htmlFor="notify-email" className="sr-only">
        Email address
      </label>
      <input
        id="notify-email"
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="h-10 w-full min-w-0 rounded-md border border-input bg-navy-950/60 px-3 text-base text-cream-100 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-gold-400 sm:h-9 sm:flex-1 sm:text-sm"
      />
      <Button
        type="submit"
        size="sm"
        className="h-10 shrink-0 gap-1.5 sm:h-9"
        disabled={state === "sending"}
      >
        <PaperPlaneTilt size={15} aria-hidden="true" />
        {state === "sending" ? "Sending…" : "Notify me at launch"}
      </Button>
      {state === "error" && (
        <p className="text-xs text-run-err sm:self-center">{error}</p>
      )}
    </form>
  );
}
