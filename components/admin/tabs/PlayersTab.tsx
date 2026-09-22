import { useState } from "react";
import { AnyRecord, cardClass, inputClass, api, upload, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function PlayersTab({ rows, teams, mutate }: { rows: AnyRecord[]; teams: AnyRecord[]; mutate: any }) {
  const blank = { firstName: "", lastName: "", position: "FORWARD", squadNumber: "", teamId: teams.find((t) => t.isClub)?.id || "", nationality: "", bio: "", isActive: true };
  const [p, setP] = useState(blank);
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<AnyRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      const photoUrl = file ? await upload(file, "players") : editing?.photoUrl ?? null;
      const body = { ...p, squadNumber: p.squadNumber ? Number(p.squadNumber) : null, teamId: p.teamId || null, photoUrl };
      await api(editing ? `/api/admin/players?id=${editing.id}` : "/api/admin/players", { method: editing ? "PATCH" : "POST", body: JSON.stringify(body) });
      toast.success("Player saved!");
      mutate();
      setEditing(null);
      setP(blank);
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save player.");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (x: any) => {
    setEditing(x);
    setP({ firstName: x.firstName, lastName: x.lastName, position: x.position, squadNumber: x.squadNumber ?? "", teamId: x.teamId ?? "", nationality: x.nationality ?? "", bio: x.bio ?? "", isActive: x.isActive });
    setFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: any) => {
    if (!confirm(`Delete ${x.firstName} ${x.lastName}? This permanently removes the player record.`)) return;
    try {
      await api(`/api/admin/players?id=${x.id}`, { method: "DELETE" });
      toast.success("Player deleted.");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete player.");
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Squad management</h2>
        <p className="mt-1 text-sm text-black/50">{editing ? "Edit the player details below." : "Add a player and upload their actual squad photograph."}</p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
          <input className={inputClass} placeholder="First name" required value={p.firstName} onChange={(e) => setP({ ...p, firstName: e.target.value })} />
          <input className={inputClass} placeholder="Last name" required value={p.lastName} onChange={(e) => setP({ ...p, lastName: e.target.value })} />
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-black/60">
            <span className="font-black text-black/70">URL preview:</span> <span className="font-mono">/team/{slugPreview(`${p.firstName} ${p.lastName}`)}</span>
          </div>
          <select className={inputClass} value={p.position} onChange={(e) => setP({ ...p, position: e.target.value })}>
            {["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input className={inputClass} placeholder="Squad number" type="number" min="0" max="99" value={p.squadNumber} onChange={(e) => setP({ ...p, squadNumber: e.target.value })} />
          <select className={inputClass} value={p.teamId} onChange={(e) => setP({ ...p, teamId: e.target.value })}>
            <option value="">Unassigned</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <input className={inputClass} placeholder="Nationality" value={p.nationality} onChange={(e) => setP({ ...p, nationality: e.target.value })} />
          <textarea className={inputClass + " md:col-span-2"} placeholder="Player biography" value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} />
          <label className="md:col-span-2 rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold">
            Player photograph
            <input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {editing?.photoUrl && <span className="mt-2 block text-xs font-normal text-black/50">Current photo will remain if no replacement is selected.</span>}
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {busy ? "Saving…" : editing ? "Save player changes" : "Add player"}
            </button>
            {editing && (
              <button
                type="button"
                className="rounded-xl border px-4 py-3 font-black"
                onClick={() => {
                  setEditing(null);
                  setP(blank);
                  setFile(null);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="grid gap-3">
        {rows.map((x) => (
          <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 p-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                {x.photoUrl ? (
                  <Image src={x.photoUrl} alt={`${x.firstName} ${x.lastName}`} width={80} height={80} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] font-bold text-black/40">NO PHOTO</div>
                )}
              </div>
              <div>
                <b>
                  {x.firstName} {x.lastName}
                </b>
                <p className="text-sm text-black/50">
                  #{x.squadNumber ?? "—"} · {x.position} · {x.team?.name || "Unassigned"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => startEdit(x)}>
                Edit
              </button>
              <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => mutate(`/api/admin/players?id=${x.id}`, "PATCH", { isActive: !x.isActive })}>
                {x.isActive ? "Deactivate" : "Activate"}
              </button>
              <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => remove(x)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
