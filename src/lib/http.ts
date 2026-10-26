import { NextResponse } from "next/server";

import type { ApiErrorBody } from "@/lib/guest-types";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
};

export function noStoreJson<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: NO_STORE,
  });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  options?: {
    fields?: Record<string, string>;
    retryAfterSeconds?: number;
    headers?: Record<string, string>;
  },
) {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      ...(options?.fields ? { fields: options.fields } : {}),
      ...(options?.retryAfterSeconds
        ? { retryAfterSeconds: options.retryAfterSeconds }
        : {}),
    },
  };

  return NextResponse.json(body, {
    status,
    headers: {
      ...NO_STORE,
      ...(options?.headers ?? {}),
    },
  });
}

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
