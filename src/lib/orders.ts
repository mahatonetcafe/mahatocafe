import { run } from "./db";
import type { OrderStatus } from "./status";

export async function logEvent(orderId: number, status: OrderStatus, message?: string) {
  await run("INSERT INTO order_events (order_id, status, message) VALUES (?,?,?)", orderId, status, message ?? null);
}

/**
 * Moves an unpaid order to processing. The checkout callback and the webhook can
 * both arrive for one payment, so only the first call has any effect.
 */
export async function markPaid(orderId: number, paymentId: string | null, message: string) {
  const { changes } = await run(`UPDATE orders SET status = 'processing', razorpay_payment_id = ?, paid_at = datetime('now')
       WHERE id = ? AND status = 'awaiting_payment'`, paymentId, orderId);
  if (changes) await logEvent(orderId, "processing", message);
}
