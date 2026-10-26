import {
  ArrowUpRight,
  CalendarIcon,
  ClockIcon,
  FlameIcon,
  GlassIcon,
  MapPinIcon,
  SparkleIcon,
  WavesIcon,
} from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionIntro } from "@/components/section-intro";
import { EVENT, MAPS_URL } from "@/config/event";

const bringIcons = [FlameIcon, GlassIcon, WavesIcon];

export function AboutSection() {
  return (
    <section
      id="evento"
      className="relative scroll-mt-6 overflow-hidden py-24 sm:py-32"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-emerald-glow/[0.045] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-24 font-display text-[18rem] leading-none text-outline opacity-40 sm:text-[26rem]"
        aria-hidden="true"
      >
        07
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal>
          <SectionIntro
            index="01"
            label="O encontro"
            title="Piscina, churrasco e uma noite inteira pela frente."
            description="Um sábado sem pressa, começando ao pôr do sol. Traga a carne, a bebida e a roupa de banho — o resto a gente resolve na beira da piscina."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Reveal delay={0.05}>
            <article className="glass group h-full rounded-[1.75rem] p-7 transition-colors duration-500 hover:border-emerald-glow/25 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-emerald-glow/85">
                  <CalendarIcon className="size-5" />
                </span>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mist/50">
                  01 / Data
                </span>
              </div>
              <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-mist">
                Data
              </p>
              <p className="mt-2 font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-none text-champagne">
                07 <span className="italic text-gradient-emerald">nov</span>
              </p>
              <p className="mt-4 text-sm text-mist">
                {EVENT.dateLabel}
                <br />
                Sábado
              </p>
            </article>
          </Reveal>

          <Reveal delay={0.12}>
            <article className="glass group h-full rounded-[1.75rem] p-7 transition-colors duration-500 hover:border-emerald-glow/25 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-emerald-glow/85">
                  <ClockIcon className="size-5" />
                </span>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mist/50">
                  02 / Horário
                </span>
              </div>
              <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-mist">
                Horário
              </p>
              <p className="mt-2 font-display text-[clamp(2.2rem,5vw,3.2rem)] leading-none text-champagne">
                17<span className="text-[0.55em] italic text-gradient-emerald">h</span>
              </p>
              <p className="mt-4 text-sm text-mist">
                {EVENT.timeLabel}
                <br />
                Até o último mergulho
              </p>
            </article>
          </Reveal>

          <Reveal delay={0.19}>
            <article
              id="local"
              className="glass group flex h-full scroll-mt-10 flex-col rounded-[1.75rem] p-7 transition-colors duration-500 hover:border-emerald-glow/25 sm:p-8"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-emerald-glow/85">
                  <MapPinIcon className="size-5" />
                </span>
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-mist/50">
                  03 / Local
                </span>
              </div>
              <p className="mt-10 text-[0.6rem] uppercase tracking-[0.28em] text-mist">
                Endereço
              </p>
              <address className="mt-2 not-italic text-[0.95rem] leading-relaxed text-champagne/90">
                {EVENT.venue.street}
                <br />
                {EVENT.venue.lot}
                <br />
                {EVENT.venue.city}
                <br />
                <span className="text-mist">{EVENT.venue.postalCode}</span>
              </address>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link mt-auto inline-flex items-center gap-2 pt-6 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-emerald-glow"
              >
                Abrir no mapa
                <ArrowUpRight className="size-3.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
              </a>
            </article>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-10 border-t border-white/[0.08] pt-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="flex items-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.32em] text-mist">
              <span className="text-emerald-glow">04</span>
              <span className="h-px w-8 bg-emerald-glow/35" aria-hidden="true" />
              O que trazer
            </p>
            <h3 className="mt-6 max-w-md text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] leading-[1.02] text-champagne">
              A carne é o combinado.{" "}
              <span className="italic text-gradient-emerald">O resto é com você.</span>
            </h3>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">
              Para a noite render, cada um traz a sua parte. O anfitrião cuida do
              fogo, do gelo e da trilha sonora.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-champagne transition-colors hover:border-emerald-glow/40 hover:text-emerald-glow"
            >
              <MapPinIcon className="size-4" />
              Traçar rota até a festa
              <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="mt-4 text-xs leading-relaxed text-mist/55">
              {EVENT.venue.reference} Abra o endereço no Google Maps para conferir
              a rota.
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <ul className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {EVENT.whatToBring.map((text, index) => {
                  const Icon = bringIcons[index] ?? SparkleIcon;

                  return (
                    <li
                      key={text}
                      className="group flex items-center gap-5 py-6 sm:gap-7 sm:py-7"
                    >
                      <span className="font-mono text-[0.6rem] text-emerald-glow/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-champagne/80 transition-colors group-hover:border-emerald-glow/30 group-hover:text-emerald-glow">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-pretty text-[0.95rem] leading-relaxed text-champagne/85 sm:text-base">
                        {text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-mist/50">
                <span className="size-1 rounded-full bg-emerald-glow/60" />
                Combine os detalhes com o anfitrião
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
