import { createBrowserClient } from "@supabase/ssr";

// Client dedie au schema `public` (ou vit la table mt5_calendar
// alimentee par l'EA MT5 du VPS FTMO).
export function createPublicClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "public" } }
  );
}
