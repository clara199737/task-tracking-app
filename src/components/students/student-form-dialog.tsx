"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { createStudent } from "@/actions/student-actions";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function StudentFormDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createStudent(formData);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Student added");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Student
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogHeader onClose={() => setOpen(false)}>Add Student</DialogHeader>
        <form action={handleSubmit}>
          <DialogContent className="space-y-4">
            <Input
              id="full_name"
              name="full_name"
              label="Full Name"
              placeholder="Student name"
              required
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="student@email.com"
            />
            <Input
              id="phone"
              name="phone"
              label="Phone"
              placeholder="(555) 123-4567"
            />
            <Input
              id="belt_rank"
              name="belt_rank"
              label="Belt Rank"
              placeholder="e.g., White, Yellow, Green, Brown, Black"
            />
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
