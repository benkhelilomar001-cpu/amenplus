import { MIME_BY_EXT, readStoredFile } from "@/lib/storage";

export const runtime = "nodejs";

// Public photos uploaded from the admin (storage/uploads). Names are random UUIDs, so they can be cached forever.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const file = await readStoredFile("uploads", name);
  const mime = MIME_BY_EXT[name.split(".").pop() ?? ""];
  if (!file || !mime || mime === "application/pdf") return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file), {
    headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
