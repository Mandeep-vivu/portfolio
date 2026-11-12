import { describe, expect, it } from "vitest";
import { seedPortfolio } from "@/lib/portfolio/seed";
import { buildKnowledgeDocuments, retrieveDocuments } from "./retrieval";

describe("portfolio retrieval", () => {
  const documents = buildKnowledgeDocuments(seedPortfolio);

  it.each([
    ["graph neural network research", "mt-stgat-grid-fault-research"],
    ["deep learning ECG project", "single-lead-ecg-diagnostic-analysis"],
    ["database project", "PROJECT-RDBMS"],
  ])("ranks the matching project first for %j", (query, expectedId) => {
    expect(retrieveDocuments(query, documents)[0]?.id).toBe(expectedId);
  });

  it("surfaces AI projects for a general AI question", () => {
    const ids = retrieveDocuments("What AI projects has he built?", documents).map((d) => d.id);
    expect(ids).toContain("single-lead-ecg-diagnostic-analysis");
    expect(ids).toContain("mt-stgat-grid-fault-research");
  });

  it("finds the skills overview for a strongest-stack question", () => {
    const ids = retrieveDocuments("What is his strongest technical stack?", documents).map((d) => d.id);
    expect(ids).toContain("skills-summary");
  });

  it("does not reorder the portfolio's skills", () => {
    const before = seedPortfolio.skills.map((skill) => skill.name);
    buildKnowledgeDocuments(seedPortfolio);
    expect(seedPortfolio.skills.map((skill) => skill.name)).toEqual(before);
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
