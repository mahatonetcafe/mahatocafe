import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createOrderAction } from "@/app/actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { DocInput } from "@/components/DocInput";
import { requireUser } from "@/lib/auth";
import { getService } from "@/lib/queries";
import { etaLabel, rupees } from "@/lib/status";

export const metadata: Metadata = { title: "Apply" };

type Props = { params: Promise<{ slug: string }> };

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service || !service.active) notFound();
  const user = await requireUser(`/apply/${slug}`);

  const prefill: Record<string, string> = { applicant: user.name, mobile: user.mobile };

  return (
    <div className="container-x py-7 max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-900">{service.name}</h1>
      <p className="text-sm text-muted">
        {rupees(service.price)} · {etaLabel(service.etaHours)} me receiving
      </p>

      <ActionForm action={createOrderAction.bind(null, service.slug)} className="mt-5 space-y-5">
        <section className="card p-5 space-y-4">
          <h2 className="font-bold text-brand-900">1. Applicant ki jaankari</h2>
          {service.fields.map((f) => {
            const id = `f_${f.key}`;
            return (
              <div key={f.key}>
                <label className="label" htmlFor={id}>
                  {f.label} {f.required && <span className="text-accent-500">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea id={id} name={id} required={f.required} rows={3} maxLength={2000} className="field" />
                ) : f.type === "select" ? (
                  <select id={id} name={id} required={f.required} className="field" defaultValue="">
                    <option value="" disabled>Chunein</option>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    id={id} name={id} type={f.type} required={f.required} maxLength={200}
                    defaultValue={prefill[f.key]} className="field"
                  />
                )}
              </div>
            );
          })}
        </section>

        {service.documents.length > 0 && (
          <section className="card p-5 space-y-3">
            <h2 className="font-bold text-brand-900">2. Documents upload karein</h2>
            {service.documents.map((d) => (
              <DocInput key={d.key} name={`doc_${d.key}`} label={d.label} hint={d.hint} required={d.required} />
            ))}
          </section>
        )}

        <section className="card p-5">
          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="consent" required className="mt-0.5 size-5 shrink-0" />
            <span>
              Main Mahato Net Cafe ko yeh jaankari aur documents sirf is kaam ke liye use karne ki anumati deta/deti hun.
              Di gayi jaankari sahi hai. Maine{" "}
              <Link href="/policy/terms" target="_blank" className="font-bold text-brand-600">Terms</Link>,{" "}
              <Link href="/policy/refund" target="_blank" className="font-bold text-brand-600">Refund</Link> aur{" "}
              <Link href="/policy/privacy" target="_blank" className="font-bold text-brand-600">Privacy Policy</Link> padh li hai.
            </span>
          </label>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
            <p>
              <span className="block text-xs text-muted">Kul rashi</span>
              <span className="text-2xl font-bold text-brand-900">{rupees(service.price)}</span>
            </p>
            <Submit pendingText="Upload ho raha…">Submit & Pay</Submit>
          </div>
        </section>
      </ActionForm>
    </div>
  );
}
