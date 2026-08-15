"use client";

import { useEffect, useState } from "react";
import { NotifyForm } from "@/components/notify-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "notify-popup-seen";
const DELAY_MS = 5000;

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Storage unavailable (private mode); the popup may show again next visit.
  }
}

export function NotifyPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) markSeen();
      }}
    >
      <DialogContent className="border border-border bg-navy-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg text-cream-100">
            Get notified at launch
          </DialogTitle>
          <DialogDescription>
            Agentic AI for Actuaries arrives later this year, free from ACTEX.
            Leave your email and we will send one message when it ships.
          </DialogDescription>
        </DialogHeader>
        <NotifyForm onSuccess={markSeen} />
      </DialogContent>
    </Dialog>
  );
}
