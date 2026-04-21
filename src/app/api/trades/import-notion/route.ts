import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchNotionTrades } from "@/lib/notion";

export const dynamic = "force-dynamic";

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const filterDate = dateParam && isValidDate(dateParam) ? dateParam : undefined;

    let selectedIds: string[] | null = null;
    try {
      const body = await req.json();
      if (body && Array.isArray(body.notion_ids)) {
        selectedIds = body.notion_ids.filter((x: unknown): x is string => typeof x === "string");
      }
    } catch {
      // pas de body JSON => on garde filterDate (ou aucun filtre)
    }

    let drafts = await fetchNotionTrades(filterDate);
    if (selectedIds && selectedIds.length > 0) {
      const set = new Set(selectedIds);
      drafts = drafts.filter((d) => set.has(d.notion_id));
    } else if (selectedIds && selectedIds.length === 0) {
      return NextResponse.json({ imported: 0, upserted: 0, skipped: 0, message: "Aucune selection." });
    }

    if (drafts.length === 0) {
      return NextResponse.json({
        imported: 0,
        upserted: 0,
        skipped: 0,
        message: filterDate
          ? `Aucun trade Notion pour le ${filterDate}.`
          : "Aucun trade recuperable dans la DB Notion.",
      });
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
