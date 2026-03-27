import { createClient } from "@/lib/supabase/server";
import { TaskListItem } from "@/components/tasks/task-list-item";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { TaskWithRelations } from "@/types";

interface Props {
  searchParams: Promise<{ status?: string; category?: string; search?: string }>;
}

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams;
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

  // Build query
  let query = supabase
    .from("tasks")
    .select(
      `*, category:categories(*), student:students(*), checklist_items(*)`
    )
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status as "todo" | "in_progress" | "completed");
  }
  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  const { data: tasks } = await query;

  // Fetch assignments for each task
  const taskIds = (tasks ?? []).map((t) => t.id);
  const { data: assignments } = await supabase
    .from("task_assignments")
    .select("task_id, user_id")
    .in("task_id", taskIds.length > 0 ? taskIds : ["none"]);

  const assigneeUserIds = [
    ...new Set((assignments ?? []).map((a) => a.user_id)),
  ];
  const { data: assigneeProfiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", assigneeUserIds.length > 0 ? assigneeUserIds : ["none"]);

  // Compose TaskWithRelations
  const tasksWithRelations: TaskWithRelations[] = (tasks ?? []).map((task) => {
    const taskAssignmentUserIds = (assignments ?? [])
      .filter((a) => a.task_id === task.id)
      .map((a) => a.user_id);
    const assignees = (assigneeProfiles ?? []).filter((p) =>
      taskAssignmentUserIds.includes(p.id)
    );
    return { ...task, assignees } as TaskWithRelations;
  });

  // Fetch categories for filters
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Tasks</h1>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      <TaskFilters categories={categories ?? []} currentView="list" />

      <div className="space-y-2">
        {tasksWithRelations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-white py-12 text-center">
            <p className="text-muted-foreground">No tasks found.</p>
            <Link href="/tasks/new" className="mt-2 inline-block text-sm text-primary-500 hover:underline">
              Create your first task
            </Link>
          </div>
        ) : (
          tasksWithRelations.map((task) => (
            <TaskListItem key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
