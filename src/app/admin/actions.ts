"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/ActionForm";
import { requireAdmin } from "@/lib/auth";
import type { DocSpec, FieldSpec } from "@/lib/catalog";
import { batch, one, run, type Statement } from "@/lib/db";
import { UploadError, isRealFile, removeStored, saveUpload } from "@/lib/files";
import { ICON_NAMES } from "@/components/icons";
import { parseFinderOptions } from "@/lib/finder-options";
import { getCategoryById, getOrderByCode, getServiceById, listCategories, listServices, orderFiles } from "@/lib/queries";
import { logEvent, markPaid } from "@/lib/orders";

const text = (fd: FormData, key: string, max = 2000) => String(fd.get(key) ?? "").trim().slice(0, max);

async function adminOrder(code: string) {
  await requireAdmin();
  const order = await getOrderByCode(code);
  if (!order) throw new Error("Order not found");
  return order;
}

function refresh(code: string) {
  revalidatePath(`/admin/orders/${code}`);
  revalidatePath("/admin");
}

export async function markCashPaidAction(code: string): Promise<FormState> {
  const order = await adminOrder(code);
  if (order.status !== "awaiting_payment") return { error: "Is order ka payment ho chuka hai" };
  await markPaid(order.id, null, "Dukan pe cash payment mila");
  refresh(code);
  return {};
}

export async function requestCorrectionAction(code: string, _: FormState, fd: FormData): Promise<FormState> {
  const order = await adminOrder(code);
  if (order.status !== "processing") return { error: "Sudhar sirf chal rahe kaam me maanga ja sakta hai" };
  const note = text(fd, "note", 1000);
  if (!note) return { error: "Customer ko batayein kya sudharna hai" };
  await run("UPDATE orders SET status = 'needs_correction', customer_note = ? WHERE id = ?", note, order.id);
  await logEvent(order.id, "needs_correction", `Sudhar maanga: ${note}`);
  refresh(code);
  return {};
}

export async function uploadReceiptAction(code: string, _: FormState, fd: FormData): Promise<FormState> {
  const order = await adminOrder(code);
  if (order.status !== "processing" && order.status !== "receipt_ready") {
    return { error: "Receiving sirf chal rahe kaam me upload ho sakti hai" };
  }
  const file = fd.get("receipt");
  if (!isRealFile(file)) return { error: "Receiving file chunein" };

  const old = (await orderFiles(order.id)).filter((f) => f.kind === "receipt");
  try {
    await saveUpload(file, { orderId: order.id, kind: "receipt", label: "Receiving", folder: order.storageFolder });
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  for (const f of old) {
    await removeStored(f);
    await run("DELETE FROM order_files WHERE id = ?", f.id);
  }
  await run("UPDATE orders SET status = 'receipt_ready' WHERE id = ?", order.id);
  await logEvent(order.id, "receipt_ready", old.length ? "Receiving badli gayi" : "Receiving upload hui");
  refresh(code);
  return {};
}

export async function markDoneAction(code: string): Promise<FormState> {
  const order = await adminOrder(code);
  if (order.status !== "receipt_ready") return { error: "Pehle receiving upload karein" };
  await run("UPDATE orders SET status = 'done', completed_at = datetime('now') WHERE id = ?", order.id);
  await logEvent(order.id, "done", "Kaam poora hua");
  refresh(code);
  return {};
}

export async function deleteDocsAction(code: string, _: FormState, fd: FormData): Promise<FormState> {
  const order = await adminOrder(code);
  if (order.status !== "done") return { error: "Documents sirf poore hue order ke delete ho sakte hain" };
  if (fd.get("confirm") !== "on") return { error: "Delete karne ke liye box tick karein" };
  const docs = (await orderFiles(order.id)).filter((f) => f.kind === "document" && !f.deletedAt);
  let removed = 0;
  for (const f of docs) {
    try {
      await removeStored(f);
    } catch (e) {
      console.error(e);
      return { error: `${f.label} delete nahi ho payi. Dobara koshish karein.` };
    }
    // Wiping the key is the real deletion: the copy in git history can no longer be read.
    await run("UPDATE order_files SET deleted_at = datetime('now'), enc_key = NULL, remote_sha = NULL, stored_name = '' WHERE id = ?", f.id);
    removed++;
  }
  await logEvent(order.id, "done", "Admin ne uploaded documents delete kar diye");
  refresh(code);
  return { ok: `${removed} document delete hue` };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "item";
}

function uniqueKey(label: string, used: Set<string>, existing: { key: string; label: string }[]) {
  const prior = existing.find((e) => e.label.toLowerCase() === label.toLowerCase());
  let key = prior?.key ?? slugify(label);
  for (let i = 2; used.has(key); i++) key = `${slugify(label)}_${i}`;
  used.add(key);
  return key;
}

const lines = (s: string) => s.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

/** One document per line: `Label | hint | optional` */
function parseDocs(raw: string, existing: DocSpec[]): DocSpec[] {
  const used = new Set<string>();
  return lines(raw).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    const optional = parts.some((p, i) => i > 0 && p.toLowerCase() === "optional");
    const hint = parts[1] && parts[1].toLowerCase() !== "optional" ? parts[1] : undefined;
    return { key: uniqueKey(parts[0], used, existing), label: parts[0], required: !optional, ...(hint ? { hint } : {}) };
  });
}

