import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BlogList } from "@/components/admin/blog-list";
import type { BlogPost } from "@/lib/types";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Blog</h1>
          <p className="text-sm text-neutral-500">Write and publish articles.</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 rounded-full bg-[#7f1d1d] px-4 py-2 text-sm font-semibold text-white">
          <Plus size={15} /> New Post
        </Link>
      </div>
      <BlogList posts={(data ?? []) as BlogPost[]} />
    </div>
  );
}
