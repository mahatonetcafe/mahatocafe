import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { saveRatesAction } from "../actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { CategoryIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { HOME_TILES, listCategories, listServices } from "@/lib/queries";

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await listServices({ includeInactive: true });
  const categories = await listCategories();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Services aur Rate</h1>
          <p className="text-sm text-muted">
            Naam, rate ya delivery ka samay badal kar niche Save dabayein. Naya samay sirf naye orders pe lagega. Homepage pe pehli {HOME_TILES} category dikhti hain, baaki Explore All me.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/categories/new" className="btn btn-ghost"><Plus className="size-4" aria-hidden /> Nayi category</Link>
          <Link href="/admin/services/new" className="btn btn-primary"><Plus className="size-4" aria-hidden /> Nayi service</Link>
        </div>
      </div>

      <ActionForm action={saveRatesAction} className="mt-5">
        <div className="space-y-5">
          {categories.map((c, i) => (
            <section key={c.id} className="card overflow-hidden">
              <header className="flex flex-wrap items-center gap-2 bg-brand-50 px-4 py-2.5">
                <CategoryIcon name={c.icon} className="size-5 text-brand-600" />
                <h2 className="font-bold text-brand-900">{c.name}</h2>
                {i >= HOME_TILES && <span className="rounded bg-white px-1.5 py-0.5 text-xs">Sirf Explore All me</span>}
                <span className="flex-1" />
                <Link href={`/admin/categories/${c.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">
                  <Pencil className="size-3.5" aria-hidden /> Category edit
                </Link>
                <Link href={`/admin/services/new?category=${c.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">
                  <Plus className="size-4" aria-hidden /> Service
                </Link>
              </header>
              <ul className="divide-y divide-line">
                {services.filter((s) => s.categoryId === c.id).map((s) => (
                  <li key={s.id} className="grid gap-2 px-4 py-2.5 sm:grid-cols-[1fr_7rem_8rem_auto_auto] sm:items-center">
                    <div>
                      <label className="sr-only" htmlFor={`name_${s.id}`}>Service ka naam</label>
                      <input id={`name_${s.id}`} name={`name_${s.id}`} defaultValue={s.name} required maxLength={120} className="field !min-h-10" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden>₹</span>
                      <label className="sr-only" htmlFor={`price_${s.id}`}>{s.name} ka rate</label>
                      <input id={`price_${s.id}`} name={`price_${s.id}`} type="number" min={0} step={1} defaultValue={s.price} required className="field !min-h-10" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="sr-only" htmlFor={`eta_${s.id}`}>{s.name} kitne ghante me</label>
                      <input id={`eta_${s.id}`} name={`eta_${s.id}`} type="number" min={1} max={2160} step={1} defaultValue={s.etaHours} required className="field !min-h-10" />
                      <span className="text-sm text-muted" aria-hidden>ghante</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" name={`active_${s.id}`} defaultChecked={s.active} className="size-4" /> Dikhayein
                    </label>
                    <Link href={`/admin/services/${s.id}`} className="text-sm font-bold text-brand-600">Documents</Link>
                  </li>
                ))}
                {!services.some((s) => s.categoryId === c.id) && (
                  <li className="px-4 py-3 text-sm text-muted">Abhi koi service nahi. Bina service ki category website pe nahi dikhti.</li>
                )}
              </ul>
            </section>
          ))}
        </div>
        <div className="sticky bottom-0 mt-5 border-t border-line bg-surface py-3">
          <Submit className="btn btn-primary w-full">Sab save karein</Submit>
        </div>
      </ActionForm>
    </div>
  );
}
