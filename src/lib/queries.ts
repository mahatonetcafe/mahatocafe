import { DEFAULT_SETTINGS, all, one } from "./db";
import type { DocSpec, FieldSpec, FinderOption } from "./catalog";
import { buildIndex, fuzzySearch } from "./fuzzy";
import type { OrderStatus } from "./status";

/** Category tiles on the homepage. The rest are reached through Explore All. */
export const HOME_TILES = 14;

export type Category = {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  question: string;
  options: FinderOption[];
};

export type Service = {
  id: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  slug: string;
  name: string;
  summary: string;
  price: number;
  etaHours: number;
  keywords: string;
  note: string | null;
  badge: string | null;
  documents: DocSpec[];
  fields: FieldSpec[];
  active: boolean;
};

export type Order = {
  id: number;
  code: string;
  userId: number;
  serviceId: number;
  serviceName: string;
  price: number;
  etaHours: number;
  formData: Record<string, string>;
  status: OrderStatus;
  razorpayOrderId: string | null;
  paymentId: string | null;
  storageFolder: string | null;
  customerNote: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
};

export type OrderFile = {
  id: number;
  publicId: string;
  orderId: number;
  kind: "document" | "receipt";
  docKey: string | null;
  label: string;
  storedName: string;
  remoteSha: string | null;
  encKey: string | null;
  deletedAt: string | null;
  originalName: string;
  mime: string;
  size: number;
  createdAt: string;
};

export type OrderEvent = { id: number; status: OrderStatus; message: string | null; createdAt: string };

type Row = Record<string, any>;

const mapCategory = (r: Row): Category => ({
  id: r.id, slug: r.slug, name: r.name, tagline: r.tagline, icon: r.icon,
  question: r.question, options: JSON.parse(r.options),
});

const mapService = (r: Row): Service => ({
  id: r.id, categoryId: r.category_id, categorySlug: r.category_slug, categoryName: r.category_name,
  slug: r.slug, name: r.name, summary: r.summary, price: r.price, etaHours: r.eta_hours,
  keywords: r.keywords, note: r.note, badge: r.badge,
  documents: JSON.parse(r.documents), fields: JSON.parse(r.fields), active: !!r.active,
});

export const mapOrder = (r: Row): Order => ({
  id: r.id, code: r.code, userId: r.user_id, serviceId: r.service_id, serviceName: r.service_name,
  price: r.price, etaHours: r.eta_hours, formData: JSON.parse(r.form_data), status: r.status,
  razorpayOrderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, storageFolder: r.storage_folder, customerNote: r.customer_note, createdAt: r.created_at, paidAt: r.paid_at,
  completedAt: r.completed_at,
});

const mapFile = (r: Row): OrderFile => ({
  id: r.id, publicId: r.public_id, orderId: r.order_id, kind: r.kind, docKey: r.doc_key, label: r.label,
  storedName: r.stored_name, remoteSha: r.remote_sha, encKey: r.enc_key, deletedAt: r.deleted_at, originalName: r.original_name, mime: r.mime, size: r.size, createdAt: r.created_at,
});

const SERVICE_SELECT = `
  SELECT s.*, c.slug AS category_slug, c.name AS category_name
  FROM services s JOIN categories c ON c.id = s.category_id`;

export async function listCategories(): Promise<Category[]> {
  return (await all("SELECT * FROM categories ORDER BY sort") as Row[]).map(mapCategory);
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const r = await one("SELECT * FROM categories WHERE id = ?", id) as Row | undefined;
  return r ? mapCategory(r) : null;
}

export async function getCategory(slug: string): Promise<Category | null> {
  const r = await one("SELECT * FROM categories WHERE slug = ?", slug) as Row | undefined;
  return r ? mapCategory(r) : null;
}

export async function listServices(opts: { includeInactive?: boolean } = {}): Promise<Service[]> {
  const where = opts.includeInactive ? "" : "WHERE s.active = 1";
  return (await all(`${SERVICE_SELECT} ${where} ORDER BY c.sort, s.sort`) as Row[]).map(mapService);
}

