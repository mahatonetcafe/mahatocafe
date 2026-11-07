// PBKDF2 through the platform crypto engine, which scrypt is not available in. 100,000 is the
// most Workers allow. The count is saved with each hash, so it can change without breaking logins.
const ITERATIONS = 100_000;

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (s: string) => Uint8Array.from(s.match(/../g) ?? [], (x) => parseInt(x, 16));

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
    key,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, iterations = ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${iterations}$${hex(salt)}$${hex(await derive(password, salt, iterations))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;
  const expected = unhex(hash);
  const actual = await derive(password, unhex(salt), Number(iterations));
  if (actual.length !== expected.length) return false;
  // Compare every byte so the time taken reveals nothing about the password.
  return actual.reduce((diff, byte, i) => diff | (byte ^ expected[i]), 0) === 0;
}
