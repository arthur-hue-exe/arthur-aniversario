export const GUEST_STATUSES = ["CONFIRMED", "PENDING", "CANCELLED"] as const;

export type GuestStatus = (typeof GUEST_STATUSES)[number];

export const GUEST_STATUS_LABEL: Record<GuestStatus, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "A confirmar",
  CANCELLED: "Cancelado",
};

export const GUEST_ORIGINS = ["RSVP", "SEED", "MANUAL"] as const;
export type GuestOrigin = (typeof GUEST_ORIGINS)[number];

export function isGuestStatus(value: string): value is GuestStatus {
  return (GUEST_STATUSES as readonly string[]).includes(value);
}
