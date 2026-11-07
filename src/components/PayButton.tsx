"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { confirmPaymentAction, demoPayAction, startPaymentAction } from "@/app/actions";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open(): void; on(event: string, cb: (r: { error?: { description?: string } }) => void): void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("checkout failed to load"));
    document.body.appendChild(s);
  });
}

export function PayButton({ code, label, demo }: { code: string; label: string; demo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setBusy(true);
    setError("");
    try {
      if (demo) {
        const r = await demoPayAction(code);
        if (r.error) setError(r.error);
        else router.refresh();
        return;
      }

      const start = await startPaymentAction(code);
      if ("error" in start) return setError(start.error);
      await loadCheckout();

      const checkout = new window.Razorpay!({
        key: start.keyId,
        amount: start.amount,
        currency: "INR",
        name: "Mahato Net Cafe",
        description: start.description,
        image: "/logo.png",
        order_id: start.razorpayOrderId,
        prefill: { name: start.name, contact: start.contact },
        theme: { color: "#0774b0" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: RazorpayResponse) => {
          setBusy(true);
          const done = await confirmPaymentAction(code, r.razorpay_payment_id, r.razorpay_signature);
          if (done.error) setError(done.error);
          else router.refresh();
          setBusy(false);
        },
      });
      checkout.on("payment.failed", (r) => {
        setError(r.error?.description ?? "Payment nahi hua. Dobara koshish karein.");
      });
      checkout.open();
    } catch {
      setError("Payment shuru nahi ho paya. Internet check karke dobara koshish karein.");
      setBusy(false);
    } finally {
      if (demo) setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={pay} disabled={busy} className="btn btn-primary w-full">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
        {label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