const FIELD_TYPES = ["text", "date", "tel", "email", "textarea"] as const;

/** One field per line: `Label | type | optional`. A dropdown is `select:A,B,C`. */
function parseFields(raw: string, existing: FieldSpec[]): FieldSpec[] {
  const used = new Set<string>();
  return lines(raw).map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    const optional = parts.some((p, i) => i > 0 && p.toLowerCase() === "optional");
    const t = parts[1]?.toLowerCase() ?? "";
    const base = { key: uniqueKey(parts[0], used, existing), label: parts[0], required: !optional };
    if (t.startsWith("select:")) {
      const options = parts[1].slice(7).split(",").map((o) => o.trim()).filter(Boolean);
      return { ...base, type: "select" as const, options };
    }
    const type = FIELD_TYPES.find((x) => x === t) ?? ("text" as const);
    return { ...base, type };
  });
}

export async function saveServiceAction(id: number | null, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(fd, "name", 120);
  const summary = text(fd, "summary", 200);
  const categoryId = Number(fd.get("category_id"));
  const price = Number(fd.get("price"));
  const etaHours = Number(fd.get("eta_hours"));

  if (!name) return { error: "Service ka naam bharein" };
  if (!Number.isInteger(price) || price < 0 || price > 1000000) return { error: "Rate sahi bharein" };
  if (!Number.isInteger(etaHours) || etaHours < 1 || etaHours > 2160) return { error: "Samay ghante me sahi bharein" };
  if (!await one("SELECT 1 FROM categories WHERE id = ?", categoryId)) return { error: "Category chunein" };

  const existing = id ? await getServiceById(id) : null;
  if (id && !existing) return { error: "Service nahi mili" };

  const documents = parseDocs(text(fd, "documents", 5000), existing?.documents ?? []);
  const fields = parseFields(text(fd, "fields", 5000), existing?.fields ?? []);
  if (!fields.length) return { error: "Kam se kam ek form field likhein" };

  const values = [
    categoryId, name, summary || name, price, etaHours, text(fd, "keywords", 500), text(fd, "note", 500) || null,
    text(fd, "badge", 40) || null, JSON.stringify(documents), JSON.stringify(fields), fd.get("active") === "on" ? 1 : 0,
  ] as const;

  if (id) {
    await run(
      `UPDATE services SET category_id=?, name=?, summary=?, price=?, eta_hours=?, keywords=?, note=?, badge=?,
       documents=?, fields=?, active=? WHERE id=?`,
      ...values, id,
    );
  } else {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "service";
    let slug = base;
    for (let i = 2; await one("SELECT 1 FROM services WHERE slug = ?", slug); i++) slug = `${base}-${i}`;
    await run(
      `INSERT INTO services (category_id, name, summary, price, eta_hours, keywords, note, badge, documents, fields, active, slug, sort)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,999)`,
      ...values, slug,
    );
  }
  revalidatePath("/", "layout");
  redirect("/admin/services");
}

