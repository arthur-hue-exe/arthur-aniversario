import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  isAdminConfigured,
  isSameOrigin,
  verifyAdminPassword,
  verifySessionToken,
} from "@/lib/auth";

const EIGHT_HOURS = 8 * 60 * 60 * 1000;

describe("admin credentials", () => {
  it("is configured when password and secret are present", () => {
    expect(isAdminConfigured()).toBe(true);
  });

  it("accepts only the configured password", () => {
    expect(verifyAdminPassword(process.env.ADMIN_PASSWORD ?? "")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });
});

describe("session token", () => {
  const now = Date.UTC(2026, 9, 26, 12, 0, 0);

  it("signs and verifies a valid token", () => {
    const token = createSessionToken(now);

    expect(token.split(".")).toHaveLength(2);
    expect(verifySessionToken(token, now)).toBe(true);
    expect(verifySessionToken(token, now + EIGHT_HOURS - 1)).toBe(true);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(now);

    expect(verifySessionToken(token, now + EIGHT_HOURS)).toBe(false);
    expect(verifySessionToken(token, now + EIGHT_HOURS + 1)).toBe(false);
  });

  it("rejects a tampered signature", () => {
    const token = createSessionToken(now);
    const [expiresAt, signature] = token.split(".");
    const tampered = `${expiresAt}.${signature.slice(0, -1)}${signature.endsWith("a") ? "b" : "a"}`;

    expect(verifySessionToken(tampered, now)).toBe(false);
  });

  it("rejects malformed tokens", () => {
    for (const token of ["", "abc", "123", ".signature", "not-a-number.signature"]) {
      expect(verifySessionToken(token, now)).toBe(false);
    }
  });
});

describe("isSameOrigin", () => {
  it("accepts requests without an origin header", () => {
    expect(isSameOrigin(new Request("http://localhost:3000/api/rsvp"))).toBe(true);
  });

  it("accepts the same host", () => {
    const request = new Request("http://localhost:3000/api/rsvp", {
      headers: { origin: "http://localhost:3000" },
    });

    expect(isSameOrigin(request)).toBe(true);
  });

  it("rejects a different host", () => {
    const request = new Request("http://localhost:3000/api/rsvp", {
      headers: { origin: "http://evil.example" },
    });

    expect(isSameOrigin(request)).toBe(false);
  });

  it("rejects a malformed origin", () => {
    const request = new Request("http://localhost:3000/api/rsvp", {
      headers: { origin: "not a url" },
    });

    expect(isSameOrigin(request)).toBe(false);
  });
});
