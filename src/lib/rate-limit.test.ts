import { describe, expect, it } from "vitest";

import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

function key(name: string) {
  return `test:${name}:${Math.random().toString(36).slice(2)}`;
}

describe("consumeRateLimit", () => {
  it("allows requests up to the limit and blocks the rest", () => {
    const bucket = key("limit");
    const now = 1_000_000;

    const first = consumeRateLimit(bucket, 3, 60_000, now);
    const second = consumeRateLimit(bucket, 3, 60_000, now + 1);
    const third = consumeRateLimit(bucket, 3, 60_000, now + 2);
    const fourth = consumeRateLimit(bucket, 3, 60_000, now + 3);

    expect([first.allowed, second.allowed, third.allowed]).toEqual([
      true,
      true,
      true,
    ]);
    expect([first.remaining, second.remaining, third.remaining]).toEqual([
      2, 1, 0,
    ]);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const bucket = key("reset");
    const now = 2_000_000;

    consumeRateLimit(bucket, 1, 10_000, now);
    expect(consumeRateLimit(bucket, 1, 10_000, now + 5_000).allowed).toBe(false);
    expect(consumeRateLimit(bucket, 1, 10_000, now + 10_000).allowed).toBe(true);
  });

  it("keeps buckets independent", () => {
    const first = key("independent");
    const second = key("independent");

    consumeRateLimit(first, 1, 60_000, 3_000_000);
    expect(consumeRateLimit(first, 1, 60_000, 3_000_001).allowed).toBe(false);
    expect(consumeRateLimit(second, 1, 60_000, 3_000_001).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first forwarded address", () => {
    const request = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip and then to local", () => {
    expect(
      getClientIp(
        new Request("http://localhost/api", {
          headers: { "x-real-ip": "198.51.100.4" },
        }),
      ),
    ).toBe("198.51.100.4");

    expect(getClientIp(new Request("http://localhost/api"))).toBe("local");
  });
});
