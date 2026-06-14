import { embed } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import fs from "fs/promises";
import path from "path";

import profile from "../data/portfolio/profile.json" with { type: "json" };
import projects from "../data/projects.json" with { type: "json" };
import skills from "../data/portfolio/skills.json" with { type: "json" };
import education from "../data/portfolio/education.json" with { type: "json" };
import experience from "../data/portfolio/experience.json" with { type: "json" };
import certifications from "../data/portfolio/certifications.json" with { type: "json" };

export type VectorChunk = {
  id: string;
  type: "profile" | "project" | "skill" | "education" | "experience" | "certification";
  title: string;
  content: string;
  metadata: any;
  embedding?: number[];
};

function getEmbeddingModel() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey });
    return openai.textEmbeddingModel("text-embedding-3-small");
  }

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google.textEmbeddingModel("gemini-embedding-2");
  }

  throw new Error("No embedding model configured. Please set GEMINI_API_KEY or OPENAI_API_KEY.");
}

async function generateEmbeddings() {
  console.log("Chunking portfolio data...");
  const chunks: VectorChunk[] = [];

  // 1. Profile
  chunks.push({
    id: "profile",
    type: "profile",
    title: profile.name,
    content: `${profile.name} - ${profile.tagline}\nBio: ${profile.bio}\nLocation: ${profile.location}\nRoles: ${profile.roles.join(", ")}\nAvailable for work: ${profile.availableForWork ? "Yes" : "No"}`,
    metadata: { source: "profile.json", original: profile },
  });

  // 2. Projects
  for (const project of projects as any[]) {
    chunks.push({
      id: `project-${project.id}`,
      type: "project",
      title: project.title || project.name,
      content: `Project: ${project.title || project.name}
Description: ${project.description || ""}
Details: ${project.longDesc || ""}
Category: ${project.category || ""}
Difficulty: ${project.difficulty || ""}
Recruiter Summary: ${project.recruiterSummary || ""}
Problem Solved: ${project.problemSolved || ""}
Complexity Score: ${project.complexityScore || 50}/100
Technology: ${(project.tech || project.topics || []).join(", ")}
Skills Demonstrated: ${(project.skillsDemonstrated || []).join(", ")}`,
      metadata: { source: "projects.json", projectId: project.id, original: project },
    });
  }

  // 3. Skills (by category)
  const categories = [...new Set(skills.map(s => s.category))];
  for (const category of categories) {
    const categorySkills = skills.filter(s => s.category === category);
    const categoryName = category === "ai" ? "AI & Machine Learning" : category === "fullstack" ? "Full Stack Development" : "Developer Tools";
    chunks.push({
      id: `skill-${category}`,
      type: "skill",
      title: `${categoryName} Skills`,
      content: `Category: ${categoryName}\nSkills: ${categorySkills.map(s => `${s.name} (${s.level}% proficiency)`).join(", ")}`,
      metadata: { source: "skills.json", category, original: categorySkills },
    });
  }

  // 4. Education
  for (const edu of education) {
    chunks.push({
      id: `edu-${edu.id}`,
      type: "education",
      title: edu.title,
      content: `Education: ${edu.title}\nInstitution: ${edu.org}\nYear: ${edu.year}\nDetails: ${edu.description}`,
      metadata: { source: "education.json", educationId: edu.id, original: edu },
    });
  }

  // 5. Experience
  for (const exp of experience) {
    chunks.push({
      id: `exp-${exp.id}`,
      type: "experience",
      title: exp.title,
      content: `Experience: ${exp.title}\nOrganization: ${exp.org}\nType: ${exp.type}\nYear: ${exp.year}\nDetails: ${exp.description}`,
      metadata: { source: "experience.json", experienceId: exp.id, original: exp },
    });
  }

  // 6. Certifications
  for (const cert of certifications) {
    chunks.push({
      id: `cert-${cert.id}`,
      type: "certification",
      title: cert.title,
      content: `Certification/Achievement: ${cert.title}\nType: ${cert.type}\nDetails: ${cert.description}`,
      metadata: { source: "certifications.json", certId: cert.id, original: cert },
    });
  }

  console.log(`Generated ${chunks.length} chunks. Fetching embeddings...`);

  const model = getEmbeddingModel();

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk) continue;
    const { embedding } = await embed({
      model,
      value: chunk.content,
    });
    chunk.embedding = embedding;
    console.log(`Embedded chunk ${i + 1}/${chunks.length}`);
  }

  const outputPath = path.join(process.cwd(), "data", "portfolio", "vector_store.json");
  await fs.writeFile(outputPath, JSON.stringify(chunks, null, 2), "utf-8");
  console.log(`Successfully wrote vector store to ${outputPath}`);
}

generateEmbeddings().catch(console.error);
