import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { SHOP } from "@/lib/shop";

export const metadata: Metadata = { title: "Sampark karein" };

export default async function ContactPage() {
  const { phone, whatsapp, email, address, hours } = await getSettings();

  return (
    <div className="container-x py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">Sampark karein</h1>
      <p className="mt-1 text-muted">Order ya service ke baare me kuch poochna ho to hamse baat karein.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
        <ul className="card p-5 space-y-4 text-sm">
          <li className="flex gap-3">
            <MapPin className="size-5 shrink-0 text-brand-600" aria-hidden />
            <span><b className="block">Mahato Net Cafe</b>{address}</span>
          </li>
          {phone && (
            <li className="flex gap-3">
              <Phone className="size-5 shrink-0 text-brand-600" aria-hidden />
              <a className="font-bold text-brand-600" href={`tel:${phone}`}>{phone}</a>
            </li>
          )}
          {whatsapp && (
            <li className="flex gap-3">
              <MessageCircle className="size-5 shrink-0 text-brand-600" aria-hidden />
              <a className="font-bold text-brand-600" href={`https://wa.me/91${whatsapp}`}>{whatsapp}</a>
            </li>
          )}
          {email && (
            <li className="flex gap-3">
              <Mail className="size-5 shrink-0 text-brand-600" aria-hidden />
              <a className="font-bold text-brand-600 break-all" href={`mailto:${email}`}>{email}</a>
            </li>
          )}
          <li className="flex gap-3">
            <Clock className="size-5 shrink-0 text-brand-600" aria-hidden /> {hours}
          </li>
          <li>
            <a href={SHOP.mapsUrl} className="btn btn-ghost w-full">
              <Navigation className="size-4" aria-hidden /> Rasta dekhein
            </a>
          </li>
        </ul>
        <iframe
          title="Mahato Net Cafe ka map"
          src={SHOP.mapsEmbed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full rounded-xl border border-line bg-white"
        />
      </div>
    </div>
  );
}
