"use client";

import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { Section } from "./Shell";

export default function About() {
  const { profile } = usePortfolio();
  const hobbies = profile.hobbies ?? [];

  return (
    <Section id="about" title="About me">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="max-w-[60ch] text-[1.2rem] leading-[1.55]">{profile.bio}</p>
          {hobbies.length > 0 && (
            <div className="mt-8 max-w-[60ch]">
              <h3 className="text-[1rem] font-bold">Away from the keyboard</h3>
              <ul className="mt-3 grid gap-1.5 pl-0 text-quiet">
                {hobbies.map((hobby) => (
                  <li key={hobby} className="flex list-none gap-3">
                    <span aria-hidden className="mt-[0.75em] h-[2px] w-3 shrink-0 bg-quiet" />
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <dl className="m-0 grid content-start gap-0 lg:col-span-5">
          <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-t border-ink py-3.5">
            <dt className="t-narrow text-quiet">Based in</dt>
            <dd className="m-0 font-medium">{profile.location}</dd>
          </div>
          <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-t border-rule py-3.5">
            <dt className="t-narrow text-quiet">Roles</dt>
            <dd className="m-0 font-medium">{profile.roles.join(", ")}</dd>
          </div>
          <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-y border-rule py-3.5">
            <dt className="t-narrow text-quiet">Status</dt>
            <dd className="m-0 font-medium">
              {profile.availableForWork ? "Available for new work" : "Not looking right now"}
            </dd>
          </div>
        </dl>
      </div>

      {profile.stats.length > 0 && (
        <dl className="mt-14 grid grid-cols-2 gap-y-8 border-t border-ink pt-8 lg:grid-cols-4">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2 pr-4">
              <dt className="text-[0.98rem] text-quiet">{stat.label}</dt>
              <dd className="t-figure m-0 text-[2.6rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[3.4rem]">
                {stat.value}
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Section>
  );
}
