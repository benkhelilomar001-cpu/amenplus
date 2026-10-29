import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { getSettings, siteImage } from "@/lib/settings";
import { InspirationBadge, PageHeader, SectionHeading } from "@/components/ui/Primitives";
import { Monogram } from "@/components/brand/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/sections/Steps";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ locale, path: "/a-propos", title: t("title"), description: t("metaDescription") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const craft = siteImage(await getSettings(), "image.craft");
  const approach = [1, 2, 3, 4].map((n) => ({ n, title: t(`about.a${n}Title`), text: t(`about.a${n}Text`) }));

  return (
    <>
      <PageHeader eyebrow={t("about.values")} title={t("about.title")} intro={t("about.intro")} />

      <section className="container-page py-16">
        <SectionHeading title={t("about.approachTitle")} />
        <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <li key={a.n}>
              <Reveal delay={i * 0.08}>
                <span className="font-display text-4xl font-light text-wood" aria-hidden="true">
                  0{a.n}
                </span>
                <h3 className="mt-3 font-display text-xl">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-stone-ink">{a.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-ivory">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={craft.url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            {craft.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
          </div>
          <div>
            <h2 className="font-display text-3xl font-light">{t("about.workshopTitle")}</h2>
            <p className="mt-4 leading-relaxed text-stone-ink">{t("home.craftText")}</p>
            <div className="mt-8 flex items-center gap-4 border-t border-line pt-6 text-sm text-stone-ink">
              <Monogram tone="mono" className="h-8 w-auto opacity-40" />
              <p>{t("about.workshopText")}</p>
            </div>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} href={lp(locale, "/devis")} />
    </>
  );
}
