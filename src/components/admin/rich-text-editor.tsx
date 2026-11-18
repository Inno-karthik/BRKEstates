"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/upload-client";

/** Rich text editor for prose fields — bold/italic/underline/strike, heading sizes,
 *  paragraph, lists, quote, alignment, highlight and links. Pass `allowImages` (blog
 *  content) to also enable inline image embedding uploaded straight to R2; property
 *  descriptions leave it off — that's what the dedicated photo gallery is for. */
export function RichTextEditor({
  value,
  onChange,
  allowImages = false,
  uploadFolder = "blog",
}: {
  value: string;
  onChange: (html: string) => void;
  allowImages?: boolean;
  uploadFolder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      ...(allowImages ? [TiptapImage.configure({ HTMLAttributes: { class: "rounded-xl" } })] : []),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[220px] px-3 py-2.5 text-sm outline-none",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleImageFile(file: File) {
    const url = await uploadFile(file, uploadFolder).catch(() => null);
    if (url) editor!.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-black/10 bg-neutral-50 p-1.5">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} label="Underline">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} label="Highlight">
          <Highlighter size={14} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} label="Paragraph">
          P
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Large heading"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Medium heading"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          label="Small heading"
        >
          H4
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
          <Minus size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={setLink} label="Link">
          <LinkIcon size={14} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-black/10" />
        <ToolbarButton active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} label="Align left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} label="Align center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} label="Align right">
          <AlignRight size={14} />
        </ToolbarButton>
        {allowImages && (
          <>
            <div className="mx-1 h-5 w-px bg-black/10" />
            <ToolbarButton active={false} onClick={() => fileInputRef.current?.click()} label="Insert image">
              <ImageIcon size={14} />
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
                e.target.value = "";
              }}
            />
          </>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-xs font-semibold transition",
        active ? "bg-[#d0191f] text-white" : "text-neutral-600 hover:bg-black/5"
      )}
    >
      {children}
    </button>
  );
}
