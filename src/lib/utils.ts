import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isPast, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDueDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return `${formatDistanceToNow(d)} overdue`;
  return format(d, "MMM d, yyyy");
}

export function isDueSoon(date: string | Date): boolean {
  const d = new Date(date);
  const hoursUntilDue = (d.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntilDue > 0 && hoursUntilDue <= 24;
}

export function isOverdue(date: string | Date): boolean {
  return isPast(new Date(date));
}

export function formatCurrency(value: number | null): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getDaysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getReminderStatus(
  followUpDate: string | null,
  stage: string
): "overdue" | "due_today" | null {
  if (!followUpDate) return null;
  if (stage === "won" || stage === "lost") return null;
  const today = new Date().toISOString().slice(0, 10);
  if (followUpDate === today) return "due_today";
  if (followUpDate < today) return "overdue";
  return null;
}
