"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed"]).default("todo"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  category_id: z.string().uuid().optional().nullable(),
  student_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  assignee_ids: z.array(z.string().uuid()).optional(),
});

export async function createTask(formData: FormData) {
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
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || "todo",
    priority: (formData.get("priority") as string) || "normal",
    category_id: (formData.get("category_id") as string) || null,
    student_id: (formData.get("student_id") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    assignee_ids: formData.getAll("assignee_ids").map(String).filter(Boolean),
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { assignee_ids, ...taskData } = parsed.data;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      school_id: profile.school_id,
      created_by: user.id,
      category_id: taskData.category_id || null,
      student_id: taskData.student_id || null,
      due_date: taskData.due_date || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Add assignments
  if (assignee_ids && assignee_ids.length > 0) {
    await supabase.from("task_assignments").insert(
      assignee_ids.map((uid) => ({
        task_id: task.id,
        user_id: uid,
      }))
    );
  }

  // Handle checklist items
  const checklistItems = formData.getAll("checklist_text").map(String).filter(Boolean);
  if (checklistItems.length > 0) {
    await supabase.from("checklist_items").insert(
      checklistItems.map((text, i) => ({
        task_id: task.id,
        text,
        sort_order: i,
      }))
    );
  }

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || "todo",
    priority: (formData.get("priority") as string) || "normal",
    category_id: (formData.get("category_id") as string) || null,
    student_id: (formData.get("student_id") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    assignee_ids: formData.getAll("assignee_ids").map(String).filter(Boolean),
  };

  const parsed = taskSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { assignee_ids, ...taskData } = parsed.data;

  const { error } = await supabase
    .from("tasks")
    .update({
      ...taskData,
      category_id: taskData.category_id || null,
      student_id: taskData.student_id || null,
      due_date: taskData.due_date || null,
    })
    .eq("id", taskId);

  if (error) return { error: error.message };

  // Sync assignments: delete old, insert new
  if (assignee_ids) {
    await supabase.from("task_assignments").delete().eq("task_id", taskId);
    if (assignee_ids.length > 0) {
      await supabase.from("task_assignments").insert(
        assignee_ids.map((uid) => ({
          task_id: taskId,
          user_id: uid,
        }))
      );
    }
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/");
  redirect("/tasks");
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: status as "todo" | "in_progress" | "completed" })
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath("/tasks");
  revalidatePath("/tasks/board");
  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function toggleChecklistItem(itemId: string, isCompleted: boolean) {
  const supabase = await createClient();

  await supabase
    .from("checklist_items")
    .update({ is_completed: isCompleted })
    .eq("id", itemId);

  revalidatePath("/tasks");
}
