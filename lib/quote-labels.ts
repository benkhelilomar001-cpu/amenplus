import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "./constants";

/** All strings the (client) quote form needs, resolved on the server. */
export async function getQuoteLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "quote" });
  const keys = [
    "cartTitle", "cartEmpty", "browse", "remove", "itemNote", "step1", "step2", "customerType",
    "INDIVIDUAL", "PROFESSIONAL", "name", "company", "email", "phone", "contactHint", "preferredContact",
    "EMAIL", "PHONE", "WHATSAPP", "region", "regionPlaceholder", "city", "category", "categoryPlaceholder",
    "description", "descriptionPlaceholder", "message", "dimensions", "dimensionsPlaceholder", "finish",
    "budget", "desiredDate", "optional", "required", "files", "filesHint", "filesTooMany", "fileTooBig", "filesTotalTooBig",
    "fileBadType", "removeFile", "consent", "privacyLink", "submit", "submitContact", "submitting",
    "errorSummary", "genericError", "rateLimited", "successTitle", "successText", "successContactTitle",
    "newRequest", "noPayment",
  ] as const;
  const labels = Object.fromEntries(keys.map((k) => [k, t.raw(k) as string])) as Record<(typeof keys)[number], string>;
  const errors = t.raw("errors") as Record<string, string>;
  const pt = await getTranslations({ locale, namespace: "product" });
  return { ...labels, errors, quantity: pt("quantity"), decrease: pt("decrease"), increase: pt("increase") };
}

export type QuoteLabels = Awaited<ReturnType<typeof getQuoteLabels>>;
