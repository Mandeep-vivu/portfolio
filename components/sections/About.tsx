"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

import GlassCard from "@/components/ui/GlassCard";
import { STATS } from "@/lib/data";

import {
  Brain,
  Code2,
  Cloud,
  Database,
  User,
  Rocket,
  Target,
} from "lucide-react";

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);

  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  useEffect(() => {
    if (!inView) return;

    let start = 0;

    const step = value / 40;

    const timer = setInterval(() => {
      start += step;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const FOCUS_AREAS = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    desc: "Neural networks, deep learning, computer vision, NLP",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },

  {
    icon: Code2,
    title: "Full Stack Engineering",
    desc: "Next.js, React, Flutter — end-to-end product development",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },

  {
    icon: Cloud,
    title: "Cloud Architecture",
    desc: "Docker, Kubernetes, cloud-native systems design",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },

  {
    icon: Database,
    title: "Data Engineering",
    desc: "PostgreSQL, MongoDB, data pipelines & analytics",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
];

const CODE_SNIPPET = `// Current focus
const mandeep = {
  education: "M.E. AI/ML @ Chandigarh Univ.",
  role: ["AI Engineer", "Full Stack Dev"],
  learning: ["LLMs", "RAG", "MLOps"],
  building: "production-grade AI systems",
  coffee: true // always ☕
};`;

export default function About() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id="about"
      className="min-h-[calc(100vh-64px)] flex flex-col justify-center section-padding relative overflow-hidden"
    >
      {/* Glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 rounded-full bg-secondary/5 blur-[100px]" />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.35fr_0.95fr] lg:gap-12">
          {/* LEFT */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative flex h-full flex-col"
          >
            {/* Header */}
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-6 bg-indigo-500/50" />

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                  About Me
                </span>

                <div className="h-px w-6 bg-indigo-500/50" />
              </div>

              <h2 className="font-display text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl">
                Engineered to{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                  Innovate
                </span>
              </h2>

              <p className="mt-4 max-w-[90%] text-[0.98rem] leading-[1.75] text-slate-400">
                Computer Engineer turned AI specialist — building systems that
                think, learn, and scale.
              </p>
            </div>

            {/* Soft Glow */}
            <div className="pointer-events-none absolute left-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-500/5 blur-[120px]" />

            {/* Timeline */}
            <div className="relative space-y-5 text-[0.94rem] leading-[1.9] text-slate-300">
              {/* line */}
              {/* Connector line centred under the 44px (w-11) icon */}
              <div className="absolute bottom-5 left-[21px] top-5 w-px bg-white/[0.08]" aria-hidden="true" />

              {/* Block 1 */}
              <div className="group relative flex gap-5">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0a0a0e] shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-indigo-400/30 group-hover:bg-indigo-400/5">
                  <User
                    size={18}
                    className="text-indigo-400/80 transition-colors group-hover:text-indigo-400"
                  />
                </div>

                <div className="pt-0.5 text-slate-400">
                  <p>
                    I&apos;m{" "}
                    <span className="font-semibold text-slate-200 transition-colors group-hover:text-indigo-300">
                      Mandeep Singh
                    </span>
                    , a Computer Engineer from Bhiwani, Haryana, currently
                    pursuing my{" "}
                    <span className="font-medium text-indigo-400">
                      M.E. in Artificial Intelligence & Machine Learning
                    </span>{" "}
                    at Chandigarh University (2025–Present).
                  </p>
                </div>
              </div>

              {/* Block 2 */}
              <div className="group relative flex gap-5">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0a0a0e] shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-cyan-400/30 group-hover:bg-cyan-400/5">
                  <Rocket
                    size={18}
                    className="text-cyan-400/80 transition-colors group-hover:text-cyan-400"
                  />
                </div>

                <div className="pt-0.5 text-slate-400">
                  <p>
                    I specialize in building{" "}
                    <span className="font-medium text-cyan-400">
                      intelligent, scalable systems
                    </span>{" "}
                    — from training ML models to architecting cloud-native full
                    stack applications.
                  </p>
                </div>
              </div>

              {/* Block 3 */}
              <div className="group relative flex gap-5">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0a0a0e] shadow-[0_0_15px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-purple-400/30 group-hover:bg-purple-400/5">
                  <Target
                    size={18}
                    className="text-purple-400/80 transition-colors group-hover:text-purple-400"
                  />
                </div>

                <div className="pt-0.5 text-slate-400">
                  <p>
                    My engineering mindset:{" "}
                    <span className="font-medium tracking-wide text-purple-400">
                      think deep, build lean, ship fast
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0e] shadow-2xl transition-colors duration-500 hover:border-white/[0.15]">
              {/* top */}
              <div className="flex items-center border-b border-white/[0.05] px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                </div>

                <div className="flex-1 text-center">
                  <span className="font-mono text-xs text-slate-500">
                    mandeep.config.ts
                  </span>
                </div>
              </div>

              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-slate-300">
                <code>
                  {CODE_SNIPPET.split("\n").map((line, i) => {
                    // Split only on the FIRST colon to preserve array/object values
                    const firstColonIdx = line.indexOf(":");
                    const hasColon = firstColonIdx !== -1 && !line.startsWith("//") && !line.trimStart().startsWith("{") && !line.trimStart().startsWith("}") && !line.trimStart().startsWith("};");
                    const key = hasColon ? line.slice(0, firstColonIdx) : null;
                    const val = hasColon ? line.slice(firstColonIdx + 1) : null;

                    return (
                      <div
                        key={i}
                        className="-mx-5 px-5 transition-colors duration-200 hover:bg-white/[0.02]"
                      >
                        {line.startsWith("//") ? (
                          <span className="italic text-slate-500">{line}</span>
                        ) : hasColon && key !== null && val !== null ? (
                          <>
                            <span className="text-cyan-300">{key}</span>
                            <span className="mx-0.5 text-slate-500">:</span>
                            <span className="text-emerald-400">{val}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">{line}</span>
                        )}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>
          </motion.div>

          {/* RIGHT */}
          <div className="flex h-full flex-col gap-2.5 lg:gap-3">
            {/* Stats */}
            <div className="grid auto-rows-fr grid-cols-2 gap-2.5 sm:gap-3">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                  }}
                >
                  <GlassCard
                    glow
                    className="counter-card group relative flex h-full min-h-[130px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-3 text-center transition-all duration-300 hover:bg-white/[0.04] sm:p-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10 mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent transition-all duration-300 group-hover:from-primary group-hover:to-accent sm:text-5xl">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                      />
                    </div>

                    <p className="relative z-10 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-slate-400 transition-colors group-hover:text-slate-300 sm:text-xs">
                      {stat.label}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Focus Areas */}
            <div className="grid auto-rows-fr grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
              {FOCUS_AREAS.map((area, i) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: 0.4 + i * 0.1,
                    duration: 0.5,
                  }}
                  className="h-full"
                >
                  <GlassCard
                    glow
                    className={`group flex h-full min-h-[175px] flex-col rounded-2xl border bg-white/[0.02] p-4 transition-all duration-300 hover:bg-white/[0.04] sm:p-5 ${
                      area.bg.split(" ")[1]
                    }`}
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                      <area.icon
                        size={22}
                        className={`${area.color}`}
                      />
                    </div>

                    <h3 className="mb-2 font-display text-lg font-bold tracking-tight text-slate-100 transition-colors group-hover:text-white">
                      {area.title}
                    </h3>

                    <p className="mt-auto text-sm leading-relaxed text-slate-400 transition-colors group-hover:text-slate-300">
                      {area.desc}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}