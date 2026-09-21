import Link from "next/link";

export function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="text-xs font-black uppercase tracking-[.28em] text-red-600">{eyebrow}</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>{description && <p className="mt-3 max-w-2xl text-zinc-600">{description}</p>}</div>
    {href && <Link href={href} className="text-sm font-black text-red-600 hover:text-red-700">{linkLabel ?? "Explore"} →</Link>}
  </div>;
}
