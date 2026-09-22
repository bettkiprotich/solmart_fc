import { useState } from "react";
import { AdminUser, AnyRecord, cardClass, inputClass, api } from "./shared";
import { toast } from "sonner";

export function UsersTab({ rows, mutate, admin }: { rows: AnyRecord[]; mutate: any; admin: AdminUser }) {
  const [u, setU] = useState({ firstName: "", lastName: "", email: "", password: "", role: "CUSTOMER" });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const create = async (e: any) => {
    e.preventDefault();
    setBusy(true);
    try {
      await mutate("/api/admin/users", "POST", u);
      setU({ firstName: "", lastName: "", email: "", password: "", role: "CUSTOMER" });
      setOpen(false);
      toast.success("User created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create user.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (user: any) => {
    if (user.id === admin.id) return;
    if (!window.confirm(`Remove ${user.email}? Existing orders will be preserved but detached from this account.`)) return;
    try {
      const d = await api(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      toast.success(d.message || "User removed.");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to remove user.");
    }
  };

  return (
    <div className="space-y-5">
      {admin.role === "SUPER_ADMIN" && (
        <div className={cardClass}>
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-xl font-black">Create administrator or user</span>
              <span className="mt-1 block text-sm text-black/50">Create a customer, ADMIN or SUPER_ADMIN account.</span>
            </span>
            <span className="text-sm font-black text-red-600">{open ? "Hide" : "Create user"}</span>
          </button>
          {open && (
            <form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-2">
              <input className={inputClass} required placeholder="First name" value={u.firstName} onChange={(e) => setU({ ...u, firstName: e.target.value })} />
              <input className={inputClass} required placeholder="Last name" value={u.lastName} onChange={(e) => setU({ ...u, lastName: e.target.value })} />
              <input className={inputClass} required type="email" placeholder="Email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} />
              <input className={inputClass} required minLength={8} type="password" placeholder="Temporary password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} />
              <select className={inputClass} value={u.role} onChange={(e) => setU({ ...u, role: e.target.value })}>
                {["CUSTOMER", "ADMIN", "SUPER_ADMIN"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <button disabled={busy} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white">
                {busy ? "Creating…" : "Create user"}
              </button>
            </form>
          )}
        </div>
      )}
      <div className={cardClass}>
        <h2 className="text-xl font-black">Users & customers</h2>
        <p className="mt-1 text-sm text-black/50">Role changes and user removal require SUPER_ADMIN. Users can change their own password from Account.</p>
        <div className="mt-4 space-y-2">
          {rows.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <b>
                  {u.firstName || ""} {u.lastName || ""}
                </b>
                <p className="text-sm text-black/50">
                  {u.email} · {u._count?.orders ?? 0} orders
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {admin.role === "SUPER_ADMIN" ? (
                  <select
                    className={inputClass + " max-w-xs"}
                    value={u.role}
                    disabled={u.id === admin.id}
                    onChange={(e) => mutate(`/api/admin/users?id=${u.id}`, "PATCH", { role: e.target.value })}
                  >
                    {["CUSTOMER", "ADMIN", "SUPER_ADMIN"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                ) : (
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black">{u.role}</span>
                )}
                {admin.role === "SUPER_ADMIN" && u.id !== admin.id && (
                  <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700" onClick={() => remove(u)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