export async function servicesInCategory(categoryId: number): Promise<Service[]> {
  return (await all(`${SERVICE_SELECT} WHERE s.active = 1 AND s.category_id = ? ORDER BY s.sort`, categoryId) as Row[]).map(mapService);
}

export async function getService(slug: string): Promise<Service | null> {
  const r = await one(`${SERVICE_SELECT} WHERE s.slug = ?`, slug) as Row | undefined;
  return r ? mapService(r) : null;
}

export async function getServiceById(id: number): Promise<Service | null> {
  const r = await one(`${SERVICE_SELECT} WHERE s.id = ?`, id) as Row | undefined;
  return r ? mapService(r) : null;
}

export async function searchServices(q: string) {
  const index = buildIndex(await listServices(), (s) => s.name, (s) => `${s.categoryName} ${s.summary} ${s.keywords}`);
  return fuzzySearch(index, q);
}

/** Plain data for the search box, which runs in the browser. */
export async function searchItems() {
  return (await listServices()).map((s) => ({
    slug: s.slug, name: s.name, category: s.categoryName, price: s.price,
    other: `${s.categoryName} ${s.summary} ${s.keywords}`,
  }));
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const r = await one("SELECT * FROM orders WHERE code = ?", code) as Row | undefined;
  return r ? mapOrder(r) : null;
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
  const r = await one("SELECT * FROM orders WHERE razorpay_order_id = ?", razorpayOrderId) as Row | undefined;
  return r ? mapOrder(r) : null;
}

export async function ordersForUser(userId: number): Promise<Order[]> {
  return (await all("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", userId) as Row[]).map(mapOrder);
}

export async function orderFiles(orderId: number): Promise<OrderFile[]> {
  return (await all("SELECT * FROM order_files WHERE order_id = ? ORDER BY id", orderId) as Row[]).map(mapFile);
}

export async function getFileByPublicId(publicId: string): Promise<OrderFile | null> {
  const r = await one("SELECT * FROM order_files WHERE public_id = ?", publicId) as Row | undefined;
  return r ? mapFile(r) : null;
}

export async function orderEvents(orderId: number): Promise<OrderEvent[]> {
  return (await all("SELECT * FROM order_events WHERE order_id = ? ORDER BY id", orderId) as Row[]).map((r) => ({
    id: r.id, status: r.status, message: r.message, createdAt: r.created_at,
  }));
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await all("SELECT key, value FROM settings") as Row[];
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
}

export async function getOrderById(id: number): Promise<Order | null> {
  const r = await one("SELECT * FROM orders WHERE id = ?", id) as Row | undefined;
  return r ? mapOrder(r) : null;
}

export type AdminOrderRow = Order & { customerName: string; customerMobile: string };

export async function adminOrders(opts: { status?: string; q?: string }): Promise<AdminOrderRow[]> {
  const where: string[] = [];
  const args: string[] = [];
  if (opts.status === "open") where.push("o.status != 'done'");
  else if (opts.status) { where.push("o.status = ?"); args.push(opts.status); }
  if (opts.q) {
    where.push("(o.code LIKE ? OR u.mobile LIKE ? OR u.name LIKE ? OR o.razorpay_payment_id LIKE ?)");
    const like = `%${opts.q}%`;
    args.push(like, like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const order = opts.status === "done" ? "o.id DESC" : "o.id ASC";
  const rows = await all(`SELECT o.*, u.name AS customer_name, u.mobile AS customer_mobile
       FROM orders o JOIN users u ON u.id = o.user_id ${clause} ORDER BY ${order} LIMIT 200`, ...args) as Row[];
  return rows.map((r) => ({ ...mapOrder(r), customerName: r.customer_name, customerMobile: r.customer_mobile }));
}

export async function orderCounts(): Promise<Record<string, number>> {
  const rows = await all("SELECT status, COUNT(*) AS n FROM orders GROUP BY status") as Row[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

export async function getCustomer(userId: number) {
  return await one("SELECT name, mobile FROM users WHERE id = ?", userId) as { name: string; mobile: string } | undefined;
}
