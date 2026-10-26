import { z } from "zod";

import { GUEST_STATUSES } from "@/lib/guest-status";

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u;

const nameField = z
  .string()
  .trim()
  .min(2, "Informe o nome com pelo menos 2 caracteres.")
  .max(60, "O nome deve ter no máximo 60 caracteres.")
  .regex(NAME_PATTERN, "Use apenas letras, espaços, apóstrofo, hífen ou ponto.")
  .refine(
    (value) => value.replace(/[^\p{L}]/gu, "").length >= 2,
    "Informe um nome válido.",
  );

function nullableName() {
  return z.preprocess(
    (value) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
        ? null
        : value,
    z
      .string()
      .trim()
      .min(2, "Informe o nome do acompanhante com pelo menos 2 caracteres.")
      .max(60, "O nome deve ter no máximo 60 caracteres.")
      .regex(NAME_PATTERN, "Use apenas letras, espaços, apóstrofo, hífen ou ponto.")
      .nullable(),
  );
}

function nullableNote(max: number, message: string) {
  return z.preprocess(
    (value) =>
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
        ? null
        : value,
    z.string().trim().max(max, message).nullable(),
  );
}

export const rsvpSchema = z.object({
  name: nameField,
  companionName: nullableName(),
});

export const adminGuestSchema = z.object({
  name: nameField,
  companionName: nullableName(),
  companionConfirmed: z.boolean().default(false),
  status: z.enum(GUEST_STATUSES).default("CONFIRMED"),
  publicNote: nullableNote(160, "A observação pública deve ter no máximo 160 caracteres."),
  internalNotes: nullableNote(500, "As observações internas devem ter no máximo 500 caracteres."),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Informe a senha.").max(200, "Senha inválida."),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
export type AdminGuestInput = z.infer<typeof adminGuestSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }

  return errors;
}
