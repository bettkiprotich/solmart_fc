import { useState, useEffect } from "react";
import { AnyRecord, cardClass, inputClass, api } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function StatsTab({ rows, players, mutate }: { rows: AnyRecord[]; players: AnyRecord[]; mutate: any }) {
  const [season, setSeason] = useState("2025/26");
  const [stats, setStats] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Transform rows (PlayerSeasonStatistic) into a keyed object for easy editing
    const currentSeasonStats = rows.filter((r) => r.season === season);
    const map: Record<string, any> = {};
    players.forEach((p) => {
      const existing = currentSeasonStats.find((s) => s.playerId === p.id);
      map[p.id] = existing || {
        playerId: p.id,
        season,
        appearances: 0,
        subOn: 0,
        subOff: 0,
        goals: 0,
        penalties: 0,
        penaltiesMissed: 0,
        assists: 0,
        ownGoals: 0,
        yellowCards: 0,
        redCards: 0,
        cleanSheets: 0,
      };
    });
    setStats(map);
  }, [rows, season, players]);

  const updateField = (playerId: string, field: string, value: string) => {
    setStats((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: Number(value) || 0 },
    }));
  };

  const save = async () => {
    setBusy(true);
    try {
      const body = { season, stats: Object.values(stats) };
      await api("/api/admin/stats", { method: "POST", body: JSON.stringify(body) });
      toast.success("Stats updated successfully!");
      mutate();
    } catch (e) {
      toast.error("Failed to update stats.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-black">Player Statistics</h2>
          <div className="flex items-center gap-3">
            <input className={inputClass + " w-32"} placeholder="Season" value={season} onChange={(e) => setSeason(e.target.value)} />
            <button disabled={busy} onClick={save} className="rounded-xl bg-red-600 px-5 py-2 font-black text-white disabled:opacity-50">
              {busy ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>
        
        <div className="mt-6 rounded-xl border border-black/10 bg-zinc-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">Column Key</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <span><b>A</b>: Appearances</span>
            <span><b>ON</b>: Sub On</span>
            <span><b>Off</b>: Sub Off</span>
            <span><b>G</b>: Goals</span>
            <span><b>P</b>: Penalties</span>
            <span><b>PM</b>: Penalties Missed</span>
            <span><b>Ass</b>: Assists</span>
            <span><b>OG</b>: Own Goals</span>
            <span><b>YC</b>: Yellow Cards</span>
            <span><b>RC</b>: Red Cards</span>
            <span><b>CS</b>: Clean Sheets</span>
          </div>
        </div>
        
        <div className="mt-4 overflow-x-auto max-h-[600px] border border-black/10 rounded-xl relative">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-white shadow-sm z-10">
              <tr className="text-black/50">
                <th className="py-3 px-4 font-bold border-b">Player</th>
                <th className="py-3 px-2 font-bold border-b" title="Appearances">A</th>
                <th className="py-3 px-2 font-bold border-b" title="Sub On">ON</th>
                <th className="py-3 px-2 font-bold border-b" title="Sub Off">Off</th>
                <th className="py-3 px-2 font-bold border-b" title="Goals">G</th>
                <th className="py-3 px-2 font-bold border-b" title="Penalties">P</th>
                <th className="py-3 px-2 font-bold border-b" title="Penalties Missed">PM</th>
                <th className="py-3 px-2 font-bold border-b" title="Assists">Ass</th>
                <th className="py-3 px-2 font-bold border-b" title="Own Goals">OG</th>
                <th className="py-3 px-2 font-bold border-b" title="Yellow Cards">YC</th>
                <th className="py-3 px-2 font-bold border-b" title="Red Cards">RC</th>
                <th className="py-3 px-2 font-bold border-b" title="Clean Sheets">CS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map((p) => {
                const s = stats[p.id];
                if (!s) return null;
                
                const titles = {
                  appearances: "Appearances", subOn: "Sub On", subOff: "Sub Off", goals: "Goals",
                  penalties: "Penalties", penaltiesMissed: "Penalties Missed", assists: "Assists",
                  ownGoals: "Own Goals", yellowCards: "Yellow Cards", redCards: "Red Cards", cleanSheets: "Clean Sheets"
                };

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-200">
                          {p.photoUrl && <Image src={p.photoUrl} alt={p.lastName} width={32} height={32} className="object-cover h-full w-full" />}
                        </div>
                        <div>
                          <div className="font-bold">{p.firstName} {p.lastName}</div>
                          <div className="text-[10px] text-black/50">{p.position}</div>
                        </div>
                      </div>
                    </td>
                    {(Object.keys(titles) as Array<keyof typeof titles>).map((field) => (
                      <td key={field} className="px-1 py-2">
                        <input
                          type="number"
                          min="0"
                          title={`${titles[field]} for ${p.lastName}`}
                          className="w-12 rounded border px-2 py-1 text-center text-xs outline-none focus:border-red-500 hover:border-black/30 transition-colors"
                          value={s[field]}
                          onChange={(e) => updateField(p.id, field, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
