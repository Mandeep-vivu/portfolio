"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  BriefcaseBusiness,
  GraduationCap,
  Users,
} from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { TIMELINE } from "@/lib/data";

const TYPE_STYLES = {
  education: {
    icon: GraduationCap,
    dot: "bg-blue-500",
    border: "border-blue-500/10",
    badge:
      "bg-blue-500/8 text-blue-300 border-blue-500/10",
    label: "Education",
  },

  experience: {
    icon: BriefcaseBusiness,
    dot: "bg-violet-500",
    border: "border-violet-500/10",
    badge:
      "bg-violet-500/8 text-violet-300 border-violet-500/10",
    label: "Experience",
  },

  leadership: {
    icon: Users,
    dot: "bg-cyan-500",
    border: "border-cyan-500/10",
    badge:
      "bg-cyan-500/8 text-cyan-300 border-cyan-500/10",
    label: "Leadership",
  },
} as const;

function TimelineEntry({
  entry,
  index,
}: {
  entry: (typeof TIMELINE)[number];
  index: number;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.08,
  });

  const style = TYPE_STYLES[entry.type];
  const Icon = style.icon;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.34,
        delay: index * 0.035,
        ease: "easeOut",
      }}
      className="relative grid grid-cols-1 gap-2.5 pl-10 md:grid-cols-[175px_minmax(0,1fr)] md:gap-4 md:pl-0"
    >
      {/* dot */}
      <div className="absolute left-[15px] top-4 z-20 md:left-[180px]">
        <span
          className={`block h-2 w-2 rounded-full ${style.dot} shadow-[0_0_10px_rgba(99,102,241,0.5)]`}
        />
      </div>

      {/* left meta */}
      <div className="flex flex-col md:items-end md:pr-4">
        <p className="font-mono text-[0.58rem] tracking-[0.12em] text-slate-500">
          {entry.year}
        </p>

        <span
          className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-[3px] text-[0.54rem] font-medium tracking-wide ${style.badge}`}
        >
          <Icon size={9} />
          {style.label}
        </span>
      </div>

      {/* card */}
      <div
        className={`glass relative overflow-hidden rounded-xl border bg-gradient-to-br from-white/[0.03] via-white/[0.008] to-transparent px-5 py-3.5 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_22px_rgba(99,102,241,0.1)] ${style.border}`}
      >
        {/* glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_35%)]" />

        {/* content */}
        <div className="relative z-10">
          <h3 className="font-display text-[0.94rem] font-semibold leading-snug text-white">
            {entry.title}
          </h3>

          <p className="mt-0.5 text-[0.76rem] font-medium text-primary">
            {entry.org}
          </p>

          <p className="mt-1.5 text-[0.79rem] leading-5 text-slate-400">
            {entry.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export default function Timeline() {
  return (
    <section
      id="journey"
      className="section-padding relative overflow-hidden"
    >
      {/* glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[75px]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-5">
        <SectionHeading
          label="My Journey"
          title="Experience &"
          highlight="Education"
          subtitle="From student to engineer."
        />

        <div className="relative mx-auto mt-6 max-w-4xl space-y-3">
          {/* line */}
          <div className="absolute bottom-0 left-[18px] top-0 w-px bg-gradient-to-b from-primary/50 via-violet-500/30 to-transparent md:left-[184px]" />

          {TIMELINE.map((entry, index) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}