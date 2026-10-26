import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createSessionToken,
  isAdminConfigured,
  isSameOrigin,
  sessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth";
import { apiError } from "@/lib/http";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { adminLoginSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return apiError("FORBIDDEN", "Origem da requisição não permitida.", 403);
  }

  if (!isAdminConfigured()) {
    return apiError(
      "NOT_CONFIGURED",
      "A administração ainda não foi configurada neste ambiente.",
      503,
    );
  }

  const ip = getClientIp(request);
  const limit = consumeRateLimit(`admin:login:${ip}`, 5, 15 * 60_000);

  if (!limit.allowed) {
    return apiError(
      "RATE_LIMITED",
      "Muitas tentativas de acesso. Aguarde alguns minutos.",
      429,
      {
        retryAfterSeconds: limit.retryAfterSeconds,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Não foi possível ler os dados enviados.", 400);
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION", "Informe a senha de administração.", 422, {
      fields: fieldErrors(parsed.error),
    });
  }

  if (!verifyAdminPassword(parsed.data.password)) {
    return apiError("UNAUTHORIZED", "Senha incorreta.", 401);
  }

  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set({
    ...sessionCookieOptions(),
    value: createSessionToken(),
  });

  return response;
}
