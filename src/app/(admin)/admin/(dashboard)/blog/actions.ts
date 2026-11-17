"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { translatePlainText, translateHtml } from "@/lib/translate";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertBlogPost(input: {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image?: string | null;
  status: "draft" | "published";
  author?: string;
  tags: string[];
  meta_title?: string;
  meta_description?: string;
  gallery_images?: { url: string; caption: string | null }[];
  translations?: Partial<Record<"te" | "hi", { title: string; content: string }>>;
}) {
  const supabase = await createClient();
  const slug = input.slug ? slugify(input.slug) : slugify(input.title);

  let publishedAt: string | null = null;
  if (input.status === "published") {
    publishedAt = new Date().toISOString();
    if (input.id) {
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", input.id)
        .single();
      // Keep the original publish date on re-saves; only stamp "now" the first time.
      if (existing?.published_at) publishedAt = existing.published_at;
    }
  }

  const payload = {
    title: input.title,
    slug,
    excerpt: input.excerpt || null,
    content: input.content,
    cover_image: input.cover_image || null,
    status: input.status,
    author: input.author || "BKR Estates",
    tags: input.tags,
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    gallery_images: input.gallery_images ?? [],
    translations: input.translations ?? {},
    published_at: publishedAt,
  };

  const { error } = input.id
    ? await supabase.from("blog_posts").update(payload).eq("id", input.id)
    : await supabase.from("blog_posts").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function translateBlogFields(
  title: string,
  content: string,
  targetLang: "te" | "hi"
): Promise<{ ok: true; title: string; content: string } | { ok: false; error: string }> {
  try {
    const [translatedTitle, translatedContent] = await Promise.all([
      translatePlainText(title, targetLang),
      translateHtml(content, targetLang),
    ]);
    return { ok: true, title: translatedTitle, content: translatedContent };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Translation failed" };
  }
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
