"use client";

import { createContext, startTransition, useActionState, useContext } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export type FormState = { error?: string; ok?: string };
type Action = (prev: FormState, data: FormData) => Promise<FormState>;

const Pending = createContext(false);
const Attempt = createContext<FormState>({});

/** Changes each time the form finishes a submit. */
export const useFormAttempt = () => useContext(Attempt);

/**
 * Submits to a server action and shows its error. Submitting by hand, instead of
 * through <form action>, stops React clearing typed text and chosen files on error.
 */
export function ActionForm({
  action, className, children,
}: { action: Action; className?: string; children: React.ReactNode }) {
  const [state, run, pending] = useActionState<FormState, FormData>(async (prev, data) => {
    const next = await action(prev, data);
    return next ?? {};
  }, {});

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => run(data));
      }}
    >
      <Pending.Provider value={pending}>
        <Attempt.Provider value={state}>{children}</Attempt.Provider>
      </Pending.Provider>
      {state.error && (
        <p role="alert" className="mt-3 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
          <AlertCircle className="size-5 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          {state.ok}
        </p>
      )}
    </form>
  );
}

export function Submit({
  children, className = "btn btn-primary", pendingText = "Ruk jaiye…",
}: { children: React.ReactNode; className?: string; pendingText?: string }) {
  const pending = useContext(Pending);
  return (
    <button className={className} disabled={pending}>
      {pending ? <><Loader2 className="size-4 animate-spin" aria-hidden /> {pendingText}</> : children}
    </button>
  );
}
