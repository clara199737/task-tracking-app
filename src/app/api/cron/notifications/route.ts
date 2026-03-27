import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let created = 0;

  // Due soon: tasks due within 24 hours that haven't been notified
  const { data: dueSoonTasks } = await supabase
    .from("tasks")
    .select("id, title, school_id, created_by")
    .neq("status", "completed")
    .gte("due_date", now.toISOString())
    .lte("due_date", in24h.toISOString());

  for (const task of dueSoonTasks ?? []) {
    // Get assignees
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", task.id);

    const userIds = [
      task.created_by,
      ...(assignments ?? []).map((a) => a.user_id),
    ];
    const uniqueUserIds = [...new Set(userIds)];

    // Check if already notified
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("task_id", task.id)
      .eq("type", "due_soon")
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

    if (existing?.length) continue;

    for (const userId of uniqueUserIds) {
      await supabase.from("notifications").insert({
        user_id: userId,
        task_id: task.id,
        type: "due_soon",
        title: "Task due soon",
        body: `"${task.title}" is due within 24 hours`,
      });
      created++;
    }
  }

  // Overdue: tasks past due date
  const { data: overdueTasks } = await supabase
    .from("tasks")
    .select("id, title, school_id, created_by")
    .neq("status", "completed")
    .lt("due_date", now.toISOString());

  for (const task of overdueTasks ?? []) {
    const { data: assignments } = await supabase
      .from("task_assignments")
      .select("user_id")
      .eq("task_id", task.id);

    const userIds = [
      task.created_by,
      ...(assignments ?? []).map((a) => a.user_id),
    ];
    const uniqueUserIds = [...new Set(userIds)];

    // Only notify once per day for overdue
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("task_id", task.id)
      .eq("type", "overdue")
      .gte("created_at", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

    if (existing?.length) continue;

    for (const userId of uniqueUserIds) {
      await supabase.from("notifications").insert({
        user_id: userId,
        task_id: task.id,
        type: "overdue",
        title: "Task overdue",
        body: `"${task.title}" is past its due date`,
      });
      created++;
    }
  }

  return NextResponse.json({ message: "Notifications created", count: created });
}
