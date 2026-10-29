import { PhotoInput } from "@/components/admin/PhotoInput";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { getSettings, siteImage } from "@/lib/settings";
import { AdminTitle, Card, Checkbox, Field, Flash, SubmitButton, sp } from "@/components/admin/ui";
import { saveSettings } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Paramètres" };

const IMAGES = [
  { key: "image.hero", label: "Photo d'accueil (grand bandeau)" },
  { key: "image.craft", label: "Photo « savoir-faire »" },
  { key: "image.pros", label: "Photo « professionnels »" },
] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const query = await searchParams;
  const s = await getSettings();
  const mailReady = Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);

  return (
    <>
      <AdminTitle title="Paramètres" />
      <Flash saved={sp(query.saved) === "1"} error={sp(query.error)} />
      <p className="mb-6 max-w-3xl text-sm text-stone-ink">
        N&apos;indiquez que des informations officielles validées par AmenPlus. Un champ vide n&apos;est simplement pas affiché sur le site.
      </p>
      <form action={saveSettings} className="space-y-6">
        <Card>
          <h2 className="mb-4 font-display text-lg">Coordonnées publiques</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Téléphone" name="phone" defaultValue={s.phone} dir="ltr" />
            <Field label="WhatsApp" name="whatsapp" defaultValue={s.whatsapp} dir="ltr" hint="Format international, ex. +216 …" />
            <Field label="E-mail public" name="email" type="email" defaultValue={s.email} dir="ltr" />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Adresse (français)" name="address.fr" defaultValue={s["address.fr"]} textarea rows={2} />
            <Field label="Adresse (arabe)" name="address.ar" defaultValue={s["address.ar"]} textarea rows={2} dir="rtl" />
            <Field label="Adresse (anglais)" name="address.en" defaultValue={s["address.en"]} textarea rows={2} />
            <Field label="Horaires (français)" name="hours.fr" defaultValue={s["hours.fr"]} textarea rows={3} />
            <Field label="Horaires (arabe)" name="hours.ar" defaultValue={s["hours.ar"]} textarea rows={3} dir="rtl" />
            <Field label="Horaires (anglais)" name="hours.en" defaultValue={s["hours.en"]} textarea rows={3} />
          </div>
          <div className="mt-4">
            <Field label="Lien vers la carte (Google Maps / OpenStreetMap)" name="mapUrl" defaultValue={s.mapUrl} dir="ltr" />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg">Réseaux sociaux</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Instagram (URL)" name="instagram" defaultValue={s.instagram} dir="ltr" />
            <Field label="Facebook (URL)" name="facebook" defaultValue={s.facebook} dir="ltr" />
            <Field label="LinkedIn (URL)" name="linkedin" defaultValue={s.linkedin} dir="ltr" />
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg">Notifications des demandes</h2>
          <Field
            label="Destinataires (séparés par des virgules)"
            name="notifyEmails"
            defaultValue={s.notifyEmails}
            dir="ltr"
            hint="Adresses qui reçoivent un e-mail à chaque nouvelle demande. Les coordonnées du client restent dans l'admin."
          />
          <p className={`mt-3 text-sm ${mailReady ? "text-success" : "text-[#7a4a12]"}`}>
            {mailReady
              ? "Envoi d'e-mails configuré."
              : "Envoi d'e-mails non configuré : renseignez RESEND_API_KEY et MAIL_FROM sur le serveur. Les demandes sont quand même enregistrées ici."}
          </p>
        </Card>

        <Card>
          <h2 className="mb-1 font-display text-lg">Photos de la page d&apos;accueil</h2>
          <p className="mb-4 text-xs text-stone-ink">Tant qu&apos;aucune photo n&apos;est envoyée, un visuel d&apos;inspiration signalé comme tel est affiché.</p>
          <div className="grid gap-6 md:grid-cols-3">
            {IMAGES.map(({ key, label }) => {
              const img = siteImage(s, key);
              const field = key.replace(".", "_");
              return (
                <div key={key}>
                  <p className="mb-2 text-sm font-medium">{label}</p>
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden bg-ivory">
                    <Image src={img.url} alt="" fill sizes="300px" className="object-cover" />
                    {img.isInspiration && (
                      <span className="absolute bottom-1 start-1 bg-[#f6e3c8] px-1.5 py-0.5 text-[0.65rem] text-[#7a4a12]">Inspiration</span>
                    )}
                  </div>
                  <PhotoInput name={field} />
                  {!img.isInspiration && (
                    <div className="mt-2">
                      <Checkbox name={`${field}_reset`} label="Revenir au visuel provisoire" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </>
  );
}
