"use client";

import { ArrowUpRight } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import type { Project } from "@/lib/portfolio/types";
import { safeHref } from "@/lib/url";
import { askAssistant } from "./ask";
import { Section, textLink } from "./Shell";

/** Repo slugs such as "to_do_app" become "To do app"; written titles are kept. */
function displayTitle(project: Project): string {
  const title = project.title || project.name;
  if (/\s/.test(title)) return title;
  const spaced = title.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function summary(project: Project): string {
  return project.longDesc || project.recruiterSummary || project.description || "";
}

/** Splits features into headline figures ("81.29% macro-F1 score") and the rest. */
function splitFeatures(features: string[] = []) {
  const figures: Array<{ value: string; label: string }> = [];
  const rest: string[] = [];

  for (const feature of features) {
    if (/repository/i.test(feature)) continue; // covered by the access note
    const match = /^(\d[\d.,]*%?)\s+(.+)$/.exec(feature);
    if (match?.[1] && match[2] && figures.length < 3) {
      figures.push({ value: match[1], label: match[2] });
    } else {
      rest.push(feature);
    }
  }
  return { figures, rest: rest.slice(0, 5) };
}

function ProjectLinks({ project }: { project: Project }) {
  const github = safeHref(project.githubUrl || project.github, { webOnly: true });
  const demo = safeHref(project.demoUrl || project.demo, { webOnly: true });
  const isPrivate = !github && /private/i.test(project.projectType ?? "");

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.95rem]">
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer" className={`${textLink} inline-flex items-center gap-1.5`}>
          <FiGithub size={15} aria-hidden />
          Code on GitHub
        </a>
      )}
      {demo && (
        <a href={demo} target="_blank" rel="noopener noreferrer" className={`${textLink} inline-flex items-center gap-1`}>
          Live site
          <ArrowUpRight size={16} aria-hidden />
        </a>
      )}
      {isPrivate && (
        <span className="text-quiet">
          Repository is private until publication.{" "}
          <a href="#contact" className={textLink}>
            Request access
          </a>
        </span>
      )}
      <button
        type="button"
        onClick={() => askAssistant(`Tell me more about ${displayTitle(project)}`)}
        className="text-quiet underline decoration-rule decoration-2 underline-offset-4 hover:text-ink hover:decoration-cobalt"
      >
        Ask the assistant about this
      </button>
    </div>
  );
}

function FeaturedProject({ project }: { project: Project }) {
  const { figures, rest } = splitFeatures(project.keyFeatures);
  const tech = project.tech?.length ? project.tech : project.topics;

  return (
    <article className="grid gap-6 border-t border-rule py-10 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-5">
        <h3 className="t-wide text-[1.45rem] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[1.7rem]">
          {displayTitle(project)}
        </h3>
        {project.projectType && (
          <p className="t-narrow mt-3 text-[1rem] font-medium text-quiet">{project.projectType}</p>
        )}
        {tech.length > 0 && (
          <p className="t-narrow mt-4 text-[1rem] leading-[1.5] text-ink">
            <span className="sr-only">Built with </span>
            {tech.join(", ")}
          </p>
        )}
      </div>

      <div className="lg:col-span-7">
        <p className="max-w-[62ch]">{summary(project)}</p>

        {figures.length > 0 && (
          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            {figures.map((figure) => (
              <div key={figure.label} className="border-l-[3px] border-cobalt pl-4">
                <dt className="sr-only">{figure.label}</dt>
                <dd className="t-figure m-0 text-[1.9rem] font-extrabold leading-none tracking-[-0.02em] sm:text-[2.3rem]">
                  {figure.value}
                </dd>
                <dd aria-hidden className="m-0 mt-2 text-[0.9rem] leading-[1.35] text-quiet">
                  {figure.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {rest.length > 0 && (
          <ul className="mt-7 grid gap-x-8 gap-y-2 pl-0 text-[0.98rem] sm:grid-cols-2">
            {rest.map((feature) => (
              <li key={feature} className="flex list-none gap-3">
                <span aria-hidden className="mt-[0.7em] h-[2px] w-3 shrink-0 bg-ink" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  );
}

function year(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "" : String(parsed.getFullYear());
}

export default function Work() {
  const { projects, contact } = usePortfolio();
  const featured = projects.filter((project) => project.featured);
  const others = projects
    .filter((project) => !project.featured)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const github = safeHref(contact.github, { webOnly: true });

  return (
    <Section
      id="work"
      title="Selected work"
      lead="Two research projects from my M.E., and the applications I have built end to end."
    >
      <div>
        {featured.map((project) => (
          <FeaturedProject key={project.id} project={project} />
        ))}
      </div>

      {others.length > 0 && (
        <div className="mt-14 border-t border-ink/15 pt-10">
          <h3 className="t-wide text-[1.2rem] font-bold">More repositories</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-[0.98rem]">
              <thead>
                <tr className="t-narrow text-[0.95rem] text-quiet">
                  <th scope="col" className="border-b border-ink py-2.5 pr-4 font-medium">Repository</th>
                  <th scope="col" className="border-b border-ink px-4 py-2.5 font-medium">Area</th>
                  <th scope="col" className="border-b border-ink px-4 py-2.5 font-medium">Language</th>
                  <th scope="col" className="border-b border-ink py-2.5 pl-4 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {others.map((project) => {
                  const href = safeHref(project.githubUrl || project.github, { webOnly: true });
                  return (
                    <tr key={project.id} className="border-b border-rule">
                      <th scope="row" className="py-3 pr-4 font-semibold">
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-cobalt hover:underline">
                            {displayTitle(project)}
                          </a>
                        ) : (
                          displayTitle(project)
                        )}
                      </th>
                      <td className="px-4 py-3 text-quiet">{project.category || "—"}</td>
                      <td className="px-4 py-3 text-quiet">{project.language || "—"}</td>
                      <td className="t-figure py-3 pl-4 text-right text-[0.9rem] text-quiet">{year(project.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {github && (
            <p className="mt-6 text-[0.98rem]">
              <a href={github} target="_blank" rel="noopener noreferrer" className={textLink}>
                See everything on GitHub
              </a>
            </p>
          )}
        </div>
      )}
    </Section>
  );
}
