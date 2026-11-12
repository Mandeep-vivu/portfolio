"use client";

import { usePortfolio } from "@/components/providers/PortfolioProvider";
import type { TimelineEntry } from "@/lib/portfolio/types";
import { Section } from "./Shell";

const KIND: Record<TimelineEntry["type"], string> = {
  education: "Education",
  experience: "Work",
  leadership: "Leadership",
};

/** Latest year mentioned in an entry such as "Jun 2022 - Apr 2023". */
function latestYear(entry: TimelineEntry): number {
  if (/present|current/i.test(entry.year)) return Number.MAX_SAFE_INTEGER;
  const years = entry.year.match(/(?:19|20)\d{2}/g)?.map(Number) ?? [0];
  return Math.max(...years);
}

export default function Path() {
  const { education, experience } = usePortfolio();
  const entries = [...education, ...experience].sort((a, b) => latestYear(b) - latestYear(a));

  return (
    <Section id="path" title="Path so far" lead="Education and experience, most recent first.">
      <ol className="m-0 pl-0">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="grid list-none gap-x-8 gap-y-2 border-t border-rule py-6 first:border-ink md:grid-cols-12"
          >
            <div className="md:col-span-3">
              <p className="t-figure m-0 text-[1rem] font-bold">{entry.year}</p>
              <p className="t-narrow m-0 mt-1 text-quiet">{KIND[entry.type]}</p>
            </div>
            <div className="md:col-span-9">
              <h3 className="text-[1.2rem] font-bold leading-[1.3]">{entry.title}</h3>
              <p className="m-0 mt-0.5 font-medium text-cobalt">{entry.org}</p>
              <p className="m-0 mt-3 max-w-[66ch] text-quiet">{entry.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
