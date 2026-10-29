import { LOCALES, type Locale } from "./constants";

/** Builds a locale-prefixed path: lp("ar", "/collections") → "/ar/collections". */
export function lp(locale: Locale, path = ""): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

export function siteUrl(): string {
  // URL is set automatically by Netlify (the site's main address).
  return (process.env.SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "");
}

/** hreflang alternates for a path that exists in every language. */
export function languageAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LOCALES) out[l] = lp(l, path);
  out["x-default"] = lp("fr", path);
  return out;
}
