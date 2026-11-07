import Image from "next/image";
import Link from "next/link";
import { PROMO_PRODUCTS, trackedUrl } from "@/lib/promo";
import { getSettings } from "@/lib/queries";
import { SHOP } from "@/lib/shop";

export async function Footer() {
  const settings = await getSettings();
  const { phone, whatsapp, email, address, hours, promo_on } = settings;
  return (
    <footer className="mt-auto bg-brand-900 text-white/80 text-sm">
      <div className={`container-x py-10 grid gap-8 sm:grid-cols-2 ${promo_on === "1" ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
        <div>
          <span className="mb-3 inline-block rounded-xl bg-white p-1.5">
            <Image src="/logo.png" alt="Mahato Net Cafe" width={119} height={100} className="h-20 w-auto" />
          </span>
          <p className="font-bold text-white text-base">Mahato Net Cafe</p>
          <p className="mt-1">Digital Sewa & Customize Gifting</p>
          {address && <p className="mt-2">{address}</p>}
        </div>
        <div>
          <p className="font-bold text-white">Quick links</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link className="hover:text-white" href="/services">Explore All</Link></li>
            <li><Link className="hover:text-white" href="/orders">My Orders</Link></li>
            <li><Link className="hover:text-white" href="/#faq">Sawal jawab</Link></li>
            <li><Link className="hover:text-white" href="/contact">Sampark karein</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white">Policies</p>
          <ul className="mt-2 space-y-1.5">
            <li><Link className="hover:text-white" href="/policy/refund">Refund aur Cancellation</Link></li>
            <li><Link className="hover:text-white" href="/policy/terms">Terms aur Conditions</Link></li>
            <li><Link className="hover:text-white" href="/policy/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-white" href="/policy/delivery">Service Delivery</Link></li>
          </ul>
        </div>
        {promo_on === "1" && (
          <div>
            <p className="font-bold text-white">Hamare Products</p>
            <ul className="mt-2 space-y-1.5">
              {PROMO_PRODUCTS.map((p) => (
                <li key={p.key}>
                  <a className="hover:text-white" href={trackedUrl(settings[p.settingKey], "footer")} target="_blank" rel="noopener noreferrer">
                    {p.name}
                  </a>
                </li>
              ))}
              <li><Link className="hover:text-white" href="/shop-owners">Shop Owners</Link></li>
            </ul>
          </div>
        )}
        <div>
          <p className="font-bold text-white">Sampark</p>
          <ul className="mt-2 space-y-1.5">
            {phone && <li><a className="hover:text-white" href={`tel:${phone}`}>Call: {phone}</a></li>}
            {whatsapp && (
              <li><a className="hover:text-white" href={`https://wa.me/91${whatsapp}`}>WhatsApp: {whatsapp}</a></li>
            )}
            {!phone && !whatsapp && <li>Dukan pe aakar milein</li>}
            {email && <li><a className="hover:text-white break-all" href={`mailto:${email}`}>{email}</a></li>}
            {hours && <li>{hours}</li>}
            <li><a className="hover:text-white" href={SHOP.mapsUrl}>Dukan ka rasta</a></li>
            <li className="flex gap-3 pt-1">
              <a href={SHOP.facebook} aria-label="Facebook" className="transition-opacity hover:opacity-80">
                <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
                  <circle cx="12" cy="12" r="12" fill="#fff" />
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
              <a href={SHOP.instagram} aria-label="Instagram" className="transition-opacity hover:opacity-80">
                <svg viewBox="0 0 24 24" className="size-8" aria-hidden>
                  <defs>
                    <linearGradient id="ig" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0" stopColor="#feda75" />
                      <stop offset="0.35" stopColor="#fa7e1e" />
                      <stop offset="0.65" stopColor="#d62976" />
                      <stop offset="1" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig)" />
                  <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3.3" fill="none" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="16.3" cy="7.7" r="1" fill="#fff" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="container-x py-4 text-xs text-white/70">
          Mahato Net Cafe ek private cyber cafe hai, koi sarkari website ya vibhag nahi. Yahan li gayi rashi hamari
          seva ka shulk hai. Aapke documents sirf aapka kaam karne ke liye use hote hain.
        </p>
      </div>
    </footer>
  );
}
