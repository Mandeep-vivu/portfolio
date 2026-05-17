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
        <div className="grid min-h-[100svh] grid-cols-1 items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:py-18">
          {/* LEFT */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative order-2 max-w-[760px] lg:order-1 lg:pl-8"
          >
            {/* rail */}
            <div className="pointer-events-none absolute left-0 top-4 hidden h-[calc(100%-2rem)] w-px bg-gradient-to-b from-cyan-400/30 via-indigo-400/10 to-transparent lg:block" />

            <div className="relative lg:pl-7">
              {/* top badges */}
              <motion.div
                variants={item}
                className="flex flex-wrap items-center gap-2.5"
              >
                <span className="neon-badge border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
                  Available for opportunities
                </span>

                <span className="neon-badge border-indigo-500/35 bg-indigo-500/10 text-indigo-300">
                  M.E. AI/ML @ CU
                </span>
              </motion.div>

              {/* intro */}
              <motion.div
                variants={item}
                className="mt-5 flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-slate-300"
              >
                <span className="text-indigo-400">&gt;</span>
                <span className="text-emerald-400">Hello</span>
                <span className="text-cyan-400">World</span>
                <span className="text-white/80">! I&apos;m</span>
                <span className="h-4 w-[2px] animate-pulse rounded-full bg-cyan-400/70" />
              </motion.div>

              {/* name */}
              <motion.div variants={item} className="mt-8 sm:mt-10">
                <h1 className="font-display text-[clamp(3.7rem,8vw,6.2rem)] font-black leading-[0.88] tracking-[-0.065em]">
                  <span className="block text-white">Mandeep</span>

                  <span className="gradient-text block">
                    Singh
                  </span>
                </h1>
              </motion.div>

              {/* role */}
              <motion.div variants={item} className="mt-7 sm:mt-8">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[0.64rem] font-bold uppercase tracking-[0.26em] text-cyan-500/60">
                    Role
                  </span>

                  <div className="h-px w-32 bg-gradient-to-r from-cyan-400/40 to-transparent sm:w-44" />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="font-mono text-indigo-400/60">
                    &lt;
                  </span>

                  <div className="text-[1.45rem] font-semibold leading-none text-cyan-300 sm:text-[1.85rem]">
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

                  <span className="font-mono text-indigo-400/60">
                    /&gt;
                  </span>
                </div>
              </motion.div>

              {/* description */}
              <motion.div
                variants={item}
                className="mt-8 max-w-[620px] space-y-3.5"
              >
                <p className="text-[1rem] leading-[1.85] text-slate-300/85">
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

                <p className="text-[1rem] leading-[1.85] text-slate-300/85">
                  Pursuing{" "}
                  <span className="font-medium text-purple-300">
                    M.E. in AI & ML
                  </span>{" "}
                  at Chandigarh University.
                </p>
              </motion.div>

              {/* buttons */}
              <motion.div variants={item} className="mt-9">
                <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4">
                  <GlowButton
                    href={PERSONAL.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="primary"
                    size="lg"
                    className="group min-w-[215px] justify-center"
                  >
                    <Download
                      size={18}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />

                    Download Resume
                  </GlowButton>

                  <GlowButton
                    href="#contact"
                    variant="outline"
                    size="lg"
                    className="group min-w-[215px] justify-center"
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
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </GlowButton>
                </div>

                {/* socials */}
                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Connect
                    </span>

                    <div className="flex items-center gap-4">
                      {SOCIALS.map(({ icon: Icon, href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="glass group flex h-11 w-11 items-center justify-center rounded-xl border-white/[0.08] bg-white/[0.02] text-slate-400 transition-all duration-300 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:text-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)]"
                        >
                          <Icon
                            size={17}
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.35,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="order-1 relative h-[320px] sm:h-[380px] md:h-[460px] lg:order-2 lg:h-[600px]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-primary/10 blur-[90px] sm:h-80 sm:w-80" />
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
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="glass absolute right-4 top-12 hidden rounded-xl border-accent/20 px-3 py-2 font-mono text-xs text-accent md:block lg:right-8"
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
              className="glass absolute bottom-14 left-4 hidden rounded-xl border-secondary/20 px-3 py-2 font-mono text-xs text-secondary md:block lg:left-8"
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
              className="glass absolute right-2 top-1/2 hidden rounded-xl border-primary/20 px-3 py-2 font-mono text-xs text-primary md:block lg:right-4"
            >
              ☁️ Cloud Native
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}