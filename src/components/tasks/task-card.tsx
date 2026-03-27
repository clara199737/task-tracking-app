"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDueDate, isOverdue } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, GripVertical } from "lucide-react";
import Link from "next/link";

interface TaskCardProps {
  task: TaskWithRelations;
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityStyle = PRIORITY_COLORS[task.priority];
  const overdue =
    task.due_date && task.status !== "completed" && isOverdue(task.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <Link
            href={`/tasks/${task.id}`}
            className="text-sm font-medium text-foreground hover:text-primary-500 line-clamp-2"
          >
            {task.title}
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {task.category && (
              <Badge
                variant="outline"
                style={{
                  borderColor: task.category.color,
                  color: task.category.color,
                  fontSize: "0.65rem",
                }}
              >
                {task.category.name}
              </Badge>
            )}
            <Badge
              className={`${priorityStyle.bg} ${priorityStyle.text}`}
              style={{ fontSize: "0.65rem" }}
            >
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.due_date && (
                <span
                  className={`flex items-center gap-1 ${overdue ? "text-destructive font-medium" : ""}`}
                >
                  <Calendar className="h-3 w-3" />
                  {formatDueDate(task.due_date)}
                </span>
              )}
              {task.student && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {task.student.full_name.split(" ")[0]}
                </span>
              )}
            </div>

            {task.assignees.length > 0 && (
              <div className="flex -space-x-1">
                {task.assignees.slice(0, 2).map((a) => (
                  <Avatar
                    key={a.id}
                    name={a.full_name}
                    src={a.avatar_url}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
