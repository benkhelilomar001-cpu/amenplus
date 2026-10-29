import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/constants";
import { getSettings, localized } from "@/lib/settings";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const c = await getTranslations({ locale, namespace: "contact" });
  const settings = await getSettings();
  const address = localized(settings, "address", locale);
  const socials = [
    { key: "instagram", label: "Instagram", href: settings.instagram },
    { key: "facebook", label: "Facebook", href: settings.facebook },
    { key: "linkedin", label: "LinkedIn", href: settings.linkedin },
  ].filter((s): s is { key: string; label: string; href: string } => Boolean(s.href));

  const explore = [
    { href: lp(locale, "/collections"), label: nav("collections") },
    { href: lp(locale, "/sur-mesure"), label: nav("custom") },
    { href: lp(locale, "/realisations"), label: nav("projects") },
    { href: lp(locale, "/professionnels"), label: nav("pros") },
  ];
  const company = [
    { href: lp(locale, "/a-propos"), label: nav("about") },
    { href: lp(locale, "/contact"), label: nav("contact") },
    { href: lp(locale, "/devis"), label: nav("quote") },
  ];
  const legal = [
    { href: lp(locale, "/mentions-legales"), label: t("legalNotice") },
    { href: lp(locale, "/confidentialite"), label: t("privacy") },
    { href: lp(locale, "/conditions-devis"), label: t("terms") },
  ];

  const Column = ({ title, links }: { title: string; links: { href: string; label: string }[] }) => (
    <div>
      <h2 className="eyebrow !text-wood-light">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-ivory/80 hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-charcoal text-ivory">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm text-ivory/75">{t("tagline")}</p>
          <address className="mt-5 space-y-1 text-sm not-italic text-ivory/75">
            <p>{address ?? t("location")}</p>
            {settings.phone && (
              <p>
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-white" dir="ltr">
                  {settings.phone}
                </a>
              </p>
            )}
            {settings.email && (
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </p>
            )}
          </address>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-4 text-sm" aria-label={c("socials")}>
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-ivory/80 hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Column title={t("explore")} links={explore} />
        <Column title={t("company")} links={company} />
        <Column title={t("legal")} links={legal} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ivory/60 sm:flex-row sm:justify-between">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <p>{t("inspirationNote")}</p>
        </div>
      </div>
    </footer>
  );
}
