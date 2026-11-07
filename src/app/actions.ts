"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/ActionForm";
import {
  clearLoginFailures, endSession, ensureAdmin, loginLocked, recordLoginFailure, requireUser, safeNext, startSession,
} from "@/lib/auth";
import { verifyCaptcha } from "@/lib/captcha";
import { all, batch, one, run } from "@/lib/db";
import { erasureStatements } from "@/lib/erasure";
import { deleteFile } from "@/lib/github";
import { hashPassword, verifyPassword } from "@/lib/password";
import { UploadError, isRealFile, removeStored, saveUpload, workFolder } from "@/lib/files";
import { getOrderByCode, getService, getServiceById, orderFiles } from "@/lib/queries";
import { logEvent, markPaid } from "@/lib/orders";
import {
  createRazorpayOrder, demoPaymentsAllowed, razorpayConfigured, verifyPaymentSignature,
} from "@/lib/razorpay";

const text = (fd: FormData, key: string, max = 2000) => String(fd.get(key) ?? "").trim().slice(0, max);

export async function logoutAction() {
  await endSession();
  redirect("/");
}

const captchaPassed = (fd: FormData) => verifyCaptcha({ one, run }, fd.get("captcha_id"), fd.get("captcha"));
const CAPTCHA_ERROR = "CAPTCHA galat hai. Naya code bharein.";

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await captchaPassed(fd))) return { error: CAPTCHA_ERROR };
  const name = text(fd, "name", 100);
  const mobile = text(fd, "mobile", 10);
  const password = String(fd.get("password") ?? "");

  if (name.length < 2) return { error: "Apna naam likhein" };
  if (!/^[6-9]\d{9}$/.test(mobile)) return { error: "10 ank ka sahi mobile number likhein" };
  if (password.length < 8 || password.length > 128) return { error: "Password kam se kam 8 akshar ka ho" };

  const exists = await one("SELECT 1 FROM users WHERE mobile = ?", mobile);
  if (exists) return { error: "Is mobile se account pehle se bana hai. Login karein." };

  const { lastInsertRowid } = await run("INSERT INTO users (name, mobile, password_hash) VALUES (?,?,?)", name, mobile, await hashPassword(password));
  await startSession(Number(lastInsertRowid));
  redirect(safeNext(fd.get("next")));
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await captchaPassed(fd))) return { error: CAPTCHA_ERROR };
  const mobile = text(fd, "mobile", 10);
  const password = String(fd.get("password") ?? "");
  await ensureAdmin(mobile);

  if (await loginLocked(mobile)) return { error: "Bahut baar galat password. 15 minute baad koshish karein." };

  const user = await one("SELECT id, password_hash, role FROM users WHERE mobile = ?", mobile) as
    | { id: number; password_hash: string; role: string }
    | undefined;

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await recordLoginFailure(mobile);
    return { error: "Mobile ya password galat hai" };
  }
  await clearLoginFailures(mobile);
  await startSession(user.id);
  redirect(safeNext(fd.get("next"), user.role === "admin" ? "/admin" : "/orders"));
}

// Stays under the platform's limit on outside calls. Files past this are already unreadable.
const MAX_FILES_REMOVED = 20;

export async function deleteAccountAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser("/delete-account");
  if (user.role === "admin") return { error: "Admin account yahan se delete nahi hota" };
  if (fd.get("confirm") !== "on") return { error: "Delete karne ke liye sahi ka nishan lagayein" };
  if (await loginLocked(user.mobile)) return { error: "Bahut baar galat password. 15 minute baad koshish karein." };

  const row = await one("SELECT password_hash FROM users WHERE id = ?", user.id) as { password_hash: string } | undefined;
  if (!row || !(await verifyPassword(String(fd.get("password") ?? ""), row.password_hash))) {
    await recordLoginFailure(user.mobile);
    return { error: "Password galat hai" };
  }
  await clearLoginFailures(user.mobile);

  const running = await one(
    "SELECT code FROM orders WHERE user_id = ? AND status IN ('processing','needs_correction') LIMIT 1",
    user.id,
  ) as { code: string } | undefined;
  if (running) {
    return { error: `Aapka order ${running.code} abhi chal raha hai. Kaam poora hone ke baad delete karein, ya dukan se sampark karein.` };
  }

  const files = await all(
    `SELECT f.stored_name, f.remote_sha FROM order_files f JOIN orders o ON o.id = f.order_id
       WHERE o.user_id = ? AND f.deleted_at IS NULL`,
    user.id,
  ) as { stored_name: string; remote_sha: string | null }[];

  await batch(erasureStatements(user.id, user.mobile));
  for (const f of files.slice(0, MAX_FILES_REMOVED)) {
    await deleteFile(f.stored_name, f.remote_sha ?? "", "Delete file after account deletion").catch(console.error);
  }
  await endSession();
  redirect("/delete-account?done=1");
}

function newCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(7);
  return "MNC" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function createOrderAction(slug: string, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(`/apply/${slug}`);
  const service = await getService(slug);
  if (!service || !service.active) return { error: "Yeh service abhi uplabdh nahi hai" };

  if (fd.get("consent") !== "on") return { error: "Aage badhne ke liye anumati wala box tick karein" };

  // Only the fields defined for this service are stored.
  const formData: Record<string, string> = {};
  for (const f of service.fields) {
    const value = text(fd, `f_${f.key}`);
    if (f.required && !value) return { error: `${f.label} bharna zaroori hai` };
    if (f.type === "select" && value && !f.options?.includes(value)) return { error: `${f.label} sahi chunein` };
    if (value) formData[f.label] = value;
  }

  for (const d of service.documents) {
    if (d.required && !isRealFile(fd.get(`doc_${d.key}`))) return { error: `${d.label} upload karna zaroori hai` };
  }

  const code = newCode();
  const folder = workFolder({
    serviceName: service.name,
    applicant: text(fd, "f_applicant", 100) || user.name,
    accountName: user.name,
    code,
  });

  // The price always comes from the database, never from the browser.
  const { lastInsertRowid } = await run(`INSERT INTO orders (code, user_id, service_id, service_name, price, eta_hours, form_data, status, storage_folder)
       VALUES (?,?,?,?,?,?,?,'awaiting_payment',?)`, code, user.id, service.id, service.name, service.price, service.etaHours, JSON.stringify(formData), folder);
  const orderId = Number(lastInsertRowid);

  try {
    for (const d of service.documents) {
      const file = fd.get(`doc_${d.key}`);
      if (isRealFile(file)) await saveUpload(file, { orderId, kind: "document", docKey: d.key, label: d.label, folder });
    }
  } catch (e) {
    for (const f of await orderFiles(orderId)) await removeStored(f).catch(console.error);
    await run("DELETE FROM orders WHERE id = ?", orderId);
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }

  await logEvent(orderId, "awaiting_payment", "Application submit hui");
  redirect(`/orders/${code}`);
}

/** Loads an order only if it belongs to the signed-in customer. */
async function ownOrder(code: string) {
  const user = await requireUser(`/orders/${code}`);
  const order = await getOrderByCode(code);
  if (!order || order.userId !== user.id) redirect("/orders");
  return order;
}

type PaymentStart =
  | { error: string }
  | { keyId: string; razorpayOrderId: string; amount: number; name: string; contact: string; description: string };

/** Creates the Razorpay order on the server, so the amount can't be changed in the browser. */
export async function startPaymentAction(code: string): Promise<PaymentStart> {
  const order = await ownOrder(code);
  const user = await requireUser();
  if (order.status !== "awaiting_payment") return { error: "Is order ka payment ho chuka hai" };
  if (!razorpayConfigured()) return { error: "Online payment abhi band hai. Dukan pe sampark karein." };

  let razorpayOrderId = order.razorpayOrderId;
  if (!razorpayOrderId) {
    try {
      razorpayOrderId = await createRazorpayOrder(order.price * 100, order.code);
    } catch (e) {
      console.error(e);
      return { error: "Payment shuru nahi ho paya. Thodi der baad koshish karein." };
    }
    await run("UPDATE orders SET razorpay_order_id = ? WHERE id = ?", razorpayOrderId, order.id);
  }
  return {
    keyId: process.env.RAZORPAY_KEY_ID!,
    razorpayOrderId,
    amount: order.price * 100,
    name: user.name,
    contact: user.mobile,
    description: `${order.serviceName} (${order.code})`,
  };
}

export async function confirmPaymentAction(code: string, paymentId: string, signature: string): Promise<FormState> {
  const order = await ownOrder(code);
  if (order.status !== "awaiting_payment") return {};

  const valid =
    !!order.razorpayOrderId &&
    verifyPaymentSignature(order.razorpayOrderId, String(paymentId), String(signature), process.env.RAZORPAY_KEY_SECRET!);
  if (!valid) return { error: "Payment confirm nahi ho paya. Paisa kata ho to dukan pe sampark karein." };

  await markPaid(order.id, String(paymentId), "Razorpay se payment hua");
  revalidatePath(`/orders/${code}`);
  return {};
}

/** Test button for localhost only; refuses to run once real keys exist or in production. */
export async function demoPayAction(code: string): Promise<FormState> {
  if (!demoPaymentsAllowed()) return { error: "Yeh test payment band hai" };
  const order = await ownOrder(code);
  await markPaid(order.id, null, "Test payment (asli paisa nahi)");
  revalidatePath(`/orders/${code}`);
  return {};
}

export async function resubmitDocsAction(code: string, _: FormState, fd: FormData): Promise<FormState> {
  const order = await ownOrder(code);
  if (order.status !== "needs_correction") return { error: "Is order me abhi sudhar ki zaroorat nahi hai" };

  const service = await getServiceById(order.serviceId);
  const specs = service?.documents ?? [];
  const existing = (await orderFiles(order.id)).filter((f) => f.kind === "document" && !f.deletedAt);
  const message = text(fd, "message", 1000);

  let replaced = 0;
  try {
    for (const old of existing) {
      const file = fd.get(`re_${old.publicId}`);
      if (!isRealFile(file)) continue;
      await saveUpload(file, { orderId: order.id, kind: "document", docKey: old.docKey, label: old.label, folder: order.storageFolder });
      await removeStored(old);
      await run("DELETE FROM order_files WHERE id = ?", old.id);
      replaced++;
    }
    for (const d of specs) {
      if (existing.some((f) => f.docKey === d.key)) continue;
      const file = fd.get(`doc_${d.key}`);
      if (!isRealFile(file)) continue;
      await saveUpload(file, { orderId: order.id, kind: "document", docKey: d.key, label: d.label, folder: order.storageFolder });
      replaced++;
    }
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }

  if (!replaced && !message) return { error: "Sahi document chunein ya message likhein" };

  await run("UPDATE orders SET status = 'processing', customer_note = NULL WHERE id = ?", order.id);
  await logEvent(order.id, "processing", message ? `Sudhar bheja: ${message}` : "Sudhara hua document bheja gaya");
  revalidatePath(`/orders/${code}`);
  return {};
}
