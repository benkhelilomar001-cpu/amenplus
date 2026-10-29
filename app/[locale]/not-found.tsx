import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Logo";
import { isLocale } from "@/lib/constants";

export default async function NotFound() {
  const current = await getLocale();
  const locale = isLocale(current) ? current : "fr";
  const t = await getTranslations({ locale, namespace: "notFound" });
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <Monogram className="h-14 w-auto opacity-80" />
      <h1 className="mt-8 font-display text-4xl font-light">{t("title")}</h1>
      <p className="mt-3 text-stone-ink">{t("text")}</p>
      <Link href={`/${locale}`} className="btn btn-primary mt-8">
        {t("back")}
      </Link>
    </section>
  );
}
