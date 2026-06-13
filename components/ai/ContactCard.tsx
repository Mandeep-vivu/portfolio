import { Mail, Phone, ExternalLink } from "lucide-react";
import { FiGithub as Github, FiLinkedin as Linkedin } from "react-icons/fi";

export default function ContactCard({ contact }: { contact: any }) {
  const links = [
    { label: contact.email, href: `mailto:${contact.email}`, icon: Mail },
    ...(contact.phone ? [{ label: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}`, icon: Phone }] : []),
    ...(contact.linkedin ? [{ label: "LinkedIn", href: contact.linkedin, icon: Linkedin }] : []),
    ...(contact.github ? [{ label: "GitHub", href: contact.github, icon: Github }] : []),
    ...(contact.portfolioUrl ? [{ label: "Portfolio", href: contact.portfolioUrl, icon: ExternalLink }] : []),
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {links.map(({ label, href, icon: Icon }) => (
        <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2 text-xs text-slate-200 hover:border-primary/35">
          <Icon size={14} className="shrink-0 text-cyan-300" />
          <span className="truncate">{label}</span>
        </a>
      ))}
    </div>
  );
}
