import crypto from "node:crypto";
import { run } from "./db";
import { deleteFile, getFile, githubConfigured, putFile } from "./github";
import type { OrderFile } from "./queries";
import { decrypt, encrypt } from "./vault";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const TYPES = [
  { mime: "application/pdf", ext: "pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  { mime: "image/jpeg", ext: "jpg", magic: [0xff, 0xd8, 0xff] },
  { mime: "image/png", ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
];

export class UploadError extends Error {}

/** Trusts file contents, never the name or type the browser claims. */
function sniff(buf: Buffer) {
  return TYPES.find((t) => t.magic.every((b, i) => buf[i] === b));
}

export function isRealFile(v: FormDataEntryValue | null): v is File {
  return typeof v === "object" && v !== null && v.size > 0;
}

const slug = (s: string) => s.normalize("NFKD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

/** e.g. New-PAN-Card/2026-11-06_17-12_Rahul-Kumar_Sita-Devi_MNC46KCZP4 */
export function workFolder(o: { serviceName: string; applicant: string; accountName: string; code: string }) {
  // India is UTC+5:30 all year; Workers run in UTC with no timezone data to rely on.
  const when = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  const names = [...new Set([slug(o.applicant), slug(o.accountName)])].filter(Boolean);
  return `${slug(o.serviceName) || "work"}/${[when, ...names, o.code].join("_")}`;
}

type SaveOpts = { orderId: number; kind: "document" | "receipt"; docKey?: string | null; label: string; folder?: string | null };

/** Validates a file, encrypts it, and stores it in the private GitHub repository. */
export async function saveUpload(file: File, opts: SaveOpts) {
  if (file.size > MAX_FILE_BYTES) {
    throw new UploadError(`${opts.label}: file 5 MB se chhoti honi chahiye`);
  }
  if (!githubConfigured()) {
    console.error("GITHUB_REPO and GITHUB_TOKEN are not set");
    throw new UploadError(`${opts.label}: file save nahi ho payi. Dukan pe sampark karein.`);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const type = sniff(buf);
  if (!type) throw new UploadError(`${opts.label}: sirf PDF, JPG ya PNG file chalegi`);

  const sealed = encrypt(buf);
  const suffix = crypto.randomBytes(3).toString("hex");
  const storedName = `${opts.folder ?? `order-${opts.orderId}`}/${slug(opts.label) || "file"}-${suffix}.${type.ext}.enc`;

  let remoteSha: string;
  try {
    remoteSha = await putFile(storedName, sealed.data, `Upload file for order ${opts.orderId}`);
  } catch (e) {
    console.error(e);
    throw new UploadError(`${opts.label}: file save nahi ho payi. Thodi der baad koshish karein.`);
  }

  await run(
    `INSERT INTO order_files
       (public_id, order_id, kind, doc_key, label, stored_name, remote_sha, enc_key, original_name, mime, size)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    crypto.randomUUID(), opts.orderId, opts.kind, opts.docKey ?? null, opts.label, storedName,
    remoteSha, sealed.key, cleanName(file.name, type.ext), type.mime, buf.length,
  );
}

function cleanName(name: string, ext: string) {
  const file = name.split(/[\\/]/).pop() ?? "";
  const base = file.replace(/\.[^.]*$/, "").replace(/[^\w.\- ]+/g, "_").slice(0, 80).trim();
  return `${base || "file"}.${ext}`;
}

export async function readStored(f: OrderFile): Promise<Buffer> {
  if (!f.encKey) throw new Error(`File ${f.publicId} has no key`);
  return decrypt(await getFile(f.storedName), f.encKey);
}

/** Removes the file itself. Callers must also clear the key, which is what makes it unreadable. */
export async function removeStored(f: OrderFile) {
  await deleteFile(f.storedName, f.remoteSha ?? "", `Delete file for order ${f.orderId}`);
}
