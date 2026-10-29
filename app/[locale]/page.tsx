import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Box, Building2, MapPin, Ruler } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@/lib/constants";
import { getAllProducts, getCategories, getProjects } from "@/lib/content";
import { lp, siteUrl } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { getSettings, localized, siteImage } from "@/lib/settings";
import { CategoryCard, ProductCard, ProjectCard } from "@/components/catalog/Cards";
import { ArrowLink, InspirationBadge, JsonLd, SectionHeading } from "@/components/ui/Primitives";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand, Steps } from "@/components/sections/Steps";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { ...pageMetadata({ locale, path: "", title: t("homeTitle"), description: t("homeDescription") }), title: { absolute: t("homeTitle") } };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const [categories, products, projects, settings] = await Promise.all([
    getCategories(locale),
    getAllProducts(locale),
    getProjects(locale),
    getSettings(),
  ]);
  const featured = (products.some((p) => p.featured) ? products.filter((p) => p.featured) : products).slice(0, 4);
  const quoteHref = lp(locale, "/devis");
  // Demo photos (badged "inspiration") until AmenPlus uploads its own in /admin/parametres.
  const hero = siteImage(settings, "image.hero");
  const craft = siteImage(settings, "image.craft");
  const pros = siteImage(settings, "image.pros");

  const pillars = [
    { icon: Box, title: t("home.pillars.standardTitle"), text: t("home.pillars.standardText") },
    { icon: Ruler, title: t("home.pillars.customTitle"), text: t("home.pillars.customText") },
    { icon: Building2, title: t("home.pillars.audienceTitle"), text: t("home.pillars.audienceText") },
    { icon: MapPin, title: t("home.pillars.placeTitle"), text: t("home.pillars.placeText") },
  ];

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AmenPlus",
    url: `${siteUrl()}/${locale}`,
    logo: `${siteUrl()}/brand/amenplus-monogram.svg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "La Soukra",
      addressCountry: "TN",
      ...(localized(settings, "address", "fr") ? { streetAddress: localized(settings, "address", "fr") } : {}),
    },
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
  };

  return (
    <>
      <JsonLd data={organization} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-charcoal text-ivory">
        <Image
          src={hero.url}
          alt={t("home.heroAlt")}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="-z-10 object-cover object-[50%_60%] opacity-80"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-charcoal/85 via-charcoal/50 to-charcoal/5 rtl:bg-gradient-to-l" />
        <div className="container-page flex min-h-[78svh] flex-col justify-center py-20 sm:min-h-[82svh]">
          <div className="max-w-2xl">
            <p className="eyebrow animate-rise !text-wood-light">{t("home.eyebrow")}</p>
            <h1 className="animate-rise mt-5 font-display text-[2.6rem] font-light leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              {t("home.title")}
            </h1>
            <p className="animate-rise-delay mt-6 max-w-xl text-lg leading-relaxed text-ivory/85">{t("home.text")}</p>
            <div className="animate-rise-delay mt-9 flex flex-wrap gap-3">
              <Link href={lp(locale, "/collections")} className="btn btn-light">
                {t("common.discoverCollections")}
              </Link>
              <Link href={quoteHref} className="btn btn-outline text-ivory hover:!border-ivory hover:!bg-ivory hover:!text-charcoal">
                {t("common.requestQuote")}
              </Link>
            </div>
          </div>
        </div>
        {hero.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
      </section>

      {/* Pillars */}
      <section className="border-b border-line bg-ivory">
        <ul className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <Icon className="mt-1 h-6 w-6 shrink-0 text-wood" strokeWidth={1.25} aria-hidden="true" />
              <div>
                <h2 className="font-display text-base font-medium">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-stone-ink">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Collections */}
      <section className="container-page py-20">
        <SectionHeading
          title={t("home.collectionsTitle")}
          text={t("home.collectionsText")}
          action={<ArrowLink href={lp(locale, "/collections")}>{t("common.seeAll")}</ArrowLink>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.08}>
              <CategoryCard category={c} locale={locale} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured models */}
      {featured.length > 0 && (
        <section className="border-y border-line bg-ivory/60 py-20">
          <div className="container-page">
            <SectionHeading
              title={t("home.featuredTitle")}
              text={t("home.featuredText")}
              action={<ArrowLink href={lp(locale, "/collections")}>{t("common.seeAll")}</ArrowLink>}
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Made to measure */}
      <section className="container-page py-20">
        <SectionHeading
          title={t("home.customTitle")}
          text={t("home.customText")}
          action={<ArrowLink href={lp(locale, "/sur-mesure")}>{t("common.learnMore")}</ArrowLink>}
        />
        <Steps locale={locale} />
      </section>

      {/* Craft */}
      <section className="bg-ivory">
        <div className="container-page grid items-center gap-10 py-20 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={craft.url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            {craft.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
          </div>
          <Reveal>
            <p className="eyebrow">{t("home.craftEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-light tracking-tight sm:text-4xl">{t("home.craftTitle")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-ink">{t("home.craftText")}</p>
            <ArrowLink href={lp(locale, "/a-propos")} className="mt-7">
              {t("common.learnMore")}
            </ArrowLink>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading
            title={t("home.projectsTitle")}
            text={t("home.projectsText")}
            action={<ArrowLink href={lp(locale, "/realisations")}>{t("common.seeAll")}</ArrowLink>}
          />
          <div className="grid gap-10 md:grid-cols-2">
            {projects.slice(0, 2).map((p) => (
              <ProjectCard key={p.id} project={p} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Professionals */}
      <section className="bg-charcoal text-ivory">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow !text-wood-light">{t("home.prosEyebrow")}</p>
            <h2 className="mt-3 font-display text-3xl font-light tracking-tight sm:text-4xl">{t("home.prosTitle")}</h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ivory/80">{t("home.prosText")}</p>
            <Link href={lp(locale, "/professionnels")} className="btn btn-light mt-8">
              {t("home.prosCta")}
            </Link>
          </Reveal>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={pros.url} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            {pros.isInspiration && <InspirationBadge label={t("common.inspiration")} />}
          </div>
        </div>
      </section>

      <CtaBand locale={locale} href={quoteHref} />
    </>
  );
}
