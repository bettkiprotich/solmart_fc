import { useState } from "react";
import { AnyRecord, cardClass, inputClass, api, upload, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function ProductsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const blank = { name: "", category: "Jerseys", description: "", status: "DRAFT", featured: false, price: "", salePrice: "", sizes: "XS,S,M,L,XL,XXL", skuPrefix: "SOLMART" };
  const [newP, setNewP] = useState(blank as any);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);

  const startEdit = (p: any) => {
    setEditing(p);
    setNewP({
      name: p.name,
      category: p.category || "",
      description: p.description || "",
      status: p.status,
      featured: p.featured || false,
      price: p.variants?.[0]?.price || "",
      salePrice: p.variants?.[0]?.salePrice || "",
      sizes: "XS,S,M,L,XL,XXL", // Not easily editable for existing products right now
      skuPrefix: "SOLMART"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: any) => {
    if (!confirm(`Delete product "${x.name}"?`)) return;
    try {
      await mutate(`/api/admin/products?id=${x.id}`, "DELETE");
      toast.success("Product deleted");
    } catch (e) {
      // Handled by mutate
    }
  };

  const create = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        // Just update product metadata for now
        await mutate(`/api/admin/products?id=${editing.id}`, "PATCH", {
          name: newP.name,
          category: newP.category,
          description: newP.description,
          status: newP.status,
          featured: newP.featured,
        });
        if (file) {
          const url = await upload(file, "products");
          // Re-uploading an image: we just post a new one. To keep it simple we assume it adds to the gallery or overrides.
          await api("/api/admin/product-images", { method: "POST", body: JSON.stringify({ productId: editing.id, url, altText: newP.name, sortOrder: 0 }) });
        }
        toast.success("Product updated!");
      } else {
        const sizes = newP.sizes.split(",").map((x: string) => x.trim()).filter(Boolean);
        const price = Number(newP.price);
        const sale = newP.salePrice ? Number(newP.salePrice) : null;
        const variants = sizes.map((size: string, i: number) => ({ sku: `${newP.skuPrefix}-${size}-${Date.now()}-${i}`, size, price, salePrice: sale, stock: 0 }));
        const d = await api("/api/admin/products", { method: "POST", body: JSON.stringify({ ...newP, price: undefined, salePrice: undefined, variants }) });
        if (file) {
          const url = await upload(file, "products");
          await api("/api/admin/product-images", { method: "POST", body: JSON.stringify({ productId: d.product.id, url, altText: newP.name, sortOrder: 0 }) });
        }
        toast.success("Product created!");
      }
      setNewP(blank);
      setFile(null);
      setEditing(null);
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">{editing ? "Edit Product Details" : "Merchandise"}</h2>
        <p className="mt-1 text-sm text-black/50">{editing ? "Edit basic details. Note: variant prices and stock must be edited via specific inventory endpoints in a future update." : "Add a new arrival with its product photo, price, sizes and stock."}</p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={create}>
          <input className={inputClass} placeholder="Product name" required value={newP.name} onChange={(e) => setNewP({ ...newP, name: e.target.value })} />
          {!editing && (
            <div className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-black/60">
              <span className="font-black text-black/70">URL preview:</span> <span className="font-mono">/shop/{slugPreview(newP.name)}</span>
            </div>
          )}
          <input className={inputClass + (editing ? " md:col-span-1" : "")} placeholder="Category" value={newP.category} onChange={(e) => setNewP({ ...newP, category: e.target.value })} />
          <select className={inputClass} value={newP.status} onChange={(e) => setNewP({ ...newP, status: e.target.value })}>
            {["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
            <input type="checkbox" checked={newP.featured} onChange={(e) => setNewP({ ...newP, featured: e.target.checked })} /> Featured product
          </label>
          <textarea className={inputClass + " min-h-24 md:col-span-2"} placeholder="Product description" value={newP.description} onChange={(e) => setNewP({ ...newP, description: e.target.value })} />
          
          {!editing && (
            <>
              <input className={inputClass} placeholder="Base Price (Ksh)" required type="number" min="0" step="0.01" value={newP.price} onChange={(e) => setNewP({ ...newP, price: e.target.value })} />
              <input className={inputClass} placeholder="Sale Price (Optional)" type="number" min="0" step="0.01" value={newP.salePrice} onChange={(e) => setNewP({ ...newP, salePrice: e.target.value })} />
              <input className={inputClass} placeholder="Sizes (comma separated)" required value={newP.sizes} onChange={(e) => setNewP({ ...newP, sizes: e.target.value })} />
              <input className={inputClass} placeholder="SKU Prefix" required value={newP.skuPrefix} onChange={(e) => setNewP({ ...newP, skuPrefix: e.target.value })} />
            </>
          )}

          <label className="md:col-span-2 rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold">
            {editing ? "Add Additional Product Photo" : "Product photo"}
            <input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Save changes" : "Create product"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setNewP(blank); setFile(null); }} className="rounded-xl border px-4 py-3 font-black">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className={cardClass}>
        {rows.map((p) => (
          <div key={p.id} className="flex items-start justify-between gap-4 border-b py-4 last:border-0">
            <div className="flex gap-4 items-center">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 p-2 border">
                {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.images[0].altText || p.name} width={80} height={80} className="h-full w-full object-contain" />}
              </div>
              <div>
                <b>{p.name}</b>
                <p className="text-xs text-black/50">{p.category} A {p.variants?.length || 0} variants</p>
                <div className="mt-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === "ACTIVE" ? "text-green-600" : "text-black/40"}`}>{p.status}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button type="button" className="text-xs font-bold hover:underline text-right" onClick={() => startEdit(p)}>Edit</button>
              <button type="button" className="text-xs font-bold text-red-600 hover:underline text-right" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
