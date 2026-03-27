"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { TASK_STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { Category } from "@/types";
import { Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TaskFiltersProps {
  categories: Category[];
  currentView?: "list" | "board";
}

export function TaskFilters({ categories, currentView = "list" }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search tasks..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Status filter */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
      >
        <option value="">All Statuses</option>
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {/* Category filter */}
      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* View toggle */}
      <div className="flex rounded-lg border border-border bg-white">
        <Link
          href="/tasks"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-l-lg transition-colors",
            currentView === "list"
              ? "bg-primary-500 text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          List
        </Link>
        <Link
          href="/tasks/board"
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-r-lg transition-colors",
            currentView === "board"
              ? "bg-primary-500 text-white"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Board
        </Link>
      </div>
    </div>
  );
}
