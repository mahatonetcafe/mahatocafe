import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { ordersForUser } from "@/lib/queries";
import { formatDate, rupees } from "@/lib/status";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await ordersForUser(user.id);

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-900">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card mt-5 p-8 text-center">
          <p className="font-semibold">Abhi tak koi order nahi hai.</p>
          <Link href="/services" className="btn btn-primary mt-4">Service chunein</Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.code}`} className="card flex items-center gap-3 p-4 hover:shadow-lift">
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-brand-900">{o.serviceName}</span>
                  <span className="block text-xs text-muted">
                    {o.code} · {formatDate(o.createdAt)} · {rupees(o.price)}
                  </span>
                  <span className="mt-1.5 block"><StatusBadge status={o.status} /></span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
