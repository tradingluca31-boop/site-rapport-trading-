import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractNotionPageId, fetchNotionPage } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string = body?.url ?? "";
    const pageId = extractNotionPageId(url);
    if (!pageId) {
      return NextResponse.json(
        { error: "invalid_url", detail: "URL Notion invalide ou ID de page introuvable." },
        { status: 400 }
      );
    }

    const draft = await fetchNotionPage(pageId);
    if (!draft) {
      return NextResponse.json(
        { error: "no_draft", detail: "La page Notion n'a pas les proprietes requises (Date, Paire, Direction)." },
        { status: 422 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trades")
      .upsert({ ...draft, source: "notion" }, { onConflict: "notion_id" })
      .select()
      .single();

    if (error) {
      console.error("[import-notion-url] supabase upsert", error);
      return NextResponse.json(
        { error: "supabase_upsert_failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ trade: data, date: draft.date });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[import-notion-url] error", err);
    return NextResponse.json({ error: "notion_fetch_failed", detail: message }, { status: 500 });
  }
}
