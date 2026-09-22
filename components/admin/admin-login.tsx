"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin.demo@solmartfc.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  return <main className="min-h-[70vh] bg-neutral-950 px-5 py-16 text-white"><div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8"><p className="text-xs font-black uppercase tracking-[.25em] text-red-500">Solmart FC</p><h1 className="mt-3 text-3xl font-black">Admin sign in</h1><p className="mt-2 text-sm text-white/60">Restricted area for authorized club administrators.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-bold">Email<input className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white" value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label><div className="block"><label className="block text-sm font-bold">Password</label><div className="relative mt-2"><input className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 pr-12 text-white" value={password} onChange={e=>setPassword(e.target.value)} type={showPassword ? "text" : "password"} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-white/40 hover:text-white">{showPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}</button></div><div className="mt-2 text-right"><a href="/forgot-password" className="text-xs font-bold text-white/50 hover:text-white">Forgot password?</a></div></div>{error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-red-600 px-4 py-3 font-black disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button></form></div></main>;
}
