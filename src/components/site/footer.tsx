import { ArrowUpRight, MapPinIcon } from "@/components/icons";
import { EVENT } from "@/config/event";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07]">
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[52rem] -translate-x-1/2 rounded-full bg-emerald-glow/[0.06] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-10 bottom-0 font-display text-[16rem] leading-none text-outline opacity-30 sm:text-[22rem]"
        aria-hidden="true"
      >
        11
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.32em] text-mist">
              <span className="h-px w-8 bg-emerald-glow/40" aria-hidden="true" />
              Nos vemos na piscina
            </p>
            <p className="mt-5 font-display text-[clamp(3.4rem,9vw,7.5rem)] italic leading-[0.85] text-gradient-emerald">
              Até lá.
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
              {EVENT.hostName} · {EVENT.dateShort} · {EVENT.timeLabel.toLowerCase()}
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:gap-12">
            <div>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-mist/50">
                Quando
              </p>
              <p className="mt-2 text-sm leading-relaxed text-champagne/85">
                Sábado, {EVENT.dateLabel}
                <br />
                {EVENT.timeLabel}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-mist/50">
                Onde
              </p>
              <address className="mt-2 flex gap-2 not-italic text-sm leading-relaxed text-champagne/85">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-emerald-glow/60" />
                <span>
                  {EVENT.venue.street}
                  <br />
                  {EVENT.venue.lot}
                  <br />
                  {EVENT.venue.city}
                </span>
              </address>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full border border-white/12 font-display text-sm text-champagne">
              {EVENT.monogram}
            </span>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-mist/55">
              Aniversário de {EVENT.hostName} · {EVENT.year}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="#confirmar"
              className="group inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-emerald-glow transition-opacity hover:opacity-75"
            >
              Confirmar presença
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#inicio"
              className="text-[0.58rem] uppercase tracking-[0.2em] text-mist/55 transition-colors hover:text-champagne"
            >
              Topo ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
