import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft } from "@/components/icons";
import { EVENT } from "@/config/event";
import { hasAdminSession, isAdminConfigured } from "@/lib/auth";

import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  const configured = isAdminConfigured();

  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden px-5 py-12">
      <div
        className="pointer-events-none absolute -left-24 top-1/4 size-[30rem] rounded-full bg-emerald-glow/[0.07] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 size-[26rem] rounded-full bg-emerald-deep/30 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="glass rounded-[2rem] p-7 sm:p-9">
          <div className="flex items-center justify-between">
            <span className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/[0.04] font-display text-lg text-champagne">
              {EVENT.monogram}
            </span>
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.26em] text-mist/55">
              Área restrita
            </span>
          </div>

          <p className="mt-9 font-mono text-[0.56rem] uppercase tracking-[0.3em] text-emerald-glow/80">
            Aniversário · {EVENT.dateShort}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3rem)] leading-none text-champagne">
            Painel do anfitrião
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-mist">
            Acesso exclusivo para administrar a lista de confirmados.
          </p>

          <LoginForm configured={configured} />

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-mist transition-colors hover:text-champagne"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao convite
          </Link>
        </div>

        <p className="mt-5 text-center text-[0.6rem] uppercase tracking-[0.2em] text-mist/40">
          {EVENT.hostName} · {EVENT.year}
        </p>
      </div>
    </main>
  );
}
