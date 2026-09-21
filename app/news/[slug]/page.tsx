import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      author: { select: { firstName: true, lastName: true } },
    },
  });

  if (!article) notFound();

  const authorName = article.author
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Solmart FC"
    : "Solmart FC";
  const categoryName = article.category?.name ?? "Club News";

  return (
    <article>
      <header className="bg-black px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">
            {categoryName}
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">{article.title}</h1>
          <p className="mt-5 text-white/50">
            {article.publishedAt?.toLocaleDateString("en-GB")} · {authorName}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xl leading-8 text-zinc-600">{article.excerpt}</p>
        <div className="mt-10 whitespace-pre-wrap text-base leading-8 text-zinc-800">
          {article.content}
        </div>
        {article.isDemoData && (
          <p className="mt-10 rounded-2xl bg-amber-50 p-5 text-sm font-bold text-amber-900">
            Demo content — replace this article through the CMS before production.
          </p>
        )}
      </div>
    </article>
  );
}
