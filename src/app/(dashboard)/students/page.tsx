import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Mail, Phone } from "lucide-react";
import { StudentFormDialog } from "@/components/students/student-form-dialog";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();
  if (!profile?.school_id) return null;

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("full_name");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Students</h1>
        <StudentFormDialog />
      </div>

      {(students ?? []).length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No students yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(students ?? []).map((student) => (
            <Link key={student.id} href={`/students/${student.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <Avatar name={student.full_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {student.full_name}
                    </p>
                    {student.belt_rank && (
                      <Badge variant="accent" className="mt-1">
                        {student.belt_rank}
                      </Badge>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {student.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </span>
                      )}
                      {student.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  {!student.is_active && (
                    <Badge variant="default">Inactive</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
