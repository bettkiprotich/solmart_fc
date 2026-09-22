"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="mt-8 rounded-xl bg-red-50 p-4 font-bold text-red-700">
        Invalid or missing reset token. Please request a new password reset link.
        <div className="mt-4"><Link href="/forgot-password" className="underline">Go to forgot password</Link></div>
      </div>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await r.json();
      if (!r.ok) setError(d.error || "Unable to reset password.");
      else {
        setMessage(d.message);
        setTimeout(() => {
          router.push("/account");
        }, 2000);
      }
    } catch {
      setError("Unable to connect right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="relative">
          <input 
            required 
            type={showPassword ? "text" : "password"} 
            minLength={8}
            placeholder="New Password (8+ characters)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full rounded-xl border px-4 py-3 pr-12" 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-zinc-400 hover:text-black"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
            )}
          </button>
        </div>
        <button disabled={busy} className="w-full rounded-xl bg-red-600 px-5 py-4 font-black text-white disabled:opacity-50">
          {busy ? "Please wait…" : "Reset password"}
        </button>
      </form>

      {message && <p className="mt-4 rounded-xl bg-green-50 p-4 font-bold text-green-700">{message}</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 font-bold text-red-700">{error}</p>}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-xl px-5 py-20 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[.3em] text-red-600">Recovery</p>
      <h1 className="mt-3 text-5xl font-black">Reset password.</h1>
      <p className="mt-4 text-zinc-600">Enter your new password below.</p>
      
      <Suspense fallback={<p className="mt-8 font-bold">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
