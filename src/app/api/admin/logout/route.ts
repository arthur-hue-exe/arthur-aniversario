import { NextResponse } from "next/server";

import {
  clearSessionCookieOptions,
  isSameOrigin,
} from "@/lib/auth";
import { apiError } from "@/lib/http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return apiError("FORBIDDEN", "Origem da requisição não permitida.", 403);
  }

  const response = NextResponse.json(
    { ok: true },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set({
    ...clearSessionCookieOptions(),
    value: "",
  });

  return response;
}
