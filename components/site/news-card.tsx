import Image from "next/image";
import Link from "next/link";

export function NewsCard({ article }: { article: any }) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/news/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
          {article.coverImageUrl ? <Image src={article.coverImageUrl} alt={article.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-end bg-gradient-to-br from-zinc-900 to-red-700 p-6 text-white"><span className="text-4xl font-black opacity-30">SFC</span></div>}
        </div>
        <div className="p-6"><div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.18em] text-red-600"><span>{article.category?.name ?? "Club News"}</span><span className="text-zinc-300">•</span><span className="text-zinc-500">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-GB") : ""}</span></div><h3 className="mt-3 text-xl font-black leading-tight">{article.title}</h3>{article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">{article.excerpt}</p>}<span className="mt-5 inline-block text-sm font-black text-zinc-900 transition group-hover:text-red-600">Read story →</span></div>
      </Link>
    </article>
  );
}
