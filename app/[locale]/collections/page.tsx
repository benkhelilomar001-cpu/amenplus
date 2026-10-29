import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Search } from "lucide-react";
import { AVAILABILITIES, USAGES, type Locale } from "@/lib/constants";
import { filterProducts, getAllProducts, getCategories } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { CategoryCard, ProductCard } from "@/components/catalog/Cards";
import { FilterForm } from "@/components/catalog/FilterForm";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  return pageMetadata({ locale, path: "/collections", title: t("title"), description: t("metaDescription") });
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale });
  const [categories, products] = await Promise.all([getCategories(locale), getAllProducts(locale)]);

  const filters = {
    q: one(sp.q)?.slice(0, 80),
    category: one(sp.category),
    availability: one(sp.availability),
    usage: one(sp.usage),
    sort: one(sp.sort),
  };
  const results = filterProducts(products, filters);
  const hasFilters = Boolean(filters.q || filters.category || filters.availability || filters.usage);

  // Only offer filters backed by real data (cahier des charges §6).
  const availabilities = AVAILABILITIES.filter((a) => a !== "BOTH" && products.some((p) => p.availability === a || p.availability === "BOTH"));
  const usages = USAGES.filter((u) => u !== "BOTH" && products.some((p) => p.usage === u || p.usage === "BOTH"));
  const action = lp(locale, "/collections");

  return (
    <>
      <PageHeader title={t("catalog.title")} intro={t("catalog.intro")} />

      {!hasFilters && (
        <section className="container-page pt-14">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <CategoryCard key={c.id} category={c} locale={locale} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-14" aria-labelledby="models-heading">
        <h2 id="models-heading" className="sr-only">
          {t("catalog.filters")}
        </h2>
        <FilterForm
          action={action}
          className="grid gap-3 border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] lg:items-end"
        >
          <div>
            <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-stone-ink">
              {t("catalog.search")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" aria-hidden="true" />
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder={t("catalog.searchPlaceholder")}
                className="field ps-9"
              />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-stone-ink">
              {t("catalog.category")}
            </label>
            <select id="category" name="category" defaultValue={filters.category ?? ""} className="field">
              <option value="">{t("catalog.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {availabilities.length > 0 && (
            <div>
              <label htmlFor="availability" className="mb-1.5 block text-xs font-medium text-stone-ink">
                {t("catalog.availability")}
              </label>
              <select id="availability" name="availability" defaultValue={filters.availability ?? ""} className="field">
                <option value="">{t("catalog.any")}</option>
                {availabilities.map((a) => (
                  <option key={a} value={a}>
                    {t(`availability.${a}`)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {usages.length > 0 && (
            <div>
              <label htmlFor="usage" className="mb-1.5 block text-xs font-medium text-stone-ink">
                {t("catalog.usage")}
              </label>
              <select id="usage" name="usage" defaultValue={filters.usage ?? ""} className="field">
                <option value="">{t("catalog.any")}</option>
                {usages.map((u) => (
                  <option key={u} value={u}>
                    {t(`usage.${u}`)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="sort" className="mb-1.5 block text-xs font-medium text-stone-ink">
              {t("catalog.sort")}
            </label>
            <select id="sort" name="sort" defaultValue={filters.sort ?? ""} className="field">
              <option value="">{t("catalog.sortDefault")}</option>
              <option value="name">{t("catalog.sortName")}</option>
              <option value="recent">{t("catalog.sortRecent")}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1 lg:flex-none">
              {t("catalog.apply")}
            </button>
          </div>
        </FilterForm>

        <div className="mb-8 mt-6 flex items-center justify-between text-sm text-stone-ink" aria-live="polite">
          <p>{t("catalog.results", { count: results.length })}</p>
          {hasFilters && (
            <Link href={action} className="underline underline-offset-4 hover:text-charcoal">
              {t("catalog.reset")}
            </Link>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("catalog.emptyTitle")} text={t("catalog.emptyText")}>
            <Link href={lp(locale, "/devis")} className="btn btn-primary">
              {t("common.requestQuote")}
            </Link>
            <Link href={action} className="btn btn-outline">
              {t("catalog.reset")}
            </Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
