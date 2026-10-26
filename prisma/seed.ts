import { PrismaClient } from "@prisma/client";

import { normalizeName } from "../src/lib/names";

const prisma = new PrismaClient();

type InitialGuest = {
  id: string;
  name: string;
  companionName?: string;
  status?: "CONFIRMED" | "PENDING";
  publicNote?: string;
};

const initialGuests: InitialGuest[] = [
  { id: "seed-01-caua-takeuti", name: "Cauã Takeuti" },
  { id: "seed-02-nathan", name: "Nathan", companionName: "Gasparzinha" },
  { id: "seed-03-joalison", name: "joalison" },
  { id: "seed-04-kaio", name: "Kaio" },
  { id: "seed-05-kayo", name: "Kayo" },
  { id: "seed-06-matheus", name: "Matheus" },
  { id: "seed-07-orcino", name: "Orcino", companionName: "prima" },
  { id: "seed-08-paulo", name: "Paulo" },
  {
    id: "seed-09-zakk",
    name: "Zakk",
    status: "PENDING",
    publicNote: "Possível convidada",
  },
  { id: "seed-10-marcus", name: "Marcus", companionName: "esposa" },
];

async function main() {
  const seededAt = new Date(Date.UTC(2026, 9, 20, 15, 0, 0));

  await prisma.guest.createMany({
    data: initialGuests.map((guest, index) => {
      const createdAt = new Date(seededAt.getTime() + index * 60_000);
      const status = guest.status ?? "CONFIRMED";

      return {
        id: guest.id,
        name: guest.name,
        normalizedName: normalizeName(guest.name),
        companionName: guest.companionName ?? null,
        // A lista inicial não informa se os acompanhantes já confirmaram.
        companionConfirmed: false,
        status,
        origin: "SEED",
        publicNote: guest.publicNote ?? null,
        createdAt,
        updatedAt: createdAt,
        confirmedAt: status === "CONFIRMED" ? createdAt : null,
      };
    }),
    skipDuplicates: true,
  });

  const total = await prisma.guest.count();
  console.log(`Seed concluído. Registros na tabela guests: ${total}.`);
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
