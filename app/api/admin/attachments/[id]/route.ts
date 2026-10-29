import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

// Quote attachments are private: only a logged-in admin can download them.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const attachment = await db.quoteAttachment.findUnique({ where: { id } });
  const file = attachment ? await readStoredFile("quotes", attachment.storedName) : null;
  if (!attachment || !file) return new Response("Not found", { status: 404 });
  const inline = attachment.mime.startsWith("image/") || attachment.mime === "application/pdf";
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": attachment.mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
