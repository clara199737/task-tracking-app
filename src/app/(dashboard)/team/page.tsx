import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";

export default async function TeamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.school_id) return null;

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("full_name");

  // Count tasks per member
  const { data: taskCounts } = await supabase
    .from("task_assignments")
    .select("user_id")
    .in(
      "task_id",
      (
        await supabase
          .from("tasks")
          .select("id")
          .eq("school_id", profile.school_id)
          .neq("status", "completed")
      ).data?.map((t) => t.id) ?? []
    );

  const countMap: Record<string, number> = {};
  (taskCounts ?? []).forEach((a) => {
    countMap[a.user_id] = (countMap[a.user_id] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Team</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(members ?? []).map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={member.full_name} src={member.avatar_url} size="lg" />
              <div className="flex-1">
                <p className="font-medium text-foreground">{member.full_name}</p>
                <Badge variant="primary" className="mt-1">
                  {ROLE_LABELS[member.role as UserRole] ?? member.role}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {countMap[member.id] ?? 0} active tasks
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {(members ?? []).length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No team members found.</p>
        </Card>
      )}
    </div>
  );
}
