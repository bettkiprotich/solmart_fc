import { useState } from "react";
import { AnyRecord, cardClass, inputClass, upload } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function SponsorsTab({ rows, mutate }: { rows: AnyRecord[]; mutate: any }) {
  const [s, setS] = useState({ name: "", websiteUrl: "", description: "", active: true });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h2 className="text-xl font-black">Sponsors</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              let logoUrl = null;
              if (file) logoUrl = await upload(file, "teams");
              await mutate("/api/admin/sponsors", "POST", { ...s, websiteUrl: s.websiteUrl || null, logoUrl });
              toast.success("Sponsor added!");
              setS({ name: "", websiteUrl: "", description: "", active: true });
              setFile(null);
            } catch (err) {
              toast.error("Failed to add sponsor");
            } finally {
              setBusy(false);
            }
          }}
        >
          <input className={inputClass} placeholder="Sponsor name" required value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} />
          <input className={inputClass} type="url" placeholder="Website URL" value={s.websiteUrl} onChange={(e) => setS({ ...s, websiteUrl: e.target.value })} />
          <input className={inputClass} placeholder="Description" value={s.description} onChange={(e) => setS({ ...s, description: e.target.value })} />
          
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold md:col-span-2">
            Sponsor Logo
            <input className="mt-2 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          
          <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white md:col-span-2 disabled:opacity-50">
            {busy ? "Uploading..." : "Add sponsor"}
          </button>
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
              <b>{x.name}</b>
            </div>
            <button className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => mutate(`/api/admin/sponsors?id=${x.id}`, "PATCH", { active: !x.active })}>
              {x.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
