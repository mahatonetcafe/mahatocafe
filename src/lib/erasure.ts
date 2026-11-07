import type { Statement } from "./db";

/**
 * Erases a customer. Paid orders stay as bare accounting records, because the shop must keep
 * them, but nothing in them points to a person any more. Removing the file rows also destroys
 * their encryption keys, so stored copies become unreadable whether or not they can be deleted.
 */
export function erasureStatements(userId: number, mobile: string): Statement[] {
  const unpaid = "SELECT id FROM orders WHERE user_id = ? AND razorpay_payment_id IS NULL AND status = 'awaiting_payment'";
  return [
    ["DELETE FROM sessions WHERE user_id = ?", userId],
    ["DELETE FROM login_failures WHERE mobile = ?", mobile],
    ["DELETE FROM order_files WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId],
    [`DELETE FROM order_events WHERE order_id IN (${unpaid})`, userId],
    ["DELETE FROM orders WHERE user_id = ? AND razorpay_payment_id IS NULL AND status = 'awaiting_payment'", userId],
    ["UPDATE order_events SET message = NULL WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)", userId],
    ["UPDATE orders SET form_data = '{}', customer_note = NULL, storage_folder = NULL WHERE user_id = ?", userId],
    ["UPDATE users SET name = 'Deleted user', mobile = 'deleted-' || id, password_hash = '' WHERE id = ? AND role = 'customer'", userId],
  ];
}
