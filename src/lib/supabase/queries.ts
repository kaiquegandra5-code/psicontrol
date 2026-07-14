import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/**
 * Get the current authenticated user + profile, or null.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Database["public"]["Tables"]["profiles"]["Row"]>();

  return { user, profile };
}
