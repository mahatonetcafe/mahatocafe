import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Clock, CreditCard, Download, FileUp, Headphones, Lock, MapPin, Navigation, Phone, ShieldCheck, Star } from "lucide-react";
import { AppSection } from "@/components/AppSection";
import { BannerCarousel } from "@/components/BannerCarousel";
import { HeroSearch } from "@/components/HeroSearch";
import { PromoSection } from "@/components/PromoSection";
import { CategoryIcon } from "@/components/icons";
import { HOME_TILES, getSettings, listCategories, listServices, searchItems, type Service } from "@/lib/queries";
import { SHOP } from "@/lib/shop";
import { rupees } from "@/lib/status";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: FileUp, title: "Service chunein", text: "Apna kaam chunein aur zaroori document upload karein." },
  { icon: CreditCard, title: "Payment karein", text: "UPI, card ya net banking se online pay karein." },
  { icon: Headphones, title: "Hum apply karenge", text: "Hamari team aapka form apply karegi." },
  { icon: Download, title: "Receiving download", text: "Receiving ready hote hi apne account se download karein." },
];

const REASONS = [
  { icon: Clock, title: "24 ghante", text: "zyadatar kaam aur receiving ek din me ready", cls: "border-l-indigo-700 text-indigo-700" },
  { icon: FileUp, title: "Ghar baithe", text: "mobile se document upload karein, dukan aane ki zaroorat nahi", cls: "border-l-sky-500 text-sky-600" },
  { icon: Lock, title: "Private", text: "aapke documents sirf hum dekhte hain, sirf aapke kaam ke liye", cls: "border-l-emerald-500 text-emerald-600" },
  { icon: Headphones, title: "Local madad", text: "aapke apne ilaake ka cyber cafe, koi call center nahi", cls: "border-l-amber-500 text-amber-600" },
];

const FAQS = [
  {
    q: "Payment kaise karna hai?",
    a: "Form bharne ke baad Pay button dabayein. UPI, card, net banking ya wallet se pay kar sakte hain. Payment hote hi hamara kaam shuru ho jata hai.",
  },
  {
    q: "Receiving kab milegi?",
    a: "Har service ke saath samay likha hota hai. Zyadatar kaam 24 ghante me ho jaata hai. Receiving ready hote hi My Orders me dikh jayegi.",
  },
  {
    q: "Document galat upload ho gaya to?",
    a: "Hum aapko bata denge ki kya sudharna hai. My Orders me jaakar sahi document dobara bhej sakte hain.",
  },
  {
    q: "Kya yeh sarkari website hai?",
    a: "Nahi. Mahato Net Cafe ek private cyber cafe hai jo aapki taraf se online apply karta hai. Sarkari kaam ka aakhri faisla sambandhit vibhag ka hota hai.",
  },
];

const CHIPS = ["new-pan", "pan-correction", "new-voter", "income-certificate", "job-form", "aadhaar-address", "resume", "photo-mug"];

