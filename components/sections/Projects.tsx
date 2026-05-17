"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ExternalLink, Star } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

import SectionHeading from "@/components/ui/SectionHeading";
import NeonBadge from "@/components/ui/NeonBadge";
import GlowButton from "@/components/ui/GlowButton";

import { PROJECTS } from "@/lib/data";

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
  project: (typeof PROJECTS)[0];
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
      <div className="glass group relative flex h-full min-h-[285px] flex-col overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-primary/35 hover:shadow-card-hover">
        {/* top */}
        <div
          className={`relative flex h-24 items-center justify-center overflow-hidden bg-gradient-to-br ${project.gradient}`}
        >
          <span className="text-[2.4rem]">
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
        <div className="flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          <h3 className="mb-1.5 font-display text-[1.02rem] font-bold leading-snug text-white">
            {project.title}
          </h3>

          <p className="mb-3 flex-1 text-[0.84rem] leading-[1.65] text-slate-400">
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
              className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] text-[0.68rem] font-semibold text-slate-300 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:text-white hover:shadow-neon-sm"
            >
              <Github size={12} />
              GitHub
            </a>

            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 flex-1 items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/15 text-[0.68rem] font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-white"
              >
                <ExternalLink size={12} />
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [showAll, setShowAll] = useState(false);

  const displayed = showAll
    ? PROJECTS
    : PROJECTS.slice(0, 4);

  return (
    <section
      id="projects"
      className="section-padding relative overflow-hidden"
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          {!showAll && PROJECTS.length > 4 && (
            <GlowButton
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              View All Projects
            </GlowButton>
          )}

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