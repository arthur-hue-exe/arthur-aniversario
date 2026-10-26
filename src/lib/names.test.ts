import { describe, expect, it } from "vitest";

import { cleanDisplayName, initialsFor, normalizeName } from "@/lib/names";

describe("normalizeName", () => {
  it("removes accents, case and extra whitespace", () => {
    expect(normalizeName("  Cauã   Takeuti ")).toBe("caua takeuti");
    expect(normalizeName("JOALISON")).toBe("joalison");
  });

  it("treats punctuation as separators", () => {
    expect(normalizeName("José D'Ávila")).toBe("jose d avila");
    expect(normalizeName("Ana-Maria")).toBe("ana maria");
    expect(normalizeName("Kayo.")).toBe("kayo");
  });

  it("keeps different names different", () => {
    expect(normalizeName("Kayo")).not.toBe(normalizeName("Kaio"));
  });
});

describe("cleanDisplayName", () => {
  it("trims and collapses internal spaces without changing the spelling", () => {
    expect(cleanDisplayName("  Cauã   Takeuti  ")).toBe("Cauã Takeuti");
    expect(cleanDisplayName("joalison")).toBe("joalison");
    expect(cleanDisplayName("Zakk")).toBe("Zakk");
  });
});

describe("initialsFor", () => {
  it("uses the first and last name", () => {
    expect(initialsFor("Cauã Takeuti")).toBe("CT");
    expect(initialsFor("Ana Maria Silva")).toBe("AS");
  });

  it("uses the first two letters for a single name", () => {
    expect(initialsFor("joalison")).toBe("JO");
    expect(initialsFor("Kayo")).toBe("KA");
  });

  it("falls back to a placeholder for empty input", () => {
    expect(initialsFor("   ")).toBe("?");
  });
});
