"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertIcon,
  ArrowUpRight,
  CheckIcon,
  CloseIcon,
  LoaderIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from "@/components/icons";
import { EVENT } from "@/config/event";
import { formatFullDateTime } from "@/lib/format";
import {
  GUEST_STATUSES,
  GUEST_STATUS_LABEL,
  type GuestStatus,
} from "@/lib/guest-status";
import type { AdminGuest } from "@/lib/guest-types";
import { initialsFor, normalizeName } from "@/lib/names";
import { adminGuestSchema, fieldErrors } from "@/lib/validation";

type StatusFilter = "ALL" | GuestStatus;

type Notice = {
  kind: "success" | "error";
  message: string;
};

type GuestFormState = {
  name: string;
  companionName: string;
  companionConfirmed: boolean;
  status: GuestStatus;
  publicNote: string;
  internalNotes: string;
};

const EMPTY_FORM: GuestFormState = {
  name: "",
  companionName: "",
  companionConfirmed: false,
  status: "CONFIRMED",
  publicNote: "",
  internalNotes: "",
};

const ORIGIN_LABEL: Record<AdminGuest["origin"], string> = {
  RSVP: "Confirmou pelo site",
  SEED: "Lista inicial",
  MANUAL: "Adicionado pelo anfitrião",
};

const STATUS_STYLE: Record<GuestStatus, string> = {
  CONFIRMED:
    "border-emerald-glow/25 bg-emerald-glow/[0.07] text-emerald-glow",
  PENDING: "border-amber-200/25 bg-amber-200/[0.05] text-amber-100/75",
  CANCELLED: "border-red-400/20 bg-red-500/[0.05] text-red-200/70",
};

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-champagne placeholder:text-mist/35 transition-colors focus:border-emerald-glow/50 focus:bg-white/[0.05] focus:outline-none aria-[invalid=true]:border-red-400/50";

const labelClass =
  "block text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-champagne/80";

function toFormState(guest?: AdminGuest): GuestFormState {
  if (!guest) return { ...EMPTY_FORM };

  return {
    name: guest.name,
    companionName: guest.companionName ?? "",
    companionConfirmed: guest.companionConfirmed,
    status: guest.status,
    publicNote: guest.publicNote ?? "",
    internalNotes: guest.internalNotes ?? "",
  };
}

