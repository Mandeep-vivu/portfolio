"use client";

import { useEffect } from "react";
import { CalendarDays, ExternalLink } from "lucide-react";

function safeHref(href?: string) {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? href : "";
  } catch {
    return "";
  }
}

const isMessagePopped = (messageId: string): boolean => {
  if (typeof window === "undefined") return true;
  try {
    const popped = sessionStorage.getItem("calendly-popped-messages");
    if (popped) {
      const ids = JSON.parse(popped);
      return Array.isArray(ids) && ids.includes(messageId);
    }
  } catch {
    // Ignore errors
  }
  return false;
};

const markMessageAsPopped = (messageId: string) => {
  if (typeof window === "undefined") return;
  try {
    const popped = sessionStorage.getItem("calendly-popped-messages");
    let ids: string[] = [];
    if (popped) {
      ids = JSON.parse(popped);
      if (!Array.isArray(ids)) ids = [];
    }
    if (!ids.includes(messageId)) {
      ids.push(messageId);
      sessionStorage.setItem("calendly-popped-messages", JSON.stringify(ids));
    }
  } catch {
    // Ignore errors
  }
};

export default function SchedulingCard({ url, messageId }: { url: string; messageId?: string }) {
  const safeUrl = safeHref(url);

  const handleOpenPopup = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!safeUrl) return;

    // @ts-expect-error Calendly is loaded externally
    if (window.Calendly) {
      // @ts-expect-error Calendly is loaded externally
      window.Calendly.initPopupWidget({ url: safeUrl });
    } else {
      window.open(safeUrl, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    if (!safeUrl) return;

    // If messageId is provided and the message has already popped up in this session, do not auto-pop
    if (messageId && isMessagePopped(messageId)) {
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      // @ts-expect-error Calendly is loaded externally
      if (window.Calendly) {
        // @ts-expect-error Calendly is loaded externally
        window.Calendly.initPopupWidget({ url: safeUrl });
        if (messageId) {
          markMessageAsPopped(messageId);
        }
        clearInterval(interval);
      } else {
        attempts++;
        if (attempts > 30) {
          clearInterval(interval);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [safeUrl, messageId]);

  if (!safeUrl) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col items-center text-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/25 text-indigo-300">
        <CalendarDays size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-white">Schedule with Mandeep</h4>
        <p className="mt-1 text-xs text-slate-400 leading-normal max-w-xs">
          Select a time for a 30-minute meeting. The scheduler has opened in a popup window.
        </p>
      </div>
      <div className="flex w-full flex-col sm:flex-row gap-2 mt-1">
        <button
          onClick={handleOpenPopup}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/20 px-3 py-2 text-xs font-semibold text-indigo-100 hover:bg-primary/30 transition"
        >
          <CalendarDays size={13} /> Open Scheduler
        </button>
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-primary/40 transition"
        >
          <ExternalLink size={13} /> New Tab
        </a>
      </div>
    </div>
  );
}
