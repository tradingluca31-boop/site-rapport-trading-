import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchNotionTrades } from "@/lib/notion";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const drafts = await fetchNotionTrades();
    if (drafts.length === 0) {
      return NextResponse.json({ imported: 0, upserted: 0, skipped: 0, message: "Aucun trade recuperable dans la DB Notion (verifie que les proprietes Date, Paire, Direction sont bien remplies)." });
    }

    const supabase = await createClient();
    const payload = drafts.map((d) => ({
      ...d,
      source: "notion" as const,
    }));

    const { data, error } = await supabase
      .from("trades")
      .upsert(payload, { onConflict: "notion_id" })
      .select("id");

    if (error) {
      console.error("[import-notion] supabase upsert", error);
      return NextResponse.json(
        { error: "supabase_upsert_failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imported: drafts.length,
      upserted: (data ?? []).length,
      skipped: drafts.length - (data ?? []).length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[import-notion] error", err);
    return NextResponse.json({ error: "notion_fetch_failed", detail: message }, { status: 500 });
  }
}
