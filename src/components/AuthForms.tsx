"use client";

import { useEffect, useState } from "react";
import { ActionForm, Submit, type FormState } from "./ActionForm";
import { CaptchaField } from "./CaptchaField";
import { readQuick } from "./Finder";

type Action = (prev: FormState, data: FormData) => Promise<FormState>;

export function LoginForm({ action, next }: { action: Action; next: string }) {
  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="mobile">Mobile number</label>
        <input id="mobile" name="mobile" className="field" inputMode="numeric" maxLength={10} required autoComplete="username" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="field" required autoComplete="current-password" />
      </div>
      <CaptchaField />
      <Submit className="btn btn-primary w-full">Login</Submit>
    </ActionForm>
  );
}

export function SignupForm({ action, next }: { action: Action; next: string }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  // Carry over what the customer already typed in the service finder.
  useEffect(() => {
    const q = readQuick();
    if (q) { setName(q.name); setMobile(q.mobile); }
  }, []);

  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="name">Aapka naam</label>
        <input id="name" name="name" className="field" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="mobile">Mobile number</label>
        <input
          id="mobile" name="mobile" className="field" inputMode="numeric" maxLength={10} required autoComplete="username"
          value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Password banayein</label>
        <input id="password" name="password" type="password" className="field" required minLength={8} autoComplete="new-password" />
        <p className="mt-1 text-xs text-muted">Kam se kam 8 akshar</p>
      </div>
      <CaptchaField />
      <Submit className="btn btn-primary w-full">Account banayein</Submit>
    </ActionForm>
  );
}
