import { PhotoInput } from "@/components/admin/PhotoInput";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { AdminTitle, Card, Checkbox, Field, Flash, LOCALE_TABS, SubmitButton, sp } from "@/components/admin/ui";
import { saveCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CategoryEdit({
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
  const category = isNew ? null : await db.category.findUnique({ where: { id }, include: { translations: true } });
  if (!isNew && !category) notFound();
  const tr = (l: string) => category?.translations.find((t) => t.locale === l);

  return (
    <>
      <AdminTitle title={isNew ? "Nouvelle collection" : tr("fr")?.name ?? "Collection"} back={{ href: "/admin/collections", label: "Toutes les collections" }} />
      <Flash saved={sp(query.saved) === "1"} error={sp(query.error)} />
      <form action={saveCategory} className="space-y-6">
        <input type="hidden" name="id" value={category?.id ?? ""} />
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ordre d'affichage" name="order" type="number" defaultValue={category?.order ?? 0} />
            <div className="flex items-end">
              <Checkbox name="visible" label="Visible sur le site" defaultChecked={category?.visible ?? true} />
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium">Photo de la collection</p>
            <p className="mb-3 text-xs text-stone-ink">Sans photo, la première photo du premier produit est utilisée.</p>
            {category?.image && (
              <div className="mb-3 flex items-center gap-4">
                <span className="relative h-24 w-20 overflow-hidden bg-ivory">
                  <Image src={category.image} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <Checkbox name="removeImage" label="Retirer cette photo" />
              </div>
            )}
            <PhotoInput name="photo" />
          </div>
        </Card>
        {LOCALE_TABS.map(({ code, label, dir }) => (
          <Card key={code}>
            <h2 className="mb-4 font-display text-lg">{label}</h2>
            <div className="grid gap-4">
              <Field label="Nom" name={`name_${code}`} defaultValue={tr(code)?.name} dir={dir} required={code === "fr"} />
              <Field label="Introduction" name={`intro_${code}`} defaultValue={tr(code)?.intro} dir={dir} textarea />
            </div>
          </Card>
        ))}
        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </>
  );
}
