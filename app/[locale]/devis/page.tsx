import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/constants";
import { getAllProducts, getCategories } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { getQuoteLabels } from "@/lib/quote-labels";
import { governorateOptions } from "@/lib/tunisia";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { PageHeader } from "@/components/ui/Primitives";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quote" });
  return pageMetadata({ locale, path: "/devis", title: t("title"), description: t("metaDescription") });
}

export default async function QuotePage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale });
  const [products, categories, labels] = await Promise.all([getAllProducts(locale), getCategories(locale), getQuoteLabels(locale)]);

  // Names are looked up here so the cart always shows the current language and drops hidden products.
  const productMap = Object.fromEntries(products.map((p) => [p.id, { name: p.name, slug: p.slug, image: p.image?.url ?? null }]));
  const requestedCategory = typeof sp.categorie === "string" ? sp.categorie : undefined;

  return (
    <>
      <PageHeader title={t("quote.title")} intro={t("quote.intro")} />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <QuoteForm
          mode="QUOTE"
          locale={locale}
          labels={labels}
          products={productMap}
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          regions={governorateOptions(locale)}
          initial={{
            customerType: sp.type === "pro" ? "PROFESSIONAL" : "INDIVIDUAL",
            categorySlug: categories.some((c) => c.slug === requestedCategory) ? requestedCategory : undefined,
          }}
          links={{ privacy: lp(locale, "/confidentialite"), collections: lp(locale, "/collections"), productBase: lp(locale, "/produits") }}
        />
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-ivory p-6">
            <h2 className="font-display text-lg">{t("custom.stepsTitle")}</h2>
            <ol className="mt-4 space-y-4 text-sm">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-wood text-xs text-wood-ink">
                    {n}
                  </span>
                  <span>
                    <span className="block font-medium">{t(`steps.s${n}Title`)}</span>
                    <span className="text-stone-ink">{t(`steps.s${n}Text`)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <p className="flex gap-3 text-sm leading-relaxed text-stone-ink">
            <ShieldCheck className="h-5 w-5 shrink-0 text-wood" strokeWidth={1.5} aria-hidden="true" />
            {t("quote.noPayment")}
          </p>
        </aside>
      </div>
    </>
  );
}
