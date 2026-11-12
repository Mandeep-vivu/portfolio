import { afterEach, describe, expect, it } from "vitest";
import {
  adminAuthConfigured,
  createSessionToken,
  verifyAdminCredentials,
  verifySessionToken,
} from "./auth";

const original = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  secret: process.env.AUTH_SECRET,
};

afterEach(() => {
  process.env.ADMIN_EMAIL = original.email;
  process.env.ADMIN_PASSWORD = original.password;
  process.env.AUTH_SECRET = original.secret;
});

describe("admin authorization", () => {
  it("requires complete secure configuration", () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "long-password";
    process.env.AUTH_SECRET = "short";
    expect(adminAuthConfigured()).toBe(false);
  });

  it("validates configured credentials", () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "long-password";
    process.env.AUTH_SECRET = "a".repeat(32);
    expect(verifyAdminCredentials("admin@example.com", "long-password")).toBe(
      true,
    );
    expect(verifyAdminCredentials("admin@example.com", "wrong-password")).toBe(
      false,
    );
  });

  describe("session tokens", () => {
    const configure = () => {
      process.env.ADMIN_EMAIL = "Admin@Example.com";
      process.env.ADMIN_PASSWORD = "long-password";
      process.env.AUTH_SECRET = "a".repeat(32);
    };

    it("accepts a fresh token regardless of email casing", () => {
      configure();
      // Login is case-insensitive, so the session must be too.
      expect(verifySessionToken(createSessionToken("admin@example.com"))).toBe(true);
    });

    it("rejects tampered, foreign and expired tokens", () => {
      configure();
      const token = createSessionToken("admin@example.com");
      const [payload, signature] = token.split(".");

      expect(verifySessionToken(`${payload}.${signature}x`)).toBe(false);
      expect(verifySessionToken(createSessionToken("someone@else.com"))).toBe(false);
      expect(verifySessionToken(token, Date.now() + 9 * 60 * 60 * 1000)).toBe(false);
      expect(verifySessionToken(undefined)).toBe(false);
      expect(verifySessionToken("not-a-token")).toBe(false);
    });

    it("rejects tokens signed with a different secret", () => {
      configure();
      const token = createSessionToken("admin@example.com");
      process.env.AUTH_SECRET = "b".repeat(32);
      expect(verifySessionToken(token)).toBe(false);
    });
  });
});
