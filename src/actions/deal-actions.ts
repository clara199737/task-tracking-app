"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { STAGE_LABELS, type DealStage } from "@/lib/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

async function logStageChange(
  supabase: SupabaseClient,
  userId: string,
  dealId: string,
  newStage: DealStage
) {
  await supabase.from("activities").insert({
    deal_id: dealId,
    user_id: userId,
    type: "stage_change",
    notes: `Stage changed to ${STAGE_LABELS[newStage]}`,
    occurred_at: new Date().toISOString().slice(0, 10),
  });
}

const dealSchema = z.object({
  name: z.string().min(1, "Deal name is required"),
  company: z.string().optional(),
  contact_name: z.string().optional(),
  value: z.coerce.number().nonnegative().optional(),
  stage: z
    .enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"])
    .default("lead"),
  close_date: z.string().optional(),
  next_action: z.string().max(100).optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
});

export async function createDeal(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw = {
    name: formData.get("name") as string,
    company: (formData.get("company") as string) || undefined,
    contact_name: (formData.get("contact_name") as string) || undefined,
    value: formData.get("value") ? Number(formData.get("value")) : undefined,
    stage: (formData.get("stage") as string) || "lead",
    close_date: (formData.get("close_date") as string) || undefined,
    next_action: (formData.get("next_action") as string) || undefined,
    follow_up_date: (formData.get("follow_up_date") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = dealSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("deals").insert({
    user_id: user.id,
    name: parsed.data.name,
    company: parsed.data.company || null,
    contact_name: parsed.data.contact_name || null,
    value: parsed.data.value ?? null,
    stage: parsed.data.stage,
    close_date: parsed.data.close_date || null,
    next_action: parsed.data.next_action || null,
    follow_up_date: parsed.data.follow_up_date || null,
    notes: parsed.data.notes || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
}

export async function updateDeal(dealId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw = {
    name: formData.get("name") as string,
    company: (formData.get("company") as string) || undefined,
    contact_name: (formData.get("contact_name") as string) || undefined,
    value: formData.get("value") ? Number(formData.get("value")) : undefined,
    stage: (formData.get("stage") as string) || "lead",
    close_date: (formData.get("close_date") as string) || undefined,
    next_action: (formData.get("next_action") as string) || undefined,
    follow_up_date: (formData.get("follow_up_date") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = dealSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Fetch current stage before updating so we can detect a change
  const { data: existing } = await supabase
    .from("deals")
    .select("stage")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("deals")
    .update({
      name: parsed.data.name,
      company: parsed.data.company || null,
      contact_name: parsed.data.contact_name || null,
      value: parsed.data.value ?? null,
      stage: parsed.data.stage,
      close_date: parsed.data.close_date || null,
      next_action: parsed.data.next_action || null,
      follow_up_date: parsed.data.follow_up_date || null,
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  if (existing && existing.stage !== parsed.data.stage) {
    await logStageChange(supabase, user.id, dealId, parsed.data.stage as DealStage);
  }

  revalidatePath("/pipeline");
}

export async function updateDealStage(dealId: string, stage: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("deals")
    .update({
      stage: stage as DealStage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  await logStageChange(supabase, user.id, dealId, stage as DealStage);

  revalidatePath("/pipeline");
}

export async function deleteDeal(dealId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
}
