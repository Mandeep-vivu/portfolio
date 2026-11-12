import { describe, expect, it } from "vitest";
import { seedPortfolio } from "@/lib/portfolio/seed";
import { blocksFromContext } from "./answers";
import { hasMatches, retrieveHybridContext } from "./hybrid";

// No embedding provider is configured in tests, so these exercise the local
// search path — the one every deployment can rely on.
describe("hybrid retrieval", () => {
  it("resolves matched skills back to portfolio entries", async () => {
    const context = await retrieveHybridContext("docker and kubernetes", seedPortfolio);
    expect(context.matchedSkills.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["Docker", "Kubernetes"]),
    );
  });

  it("returns project cards with real links", async () => {
    const context = await retrieveHybridContext("database project", seedPortfolio);
    expect(context.matchedProjects[0]).toMatchObject({
      id: "PROJECT-RDBMS",
      githubUrl: "https://github.com/Mandeep-vivu/PROJECT-RDBMS",
    });
  });

  it("falls back to the profile when nothing matches", async () => {
    const context = await retrieveHybridContext("tell me about Mandeep", seedPortfolio);
    expect(context.confidence).toBe(0);
    expect(context.semanticMatches.map((match) => match.title)).toContain(
      seedPortfolio.profile.name,
    );
  });

  it("builds a no-model answer from retrieved context", async () => {
    const context = await retrieveHybridContext("flutter apps", seedPortfolio);
    expect(hasMatches(context)).toBe(true);
    const blocks = blocksFromContext(context);
    expect(blocks.some((block) => block.type === "project_card")).toBe(true);
  });
});
