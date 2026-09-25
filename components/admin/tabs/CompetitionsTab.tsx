"use client";
import { useState } from "react";
import { api } from "./shared";
import { Competition, Team } from "@prisma/client";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";

export function CompetitionsTab({ rows, teams, mutate }: { rows: (Competition & { teams: Team[] })[], teams: Team[], mutate: () => void }) {
  const [data, setData] = useState(rows);
  const [saving, setSaving] = useState(false);

  const add = () => {
    setData([{ id: `new-${Date.now()}`, name: "New Tournament", slug: `new-${Date.now()}`, season: "2025/26", country: "Kenya", isOfficial: false, isLeague: true, showOnHomepage: false, showOnTeamPage: false, description: "", teams: [], _isNew: true } as any, ...data]);
  };

  const update = (id: string, field: string, val: any) => {
    setData(data.map(r => r.id === id ? { ...r, [field]: val } : r));
  };
  
  const toggleTeam = (compId: string, teamId: string) => {
    setData(data.map(r => {
      if (r.id !== compId) return r;
      const hasTeam = r.teams.some(t => t.id === teamId);
      if (hasTeam) {
        return { ...r, teams: r.teams.filter(t => t.id !== teamId) };
      } else {
        const team = teams.find(t => t.id === teamId);
        return team ? { ...r, teams: [...r.teams, team] } : r;
      }
    }));
  };

  const remove = async (id: string, name: string) => {
    if (id.startsWith("new-")) return setData(data.filter(r => r.id !== id));
    
    toast(`Delete tournament "${name}"?`, {
      action: {
        label: "Yes, delete",
        onClick: async () => {
          try {
            await api("/api/admin/competitions", { method: "DELETE", body: JSON.stringify({ id }) });
            toast.success("Tournament deleted");
            mutate();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed");
          }
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  const save = async (row: any) => {
    setSaving(true);
    try {
      const payload = { ...row, teamIds: row.teams.map((t: Team) => t.id) };
      if (row._isNew) {
        delete payload.id;
        delete payload._isNew;
      }
      await api("/api/admin/competitions", { method: row._isNew ? "POST" : "PUT", body: JSON.stringify(payload) });
      toast.success("Saved");
      mutate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tournaments & Leagues</h2>
        <button onClick={add} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black/80">
          <Plus className="h-4 w-4" /> Add Tournament
        </button>
      </div>

      <div className="grid gap-6">
        {data.map(r => (
          <div key={r.id} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-black/50">Name</label>
                  <input className="w-full rounded-lg border p-2" value={r.name} onChange={e => update(r.id, "name", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-black/50">Season / Year</label>
                  <input className="w-full rounded-lg border p-2" value={r.season || ""} onChange={e => update(r.id, "season", e.target.value)} />
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={r.isLeague} onChange={e => update(r.id, "isLeague", e.target.checked)} />
                    <span className="font-bold">Is League Format</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={r.showOnHomepage} onChange={e => update(r.id, "showOnHomepage", e.target.checked)} />
                    <span className="font-bold">Show on Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={r.showOnTeamPage} onChange={e => update(r.id, "showOnTeamPage", e.target.checked)} />
                    <span className="font-bold">Show on Team Hub</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-black/50">Participating Teams</label>
                <div className="h-48 overflow-y-auto rounded-lg border p-2 bg-zinc-50">
                  {teams.map(t => (
                    <label key={t.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={r.teams.some((rt: Team) => rt.id === t.id)}
                        onChange={() => toggleTeam(r.id, t.id)}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button onClick={() => remove(r.id, r.name)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button onClick={() => save(r)} disabled={saving} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black/80 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
