import { useState } from "react";
import { AnyRecord, cardClass, inputClass } from "./shared";
import { toast } from "sonner";

export function SponsorsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const [s, setS] = useState({ name: "", websiteUrl: "", logoUrl: "", description: "", active: true });
  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Sponsors</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await mutate("/api/admin/sponsors", "POST", { ...s, websiteUrl: s.websiteUrl || null, logoUrl: s.logoUrl || null });
              toast.success("Sponsor added!");
              setS({ name: "", websiteUrl: "", logoUrl: "", description: "", active: true });
            } catch (err) {
              toast.error("Failed to add sponsor");
            }
          }}
        >
          <input className={inputClass} placeholder="Sponsor name" required value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <input className={inputClass} type="url" placeholder="Website URL" value={s.websiteUrl} onChange={(e) => setS({ ...s, websiteUrl: e.target.value })} />
          <input className={inputClass} type="url" placeholder="Logo URL" value={s.logoUrl} onChange={(e) => setS({ ...s, logoUrl: e.target.value })} />
          <input className={inputClass} placeholder="Description" value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} />
          <button className="rounded-xl bg-red-600 px-4 py-3 font-black text-white md:col-span-2">Add sponsor</button>
        </form>
      </div>
      <div className={cardClass}>
        {rows.map((x) => (
          <div key={x.id} className="flex items-center justify-between border-b py-3 last:border-0">
            <b>{x.name}</b>
            <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => mutate(`/api/admin/sponsors?id=${x.id}`, "PATCH", { active: !x.active })}>
              {x.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
