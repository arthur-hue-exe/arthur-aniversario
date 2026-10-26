import { EVENT } from "@/config/event";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT.timeZone,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: EVENT.timeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return dateTimeFormatter.format(parsed).replace(".", "");
}

export function formatFullDateTime(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return fullDateFormatter.format(parsed);
}

export function formatRelativeUpdate(date: Date | string, nowMs = Date.now()): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  const diffSeconds = Math.max(0, Math.floor((nowMs - parsed.getTime()) / 1000));

  if (diffSeconds < 45) return "Agora mesmo";
  if (diffSeconds < 90) return "Há 1 minuto";

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `Há ${minutes} minutos`;

  return `Atualizado em ${formatDateTime(parsed)}`;
}
