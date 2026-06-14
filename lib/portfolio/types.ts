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
  id: string; // Used as github repo name or unique id
  name: string;
  description: string;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  githubUrl: string;
  demoUrl: string;
  updatedAt: string;
  readmeSummary?: string | undefined;
  // Preserved custom metadata
  title?: string | undefined;
  longDesc?: string | undefined;
  tech?: string[] | undefined;
  featured?: boolean | undefined;
  gradient?: string | undefined;
  icon?: string | undefined;
  github?: string | undefined;
  demo?: string | undefined;
  
  // Phase 3 Intelligence Layer fields
  category?: string | undefined;
  difficulty?: string | undefined;
  skillsDemonstrated?: string[] | undefined;
  keyFeatures?: string[] | undefined;
  recruiterSummary?: string | undefined;
  problemSolved?: string | undefined;
  industryUseCase?: string | undefined;
  projectType?: string | undefined;
  aiRelated?: boolean | undefined;
  technologies?: string[] | undefined;
  learningOutcomes?: string[] | undefined;
  resumeWorthiness?: number | undefined;
  complexityScore?: number | undefined;
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
