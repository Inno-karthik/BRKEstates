import { NextResponse } from "next/server";
import { getPropertiesByIds } from "@/lib/queries";

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json({ properties: [] });
  const properties = await getPropertiesByIds(ids.slice(0, 4));
  return NextResponse.json({ properties });
}
