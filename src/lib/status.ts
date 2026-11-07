// Shared by server and client code, so no Node imports here.

export const STATUSES = [
  "awaiting_payment",
  "needs_correction",
  "processing",
  "receipt_ready",
  "done",
] as const;

export type OrderStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<OrderStatus, { label: string; cls: string; customerHint: string }> = {
  awaiting_payment: {
    label: "Payment baaki",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    customerHint: "Payment karke apna kaam shuru karwayein.",
  },
  needs_correction: {
    label: "Sudhar chahiye",
    cls: "bg-red-50 text-red-800 border-red-200",
    customerHint: "Niche diye gaye note ke hisaab se document dobara bhejein.",
  },
  processing: {
    label: "Kaam chal raha",
    cls: "bg-indigo-50 text-indigo-800 border-indigo-200",
    customerHint: "Aapka form apply ho raha hai.",
  },
  receipt_ready: {
    label: "Receiving ready",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    customerHint: "Aapki receiving ready hai. Download karein.",
  },
  done: {
    label: "Done",
    cls: "bg-emerald-100 text-emerald-900 border-emerald-300",
    customerHint: "Aapka kaam poora ho gaya.",
  },
};

export function etaLabel(hours: number) {
  return `${hours} ghante`;
}

export function rupees(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDate(sqliteUtc: string | null) {
  if (!sqliteUtc) return "";
  return new Date(sqliteUtc.replace(" ", "T") + "Z").toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** When the work is due, counted from the moment the customer paid. */
export function dueLabel(paidAt: string, hours: number) {
  const due = new Date(new Date(paidAt.replace(" ", "T") + "Z").getTime() + hours * 3600_000);
  return due.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
