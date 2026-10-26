import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  createAdminGuest,
  createPublicRsvp,
  deleteAdminGuest,
  DuplicateGuestError,
  getPublicRsvpData,
  GuestNotFoundError,
  listAdminGuests,
  updateAdminGuest,
} from "@/lib/guest-service";
import { prisma } from "@/lib/prisma";
import type { AdminGuestInput } from "@/lib/validation";

const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl.includes("arthur_party_test")) {
  throw new Error(
    "Os testes de integração exigem .env.test apontando para arthur_party_test.",
  );
}

function adminInput(overrides: Partial<AdminGuestInput> = {}): AdminGuestInput {
  return {
    name: "Convidado Teste",
    companionName: null,
    companionConfirmed: false,
    status: "CONFIRMED",
    publicNote: null,
    internalNotes: null,
    ...overrides,
  };
}

beforeEach(async () => {
  await prisma.guest.deleteMany();
});

afterAll(async () => {
  await prisma.guest.deleteMany();
  await prisma.$disconnect();
});

describe("createPublicRsvp", () => {
  it("persists a confirmed guest with an unconfirmed companion", async () => {
    const guest = await createPublicRsvp({
      name: "  Ana   Souza ",
      companionName: "Maria",
    });

    expect(guest.name).toBe("Ana Souza");
    expect(guest.status).toBe("CONFIRMED");
    expect(guest.companionName).toBe("Maria");
    expect(guest.companionConfirmed).toBe(false);

    const data = await getPublicRsvpData();
    expect(data.guests).toHaveLength(1);
    expect(data.stats).toEqual({
      confirmedGuests: 1,
      confirmedCompanions: 0,
      totalConfirmed: 1,
      pendingGuests: 0,
    });
    expect(data.updatedAt).not.toBeNull();
  });

  it("blocks duplicates ignoring case and accents", async () => {
    await createPublicRsvp({ name: "Cauã Teste", companionName: null });

    await expect(
      createPublicRsvp({ name: "CAUA TESTE", companionName: null }),
    ).rejects.toBeInstanceOf(DuplicateGuestError);

    expect(await prisma.guest.count()).toBe(1);
  });
});

describe("getPublicRsvpData", () => {
  it("counts confirmed guests and companions, keeping pending guests separate", async () => {
    await createAdminGuest(
      adminInput({
        name: "Bruno",
        companionName: "Bia",
        companionConfirmed: true,
      }),
    );
    await createAdminGuest(
      adminInput({ name: "Caio", status: "PENDING", companionName: "Clara" }),
    );
    await createAdminGuest(
      adminInput({
        name: "Zakk",
        status: "PENDING",
        publicNote: "Possível convidada",
      }),
    );

    const data = await getPublicRsvpData();

    expect(data.stats).toEqual({
      confirmedGuests: 1,
      confirmedCompanions: 1,
      totalConfirmed: 2,
      pendingGuests: 2,
    });

    const zakk = data.guests.find((guest) => guest.name === "Zakk");
    expect(zakk?.status).toBe("PENDING");
    expect(zakk?.publicNote).toBe("Possível convidada");
  });

  it("does not count a companion without a name", async () => {
    await createAdminGuest(
      adminInput({ companionName: null, companionConfirmed: true }),
    );

    const data = await getPublicRsvpData();
    expect(data.stats.confirmedCompanions).toBe(0);
    expect(data.stats.totalConfirmed).toBe(1);
  });

  it("sorts confirmed guests first and then alphabetically", async () => {
    await createAdminGuest(adminInput({ name: "Zeca" }));
    await createAdminGuest(adminInput({ name: "Ana" }));
    await createAdminGuest(adminInput({ name: "Beta", status: "PENDING" }));

    const data = await getPublicRsvpData();
    expect(data.guests.map((guest) => guest.name)).toEqual([
      "Ana",
      "Zeca",
      "Beta",
    ]);
  });

  it("hides cancelled guests from the public list", async () => {
    await createAdminGuest(adminInput({ status: "CANCELLED" }));

    const data = await getPublicRsvpData();
    expect(data.guests).toHaveLength(0);
    expect(data.stats.totalConfirmed).toBe(0);
    expect(data.updatedAt).toBeNull();
  });

  it("never exposes internal fields", async () => {
    await createAdminGuest(
      adminInput({
        name: "Interno",
        internalNotes: "Telefone e observações privadas",
        publicNote: "Observação pública",
      }),
    );

    const serialized = JSON.stringify(await getPublicRsvpData());
    expect(serialized).not.toContain("internalNotes");
    expect(serialized).not.toContain("normalizedName");
    expect(serialized).not.toContain("Telefone e observações privadas");
    expect(serialized).toContain("Observação pública");
  });
});

