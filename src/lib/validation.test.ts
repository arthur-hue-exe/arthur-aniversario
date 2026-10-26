import { describe, expect, it } from "vitest";

import {
  adminGuestSchema,
  adminLoginSchema,
  fieldErrors,
  rsvpSchema,
} from "@/lib/validation";

describe("rsvpSchema", () => {
  it("trims the name and turns a blank companion into null", () => {
    const parsed = rsvpSchema.parse({
      name: "  Cauã Takeuti  ",
      companionName: "   ",
    });

    expect(parsed.name).toBe("Cauã Takeuti");
    expect(parsed.companionName).toBeNull();
  });

  it("keeps an informed companion", () => {
    const parsed = rsvpSchema.parse({
      name: "Nathan",
      companionName: " Gasparzinha ",
    });

    expect(parsed.companionName).toBe("Gasparzinha");
  });

  it("defaults the companion to null when omitted", () => {
    expect(rsvpSchema.parse({ name: "Kaio" }).companionName).toBeNull();
  });

  it("requires a name", () => {
    expect(rsvpSchema.safeParse({}).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects names that are too short or have no letters", () => {
    expect(rsvpSchema.safeParse({ name: "A" }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "12" }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "!!" }).success).toBe(false);
  });

  it("rejects markup and unsupported symbols", () => {
    expect(rsvpSchema.safeParse({ name: "<script>" }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "Ana @ Festa" }).success).toBe(false);
  });

  it("rejects names longer than 60 characters", () => {
    expect(rsvpSchema.safeParse({ name: "A".repeat(61) }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "A".repeat(60) }).success).toBe(true);
  });

  it("accepts accents, apostrophes, hyphens and dots", () => {
    for (const name of ["Cauã Takeuti", "José D'Ávila", "Ana-Maria", "João Jr."]) {
      expect(rsvpSchema.safeParse({ name }).success).toBe(true);
    }
  });

  it("validates the optional companion with the same rules", () => {
    expect(
      rsvpSchema.safeParse({ name: "Kaio", companionName: "A" }).success,
    ).toBe(false);
    expect(
      rsvpSchema.safeParse({ name: "Kaio", companionName: "Bia" }).success,
    ).toBe(true);
  });
});

describe("adminGuestSchema", () => {
  it("applies safe defaults", () => {
    const parsed = adminGuestSchema.parse({ name: "Convidado Teste" });

    expect(parsed).toEqual({
      name: "Convidado Teste",
      companionName: null,
      companionConfirmed: false,
      status: "CONFIRMED",
      publicNote: null,
      internalNotes: null,
    });
  });

  it("accepts every valid status", () => {
    for (const status of ["CONFIRMED", "PENDING", "CANCELLED"]) {
      expect(adminGuestSchema.safeParse({ name: "Kaio", status }).success).toBe(
        true,
      );
    }
  });

  it("rejects an unknown status", () => {
    expect(
      adminGuestSchema.safeParse({ name: "Kaio", status: "MAYBE" }).success,
    ).toBe(false);
  });

  it("limits public and internal notes", () => {
    expect(
      adminGuestSchema.safeParse({
        name: "Zakk",
        publicNote: "a".repeat(161),
      }).success,
    ).toBe(false);
    expect(
      adminGuestSchema.safeParse({
        name: "Zakk",
        internalNotes: "a".repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("requires a non-empty password", () => {
    expect(adminLoginSchema.safeParse({ password: "" }).success).toBe(false);
    expect(adminLoginSchema.safeParse({ password: "secret" }).success).toBe(true);
  });
});

describe("fieldErrors", () => {
  it("maps the first issue of each field", () => {
    const result = rsvpSchema.safeParse({ name: "", companionName: "!!" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(Object.keys(errors).sort()).toEqual(["companionName", "name"]);
      expect(errors.name.length).toBeGreaterThan(0);
      expect(errors.companionName.length).toBeGreaterThan(0);
    }
  });
});
