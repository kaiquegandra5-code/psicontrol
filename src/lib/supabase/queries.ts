import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

/**
 * Get the current authenticated user + profile. When unauthenticated,
 * returns `{ user: null, profile: null }` (never `null` itself) so callers
 * can consistently read `user`/`profile` and null-check them.
 */
export async function getCurrentUser(): Promise<{
  user: User | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile };
}
