import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { MAX_UPLOAD_TOTAL, QUOTE_FILES } from "@/lib/constants";
import { fieldErrors, quoteSchema } from "@/lib/quote-schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { deleteStoredFile, saveFile, sniffMime } from "@/lib/storage";
import { notifyNewQuote } from "@/lib/mail";

export const runtime = "nodejs";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

async function nextReference(): Promise<string> {
  const prefix = `AP-${new Date().getFullYear()}-`;
  const last = await db.quoteRequest.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const n = last ? Number(last.reference.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  if (!rateLimit(`quote:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
    return json({ ok: false, code: "rateLimited" }, 429);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, code: "badRequest" }, 400);
  }

  // Spam traps: a filled honeypot or a form sent in under 3 seconds gets a fake success.
  const startedAt = Number(form.get("startedAt"));
  if (String(form.get("website") ?? "") || !Number.isFinite(startedAt) || Date.now() - startedAt < 3000) {
    return json({ ok: true, reference: "AP-OK" });
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return json({ ok: false, code: "badRequest" }, 400);
  }
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) return json({ ok: false, errors: fieldErrors(parsed.error) }, 422);
  const data = parsed.data;

  // Attachments: count, size and real file type (checked from the bytes, not the browser's claim).
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > (data.kind === "QUOTE" ? QUOTE_FILES.maxFiles : 0) || totalSize > MAX_UPLOAD_TOTAL) {
    return json({ ok: false, errors: { files: "invalid" } }, 422);
  }
  const uploads: { bytes: Uint8Array; mime: string; name: string; size: number }[] = [];
  for (const file of files) {
    if (file.size > QUOTE_FILES.maxBytes) return json({ ok: false, errors: { files: "invalid" } }, 422);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffMime(bytes);
    if (!mime || !(QUOTE_FILES.mimes as readonly string[]).includes(mime)) {
      return json({ ok: false, errors: { files: "invalid" } }, 422);
    }
    uploads.push({ bytes, mime, name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120), size: file.size });
  }

  // Selected products: keep only visible ones and store the French name for the team.
  const ids = [...new Set(data.items.map((i) => i.productId))];
  const products = ids.length
    ? await db.product.findMany({
        where: { id: { in: ids }, visible: true },
        select: { id: true, slug: true, translations: { select: { locale: true, name: true } } },
      })
    : [];
  const items = data.items.flatMap((item) => {
    const p = products.find((x) => x.id === item.productId);
    if (!p) return [];
    const name = p.translations.find((t) => t.locale === "fr")?.name ?? p.translations[0]?.name ?? p.slug;
    return [{ productId: p.id, productSlug: p.slug, productName: name, quantity: item.quantity, note: item.note || null }];
  });

  const stored: string[] = [];
  try {
    for (const u of uploads) stored.push(await saveFile("quotes", u.bytes, u.mime));

    let quote: { id: string; reference: string } | null = null;
    for (let attempt = 0; attempt < 4 && !quote; attempt++) {
      try {
        quote = await db.quoteRequest.create({
          data: {
            reference: await nextReference(),
            kind: data.kind,
            locale: data.locale,
            customerType: data.customerType,
            name: data.name,
            company: data.customerType === "PROFESSIONAL" ? data.company : undefined,
            email: data.email,
            phone: data.phone,
            preferredContact: data.preferredContact,
            region: data.region,
            city: data.city,
            categorySlug: data.categorySlug,
            description: data.description,
            dimensions: data.dimensions,
            finish: data.finish,
            budget: data.budget,
            desiredDate: data.desiredDate,
            consentAt: new Date(),
            items: { create: items },
            attachments: {
              create: uploads.map((u, i) => ({ originalName: u.name, storedName: stored[i], mime: u.mime, size: u.size })),
            },
          },
          select: { id: true, reference: true },
        });
      } catch (err) {
        // Two requests got the same reference number at the same time: try the next one.
        if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) throw err;
      }
    }
    if (!quote) throw new Error("Could not allocate a reference");

    await notifyNewQuote({
      reference: quote.reference,
      kind: data.kind,
      name: data.name,
      customerType: data.customerType,
      itemCount: items.length,
      attachmentCount: uploads.length,
    });

    return json({ ok: true, reference: quote.reference });
  } catch (err) {
    console.error("[quote] Failed to save request", err);
    await Promise.all(stored.map((name) => deleteStoredFile("quotes", name)));
    return json({ ok: false, code: "server" }, 500);
  }
}