describe("admin guest management", () => {
  it("creates manual guests with public and internal notes", async () => {
    const guest = await createAdminGuest(
      adminInput({
        name: "  Marcus  ",
        companionName: "esposa",
        publicNote: "Acompanhante a confirmar",
        internalNotes: "Falar sobre a carne",
      }),
    );

    expect(guest.name).toBe("Marcus");
    expect(guest.origin).toBe("MANUAL");
    expect(guest.internalNotes).toBe("Falar sobre a carne");
    expect(guest.confirmedAt).not.toBeNull();
  });

  it("does not confirm a companion without a name", async () => {
    const guest = await createAdminGuest(
      adminInput({ companionName: null, companionConfirmed: true }),
    );

    expect(guest.companionConfirmed).toBe(false);
  });

  it("updates name, status and confirmedAt consistently", async () => {
    const created = await createAdminGuest(
      adminInput({ name: "Pendente", status: "PENDING" }),
    );
    expect(created.confirmedAt).toBeNull();

    const confirmed = await updateAdminGuest(
      created.id,
      adminInput({ name: "Pendente", status: "CONFIRMED" }),
    );
    expect(confirmed.confirmedAt).not.toBeNull();

    const confirmedAt = confirmed.confirmedAt;

    const renamed = await updateAdminGuest(
      created.id,
      adminInput({ name: "Renomeado", status: "CONFIRMED" }),
    );
    expect(renamed.name).toBe("Renomeado");
    expect(renamed.confirmedAt).toBe(confirmedAt);

    const pendingAgain = await updateAdminGuest(
      created.id,
      adminInput({ name: "Renomeado", status: "PENDING" }),
    );
    expect(pendingAgain.confirmedAt).toBeNull();
  });

  it("rejects renaming a guest to an existing normalized name", async () => {
    await createAdminGuest(adminInput({ name: "Ana" }));
    const bruno = await createAdminGuest(adminInput({ name: "Bruno" }));

    await expect(
      updateAdminGuest(bruno.id, adminInput({ name: "Ána" })),
    ).rejects.toBeInstanceOf(DuplicateGuestError);
  });

  it("lists every guest with internal data for the organizer", async () => {
    await createAdminGuest(
      adminInput({ name: "Confirmado", internalNotes: "Nota privada" }),
    );
    await createAdminGuest(
      adminInput({ name: "Cancelado", status: "CANCELLED" }),
    );

    const guests = await listAdminGuests();

    expect(guests).toHaveLength(2);
    expect(guests.find((guest) => guest.name === "Confirmado")?.internalNotes).toBe(
      "Nota privada",
    );
    expect(guests.some((guest) => guest.status === "CANCELLED")).toBe(true);
  });

  it("removes a guest and reports missing records", async () => {
    const guest = await createAdminGuest(adminInput({ name: "Remover" }));

    await deleteAdminGuest(guest.id);
    expect(await prisma.guest.count()).toBe(0);

    await expect(deleteAdminGuest(guest.id)).rejects.toBeInstanceOf(
      GuestNotFoundError,
    );
    await expect(
      updateAdminGuest(guest.id, adminInput({ name: "Sumiu" })),
    ).rejects.toBeInstanceOf(GuestNotFoundError);
  });
});
