import { describe, expect, it } from "vitest";
import { safeHref } from "./url";

describe("safeHref", () => {
  it("keeps web, mail and phone links", () => {
    expect(safeHref("https://github.com/Mandeep-vivu")).toBe("https://github.com/Mandeep-vivu");
    expect(safeHref("mailto:someone@example.com")).toBe("mailto:someone@example.com");
    expect(safeHref("tel:+911234567890")).toBe("tel:+911234567890");
    expect(safeHref("/admin")).toBe("/admin");
  });

  it("drops script and data links", () => {
    expect(safeHref("javascript:alert(1)")).toBe("");
    expect(safeHref("JaVaScRiPt:alert(1)")).toBe("");
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBe("");
    expect(safeHref(undefined)).toBe("");
  });

  it("can be limited to web links", () => {
    expect(safeHref("mailto:someone@example.com", { webOnly: true })).toBe("");
    expect(safeHref("https://calendly.com/x", { webOnly: true })).toBe("https://calendly.com/x");
  });
});
