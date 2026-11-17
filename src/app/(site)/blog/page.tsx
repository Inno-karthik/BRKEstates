import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { PageTheme } from "@/components/theme-style";
import { getPublishedBlogPosts } from "@/lib/queries";
import type { Metadata } from "next";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() from admin
// actions yet (new/edited posts weren't showing up live), so this stays dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Market insights, buying guides and updates from BKR Estates.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <PageTheme page="home">
      <section className="bg-[var(--color-secondary,#5c0f12)] py-14 text-center text-white md:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-5xl">Blog</h1>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            Market insights, buying guides and updates from BKR Estates.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        {posts.length === 0 ? (
          <p className="py-20 text-center text-sm text-neutral-400">No articles published yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-primary,#9b1c1c)]/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] bg-neutral-100">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-300">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <CalendarDays size={11} />
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1.5 line-clamp-2 text-base font-semibold text-neutral-900">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{post.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTheme>
  );
}
