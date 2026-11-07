import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Download, FileText, ShieldCheck } from "lucide-react";
import { resubmitDocsAction } from "@/app/actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { DocInput } from "@/components/DocInput";
import { PayButton } from "@/components/PayButton";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { demoPaymentsAllowed, razorpayConfigured } from "@/lib/razorpay";
import {
  getOrderByCode, getServiceById, orderEvents, orderFiles, type Order,
} from "@/lib/queries";
import { STATUS_META, dueLabel, etaLabel, formatDate, rupees } from "@/lib/status";

export const metadata: Metadata = { title: "Order" };

type Props = { params: Promise<{ code: string }> };

const STEPS = ["Application", "Payment", "Kaam", "Receiving", "Done"];

function stepIndex(o: Order) {
  switch (o.status) {
    case "awaiting_payment": return 1;
    case "needs_correction":
    case "processing": return 2;
    case "receipt_ready": return 4;
    case "done": return 5;
  }
}

function Stepper({ order }: { order: Order }) {
  const at = stepIndex(order);
  return (
    <ol className="mt-5 flex items-start">
      {STEPS.map((s, i) => {
        const done = i < at;
        const current = i === at;
        return (
          <li key={s} className="relative flex-1 text-center">
            {i > 0 && (
              <span className={`absolute right-1/2 top-3 h-0.5 w-full ${i <= at ? "bg-brand-500" : "bg-line"}`} aria-hidden />
            )}
            <span
              className={`relative mx-auto grid size-6 place-items-center rounded-full text-xs font-bold ${
                done ? "bg-brand-500 text-white" : current ? "bg-white border-2 border-brand-500 text-brand-600" : "bg-line text-muted"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`mt-1 block text-[11px] sm:text-xs ${done || current ? "font-bold text-brand-900" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function PaymentPanel({ order }: { order: Order }) {
  const demo = demoPaymentsAllowed();
  return (
    <section className="card p-5">
      <h2 className="text-lg font-bold text-brand-900">{rupees(order.price)} ka payment karein</h2>
      <p className="mt-1 text-sm text-muted">UPI, card, net banking ya wallet, jo aasan ho.</p>
      {demo && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900">
          Test mode: Razorpay keys abhi nahi lagi hain. Yeh button bina paise ke order aage badhata hai. Live site pe yeh nahi chalega.
        </p>
      )}
      <div className="mt-4">
        {razorpayConfigured() || demo ? (
          <PayButton code={order.code} demo={demo} label={demo ? `Test payment ${rupees(order.price)}` : `${rupees(order.price)} Pay karein`} />
        ) : (
          <p className="text-sm font-semibold">Online payment abhi band hai. Dukan pe sampark karein.</p>
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="size-4 text-emerald-600" aria-hidden /> Payment Razorpay ke through surakshit
      </p>
    </section>
  );
}

async function CorrectionPanel({ order }: { order: Order }) {
  const docs = (await orderFiles(order.id)).filter((f) => f.kind === "document" && !f.deletedAt);
  const specs = (await getServiceById(order.serviceId))?.documents ?? [];
  const missing = specs.filter((d) => !docs.some((f) => f.docKey === d.key));

  return (
    <section className="card p-5 border-red-200">
      <h2 className="flex items-center gap-2 text-lg font-bold text-red-800">
        <AlertTriangle className="size-5" aria-hidden /> Isme sudhar chahiye
      </h2>
      {order.customerNote && <p className="mt-2 rounded-lg bg-red-50 p-3 text-sm">{order.customerNote}</p>}
      <ActionForm action={resubmitDocsAction.bind(null, order.code)} className="mt-4 space-y-3">
        <p className="text-sm text-muted">Jo document badalna hai sirf wahi chunein. Baaki waise hi rahenge.</p>
        {docs.map((f) => <DocInput key={f.id} name={`re_${f.publicId}`} label={f.label} hint={`Abhi: ${f.originalName}`} required={false} />)}
        {missing.map((d) => <DocInput key={d.key} name={`doc_${d.key}`} label={d.label} hint={d.hint} required={false} />)}
        <div>
          <label className="label" htmlFor="message">Kuch batana hai? (agar ho)</label>
          <textarea id="message" name="message" rows={2} maxLength={1000} className="field" />
        </div>
        <Submit pendingText="Upload ho raha…">Dobara bhejein</Submit>
      </ActionForm>
    </section>
  );
}

export default async function OrderPage({ params }: Props) {
  const { code } = await params;
  const user = await requireUser(`/orders/${code}`);
  const order = await getOrderByCode(code);
  if (!order) notFound();
  if (order.userId !== user.id) {
    if (user.role === "admin") redirect(`/admin/orders/${code}`);
    notFound();
  }

  const files = await orderFiles(order.id);
  const receipts = files.filter((f) => f.kind === "receipt");
  const docs = files.filter((f) => f.kind === "document");
  const events = await orderEvents(order.id);
  const waiting = order.status === "processing";

  return (
    <div className="container-x py-7 max-w-2xl space-y-5">
      <Link href="/orders" className="text-sm font-semibold text-brand-600">← My Orders</Link>

      <section className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-brand-900">{order.serviceName}</h1>
            <p className="text-xs text-muted">Order {order.code} · {rupees(order.price)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <Stepper order={order} />
        <p className="mt-4 text-sm text-muted">{STATUS_META[order.status].customerHint}</p>
      </section>

      {order.status === "awaiting_payment" && <PaymentPanel order={order} />}

      {waiting && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-900">
            <CheckCircle2 className="size-6" aria-hidden /> Dhanyawad! Aapki receiving {etaLabel(order.etaHours)} me aa jayegi
          </h2>
          {order.paidAt && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-900">
              <Clock className="size-4" aria-hidden /> {dueLabel(order.paidAt, order.etaHours)} tak
            </p>
          )}
          {order.paymentId && <p className="mt-1 text-sm text-emerald-900">Payment ID: {order.paymentId}</p>}
        </section>
      )}

      {order.status === "needs_correction" && <CorrectionPanel order={order} />}

      {receipts.length > 0 && (order.status === "receipt_ready" || order.status === "done") && (
        <section className="card p-5 border-emerald-300">
          <h2 className="text-lg font-bold text-brand-900">Aapki receiving ready hai</h2>
          <div className="mt-3 space-y-2">
            {receipts.map((f) => (
              <a key={f.id} href={`/files/${f.publicId}`} className="btn btn-primary w-full">
                <Download className="size-4" aria-hidden /> Receiving download karein
              </a>
            ))}
          </div>
        </section>
      )}

      {docs.length > 0 && (
        <section className="card p-5">
          <h2 className="font-bold text-brand-900">Aapke documents</h2>
          <p className="mt-0.5 text-xs text-muted">Security ke liye upload ke baad file sirf hamari team dekh sakti hai.</p>
          <ul className="mt-2 divide-y divide-line">
            {docs.map((f) => (
              <li key={f.id} className="flex items-center gap-2 py-2 text-sm">
                <FileText className="size-4 shrink-0 text-brand-600" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{f.label}</span>
                {f.deletedAt ? (
                  <span className="text-xs font-semibold text-red-700">Admin ne delete kar diya · {formatDate(f.deletedAt)}</span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700">Upload ho gaya</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-bold text-brand-900">Order history</h2>
        <ol className="mt-3 space-y-2.5 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="w-28 shrink-0 text-xs text-muted">{formatDate(e.createdAt)}</span>
              <span>{e.message ?? STATUS_META[e.status].label}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
