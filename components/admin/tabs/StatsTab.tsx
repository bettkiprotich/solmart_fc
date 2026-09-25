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
        
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b text-black/50">
                <th className="pb-3 pr-4 font-bold">Player</th>
                <th className="pb-3 px-2 font-bold" title="Appearances">A</th>
                <th className="pb-3 px-2 font-bold" title="Sub On">ON</th>
                <th className="pb-3 px-2 font-bold" title="Sub Off">Off</th>
                <th className="pb-3 px-2 font-bold" title="Goals">G</th>
                <th className="pb-3 px-2 font-bold" title="Penalties">P</th>
                <th className="pb-3 px-2 font-bold" title="Penalties Missed">PM</th>
                <th className="pb-3 px-2 font-bold" title="Assists">Ass</th>
                <th className="pb-3 px-2 font-bold" title="Own Goals">OG</th>
                <th className="pb-3 px-2 font-bold" title="Yellow Cards">YC</th>
                <th className="pb-3 px-2 font-bold" title="Red Cards">RC</th>
                <th className="pb-3 px-2 font-bold" title="Clean Sheets">CS</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {players.map((p) => {
                const s = stats[p.id];
                if (!s) return null;
                return (
                  <tr key={p.id}>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-100">
                          {p.photoUrl && <Image src={p.photoUrl} alt={p.lastName} width={32} height={32} className="object-cover h-full w-full" />}
                        </div>
                        <div>
                          <div className="font-bold">{p.firstName} {p.lastName}</div>
                          <div className="text-[10px] text-black/50">{p.position}</div>
                        </div>
                      </div>
                    </td>
                    {["appearances", "subOn", "subOff", "goals", "penalties", "penaltiesMissed", "assists", "ownGoals", "yellowCards", "redCards", "cleanSheets"].map((field) => (
                      <td key={field} className="px-1 py-2">
                        <input
                          type="number"
                          min="0"
                          className="w-12 rounded border px-2 py-1 text-center text-xs"
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
