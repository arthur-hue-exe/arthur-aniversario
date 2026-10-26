"use client";

import Image from "next/image";
import { motion, MotionConfig } from "motion/react";

import { ArrowDown, ArrowUpRight, ClockIcon, MapPinIcon } from "@/components/icons";
import { EVENT, MAPS_URL } from "@/config/event";

import { Countdown } from "./countdown";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const titleLine = {
  hidden: { y: "112%" },
  show: {
    y: "0%",
    transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        id="inicio"
        className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-pool.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-image object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,6,5,0.98)_0%,rgba(3,6,5,0.9)_34%,rgba(3,6,5,0.42)_72%,rgba(3,6,5,0.62)_100%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,6,5,0.72)_0%,rgba(3,6,5,0.1)_32%,rgba(3,6,5,0.18)_62%,rgba(3,6,5,0.96)_100%)]"
            aria-hidden="true"
          />
          <div
            className="aurora -bottom-40 -left-24 size-[34rem] bg-emerald-glow/15"
            aria-hidden="true"
          />
          <div
            className="aurora aurora-delayed -right-24 top-1/4 size-[26rem] bg-emerald-deep/50"
            aria-hidden="true"
          />
        </div>

        <motion.header
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-10"
        >
          <motion.a
            variants={item}
            href="#inicio"
            className="group flex items-center gap-3"
            aria-label="Arthur Alves — início"
          >
            <span className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] font-display text-lg text-champagne backdrop-blur-md transition-colors group-hover:border-emerald-glow/40">
              {EVENT.monogram}
            </span>
            <span className="hidden sm:block">
              <span className="block text-[0.6rem] uppercase tracking-[0.3em] text-champagne/85">
                {EVENT.hostName}
              </span>
              <span className="mt-1 block font-mono text-[0.52rem] uppercase tracking-[0.32em] text-mist">
                Aniversário · {EVENT.year}
              </span>
            </span>
          </motion.a>

          <motion.nav
            variants={item}
            aria-label="Navegação principal"
            className="flex items-center gap-2 sm:gap-7"
          >
            <a
              href="#evento"
              className="hidden text-[0.62rem] uppercase tracking-[0.28em] text-champagne/70 transition-colors hover:text-champagne sm:block"
            >
              O evento
            </a>
            <a
              href="#confirmar"
              className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-champagne backdrop-blur-md transition-colors hover:border-emerald-glow/45 hover:text-emerald-glow sm:px-5 sm:text-[0.62rem]"
            >
              Confirmar
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </motion.nav>
        </motion.header>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-7 pt-6 sm:px-8 sm:pt-10 lg:px-10">
          <div className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-12 lg:gap-10 lg:py-10">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="lg:col-span-7"
            >
              <motion.div
                variants={item}
                className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-[0.34em] text-emerald-glow/90"
              >
                <span className="h-px w-9 bg-emerald-glow/50" aria-hidden="true" />
                Convite privado · Goiânia
              </motion.div>

              <motion.p
                variants={item}
                className="mt-7 text-[0.64rem] uppercase tracking-[0.42em] text-champagne/55"
              >
                {EVENT.occasion}
              </motion.p>

              <h1
                aria-label={`${EVENT.hostName} — ${EVENT.occasion}`}
                className="mt-2 font-display font-normal tracking-[-0.035em] text-champagne"
              >
                <span className="block overflow-hidden pb-1">
                  <motion.span
                    variants={titleLine}
                    className="block text-[clamp(4.2rem,12.4vw,10rem)] leading-[0.8]"
                  >
                    Arthur
                  </motion.span>
                </span>
                <span className="mt-1 block overflow-hidden pb-3 lg:pl-[12%]">
                  <motion.span
                    variants={titleLine}
                    className="text-gradient-emerald block text-[clamp(4.2rem,12.4vw,10rem)] italic leading-[0.8]"
                  >
                    Alves
                  </motion.span>
                </span>
              </h1>

              <motion.p
                variants={item}
                className="mt-6 font-mono text-[0.63rem] uppercase tracking-[0.28em] text-champagne/80 sm:text-[0.68rem]"
              >
                {EVENT.dateHeroLine}
                <span className="mx-2 text-emerald-glow/60">/</span>
                {EVENT.timeHeroLine}
              </motion.p>

              <motion.p
                variants={item}
                className="mt-7 max-w-lg border-l border-emerald-glow/30 pl-5 text-pretty text-[0.95rem] leading-relaxed text-mist sm:text-base"
              >
                {EVENT.tagline}
              </motion.p>

              <motion.div
                variants={item}
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <a
                  href="#confirmar"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-emerald-glow px-7 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#04110c] shadow-[0_18px_50px_-18px_rgba(90,255,200,0.65)] transition-all hover:bg-white hover:shadow-[0_22px_60px_-18px_rgba(90,255,200,0.8)]"
                >
                  Confirmar presença
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#local"
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-6 text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-champagne backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.07]"
                >
                  <MapPinIcon className="size-4 text-emerald-glow/80" />
                  Ver localização
                </a>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 lg:justify-self-end"
            >
              <div className="glass relative w-full max-w-sm overflow-hidden rounded-[2rem] p-6 sm:p-7 lg:ml-auto">
                <div
                  className="absolute -right-16 -top-20 size-48 rounded-full bg-emerald-glow/10 blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-champagne/70">
                      Sábado · 07 nov
                    </p>
                    <span className="grid size-8 place-items-center rounded-full border border-emerald-glow/25 bg-emerald-glow/10 text-emerald-glow">
                      <WavesMark />
                    </span>
                  </div>

                  <div className="mt-5 flex items-baseline gap-1 font-display leading-[0.8]">
                    <span className="text-[clamp(4.2rem,8vw,5.6rem)] text-champagne">
                      07
                    </span>
                    <span className="text-2xl text-emerald-glow/55">/</span>
                    <span className="text-gradient-emerald text-[clamp(4.2rem,8vw,5.6rem)] italic">
                      11
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-mist">
                    Dois mil e vinte e seis
                  </p>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm text-champagne/80">
                    <p className="flex items-center gap-3">
                      <ClockIcon className="size-4 text-emerald-glow/70" />
                      {EVENT.timeLabel}
                    </p>
                    <p className="flex items-start gap-3">
                      <MapPinIcon className="mt-0.5 size-4 shrink-0 text-emerald-glow/70" />
                      Aparecida de Goiânia — GO
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {["Piscina", "Churrasco", "Noite"].map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 font-mono text-[0.52rem] uppercase tracking-[0.2em] text-mist"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-6 inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-emerald-glow transition-opacity hover:opacity-80"
                  >
                    Abrir no mapa
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Countdown />
          </motion.div>

          <div className="mt-5 flex items-center justify-between">
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.3em] text-mist/60">
              Role para descobrir
            </p>
            <a
              href="#evento"
              aria-label="Rolar para a seção do evento"
              className="grid size-9 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-emerald-glow/35 hover:text-emerald-glow"
            >
              <ArrowDown className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function WavesMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M2 9c2 0 2 1.6 4 1.6S8 9 10 9s2 1.6 4 1.6S16 9 18 9s2 1.6 4 1.6" />
      <path d="M2 15c2 0 2 1.6 4 1.6S8 15 10 15s2 1.6 4 1.6S16 15 18 15s2 1.6 4 1.6" />
    </svg>
  );
}
