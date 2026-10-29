import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { LOCALES } from "@/lib/constants";
import { lp, siteUrl } from "@/lib/paths";

export const dynamic = "force-dynamic";

const STATIC_PATHS = [
  "",
  "/collections",
  "/sur-mesure",
  "/realisations",
  "/professionnels",
  "/a-propos",
  "/contact",
  "/devis",
  "/mentions-legales",
  "/confidentialite",
  "/conditions-devis",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [categories, products, projects] = await Promise.all([
    db.category.findMany({ where: { visible: true }, select: { slug: true, updatedAt: true } }),
    db.product.findMany({ where: { visible: true, category: { visible: true } }, select: { slug: true, updatedAt: true } }),
    db.project.findMany({ where: { visible: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const entry = (path: string, lastModified?: Date): MetadataRoute.Sitemap[number] => ({
    url: `${base}${lp("fr", path)}`,
    lastModified,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${lp(l, path)}`])) },
  });

  return [
    ...STATIC_PATHS.map((p) => entry(p)),
    ...categories.map((c) => entry(`/collections/${c.slug}`, c.updatedAt)),
    ...products.map((p) => entry(`/produits/${p.slug}`, p.updatedAt)),
    ...projects.map((p) => entry(`/realisations/${p.slug}`, p.updatedAt)),
  ];
}
