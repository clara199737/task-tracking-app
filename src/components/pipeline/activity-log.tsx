"use client";

import { useState, useActionState } from "react";
import { Phone, Mail, Users, FileText, ArrowRightCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createActivity } from "@/actions/activity-actions";
import { format } from "date-fns";
import type { Activity } from "@/types";

const TYPE_OPTIONS = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
];

const TYPE_ICONS: Record<Activity["type"], React.ReactNode> = {
  call: <Phone className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  meeting: <Users className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
  stage_change: <ArrowRightCircle className="h-3.5 w-3.5" />,
};

const TYPE_LABELS: Record<Activity["type"], string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  note: "Note",
  stage_change: "Stage Change",
};

interface ActivityLogProps {
  activities: Activity[];
  dealId: string;
  onActivityLogged: () => void;
}

export function ActivityLog({
  activities,
  dealId,
  onActivityLogged,
}: ActivityLogProps) {
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      const result = await createActivity(dealId, formData);
      if (result?.error) return result;
      setShowForm(false);
      onActivityLogged();
      return null;
    },
    null
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity</h3>
        {!showForm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Log Activity
          </Button>
        )}
      </div>

      {showForm && (
        <form action={formAction} className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">New Activity</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {state?.error && (
            <p className="text-xs text-destructive">{state.error}</p>
          )}

          <Select
            id="activity-type"
            name="type"
            label="Type"
            options={TYPE_OPTIONS}
            defaultValue="call"
          />

          <Input
            id="activity-date"
            name="occurred_at"
            label="Date"
            type="date"
            defaultValue={today}
          />

          <Textarea
            id="activity-notes"
            name="notes"
            label="Notes"
            placeholder="What happened?"
            rows={2}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      )}

      {activities.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {TYPE_ICONS[activity.type]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {TYPE_LABELS[activity.type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(activity.occurred_at), "MMM d, yyyy")}
                  </span>
                </div>
                {activity.notes && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {activity.notes}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
