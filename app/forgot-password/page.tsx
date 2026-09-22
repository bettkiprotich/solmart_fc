"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error || "Unable to request reset.");
      else {
        setMessage(d.message);
        setEmail("");
      }
    } catch {
      setError("Unable to connect right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl px-5 py-20 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Recovery</p>
      <h1 className="mt-3 text-5xl font-black">Forgot password.</h1>
      <p className="mt-4 text-zinc-600">Enter your email address and we will send you a link to reset your password.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input 
          required 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="w-full rounded-xl border px-4 py-3" 
        />
        <button disabled={busy} className="w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white disabled:opacity-50">
          {busy ? "Please wait…" : "Send reset link"}
        </button>
      </form>

      {message && <p className="mt-4 rounded-xl bg-green-50 p-4 font-bold text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">{error}</p>}
      
      <div className="mt-6 flex gap-4 text-sm font-black underline">
        <Link href="/account">Back to sign in</Link>
        <Link href="/admin/login">Admin sign in</Link>
      </div>
    </section>
  );
}
