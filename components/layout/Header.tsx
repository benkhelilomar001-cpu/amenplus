import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { lp } from "@/lib/paths";
import type { Locale } from "@/lib/constants";
import { CartLink, LanguageSwitcher, MobileMenu, NavLinks } from "./HeaderClient";

export const LANGS = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "ar", label: "AR", name: "العربية" },
  { code: "en", label: "EN", name: "English" },
];

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const items = [
    { href: lp(locale), label: t("home") },
    { href: lp(locale, "/collections"), label: t("collections") },
    { href: lp(locale, "/sur-mesure"), label: t("custom") },
    { href: lp(locale, "/realisations"), label: t("projects") },
    { href: lp(locale, "/professionnels"), label: t("pros") },
    { href: lp(locale, "/a-propos"), label: t("about") },
    { href: lp(locale, "/contact"), label: t("contact") },
  ];
  const labels = {
    mainNav: t("mainNav"),
    openMenu: t("openMenu"),
    closeMenu: t("closeMenu"),
    menu: t("menu"),
    quote: t("quote"),
    quoteCart: t("quoteCart"),
    language: t("language"),
  };
  const quoteHref = lp(locale, "/devis");

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link href={lp(locale)} className="shrink-0 rounded-sm" aria-label={`AmenPlus — ${t("home")}`}>
          <Logo />
        </Link>

        <nav aria-label={labels.mainNav} className="hidden lg:block">
          <NavLinks items={items} />
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher current={locale} langs={LANGS} label={labels.language} />
          </div>
          <CartLink href={quoteHref} label={labels.quoteCart} />
          <Link href={quoteHref} className="btn btn-primary hidden whitespace-nowrap xl:inline-flex">
            {labels.quote}
          </Link>
          <MobileMenu items={items} quoteHref={quoteHref} labels={labels} langs={LANGS} current={locale} />
        </div>
      </div>
    </header>
  );
}
