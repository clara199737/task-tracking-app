import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Service-role client for admin operations (invites, cron jobs)
// Only use in server-side code — never expose to the client
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
