import "server-only";

import type { Achievement, PortfolioData, Project, Skill, TimelineEntry } from "@/lib/portfolio/types";
import type { ChatProject } from "./schemas";
import { buildKnowledgeDocuments, retrieveDocuments, skillDocumentId } from "./retrieval";
import { retrieveRAGContext } from "./rag";

export type SemanticMatch = { title: string; content: string };

export interface HybridRetrievalContext {
  query: string;
  matchedProjects: ChatProject[];
  matchedSkills: Skill[];
  matchedExperience: TimelineEntry[];
  matchedCertifications: Achievement[];
  matchedAchievements: Achievement[];
  semanticMatches: SemanticMatch[];
  confidence: number;
}

type MergedResult = {
  id: string;
  category: string;
  title: string;
  content: string;
  localScore: number;
  vectorScore: number;
};

// Local keyword search runs on live portfolio data and always works, so it
// carries most of the weight; embeddings are an optional enhancement.
const LOCAL_WEIGHT = 0.85;
const VECTOR_WEIGHT = 0.15;

function toChatProject(project: Project): ChatProject {
  return {
    id: project.id,
    title: project.title || project.name,
    description: project.description,
    language: project.language,
    tech: project.tech || project.topics || [],
    githubUrl: project.githubUrl,
    demoUrl: project.demoUrl,
    ...(project.readmeSummary ? { readmeSummary: project.readmeSummary } : {}),
    category: project.category || "",
    difficulty: project.difficulty || "Intermediate",
    skillsDemonstrated: project.skillsDemonstrated || [],
    keyFeatures: project.keyFeatures || [],
    recruiterSummary: project.recruiterSummary || "",
    problemSolved: project.problemSolved || "",
    industryUseCase: project.industryUseCase || "General Purpose",
    projectType: project.projectType || "Personal Project",
    complexityScore: project.complexityScore || 50,
    resumeWorthiness: project.resumeWorthiness || 50,
    aiRelated: project.aiRelated || false,
  };
}

/**
 * Vector-store chunks are written by scripts/generate-embeddings.ts with
 * prefixed ids ("project-MCTapp", "edu-btech"). Map them back to the ids the
 * live portfolio uses so both result sets merge instead of being dropped.
 */
function portfolioIdForChunk(chunk: { id: string; metadata: Record<string, unknown> }): string {
  const projectId = chunk.metadata?.projectId;
  if (typeof projectId === "string" && projectId) return projectId;
  return chunk.id.replace(/^(?:project|edu|exp|cert)-/, "");
}

export function hasMatches(context: HybridRetrievalContext): boolean {
  return (
    context.matchedProjects.length > 0 ||
    context.semanticMatches.length > 0 ||
    context.matchedSkills.length > 0 ||
    context.matchedExperience.length > 0 ||
    context.matchedCertifications.length > 0 ||
    context.matchedAchievements.length > 0
  );
}

export async function retrieveHybridContext(
  query: string,
  portfolio: PortfolioData,
  limit = 5,
): Promise<HybridRetrievalContext> {
  // 1. Local search over live data. README summaries are appended so they
  //    are searchable too.
  const documents = buildKnowledgeDocuments(portfolio).map((doc) => {
    if (doc.category !== "project") return doc;
    const summary = portfolio.projects.find((p) => p.id === doc.id)?.readmeSummary;
    return summary
      ? { ...doc, content: `${doc.content}\nREADME Summary: ${summary}` }
      : doc;
  });
  const localResults = retrieveDocuments(query, documents, 10);

  // 2. Vector search (optional).
  let vectorResults: Awaited<ReturnType<typeof retrieveRAGContext>>["chunks"] = [];
  try {
    vectorResults = (await retrieveRAGContext(query, 5)).chunks;
  } catch (error) {
    console.warn("Vector search unavailable, using local search only:", error);
  }

  // 3. Merge and score.
  const merged = new Map<string, MergedResult>();
  for (const doc of localResults) {
    merged.set(doc.id, {
      id: doc.id,
      category: doc.category,
      title: doc.title,
      content: doc.content,
      localScore: doc.score,
      vectorScore: 0,
    });
  }
  for (const chunk of vectorResults) {
    const id = portfolioIdForChunk(chunk);
    const existing = merged.get(id);
    if (existing) {
      existing.vectorScore = chunk.score;
    } else {
      merged.set(id, {
        id,
        category: chunk.type,
        title: chunk.title,
        content: chunk.content,
        localScore: 0,
        vectorScore: chunk.score,
      });
    }
  }

  const topResults = [...merged.values()]
    .map((item) => ({
      ...item,
      score: item.localScore * LOCAL_WEIGHT + item.vectorScore * VECTOR_WEIGHT,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // 4. Group results into a single context object.
  const context: HybridRetrievalContext = {
    query,
    matchedProjects: [],
    matchedSkills: [],
    matchedExperience: [],
    matchedCertifications: [],
    matchedAchievements: [],
    semanticMatches: [],
    confidence: topResults[0]?.score ?? 0,
  };

  // Nothing matched (e.g. "tell me about Mandeep" is all stop words): ground
  // the answer in the profile and skills overview instead of an empty context.
  if (topResults.length === 0) {
    context.semanticMatches = documents
      .filter((doc) => doc.id === "profile" || doc.id === "skills-summary")
      .map((doc) => ({ title: doc.title, content: doc.content }));
    return context;
  }

  for (const result of topResults) {
    const semantic = { title: result.title, content: result.content };

    switch (result.category) {
      case "project": {
        const project = portfolio.projects.find((p) => p.id === result.id);
        if (project) context.matchedProjects.push(toChatProject(project));
        break;
      }
      case "skill": {
        const skill = portfolio.skills.find((s) => skillDocumentId(s.name) === result.id);
        if (skill) context.matchedSkills.push(skill);
        else context.semanticMatches.push(semantic); // e.g. "skills-summary"
        break;
      }
      case "experience": {
        const entry = portfolio.experience.find((e) => e.id === result.id);
        if (entry) context.matchedExperience.push(entry);
        break;
      }
      case "certification": {
        const entry = portfolio.certifications.find((c) => c.id === result.id);
        if (entry) context.matchedCertifications.push(entry);
        else context.semanticMatches.push(semantic);
        break;
      }
      case "award":
      case "leadership":
      case "academic": {
        const entry = portfolio.certifications.find((c) => c.id === result.id);
        if (entry) context.matchedAchievements.push(entry);
        else context.semanticMatches.push(semantic);
        break;
      }
      default:
        context.semanticMatches.push(semantic);
    }
  }

  return context;
}
