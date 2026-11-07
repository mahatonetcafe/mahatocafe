import Link from "next/link";
import { ArrowRight, Layers, QrCode, Smartphone } from "lucide-react";
import { PROMO_PRODUCTS, trackedUrl, type PromoProduct } from "@/lib/promo";
import { getSettings } from "@/lib/queries";

export const PROMO_ICONS = { qr: QrCode, tools: Layers, phone: Smartphone } satisfies Record<PromoProduct["icon"], unknown>;

/** Homepage block for cafe owners. Each card goes straight to that product's page. */
export async function PromoSection() {
  const settings = await getSettings();

  return (
    <section className="container-x pt-6">
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-lg font-bold text-brand-900">Cyber cafe chalate hain? Hamare software dekhein</h2>
          <Link href="/shop-owners" className="inline-flex items-center gap-1 text-sm font-bold text-brand-600">
            Sabhi dekhein <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {PROMO_PRODUCTS.map((p) => {
            const Icon = PROMO_ICONS[p.icon];
            return (
              <li key={p.key}>
                <a
                  href={trackedUrl(settings[p.settingKey], "homepage")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex h-full flex-col p-4 transition-shadow hover:shadow-lift hover:border-brand-200"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold text-brand-600">{p.audience}</span>
                      <span className="block font-bold leading-tight text-brand-900">{p.name}</span>
                    </span>
                  </span>
                  <span className="mt-2 block flex-1 text-sm text-muted">{p.summary}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-accent-500">
                    {p.cta} <ArrowRight className="size-4" aria-hidden />
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
