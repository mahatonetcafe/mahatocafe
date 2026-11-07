import { env } from "cloudflare:workers";
import { CATALOG } from "./catalog";

type Value = string | number | null;
export type Statement = [sql: string, ...args: Value[]];

// Tables are created by the app itself on first use, so a new Cloudflare database needs no setup step.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_failures (
    mobile TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    until INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS captchas (
    id TEXT PRIMARY KEY,
    answer_hash TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    icon TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    sort INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    price INTEGER NOT NULL,
    eta_hours INTEGER NOT NULL,
    keywords TEXT NOT NULL DEFAULT '',
    note TEXT,
    badge TEXT,
    documents TEXT NOT NULL,
    fields TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    sort INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    service_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    eta_hours INTEGER NOT NULL,
    form_data TEXT NOT NULL,
    status TEXT NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    storage_folder TEXT,
    customer_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    paid_at TEXT,
    completed_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS order_files (
    id INTEGER PRIMARY KEY,
    public_id TEXT NOT NULL UNIQUE,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('document','receipt')),
    doc_key TEXT,
    label TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    remote_sha TEXT,
    enc_key TEXT,
    deleted_at TEXT,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS order_events (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_files_order ON order_files(order_id)`,
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  phone: "7870499793",
  whatsapp: "7992384657",
  app_url: "",
  app_beta: "1",
  beta_group_url: "",
  beta_app_url: "",
  promo_on: "1",
  promo_windows_url: "https://qrseprint.in/",
  promo_cyber_url: "https://qrseprint.in/cyber-software",
  promo_android_url: "https://qrseprint.in/android",
  email: "",
  address: "High School, Baliapur Sindri Road, Baliapur - Gobindpur Rd, near 10+2, Dhanbad, Jharkhand 828201",
  hours: "Subah 10 baje se raat 9 baje tak",
};

const database = () => (env as unknown as { DB: D1Database }).DB;
const bound = (sql: string, args: Value[]) => database().prepare(sql).bind(...args);

function seedStatements() {
  const statements: D1PreparedStatement[] = [];
  CATALOG.forEach((c, ci) => {
    statements.push(
      bound("INSERT OR IGNORE INTO categories (slug, name, tagline, icon, question, options, sort) VALUES (?,?,?,?,?,?,?)", [
        c.slug, c.name, c.tagline, c.icon, c.question, JSON.stringify(c.options), ci,
      ]),
    );
    c.services.forEach((s, si) => {
      statements.push(
        bound(
          `INSERT OR IGNORE INTO services (category_id, slug, name, summary, price, eta_hours, keywords, note, badge, documents, fields, sort)
           VALUES ((SELECT id FROM categories WHERE slug = ?),?,?,?,?,?,?,?,?,?,?,?)`,
          [
            c.slug, s.slug, s.name, s.summary, s.price, s.etaHours, s.keywords, s.note ?? null, s.badge ?? null,
            JSON.stringify(s.documents), JSON.stringify(s.fields), si,
          ],
        ),
      );
    });
  });
  return statements;
}

async function prepareDatabase() {
  const present = await database()
    .prepare("SELECT 1 FROM categories LIMIT 1")
    .first()
    .catch(() => null);
  if (present) return;
  await database().batch(SCHEMA.map((sql) => database().prepare(sql)));
  await database().batch(seedStatements());
}

// One check per Worker instance; a failure is retried on the next request.
let setup: Promise<void> | null = null;
function ready() {
  setup ??= prepareDatabase().catch((e) => {
    setup = null;
    throw e;
  });
  return setup;
}

export async function all<T = any>(sql: string, ...args: Value[]): Promise<T[]> {
  await ready();
  return (await bound(sql, args).all<T>()).results;
}

export async function one<T = any>(sql: string, ...args: Value[]): Promise<T | null> {
  await ready();
  return bound(sql, args).first<T>();
}

export async function run(sql: string, ...args: Value[]) {
  await ready();
  const { meta } = await bound(sql, args).run();
  return { changes: meta.changes, lastInsertRowid: meta.last_row_id };
}

/** Runs several writes as one transaction. */
export async function batch(statements: Statement[]) {
  if (!statements.length) return;
  await ready();
  await database().batch(statements.map(([sql, ...args]) => bound(sql, args)));
}
