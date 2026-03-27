"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const studentSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  belt_rank: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();
  if (!profile?.school_id) return { error: "No school found" };

  const raw = {
    full_name: formData.get("full_name") as string,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    belt_rank: (formData.get("belt_rank") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("students")
    .insert({ ...parsed.data, school_id: profile.school_id });

  if (error) return { error: error.message };

  revalidatePath("/students");
  return { success: true };
}

export async function updateStudent(studentId: string, formData: FormData) {
  const supabase = await createClient();

  const raw = {
    full_name: formData.get("full_name") as string,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    belt_rank: (formData.get("belt_rank") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };

  const parsed = studentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("students")
    .update(parsed.data)
    .eq("id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  return { success: true };
}
