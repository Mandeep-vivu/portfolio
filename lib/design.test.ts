import { describe, expect, it } from "vitest";
import { DEFAULT_DESIGN, equivalentSection, isTopSection, otherDesign, parseDesign } from "./design";

describe("design preference", () => {
  it("accepts the two known designs", () => {
    expect(parseDesign("light")).toBe("light");
    expect(parseDesign("dark")).toBe("dark");
  });

  it("falls back to the default for missing or tampered cookies", () => {
    expect(parseDesign(undefined)).toBe(DEFAULT_DESIGN);
    expect(parseDesign("")).toBe(DEFAULT_DESIGN);
    expect(parseDesign("Dark")).toBe(DEFAULT_DESIGN);
    expect(parseDesign("<script>")).toBe(DEFAULT_DESIGN);
  });

  it("toggles between the two", () => {
    expect(otherDesign("light")).toBe("dark");
    expect(otherDesign("dark")).toBe("light");
  });
});

describe("section mapping", () => {
  it.each([
    ["work", "projects"],
    ["path", "journey"],
    ["recognition", "achievements"],
    ["contact", "contact"],
  ])("maps light %s to dark %s and back", (light, dark) => {
    expect(equivalentSection(light, "light", "dark")).toBe(dark);
    expect(equivalentSection(dark, "dark", "light")).toBe(light);
  });

  it("returns null for unknown sections", () => {
    expect(equivalentSection("nowhere", "light", "dark")).toBeNull();
  });

  it("recognises the opening section of either design", () => {
    expect(isTopSection("top")).toBe(true);
    expect(isTopSection("home")).toBe(true);
    expect(isTopSection("work")).toBe(false);
  });
});
