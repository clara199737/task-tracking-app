"use client";

import { useActionState } from "react";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createDeal } from "@/actions/deal-actions";
import { DEAL_STAGES, STAGE_LABELS } from "@/lib/constants";

interface AddDealModalProps {
  open: boolean;
  onClose: () => void;
}

const stageOptions = DEAL_STAGES.map((s) => ({
  value: s,
  label: STAGE_LABELS[s],
}));

export function AddDealModal({ open, onClose }: AddDealModalProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createDeal(formData);
      if (result?.error) return result;
      onClose();
      return null;
    },
    null
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <form action={formAction}>
        <DialogHeader onClose={onClose}>Add Deal</DialogHeader>
        <DialogContent className="space-y-4">
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Input
            id="name"
            name="name"
            label="Deal Name *"
            placeholder="e.g. Acme Corp"
            required
          />

          <Input
            id="company"
            name="company"
            label="Company"
            placeholder="Company name"
          />

          <Input
            id="contact_name"
            name="contact_name"
            label="Contact Name"
            placeholder="Primary contact"
          />

          <Input
            id="value"
            name="value"
            label="Deal Value ($)"
            type="number"
            min="0"
            step="1"
            placeholder="0"
          />

          <Select
            id="stage"
            name="stage"
            label="Stage"
            options={stageOptions}
            defaultValue="lead"
          />

          <Input
            id="close_date"
            name="close_date"
            label="Expected Close Date"
            type="date"
          />

          <Input
            id="next_action"
            name="next_action"
            label="Next Action"
            placeholder="e.g. Send revised proposal"
            maxLength={100}
          />

          <Input
            id="follow_up_date"
            name="follow_up_date"
            label="Follow-Up Reminder"
            type="date"
          />

          <Textarea
            id="notes"
            name="notes"
            label="Notes"
            placeholder="Any additional notes..."
            rows={3}
          />
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Add Deal"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
