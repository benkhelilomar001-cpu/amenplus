import type { Locale } from "./constants";

// The 24 governorates of Tunisia, used in the quote form.
export const GOVERNORATES: { id: string; fr: string; ar: string; en: string }[] = [
  { id: "ariana", fr: "Ariana", ar: "أريانة", en: "Ariana" },
  { id: "beja", fr: "Béja", ar: "باجة", en: "Beja" },
  { id: "ben-arous", fr: "Ben Arous", ar: "بن عروس", en: "Ben Arous" },
  { id: "bizerte", fr: "Bizerte", ar: "بنزرت", en: "Bizerte" },
  { id: "gabes", fr: "Gabès", ar: "قابس", en: "Gabes" },
  { id: "gafsa", fr: "Gafsa", ar: "قفصة", en: "Gafsa" },
  { id: "jendouba", fr: "Jendouba", ar: "جندوبة", en: "Jendouba" },
  { id: "kairouan", fr: "Kairouan", ar: "القيروان", en: "Kairouan" },
  { id: "kasserine", fr: "Kasserine", ar: "القصرين", en: "Kasserine" },
  { id: "kebili", fr: "Kébili", ar: "قبلي", en: "Kebili" },
  { id: "le-kef", fr: "Le Kef", ar: "الكاف", en: "Kef" },
  { id: "mahdia", fr: "Mahdia", ar: "المهدية", en: "Mahdia" },
  { id: "manouba", fr: "La Manouba", ar: "منوبة", en: "Manouba" },
  { id: "medenine", fr: "Médenine", ar: "مدنين", en: "Medenine" },
  { id: "monastir", fr: "Monastir", ar: "المنستير", en: "Monastir" },
  { id: "nabeul", fr: "Nabeul", ar: "نابل", en: "Nabeul" },
  { id: "sfax", fr: "Sfax", ar: "صفاقس", en: "Sfax" },
  { id: "sidi-bouzid", fr: "Sidi Bouzid", ar: "سيدي بوزيد", en: "Sidi Bouzid" },
  { id: "siliana", fr: "Siliana", ar: "سليانة", en: "Siliana" },
  { id: "sousse", fr: "Sousse", ar: "سوسة", en: "Sousse" },
  { id: "tataouine", fr: "Tataouine", ar: "تطاوين", en: "Tataouine" },
  { id: "tozeur", fr: "Tozeur", ar: "توزر", en: "Tozeur" },
  { id: "tunis", fr: "Tunis", ar: "تونس", en: "Tunis" },
  { id: "zaghouan", fr: "Zaghouan", ar: "زغوان", en: "Zaghouan" },
];

export function governorateOptions(locale: Locale) {
  return GOVERNORATES.map((g) => ({ value: g.id, label: g[locale] })).sort((a, b) =>
    a.label.localeCompare(b.label, locale),
  );
}

export function governorateLabel(id: string | null | undefined, locale: Locale = "fr"): string {
  if (!id) return "";
  return GOVERNORATES.find((g) => g.id === id)?.[locale] ?? id;
}
