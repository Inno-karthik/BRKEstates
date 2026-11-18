import { notFound } from "next/navigation";
import { PageTheme } from "@/components/theme-style";
import { BlogPostBody } from "@/components/blog-post-body";
import { BlogSidebarPropertyCard } from "@/components/blog-sidebar-property-card";
import { getBlogPostBySlug, getBlogSidebarProperties, getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() from admin
// actions yet, so this stays dynamic until that's sorted out.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const description =
    post.meta_description || post.excerpt || post.content.replace(/<[^>]+>/g, " ").replace(/[#*_`>-]/g, "").replace(/\s+/g, " ").trim().slice(0, 155);
  const title = post.meta_title || post.title;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.published_at ?? post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
      images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 675 }] : undefined,
    },
    twitter: {
      card: post.cover_image ? "summary_large_image" : "summary",
      title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const settings = await getSiteSettings();
  const sidebarProperties = await getBlogSidebarProperties(settings.blog_sidebar_property_ids ?? []);
  const hasSidebar = sidebarProperties.length > 0;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bkrestates.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image ?? undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author ?? "BKR Estates" },
    publisher: {
      "@type": "Organization",
      name: "BKR Estates",
      logo: { "@type": "ImageObject", url: `${siteUrl}/brand/logo-v2.png` },
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <PageTheme page="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={cn("mx-auto px-4 py-10 md:px-8 md:py-14", hasSidebar ? "max-w-6xl" : "max-w-3xl")}>
        <div className={cn(hasSidebar && "grid grid-cols-1 gap-8 lg:grid-cols-3")}>
        <div className={cn("min-w-0", hasSidebar && "lg:col-span-2", hasSidebar ? "max-w-none" : "max-w-3xl")}>
        <BlogPostBody post={post} />

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 border-t border-black/5 pt-5">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
        </div>

        {hasSidebar && (
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {settings.blog_sidebar_title || "Popular Properties"}
            </h2>
            <div className="space-y-3">
              {sidebarProperties.map((p) => (
                <BlogSidebarPropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </PageTheme>
  );
}
