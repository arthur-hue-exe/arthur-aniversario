import type { NextRequest } from "next/server";

import { hasAdminSession, isSameOrigin } from "@/lib/auth";
import {
  deleteAdminGuest,
  DuplicateGuestError,
  GuestNotFoundError,
  updateAdminGuest,
} from "@/lib/guest-service";
import { apiError, noStoreJson, readJsonBody } from "@/lib/http";
import { adminGuestSchema, fieldErrors } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return apiError("UNAUTHORIZED", "Acesso administrativo não autorizado.", 401);
  }

  if (!isSameOrigin(request)) {
    return apiError("FORBIDDEN", "Origem da requisição não permitida.", 403);
  }

  const { id } = await context.params;
  if (!id || id.length > 64) {
    return apiError("INVALID_ID", "Registro inválido.", 400);
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
    return noStoreJson(await updateAdminGuest(id, parsed.data));
  } catch (error) {
    if (error instanceof DuplicateGuestError) {
      return apiError("DUPLICATE", "Já existe um convidado com esse nome.", 409);
    }
    if (error instanceof GuestNotFoundError) {
      return apiError("NOT_FOUND", "Convidado não encontrado.", 404);
    }

    console.error("[api/admin/guests/:id] Falha ao atualizar convidado:", error);
    return apiError("SERVER_ERROR", "Não foi possível atualizar o convidado.", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await hasAdminSession())) {
    return apiError("UNAUTHORIZED", "Acesso administrativo não autorizado.", 401);
  }

  if (!isSameOrigin(request)) {
    return apiError("FORBIDDEN", "Origem da requisição não permitida.", 403);
  }

  const { id } = await context.params;
  if (!id || id.length > 64) {
    return apiError("INVALID_ID", "Registro inválido.", 400);
  }

  try {
    await deleteAdminGuest(id);
    return noStoreJson({ ok: true });
  } catch (error) {
    if (error instanceof GuestNotFoundError) {
      return apiError("NOT_FOUND", "Convidado não encontrado.", 404);
    }

    console.error("[api/admin/guests/:id] Falha ao remover convidado:", error);
    return apiError("SERVER_ERROR", "Não foi possível remover o convidado.", 500);
  }
}
