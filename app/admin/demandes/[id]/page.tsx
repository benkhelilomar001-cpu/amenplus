import Link from "next/link";
import { notFound } from "next/navigation";
import { Paperclip } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/constants";
import { governorateLabel } from "@/lib/tunisia";
import { AdminTitle, Card, StatusBadge } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { addQuoteNote, deleteQuote, updateQuoteStatus } from "../../actions";

export const dynamic = "force-dynamic";

const CONTACT_LABEL: Record<string, string> = { EMAIL: "E-mail", PHONE: "Téléphone", WHATSAPP: "WhatsApp" };
const LOCALE_LABEL: Record<string, string> = { fr: "Français", ar: "Arabe", en: "Anglais" };

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const quote = await db.quoteRequest.findUnique({
    where: { id },
    include: { items: true, attachments: true, notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!quote) notFound();
  const category = quote.categorySlug
    ? await db.category.findUnique({ where: { slug: quote.categorySlug }, include: { translations: { where: { locale: "fr" } } } })
    : null;

  const rows: [string, React.ReactNode][] = [
    ["Type de client", quote.customerType === "PROFESSIONAL" ? "Professionnel" : "Particulier"],
    ["Nom", quote.name],
    ["Société", quote.company],
    ["E-mail", quote.email && <a href={`mailto:${quote.email}`} className="underline">{quote.email}</a>],
    ["Téléphone", quote.phone && <a href={`tel:${quote.phone.replace(/\s/g, "")}`} className="underline">{quote.phone}</a>],
    ["Contact préféré", quote.preferredContact && CONTACT_LABEL[quote.preferredContact]],
    ["Gouvernorat", governorateLabel(quote.region)],
    ["Ville", quote.city],
    ["Langue du site", LOCALE_LABEL[quote.locale] ?? quote.locale],
    ["Consentement", quote.consentAt.toLocaleString("fr-FR")],
  ];
  const project: [string, string | null][] = [
    ["Type de meuble", category?.translations[0]?.name ?? quote.categorySlug],
    ["Dimensions", quote.dimensions],
    ["Finition", quote.finish],
    ["Budget indicatif", quote.budget],
    ["Date souhaitée", quote.desiredDate],
  ];

  return (
    <>
      <AdminTitle title={`${quote.reference} — ${quote.name}`} back={{ href: "/admin/demandes", label: "Toutes les demandes" }}>
        <StatusBadge status={quote.status} />
      </AdminTitle>
      <p className="-mt-6 mb-8 text-sm text-stone-ink">
        {quote.kind === "CONTACT" ? "Message de contact" : "Demande de devis"} reçue le{" "}
        {quote.createdAt.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })}
      </p>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-display text-lg">Description</h2>
            <p className="whitespace-pre-line leading-relaxed">{quote.description}</p>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              {project
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-stone-ink">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>

          {quote.kind === "QUOTE" && (
            <Card>
              <h2 className="mb-3 font-display text-lg">Produits sélectionnés ({quote.items.length})</h2>
              {quote.items.length === 0 ? (
                <p className="text-sm text-stone-ink">Aucun produit : demande libre.</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {quote.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-4 py-3">
                      <div>
                        {item.productId ? (
                          <Link href={`/admin/produits/${item.productId}`} className="font-medium underline underline-offset-4">
                            {item.productName}
                          </Link>
                        ) : (
                          <span className="font-medium">{item.productName} (supprimé)</span>
                        )}
                        {item.note && <p className="mt-1 text-stone-ink">« {item.note} »</p>}
                      </div>
                      <span className="shrink-0">Qté indicative : {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {quote.attachments.length > 0 && (
            <Card>
              <h2 className="mb-3 font-display text-lg">Pièces jointes</h2>
              <ul className="space-y-2 text-sm">
                {quote.attachments.map((a) => (
                  <li key={a.id}>
                    <a href={`/api/admin/attachments/${a.id}`} className="inline-flex items-center gap-2 underline underline-offset-4" target="_blank">
                      <Paperclip className="h-4 w-4" aria-hidden="true" />
                      {a.originalName}
                    </a>{" "}
                    <span className="text-xs text-stone-ink">({(a.size / 1024 / 1024).toFixed(1)} Mo)</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 font-display text-lg">Notes internes</h2>
            <form action={addQuoteNote} className="space-y-3">
              <input type="hidden" name="id" value={quote.id} />
              <label htmlFor="body" className="sr-only">
                Nouvelle note
              </label>
              <textarea id="body" name="body" rows={3} required className="field" placeholder="Appel effectué, informations reçues…" />
              <button type="submit" className="btn btn-outline">
                Ajouter la note
              </button>
            </form>
            {quote.notes.length > 0 && (
              <ul className="mt-5 space-y-3">
                {quote.notes.map((n) => (
                  <li key={n.id} className="bg-ivory px-4 py-3 text-sm">
                    <p className="whitespace-pre-line">{n.body}</p>
                    <p className="mt-1 text-xs text-stone-ink">{n.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 font-display text-lg">Statut</h2>
            <form key={quote.status} action={updateQuoteStatus} className="space-y-3">
              <input type="hidden" name="id" value={quote.id} />
              <label htmlFor="status" className="sr-only">
                Statut
              </label>
              <select id="status" name="status" defaultValue={quote.status} className="field">
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {QUOTE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary w-full">
                Mettre à jour
              </button>
            </form>
          </Card>
          <Card>
            <h2 className="mb-3 font-display text-lg">Client</h2>
            <dl className="space-y-2.5 text-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-stone-ink">{k}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
            </dl>
          </Card>
          <form action={deleteQuote}>
            <input type="hidden" name="id" value={quote.id} />
            <ConfirmSubmit
              message="Supprimer définitivement cette demande et ses fichiers ?"
              className="text-sm text-danger underline underline-offset-4"
            >
              Supprimer définitivement cette demande (et ses fichiers)
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </>
  );
}
