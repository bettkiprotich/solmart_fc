import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";

export function DocumentsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const blank = { title: "", type: "DOCUMENT", url: "" };
  const [d, setD] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      let finalUrl = d.url;
      if (file) {
        finalUrl = await upload(file, "galleries"); // Vercel Blob works for documents too
      }
      
      const body = { ...d, url: finalUrl };
      await mutate("/api/admin/documents", "POST", body);
      toast.success("Document saved!");
      setD(blank);
      setFile(null);
    } catch (err) {
      toast.error("Failed to save document.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (x: any) => {
    if (!confirm(`Delete ${x.title}?`)) return;
    try {
      await mutate(`/api/admin/documents?id=${x.id}`, "DELETE", {});
    } catch (e) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Documents & Policies</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
          <input className={inputClass} placeholder="Title" required value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
          <select className={inputClass} value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })}>
            {["POLICY", "DOCUMENT", "LINK"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          
          {d.type === "LINK" ? (
            <input className={inputClass + " md:col-span-2"} type="url" placeholder="External URL" required value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} />
          ) : (
            <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold md:col-span-2">
              Upload File (PDF, Word, etc.)
              <input className="mt-2 block w-full text-sm" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
            </label>
          )}

          <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white md:col-span-2 disabled:opacity-50">
            {busy ? "Saving..." : "Add Document"}
          </button>
        </form>
      </div>

      <div className={cardClass}>
        {rows.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div>
              <b>{x.title}</b>
              <p className="text-sm text-black/50">{x.type} · <a href={x.url} target="_blank" rel="noreferrer" className="underline">View</a></p>
            </div>
            <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => remove(x)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
