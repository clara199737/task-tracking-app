import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, addWeeks, addMonths } from "date-fns";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret (for Vercel Cron or external callers)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find rules that are due
  const { data: rules, error: rulesError } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("is_active", true)
    .lte("next_run_at", new Date().toISOString());

  if (rulesError || !rules?.length) {
    return NextResponse.json({
      message: "No recurring rules to process",
      count: 0,
    });
  }

  let created = 0;

  for (const rule of rules) {
    // Find the template task for this rule
    const { data: templateTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("recurring_rule_id", rule.id)
      .is("parent_task_id", null)
      .single();

    if (!templateTask) continue;

    // Clone the task
    const { data: newTask } = await supabase
      .from("tasks")
      .insert({
        school_id: templateTask.school_id,
        title: templateTask.title,
        description: templateTask.description,
        status: "todo",
        priority: templateTask.priority,
        category_id: templateTask.category_id,
        student_id: templateTask.student_id,
        created_by: templateTask.created_by,
        recurring_rule_id: rule.id,
        parent_task_id: templateTask.id,
      })
      .select()
      .single();

    if (newTask) {
      // Clone checklist items
      const { data: checklistItems } = await supabase
        .from("checklist_items")
        .select("text, sort_order")
        .eq("task_id", templateTask.id);

      if (checklistItems?.length) {
        await supabase.from("checklist_items").insert(
          checklistItems.map((item) => ({
            task_id: newTask.id,
            text: item.text,
            sort_order: item.sort_order,
          }))
        );
      }

      // Clone assignments
      const { data: assignments } = await supabase
        .from("task_assignments")
        .select("user_id")
        .eq("task_id", templateTask.id);

      if (assignments?.length) {
        await supabase.from("task_assignments").insert(
          assignments.map((a) => ({
            task_id: newTask.id,
            user_id: a.user_id,
          }))
        );
      }

      created++;
    }

    // Calculate next run
    const now = new Date();
    let nextRun: Date;
    switch (rule.frequency) {
      case "daily":
        nextRun = addDays(now, 1);
        break;
      case "weekly":
        nextRun = addWeeks(now, 1);
        break;
      case "monthly":
        nextRun = addMonths(now, 1);
        break;
      default:
        nextRun = addDays(now, 1);
    }

    await supabase
      .from("recurring_rules")
      .update({ next_run_at: nextRun.toISOString() })
      .eq("id", rule.id);
  }

  return NextResponse.json({ message: "Recurring tasks created", count: created });
}
