"use server";

import { createClient } from "@/lib/supabase/server";
import type { Activity } from "@/types";

export async function createActivity(
  dealId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify the deal belongs to this user
  const { data: deal } = await supabase
    .from("deals")
    .select("id")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (!deal) return { error: "Deal not found" };

  const type = formData.get("type") as string;
  const notes = (formData.get("notes") as string) || null;
  const occurredAt =
    (formData.get("occurred_at") as string) ||
    new Date().toISOString().slice(0, 10);

  const validTypes = ["call", "email", "meeting", "note"];
  if (!validTypes.includes(type)) return { error: "Invalid activity type" };

  const { error } = await supabase.from("activities").insert({
    deal_id: dealId,
    user_id: user.id,
    type: type as Activity["type"],
    notes,
    occurred_at: occurredAt,
  });

  if (error) return { error: error.message };

  return {};
}

export async function getActivitiesForDeal(
  dealId: string
): Promise<Activity[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Verify the deal belongs to this user
  const { data: deal } = await supabase
    .from("deals")
    .select("id")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (!deal) return [];

  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("deal_id", dealId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}
