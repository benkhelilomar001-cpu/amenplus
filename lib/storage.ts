import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Files live outside /public so they persist across builds:
//   <STORAGE_DIR>/uploads  → admin photos, served publicly via /media/<name>
//   <STORAGE_DIR>/quotes   → quote attachments, served only to the admin
// On serverless hosting, replace these functions with an object store (S3, R2…).

const root = path.resolve(process.env.STORAGE_DIR || "./storage");
const dirs = { uploads: path.join(root, "uploads"), quotes: path.join(root, "quotes") } as const;
type Bucket = keyof typeof dirs;

const SAFE_NAME = /^[a-f0-9-]{36}\.(jpg|png|webp|avif|pdf)$/;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

export const MIME_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime]),
);

/** Detects the real file type from its first bytes, ignoring the browser-supplied type. */
export function sniffMime(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "application/pdf";
  const ascii = (from: number, to: number) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12))) return "image/avif";
  return null;
}

export async function saveFile(bucket: Bucket, bytes: Uint8Array, mime: string): Promise<string> {
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error(`Unsupported type ${mime}`);
  await mkdir(dirs[bucket], { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dirs[bucket], name), bytes);
  return name;
}

export async function readStoredFile(bucket: Bucket, name: string): Promise<Buffer | null> {
  if (!SAFE_NAME.test(name)) return null;
  try {
    return await readFile(path.join(dirs[bucket], name));
  } catch {
    return null;
  }
}

export async function deleteStoredFile(bucket: Bucket, name: string): Promise<void> {
  if (!SAFE_NAME.test(name)) return;
  await unlink(path.join(dirs[bucket], name)).catch(() => undefined);
}
