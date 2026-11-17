"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBlogPost } from "@/app/(admin)/admin/(dashboard)/blog/actions";
import type { BlogPost } from "@/lib/types";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-neutral-400">
        No blog posts yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">{post.title}</p>
            <p className="text-xs text-neutral-400">/blog/{post.slug}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
            }`}
          >
            {post.status}
          </span>
          <Link href={`/admin/blog/${post.id}/edit`} className="text-neutral-400 hover:text-neutral-700">
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => confirm(`Delete "${post.title}"?`) && startTransition(() => deleteBlogPost(post.id))}
            className="text-neutral-400 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
