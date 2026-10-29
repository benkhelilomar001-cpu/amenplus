import { PhotoInput } from "@/components/admin/PhotoInput";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminTitle, Card, Checkbox, Field, Flash, LOCALE_TABS, SubmitButton, sp } from "@/components/admin/ui";
import { ImageManager } from "@/components/admin/ImageManager";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteProject, saveProject } from "../../actions";

export const dynamic = "force-dynamic";

const SPACES = [
  ["RESIDENTIAL", "Résidentiel"],
  ["OFFICE", "Bureaux"],
  ["HOSPITALITY", "Hôtellerie et commerces"],
  ["OTHER", "Autres espaces"],
];

export default async function ProjectEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === "nouveau";
  const project = isNew ? null : await db.project.findUnique({ where: { id }, include: { translations: true, images: { orderBy: { order: "asc" } } } });
  if (!isNew && !project) notFound();
  const tr = (l: string) => project?.translations.find((t) => t.locale === l);

  return (
    <>
      <AdminTitle title={isNew ? "Nouvelle réalisation" : tr("fr")?.title ?? "Réalisation"} back={{ href: "/admin/realisations", label: "Toutes les réalisations" }}>
        {project && (
          <a href={`/fr/realisations/${project.slug}`} target="_blank" className="btn btn-outline">
            Voir sur le site
          </a>
        )}
      </AdminTitle>
      <Flash saved={sp(query.saved) === "1"} error={sp(query.error)} />
      <p className="mb-6 max-w-3xl text-sm text-stone-ink">
        Ne publiez que des projets réels, avec l&apos;accord du client pour les photos et le lieu.
      </p>
      <form action={saveProject} className="space-y-6">
        <input type="hidden" name="id" value={project?.id ?? ""} />
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="spaceType" className="mb-1 block text-sm font-medium">
                Type d&apos;espace
              </label>
              <select id="spaceType" name="spaceType" defaultValue={project?.spaceType ?? "RESIDENTIAL"} className="field">
                {SPACES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Ordre d'affichage" name="order" type="number" defaultValue={project?.order ?? 0} />
          </div>
          <div className="mt-5 flex flex-wrap gap-6">
            <Checkbox name="visible" label="Visible sur le site" defaultChecked={project?.visible ?? true} />
            <Checkbox name="featured" label="À la une" defaultChecked={project?.featured ?? false} />
            <Checkbox name="isDemo" label="Exemple de démonstration" defaultChecked={project?.isDemo ?? false} />
          </div>
        </Card>
        {LOCALE_TABS.map(({ code, label, dir }) => (
          <Card key={code}>
            <h2 className="mb-4 font-display text-lg">{label}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Titre" name={`title_${code}`} defaultValue={tr(code)?.title} dir={dir} required={code === "fr"} />
              <Field label="Lieu (si autorisé)" name={`location_${code}`} defaultValue={tr(code)?.location} dir={dir} />
              <div className="md:col-span-2">
                <Field label="Résumé" name={`summary_${code}`} defaultValue={tr(code)?.summary} dir={dir} />
              </div>
              <div className="md:col-span-2">
                <Field label="Description" name={`description_${code}`} defaultValue={tr(code)?.description} dir={dir} textarea rows={6} />
              </div>
            </div>
          </Card>
        ))}
        <Card>
          <h2 className="mb-4 font-display text-lg">Ajouter des photos</h2>
          <PhotoInput name="photos" multiple />
        </Card>
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
      {project && (
        <>
          <Card className="mt-6">
            <h2 className="mb-4 font-display text-lg">Photos ({project.images.length})</h2>
            <ImageManager owner="project" ownerId={project.id} images={project.images} />
          </Card>
          <form action={deleteProject} className="mt-8">
            <input type="hidden" name="id" value={project.id} />
            <ConfirmSubmit message="Supprimer définitivement cette réalisation ?" className="text-sm text-danger underline underline-offset-4">
              Supprimer cette réalisation
            </ConfirmSubmit>
          </form>
        </>
      )}
    </>
  );
}
