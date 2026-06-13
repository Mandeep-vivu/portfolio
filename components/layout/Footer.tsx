"use client";
import { Mail, Heart, ArrowUp } from "lucide-react";
import { FiGithub as Github, FiLinkedin as Linkedin } from "react-icons/fi";
import { usePortfolio } from "@/components/providers/PortfolioProvider";

export default function Footer() {
  const { profile, contact } = usePortfolio();
  const socials = [
    { icon: Github, href: contact.github, label: "GitHub" },
    { icon: Linkedin, href: contact.linkedin, label: "LinkedIn" },
    { icon: Mail, href: `mailto:${contact.email}`, label: "Email" },
  ];
  return (
    <footer className="relative border-t border-white/5 bg-[#030712]/80 backdrop-blur-xl">
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="font-display font-black text-white text-xs">MS</span>
              </div>
              <span className="font-display font-bold text-white text-lg">
                {profile.name}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-mono">
              &lt;AI Engineer /&gt; · Building the future, one model at a time.
            </p>
          </div>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-white hover:shadow-neon-sm"
              >
                <Icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
              </a>
            ))}
          </div>

          {/* Scroll to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 hover:shadow-neon-sm transition-all duration-300 group"
            aria-label="Scroll to top"
          >
            <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="my-8 w-full">
          <div className="section-divider" aria-hidden="true" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-slate-600 text-sm">
            © 2026 Mandeep Singh. All rights reserved.
          </p>
          <p className="text-slate-600 text-sm flex items-center gap-1.5">
            Built with <Heart size={12} className="text-red-500 fill-red-500" /> using Next.js & Framer Motion
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-mono">Available for opportunities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
