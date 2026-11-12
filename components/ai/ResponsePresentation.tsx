"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import ContactCard from "./ContactCard";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { safeHref } from "@/lib/url";

// ---------------------------------------------------------------------------
// Inline Markdown Formatter Helper
// ---------------------------------------------------------------------------
function parseMarkdownInline(text: string): React.ReactNode[] {
  if (!text) return [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  const tokens = text.split(regex);

  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index} className="font-bold text-white">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index} className="italic text-slate-300">{token.slice(1, -1)}</em>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.8rem] text-cyan-300 border border-white/5">
          {token.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const href = safeHref(linkMatch[2]?.trim());
      const linkText = linkMatch[1];
      // Model output is untrusted: links with unsafe protocols render as text.
      if (!href) return linkText;
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition"
        >
          {linkText}
        </a>
      );
    }
    return token;
  });
}

// ---------------------------------------------------------------------------
// 1. Highlight Chips Component
// ---------------------------------------------------------------------------
export function HighlightChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map((item, index) => (
        <motion.span
          key={index}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="rounded-full border border-cyan-500/25 bg-cyan-950/20 px-2 py-0.5 text-[0.68rem] font-mono text-cyan-300 font-semibold shadow-inner cursor-default"
        >
          {item.trim()}
        </motion.span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Summary Card Component
// ---------------------------------------------------------------------------
export function SummaryCard({ title, summary, highlights }: { title: string; summary: string; highlights: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/25 to-purple-950/15 p-4 shadow-lg"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4.5 w-4.5 text-indigo-300 shrink-0" />
        <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
      </div>
      <p className="text-xs leading-relaxed text-slate-300">{summary}</p>
      {highlights && highlights.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-white/5 pt-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-bold shrink-0">•</span>
              <span>{parseMarkdownInline(h)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 3. Key Facts Panel Component
// ---------------------------------------------------------------------------
export function KeyFactsPanel({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-2 gap-2.5 my-3.5"
    >
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center transition hover:border-cyan-500/20 hover:bg-white/[0.04]"
        >
          <span className="text-2xl font-black bg-gradient-to-br from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
            {stat.value}
          </span>
          <span className="text-[0.62rem] uppercase tracking-widest text-slate-400 mt-1 font-semibold">
            {stat.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 4. Comparison Table Component
// ---------------------------------------------------------------------------
export function ComparisonTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-3.5 rounded-xl border border-white/10 bg-black/20 shadow-md">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {headers.map((h, i) => (
              <th key={i} className="p-3 font-bold text-white tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.015] last:border-0 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className={`p-3 ${ci === 0 ? "font-semibold text-slate-300" : "text-slate-400"}`}>
                  {parseMarkdownInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Timeline Component
// ---------------------------------------------------------------------------
interface TimelineItem {
  date: string;
  title: string;
  subtitle: string;
  description: string;
}

export function TimelineComponent({ items }: { items: TimelineItem[] }) {
  return (
    <div className="relative pl-6 border-l border-white/10 my-4 space-y-5">
      {items.map((item, i) => (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          key={i} 
          className="relative"
        >
          {/* Milestone Circle dot */}
          <span className="absolute -left-[30px] top-1.5 flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-neon-sm ring-4 ring-[#050916]" />
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 text-[0.62rem] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {item.date}
            </span>
          </div>
          
          <h5 className="text-sm font-bold text-white mt-1 leading-snug">{item.title}</h5>
          <span className="text-[0.7rem] text-slate-400 leading-none">{item.subtitle}</span>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{parseMarkdownInline(item.description)}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Expandable Section Component
// ---------------------------------------------------------------------------
export function ExpandableSection({ children, title, maxLength = 350 }: { children: React.ReactNode; title?: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  const textContent = typeof children === "string" ? children : "";

  // If text is small, just render normally without collapsing
  if (textContent && textContent.length <= maxLength) {
    return <div className="text-xs text-slate-300 leading-relaxed my-2">{children}</div>;
  }

  return (
    <div className="my-2.5 rounded-xl border border-white/8 bg-white/[0.015] p-3 shadow-sm">
      {title && <h5 className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{title}</h5>}
      
      <div className={`text-xs text-slate-300 leading-relaxed transition-all duration-300 overflow-hidden ${expanded ? "max-h-[1200px]" : "max-h-20 mask-gradient"}`}>
        {children}
      </div>
      
      <button 
        onClick={() => setExpanded(!expanded)}
        className="mt-2.5 inline-flex items-center gap-1 text-[0.68rem] font-bold text-cyan-300 hover:text-cyan-200 transition"
      >
        {expanded ? (
          <>Collapse <ChevronUp size={12} /></>
        ) : (
          <>Read More <ChevronDown size={12} /></>
        )}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. Skill Matrix Component
// ---------------------------------------------------------------------------
export function SkillMatrix({ categories }: { categories: { category: string; skills: string[] }[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-3.5 shadow-md"
    >
      {categories.map((cat, ci) => (
        <div key={ci} className="space-y-1.5 pb-2.5 last:pb-0 border-b border-white/5 last:border-0">
          <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-slate-400 block">
            {cat.category}
          </span>
          <HighlightChips items={cat.skills} />
        </div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// 9. Smart Bullet Extraction Component
// ---------------------------------------------------------------------------
export function SmartBulletExtraction({ items, title }: { items: string[]; title?: string }) {
  return (
    <div className="my-3 space-y-2">
      {title && <h5 className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</h5>}
      <div className="grid gap-2">
        {items.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="flex gap-2.5 items-start rounded-xl border border-white/5 bg-white/[0.01] p-3 transition hover:border-cyan-500/10 hover:bg-white/[0.02]"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-800/25">
              <CheckCircle2 size={12} />
            </span>
            <div className="text-xs leading-relaxed text-slate-300 font-medium">
              {parseMarkdownInline(item)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// General Markdown Section Fallback
// ---------------------------------------------------------------------------
export function MarkdownSection({ text }: { text: string }) {
  // Parses regular paragraphs, headers, and bullet points.
  const lines = text.split("\n");
  const parsedNodes: React.ReactNode[] = [];

  let currentBullets: string[] = [];

  const flushBullets = (key: number) => {
    if (currentBullets.length > 0) {
      parsedNodes.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 my-2.5 space-y-1 text-xs text-slate-300 leading-relaxed">
          {currentBullets.map((b, bi) => (
            <li key={bi}>{parseMarkdownInline(b)}</li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushBullets(index);
      parsedNodes.push(
        <h4 key={index} className="text-sm font-extrabold text-white mt-4 mb-2 tracking-wide uppercase font-display border-b border-white/5 pb-1">
          {parseMarkdownInline(trimmed.substring(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushBullets(index);
      parsedNodes.push(
        <h3 key={index} className="text-base font-extrabold text-white mt-5 mb-2.5 tracking-wide font-display">
          {parseMarkdownInline(trimmed.substring(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushBullets(index);
      parsedNodes.push(
        <h2 key={index} className="text-lg font-black text-white mt-6 mb-3 tracking-wide font-display">
          {parseMarkdownInline(trimmed.substring(2))}
        </h2>
      );
    }
    // Bullet list items
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      currentBullets.push(trimmed.substring(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushBullets(index);
      const content = trimmed.replace(/^\d+\.\s/, "");
      parsedNodes.push(
        <div key={index} className="flex gap-2 text-xs text-slate-300 leading-relaxed my-1.5 pl-2">
          <span className="font-bold text-cyan-400 font-mono shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
          <span>{parseMarkdownInline(content)}</span>
        </div>
      );
    }
    // Plain paragraphs
    else if (trimmed.length > 0) {
      flushBullets(index);
      parsedNodes.push(
        <p key={index} className="text-xs leading-relaxed text-slate-300 my-2.5">
          {parseMarkdownInline(trimmed)}
        </p>
      );
    } else {
      flushBullets(index);
    }
  });

  flushBullets(lines.length);

  return <div className="space-y-0.5">{parsedNodes}</div>;
}

// ---------------------------------------------------------------------------
// Response Presentation Analyzer & Router
// ---------------------------------------------------------------------------
interface ResponsePresentationProps {
  content: string;
}

export default function ResponsePresentation({ content }: ResponsePresentationProps) {
  // Let's segment the response text and render structured views.
  if (!content) return null;

  // Let's check for code blocks to separate code and text
  const parts = content.split("```");
  
  return (
    <div className="flex flex-col gap-1 w-full text-slate-200">
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;

        if (isCodeBlock) {
          // Render code block
          const newlineIdx = part.indexOf("\n");
          let lang = "javascript";
          let code = part;
          if (newlineIdx !== -1) {
            lang = part.substring(0, newlineIdx).trim() || lang;
            code = part.substring(newlineIdx + 1);
          }
          return (
            <div key={index} className="my-2.5 rounded-xl overflow-hidden border border-white/10 bg-black/40">
              {lang && (
                <div className="flex items-center justify-between bg-white/[0.04] px-3 py-1.5 text-[0.62rem] font-mono text-slate-400 border-b border-white/5 uppercase tracking-wider">
                  {lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-[0.75rem] font-mono leading-relaxed text-cyan-200/90 whitespace-pre">
                <code>{code.trim()}</code>
              </pre>
            </div>
          );
        } else {
          // Process text content blocks
          return <ResponseAnalyzerBlock key={index} text={part} />;
        }
      })}
    </div>
  );
}

// Analyze and classify a text segment to decide the layout representation
function ResponseAnalyzerBlock({ text }: { text: string }) {
  const { profile, contact } = usePortfolio();
  const trimmedText = text.trim();
  if (!trimmedText) return null;

  // 1. COMPARISON_RESPONSE Detection (Standard Markdown Tables)
  if (trimmedText.includes("|") && trimmedText.includes("\n|")) {
    const lines = trimmedText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const tableLines = lines.filter(l => l.startsWith("|") && l.endsWith("|"));
    if (tableLines.length >= 3) {
      const firstLine = tableLines[0];
      if (!firstLine) return null;

      // Extract headers
      const headers = firstLine
        .split("|")
        .map(h => h.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Extract rows
      const rows = tableLines.slice(2).map(line => 
        line.split("|")
          .map(c => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      // Render the comparison table and regular text (if any) that comes before/after the table
      const tableIdx = trimmedText.indexOf(firstLine);
      const beforeText = trimmedText.substring(0, tableIdx).trim();
      const afterText = trimmedText.substring(tableIdx + tableLines.join("\n").length).trim();

      return (
        <div className="w-full">
          {beforeText && <MarkdownSection text={beforeText} />}
          <ComparisonTable headers={headers} rows={rows} />
          {afterText && <MarkdownSection text={afterText} />}
        </div>
      );
    }
  }

  // Project cards are attached by the server from retrieved portfolio data
  // (see app/api/chat/route.ts), so nothing is inferred from the text here.

  // 3. SKILLS_RESPONSE Detection (Grouped list of skills)
  // Look for structures like "**Languages**:", "**Frontend**:" or "AI/ML: " followed by list of items
  const skillsGroupRegex = /(?:\n|^)(?:[*-]\s*)?\*\*(AI\/ML|Languages|Frontend|Backend|Mobile|Databases|Tools|DevOps|Other)\*\*:\s*([^\n]+)/gi;
  const matches = [...trimmedText.matchAll(skillsGroupRegex)];
  
  if (matches.length >= 2) {
    const categories = matches.map(m => {
      const catName = m[1] || "Other";
      const skillList = m[2] || "";
      return {
        category: catName.trim(),
        skills: skillList.split(",").map(s => s.trim().replace(/\.$/, ""))
      };
    });

    const firstMatch = matches[0];
    const lastMatch = matches[matches.length - 1];

    if (firstMatch && lastMatch) {
      // Find first and last indices of matches to isolate the skills section
      const firstMatchIdx = trimmedText.indexOf(firstMatch[0]);
      const lastMatchIdx = trimmedText.indexOf(lastMatch[0]) + lastMatch[0].length;

      const beforeText = trimmedText.substring(0, firstMatchIdx).trim();
      const afterText = trimmedText.substring(lastMatchIdx).trim();

      return (
        <div className="w-full">
          {beforeText && <MarkdownSection text={beforeText} />}
          <SkillMatrix categories={categories} />
          {afterText && <MarkdownSection text={afterText} />}
        </div>
      );
    }
  }

  // 4. TIMELINE_RESPONSE / EXPERIENCE_RESPONSE Detection
  // Check for lines with dates: (e.g. "2022 - 2024" or "2023 - Present")
  const dateRegex = /(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|Present|Current)/gi;
  const timelineMatches = [...trimmedText.matchAll(dateRegex)];
  
  if (timelineMatches.length >= 2 && trimmedText.includes("- ")) {
    // Let's parse timeline items from lines starting with bullets
    const lines = trimmedText.split("\n");
    const timelineItems: TimelineItem[] = [];
    const nonTimelineLines: string[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      // match() on a fresh pattern: test() on a /g regex keeps state between calls.
      const hasDate = new RegExp(dateRegex.source, "i").test(trimmedLine);
      const isBullet = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
      
      if (hasDate && isBullet) {
        // Try parsing fields: "- **Title** | Org (Date) - Description" or similar
        // Let's run a flexible extraction:
        // Remove bullet:
        const cleanLine = trimmedLine.replace(/^[-*]\s*/, "");
        // Extract date
        const dateMatch = cleanLine.match(dateRegex);
        const dateStr = dateMatch ? dateMatch[0] : "";
        
        // Split by separators (e.g., "|", "at", "—")
        const parts = cleanLine.split(/\||at|—/);
        const titleStr = parts[0]?.replace(/\*\*/g, "").replace(dateStr, "").trim() || "Role/Education";
        const subtitleStr = parts[1]?.replace(/\*\*/g, "").replace(dateStr, "").trim() || "Mandeep's Portfolio";
        const descStr = parts.slice(2).join(" ").trim() || "Detailed accomplishments and responsibilities.";

        timelineItems.push({
          date: dateStr,
          title: titleStr,
          subtitle: subtitleStr,
          description: descStr || cleanLine
        });
      } else {
        nonTimelineLines.push(line);
      }
    });

    if (timelineItems.length >= 2) {
      return (
        <div className="w-full">
          {nonTimelineLines.length > 0 && <MarkdownSection text={nonTimelineLines.join("\n").trim()} />}
          <TimelineComponent items={timelineItems} />
        </div>
      );
    }
  }

  // 5. CONTACT_RESPONSE Detection
  // When the text talks about getting in touch, append the verified contact
  // card from live portfolio data rather than details parsed from the text.
  const lowerText = trimmedText.toLowerCase();
  const mentionsContactDetail =
    lowerText.includes("github.com/") ||
    lowerText.includes("linkedin.com/in/") ||
    (contact.email !== "" && lowerText.includes(contact.email.toLowerCase()));
  if (mentionsContactDetail) {
    const isContactBlock = ["email", "phone", "contact", "linkedin", "reach out", "connect"].some(w => lowerText.includes(w));
    if (isContactBlock) {
      return (
        <div className="w-full">
          <MarkdownSection text={trimmedText} />
          <ContactCard contact={contact} />
        </div>
      );
    }
  }

  // 6. SUMMARY_RESPONSE / Key Stats Detection (Short Bios or Profile Stats)
  // Check if it's the welcome or overview message, or contains stats counts
  // e.g. "10+ Projects", "5+ Certifications"
  const statRegex = /(\d+\+?)\s*(Projects?|Certifications?|Skills?|Students?|Internships?)/gi;
  const statMatches = [...trimmedText.matchAll(statRegex)];
  if (statMatches.length >= 2 && trimmedText.length < 500) {
    const stats = statMatches.map(m => ({
      value: m[1] || "",
      label: m[2] || ""
    }));
    
    const firstStat = statMatches[0];
    if (firstStat) {
      // Split text
      const firstStatIdx = trimmedText.indexOf(firstStat[0]);
      const beforeText = trimmedText.substring(0, firstStatIdx).trim();

      return (
        <div className="w-full">
          {beforeText && <MarkdownSection text={beforeText} />}
          <KeyFactsPanel stats={stats} />
        </div>
      );
    }
  }

  // 7. SUMMARY_RESPONSE (Bio / Short Overview)
  // If it's a brief intro response about Mandeep (less than 400 chars, talking about B.Tech, ME, skills)
  if (trimmedText.toLowerCase().includes("pursuing m.e. in artificial intelligence") || (trimmedText.toLowerCase().includes("mandeep") && trimmedText.toLowerCase().includes("ai/ml engineer") && trimmedText.length < 350)) {
    const highlights = [
      profile.tagline,
      ...profile.roles.slice(0, 2),
      `Based in ${profile.location}`,
    ].filter((item, index, all) => item && all.indexOf(item) === index);
    return (
      <div className="w-full">
        <SummaryCard title="Candidate Overview" summary={trimmedText} highlights={highlights} />
      </div>
    );
  }

  // 8. LIST_RESPONSE / Bullet Extraction Detection
  // If a block contains multiple bullets (>= 3 bullets) and has relatively long descriptions
  if (trimmedText.includes("\n- ") || trimmedText.includes("\n* ")) {
    const lines = trimmedText.split("\n");
    const bullets = lines.filter(l => l.trim().startsWith("- ") || l.trim().startsWith("* ")).map(l => l.replace(/^[-*]\s*/, ""));
    const textBefore = lines.filter(l => !l.trim().startsWith("- ") && !l.trim().startsWith("* ")).join("\n").trim();
    
    if (bullets.length >= 3 && bullets.every(b => b.length > 20)) {
      return (
        <div className="w-full">
          {textBefore && <MarkdownSection text={textBefore} />}
          <SmartBulletExtraction items={bullets} title="Key Highlights" />
        </div>
      );
    }
  }

  // 9. EXPANDABLE SECTION (For long text blocks / paragraph responses)
  if (trimmedText.length > 450) {
    return (
      <div className="w-full">
        <ExpandableSection maxLength={300}>
          <MarkdownSection text={trimmedText} />
        </ExpandableSection>
      </div>
    );
  }

  // 10. GENERAL_RESPONSE (Fallback Standard Markdown)
  return <MarkdownSection text={trimmedText} />;
}
