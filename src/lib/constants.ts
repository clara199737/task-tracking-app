export const TASK_STATUSES = ["todo", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const USER_ROLES = ["owner", "instructor", "admin_desk"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const RECURRENCE_FREQUENCIES = ["daily", "weekly", "monthly"] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export const NOTIFICATION_TYPES = [
  "due_soon",
  "overdue",
  "assigned",
  "status_change",
] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: "bg-soft-100", text: "text-accent-600" },
  in_progress: { bg: "bg-primary-50", text: "text-primary-600" },
  completed: { bg: "bg-green-50", text: "text-green-700" },
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string }> = {
  low: { bg: "bg-gray-100", text: "text-gray-600" },
  normal: { bg: "bg-blue-50", text: "text-blue-600" },
  high: { bg: "bg-orange-50", text: "text-orange-600" },
  urgent: { bg: "bg-red-50", text: "text-red-700" },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "School Owner",
  instructor: "Instructor",
  admin_desk: "Front Desk / Admin",
};

// Sales pipeline stages
export const DEAL_STAGES = ["lead", "qualified", "proposal", "negotiation", "won", "lost"] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Closed Won",
  lost: "Closed Lost",
};

export const STAGE_COLORS: Record<DealStage, { bg: string; text: string }> = {
  lead: { bg: "bg-blue-100", text: "text-blue-700" },
  qualified: { bg: "bg-purple-100", text: "text-purple-700" },
  proposal: { bg: "bg-amber-100", text: "text-amber-700" },
  negotiation: { bg: "bg-orange-100", text: "text-orange-700" },
  won: { bg: "bg-green-100", text: "text-green-700" },
  lost: { bg: "bg-gray-100", text: "text-gray-500" },
};

export const DEFAULT_CATEGORIES = [
  { name: "Admin", color: "#00008B" },
  { name: "Student Follow-Up", color: "#800080" },
  { name: "Event Prep", color: "#FFC0CB" },
  { name: "Urgent", color: "#DC2626" },
];
