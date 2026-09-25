"use client";
import { useState } from "react";

function Facebook({ size = 24 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
}
function Instagram({ size = 24 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
}
function Youtube({ size = 24 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>;
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61.86-5.26 2.86-6.93 1.25-1.06 2.88-1.7 4.54-1.76V8.92c-.8.03-1.58.26-2.27.65-1.55.85-2.67 2.45-2.86 4.23-.2 1.76.51 3.58 1.83 4.74 1.29 1.15 3.16 1.48 4.79 1.05 1.54-.4 2.78-1.54 3.32-3.03.28-.79.37-1.63.36-2.47V.02z"/>
    </svg>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    setBusy(false);
    if (r.ok) {
      setSent(true);
      e.currentTarget.reset();
    }
  }

  return (
    <div>
      <section className="bg-black px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">Contact</p>
          <h1 className="mt-3 text-5xl font-black sm:text-7xl">Talk to the club.</h1>
          <p className="mt-5 max-w-2xl text-white/60">Send a message to the Solmart FC team. Submissions are securely stored for the club administration.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-black mb-4">Connect with us</h2>
          <p className="text-black/60 mb-8 max-w-md">Follow our social channels to get the latest updates, exclusive content, behind the scenes, and matchday live streams.</p>
          <div className="flex flex-col gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-black font-bold p-4 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <Facebook size={24} /> Official Facebook Page
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-black font-bold p-4 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <Instagram size={24} /> @solmartfc_official
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-black font-bold p-4 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <TiktokIcon /> @solmartfc
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-black font-bold p-4 rounded-2xl border hover:bg-neutral-50 transition-colors">
              <Youtube size={24} /> Solmart FC TV
            </a>
          </div>
        </div>
        <div>
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-zinc-200 p-6 shadow-sm sm:p-8 bg-white">
            {sent && <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-800">Message received. Thank you.</div>}
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Name
                <input required name="name" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold">
                Email
                <input required type="email" name="email" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" />
              </label>
            </div>
            <label className="block text-sm font-bold">
              Subject
              <input required name="subject" className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" />
            </label>
            <label className="block text-sm font-bold">
              Message
              <textarea required name="message" rows={6} className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3" />
            </label>
            <button disabled={busy} className="w-full rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-700 disabled:opacity-50">
              {busy ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
