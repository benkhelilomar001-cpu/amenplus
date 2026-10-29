import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS } from "@/lib/constants";
import { AdminTitle, Card, StatusBadge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const [byStatus, latest, demoProducts, inspirationImages, emptyCategories, demoProjects, settings] = await Promise.all([
    db.quoteRequest.groupBy({ by: ["status"], _count: true }),
    db.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.product.count({ where: { isDemo: true } }),
    db.productImage.count({ where: { isInspiration: true } }),
    db.category.count({ where: { visible: true, products: { none: { visible: true } } } }),
    db.project.count({ where: { isDemo: true } }),
    getSettings(),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;

  // Content the brief says must come from AmenPlus before launch (cahier des charges §10).
  const todo = [
    { done: Boolean(settings.phone || settings.email), label: "Coordonnées officielles (téléphone, e-mail)", href: "/admin/parametres" },
    { done: Boolean(settings["address.fr"]), label: "Adresse exacte", href: "/admin/parametres" },
    { done: Boolean(settings.notifyEmails || process.env.QUOTE_NOTIFY_TO), label: "E-mail de réception des demandes", href: "/admin/parametres" },
    { done: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM), label: "Envoi d'e-mails configuré (RESEND_API_KEY, MAIL_FROM)", href: "/admin/parametres" },
    { done: demoProducts === 0, label: `Remplacer les produits de démonstration (${demoProducts})`, href: "/admin/produits" },
    { done: inspirationImages === 0, label: `Remplacer les visuels d'inspiration (${inspirationImages} photos produits)`, href: "/admin/produits" },
    { done: Boolean(settings["image.hero"]), label: "Photo d'accueil AmenPlus", href: "/admin/parametres" },
    { done: demoProjects === 0, label: `Remplacer les réalisations d'exemple (${demoProjects})`, href: "/admin/realisations" },
    { done: emptyCategories === 0, label: `Collections sans produit (${emptyCategories})`, href: "/admin/collections" },
    { done: false, label: "Faire valider les pages légales (fichier content/legal.ts)", href: "/fr/mentions-legales" },
  ];

  return (
    <>
      <AdminTitle title="Tableau de bord" />
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {QUOTE_STATUSES.map((s) => (
          <Link key={s} href={`/admin/demandes?statut=${s}`} className="border border-line bg-white p-4 hover:border-charcoal">
            <p className="text-xs text-stone-ink">{QUOTE_STATUS_LABELS[s]}</p>
            <p className="mt-1 font-display text-3xl font-light">{count(s)}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Dernières demandes</h2>
            <Link href="/admin/demandes" className="text-sm underline underline-offset-4">
              Tout voir
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="text-sm text-stone-ink">Aucune demande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-line">
              {latest.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/demandes/${q.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-wood-ink">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {q.reference} · {q.name}
                      </span>
                      <span className="text-xs text-stone-ink">
                        {q.kind === "CONTACT" ? "Message" : "Devis"} · {q.createdAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </span>
                    <StatusBadge status={q.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl">À compléter par AmenPlus avant le lancement</h2>
          <ul className="space-y-2.5 text-sm">
            {todo.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Fait" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#b7791f]" aria-label="À faire" />
                )}
                <Link href={item.href} className={item.done ? "text-stone-ink line-through" : "hover:underline"}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
