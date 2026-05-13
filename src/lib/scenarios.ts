import { createClient } from "@/lib/supabase/client";

export type Scenario = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  pinned: boolean;
  color: string | null;
};

export type ScenarioInput = {
  title: string;
  content: string;
  category?: string | null;
  tags?: string[];
  pinned?: boolean;
  color?: string | null;
};

const TABLE = "scenarios";

export async function listScenarios(): Promise<Scenario[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[scenarios] list", error);
    return [];
  }
  return (data ?? []) as Scenario[];
}

export async function createScenario(input: ScenarioInput): Promise<Scenario | null> {
  const supabase = createClient();
  const payload = {
    title: input.title.trim() || "Sans titre",
    content: input.content ?? "",
    category: input.category ?? null,
    tags: input.tags ?? [],
    pinned: input.pinned ?? false,
    color: input.color ?? null,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error("[scenarios] create", error);
    return null;
  }
  return data as Scenario;
}

export async function updateScenario(id: string, patch: Partial<ScenarioInput>): Promise<Scenario | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[scenarios] update", error);
    return null;
  }
  return data as Scenario;
}

export async function deleteScenario(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error("[scenarios] delete", error);
    return false;
  }
  return true;
}
