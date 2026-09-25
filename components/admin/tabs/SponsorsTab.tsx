import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function SponsorsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const blank = { name: "", websiteUrl: "", description: "", about: "", branches: "[]", active: true };
  const [s, setS] = useState(blank as any);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AnyRecord | null>(null);

  const startEdit = (x: any) => {
    setEditing(x);
    setS({ name: x.name, websiteUrl: x.websiteUrl || "", description: x.description || "", about: x.about || "", branches: JSON.stringify(x.branches || []), active: x.active });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: any) => {
    toast(`Delete sponsor "${x.name}"?`, {
      action: {
        label: "Yes, delete",
        onClick: async () => {
          try {
            await mutate(`/api/admin/sponsors?id=${x.id}`, "DELETE");
            toast.success("Sponsor deleted");
          } catch (e) {}
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">{editing ? "Edit Sponsor" : "Add Sponsor"}</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              let logoUrl = editing?.logoUrl || null;
              if (file) logoUrl = await upload(file, "teams"); // Reuse "teams" folder for sponsor logos
              let branchesData = [];
              try {
                branchesData = JSON.parse(s.branches);
                if (!Array.isArray(branchesData)) branchesData = [];
              } catch (err) {}
              await mutate(editing ? `/api/admin/sponsors?id=${editing.id}` : "/api/admin/sponsors", editing ? "PATCH" : "POST", { ...s, websiteUrl: s.websiteUrl || null, branches: branchesData, logoUrl });
              toast.success(editing ? "Sponsor updated!" : "Sponsor added!");
              setS(blank);
              setFile(null);
              setEditing(null);
            } catch (err) {
              toast.error("Failed to save sponsor");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input className={inputClass} placeholder="Sponsor name" required value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <input className={inputClass} type="url" placeholder="Website URL" value={s.websiteUrl} onChange={(e) => setS({ ...s, websiteUrl: e.target.value })} />
          <input className={inputClass + " md:col-span-2"} placeholder="Short Description (for banner)" value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} />
          <textarea className={inputClass + " md:col-span-2"} placeholder="About (Full text for sponsor page)" rows={3} value={s.about} onChange={(e) => setS({ ...s, about: e.target.value })} />
          
          <div className="md:col-span-2">
            <p className="text-xs font-bold text-black/50 mb-2">Branches (JSON array of maps embeds, e.g. [{`"name":"Branch 1", "embedHtml": "..."`}]):</p>
            <textarea className={inputClass + " font-mono text-xs"} placeholder={`[\n  {\n    "name": "Branch 1",\n    "embedHtml": "<iframe..."\n  }\n]`} rows={4} value={s.branches} onChange={(e) => setS({ ...s, branches: e.target.value })} />
          </div>

          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold md:col-span-2 block cursor-pointer">
            {editing ? "Upload new logo (optional)" : "Sponsor Logo"}
            <input className="mt-2 block w-full text-sm hidden" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file && <span className="block mt-2 font-normal text-xs">{file.name}</span>}
            {editing?.logoUrl && !file && <span className="mt-2 block text-xs font-normal text-black/50">Current logo will remain if no replacement is selected.</span>}
          </label>
          
          <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
            <input type="checkbox" checked={s.active} onChange={(e) => setS({ ...s, active: e.target.checked })} /> Active sponsor
          </label>
          
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Save changes" : "Add sponsor"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setS(blank); setFile(null); }} className="rounded-xl border px-4 py-3 font-black">Cancel</button>
            )}
          </div>
        </form>
      </div>
      <div className={cardClass}>
        {rows.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100 flex items-center justify-center">
                {x.logoUrl ? (
                  <Image src={x.logoUrl} alt={x.name} width={48} height={48} className="object-contain" />
                ) : (
                  <span className="text-[10px] text-black/40">NO LOGO</span>
                )}
              </div>
              <div>
                <b>{x.name}</b>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${x.active ? "text-green-600" : "text-black/40"}`}>{x.active ? "ACTIVE" : "INACTIVE"}</span>
                  {x.websiteUrl && <a href={x.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">Link</a>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="text-xs font-bold hover:underline" onClick={() => startEdit(x)}>Edit</button>
              <button type="button" className="text-xs font-bold text-red-600 hover:underline" onClick={() => remove(x)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
