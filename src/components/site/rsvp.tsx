"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  AlertIcon,
  ArrowUpRight,
  CheckIcon,
  LoaderIcon,
  LockIcon,
  SparkleIcon,
  UsersIcon,
} from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { EVENT } from "@/config/event";
import { formatDateTime } from "@/lib/format";
import type {
  PublicGuest,
  PublicRsvpPayload,
} from "@/lib/guest-types";
import { initialsFor } from "@/lib/names";
import { fieldErrors, rsvpSchema } from "@/lib/validation";

type Filter = "all" | "CONFIRMED" | "PENDING";

type Feedback = {
  type: "error" | "success";
  message: string;
  fields?: Record<string, string>;
};

type SuccessInfo = {
  name: string;
  companionName: string | null;
};

const inputClass =
  "h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 text-base text-champagne placeholder:text-mist/40 transition-colors focus:border-emerald-glow/50 focus:bg-white/[0.05] focus:outline-none aria-[invalid=true]:border-red-400/50";

function GuestRow({
  guest,
  isNew,
}: {
  guest: PublicGuest;
  isNew: boolean;
}) {
  const pending = guest.status === "PENDING";

  return (
    <li
      className={`relative flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
        pending
          ? "border-dashed border-amber-200/20 bg-amber-200/[0.025]"
          : "border-white/[0.065] bg-white/[0.025] hover:border-white/15"
      } ${isNew ? "guest-new ring-1 ring-emerald-glow/35" : ""}`}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-full border font-mono text-[0.62rem] tracking-wider ${
          pending
            ? "border-amber-200/25 bg-amber-200/[0.05] text-amber-100/80"
            : "border-emerald-glow/20 bg-emerald-glow/[0.07] text-emerald-glow"
        }`}
        aria-hidden="true"
      >
        {initialsFor(guest.name)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-champagne">
            {guest.name}
          </p>
          {isNew ? (
            <span className="rounded-full bg-emerald-glow px-2 py-0.5 font-mono text-[0.48rem] font-bold uppercase tracking-[0.16em] text-ink">
              Novo
            </span>
          ) : null}
          {pending ? (
            <span className="rounded-full border border-amber-200/25 px-2 py-0.5 font-mono text-[0.48rem] uppercase tracking-[0.16em] text-amber-100/75">
              A confirmar
            </span>
          ) : null}
        </div>

        {guest.companionName ? (
          <p className="mt-1 text-xs leading-relaxed text-mist">
            Acompanhante:{" "}
            <span className="text-champagne/75">{guest.companionName}</span>
            {guest.companionConfirmed ? (
              <span className="ml-1.5 inline-flex items-center gap-1 text-emerald-glow/70">
                <CheckIcon className="size-3" />
                confirmado
              </span>
            ) : (
              <span className="ml-1.5 text-amber-100/50">· a confirmar</span>
            )}
          </p>
        ) : null}

        {guest.publicNote ? (
          <p className="mt-1 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-amber-100/55">
            {guest.publicNote}
          </p>
        ) : null}
      </div>

      {!pending ? (
        <span
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-glow/70"
          aria-label="Presença confirmada"
        />
      ) : null}
    </li>
  );
}

export function RsvpSection({ initialData }: { initialData: PublicRsvpPayload }) {
  const [data, setData] = useState<PublicRsvpPayload>(initialData);
  const [filter, setFilter] = useState<Filter>("all");
  const [name, setName] = useState("");
  const [companion, setCompanion] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [listError, setListError] = useState(false);

  const previousIds = useRef<Set<string>>(
    new Set(initialData.guests.map((guest) => guest.id)),
  );
  const inFlight = useRef(false);
  const highlightTimer = useRef<number | null>(null);
  const successHeading = useRef<HTMLHeadingElement>(null);

  const loadGuests = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const response = await fetch("/api/rsvp", { cache: "no-store" });
      if (!response.ok) throw new Error("Falha ao atualizar a lista.");

      const next = (await response.json()) as PublicRsvpPayload;
      const incomingIds = new Set(next.guests.map((guest) => guest.id));
      const added = next.guests
        .filter((guest) => !previousIds.current.has(guest.id))
        .map((guest) => guest.id);

      if (added.length > 0 && previousIds.current.size > 0) {
        setNewIds(new Set(added));
        if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
        highlightTimer.current = window.setTimeout(() => setNewIds(new Set()), 6000);
      }

      previousIds.current = incomingIds;
      setData(next);
      setListError(false);
    } catch {
      setListError(true);
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadGuests();
    }, 15_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void loadGuests();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    };
  }, [loadGuests]);

  useEffect(() => {
    if (success) successHeading.current?.focus();
  }, [success]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setFeedback(null);
    setErrors({});

    const parsed = rsvpSchema.safeParse({
      name,
      companionName: companion.trim() === "" ? null : companion,
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          companionName: parsed.data.companionName,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: {
              code?: string;
              message?: string;
              fields?: Record<string, string>;
            };
          }
        | null;

      if (!response.ok) {
        setFeedback({
          type: "error",
          message:
            payload?.error?.message ??
            "Não foi possível confirmar sua presença. Tente novamente.",
          fields: payload?.error?.fields,
        });
        if (payload?.error?.fields) setErrors(payload.error.fields);
        return;
      }

      setSuccess({
        name: parsed.data.name,
        companionName: parsed.data.companionName,
      });
      setName("");
      setCompanion("");
      setFilter("all");
      await loadGuests();
    } catch {
      setFeedback({
        type: "error",
        message:
          "Falha de conexão. Verifique sua internet e tente novamente.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const confirmedCount = data.guests.filter(
    (guest) => guest.status === "CONFIRMED",
  ).length;
  const pendingCount = data.guests.filter(
    (guest) => guest.status === "PENDING",
  ).length;

  const filteredGuests = data.guests.filter((guest) =>
    filter === "all" ? true : guest.status === filter,
  );

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: data.guests.length },
    { key: "CONFIRMED", label: "Confirmados", count: confirmedCount },
    { key: "PENDING", label: "A confirmar", count: pendingCount },
  ];

  return (
    <section
      id="confirmar"
      className="relative scroll-mt-6 overflow-hidden border-t border-white/[0.06] py-24 sm:py-32"
    >
      <div
        className="pointer-events-none absolute -left-40 top-1/3 size-[32rem] rounded-full bg-emerald-glow/[0.06] blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-0 size-[26rem] rounded-full bg-emerald-deep/25 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionIntro
              index="02"
              label="A lista da festa"
              title={EVENT.rsvp.title}
            />
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-mist lg:pb-2 lg:text-right">
              {EVENT.rsvp.subtitle} Sem cadastro, sem senha — só o seu nome e o
              da companhia.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-6">
          <Reveal className="lg:col-span-5" y={18}>
            <div className="glass-deep rounded-[2rem] p-6 sm:p-8">
              {success ? (
                <div className="flex h-full flex-col">
                  <span className="grid size-14 place-items-center rounded-full border border-emerald-glow/30 bg-emerald-glow/10 text-emerald-glow">
                    <CheckIcon className="size-6" />
                  </span>
                  <h3
                    ref={successHeading}
                    tabIndex={-1}
                    className="mt-7 font-display text-[clamp(2rem,4vw,2.8rem)] leading-none text-champagne outline-none"
                  >
                    Presença confirmada.
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-mist">
                    {EVENT.rsvp.success}
                  </p>

                  <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                    <p className="font-mono text-[0.54rem] uppercase tracking-[0.22em] text-mist/60">
                      Em nome de
                    </p>
                    <p className="mt-1.5 text-base font-medium text-champagne">
                      {success.name}
                    </p>
                    {success.companionName ? (
                      <p className="mt-1 text-xs text-mist">
                        Acompanhante informado:{" "}
                        <span className="text-amber-100/70">
                          {success.companionName}
                        </span>{" "}
                        · sujeito à confirmação
                      </p>
                    ) : null}
                  </div>

                  <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-mist/60">
                    <SparkleIcon className="mt-0.5 size-3.5 shrink-0 text-emerald-glow/60" />
                    Sua presença já aparece na lista ao lado.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(null);
                      setFeedback(null);
                    }}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 pt-7 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-emerald-glow transition-opacity hover:opacity-75"
                  >
                    Confirmar outra pessoa
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-mist">
                      Confirmação de presença
                    </p>
                    <span className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-emerald-glow/80">
                      <UsersIcon className="size-4" />
                    </span>
                  </div>

                  <form className="mt-7" onSubmit={handleSubmit} noValidate>
                    <label
                      htmlFor="guest-name"
                      className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-champagne/85"
                    >
                      Seu nome <span className="text-emerald-glow">*</span>
                    </label>
                    <input
                      id="guest-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={60}
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nome completo ou como te chamam"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "guest-name-error" : undefined}
                      className={`${inputClass} mt-2.5`}
                    />
                    {errors.name ? (
                      <p
                        id="guest-name-error"
                        className="mt-2 text-xs text-red-300/90"
                      >
                        {errors.name}
                      </p>
                    ) : null}

                    <label
                      htmlFor="guest-companion"
                      className="mt-6 block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-champagne/85"
                    >
                      Acompanhante{" "}
                      <span className="font-normal normal-case tracking-normal text-mist/50">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id="guest-companion"
                      name="companionName"
                      type="text"
                      autoComplete="off"
                      maxLength={60}
                      value={companion}
                      onChange={(event) => setCompanion(event.target.value)}
                      placeholder="Namorada, esposa ou acompanhante"
                      aria-invalid={Boolean(errors.companionName)}
                      aria-describedby={
                        errors.companionName
                          ? "guest-companion-error"
                          : "guest-companion-hint"
                      }
                      className={`${inputClass} mt-2.5`}
                    />
                    {errors.companionName ? (
                      <p
                        id="guest-companion-error"
                        className="mt-2 text-xs text-red-300/90"
                      >
                        {errors.companionName}
                      </p>
                    ) : (
                      <p
                        id="guest-companion-hint"
                        className="mt-2 text-xs text-mist/50"
                      >
                        O nome aparece na lista como acompanhante a confirmar.
                      </p>
                    )}

                    {feedback?.type === "error" ? (
                      <div
                        role="alert"
                        aria-live="assertive"
                        className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-400/20 bg-red-500/[0.07] px-4 py-3 text-xs leading-relaxed text-red-200/90"
                      >
                        <AlertIcon className="mt-0.5 size-4 shrink-0" />
                        {feedback.message}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="group mt-7 inline-flex min-h-13 w-full items-center justify-center gap-3 rounded-full bg-emerald-glow px-6 py-3.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#04110c] shadow-[0_18px_50px_-20px_rgba(90,255,200,0.65)] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <LoaderIcon className="size-4 animate-spin" />
                          Confirmando…
                        </>
                      ) : (
                        <>
                          Confirmar presença
                          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>

                    <p className="mt-4 flex items-start gap-2 text-[0.68rem] leading-relaxed text-mist/50">
                      <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                      Sem login. Apenas o seu nome e o do acompanhante ficam
                      visíveis na lista da festa.
                    </p>
                  </form>
                </>
              )}
            </div>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.08} y={18}>
            <div className="glass flex h-full flex-col rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-mist">
                    Confirmados na lista
                  </p>
                  <h3 className="mt-2 font-display text-[clamp(2rem,4vw,2.7rem)] leading-none text-champagne">
                    Quem já vem
                  </h3>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-glow/20 bg-emerald-glow/[0.06] px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-emerald-glow/85">
                  <span className="pulse-dot size-1.5 rounded-full bg-emerald-glow" />
                  Ao vivo
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-4xl font-light tabular-nums leading-none text-champagne">
                      {data.stats.totalConfirmed}
                    </span>
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-mist">
                      confirmados
                    </span>
                  </div>
                  <p className="mt-2 text-[0.68rem] leading-relaxed text-mist/60">
                    {data.stats.confirmedGuests} convidados
                    {data.stats.confirmedCompanions > 0
                      ? ` · ${data.stats.confirmedCompanions} acompanhantes`
                      : " · acompanhantes a confirmar"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="font-mono text-[0.52rem] uppercase tracking-[0.2em] text-mist/55">
                    Última atualização
                  </p>
                  <p className="mt-2 text-sm text-champagne/85">
                    {data.updatedAt
                      ? formatDateTime(data.updatedAt)
                      : "Aguardando a primeira confirmação"}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[0.68rem] text-mist/55">
                    <span className="size-1 rounded-full bg-emerald-glow/60" />
                    Atualiza automaticamente
                  </p>
                </div>
              </div>

              <p className="sr-only" aria-live="polite">
                {data.stats.totalConfirmed} pessoas confirmadas e {pendingCount}{" "}
                aguardando confirmação.
              </p>

              <div
                role="group"
                aria-label="Filtrar lista de convidados"
                className="mt-6 flex flex-wrap gap-1.5"
              >
                {filters.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setFilter(option.key)}
                    aria-pressed={filter === option.key}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] transition-colors ${
                      filter === option.key
                        ? "border-emerald-glow/35 bg-emerald-glow/[0.1] text-emerald-glow"
                        : "border-white/[0.08] text-mist hover:border-white/20 hover:text-champagne"
                    }`}
                  >
                    {option.label}
                    <span className="text-[0.85em] opacity-60">{option.count}</span>
                  </button>
                ))}
              </div>

              {listError ? (
                <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] px-3 py-2 text-[0.68rem] text-amber-100/70">
                  <AlertIcon className="size-3.5 shrink-0" />
                  Não foi possível atualizar agora. Tentaremos novamente em
                  instantes.
                </p>
              ) : null}

              <div className="scroll-slim mt-4 max-h-[26rem] flex-1 overflow-y-auto pr-1">
                {filteredGuests.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredGuests.map((guest) => (
                      <GuestRow
                        key={guest.id}
                        guest={guest}
                        isNew={newIds.has(guest.id)}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-white/10 px-6 text-center">
                    <div>
                      <p className="text-sm text-champagne/80">
                        {filter === "PENDING"
                          ? "Ninguém aguardando confirmação."
                          : "A lista está vazia por aqui."}
                      </p>
                      <p className="mt-1 text-xs text-mist/55">
                        {filter === "PENDING"
                          ? "Todos os nomes da lista já confirmaram."
                          : "Seja a primeira pessoa a confirmar."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 flex items-start gap-2 border-t border-white/[0.06] pt-4 text-[0.68rem] leading-relaxed text-mist/45">
                <LockIcon className="mt-0.5 size-3.5 shrink-0" />
                Lista pública apenas com nomes. Nenhum telefone, e-mail ou dado
                interno é exibido.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
