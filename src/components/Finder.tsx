"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ServiceCard, type ServiceCardData } from "./ServiceCard";

export const QUICK_KEY = "mnc_quick_details";

export function readQuick(): { name: string; mobile: string } | null {
  try {
    const raw = sessionStorage.getItem(QUICK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type Option = { label: string; picks: string[] };

export function Finder({
  categoryName, question, options, services,
}: { categoryName: string; question: string; options: Option[]; services: ServiceCardData[] }) {
  // A category with no question goes straight to its services.
  const [step, setStep] = useState(options.length ? 0 : 2);
  const [picks, setPicks] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = readQuick();
    if (saved) { setName(saved.name); setMobile(saved.mobile); }
  }, []);

  const hasDetails = name.trim().length > 1 && /^[6-9]\d{9}$/.test(mobile);

  const ordered = useMemo(() => {
    const chosen = picks.flatMap((p) => services.filter((s) => s.slug === p));
    return { chosen, rest: services.filter((s) => !picks.includes(s.slug)) };
  }, [picks, services]);

  function pick(o: Option) {
    setPicks(o.picks);
    setStep(hasDetails ? 2 : 1);
  }

  function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Apna naam likhein");
    if (!/^[6-9]\d{9}$/.test(mobile)) return setError("10 ank ka sahi mobile number likhein");
    setError("");
    try {
      sessionStorage.setItem(QUICK_KEY, JSON.stringify({ name: name.trim(), mobile }));
    } catch { /* details are only a convenience */ }
    setStep(2);
  }

  if (step === 2) {
    return (
      <div>
        {options.length > 0 && (
          <button onClick={() => setStep(0)} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
            <ArrowLeft className="size-4" aria-hidden /> Jawab badlein
          </button>
        )}
        <h2 className="text-xl font-bold text-brand-900">
          {name ? `${name.split(" ")[0]}, ` : ""}yeh rahi aapke liye {categoryName} services
        </h2>
        <div className="mt-5 space-y-5">
          {ordered.chosen.map((s) => <ServiceCard key={s.slug} s={s} highlight />)}
        </div>
        {ordered.rest.length > 0 && (
          <>
            {ordered.chosen.length > 0 && <h3 className="mt-8 font-bold text-muted">Baaki {categoryName} services</h3>}
            <div className="mt-5 space-y-5">
              {ordered.rest.map((s) => <ServiceCard key={s.slug} s={s} />)}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-xl p-5 sm:p-7">
      <div className="flex items-center gap-2" aria-hidden>
        {[0, 1].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-brand-500" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-3 text-xs font-bold text-muted">Step {step + 1} of 2</p>

      {step === 0 && (
        <>
          <h2 className="mt-1 text-xl font-bold text-brand-900">{question}</h2>
          <ul className="mt-4 space-y-2.5">
            {options.map((o) => (
              <li key={o.label}>
                <button
                  onClick={() => pick(o)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-3.5 text-left font-semibold hover:border-brand-500 hover:bg-brand-50"
                >
                  {o.label} <ArrowRight className="size-4 shrink-0 text-brand-600" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => { setPicks([]); setStep(2); }} className="mt-4 text-sm font-semibold text-brand-600">
            Sabhi {categoryName} services dekhein
          </button>
        </>
      )}

      {step === 1 && (
        <form onSubmit={saveDetails}>
          <h2 className="mt-1 text-xl font-bold text-brand-900">Apni thodi jaankari dein</h2>
          <p className="text-sm text-muted">Isse aage ka form apne aap bhar jayega.</p>
          <div className="mt-4 space-y-3.5">
            <div>
              <label className="label" htmlFor="q-name">Aapka naam</label>
              <input id="q-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="q-mobile">Mobile number</label>
              <input
                id="q-mobile" className="field" inputMode="numeric" maxLength={10} value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} autoComplete="tel-national"
              />
            </div>
          </div>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
          <button className="btn btn-primary mt-5 w-full">
            <Check className="size-4" aria-hidden /> Service dekhein
          </button>
          <button type="button" onClick={() => setStep(0)} className="mt-3 w-full text-sm font-semibold text-brand-600">
            Peeche jaayein
          </button>
        </form>
      )}
    </div>
  );
}
