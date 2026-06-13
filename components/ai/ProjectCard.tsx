import { ExternalLink } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

export default function ProjectCard({ project }: { project: any }) {
  return (
    <article className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <h4 className="text-sm font-bold text-white">{project.title}</h4>
      <p className="mt-1 text-xs leading-5 text-slate-400">{project.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.tech.map((tech: string) => (
          <span key={tech} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.62rem] text-indigo-200">
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 hover:border-primary/40">
            <Github size={13} /> GitHub
          </a>
        )}
        {project.demo && (
          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-2.5 py-1.5 text-xs text-indigo-100">
            <ExternalLink size={13} /> Live demo
          </a>
        )}
      </div>
    </article>
  );
}
