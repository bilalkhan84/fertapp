/**
 * Placeholder blog data. Replace these entries (or add more) with real
 * posts — title, excerpt, and body are all placeholder copy for now.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO date
  body: string[]; // paragraphs
}

export const blogPosts: BlogPost[] = [
  {
    slug: "placeholder-post-one",
    title: "[Placeholder] Add your first post title here",
    excerpt:
      "Replace this excerpt with a one- or two-sentence summary of your post. It shows up on the blog index page.",
    date: "2026-01-01",
    body: [
      "This is placeholder body copy — replace it with your real post content.",
      "Add as many paragraphs as you need here.",
    ],
  },
  {
    slug: "placeholder-post-two",
    title: "[Placeholder] Add your second post title here",
    excerpt:
      "Replace this excerpt with a one- or two-sentence summary of your post. It shows up on the blog index page.",
    date: "2026-01-01",
    body: [
      "This is placeholder body copy — replace it with your real post content.",
      "Add as many paragraphs as you need here.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
