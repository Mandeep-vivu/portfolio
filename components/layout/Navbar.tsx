"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Achievements", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrollingRef = useRef(false);
  const scrollCleanupRef = useRef<(() => void) | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollPosition = window.scrollY + 120; // 120px offset for precise active detection

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

  const scrollTo = (href: string) => {
    // If there is an active scroll listener, clean it up immediately first
    if (scrollCleanupRef.current) {
      scrollCleanupRef.current();
    }

    isScrollingRef.current = true;
    setActive(href);
    setMobileOpen(false);

    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      const navbarHeight = 64; // Exactly match fixed navbar height (64px) to align section perfectly in viewport
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    let scrollTimeout: NodeJS.Timeout;
    
    const cleanup = () => {
      window.removeEventListener("scroll", checkScrollEnd);
      clearTimeout(fallbackTimeout);
      isScrollingRef.current = false;
      setActive(href);
      scrollCleanupRef.current = null;
    };

    const checkScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(cleanup, 100);
    };

    // Fallback: in case no scrolling occurs (already at target or near it)
    const fallbackTimeout = setTimeout(cleanup, 1000);

    // Save cleanup function for cancellation
    scrollCleanupRef.current = cleanup;

    window.addEventListener("scroll", checkScrollEnd, { passive: true });
  };

  const scrollToTop = () => {
    // If there is an active scroll listener, clean it up immediately first
    if (scrollCleanupRef.current) {
      scrollCleanupRef.current();
    }

    isScrollingRef.current = true;
    setActive("");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });

    let scrollTimeout: NodeJS.Timeout;
    
    const cleanup = () => {
      window.removeEventListener("scroll", checkScrollEnd);
      clearTimeout(fallbackTimeout);
      isScrollingRef.current = false;
      setActive("");
      scrollCleanupRef.current = null;
    };

    const checkScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(cleanup, 100);
    };

    // Fallback: in case already at top
    const fallbackTimeout = setTimeout(cleanup, 1000);

    // Save cleanup function for cancellation
    scrollCleanupRef.current = cleanup;

    window.addEventListener("scroll", checkScrollEnd, { passive: true });
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 rounded-none border-x-0 border-t-0 transition-all duration-300 ${
          scrolled
            ? "glass-dark border-b border-primary/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "glass-dark border-b border-white/5 shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-neon-sm group-hover:shadow-neon-md transition-all duration-300">
                <span className="font-display font-black text-white text-sm">MS</span>
              </div>
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
                href="https://www.canva.com/design/DAFlhUbanOo/view"
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-neon-sm transition-all duration-300"
              >
                <Terminal size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                Resume
              </a>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg glass text-slate-400 hover:text-white transition-all"
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
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 glass-dark border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-4"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => scrollTo(link.href)}
                className={`block w-full text-left px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all ${
                  active === link.href
                    ? "bg-primary/15 text-white border border-primary/30 shadow-neon-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </motion.button>
            ))}
            <a
              href="https://www.canva.com/design/DAFlhUbanOo/view"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:shadow-neon-sm hover:brightness-110 transition-all duration-300"
            >
              <Terminal size={14} className="animate-pulse" /> Download Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
