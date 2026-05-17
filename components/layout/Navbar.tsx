"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-dark shadow-[0_2px_30px_rgba(0,0,0,0.4)] border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group flex items-center gap-2"
            >
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-neon-sm group-hover:shadow-neon-md transition-all duration-300">
                <span className="font-display font-black text-white text-sm">MS</span>
              </div>
              <span className="font-display font-bold text-white hidden sm:block group-hover:gradient-text transition-all">
                Mandeep<span className="text-primary">.</span>
              </span>
            </button>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 lg:px-4 ${
                    active === link.href
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
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
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary hover:text-white hover:shadow-neon-sm transition-all duration-300"
              >
                <Terminal size={14} />
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
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-40 glass-dark border-b border-white/5 p-4"
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => scrollTo(link.href)}
                className={`block w-full text-left px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all ${
                  active === link.href
                    ? "bg-primary/15 text-white border border-primary/30"
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
              className="flex items-center gap-2 mt-2 px-4 py-3 rounded-lg bg-primary text-white text-sm font-semibold"
            >
              <Terminal size={14} /> Download Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
