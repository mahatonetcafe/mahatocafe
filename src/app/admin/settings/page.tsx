import { saveSettingsAction } from "../actions";
import { ActionForm, Submit } from "@/components/ActionForm";
import { requireAdmin } from "@/lib/auth";
import { githubStatus } from "@/lib/github";
import { PROMO_PRODUCTS } from "@/lib/promo";
import { razorpayConfigured } from "@/lib/razorpay";
import { getSettings } from "@/lib/queries";

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  const github = await githubStatus();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-brand-900">Settings</h1>
      <p className={`mt-3 rounded-lg border p-3 text-sm ${razorpayConfigured() ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {razorpayConfigured() ? "Razorpay connected hai." : "Razorpay connected nahi hai. Keys .env.local me daalein."}
      </p>
      <p className={`mt-2 rounded-lg border p-3 text-sm ${github.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {github.detail}
      </p>
      <ActionForm action={saveSettingsAction} className="card mt-5 p-5 space-y-4">
        <div>
          <label className="label" htmlFor="phone">Phone (10 ank)</label>
          <input id="phone" name="phone" inputMode="numeric" maxLength={10} defaultValue={s.phone} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">WhatsApp (10 ank)</label>
          <input id="whatsapp" name="whatsapp" inputMode="numeric" maxLength={10} defaultValue={s.whatsapp} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={s.email} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="hours">Dukan ka samay</label>
          <input id="hours" name="hours" defaultValue={s.hours} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="address">Dukan ka pata</label>
          <textarea id="address" name="address" rows={2} defaultValue={s.address} className="field" />
        </div>
        <fieldset className="space-y-4 rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-bold text-brand-900">Android App</legend>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="app_beta" defaultChecked={s.app_beta === "1"} className="size-4" />
            Beta testing chalu hai
          </label>
          <p className="-mt-2 text-xs text-muted">Tick hatane par homepage se Beta Group aur Beta App hat jayenge, sirf Google Play button rahega.</p>
          <div>
            <label className="label" htmlFor="beta_group_url">Beta testing group ka link</label>
            <input id="beta_group_url" name="beta_group_url" type="url" defaultValue={s.beta_group_url} className="field" placeholder="https://groups.google.com/..." />
          </div>
          <div>
            <label className="label" htmlFor="beta_app_url">Beta app download link</label>
            <input id="beta_app_url" name="beta_app_url" type="url" defaultValue={s.beta_app_url} className="field" placeholder="https://play.google.com/apps/testing/..." />
          </div>
          <div>
            <label className="label" htmlFor="app_url">Play Store ka asli link</label>
            <input id="app_url" name="app_url" type="url" defaultValue={s.app_url} className="field" placeholder="https://play.google.com/store/apps/details?id=..." />
          </div>
        </fieldset>
        <fieldset className="space-y-4 rounded-xl border border-line p-4">
          <legend className="px-1 text-sm font-bold text-brand-900">QR Se Print promotion</legend>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="promo_on" defaultChecked={s.promo_on === "1"} className="size-4" />
            Website pe products dikhayein
          </label>
          <p className="-mt-2 text-xs text-muted">Tick hatane par Shop Owners page, header link, homepage strip, banner aur footer column sab hat jayenge.</p>
          {PROMO_PRODUCTS.map((p) => (
            <div key={p.key}>
              <label className="label" htmlFor={p.settingKey}>{p.name} ka link</label>
              <input id={p.settingKey} name={p.settingKey} type="url" required defaultValue={s[p.settingKey]} className="field" />
            </div>
          ))}
        </fieldset>
        <Submit className="btn btn-primary w-full">Save karein</Submit>
      </ActionForm>
    </div>
  );
}
