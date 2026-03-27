"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const schoolName = formData.get("schoolName") as string;

  if (!fullName || !email || !password || !schoolName) {
    return { error: "All fields are required" };
  }

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "owner" },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create account" };
  }

  // Use admin client to bypass RLS for school setup
  // (user may not be confirmed yet if email confirmation is enabled)
  const admin = createAdminClient();

  // Create the school
  const slug = generateSlug(schoolName);
  const { data: school, error: schoolError } = await admin
    .from("schools")
    .insert({ name: schoolName, slug, owner_id: authData.user.id })
    .select()
    .single();

  if (schoolError) {
    return { error: schoolError.message };
  }

  // Link profile to school and set role to owner
  await admin
    .from("profiles")
    .update({ school_id: school.id, role: "owner" })
    .eq("id", authData.user.id);

  // Seed default categories
  await admin.from("categories").insert(
    DEFAULT_CATEGORIES.map((cat) => ({
      school_id: school.id,
      name: cat.name,
      color: cat.color,
    }))
  );

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
