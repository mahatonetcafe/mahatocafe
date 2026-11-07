import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signupAction } from "@/app/actions";
import { SignupForm } from "@/components/AuthForms";
import { currentUser, safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Account banayein" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const next = safeNext((await searchParams).next);
  if (await currentUser()) redirect(next);

  return (
    <div className="container-x py-10 max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-900">Account banayein</h1>
        <p className="mt-1 mb-5 text-sm text-muted">Isi account me aapki receiving milegi</p>
        <SignupForm action={signupAction} next={next} />
        <p className="mt-5 text-center text-sm">
          Pehle se account hai?{" "}
          <Link className="font-bold text-brand-600" href={`/login?next=${encodeURIComponent(next)}`}>Login karein</Link>
        </p>
      </div>
    </div>
  );
}
