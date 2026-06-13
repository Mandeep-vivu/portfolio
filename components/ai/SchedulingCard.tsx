import { CalendarDays } from "lucide-react";

function safeHref(href?: string) {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? href : "";
  } catch {
    return "";
  }
}

export default function SchedulingCard({ url }: { url: string }) {
  const safeUrl = safeHref(url);
  if (!safeUrl) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white">
      <iframe
        title="Schedule with Mandeep"
        src={safeUrl}
        className="h-[360px] w-full"
        loading="lazy"
      />
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#0b1020] p-3 text-xs font-semibold text-cyan-200 transition hover:bg-[#121a30]"
      >
        <CalendarDays size={14} /> Open Calendly in a new tab
      </a>
    </div>
  );
}
