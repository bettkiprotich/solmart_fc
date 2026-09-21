"use client";
import { useEffect, useState } from "react";

export function PaymentClient({ orderId, initialPhone }: { orderId: string; initialPhone?: string | null }) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [status, setStatus] = useState<"idle" | "starting" | "processing" | "success" | "failed">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "processing") return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/status?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) return;
        if (data.payment?.status === "SUCCESS" || data.orderStatus === "PAID") {
          setStatus("success");
          setMessage(data.payment?.transactionReference ? `Payment confirmed. Reference: ${data.payment.transactionReference}` : "Payment confirmed.");
        } else if (data.payment?.status === "FAILED" || data.payment?.status === "CANCELLED") {
          setStatus("failed");
          setMessage(data.payment?.failureReason || "Payment was not completed. You can try again.");
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [orderId, status]);

  async function pay() {
    setStatus("starting"); setMessage("");
    try {
      const response = await fetch("/api/payments/paystack/charge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, phone }) });
      const data = await response.json();
      if (!response.ok) { setStatus("failed"); setMessage(data.error || "Unable to start Paystack payment."); return; }
      setStatus("processing");
      setMessage(data.customerMessage || "Check your Safaricom phone and complete the M-PESA authorization.");
    } catch { setStatus("failed"); setMessage("Unable to start Paystack payment."); }
  }

  return <div className="mt-8 rounded-3xl border border-zinc-200 p-6">
    <p className="text-xs font-black uppercase tracking-[.25em] text-red-600">Paystack · M-PESA</p>
    <h2 className="mt-2 text-2xl font-black">Pay securely with M-PESA</h2>
    <p className="mt-2 text-sm text-zinc-600">Enter the Safaricom M-PESA number that should receive the payment prompt. Paystack will handle the payment securely.</p>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <input value={phone} onChange={e => setPhone(e.target.value)} disabled={status === "starting" || status === "processing" || status === "success"} placeholder="07XXXXXXXX or +2547XXXXXXXX" className="min-w-0 flex-1 rounded-xl border px-4 py-3" />
      <button type="button" onClick={pay} disabled={!phone || status === "starting" || status === "processing" || status === "success"} className="rounded-xl bg-red-600 px-5 py-3 font-black text-white disabled:opacity-50">{status === "starting" ? "Starting…" : status === "processing" ? "Awaiting payment…" : status === "success" ? "Paid" : "Pay with M-PESA"}</button>
    </div>
    {message && <p className={`mt-4 rounded-xl p-4 text-sm font-bold ${status === "success" ? "bg-green-50 text-green-800" : status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-900"}`}>{message}</p>}
  </div>;
}
