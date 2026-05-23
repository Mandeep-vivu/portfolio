"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  ExternalLink,
  Award,
  Trophy,
  Star,
} from "lucide-react";

import SectionHeading from "@/components/ui/SectionHeading";
import { ACHIEVEMENTS } from "@/lib/data";

const TYPE_STYLES = {
  certification: {
    gradient: "from-blue-500/15 to-indigo-500/15",
    border: "border-blue-500/15",
    label: "Certification",
    labelColor:
      "text-blue-300 bg-blue-500/10 border-blue-500/20",
  },

  award: {
    gradient: "from-yellow-500/15 to-orange-500/15",
    border: "border-yellow-500/15",
    label: "Award",
    labelColor:
      "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  },

  leadership: {
    gradient: "from-violet-500/15 to-purple-500/15",
    border: "border-violet-500/15",
    label: "Leadership",
    labelColor:
      "text-violet-300 bg-violet-500/10 border-violet-500/20",
  },

  academic: {
    gradient: "from-emerald-500/15 to-teal-500/15",
    border: "border-emerald-500/15",
    label: "Academic",
    labelColor:
      "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
} as const;

function AchievementCard({
  achievement,
  index,
}: {
  achievement: (typeof ACHIEVEMENTS)[0];
  index: number;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.08,
  });

  const style = TYPE_STYLES[achievement.type];

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.98,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : {}
      }
      transition={{
        delay: index * 0.05,
        duration: 0.38,
        ease: "easeOut",
      }}
      className="h-full"
    >
      <div
        className={`glass relative flex h-full min-h-[118px] sm:min-h-[148px] flex-col overflow-hidden rounded-lg sm:rounded-xl border px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all duration-300 hover:border-opacity-50 hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] ${style.border}`}
      >
        {/* top line */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${style.gradient}`}
        />

        {/* top */}
        <div className="mb-2 sm:mb-3 flex items-start justify-between gap-2 sm:gap-3">
          <span className="flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded text-[0.75rem] sm:text-[1.15rem]">
            {achievement.icon}
          </span>

          <span
            className={`rounded-full border px-1.5 sm:px-2 py-[2px] sm:py-[3px] font-mono text-[0.48rem] sm:text-[0.56rem] tracking-wide flex-shrink-0 ${style.labelColor}`}
          >
            <span className="hidden sm:inline">{style.label}</span>
            <span className="sm:hidden">{style.label.split(' ')[0]}</span>
          </span>
        </div>

        {/* title */}
        <h3 className="font-display text-[0.86rem] sm:text-[0.9rem] font-semibold leading-snug text-white line-clamp-2">
          {achievement.title}
        </h3>

        {/* desc */}
        <p className="mt-1.5 flex-1 text-[0.72rem] sm:text-[0.78rem] leading-5 text-slate-400 line-clamp-3">
          {achievement.description}
        </p>

        {/* link */}
        {achievement.link && (
          <a
            href={achievement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[0.64rem] sm:mt-2.5 sm:text-[0.68rem] font-medium text-primary transition-colors hover:text-accent active:scale-95"
          >
            <ExternalLink size={8} className="sm:w-[10px] sm:h-[10px]" />
            <span className="hidden sm:inline">View Certificate</span>
            <span className="sm:hidden">Cert</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function Achievements() {
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <section
      id="achievements"
      className="md:min-h-[calc(100dvh-64px)] md:flex md:flex-col md:justify-center section-padding relative overflow-hidden"
    >
      {/* top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/25 to-transparent" />

      {/* glows */}
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-secondary/5 blur-[100px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-accent/5 blur-[70px]" />

      <div className="mx-auto max-w-5xl px-4 sm:px-5">
        <SectionHeading
          label="Recognition"
          title="Achievements &"
          highlight="Certifications"
          subtitle="Awards, certifications, and leadership milestones."
        />

        {/* stats */}
        <motion.div
          ref={statsRef}
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={
            statsInView
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 14 }
          }
          transition={{
            duration: 0.4,
          }}
          className="mb-5 grid grid-cols-1 gap-2.5 min-[430px]:grid-cols-3 sm:mb-6 sm:gap-3"
        >
          {[
            {
              icon: Award,
              label: "Certifications",
              value: "3+",
              color: "text-blue-400",
            },

            {
              icon: Trophy,
              label: "Competition Awards",
              value: "2+",
              color: "text-yellow-400",
            },

            {
              icon: Star,
              label: "Leadership Roles",
              value: "4+",
              color: "text-violet-400",
            },
          ].map(
            ({
              icon: Icon,
              label,
              value,
              color,
            }) => (
              <div
                key={label}
                className="glass flex items-center justify-start gap-3 rounded-xl border border-white/8 p-3 text-left min-[430px]:flex-col min-[430px]:justify-center min-[430px]:gap-1.5 min-[430px]:text-center sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:py-3 sm:text-left"
              >
                <Icon
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] ${color}`}
                />

                <div>
                  <p
                    className={`font-display text-[1rem] font-bold leading-none ${color}`}
                  >
                    {value}
                  </p>

                  <p className="mt-1 text-[0.68rem] sm:text-[0.7rem] leading-tight text-slate-500">
                    {label}
                  </p>
                </div>
              </div>
            )
          )}
        </motion.div>

        {/* cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((ach, i) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
