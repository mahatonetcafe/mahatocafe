import crypto from "node:crypto";

const API = "https://api.razorpay.com/v1";

export function razorpayConfigured() {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** Lets the flow be tried on localhost before keys exist. Never true in production. */
export function demoPaymentsAllowed() {
  return process.env.NODE_ENV !== "production" && !razorpayConfigured();
}

export async function createRazorpayOrder(amountPaise: number, receipt: string): Promise<string> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, notes: { order_code: receipt } }),
  });
  if (!res.ok) throw new Error(`Razorpay order failed with HTTP ${res.status}`);
  const body = (await res.json()) as { id: string };
  return body.id;
}

function matches(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** orderId must be the id stored on our server, not the one sent back by the browser. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return matches(expected, signature);
}

/** rawBody must be the exact request text, before any JSON parsing. */
export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return matches(expected, signature);
}
