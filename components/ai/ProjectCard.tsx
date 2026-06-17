"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Sparkles 
} from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

export default function ProjectCard({ project }: { project: any }) {
  const [showInsights, setShowInsights] = useState(false);

  if (!project) return null;

  const title = project.title || project.name || "Untitled Project";
  const description = project.description || "";
  const category = project.category || "Development";
  const difficulty = project.difficulty || "Intermediate";
  const tech = project.technologies || project.tech || project.topics || [];
  const language = project.language;
  const github = project.githubUrl || project.github;
  const demo = project.demoUrl || project.demo;

  // Rich metadata fields
  const problemSolved = project.problemSolved;
  const recruiterSummary = project.recruiterSummary;
  const skillsDemonstrated = project.skillsDemonstrated || [];
  const complexityScore = project.complexityScore;
  const resumeWorthiness = project.resumeWorthiness;
  const industryUseCase = project.industryUseCase;

  const hasInsights = !!(
    problemSolved ||
    recruiterSummary ||
    (skillsDemonstrated && skillsDemonstrated.length > 0) ||
    complexityScore !== undefined ||
    resumeWorthiness !== undefined ||
    industryUseCase
  );

  // Robust metrics parsing
  const compVal = typeof complexityScore === "number" ? complexityScore : parseInt(complexityScore) || 50;
  const resumeVal = typeof resumeWorthiness === "number" ? resumeWorthiness : parseInt(resumeWorthiness) || 50;

  const compPercent = compVal <= 10 ? compVal * 10 : compVal;
  const resumePercent = resumeVal <= 10 ? resumeVal * 10 : resumeVal;

  const compText = typeof complexityScore === "number" ? `${complexityScore}%` : complexityScore;
  const resumeText = typeof resumeWorthiness === "number" ? `${resumeWorthiness}%` : resumeWorthiness;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a1128]/70 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/25 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]"
    >
      {/* Category and Difficulty Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-white/[0.01] px-4 py-2.5 text-[0.62rem]">
        <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 font-bold text-indigo-300 uppercase tracking-wider">
          {category}
        </span>
        <span className={`rounded-md border px-1.5 py-0.5 font-bold uppercase tracking-wider ${
          difficulty === "Advanced"
            ? "border-red-500/20 bg-red-950/20 text-red-400"
            : difficulty === "Beginner"
              ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-400"
              : "border-yellow-500/20 bg-yellow-950/20 text-yellow-400"
        }`}>
          {difficulty}
        </span>
      </div>

      <div className="p-4">
        {/* Title */}
        <h4 className="text-sm font-extrabold text-white leading-snug">{title}</h4>
        
        {/* Description */}
        {description && (
          <p className="mt-1.5 text-xs leading-relaxed text-slate-300 break-words">{description}</p>
        )}

        {/* Tech Stack Chips */}
        {tech.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {language && (
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[0.62rem] text-green-200 font-mono">
                {language}
              </span>
            )}
            {tech.slice(0, 6).map((item: string) => (
              <span 
                key={item} 
                className="rounded-full border border-cyan-500/25 bg-cyan-950/20 px-2 py-0.5 text-[0.62rem] font-mono text-cyan-300 font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Call to Actions (Links) */}
        <div className="mt-4 flex flex-wrap gap-2">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[0.68rem] font-medium text-slate-200 hover:border-primary/45 hover:bg-white/5 transition duration-200"
            >
              <Github size={12} /> GitHub
            </a>
          )}
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 border border-primary/25 px-2.5 py-1.5 text-[0.68rem] font-medium text-indigo-100 hover:bg-primary/30 transition duration-200"
            >
              <ExternalLink size={12} /> Live demo
            </a>
          )}
        </div>

        {/* Expandable Recruiter Insights Toggle */}
        {hasInsights && (
          <>
            <button
              type="button"
              onClick={() => setShowInsights(!showInsights)}
              className="group/toggle mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] py-2 text-[0.68rem] font-bold text-indigo-300 hover:bg-white/[0.04] hover:text-indigo-200 transition-all duration-300"
            >
              {showInsights ? (
                <>
                  Hide Insights <ChevronUp size={12} />
                </>
              ) : (
                <>
                  View Recruiter Insights <ChevronDown size={12} />
                </>
              )}
            </button>

            {/* Collapsible Container */}
            <AnimatePresence initial={false}>
              {showInsights && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-4 text-xs">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-400">
                      <Sparkles size={12} className="text-indigo-400" />
                      Recruiter Insights View
                    </div>

                    {/* Problem Solved */}
                    {problemSolved && (
                      <div>
                        <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-cyan-300">Problem Solved</span>
                        <p className="mt-1 text-slate-300 leading-relaxed">{problemSolved}</p>
                      </div>
                    )}

                    {recruiterSummary && (
                      <div>
                        <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-indigo-300">Recruiter Summary</span>
                        <p className="mt-1 text-slate-350 leading-relaxed italic border-l-2 border-indigo-500/30 pl-2.5 bg-indigo-500/[0.01] py-1.5 rounded-r-lg">
                          {recruiterSummary}
                        </p>
                      </div>
                    )}

                    {/* Structured Grid */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {skillsDemonstrated.length > 0 && (
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3">
                          <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Skills Demonstrated
                          </span>
                          <ul className="space-y-1.5">
                            {skillsDemonstrated.map((skill: string) => (
                              <li key={skill} className="flex items-start gap-1.5 text-[0.68rem] text-slate-300">
                                <CheckCircle2 size={11} className="mt-0.5 text-emerald-400 shrink-0" />
                                <span className="truncate">{skill}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-3">
                        {industryUseCase && (
                          <div>
                            <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">
                              Industry Use Case
                            </span>
                            <p className="mt-1 text-[0.68rem] text-slate-350 leading-relaxed">
                              {industryUseCase}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-2.5 mt-auto">
                          {complexityScore !== undefined && (
                            <div>
                              <span className="block text-[0.55rem] font-bold uppercase tracking-wider text-slate-500">
                                Complexity
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                                  <div 
                                    className="h-full rounded-full bg-cyan-400" 
                                    style={{ width: `${compPercent}%` }} 
                                  />
                                </div>
                                <span className="text-[0.68rem] font-mono font-bold text-cyan-300">
                                  {compText}
                                </span>
                              </div>
                            </div>
                          )}

                          {resumeWorthiness !== undefined && (
                            <div className="text-right">
                              <span className="block text-[0.55rem] font-bold uppercase tracking-wider text-slate-500">
                                Resume Worthiness
                              </span>
                              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                                  <div 
                                    className="h-full rounded-full bg-emerald-400" 
                                    style={{ width: `${resumePercent}%` }} 
                                  />
                                </div>
                                <span className="text-[0.68rem] font-mono font-bold text-emerald-300">
                                  {resumeText}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.article>
  );
}
