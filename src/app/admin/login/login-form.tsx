"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AlertIcon, ArrowUpRight, LoaderIcon, LockIcon } from "@/components/icons";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(payload?.error?.message ?? "Não foi possível entrar.");
        setSubmitting(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <label
        htmlFor="admin-password"
        className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-champagne/85"
      >
        Senha do anfitrião
      </label>
      <div className="relative mt-2.5">
        <LockIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist/50" />
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••••••"
          disabled={!configured || submitting}
          className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-base text-champagne placeholder:text-mist/30 transition-colors focus:border-emerald-glow/50 focus:bg-white/[0.05] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {!configured ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200/20 bg-amber-200/[0.05] px-4 py-3 text-xs leading-relaxed text-amber-100/75"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          A administração não está configurada neste ambiente. Defina
          ADMIN_PASSWORD e ADMIN_SESSION_SECRET no servidor.
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-500/[0.07] px-4 py-3 text-xs leading-relaxed text-red-200/90"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!configured || submitting || password.length === 0}
        className="group mt-6 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-emerald-glow px-6 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#04110c] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <>
            <LoaderIcon className="size-4 animate-spin" />
            Entrando…
          </>
        ) : (
          <>
            Entrar no painel
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
