"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminSetupPage() {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [form, setForm] = useState({ demoPassword: "", firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch("/api/setup/super-admin", { cache: "no-store" }).then(r => r.json()).then(d => setAvailable(d.available)).catch(() => setAvailable(false)); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/setup/super-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) { setMessage(d.error ?? "Unable to create administrator."); return; }
      setMessage("SUPER_ADMIN created successfully. You can now sign in through the admin login.");
      setTimeout(() => router.push("/admin/login"), 900);
    } catch { setMessage("Unable to connect right now."); } finally { setBusy(false); }
  }

  if (available === null) return <main className="mx-auto max-w-xl px-5 py-20"><p className="font-bold">Checking administrator setup…</p></main>;
  if (!available) return <main className="mx-auto max-w-xl px-5 py-20"><h1 className="text-4xl font-black">Administrator setup complete</h1><p className="mt-4 text-zinc-600">A real SUPER_ADMIN already exists. Sign in through the admin login.</p><a className="mt-6 inline-block rounded-xl bg-red-600 px-5 py-3 font-black text-white" href="/admin/login">Go to Admin Login</a></main>;

  return <main className="mx-auto max-w-xl px-5 py-14 lg:px-8"><p className="text-xs font-black uppercase tracking-[.3em] text-red-600">One-time setup</p><h1 className="mt-3 text-5xl font-black">Create your SUPER_ADMIN</h1><p className="mt-4 text-sm leading-6 text-zinc-600">Enter the current demo administrator password to prove access, then create your permanent administrator account. After a real SUPER_ADMIN exists, this setup page becomes unavailable.</p><form onSubmit={submit} className="mt-8 space-y-4"><input required type="password" placeholder="Current demo admin password" value={form.demoPassword} onChange={e=>setForm({...form,demoPassword:e.target.value})} className="w-full rounded-xl border px-4 py-3"/><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="First name" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} className="rounded-xl border px-4 py-3"/><input required placeholder="Last name" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} className="rounded-xl border px-4 py-3"/></div><input required type="email" placeholder="Your email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full rounded-xl border px-4 py-3"/><input required minLength={8} type="password" placeholder="Your new password (8+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="w-full rounded-xl border px-4 py-3"/><input required minLength={8} type="password" placeholder="Confirm your new password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} className="w-full rounded-xl border px-4 py-3"/><button disabled={busy} className="w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white">{busy?"Creating…":"Create SUPER_ADMIN account"}</button></form>{message&&<p className="mt-4 rounded-xl bg-zinc-100 p-4 text-sm font-bold">{message}</p>}</main>;
}
