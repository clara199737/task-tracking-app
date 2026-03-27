import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
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

  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", profile.school_id)
    .single();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("sort_order");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold">Settings</h1>

      {/* School Info */}
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label className="text-sm text-muted-foreground">School Name</label>
            <p className="font-medium">{school?.name ?? "—"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Your Role</label>
            <p className="font-medium capitalize">{profile.role.replace("_", " ")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Task Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(categories ?? []).map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
              </div>
            ))}
            {(categories ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
