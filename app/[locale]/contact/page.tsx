import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Locale } from "@/lib/constants";
import { lp } from "@/lib/paths";
import { pageMetadata } from "@/lib/metadata";
import { getSettings, localized, whatsappLink } from "@/lib/settings";
import { getQuoteLabels } from "@/lib/quote-labels";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { Notice, PageHeader } from "@/components/ui/Primitives";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("title"), description: t("metaDescription") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const [settings, labels] = await Promise.all([getSettings(), getQuoteLabels(locale)]);
  const address = localized(settings, "address", locale);
  const hours = localized(settings, "hours", locale);

  // Only details AmenPlus has entered in /admin/parametres are shown; nothing is invented.
  const details = [
    settings.phone && { icon: Phone, label: t("contact.phone"), value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, ltr: true },
    settings.whatsapp && { icon: MessageCircle, label: t("contact.whatsapp"), value: settings.whatsapp, href: whatsappLink(settings.whatsapp), ltr: true },
    settings.email && { icon: Mail, label: t("contact.email"), value: settings.email, href: `mailto:${settings.email}`, ltr: true },
    { icon: MapPin, label: t("contact.address"), value: address ?? t("contact.location"), href: settings.mapUrl, ltr: false },
    hours && { icon: Clock, label: t("contact.hours"), value: hours, ltr: false },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string; ltr: boolean }[];
  const hasDirectContact = Boolean(settings.phone || settings.email || settings.whatsapp);

  return (
    <>
      <PageHeader title={t("contact.title")} intro={t("contact.intro")} />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[20rem_1fr] lg:gap-16">
        <aside className="space-y-6">
          <h2 className="font-display text-xl">{t("contact.detailsTitle")}</h2>
          <ul className="space-y-5">
            {details.map(({ icon: Icon, label, value, href, ltr }) => (
              <li key={label} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-wood" strokeWidth={1.5} aria-hidden="true" />
                <div className="text-sm">
                  <p className="text-stone-ink">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="whitespace-pre-line font-medium hover:text-wood-ink"
                      dir={ltr ? "ltr" : undefined}
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="whitespace-pre-line font-medium">{value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!hasDirectContact && <Notice>{t("contact.detailsPending")}</Notice>}
          <p className="text-sm text-stone-ink">
            {t("contact.quoteHint")}{" "}
            <Link href={lp(locale, "/devis")} className="font-medium text-charcoal underline underline-offset-4">
              {t("common.requestQuote")}
            </Link>
          </p>
        </aside>
        <div>
          <h2 className="sr-only">{t("contact.formTitle")}</h2>
          <QuoteForm
            mode="CONTACT"
            locale={locale}
            labels={labels}
            links={{ privacy: lp(locale, "/confidentialite"), collections: lp(locale, "/collections"), productBase: lp(locale, "/produits") }}
          />
        </div>
      </div>
    </>
  );
}
