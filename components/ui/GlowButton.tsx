"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "outline" | "cyan";
  size?: "sm" | "md" | "lg";
  className?: string;
  target?: string;
  rel?: string;
  magnetic?: boolean;
}

export default function GlowButton({
  children, onClick, href, variant = "primary",
  size = "md", className = "", target, rel, magnetic = true,
}: GlowButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.25, y: y * 0.25 });
  };
  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
    setHovered(false);
  };

  const sizes = { sm: "px-4 py-2 text-sm", md: "px-5 py-3 text-sm", lg: "px-8 py-4 text-[0.95rem]" };
  const variants = {
    primary: `bg-gradient-to-r from-primary via-secondary to-accent text-white hover:shadow-neon-md border border-primary/30`,
    outline: `bg-white/[0.03] text-slate-200 border border-white/10 hover:bg-primary/10 hover:text-white hover:border-primary/45 hover:shadow-neon-sm`,
    cyan: `bg-gradient-to-r from-accent to-primary text-white hover:shadow-neon-cyan border border-accent/30`,
  };

  const baseClass = `relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl font-body font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${sizes[size]} ${variants[variant]} ${className}`;

  const commonProps = {
    ref: ref as React.RefObject<HTMLAnchorElement & HTMLButtonElement>,
    className: baseClass,
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: handleMouseLeave,
    style: {
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
    },
  };

  const inner = (
    <>
      {/* Shimmer overlay */}
      {hovered && (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_0.6s_ease]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    return (
      <motion.a whileTap={{ scale: 0.97 }} href={href} target={target} rel={rel} {...(commonProps as React.ComponentProps<typeof motion.a>)}>
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} {...(commonProps as React.ComponentProps<typeof motion.button>)}>
      {inner}
    </motion.button>
  );
}
