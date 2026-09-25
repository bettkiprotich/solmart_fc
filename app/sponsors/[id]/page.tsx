import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
  if (!sponsor) return { title: "Sponsor Not Found" };
  return { title: `${sponsor.name} - Solmart FC` };
}

export default async function SponsorPage({ params }: { params: { id: string } }) {
  const sponsor = await prisma.sponsor.findUnique({ where: { id: params.id } });
  if (!sponsor) return notFound();

  // Parse branches safely
  let branches: { name: string, embedHtml: string }[] = [];
  try {
    if (typeof sponsor.branches === "string") {
      branches = JSON.parse(sponsor.branches);
    } else if (Array.isArray(sponsor.branches)) {
      branches = sponsor.branches as any;
    }
  } catch (e) {}

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-zinc-100 py-20 px-5 lg:px-8 border-b">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-10">
          {sponsor.logoUrl ? (
            <div className="shrink-0 rounded-2xl bg-white p-8 shadow-sm">
              <Image src={sponsor.logoUrl} alt={sponsor.name} width={250} height={150} className="w-48 h-auto object-contain" />
            </div>
          ) : (
            <div className="shrink-0 size-48 rounded-2xl bg-white flex items-center justify-center text-4xl font-black shadow-sm text-zinc-300">
              {sponsor.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-100 text-red-600">
              Official Partner
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black">{sponsor.name}</h1>
            {sponsor.description && (
              <p className="mt-4 text-lg text-black/60 max-w-2xl">{sponsor.description}</p>
            )}
            {sponsor.websiteUrl && (
              <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer" className="inline-block mt-6 px-6 py-3 rounded-xl bg-black text-white font-bold hover:bg-neutral-800 transition">
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2">
            {sponsor.about ? (
              <div>
                <h2 className="text-2xl font-black mb-6 border-b pb-4">About {sponsor.name}</h2>
                <div className="prose prose-lg max-w-none prose-zinc">
                  {sponsor.about.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-black mb-6 border-b pb-4">About {sponsor.name}</h2>
                <p className="text-zinc-500 italic">No additional information provided.</p>
              </div>
            )}
          </div>

          <div>
            {branches.length > 0 && (
              <div className="bg-zinc-50 rounded-2xl p-6 border">
                <h3 className="text-xl font-black mb-6">Our Branches & Locations</h3>
                <div className="space-y-8">
                  {branches.map((b, i) => (
                    <div key={i} className="space-y-3">
                      <h4 className="font-bold text-black border-b pb-2">{b.name}</h4>
                      <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner bg-zinc-200" dangerouslySetInnerHTML={{ __html: b.embedHtml || "" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
