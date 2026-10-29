import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { getAllProducts, getProduct } from "@/lib/content";
import { lp, siteUrl } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { ProductCard } from "@/components/catalog/Cards";
import { Gallery } from "@/components/catalog/Gallery";
import { AddToQuote } from "@/components/quote/AddToQuote";
import { Breadcrumbs, JsonLd, Notice, SectionHeading } from "@/components/ui/Primitives";

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);
  if (!product) return {};
  return pageMetadata({
    locale,
    path: `/produits/${product.slug}`,
    title: `${product.name} — ${product.categoryName}`,
    description: product.summary || product.description.slice(0, 155) || product.name,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProduct(slug, locale);
  if (!product) notFound();
  const t = await getTranslations({ locale });
  const related = (await getAllProducts(locale))
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const specs = [
    { label: t("product.dimensions"), value: product.dimensions },
    { label: t("product.materials"), value: product.materials },
    { label: t("product.finishes"), value: product.finishes },
    { label: t("product.options"), value: product.options },
  ].filter((s): s is { label: string; value: string } => Boolean(s.value));

  const facts = [
    product.reference && { label: t("product.reference"), value: product.reference },
    { label: t("product.collection"), value: product.categoryName, href: lp(locale, `/collections/${product.categorySlug}`) },
    product.availability && { label: t("product.type"), value: t(`availability.${product.availability}`) },
    product.usage && { label: t("product.usage"), value: t(`usage.${product.usage}`) },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  const images = product.images.map((img, i) => ({
    ...img,
    alt: t("product.imageAlt", { name: product.name, n: i + 1 }),
  }));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("nav.collections"), item: `${siteUrl()}${lp(locale, "/collections")}` },
      {
        "@type": "ListItem",
        position: 2,
        name: product.categoryName,
        item: `${siteUrl()}${lp(locale, `/collections/${product.categorySlug}`)}`,
      },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <div className="container-page py-10 sm:py-14">
        <Breadcrumbs
          label={t("common.breadcrumb")}
          items={[
            { href: lp(locale, "/collections"), label: t("nav.collections") },
            { href: lp(locale, `/collections/${product.categorySlug}`), label: product.categoryName },
            { label: product.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <Gallery
            images={images}
            labels={{
              inspiration: t("common.inspiration"),
              gallery: t("product.gallery"),
              show: images.map((_, i) => t("product.showImage", { n: i + 1 })),
            }}
          />

          <div className="lg:pt-2">
            <p className="eyebrow">{product.categoryName}</p>
            <h1 className="mt-3 font-display text-4xl font-light leading-tight tracking-tight">{product.name}</h1>
            {product.summary && <p className="mt-4 text-lg leading-relaxed text-stone-ink">{product.summary}</p>}

            <p className="mt-6 border-s-2 border-wood ps-4 text-sm leading-relaxed text-charcoal-soft">
              {t("product.priceOnQuote")}
            </p>

            <div className="mt-8">
              <AddToQuote
                product={{ id: product.id, slug: product.slug, name: product.name, image: product.image?.url ?? null }}
                quoteHref={lp(locale, "/devis")}
                labels={{
                  add: t("product.addToQuote"),
                  added: t("product.added"),
                  goToQuote: t("product.goToQuote"),
                  quantity: t("product.quantity"),
                  decrease: t("product.decrease"),
                  increase: t("product.increase"),
                }}
              />
            </div>

            <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
              {facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-6 py-3">
                  <dt className="text-stone-ink">{f.label}</dt>
                  <dd className="text-end">
                    {f.href ? (
                      <Link href={f.href} className="underline underline-offset-4 hover:text-wood-ink">
                        {f.value}
                      </Link>
                    ) : (
                      f.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {product.description && (
              <div className="mt-8 space-y-4 leading-relaxed text-charcoal-soft">
                {product.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            <h2 className="mt-10 font-display text-xl">{t("product.details")}</h2>
            {specs.length > 0 ? (
              <dl className="mt-4 space-y-4 text-sm">
                {specs.map((s) => (
                  <div key={s.label}>
                    <dt className="font-medium">{s.label}</dt>
                    <dd className="mt-1 whitespace-pre-line text-stone-ink">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-stone-ink">{t("product.specsPending")}</p>
            )}

            {product.isDemo && (
              <div className="mt-8">
                <Notice>{t("product.demoNotice")}</Notice>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-ivory/60 py-16">
          <div className="container-page">
            <SectionHeading title={t("product.related")} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
