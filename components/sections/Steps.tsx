import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { Reveal } from "@/components/ui/Reveal";

/** The 4-step made-to-measure process, shared by the home and "Sur mesure" pages. */
export async function Steps({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  const t = await getTranslations({ locale, namespace: "steps" });
  const steps = [1, 2, 3, 4].map((n) => ({ n, title: t(`s${n}Title`), text: t(`s${n}Text`) }));
  return (
    <ol className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <li key={s.n} className={dark ? "bg-charcoal-soft" : "bg-paper"}>
          <Reveal delay={i * 0.08} className="h-full p-6 sm:p-7">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm ${
                dark ? "border-wood-light text-wood-light" : "border-wood text-wood-ink"
              }`}
              aria-hidden="true"
            >
              {s.n}
            </span>
            <h3 className="mt-5 font-display text-lg">{s.title}</h3>
            <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-ivory/75" : "text-stone-ink"}`}>{s.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export async function CtaBand({ locale, href }: { locale: Locale; href: string }) {
  const t = await getTranslations({ locale });
  return (
    <section className="bg-wood-ink text-white">
      <div className="container-page flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-light">{t("home.ctaTitle")}</h2>
          <p className="mt-3 leading-relaxed text-white/85">{t("home.ctaText")}</p>
        </div>
        <Link href={href} className="btn btn-light shrink-0">
          {t("common.requestQuote")}
        </Link>
      </div>
    </section>
  );
}
