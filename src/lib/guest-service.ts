import { Prisma, type Guest } from "@prisma/client";

import type {
  AdminGuest,
  PublicGuest,
  PublicRsvpPayload,
} from "@/lib/guest-types";
import {
  GUEST_ORIGINS,
  isGuestStatus,
  type GuestOrigin,
} from "@/lib/guest-status";
import { cleanDisplayName, normalizeName } from "@/lib/names";
import { prisma } from "@/lib/prisma";
import type { AdminGuestInput, RsvpInput } from "@/lib/validation";

export class DuplicateGuestError extends Error {
  constructor() {
    super("Já existe uma confirmação com esse nome.");
    this.name = "DuplicateGuestError";
  }
}

export class GuestNotFoundError extends Error {
  constructor() {
    super("Convidado não encontrado.");
    this.name = "GuestNotFoundError";
  }
}

const publicSelect = {
  id: true,
  name: true,
  companionName: true,
  companionConfirmed: true,
  status: true,
  publicNote: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GuestSelect;

type PublicRecord = Prisma.GuestGetPayload<{ select: typeof publicSelect }>;

function toPublicGuest(record: PublicRecord): PublicGuest {
  return {
    id: record.id,
    name: record.name,
    companionName: record.companionName,
    companionConfirmed: record.companionConfirmed,
    status: record.status === "PENDING" ? "PENDING" : "CONFIRMED",
    publicNote: record.publicNote,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function getPublicRsvpData(): Promise<PublicRsvpPayload> {
  const records = await prisma.guest.findMany({
    where: { status: { in: ["CONFIRMED", "PENDING"] } },
    select: publicSelect,
    orderBy: { createdAt: "asc" },
  });

  const guests = records
    .map(toPublicGuest)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "CONFIRMED" ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
    });

  const confirmedGuests = records.filter((r) => r.status === "CONFIRMED").length;
  const confirmedCompanions = records.filter(
    (r) =>
      r.status === "CONFIRMED" &&
      Boolean(r.companionName) &&
      r.companionConfirmed,
  ).length;
  const pendingGuests = records.filter((r) => r.status === "PENDING").length;

  const updatedAt = records.reduce<Date | null>((latest, record) => {
    if (!latest || record.updatedAt > latest) return record.updatedAt;
    return latest;
  }, null);

  return {
    guests,
    stats: {
      confirmedGuests,
      confirmedCompanions,
      totalConfirmed: confirmedGuests + confirmedCompanions,
      pendingGuests,
    },
    updatedAt: updatedAt ? updatedAt.toISOString() : null,
  };
}

export async function createPublicRsvp(input: RsvpInput): Promise<PublicGuest> {
  const name = cleanDisplayName(input.name);
  const normalizedName = normalizeName(name);

  const existing = await prisma.guest.findUnique({
    where: { normalizedName },
    select: { id: true },
  });

  if (existing) throw new DuplicateGuestError();

  try {
    const record = await prisma.guest.create({
      data: {
        name,
        normalizedName,
        companionName: input.companionName,
        companionConfirmed: false,
        status: "CONFIRMED",
        origin: "RSVP",
        confirmedAt: new Date(),
      },
      select: publicSelect,
    });

    return toPublicGuest(record);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new DuplicateGuestError();
    throw error;
  }
}

function normalizeOrigin(origin: string): GuestOrigin {
  return (GUEST_ORIGINS as readonly string[]).includes(origin)
    ? (origin as GuestOrigin)
    : "MANUAL";
}

function serializeAdminGuest(record: Guest): AdminGuest {
  return {
    id: record.id,
    name: record.name,
    companionName: record.companionName,
    companionConfirmed: record.companionConfirmed,
    status: isGuestStatus(record.status) ? record.status : "PENDING",
    origin: normalizeOrigin(record.origin),
    publicNote: record.publicNote,
    internalNotes: record.internalNotes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    confirmedAt: record.confirmedAt ? record.confirmedAt.toISOString() : null,
  };
}

export async function listAdminGuests(): Promise<AdminGuest[]> {
  const records = await prisma.guest.findMany({
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
  });

  return records.map(serializeAdminGuest);
}

export async function createAdminGuest(
  input: AdminGuestInput,
): Promise<AdminGuest> {
  const name = cleanDisplayName(input.name);
  const normalizedName = normalizeName(name);

  const existing = await prisma.guest.findUnique({
    where: { normalizedName },
    select: { id: true },
  });

  if (existing) throw new DuplicateGuestError();

  try {
    const record = await prisma.guest.create({
      data: {
        name,
        normalizedName,
        companionName: input.companionName,
        companionConfirmed: input.companionName
          ? input.companionConfirmed
          : false,
        status: input.status,
        origin: "MANUAL",
        publicNote: input.publicNote,
        internalNotes: input.internalNotes,
        confirmedAt: input.status === "CONFIRMED" ? new Date() : null,
      },
    });

    return serializeAdminGuest(record);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new DuplicateGuestError();
    throw error;
  }
}

export async function updateAdminGuest(
  id: string,
  input: AdminGuestInput,
): Promise<AdminGuest> {
  const existing = await prisma.guest.findUnique({ where: { id } });
  if (!existing) throw new GuestNotFoundError();

  const name = cleanDisplayName(input.name);
  const normalizedName = normalizeName(name);

  if (normalizedName !== existing.normalizedName) {
    const conflict = await prisma.guest.findFirst({
      where: { normalizedName, NOT: { id } },
      select: { id: true },
    });
    if (conflict) throw new DuplicateGuestError();
  }

  const confirmedAt =
    input.status === "CONFIRMED"
      ? (existing.confirmedAt ?? new Date())
      : null;

  try {
    const record = await prisma.guest.update({
      where: { id },
      data: {
        name,
        normalizedName,
        companionName: input.companionName,
        companionConfirmed: input.companionName
          ? input.companionConfirmed
          : false,
        status: input.status,
        publicNote: input.publicNote,
        internalNotes: input.internalNotes,
        confirmedAt,
      },
    });

    return serializeAdminGuest(record);
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new DuplicateGuestError();
    throw error;
  }
}

export async function deleteAdminGuest(id: string): Promise<void> {
  try {
    await prisma.guest.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new GuestNotFoundError();
    }
    throw error;
  }
}
