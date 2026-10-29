import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Two buckets:
//   uploads → admin photos, served publicly via /media/<name>
//   quotes  → quote attachments, served only to the admin
// Two drivers:
//   STORAGE_DRIVER="netlify" → Netlify Blobs (Netlify's disk is not persistent)
//   anything else            → files in STORAGE_DIR (local dev, VPS)

type Bucket = "uploads" | "quotes";

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

type Driver = {
  put(bucket: Bucket, name: string, bytes: Uint8Array): Promise<void>;
  get(bucket: Bucket, name: string): Promise<Uint8Array | null>;
  remove(bucket: Bucket, name: string): Promise<void>;
};

const fileDriver = (): Driver => {
  const root = path.resolve(process.env.STORAGE_DIR || "./storage");
  const dir = (bucket: Bucket) => path.join(root, bucket);
  return {
    async put(bucket, name, bytes) {
      await mkdir(dir(bucket), { recursive: true });
      await writeFile(path.join(dir(bucket), name), bytes);
    },
    async get(bucket, name) {
      try {
        return new Uint8Array(await readFile(path.join(dir(bucket), name)));
      } catch {
        return null;
      }
    },
    async remove(bucket, name) {
      await unlink(path.join(dir(bucket), name)).catch(() => undefined);
    },
  };
};

const netlifyDriver = (): Driver => {
  // Imported lazily so local dev never loads it.
  const store = async (bucket: Bucket) => {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: `amenplus-${bucket}`, consistency: "strong" });
  };
  return {
    async put(bucket, name, bytes) {
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      await (await store(bucket)).set(name, copy.buffer);
    },
    async get(bucket, name) {
      const data = await (await store(bucket)).get(name, { type: "arrayBuffer" });
      return data ? new Uint8Array(data) : null;
    },
    async remove(bucket, name) {
      await (await store(bucket)).delete(name);
    },
  };
};

// NETLIFY_BLOBS_CONTEXT is injected by Netlify at runtime, so Blobs are used there even if STORAGE_DRIVER is missing.
const useNetlify = process.env.STORAGE_DRIVER === "netlify" || Boolean(process.env.NETLIFY_BLOBS_CONTEXT);
const driver: Driver = useNetlify ? netlifyDriver() : fileDriver();

export async function saveFile(bucket: Bucket, bytes: Uint8Array, mime: string): Promise<string> {
  const ext = EXT_BY_MIME[mime];
  if (!ext) throw new Error(`Unsupported type ${mime}`);
  const name = `${randomUUID()}.${ext}`;
  await driver.put(bucket, name, bytes);
  return name;
}

export async function readStoredFile(bucket: Bucket, name: string): Promise<Uint8Array | null> {
  if (!SAFE_NAME.test(name)) return null;
  return driver.get(bucket, name);
}

export async function deleteStoredFile(bucket: Bucket, name: string): Promise<void> {
  if (!SAFE_NAME.test(name)) return;
  await driver.remove(bucket, name).catch(() => undefined);
}
