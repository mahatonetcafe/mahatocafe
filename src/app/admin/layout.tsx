import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-30 bg-brand-900 text-white">
        <div className="container-x flex h-14 items-center gap-3 sm:gap-5 text-sm font-medium">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="rounded-md bg-white p-0.5">
              <Image src="/logo.png" alt="" width={36} height={30} className="h-7 w-auto" />
            </span>
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <Link href="/admin" className="hover:text-brand-200">Orders</Link>
          <Link href="/admin/services" className="hover:text-brand-200">Services aur Rate</Link>
          <Link href="/admin/settings" className="hover:text-brand-200">Settings</Link>
          <span className="flex-1" />
          <Link href="/" className="hidden sm:block hover:text-brand-200">Website</Link>
          <form action={logoutAction}><button className="hover:text-brand-200 cursor-pointer">Logout</button></form>
        </div>
      </header>
      <main className="container-x py-6">{children}</main>
    </div>
  );
}
