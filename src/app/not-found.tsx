import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[100svh] place-items-center px-6">
      <div className="glass w-full max-w-md rounded-[2rem] p-8 text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-emerald-glow">
          404
        </p>
        <h1 className="mt-5 font-display text-4xl text-champagne">
          Esta página não existe.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          O convite da festa está em outro endereço.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-glow px-6 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#04110c] transition-colors hover:bg-white"
        >
          Voltar ao convite
        </Link>
      </div>
    </main>
  );
}
