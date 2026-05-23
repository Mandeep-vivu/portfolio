"use client";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface SectionHeadingProps {
  label: string;       // small label above
  title: string;       // main heading
  highlight?: string;  // highlighted part of title
  subtitle?: string;   // description below
  centered?: boolean;
}

export default function SectionHeading({
  label, title, highlight, subtitle, centered = true,
}: SectionHeadingProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mb-6 md:mb-8 ${centered ? "text-center" : ""}`}
    >
      {/* Label */}
      <div className={`flex items-center gap-3 mb-4 ${centered ? "justify-center" : ""}`}>
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
        <span className="font-mono text-primary text-xs tracking-[0.2em] uppercase">
          {label}
        </span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
      </div>

      {/* Title */}
      <h2 className="font-display text-4xl md:text-5xl lg:text-[3.35rem] font-black text-white mb-4 leading-[1.05] tracking-tight">
        {highlight ? (
          <>
            {title.replace(highlight, "")}{" "}
            <span className="gradient-text">{highlight}</span>
          </>
        ) : (
          title
        )}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className={`text-sm text-slate-400 md:text-base max-w-xl leading-relaxed ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
