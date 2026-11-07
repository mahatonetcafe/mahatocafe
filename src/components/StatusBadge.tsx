import { STATUS_META, type OrderStatus } from "@/lib/status";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${m.cls}`}>
      {m.label}
    </span>
  );
}
