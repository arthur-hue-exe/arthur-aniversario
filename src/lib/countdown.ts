import { EVENT_END_MS, EVENT_START_MS } from "@/config/event";

export type EventPhase = "upcoming" | "live" | "past";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
};

export function resolveEventPhase(nowMs: number): EventPhase {
  if (nowMs < EVENT_START_MS) return "upcoming";
  if (nowMs < EVENT_END_MS) return "live";
  return "past";
}

export function getCountdown(nowMs: number): CountdownParts {
  const diffMs = Math.max(0, EVENT_START_MS - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
  };
}

export function padCountdown(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}
