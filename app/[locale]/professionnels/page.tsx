import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Briefcase, PencilRuler, Users } from "lucide-react";
import type { Locale } from "@/lib/constants";
import { getCategories } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { CategoryCard } from "@/components/catalog/Cards";
import { PageHeader, SectionHeading } from "@/components/ui/Primitives";

// Collections shown to professionals (by slug, see prisma/seed.ts).
const PRO_COLLECTIONS = ["bureaux-professionnels", "tables-reunion", "dressings-rangements"];

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pros" });
  return pageMetadata({ locale, path: "/professionnels", title: t("title"), description: t("metaDescription") });
}

export default async function ProsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pros" });
  const categories = (await getCategories(locale)).filter((c) => PRO_COLLECTIONS.includes(c.slug));
  const quoteHref = `${lp(locale, "/devis")}?type=pro`;
  const audiences = [
    { icon: Briefcase, title: t("who1Title"), text: t("who1Text") },
    { icon: PencilRuler, title: t("who2Title"), text: t("who2Text") },
    { icon: Users, title: t("who3Title"), text: t("who3Text") },
  ];

  return (
    <>
      <PageHeader title={t("title")} intro={t("intro")} />

      <section className="container-page py-16">
        <SectionHeading title={t("forWhoTitle")} />
        <ul className="grid gap-px border border-line bg-line md:grid-cols-3">
          {audiences.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-paper p-7">
              <Icon className="h-7 w-7 text-wood" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-5 font-display text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-ink">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-charcoal text-ivory">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-light">{t("howTitle")}</h2>
            <ol className="mt-8 space-y-5">
              {[t("how1"), t("how2"), t("how3")].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-wood-light font-display text-sm text-wood-light">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-relaxed text-ivory/85">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:text-end">
            <Link href={quoteHref} className="btn btn-light">
              {t("cta")}
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading title={t("collectionsTitle")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
