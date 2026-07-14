import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback route used for email confirmation and password recovery.
 * Supabase appends `?code=...` (PKCE) or uses implicit flow.
 */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  const { code, next } = await searchParams;
  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  redirect(next ?? "/dashboard");
}
