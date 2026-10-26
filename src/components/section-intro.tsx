type SectionIntroProps = {
  index: string;
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
};

export function SectionIntro({
  index,
  label,
  title,
  description,
  align = "left",
  titleClassName = "",
}: SectionIntroProps) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto flex max-w-2xl flex-col items-center text-center"
          : "flex flex-col items-start"
      }
    >
      <p className="flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.32em] text-mist">
        <span className="text-emerald-glow">{index}</span>
        <span className="h-px w-8 bg-emerald-glow/35" aria-hidden="true" />
        {label}
      </p>
      <h2
        className={`mt-6 max-w-3xl text-balance font-display text-[clamp(2.6rem,5.6vw,4.6rem)] font-normal leading-[0.98] tracking-[-0.02em] text-champagne ${titleClassName}`}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-xl text-pretty text-[0.98rem] leading-relaxed text-mist">
          {description}
        </p>
      ) : null}
    </div>
  );
}
