import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brkestates.com";
  const supabase = await createClient();

  const [{ data: properties }, { data: posts }] = await Promise.all([
    supabase.from("properties").select("slug, updated_at").in("status", ["published", "sold"]),
    supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/listings`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${base}/listings/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