function Panel({ title, tint, items }: { title: string; tint: string; items: Service[] }) {
  return (
    <section className="rounded-xl border border-line bg-white p-3">
      <h3 className={`rounded-lg px-4 py-5 text-lg font-bold text-brand-900 ${tint}`}>{title}</h3>
      <ul className="mt-1 divide-y divide-line">
        {items.map((s) => (
          <li key={s.id}>
            <Link href={`/service/${s.slug}`} className="flex items-center justify-between gap-3 px-2 py-3 text-sm hover:text-brand-600">
              <span>{s.name}</span>
              <span className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-brand-900">{rupees(s.price)}</span>
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function Home() {
  // The Android app identifies itself, and asking users to download it from inside it makes no sense.
  const inApp = (await headers()).get("user-agent")?.includes("MahatoNetCafeApp") ?? false;
  const categories = await listCategories();
  const services = await listServices();
  const { phone, address, hours, app_url, app_beta, beta_group_url, beta_app_url, promo_on } = await getSettings();
  const showPromo = promo_on === "1";
  const bySlug = (slug: string) => services.find((s) => s.slug === slug);
  const pick = (slugs: string[]) => slugs.map(bySlug).filter((s) => s !== undefined);
  const startingPrice = (categoryId: number) => {
    const list = services.filter((s) => s.categoryId === categoryId);
    return list.length ? Math.min(...list.map((s) => s.price)) : null;
  };
  const withServices = categories.filter((c) => startingPrice(c.id) !== null);
  const tiles = withServices.slice(0, HOME_TILES);
  const frameRates = services.filter((s) => s.slug.startsWith("insta-frame-")).map((s) => s.price);
  const bannerPrices: Record<string, string> = Object.fromEntries(
    withServices.map((c) => [c.slug, `${rupees(startingPrice(c.id)!)} se shuru`]),
  );
  const mug = bySlug("photo-mug");
  if (mug) bannerPrices["photo-mug"] = rupees(mug.price);
  if (frameRates.length) {
    bannerPrices["insta-frame"] = `${rupees(Math.min(...frameRates))} se ${rupees(Math.max(...frameRates))}`;
  }

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 via-[#f7fbfe] to-white">
        <div className="container-x pt-5 pb-2 grid gap-5 md:grid-cols-[minmax(0,26rem)_1fr] md:items-center">
          <BannerCarousel prices={bannerPrices} showPromo={showPromo} />
          <div className="md:pl-6">
            <h1 className="text-2xl sm:text-[2rem] font-medium text-[#06070e] leading-tight text-balance">
              Har online kaam, <span className="font-bold text-brand-900">ab ghar baithe</span>
            </h1>
            <p className="mt-2 text-muted">Service chunein, document bhejein, receiving download karein.</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <a href={SHOP.mapsUrl} className="inline-flex items-center gap-1 font-medium hover:text-brand-600">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden /> {SHOP.rating} Google rating ({SHOP.reviews} reviews)
              </a>
              <span className="inline-flex items-center gap-1 text-muted">
                <MapPin className="size-4" aria-hidden /> Baliapur, Dhanbad
              </span>
            </p>
            <div className="mt-4"><HeroSearch items={await searchItems()} /></div>
          </div>
        </div>
      </section>

      <section className="container-x pt-6 pb-8">
        <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-x-3 gap-y-5">
          {tiles.map((c) => {
            const from = startingPrice(c.id)!;
            return (
              <li key={c.id}>
                <Link href={`/services/${c.slug}`} className="group block text-center">
                  <span className="block overflow-hidden rounded-xl border border-[#e8e8f2] bg-tile transition-shadow group-hover:shadow-card group-hover:border-brand-200">
                    <span className="block bg-tag py-0.5 text-[11px] font-medium text-tag-ink">
                      {rupees(from)} se shuru
                    </span>
                    <span className="grid h-[3.75rem] place-items-center">
                      <CategoryIcon name={c.icon} className="size-8 text-brand-600" />
                    </span>
                  </span>
                  <span className="mt-2 block text-[13px] leading-snug group-hover:text-brand-600">{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 text-center">
          <Link href="/services" className="btn-pill">Explore All</Link>
        </div>
      </section>

      <section className="container-x">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-brand-900 to-[#0a86c9] px-5 py-4 text-white">
          <p className="font-medium">Pehle se apply kiya hai? Apna kaam track karein aur receiving download karein.</p>
          <Link href="/orders" className="shrink-0 rounded-lg bg-white px-5 py-2 font-bold text-brand-900">Track Order</Link>
        </div>
      </section>

      {showPromo && <PromoSection />}

      <section className="container-x pt-8">
        <h2 className="text-xs font-bold tracking-wide text-brand-600">SABSE ZYADA LIYE JAANE WALE KAAM</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {pick(CHIPS).map((s) => (
            <li key={s.id}>
              <Link href={`/service/${s.slug}`} className="block rounded-xl border border-line bg-white px-3 py-2 shadow-card hover:border-brand-200">
                <span className="block text-[11px] text-muted"><span className="text-accent-500">●</span> {s.categoryName}</span>
                <span className="block text-sm font-medium text-brand-900">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x py-10 grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-center">
        <h2 className="text-2xl font-light text-[#06070e] leading-snug">
          Online kaam ke liye <span className="font-bold">Mahato Net Cafe</span> hi <span className="font-bold">kyun</span> chunein?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text, cls }) => (
            <li key={title} className={`card border-l-2 p-4 ${cls}`}>
              <Icon className="size-6" aria-hidden />
              <p className="mt-2 font-bold">{title}</p>
              <p className="mt-1 text-sm text-ink">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {!inApp && (
        <AppSection
          tiles={tiles.slice(0, 6)}
          links={{ playUrl: app_url, beta: app_beta === "1", groupUrl: beta_group_url, betaUrl: beta_app_url }}
        />
      )}

      <section className="bg-surface border-y border-line">
        <div className="container-x py-10">
          <h2 className="text-2xl font-bold text-center text-[#06070e]">Kaise kaam karta hai</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card p-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-7 text-brand-600" aria-hidden />
                  <span className="text-sm font-medium text-muted">Step {i + 1}</span>
                </div>
                <h3 className="mt-3 font-bold text-brand-900">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-x py-10">
        <h2 className="text-2xl font-bold text-center text-[#06070e]">Popular services aur rate</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Panel title="ID card" tint="bg-[#fdeeed]" items={pick(["new-pan", "pan-correction", "new-voter", "aadhaar-address"])} />
          <Panel title="Form aur certificate" tint="bg-[#e3f9ec]" items={pick(["job-form", "income-certificate", "caste-certificate", "scholarship-form"])} />
        </div>
      </section>

      <section className="bg-surface border-y border-line">
        <div className="container-x py-10 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#06070e]">Hamari dukan pe aayein</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2"><MapPin className="size-5 shrink-0 text-brand-600" aria-hidden /> {address}</li>
              <li className="flex gap-2"><Clock className="size-5 shrink-0 text-brand-600" aria-hidden /> {hours}</li>
              {phone && <li className="flex gap-2"><Phone className="size-5 shrink-0 text-brand-600" aria-hidden /> {phone}</li>}
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              {phone && <a href={`tel:${phone}`} className="btn btn-primary"><Phone className="size-4" aria-hidden /> Call karein</a>}
              <a href={SHOP.mapsUrl} className="btn btn-ghost"><Navigation className="size-4" aria-hidden /> Rasta dekhein</a>
            </div>
          </div>
          <iframe
            title="Mahato Net Cafe ka map"
            src={SHOP.mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full rounded-xl border border-line bg-white"
          />
        </div>
      </section>

      <section id="faq" className="container-x py-10 max-w-3xl scroll-mt-20">
        <h2 className="text-2xl font-bold text-center text-[#06070e]">Sawal jawab</h2>
        <div className="mt-5 divide-y divide-line card">
          {FAQS.map((f) => (
            <details key={f.q} className="p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-muted">
          <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
          {phone ? <>Madad chahiye? Call karein <a className="font-bold text-brand-600" href={`tel:${phone}`}>{phone}</a></> : "Madad chahiye? Dukan pe aakar milein."}
        </p>
      </section>
    </>
  );
}
