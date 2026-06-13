"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Award,
  Brain,
  FolderGit2,
  Menu,
  Route,
  Send,
  Terminal,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortfolio } from "@/components/providers/PortfolioProvider";

type NavLink = {
  label: string;
  href: string;
  cue: string;
  icon: LucideIcon;
};

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about", cue: "Profile", icon: UserRound },
  { label: "Skills", href: "#skills", cue: "Stack", icon: Brain },
  { label: "Projects", href: "#projects", cue: "Builds", icon: FolderGit2 },
  { label: "Journey", href: "#journey", cue: "Path", icon: Route },
  { label: "Achievements", href: "#achievements", cue: "Wins", icon: Award },
  { label: "Contact", href: "#contact", cue: "Reach", icon: Send },
];

export default function Navbar() {
  const { profile } = usePortfolio();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollCleanupRef = useRef<number | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (query.matches) setMobileOpen(false);
    };

    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollCleanupRef.current) {
        window.clearTimeout(scrollCleanupRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + window.innerHeight * 0.35; // 35% viewport offset for precise active detection on mobile & desktop

      let currentActive = "";
      for (const link of NAV_LINKS) {
        const el = document.querySelector(link.href) as HTMLElement;
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActive = link.href;
          }
        }
      }

      // If we are at the very bottom, force select Contact
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        currentActive = "#contact";
      }

      // If we are at the very top (Hero), active should be empty
      if (window.scrollY < 80) {
        currentActive = "";
      }

      setActive(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getHeaderOffset = () => {
    const nav = document.querySelector("[data-navbar-inner]") as HTMLElement | null;
    const navBottom = nav?.getBoundingClientRect().bottom ?? 64;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    return navBottom + (isMobile ? 12 : 20);
  };

  const scrollTo = (href: string) => {
    if (scrollCleanupRef.current) {
      window.clearTimeout(scrollCleanupRef.current);
    }

    isScrollingRef.current = true;
    setActive(href);
    setMobileOpen(false);

    window.requestAnimationFrame(() => {
      const target = document.querySelector(href) as HTMLElement;
      if (target) {
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - getHeaderOffset());
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });

        window.history.replaceState(null, "", href);
      }
    });

    scrollCleanupRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      setActive(href);
      scrollCleanupRef.current = null;
    }, 1200);
  };

  const scrollToTop = () => {
    if (scrollCleanupRef.current) {
      window.clearTimeout(scrollCleanupRef.current);
    }

    isScrollingRef.current = true;
    setActive("");
    setMobileOpen(false);

    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      window.history.replaceState(null, "", window.location.pathname);
    });

    scrollCleanupRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      setActive("");
      scrollCleanupRef.current = null;
    }, 900);
  };

  return (
    <>
      <motion.nav
        className="fixed left-3 right-3 top-3 z-50 rounded-2xl border-x-0 border-t-0 md:left-0 md:right-0 md:top-0 md:rounded-none"
        aria-label="Primary navigation"
      >
        <div
          data-navbar-inner
          className={`transition-all duration-300 border-x border-t glass-dark md:rounded-none md:border-x-0 md:border-t-0 ${
            scrolled
              ? "border-primary/25 shadow-[0_12px_34px_rgba(0,0,0,0.42)] md:border-b md:shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
              : "border-white/8 shadow-[0_10px_28px_rgba(0,0,0,0.3)] md:border-b md:border-white/5 md:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
          }`}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3 md:h-16 md:gap-4">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="group flex min-w-0 items-center gap-2.5"
              aria-label="Go to top"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon-sm transition-all duration-300 group-hover:shadow-neon-md">
                <span className="font-display font-black text-white text-sm">MS</span>
              </div>
              <span className="min-w-0 text-left sm:hidden">
                <span className="block font-display text-[0.94rem] font-bold leading-none text-white">
                  Mandeep<span className="text-primary">.</span>
                </span>
                <span className="mt-0.5 block font-mono text-[0.54rem] uppercase tracking-[0.16em] text-slate-500">
                  AI/ML
                </span>
              </span>
              <span className="hidden font-display font-bold text-white transition-colors duration-300 group-hover:text-primary sm:block">
                Mandeep<span className="text-primary">.</span>
              </span>
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 lg:px-4 ${
                    active === link.href
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {active === link.href && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-primary/15 border border-primary/30"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              ))}
            </div>

            {/* CTA + Mobile */}
            <div className="flex items-center gap-3">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-neon-sm transition-all duration-300"
              >
                <Terminal size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                Resume
              </a>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-primary/40 hover:text-white active:scale-95 md:hidden"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

          {/* Dynamic scroll progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent to-secondary origin-left opacity-90 shadow-[0_1px_4px_rgba(99,102,241,0.4)]"
            style={{ scaleX }}
          />
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#030712]/68 backdrop-blur-sm md:hidden"
            />
            {/* Menu Panel */}
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="fixed left-3 right-3 top-[76px] z-[60] overflow-hidden rounded-2xl border border-white/10 bg-[#030712]/94 shadow-[0_22px_60px_rgba(0,0,0,0.62)] backdrop-blur-2xl md:hidden"
            >
              <div className="border-b border-white/8 px-4 py-3">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-slate-500">
                  Navigate
                </p>
                <p className="mt-1 font-display text-lg font-bold leading-none text-white">
                  Portfolio Sections
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3">
                {NAV_LINKS.map((link, i) => {
                  const Icon = link.icon;

                  return (
                    <motion.button
                      key={link.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.035 }}
                      onClick={() => scrollTo(link.href)}
                      className={`group flex min-h-[66px] items-center gap-2.5 rounded-lg border px-3 text-left transition-all active:scale-[0.98] ${
                        active === link.href
                          ? "border-primary/45 bg-primary/16 text-white shadow-neon-sm"
                          : "border-white/8 bg-white/[0.025] text-slate-300 hover:border-primary/25 hover:bg-white/[0.055] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          active === link.href
                            ? "border-primary/35 bg-primary/20 text-primary"
                            : "border-white/8 bg-white/[0.035] text-slate-400 group-hover:text-accent"
                        }`}
                      >
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.82rem] font-semibold leading-none">
                          {link.label}
                        </span>
                        <span className="mt-1.5 block truncate font-mono text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">
                          {link.cue}
                        </span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="border-t border-white/8 p-3">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-neon-sm active:scale-[0.98]"
                >
                  <Terminal size={15} /> Resume
                </a>
              </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
