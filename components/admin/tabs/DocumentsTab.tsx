import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";

export function DocumentsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const blank = { title: "", type: "DOCUMENT", url: "" };
  const [d, setD] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);

  const startEdit = (x: any) => {
    setEditing(x);
    setD({ title: x.title, type: x.type, url: x.url });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      let finalUrl = d.url;
      if (file) {
        finalUrl = await upload(file, "galleries"); // Vercel Blob works for documents too
      }
      
      const body = { ...d, url: finalUrl };
      await mutate(editing ? `/api/admin/documents?id=${editing.id}` : "/api/admin/documents", editing ? "PATCH" : "POST", body);
      toast.success(editing ? "Document updated!" : "Document saved!");
      setD(blank);
      setFile(null);
      setEditing(null);
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
      toast.success("Document deleted");
    } catch (e) {
      // toast.error handled via mutate usually
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">{editing ? "Edit Document" : "Documents & Policies"}</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
          <input className={inputClass} placeholder="Title" required value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
          <select className={inputClass} value={d.type} onChange={(e) => setD({ ...d, type: e.target.value })}>
            {["POLICY", "DOCUMENT", "LINK"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold md:col-span-2 block cursor-pointer">
            {editing ? "Upload new file (optional)" : "Upload File"}
            <input className="mt-2 block w-full text-sm hidden" type="file" accept=".pdf,.doc,.docx" required={!editing && d.type !== "LINK"} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && <span className="block mt-2 font-normal text-xs">{file.name}</span>}
          </label>
          <div className="text-center text-xs font-bold text-black/40 md:col-span-2">OR (If linking externally)</div>
          <input className={inputClass + " md:col-span-2"} type="url" placeholder="URL Link" value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} required={d.type === "LINK"} />
          
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Save changes" : "Upload"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setD(blank); setFile(null); }} className="rounded-xl border px-4 py-3 font-black">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className={cardClass}>
        {rows.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div>
              <b>{x.title}</b>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-black/40 uppercase">{x.type}</span>
                <a href={x.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View File</a>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-xs font-bold hover:underline" onClick={() => startEdit(x)}>Edit</button>
              <button type="button" className="text-xs font-bold text-red-600 hover:underline" onClick={() => remove(x)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
