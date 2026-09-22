import { useState } from "react";
import { AnyRecord, cardClass, inputClass, api, upload, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function ProductsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const [newP, setNewP] = useState({ name: "", category: "Jerseys", description: "", status: "DRAFT", featured: false, price: "", salePrice: "", sizes: "XS,S,M,L,XL,XXL", skuPrefix: "SOLMART" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const create = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      const sizes = newP.sizes.split(",").map((x: string) => x.trim()).filter(Boolean);
      const price = Number(newP.price);
      const sale = newP.salePrice ? Number(newP.salePrice) : null;
      const variants = sizes.map((size: string, i: number) => ({ sku: `${newP.skuPrefix}-${size}-${Date.now()}-${i}`, size, price, salePrice: sale, stock: 0 }));
      const d = await api("/api/admin/products", { method: "POST", body: JSON.stringify({ ...newP, price: undefined, salePrice: undefined, variants }) });
      if (file) {
        const url = await upload(file, "products");
        await api("/api/admin/product-images", { method: "POST", body: JSON.stringify({ productId: d.product.id, url, altText: newP.name, sortOrder: 0 }) });
      }
      setNewP({ ...newP, name: "", description: "", price: "", salePrice: "" });
      setFile(null);
      mutate();
      toast.success("Product created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Merchandise</h2>
        <p className="mt-1 text-sm text-black/50">Add a new arrival with its product photo, price, sizes and stock.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={create}>
          <input className={inputClass} placeholder="Product name" required value={newP.name} onChange={(e) => setNewP({ ...newP, name: e.target.value })} />
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-black/60">
            <span className="font-black text-black/70">URL preview:</span> <span className="font-mono">/shop/{slugPreview(newP.name)}</span>
          </div>
          <input className={inputClass} placeholder="Category" value={newP.category} onChange={(e) => setNewP({ ...newP, category: e.target.value })} />
          <select className={inputClass} value={newP.status} onChange={(e) => setNewP({ ...newP, status: e.target.value })}>
            {["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="Price (KES)" required value={newP.price} onChange={(e) => setNewP({ ...newP, price: e.target.value })} />
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="Sale price (optional)" value={newP.salePrice} onChange={(e) => setNewP({ ...newP, salePrice: e.target.value })} />
          <input className={inputClass} placeholder="Sizes, e.g. XS,S,M,L,XL,XXL" value={newP.sizes} onChange={(e) => setNewP({ ...newP, sizes: e.target.value })} />
          <input className={inputClass} placeholder="SKU prefix" value={newP.skuPrefix} onChange={(e) => setNewP({ ...newP, skuPrefix: e.target.value })} />
          <textarea className={inputClass + " md:col-span-2"} placeholder="Description" value={newP.description} onChange={(e) => setNewP({ ...newP, description: e.target.value })} />
          <label className="md:col-span-2 rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold">
            Product photo
            <input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50 md:col-span-2">
            {busy ? "Creating…" : "Add merchandise"}
          </button>
        </form>
      </div>
      <div className="grid gap-4">
        {rows.map((p) => (
          <div className={cardClass} key={p.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                  {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.images[0].altText || p.name} width={80} height={80} className="h-full w-full object-contain" />}
                </div>
                <div>
                  <h3 className="font-black">{p.name}</h3>
                  <p className="text-sm text-black/50">
                    {p.slug} · {p.status}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-lg border px-3 py-2 text-xs font-bold"
                  onClick={() => mutate(`/api/admin/products?id=${p.id}`, "PATCH", { status: p.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE" })}
                >
                  {p.status === "ACTIVE" ? "Archive" : "Activate"}
                </button>
                <button
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
                  onClick={async () => {
                    if (!window.confirm(`Remove ${p.name}? If it has existing orders/cart records, it will be archived instead of permanently deleted.`)) return;
                    try {
                      const d = await api(`/api/admin/products?id=${p.id}`, { method: "DELETE" });
                      toast.success(d.message || "Product removed.");
                      mutate();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Unable to remove product.");
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {p.variants?.map((v: any) => (
                <VariantStock key={v.id} p={p} v={v} mutate={mutate} />
              ))}
            </div>
            <ProductImages product={p} mutate={mutate} />
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantStock({ p, v, mutate }: { p: any; v: any; mutate: any }) {
  const [stock, setStock] = useState(String(v.stock));
  return (
    <div className="rounded-xl border p-3">
      <b>{v.size || "One size"}</b>
      <div className="text-xs text-black/50">
        SKU {v.sku} · KES {String(v.salePrice ?? v.price)}
      </div>
      <div className="mt-2 flex gap-2">
        <input className={inputClass} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        <button
          className="rounded-lg bg-black px-3 text-xs font-black text-white"
          onClick={() =>
            mutate(`/api/admin/products?id=${p.id}`, "PATCH", {
              variants: [{ id: v.id, sku: v.sku, size: v.size, price: Number(v.price), salePrice: v.salePrice ? Number(v.salePrice) : null, stock: Number(stock) }],
            })
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

function ProductImages({ product, mutate }: { product: any; mutate: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const add = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await upload(file, "products");
      await api("/api/admin/product-images", { method: "POST", body: JSON.stringify({ productId: product.id, url, altText: product.name, sortOrder: product.images?.length || 0 }) });
      toast.success("Image added!");
      mutate();
      setFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to add image.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="mt-5 border-t pt-4">
      <p className="text-sm font-black">Product photos</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {product.images?.map((im: any) => (
          <div key={im.id} className="relative h-24 w-24 overflow-hidden rounded-xl bg-zinc-100">
            <Image src={im.url} alt={im.altText} width={96} height={96} className="h-full w-full object-contain" />
            <button type="button" className="absolute right-1 top-1 rounded-full bg-black px-2 py-1 text-xs font-black text-white" onClick={() => mutate(`/api/admin/product-images?id=${im.id}`, "DELETE", {})}>
              ×
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button disabled={!file || busy} onClick={add} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50">
            {busy ? "Adding..." : "Add photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
