import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: `${post.title} — FertTrack`, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-teal-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <p className="text-xs font-medium text-charcoal-400">
        {new Date(post.date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight leading-tight">
        {post.title}
      </h1>

      <div className="mt-8 space-y-5">
        {post.body.map((paragraph, i) => (
          <p key={i} className="text-charcoal-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
