import type { Metadata } from "next";
import Link from "next/link";
import { deleteAccountAction } from "@/app/actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { currentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Account delete karein",
  description: "Mahato Net Cafe website aur Android app ka account aur usse judi jaankari delete karein.",
};

type Props = { searchParams: Promise<{ done?: string }> };

export default async function DeleteAccountPage({ searchParams }: Props) {
  const done = (await searchParams).done === "1";
  const user = await currentUser();

  if (done && !user) {
    return (
      <div className="container-x py-10 max-w-xl">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-brand-900">Aapka account delete ho gaya</h1>
          <p className="mt-2 text-sm text-muted">Aapki jaankari hata di gayi hai. Hamari seva lene ke liye dhanyavaad.</p>
          <Link href="/" className="btn btn-primary mt-5">Homepage pe jayein</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10 max-w-xl">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-brand-900">Account delete karein</h1>
        <p className="mt-2 text-sm text-muted">Ye Mahato Net Cafe ki website aur Android app, dono ka ek hi account hai.</p>

        <h2 className="mt-5 font-bold text-brand-900">Kya delete hoga</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          <li>Aapka naam, mobile number aur password</li>
          <li>Form me bhari gayi jaankari</li>
          <li>Upload kiye gaye documents aur receiving</li>
        </ul>

        <h2 className="mt-5 font-bold text-brand-900">Kya rahega</h2>
        <p className="mt-1 text-sm">
          Jis order ka payment hua hai, uska order number, service, rashi aur payment ID hisaab aur kanooni zaroorat ke
          liye rehta hai. Usme aapka naam ya mobile number nahi hota.
        </p>

        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          Delete hone ke baad account aur receiving wapas nahi aayenge. Jo receiving chahiye, pehle download kar lein.
        </p>

        {!user && (
          <>
            <p className="mt-5 text-sm">Delete karne ke liye pehle apne account me login karein.</p>
            <Link href="/login?next=/delete-account" className="btn btn-primary mt-3">Login karein</Link>
          </>
        )}
        {user?.role === "admin" && (
          <p className="mt-5 text-sm font-semibold">Admin account yahan se delete nahi hota.</p>
        )}
        {user?.role === "customer" && (
          <ActionForm action={deleteAccountAction} className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="password">Apna password likhein</label>
              <input id="password" name="password" type="password" className="field" required autoComplete="current-password" />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="confirm" required className="mt-0.5 size-4" />
              <span>Mai samajhta hun ki mera account hamesha ke liye delete ho jayega.</span>
            </label>
            <Submit className="btn w-full bg-red-700 text-white hover:bg-red-800" pendingText="Delete ho raha hai…">
              Account delete karein
            </Submit>
          </ActionForm>
        )}
      </div>
    </div>
  );
}
