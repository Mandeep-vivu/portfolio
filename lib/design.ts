/**
 * The site ships two complete designs that visitors can switch between, the
 * way they would switch a light/dark theme:
 *   - "light": version 2, the typographic layout in components/v2
 *   - "dark":  version 1, the animated layout in components/v1
 */
export const DESIGNS = ["light", "dark"] as const;
export type Design = (typeof DESIGNS)[number];

/** What a first-time visitor sees. */
export const DEFAULT_DESIGN: Design = "light";

/** Cookie that remembers the visitor's choice; read on the server so the
 *  first paint is already the right design. */
export const DESIGN_COOKIE = "design";
export const DESIGN_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Browser UI colour (mobile address bar) for each design. */
export const THEME_COLOR: Record<Design, string> = {
  light: "#f2f4f7",
  dark: "#030712",
};

export function parseDesign(value: string | null | undefined): Design {
  return value === "light" || value === "dark" ? value : DEFAULT_DESIGN;
}

export function otherDesign(design: Design): Design {
  return design === "light" ? "dark" : "light";
}

/** Sections that hold the same content in both designs, by element id. */
const SECTION_EQUIVALENTS: ReadonlyArray<Record<Design, string>> = [
  { light: "top", dark: "home" },
  { light: "work", dark: "projects" },
  { light: "about", dark: "about" },
  { light: "skills", dark: "skills" },
  { light: "path", dark: "journey" },
  { light: "recognition", dark: "achievements" },
  { light: "contact", dark: "contact" },
];

/** The id of the matching section in the other design, so switching keeps
 *  the visitor where they were reading. */
export function equivalentSection(id: string, from: Design, to: Design): string | null {
  return SECTION_EQUIVALENTS.find((section) => section[from] === id)?.[to] ?? null;
}

/** True for the opening section of a design, which maps to the page top. */
export function isTopSection(id: string): boolean {
  return SECTION_EQUIVALENTS[0]!.light === id || SECTION_EQUIVALENTS[0]!.dark === id;
}
