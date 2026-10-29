import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { Availability, Locale, SpaceType, Usage } from "./constants";

// Read-side helpers for the public site. Every query only returns visible content,
// and each translation falls back to French when a language is missing.

function pick<T extends { locale: string }>(rows: T[], locale: Locale): T | undefined {
  return rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === "fr") ?? rows[0];
}

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
  intro: string;
  image: string | null;
  productCount: number;
};

export type ImageView = { url: string; isInspiration: boolean };

export type ProductCardView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  categorySlug: string;
  categoryName: string;
  availability: Availability | null;
  usage: Usage | null;
  isDemo: boolean;
  featured: boolean;
  image: ImageView | null;
  createdAt: Date;
  order: number;
};

export type ProductView = ProductCardView & {
  reference: string | null;
  description: string;
  dimensions: string | null;
  materials: string | null;
  finishes: string | null;
  options: string | null;
  images: ImageView[];
};

export type ProjectView = {
  id: string;
  slug: string;
  spaceType: SpaceType;
  title: string;
  summary: string;
  description: string;
  location: string | null;
  isDemo: boolean;
  images: ImageView[];
};

export const getCategories = cache(async (locale: Locale): Promise<CategoryView[]> => {
  const rows = await db.category.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: {
      translations: true,
      products: {
        where: { visible: true },
        select: { images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } },
        orderBy: { order: "asc" },
      },
    },
  });
  return rows.map((c) => {
    const t = pick(c.translations, locale);
    return {
      id: c.id,
      slug: c.slug,
      name: t?.name ?? c.slug,
      intro: t?.intro ?? "",
      image: c.image ?? c.products.find((p) => p.images[0])?.images[0]?.url ?? null,
      productCount: c.products.length,
    };
  });
});

const productInclude = {
  translations: true,
  images: { orderBy: { order: "asc" } },
  category: { include: { translations: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProductView(p: ProductRow, locale: Locale): ProductView {
  const t = pick(p.translations, locale);
  const ct = pick(p.category.translations, locale);
  const images = p.images.map((i) => ({ url: i.url, isInspiration: i.isInspiration }));
  return {
    id: p.id,
    slug: p.slug,
    name: t?.name ?? p.slug,
    summary: t?.summary ?? "",
    description: t?.description ?? "",
    dimensions: t?.dimensions?.trim() || null,
    materials: t?.materials?.trim() || null,
    finishes: t?.finishes?.trim() || null,
    options: t?.options?.trim() || null,
    reference: p.reference?.trim() || null,
    categorySlug: p.category.slug,
    categoryName: ct?.name ?? p.category.slug,
    availability: (p.availability as Availability | null) ?? null,
    usage: (p.usage as Usage | null) ?? null,
    isDemo: p.isDemo,
    featured: p.featured,
    image: images[0] ?? null,
    images,
    createdAt: p.createdAt,
    order: p.order,
  };
}

export const getAllProducts = cache(async (locale: Locale): Promise<ProductView[]> => {
  const rows = await db.product.findMany({
    where: { visible: true, category: { visible: true } },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: productInclude,
  });
  return rows.map((p) => toProductView(p, locale));
});

export const getProduct = cache(async (slug: string, locale: Locale): Promise<ProductView | null> => {
  const p = await db.product.findFirst({
    where: { slug, visible: true, category: { visible: true } },
    include: productInclude,
  });
  return p ? toProductView(p, locale) : null;
});

/** Lowercase, accent-free text for search ("Bureau" matches "bureau", "chêne" matches "chene"). */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ًͯ-ٟ]/g, "")
    .toLowerCase()
    .trim();
}

export type CatalogFilters = {
  q?: string;
  category?: string;
  availability?: string;
  usage?: string;
  sort?: string;
};

export function filterProducts(products: ProductView[], f: CatalogFilters): ProductView[] {
  const q = f.q ? normalize(f.q) : "";
  let list = products.filter((p) => {
    if (f.category && p.categorySlug !== f.category) return false;
    if (f.availability && p.availability !== f.availability && p.availability !== "BOTH") return false;
    if (f.usage && p.usage !== f.usage && p.usage !== "BOTH") return false;
    if (q) {
      const haystack = normalize([p.name, p.summary, p.description, p.categoryName, p.reference ?? ""].join(" "));
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false;
    }
    return true;
  });
  if (f.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (f.sort === "recent") list = [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return list;
}

export const getProjects = cache(async (locale: Locale): Promise<ProjectView[]> => {
  const rows = await db.project.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { translations: true, images: { orderBy: { order: "asc" } } },
  });
  return rows.map((p) => {
    const t = pick(p.translations, locale);
    return {
      id: p.id,
      slug: p.slug,
      spaceType: p.spaceType as SpaceType,
      title: t?.title ?? p.slug,
      summary: t?.summary ?? "",
      description: t?.description ?? "",
      location: t?.location?.trim() || null,
      isDemo: p.isDemo,
      images: p.images.map((i) => ({ url: i.url, isInspiration: i.isInspiration })),
    };
  });
});

export async function getProject(slug: string, locale: Locale): Promise<ProjectView | null> {
  const all = await getProjects(locale);
  return all.find((p) => p.slug === slug) ?? null;
}
