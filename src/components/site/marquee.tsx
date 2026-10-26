const ITEMS = [
  "Piscina",
  "Churrasco",
  "Boa companhia",
  "07.11.2026",
  "Goiânia",
];

export function Marquee() {
  return (
    <div
      className="marquee relative overflow-hidden border-y border-white/[0.07] bg-ink/60 py-4"
      aria-hidden="true"
    >
      <div className="marquee-track items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {ITEMS.map((item) => (
              <div key={`${copy}-${item}`} className="flex items-center">
                <span className="px-7 font-display text-xl italic text-champagne/55 sm:text-2xl">
                  {item}
                </span>
                <span className="size-1 rounded-full bg-emerald-glow/50" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
