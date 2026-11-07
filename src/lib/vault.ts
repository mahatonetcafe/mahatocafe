import crypto from "node:crypto";

// Customer documents are encrypted before leaving this server, each with its own key.
// A file deleted from GitHub stays in git history, so the real deletion is destroying
// that key: the leftover copy can then never be read by anyone.

const IV_BYTES = 12;
const TAG_BYTES = 16;

export function encrypt(plain: Buffer) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain), cipher.final()]);
  return { key: key.toString("base64"), data: Buffer.concat([iv, cipher.getAuthTag(), body]) };
}

export function decrypt(data: Buffer, key: string) {
  const iv = data.subarray(0, IV_BYTES);
  const tag = data.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(key, "base64"), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]);
}
