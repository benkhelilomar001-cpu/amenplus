"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { passwordMatches, requireAdmin } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveFile, sniffMime, deleteStoredFile } from "@/lib/storage";
import {
  ADMIN_IMAGES,
  AVAILABILITIES,
  LOCALES,
  QUOTE_STATUSES,
  SETTING_KEYS,
  SPACE_TYPES,
  USAGES,
} from "@/lib/constants";

// ---------- helpers ----------

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const opt = (fd: FormData, key: string) => str(fd, key) || null;
const bool = (fd: FormData, key: string) => fd.get(key) === "on";
const oneOf = <T extends string>(value: string, list: readonly T[]): T | null =>
  (list as readonly string[]).includes(value) ? (value as T) : null;

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "element"
  );
}

async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let slug = base;
  for (let i = 2; await exists(slug); i++) slug = `${base}-${i}`;
  return slug;
}

/** Refresh every public page after a content change. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/** Saves uploaded admin photos (type checked from the file bytes) and returns their public URLs. */
async function savePhotos(fd: FormData, key = "photos"): Promise<string[]> {
  const urls: string[] = [];
  for (const f of fd.getAll(key)) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (f.size > ADMIN_IMAGES.maxBytes) throw new Error(`${f.name} dépasse 10 Mo.`);
    const bytes = new Uint8Array(await f.arrayBuffer());
    const mime = sniffMime(bytes);
    if (!mime || !(ADMIN_IMAGES.mimes as readonly string[]).includes(mime)) throw new Error(`${f.name} : format non accepté.`);
    urls.push(`/media/${await saveFile("uploads", bytes, mime)}`);
  }
  return urls;
}

async function removeUploadedFile(url: string) {
  if (url.startsWith("/media/")) await deleteStoredFile("uploads", url.slice("/media/".length));
}

// ---------- auth ----------

export async function login(_prev: string | null, fd: FormData): Promise<string | null> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return "Trop de tentatives. Réessayez dans 15 minutes.";
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return "Administration non configurée : définissez ADMIN_PASSWORD et ADMIN_SESSION_SECRET.";
  }
  if (!passwordMatches(str(fd, "password"))) return "Mot de passe incorrect.";
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- quote requests ----------

