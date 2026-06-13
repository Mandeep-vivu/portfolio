import { afterEach, describe, expect, it } from "vitest";
import {
  adminAuthConfigured,
  verifyAdminCredentials,
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
});
