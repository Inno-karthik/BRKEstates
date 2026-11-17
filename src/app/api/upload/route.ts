import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2 } from "@/lib/r2";

/**
 * File uploads go through a Route Handler, not a Server Action — Server Actions called
 * directly with FormData+File from client JS (rather than a <form> submission) have
 * compatibility gaps on the Cloudflare Workers runtime (manifests as React error #441).
 * A plain POST request has no such issue.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "misc";

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const url = await uploadToR2(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
