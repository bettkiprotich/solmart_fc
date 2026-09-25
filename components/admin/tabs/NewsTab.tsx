import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function NewsTab({ rows, categories, mutate }: { rows: AnyRecord[]; categories: AnyRecord[]; mutate: any }) {
  const blank = { title: "", content: "", categoryId: "", status: "DRAFT", excerpt: "" };
  const [draft, setDraft] = useState(blank as any);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);

  const startEdit = (x: any) => {
    setEditing(x);
    setDraft({ title: x.title, content: x.content, categoryId: x.categoryId || "", status: x.status, excerpt: x.excerpt || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: any) => {
    if (!confirm(`Delete article "${x.title}"?`)) return;
    try {
      await mutate(`/api/admin/news?id=${x.id}`, "DELETE");
      toast.success("Article deleted");
    } catch (e) {
      // toast.error("Failed to delete article"); handled by mutate usually, but we can wrap
    }
  };

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
              let coverImageUrl = editing?.coverImageUrl || null;
              if (file) coverImageUrl = await upload(file, "galleries");
              await mutate(editing ? `/api/admin/news?id=${editing.id}` : "/api/admin/news", editing ? "PATCH" : "POST", { ...draft, categoryId: draft.categoryId || null, coverImageUrl });
              toast.success(editing ? "Article updated!" : "Article saved!");
              setDraft(blank);
              setFile(null);
              setEditing(null);
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
            {editing?.coverImageUrl && <span className="mt-2 block text-xs font-normal text-black/50">Current image will remain if no replacement is selected.</span>}
          </label>

          <select className={inputClass + " max-w-xs block"} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-5 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Save changes" : "Save article"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setDraft(blank); setFile(null); }} className="rounded-xl border px-5 py-3 font-black">Cancel edit</button>
            )}
          </div>
        </form>
      </div>
      <div className={cardClass}>
        {rows.map((a) => (
          <div key={a.id} className="flex items-start gap-4 border-b py-4 last:border-0">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 flex items-center justify-center">
              {a.coverImageUrl ? (
                <Image src={a.coverImageUrl} alt={a.title} width={96} height={64} className="object-cover h-full w-full" />
              ) : (
                <span className="text-[10px] text-black/40">NO IMG</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-between gap-2">
                <b className="line-clamp-1 flex-1">{a.title}</b>
                <span className={`text-[10px] font-black uppercase tracking-widest ${a.status === "PUBLISHED" ? "text-green-600" : "text-black/40"}`}>{a.status}</span>
              </div>
              <p className="mt-1 text-xs text-black/50 line-clamp-1">{a.category?.name || "Uncategorized"}</p>
              <div className="mt-2 flex gap-3">
                <button type="button" className="text-xs font-bold hover:underline" onClick={() => startEdit(a)}>Edit</button>
                <button type="button" className="text-xs font-bold text-red-600 hover:underline" onClick={() => remove(a)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
