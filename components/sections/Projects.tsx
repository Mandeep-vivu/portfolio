"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  ExternalLink, 
  Star, 
  Search, 
  SlidersHorizontal, 
  BarChart3, 
  Brain, 
  Award, 
  Gauge, 
  Calendar, 
  Code2, 
  Layers, 
  Sparkles,
  HelpCircle
} from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

import SectionHeading from "@/components/ui/SectionHeading";
import NeonBadge from "@/components/ui/NeonBadge";
import GlowButton from "@/components/ui/GlowButton";

import type { Project } from "@/lib/data";
import { usePortfolio } from "@/components/providers/PortfolioProvider";

// Badge colors for difficulty
const DIFFICULTY_COLORS: Record<string, "green" | "cyan" | "purple" | "orange" | "pink"> = {
  Beginner: "green",
  Intermediate: "cyan",
  Advanced: "purple",
  Expert: "orange",
};

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.08,
  });

  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: Math.min(index * 0.05, 0.3),
        duration: 0.45,
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="glass group relative flex h-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:border-primary/35 hover:shadow-card-hover bg-white/[0.02]">
        
        {/* Top Header/Gradient */}
        <div className={`relative flex h-16 sm:h-20 items-center justify-center overflow-hidden bg-gradient-to-br ${project.gradient || "from-blue-600/20 to-indigo-600/20"}`}>
          <span className="text-[1.5rem] sm:text-[2.2rem]">
            {project.icon || "CODE"}
          </span>

          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20 animate-pulse"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 30}%`,
              }}
            />
          ))}

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-yellow-500/35 bg-yellow-500/10 px-2 py-0.5">
              <Star size={9} className="fill-yellow-500 text-yellow-500" />
              <span className="font-mono text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-yellow-500">
                Featured
              </span>
            </div>
          )}

          {/* AI Badge */}
          {project.aiRelated && (
            <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-2 py-0.5">
              <Brain size={10} className="text-cyan-400 animate-pulse" />
              <span className="font-mono text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-cyan-400">
                AI / ML
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5">
          
          {/* Title and Stars */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-display text-[0.98rem] sm:text-[1.05rem] font-bold leading-snug text-white line-clamp-1 group-hover:text-primary transition-colors">
              {project.title || project.name}
            </h3>
            {project.stars !== undefined && project.stars > 0 && (
              <div className="flex items-center gap-1 text-[0.68rem] font-semibold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-full border border-yellow-500/20 whitespace-nowrap">
                <Star size={10} className="fill-yellow-500" />
                <span>{project.stars}</span>
              </div>
            )}
          </div>

          {/* Badges row: Category, Difficulty, Industry */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {project.category && (
              <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[0.58rem] font-medium text-indigo-300">
                {project.category}
              </span>
            )}
            {project.difficulty && (
              <span className={`rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider ${
                project.difficulty === "Beginner" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" :
                project.difficulty === "Intermediate" ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300" :
                project.difficulty === "Advanced" ? "border-violet-500/25 bg-violet-500/10 text-violet-300" :
                "border-orange-500/25 bg-orange-500/10 text-orange-300"
              }`}>
                {project.difficulty}
              </span>
            )}
            {project.industryUseCase && project.industryUseCase !== "General Purpose" && (
              <span className="rounded-full border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[0.58rem] text-slate-400">
                🏢 {project.industryUseCase}
              </span>
            )}
          </div>

          {/* Description / Recruiter Summary */}
          <p className="mb-4 text-[0.76rem] sm:text-[0.84rem] leading-5 text-slate-400 line-clamp-3">
            {project.recruiterSummary || project.longDesc || project.description}
          </p>

          {/* Expandable Key Features */}
          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <div className="mb-4 border-t border-white/5 pt-3">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-cyan-400/80 hover:text-cyan-300 transition"
              >
                <Sparkles size={11} className={expanded ? "rotate-45" : ""} />
                {expanded ? "Hide Core Features" : "View Core Features"}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.ul 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {project.keyFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[0.7rem] text-slate-350 leading-relaxed">
                        <span className="text-primary mt-1">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Scores dials */}
          {(project.complexityScore !== undefined || project.resumeWorthiness !== undefined) && (
            <div className="mb-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
              {project.complexityScore !== undefined && project.complexityScore > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[0.65rem] text-slate-500 mb-1">
                    <span>Complexity</span>
                    <span className="font-mono font-bold text-slate-300">{project.complexityScore}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" 
                      style={{ width: `${project.complexityScore}%` }}
                    />
                  </div>
                </div>
              )}
              {project.resumeWorthiness !== undefined && project.resumeWorthiness > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[0.65rem] text-slate-500 mb-1">
                    <span>Recruiter Value</span>
                    <span className="font-mono font-bold text-cyan-400">{project.resumeWorthiness}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 shadow-[0_0_8px_rgba(34,211,238,0.2)]" 
                      style={{ width: `${project.resumeWorthiness}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tech tags */}
          <div className="mt-auto pt-2 flex flex-wrap gap-1">
            {project.language && (
              <NeonBadge color="green">
                {project.language}
              </NeonBadge>
            )}
            {(project.skillsDemonstrated || project.tech || project.topics || []).slice(0, 3).map((t) => (
              <NeonBadge key={t} color="purple">
                {t}
              </NeonBadge>
            ))}
          </div>

          {/* Project Links */}
          <div className="mt-4 flex gap-2">
            {(project.githubUrl || project.github) && (
              <a
                href={project.githubUrl || project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[0.7rem] sm:text-xs font-semibold text-slate-300 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-white hover:shadow-neon-sm active:scale-95"
              >
                <Github size={11} className="sm:w-[13px] sm:h-[13px]" />
                <span>GitHub</span>
              </a>
            )}

            {(project.demoUrl || project.demo) && (
              <a
                href={project.demoUrl || project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/15 text-[0.7rem] sm:text-xs font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-white active:scale-95"
              >
                <ExternalLink size={11} className="sm:w-[13px] sm:h-[13px]" />
                <span>Demo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { projects } = usePortfolio();

  // Search, Filters & Sorting state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [projectType, setProjectType] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [minComplexity, setMinComplexity] = useState(0);
  const [minWorthiness, setMinWorthiness] = useState(0);
  const [aiOnly, setAiOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState("Most Impressive");
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Dynamic filter list extraction from cached project objects
  const categories = ["All", ...new Set(projects.map(p => p.category).filter(Boolean))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];
  const projectTypes = ["All", ...new Set(projects.map(p => p.projectType).filter(Boolean))];
  const industries = ["All", ...new Set(projects.map(p => p.industryUseCase).filter(Boolean))];

  // Live Analytics calculations
  const totalProjects = projects.length;
  const aiProjects = projects.filter(p => p.aiRelated).length;
  
  const allSkills = projects.flatMap(p => p.skillsDemonstrated || p.tech || []);
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([skill]) => skill);

  const allLanguages = projects.map(p => p.language).filter(l => l && l !== "Unknown");
  const langCounts = allLanguages.reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topLanguages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang);

  const projectsWithScores = projects.filter(p => p.complexityScore !== undefined && p.complexityScore > 0);
  const avgComplexity = projectsWithScores.length > 0
    ? Math.round(projectsWithScores.reduce((sum, p) => sum + (p.complexityScore || 0), 0) / projectsWithScores.length)
    : 50;

  const projectsWithWorthiness = projects.filter(p => p.resumeWorthiness !== undefined && p.resumeWorthiness > 0);
  const avgWorthiness = projectsWithWorthiness.length > 0
    ? Math.round(projectsWithWorthiness.reduce((sum, p) => sum + (p.resumeWorthiness || 0), 0) / projectsWithWorthiness.length)
    : 50;

  // Filter projects
  const filtered = projects.filter(p => {
    const skillsList = [...(p.skillsDemonstrated || []), ...(p.tech || []), ...(p.topics || [])].join(" ");
    const searchString = `${p.title || p.name} ${p.description} ${p.longDesc || ""} ${p.category || ""} ${p.industryUseCase || ""} ${skillsList} ${p.language || ""}`.toLowerCase();
    
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesCategory = category === "All" || p.category === category;
    const matchesDifficulty = difficulty === "All" || p.difficulty === difficulty;
    const matchesType = projectType === "All" || p.projectType === projectType;
    const matchesIndustry = industry === "All" || p.industryUseCase === industry;
    const matchesComplexity = (p.complexityScore ?? 0) >= minComplexity;
    const matchesWorthiness = (p.resumeWorthiness ?? 0) >= minWorthiness;
    const matchesAi = !aiOnly || p.aiRelated;
    const matchesFeatured = !featuredOnly || p.featured;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesType && matchesIndustry && matchesComplexity && matchesWorthiness && matchesAi && matchesFeatured;
  });

  // Sort projects
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "Most Impressive") {
      const scoreA = (a.featured ? 60 : 0) + (a.stars * 15) + (a.resumeWorthiness ?? 0);
      const scoreB = (b.featured ? 60 : 0) + (b.stars * 15) + (b.resumeWorthiness ?? 0);
      return scoreB - scoreA;
    }
    if (sort === "Most Complex") {
      return (b.complexityScore ?? 0) - (a.complexityScore ?? 0);
    }
    if (sort === "Most Recruiter Relevant") {
      return (b.resumeWorthiness ?? 0) - (a.resumeWorthiness ?? 0);
    }
    if (sort === "Most Starred") {
      return b.stars - a.stars;
    }
    if (sort === "Most Recent") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sort === "Most AI Focused") {
      if (a.aiRelated && !b.aiRelated) return -1;
      if (!a.aiRelated && b.aiRelated) return 1;
      return (b.complexityScore ?? 0) - (a.complexityScore ?? 0);
    }
    return 0;
  });

  return (
    <section
      id="projects"
      className="md:min-h-screen section-padding relative overflow-hidden py-14"
    >
      {/* top line separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* glows */}
      <div className="pointer-events-none absolute right-0 top-1/4 h-[350px] w-[350px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-[110px]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          label="Portfolio Intelligence"
          title="Dynamic Projects"
          highlight="Showcase"
          subtitle="Recruiter-centric dashboards, interactive analytics, and multi-variable filtering."
        />

        {/* Analytics drawer toggle */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-slate-350 hover:text-white hover:border-primary/45 transition-all duration-300"
          >
            <BarChart3 size={14} className={showAnalytics ? "text-cyan-400" : ""} />
            {showAnalytics ? "Hide Analytics Panel" : "Show Analytics Panel"}
          </button>
        </div>

        {/* Portfolio Analytics Display Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 rounded-2xl border border-white/10 bg-[#050916]/80 p-4 sm:p-5 backdrop-blur-xl">
                <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[0.62rem] uppercase tracking-wider text-slate-500 mb-1">Total Repos</span>
                  <span className="font-display text-xl sm:text-2xl font-black text-white">{totalProjects}</span>
                </div>
                <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[0.62rem] uppercase tracking-wider text-slate-500 mb-1">AI Projects</span>
                  <span className="font-display text-xl sm:text-2xl font-black text-cyan-400 flex items-center justify-center gap-1">
                    {aiProjects} <Brain size={14} className="text-cyan-400" />
                  </span>
                </div>
                <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[0.62rem] uppercase tracking-wider text-slate-500 mb-1">Avg Complexity</span>
                  <span className="font-display text-xl sm:text-2xl font-black text-violet-400 flex items-center justify-center gap-1">
                    {avgComplexity}% <Gauge size={14} className="text-violet-400" />
                  </span>
                </div>
                <div className="flex flex-col rounded-xl border border-white/5 bg-white/[0.01] p-3 text-center">
                  <span className="text-[0.62rem] uppercase tracking-wider text-slate-500 mb-1">Recruiter Index</span>
                  <span className="font-display text-xl sm:text-2xl font-black text-yellow-500 flex items-center justify-center gap-1">
                    {avgWorthiness}% <Star size={14} className="text-yellow-500" />
                  </span>
                </div>
                <div className="col-span-2 md:col-span-2 flex flex-col rounded-xl border border-white/5 bg-white/[0.01] p-3">
                  <span className="text-[0.62rem] uppercase tracking-wider text-slate-500 mb-1.5 text-center">Core Stack Focus</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {topSkills.map(s => (
                      <span key={s} className="rounded-md bg-white/[0.04] border border-white/5 px-1.5 py-0.5 text-[0.58rem] font-medium text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Filters & Sort Module */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.015] p-4 sm:p-5 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            
            {/* Search Bar & Sort Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
              <div className="relative flex items-center rounded-xl border border-white/8 bg-white/[0.02] px-3 focus-within:border-primary/45">
                <Search size={16} className="text-slate-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects, skills, languages or keywords..."
                  className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-650"
                />
              </div>
              <div className="flex items-center rounded-xl border border-white/8 bg-white/[0.02] px-3">
                <SlidersHorizontal size={14} className="text-slate-550 mr-2 shrink-0" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-10 w-full bg-transparent text-xs text-slate-300 outline-none border-none cursor-pointer"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="Most Impressive">Sort: Most Impressive</option>
                  <option value="Most Complex">Sort: Most Complex</option>
                  <option value="Most Recruiter Relevant">Sort: Recruiter Index</option>
                  <option value="Most Recent">Sort: Most Recent</option>
                  <option value="Most Starred">Sort: Most Starred</option>
                  <option value="Most AI Focused">Sort: AI Focused</option>
                </select>
              </div>
            </div>

            {/* Categorized Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col">
                <label className="text-[0.6rem] uppercase font-bold tracking-wider text-slate-550 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 text-xs text-slate-350 outline-none cursor-pointer hover:border-white/20 transition"
                  style={{ colorScheme: "dark" }}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-[0.6rem] uppercase font-bold tracking-wider text-slate-550 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 text-xs text-slate-350 outline-none cursor-pointer hover:border-white/20 transition"
                  style={{ colorScheme: "dark" }}
                >
                  {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[0.6rem] uppercase font-bold tracking-wider text-slate-550 mb-1">Scale/Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 text-xs text-slate-350 outline-none cursor-pointer hover:border-white/20 transition"
                  style={{ colorScheme: "dark" }}
                >
                  {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[0.6rem] uppercase font-bold tracking-wider text-slate-550 mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-9 rounded-lg border border-white/8 bg-white/[0.02] px-2.5 text-xs text-slate-350 outline-none cursor-pointer hover:border-white/20 transition"
                  style={{ colorScheme: "dark" }}
                >
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            {/* Sliders & Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
              {/* Range sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <div className="flex justify-between text-[0.62rem] text-slate-500 mb-1">
                    <span>Min Complexity</span>
                    <span className="font-mono">{minComplexity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minComplexity}
                    onChange={(e) => setMinComplexity(Number(e.target.value))}
                    className="accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between text-[0.62rem] text-slate-500 mb-1">
                    <span>Min Recruiter Value</span>
                    <span className="font-mono">{minWorthiness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={minWorthiness}
                    onChange={(e) => setMinWorthiness(Number(e.target.value))}
                    className="accent-cyan-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-end gap-5">
                <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aiOnly}
                    onChange={(e) => setAiOnly(e.target.checked)}
                    className="accent-primary h-4 w-4 rounded border-white/10 bg-white/5"
                  />
                  <span>AI/ML Focused Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="accent-yellow-500 h-4 w-4 rounded border-white/10 bg-white/5"
                  />
                  <span>Featured Only</span>
                </label>
              </div>

            </div>

          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Results: {sorted.length} of {projects.length} projects</span>
          {(search || category !== "All" || difficulty !== "All" || projectType !== "All" || industry !== "All" || minComplexity > 0 || minWorthiness > 0 || aiOnly || featuredOnly) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
                setDifficulty("All");
                setProjectType("All");
                setIndustry("All");
                setMinComplexity(0);
                setMinWorthiness(0);
                setAiOnly(false);
                setFeaturedOnly(false);
              }}
              className="text-cyan-400 hover:text-cyan-300 transition underline font-semibold ml-2"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Dynamic Grid Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Layers size={32} className="text-slate-600 mb-3" />
            <h3 className="font-bold text-white text-base">No projects match filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Try adjusting your search keywords, lowering score thresholds, or selecting other categories.
            </p>
          </div>
        )}

        {/* Dashboard Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row"
        >
          <GlowButton
            href="https://github.com/Mandeep-vivu"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
          >
            <Github size={15} />
            More on GitHub
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
}
