import "server-only";
import { cache } from "react";
import { db } from "./db";
import { DEMO_SITE_IMAGES, SETTING_KEYS, type Locale, type SettingKey, type SiteImageKey } from "./constants";

export type Settings = Partial<Record<SettingKey, string>>;

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const out: Settings = {};
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key) && row.value.trim()) {
      out[row.key as SettingKey] = row.value.trim();
    }
  }
  return out;
});

export function localized(settings: Settings, base: "address" | "hours", locale: Locale): string | undefined {
  return settings[`${base}.${locale}`] ?? settings[`${base}.fr`];
}

export function siteImage(settings: Settings, key: SiteImageKey): { url: string; isInspiration: boolean } {
  const own = settings[key];
  return own ? { url: own, isInspiration: false } : { url: DEMO_SITE_IMAGES[key], isInspiration: true };
}

/** Turns a phone number into a wa.me link (digits only). */
export function whatsappLink(value: string): string {
  return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
}
