import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { presignUpload } from "@/lib/r2";

/** Returns a presigned R2 upload URL for a signed-in admin/staff user. Tiny request, no file bytes. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { filename?: string; folder?: string };
  const folder = body.folder ?? "misc";
  if (!/^[a-z0-9][a-z0-9/_-]{0,80}$/i.test(folder) || folder.includes("..")) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  try {
    return NextResponse.json(await presignUpload(body.filename ?? "file.bin", folder));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not prepare upload" }, { status: 501 });
  }
}
