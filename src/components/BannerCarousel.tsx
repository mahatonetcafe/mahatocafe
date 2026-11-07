"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

const BANNERS = [
  {
    tag: "PAN CARD",
    title: "Naya PAN ya correction",
    sub: "Ghar baithe document upload karein.",
    category: "pan-card",
    href: "/services/pan-card",
    cta: "Apply karein",
    image: "/banners/pan.svg",
    alt: "PAN card ka namuna",
    imgCls: "w-40 sm:w-44 rounded-lg",
    cls: "from-[#1a0f63] to-[#0a86c9]",
  },
  {
    tag: "INSURANCE",
    title: "Bike aur car third party insurance",
    sub: "Naya ya renewal, hum karwa denge.",
    category: "",
    href: "/services/insurance",
    cta: "Insurance dekhein",
    image: "/banners/insurance.svg",
    alt: "Bike aur car ki suraksha wali shield",
    imgCls: "h-40 sm:h-44",
    cls: "from-[#0b5d3b] to-[#16a34a]",
  },
  {
    tag: "PHOTO MUG",
    title: "Apni photo wala coffee mug",
    sub: "Birthday ya anniversary ka best gift.",
    category: "photo-mug",
    href: "/service/photo-mug",
    cta: "Mug dekhein",
    image: "/banners/mug.webp",
    alt: "Family ki photo wala coffee mug",
    imgCls: "w-44 sm:w-52",
    cls: "from-[#b3050f] to-[#f0542d]",
  },
  {
    tag: "INSTAGRAM STYLE FRAME",
    title: "Viral photo frame banwayein",
    sub: "Aapki photo, Instagram post jaise design me.",
    category: "insta-frame",
    href: "/services/custom-gifting",
    cta: "Frame dekhein",
    image: "/banners/frame.webp",
    alt: "Instagram post jaisa design wala photo frame",
    imgCls: "h-44 sm:h-48 rounded-lg",
    cls: "from-[#833ab4] via-[#e1306c] to-[#f77737]",
  },
  {
    tag: "CYBER CAFE MALIK?",
    title: "Apni dukan ko smart banayein",
    sub: "QR se auto print aur 20 tools wala software.",
    category: "",
    href: "/shop-owners",
    cta: "Dekhein",
    image: "/banners/shop.svg",
    alt: "QR scan karke printer se print",
    imgCls: "w-40 sm:w-44",
    cls: "from-[#3b1a8f] to-[#7b3fe4]",
  },
];

/** Prices are passed in so a rate changed in admin shows up here too. */
export function BannerCarousel({ prices, showPromo }: { prices: Record<string, string>; showPromo: boolean }) {
  const banners = showPromo ? BANNERS : BANNERS.filter((b) => b.href !== "/shop-owners");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [paused, banners.length]);

  const b = banners[i];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.cls} p-5 sm:p-6 text-white min-h-[14rem] transition-colors`}>
        <div className="relative z-10 max-w-[56%]">
          <p className="inline-block rounded-md bg-white/20 px-2.5 py-1 text-[11px] font-bold tracking-wide">{b.tag}</p>
          <h2 className="mt-3 text-xl sm:text-2xl font-bold leading-tight">{b.title}</h2>
          <p className="mt-1 text-sm text-white/85">{b.sub}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Link href={b.href} className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-bold text-brand-900">
              {b.cta} <ChevronRight className="size-4" aria-hidden />
            </Link>
            {prices[b.category] && <span className="text-base font-black">{prices[b.category]}</span>}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.image}
          alt={b.alt}
          className={`absolute right-3 top-1/2 max-w-[42%] -translate-y-1/2 rotate-2 object-contain drop-shadow-xl ${b.imgCls}`}
        />
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {banners.map((x, n) => (
          <button
            key={x.tag}
            onClick={() => setI(n)}
            aria-label={`${x.tag} banner dikhayein`}
            aria-current={n === i}
            className={`size-3 rounded-full ${n === i ? "bg-brand-600" : "bg-brand-200"}`}
          />
        ))}
      </div>
    </div>
  );
}
