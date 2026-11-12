"use client";

import { ArrowUpRight } from "lucide-react";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import type { Achievement } from "@/lib/portfolio/types";
import { safeHref } from "@/lib/url";
import { Section, textLink } from "./Shell";

const GROUPS: Array<{ types: Achievement["type"][]; title: string }> = [
  { types: ["certification", "academic"], title: "Certifications and exams" },
  { types: ["award"], title: "Awards" },
  { types: ["leadership"], title: "Leadership" },
];

export default function Recognition() {
  const { certifications } = usePortfolio();

  return (
    <Section id="recognition" title="Recognition">
      <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
        {GROUPS.map((group) => {
          const items = certifications.filter((entry) => group.types.includes(entry.type));
          if (items.length === 0) return null;

          return (
            <div key={group.title}>
              <h3 className="t-wide border-b border-ink pb-3 text-[1.1rem] font-bold">{group.title}</h3>
              <ul className="m-0 pl-0">
                {items.map((entry) => {
                  const link = safeHref(entry.link, { webOnly: true });
                  return (
                    <li key={entry.id} className="list-none border-b border-rule py-5">
                      <h4 className="text-[1.05rem] font-bold leading-[1.35]">{entry.title}</h4>
                      <p className="m-0 mt-2 text-[0.98rem] text-quiet">{entry.description}</p>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${textLink} mt-3 inline-flex items-center gap-1 text-[0.95rem]`}
                        >
                          View certificate
                          <ArrowUpRight size={15} aria-hidden />
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
