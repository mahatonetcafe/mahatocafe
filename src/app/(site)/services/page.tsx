import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSearch } from "@/components/HeroSearch";
import { CategoryIcon } from "@/components/icons";
import { listCategories, listServices, searchItems } from "@/lib/queries";
import { rupees } from "@/lib/status";

export const metadata: Metadata = { title: "Explore All" };

export default async function AllServicesPage() {
  const services = await listServices();
  return (
    <div className="container-x py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#06070e]">Explore All</h1>
      <div className="mt-4 max-w-xl"><HeroSearch items={await searchItems()} /></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(await listCategories()).filter((c) => services.some((s) => s.categoryId === c.id)).map((c) => (
          <section key={c.id} className="rounded-xl border border-line bg-white p-3">
            <Link href={`/services/${c.slug}`} className="flex items-center gap-3 rounded-lg bg-brand-50 p-3 hover:bg-brand-100">
              <CategoryIcon name={c.icon} className="size-6 text-brand-600" />
              <h2 className="font-bold text-brand-900">{c.name}</h2>
            </Link>
            <ul className="mt-1 divide-y divide-line">
              {services.filter((s) => s.categoryId === c.id).map((s) => (
                <li key={s.id}>
                  <Link href={`/service/${s.slug}`} className="flex items-center justify-between gap-3 px-2 py-2.5 text-sm hover:text-brand-600">
                    <span>{s.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-brand-900">{rupees(s.price)}</span>
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
