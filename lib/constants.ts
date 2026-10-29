export const LOCALES = ["fr", "ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const AVAILABILITIES = ["STANDARD", "CUSTOM", "BOTH"] as const;
export type Availability = (typeof AVAILABILITIES)[number];

export const USAGES = ["RESIDENTIAL", "PROFESSIONAL", "BOTH"] as const;
export type Usage = (typeof USAGES)[number];

export const SPACE_TYPES = ["RESIDENTIAL", "OFFICE", "HOSPITALITY", "OTHER"] as const;
export type SpaceType = (typeof SPACE_TYPES)[number];

export const CUSTOMER_TYPES = ["INDIVIDUAL", "PROFESSIONAL"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CONTACT_METHODS = ["EMAIL", "PHONE", "WHATSAPP"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const QUOTE_STATUSES = ["NEW", "IN_PROGRESS", "MISSING_INFO", "QUOTE_SENT", "WON", "LOST"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  NEW: "Nouvelle",
  IN_PROGRESS: "En cours",
  MISSING_INFO: "Informations manquantes",
  QUOTE_SENT: "Devis préparé",
  WON: "Gagnée",
  LOST: "Perdue",
};

// Netlify Functions reject request bodies above ~6 MB, so uploads stay under 4 MB per request
// (photos are shrunk in the browser first, see lib/compress-image.ts).
export const MAX_UPLOAD_TOTAL = 4 * 1024 * 1024;

/** Upload limits for quote attachments (public form). */
export const QUOTE_FILES = {
  maxFiles: 3,
  maxBytes: MAX_UPLOAD_TOTAL,
  mimes: ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const,
  accept: ".jpg,.jpeg,.png,.webp,.pdf",
};

/** Upload limits for admin photos. */
export const ADMIN_IMAGES = {
  maxBytes: MAX_UPLOAD_TOTAL,
  mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"] as const,
};

export const SETTING_KEYS = [
  "phone",
  "whatsapp",
  "email",
  "address.fr",
  "address.ar",
  "address.en",
  "hours.fr",
  "hours.ar",
  "hours.en",
  "mapUrl",
  "instagram",
  "facebook",
  "linkedin",
  "notifyEmails",
  "image.hero",
  "image.craft",
  "image.pros",
] as const;

/** Home page photos: demo images are used (with an "inspiration" badge) until AmenPlus uploads its own. */
export const DEMO_SITE_IMAGES = {
  "image.hero": "/images/demo/table-chene-1.webp",
  "image.craft": "/images/demo/table-chene-2.webp",
  "image.pros": "/images/demo/bureau-1.webp",
} as const;
export type SiteImageKey = keyof typeof DEMO_SITE_IMAGES;
export type SettingKey = (typeof SETTING_KEYS)[number];
