import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogEditor } from "@/components/admin/blog-editor";
import type { BlogPost } from "@/lib/types";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-900">Edit Blog Post</h1>
      <BlogEditor post={data as unknown as BlogPost} />
    </div>
  );
}
