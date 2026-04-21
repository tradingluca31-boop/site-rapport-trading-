import { NextResponse } from "next/server";
import { fetchNotionTrades } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drafts = await fetchNotionTrades();
    return NextResponse.json({ drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[list-notion] error", err);
    return NextResponse.json({ error: "notion_fetch_failed", detail: message }, { status: 500 });
  }
}
