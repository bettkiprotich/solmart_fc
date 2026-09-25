"use client";
import { useState } from "react";
import Image from "next/image";
import { Document, Sponsor } from "@prisma/client";

export function ClubHub({ documents, sponsors }: { documents: Document[]; sponsors: Sponsor[] }) {
  const [tab, setTab] = useState<"INFO" | "LINKS" | "DOCUMENTS" | "POLICIES" | "SPONSORS">("INFO");
  const tabs = ["INFO", "LINKS", "DOCUMENTS", "POLICIES", "SPONSORS"] as const;

  const policies = documents.filter(d => d.type === "POLICY");
  const docs = documents.filter(d => d.type === "DOCUMENT");
  const links = documents.filter(d => d.type === "LINK");

  return (
    <div>
      <div className="bg-black text-white py-12 md:py-20 text-center">
         <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Club Information</h1>
         <p className="mt-4 text-white/50 max-w-2xl mx-auto px-4 text-lg">Everything you need to know about Solmart FC.</p>
      </div>

      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-x-auto hide-scrollbar">
          <div className="flex gap-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-4 transition-colors ${tab === t ? "border-red-600 text-red-600" : "border-transparent text-black/60 hover:text-black"}`}
              >
                {t === "INFO" ? "Club Info" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16 min-h-[50vh]">
         {tab === "INFO" && (
           <div className="prose prose-sm md:prose-base max-w-none text-black/70">
             <h2>About Solmart FC</h2>
             <p>Solmart FC is a community-driven football club dedicated to excellence on and off the pitch. Founded with a vision to nurture local talent and provide a professional platform for aspiring players, our club has grown into a beacon of sporting achievement in the region.</p>
             <p>Our core values are integrity, hard work, and community. We believe in developing not just great footballers, but great individuals who contribute positively to society.</p>
           </div>
         )}

         {tab === "SPONSORS" && (
           <div className="space-y-12">
             <div className="prose prose-sm md:prose-base max-w-none text-black/70 text-center mx-auto mb-12">
               <p>We are incredibly grateful to our partners and sponsors who make everything we do possible. Their support allows us to maintain top-tier facilities, develop youth academies, and compete at the highest levels.</p>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sponsors.map(s => (
                  <a key={s.id} href={s.websiteUrl || "#"} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-6 border rounded-3xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                     {s.logoUrl ? (
                       <Image src={s.logoUrl} alt={s.name} width={120} height={120} className="object-contain h-24 w-24 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
                     ) : (
                       <div className="font-black text-xl text-black/30">{s.name}</div>
                     )}
                  </a>
                ))}
                {sponsors.length === 0 && <p className="col-span-full text-center text-black/50">No sponsors listed.</p>}
             </div>
           </div>
         )}

         {tab === "POLICIES" && (
           <div className="space-y-4">
             {policies.length === 0 ? <p className="text-black/50">No policies uploaded yet.</p> : policies.map(p => (
               <a href={p.url} target="_blank" rel="noreferrer" key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-zinc-50 transition-colors">
                 <div className="font-bold">{p.title}</div>
                 <div className="text-red-600 text-sm font-bold uppercase">View PDF</div>
               </a>
             ))}
           </div>
         )}

         {tab === "DOCUMENTS" && (
           <div className="space-y-4">
             {docs.length === 0 ? <p className="text-black/50">No documents uploaded yet.</p> : docs.map(p => (
               <a href={p.url} target="_blank" rel="noreferrer" key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-zinc-50 transition-colors">
                 <div className="font-bold">{p.title}</div>
                 <div className="text-red-600 text-sm font-bold uppercase">Download</div>
               </a>
             ))}
           </div>
         )}

         {tab === "LINKS" && (
           <div className="space-y-4">
             {links.length === 0 ? <p className="text-black/50">No external links provided.</p> : links.map(p => (
               <a href={p.url} target="_blank" rel="noreferrer" key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-zinc-50 transition-colors">
                 <div className="font-bold">{p.title}</div>
                 <div className="text-red-600 text-sm font-bold uppercase">Visit</div>
               </a>
             ))}
           </div>
         )}
      </div>
    </div>
  );
}
