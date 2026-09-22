import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function NewsTab({ rows, categories, mutate }: { rows: AnyRecord[]; categories: AnyRecord[]; mutate: any }) {
  const [draft, setDraft] = useState({ title: "", content: "", categoryId: "", status: "DRAFT", excerpt: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">News CMS</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              let coverImageUrl = null;
              if (file) coverImageUrl = await upload(file, "galleries");
              await mutate("/api/admin/news", "POST", { ...draft, categoryId: draft.categoryId || null, coverImageUrl });
              toast.success("Article saved!");
              setDraft({ title: "", content: "", categoryId: "", status: "DRAFT", excerpt: "" });
              setFile(null);
            } catch (err) {
              toast.error("Failed to save article");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input className={inputClass} placeholder="Headline" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-black/60">
            <span className="font-black text-black/70">URL preview:</span> <span className="font-mono">/news/{slugPreview(draft.title)}</span>
          </div>
          <select className={inputClass} value={draft.categoryId} onChange={(e) => setDraft({ ...draft, categoryId: e.target.value || "" })}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea className={inputClass + " min-h-32"} placeholder="Article content" required value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold block">
            Cover image
            <input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <select className={inputClass + " max-w-xs block"} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button disabled={busy} className="rounded-xl bg-red-600 px-5 py-3 font-black text-white disabled:opacity-50">
            {busy ? "Saving..." : "Save article"}
          </button>
        </form>
      </div>
      <div className={cardClass}>
        {rows.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-20 overflow-hidden rounded-xl bg-zinc-100 flex items-center justify-center">
                {a.coverImageUrl ? (
                  <Image src={a.coverImageUrl} alt={a.title} width={80} height={48} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-[10px] text-black/40">NO IMAGE</span>
                )}
              </div>
              <div>
                <b>{a.title}</b>
                <p className="text-sm text-black/50">
                  {a.category?.name || "Uncategorized"} · {a.status}
                </p>
              </div>
            </div>
            <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => mutate(`/api/admin/news?id=${a.id}`, "PATCH", { status: a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })}>
              {a.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
