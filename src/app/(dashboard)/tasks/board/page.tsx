import { createClient } from "@/lib/supabase/server";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskFilters } from "@/components/tasks/task-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { TaskWithRelations } from "@/types";

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function TaskBoardPage({ searchParams }: Props) {
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

  let query = supabase
    .from("tasks")
    .select(
      `*, category:categories(*), student:students(*), checklist_items(*)`
    )
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false });

  if (params.category) {
    query = query.eq("category_id", params.category);
  }
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  const { data: tasks } = await query;

  // Fetch assignments
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

  const tasksWithRelations: TaskWithRelations[] = (tasks ?? []).map((task) => {
    const taskAssignmentUserIds = (assignments ?? [])
      .filter((a) => a.task_id === task.id)
      .map((a) => a.user_id);
    const assignees = (assigneeProfiles ?? []).filter((p) =>
      taskAssignmentUserIds.includes(p.id)
    );
    return { ...task, assignees } as TaskWithRelations;
  });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Task Board</h1>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      <TaskFilters categories={categories ?? []} currentView="board" />

      <TaskBoard tasks={tasksWithRelations} />
    </div>
  );
}
