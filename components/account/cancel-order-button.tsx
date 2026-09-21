"use client";
import { useState } from "react";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    if (!window.confirm("Cancel this unpaid order?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setError(data.error ?? "Unable to cancel this order."); return; }
      window.location.reload();
    } catch { setError("Unable to cancel this order right now."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4">
    <button type="button" onClick={cancel} disabled={busy} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-black disabled:opacity-50">{busy ? "Cancelling…" : "Cancel order"}</button>
    {error && <p className="mt-2 text-sm font-bold text-red-700">{error}</p>}
  </div>;
}
