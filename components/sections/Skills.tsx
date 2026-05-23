"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Brain, CloudCog, Wrench } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import { SKILLS, type Skill } from "@/lib/data";
import {
  SiDocker,
  SiFastapi,
  SiFlutter,
  SiGithub,
  SiGnubash,
  SiHtml5,
  SiJupyter,
  SiKubernetes,
  SiLeetcode,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNumpy,
  SiPandas,
  SiPlotly,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiTensorflow,
} from "react-icons/si";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  SiDocker,
  SiFastapi,
  SiFlutter,
  SiGithub,
  SiGnubash,
  SiHtml5,
  SiJupyter,
  SiKubernetes,
  SiLeetcode,
  SiLinux,
  SiMongodb,
  SiNextdotjs,
  SiNumpy,
  SiPandas,
  SiPlotly,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiReact,
  SiScikitlearn,
  SiTensorflow,
};

const TABS = [
  { id: "ai", label: "AI / ML & Data", icon: Brain },
  { id: "fullstack", label: "Full Stack & Cloud", icon: CloudCog },
  { id: "tools", label: "Tools & DevOps", icon: Wrench },
] as const;

function getSkillContext(category: Skill["category"]) {
  if (category === "ai") return "Modeling and data workflows";
  if (category === "fullstack") return "Production application stack";
  return "Developer tooling and systems";
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = ICON_MAP[skill.icon] ?? SiPython;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.04, duration: 0.45, ease: "easeOut" }}
    >
      <GlassCard glow className="group p-3.5 sm:p-5">
        <div className="mb-2.5 sm:mb-4 flex items-center gap-2.5 sm:gap-4">
          <div
            className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
            style={{ background: `${skill.color}18`, border: `1px solid ${skill.color}40` }}
          >
            <Icon size={15} className="sm:scale-125" style={{ color: skill.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center justify-between gap-2 sm:gap-3">
              <p className="truncate text-[0.82rem] sm:text-sm font-semibold text-white">{skill.name}</p>
              <p className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 sm:px-2 sm:py-0.5 font-mono text-[0.58rem] sm:text-[0.65rem] text-slate-400 flex-shrink-0">
                {skill.level}%
              </p>
            </div>
            <p className="truncate text-[0.68rem] sm:text-xs text-slate-500">{getSkillContext(skill.category)}</p>
          </div>
        </div>

        <div className="skill-bar-track h-1.5">
          <motion.div
            className="skill-bar-fill"
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: skill.level / 100 } : {}}
            transition={{ delay: index * 0.04 + 0.2, duration: 0.75, ease: "easeOut" }}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState<Skill["category"]>("ai");
  const filtered = SKILLS.filter((skill) => skill.category === activeTab);

  return (
    <section id="skills" className="md:min-h-[calc(100dvh-64px)] md:flex md:flex-col md:justify-center section-padding relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 rounded-full bg-primary/6 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/5 blur-[80px]" />

      <div className="mx-auto max-w-5xl">
        <SectionHeading
          label="Technical Skills"
          title="My Tech"
          highlight="Arsenal"
          subtitle="A curated stack of tools and technologies I use to architect intelligent systems."
        />

        {/* Tab row — hide-scrollbar prevents ugly mobile scrollbar */}
        <div className="hide-scrollbar mb-6 sm:mb-7 flex -mx-4 justify-start gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:px-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex min-h-[42px] items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-3.5 sm:px-4 py-2 text-[0.76rem] sm:text-xs font-semibold transition-all duration-300 sm:py-2.5 sm:text-sm whitespace-nowrap active:scale-95 ${
                activeTab === tab.id
                  ? "border border-primary/50 bg-primary text-white shadow-neon-sm"
                  : "glass border border-white/10 text-slate-400 hover:border-primary/30 hover:text-white"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* AnimatePresence for smooth tab transition without full re-mount */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4"
          >
            {filtered.map((skill, index) => (
              <SkillCard key={skill.name} skill={skill} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-7 text-center"
        >
          <p className="mb-4 font-mono text-sm text-slate-500">{"// also experienced with"}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["NumPy", "Pandas", "Matplotlib", "REST APIs", "Socket.IO", "Dart", "Excel", "Web Scraping", "JSON", "RDBMS"].map((tag) => (
              <span key={tag} className="neon-badge">{tag}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
