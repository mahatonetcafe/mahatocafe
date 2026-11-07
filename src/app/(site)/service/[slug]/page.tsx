import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, FileText, Info } from "lucide-react";
import { getService } from "@/lib/queries";
import { etaLabel, rupees } from "@/lib/status";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  return { title: s?.name ?? "Service" };
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service || !service.active) notFound();

  return (
    <div className="container-x py-7">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-brand-600">Home</Link> /{" "}
        <Link href={`/services/${service.categorySlug}`} className="hover:text-brand-600">{service.categoryName}</Link>{" "}
        / {service.name}
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5 min-w-0">
          <header>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">{service.name}</h1>
            <p className="mt-1 text-muted">{service.summary}</p>
          </header>

          {service.note && (
            <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <Info className="size-5 shrink-0" aria-hidden /> {service.note}
            </p>
          )}

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-brand-900">
              <FileText className="size-5 text-brand-600" aria-hidden /> Zaroori documents
            </h2>
            {service.documents.length ? (
              <ul className="mt-3 space-y-2.5">
                {service.documents.map((d) => (
                  <li key={d.key} className="flex gap-2">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden />
                    <span>
                      <span className="font-semibold">{d.label}</span>
                      {!d.required && <span className="text-muted"> (agar ho)</span>}
                      {d.hint && <span className="block text-sm text-muted">{d.hint}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Is kaam ke liye koi document nahi chahiye.</p>
            )}
            <p className="mt-3 text-xs text-muted">Photo ya PDF chalegi. Har file 5 MB se chhoti.</p>
          </section>

          <section className="card p-5">
            <h2 className="font-bold text-brand-900">Form me yeh jaankari lagegi</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              {service.fields.map((f) => (
                <li key={f.key} className="flex gap-2">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0 text-brand-600" aria-hidden /> {f.label}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="card p-5 lg:sticky lg:top-20">
          <p className="text-sm text-muted">Hamari service ka rate</p>
          <p className="text-3xl font-bold text-brand-900">{rupees(service.price)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
            <Clock className="size-4 text-brand-600" aria-hidden /> {etaLabel(service.etaHours)} me receiving
          </p>
          <Link href={`/apply/${service.slug}`} className="btn btn-primary mt-4 w-full">
            Apply Now <ArrowRight className="size-4" aria-hidden />
          </Link>
          <p className="mt-2 text-center text-xs text-muted">Account banakar document upload karein</p>
        </aside>
      </div>
    </div>
  );
}
