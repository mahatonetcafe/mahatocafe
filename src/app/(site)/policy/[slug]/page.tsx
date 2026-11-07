import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLICIES, UPDATED_ON } from "@/lib/policies";
import { getSettings } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

const getPolicy = (slug: string) => (Object.hasOwn(POLICIES, slug) ? POLICIES[slug] : null);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getPolicy((await params).slug)?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: Props) {
  const policy = getPolicy((await params).slug);
  if (!policy) notFound();
  const { phone, address } = await getSettings();

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">{policy.title}</h1>
      <p className="mt-1 text-sm text-muted">Update: {UPDATED_ON}</p>
      <p className="mt-4">{policy.intro}</p>

      {policy.sections.map((s) => (
        <section key={s.heading} className="mt-6">
          <h2 className="text-lg font-bold text-brand-900">{s.heading}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {s.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      ))}

      <section className="card mt-8 p-5 text-sm">
        <h2 className="font-bold text-brand-900">Sawal hai?</h2>
        <p className="mt-1">Mahato Net Cafe, {address}</p>
        {phone && <p className="mt-1">Phone: <a className="font-bold text-brand-600" href={`tel:${phone}`}>{phone}</a></p>}
        <Link href="/contact" className="mt-2 inline-block font-bold text-brand-600">Sampark karein</Link>
      </section>
    </div>
  );
}
