import { seedPortfolio } from "@/lib/portfolio/seed";

export type {
  Achievement,
  Contact,
  PortfolioData,
  Profile,
  Project,
  Skill,
  TimelineEntry,
} from "@/lib/portfolio/types";

export const PERSONAL = {
  ...seedPortfolio.profile,
  ...seedPortfolio.contact,
};
export const STATS = seedPortfolio.profile.stats;
export const SKILLS = seedPortfolio.skills;
export const PROJECTS = seedPortfolio.projects;
export const TIMELINE = [
  ...seedPortfolio.education,
  ...seedPortfolio.experience,
].sort((a, b) => {
  const order = ["me-cu", "flutter-intern", "ds-intern", "vp-tcs", "btech", "hsse"];
  return order.indexOf(a.id) - order.indexOf(b.id);
});
export const ACHIEVEMENTS = seedPortfolio.certifications;
