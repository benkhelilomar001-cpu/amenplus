import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SPACE_TYPES, type Locale } from "@/lib/constants";
import { getProjects } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { ProjectCard } from "@/components/catalog/Cards";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return pageMetadata({ locale, path: "/realisations", title: t("title"), description: t("metaDescription") });
}

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale });
  const projects = await getProjects(locale);
  const space = typeof sp.espace === "string" ? sp.espace : "";
  const spaces = SPACE_TYPES.filter((s) => projects.some((p) => p.spaceType === s));
  const list = space ? projects.filter((p) => p.spaceType === space) : projects;
  const base = lp(locale, "/realisations");

  return (
    <>
      <PageHeader title={t("projects.title")} intro={t("projects.intro")} />
      <section className="container-page py-14">
        {spaces.length > 1 && (
          <nav aria-label={t("projects.filterLabel")} className="mb-10">
            <ul className="flex flex-wrap gap-2">
              {[{ value: "", label: t("projects.all") }, ...spaces.map((s) => ({ value: s, label: t(`space.${s}`) }))].map((f) => {
                const active = f.value === space;
                return (
                  <li key={f.value || "all"}>
                    <Link
                      href={f.value ? `${base}?espace=${f.value}` : base}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex min-h-10 items-center border px-4 text-sm ${
                        active ? "border-charcoal bg-charcoal text-ivory" : "border-line bg-white hover:border-charcoal"
                      }`}
                    >
                      {f.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        {list.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2">
            {list.map((p) => (
              <ProjectCard key={p.id} project={p} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState title={t("projects.emptyTitle")} text={t("projects.emptyText")}>
            <Link href={lp(locale, "/devis")} className="btn btn-primary">
              {t("common.requestQuote")}
            </Link>
          </EmptyState>
        )}
      </section>
    </>
  );
}
