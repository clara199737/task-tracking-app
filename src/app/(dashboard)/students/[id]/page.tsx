import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { TaskListItem } from "@/components/tasks/task-list-item";
import type { TaskWithRelations } from "@/types";
import { Mail, Phone } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
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

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("school_id", profile.school_id)
    .single();

  if (!student) notFound();

  // Fetch linked tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`*, category:categories(*), student:students(*), checklist_items(*)`)
    .eq("student_id", id)
    .order("created_at", { ascending: false });

  const tasksWithRelations: TaskWithRelations[] = (tasks ?? []).map((t) => ({
    ...t,
    assignees: [],
  })) as TaskWithRelations[];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar name={student.full_name} size="lg" />
          <div>
            <h1 className="font-display text-xl font-bold">
              {student.full_name}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              {student.belt_rank && (
                <Badge variant="accent">{student.belt_rank}</Badge>
              )}
              {student.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </span>
              )}
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {student.phone}
                </span>
              )}
            </div>
            {student.notes && (
              <p className="mt-2 text-sm text-muted-foreground">
                {student.notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-lg font-semibold mb-3">
          Linked Tasks ({tasksWithRelations.length})
        </h2>
        {tasksWithRelations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks linked to this student.
          </p>
        ) : (
          <div className="space-y-2">
            {tasksWithRelations.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
