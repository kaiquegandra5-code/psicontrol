import { createClient as createBaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin client with service role. Use ONLY on the server for trusted operations
 * (e.g. storage uploads in server actions). Never expose to the browser.
 */
export function createAdminClient() {
  return createBaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
