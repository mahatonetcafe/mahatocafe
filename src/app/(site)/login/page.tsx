import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { LoginForm } from "@/components/AuthForms";
import { currentUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Login" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);

  return (
    <div className="container-x py-10 max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-900">Login karein</h1>
        <p className="mt-1 mb-5 text-sm text-muted">Apne orders aur receiving dekhne ke liye</p>
        <LoginForm action={loginAction} next={next} />
        <p className="mt-5 text-center text-sm">
          Naya account chahiye?{" "}
          <Link className="font-bold text-brand-600" href={`/signup?next=${encodeURIComponent(next)}`}>Account banayein</Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">Password bhool gaye? Dukan pe sampark karein.</p>
      </div>
    </div>
  );
}
