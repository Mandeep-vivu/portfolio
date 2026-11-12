"use client";

import { usePortfolio } from "@/components/providers/PortfolioProvider";
import type { Skill } from "@/lib/portfolio/types";
import { Section } from "./Shell";

const GROUPS: Array<{ id: Skill["category"]; title: string }> = [
  { id: "ai", title: "AI, ML and data" },
  { id: "fullstack", title: "Full stack and cloud" },
  { id: "tools", title: "Tools and foundations" },
];

export default function Skills() {
  const { skills } = usePortfolio();

  return (
    <Section
      id="skills"
      title="Skills"
      lead="Ordered by how much I use each one. The bar is my own estimate of fluency, from working knowledge to daily use."
    >
      <div className="grid gap-12 md:grid-cols-3 md:gap-8">
        {GROUPS.map((group) => {
          const items = skills
            .filter((skill) => skill.category === group.id)
            .sort((a, b) => b.level - a.level);
          if (items.length === 0) return null;

          return (
            <div key={group.id}>
              <h3 className="t-wide border-b border-ink pb-3 text-[1.1rem] font-bold">{group.title}</h3>
              <ul className="m-0 pl-0">
                {items.map((skill) => (
                  <li key={skill.name} className="list-none border-b border-rule py-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-semibold">{skill.name}</span>
                      <span className="sr-only">fluency {skill.level} out of 100</span>
                    </div>
                    <div aria-hidden className="mt-2 h-[3px] w-full bg-rule">
                      <div className="h-full bg-cobalt" style={{ width: `${skill.level}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
