import { useState } from "react";
import { AnyRecord, cardClass, inputClass, slugPreview } from "./shared";
import { toast } from "sonner";

export function NewsTab({ rows, categories, mutate }: { rows: AnyRecord[]; categories: AnyRecord[]; mutate: any }) {
  const [draft, setDraft] = useState({ title: "", content: "", categoryId: "", status: "DRAFT", excerpt: "" });
  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">News CMS</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await mutate("/api/admin/news", "POST", { ...draft, categoryId: draft.categoryId || null });
              toast.success("Article saved!");
              setDraft({ title: "", content: "", categoryId: "", status: "DRAFT", excerpt: "" });
            } catch (err) {
              toast.error("Failed to save article");
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
          <select className={inputClass + " max-w-xs"} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
            {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="rounded-xl bg-red-600 px-5 py-3 font-black text-white">Save article</button>
        </form>
      </div>
      <div className={cardClass}>
        {rows.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-0">
            <div>
              <b>{a.title}</b>
              <p className="text-sm text-black/50">
                {a.category?.name || "Uncategorized"} · {a.status}
              </p>
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
