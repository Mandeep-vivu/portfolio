"use client";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children, className = "", hover = true, glow = false, onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`
        glass relative overflow-hidden rounded-2xl border-white/10
        ${glow ? "hover:shadow-[0_0_34px_rgba(99,102,241,0.22)] hover:border-primary/35" : "hover:border-white/20"}
        transition-all duration-300
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* Inner shimmer on top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  );
}
