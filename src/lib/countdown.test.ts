import { describe, expect, it } from "vitest";

import { EVENT_END_MS, EVENT_START_MS, MAPS_URL } from "@/config/event";
import { getCountdown, padCountdown, resolveEventPhase } from "@/lib/countdown";

const DAY = 86_400_000;

describe("event configuration", () => {
  it("targets 7 Nov 2026 at 17:00 in America/Sao_Paulo", () => {
    expect(EVENT_START_MS).toBe(Date.UTC(2026, 10, 7, 20, 0, 0));
    expect(EVENT_END_MS).toBe(Date.UTC(2026, 10, 8, 3, 0, 0));
    expect(new Date(EVENT_START_MS).toISOString()).toBe(
      "2026-11-07T20:00:00.000Z",
    );
  });

  it("builds a Google Maps search link with the full address", () => {
    expect(MAPS_URL.startsWith("https://www.google.com/maps/search/")).toBe(true);

    const decoded = decodeURIComponent(MAPS_URL);
    expect(decoded).toContain("Rua 1, Jardim Imperial");
    expect(decoded).toContain("Quadra 09, Lote 41");
    expect(decoded).toContain("Aparecida de Goiânia - GO");
    expect(decoded).toContain("74914-662");
  });
});

describe("resolveEventPhase", () => {
  it("is upcoming before the start", () => {
    expect(resolveEventPhase(EVENT_START_MS - 1)).toBe("upcoming");
  });

  it("is live from the start until the end", () => {
    expect(resolveEventPhase(EVENT_START_MS)).toBe("live");
    expect(resolveEventPhase(EVENT_END_MS - 1)).toBe("live");
  });

  it("is past once the event ends", () => {
    expect(resolveEventPhase(EVENT_END_MS)).toBe("past");
    expect(resolveEventPhase(EVENT_END_MS + DAY)).toBe("past");
  });
});

describe("getCountdown", () => {
  it("splits the remaining time into days, hours, minutes and seconds", () => {
    const remainingSeconds = 2 * 86_400 + 3 * 3_600 + 4 * 60 + 5;
    const parts = getCountdown(EVENT_START_MS - remainingSeconds * 1000);

    expect(parts).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
      totalSeconds: remainingSeconds,
    });
  });

  it("reaches zero exactly at the start", () => {
    expect(getCountdown(EVENT_START_MS)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    });
  });

  it("never returns negative values after the event", () => {
    expect(getCountdown(EVENT_END_MS).totalSeconds).toBe(0);
    expect(getCountdown(EVENT_END_MS + 10 * DAY)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    });
  });

  it("does not roll over to the next year", () => {
    const nextYear = EVENT_START_MS + 365 * DAY;
    expect(getCountdown(nextYear).totalSeconds).toBe(0);
    expect(resolveEventPhase(nextYear)).toBe("past");
  });
});

describe("padCountdown", () => {
  it("pads values to two digits and clamps negatives", () => {
    expect(padCountdown(0)).toBe("00");
    expect(padCountdown(5)).toBe("05");
    expect(padCountdown(42)).toBe("42");
    expect(padCountdown(-3)).toBe("00");
  });
});