function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: number | string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        accent
          ? "border-emerald-glow/20 bg-emerald-glow/[0.05]"
          : "border-white/[0.07] bg-white/[0.025]"
      }`}
    >
      <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-mist/60">
        {label}
      </p>
      <p
        className={`mt-2 font-sans text-3xl font-light tabular-nums leading-none ${
          accent ? "text-emerald-glow" : "text-champagne"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-[0.65rem] leading-relaxed text-mist/55">{hint}</p>
    </div>
  );
}

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="glass-deep max-h-[92svh] w-full overflow-y-auto rounded-t-[2rem] p-6 sm:max-w-lg sm:rounded-[2rem] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-emerald-glow/75">
              {eyebrow}
            </p>
            <h2
              id="admin-modal-title"
              className="mt-2 font-display text-2xl text-champagne"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-white/25 hover:text-champagne"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function GuestFormModal({
  guest,
  onClose,
  onSaved,
  onUnauthorized,
}: {
  guest: AdminGuest | null;
  onClose: () => void;
  onSaved: (saved: AdminGuest, mode: "create" | "update") => void;
  onUnauthorized: () => void;
}) {
  const isEdit = Boolean(guest);
  const [form, setForm] = useState<GuestFormState>(() => toFormState(guest ?? undefined));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof GuestFormState>(key: K, value: GuestFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setErrors({});

    const parsed = adminGuestSchema.safeParse({
      name: form.name,
      companionName: form.companionName.trim() === "" ? null : form.companionName,
      companionConfirmed: form.companionName.trim()
        ? form.companionConfirmed
        : false,
      status: form.status,
      publicNote: form.publicNote.trim() === "" ? null : form.publicNote,
      internalNotes:
        form.internalNotes.trim() === "" ? null : form.internalNotes,
    });

    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        isEdit && guest ? `/api/admin/guests/${guest.id}` : "/api/admin/guests",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );

      if (response.status === 401) {
        onUnauthorized();
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | (AdminGuest & {
            error?: { message?: string; fields?: Record<string, string> };
          })
        | null;

      if (!response.ok) {
        setError(payload?.error?.message ?? "Não foi possível salvar.");
        if (payload?.error?.fields) setErrors(payload.error.fields);
        return;
      }

      onSaved(payload as AdminGuest, isEdit ? "update" : "create");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title={isEdit ? "Editar convidado" : "Novo convidado"}
      eyebrow={isEdit ? "Ajustar registro" : "Adicionar à lista"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="admin-guest-name" className={labelClass}>
            Nome <span className="text-emerald-glow">*</span>
          </label>
          <input
            id="admin-guest-name"
            type="text"
            maxLength={60}
            autoFocus
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Nome do convidado"
            aria-invalid={Boolean(errors.name)}
            className={`${inputClass} mt-1.5`}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-red-300/90">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="admin-guest-companion" className={labelClass}>
            Acompanhante{" "}
            <span className="font-normal normal-case tracking-normal text-mist/45">
              (opcional)
            </span>
          </label>
          <input
            id="admin-guest-companion"
            type="text"
            maxLength={60}
            value={form.companionName}
            onChange={(event) => update("companionName", event.target.value)}
            placeholder="Nome do acompanhante"
            aria-invalid={Boolean(errors.companionName)}
            className={`${inputClass} mt-1.5`}
          />
          {errors.companionName ? (
            <p className="mt-1.5 text-xs text-red-300/90">
              {errors.companionName}
            </p>
          ) : null}

          <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-mist">
            <input
              type="checkbox"
              checked={form.companionConfirmed}
              disabled={!form.companionName.trim()}
              onChange={(event) =>
                update("companionConfirmed", event.target.checked)
              }
              className="mt-0.5 size-4 accent-[#5affc8] disabled:opacity-40"
            />
            Acompanhante com presença confirmada
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-guest-status" className={labelClass}>
              Status
            </label>
            <select
              id="admin-guest-status"
              value={form.status}
              onChange={(event) =>
                update("status", event.target.value as GuestStatus)
              }
              className={`${inputClass} mt-1.5`}
            >
              {GUEST_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-graphite">
                  {GUEST_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={labelClass}>Origem</span>
            <p className="mt-2 flex h-12 items-center rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 text-xs text-mist/60">
              {guest ? ORIGIN_LABEL[guest.origin] : "Adicionado pelo anfitrião"}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="admin-guest-public-note" className={labelClass}>
            Observação pública
          </label>
          <input
            id="admin-guest-public-note"
            type="text"
            maxLength={160}
            value={form.publicNote}
            onChange={(event) => update("publicNote", event.target.value)}
            placeholder="Ex.: possível convidada"
            aria-invalid={Boolean(errors.publicNote)}
            className={`${inputClass} mt-1.5`}
          />
          <p className="mt-1.5 text-[0.68rem] text-mist/45">
            Aparece na lista pública. Use com cuidado.
          </p>
          {errors.publicNote ? (
            <p className="mt-1.5 text-xs text-red-300/90">{errors.publicNote}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="admin-guest-internal-notes" className={labelClass}>
            Observações internas
          </label>
          <textarea
            id="admin-guest-internal-notes"
            rows={3}
            maxLength={500}
            value={form.internalNotes}
            onChange={(event) => update("internalNotes", event.target.value)}
            placeholder="Anotações visíveis apenas para o anfitrião"
            aria-invalid={Boolean(errors.internalNotes)}
            className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-champagne placeholder:text-mist/35 transition-colors focus:border-emerald-glow/50 focus:bg-white/[0.05] focus:outline-none aria-[invalid=true]:border-red-400/50"
          />
          {errors.internalNotes ? (
            <p className="mt-1.5 text-xs text-red-300/90">
              {errors.internalNotes}
            </p>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 py-3 text-xs leading-relaxed text-red-200/90"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-white/25 hover:text-champagne"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-glow px-5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#04110c] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            {isEdit ? "Salvar alterações" : "Adicionar convidado"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function AdminDashboard({
  initialGuests,
}: {
  initialGuests: AdminGuest[];
}) {
  const router = useRouter();
  const [guests, setGuests] = useState(initialGuests);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AdminGuest | null>(null);
  const [deleting, setDeleting] = useState<AdminGuest | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleUnauthorized() {
    router.replace("/admin/login");
    router.refresh();
  }

  async function refreshGuests() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/guests", { cache: "no-store" });
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      const payload = (await response.json()) as { guests: AdminGuest[] };
      setGuests(payload.guests);
    } catch {
      setNotice({
        kind: "error",
        message: "Não foi possível atualizar a lista agora.",
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDelete() {
    if (!deleting || deletingBusy) return;
    setDeleteError(null);
    setDeletingBusy(true);

    try {
      const response = await fetch(`/api/admin/guests/${deleting.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setDeleteError(payload?.error?.message ?? "Não foi possível remover.");
        return;
      }

      setGuests((current) =>
        current.filter((guest) => guest.id !== deleting.id),
      );
      setNotice({
        kind: "success",
        message: `${deleting.name} foi removido da lista.`,
      });
      setDeleting(null);
    } catch {
      setDeleteError("Falha de conexão. Tente novamente.");
    } finally {
      setDeletingBusy(false);
    }
  }

  const stats = useMemo(() => {
    const confirmed = guests.filter((guest) => guest.status === "CONFIRMED");
    const companionsInformed = guests.filter((guest) => guest.companionName);

    return {
      confirmedGuests: confirmed.length,
      confirmedCompanions: confirmed.filter(
        (guest) => guest.companionName && guest.companionConfirmed,
      ).length,
      totalPeople: confirmed.length,
      pending: guests.filter((guest) => guest.status === "PENDING").length,
      cancelled: guests.filter((guest) => guest.status === "CANCELLED").length,
      companionsInformed: companionsInformed.length,
    };
  }, [guests]);

  const totalConfirmedPeople =
    stats.confirmedGuests + stats.confirmedCompanions;

  const filteredGuests = useMemo(() => {
    const normalizedQuery = normalizeName(query);

    return guests.filter((guest) => {
      const matchesStatus = filter === "ALL" || guest.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeName(guest.name).includes(normalizedQuery) ||
        normalizeName(guest.companionName ?? "").includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [guests, filter, query]);

  const filterOptions: { key: StatusFilter; label: string; count: number }[] = [
    { key: "ALL", label: "Todos", count: guests.length },
    {
      key: "CONFIRMED",
      label: "Confirmados",
      count: guests.filter((guest) => guest.status === "CONFIRMED").length,
    },
    {
      key: "PENDING",
      label: "A confirmar",
      count: stats.pending,
    },
    {
      key: "CANCELLED",
      label: "Cancelados",
      count: stats.cancelled,
    },
  ];

  return (
    <div className="min-h-[100svh]">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/[0.04] font-display text-base text-champagne">
              {EVENT.monogram}
            </span>
            <span>
              <span className="block text-[0.58rem] uppercase tracking-[0.24em] text-champagne/85">
                Painel do anfitrião
              </span>
              <span className="mt-0.5 block font-mono text-[0.48rem] uppercase tracking-[0.24em] text-mist/55">
                {EVENT.dateShort} · {EVENT.hostName}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-9 items-center gap-1.5 rounded-full border border-white/10 px-3.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-white/25 hover:text-champagne sm:inline-flex"
            >
              Ver convite
              <ArrowUpRight className="size-3" />
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/10 px-3.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-red-400/30 hover:text-red-200/80 disabled:opacity-50"
            >
              <LogOutIcon className="size-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div
          className="pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-emerald-glow/[0.05] blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-emerald-glow/75">
              Lista da festa · {EVENT.dateShort}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-none text-champagne">
              Confirmações
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-mist">
              Inclua convidados, ajuste acompanhantes e mantenha a lista
              pública sempre atualizada.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refreshGuests}
              disabled={refreshing}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-white/25 hover:text-champagne disabled:opacity-50"
            >
              <LoaderIcon
                className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-glow px-5 text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#04110c] transition-colors hover:bg-white"
            >
              <PlusIcon className="size-4" />
              Novo convidado
            </button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label="Pessoas confirmadas"
            value={totalConfirmedPeople}
            hint={`${stats.confirmedGuests} convidados + ${stats.confirmedCompanions} acompanhantes`}
            accent
          />
          <StatCard
            label="Convidados"
            value={stats.confirmedGuests}
            hint="Presenças confirmadas"
          />
          <StatCard
            label="Acompanhantes"
            value={stats.confirmedCompanions}
            hint={`${stats.companionsInformed} informados na lista`}
          />
          <StatCard
            label="A confirmar"
            value={stats.pending}
            hint="Aguardando resposta"
          />
          <StatCard
            label="Cancelados"
            value={stats.cancelled}
            hint="Fora da lista pública"
          />
        </div>

        {notice ? (
          <div
            className={`mt-5 flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-xs leading-relaxed ${
              notice.kind === "success"
                ? "border-emerald-glow/20 bg-emerald-glow/[0.05] text-emerald-glow/90"
                : "border-red-400/20 bg-red-500/[0.06] text-red-200/85"
            }`}
            role="status"
          >
            <span className="flex items-start gap-2">
              {notice.kind === "success" ? (
                <CheckIcon className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
              )}
              {notice.message}
            </span>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Fechar aviso"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        ) : null}

        <section className="relative mt-6 rounded-[1.75rem] border border-white/[0.07] bg-white/[0.02]">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mist/45" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou acompanhante"
                aria-label="Buscar convidados"
                className="h-11 w-full rounded-full border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-champagne placeholder:text-mist/35 transition-colors focus:border-emerald-glow/50 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filterOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilter(option.key)}
                  aria-pressed={filter === option.key}
                  className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-[0.52rem] uppercase tracking-[0.14em] transition-colors ${
                    filter === option.key
                      ? "border-emerald-glow/35 bg-emerald-glow/[0.08] text-emerald-glow"
                      : "border-white/[0.08] text-mist hover:border-white/20 hover:text-champagne"
                  }`}
                >
                  {option.label}
                  <span className="opacity-60">{option.count}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredGuests.length === 0 ? (
            <div className="grid min-h-48 place-items-center px-6 py-12 text-center">
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-full border border-white/10 text-mist/60">
                  <UsersIcon className="size-5" />
                </span>
                <p className="mt-4 text-sm text-champagne/80">
                  Nenhum convidado encontrado.
                </p>
                <p className="mt-1 text-xs text-mist/55">
                  Ajuste a busca ou adicione alguém à lista.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="hidden grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_170px_88px] gap-4 border-b border-white/[0.05] px-5 py-3 font-mono text-[0.48rem] uppercase tracking-[0.18em] text-mist/45 lg:grid">
                <span>Convidado</span>
                <span>Acompanhante</span>
                <span>Status / atualização</span>
                <span className="text-right">Ações</span>
              </div>

              <ul>
                {filteredGuests.map((guest) => (
                  <li
                    key={guest.id}
                    className="grid gap-3 border-b border-white/[0.05] px-4 py-4 last:border-0 sm:px-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_170px_88px] lg:items-center lg:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] font-mono text-[0.55rem] tracking-wider text-champagne/75">
                        {initialsFor(guest.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-champagne">
                            {guest.name}
                          </p>
                          <span
                            className={`rounded-full border px-2 py-0.5 font-mono text-[0.46rem] uppercase tracking-[0.14em] ${STATUS_STYLE[guest.status]}`}
                          >
                            {GUEST_STATUS_LABEL[guest.status]}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-mist/40">
                          {ORIGIN_LABEL[guest.origin]}
                        </p>
                        {guest.publicNote ? (
                          <p className="mt-1 text-[0.68rem] text-amber-100/55">
                            Público: {guest.publicNote}
                          </p>
                        ) : null}
                        {guest.internalNotes ? (
                          <p className="mt-1 line-clamp-2 text-[0.68rem] text-mist/40">
                            Interno: {guest.internalNotes}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="min-w-0 pl-12 lg:pl-0">
                      {guest.companionName ? (
                        <div>
                          <p className="truncate text-sm text-champagne/75">
                            {guest.companionName}
                          </p>
                          <p
                            className={`mt-1 inline-flex items-center gap-1 font-mono text-[0.48rem] uppercase tracking-[0.12em] ${
                              guest.companionConfirmed
                                ? "text-emerald-glow/65"
                                : "text-amber-100/50"
                            }`}
                          >
                            <span
                              className={`size-1 rounded-full ${
                                guest.companionConfirmed
                                  ? "bg-emerald-glow/70"
                                  : "bg-amber-200/50"
                              }`}
                            />
                            {guest.companionConfirmed
                              ? "Confirmado"
                              : "A confirmar"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-mist/35">Sem acompanhante</p>
                      )}
                    </div>

                    <div className="pl-12 lg:pl-0">
                      <p className="text-[0.68rem] text-mist/65">
                        {formatFullDateTime(guest.updatedAt)}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.46rem] uppercase tracking-[0.1em] text-mist/35">
                        Atualização
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-12 lg:justify-end lg:pl-0">
                      <button
                        type="button"
                        onClick={() => setEditing(guest)}
                        aria-label={`Editar ${guest.name}`}
                        title="Editar"
                        className="grid size-9 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-emerald-glow/30 hover:text-emerald-glow"
                      >
                        <PencilIcon className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleting(guest);
                        }}
                        aria-label={`Remover ${guest.name}`}
                        title="Remover"
                        className="grid size-9 place-items-center rounded-full border border-white/10 text-mist transition-colors hover:border-red-400/30 hover:text-red-300/80"
                      >
                        <TrashIcon className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-1 border-t border-white/[0.05] px-5 py-3 text-[0.6rem] text-mist/45 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {filteredGuests.length} de {guests.length} registros
            </span>
            <span>A lista pública é atualizada em até 15 segundos.</span>
          </div>
        </section>
      </main>

      {showAdd ? (
        <GuestFormModal
          guest={null}
          onClose={() => setShowAdd(false)}
          onUnauthorized={handleUnauthorized}
          onSaved={(saved) => {
            setGuests((current) => [saved, ...current]);
            setShowAdd(false);
            setNotice({
              kind: "success",
              message: `${saved.name} foi adicionado à lista.`,
            });
          }}
        />
      ) : null}

      {editing ? (
        <GuestFormModal
          guest={editing}
          onClose={() => setEditing(null)}
          onUnauthorized={handleUnauthorized}
          onSaved={(saved) => {
            setGuests((current) =>
              current.map((guest) => (guest.id === saved.id ? saved : guest)),
            );
            setEditing(null);
            setNotice({
              kind: "success",
              message: `Dados de ${saved.name} atualizados.`,
            });
          }}
        />
      ) : null}

      {deleting ? (
        <ModalShell
          title="Remover convidado?"
          eyebrow="Ação permanente"
          onClose={() => setDeleting(null)}
        >
          <p className="text-sm leading-relaxed text-mist">
            <span className="text-champagne">{deleting.name}</span> será removido
            da lista pública e do painel. Essa ação não pode ser desfeita.
          </p>

          {deleteError ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.07] px-4 py-3 text-xs text-red-200/90"
            >
              <AlertIcon className="mt-0.5 size-4 shrink-0" />
              {deleteError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 px-5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-mist transition-colors hover:border-white/25 hover:text-champagne"
            >
              Manter na lista
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletingBusy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/[0.12] px-5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingBusy ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              Remover definitivamente
            </button>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
