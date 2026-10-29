import type { Metadata } from "next";
import type { Locale } from "./constants";
import { languageAlternates, lp } from "./paths";

const OG_LOCALE: Record<Locale, string> = { fr: "fr_TN", ar: "ar_TN", en: "en_US" };

export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  // The share image comes from app/[locale]/opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: lp(locale, path), languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url: lp(locale, path),
      siteName: "AmenPlus",
      locale: OG_LOCALE[locale],
      type: "website",
    },
  };
}
