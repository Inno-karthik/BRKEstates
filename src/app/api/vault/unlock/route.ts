import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Verifies a confidential document's access key server-side and returns the file URL
 *  only on a match — the key is never compared client-side. */
export async function POST(request: Request) {
  const { documentId, key } = (await request.json().catch(() => ({}))) as {
    documentId?: string;
    key?: string;
  };
  if (!documentId || !key) {
    return NextResponse.json({ error: "Missing documentId or key" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("property_documents")
    .select("file_url, is_confidential, access_key")
    .eq("id", documentId)
    .single();

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!doc.is_confidential) return NextResponse.json({ url: doc.file_url });
  if (!doc.access_key || doc.access_key !== key) {
    return NextResponse.json({ error: "Incorrect access key" }, { status: 401 });
  }

  return NextResponse.json({ url: doc.file_url });
}
