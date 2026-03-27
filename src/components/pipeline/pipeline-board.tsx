"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { cn, formatCurrency } from "@/lib/utils";
import {
  DEAL_STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  type DealStage,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DealCard } from "./deal-card";
import { DealDetailDrawer } from "./deal-detail-drawer";
import { AddDealModal } from "./add-deal-modal";
import { updateDealStage } from "@/actions/deal-actions";
import type { Deal } from "@/types";

interface PipelineBoardProps {
  deals: Deal[];
}

function StageColumn({
  stage,
  deals,
  onDealClick,
}: {
  stage: DealStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const style = STAGE_COLORS[stage];
  const totalValue = deals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const isClosed = stage === "won" || stage === "lost";

  return (
    <div className={cn("flex-1 min-w-[240px]", isClosed && "opacity-60")}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("h-3 w-3 rounded-full", style.bg)} />
        <h3 className="text-sm font-semibold text-foreground">
          {STAGE_LABELS[stage]}
        </h3>
        <span className="text-xs text-muted-foreground">({deals.length})</span>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {formatCurrency(totalValue > 0 ? totalValue : null)}
      </p>

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
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Drop deals here
          </p>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ deals: initialDeals }: PipelineBoardProps) {
  const router = useRouter();
  const [deals, setDeals] = useState(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const dealsByStage: Record<DealStage, Deal[]> = {
    lead: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  };

  for (const deal of deals) {
    const stage = deal.stage as DealStage;
    if (dealsByStage[stage]) {
      dealsByStage[stage].push(deal);
    }
  }

  const activeDeal = deals.find((d) => d.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    // Only update if dropped on a column (stage)
    if (!DEAL_STAGES.includes(newStage)) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage } : d
      )
    );

    // Persist to server
    startTransition(async () => {
      const result = await updateDealStage(dealId, newStage);
      if (result?.error) {
        // Revert on error
        setDeals((prev) =>
          prev.map((d) =>
            d.id === dealId ? { ...d, stage: deal.stage } : d
          )
        );
      }
    });
  }

  const handleDealUpdated = () => {
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => (
            <StageColumn
              key={stage}
              stage={stage}
              deals={dealsByStage[stage]}
              onDealClick={setSelectedDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <DealCard deal={activeDeal} onClick={() => {}} isDragOverlay />
          )}
        </DragOverlay>
      </DndContext>

      <AddDealModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          router.refresh();
        }}
      />

      <DealDetailDrawer
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onDealUpdated={handleDealUpdated}
      />
    </>
  );
}
