import "server-only";

import type { PortfolioData } from "@/lib/portfolio/types";
import { buildKnowledgeDocuments, retrieveDocuments } from "./retrieval";
import { retrieveRAGContext } from "./rag";

export interface HybridRetrievalContext {
  query: string;
  matchedProjects: any[];
  matchedSkills: any[];
  matchedExperience: any[];
  semanticMatches: any[];
  confidence: number;
}

export async function retrieveHybridContext(
  query: string,
  portfolio: PortfolioData,
  limit = 5
): Promise<HybridRetrievalContext> {
  // 1. LOCAL SEARCH (Guaranteed to work, uses live data)
  const knowledgeDocs = buildKnowledgeDocuments(portfolio);
  // Add readmeSummary to project documents so Local Search can find it
  const enrichedDocs = knowledgeDocs.map(doc => {
    if (doc.category === "project") {
      const proj = portfolio.projects.find(p => p.id === doc.id);
      if (proj && proj.readmeSummary) {
        doc.content += `\nREADME Summary: ${proj.readmeSummary}`;
      }
    }
    return doc;
  });
  
  const localResults = retrieveDocuments(query, enrichedDocs, 10);
  
  // 2. VECTOR SEARCH (Optional enhancement)
  let vectorResults: any[] = [];
  try {
    const rag = await retrieveRAGContext(query, 5);
    vectorResults = rag.chunks || [];
  } catch (error) {
    console.warn("Vector search failed or unavailable, falling back to pure local search:", error);
  }

  // 3. MERGE & SCORE
  const mergedMap = new Map<string, any>();

  // Process local results first (Highest weight)
  // Local score is technically a combo of Portfolio Data, GitHub Meta, and README Summary since we concatenated them.
  for (const doc of localResults) {
    mergedMap.set(doc.id, {
      id: doc.id,
      category: doc.category,
      title: doc.title,
      content: doc.content,
      localScore: doc.score,
      vectorScore: 0,
    });
  }

  // Process vector results
  for (const chunk of vectorResults) {
    const existing = mergedMap.get(chunk.id);
    if (existing) {
      existing.vectorScore = chunk.score;
    } else {
      mergedMap.set(chunk.id, {
        id: chunk.id,
        category: chunk.type,
        title: chunk.title,
        content: chunk.content,
        localScore: 0,
        vectorScore: chunk.score,
      });
    }
  }

  // Calculate final score
  // Weights: Local (Portfolio + GitHub + README) = ~85%, Vector = 15%
  const finalResults = Array.from(mergedMap.values()).map(item => {
    // Local TF-IDF scores are usually smaller (e.g. 0.1 - 0.9)
    // Vector Cosine similarities are usually larger (e.g. 0.6 - 1.0)
    // We normalize slightly by treating localScore highly.
    const score = (item.localScore * 0.85) + (item.vectorScore * 0.15);
    return { ...item, score };
  });

  // Sort and limit
  finalResults.sort((a, b) => b.score - a.score);
  const topResults = finalResults.slice(0, limit);

  // 4. BUILD UNIFIED CONTEXT OBJECT
  const context: HybridRetrievalContext = {
    query,
    matchedProjects: [],
    matchedSkills: [],
    matchedExperience: [],
    semanticMatches: [],
    confidence: topResults.length > 0 ? topResults[0].score : 0,
  };

  for (const result of topResults) {
    if (result.category === "project") {
      const proj = portfolio.projects.find(p => p.id === result.id);
      if (proj) {
        context.matchedProjects.push({
          id: proj.id,
          title: proj.title || proj.name,
          description: proj.description,
          tech: proj.tech || proj.topics || [],
          githubUrl: proj.githubUrl,
          demoUrl: proj.demoUrl,
          readmeSummary: proj.readmeSummary,
          
          // Phase 3 intelligence fields
          category: proj.category || "",
          difficulty: proj.difficulty || "Intermediate",
          skillsDemonstrated: proj.skillsDemonstrated || [],
          keyFeatures: proj.keyFeatures || [],
          recruiterSummary: proj.recruiterSummary || "",
          problemSolved: proj.problemSolved || "",
          industryUseCase: proj.industryUseCase || "General Purpose",
          projectType: proj.projectType || "Personal Project",
          complexityScore: proj.complexityScore || 50,
          resumeWorthiness: proj.resumeWorthiness || 50,
          aiRelated: proj.aiRelated || false,
        });
      }
    } else if (result.category === "skill") {
      const skill = portfolio.skills.find(s => `skill-${s.name.toLowerCase().replace(/\\W+/g, "-")}` === result.id);
      if (skill) context.matchedSkills.push(skill);
      else context.semanticMatches.push({ title: result.title, content: result.content }); // for "skills-summary"
    } else if (result.category === "experience" || result.category === "leadership") {
      const exp = portfolio.experience.find(e => e.id === result.id);
      if (exp) context.matchedExperience.push(exp);
    } else {
      context.semanticMatches.push({ title: result.title, content: result.content });
    }
  }

  return context;
}
