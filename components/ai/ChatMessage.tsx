"use client";

import ErrorCard from "./ErrorCard";
import TextMessage from "./TextMessage";
import ProjectCard from "./ProjectCard";
import ResumeCard from "./ResumeCard";
import ContactCard from "./ContactCard";
import SchedulingCard from "./SchedulingCard";
import type { Block } from "@/lib/ai/schemas";
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Crown,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Trophy,
} from "lucide-react";
import { FiGithub as Github, FiLinkedin as Linkedin } from "react-icons/fi";
import type { AgentResult } from "@/lib/ai/schemas";

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  blocks?: Block[];
  result?: AgentResult | undefined;
  pending?: boolean | undefined;
  thinking?: boolean | undefined;
  thinkingText?: string | undefined;
  error?: boolean | undefined;
};

function safeHref(href?: string) {
  if (!href) return "";
  try {
    const url = new URL(href, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? href : "";
  } catch {
    return "";
  }
}


// Skill bar component
// ---------------------------------------------------------------------------

function SkillBar({
  name,
  level,
  color,
  category,
}: {
  name: string;
  level: number;
  color: string;
  category: string;
}) {
  const categoryLabel =
    category === "ai"
      ? "AI/ML"
      : category === "fullstack"
        ? "Full Stack"
        : "Tools";

  return (
    <div className="group rounded-lg border border-white/8 bg-white/[0.03] p-2.5 transition hover:border-primary/25 hover:bg-white/[0.05]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-semibold text-white truncate">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.55rem] text-slate-400">
            {categoryLabel}
          </span>
          <span className="text-[0.65rem] font-mono font-bold text-cyan-300">
            {level}%
          </span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${level}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structured result renderers
// ---------------------------------------------------------------------------

function StructuredResult({ result }: { result: AgentResult }) {
  if (result.type === "projects") {
    return (
      <div className="mt-3 grid gap-2">
        {result.projects.map((project) => (
          <article
            key={project.id}
            className="rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <h4 className="text-sm font-bold text-white">{project.title}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {project.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.62rem] text-indigo-200"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {safeHref(project.github) && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 hover:border-primary/40"
                >
                  <Github size={13} /> GitHub
                </a>
              )}
              {project.demo && safeHref(project.demo) && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-2.5 py-1.5 text-xs text-indigo-100"
                >
                  <ExternalLink size={13} /> Live demo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (result.type === "resume") {
    return (
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-between rounded-xl border border-primary/25 bg-primary/10 p-3 transition hover:bg-primary/15"
      >
        <span>
          <span className="block text-sm font-semibold text-white">
            {result.title}
          </span>
          <span className="text-xs text-slate-400">Open latest resume</span>
        </span>
        <Download size={18} className="text-cyan-300" />
      </a>
    );
  }

  if (result.type === "contact") {
    const links = [
      {
        label: result.contact.email,
        href: `mailto:${result.contact.email}`,
        icon: Mail,
      },
      ...(result.contact.phone
        ? [
            {
              label: result.contact.phone,
              href: `tel:${result.contact.phone.replace(/\s+/g, "")}`,
              icon: Phone,
            },
          ]
        : []),
      { label: "LinkedIn", href: result.contact.linkedin, icon: Linkedin },
      { label: "GitHub", href: result.contact.github, icon: Github },
      {
        label: "Portfolio",
        href: result.contact.portfolioUrl,
        icon: ExternalLink,
      },
    ].filter((item) => safeHref(item.href));

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {links.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-slate-200 hover:border-primary/35"
          >
            <Icon size={14} className="shrink-0 text-cyan-300" />
            <span className="truncate">{label}</span>
          </a>
        ))}
      </div>
    );
  }

  if (result.type === "scheduling") {
    return result.configured && safeHref(result.calendlyUrl) ? (
      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white">
        <iframe
          title="Schedule with Mandeep"
          src={result.calendlyUrl}
          className="h-[360px] w-full"
          loading="lazy"
        />
        <a
          href={result.calendlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#0b1020] p-3 text-xs font-semibold text-cyan-200"
        >
          <CalendarDays size={14} /> Open Calendly in a new tab
        </a>
      </div>
    ) : null;
  }

  if (result.type === "skills") {
    return (
      <div className="mt-3 grid gap-1.5">
        {result.skills.map((skill) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            level={skill.level}
            color={skill.color}
            category={skill.category}
          />
        ))}
      </div>
    );
  }

  if (result.type === "education") {
    return (
      <div className="mt-3 space-y-2">
        {result.entries.map((entry) => (
          <div
            key={entry.id}
            className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/25 to-cyan-500/25 text-cyan-300">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white leading-snug">
                {entry.title}
              </h4>
              <p className="mt-0.5 text-[0.7rem] text-cyan-300/80">
                {entry.org}
              </p>
              <p className="mt-0.5 text-[0.65rem] text-slate-500">
                {entry.year}
              </p>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (result.type === "experience") {
    return (
      <div className="mt-3 space-y-2">
        {result.entries.map((entry) => {
          const Icon =
            entry.type === "leadership"
              ? Crown
              : entry.type === "experience"
                ? Briefcase
                : BookOpen;
          const typeLabel =
            entry.type === "leadership"
              ? "Leadership"
              : entry.type === "experience"
                ? "Work"
                : entry.type;

          return (
            <div
              key={entry.id}
              className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-accent/25 text-indigo-300">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {entry.title}
                  </h4>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.55rem] text-slate-400">
                    {typeLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.7rem] text-cyan-300/80">
                  {entry.org}
                </p>
                <p className="mt-0.5 text-[0.65rem] text-slate-500">
                  {entry.year}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  {entry.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (result.type === "achievements") {
    return (
      <div className="mt-3 space-y-2">
        {result.entries.map((entry) => {
          const Icon =
            entry.type === "certification"
              ? Shield
              : entry.type === "award"
                ? Trophy
                : entry.type === "leadership"
                  ? Crown
                  : Award;
          const typeLabel =
            entry.type === "certification"
              ? "Certification"
              : entry.type === "award"
                ? "Award"
                : entry.type === "leadership"
                  ? "Leadership"
                  : entry.type;

          const Wrapper = entry.link ? "a" : "div";
          const wrapperProps = entry.link
            ? {
                href: entry.link,
                target: "_blank" as const,
                rel: "noopener noreferrer",
              }
            : {};

          return (
            <Wrapper
              key={entry.id}
              {...wrapperProps}
              className={`flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3 ${
                entry.link
                  ? "cursor-pointer transition hover:border-primary/30 hover:bg-black/30"
                  : ""
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/25 text-amber-300">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {entry.title}
                  </h4>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[0.55rem] text-slate-400">
                    {typeLabel}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">
                  {entry.description}
                </p>
                {entry.link && (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[0.65rem] text-cyan-300">
                    <ExternalLink size={10} /> View credential
                  </span>
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Thinking indicator
// ---------------------------------------------------------------------------

function ThinkingIndicator({ text }: { text?: string | undefined }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="relative flex h-5 w-5 items-center justify-center shrink-0">
        <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400/20" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-primary" />
      </div>
      <span className="text-xs text-slate-400 animate-pulse truncate">
        {text || "Analyzing portfolio..."}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ChatMessage component
// ---------------------------------------------------------------------------

export default function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";

  if (!isUser && !message.content && (!message.blocks || message.blocks.length === 0) && !message.thinking && !message.pending && !message.error && !message.result) {
    return null;
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-6 ${
          isUser
            ? "rounded-br-md bg-gradient-to-br from-primary to-secondary text-white"
            : `rounded-bl-md border bg-white/[0.045] text-slate-200 ${
                message.error ? "border-red-400/30" : "border-white/10"
              }`
        }`}
      >
        {message.thinking ? (
          <ThinkingIndicator text={message.thinkingText} />
        ) : message.pending && !message.content && (!message.blocks || message.blocks.length === 0) ? (
          <span className="flex items-center gap-1 py-1" aria-label="Generating">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300"
                style={{ animationDelay: `${index * 120}ms` }}
              />
            ))}
          </span>
        ) : message.error ? (
          <ErrorCard message={message.content || "I couldn't generate a response right now. Please try again."} />
        ) : (
          <div className="flex flex-col gap-2">
            {message.content && <TextMessage content={message.content} />}
            {message.blocks && message.blocks.map((block, i) => {
              switch (block.type) {
                case "text": return <TextMessage key={i} content={block.content} />;
                case "project_card": 
                  return (
                    <div key={i} className="mt-2 grid gap-2">
                      {(block as any).projects.map((p: any) => (
                        <ProjectCard key={p.id} project={p} />
                      ))}
                    </div>
                  );
                case "resume_link": return <ResumeCard key={i} url={(block as any).url} title={(block as any).title} />;
                case "contact": return <ContactCard key={i} contact={block as any} />;
                case "schedule": return <SchedulingCard key={i} url={(block as any).url} />;
                case "error": return <ErrorCard key={i} message={block.content} />;
                default: return <ErrorCard key={i} message={`Unknown block type: ${(block as any).type}`} />;
              }
            })}
          </div>
        )}
        {message.result && <StructuredResult result={message.result} />}
      </div>
    </div>
  );
}
