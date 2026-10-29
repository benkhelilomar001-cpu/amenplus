import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/constants";
import { governorateLabel } from "@/lib/tunisia";
import { AdminTitle, Flash, StatusBadge, sp } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Demandes" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function QuotesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const status = sp(params.statut);
  const q = sp(params.q)?.trim();
  const where: Prisma.QuoteRequestWhereInput = {
    ...(status && (QUOTE_STATUSES as readonly string[]).includes(status) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q } },
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { company: { contains: q } },
          ],
        }
      : {}),
  };
  const quotes = await db.quoteRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { items: true, attachments: true } } },
  });
  const exportHref = `/api/admin/export${status ? `?statut=${status}` : ""}`;

  return (
    <>
      <AdminTitle title="Demandes de devis et messages">
        <a href={exportHref} className="btn btn-outline">
          Exporter (CSV)
        </a>
      </AdminTitle>
      <Flash deleted={sp(params.deleted) === "1"} />

      <form className="mb-6 flex flex-wrap items-end gap-3" action="/admin/demandes">
        <div>
          <label htmlFor="q" className="mb-1 block text-xs text-stone-ink">
            Rechercher (référence, nom, e-mail, téléphone)
          </label>
          <input id="q" name="q" defaultValue={q} className="field w-72" />
        </div>
        <div>
          <label htmlFor="statut" className="mb-1 block text-xs text-stone-ink">
            Statut
          </label>
          <select id="statut" name="statut" defaultValue={status ?? ""} className="field w-56">
            <option value="">Tous</option>
            {QUOTE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Filtrer
        </button>
      </form>

      {quotes.length === 0 ? (
        <p className="border border-line bg-white p-6 text-sm text-stone-ink">Aucune demande ne correspond.</p>
      ) : (
        <div className="overflow-x-auto border border-line bg-white">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="bg-ivory text-start text-xs uppercase tracking-wide text-stone-ink">
              <tr>
                <th className="px-4 py-3 text-start font-medium">Référence</th>
                <th className="px-4 py-3 text-start font-medium">Date</th>
                <th className="px-4 py-3 text-start font-medium">Client</th>
                <th className="px-4 py-3 text-start font-medium">Type</th>
                <th className="px-4 py-3 text-start font-medium">Lieu</th>
                <th className="px-4 py-3 text-start font-medium">Contenu</th>
                <th className="px-4 py-3 text-start font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-paper">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/demandes/${quote.id}`} className="underline underline-offset-4 hover:text-wood-ink">
                      {quote.reference}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{quote.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3">
                    {quote.name}
                    {quote.company && <span className="block text-xs text-stone-ink">{quote.company}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {quote.kind === "CONTACT" ? "Message" : "Devis"} · {quote.customerType === "PROFESSIONAL" ? "Pro" : "Particulier"}
                  </td>
                  <td className="px-4 py-3">{governorateLabel(quote.region)}</td>
                  <td className="px-4 py-3 text-xs text-stone-ink">
                    {quote._count.items} produit(s) · {quote._count.attachments} fichier(s)
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
