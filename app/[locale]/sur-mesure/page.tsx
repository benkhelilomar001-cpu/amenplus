import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Check } from "lucide-react";
import type { Locale } from "@/lib/constants";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { PageHeader, SectionHeading } from "@/components/ui/Primitives";
import { CtaBand, Steps } from "@/components/sections/Steps";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "custom" });
  return pageMetadata({ locale, path: "/sur-mesure", title: t("title"), description: t("metaDescription") });
}

export default async function CustomPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const prepare = [1, 2, 3, 4, 5].map((n) => t(`custom.prepare${n}`));
  const examples = [1, 2, 3, 4].map((n) => t(`custom.ex${n}`));

  return (
    <>
      <PageHeader title={t("custom.title")} intro={t("custom.intro")} />

      <section className="container-page py-16">
        <SectionHeading title={t("custom.stepsTitle")} />
        <Steps locale={locale} />
      </section>

      <section className="border-t border-line bg-ivory">
        <div className="container-page grid gap-12 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-light">{t("custom.prepareTitle")}</h2>
            <ul className="mt-6 space-y-3">
              {prepare.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-wood-ink" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={lp(locale, "/devis")} className="btn btn-primary mt-8">
              {t("common.requestQuote")}
            </Link>
          </div>
          <div>
            <h2 className="font-display text-2xl font-light">{t("custom.examplesTitle")}</h2>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {examples.map((item) => (
                <li key={item} className="py-3.5">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-stone-ink">{t("custom.examplesNote")}</p>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} href={lp(locale, "/devis")} />
    </>
  );
}
