import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Headphones } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { currentUser } from "@/lib/auth";
import { getSettings, listCategories } from "@/lib/queries";

export async function Header() {
  const user = await currentUser();
  const { phone, promo_on } = await getSettings();
  const categories = await listCategories();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-line">
      <div className="container-x relative flex items-center justify-between gap-3 h-[4.25rem]">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Mahato Net Cafe home">
          <Image src="/logo.png" alt="Mahato Net Cafe" width={119} height={100} priority className="h-14 w-auto" />
          <span className="leading-tight">
            <span className="block text-[15px] sm:text-lg font-bold text-brand-900">Mahato Net Cafe</span>
            <span className="hidden sm:block text-xs text-muted">Digital Sewa &amp; Customize Gifting</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 lg:gap-5 text-[15px]">
          <div className="group hidden md:block">
            <Link href="/services" className="flex items-center gap-1 px-2 py-2 hover:text-brand-600">
              Services <ChevronDown className="size-4 text-brand-600" aria-hidden />
            </Link>
            <div className="invisible absolute right-4 top-full w-[34rem] max-w-[calc(100vw-2rem)] pt-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <ul className="card grid grid-cols-2 gap-1 p-3">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/services/${c.slug}`} className="block rounded-lg px-3 py-2 hover:bg-brand-50">
                      <span className="block font-medium text-brand-900">{c.name}</span>
                      <span className="block text-xs text-muted">{c.tagline}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/orders"
            className={`whitespace-nowrap px-1 sm:px-2 py-2 hover:text-brand-600 ${user?.role === "admin" ? "hidden sm:block" : ""}`}
          >
            My Orders
          </Link>
          <Link href="/#faq" className="hidden md:block px-2 py-2 hover:text-brand-600">Support</Link>
          {promo_on === "1" && (
            <Link href="/shop-owners" className="hidden md:block whitespace-nowrap px-2 py-2 hover:text-brand-600">Shop Owners</Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className="px-2 py-2 font-medium text-accent-500 hover:text-accent-600">Admin</Link>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="btn-pill hidden lg:inline-flex">
              <Headphones className="size-4" aria-hidden /> Baat Karein
            </a>
          )}
          {user ? (
            <form action={logoutAction}><button className="btn-pill">Logout</button></form>
          ) : (
            <Link href="/login" className="btn-pill">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
