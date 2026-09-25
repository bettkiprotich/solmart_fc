"use client";
import { useState, useEffect } from "react";
import { api } from "./shared";
import { LeagueTable, Team, Competition } from "@prisma/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function TableTab({ data, refresh }: { data: { table?: (LeagueTable & { team: Team, competition: Competition })[], competitions?: (Competition & { teams: Team[] })[], teams?: Team[] }, refresh: () => void }) {
  const [saving, setSaving] = useState(false);
  
  const competitions = data?.competitions || [];
  const table = data?.table || [];

  // Group table rows by competition
  const competitionsWithTable = competitions.filter(c => c.teams && c.teams.length > 0);
  const [selectedCompId, setSelectedCompId] = useState(competitionsWithTable[0]?.id || competitions[0]?.id);

  const [rows, setRows] = useState(table);

  // Auto-sync missing teams into the table state
  useEffect(() => {
    let syncedRows = [...table];
    
    // For every competition, ensure its teams are in the table rows
    competitions.forEach(comp => {
      if (!comp.teams) return;
      const compRows = syncedRows.filter(r => r.competitionId === comp.id);
      const existingTeamIds = new Set(compRows.map(r => r.teamId));
      
      const missing = comp.teams.filter(t => !existingTeamIds.has(t.id));
      if (missing.length > 0) {
        missing.forEach(team => {
          syncedRows.push({
            id: `new-${comp.id}-${team.id}`,
            competitionId: comp.id,
            teamId: team.id,
            team,
            position: compRows.length + 1,
            played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
          } as any);
        });
      }
    });

    setRows(syncedRows);

    if (!selectedCompId) {
      setSelectedCompId(competitionsWithTable[0]?.id || competitions[0]?.id);
    }
  }, [data]);

  const compRows = rows.filter(r => r.competitionId === selectedCompId).sort((a, b) => a.position - b.position);
  
  const updateRow = (id: string, field: string, value: string | number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api("/api/admin/league-table", { method: "POST", body: JSON.stringify({ rows: compRows }) });
      toast.success("Table updated");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">League Tables</h2>
        <div className="flex items-center gap-4">
          <select 
            className="border p-2 rounded" 
            value={selectedCompId} 
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-bold text-white hover:bg-black/80 disabled:opacity-50">
            <Save className="h-4 w-4" /> Save Table
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 border-b">
            <tr>
              <th className="p-4 font-bold text-black/50">Pos</th>
              <th className="p-4 font-bold text-black/50">Team</th>
              <th className="p-4 font-bold text-black/50">Played</th>
              <th className="p-4 font-bold text-black/50">W</th>
              <th className="p-4 font-bold text-black/50">D</th>
              <th className="p-4 font-bold text-black/50">L</th>
              <th className="p-4 font-bold text-black/50">GF</th>
              <th className="p-4 font-bold text-black/50">GA</th>
              <th className="p-4 font-bold text-black/50">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {compRows.map(r => (
              <tr key={r.id}>
                <td className="p-2"><input type="number" value={r.position} onChange={(e) => updateRow(r.id, "position", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-4 font-bold">{r.team.name}</td>
                <td className="p-2"><input type="number" value={r.played} onChange={(e) => updateRow(r.id, "played", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.wins} onChange={(e) => updateRow(r.id, "wins", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.draws} onChange={(e) => updateRow(r.id, "draws", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.losses} onChange={(e) => updateRow(r.id, "losses", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.goalsFor} onChange={(e) => updateRow(r.id, "goalsFor", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.goalsAgainst} onChange={(e) => updateRow(r.id, "goalsAgainst", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center" /></td>
                <td className="p-2"><input type="number" value={r.points} onChange={(e) => updateRow(r.id, "points", parseInt(e.target.value) || 0)} className="w-16 border rounded p-1 text-center font-bold" /></td>
              </tr>
            ))}
            {compRows.length === 0 && (
              <tr><td colSpan={9} className="p-4 text-center text-black/50">No teams added to this table yet. Add teams from database directly for now.</td></tr>
            )}
          </tbody>
        </table>
        {missingTeams.length > 0 && (
          <div className="p-4 border-t bg-zinc-50 flex items-center gap-4">
            <span className="text-sm font-bold text-black/50">Add participating team to table:</span>
            <select className="border rounded p-2 text-sm" onChange={(e) => { if(e.target.value) addRow(e.target.value); e.target.value = ""; }} defaultValue="">
              <option value="" disabled>Select team...</option>
              {missingTeams.map((t: Team) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
