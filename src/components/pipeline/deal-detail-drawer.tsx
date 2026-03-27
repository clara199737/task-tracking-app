"use client";

import { useState, useActionState } from "react";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateDeal, deleteDeal } from "@/actions/deal-actions";
import { X } from "lucide-react";
import type { Deal } from "@/types";

interface DealDetailDrawerProps {
  deal: Deal | null;
  onClose: () => void;
  onDealUpdated: () => void;
}

const stageOptions = DEAL_STAGES.map((s) => ({
  value: s,
  label: STAGE_LABELS[s],
}));

export function DealDetailDrawer({
  deal,
  onClose,
  onDealUpdated,
}: DealDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [saveState, saveAction, isSaving] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      if (!deal) return null;
      const result = await updateDeal(deal.id, formData);
      if (result?.error) return result;
      onDealUpdated();
      onClose();
      return null;
    },
    null
  );

  const [deleteState, handleDelete, isDeleting] = useActionState(
    async (_prev: { error?: string } | null) => {
      if (!deal) return null;
      const result = await deleteDeal(deal.id);
      if (result?.error) return result;
      onDealUpdated();
      onClose();
      return null;
    },
    null
  );

  // Reset confirm state when drawer opens/closes
  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {deal && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={handleClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform duration-300",
          deal ? "translate-x-0" : "translate-x-full"
        )}
      >
        {deal && (
          <form action={saveAction} className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold truncate pr-4">
                Edit Deal
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {(saveState?.error || deleteState?.error) && (
                <p className="text-sm text-destructive">
                  {saveState?.error || deleteState?.error}
                </p>
              )}

              <Input
                id="drawer-name"
                name="name"
                label="Deal Name *"
                defaultValue={deal.name}
                required
              />

              <Input
                id="drawer-company"
                name="company"
                label="Company"
                defaultValue={deal.company ?? ""}
              />

              <Input
                id="drawer-contact"
                name="contact_name"
                label="Contact Name"
                defaultValue={deal.contact_name ?? ""}
              />

              <Input
                id="drawer-value"
                name="value"
                label="Deal Value ($)"
                type="number"
                min="0"
                step="1"
                defaultValue={deal.value ?? ""}
              />

              <Select
                id="drawer-stage"
                name="stage"
                label="Stage"
                options={stageOptions}
                defaultValue={deal.stage}
              />

              <Input
                id="drawer-close-date"
                name="close_date"
                label="Expected Close Date"
                type="date"
                defaultValue={deal.close_date ?? ""}
              />

              <Textarea
                id="drawer-notes"
                name="notes"
                label="Notes"
                defaultValue={deal.notes ?? ""}
                rows={4}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-border px-6 py-4 space-y-3">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>

              <div className="pt-2 border-t border-border">
                {confirmDelete ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-destructive">Delete this deal?</p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => handleDelete()}
                      >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete Deal
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
