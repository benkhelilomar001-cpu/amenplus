// AmenPlus monogram: a two-tone geometric "A" (wood + charcoal) with an offset crossbar,
// redrawn as clean vectors from the identity board. Concept version, to be validated.

type Tone = "color" | "light" | "mono";

const COLORS: Record<Tone, { wood: string; dark: string; text: string }> = {
  color: { wood: "#A47D58", dark: "#292A27", text: "#292A27" },
  light: { wood: "#C9A27E", dark: "#F3EEE5", text: "#F3EEE5" },
  mono: { wood: "#292A27", dark: "#292A27", text: "#292A27" },
};

export function Monogram({ tone = "color", className }: { tone?: Tone; className?: string }) {
  const c = COLORS[tone];
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true" focusable="false">
      <polygon points="4,98 30,98 60,46.6 60,2" fill={c.wood} />
      <polygon points="60,2 116,98 90,98 60,46.6" fill={c.dark} />
      <polygon points="33,60 78,60 72,70 27,70" fill={c.wood} />
      <polygon points="52,78 101,78 107,88 46,88" fill={c.dark} />
    </svg>
  );
}

export function Logo({
  tone = "color",
  className = "",
  compact = false,
}: {
  tone?: Tone;
  className?: string;
  compact?: boolean;
}) {
  const c = COLORS[tone];
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} dir="ltr">
      <Monogram tone={tone} className="h-8 w-auto shrink-0" />
      {!compact && (
        <>
          <span className="h-7 w-px" style={{ background: c.text, opacity: 0.35 }} aria-hidden="true" />
          <span
            aria-hidden="true"
            className="font-[family-name:var(--font-jost)] text-[1.05rem] font-normal tracking-[0.32em]"
            style={{ color: c.text }}
          >
            AMENPLUS
          </span>
        </>
      )}
      <span className="sr-only">AmenPlus</span>
    </span>
  );
}
