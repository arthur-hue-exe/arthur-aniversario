import type { NextRequest } from "next/server";

import { hasAdminSession, isSameOrigin } from "@/lib/auth";
import {
  createAdminGuest,
  DuplicateGuestError,
  listAdminGuests,
} from "@/lib/guest-service";
import { apiError, noStoreJson, readJsonBody } from "@/lib/http";
import { adminGuestSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireSession() {
  return hasAdminSession();
}

export async function GET() {
  if (!(await requireSession())) {
    return apiError("UNAUTHORIZED", "Acesso administrativo não autorizado.", 401);
  }

  try {
    return noStoreJson({ guests: await listAdminGuests() });
  } catch (error) {
    console.error("[api/admin/guests] Falha ao listar convidados:", error);
    return apiError("SERVER_ERROR", "Não foi possível carregar os convidados.", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireSession())) {
    return apiError("UNAUTHORIZED", "Acesso administrativo não autorizado.", 401);
  }

  if (!isSameOrigin(request)) {
    return apiError("FORBIDDEN", "Origem da requisição não permitida.", 403);
  }

  const body = await readJsonBody(request);
  if (body === null || typeof body !== "object") {
    return apiError("INVALID_BODY", "Não foi possível ler os dados enviados.", 400);
  }

  const parsed = adminGuestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION", "Revise os dados do convidado.", 422, {
      fields: fieldErrors(parsed.error),
    });
  }

  try {
    return noStoreJson(await createAdminGuest(parsed.data), 201);
  } catch (error) {
    if (error instanceof DuplicateGuestError) {
      return apiError("DUPLICATE", "Já existe um convidado com esse nome.", 409);
    }

    console.error("[api/admin/guests] Falha ao criar convidado:", error);
    return apiError("SERVER_ERROR", "Não foi possível criar o convidado.", 500);
  }
}
