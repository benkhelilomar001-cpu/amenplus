import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { QUOTE_STATUSES, QUOTE_STATUS_LABELS, type QuoteStatus } from "@/lib/constants";
import { governorateLabel } from "@/lib/tunisia";

export const runtime = "nodejs";

// Escapes a CSV cell; a leading = + - @ is prefixed so spreadsheets never run it as a formula.
function cell(value: unknown): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const status = new URL(req.url).searchParams.get("statut");
  const quotes = await db.quoteRequest.findMany({
    where: status && (QUOTE_STATUSES as readonly string[]).includes(status) ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: { items: true, _count: { select: { attachments: true } } },
  });
  const header = [
    "Référence", "Date", "Type", "Statut", "Client", "Société", "Type client", "E-mail", "Téléphone",
    "Contact préféré", "Gouvernorat", "Ville", "Type de meuble", "Produits", "Description", "Dimensions",
    "Finition", "Budget", "Date souhaitée", "Fichiers", "Langue",
  ];
  const lines = quotes.map((q) =>
    [
      q.reference,
      q.createdAt.toISOString(),
      q.kind === "CONTACT" ? "Message" : "Devis",
      QUOTE_STATUS_LABELS[q.status as QuoteStatus] ?? q.status,
      q.name,
      q.company,
      q.customerType === "PROFESSIONAL" ? "Professionnel" : "Particulier",
      q.email,
      q.phone,
      q.preferredContact,
      governorateLabel(q.region),
      q.city,
      q.categorySlug,
      q.items.map((i) => `${i.productName} x${i.quantity}${i.note ? ` (${i.note})` : ""}`).join(" | "),
      q.description,
      q.dimensions,
      q.finish,
      q.budget,
      q.desiredDate,
      q._count.attachments,
      q.locale,
    ]
      .map(cell)
      .join(";"),
  );
  // BOM + semicolons so Excel (French locale) opens it correctly.
  const csv = "﻿" + [header.map(cell).join(";"), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amenplus-demandes-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
