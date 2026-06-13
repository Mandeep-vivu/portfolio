import { z } from "zod";

const urlOrEmpty = z.union([z.url(), z.literal("")]);

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  initials: z.string().trim().min(1).max(6),
  tagline: z.string().trim().min(2).max(160),
  roles: z.array(z.string().trim().min(1).max(80)).max(12),
  bio: z.string().trim().min(20).max(2000),
  location: z.string().trim().min(2).max(120),
  availableForWork: z.boolean(),
  resumeUrl: urlOrEmpty,
  stats: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(60),
        value: z.number().int().nonnegative().max(100000),
        suffix: z.string().max(8),
      }),
    )
    .max(12),
});

export const contactSchema = z.object({
  email: z.email(),
  phone: z.string().trim().max(40),
  linkedin: urlOrEmpty,
  github: urlOrEmpty,
  instagram: urlOrEmpty,
  telegram: urlOrEmpty,
  portfolioUrl: urlOrEmpty,
});

export const projectSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(500),
  longDesc: z.string().trim().min(10).max(2000),
  tech: z.array(z.string().trim().min(1).max(50)).min(1).max(30),
  github: urlOrEmpty,
  demo: urlOrEmpty.optional(),
  featured: z.boolean(),
  gradient: z.string().trim().max(120),
  icon: z.string().trim().min(1).max(12),
});

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().trim().min(1).max(80),
  level: z.number().int().min(0).max(100),
  category: z.enum(["ai", "fullstack", "tools"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const timelineEntrySchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  year: z.string().trim().min(1).max(40),
  title: z.string().trim().min(2).max(160),
  org: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(1200),
  type: z.enum(["education", "experience", "leadership"]),
  side: z.enum(["left", "right"]),
});

export const achievementSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(80),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(1200),
  icon: z.string().trim().min(1).max(12),
  type: z.enum(["award", "leadership", "certification", "academic"]),
  link: urlOrEmpty.optional(),
});

export const portfolioSchema = z.object({
  profile: profileSchema,
  contact: contactSchema,
  projects: z.array(projectSchema).max(100),
  skills: z.array(skillSchema).max(200),
  education: z.array(timelineEntrySchema).max(100),
  experience: z.array(timelineEntrySchema).max(100),
  certifications: z.array(achievementSchema).max(100),
});

export const contentSectionSchema = z.enum([
  "profile",
  "contact",
  "projects",
  "skills",
  "education",
  "experience",
  "certifications",
]);

export type ContentSection = z.infer<typeof contentSectionSchema>;

export const sectionSchemas = {
  profile: profileSchema,
  contact: contactSchema,
  projects: z.array(projectSchema).max(100),
  skills: z.array(skillSchema).max(200),
  education: z.array(timelineEntrySchema).max(100),
  experience: z.array(timelineEntrySchema).max(100),
  certifications: z.array(achievementSchema).max(100),
} satisfies Record<ContentSection, z.ZodType>;
