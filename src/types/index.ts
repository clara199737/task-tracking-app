import type { Database } from "@/lib/database.types";

// Table row types
export type School = Database["public"]["Tables"]["schools"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Student = Database["public"]["Tables"]["students"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type ChecklistItem = Database["public"]["Tables"]["checklist_items"]["Row"];
export type TaskAssignment = Database["public"]["Tables"]["task_assignments"]["Row"];
export type RecurringRule = Database["public"]["Tables"]["recurring_rules"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
export type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];

// Insert types
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

// Composite types
export type TaskWithRelations = Task & {
  category: Category | null;
  student: Student | null;
  assignees: Profile[];
  checklist_items: ChecklistItem[];
};

export type ProfileWithSchool = Profile & {
  school: School | null;
};