/** Saves the one-page editor: every service's name, price and visibility together. */
export async function saveRatesAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const updates: { id: number; name: string; price: number; etaHours: number; active: number }[] = [];

  for (const s of await listServices({ includeInactive: true })) {
    if (!fd.has(`name_${s.id}`)) continue;
    const name = text(fd, `name_${s.id}`, 120);
    const price = Number(fd.get(`price_${s.id}`));
    const etaHours = Number(fd.get(`eta_${s.id}`));
    if (!name) return { error: "Service ka naam khali nahi ho sakta" };
    if (!Number.isInteger(price) || price < 0 || price > 1000000) return { error: `${name} ka rate sahi bharein` };
    if (!Number.isInteger(etaHours) || etaHours < 1 || etaHours > 2160) return { error: `${name} ka samay ghante me sahi bharein` };
    updates.push({ id: s.id, name, price, etaHours, active: fd.get(`active_${s.id}`) === "on" ? 1 : 0 });
  }

  await batch(
    updates.map((u): Statement => [
      "UPDATE services SET name = ?, price = ?, eta_hours = ?, active = ? WHERE id = ?",
      u.name, u.price, u.etaHours, u.active, u.id,
    ]),
  );
  revalidatePath("/", "layout");
  return { ok: "Sab save ho gaya. Website pe turant dikhega." };
}

export async function saveCategoryAction(id: number | null, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(fd, "name", 60);
  const tagline = text(fd, "tagline", 80);
  const icon = String(fd.get("icon") ?? "");
  const position = Number(fd.get("position"));

  if (!name) return { error: "Category ka naam bharein" };
  if (!ICON_NAMES.includes(icon)) return { error: "Icon chunein" };
  if (!Number.isInteger(position) || position < 1) return { error: "Number sahi bharein" };

  const existing = id ? await getCategoryById(id) : null;
  if (id && !existing) return { error: "Category nahi mili" };

  let question = existing?.question ?? "";
  let options = existing?.options ?? [];
  if (existing) {
    const services = (await listServices({ includeInactive: true })).filter((s) => s.categoryId === existing.id);
    const parsed = parseFinderOptions(text(fd, "options", 3000), services);
    if ("error" in parsed) return parsed;
    options = parsed.options;
    question = text(fd, "question", 120);
    if (options.length && !question) return { error: "Jawab ke saath sawal bhi likhein" };
  }

  let categoryId = id;
  if (categoryId) {
    await run(
      "UPDATE categories SET name = ?, tagline = ?, icon = ?, question = ?, options = ? WHERE id = ?",
      name, tagline, icon, question, JSON.stringify(options), categoryId,
    );
  } else {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "category";
    let slug = base;
    for (let i = 2; await one("SELECT 1 FROM categories WHERE slug = ?", slug); i++) slug = `${base}-${i}`;
    const { lastInsertRowid } = await run(
      "INSERT INTO categories (slug, name, tagline, icon, question, options, sort) VALUES (?,?,?,?,?,?,9999)",
      slug, name, tagline, icon, question, JSON.stringify(options),
    );
    categoryId = Number(lastInsertRowid);
  }

  // Renumber everything so the order stays clean after a move.
  const order = (await listCategories()).map((c) => c.id).filter((c) => c !== categoryId);
  order.splice(Math.min(position - 1, order.length), 0, categoryId);
  await batch(order.map((c, i): Statement => ["UPDATE categories SET sort = ? WHERE id = ?", i, c]));

  revalidatePath("/", "layout");
  redirect("/admin/services");
}

export async function saveSettingsAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const phone = text(fd, "phone", 10);
  const whatsapp = text(fd, "whatsapp", 10);
  const email = text(fd, "email", 120);
  const appLinks = {
    app_url: text(fd, "app_url", 300),
    beta_group_url: text(fd, "beta_group_url", 300),
    beta_app_url: text(fd, "beta_app_url", 300),
    promo_windows_url: text(fd, "promo_windows_url", 300),
    promo_cyber_url: text(fd, "promo_cyber_url", 300),
    promo_android_url: text(fd, "promo_android_url", 300),
  };

  if (phone && !/^\d{10}$/.test(phone)) return { error: "Phone 10 ank ka ho" };
  if (whatsapp && !/^\d{10}$/.test(whatsapp)) return { error: "WhatsApp 10 ank ka ho" };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email sahi bharein" };
  if (Object.values(appLinks).some((u) => u && !u.startsWith("https://"))) {
    return { error: "Saare links https:// se shuru hone chahiye" };
  }

  const values: Record<string, string> = {
    phone,
    whatsapp,
    email,
    ...appLinks,
    app_beta: fd.get("app_beta") === "on" ? "1" : "0",
    promo_on: fd.get("promo_on") === "on" ? "1" : "0",
    address: text(fd, "address", 300),
    hours: text(fd, "hours", 100),
  };
  await batch(
    Object.entries(values).map(([key, value]): Statement => [
      "INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      key, value,
    ]),
  );
  revalidatePath("/", "layout");
  return { ok: "Settings save ho gayi" };
}
