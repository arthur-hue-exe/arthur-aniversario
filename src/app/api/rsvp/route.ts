import type { NextRequest } from "next/server";

import {
  createPublicRsvp,
  DuplicateGuestError,
  getPublicRsvpData,
} from "@/lib/guest-service";
import { apiError, noStoreJson, readJsonBody } from "@/lib/http";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { fieldErrors, rsvpSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = consumeRateLimit(`rsvp:list:${ip}`, 120, 60_000);

  if (!limit.allowed) {
    return apiError(
      "RATE_LIMITED",
      "Muitas consultas em pouco tempo. Tente novamente em instantes.",
      429,
      {
        retryAfterSeconds: limit.retryAfterSeconds,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const data = await getPublicRsvpData();
    return noStoreJson(data);
  } catch (error) {
    console.error("[api/rsvp] Falha ao carregar a lista:", error);
    return apiError(
      "SERVER_ERROR",
      "Não foi possível carregar a lista de confirmados.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = consumeRateLimit(`rsvp:create:${ip}`, 6, 10 * 60_000);

  if (!limit.allowed) {
    return apiError(
      "RATE_LIMITED",
      "Muitas tentativas de confirmação. Aguarde alguns minutos e tente novamente.",
      429,
      {
        retryAfterSeconds: limit.retryAfterSeconds,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const body = await readJsonBody(request);
  if (body === null || typeof body !== "object") {
    return apiError("INVALID_BODY", "Não foi possível ler os dados enviados.", 400);
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION", "Revise os dados do formulário.", 422, {
      fields: fieldErrors(parsed.error),
    });
  }

  try {
    const guest = await createPublicRsvp(parsed.data);
    return noStoreJson(guest, 201);
  } catch (error) {
    if (error instanceof DuplicateGuestError) {
      return apiError(
        "DUPLICATE",
        "Esse nome já está na lista. Se precisar ajustar algo, fale com o anfitrião.",
        409,
      );
    }

    console.error("[api/rsvp] Falha ao confirmar presença:", error);
    return apiError(
      "SERVER_ERROR",
      "Não foi possível confirmar sua presença agora. Tente novamente.",
      500,
    );
  }
}
