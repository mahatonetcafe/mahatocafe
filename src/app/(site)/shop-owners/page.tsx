import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { PROMO_ICONS } from "@/components/PromoSection";
import { PROMO_PRODUCTS, trackedUrl } from "@/lib/promo";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Cyber Cafe malikon ke liye",
  description: "QR Se Print aur Cyber Cafe Solution Software: ek cyber cafe ne, cyber cafe ke liye banaye software.",
};

export default async function ShopOwnersPage() {
  const settings = await getSettings();
  if (settings.promo_on !== "1") notFound();

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-x py-10 text-center">
          <p className="inline-block rounded-md bg-brand-100 px-2.5 py-1 text-xs font-bold tracking-wide text-brand-700">
            CYBER CAFE MALIKON KE LIYE
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-[#06070e] text-balance">
            Apni dukan ka kaam aasan banayein
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-muted">
            Ek cyber cafe ne, cyber cafe ke liye banaye software. Apni dukan ke hisab se chunein.
          </p>
        </div>
      </section>

      <section className="container-x pb-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {PROMO_PRODUCTS.map((p) => {
            const Icon = PROMO_ICONS[p.icon];
            return (
              <article key={p.key} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  {p.note && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">{p.note}</span>
                  )}
                </div>
                <p className="mt-3 text-xs font-bold text-brand-600">{p.audience}</p>
                <h2 className="text-xl font-bold text-brand-900">{p.name}</h2>
                <p className="mt-1.5 text-sm text-muted">{p.summary}</p>
                <ul className="mt-3 mb-5 space-y-2 text-sm">
                  {p.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden /> {point}
                    </li>
                  ))}
                </ul>
                <a
                  href={trackedUrl(settings[p.settingKey], "shop-owners-page")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-auto w-full"
                >
                  {p.cta} <ExternalLink className="size-4" aria-hidden />
                </a>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-center text-sm text-muted">Aaj ka rate aur offer product ke page pe milega.</p>
      </section>
    </>
  );
}
