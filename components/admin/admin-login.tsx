"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin.demo@solmartfc.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in.");
      if (!["ADMIN", "SUPER_ADMIN"].includes(data.user?.role)) throw new Error("Administrator access is required.");
      router.push("/admin"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in."); }
    finally { setLoading(false); }
  }

  return <main className="min-h-[70vh] bg-neutral-950 px-5 py-16 text-white"><div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8"><p className="text-xs font-black uppercase tracking-[.25em] text-red-500">Solmart FC</p><h1 className="mt-3 text-3xl font-black">Admin sign in</h1><p className="mt-2 text-sm text-white/60">Restricted area for authorized club administrators.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-bold">Email<input className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white" value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label><label className="block text-sm font-bold">Password<input className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white" value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>{error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-red-600 px-4 py-3 font-black disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button></form></div></main>;
}
