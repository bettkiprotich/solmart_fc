"use client";
import { useState } from "react";
import Link from "next/link";

export function AddToCart({ variants }: { variants: Array<{ id: string; size: string | null; stock: number; price: string; salePrice: string | null }> }) {
  const available = variants.filter((v) => v.stock > 0);
  const [variantId, setVariantId] = useState(available[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!variantId) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId, quantity }) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setMessage("Please sign in first.");
        else setMessage(data.error ?? "Unable to add item.");
      } else setMessage("Added to your cart.");
    } catch { setMessage("Unable to add item right now."); }
    finally { setBusy(false); }
  }

  if (!available.length) return <p className="font-bold text-red-600">Currently out of stock.</p>;
  const selected = available.find((v) => v.id === variantId) ?? available[0];
  return <div className="space-y-5">
    <div><label htmlFor="size" className="mb-2 block text-sm font-black">Size</label><select id="size" value={variantId} onChange={(e) => { setVariantId(e.target.value); setQuantity(1); }} className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 font-bold">{available.map(v => <option key={v.id} value={v.id}>{v.size ?? "Standard"} · KES {Number(v.salePrice ?? v.price).toLocaleString()} · {v.stock} left</option>)}</select></div>
    <div><label htmlFor="quantity" className="mb-2 block text-sm font-black">Quantity</label><input id="quantity" type="number" min={1} max={Math.min(20, selected.stock)} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, Math.min(20, selected.stock))))} className="w-28 rounded-xl border border-zinc-300 px-4 py-3 font-bold" /></div>
    <button disabled={busy} onClick={add} className="w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white hover:bg-black disabled:opacity-50">{busy ? "Adding…" : "Add to cart"}</button>
    {message && <div className="rounded-xl bg-zinc-100 p-4 text-sm font-bold">{message} {message === "Please sign in first." && <Link href="/account" className="text-red-600 underline">Sign in</Link>} {message === "Added to your cart." && <Link href="/cart" className="text-red-600 underline">View cart</Link>}</div>}
  </div>;
}
