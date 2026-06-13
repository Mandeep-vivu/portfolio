"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ExternalLink, Star } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

import SectionHeading from "@/components/ui/SectionHeading";
import NeonBadge from "@/components/ui/NeonBadge";
import GlowButton from "@/components/ui/GlowButton";

import type { Project } from "@/lib/data";
import { usePortfolio } from "@/components/providers/PortfolioProvider";

const BADGE_COLORS: Record<
  string,
  "purple" | "cyan" | "pink" | "green" | "orange"
> = {
  Python: "purple",
  "Scikit-learn": "purple",
  PyTorch: "orange",

  PostgreSQL: "cyan",
  Flutter: "cyan",
  Dart: "cyan",

  HTML: "green",
  CSS: "green",
  JavaScript: "green",

  "Socket.IO": "pink",
  "REST API": "pink",

  OpenCV: "orange",
  MediaPipe: "orange",
  Streamlit: "orange",
  Bash: "green",

  SQL: "cyan",
  Linux: "green",
};

function getColor(
  tech: string
): "purple" | "cyan" | "pink" | "green" | "orange" {
  return BADGE_COLORS[tech] ?? "purple";
}

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

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <div className="glass group relative flex h-full min-h-[248px] sm:min-h-[285px] flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 transition-all duration-300 hover:border-primary/35 hover:shadow-card-hover">
        {/* top */}
        <div
          className={`relative flex h-16 sm:h-24 items-center justify-center overflow-hidden bg-gradient-to-br ${project.gradient}`}
        >
          <span className="text-[1.5rem] sm:text-[2.4rem]">
            {project.icon}
          </span>

          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              animate={{
                x: [0, 18, -8, 0],
                y: [0, -12, 8, 0],
                opacity: [0.2, 0.45, 0.2],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.45,
              }}
              style={{
                left: `${24 + i * 14}%`,
                top: `${26 + (i % 2) * 24}%`,
              }}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {project.featured && (
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-primary/25 bg-primary/15 px-2 py-[5px]">
              <Star
                size={9}
                className="fill-primary text-primary"
              />

              <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-primary">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* content */}
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-5 sm:pb-5 sm:pt-4">
          <h3 className="mb-1.5 sm:mb-2 font-display text-[0.95rem] sm:text-[1.02rem] font-bold leading-snug text-white line-clamp-2">
            {project.title}
          </h3>

          <p className="mb-3 flex-1 text-[0.76rem] sm:text-[0.84rem] leading-5 sm:leading-[1.65] text-slate-400 line-clamp-3">
            {project.description}
          </p>

          {/* tech */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <NeonBadge
                key={t}
                color={getColor(t)}
              >
                {t}
              </NeonBadge>
            ))}
          </div>

          {/* buttons */}
          <div className="mt-auto flex gap-2">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[0.7rem] sm:text-xs font-semibold text-slate-300 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-white hover:shadow-neon-sm active:scale-95"
            >
              <Github size={11} className="sm:w-[13px] sm:h-[13px]" />
              <span className="hidden sm:inline">GitHub</span>
              <span className="sm:hidden">Code</span>
            </a>

            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/15 text-[0.7rem] sm:text-xs font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-white active:scale-95"
              >
                <ExternalLink size={11} className="sm:w-[13px] sm:h-[13px]" />
                <span className="hidden sm:inline">Live Demo</span>
                <span className="sm:hidden">Demo</span>
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
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll
    ? projects
    : projects.slice(0, 4);

  return (
    <section
      id="projects"
      className="md:min-h-[calc(100dvh-64px)] md:flex md:flex-col md:justify-center section-padding relative overflow-hidden"
    >
      {/* top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-primary/5 blur-[110px]" />

      <div className="mx-auto max-w-5xl">
        <SectionHeading
          label="Projects"
          title="What I've"
          highlight="Built"
          subtitle="Production-grade AI, web, mobile, and systems engineering projects."
        />

        {/* grid */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
          {displayed.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
            />
          ))}
        </div>

        {/* bottom buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row"
        >
          <AnimatePresence>
            {!showAll && projects.length > 4 && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <GlowButton
                  variant="outline"
                  onClick={() => setShowAll(true)}
                >
                  View All Projects
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>

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
