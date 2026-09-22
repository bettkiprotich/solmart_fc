import { useState } from "react";
import { AnyRecord, cardClass, inputClass } from "./shared";
import { toast } from "sonner";

export function SettingsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const current = (key: string) => rows.find((x) => x.key === key)?.value || "";
  const [form, setForm] = useState({ club_mission: current("club_mission"), club_vision: current("club_vision"), club_values: current("club_values"), club_history: current("club_history") });
  const [busy, setBusy] = useState(false);

  const save = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      for (const [key, value] of Object.entries(form)) {
        await mutate("/api/admin/settings", "POST", { key, value, isPublic: true });
      }
      toast.success("Club identity saved.");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Club identity</h2>
        <p className="mt-1 text-sm text-black/50">Edit the content shown on the public Club page. Slugs and technical keys are managed automatically.</p>
        <form className="mt-4 space-y-4" onSubmit={save}>
          <label className="block text-sm font-bold">
            Mission
            <textarea className={inputClass + " mt-2 min-h-28"} value={form.club_mission} onChange={(e) => setForm({ ...form, club_mission: e.target.value })} placeholder="Enter the official club mission" />
          </label>
          <label className="block text-sm font-bold">
            Vision
            <textarea className={inputClass + " mt-2 min-h-28"} value={form.club_vision} onChange={(e) => setForm({ ...form, club_vision: e.target.value })} placeholder="Enter the official club vision" />
          </label>
          <label className="block text-sm font-bold">
            Core values
            <textarea className={inputClass + " mt-2 min-h-24"} value={form.club_values} onChange={(e) => setForm({ ...form, club_values: e.target.value })} placeholder="Enter the official club values" />
          </label>
          <label className="block text-sm font-bold">
            Club history
            <textarea className={inputClass + " mt-2 min-h-32"} value={form.club_history} onChange={(e) => setForm({ ...form, club_history: e.target.value })} placeholder="Enter the official club history" />
          </label>
          <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white">
            {busy ? "Saving…" : "Save club identity"}
          </button>
        </form>
      </div>
      <div className={cardClass}>
        <h2 className="text-xl font-black">Other site settings</h2>
        <div className="divide-y">
          {rows
            .filter((x) => !["club_mission", "club_vision", "club_values", "club_history"].includes(x.key))
            .map((x) => (
              <div key={x.id} className="grid gap-2 py-3 md:grid-cols-[220px_1fr]">
                <b>{x.key}</b>
                <span className="text-sm text-black/60">{x.value}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export function MessagesTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  return (
    <div className={cardClass}>
      <h2 className="text-xl font-black">Contact messages</h2>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-black/50">No messages.</p>
        ) : (
          rows.map((m) => (
            <div key={m.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <b>{m.subject}</b>
                  <p className="text-sm text-black/60">
                    {m.name} · {m.email}
                  </p>
                </div>
                <select className={inputClass + " max-w-xs"} value={m.status} onChange={(e) => mutate(`/api/admin/contact-messages?id=${m.id}`, "PATCH", { status: e.target.value })}>
                  {["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-black/70">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