export async function updateQuoteStatus(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const status = oneOf(str(fd, "status"), QUOTE_STATUSES);
  if (status) await db.quoteRequest.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/demandes/${id}`);
  revalidatePath("/admin/demandes");
}

export async function addQuoteNote(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const body = str(fd, "body").slice(0, 4000);
  if (body) await db.quoteNote.create({ data: { quoteId: id, body } });
  revalidatePath(`/admin/demandes/${id}`);
}

export async function deleteQuote(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const quote = await db.quoteRequest.findUnique({ where: { id }, include: { attachments: true } });
  if (quote) {
    await Promise.all(quote.attachments.map((a) => deleteStoredFile("quotes", a.storedName)));
    await db.quoteRequest.delete({ where: { id } });
  }
  redirect("/admin/demandes?deleted=1");
}

// ---------- products ----------

function productTranslations(fd: FormData) {
  return LOCALES.map((locale) => ({
    locale,
    name: str(fd, `name_${locale}`),
    summary: str(fd, `summary_${locale}`),
    description: str(fd, `description_${locale}`),
    dimensions: opt(fd, `dimensions_${locale}`),
    materials: opt(fd, `materials_${locale}`),
    finishes: opt(fd, `finishes_${locale}`),
    options: opt(fd, `options_${locale}`),
  })).filter((t) => t.name);
}

export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const translations = productTranslations(fd);
  const fr = translations.find((t) => t.locale === "fr");
  if (!fr) redirect(`/admin/produits/${id || "nouveau"}?error=${encodeURIComponent("Le nom en français est obligatoire.")}`);
  const categoryId = str(fd, "categoryId");
  const data = {
    categoryId,
    reference: opt(fd, "reference"),
    availability: oneOf(str(fd, "availability"), AVAILABILITIES),
    usage: oneOf(str(fd, "usage"), USAGES),
    visible: bool(fd, "visible"),
    featured: bool(fd, "featured"),
    isDemo: bool(fd, "isDemo"),
    order: Number(str(fd, "order")) || 0,
  };

  let photos: string[];
  try {
    photos = await savePhotos(fd);
  } catch (e) {
    redirect(`/admin/produits/${id || "nouveau"}?error=${encodeURIComponent((e as Error).message)}`);
  }

  let productId = id;
  if (id) {
    await db.$transaction([
      db.product.update({ where: { id }, data }),
      db.productTranslation.deleteMany({ where: { productId: id } }),
      db.productTranslation.createMany({ data: translations.map((t) => ({ ...t, productId: id })) }),
    ]);
  } else {
    const slug = await uniqueSlug(slugify(str(fd, "slug") || fr.name), async (s) => Boolean(await db.product.findUnique({ where: { slug: s } })));
    const created = await db.product.create({ data: { ...data, slug, translations: { create: translations } } });
    productId = created.id;
  }
  if (photos.length) {
    const max = await db.productImage.aggregate({ where: { productId }, _max: { order: true } });
    const start = (max._max.order ?? -1) + 1;
    await db.productImage.createMany({ data: photos.map((url, i) => ({ productId, url, order: start + i })) });
  }
  refreshSite();
  redirect(`/admin/produits/${productId}?saved=1`);
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } });
  await Promise.all(images.map((i) => removeUploadedFile(i.url)));
  refreshSite();
  redirect("/admin/produits?deleted=1");
}

// ---------- images (products + projects) ----------

type ImageOwner = "product" | "project";

async function imagesOf(owner: ImageOwner, ownerId: string) {
  return owner === "product"
    ? db.productImage.findMany({ where: { productId: ownerId }, orderBy: { order: "asc" } })
    : db.projectImage.findMany({ where: { projectId: ownerId }, orderBy: { order: "asc" } });
}

async function setImageOrder(owner: ImageOwner, id: string, order: number) {
  if (owner === "product") await db.productImage.update({ where: { id }, data: { order } });
  else await db.projectImage.update({ where: { id }, data: { order } });
}

export async function imageAction(fd: FormData) {
  await requireAdmin();
  const owner = str(fd, "owner") === "project" ? "project" : "product";
  const ownerId = str(fd, "ownerId");
  const imageId = str(fd, "imageId");
  const op = str(fd, "op");
  const images = await imagesOf(owner, ownerId);
  const index = images.findIndex((i) => i.id === imageId);
  const image = images[index];
  if (!image) return;

  if (op === "delete") {
    if (owner === "product") await db.productImage.delete({ where: { id: imageId } });
    else await db.projectImage.delete({ where: { id: imageId } });
    await removeUploadedFile(image.url);
  } else if (op === "inspiration") {
    if (owner === "product") await db.productImage.update({ where: { id: imageId }, data: { isInspiration: !image.isInspiration } });
    else await db.projectImage.update({ where: { id: imageId }, data: { isInspiration: !image.isInspiration } });
  } else if (op === "up" || op === "down") {
    const swap = images[op === "up" ? index - 1 : index + 1];
    if (swap) {
      // Normalise orders to the current positions, then swap the two.
      await Promise.all(images.map((img, i) => setImageOrder(owner, img.id, i)));
      await setImageOrder(owner, image.id, op === "up" ? index - 1 : index + 1);
      await setImageOrder(owner, swap.id, index);
    }
  }
  refreshSite();
  revalidatePath(owner === "product" ? `/admin/produits/${ownerId}` : `/admin/realisations/${ownerId}`);
}

// ---------- categories ----------

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const translations = LOCALES.map((locale) => ({ locale, name: str(fd, `name_${locale}`), intro: str(fd, `intro_${locale}`) })).filter(
    (t) => t.name,
  );
  if (!translations.some((t) => t.locale === "fr")) {
    redirect(`/admin/collections/${id || "nouveau"}?error=${encodeURIComponent("Le nom en français est obligatoire.")}`);
  }
  let photos: string[];
  try {
    photos = await savePhotos(fd, "photo");
  } catch (e) {
    redirect(`/admin/collections/${id || "nouveau"}?error=${encodeURIComponent((e as Error).message)}`);
  }
  const data = {
    visible: bool(fd, "visible"),
    order: Number(str(fd, "order")) || 0,
    ...(photos[0] ? { image: photos[0] } : bool(fd, "removeImage") ? { image: null } : {}),
  };
  let categoryId = id;
  if (id) {
    const before = await db.category.findUnique({ where: { id } });
    await db.$transaction([
      db.category.update({ where: { id }, data }),
      db.categoryTranslation.deleteMany({ where: { categoryId: id } }),
      db.categoryTranslation.createMany({ data: translations.map((t) => ({ ...t, categoryId: id })) }),
    ]);
    if (before?.image && "image" in data && before.image !== data.image) await removeUploadedFile(before.image);
  } else {
    const fr = translations.find((t) => t.locale === "fr")!;
    const slug = await uniqueSlug(slugify(fr.name), async (s) => Boolean(await db.category.findUnique({ where: { slug: s } })));
    categoryId = (await db.category.create({ data: { ...data, slug, translations: { create: translations } } })).id;
  }
  refreshSite();
  redirect(`/admin/collections/${categoryId}?saved=1`);
}

// ---------- projects ----------

export async function saveProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const translations = LOCALES.map((locale) => ({
    locale,
    title: str(fd, `title_${locale}`),
    summary: str(fd, `summary_${locale}`),
    description: str(fd, `description_${locale}`),
    location: opt(fd, `location_${locale}`),
  })).filter((t) => t.title);
  const fr = translations.find((t) => t.locale === "fr");
  if (!fr) redirect(`/admin/realisations/${id || "nouveau"}?error=${encodeURIComponent("Le titre en français est obligatoire.")}`);
  let photos: string[];
  try {
    photos = await savePhotos(fd);
  } catch (e) {
    redirect(`/admin/realisations/${id || "nouveau"}?error=${encodeURIComponent((e as Error).message)}`);
  }
  const data = {
    spaceType: oneOf(str(fd, "spaceType"), SPACE_TYPES) ?? "OTHER",
    visible: bool(fd, "visible"),
    featured: bool(fd, "featured"),
    isDemo: bool(fd, "isDemo"),
    order: Number(str(fd, "order")) || 0,
  };
  let projectId = id;
  if (id) {
    await db.$transaction([
      db.project.update({ where: { id }, data }),
      db.projectTranslation.deleteMany({ where: { projectId: id } }),
      db.projectTranslation.createMany({ data: translations.map((t) => ({ ...t, projectId: id })) }),
    ]);
  } else {
    const slug = await uniqueSlug(slugify(fr.title), async (s) => Boolean(await db.project.findUnique({ where: { slug: s } })));
    projectId = (await db.project.create({ data: { ...data, slug, translations: { create: translations } } })).id;
  }
  if (photos.length) {
    const max = await db.projectImage.aggregate({ where: { projectId }, _max: { order: true } });
    const start = (max._max.order ?? -1) + 1;
    await db.projectImage.createMany({ data: photos.map((url, i) => ({ projectId, url, order: start + i })) });
  }
  refreshSite();
  redirect(`/admin/realisations/${projectId}?saved=1`);
}

export async function deleteProject(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const images = await db.projectImage.findMany({ where: { projectId: id } });
  await db.project.delete({ where: { id } });
  await Promise.all(images.map((i) => removeUploadedFile(i.url)));
  refreshSite();
  redirect("/admin/realisations?deleted=1");
}

// ---------- settings ----------

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const imageKeys = ["image.hero", "image.craft", "image.pros"] as const;
  for (const key of SETTING_KEYS) {
    if ((imageKeys as readonly string[]).includes(key)) continue;
    const value = str(fd, key).slice(0, 2000);
    if (value) await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    else await db.setting.deleteMany({ where: { key } });
  }
  try {
    for (const key of imageKeys) {
      const field = key.replace(".", "_");
      const [url] = await savePhotos(fd, field);
      const current = await db.setting.findUnique({ where: { key } });
      if (url || bool(fd, `${field}_reset`)) {
        if (current) await removeUploadedFile(current.value);
        if (url) await db.setting.upsert({ where: { key }, update: { value: url }, create: { key, value: url } });
        else await db.setting.deleteMany({ where: { key } });
      }
    }
  } catch (e) {
    redirect(`/admin/parametres?error=${encodeURIComponent((e as Error).message)}`);
  }
  refreshSite();
  redirect("/admin/parametres?saved=1");
}
