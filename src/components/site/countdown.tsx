"use client";

import { useSyncExternalStore } from "react";

import { SparkleIcon } from "@/components/icons";
import {
  getCountdown,
  padCountdown,
  resolveEventPhase,
  type EventPhase,
} from "@/lib/countdown";

function subscribeToClock(onTick: () => void) {
  const interval = window.setInterval(onTick, 1000);
  return () => window.clearInterval(interval);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot() {
  return null;
}

const UNITS = [
  { key: "days", label: "Dias" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
] as const;

function PhasePanel({
  phase,
}: {
  phase: Extract<EventPhase, "live" | "past">;
}) {
  const live = phase === "live";

  return (
    <div
      className={`glass relative overflow-hidden rounded-[1.6rem] px-6 py-7 sm:px-8 ${
        live ? "border-emerald-glow/35" : ""
      }`}
      aria-live="polite"
    >
      <div
        className={`absolute -left-16 -top-20 size-56 rounded-full blur-3xl ${
          live ? "bg-emerald-glow/20" : "bg-white/5"
        }`}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full border ${
              live
                ? "live-glow border-emerald-glow/40 bg-emerald-glow/10 text-emerald-glow"
                : "border-white/15 bg-white/5 text-champagne/70"
            }`}
          >
            {live ? (
              <span className="relative flex size-3">
                <span className="pulse-dot absolute inline-flex size-3 rounded-full bg-emerald-glow" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-glow" />
              </span>
            ) : (
              <SparkleIcon className="size-5" />
            )}
          </span>
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.32em] text-mist">
              {live ? "É hoje · 07.11.2026" : "07.11.2026"}
            </p>
            <p className="mt-1 font-display text-[clamp(1.7rem,4vw,2.5rem)] leading-none text-champagne">
              {live ? "A festa começou." : "A festa já aconteceu."}
            </p>
          </div>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-mist sm:text-right">
          {live
            ? "A piscina está liberada e o churrasco já está no fogo. Bom aniversário, Arthur!"
            : "Obrigado a quem celebrou com a gente. Até a próxima."}
        </p>
      </div>
    </div>
  );
}

export function Countdown() {
  const currentSecond = useSyncExternalStore<number | null>(
    subscribeToClock,
    getClockSnapshot,
    getServerSnapshot,
  );
  const now = currentSecond === null ? null : currentSecond * 1000;

  const phase = now === null ? "upcoming" : resolveEventPhase(now);

  if (phase === "live" || phase === "past") {
    return <PhasePanel phase={phase} />;
  }

  const parts = now === null ? null : getCountdown(now);

  return (
    <div className="glass overflow-hidden rounded-[1.6rem] px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="shrink-0">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.32em] text-mist">
            Contagem regressiva
          </p>
          <p className="mt-2 text-sm text-champagne/85">
            07 de novembro · 17h
          </p>
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-mist/60">
            Horário de Brasília
          </p>
        </div>

        <div
          className="grid w-full grid-cols-4 divide-x divide-white/10"
          role="timer"
          aria-label={
            parts
              ? `Faltam ${parts.days} dias, ${parts.hours} horas, ${parts.minutes} minutos e ${parts.seconds} segundos para a festa.`
              : "Carregando contagem regressiva."
          }
        >
          {UNITS.map((unit) => {
            const value = parts ? parts[unit.key] : null;

            return (
              <div
                key={unit.key}
                className="flex flex-col items-center gap-1 px-1 sm:px-3"
                aria-hidden="true"
              >
                <span className="font-sans text-[clamp(1.65rem,6.5vw,3.1rem)] font-light leading-none tabular-nums tracking-[-0.03em] text-champagne">
                  {value === null ? "--" : padCountdown(value)}
                </span>
                <span className="text-[0.55rem] uppercase tracking-[0.22em] text-mist sm:text-[0.6rem] sm:tracking-[0.26em]">
                  {unit.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
