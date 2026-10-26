"use client";

import { AlertIcon } from "@/components/icons";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100svh] place-items-center px-6">
      <div className="glass w-full max-w-md rounded-[2rem] p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full border border-amber-200/20 bg-amber-200/[0.05] text-amber-100/80">
          <AlertIcon className="size-5" />
        </span>
        <h1 className="mt-6 font-display text-3xl text-champagne">
          Algo saiu do combinado.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Não foi possível carregar a página agora. Tente novamente em
          instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-glow px-6 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#04110c] transition-colors hover:bg-white"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
