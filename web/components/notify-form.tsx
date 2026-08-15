"use client";

import { useState } from "react";
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
    <form
      className="flex w-full max-w-md gap-2"
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
        className="h-9 flex-1 rounded-md border border-input bg-navy-950/60 px-3 text-sm text-cream-100 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-gold-400"
      />
      <Button type="submit" size="sm" className="h-9" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Notify me at launch"}
      </Button>
      {state === "error" && (
        <p className="self-center text-xs text-run-err">{error}</p>
      )}
    </form>
  );
}
