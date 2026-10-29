import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_IMAGES } from "@/lib/constants";
import { AdminTitle, Card, Checkbox, Field, Flash, LOCALE_TABS, SubmitButton, sp } from "@/components/admin/ui";
import { ImageManager } from "@/components/admin/ImageManager";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deleteProduct, saveProduct } from "../../actions";

export const dynamic = "force-dynamic";

const AVAIL = [
  ["", "Non précisé (masqué sur le site)"],
  ["STANDARD", "Modèle standard"],
  ["CUSTOM", "Sur mesure"],
  ["BOTH", "Standard ou sur mesure"],
];
const USAGE = [
  ["", "Non précisé (masqué sur le site)"],
  ["RESIDENTIAL", "Particuliers"],
  ["PROFESSIONAL", "Professionnels"],
  ["BOTH", "Particuliers et professionnels"],
];

export default async function ProductEdit({
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
  const product = isNew
    ? null
    : await db.product.findUnique({ where: { id }, include: { translations: true, images: { orderBy: { order: "asc" } } } });
  if (!isNew && !product) notFound();
  const categories = await db.category.findMany({ orderBy: { order: "asc" }, include: { translations: { where: { locale: "fr" } } } });
  const tr = (locale: string) => product?.translations.find((t) => t.locale === locale);
  const frName = tr("fr")?.name;

  return (
    <>
      <AdminTitle title={isNew ? "Nouveau produit" : frName ?? "Produit"} back={{ href: "/admin/produits", label: "Tous les produits" }}>
        {product && (
          <a href={`/fr/produits/${product.slug}`} target="_blank" className="btn btn-outline">
            Voir sur le site
          </a>
        )}
      </AdminTitle>
      <Flash saved={sp(query.saved) === "1"} error={sp(query.error)} />

      <form action={saveProduct} className="space-y-6">
        <input type="hidden" name="id" value={product?.id ?? ""} />

        <Card>
          <h2 className="mb-4 font-display text-lg">Général</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="categoryId" className="mb-1 block text-sm font-medium">
                Collection <span className="text-danger">*</span>
              </label>
              <select id="categoryId" name="categoryId" defaultValue={product?.categoryId} required className="field">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.translations[0]?.name ?? c.slug}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Référence interne" name="reference" defaultValue={product?.reference} hint="Facultatif, affichée si renseignée." />
            <div>
              <label htmlFor="availability" className="mb-1 block text-sm font-medium">
                Type de modèle
              </label>
              <select id="availability" name="availability" defaultValue={product?.availability ?? ""} className="field">
                {AVAIL.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="usage" className="mb-1 block text-sm font-medium">
                Usage
              </label>
              <select id="usage" name="usage" defaultValue={product?.usage ?? ""} className="field">
                {USAGE.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {isNew && <Field label="Adresse (slug)" name="slug" hint="Facultatif : générée depuis le nom français." />}
            <Field label="Ordre d'affichage" name="order" type="number" defaultValue={product?.order ?? 0} />
          </div>
          <div className="mt-5 flex flex-wrap gap-6">
            <Checkbox name="visible" label="Visible sur le site" defaultChecked={product?.visible ?? true} />
            <Checkbox name="featured" label="Mettre à la une (accueil)" defaultChecked={product?.featured ?? false} />
            <Checkbox
              name="isDemo"
              label="Fiche de démonstration"
              hint="Affiche un avertissement sur la fiche. À décocher pour un vrai produit AmenPlus."
              defaultChecked={product?.isDemo ?? false}
            />
          </div>
        </Card>

        {LOCALE_TABS.map(({ code, label, dir }) => {
          const t = tr(code);
          return (
            <Card key={code}>
              <h2 className="mb-1 font-display text-lg">{label}</h2>
              <p className="mb-4 text-xs text-stone-ink">
                {code === "fr"
                  ? "Le nom français est obligatoire. Les autres langues reprennent le français si elles sont vides."
                  : "Laisser le nom vide pour utiliser la version française."}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nom" name={`name_${code}`} defaultValue={t?.name} dir={dir} required={code === "fr"} />
                <Field label="Description courte" name={`summary_${code}`} defaultValue={t?.summary} dir={dir} />
                <div className="md:col-span-2">
                  <Field label="Description détaillée" name={`description_${code}`} defaultValue={t?.description} dir={dir} textarea rows={5} />
                </div>
                <Field label="Dimensions (si confirmées)" name={`dimensions_${code}`} defaultValue={t?.dimensions} dir={dir} textarea rows={2} />
                <Field label="Matériaux (si confirmés)" name={`materials_${code}`} defaultValue={t?.materials} dir={dir} textarea rows={2} />
                <Field label="Finitions proposées" name={`finishes_${code}`} defaultValue={t?.finishes} dir={dir} textarea rows={2} />
                <Field label="Options de personnalisation" name={`options_${code}`} defaultValue={t?.options} dir={dir} textarea rows={2} />
              </div>
            </Card>
          );
        })}

        <Card>
          <h2 className="mb-1 font-display text-lg">Ajouter des photos</h2>
          <p className="mb-4 text-xs text-stone-ink">
            JPG, PNG, WebP ou AVIF, {ADMIN_IMAGES.maxBytes / 1024 / 1024} Mo max par photo. Format carré conseillé (au moins 1600 × 1600 px).
          </p>
          <input type="file" name="photos" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" />
        </Card>

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>

      {product && (
        <>
          <Card className="mt-6">
            <h2 className="mb-4 font-display text-lg">Photos ({product.images.length})</h2>
            <ImageManager owner="product" ownerId={product.id} images={product.images} />
          </Card>
          <form action={deleteProduct} className="mt-8">
            <input type="hidden" name="id" value={product.id} />
            <ConfirmSubmit message="Supprimer définitivement ce produit et ses photos ?" className="text-sm text-danger underline underline-offset-4">
              Supprimer ce produit
            </ConfirmSubmit>
          </form>
        </>
      )}
    </>
  );
}
