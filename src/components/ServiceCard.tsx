import Link from "next/link";
import { ArrowRight, Clock, FileCheck2 } from "lucide-react";
import { etaLabel, rupees } from "@/lib/status";

export type ServiceCardData = {
  slug: string;
  name: string;
  summary: string;
  price: number;
  etaHours: number;
  docCount: number;
  badge: string | null;
};

export function ServiceCard({ s, highlight }: { s: ServiceCardData; highlight?: boolean }) {
  return (
    <article
      className={`card relative p-4 sm:p-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center ${
        highlight ? "border-brand-500 ring-1 ring-brand-500" : ""
      }`}
    >
      {(highlight || s.badge) && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-white">
          {highlight ? "Aapke liye sahi" : s.badge}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="text-lg font-bold text-brand-900">{s.name}</h3>
        <p className="text-sm text-muted">{s.summary}</p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <li className="flex items-center gap-1.5">
            <Clock className="size-4 text-brand-600" aria-hidden /> {etaLabel(s.etaHours)} me
          </li>
          <li className="flex items-center gap-1.5">
            <FileCheck2 className="size-4 text-brand-600" aria-hidden />
            {s.docCount ? `${s.docCount} document` : "Document nahi chahiye"}
          </li>
        </ul>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end border-t border-line pt-3 sm:border-0 sm:pt-0">
        <p className="text-2xl font-bold text-brand-900">{rupees(s.price)}</p>
        <Link href={`/service/${s.slug}`} className="btn btn-primary whitespace-nowrap">
          Apply Now <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

export function toCard(s: {
  slug: string; name: string; summary: string; price: number; etaHours: number; badge: string | null;
  documents: unknown[];
}): ServiceCardData {
  return {
    slug: s.slug, name: s.name, summary: s.summary, price: s.price, etaHours: s.etaHours,
    badge: s.badge, docCount: s.documents.length,
  };
}
