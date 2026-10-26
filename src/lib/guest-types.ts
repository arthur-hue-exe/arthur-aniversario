import type { GuestOrigin, GuestStatus } from "@/lib/guest-status";

export type PublicGuestStatus = "CONFIRMED" | "PENDING";

export type PublicGuest = {
  id: string;
  name: string;
  companionName: string | null;
  companionConfirmed: boolean;
  status: PublicGuestStatus;
  publicNote: string | null;
};

export type PublicStats = {
  confirmedGuests: number;
  confirmedCompanions: number;
  totalConfirmed: number;
  pendingGuests: number;
};

export type PublicRsvpPayload = {
  guests: PublicGuest[];
  stats: PublicStats;
  updatedAt: string | null;
};

export type AdminGuest = {
  id: string;
  name: string;
  companionName: string | null;
  companionConfirmed: boolean;
  status: GuestStatus;
  origin: GuestOrigin;
  publicNote: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    retryAfterSeconds?: number;
  };
};
