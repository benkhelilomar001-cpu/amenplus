import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import type { CategoryView, ProductCardView, ProjectView } from "@/lib/content";
import type { Locale } from "@/lib/constants";
import { lp } from "@/lib/paths";
import { InspirationBadge } from "@/components/ui/Primitives";
import { Monogram } from "@/components/brand/Logo";

const CARD_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export async function ProductCard({ product, locale }: { product: ProductCardView; locale: Locale }) {
  const t = await getTranslations({ locale });
  const href = lp(locale, `/produits/${product.slug}`);
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory">
        {product.image ? (
          <>
            <Image
              src={product.image.url}
              alt=""
              fill
              sizes={CARD_SIZES}
              className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.03]"
            />
            {product.image.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
          </>
        ) : (
          <div className="wood-placeholder flex h-full items-center justify-center">
            <Monogram tone="mono" className="h-10 opacity-20" />
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="text-xs tracking-wide text-stone-ink">{product.categoryName}</p>
        <h3 className="mt-1 font-display text-lg leading-snug">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.availability && (
          <p className="mt-1.5 text-sm text-wood-ink">{t(`availability.${product.availability}`)}</p>
        )}
      </div>
    </article>
  );
}

export async function CategoryCard({
  category,
  locale,
  priority = false,
}: {
  category: CategoryView;
  locale: Locale;
  priority?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "common" });
  return (
    <Link
      href={lp(locale, `/collections/${category.slug}`)}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-ivory sm:aspect-[4/3]"
    >
      {category.image ? (
        <Image
          src={category.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="wood-placeholder absolute inset-0 flex items-center justify-center">
          <Monogram tone="mono" className="h-14 opacity-15" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/10 to-transparent" />
      <div className="relative flex items-end justify-between gap-3 p-5 text-ivory">
        <div>
          <h3 className="font-display text-xl leading-snug">{category.name}</h3>
          <p className="mt-1 text-sm text-ivory/80">{t("models", { count: category.productCount })}</p>
        </div>
        <ArrowUpRight
          className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

export async function ProjectCard({ project, locale }: { project: ProjectView; locale: Locale }) {
  const t = await getTranslations({ locale });
  const image = project.images[0];
  return (
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-ivory">
        {image ? (
          <>
            <Image
              src={image.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-brand)] group-hover:scale-[1.03]"
            />
            {image.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
          </>
        ) : (
          <div className="wood-placeholder h-full" />
        )}
        {project.isDemo && (
          <span className="absolute end-2 top-2 rounded-sm bg-ivory px-2 py-1 text-[0.68rem] font-medium text-charcoal">
            {t("common.demo")}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs tracking-wide text-stone-ink">{t(`space.${project.spaceType}`)}</p>
      <h3 className="mt-1 font-display text-xl">
        <Link href={lp(locale, `/realisations/${project.slug}`)} className="after:absolute after:inset-0">
          {project.title}
        </Link>
      </h3>
      {project.summary && <p className="mt-2 text-sm leading-relaxed text-stone-ink">{project.summary}</p>}
    </article>
  );
}
