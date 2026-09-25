import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function MatchesTab({ rows, teams, competitions, mutate }: { rows: AnyRecord[]; teams: AnyRecord[]; competitions: AnyRecord[]; mutate: any }) {
  const blank = { homeTeamName: "", awayTeamName: "", homeTeamLogoUrl: "", awayTeamLogoUrl: "", competitionName: "", type: "MATCH", kickoffAt: "", venue: "", status: "SCHEDULED", homeScore: "", awayScore: "", attendance: "", matchReport: "" };
  const [m, setM] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"home" | "away" | null>(null);

  const save = async (e: any) => {
    e.preventDefault();
    const body = {
      ...m,
      homeTeamLogoUrl: m.homeTeamLogoUrl || null,
      awayTeamLogoUrl: m.awayTeamLogoUrl || null,
      homeScore: m.homeScore === "" ? null : Number(m.homeScore),
      awayScore: m.awayScore === "" ? null : Number(m.awayScore),
      attendance: m.attendance === "" ? null : Number(m.attendance),
    };
    try {
      await mutate(editing ? `/api/admin/matches?id=${editing}` : "/api/admin/matches", editing ? "PATCH" : "POST", body);
      toast.success("Fixture saved!");
      setM(blank);
      setEditing(null);
    } catch (err) {
      // toast is handled by mutate if needed, or we can handle it here if mutate throws
    }
  };

  const edit = (x: any) => {
    setEditing(x.id);
    setM({
      homeTeamName: x.homeTeam?.name || "",
      awayTeamName: x.awayTeam?.name || "",
      homeTeamLogoUrl: x.homeTeam?.logoUrl || "",
      awayTeamLogoUrl: x.awayTeam?.logoUrl || "",
      competitionName: x.competition?.name || "",
      type: x.type || "MATCH",
      kickoffAt: new Date(x.kickoffAt).toISOString().slice(0, 16),
      venue: x.venue || "",
      status: x.status,
      homeScore: x.homeScore ?? "",
      awayScore: x.awayScore ?? "",
      attendance: x.attendance ?? "",
      matchReport: x.matchReport || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (x: any) => {
    if (!confirm(`Delete ${x.homeTeam?.name || "Home"} vs ${x.awayTeam?.name || "Away"}?`)) return;
    try {
      await mutate(`/api/admin/matches?id=${x.id}`, "DELETE", {});
    } catch (e) {
        toast.error("Failed to delete match");
    }
  };

  const setLogo = async (side: "home" | "away", file: File) => {
    setUploading(side);
    try {
      const url = await upload(file, "teams");
      setM((v) => ({ ...v, [side === "home" ? "homeTeamLogoUrl" : "awayTeamLogoUrl"]: url }));
      toast.success("Logo uploaded!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Logo upload failed.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Fixtures & results</h2>
        <p className="mt-1 text-sm text-black/50">Type team and competition names directly. Existing teams and competitions are suggested.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={save}>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">Home team</label>
            <input className={inputClass} required list="team-names" placeholder="Home team" value={m.homeTeamName} onChange={(e) => setM({ ...m, homeTeamName: e.target.value })} />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold">
                {uploading === "home" ? "Uploading…" : "Upload home logo"}
                <input
                  className="hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={!!uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogo("home", f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {m.homeTeamLogoUrl && <Image src={m.homeTeamLogoUrl} alt="Home team logo preview" width={40} height={40} className="size-10 rounded-full object-contain" />}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">Away team</label>
            <input className={inputClass} required list="team-names" placeholder="Away team" value={m.awayTeamName} onChange={(e) => setM({ ...m, awayTeamName: e.target.value })} />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-bold">
                {uploading === "away" ? "Uploading…" : "Upload away logo"}
                <input
                  className="hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={!!uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLogo("away", f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              {m.awayTeamLogoUrl && <Image src={m.awayTeamLogoUrl} alt="Away team logo preview" width={40} height={40} className="size-10 rounded-full object-contain" />}
            </div>
          </div>
          <datalist id="team-names">
            {teams.map((t) => (
              <option key={t.id} value={t.name} />
            ))}
          </datalist>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-black/50">Competition</label>
            <input className={inputClass} list="competition-names" placeholder="Competition (optional)" value={m.competitionName} onChange={(e) => setM({ ...m, competitionName: e.target.value })} />
            <datalist id="competition-names">
              {competitions.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <select className={inputClass} value={m.type} onChange={(e) => setM({ ...m, type: e.target.value })}>
            {["MATCH", "TRAINING"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input className={inputClass} type="datetime-local" required value={m.kickoffAt} onChange={(e) => setM({ ...m, kickoffAt: e.target.value })} />
          <input className={inputClass} placeholder="Venue" value={m.venue} onChange={(e) => setM({ ...m, venue: e.target.value })} />
          <select className={inputClass} value={m.status} onChange={(e) => setM({ ...m, status: e.target.value })}>
            {["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {m.status === "COMPLETED" && (
            <>
              <input className={inputClass} type="number" min="0" placeholder="Home score" value={m.homeScore} onChange={(e) => setM({ ...m, homeScore: e.target.value })} />
              <input className={inputClass} type="number" min="0" placeholder="Away score" value={m.awayScore} onChange={(e) => setM({ ...m, awayScore: e.target.value })} />
              <input className={inputClass} type="number" min="0" placeholder="Attendance" value={m.attendance} onChange={(e) => setM({ ...m, attendance: e.target.value })} />
              <textarea className={inputClass + " md:col-span-2"} placeholder="Match report" value={m.matchReport} onChange={(e) => setM({ ...m, matchReport: e.target.value })} />
            </>
          )}
          <div className="flex gap-2 md:col-span-2">
            <button className="rounded-xl bg-red-600 px-4 py-3 font-black text-white">{editing ? "Save fixture changes" : "Create fixture"}</button>
            {editing && (
              <button
                type="button"
                className="rounded-xl border px-4 py-3 font-black"
                onClick={() => {
                  setEditing(null);
                  setM(blank);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>
      <div className={cardClass}>
        <div className="space-y-3">
          {rows.map((x) => (
            <div key={x.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <b>
                    {x.homeTeam?.shortName || x.homeTeam?.name} vs {x.awayTeam?.shortName || x.awayTeam?.name}
                  </b>
                  <p className="text-sm text-black/50">
                    {new Date(x.kickoffAt).toLocaleString()} · {x.venue || "Venue TBD"} · {x.competition?.name || "Competition TBD"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => edit(x)}>
                    Edit
                  </button>
                  <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => remove(x)}>
                    Delete
                  </button>
                  <select className={inputClass + " max-w-xs"} value={x.status} onChange={(e) => mutate(`/api/admin/matches?id=${x.id}`, "PATCH", { status: e.target.value })}>
                    {["SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
