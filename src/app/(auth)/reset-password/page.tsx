import { ResetPasswordForm } from "./reset-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Redefinir senha",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  // Recovery links use the PKCE flow: Supabase redirects here with a `code`
  // that must be exchanged for a session before `updateUser` can run.
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return <ResetPasswordForm />;
}
