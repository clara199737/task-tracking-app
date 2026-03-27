import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user's profile for school_id
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, full_name")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No school linked to your account. Please contact support.
        </p>
      </div>
    );
  }

  // Fetch task counts
  const { count: todoCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("status", "todo");

  const { count: inProgressCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("status", "in_progress");

  const { count: overdueCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .neq("status", "completed")
    .lt("due_date", new Date().toISOString());

  const { count: completedThisWeek } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("status", "completed")
    .gte(
      "completed_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

  const stats = [
    {
      label: "To Do",
      value: todoCount ?? 0,
      icon: CheckSquare,
      color: "text-accent-500",
      bgColor: "bg-accent-50",
    },
    {
      label: "In Progress",
      value: inProgressCount ?? 0,
      icon: Clock,
      color: "text-primary-500",
      bgColor: "bg-primary-50",
    },
    {
      label: "Overdue",
      value: overdueCount ?? 0,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-red-50",
    },
    {
      label: "Completed (7 days)",
      value: completedThisWeek ?? 0,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your school&apos;s tasks
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          <CheckSquare className="h-4 w-4" />
          View All Tasks
        </Link>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Create Task
        </Link>
      </div>
    </div>
  );
}
