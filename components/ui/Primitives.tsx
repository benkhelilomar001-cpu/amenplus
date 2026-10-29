import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-line bg-ivory">
      <div className="container-page py-12 sm:py-16">
        {children}
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="animate-rise font-display text-4xl font-light tracking-tight sm:text-5xl">{title}</h1>
        {intro && <p className="animate-rise-delay mt-5 max-w-2xl text-lg leading-relaxed text-stone-ink">{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Tag className="font-display text-3xl font-light tracking-tight sm:text-4xl">{title}</Tag>
        {text && <p className="mt-3 leading-relaxed text-stone-ink">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function ArrowLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm font-medium text-wood-ink hover:text-charcoal ${className}`}
    >
      {children}
      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

export function InspirationBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute bottom-2 start-2 z-10 rounded-sm bg-charcoal/70 px-2 py-1 text-[0.68rem] font-medium tracking-wide text-ivory backdrop-blur-sm">
      {label}
    </span>
  );
}

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-3 rounded-sm border border-wood-light bg-ivory px-4 py-3 text-sm leading-relaxed text-charcoal-soft">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-wood-ink" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function EmptyState({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="wood-placeholder rounded-sm px-6 py-14 text-center">
      <h2 className="font-display text-2xl font-light">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-stone-ink">{text}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

export function Breadcrumbs({ label, items }: { label: string; items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label={label} className="mb-6 text-sm text-stone-ink">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-charcoal">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-charcoal">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is generated server-side from trusted data; "<" is escaped to prevent script injection.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
