import { markPaid } from "@/lib/orders";
import { getOrderByRazorpayId } from "@/lib/queries";
import { verifyWebhookSignature } from "@/lib/razorpay";

type Payment = { id: string; order_id: string | null; amount: number };

/**
 * Backup for customers who pay and then close the page before the browser reports back.
 * Configure in Razorpay Dashboard > Webhooks with the payment.captured event.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook not configured", { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature, secret)) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(raw) as { event: string; payload?: { payment?: { entity?: Payment } } };
  const payment = event.payload?.payment?.entity;

  if (event.event === "payment.captured" && payment?.order_id) {
    const order = await getOrderByRazorpayId(payment.order_id);
    if (order && payment.amount === order.price * 100) {
      await markPaid(order.id, payment.id, "Razorpay se payment hua");
    }
  }
  return new Response("ok");
}
