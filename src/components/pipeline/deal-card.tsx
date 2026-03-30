"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getDaysInStage } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import type { Deal } from "@/types";

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  isDragOverlay?: boolean;
}

export function DealCard({ deal, onClick, isDragOverlay }: DealCardProps) {
  const daysInStage = getDaysInStage(deal.updated_at);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={
          isDragging && !isDragOverlay
            ? "opacity-30 cursor-grabbing"
            : isDragOverlay
              ? "shadow-lg rotate-2 cursor-grabbing"
              : "cursor-grab transition-shadow hover:shadow-md"
        }
        onClick={() => {
          if (isDragging) return;
          onClick(deal);
        }}
      >
        <CardContent className="p-3 space-y-2">
          <p className="font-semibold text-sm text-foreground truncate">
            {deal.name}
          </p>

          {deal.next_action && (
            <p className="text-xs text-muted-foreground">
              {deal.next_action.length > 60
                ? deal.next_action.slice(0, 60) + "…"
                : deal.next_action}
            </p>
          )}

          {deal.value != null && (
            <p className="text-sm font-medium text-primary-600">
              {formatCurrency(deal.value)}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {deal.close_date ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(deal.close_date), "MMM d")}
              </span>
            ) : (
              <span />
            )}

            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysInStage}d
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
