import { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — FertTrack",
  description: "Guides and updates from the FertTrack team.",
};

export default function BlogIndexPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 tracking-tight">
          Blog
        </h1>
        <p className="mt-3 text-charcoal-500 leading-relaxed">
          Guides on fertility, daily habits, and navigating care.
        </p>
      </div>

      <div className="divide-y divide-charcoal-100 border-y border-charcoal-100">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block py-6 group"
          >
            <p className="text-xs font-medium text-charcoal-400">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-xl font-bold text-charcoal-900 group-hover:text-teal-700 transition-colors">
              {post.title}
            </h2>
            <p className="mt-2 text-sm text-charcoal-500 leading-relaxed">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
