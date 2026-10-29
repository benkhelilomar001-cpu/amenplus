import "server-only";
import { getSettings } from "./settings";

type QuoteSummary = {
  reference: string;
  kind: string;
  name: string;
  customerType: string;
  itemCount: number;
  attachmentCount: number;
};

/**
 * Sends the "new request" e-mail to the team via Resend (https://resend.com).
 * Does nothing until RESEND_API_KEY, MAIL_FROM and a recipient are configured,
 * so no message ever goes to an unconfirmed address. The request is saved in the DB either way.
 */
export async function notifyNewQuote(quote: QuoteSummary): Promise<"sent" | "skipped" | "failed"> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const settings = await getSettings();
  const to = (process.env.QUOTE_NOTIFY_TO || settings.notifyEmails || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!apiKey || !from || to.length === 0) {
    console.info(`[mail] Notification skipped for ${quote.reference} (e-mail not configured).`);
    return "skipped";
  }

  const siteUrl = process.env.SITE_URL ?? "";
  const kindLabel = quote.kind === "CONTACT" ? "message de contact" : "demande de devis";
  const text = [
    `Nouvelle ${kindLabel} : ${quote.reference}`,
    `Client : ${quote.name} (${quote.customerType === "PROFESSIONAL" ? "professionnel" : "particulier"})`,
    `Produits sélectionnés : ${quote.itemCount}`,
    `Pièces jointes : ${quote.attachmentCount}`,
    "",
    `Consulter la demande : ${siteUrl}/admin/demandes`,
    "",
    "Les coordonnées du client sont visibles uniquement dans l'administration.",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: `[AmenPlus] ${quote.reference} — nouvelle ${kindLabel}`, text }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return "sent";
  } catch (err) {
    console.error("[mail] Notification failed", err);
    return "failed";
  }
}
