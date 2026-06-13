import "server-only";

import { embed } from "ai";
import { getAIModel } from "./gemini";
import fs from "fs/promises";
import path from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

// Define the chunk type matching the embedding generation script
export type VectorChunk = {
  id: string;
  type: "profile" | "project" | "skill" | "education" | "experience" | "certification";
  title: string;
  content: string;
  metadata: any;
  embedding: number[];
};

export type RetrievedChunk = Omit<VectorChunk, "embedding"> & { score: number };

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

  throw new Error("No embedding model configured.");
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

let vectorStoreCache: VectorChunk[] | null = null;

async function loadVectorStore(): Promise<VectorChunk[]> {
  if (vectorStoreCache) return vectorStoreCache;

  const storePath = path.join(process.cwd(), "data", "portfolio", "vector_store.json");
  try {
    const data = await fs.readFile(storePath, "utf-8");
    vectorStoreCache = JSON.parse(data) as VectorChunk[];
    return vectorStoreCache;
  } catch (error) {
    console.error("Failed to load vector store:", error);
    return [];
  }
}

export async function retrieveRAGContext(query: string, limit = 5): Promise<{ chunks: RetrievedChunk[], confidence: number }> {
  const store = await loadVectorStore();
  if (!store || store.length === 0) {
    return { chunks: [], confidence: 0 };
  }

  const model = getEmbeddingModel();
  
  // Generate embedding for the search query
  const { embedding: queryEmbedding } = await embed({
    model,
    value: query,
  });

  // Score all chunks
  const scoredChunks: RetrievedChunk[] = store.map(chunk => {
    const score = cosineSimilarity(queryEmbedding || [], chunk.embedding || []);
    const { embedding, ...rest } = chunk;
    return { ...rest, score };
  });

  // Sort descending
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, limit);
  const top = topChunks[0];
  const confidence = top ? (top.score || 0) : 0;

  return {
    chunks: topChunks,
    confidence
  };
}
