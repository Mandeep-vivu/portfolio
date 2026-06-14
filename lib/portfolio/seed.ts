import profile from "@/data/portfolio/profile.json";
import contact from "@/data/portfolio/contact.json";
import skills from "@/data/portfolio/skills.json";
import education from "@/data/portfolio/education.json";
import experience from "@/data/portfolio/experience.json";
import certifications from "@/data/portfolio/certifications.json";
import type { PortfolioData, Project } from "./types";

// Import from the new sync cache. Fallback to empty array if not present.
// In a real app, you might want to handle this more gracefully, but for now 
// we will import the json. Since TypeScript might complain if it doesn't exist,
// we'll try to import it, but it requires the file to exist.
import projectsData from "@/data/projects.json";

export const seedPortfolio = {
  profile,
  contact,
  projects: projectsData as Project[],
  skills,
  education,
  experience,
  certifications,
} as PortfolioData;
