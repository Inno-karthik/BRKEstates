import { BlogEditor } from "@/components/admin/blog-editor";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-900">New Blog Post</h1>
      <BlogEditor />
    </div>
  );
}
