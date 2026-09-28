import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle } from "lucide-react";

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
      author: { select: { firstName: true, lastName: true, id: true } },
    },
  });

  if (!article) notFound();

  // Fetch related articles (latest 3 excluding current)
  const relatedArticles = await prisma.newsArticle.findMany({
    where: { status: "PUBLISHED", id: { not: article.id } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: { category: true }
  });

  const authorName = article.author
    ? [article.author.firstName, article.author.lastName].filter(Boolean).join(" ") || "Solmart FC"
    : "Solmart FC";
  const categoryName = article.category?.name ?? "Club News";

  // Using a placeholder URL for sharing
  const shareUrl = `https://solmartfc.com/news/${article.slug}`;

  return (
    <article className="bg-zinc-50 min-h-screen pb-20">
      {/* Hero Section */}
      <header className="bg-black text-white relative">
        {article.coverImageUrl && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={article.coverImageUrl} 
              alt={article.title} 
              fill 
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
        )}
        <div className="relative z-10 px-5 py-24 lg:px-8 mx-auto max-w-4xl text-center">
          <p className="inline-block bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-[.2em] text-white rounded-full mb-6">
            {categoryName}
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl leading-tight">{article.title}</h1>
          <div className="mt-8 flex items-center justify-center gap-4 text-white/70 font-medium">
            <span>{article.publishedAt?.toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                {authorName.charAt(0)}
              </div>
              {authorName}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
            {article.excerpt && (
              <p className="text-xl leading-relaxed text-zinc-600 font-medium mb-8 pb-8 border-b">
                {article.excerpt}
              </p>
            )}
            
            <div className="prose prose-lg prose-zinc max-w-none whitespace-pre-wrap text-zinc-800">
              {article.content}
            </div>

            {article.isDemoData && (
              <p className="mt-10 rounded-2xl bg-amber-50 p-5 text-sm font-bold text-amber-900 border border-amber-200">
                Demo content — replace this article through the CMS before production.
              </p>
            )}

            {/* Tags / Categories */}
            <div className="mt-12 pt-8 border-t flex items-center gap-4">
              <span className="font-bold text-sm text-black/50 uppercase tracking-wider">Tags:</span>
              <span className="bg-zinc-100 text-black px-4 py-1.5 rounded-full text-sm font-bold">{categoryName}</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-black/5">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-red-600" />
              Comments (0)
            </h3>
            
            <div className="bg-zinc-50 rounded-2xl p-6 text-center border border-dashed border-black/10">
              <p className="text-black/60 mb-4 font-medium">Join the discussion</p>
              <button className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-black/80 transition-colors">
                Sign in to comment
              </button>
            </div>
            {/* Real comments loop would go here */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Share Widget */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 sticky top-24">
            <h3 className="font-black text-lg mb-4">Share this article</h3>
            <div className="flex flex-col gap-3">
              <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${article.title}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-zinc-50 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors p-3 rounded-xl font-bold">
                <Twitter className="h-5 w-5" /> Twitter
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-zinc-50 hover:bg-[#4267B2]/10 hover:text-[#4267B2] transition-colors p-3 rounded-xl font-bold">
                <Facebook className="h-5 w-5" /> Facebook
              </a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${article.title}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-zinc-50 hover:bg-[#0077b5]/10 hover:text-[#0077b5] transition-colors p-3 rounded-xl font-bold">
                <Linkedin className="h-5 w-5" /> LinkedIn
              </a>
              <button onClick={() => {}} className="flex items-center gap-3 bg-zinc-50 hover:bg-black/5 transition-colors p-3 rounded-xl font-bold w-full text-left">
                <LinkIcon className="h-5 w-5" /> Copy Link
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
              <h3 className="font-black text-lg mb-6 pb-4 border-b">Latest News</h3>
              <div className="space-y-6">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={`/news/${rel.slug}`} className="group block">
                    <div className="aspect-video w-full rounded-xl bg-zinc-100 overflow-hidden relative mb-3">
                      {rel.coverImageUrl ? (
                        <Image src={rel.coverImageUrl} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-black/20" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 block">
                      {rel.category?.name || "News"}
                    </span>
                    <h4 className="font-bold line-clamp-2 group-hover:text-red-600 transition-colors">
                      {rel.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
