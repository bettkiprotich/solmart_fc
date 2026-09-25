import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

import { Competition } from "@prisma/client";

export function TeamsTab({ rows, competitions, mutate }: { rows: AnyRecord[]; competitions: Competition[]; mutate: any }) {
  const blank = { name: "", shortName: "", blurb: "", competitionIds: [] as string[] };
  const [t, setT] = useState(blank as any);
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      const logoUrl = logoFile ? await upload(logoFile, "teams") : editing?.logoUrl ?? null;
      const coverPhotoUrl = coverFile ? await upload(coverFile, "teams") : editing?.coverPhotoUrl ?? null;
      
      const body = { ...t, logoUrl, coverPhotoUrl };
      await mutate(editing ? `/api/admin/teams?id=${editing.id}` : "/api/admin/teams", editing ? "PATCH" : "POST", body);
      toast.success("Team saved!");
      setEditing(null);
      setT(blank);
      setLogoFile(null);
      setCoverFile(null);
    } catch (err) {
      toast.error("Failed to save team.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (x: any) => {
    setEditing(x);
    setT({ name: x.name, shortName: x.shortName || "", blurb: x.blurb || "", competitionIds: x.competitions?.map((c: any) => c.id) || [] });
    setLogoFile(null);
    setCoverFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Team Profiles</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
          <input className={inputClass} placeholder="Full Team Name" required value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} />
          <input className={inputClass} placeholder="Short Name" value={t.shortName} onChange={(e) => setT({ ...t, shortName: e.target.value })} />
          <textarea className={inputClass + " md:col-span-2"} placeholder="Team Intro / Blurb" value={t.blurb} onChange={(e) => setT({ ...t, blurb: e.target.value })} />
          
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold">
            Team Logo
            <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </label>
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold">
            Cover Photo
            <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
          </label>


          <div className="md:col-span-2 rounded-xl border p-4 bg-zinc-50">
            <label className="text-sm font-bold block mb-2">Participating Tournaments</label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {competitions.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={t.competitionIds?.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setT({ ...t, competitionIds: [...(t.competitionIds || []), c.id] });
                      } else {
                        setT({ ...t, competitionIds: (t.competitionIds || []).filter((id: string) => id !== c.id) });
                      }
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : editing ? "Save Team" : "Add Team"}
            </button>
            {editing && (
              <button type="button" className="rounded-xl border px-4 py-3 font-black" onClick={() => { setEditing(null); setT(blank); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={cardClass}>
        {rows.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100 flex items-center justify-center">
                {x.logoUrl ? <Image src={x.logoUrl} alt={x.name} width={48} height={48} className="object-contain" /> : <span className="text-[10px] text-black/40">NO LOGO</span>}
              </div>
              <div>
                <b>{x.name}</b>
                <p className="text-sm text-black/50">{x.shortName || "No short name"}</p>
              </div>
            </div>
            <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => startEdit(x)}>Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}
