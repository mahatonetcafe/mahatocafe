import crypto from "node:crypto";

// Self-hosted CAPTCHA: no outside service or keys. Characters are drawn as jittered line
// strokes rather than text, so the answer is not sitting in the markup. It stops ordinary
// form-filling bots; a determined attacker with OCR would need Turnstile or similar.

const TTL_SECONDS = 5 * 60;
const LENGTH = 5;

type Point = [number, number];

// Stroke outlines on a 10 by 14 grid. Lookalikes such as 0/O, 1/I and 4/A are left out.
const GLYPHS: Record<string, Point[][]> = {
  "2": [[[1, 2], [3, 0], [7, 0], [9, 2], [9, 5], [1, 14], [9, 14]]],
  "3": [[[1, 1], [9, 1], [5, 6], [9, 8], [9, 12], [7, 14], [2, 14], [1, 12]]],
  "5": [[[9, 0], [2, 0], [1, 6], [7, 6], [9, 8], [9, 12], [7, 14], [2, 14], [1, 12]]],
  "6": [[[8, 0], [3, 3], [1, 8], [1, 12], [3, 14], [7, 14], [9, 12], [9, 9], [7, 7], [3, 7], [1, 9]]],
  "7": [[[1, 0], [9, 0], [4, 14]]],
  "8": [[[5, 7], [2, 5], [2, 2], [4, 0], [6, 0], [8, 2], [8, 5], [5, 7], [9, 10], [9, 12], [7, 14], [3, 14], [1, 12], [1, 10], [5, 7]]],
  "9": [[[9, 5], [7, 7], [3, 7], [1, 5], [1, 2], [3, 0], [7, 0], [9, 2], [9, 6], [7, 11], [3, 14]]],
  A: [[[0, 14], [5, 0], [10, 14]], [[2, 9], [8, 9]]],
  C: [[[9, 2], [7, 0], [3, 0], [1, 2], [1, 12], [3, 14], [7, 14], [9, 12]]],
  E: [[[9, 0], [1, 0], [1, 14], [9, 14]], [[1, 7], [7, 7]]],
  F: [[[9, 0], [1, 0], [1, 14]], [[1, 7], [7, 7]]],
  H: [[[1, 0], [1, 14]], [[9, 0], [9, 14]], [[1, 7], [9, 7]]],
  K: [[[1, 0], [1, 14]], [[9, 0], [1, 8], [9, 14]]],
  L: [[[1, 0], [1, 14], [9, 14]]],
  P: [[[1, 14], [1, 0], [7, 0], [9, 2], [9, 6], [7, 8], [1, 8]]],
  T: [[[0, 0], [10, 0]], [[5, 0], [5, 14]]],
  U: [[[1, 0], [1, 12], [3, 14], [7, 14], [9, 12], [9, 0]]],
};

const ALPHABET = Object.keys(GLYPHS);
const WIDTH = 180;
const HEIGHT = 56;

const rand = (min: number, max: number) => min + (crypto.randomInt(0, 10001) / 10000) * (max - min);
const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

function randomCode() {
  return Array.from({ length: LENGTH }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join("");
}

function draw(code: string) {
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    parts.push(
      `<path d="M${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} Q${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)} ${rand(0, WIDTH).toFixed(1)} ${rand(0, HEIGHT).toFixed(1)}" stroke="#9fb3cf" stroke-width="1.2" fill="none"/>`,
    );
  }
  [...code].forEach((ch, i) => {
    const scale = rand(2.3, 2.7);
    const angle = rand(-16, 16).toFixed(1);
    const x = (14 + i * 32 + rand(-2, 2)).toFixed(1);
    const y = (10 + rand(-3, 3)).toFixed(1);
    const d = GLYPHS[ch]
      .map((stroke) =>
        stroke
          .map(([px, py], n) => `${n ? "L" : "M"}${(px + rand(-0.35, 0.35)).toFixed(2)} ${(py + rand(-0.35, 0.35)).toFixed(2)}`)
          .join(" "),
      )
      .join(" ");
    parts.push(
      `<g transform="translate(${x} ${y}) rotate(${angle} 5 7) scale(${scale.toFixed(2)})"><path d="${d}" stroke="#1a0f63" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`,
    );
  });
  for (let i = 0; i < 24; i++) {
    parts.push(`<circle cx="${rand(0, WIDTH).toFixed(1)}" cy="${rand(0, HEIGHT).toFixed(1)}" r="1" fill="#7f95b5"/>`);
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"><rect width="100%" height="100%" fill="#eef3fa"/>${parts.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const now = () => Math.floor(Date.now() / 1000);

type Store = {
  one: (sql: string, ...args: (string | number)[]) => Promise<any>;
  run: (sql: string, ...args: (string | number)[]) => Promise<unknown>;
};

export async function issueCaptcha(db: Store, code = randomCode()) {
  await db.run("DELETE FROM captchas WHERE expires_at < ?", now());
  const id = crypto.randomUUID();
  await db.run("INSERT INTO captchas (id, answer_hash, expires_at) VALUES (?,?,?)", id, hash(code), now() + TTL_SECONDS);
  return { id, image: draw(code) };
}

/** Each challenge gets exactly one try, so a wrong guess cannot be repeated. */
export async function verifyCaptcha(db: Store, id: unknown, answer: unknown) {
  if (typeof id !== "string" || typeof answer !== "string") return false;
  const row = (await db.one("SELECT answer_hash, expires_at FROM captchas WHERE id = ?", id)) as
    | { answer_hash: string; expires_at: number }
    | null;
  await db.run("DELETE FROM captchas WHERE id = ?", id);
  if (!row || row.expires_at < now()) return false;
  const expected = Buffer.from(row.answer_hash);
  const actual = Buffer.from(hash(answer.trim().toUpperCase()));
  return crypto.timingSafeEqual(expected, actual);
}
