"use client";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useState, useTransition } from "react";
import { TaskCard } from "./task-card";
import { updateTaskStatus } from "@/actions/task-actions";
import { STATUS_LABELS, STATUS_COLORS, TASK_STATUSES, type TaskStatus } from "@/lib/constants";
import type { TaskWithRelations } from "@/types";
import { cn } from "@/lib/utils";

interface TaskBoardProps {
  tasks: TaskWithRelations[];
}

function BoardColumn({
  status,
  tasks,
}: {
  status: TaskStatus;
  tasks: TaskWithRelations[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const style = STATUS_COLORS[status];

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("h-3 w-3 rounded-full", style.bg)} />
        <h3 className="text-sm font-semibold text-foreground">
          {STATUS_LABELS[status]}
        </h3>
        <span className="text-xs text-muted-foreground">({tasks.length})</span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 rounded-lg border-2 border-dashed p-2 min-h-[200px] transition-colors",
          isOver
            ? "border-primary-300 bg-primary-50/50"
            : "border-transparent"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Drop tasks here
          </p>
        )}
      </div>
    </div>
  );
}

export function TaskBoard({ tasks: initialTasks }: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const tasksByStatus: Record<TaskStatus, TaskWithRelations[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Only update if dropped on a column (status)
    if (!TASK_STATUSES.includes(newStatus as TaskStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    // Persist to server
    startTransition(async () => {
      const result = await updateTaskStatus(taskId, newStatus);
      if (result?.error) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: task.status } : t
          )
        );
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}
