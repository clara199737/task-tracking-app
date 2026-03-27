import { createClient } from "@/lib/supabase/server";
import { TaskForm } from "@/components/tasks/task-form";
import { deleteTask } from "@/actions/task-actions";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return null;

  // Fetch task with relations
  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("school_id", profile.school_id)
    .single();

  if (!task) notFound();

  // Fetch related data in parallel
  const [
    { data: categories },
    { data: students },
    { data: team },
    { data: assignments },
    { data: checklistItems },
  ] = await Promise.all([
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
    supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", id),
    supabase
      .from("checklist_items")
      .select("*")
      .eq("task_id", id)
      .order("sort_order"),
  ]);

  const assigneeIds = (assignments ?? []).map((a) => a.user_id);
  const canDelete = profile.role === "owner" || task.created_by === user.id;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Edit Task</h1>
        {canDelete && (
          <form
            action={async () => {
              "use server";
              await deleteTask(id);
            }}
          >
            <Button type="submit" variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </form>
        )}
      </div>
      <div className="rounded-lg border border-border bg-white p-6">
        <TaskForm
          task={task}
          categories={categories ?? []}
          students={students ?? []}
          teamMembers={team ?? []}
          assigneeIds={assigneeIds}
          checklistItems={checklistItems ?? []}
        />
      </div>
    </div>
  );
}
