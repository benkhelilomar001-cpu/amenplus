import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { getProject } from "@/lib/content";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs, InspirationBadge, Notice } from "@/components/ui/Primitives";

type Params = Promise<{ locale: Locale; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug, locale);
  if (!project) return {};
  return pageMetadata({ locale, path: `/realisations/${project.slug}`, title: project.title, description: project.summary || project.title });
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = await getProject(slug, locale);
  if (!project) notFound();
  const t = await getTranslations({ locale });
  const [cover, ...rest] = project.images;

  return (
    <article className="container-page py-10 sm:py-14">
      <Breadcrumbs
        label={t("common.breadcrumb")}
        items={[{ href: lp(locale, "/realisations"), label: t("projects.title") }, { label: project.title }]}
      />
      <header className="max-w-3xl">
        <p className="eyebrow">{t(`space.${project.spaceType}`)}</p>
        <h1 className="mt-3 font-display text-4xl font-light tracking-tight sm:text-5xl">{project.title}</h1>
        {project.summary && <p className="mt-5 text-lg leading-relaxed text-stone-ink">{project.summary}</p>}
      </header>

      {cover && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-ivory">
          <Image src={cover.url} alt={project.title} fill priority sizes="100vw" className="object-cover" />
          {cover.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4 leading-relaxed text-charcoal-soft">
          {project.description.split(/\n{2,}/).filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          {project.isDemo && <Notice>{t("projects.demoNotice")}</Notice>}
        </div>
        <aside>
          <dl className="divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-stone-ink">{t("projects.space")}</dt>
              <dd>{t(`space.${project.spaceType}`)}</dd>
            </div>
            {project.location && (
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-stone-ink">{t("projects.location")}</dt>
                <dd>{project.location}</dd>
              </div>
            )}
          </dl>
          <p className="mt-8 font-display text-lg">{t("projects.similarCta")}</p>
          <Link href={lp(locale, "/devis")} className="btn btn-primary mt-3 w-full">
            {t("common.requestQuote")}
          </Link>
        </aside>
      </div>

      {rest.length > 0 && (
        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {rest.map((img, i) => (
            <li key={img.url} className="relative aspect-[4/3] overflow-hidden bg-ivory">
              <Image src={img.url} alt={`${project.title} — ${i + 2}`} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              {img.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-14">
        <Link href={lp(locale, "/realisations")} className="text-sm underline underline-offset-4 hover:text-wood-ink">
          {t("projects.back")}
        </Link>
      </p>
    </article>
  );
}
