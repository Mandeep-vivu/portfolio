import { ExternalLink } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";

export default function ProjectCard({ project }: { project: any }) {
  return (
    <article className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-bold text-white">{project.title || project.name}</h4>
        {project.stars !== undefined && project.stars > 0 && (
          <span className="flex items-center gap-1 text-xs text-yellow-500">
            ★ {project.stars}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">{project.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {project.language && (
          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[0.62rem] text-green-200">
            {project.language}
          </span>
        )}
        {(project.topics || project.tech || []).slice(0, 4).map((tech: string) => (
          <span key={tech} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[0.62rem] text-indigo-200">
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {(project.githubUrl || project.github) && (
          <a href={project.githubUrl || project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-200 hover:border-primary/40">
            <Github size={13} /> GitHub
          </a>
        )}
        {(project.demoUrl || project.demo) && (
          <a href={project.demoUrl || project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-2.5 py-1.5 text-xs text-indigo-100">
            <ExternalLink size={13} /> Live demo
          </a>
        )}
      </div>
    </article>
  );
}
