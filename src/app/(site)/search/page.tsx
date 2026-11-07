import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard, toCard } from "@/components/ServiceCard";
import { searchServices } from "@/lib/queries";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const hits = await searchServices(q);
  const onlyClose = hits.length > 0 && !hits.some((h) => h.exact);

  return (
    <div className="container-x py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-900">
        {q ? `"${q}" ke results` : "Service dhundhein"}
      </h1>
      <form className="mt-4 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Service dhundhein</label>
        <input id="q" name="q" defaultValue={q} className="field" placeholder="Jaise: PAN card" />
        <button className="btn btn-primary">Search</button>
      </form>
      {onlyClose && <p className="mt-4 text-sm text-muted">Yeh milti julti services mili hain. Kya aap inhe dhundh rahe the?</p>}
      {hits.length > 0 ? (
        <div className="mt-6 space-y-5">
          {hits.map((h) => <ServiceCard key={h.item.id} s={toCard(h.item)} />)}
        </div>
      ) : (
        <div className="card mt-6 p-6 text-center">
          <p className="font-semibold">{q ? "Is naam se koi service nahi mili." : "Upar apna kaam likhein."}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/services" className="btn btn-ghost">Explore All</Link>
            <Link href="/service/custom-work" className="btn btn-ghost">Apna kaam likh kar bhejein</Link>
          </div>
        </div>
      )}
    </div>
  );
}
