"use client";

import { Download } from "lucide-react";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { safeHref } from "@/lib/url";
import { Container } from "./Shell";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#path", label: "Path" },
  { href: "#recognition", label: "Recognition" },
  { href: "#contact", label: "Contact" },
];

export default function SiteHeader() {
  const { profile } = usePortfolio();
  const resume = safeHref(profile.resumeUrl, { webOnly: true });

  return (
    <header className="sticky top-0 z-50 border-b border-ink/15 bg-paper/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a href="#top" className="t-wide shrink-0 text-[1.05rem] font-extrabold tracking-[-0.01em]">
          {profile.name}
        </a>
        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[0.95rem] font-medium text-quiet">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="py-2 transition-colors hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {resume && (
          <a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-[6px] bg-ink px-4 py-2.5 text-[0.9rem] font-semibold leading-none text-white transition-colors hover:bg-cobalt"
          >
            <Download size={15} aria-hidden />
            Résumé
          </a>
        )}
      </Container>
      {/* Small screens: the same links as one swipeable row, no menu to open. */}
      <nav aria-label="Sections" className="border-t border-ink/10 md:hidden">
        <ul className="hide-scrollbar flex gap-6 overflow-x-auto px-5 py-2.5 text-[0.9rem] font-medium text-quiet">
          {LINKS.map((link) => (
            <li key={link.href} className="shrink-0">
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
