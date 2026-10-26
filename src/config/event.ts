/**
 * Fonte única da verdade para data, horário e local do evento.
 * Alterar aqui atualiza contagem regressiva, metadados, textos e links.
 */
export const EVENT = {
  hostName: "Arthur Alves",
  monogram: "AA",
  occasion: "Aniversário",
  tagline:
    "Uma noite para reunir a galera, curtir a piscina, fazer aquele churrasco e criar histórias.",
  startsAtISO: "2026-11-07T17:00:00-03:00",
  endsAtISO: "2026-11-08T00:00:00-03:00",
  timeZone: "America/Sao_Paulo",
  dateLabel: "07 de novembro de 2026",
  dateShort: "07.11.2026",
  dateHeroLine: "07 DE NOVEMBRO",
  dateCard: "07 de novembro",
  year: "2026",
  timeLabel: "A partir das 17h",
  timeHeroLine: "A PARTIR DAS 17H",
  venue: {
    street: "Rua 1, Jardim Imperial",
    lot: "Quadra 09, Lote 41",
    city: "Aparecida de Goiânia — GO",
    postalCode: "CEP 74914-662",
    reference: "Referência: SOS Micros.",
    full: "Rua 1, Jardim Imperial, Quadra 09, Lote 41, Aparecida de Goiânia - GO, 74914-662",
  },
  rsvp: {
    title: "VOCÊ VEM?",
    subtitle: "Confirme sua presença e coloque seu nome na lista da festa.",
    success:
      "Presença confirmada! Seu nome já está na lista. Agora é só preparar a carne e separar a bebida.",
  },
  whatToBring: [
    "1 kg de carne por pessoa ou conforme combinado com o anfitrião.",
    "Bebida de sua preferência.",
    "Roupa de banho para quem quiser entrar na piscina.",
  ],
} as const;

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  EVENT.venue.full,
)}`;

export const EVENT_START_MS = Date.parse(EVENT.startsAtISO);
export const EVENT_END_MS = Date.parse(EVENT.endsAtISO);
