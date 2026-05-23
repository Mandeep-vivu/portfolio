"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { Mail, Download, ArrowRight } from "lucide-react";
import { FiGithub as Github, FiLinkedin as Linkedin } from "react-icons/fi";

import GlowButton from "@/components/ui/GlowButton";
import { PERSONAL } from "@/lib/data";

const AIOrb = dynamic(() => import("@/components/three/AIOrb"), {
  ssr: false,
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
    },
  },
};

const SOCIALS = [
  { icon: Github, href: PERSONAL.github, label: "GitHub" },
  { icon: Linkedin, href: PERSONAL.linkedin, label: "LinkedIn" },
  { icon: Mail, href: `mailto:${PERSONAL.email}`, label: "Email" },
];

export default function Hero({ isLoading = false }: { isLoading?: boolean }) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize mousemove listener after loading completes
    if (isLoading) return;

    const handleMove = (e: MouseEvent) => {
      const el = spotlightRef.current;

      if (!el) return;

      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });

    return () => window.removeEventListener("mousemove", handleMove);
  }, [isLoading]);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-background"
    >
      {/* spotlight - only render after loading completes */}
      {!isLoading && (
        <div
          ref={spotlightRef}
          className="spotlight"
          aria-hidden="true"
          style={
            {
              "--x": "50%",
              "--y": "35%",
            } as React.CSSProperties
          }
        />
      )}

      {/* ambient glow - only render after loading completes */}
      {!isLoading && (
        <>
          <div className="pointer-events-none absolute left-1/4 top-1/2 z-0 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-1/4 top-1/3 z-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[100px]" />
        </>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-screen items-center gap-4 sm:gap-8 py-6 sm:py-12 lg:min-h-[100svh] lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:py-18">
          {/* ORB - FIRST ON MOBILE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.35,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="order-1 lg:order-2 relative h-[280px] sm:h-[380px] md:h-[420px] lg:h-[600px]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full bg-primary/10 blur-[80px] sm:h-80 sm:w-80 md:h-96 md:w-96 lg:h-96 lg:w-96" />
            </div>

            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-40 w-40 animate-spin rounded-full border-2 border-primary/30" />
                </div>
              }
            >
              <AIOrb />
            </Suspense>

            {/* floating chips */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: 0.5,
              }}
              className="glass absolute right-0 top-12 hidden max-w-[160px] overflow-hidden rounded-xl border-accent/20 px-3 py-2 font-mono text-xs text-accent md:block lg:right-8"
            >
              🧠 AI/ML Research
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="glass absolute bottom-14 left-0 hidden max-w-[160px] overflow-hidden rounded-xl border-secondary/20 px-3 py-2 font-mono text-xs text-secondary md:block lg:left-8"
            >
              ⚡ Full Stack Dev
            </motion.div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="glass absolute right-0 top-1/2 hidden max-w-[160px] overflow-hidden rounded-xl border-primary/20 px-3 py-2 font-mono text-xs text-primary md:block lg:right-4"
            >
              ☁️ Cloud Native
            </motion.div>
          </motion.div>

          {/* LEFT - TEXT CONTENT */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative order-2 lg:order-1 max-w-[760px] lg:pl-8"
          >
            {/* rail */}
            <div className="pointer-events-none absolute left-0 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-cyan-400/30 via-indigo-400/10 to-transparent lg:block" />

            <div className="relative lg:pl-7">
              {/* top badges */}
              <motion.div
                variants={item}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="neon-badge border-emerald-500/35 bg-emerald-500/10 text-emerald-300 text-[0.65rem] sm:text-[0.75rem]">
                  Available for opportunities
                </span>

                <span className="neon-badge border-indigo-500/35 bg-indigo-500/10 text-indigo-300 text-[0.65rem] sm:text-[0.75rem]">
                  M.E. AI/ML @ CU
                </span>
              </motion.div>

              {/* intro */}
              <motion.div
                variants={item}
                className="mt-4 sm:mt-5 flex items-center gap-2 font-mono text-[0.75rem] sm:text-sm tracking-[0.12em] text-slate-300"
              >
                <span className="text-indigo-400">&gt;</span>
                <span className="text-emerald-400">Hello</span>
                <span className="text-cyan-400">World</span>
                <span className="text-white/80">! I&apos;m</span>
                <span className="h-4 w-[2px] animate-pulse rounded-full bg-cyan-400/70" />
              </motion.div>

              {/* name */}
              <motion.div variants={item} className="mt-4 sm:mt-8">
                <h1 className="font-display text-[clamp(2rem,7.5vw,6.2rem)] font-black leading-[0.9] tracking-[-0.065em]">
                  <span className="block text-white">Mandeep</span>

                  <span className="gradient-text block">
                    Singh
                  </span>
                </h1>
              </motion.div>

              {/* role */}
              <motion.div variants={item} className="mt-4 sm:mt-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-mono text-[0.5rem] sm:text-[0.64rem] font-bold uppercase tracking-[0.26em] text-cyan-500/60">
                    Role
                  </span>

                  <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-cyan-400/40 to-transparent" />
                </div>

                <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                  <span className="font-mono text-indigo-400/60 text-[0.85rem] sm:text-base">
                    &lt;
                  </span>

                  <div className="text-[0.95rem] sm:text-[1.85rem] font-semibold leading-none text-cyan-300">
                    <TypeAnimation
                      sequence={[
                        "AI/ML Engineer",
                        2000,
                        "Full Stack Developer",
                        2000,
                        "Cloud Architect",
                        2000,
                        "Data Scientist",
                        2000,
                      ]}
                      wrapper="span"
                      speed={50}
                      repeat={Infinity}
                    />
                  </div>

                  <span className="font-mono text-indigo-400/60 text-[0.85rem] sm:text-base">
                    /&gt;
                  </span>
                </div>
              </motion.div>

              {/* description */}
              <motion.div
                variants={item}
                className="mt-5 sm:mt-8 max-w-[620px] space-y-2 sm:space-y-3.5"
              >
                <p className="text-[0.73rem] sm:text-base leading-relaxed sm:leading-[1.85] text-slate-300/85">
                  Architecting intelligent systems at the intersection of{" "}
                  <span className="font-medium text-cyan-300">
                    AI research
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-indigo-300">
                    production engineering
                  </span>
                  .
                </p>

                <p className="text-[0.73rem] sm:text-base leading-relaxed sm:leading-[1.85] text-slate-300/85">
                  Pursuing{" "}
                  <span className="font-medium text-purple-300">
                    M.E. in AI &amp; ML
                  </span>{" "}
                  at Chandigarh University.
                </p>
              </motion.div>

              {/* buttons */}
              <motion.div variants={item} className="mt-5 sm:mt-9">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
                  <GlowButton
                    href={PERSONAL.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    size="md"
                    className="group w-full sm:w-auto sm:min-w-[215px] justify-center text-[0.8rem] sm:text-sm px-3.5 sm:px-5 py-2 sm:py-3 min-h-[44px] sm:min-h-auto"
                  >
                    <Download
                      size={15}
                      className="transition-transform duration-300 group-hover:scale-110 sm:w-[18px] sm:h-[18px]"
                    />

                    <span className="hidden sm:inline">Download Resume</span>
                    <span className="sm:hidden">Resume</span>
                  </GlowButton>

                  <GlowButton
                    href="#contact"
                    variant="outline"
                    size="md"
                    className="group w-full sm:w-auto sm:min-w-[215px] justify-center text-[0.8rem] sm:text-sm px-3.5 sm:px-5 py-2 sm:py-3 min-h-[44px] sm:min-h-auto"
                    onClick={() => {
                      document
                        .querySelector("#contact")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    Let&apos;s Connect

                    <ArrowRight
                      size={15}
                      className="transition-transform duration-300 group-hover:translate-x-1 sm:w-[18px] sm:h-[18px]"
                    />
                  </GlowButton>
                </div>

                {/* socials */}
                <div className="mt-5 sm:mt-8 border-t border-white/[0.08] pt-4 sm:pt-6">
                  <div className="flex flex-col gap-2.5 sm:gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <span className="font-mono text-[0.6rem] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Connect
                    </span>

                    <div className="flex items-center gap-2.5 sm:gap-4">
                      {SOCIALS.map(({ icon: Icon, href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="glass group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl border-white/[0.08] bg-white/[0.02] text-slate-400 transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-95"
                        >
                          <Icon
                            size={15}
                            className="transition-transform duration-300 group-hover:scale-105 sm:w-[17px] sm:h-[17px]"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}