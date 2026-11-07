"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useFormAttempt } from "./ActionForm";

type Challenge = { id: string; image: string };

/** Loads a new challenge at the start and after every submit, since each one works once. */
export function CaptchaField() {
  const attempt = useFormAttempt();
  const input = useRef<HTMLInputElement>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const load = useCallback(async () => {
    if (input.current) input.current.value = "";
    try {
      const res = await fetch("/api/captcha", { cache: "no-store" });
      setChallenge((await res.json()) as Challenge);
    } catch {
      setChallenge(null);
    }
  }, []);

  useEffect(() => { load(); }, [load, attempt]);

  return (
    <div>
      <label className="label" htmlFor="captcha">CAPTCHA</label>
      <input type="hidden" name="captcha_id" value={challenge?.id ?? ""} />
      <div className="flex items-center gap-2">
        <div className="h-14 w-[180px] shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
          {challenge && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={challenge.image} alt="CAPTCHA code" width={180} height={56} />
          )}
        </div>
        <button
          type="button"
          onClick={load}
          aria-label="Naya CAPTCHA"
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg border border-line text-brand-600 hover:bg-brand-50"
        >
          <RefreshCw className="size-5" aria-hidden />
        </button>
      </div>
      <input
        ref={input}
        id="captcha"
        name="captcha"
        required
        maxLength={5}
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="Upar likha code bharein"
        className="field mt-2 uppercase placeholder:normal-case"
      />
    </div>
  );
}
