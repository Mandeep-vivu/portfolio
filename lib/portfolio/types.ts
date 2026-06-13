export type Profile = {
  name: string;
  initials: string;
  tagline: string;
  roles: string[];
  bio: string;
  location: string;
  availableForWork: boolean;
  resumeUrl: string;
  stats: Array<{ label: string; value: number; suffix: string }>;
};

export type Contact = {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  instagram: string;
  telegram: string;
  portfolioUrl: string;
};

export type Skill = {
  name: string;
  icon: string;
  level: number;
  category: "ai" | "fullstack" | "tools";
  color: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  longDesc: string;
  tech: string[];
  github: string;
  demo?: string | undefined;
  featured: boolean;
  gradient: string;
  icon: string;
};

export type TimelineEntry = {
  id: string;
  year: string;
  title: string;
  org: string;
  description: string;
  type: "education" | "experience" | "leadership";
  side: "left" | "right";
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "award" | "leadership" | "certification" | "academic";
  link?: string | undefined;
};

export type PortfolioData = {
  profile: Profile;
  contact: Contact;
  projects: Project[];
  skills: Skill[];
  education: TimelineEntry[];
  experience: TimelineEntry[];
  certifications: Achievement[];
};
