import { describe, expect, it } from "vitest";
import { seedPortfolio } from "@/lib/portfolio/seed";
import {
  buildKnowledgeDocuments,
  retrieveDocuments,
  searchProjects,
} from "./retrieval";

describe("portfolio retrieval", () => {
  it("ranks matching AI projects", () => {
    const matches = searchProjects("computer vision AI project", seedPortfolio);
    expect(matches[0]?.id).toBe("fitness-ai");
  });

  it("returns no results for unsupported information", () => {
    const results = retrieveDocuments(
      "commercial airline pilot license",
      buildKnowledgeDocuments(seedPortfolio),
    );
    expect(results).toHaveLength(0);
  });

  it("retrieves education from grounded documents", () => {
    const results = retrieveDocuments(
      "Chandigarh University education",
      buildKnowledgeDocuments(seedPortfolio),
    );
    expect(results.some((result) => result.id === "me-cu")).toBe(true);
  });

  it("finds skills via synonyms (good at coding)", () => {
    const results = retrieveDocuments(
      "what is he good at coding",
      buildKnowledgeDocuments(seedPortfolio),
    );
    expect(results.length).toBeGreaterThan(0);
    // Should find skill-related documents
    expect(
      results.some(
        (r) => r.category === "skill" || r.category === "project",
      ),
    ).toBe(true);
  });

  it("finds profile via background query", () => {
    const results = retrieveDocuments(
      "background overview bio",
      buildKnowledgeDocuments(seedPortfolio),
    );
    expect(results.some((r) => r.id === "profile")).toBe(true);
  });

  it("handles fuzzy matching for typos", () => {
    const results = retrieveDocuments(
      "pytohn programming",
      buildKnowledgeDocuments(seedPortfolio),
    );
    // Should still find Python-related results via fuzzy matching
    expect(results.length).toBeGreaterThan(0);
  });
});
