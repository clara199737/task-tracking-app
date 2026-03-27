import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/tasks/task-form";

export default async function NewTaskPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return null;

  const [{ data: categories }, { data: students }, { data: team }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("sort_order"),
      supabase
        .from("students")
        .select("*")
        .eq("school_id", profile.school_id)
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("profiles")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("full_name"),
    ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">Create Task</h1>
      <div className="rounded-lg border border-border bg-white p-6">
        <TaskForm
          categories={categories ?? []}
          students={students ?? []}
          teamMembers={team ?? []}
        />
      </div>
    </div>
  );
}
