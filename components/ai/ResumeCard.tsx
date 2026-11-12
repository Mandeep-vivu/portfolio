import { Download } from "lucide-react";
import { safeHref } from "@/lib/url";

export default function ResumeCard({ url, title }: { url: string; title: string }) {
  const href = safeHref(url, { webOnly: true });
  if (!href) return null;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 p-3 transition hover:bg-primary/15">
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-slate-400">Open latest resume</span>
      </span>
      <Download size={18} className="text-cyan-300" />
    </a>
  );
}
