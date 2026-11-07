import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { adminOrders, orderCounts } from "@/lib/queries";
import { STATUSES, STATUS_META, dueLabel, formatDate, rupees } from "@/lib/status";

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const active = sp.status === "all" || (STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : "open";
  const status = active === "all" ? undefined : active;
  const q = (sp.q ?? "").trim().slice(0, 50);
  const orders = await adminOrders({ status, q });
  const counts = await orderCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const open = total - (counts.done ?? 0);

  const tabs = [
    { key: "open", label: "Baaki kaam", n: open },
    ...STATUSES.map((s) => ({ key: s, label: STATUS_META[s].label, n: counts[s] ?? 0 })),
    { key: "all", label: "Sabhi", n: total },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Orders</h1>
        <form className="flex gap-2" role="search">
          <input type="hidden" name="status" value={active} />
          <label htmlFor="q" className="sr-only">Order dhundhein</label>
          <input id="q" name="q" defaultValue={q} className="field !min-h-10 sm:w-64" placeholder="Code, mobile, naam, payment ID" />
          <button className="btn btn-blue !min-h-10">Search</button>
        </form>
      </div>

      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Order status">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin?status=${t.key}`}
            aria-current={active === t.key ? "page" : undefined}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium ${
              active === t.key ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-200"
            }`}
          >
            {t.label} <span className="opacity-75">{t.n}</span>
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-muted">Yahan koi order nahi hai.</p>
      ) : (
        <div className="card mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Order</th>
                <th className="px-4 py-2.5 font-semibold">Customer</th>
                <th className="px-4 py-2.5 font-semibold">Service</th>
                <th className="px-4 py-2.5 font-semibold">Rate</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Kab tak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link href={`/admin/orders/${o.code}`} className="font-bold text-brand-600">{o.code}</Link>
                    <span className="block text-xs text-muted">{formatDate(o.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {o.customerName}
                    <span className="block text-xs text-muted">{o.customerMobile}</span>
                  </td>
                  <td className="px-4 py-3">{o.serviceName}</td>
                  <td className="px-4 py-3 font-bold">{rupees(o.price)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {o.paidAt && o.status !== "done" ? dueLabel(o.paidAt, o.etaHours) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
