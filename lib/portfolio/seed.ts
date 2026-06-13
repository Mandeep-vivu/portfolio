import profile from "@/data/portfolio/profile.json";
import contact from "@/data/portfolio/contact.json";
import projects from "@/data/portfolio/projects.json";
import skills from "@/data/portfolio/skills.json";
import education from "@/data/portfolio/education.json";
import experience from "@/data/portfolio/experience.json";
import certifications from "@/data/portfolio/certifications.json";
import type { PortfolioData } from "./types";

export const seedPortfolio = {
  profile,
  contact,
  projects,
  skills,
  education,
  experience,
  certifications,
} as PortfolioData;
