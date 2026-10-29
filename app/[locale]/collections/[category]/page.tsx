import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { getAllProducts, getCategories } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { CategoryCard, ProductCard } from "@/components/catalog/Cards";
import { Breadcrumbs, EmptyState, PageHeader, SectionHeading } from "@/components/ui/Primitives";

type Params = Promise<{ locale: Locale; category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, category } = await params;
  const cat = (await getCategories(locale)).find((c) => c.slug === category);
  if (!cat) return {};
  return pageMetadata({
    locale,
    path: `/collections/${cat.slug}`,
    title: cat.name,
    description: cat.intro || cat.name,
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { locale, category } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const [categories, products] = await Promise.all([getCategories(locale), getAllProducts(locale)]);
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();
  const items = products.filter((p) => p.categorySlug === cat.slug);
  const others = categories.filter((c) => c.slug !== cat.slug).slice(0, 3);

  return (
    <>
      <PageHeader title={cat.name} intro={cat.intro}>
        <Breadcrumbs
          label={t("common.breadcrumb")}
          items={[
            { href: lp(locale), label: t("nav.home") },
            { href: lp(locale, "/collections"), label: t("nav.collections") },
            { label: cat.name },
          ]}
        />
      </PageHeader>

      <section className="container-page py-14">
        {items.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-stone-ink">{t("catalog.results", { count: items.length })}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState title={t("catalog.categoryEmptyTitle")} text={t("catalog.categoryEmptyText")}>
            <Link href={`${lp(locale, "/devis")}?categorie=${cat.slug}`} className="btn btn-primary">
              {t("common.requestQuote")}
            </Link>
          </EmptyState>
        )}
      </section>

      {others.length > 0 && (
        <section className="container-page pb-20">
          <SectionHeading title={t("catalog.otherCollections")} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c) => (
              <CategoryCard key={c.id} category={c} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
