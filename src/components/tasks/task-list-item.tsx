import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants";
import { formatDueDate, isOverdue } from "@/lib/utils";
import type { TaskWithRelations } from "@/types";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

interface TaskListItemProps {
  task: TaskWithRelations;
}

export function TaskListItem({ task }: TaskListItemProps) {
  const statusStyle = STATUS_COLORS[task.status];
  const priorityStyle = PRIORITY_COLORS[task.priority];
  const overdue = task.due_date && task.status !== "completed" && isOverdue(task.due_date);

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-4 rounded-lg border border-border bg-white px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {task.title}
          </p>
          {task.category && (
            <Badge
              variant="outline"
              style={{
                borderColor: task.category.color,
                color: task.category.color,
              }}
            >
              {task.category.name}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {task.due_date && (
            <span className={`flex items-center gap-1 ${overdue ? "text-destructive font-medium" : ""}`}>
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.student && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.student.full_name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className={`${priorityStyle.bg} ${priorityStyle.text}`}>
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
          {STATUS_LABELS[task.status]}
        </Badge>
        {task.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((a) => (
              <Avatar key={a.id} name={a.full_name} src={a.avatar_url} size="sm" />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
