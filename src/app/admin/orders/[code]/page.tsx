import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MessageCircle, Phone } from "lucide-react";
import {
  deleteDocsAction, markCashPaidAction, markDoneAction, requestCorrectionAction,
  uploadReceiptAction,
} from "../../actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { DocInput } from "@/components/DocInput";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { getCustomer, getOrderByCode, orderEvents, orderFiles } from "@/lib/queries";
import { STATUS_META, dueLabel, formatDate, rupees } from "@/lib/status";

type Props = { params: Promise<{ code: string }> };

const kb = (n: number) => (n < 1024 * 1024 ? `${Math.ceil(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export default async function AdminOrderPage({ params }: Props) {
  await requireAdmin();
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  const customer = await getCustomer(order.userId);
  const files = await orderFiles(order.id);
  const docs = files.filter((f) => f.kind === "document");
  const receipts = files.filter((f) => f.kind === "receipt");
  const liveDocs = docs.filter((f) => !f.deletedAt).length;
  const events = await orderEvents(order.id);

  const cashPaid = markCashPaidAction.bind(null, code);
  const done = markDoneAction.bind(null, code);

  return (
    <div className="max-w-5xl">
      <Link href="/admin" className="text-sm font-semibold text-brand-600">← Orders</Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">{order.serviceName}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-sm text-muted">
        {order.code} · {rupees(order.price)} · {formatDate(order.createdAt)}
        {order.paidAt && order.status !== "done" && <> · Kab tak: <b>{dueLabel(order.paidAt, order.etaHours)}</b></>}
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="space-y-5 min-w-0">
          <section className="card p-5">
            <h2 className="font-bold text-brand-900">Form ki jaankari</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 text-sm">
              {Object.entries(order.formData).map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-medium whitespace-pre-wrap break-words select-all">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-brand-900">Customer ke documents</h2>
            {docs.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Koi document nahi hai.</p>
            ) : (
              <ul className="mt-2 divide-y divide-line">
                {docs.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold truncate">{f.label}</span>
                      <span className="block text-xs text-muted truncate">{f.originalName} · {kb(f.size)}</span>
                    </span>
                    {f.deletedAt ? (
                      <span className="text-xs font-semibold text-red-700">Delete ho gaya · {formatDate(f.deletedAt)}</span>
                    ) : (
                      <a href={`/files/${f.publicId}`} className="btn btn-ghost !min-h-9 !py-1 !px-3 text-sm">
                        <Download className="size-4" aria-hidden /> Download
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-brand-900">History</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-28 shrink-0 text-xs text-muted">{formatDate(e.createdAt)}</span>
                  <span>{e.message ?? STATUS_META[e.status].label}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card p-5 text-sm">
            <h2 className="font-bold text-brand-900">Customer</h2>
            <p className="mt-1 font-semibold">{customer?.name}</p>
            <p className="text-muted">{customer?.mobile}</p>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${customer?.mobile}`} className="btn btn-ghost flex-1 !min-h-9 !py-1 text-sm">
                <Phone className="size-4" aria-hidden /> Call
              </a>
              <a href={`https://wa.me/91${customer?.mobile}`} className="btn btn-ghost flex-1 !min-h-9 !py-1 text-sm">
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            </div>
          </section>

          {order.status === "awaiting_payment" ? (
            <section className="card p-5">
              <h2 className="font-bold text-brand-900">Payment baaki hai</h2>
              <p className="mt-1 mb-3 text-sm text-muted">Customer ne abhi online pay nahi kiya. Dukan pe cash mila ho to niche dabayein.</p>
              <ActionForm action={cashPaid}>
                <Submit className="btn btn-ghost w-full">Cash mila</Submit>
              </ActionForm>
            </section>
          ) : (
            <section className="card p-5 text-sm">
              <h2 className="font-bold text-brand-900">Payment</h2>
              <p className="mt-1">{rupees(order.price)} mila · {formatDate(order.paidAt)}</p>
              <p className="text-xs text-muted select-all">{order.paymentId ?? "Razorpay ke bina (cash ya test)"}</p>
            </section>
          )}

          {(order.status === "processing" || order.status === "receipt_ready") && (
            <section className="card p-5">
              <h2 className="font-bold text-brand-900">
                {order.status === "receipt_ready" ? "Receiving badlein" : "Receiving upload karein"}
              </h2>
              <p className="text-xs text-muted mt-0.5 mb-3">Apply karne ke baad receiving yahan upload karein.</p>
              {receipts.map((f) => (
                <a key={f.id} href={`/files/${f.publicId}`} className="mb-2 block text-sm font-bold text-brand-600">
                  Abhi ki file: {f.originalName}
                </a>
              ))}
              <ActionForm action={uploadReceiptAction.bind(null, code)} className="space-y-3">
                <DocInput key={receipts[0]?.id ?? "none"} name="receipt" label="Receiving file" required />
                <Submit className="btn btn-blue w-full" pendingText="Upload ho raha…">Upload karein</Submit>
              </ActionForm>
            </section>
          )}

          {order.status === "receipt_ready" && (
            <section className="card p-5">
              <ActionForm action={done}>
                <Submit className="btn btn-primary w-full">Mark Done</Submit>
              </ActionForm>
            </section>
          )}

          {order.status === "processing" && (
            <section className="card p-5">
              <h2 className="font-bold text-brand-900">Customer se sudhar maangein</h2>
              <ActionForm action={requestCorrectionAction.bind(null, code)} className="mt-2">
                <label className="label" htmlFor="fix-note">Kya sudharna hai</label>
                <textarea id="fix-note" name="note" rows={3} required className="field" placeholder="Jaise: Aadhaar ki photo saaf nahi hai" />
                <Submit className="btn btn-danger w-full mt-2">Sudhar maangein</Submit>
              </ActionForm>
            </section>
          )}

          {order.status === "done" && liveDocs > 0 && (
            <section className="card p-5">
              <h2 className="font-bold text-brand-900">Documents delete karein</h2>
              <p className="mt-1 text-xs text-muted">Files GitHub se hat jayengi aur unki key mit jayegi. Customer ko dikhega ki admin ne delete kar diya. Yeh wapas nahi aayengi.</p>
              <ActionForm action={deleteDocsAction.bind(null, code)} className="mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="confirm" className="size-4" /> Haan, {liveDocs} document delete karne hain
                </label>
                <Submit className="btn btn-danger w-full mt-3">Delete karein</Submit>
              </ActionForm>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
