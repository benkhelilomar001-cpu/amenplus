import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/constants";
import { pageMetadata } from "@/lib/metadata";
import { LEGAL, LEGAL_BANNER, type LegalKey } from "@/content/legal";
import { Notice, PageHeader } from "@/components/ui/Primitives";

export function legalMetadata(key: LegalKey) {
  return async ({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> => {
    const { locale } = await params;
    const doc = LEGAL[key][locale];
    return pageMetadata({ locale, path: `/${key}`, title: doc.title, description: doc.description });
  };
}

export function legalPage(key: LegalKey) {
  return async function LegalPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const doc = LEGAL[key][locale];
    return (
      <>
        <PageHeader title={doc.title} />
        <div className="container-page max-w-3xl py-14">
          <Notice>{LEGAL_BANNER[locale]}</Notice>
          {doc.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="font-display text-xl">{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-charcoal-soft">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </>
    );
  };
}
