interface NeonBadgeProps {
  children: React.ReactNode;
  color?: "purple" | "cyan" | "pink" | "green" | "orange";
  className?: string;
}

const colors = {
  purple: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  cyan: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
  pink: "border-pink-500/40 bg-pink-500/10 text-pink-300",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-300",
};

export default function NeonBadge({ children, color = "purple", className = "" }: NeonBadgeProps) {
  return (
    <span
      className={`neon-badge ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
}
