"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "@/lib/constants";
import type { Task, Category, Student, Profile } from "@/types";
import { createTask, updateTask } from "@/actions/task-actions";
import { useActionState } from "react";
import { useState } from "react";
import { Plus, X } from "lucide-react";

interface TaskFormProps {
  task?: Task;
  categories: Category[];
  students: Student[];
  teamMembers: Profile[];
  assigneeIds?: string[];
  checklistItems?: { id: string; text: string; is_completed: boolean }[];
}

export function TaskForm({
  task,
  categories,
  students,
  teamMembers,
  assigneeIds = [],
  checklistItems: initialChecklist = [],
}: TaskFormProps) {
  const [checklist, setChecklist] = useState(
    initialChecklist.map((c) => c.text)
  );
  const [newItem, setNewItem] = useState("");

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      // Append checklist items
      checklist.forEach((text) => formData.append("checklist_text", text));

      if (task) {
        return await updateTask(task.id, formData);
      }
      return await createTask(formData);
    },
    undefined
  );

  const addChecklistItem = () => {
    if (newItem.trim()) {
      setChecklist((prev) => [...prev, newItem.trim()]);
      setNewItem("");
    }
  };

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Input
        id="title"
        name="title"
        label="Task Title"
        placeholder="e.g., Follow up with trial student"
        defaultValue={task?.title}
        required
      />

      <Textarea
        id="description"
        name="description"
        label="Description"
        placeholder="Add details about this task..."
        defaultValue={task?.description ?? ""}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="status"
          name="status"
          label="Status"
          defaultValue={task?.status ?? "todo"}
          options={TASK_STATUSES.map((s) => ({
            value: s,
            label: STATUS_LABELS[s],
          }))}
        />

        <Select
          id="priority"
          name="priority"
          label="Priority"
          defaultValue={task?.priority ?? "normal"}
          options={TASK_PRIORITIES.map((p) => ({
            value: p,
            label: PRIORITY_LABELS[p],
          }))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="category_id"
          name="category_id"
          label="Category"
          defaultValue={task?.category_id ?? ""}
          placeholder="Select category..."
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />

        <Input
          id="due_date"
          name="due_date"
          type="datetime-local"
          label="Due Date"
          defaultValue={
            task?.due_date
              ? new Date(task.due_date).toISOString().slice(0, 16)
              : ""
          }
        />
      </div>

      <Select
        id="student_id"
        name="student_id"
        label="Linked Student"
        defaultValue={task?.student_id ?? ""}
        placeholder="Select student (optional)..."
        options={students.map((s) => ({
          value: s.id,
          label: `${s.full_name}${s.belt_rank ? ` (${s.belt_rank})` : ""}`,
        }))}
      />

      {/* Assignees */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Assign To
        </label>
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <label key={member.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="assignee_ids"
                value={member.id}
                defaultChecked={assigneeIds.includes(member.id)}
                className="rounded border-border"
              />
              <span className="text-sm">{member.full_name}</span>
            </label>
          ))}
          {teamMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No team members yet. Invite members from the Team page.
            </p>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Checklist
        </label>
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm bg-muted rounded px-3 py-1.5">
              {item}
            </span>
            <button
              type="button"
              onClick={() =>
                setChecklist((prev) => prev.filter((_, idx) => idx !== i))
              }
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addChecklistItem();
              }
            }}
            placeholder="Add checklist item..."
            className="flex-1 h-9 rounded-lg border border-border bg-white px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? task
              ? "Updating..."
              : "Creating..."
            : task
              ? "Update Task"
              : "Create Task"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
